import { createFileRoute } from "@tanstack/react-router";

// Dispara o relatório semanal por e-mail para todas as empresas.
// Chamar 1x por semana via cron externo:
//   GET /api/cron/weekly-reports?key=CRON_SECRET
async function run(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || request.headers.get("x-cron-key");
  const secret = process.env.CRON_SECRET;
  if (!secret || key !== secret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { sendWeeklyReportToCompany } = await import("@/lib/report.server");

  // Empresas ativas (não suspensas)
  const { data: companies } = await supabaseAdmin
    .from("company").select("id").neq("status_cobranca", "suspenso");

  let sent = 0, skipped = 0;
  for (const c of companies ?? []) {
    try {
      const r = await sendWeeklyReportToCompany(supabaseAdmin, (c as any).id);
      if (r.sent) sent++; else skipped++;
    } catch { skipped++; }
  }

  return new Response(JSON.stringify({ ok: true, sent, skipped, total: (companies ?? []).length }), {
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/cron/weekly-reports")({
  server: {
    handlers: {
      GET: async ({ request }) => run(request),
      POST: async ({ request }) => run(request),
    },
  },
});
