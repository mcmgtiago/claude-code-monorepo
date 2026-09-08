import { createFileRoute } from "@tanstack/react-router";

// Agendador central do VeloHUB. Deve ser chamado periodicamente (a cada ~10 min).
// O próprio servidor (serve.js) bate aqui internamente; também aceita cron externo:
//   GET /api/cron/tick?key=CRON_SECRET
async function run(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || request.headers.get("x-cron-key");
  const secret = process.env.CRON_SECRET;
  if (!secret || key !== secret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const jobs: Record<string, any> = {};

  // Lembretes de agendamento (24h antes + ~2h antes)
  try {
    const { runAppointmentReminders } = await import("@/lib/reminders.server");
    jobs.reminders = await runAppointmentReminders(supabaseAdmin);
  } catch (e: any) {
    jobs.reminders = { error: e?.message || "falhou" };
  }

  // Speed-to-lead: cobra atendimento rápido de leads novos
  try {
    const { runSpeedToLead } = await import("@/lib/lead-nudges.server");
    jobs.speedToLead = await runSpeedToLead(supabaseAdmin);
  } catch (e: any) {
    jobs.speedToLead = { error: e?.message || "falhou" };
  }

  // Follow-up automático de leads frios
  try {
    const { runColdFollowup } = await import("@/lib/lead-nudges.server");
    jobs.coldFollowup = await runColdFollowup(supabaseAdmin);
  } catch (e: any) {
    jobs.coldFollowup = { error: e?.message || "falhou" };
  }

  // Recuperação de base: envia campanhas de reativação em lotes
  try {
    const { runReactivation } = await import("@/lib/reactivation.server");
    jobs.reactivation = await runReactivation(supabaseAdmin);
  } catch (e: any) {
    jobs.reactivation = { error: e?.message || "falhou" };
  }

  // Estratégias de crescimento: review pós-job, recorrência, win-back, resgate de orçamento
  try {
    const g = await import("@/lib/growth-engines.server");
    jobs.reviews = await g.runPostJobReviews(supabaseAdmin);
    jobs.recurring = await g.runRecurringReminders(supabaseAdmin);
    jobs.winback = await g.runWinback(supabaseAdmin);
    jobs.quoteRescue = await g.runQuoteRescue(supabaseAdmin);
  } catch (e: any) {
    jobs.growth = { error: e?.message || "falhou" };
  }

  return new Response(JSON.stringify({ ok: true, at: new Date().toISOString(), jobs }), {
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/cron/tick")({
  server: {
    handlers: {
      GET: async ({ request }) => run(request),
      POST: async ({ request }) => run(request),
    },
  },
});
