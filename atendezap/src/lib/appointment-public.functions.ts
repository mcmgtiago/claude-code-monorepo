import { createServerFn } from "@tanstack/react-start";

/**
 * Gestão pública de agendamento (página /a/$token). Sem login: o cliente final
 * reagenda ou cancela pelo link que recebeu por e-mail. Arquivo separado das
 * funções autenticadas para não vazar código de servidor ao bundle do cliente.
 */

type DayHours = { open: string; close: string } | null;
type BusinessHours = Record<string, DayHours>;

async function loadByToken(supabaseAdmin: any, token: string) {
  const { data: ap } = await supabaseAdmin
    .from("agendamento")
    .select("id, company_id, titulo, inicio, fim, status, service_id, address, customer_name, customer_email")
    .eq("manage_token", token)
    .maybeSingle();
  if (!ap) throw new Error("Agendamento não encontrado");
  return ap as any;
}

export const getManagedAppointment = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => ({ token: String(d.token ?? "").trim() }))
  .handler(async ({ data }) => {
    if (!data.token) throw new Error("Link inválido");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ap = await loadByToken(supabaseAdmin, data.token);

    const { data: company } = await supabaseAdmin
      .from("company")
      .select("nome, nome_fantasia, slug, primary_color, logo_url, telefone, currency, booking_advance_days, business_hours")
      .eq("id", ap.company_id)
      .maybeSingle();

    let durationMinutes = 60;
    if (ap.service_id) {
      const { data: svc } = await supabaseAdmin
        .from("service").select("duration_minutes").eq("id", ap.service_id).maybeSingle();
      durationMinutes = (svc as any)?.duration_minutes ?? Math.max(30, Math.round((new Date(ap.fim).getTime() - new Date(ap.inicio).getTime()) / 60000)) ?? 60;
    } else if (ap.fim && ap.inicio) {
      durationMinutes = Math.max(30, Math.round((new Date(ap.fim).getTime() - new Date(ap.inicio).getTime()) / 60000));
    }

    return {
      appointment: {
        id: ap.id, titulo: ap.titulo, inicio: ap.inicio, status: ap.status,
        serviceId: ap.service_id ?? null, durationMinutes, address: ap.address ?? null,
        customerName: ap.customer_name ?? null,
      },
      company: {
        nome: (company as any)?.nome_fantasia || (company as any)?.nome || "VeloHUB",
        slug: (company as any)?.slug ?? "",
        primary_color: (company as any)?.primary_color || "#0efa71",
        logo_url: (company as any)?.logo_url ?? null,
        telefone: (company as any)?.telefone ?? null,
        currency: (company as any)?.currency ?? "USD",
        advanceDays: (company as any)?.booking_advance_days ?? 30,
        businessHours: (((company as any)?.business_hours ?? {}) as BusinessHours),
      },
    };
  });

async function notifyContractor(supabaseAdmin: any, ap: any, kind: "reschedule" | "cancel", whenLabel: string) {
  const { data: company } = await supabaseAdmin
    .from("company").select("nome, nome_fantasia, primary_color, email_corporativo").eq("id", ap.company_id).maybeSingle();
  const name = (company as any)?.nome_fantasia || (company as any)?.nome || "VeloHUB";
  const accent = (company as any)?.primary_color || "#0efa71";
  const who = ap.customer_name || "O cliente";

  try {
    const { sendPushToCompany } = await import("@/lib/push.server");
    await sendPushToCompany(ap.company_id, {
      title: kind === "cancel" ? "Agendamento cancelado ❌" : "Agendamento remarcado 🔁",
      body: kind === "cancel" ? `${who} cancelou ${ap.titulo ?? "o serviço"}.` : `${who} remarcou para ${whenLabel}.`,
      url: "/app/agenda",
    });
  } catch {}

  try {
    if ((company as any)?.email_corporativo) {
      const { sendEmail, emailLayout } = await import("@/lib/email.server");
      await sendEmail({
        to: (company as any).email_corporativo, fromName: name,
        subject: kind === "cancel" ? `Cancelamento — ${who}` : `Remarcação — ${who}`,
        html: emailLayout({
          companyName: name, accent,
          title: kind === "cancel" ? "Agendamento cancelado ❌" : "Agendamento remarcado 🔁",
          intro: kind === "cancel"
            ? `${who} cancelou o agendamento de <b>${ap.titulo ?? ""}</b>.`
            : `${who} remarcou o agendamento de <b>${ap.titulo ?? ""}</b> para <b>${whenLabel}</b>.`,
          ctaLabel: "Abrir agenda", ctaUrl: "https://hub.velocitycompany.com.br/app/agenda",
        }),
      });
    }
  } catch {}
}

export const cancelManagedAppointment = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => ({ token: String(d.token ?? "").trim() }))
  .handler(async ({ data }) => {
    if (!data.token) throw new Error("Link inválido");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ap = await loadByToken(supabaseAdmin, data.token);
    if (ap.status === "cancelado") return { ok: true, alreadyCancelled: true };

    await supabaseAdmin.from("agendamento").update({ status: "cancelado", updated_at: new Date().toISOString() }).eq("id", ap.id);
    await notifyContractor(supabaseAdmin, ap, "cancel", "");
    return { ok: true };
  });

export const rescheduleManagedAppointment = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; startISO: string }) => ({
    token: String(d.token ?? "").trim(),
    startISO: String(d.startISO ?? "").trim(),
  }))
  .handler(async ({ data }) => {
    if (!data.token) throw new Error("Link inválido");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ap = await loadByToken(supabaseAdmin, data.token);

    const start = new Date(data.startISO);
    if (isNaN(start.getTime())) throw new Error("Horário inválido");
    if (start.getTime() < Date.now()) throw new Error("Escolha um horário futuro");

    const { data: company } = await supabaseAdmin
      .from("company").select("booking_advance_days").eq("id", ap.company_id).maybeSingle();
    const maxAhead = Date.now() + (((company as any)?.booking_advance_days ?? 30) + 1) * 86400000;
    if (start.getTime() > maxAhead) throw new Error("Data fora do período permitido");

    const durMs = ap.fim && ap.inicio ? new Date(ap.fim).getTime() - new Date(ap.inicio).getTime() : 60 * 60000;
    const end = new Date(start.getTime() + (durMs > 0 ? durMs : 60 * 60000));

    // Conflito com outro agendamento (ignora o próprio)
    const { data: clash } = await supabaseAdmin
      .from("agendamento").select("id").eq("company_id", ap.company_id).neq("status", "cancelado").neq("id", ap.id)
      .lt("inicio", end.toISOString()).gt("fim", start.toISOString()).limit(1);
    if (clash && clash.length > 0) throw new Error("Esse horário acabou de ser preenchido. Escolha outro.");

    // Atualiza o horário (update principal)
    await supabaseAdmin.from("agendamento").update({
      inicio: start.toISOString(), fim: end.toISOString(), status: "agendado", updated_at: new Date().toISOString(),
    }).eq("id", ap.id);
    // Zera os flags de lembrete p/ reenviar conforme o novo horário (defensivo se as colunas faltarem)
    await supabaseAdmin.from("agendamento").update({ reminder_day_sent: false, reminder_soon_sent: false }).eq("id", ap.id);

    const whenLabel = start.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    await notifyContractor(supabaseAdmin, ap, "reschedule", whenLabel);
    return { ok: true, startISO: start.toISOString() };
  });
