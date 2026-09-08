import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/config/brand";
import { Bot, MessageCircle, Target, Trophy } from "lucide-react";
import { useNicho } from "@/routes/demo";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MiniAreaChart, type AreaPoint } from "@/components/dashboard/mini-area-chart";
import { AgentStatusCard } from "@/components/dashboard/agent-status-card";
import { MessageTimeline } from "@/components/dashboard/message-timeline";

export const Route = createFileRoute("/demo/dashboard")({
  head: () => ({ meta: [{ title: `${brand.name} — Demonstração` }] }),
  component: DemoDashboard,
});

function DemoDashboard() {
  const nicho = useNicho();
  const { kpis, mensagens, agentName, phone } = nicho;

  const series: AreaPoint[] = Array.from({ length: 14 }, (_, i) => ({
    label: String(i),
    a: 8 + Math.round(Math.sin(i * 0.6) * 5 + i * 0.9),
    b: 5 + Math.round(Math.sin(i * 0.7) * 4 + i * 0.6),
  }));

  const last = [...mensagens].sort((a, b) => +b.quando - +a.quando).slice(0, 8);

  return (
    <div className="space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Demonstração — {nicho.emoji} {nicho.label} · {nicho.company}</p>
        </div>
        <div className="flex items-center gap-2 bg-[color:var(--brand-soft)] border border-[color:var(--brand-soft-strong)] text-[color:var(--brand-text)] text-[12.5px] font-semibold px-3 py-1.5 rounded-full">
          <span className="size-2 rounded-full bg-[color:var(--brand)]" style={{ boxShadow: "0 0 8px var(--brand)" }} /> Agente conectado
        </div>
      </header>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard accent icon={<MessageCircle className="size-4" />} label="Leads hoje" value={kpis.conversas} trend="+22% vs ontem" />
        <KpiCard icon={<Bot className="size-4" />} label="Respondidos pela IA" value={kpis.aiRate} trend="no automático" />
        <KpiCard icon={<Target className="size-4" />} label="Pipeline ativo" value={kpis.pipeline} trend="em negociação" />
        <KpiCard icon={<Trophy className="size-4" />} label="Receita (mês)" value={kpis.revenue} trend={kpis.trend} />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-[15px] font-semibold">Atendimentos · 14 dias</h3>
          <p className="text-xs text-muted-foreground mb-3">mensagens recebidas vs respondidas pela IA</p>
          <MiniAreaChart data={series} />
        </div>
        <AgentStatusCard status="connected" numero={phone} tempoMedio="2.8s" taxaQualificacao="76%" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-[15px] font-semibold">Últimas mensagens</h3>
        <p className="text-xs text-muted-foreground mb-2">atividade recente — {nicho.company}</p>
        <MessageTimeline items={last.map((msg) => ({ id: msg.id, nome: msg.nome, autor: msg.autor, texto: msg.texto, quando: msg.quando }))} />
      </div>
    </div>
  );
}
