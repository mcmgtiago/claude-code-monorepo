import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Recuperação de base: importa clientes antigos e dispara campanha de reativação por e-mail. */

async function assertAccess(supabaseAdmin: any, companyId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from("company_user").select("id").eq("company_id", companyId).eq("user_id", userId).eq("ativo", true).maybeSingle();
  if (!data) throw new Error("Sem acesso");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const importReactivationContacts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    companyId: string;
    subject: string; body: string; campaignName?: string;
    contacts: { email: string; nome?: string; telefone?: string }[];
  }) => {
    const companyId = String(d.companyId ?? "").trim();
    const subject = String(d.subject ?? "").trim();
    const body = String(d.body ?? "").trim();
    if (!companyId) throw new Error("Empresa inválida");
    if (subject.length < 2) throw new Error("Informe o assunto do e-mail");
    if (body.length < 5) throw new Error("Escreva a mensagem");
    const contacts = (Array.isArray(d.contacts) ? d.contacts : [])
      .map((c) => ({
        email: String(c.email ?? "").trim().toLowerCase(),
        nome: c.nome ? String(c.nome).trim() : "",
        telefone: c.telefone ? String(c.telefone).trim() : "",
      }))
      .filter((c) => EMAIL_RE.test(c.email));
    if (contacts.length === 0) throw new Error("Nenhum e-mail válido na lista");
    return { companyId, subject, body, campaignName: String(d.campaignName ?? "Reativação").trim() || "Reativação", contacts };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertAccess(supabaseAdmin, data.companyId, context.userId);

    // Cria a campanha
    const { data: camp, error: cErr } = await supabaseAdmin
      .from("reactivation_campaign")
      .insert({ company_id: data.companyId, nome: data.campaignName, subject: data.subject, body: data.body, status: "active" })
      .select("id").single();
    if (cErr) throw new Error(cErr.message);
    const campaignId = (camp as any).id;

    // Dedup interno por e-mail
    const seen = new Set<string>();
    const now = Date.now();
    const rows = data.contacts
      .filter((c) => (seen.has(c.email) ? false : (seen.add(c.email), true)))
      .map((c, i) => ({
        company_id: data.companyId,
        campaign_id: campaignId,
        email: c.email,
        nome: c.nome || null,
        telefone: c.telefone || null,
        step: 0,
        // Espalha os primeiros envios em ondas (~40/hora) p/ proteger a reputação do domínio
        next_at: new Date(now + Math.floor(i / 40) * 60 * 60 * 1000).toISOString(),
        status: "pending",
        unsubscribe_token: crypto.randomUUID(),
      }));

    // Upsert ignorando quem já está na base (não re-importa nem reativa quem deu opt-out)
    const { error: insErr } = await supabaseAdmin
      .from("reactivation_contact")
      .upsert(rows, { onConflict: "company_id,email", ignoreDuplicates: true });
    if (insErr) throw new Error(insErr.message);

    return { ok: true, campaignId, queued: rows.length };
  });

export const getReactivationStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { companyId: string }) => ({ companyId: String(d.companyId ?? "").trim() }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await assertAccess(supabaseAdmin, data.companyId, context.userId);

    const counts: Record<string, number> = { total: 0, pending: 0, done: 0, unsubscribed: 0, failed: 0 };
    const { data: rows } = await supabaseAdmin
      .from("reactivation_contact").select("status").eq("company_id", data.companyId);
    for (const r of (rows ?? []) as any[]) {
      counts.total++;
      counts[r.status] = (counts[r.status] ?? 0) + 1;
    }
    return counts;
  });
