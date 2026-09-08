// Garante que o relatório SEMANAL do Imperial fique forte (demo).
// Uso: bun scripts/seed-imperial-week.js
import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const a = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: company } = await a.from("company").select("id").eq("slug", "imperial-landscaping").maybeSingle();
if (!company) { console.error("Empresa não encontrada"); process.exit(1); }
const cid = company.id;
const DAY = 86400000;
const ago = (d, h = 10) => { const x = new Date(Date.now() - d * DAY); x.setHours(h, 0, 0, 0); return x.toISOString(); };

// 1. Leads da semana: distribui ultima_em de alguns cards nos últimos 6 dias (e alguns na semana anterior p/ delta)
const { data: cards } = await a.from("crm_cards").select("id").eq("company_id", cid).limit(20);
let i = 0;
for (const c of cards ?? []) {
  let d;
  if (i < 9) d = (i % 6) + 1;            // 9 leads esta semana
  else if (i < 15) d = 8 + (i % 6);      // 6 na semana anterior (delta +50%)
  else { i++; continue; }
  await a.from("crm_cards").update({ ultima_em: ago(d, 9 + (i % 8)) }).eq("id", c.id);
  i++;
}
console.log("✓ leads da semana distribuídos");

// 2. Mensagens desta semana
const FIRST = ["Mike", "Jen", "Carlos", "Ashley", "Dave", "Maria", "Rob", "Linda", "Sofia", "Frank", "Emily", "Diego"];
const msgs = [];
for (let k = 0; k < 16; k++) {
  const d = (k % 6) + 1;
  const num = `1407556${String(2000 + k).slice(-4)}`;
  msgs.push({ company_id: cid, user_id: null, numero: num, contato_nome: `${FIRST[k % FIRST.length]} L.`, direcao: k % 2 ? "saida" : "entrada", autor: k % 2 ? "ia" : "contato", texto: k % 2 ? "Thanks! We can do a free estimate this week 🌿" : "Hi, do you do landscape lighting?", created_at: ago(d, 8 + (k % 9)) });
}
// fallback: user_id null pode violar NOT NULL; tenta, se falhar usa o owner
let { error: mErr } = await a.from("mensagens").insert(msgs);
if (mErr) {
  const { data: owner } = await a.from("company_user").select("user_id").eq("company_id", cid).eq("role", "owner").maybeSingle();
  if (owner) { msgs.forEach(m => m.user_id = owner.user_id); await a.from("mensagens").insert(msgs); }
}
console.log("✓ mensagens da semana");

// 3. Orçamentos: marca alguns como enviados/aceitos nesta semana
const { data: quotes } = await a.from("quote").select("id, total_amount").eq("company_id", cid).limit(6);
let qi = 0;
for (const q of quotes ?? []) {
  if (qi < 4) await a.from("quote").update({ status: "sent", sent_at: ago((qi % 5) + 1, 14) }).eq("id", q.id);
  if (qi < 2) await a.from("quote").update({ status: "accepted", accepted_at: ago(qi + 1, 16) }).eq("id", q.id);
  qi++;
}
console.log("✓ orçamentos da semana (enviados/fechados)");

// 4. Agendamentos desta semana
const appts = [];
for (let k = 0; k < 3; k++) {
  const start = ago(k + 1, 9 + k);
  appts.push({ company_id: cid, titulo: ["Free on-site estimate", "Landscape lighting install", "Sod & planting"][k], inicio: start, fim: new Date(new Date(start).getTime() + 3 * 3600000).toISOString(), status: k === 0 ? "concluido" : "confirmado", source: "online", customer_name: `${FIRST[k]} R.`, customer_phone: `1407556${3000 + k}`, address: `${200 + k} Palm Ave, Orlando, FL`, price: [0, 2200, 3400][k] });
}
await a.from("agendamento").insert(appts);
console.log("✓ agendamentos da semana");

// 5. Financeiro desta semana (receita ~$14k) e semana anterior (~$11k p/ delta +27%)
const fin = [];
const thisWeek = [4800, 3600, 5200]; // ~$13.6k
thisWeek.forEach((amt, k) => fin.push({ company_id: cid, type: "entrada", category: "Job", description: ["Landscape install — Winter Park", "Lighting package — Dr. Phillips", "Paver patio — Oviedo"][k], amount: amt, date: ago((k % 5) + 1).slice(0, 10), status: "confirmado" }));
fin.push({ company_id: cid, type: "saida", category: "Materials", description: "Plantas e pavers", amount: 2600, date: ago(2).slice(0, 10), status: "confirmado" });
fin.push({ company_id: cid, type: "saida", category: "Crew payroll", description: "Equipe", amount: 2400, date: ago(3).slice(0, 10), status: "confirmado" });
const lastWeek = [5200, 3300, 2200]; // ~$10.7k
lastWeek.forEach((amt, k) => fin.push({ company_id: cid, type: "entrada", category: "Job", description: ["Sod install", "Irrigation repair", "Tree trimming"][k], amount: amt, date: ago(9 + k).slice(0, 10), status: "confirmado" }));
await a.from("financial_entry").insert(fin);
console.log("✓ financeiro da semana + semana anterior (delta)");

console.log("\nPronto. Relatório semanal do Imperial reforçado para demo.");
