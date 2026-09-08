// Motores de crescimento, rodados pelo agendador central (/api/cron/tick):
//  - runPostJobReviews: pós-job concluído → pede review + indicação ao cliente
//  - runRecurringReminders: cliente atendido há N dias → "está na hora do próximo serviço"
//  - runWinback: lead perdido há 30d+ → push p/ o contratante tentar reconquistar
//  - runQuoteRescue: orçamento enviado e não fechado → e-mail "seu orçamento vai expirar"
// Idempotentes via timestamps (review_sent_at, recurring_sent_at, rescue_sent_at, winback_*).
const APP_BASE = (process.env.APP_BASE_URL || "https://hub.velocitycompany.com.br").replace(/\/$/, "");
const DAY = 86400000;

function goodHour(d: Date): boolean {
  const h = d.getUTCHours(); // ~9h–20h ET ≈ 13h–24h UTC
  return h >= 13 || h === 0;
}
function isBizHours(d: Date): boolean {
  const h = (() => { try { return parseInt(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", hour12: false }).format(d), 10) % 24; } catch { return d.getUTCHours(); } })();
  return h >= 8 && h < 20;
}

function brandCache(supabaseAdmin: any) {
  const cache = new Map<string, any>();
  return async (companyId: string) => {
    if (cache.has(companyId)) return cache.get(companyId);
    const { data } = await supabaseAdmin
      .from("company").select("nome, nome_fantasia, slug, primary_color, telefone, email_corporativo, google_review_url, recurring_days").eq("id", companyId).maybeSingle();
    const b = {
      name: data?.nome_fantasia || data?.nome || "VeloHUB",
      slug: data?.slug ?? "",
      accent: data?.primary_color || "#0efa71",
      telefone: data?.telefone ?? null,
      email: data?.email_corporativo ?? null,
      reviewUrl: data?.google_review_url ?? null,
      recurringDays: data?.recurring_days ?? 30,
    };
    cache.set(companyId, b);
    return b;
  };
}

export async function runPostJobReviews(supabaseAdmin: any): Promise<{ sent: number; due: number }> {
  const now = new Date();
  if (!goodHour(now)) return { sent: 0, due: 0 };
  const { data: appts } = await supabaseAdmin
    .from("agendamento")
    .select("id, company_id, titulo, customer_name, customer_email, fim")
    .eq("status", "concluido")
    .is("review_sent_at", null)
    .not("customer_email", "is", null)
    .gte("fim", new Date(Date.now() - 14 * DAY).toISOString())
    .lte("fim", new Date(Date.now() - 2 * 3600000).toISOString())
    .limit(40);
  if (!appts || appts.length === 0) return { sent: 0, due: 0 };

  const brandOf = brandCache(supabaseAdmin);
  const { sendEmail, emailLayout } = await import("@/lib/email.server");
  let sent = 0;
  for (const a of appts as any[]) {
    const b = await brandOf(a.company_id);
    const reviewUrl = b.reviewUrl || (b.slug ? `${APP_BASE}/book/${b.slug}` : APP_BASE);
    const bookUrl = b.slug ? `${APP_BASE}/book/${b.slug}` : APP_BASE;
    try {
      await sendEmail({
        to: a.customer_email, fromName: b.name,
        subject: `How did we do? — ${b.name}`,
        html: emailLayout({
          companyName: b.name, accent: b.accent,
          title: "Thanks for choosing us! ⭐",
          intro: `${a.customer_name ? `Hi ${a.customer_name}, ` : ""}we hope you loved your <b>${a.titulo ?? "service"}</b>. A quick review means the world to us — and if you know a neighbor who needs us, send them our way!`,
          bodyHtml: `<div style="margin:6px 0"><a href="${reviewUrl}" style="display:inline-block;background:${b.accent};color:#04140b;font-weight:700;padding:11px 20px;border-radius:10px;text-decoration:none">Leave a review</a></div>
            <p style="margin:14px 0 0;font-size:13px;color:#666">Refer a friend and we'll take great care of them too — <a href="${bookUrl}" style="color:${b.accent}">share your booking link</a>.</p>`,
          footer: `${b.name}${b.telefone ? ` · ${b.telefone}` : ""}`,
        }),
        replyTo: b.email ?? undefined,
      });
      sent++;
      await supabaseAdmin.from("agendamento").update({ review_sent_at: new Date().toISOString() }).eq("id", a.id);
    } catch (e) { console.warn("[reviews] falhou", e); }
  }
  return { sent, due: appts.length };
}

export async function runRecurringReminders(supabaseAdmin: any): Promise<{ sent: number; due: number }> {
  const now = new Date();
  if (!goodHour(now)) return { sent: 0, due: 0 };
  const { data: appts } = await supabaseAdmin
    .from("agendamento")
    .select("id, company_id, titulo, customer_name, customer_email, fim")
    .eq("status", "concluido")
    .is("recurring_sent_at", null)
    .not("customer_email", "is", null)
    .lte("fim", new Date(Date.now() - 14 * DAY).toISOString())
    .limit(60);
  if (!appts || appts.length === 0) return { sent: 0, due: 0 };

  const brandOf = brandCache(supabaseAdmin);
  const { sendEmail, emailLayout } = await import("@/lib/email.server");
  let sent = 0;
  for (const a of appts as any[]) {
    const b = await brandOf(a.company_id);
    const ageDays = (Date.now() - new Date(a.fim).getTime()) / DAY;
    if (ageDays < (b.recurringDays ?? 30)) continue; // ainda não está na hora p/ esta empresa
    const bookUrl = b.slug ? `${APP_BASE}/book/${b.slug}` : APP_BASE;
    try {
      await sendEmail({
        to: a.customer_email, fromName: b.name,
        subject: `Time for your next visit — ${b.name}`,
        html: emailLayout({
          companyName: b.name, accent: b.accent,
          title: "Ready for your next service? 🔁",
          intro: `${a.customer_name ? `Hi ${a.customer_name}, ` : ""}it's been a few weeks since your last <b>${a.titulo ?? "service"}</b>. Let's keep things looking great — book your next visit in seconds.`,
          bodyHtml: `<div style="margin:6px 0"><a href="${bookUrl}" style="display:inline-block;background:${b.accent};color:#04140b;font-weight:700;padding:11px 20px;border-radius:10px;text-decoration:none">Book my next visit</a></div>`,
          footer: `${b.name}${b.telefone ? ` · ${b.telefone}` : ""}`,
        }),
        replyTo: b.email ?? undefined,
      });
      sent++;
      await supabaseAdmin.from("agendamento").update({ recurring_sent_at: new Date().toISOString() }).eq("id", a.id);
    } catch (e) { console.warn("[recurring] falhou", e); }
  }
  return { sent, due: appts.length };
}

export async function runWinback(supabaseAdmin: any): Promise<{ pinged: number; due: number }> {
  const now = new Date();
  if (!isBizHours(now)) return { pinged: 0, due: 0 };
  const { data: cards } = await supabaseAdmin
    .from("crm_cards")
    .select("id, company_id, nome, stage_id, updated_at, winback_step")
    .lt("winback_step", 2)
    .lt("updated_at", new Date(Date.now() - 30 * DAY).toISOString())
    .limit(100);
  if (!cards || cards.length === 0) return { pinged: 0, due: 0 };

  const companyIds = [...new Set((cards as any[]).map((c) => c.company_id))];
  const { data: stages } = await supabaseAdmin.from("crm_stage").select("id, tipo").in("company_id", companyIds);
  const tipoOf = new Map<string, string>((stages ?? []).map((s: any) => [s.id, s.tipo]));
  const { sendPushToCompany } = await import("@/lib/push.server");

  let pinged = 0;
  for (const c of cards as any[]) {
    if (!c.stage_id || tipoOf.get(c.stage_id) !== "perda") continue; // só leads perdidos
    await sendPushToCompany(c.company_id, {
      title: "♻️ Lead perdido — vale uma nova chance",
      body: `${c.nome || "Um lead"} foi marcado como perdido há um tempo. Uma oferta de retorno pode reconquistar.`,
      url: "/app/crm",
    });
    pinged++;
    await supabaseAdmin.from("crm_cards").update({
      winback_step: (c.winback_step ?? 0) + 1,
      winback_last_at: new Date().toISOString(),
      winback_next_at: new Date(Date.now() + 60 * DAY).toISOString(),
    }).eq("id", c.id);
  }
  return { pinged, due: cards.length };
}

export async function runQuoteRescue(supabaseAdmin: any): Promise<{ sent: number; due: number }> {
  const now = new Date();
  if (!goodHour(now)) return { sent: 0, due: 0 };
  const { data: quotes } = await supabaseAdmin
    .from("quote")
    .select("id, company_id, customer_name, customer_email, sent_at, total_amount")
    .eq("status", "sent")
    .is("rescue_sent_at", null)
    .is("accepted_at", null)
    .not("customer_email", "is", null)
    .lte("sent_at", new Date(Date.now() - 3 * DAY).toISOString())
    .limit(40);
  if (!quotes || quotes.length === 0) return { sent: 0, due: 0 };

  const brandOf = brandCache(supabaseAdmin);
  const { sendEmail, emailLayout } = await import("@/lib/email.server");
  const { fmtMoney } = await import("@/config/money");
  let sent = 0;
  for (const q of quotes as any[]) {
    const b = await brandOf(q.company_id);
    const { data: comp } = await supabaseAdmin.from("company").select("currency").eq("id", q.company_id).maybeSingle();
    const cur = (comp as any)?.currency ?? "USD";
    const link = `${APP_BASE}/q/${q.id}`;
    try {
      await sendEmail({
        to: q.customer_email, fromName: b.name,
        subject: `Your quote is still available — ${b.name}`,
        html: emailLayout({
          companyName: b.name, accent: b.accent,
          title: "Still thinking it over? ⏳",
          intro: `${q.customer_name ? `Hi ${q.customer_name}, ` : ""}your quote with ${b.name}${q.total_amount ? ` (${fmtMoney(Number(q.total_amount), cur)})` : ""} is still available — but spots fill up fast. Lock it in today.`,
          bodyHtml: `<div style="margin:6px 0"><a href="${link}" style="display:inline-block;background:${b.accent};color:#04140b;font-weight:700;padding:11px 20px;border-radius:10px;text-decoration:none">Review my quote</a></div>`,
          footer: `${b.name}${b.telefone ? ` · ${b.telefone}` : ""}`,
        }),
        replyTo: b.email ?? undefined,
      });
      sent++;
      await supabaseAdmin.from("quote").update({ rescue_sent_at: new Date().toISOString() }).eq("id", q.id);
    } catch (e) { console.warn("[quote-rescue] falhou", e); }
  }
  return { sent, due: quotes.length };
}
