import { createServerFn } from "@tanstack/react-start";

/** Relatório semanal público (página /r/$slug). Arquivo separado, sem nada de auth,
 * para não vazar código de servidor no bundle do cliente. */
export const getWeeklyReport = createServerFn({ method: "POST" })
  .inputValidator((d: { slug: string }) => ({ slug: String(d.slug ?? "").trim().toLowerCase() }))
  .handler(async ({ data }) => {
    if (!data.slug) throw new Error("Empresa não encontrada");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: company } = await supabaseAdmin.from("company").select("id").eq("slug", data.slug).maybeSingle();
    if (!company) throw new Error("Empresa não encontrada");
    const { buildWeeklyReport } = await import("@/lib/report.server");
    const report = await buildWeeklyReport(supabaseAdmin, (company as any).id);
    if (!report) throw new Error("Não foi possível gerar o relatório");
    return report;
  });
