// Motor do relatório semanal de resultados. Carregar só em handlers server-side.

export type ReportSections = {
  reactivation: boolean;
  reviews: boolean;
  recurring: boolean;
  winback: boolean;
  quoteRescue: boolean;
};

export const REPORT_SECTION_KEYS: (keyof ReportSections)[] = ["reactivation", "reviews", "recurring", "winback", "quoteRescue"];

/** Normaliza o jsonb report_sections (ausente = visível por padrão). */
export function normalizeSections(raw: any): ReportSections {
  const r = raw && typeof raw === "object" ? raw : {};
  return {
    reactivation: r.reactivation !== false,
    reviews: r.reviews !== false,
    recurring: r.recurring !== false,
    winback: r.winback !== false,
    quoteRescue: r.quoteRescue !== false,
  };
}

export type WeeklyReport = {
  company: { id: string; name: string; accent: string; logoUrl: string | null; slug: string | null; currency: string };
  period: { startISO: string; endISO: string; label: string };
  metrics: {
    leads: number;
    mensagens: number;
    orcamentosEnviados: number;
    orcamentosAceitos: number;
    valorFechado: number;
    agendamentos: number;
    agendamentosConcluidos: number;
    receita: number;
    lucro: number;
    pipelineAberto: number;
    // automações de crescimento (ações executadas na semana)
    reactivationsSent: number;
    reviewsRequested: number;
    recurringSent: number;
    winbacksSent: number;
    quotesRescued: number;
  };
  sections: ReportSections;
  // variação % vs. semana anterior (null quando não há base)
  delta: { leads: number | null; receita: number | null; valorFechado: number | null };
};

function pctChange(cur: number, prev: number): number | null {
  if (!prev) return cur > 0 ? 100 : null;
  return Math.round(((cur - prev) / prev) * 100);
}

const APP_BASE_URL = (process.env.APP_BASE_URL || "https://hub.velocitycompany.com.br").replace(/\/$/, "");

/** Monta e envia o e-mail do relatório semanal para o contato da empresa. */
export async function sendWeeklyReportToCompany(supabaseAdmin: any, companyId: string): Promise<{ sent: boolean; to?: string }> {
  const report = await buildWeeklyReport(supabaseAdmin, companyId);
  if (!report) return { sent: false };
  const { data: c } = await supabaseAdmin.from("company").select("email_corporativo").eq("id", companyId).maybeSingle();
  const to = c?.email_corporativo;
  if (!to) return { sent: false };

  const { sendEmail, emailLayout } = await import("@/lib/email.server");
  const m = report.metrics;
  const accent = report.company.accent;
  const link = report.company.slug ? `${APP_BASE_URL}/r/${report.company.slug}` : APP_BASE_URL;
  const { fmtMoney } = await import("@/config/money");
  const usd = (n: number) => fmtMoney(n, report.company.currency, { decimals: 0 });
  const deltaTxt = report.delta.receita !== null ? ` (${report.delta.receita >= 0 ? "+" : ""}${report.delta.receita}% vs. semana anterior)` : "";

  const row = (label: string, value: string) =>
    `<tr><td style="padding:7px 0;color:#555">${label}</td><td style="padding:7px 0;text-align:right;font-weight:700">${value}</td></tr>`;

  const s = report.sections;
  const autoRows = [
    s.reactivation && m.reactivationsSent > 0 ? row("E-mails de reativação enviados", String(m.reactivationsSent)) : "",
    s.reviews && m.reviewsRequested > 0 ? row("Pedidos de avaliação", String(m.reviewsRequested)) : "",
    s.recurring && m.recurringSent > 0 ? row("Lembretes de novo serviço", String(m.recurringSent)) : "",
    s.winback && m.winbacksSent > 0 ? row("Leads perdidos reabordados", String(m.winbacksSent)) : "",
    s.quoteRescue && m.quotesRescued > 0 ? row("Orçamentos resgatados", String(m.quotesRescued)) : "",
  ].filter(Boolean).join("");
  const autoBlock = autoRows
    ? `<p style="margin:18px 0 4px;font-weight:700;font-size:13px;color:#333">🤖 Automações que trabalharam por você</p>
       <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee">${autoRows}</table>`
    : "";

  const html = emailLayout({
    companyName: report.company.name, accent,
    title: "Seu resultado da semana 📊",
    intro: `${report.period.label} — veja o que o seu atendimento automático trouxe.`,
    bodyHtml: `
      <div style="text-align:center;background:${accent}14;border:1px solid ${accent}33;border-radius:16px;padding:18px;margin:6px 0 14px">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#777">Faturamento</div>
        <div style="font-size:34px;font-weight:800;color:${accent}">${usd(m.receita)}</div>
        <div style="font-size:12px;color:#777">${deltaTxt} · Lucro ${usd(m.lucro)}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee">
        ${row("Leads na semana", String(m.leads))}
        ${row("Orçamentos enviados", String(m.orcamentosEnviados))}
        ${row("Orçamentos fechados", `${m.orcamentosAceitos} · ${usd(m.valorFechado)}`)}
        ${row("Agendamentos", String(m.agendamentos))}
        ${row("Em orçamentos abertos", usd(m.pipelineAberto))}
      </table>${autoBlock}`,
    ctaLabel: "Ver relatório completo", ctaUrl: link,
    footer: `${report.company.name} · Relatório gerado pelo VeloHUB`,
  });

  await sendEmail({ to, fromName: report.company.name, subject: `Seu resultado da semana — ${report.company.name}`, html });
  return { sent: true, to };
}

/** Constrói o relatório dos últimos 7 dias (com comparação com os 7 anteriores). */
export async function buildWeeklyReport(supabaseAdmin: any, companyId: string, end = new Date()): Promise<WeeklyReport | null> {
  const { data: company } = await supabaseAdmin
    .from("company").select("id, nome, nome_fantasia, primary_color, logo_url, slug, currency, report_sections").eq("id", companyId).maybeSingle();
  if (!company) return null;

  const DAY = 86400000;
  const endT = end.getTime();
  const startT = endT - 7 * DAY;
  const prevStartT = endT - 14 * DAY;
  const startISO = new Date(startT).toISOString();
  const endISO = new Date(endT).toISOString();
  const prevStartISO = new Date(prevStartT).toISOString();
  const inCur = (t: number) => t >= startT && t <= endT;
  const inPrev = (t: number) => t >= prevStartT && t < startT;

  // Mensagens (atividade) e leads movimentados (proxy: cards com atividade na semana)
  const [{ count: msgCur }, { count: msgPrev }, { data: cards }] = await Promise.all([
    supabaseAdmin.from("mensagens").select("id", { count: "exact", head: true }).eq("company_id", companyId).gte("created_at", startISO).lte("created_at", endISO),
    supabaseAdmin.from("mensagens").select("id", { count: "exact", head: true }).eq("company_id", companyId).gte("created_at", prevStartISO).lt("created_at", startISO),
    supabaseAdmin.from("crm_cards").select("ultima_em").eq("company_id", companyId).gte("ultima_em", prevStartISO),
  ]);
  let leadsCur = 0, leadsPrev = 0;
  for (const c of cards ?? []) {
    const t = new Date((c as any).ultima_em).getTime();
    if (inCur(t)) leadsCur++; else if (inPrev(t)) leadsPrev++;
  }

  // Orçamentos
  const { data: quotes } = await supabaseAdmin
    .from("quote").select("status, total_amount, sent_at, accepted_at").eq("company_id", companyId);
  let qSent = 0, qAcc = 0, valorFechado = 0, valorFechadoPrev = 0, pipelineAberto = 0;
  for (const q of quotes ?? []) {
    const sa = (q as any).sent_at ? new Date((q as any).sent_at).getTime() : null;
    const aa = (q as any).accepted_at ? new Date((q as any).accepted_at).getTime() : null;
    const val = Number((q as any).total_amount ?? 0);
    if (sa && inCur(sa)) qSent++;
    if (aa && inCur(aa)) { qAcc++; valorFechado += val; }
    if (aa && inPrev(aa)) { valorFechadoPrev += val; }
    if ((q as any).status === "sent") pipelineAberto += val;
  }

  // Agendamentos
  const { data: appts } = await supabaseAdmin
    .from("agendamento").select("status, inicio").eq("company_id", companyId).gte("inicio", startISO).lte("inicio", endISO);
  const agendamentos = (appts ?? []).length;
  const agendamentosConcluidos = (appts ?? []).filter((a: any) => a.status === "concluido").length;

  // Automações executadas na semana (defensivo se as colunas/tabelas não existirem)
  const inWeek = (iso: string | null) => !!iso && inCur(new Date(iso).getTime());
  let reviewsRequested = 0, recurringSent = 0, quotesRescued = 0, winbacksSent = 0, reactivationsSent = 0;
  try {
    const { data: au } = await supabaseAdmin
      .from("agendamento").select("review_sent_at, recurring_sent_at").eq("company_id", companyId)
      .or(`review_sent_at.gte.${startISO},recurring_sent_at.gte.${startISO}`);
    for (const a of au ?? []) { if (inWeek((a as any).review_sent_at)) reviewsRequested++; if (inWeek((a as any).recurring_sent_at)) recurringSent++; }
  } catch { /* colunas ainda não existem */ }
  try {
    const { data: qr } = await supabaseAdmin
      .from("quote").select("rescue_sent_at").eq("company_id", companyId).gte("rescue_sent_at", startISO);
    quotesRescued = (qr ?? []).filter((q: any) => inWeek(q.rescue_sent_at)).length;
  } catch { /* coluna ainda não existe */ }
  try {
    const { data: wb } = await supabaseAdmin
      .from("crm_cards").select("winback_last_at").eq("company_id", companyId).gte("winback_last_at", startISO);
    winbacksSent = (wb ?? []).filter((c: any) => inWeek(c.winback_last_at)).length;
  } catch { /* coluna ainda não existe */ }
  try {
    const { data: rc } = await supabaseAdmin
      .from("reactivation_contact").select("last_sent_at").eq("company_id", companyId).gte("last_sent_at", startISO);
    reactivationsSent = (rc ?? []).filter((r: any) => inWeek(r.last_sent_at)).length;
  } catch { /* tabela ainda não existe */ }

  // Financeiro
  const { data: fin } = await supabaseAdmin
    .from("financial_entry").select("type, amount, date").eq("company_id", companyId).gte("date", new Date(prevStartT).toISOString().slice(0, 10));
  let receita = 0, despesa = 0, receitaPrev = 0;
  for (const f of fin ?? []) {
    const t = new Date((f as any).date + "T12:00:00").getTime();
    const amt = Number((f as any).amount ?? 0);
    if (inCur(t)) { if ((f as any).type === "entrada") receita += amt; else despesa += amt; }
    else if (inPrev(t) && (f as any).type === "entrada") receitaPrev += amt;
  }

  const fmtDay = (t: number) => new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return {
    company: {
      id: company.id,
      name: company.nome_fantasia || company.nome || "VeloHUB",
      accent: company.primary_color || "#0efa71",
      logoUrl: company.logo_url ?? null,
      slug: company.slug ?? null,
      currency: company.currency ?? "USD",
    },
    period: { startISO, endISO, label: `${fmtDay(startT)} – ${fmtDay(endT)}` },
    metrics: {
      leads: leadsCur,
      mensagens: msgCur ?? 0,
      orcamentosEnviados: qSent,
      orcamentosAceitos: qAcc,
      valorFechado,
      agendamentos,
      agendamentosConcluidos,
      receita,
      lucro: receita - despesa,
      pipelineAberto,
      reactivationsSent,
      reviewsRequested,
      recurringSent,
      winbacksSent,
      quotesRescued,
    },
    sections: normalizeSections((company as any).report_sections),
    delta: {
      leads: pctChange(leadsCur, leadsPrev),
      receita: pctChange(receita, receitaPrev),
      valorFechado: pctChange(valorFechado, valorFechadoPrev),
    },
  };
}
