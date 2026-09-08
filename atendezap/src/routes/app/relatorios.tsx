import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { brand } from "@/config/brand";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Bot, MessageCircle, Target, DollarSign, Download, Clock, BarChart3, ExternalLink, Link as LinkIcon, Send, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { sendWeeklyReportNow } from "@/lib/report.functions";
import { toast } from "sonner";
import { fmtMoney, currencyOf } from "@/config/money";

export const Route = createFileRoute("/app/relatorios")({
  head: () => ({ meta: [{ title: `${brand.name} — Relatórios` }] }),
  beforeLoad: ({ context }: any) => {
    const r = context?.membership?.role;
    if (r === "atendente") throw redirect({ to: "/app/dashboard" });
  },
  component: RelatoriosPage,
});

type Period = "today" | "7d" | "30d" | "custom";

function rangeOf(p: Period, from?: string, to?: string) {
  const end = new Date();
  if (p === "today") { const s = new Date(); s.setHours(0, 0, 0, 0); return { start: s, end }; }
  if (p === "7d") return { start: new Date(Date.now() - 7 * 86400000), end };
  if (p === "30d") return { start: new Date(Date.now() - 30 * 86400000), end };
  return { start: from ? new Date(from) : new Date(Date.now() - 7 * 86400000), end: to ? new Date(to) : end };
}

function RelatoriosPage() {
  const ctx = Route.useRouteContext();
  const companyId = ctx.company?.id;
  const currency = currencyOf((ctx.company as any)?.currency);
  const [period, setPeriod] = useState<Period>("30d");
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [msgs, setMsgs] = useState<{ created_at: string; direcao: string; autor: string; user_id: string | null }[]>([]);
  const [cards, setCards] = useState<{ status: string; stage_id: string | null; valor: number; owner_id: string | null; ultima_em: string }[]>([]);
  const [stages, setStages] = useState<{ id: string; nome: string; cor: string; tipo: string }[]>([]);
  const [members, setMembers] = useState<{ user_id: string; nome: string | null; email: string | null }[]>([]);

  const range = useMemo(() => rangeOf(period, from, to), [period, from, to]);

  useEffect(() => {
    if (!companyId) return;
    void (async () => {
      const [{ data: m }, { data: c }, { data: st }, { data: cu }] = await Promise.all([
        supabase.from("mensagens").select("created_at,direcao,autor,user_id").eq("company_id", companyId).gte("created_at", range.start.toISOString()).lte("created_at", range.end.toISOString()),
        supabase.from("crm_cards").select("status,stage_id,valor,owner_id,ultima_em").eq("company_id", companyId),
        supabase.from("crm_stage").select("id,nome,cor,tipo,ordem").eq("company_id", companyId).order("ordem", { ascending: true }),
        supabase.from("company_user").select("user_id,profiles(nome,email)").eq("company_id", companyId).eq("ativo", true),
      ]);
      setMsgs((m ?? []) as any);
      setCards((c ?? []) as any);
      setStages((st ?? []) as any);
      setMembers(((cu ?? []) as any[]).map((r) => ({
        user_id: r.user_id, nome: r.profiles?.nome ?? null, email: r.profiles?.email ?? null,
      })));
    })();
  }, [companyId, range.start.getTime(), range.end.getTime()]);

  // Tempo médio de resposta: para cada mensagem 'entrada', achar a próxima 'saida' do mesmo dia
  const tempoMedioMs = useMemo(() => {
    const sorted = [...msgs].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    const deltas: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].direcao !== "entrada") continue;
      for (let j = i + 1; j < sorted.length; j++) {
        if (sorted[j].direcao === "saida") {
          deltas.push(+new Date(sorted[j].created_at) - +new Date(sorted[i].created_at));
          break;
        }
      }
    }
    if (!deltas.length) return 0;
    return deltas.reduce((a, b) => a + b, 0) / deltas.length;
  }, [msgs]);

  const stageMap = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);
  const totalMsgs = msgs.length;
  const respIa = msgs.filter((m) => m.autor === "ia").length;
  const ganho = cards.filter((c) => c.stage_id && stageMap.get(c.stage_id)?.tipo === "ganho");
  const receita = ganho.reduce((s, c) => s + Number(c.valor ?? 0), 0);
  const conversao = cards.length ? Math.round((ganho.length / cards.length) * 100) : 0;

  const perDay = useMemo(() => {
    const days = Math.min(30, Math.max(1, Math.ceil((+range.end - +range.start) / 86400000)));
    const map = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(range.end.getTime() - i * 86400000);
      map.set(d.toISOString().slice(0, 10), 0);
    }
    msgs.forEach((m) => {
      const k = new Date(m.created_at).toISOString().slice(0, 10);
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([d, v]) => ({ dia: d.slice(5), mensagens: v }));
  }, [msgs, range.start.getTime(), range.end.getTime()]);

  const byStage = useMemo(() => {
    return stages.map((s) => {
      const v = cards.filter((c) => c.stage_id === s.id).length;
      return { name: s.nome, value: v, fill: s.cor };
    });
  }, [cards, stages]);

  const byAtendente = useMemo(() => {
    const map = new Map<string, { recebidas: number; respondidas: number; ganhos: number }>();
    members.forEach((m) => map.set(m.user_id, { recebidas: 0, respondidas: 0, ganhos: 0 }));
    msgs.forEach((m) => {
      if (!m.user_id) return;
      const cur = map.get(m.user_id) ?? { recebidas: 0, respondidas: 0, ganhos: 0 };
      if (m.direcao === "entrada") cur.recebidas += 1;
      if (m.direcao === "saida" && m.autor === "humano") cur.respondidas += 1;
      map.set(m.user_id, cur);
    });
    cards.forEach((c) => {
      if (c.owner_id && c.stage_id && stageMap.get(c.stage_id)?.tipo === "ganho") {
        const cur = map.get(c.owner_id) ?? { recebidas: 0, respondidas: 0, ganhos: 0 };
        cur.ganhos += 1; map.set(c.owner_id, cur);
      }
    });
    return members.map((m) => ({
      nome: (m.nome || m.email || m.user_id.slice(0, 6)) as string,
      ...(map.get(m.user_id) ?? { recebidas: 0, respondidas: 0, ganhos: 0 }),
    })).filter((r) => r.recebidas + r.respondidas + r.ganhos > 0);
  }, [msgs, cards, members, stageMap]);

  function exportCSV() {
    const lines: string[] = [];
    lines.push("Métrica;Valor");
    lines.push(`Período;${range.start.toLocaleDateString("pt-BR")} → ${range.end.toLocaleDateString("pt-BR")}`);
    lines.push(`Mensagens;${totalMsgs}`);
    lines.push(`Respondidas pela IA;${respIa}`);
    lines.push(`Cards totais;${cards.length}`);
    lines.push(`Ganhos;${ganho.length}`);
    lines.push(`Receita (R$);${receita.toFixed(2)}`);
    lines.push(`Conversão (%);${conversao}`);
    lines.push(`Tempo médio resposta (s);${Math.round(tempoMedioMs / 1000)}`);
    lines.push("");
    lines.push("Etapa;Cards");
    byStage.forEach((s) => lines.push(`${s.name};${s.value}`));
    lines.push("");
    lines.push("Atendente;Recebidas;Respondidas;Ganhos");
    byAtendente.forEach((a) => lines.push(`${a.nome};${a.recebidas};${a.respondidas};${a.ganhos}`));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `relatorio_${range.start.toISOString().slice(0, 10)}_${range.end.toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const tooltipStyle = {
    background: "var(--panel)", border: "1px solid var(--hairline)",
    borderRadius: 12, color: "var(--foreground)",
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground">{range.start.toLocaleDateString("pt-BR")} → {range.end.toLocaleDateString("pt-BR")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodTabs value={period} onChange={setPeriod} />
          {period === "custom" && (
            <div className="flex items-center gap-1.5">
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-md px-2 py-1.5 text-[13px]" />
              <span className="text-muted-foreground">→</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-md px-2 py-1.5 text-[13px]" />
            </div>
          )}
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="size-4 mr-2" />Exportar CSV</Button>
        </div>
      </header>

      <WeeklyReportShare slug={(ctx.company as any)?.slug ?? ""} />

      <ReportSectionsConfig companyId={companyId ?? ""} initial={(ctx.company as any)?.report_sections} />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard accent icon={<MessageCircle className="size-4" />} label="Mensagens" value={totalMsgs} trend={`${respIa} pela IA`} />
        <KpiCard icon={<Clock className="size-4" />} label="Tempo médio resposta" value={tempoMedioMs ? `${Math.round(tempoMedioMs / 1000)}s` : "—"} trend="estimado entrada → saída" />
        <KpiCard icon={<Target className="size-4" />} label="Conversão" value={`${conversao}%`} trend={`${ganho.length} ganhos / ${cards.length} cards`} />
        <KpiCard icon={<DollarSign className="size-4" />} label="Receita" value={fmtMoney(receita, currency, { decimals: 0 })} trend="cards em etapas de ganho" />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
        <div className="rounded-2xl border border-[color:var(--hairline)] bg-[color:var(--panel)] p-6">
          <h3 className="font-display text-[17px] font-semibold">Mensagens por dia</h3>
          <p className="text-xs text-muted-foreground mb-3">no período selecionado</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={perDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in oklab, currentColor 12%, transparent)" />
              <XAxis dataKey="dia" fontSize={11} stroke="currentColor" opacity={0.6} />
              <YAxis fontSize={11} allowDecimals={false} stroke="currentColor" opacity={0.6} />
              <Tooltip contentStyle={tooltipStyle as any} cursor={{ fill: "color-mix(in oklab, currentColor 6%, transparent)" }} />
              <Bar dataKey="mensagens" radius={[6, 6, 0, 0]} fill={brand.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-[color:var(--hairline)] bg-[color:var(--panel)] p-6">
          <h3 className="font-display text-[17px] font-semibold">Distribuição por etapa</h3>
          <p className="text-xs text-muted-foreground mb-3">cards no funil</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byStage} dataKey="value" nameKey="name" outerRadius={80} innerRadius={45} paddingAngle={2}>
                {byStage.map((e, i) => <Cell key={i} fill={e.fill} stroke="var(--panel)" strokeWidth={2} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle as any} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 space-y-1.5">
            {byStage.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-[13px]">
                <span className="size-2.5 rounded-full" style={{ background: s.fill }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="ml-auto font-semibold">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--hairline)] bg-[color:var(--panel)] p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-[17px] font-semibold">Conversão por atendente</h3>
            <p className="text-xs text-muted-foreground">recebidas, respondidas e ganhos no período</p>
          </div>
          <Bot className="size-4 text-muted-foreground" />
        </div>
        {byAtendente.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sem atividade humana no período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(160, byAtendente.length * 50)}>
            <BarChart data={byAtendente} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in oklab, currentColor 12%, transparent)" />
              <XAxis type="number" fontSize={11} stroke="currentColor" opacity={0.6} />
              <YAxis type="category" dataKey="nome" width={120} fontSize={12} stroke="currentColor" opacity={0.8} />
              <Tooltip contentStyle={tooltipStyle as any} />
              <Bar dataKey="recebidas" fill="#8AA89A" radius={[0, 6, 6, 0]} />
              <Bar dataKey="respondidas" fill={brand.primary} radius={[0, 6, 6, 0]} />
              <Bar dataKey="ganhos" fill="#22B85F" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function WeeklyReportShare({ slug }: { slug: string }) {
  const sendNow = useServerFn(sendWeeklyReportNow);
  const [sending, setSending] = useState(false);
  const link = typeof window !== "undefined" && slug ? `${window.location.origin}/r/${slug}` : "";

  function copy() {
    if (!link) return toast.error("Defina o nome da empresa nas configurações primeiro.");
    navigator.clipboard.writeText(link).then(() => toast.success("Link copiado! Cole no grupo do WhatsApp ou onde quiser."));
  }
  function whats() {
    if (!link) return;
    const txt = `📊 Confira o resultado da semana:\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
  }
  async function email() {
    setSending(true);
    try {
      const r: any = await sendNow();
      if (r.sent) toast.success(`Relatório enviado por e-mail para ${r.to}`);
      else toast.message("Não enviado", { description: "Defina o e-mail de contato da empresa nas configurações." });
    } catch (e: any) { toast.error(e?.message || "Falha ao enviar"); }
    finally { setSending(false); }
  }

  return (
    <div className="rounded-2xl border border-[color:var(--brand)]/30 bg-[color:var(--brand-soft)] p-5">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-11 rounded-xl grid place-items-center bg-[color:var(--brand)] text-[#04140b] shrink-0">
            <BarChart3 className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">Relatório semanal de resultados</div>
            <div className="text-[13px] text-muted-foreground">Página pronta pra mostrar o que o sistema gerou — compartilhe no grupo, e-mail ou WhatsApp.</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {link && (
            <Button asChild variant="outline" size="sm">
              <a href={link} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4 mr-1.5" />Ver</a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copy}><LinkIcon className="size-4 mr-1.5" />Copiar link</Button>
          <Button variant="outline" size="sm" onClick={whats}><Send className="size-4 mr-1.5" />WhatsApp</Button>
          <Button size="sm" onClick={email} disabled={sending}>
            {sending ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Mail className="size-4 mr-1.5" />}Enviar por e-mail
          </Button>
        </div>
      </div>
    </div>
  );
}

const SECTION_LABELS: { key: string; label: string }[] = [
  { key: "reactivation", label: "Reativação de base" },
  { key: "reviews", label: "Pedidos de avaliação + indicação" },
  { key: "recurring", label: "Lembretes de novo serviço" },
  { key: "winback", label: "Win-back de leads perdidos" },
  { key: "quoteRescue", label: "Resgate de orçamentos" },
];

function ReportSectionsConfig({ companyId, initial }: { companyId: string; initial: any }) {
  const norm = (raw: any) => {
    const r = raw && typeof raw === "object" ? raw : {};
    return Object.fromEntries(SECTION_LABELS.map((s) => [s.key, r[s.key] !== false]));
  };
  const [sections, setSections] = useState<Record<string, boolean>>(() => norm(initial));
  const [reviewUrl, setReviewUrl] = useState<string>((initial && typeof initial === "object" ? "" : "") || "");
  const [savingUrl, setSavingUrl] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    void (async () => {
      const { data } = await (supabase as any).from("company").select("google_review_url").eq("id", companyId).maybeSingle();
      if (data?.google_review_url) setReviewUrl(data.google_review_url);
    })();
  }, [companyId]);

  async function toggle(key: string) {
    const next = { ...sections, [key]: !sections[key] };
    setSections(next);
    const { error } = await (supabase as any).from("company").update({ report_sections: next }).eq("id", companyId);
    if (error) toast.error("Não salvou — rode o SQL das colunas do relatório.");
  }

  async function saveUrl() {
    setSavingUrl(true);
    const { error } = await (supabase as any).from("company").update({ google_review_url: reviewUrl.trim() || null }).eq("id", companyId);
    setSavingUrl(false);
    toast[error ? "error" : "success"](error ? "Não salvou" : "Link de avaliação salvo");
  }

  return (
    <div className="rounded-2xl border border-[color:var(--hairline)] bg-[color:var(--panel)] p-5 space-y-4">
      <div>
        <div className="font-semibold">O que aparece no relatório do cliente</div>
        <div className="text-[13px] text-muted-foreground">Ligue/desligue as seções de automação que o cliente vê na página /r e no e-mail.</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {SECTION_LABELS.map((s) => (
          <button key={s.key} onClick={() => toggle(s.key)}
            className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition ${sections[s.key]
              ? "bg-[color:var(--brand-soft)] border-[color:var(--brand)]/40 text-[color:var(--brand-text)]"
              : "border-[color:var(--hairline)] text-muted-foreground opacity-70"}`}>
            {sections[s.key] ? "✓ " : "✕ "}{s.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end gap-2 pt-1 border-t border-[color:var(--hairline)]">
        <div className="flex-1">
          <label className="text-[12px] font-medium text-muted-foreground">Link de avaliação do Google (usado no pedido de review)</label>
          <input value={reviewUrl} onChange={(e) => setReviewUrl(e.target.value)} placeholder="https://g.page/r/..."
            className="w-full mt-1 bg-[color:var(--panel-2)] border border-[color:var(--hairline)] rounded-lg px-3 py-2 text-[13px]" />
        </div>
        <Button size="sm" variant="outline" onClick={saveUrl} disabled={savingUrl}>{savingUrl ? "Salvando…" : "Salvar link"}</Button>
      </div>
    </div>
  );
}

function PeriodTabs({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-[color:var(--hairline)] bg-[color:var(--panel)] p-1">
      {(["today", "7d", "30d", "custom"] as Period[]).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`px-3 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${
            value === p ? "bg-[color:var(--brand-soft)] text-[color:var(--brand-text)]" : "text-muted-foreground hover:text-foreground"
          }`}>
          {p === "today" ? "Hoje" : p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "Personalizado"}
        </button>
      ))}
    </div>
  );
}
