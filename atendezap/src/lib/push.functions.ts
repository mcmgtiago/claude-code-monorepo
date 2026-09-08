import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Envia uma notificação de teste para os dispositivos da empresa do usuário logado. */
export const sendTestNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Descobre a empresa ativa do usuário
    const { data: cu } = await supabaseAdmin
      .from("company_user")
      .select("company_id")
      .eq("user_id", context.userId)
      .eq("ativo", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const companyId = (cu as any)?.company_id;
    if (!companyId) return { sent: 0, stale: 0, reason: "sem empresa" };

    const { sendPushToCompany } = await import("@/lib/push.server");
    const res = await sendPushToCompany(companyId, {
      title: "VeloHUB ✅",
      body: "Notificações ativas! É assim que você vai saber de cada novo lead.",
      url: "/app/dashboard",
    });
    return res;
  });
