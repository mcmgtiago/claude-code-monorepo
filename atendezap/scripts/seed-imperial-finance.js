// Reforça a operação demo da Imperial: 6 meses de financeiro robusto
// (faturamento $42k–$53k/mês, lucro ~$25–32k/mês) + e-mail do responsável
// como contato da empresa + valores de jobs ganhos mais realistas.
// Uso: bun scripts/seed-imperial-finance.js
import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const a = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: company } = await a.from("company").select("id").eq("slug", "imperial-landscaping").maybeSingle();
if (!company) { console.error("Empresa não encontrada"); process.exit(1); }
const companyId = company.id;

// 1. E-mail do Tiago como contato da empresa (não muda o login do cliente)
await a.from("company").update({ email_corporativo: "mcmgtiago@gmail.com" }).eq("id", companyId);
console.log("✓ email_corporativo = mcmgtiago@gmail.com");

// 2. Refaz o financeiro (remove o antigo pequeno)
await a.from("financial_entry").delete().eq("company_id", companyId);

const NOW = new Date();
const monthDate = (monthsAgo, day) => {
  const d = new Date(NOW.getFullYear(), NOW.getMonth() - monthsAgo, Math.min(day, 27));
  return d.toISOString().slice(0, 10);
};
const rnd = (min, max) => Math.round((min + Math.random() * (max - min)) / 50) * 50;

// Jobs (entradas) realistas de landscaping design/install na Flórida
const JOB_TYPES = [
  "Full landscape design & install", "Paver patio & walkway", "Landscape lighting package",
  "Artificial turf install", "Irrigation system + French drains", "Sod & tropical planting",
  "Retaining wall & hardscape", "Outdoor summer kitchen", "Palm & tree install", "Front yard remodel",
];
const AREAS = ["Winter Park", "Lake Nona", "Windermere", "Dr. Phillips", "Baldwin Park", "Oviedo", "Celebration", "Clermont"];
const EXPENSES = [
  { cat: "Crew payroll", desc: "Pagamento da equipe" },
  { cat: "Materials", desc: "Plantas, mulch e solo (nursery)" },
  { cat: "Materials", desc: "Pavers e pedras (hardscape)" },
  { cat: "Fuel", desc: "Combustível dos caminhões" },
  { cat: "Equipment", desc: "Aluguel/manutenção de equipamento" },
  { cat: "Subcontractor", desc: "Subcontratado (elétrica/irrigação)" },
];

// Faturamento alvo por mês (mais recente -> mais antigo)
const REVENUE = [52000, 47500, 50000, 44000, 49000, 42500];

const entries = [];
REVENUE.forEach((rev, m) => {
  // Entradas: divide o faturamento em 6–8 jobs
  const nJobs = 6 + (m % 3);
  let remaining = rev;
  for (let j = 0; j < nJobs; j++) {
    const last = j === nJobs - 1;
    const amount = last ? remaining : Math.min(remaining - (nJobs - j - 1) * 1500, rnd(2500, 12000));
    remaining -= amount;
    entries.push({
      company_id: companyId, type: "entrada", category: "Job",
      description: `${JOB_TYPES[(m * 3 + j) % JOB_TYPES.length]} — ${AREAS[(m + j) % AREAS.length]}`,
      amount, date: monthDate(m, 2 + j * 3), status: "confirmado",
    });
  }
  // Saídas: ~38–42% do faturamento
  const expTotal = Math.round(rev * (0.38 + (m % 3) * 0.015));
  const nExp = EXPENSES.length;
  let remExp = expTotal;
  EXPENSES.forEach((e, i) => {
    const last = i === nExp - 1;
    // payroll pesa mais
    const weight = e.cat === "Crew payroll" ? 0.45 : (e.cat === "Materials" ? 0.18 : 0.1);
    const amount = last ? remExp : Math.round(expTotal * weight);
    remExp -= amount;
    entries.push({
      company_id: companyId, type: "saida", category: e.cat, description: e.desc,
      amount: Math.max(amount, 0), date: monthDate(m, 4 + i * 3), status: "confirmado",
    });
  });
});

for (let i = 0; i < entries.length; i += 200) {
  const { error } = await a.from("financial_entry").insert(entries.slice(i, i + 200));
  if (error) { console.error("financial_entry:", error.message); break; }
}
const totalRev = entries.filter((e) => e.type === "entrada").reduce((s, e) => s + e.amount, 0);
const totalExp = entries.filter((e) => e.type === "saida").reduce((s, e) => s + e.amount, 0);
console.log(`✓ ${entries.length} lançamentos — receita 6m $${totalRev.toLocaleString()} · despesa $${totalExp.toLocaleString()} · lucro $${(totalRev - totalExp).toLocaleString()}`);
console.log(`  média/mês: receita $${Math.round(totalRev / 6).toLocaleString()} · lucro $${Math.round((totalRev - totalExp) / 6).toLocaleString()}`);

// 3. Valores de jobs ganhos mais realistas (dashboard "receita ganhos")
const { data: stages } = await a.from("crm_stage").select("id, nome, tipo").eq("company_id", companyId);
const wonStage = (stages ?? []).find((s) => s.tipo === "ganho" || s.nome === "Won");
if (wonStage) {
  const { data: wonCards } = await a.from("crm_cards").select("id").eq("company_id", companyId).eq("stage_id", wonStage.id);
  let i = 0;
  for (const c of wonCards ?? []) {
    const val = rnd(4500, 18000);
    await a.from("crm_cards").update({ valor: val }).eq("id", c.id);
    i++;
  }
  console.log(`✓ ${i} jobs ganhos com valores atualizados`);
}

console.log("\nPronto. Operação Imperial reforçada.");
