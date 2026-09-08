import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { format, parseISO } from "date-fns";
import { brand } from "@/config/brand";
import { getWeeklyReport } from "@/lib/report-public.functions";
import { fmtMoney } from "@/config/money";
import { LANGS, DF, detectLang, type Lang } from "@/config/public-lang";
import {
  Loader2, Zap, TrendingUp, TrendingDown, Users, MessageSquare, FileText,
  CheckCircle2, CalendarCheck, DollarSign, Wallet, Target,
} from "lucide-react";

export const Route = createFileRoute("/r/$slug")({
  head: () => ({ meta: [{ title: `Relatório semanal — ${brand.name}` }] }),
  component: ReportPage,
});

type Report = Awaited<ReturnType<typeof getWeeklyReport>>;

const T: Record<Lang, any> = {
  pt: {
    title: "Relatório de resultados", revenue: "Faturamento na semana", vsPrev: "vs. semana anterior",
    profit: "Lucro estimado", leads: "Leads na semana", messages: "Mensagens", quotesSent: "Orçamentos enviados",
    quotesClosed: "Orçamentos fechados", valueClosed: "Valor fechado", bookings: "Agendamentos",
    openPipeline: "Em orçamentos abertos (oportunidade)", powered: "Desenvolvido por",
    good: "🚀 Seu atendimento automático seguiu trabalhando por você esta semana.",
    empty: "Conecte seus canais para começar a ver os resultados aqui.", periodFmt: "d MMM",
    autoTitle: "🤖 Automações que trabalharam por você",
    reactivation: "E-mails de reativação", reviews: "Pedidos de avaliação", recurring: "Lembretes de novo serviço",
    winback: "Leads perdidos reabordados", quoteRescue: "Orçamentos resgatados",
  },
  en: {
    title: "Results report", revenue: "Revenue this week", vsPrev: "vs. last week",
    profit: "Estimated profit", leads: "Leads this week", messages: "Messages", quotesSent: "Quotes sent",
    quotesClosed: "Quotes closed", valueClosed: "Closed value", bookings: "Appointments",
    openPipeline: "In open quotes (opportunity)", powered: "Powered by",
    good: "🚀 Your automated front desk kept working for you this week.",
    empty: "Connect your channels to start seeing results here.", periodFmt: "MMM d",
    autoTitle: "🤖 Automations that worked for you",
    reactivation: "Reactivation emails", reviews: "Review requests", recurring: "Next-service reminders",
    winback: "Lost leads re-engaged", quoteRescue: "Quotes rescued",
  },
  es: {
    title: "Informe de resultados", revenue: "Facturación de la semana", vsPrev: "vs. semana anterior",
    profit: "Beneficio estimado", leads: "Leads de la semana", messages: "Mensajes", quotesSent: "Presupuestos enviados",
    quotesClosed: "Presupuestos cerrados", valueClosed: "Valor cerrado", bookings: "Citas",
    openPipeline: "En presupuestos abiertos (oportunidad)", powered: "Desarrollado por",
    good: "🚀 Tu atención automática siguió trabajando por ti esta semana.",
    empty: "Conecta tus canales para empezar a ver los resultados aquí.", periodFmt: "d MMM",
    autoTitle: "🤖 Automatizaciones que trabajaron por ti",
    reactivation: "Correos de reactivación", reviews: "Solicitudes de reseña", recurring: "Recordatorios de nuevo servicio",
    winback: "Leads perdidos reactivados", quoteRescue: "Presupuestos rescatados",
  },
};

function ReportPage() {
  const { slug } = useParams({ from: "/r/$slug" });
  const load = useServerFn(getWeeklyReport);
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>(() => detectLang());
  const t = T[lang];
  const dfLocale = DF[lang];

  useEffect(() => {
    load({ data: { slug } }).then(setData).catch((e) => setError(e?.message || "Report unavailable"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (error) {
    return <Center><div className="text-center"><div className="text-4xl mb-3">📊</div><h1 className="text-xl font-bold">{error}</h1></div></Center>;
  }
  if (!data) return <Center><Loader2 className="size-6 animate-spin text-muted-foreground" /></Center>;

  const { company, period, metrics, delta } = data;
  const accent = company.accent;
  const usd = (n: number) => fmtMoney(n, (company as any).currency, { decimals: 0 });
  const periodLabel = (period as any).startISO && (period as any).endISO
    ? `${format(parseISO((period as any).startISO), t.periodFmt, { locale: dfLocale })} – ${format(parseISO((period as any).endISO), t.periodFmt, { locale: dfLocale })}`
    : period.label;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <header className="flex items-center gap-3 mb-1">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="size-12 rounded-xl object-cover" />
          ) : (
            <div className="size-12 rounded-xl grid place-items-center text-[#04140b]" style={{ background: accent }}>
              <Zap className="size-6" strokeWidth={2.5} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg leading-tight">{company.name}</div>
            <div className="text-[12px] text-muted-foreground">{t.title} · {periodLabel}</div>
          </div>
          <div className="flex gap-1 shrink-0">
            {LANGS.map((o) => (
              <button key={o.code} onClick={() => setLang(o.code)} title={o.code.toUpperCase()}
                className={`size-8 rounded-lg text-[15px] grid place-items-center transition ${lang === o.code ? "ring-1" : "opacity-50 hover:opacity-100"}`}
                style={lang === o.code ? { background: `${accent}1f` } : undefined}>
                {o.flag}
              </button>
            ))}
          </div>
        </header>

        {/* Hero — receita */}
        <div className="rounded-3xl p-6 sm:p-7 my-5 text-center relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${accent}1f, transparent)`, border: `1px solid ${accent}33` }}>
          <div className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">{t.revenue}</div>
          <div className="text-5xl font-extrabold mt-1" style={{ color: accent }}>{usd(metrics.receita)}</div>
          <Delta v={delta.receita} className="mt-2 justify-center" suffix={t.vsPrev} />
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full" style={{ background: `${accent}1a`, color: accent }}>
            <Wallet className="size-4" /> {t.profit}: {usd(metrics.lucro)}
          </div>
        </div>

        {/* Grid de métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat icon={<Users />} label={t.leads} value={metrics.leads} delta={delta.leads} accent={accent} />
          <Stat icon={<MessageSquare />} label={t.messages} value={metrics.mensagens} accent={accent} />
          <Stat icon={<FileText />} label={t.quotesSent} value={metrics.orcamentosEnviados} accent={accent} />
          <Stat icon={<CheckCircle2 />} label={t.quotesClosed} value={metrics.orcamentosAceitos} accent={accent} />
          <Stat icon={<DollarSign />} label={t.valueClosed} value={usd(metrics.valorFechado)} delta={delta.valorFechado} accent={accent} />
          <Stat icon={<CalendarCheck />} label={t.bookings} value={metrics.agendamentos} accent={accent} />
        </div>

        {/* Pipeline */}
        <div className="rounded-2xl border p-5 mt-4 flex items-center gap-3" style={{ borderColor: "var(--hairline,#e5e5e5)" }}>
          <div className="size-11 rounded-xl grid place-items-center shrink-0" style={{ background: `${accent}1f`, color: accent }}>
            <Target className="size-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">{t.openPipeline}</div>
            <div className="text-2xl font-bold">{usd(metrics.pipelineAberto)}</div>
          </div>
        </div>

        {/* Automações executadas (respeita visibilidade por seção) */}
        {(() => {
          const sec = (data as any).sections ?? {};
          const items = [
            ["reactivation", metrics.reactivationsSent],
            ["reviews", metrics.reviewsRequested],
            ["recurring", metrics.recurringSent],
            ["winback", metrics.winbacksSent],
            ["quoteRescue", metrics.quotesRescued],
          ].filter(([k, v]) => sec[k as string] !== false && (v as number) > 0) as [string, number][];
          if (items.length === 0) return null;
          return (
            <div className="rounded-2xl border p-5 mt-4" style={{ borderColor: "var(--hairline,#e5e5e5)" }}>
              <div className="text-sm font-semibold mb-3">{t.autoTitle}</div>
              <div className="space-y-2">
                {items.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t[k]}</span>
                    <span className="font-bold" style={{ color: accent }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Mensagem */}
        <div className="text-center mt-6 text-[13px] text-muted-foreground">
          {metrics.leads > 0 || metrics.receita > 0 ? t.good : t.empty}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          {t.powered} <a href="https://hub.velocitycompany.com.br" className="font-semibold hover:underline" style={{ color: accent }}>Velo</a>
        </p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, delta, accent }: { icon: React.ReactNode; label: string; value: number | string; delta?: number | null; accent: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--hairline,#e5e5e5)" }}>
      <div className="size-8 rounded-lg grid place-items-center mb-2" style={{ background: `${accent}1a`, color: accent }}>
        <span className="[&>svg]:size-4">{icon}</span>
      </div>
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-[12px] text-muted-foreground mt-1">{label}</div>
      {delta !== undefined && <Delta v={delta} className="mt-1.5" />}
    </div>
  );
}

function Delta({ v, className = "", suffix }: { v: number | null | undefined; className?: string; suffix?: string }) {
  if (v === null || v === undefined) return null;
  const up = v >= 0;
  return (
    <div className={`flex items-center gap-1 text-[12px] font-semibold ${up ? "text-green-600 dark:text-green-400" : "text-red-500"} ${className}`}>
      {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
      {up ? "+" : ""}{v}% {suffix && <span className="text-muted-foreground font-normal">{suffix}</span>}
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen grid place-items-center bg-background text-foreground px-4">{children}</div>;
}
