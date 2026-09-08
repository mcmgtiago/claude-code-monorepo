import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fmtMoney } from "@/config/money";

const APP_BASE_URL = (process.env.APP_BASE_URL || "https://hub.velocitycompany.com.br").replace(/\/$/, "");

async function companyBrand(supabaseAdmin: any, companyId: string) {
  const { data } = await supabaseAdmin
    .from("company").select("nome, nome_fantasia, primary_color, telefone, email_corporativo, currency").eq("id", companyId).maybeSingle();
  return {
    name: data?.nome_fantasia || data?.nome || "VeloHUB",
    accent: data?.primary_color || "#0efa71",
    telefone: data?.telefone ?? null,
    email: data?.email_corporativo ?? null,
    currency: data?.currency ?? "USD",
  };
}

async function assertAccess(supabaseAdmin: any, companyId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from("company_user").select("id").eq("company_id", companyId).eq("user_id", userId).eq("ativo", true).maybeSingle();
  if (!data) throw new Error("Sem acesso");
}

function quoteItemsHtml(items: any[], currency: string) {
  return (Array.isArray(items) ? items : []).map((it: any) => {
    const qty = Number(it?.qty ?? 1);
    const unit = Number(it?.unit_price ?? it?.price ?? 0);
    const total = Number(it?.total ?? qty * unit);
    return `<tr><td style="padding:8px 0;color:#444">${qty}× ${it?.name ?? ""}</td><td style="padding:8px 0;text-align:right;font-weight:600">${fmtMoney(total, currency)}</td></tr>`;
  }).join("");
}

/** Envia um orçamento por e-mail ao cliente final. */
export const sendQuoteEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { quoteId: string; toEmail: string }) => {
    const quoteId = String(d.quoteId ?? "").trim();
    const toEmail = String(d.toEmail ?? "").trim().toLowerCase();
    if (!quoteId) throw new Error("Orçamento inválido");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) throw new Error("E-mail do destinatário inválido");
    return { quoteId, toEmail };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendEmail, emailLayout } = await import("@/lib/email.server");

    const { data: q } = await supabaseAdmin.from("quote").select("*").eq("id", data.quoteId).maybeSingle();
    if (!q) throw new Error("Orçamento não encontrado");
    await assertAccess(supabaseAdmin, (q as any).company_id, context.userId);

    const b = await companyBrand(supabaseAdmin, (q as any).company_id);
    const link = `${APP_BASE_URL}/q/${(q as any).id}`;
    const html = emailLayout({
      companyName: b.name, accent: b.accent,
      title: "Seu orçamento",
      intro: `${(q as any).customer_name ? `Olá ${(q as any).customer_name}, ` : ""}aqui está o orçamento que preparamos para você.`,
      bodyHtml: `<table style="width:100%;border-collapse:collapse;border-top:1px solid #eee;border-bottom:1px solid #eee;margin-bottom:8px">${quoteItemsHtml((q as any).items, b.currency)}</table>
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin:12px 0 16px"><span style="font-weight:700">Total</span><span style="font-size:24px;font-weight:800;color:${b.accent}">${fmtMoney(Number((q as any).total_amount ?? 0), b.currency)}</span></div>
        ${(q as any).notes ? `<p style="background:#f6f6f6;border-radius:10px;padding:12px;color:#555;font-size:14px">${(q as any).notes}</p>` : ""}`,
      ctaLabel: "Ver orçamento completo", ctaUrl: link,
      footer: `${b.name}${b.telefone ? ` · ${b.telefone}` : ""}`,
    });

    await sendEmail({ to: data.toEmail, fromName: b.name, subject: `Orçamento — ${b.name}`, html, replyTo: b.email ?? undefined });
    await supabaseAdmin.from("quote").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", (q as any).id);
    return { ok: true };
  });

/** Confirmação para o cliente final quando o orçamento é aceito. Usa quote.customer_email (se a coluna existir). */
export const sendQuoteAcceptedEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { quoteId: string; toEmail?: string }) => ({
    quoteId: String(d.quoteId ?? "").trim(),
    toEmail: d.toEmail ? String(d.toEmail).trim().toLowerCase() : undefined,
  }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendEmail, emailLayout } = await import("@/lib/email.server");
    const { data: q } = await supabaseAdmin.from("quote").select("*").eq("id", data.quoteId).maybeSingle();
    if (!q) throw new Error("Orçamento não encontrado");
    await assertAccess(supabaseAdmin, (q as any).company_id, context.userId);

    const to = data.toEmail || (q as any).customer_email;
    if (!to) return { ok: false, skipped: true, reason: "sem e-mail do cliente" };

    const b = await companyBrand(supabaseAdmin, (q as any).company_id);
    const html = emailLayout({
      companyName: b.name, accent: b.accent,
      title: "Orçamento aprovado ✅",
      intro: `${(q as any).customer_name ? `Olá ${(q as any).customer_name}, ` : ""}seu orçamento com a ${b.name} foi aprovado. Em breve entramos em contato para os próximos passos.`,
      bodyHtml: `<div style="display:flex;justify-content:space-between;align-items:baseline;margin:8px 0"><span style="font-weight:700">Total aprovado</span><span style="font-size:22px;font-weight:800;color:${b.accent}">${fmtMoney(Number((q as any).total_amount ?? 0), b.currency)}</span></div>`,
      footer: `${b.name}${b.telefone ? ` · ${b.telefone}` : ""}`,
    });
    await sendEmail({ to, fromName: b.name, subject: `Orçamento aprovado — ${b.name}`, html, replyTo: b.email ?? undefined });
    return { ok: true };
  });

/** Confirmação para o cliente final quando o agendamento é confirmado. */
export const sendAppointmentConfirmation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { appointmentId: string }) => ({ appointmentId: String(d.appointmentId ?? "").trim() }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendEmail, emailLayout } = await import("@/lib/email.server");
    const { data: ap } = await supabaseAdmin.from("agendamento").select("*").eq("id", data.appointmentId).maybeSingle();
    if (!ap) throw new Error("Agendamento não encontrado");
    await assertAccess(supabaseAdmin, (ap as any).company_id, context.userId);

    const to = (ap as any).customer_email;
    if (!to) return { ok: false, skipped: true, reason: "sem e-mail do cliente" };

    const b = await companyBrand(supabaseAdmin, (ap as any).company_id);
    const when = (ap as any).inicio
      ? new Date((ap as any).inicio).toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "";
    const html = emailLayout({
      companyName: b.name, accent: b.accent,
      title: "Your appointment is confirmed ✅",
      intro: `${(ap as any).customer_name ? `Hi ${(ap as any).customer_name}, ` : ""}your appointment with ${b.name} is confirmed.`,
      bodyHtml: `<p style="margin:0 0 6px"><b>Service:</b> ${(ap as any).titulo ?? ""}</p><p style="margin:0 0 6px"><b>When:</b> ${when}</p>${(ap as any).address ? `<p style="margin:0 0 6px"><b>Where:</b> ${(ap as any).address}</p>` : ""}`,
      footer: `${b.name}${b.telefone ? ` · ${b.telefone}` : ""}`,
    });
    await sendEmail({ to, fromName: b.name, subject: `Appointment confirmed — ${b.name}`, html, replyTo: b.email ?? undefined });
    return { ok: true };
  });

/** Avisa o cliente final que o profissional está a caminho (botão "A caminho" na agenda). */
export const sendOnTheWayNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { appointmentId: string; etaMinutes?: number }) => ({
    appointmentId: String(d.appointmentId ?? "").trim(),
    etaMinutes: d.etaMinutes != null && !isNaN(Number(d.etaMinutes)) ? Number(d.etaMinutes) : undefined,
  }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendEmail, emailLayout } = await import("@/lib/email.server");
    const { data: ap } = await supabaseAdmin.from("agendamento").select("*").eq("id", data.appointmentId).maybeSingle();
    if (!ap) throw new Error("Agendamento não encontrado");
    await assertAccess(supabaseAdmin, (ap as any).company_id, context.userId);

    // Marca o horário de saída (defensivo se a coluna ainda não existir no banco)
    await supabaseAdmin.from("agendamento").update({ on_the_way_at: new Date().toISOString() }).eq("id", data.appointmentId);

    const to = (ap as any).customer_email;
    if (!to) return { ok: false, skipped: true, reason: "sem e-mail do cliente" };

    const b = await companyBrand(supabaseAdmin, (ap as any).company_id);
    const eta = data.etaMinutes && data.etaMinutes > 0 ? ` We expect to arrive in about ${data.etaMinutes} minutes.` : "";
    const html = emailLayout({
      companyName: b.name, accent: b.accent,
      title: "We're on the way 🚐",
      intro: `${(ap as any).customer_name ? `Hi ${(ap as any).customer_name}, ` : ""}your ${b.name} team is heading to your location now.${eta}`,
      bodyHtml: `<p style="margin:0 0 6px"><b>Service:</b> ${(ap as any).titulo ?? ""}</p>${(ap as any).address ? `<p style="margin:0 0 6px"><b>Address:</b> ${(ap as any).address}</p>` : ""}`,
      footer: `${b.name}${b.telefone ? ` · ${b.telefone}` : ""}`,
    });
    await sendEmail({ to, fromName: b.name, subject: `On the way — ${b.name}`, html, replyTo: b.email ?? undefined });
    return { ok: true };
  });
