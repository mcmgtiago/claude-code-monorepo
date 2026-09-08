// Corrige o formato dos itens dos orçamentos da Imperial Landscaping.
// items [{name, qty, price}] -> [{name, qty, unit_price, total}]
// Uso: bun scripts/fix-imperial-quotes.js
import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const a = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: company } = await a.from("company").select("id").eq("slug", "imperial-landscaping").maybeSingle();
if (!company) { console.error("Empresa não encontrada"); process.exit(1); }

const { data: quotes } = await a.from("quote").select("id, items").eq("company_id", company.id);
let fixed = 0;
for (const q of quotes ?? []) {
  const items = Array.isArray(q.items) ? q.items : [];
  const needs = items.some((it) => it && (it.unit_price == null || it.total == null));
  if (!needs) continue;
  const newItems = items.map((it) => {
    const qty = Number(it.qty ?? 1);
    const unit = Number(it.unit_price ?? it.price ?? 0);
    return { name: it.name ?? "", qty, unit_price: unit, total: Number(it.total ?? qty * unit) };
  });
  await a.from("quote").update({ items: newItems }).eq("id", q.id);
  fixed++;
}
console.log(`Orçamentos corrigidos: ${fixed}/${(quotes ?? []).length}`);
