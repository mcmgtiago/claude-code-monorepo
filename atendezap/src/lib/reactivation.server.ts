// Motor de envio das campanhas de reativação. Rodado pelo agendador central (/api/cron/tick).
// Envia em lotes pequenos por tick (protege a reputação do domínio) + follow-ups + opt-out.
const APP_BASE = (process.env.APP_BASE_URL || "https://hub.velocitycompany.com.br").replace(/\/$/, "");

const FOLLOWUP_GAPS_DAYS = [4, 8]; // após o 1º envio: +4 dias, depois +8 dias (3 toques no total)
const BATCH = 30; // máx. de e-mails por tick

function goodSendHour(d: Date): boolean {
  // Janela ~9h–20h ET (UTC-4/-5) ≈ 13h–24h UTC. Evita madrugada nos EUA.
  const h = d.getUTCHours();
  return h >= 13 || h === 0;
}

function applyTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

export async function runReactivation(supabaseAdmin: any): Promise<{ sent: number; done: number; due: number }> {
  const nowD = new Date();
  if (!goodSendHour(nowD)) return { sent: 0, done: 0, due: 0 };
  const nowISO = nowD.toISOString();

  const { data: contacts } = await supabaseAdmin
    .from("reactivation_contact")
    .select("id, company_id, campaign_id, email, nome, step, unsubscribe_token")
    .eq("status", "pending")
    .not("next_at", "is", null)
    .lte("next_at", nowISO)
    .limit(BATCH);

  if (!contacts || contacts.length === 0) return { sent: 0, done: 0, due: 0 };

  const { sendEmail, emailLayout } = await import("@/lib/email.server");
  const campCache = new Map<string, any>();
  const brandCache = new Map<string, any>();

  async function campOf(id: string) {
    if (campCache.has(id)) return campCache.get(id);
    const { data } = await supabaseAdmin.from("reactivation_campaign").select("subject, body").eq("id", id).maybeSingle();
    campCache.set(id, data);
    return data;
  }
  async function brandOf(companyId: string) {
    if (brandCache.has(companyId)) return brandCache.get(companyId);
    const { data } = await supabaseAdmin
      .from("company").select("nome, nome_fantasia, slug, primary_color, telefone, email_corporativo").eq("id", companyId).maybeSingle();
    const b = {
      name: data?.nome_fantasia || data?.nome || "VeloHUB",
      slug: data?.slug ?? "",
      accent: data?.primary_color || "#0efa71",
      telefone: data?.telefone ?? null,
      email: data?.email_corporativo ?? null,
    };
    brandCache.set(companyId, b);
    return b;
  }

  let sent = 0, done = 0;
  for (const c of contacts as any[]) {
    const camp = await campOf(c.campaign_id);
    const b = await brandOf(c.company_id);
    if (!camp || !camp.subject) {
      await supabaseAdmin.from("reactivation_contact").update({ status: "failed" }).eq("id", c.id);
      continue;
    }

    const vars = { nome: c.nome || "", empresa: b.name };
    const subject = applyTemplate(camp.subject, vars);
    const bookUrl = b.slug ? `${APP_BASE}/book/${b.slug}` : APP_BASE;
    const unsubUrl = `${APP_BASE}/u/${c.unsubscribe_token}`;
    const bodyHtml = `${applyTemplate(camp.body, vars).replace(/\n/g, "<br>")}
      <div style="margin-top:14px"><a href="${bookUrl}" style="display:inline-block;background:${b.accent};color:#04140b;font-weight:700;padding:10px 18px;border-radius:10px;text-decoration:none">Book now</a></div>`;

    try {
      await sendEmail({
        to: c.email, fromName: b.name, subject,
        html: emailLayout({
          companyName: b.name, accent: b.accent,
          title: subject,
          intro: "",
          bodyHtml,
          footer: `${b.name}${b.telefone ? ` · ${b.telefone}` : ""}<br><a href="${unsubUrl}" style="color:#999;font-size:11px">Unsubscribe</a>`,
        }),
        replyTo: b.email ?? undefined,
      });
      sent++;
    } catch (e) {
      console.warn("[reactivation] envio falhou", e);
      await supabaseAdmin.from("reactivation_contact").update({ status: "failed" }).eq("id", c.id);
      continue;
    }

    const nextStep = (c.step ?? 0) + 1;
    if (nextStep > FOLLOWUP_GAPS_DAYS.length) {
      await supabaseAdmin.from("reactivation_contact").update({ status: "done", step: nextStep, last_sent_at: nowISO }).eq("id", c.id);
      done++;
    } else {
      const gap = FOLLOWUP_GAPS_DAYS[nextStep - 1];
      await supabaseAdmin.from("reactivation_contact").update({
        step: nextStep, last_sent_at: nowISO, next_at: new Date(Date.now() + gap * 86400000).toISOString(),
      }).eq("id", c.id);
    }
  }
  return { sent, done, due: contacts.length };
}
