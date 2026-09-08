import { createServerFn } from "@tanstack/react-start";

/**
 * Agendamento público (página /book/$slug). Tudo aqui é público (sem login):
 * o cliente final do contratante agenda sozinho. Usa service role só para
 * ler dados da empresa/serviços e inserir o agendamento de forma controlada.
 */

type DayHours = { open: string; close: string } | null;
type BusinessHours = Record<string, DayHours>;

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const getPublicBooking = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string }) => ({ slug: String(d.slug ?? "").trim().toLowerCase() }))
  .handler(async ({ data }) => {
    if (!data.slug) throw new Error("Empresa não encontrada");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: company } = await supabaseAdmin
      .from("company")
      .select("id, nome, nome_fantasia, slug, primary_color, logo_url, telefone, email_corporativo, currency, booking_enabled, booking_advance_days, business_hours")
      .eq("slug", data.slug)
      .maybeSingle();

    if (!company) throw new Error("Empresa não encontrada");
    if ((company as any).booking_enabled === false) throw new Error("Agendamento online indisponível no momento");

    const { data: services } = await supabaseAdmin
      .from("service")
      .select("id, name, description, duration_minutes, price")
      .eq("company_id", (company as any).id)
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("name", { ascending: true });

    return {
      company: {
        nome: (company as any).nome_fantasia || (company as any).nome,
        slug: (company as any).slug,
        primary_color: (company as any).primary_color || "#0efa71",
        logo_url: (company as any).logo_url ?? null,
        telefone: (company as any).telefone ?? null,
        email: (company as any).email_corporativo ?? null,
        currency: (company as any).currency ?? "USD",
        advanceDays: (company as any).booking_advance_days ?? 30,
        businessHours: ((company as any).business_hours ?? {}) as BusinessHours,
      },
      services: (services ?? []).map((s: any) => ({
        id: s.id, name: s.name, description: s.description ?? null,
        durationMinutes: s.duration_minutes ?? 60, price: s.price ?? null,
      })),
    };
  });

export const getDayAvailability = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string; date: string }) => ({
    slug: String(d.slug ?? "").trim().toLowerCase(),
    date: String(d.date ?? "").trim(), // YYYY-MM-DD
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: company } = await supabaseAdmin
      .from("company").select("id, business_hours").eq("slug", data.slug).maybeSingle();
    if (!company) throw new Error("Empresa não encontrada");

    const hours = (((company as any).business_hours ?? {}) as BusinessHours);
    const [y, m, dd] = data.date.split("-").map(Number);
    const dayKey = WEEKDAY_KEYS[new Date(y, (m ?? 1) - 1, dd ?? 1).getDay()];
    const dayHours = hours[dayKey] ?? null;

    // Agendamentos já marcados nesse dia (para desabilitar horários ocupados)
    const { data: appts } = await supabaseAdmin
      .from("agendamento")
      .select("inicio, fim, status")
      .eq("company_id", (company as any).id)
      .gte("inicio", `${data.date}T00:00:00`)
      .lte("inicio", `${data.date}T23:59:59`);

    const taken = (appts ?? [])
      .filter((a: any) => a.status !== "cancelado")
      .map((a: any) => ({ inicio: a.inicio, fim: a.fim }));

    return { open: dayHours?.open ?? null, close: dayHours?.close ?? null, taken };
  });

export const createPublicBooking = createServerFn({ method: "POST" })
  .inputValidator((d: {
    slug: string; serviceId?: string; startISO?: string;
    customerName: string; customerPhone: string; customerEmail: string;
    address: string; city?: string; state?: string;
    preferredTime?: string; urgency?: string; source?: string; notes?: string;
  }) => {
    const slug = String(d.slug ?? "").trim().toLowerCase();
    const customerName = String(d.customerName ?? "").trim();
    const customerPhone = String(d.customerPhone ?? "").trim();
    const customerEmail = String(d.customerEmail ?? "").trim().toLowerCase();
    const address = String(d.address ?? "").trim();
    if (!slug) throw new Error("Empresa inválida");
    if (customerName.length < 2) throw new Error("Informe seu nome");
    if (customerPhone.replace(/\D/g, "").length < 8) throw new Error("Informe um telefone válido");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) throw new Error("Informe um e-mail válido");
    if (address.length < 3) throw new Error("Informe o endereço");
    return {
      slug,
      serviceId: d.serviceId ? String(d.serviceId).trim() : "",
      startISO: d.startISO ? String(d.startISO).trim() : "",
      customerName, customerPhone, customerEmail, address,
      city: d.city ? String(d.city).trim() : "",
      state: d.state ? String(d.state).trim() : "",
      preferredTime: d.preferredTime ? String(d.preferredTime).trim() : "",
      urgency: d.urgency ? String(d.urgency).trim() : "",
      source: d.source ? String(d.source).trim() : "",
      notes: d.notes ? String(d.notes).trim() : "",
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: company } = await supabaseAdmin
      .from("company").select("id, nome, nome_fantasia, primary_color, telefone, email_corporativo, created_by, booking_enabled, booking_advance_days").eq("slug", data.slug).maybeSingle();
    if (!company) throw new Error("Empresa não encontrada");
    if ((company as any).booking_enabled === false) throw new Error("Agendamento online indisponível");
    const companyId = (company as any).id;
    const companyName = (company as any).nome_fantasia || (company as any).nome || "VeloHUB";
    const accent = (company as any).primary_color || "#0efa71";

    // Modo agendamento (serviço + horário) vs. modo lead/consultoria (só pedido de contato)
    const scheduled = !!(data.serviceId && data.startISO);
    let service: any = null;
    let appointmentId: string | null = null;
    let manageToken: string | null = null;
    let serviceName = "Consultoria";
    let startISO = "";
    let whenFull = "";

    if (scheduled) {
      const { data: svc } = await supabaseAdmin
        .from("service").select("id, name, duration_minutes, price, active")
        .eq("id", data.serviceId).eq("company_id", companyId).maybeSingle();
      if (!svc || svc.active === false) throw new Error("Serviço indisponível");
      service = svc;
      serviceName = svc.name;

      const start = new Date(data.startISO);
      if (isNaN(start.getTime())) throw new Error("Horário inválido");
      if (start.getTime() < Date.now()) throw new Error("Escolha um horário futuro");
      const maxAhead = Date.now() + (((company as any).booking_advance_days ?? 30) + 1) * 86400000;
      if (start.getTime() > maxAhead) throw new Error("Data fora do período de agendamento");
      const end = new Date(start.getTime() + (svc.duration_minutes ?? 60) * 60000);

      const { data: clash } = await supabaseAdmin
        .from("agendamento").select("id").eq("company_id", companyId).neq("status", "cancelado")
        .lt("inicio", end.toISOString()).gt("fim", start.toISOString()).limit(1);
      if (clash && clash.length > 0) throw new Error("Esse horário acabou de ser preenchido. Escolha outro.");

      const { data: appt, error } = await supabaseAdmin
        .from("agendamento").insert({
          company_id: companyId, titulo: svc.name, inicio: start.toISOString(), fim: end.toISOString(),
          status: "agendado", source: "online", service_id: svc.id,
          customer_name: data.customerName, customer_phone: data.customerPhone, customer_email: data.customerEmail,
          address: [data.address, data.city, data.state].filter(Boolean).join(", "), notes: data.notes, price: svc.price ?? null,
        }).select("id").single();
      if (error) throw new Error(error.message);
      appointmentId = appt?.id ?? null;
      startISO = start.toISOString();
      whenFull = start.toLocaleString("pt-BR", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });
      // Token para o cliente reagendar/cancelar pelo link (defensivo se a coluna não existir)
      if (appointmentId) {
        manageToken = crypto.randomUUID();
        await supabaseAdmin.from("agendamento").update({ manage_token: manageToken }).eq("id", appointmentId);
      }
    }

    // Sempre cria/atualiza o LEAD no CRM
    try {
      const { data: cu } = await supabaseAdmin
        .from("company_user").select("user_id").eq("company_id", companyId).eq("role", "owner").eq("ativo", true).maybeSingle();
      const ownerId = (cu as any)?.user_id ?? (company as any).created_by ?? null;
      const { data: stage } = await supabaseAdmin
        .from("crm_stage").select("id, nome").eq("company_id", companyId).order("ordem", { ascending: true }).limit(1).maybeSingle();
      const numero = data.customerPhone.replace(/\D/g, "");
      const obs = [
        scheduled ? `Serviço: ${serviceName} (agendado ${whenFull})` : (data.serviceId ? `Interesse: ${serviceName}` : "Pediu consultoria / não especificou serviço"),
        (data.city || data.state) ? `Local: ${[data.city, data.state].filter(Boolean).join(", ")}` : "",
        `Endereço: ${data.address}`,
        data.preferredTime ? `Horário de preferência: ${data.preferredTime}` : "",
        data.urgency ? `Urgência: ${data.urgency}` : "",
        data.source ? `Como conheceu: ${data.source}` : "",
        `E-mail: ${data.customerEmail}`,
        data.notes ? `Obs: ${data.notes}` : "",
      ].filter(Boolean).join("\n");
      if (ownerId) {
        await supabaseAdmin.from("crm_cards").upsert({
          company_id: companyId, user_id: ownerId, owner_id: ownerId,
          numero, nome: data.customerName,
          status: (stage as any)?.nome ?? "Novo Lead", stage_id: (stage as any)?.id ?? null,
          valor: scheduled ? Number(service?.price ?? 0) : 0,
          ultima_mensagem: scheduled ? `Agendou ${serviceName}` : "Pediu contato pelo formulário",
          ultima_em: new Date().toISOString(),
          observacao: obs,
        } as any, { onConflict: "company_id,numero" });

        // Speed-to-lead: lead que pediu contato (sem agendamento) entra na cobrança escalonada.
        // Update separado e defensivo (não quebra a criação do card se as colunas ainda não existirem).
        if (!scheduled) {
          await supabaseAdmin.from("crm_cards")
            .update({ speed_step: 0, speed_done: false, speed_next_at: new Date(Date.now() + 10 * 60000).toISOString() })
            .eq("company_id", companyId).eq("numero", numero);
        }
      }
    } catch (e) { console.warn("[booking] lead CRM falhou", e); }

    // Notificações (push + e-mail) — não bloqueiam
    const titlePush = scheduled ? "Novo agendamento! 📅" : "Novo lead! 🚀";
    const bodyPush = scheduled
      ? `${data.customerName} — ${serviceName}`
      : `${data.customerName} pediu contato — responda rápido!`;
    try {
      const { sendPushToCompany } = await import("@/lib/push.server");
      await sendPushToCompany(companyId, { title: titlePush, body: bodyPush, url: scheduled ? "/app/agenda" : "/app/crm" });
    } catch (e) { console.warn("[booking] push falhou", e); }

    try {
      const { sendEmail, emailLayout } = await import("@/lib/email.server");
      if ((company as any).email_corporativo) {
        await sendEmail({
          to: (company as any).email_corporativo, fromName: companyName,
          subject: scheduled ? `Novo agendamento — ${data.customerName}` : `Novo lead — ${data.customerName}`,
          html: emailLayout({
            companyName, accent,
            title: scheduled ? "Novo agendamento anotado 📅" : "Novo lead pelo formulário 🚀",
            intro: scheduled ? `${data.customerName} agendou <b>${serviceName}</b>.` : `${data.customerName} pediu contato. Responda o quanto antes!`,
            bodyHtml: `${scheduled ? `<p style="margin:0 0 6px"><b>Quando:</b> ${whenFull}</p>` : ""}<p style="margin:0 0 6px"><b>Telefone:</b> ${data.customerPhone}</p><p style="margin:0 0 6px"><b>E-mail:</b> ${data.customerEmail}</p><p style="margin:0 0 6px"><b>Endereço:</b> ${[data.address, data.city, data.state].filter(Boolean).join(", ")}</p>${data.preferredTime ? `<p style="margin:0 0 6px"><b>Horário de pref.:</b> ${data.preferredTime}</p>` : ""}${data.urgency ? `<p style="margin:0 0 6px"><b>Urgência:</b> ${data.urgency}</p>` : ""}`,
            ctaLabel: "Abrir no CRM", ctaUrl: "https://hub.velocitycompany.com.br/app/crm",
          }),
        });
      }
      // Confirmação ao cliente final
      await sendEmail({
        to: data.customerEmail, fromName: companyName,
        subject: scheduled ? `Agendamento confirmado — ${companyName}` : `Recebemos seu contato — ${companyName}`,
        html: emailLayout({
          companyName, accent,
          title: scheduled ? "Seu agendamento está confirmado ✅" : "Recebemos seu pedido ✅",
          intro: scheduled
            ? `Olá ${data.customerName}, seu agendamento de <b>${serviceName}</b> (${whenFull}) está confirmado.`
            : `Olá ${data.customerName}, recebemos seu pedido e entraremos em contato em horário comercial.`,
          ...(scheduled && manageToken
            ? { ctaLabel: "Reschedule or cancel", ctaUrl: `https://hub.velocitycompany.com.br/a/${manageToken}` }
            : {}),
          footer: `${companyName}${(company as any).telefone ? ` · ${(company as any).telefone}` : ""}`,
        }),
      });
    } catch (e) { console.warn("[booking] email falhou", e); }

    return {
      ok: true, mode: scheduled ? "scheduled" : "lead",
      appointmentId, manageToken, serviceName, startISO,
      company: { nome: companyName, telefone: (company as any).telefone ?? null, email: (company as any).email_corporativo ?? null },
    };
  });
