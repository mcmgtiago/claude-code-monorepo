import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Users, Calendar, Star, TrendingUp, MessageCircle, ChevronRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNicho } from "@/routes/demo";

export const Route = createFileRoute("/demo/aigrowth")({
  component: DemoAigrowth,
});

type Insight = {
  id: string;
  icon: any;
  title: string;
  description: string;
  cta: string;
  urgency: "high" | "medium" | "low";
  count?: number;
};

function DemoAigrowth() {
  const nicho = useNicho();

  const staleLeads = nicho.cards.filter(c => c.status !== "ganho" && c.status !== "perda").length;
  const completedJobs = nicho.appointments.filter(a => a.status === "concluido").length;
  const upcomingJobs = nicho.appointments.filter(a => a.status === "agendado" || a.status === "confirmado").length;

  const insights: Insight[] = [
    ...(staleLeads > 0 ? [{
      id: "stale",
      icon: Users,
      title: `${staleLeads} leads need follow-up`,
      description: `You have ${staleLeads} open leads in the CRM without a scheduled follow-up. Reactivating these can generate new jobs this week.`,
      cta: "View in CRM",
      urgency: "high" as const,
      count: staleLeads,
    }] : []),
    ...(completedJobs > 0 ? [{
      id: "reviews",
      icon: Star,
      title: `${completedJobs} completed jobs — ask for reviews`,
      description: `You have ${completedJobs} recently completed jobs without a Google review request. Each review increases visibility and brings new customers.`,
      cta: "Request reviews",
      urgency: "medium" as const,
      count: completedJobs,
    }] : []),
    {
      id: "schedule",
      icon: Calendar,
      title: `${upcomingJobs} jobs scheduled this week`,
      description: `Share your online booking link on Instagram and Facebook to fill any gaps. Your AI agent is ready to qualify new leads 24/7.`,
      cta: "Copy booking link",
      urgency: upcomingJobs < 3 ? "high" as const : "low" as const,
      count: upcomingJobs,
    },
    {
      id: "airate",
      icon: Sparkles,
      title: `AI answered ${nicho.kpis.aiRate} of conversations`,
      description: `Your AI agent is handling the majority of inbound leads automatically. Train it with more info about your services to increase the response rate.`,
      cta: "Update agent",
      urgency: "low" as const,
    },
    {
      id: "pipeline",
      icon: TrendingUp,
      title: `${nicho.kpis.pipeline} in open pipeline`,
      description: `You have active proposals worth ${nicho.kpis.pipeline} in your pipeline. Follow up with quotes in "sent" status to close faster.`,
      cta: "View quotes",
      urgency: "medium" as const,
    },
  ];

  const URGENCY_ORDER = { high: 0, medium: 1, low: 2 };
  const sorted = [...insights].sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="size-6 text-[color:var(--brand-text)]" />AI Growth Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI analyzes your business and surfaces actions to grow — {nicho.company}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Conversations", value: nicho.kpis.conversas, icon: MessageCircle, color: "#3b82f6" },
          { label: "AI Rate", value: nicho.kpis.aiRate, icon: Sparkles, color: "#0efa71" },
          { label: "Pipeline", value: nicho.kpis.pipeline, icon: TrendingUp, color: "#f59e0b" },
          { label: "Revenue", value: nicho.kpis.revenue, icon: Zap, color: "#8b5cf6" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="panel p-3.5">
              <div className="flex items-center gap-1.5 mb-1" style={{ color: s.color }}>
                <Icon className="size-3.5" /><span className="text-[11px] font-semibold uppercase tracking-wide">{s.label}</span>
              </div>
              <div className="text-[20px] font-extrabold">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {sorted.map(insight => {
          const Icon = insight.icon;
          const urgencyColor = insight.urgency === "high" ? "#ef4444" : insight.urgency === "medium" ? "#f59e0b" : "#8aa89a";
          return (
            <div key={insight.id} className="panel p-4 flex gap-4">
              <div className="size-11 rounded-xl shrink-0 grid place-items-center" style={{ background: urgencyColor + "18", color: urgencyColor }}>
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-[15px]">{insight.title}</span>
                  <Badge style={{ background: urgencyColor + "18", color: urgencyColor, border: `1px solid ${urgencyColor}33` }} className="text-[10px] shrink-0">
                    {insight.urgency === "high" ? "Urgent" : insight.urgency === "medium" ? "Recommended" : "Tip"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                <Button size="sm" variant="outline" className="mt-3 text-xs h-8"
                  onClick={() => toast.info("Sign up to activate AI Growth features", { description: "This is a demo preview." })}>
                  {insight.cta} <ChevronRight className="size-3 ml-1" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel p-3 text-xs text-muted-foreground text-center">
        🔒 Demo mode — insights are based on {nicho.label} sample data
      </div>
    </div>
  );
}
