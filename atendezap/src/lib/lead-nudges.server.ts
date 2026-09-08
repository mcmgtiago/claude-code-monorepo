// Motores de cobrança de lead, rodados pelo agendador central (/api/cron/tick).
//  - runSpeedToLead: lead novo parado na 1ª etapa → push escalonado até o contratante mover o card.
//  - runColdFollowup: lead em etapa normal sem interação há dias → push de retomada.
// Idempotente via colunas em crm_cards (speed_* / followup_*). Defensivo se as colunas faltarem.

const DEFAULT_TZ = "America/New_York"; // mercado EUA; janela de horário comercial

function hourInTz(date: Date, tz: string): number {
  try {
    const s = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(date);
    return parseInt(s, 10) % 24;
  } catch {
    return date.getUTCHours();
  }
}
function isBusinessHours(date: Date, tz = DEFAULT_TZ): boolean {
  const h = hourInTz(date, tz);
  return h >= 8 && h < 20; // 8h–20h
}

// Intervalos entre os toques do speed-to-lead (minutos): escala e depois 1x/dia
const SPEED_GAPS_MIN = [10, 15, 30, 60, 120, 240, 480, 1440, 1440];
// Intervalos do follow-up de frios (dias)
const FOLLOWUP_GAPS_DAYS = [3, 5, 7, 14, 30];
const COLD_AFTER_MS = 3 * 24 * 60 * 60 * 1000; // sem interação há 3 dias = frio

function elapsedLabel(fromISO: string): string {
  const ms = Date.now() - new Date(fromISO).getTime();
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

async function firstStageMap(supabaseAdmin: any, companyIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (companyIds.length === 0) return map;
  const { data } = await supabaseAdmin
    .from("crm_stage").select("id, company_id, ordem").in("company_id", companyIds).order("ordem", { ascending: true });
  for (const s of (data ?? []) as any[]) {
    if (!map.has(s.company_id)) map.set(s.company_id, s.id); // menor ordem por empresa
  }
  return map;
}

export async function runSpeedToLead(supabaseAdmin: any): Promise<{ pinged: number; closed: number; due: number }> {
  const nowD = new Date();
  const nowISO = nowD.toISOString();
  const { data: cards } = await supabaseAdmin
    .from("crm_cards")
    .select("id, company_id, nome, numero, stage_id, ultima_em, speed_step")
    .eq("speed_done", false)
    .not("speed_next_at", "is", null)
    .lte("speed_next_at", nowISO)
    .limit(200);

  if (!cards || cards.length === 0) return { pinged: 0, closed: 0, due: 0 };

  const companyIds = [...new Set((cards as any[]).map((c) => c.company_id))];
  const firstStage = await firstStageMap(supabaseAdmin, companyIds);
  const { sendPushToCompany } = await import("@/lib/push.server");

  let pinged = 0, closed = 0;
  for (const c of cards as any[]) {
    const fs = firstStage.get(c.company_id);
    // Contratante já moveu o card adiante → atendido, encerra o speed
    if (fs && c.stage_id && c.stage_id !== fs) {
      await supabaseAdmin.from("crm_cards").update({ speed_done: true, speed_next_at: null }).eq("id", c.id);
      closed++;
      continue;
    }
    // Fora do horário comercial → adia 30 min sem tocar nem avançar
    if (!isBusinessHours(nowD)) {
      await supabaseAdmin.from("crm_cards").update({ speed_next_at: new Date(Date.now() + 30 * 60000).toISOString() }).eq("id", c.id);
      continue;
    }

    const waited = c.ultima_em ? elapsedLabel(c.ultima_em) : "";
    await sendPushToCompany(c.company_id, {
      title: "⏱️ Lead esperando — atenda agora",
      body: `${c.nome || "Novo lead"}${waited ? ` aguarda há ${waited}` : ""}. Quanto antes responder, mais fecha.`,
      url: "/app/crm",
    });
    pinged++;

    const nextStep = (c.speed_step ?? 0) + 1;
    if (nextStep >= SPEED_GAPS_MIN.length) {
      await supabaseAdmin.from("crm_cards").update({ speed_done: true, speed_next_at: null, speed_step: nextStep }).eq("id", c.id);
    } else {
      await supabaseAdmin.from("crm_cards").update({
        speed_step: nextStep,
        speed_next_at: new Date(Date.now() + SPEED_GAPS_MIN[nextStep] * 60000).toISOString(),
      }).eq("id", c.id);
    }
  }
  return { pinged, closed, due: cards.length };
}

export async function runColdFollowup(supabaseAdmin: any): Promise<{ pinged: number; snoozed: number; due: number }> {
  const nowD = new Date();
  const nowISO = nowD.toISOString();
  const coldBeforeISO = new Date(Date.now() - COLD_AFTER_MS).toISOString();

  const { data: cards } = await supabaseAdmin
    .from("crm_cards")
    .select("id, company_id, nome, stage_id, ultima_em, followup_step")
    .lt("ultima_em", coldBeforeISO)
    .or(`followup_next_at.is.null,followup_next_at.lte.${nowISO}`)
    .limit(150);

  if (!cards || cards.length === 0) return { pinged: 0, snoozed: 0, due: 0 };

  const companyIds = [...new Set((cards as any[]).map((c) => c.company_id))];
  // Mapa de tipo por stage (pular ganho/perda)
  const { data: stages } = await supabaseAdmin
    .from("crm_stage").select("id, tipo").in("company_id", companyIds);
  const tipoOf = new Map<string, string>((stages ?? []).map((s: any) => [s.id, s.tipo]));
  const { sendPushToCompany } = await import("@/lib/push.server");

  let pinged = 0, snoozed = 0;
  for (const c of cards as any[]) {
    const tipo = c.stage_id ? tipoOf.get(c.stage_id) : "normal";
    // Ganho/perda → soneca longa, não cobra
    if (tipo === "ganho" || tipo === "perda") {
      await supabaseAdmin.from("crm_cards").update({ followup_next_at: new Date(Date.now() + 60 * 86400000).toISOString() }).eq("id", c.id);
      snoozed++;
      continue;
    }
    if (!isBusinessHours(nowD)) {
      await supabaseAdmin.from("crm_cards").update({ followup_next_at: new Date(Date.now() + 2 * 3600000).toISOString() }).eq("id", c.id);
      continue;
    }

    const waited = c.ultima_em ? elapsedLabel(c.ultima_em) : "";
    await sendPushToCompany(c.company_id, {
      title: "❄️ Lead esfriando — retome o contato",
      body: `${c.nome || "Um lead"} está sem interação${waited ? ` há ${waited}` : ""}. Um toque pode reaquecer.`,
      url: "/app/crm",
    });
    pinged++;

    const step = (c.followup_step ?? 0);
    const gapDays = FOLLOWUP_GAPS_DAYS[Math.min(step, FOLLOWUP_GAPS_DAYS.length - 1)];
    await supabaseAdmin.from("crm_cards").update({
      followup_step: step + 1,
      followup_next_at: new Date(Date.now() + gapDays * 86400000).toISOString(),
    }).eq("id", c.id);
  }
  return { pinged, snoozed, due: cards.length };
}
