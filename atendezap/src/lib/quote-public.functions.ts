import { createServerFn } from "@tanstack/react-start";

/** Lê um orçamento para a página pública /q/$id (sem login). */
export const getPublicQuote = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => ({ id: String(d.id ?? "").trim() }))
  .handler(async ({ data }) => {
    if (!data.id) throw new Error("Orçamento não encontrado");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: q } = await supabaseAdmin
      .from("quote")
      .select("id, company_id, customer_name, items, subtotal, discount, total_amount, notes, validity_days, status, created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (!q) throw new Error("Orçamento não encontrado");

    const { data: company } = await supabaseAdmin
      .from("company")
      .select("nome, nome_fantasia, primary_color, logo_url, telefone, currency")
      .eq("id", (q as any).company_id)
      .maybeSingle();

    const items = Array.isArray((q as any).items) ? (q as any).items : [];
    return {
      quote: {
        id: (q as any).id,
        customerName: (q as any).customer_name ?? null,
        items: items.map((it: any) => {
          const qty = Number(it?.qty ?? 1);
          const unit = Number(it?.unit_price ?? it?.price ?? 0);
          return { name: it?.name ?? "", qty, unitPrice: unit, total: Number(it?.total ?? qty * unit) };
        }),
        subtotal: Number((q as any).subtotal ?? 0),
        discount: Number((q as any).discount ?? 0),
        total: Number((q as any).total_amount ?? 0),
        notes: (q as any).notes ?? null,
        validityDays: Number((q as any).validity_days ?? 7),
        status: (q as any).status ?? "sent",
        createdAt: (q as any).created_at,
      },
      company: {
        nome: (company as any)?.nome_fantasia || (company as any)?.nome || "VeloHUB",
        primaryColor: (company as any)?.primary_color || "#0efa71",
        logoUrl: (company as any)?.logo_url ?? null,
        telefone: (company as any)?.telefone ?? null,
        currency: (company as any)?.currency ?? "USD",
      },
    };
  });
