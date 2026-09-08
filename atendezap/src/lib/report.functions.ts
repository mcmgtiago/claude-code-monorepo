import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Envia o relatório semanal por e-mail agora (botão no app). */
export const sendWeeklyReportNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cu } = await supabaseAdmin
      .from("company_user").select("company_id").eq("user_id", context.userId).eq("ativo", true)
      .order("created_at", { ascending: true }).limit(1).maybeSingle();
    const companyId = (cu as any)?.company_id;
    if (!companyId) return { sent: false, reason: "sem empresa" };
    const { sendWeeklyReportToCompany } = await import("@/lib/report.server");
    return await sendWeeklyReportToCompany(supabaseAdmin, companyId);
  });
