// Motor de lembretes de agendamento. Rodado pelo agendador central (/api/cron/tick).
// Idempotente: marca reminder_day_sent / reminder_soon_sent no agendamento.
// Fallback em memória caso as colunas ainda não existam no banco (evita reenvio no mesmo processo).
const recentlySent = new Set<string>();

export async function runAppointmentReminders(
  supabaseAdmin: any,
): Promise<{ day: number; soon: number; checked: number }> {
  const now = Date.now();
  const fromISO = new Date(now - 60 * 60 * 1000).toISOString(); // 1h de tolerância p/ trás
  const toISO = new Date(now + 26 * 60 * 60 * 1000).toISOString(); // até 26h à frente

  const { data: appts } = await supabaseAdmin
    .from("agendamento")
    .select("*")
    .gte("inicio", fromISO)
    .lte("inicio", toISO)
    .neq("status", "cancelado")
    .neq("status", "concluido");

  if (!appts || appts.length === 0) return { day: 0, soon: 0, checked: 0 };

  const brandCache = new Map<string, any>();
  async function brandOf(companyId: string) {
    if (brandCache.has(companyId)) return brandCache.get(companyId);
    const { data } = await supabaseAdmin
      .from("company")
      .select("nome, nome_fantasia, primary_color, telefone, email_corporativo")
      .eq("id", companyId)
      .maybeSingle();
    const b = {
      name: data?.nome_fantasia || data?.nome || "VeloHUB",
      accent: data?.primary_color || "#0efa71",
      telefone: data?.telefone ?? null,
      email: data?.email_corporativo ?? null,
    };
    brandCache.set(companyId, b);
    return b;
  }

  const { sendEmail, emailLayout } = await import("@/lib/email.server");
  const { sendPushToCompany } = await import("@/lib/push.server");

  let day = 0;
  let soon = 0;
  for (const a of appts as any[]) {
    const start = new Date(a.inicio).getTime();
    if (isNaN(start)) continue;
    const hrs = (start - now) / 3600000;

    const wantSoon = hrs > 0 && hrs <= 2 && !a.reminder_soon_sent && !recentlySent.has(`${a.id}:soon`);
    const wantDay = hrs > 2 && hrs <= 26 && !a.reminder_day_sent && !recentlySent.has(`${a.id}:day`);
    if (!wantSoon && !wantDay) continue;

    const kind: "soon" | "day" = wantSoon ? "soon" : "day";
    const b = await brandOf(a.company_id);
    const when = new Date(a.inicio).toLocaleString("en-US", {
      weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

    // E-mail ao cliente final (mercado EUA → inglês, igual à confirmação)
    if (a.customer_email) {
      try {
        await sendEmail({
          to: a.customer_email,
          fromName: b.name,
          subject: kind === "soon" ? `Reminder: your appointment is soon — ${b.name}` : `Reminder: see you tomorrow — ${b.name}`,
          html: emailLayout({
            companyName: b.name,
            accent: b.accent,
            title: kind === "soon" ? "Your appointment is coming up ⏰" : "Appointment reminder 📅",
            intro: `${a.customer_name ? `Hi ${a.customer_name}, ` : ""}this is a friendly reminder about your appointment with ${b.name}.`,
            bodyHtml: `<p style="margin:0 0 6px"><b>Service:</b> ${a.titulo ?? ""}</p><p style="margin:0 0 6px"><b>When:</b> ${when}</p>${a.address ? `<p style="margin:0 0 6px"><b>Where:</b> ${a.address}</p>` : ""}`,
            footer: `${b.name}${b.telefone ? ` · ${b.telefone}` : ""}`,
          }),
          replyTo: b.email ?? undefined,
        });
      } catch (e) { console.warn("[reminders] email falhou", e); }
    }

    // Push ao contratante (lembrete do próprio job)
    try {
      await sendPushToCompany(a.company_id, {
        title: kind === "soon" ? "Job em breve ⏰" : "Lembrete de job 📅",
        body: `${a.customer_name || a.titulo || "Agendamento"} — ${when}`,
        url: "/app/agenda",
      });
    } catch {}

    // Marca como enviado (durável no banco; memória como fallback)
    recentlySent.add(`${a.id}:${kind}`);
    await supabaseAdmin
      .from("agendamento")
      .update(kind === "soon" ? { reminder_soon_sent: true } : { reminder_day_sent: true })
      .eq("id", a.id);

    if (kind === "soon") soon++;
    else day++;
  }
  return { day, soon, checked: appts.length };
}
