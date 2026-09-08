import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Users, Calendar, TrendingDown, Star, RefreshCw, MessageCircle, ChevronRight } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

export const Route = createFileRoute("/app/aigrowth")({
  head: () => ({ meta: [{ title: `${brand.name} — AI Growth` }] }),
  component: AiGrowthPage,
});

type Insight = {
  id: string;
  type: "inactive" | "no_followup" | "no_quote" | "review" | "empty_schedule";
  title: string;
  description: string;
  cta: string;
  count?: number;
  data?: any[];
  icon: any;
  urgency: "high" | "medium" | "low";
};

function AiGrowthPage() {
  const ctx = Route.useRouteContext();
  const companyId = ctx.company?.id ?? "";
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");

  async function analyze() {
    if (!companyId) return;
    setLoading(true);
    try {
      const now = new Date();
      const results: Insight[] = [];

      // 1. Leads sem atividade há +7 dias
      const { data: staleCards } = await supabase
        .from("crm_cards")
        .select("id, nome, numero, ultima_em, status")
        .eq("company_id", companyId)
        .eq("status", "aberto")
        .lt("ultima_em", new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(10);

      if (staleCards && staleCards.length > 0) {
        results.push({
          id: "inactive",
          type: "inactive",
          title: `${staleCards.length} lead${staleCards.length > 1 ? "s" : ""} sem atividade`,
          description: `Você tem leads abertos que não receberam resposta há mais de 7 dias. Reativar esses contatos pode gerar novos jobs.`,
          cta: "Ver leads inativos",
          count: staleCards.length,
          data: staleCards,
          icon: Users,
          urgency: "high",
        });
      }

      // 2. Jobs concluídos sem avaliação
      const { data: completedJobs } = await (supabase as any)
        .from("agendamento")
        .select("id, titulo, customer_name, customer_phone")
        .eq("company_id", companyId)
        .eq("status", "concluido")
        .is("customer_phone", null)
        .limit(5);

      const { data: completedWithPhone } = await (supabase as any)
        .from("agendamento")
        .select("id, titulo, customer_name, customer_phone")
        .eq("company_id", companyId)
        .eq("status", "concluido")
        .not("customer_phone", "is", null)
        .limit(10);

      // Check review requests already sent
      const { data: sentReviews } = await (supabase as any)
        .from("review_request")
        .select("agendamento_id")
        .eq("company_id", companyId);
      const sentIds = new Set((sentReviews ?? []).map((r: any) => r.agendamento_id));
      const pendingReviews = (completedWithPhone ?? []).filter((j: any) => !sentIds.has(j.id));

      if (pendingReviews.length > 0) {
        results.push({
          id: "review",
          type: "review",
          title: `${pendingReviews.length} cliente${pendingReviews.length > 1 ? "s" : ""} prontos para avaliação`,
          description: `Jobs concluídos onde você ainda não pediu avaliação no Google. Avaliações aumentam a visibilidade e geram novos clientes.`,
          cta: "Pedir avaliações",
          count: pendingReviews.length,
          data: pendingReviews,
          icon: Star,
          urgency: "medium",
        });
      }

      // 3. Leads sem follow-up agendado
      const { data: noFollowup } = await supabase
        .from("crm_cards")
        .select("id, nome, numero, status")
        .eq("company_id", companyId)
        .eq("status", "aberto")
        .is("follow_up", null)
        .limit(10);

      if (noFollowup && noFollowup.length >= 3) {
        results.push({
          id: "no_followup",
          type: "no_followup",
          title: `${noFollowup.length} leads sem follow-up`,
          description: `Esses leads não têm data de retorno definida. Definir um follow-up aumenta as chances de fechar o job.`,
          cta: "Ver no CRM",
          count: noFollowup.length,
          data: noFollowup,
          icon: Calendar,
          urgency: "medium",
        });
      }

      // 4. Agenda vazia nos próximos dias
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const { data: upcomingJobs } = await supabase
        .from("agendamento")
        .select("id")
        .eq("company_id", companyId)
        .gte("inicio", now.toISOString())
        .lte("inicio", nextWeek.toISOString())
        .not("status", "eq", "cancelado");

      if (!upcomingJobs || upcomingJobs.length === 0) {
        results.push({
          id: "empty_schedule",
          type: "empty_schedule",
          title: "Agenda vazia essa semana",
          description: "Você não tem jobs agendados para os próximos 7 dias. Ative o link de agendamento online e compartilhe nas redes sociais.",
          cta: "Compartilhar link de agendamento",
          count: 0,
          icon: TrendingDown,
          urgency: "high",
        });
      }

      // 5. Google Reviews não configurado
      const { data: company } = await (supabase as any).from("company").select("google_review_url").eq("id", companyId).single();
      if (!company?.google_review_url) {
        results.push({
          id: "no_review_url",
          type: "review",
          title: "Configure seu link do Google Reviews",
          description: "Adicione o link de avaliação do Google para poder pedir avaliações automaticamente após cada job concluído.",
          cta: "Configurar agora",
          count: 0,
          icon: Star,
          urgency: "low",
        });
      } else {
        setGoogleReviewUrl(company.google_review_url);
      }

      setInsights(results);
    } finally { setLoading(false); }
  }

  useEffect(() => { analyze(); }, [companyId]);

  async function sendReviewRequests(jobs: any[]) {
    if (!googleReviewUrl) {
      toast.error("Configure primeiro o link do Google Reviews abaixo");
      return;
    }
    // Abre o WhatsApp do próximo cliente com a mensagem em inglês (clientes nos EUA)
    const job = jobs.find((j) => j.customer_phone);
    if (!job) { toast.error("Nenhum cliente com telefone para pedir avaliação"); return; }

    const name = job.customer_name ?? "there";
    const service = job.titulo ?? "service";
    const msg = `Hi ${name}! Thanks for choosing us for your ${service}. If you were happy with our work, would you mind leaving us a quick review? It only takes a minute and means a lot: ${googleReviewUrl} — Thank you! 🙏`;
    const phone = String(job.customer_phone).replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");

    try {
      await (supabase as any).from("review_request").insert({
        company_id: companyId, agendamento_id: job.id,
        customer_name: job.customer_name, customer_phone: job.customer_phone,
        status: "sent", sent_at: new Date().toISOString(),
      });
    } catch {}
    const remaining = jobs.filter((j) => j.customer_phone).length - 1;
    toast.success(remaining > 0 ? `Mensagem aberta. Mais ${remaining} cliente(s) na fila.` : "Mensagem aberta no WhatsApp.");
    analyze();
  }

  const URGENCY_ORDER = { high: 0, medium: 1, low: 2 };
  const sorted = [...insights].sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="size-6 text-[color:var(--brand-text)]" />
            AI Growth Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">A IA analisa seu negócio e sugere ações para crescer</p>
        </div>
        <Button variant="outline" size="sm" onClick={analyze} disabled={loading}>
          <RefreshCw className={`size-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analisando…" : "Reanalisar"}
        </Button>
      </div>

      {loading ? (
        <div className="panel p-12 text-center">
          <div className="size-12 rounded-full bg-[color:var(--brand-soft)] grid place-items-center mx-auto mb-3 animate-pulse">
            <Sparkles className="size-6 text-[color:var(--brand-text)]" />
          </div>
          <p className="font-medium">Analisando seu negócio…</p>
          <p className="text-sm text-muted-foreground mt-1">Verificando leads, agenda, avaliações e oportunidades</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="panel p-12 text-center">
          <div className="size-12 rounded-full bg-green-500/10 grid place-items-center mx-auto mb-3">
            <Sparkles className="size-6 text-green-500" />
          </div>
          <p className="font-semibold text-lg">Tudo certo por aqui!</p>
          <p className="text-sm text-muted-foreground mt-1">Nenhuma oportunidade imediata identificada. Continue assim!</p>
        </div>
      ) : (
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
                      {insight.urgency === "high" ? "Urgente" : insight.urgency === "medium" ? "Recomendado" : "Sugestão"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <Button size="sm" variant="outline" className="mt-3 text-xs h-8"
                    onClick={() => {
                      if (insight.type === "review" && insight.data?.length) sendReviewRequests(insight.data);
                      else if (insight.type === "inactive") toast.info("Abra o CRM e filtre por 'sem atividade'");
                      else if (insight.type === "empty_schedule") {
                        const slug = (ctx.company as any)?.slug ?? "";
                        const url = `${window.location.origin}/book/${slug}`;
                        navigator.clipboard.writeText(url).then(() => toast.success("Link de agendamento copiado! Compartilhe no Instagram bio."));
                      } else toast.info(insight.cta);
                    }}>
                    {insight.cta} <ChevronRight className="size-3 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Google Review URL config */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="size-4 text-yellow-500" />
          <span className="font-semibold text-sm">Link do Google Reviews</span>
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 h-9 rounded-lg border border-[color:var(--input)] bg-background px-3 text-sm"
            placeholder="https://g.page/r/SEU-LINK/review"
            value={googleReviewUrl}
            onChange={e => setGoogleReviewUrl(e.target.value)}
          />
          <Button size="sm" onClick={async () => {
            await (supabase as any).from("company").update({ google_review_url: googleReviewUrl }).eq("id", companyId);
            toast.success("Link salvo!");
          }}>Salvar</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Cole o link de avaliação do Google Meu Negócio para pedidos automáticos pós-job</p>
      </div>
    </div>
  );
}
