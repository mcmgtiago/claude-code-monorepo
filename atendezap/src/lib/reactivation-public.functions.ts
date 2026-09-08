import { createServerFn } from "@tanstack/react-start";

/** Opt-out público da campanha de reativação (link "Unsubscribe" no e-mail). Sem login. */
export const unsubscribeReactivation = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => ({ token: String(d.token ?? "").trim() }))
  .handler(async ({ data }) => {
    if (!data.token) throw new Error("Link inválido");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: contact } = await supabaseAdmin
      .from("reactivation_contact").select("id, company_id").eq("unsubscribe_token", data.token).maybeSingle();
    if (!contact) throw new Error("Link inválido ou expirado");

    await supabaseAdmin.from("reactivation_contact").update({ status: "unsubscribed", next_at: null }).eq("id", (contact as any).id);

    const { data: company } = await supabaseAdmin
      .from("company").select("nome, nome_fantasia, primary_color").eq("id", (contact as any).company_id).maybeSingle();
    return {
      ok: true,
      company: {
        nome: (company as any)?.nome_fantasia || (company as any)?.nome || "VeloHUB",
        accent: (company as any)?.primary_color || "#0efa71",
      },
    };
  });
