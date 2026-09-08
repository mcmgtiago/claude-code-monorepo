// Corrige as etapas do CRM da Imperial Landscaping e remapeia os cards.
// Uso: bun scripts/fix-imperial-stages.js
import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const a = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const STAGES = [
  { nome: "New Lead", cor: "#60A5FA", tipo: "normal", ordem: 0 },
  { nome: "Qualified", cor: "#FFB020", tipo: "normal", ordem: 1 },
  { nome: "Estimate Sent", cor: "#A78BFA", tipo: "normal", ordem: 2 },
  { nome: "Scheduled", cor: "#22B85F", tipo: "normal", ordem: 3 },
  { nome: "Won", cor: "#0EFA71", tipo: "ganho", ordem: 4 },
  { nome: "Lost", cor: "#FF5A5A", tipo: "perda", ordem: 5 },
];

const { data: company } = await a.from("company").select("id").eq("slug", "imperial-landscaping").maybeSingle();
if (!company) { console.error("Empresa não encontrada"); process.exit(1); }
const companyId = company.id;

const { data: existing } = await a.from("crm_stage").select("id, nome").eq("company_id", companyId);
const haveByName = Object.fromEntries((existing ?? []).map((s) => [s.nome, s.id]));

// Garante as 6 etapas em inglês
for (const s of STAGES) {
  if (haveByName[s.nome]) {
    await a.from("crm_stage").update({ cor: s.cor, tipo: s.tipo, ordem: s.ordem }).eq("id", haveByName[s.nome]);
  } else {
    const { data } = await a.from("crm_stage").insert({ company_id: companyId, ...s }).select("id").single();
    if (data) haveByName[s.nome] = data.id;
  }
}
console.log(`Etapas garantidas: ${STAGES.map((s) => s.nome).join(", ")}`);

// Remapeia cards pela etapa cujo nome == status (definido no seed)
const { data: cards } = await a.from("crm_cards").select("id, status, stage_id").eq("company_id", companyId);
let fixed = 0;
for (const c of cards ?? []) {
  const target = haveByName[c.status];
  if (target && c.stage_id !== target) {
    await a.from("crm_cards").update({ stage_id: target }).eq("id", c.id);
    fixed++;
  }
}
console.log(`Cards remapeados: ${fixed}/${(cards ?? []).length}`);

// Remove etapas padrão antigas (não estão no meu set e sem cards)
const myNames = new Set(STAGES.map((s) => s.nome));
const { data: allStages } = await a.from("crm_stage").select("id, nome").eq("company_id", companyId);
let removed = 0;
for (const s of allStages ?? []) {
  if (myNames.has(s.nome)) continue;
  const { data: used } = await a.from("crm_cards").select("id").eq("stage_id", s.id).limit(1);
  if (!used || used.length === 0) {
    await a.from("crm_stage").delete().eq("id", s.id);
    removed++;
  }
}
console.log(`Etapas padrão removidas: ${removed}`);
console.log("Pronto.");
