// Seed da conta-cliente "Imperial Landscaping Of Central Florida"
// Cria empresa + owner + agente + serviços + ~3 meses de dados realistas.
// Uso: OWNER_PWD='senha' bun scripts/seed-imperial.js
// Idempotente: se a empresa já existe, reaproveita; só semeia dados se ainda não houver.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OWNER_PWD = process.env.OWNER_PWD;
if (!url || !key) { console.error("Faltam SUPABASE_URL/SERVICE_ROLE_KEY"); process.exit(1); }
if (!OWNER_PWD) { console.error("Passe OWNER_PWD='...'"); process.exit(1); }
const a = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const NOW = Date.now();
const DAY = 86400000;
const iso = (daysAgo, hour = 10, min = 0) => {
  const d = new Date(NOW - daysAgo * DAY);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};
const pick = (arr, i) => arr[i % arr.length];

const COMPANY = {
  nome: "Imperial Landscaping Of Central Florida",
  slug: "imperial-landscaping",
  primary_color: "#C2A14D",
  telefone: "407-748-5404",
  email: "imperial_lawns@yahoo.com",
  username: "imperial",
};

// ── 1. Owner ───────────────────────────────────────
async function findUserId(email) {
  const { data: prof } = await a.from("profiles").select("user_id").eq("email", email).maybeSingle();
  if (prof?.user_id) return prof.user_id;
  for (let p = 1; p <= 20; p++) {
    const { data } = await a.auth.admin.listUsers({ page: p, perPage: 200 });
    const hit = (data?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
    if (!data?.users?.length || data.users.length < 200) break;
  }
  return null;
}

let ownerId = await findUserId(COMPANY.email);
if (ownerId) {
  await a.auth.admin.updateUserById(ownerId, { password: OWNER_PWD, email_confirm: true, user_metadata: { username: COMPANY.username } });
  console.log(`↻ owner ${COMPANY.email} atualizado`);
} else {
  const { data, error } = await a.auth.admin.createUser({ email: COMPANY.email, password: OWNER_PWD, email_confirm: true, user_metadata: { username: COMPANY.username } });
  if (error || !data.user) { console.error("Falha ao criar owner:", error?.message); process.exit(1); }
  ownerId = data.user.id;
  console.log(`✓ owner ${COMPANY.email} criado`);
}
{
  const { error } = await a.from("profiles").upsert({ user_id: ownerId, email: COMPANY.email, nome: "Ivan C", username: COMPANY.username, telefone: COMPANY.telefone }, { onConflict: "user_id" });
  if (error) await a.from("profiles").upsert({ user_id: ownerId, email: COMPANY.email, nome: "Ivan C" }, { onConflict: "user_id" });
}

// ── 2. Company ─────────────────────────────────────
let { data: company } = await a.from("company").select("id").eq("slug", COMPANY.slug).maybeSingle();
const companyPatch = {
  nome: COMPANY.nome, slug: COMPANY.slug, primary_color: COMPANY.primary_color,
  telefone: COMPANY.telefone, created_by: ownerId,
  status_cobranca: "ativo",
  nome_fantasia: COMPANY.nome, email_corporativo: COMPANY.email,
  cidade: "Orlando", estado: "FL", pais: "US", segmento: "landscaping",
  onboarding_completed: true, onboarding_step: 6,
  booking_enabled: true, booking_advance_days: 30,
  business_hours: { mon: { open: "07:00", close: "17:00" }, tue: { open: "07:00", close: "17:00" }, wed: { open: "07:00", close: "17:00" }, thu: { open: "07:00", close: "17:00" }, fri: { open: "07:00", close: "17:00" }, sat: { open: "08:00", close: "12:00" }, sun: null },
};
if (company) {
  await a.from("company").update(companyPatch).eq("id", company.id);
  console.log("↻ company atualizada");
} else {
  const { data, error } = await a.from("company").insert(companyPatch).select("id").single();
  if (error) { console.error("Falha company:", error.message); process.exit(1); }
  company = data;
  console.log("✓ company criada");
}
const companyId = company.id;
await a.from("company_user").upsert({ company_id: companyId, user_id: ownerId, role: "owner", ativo: true }, { onConflict: "company_id,user_id" });

// ── 3. Agent config (landscaping, US) ──────────────
await a.from("agent_config").upsert({
  company_id: companyId, user_id: ownerId,
  nome_empresa: COMPANY.nome, nome_agente: "Gus",
  papel_objetivo: "Qualify landscaping leads, ask about the project (lawn, design, lighting, turf, irrigation), give a price range, and book a free on-site estimate. Reply in the customer's language (EN/ES/PT).",
  estilo_comunicacao: "Friendly, knowledgeable and reliable. Emphasize free estimates, licensed & insured, and quality native + non-native planting.",
  sobre_empresa: "Imperial Landscaping of Central Florida — licensed and insured. Design and install, serving the Orlando / Central FL area. Specialty: blending native and non-native plants for beautiful, low-maintenance yards.",
  produtos_servicos: "Full landscape design, landscape installation, artificial turf & putting greens, low-voltage landscape lighting, summer kitchens, irrigation & French drains, consultations.",
}, { onConflict: "company_id" });
console.log("✓ agent_config");

// ── 4. Services ────────────────────────────────────
const SERVICES = [
  { name: "Full Design Service", description: "Custom outdoor design tailored to your aesthetic and lifestyle.", duration_minutes: 90, price: 450, featured: true },
  { name: "Free On-Site Estimate", description: "We visit your property, measure and give an accurate quote.", duration_minutes: 60, price: 0, featured: true },
  { name: "Landscape Installation", description: "Professional install of plants, sod and beds — right plant, right place.", duration_minutes: 240, price: 2500 },
  { name: "Artificial Turf / Putting Green", description: "Low-maintenance turf and putting greens for the whole family.", duration_minutes: 240, price: 3200 },
  { name: "Low-Voltage Landscape Lighting", description: "Illuminate your home with a beautiful nighttime view.", duration_minutes: 180, price: 1800 },
  { name: "Summer Kitchen", description: "Outdoor kitchen built with top vendors for a quality finish.", duration_minutes: 300, price: 8500 },
  { name: "Irrigation & French Drains", description: "New irrigation, repairs and French drains to stop flooding.", duration_minutes: 180, price: 1400 },
];
const { data: existingSvc } = await a.from("service").select("id").eq("company_id", companyId).limit(1);
let serviceIds = [];
if (!existingSvc || existingSvc.length === 0) {
  const rows = SERVICES.map((s) => ({ company_id: companyId, active: true, ...s }));
  const { data, error } = await a.from("service").insert(rows).select("id, name");
  if (error) console.error("service:", error.message);
  serviceIds = (data ?? []).map((s) => s.id);
  console.log(`✓ ${serviceIds.length} serviços`);
} else {
  const { data } = await a.from("service").select("id").eq("company_id", companyId);
  serviceIds = (data ?? []).map((s) => s.id);
  console.log("↻ serviços já existem");
}

// ── 5. CRM stages ──────────────────────────────────
const STAGES = [
  { nome: "New Lead", cor: "#60A5FA", tipo: "normal" },
  { nome: "Qualified", cor: "#FFB020", tipo: "normal" },
  { nome: "Estimate Sent", cor: "#A78BFA", tipo: "normal" },
  { nome: "Scheduled", cor: "#22B85F", tipo: "normal" },
  { nome: "Won", cor: "#0EFA71", tipo: "ganho" },
  { nome: "Lost", cor: "#FF5A5A", tipo: "perda" },
];
let { data: stageRows } = await a.from("crm_stage").select("id, nome, ordem").eq("company_id", companyId).order("ordem");
if (!stageRows || stageRows.length === 0) {
  const rows = STAGES.map((s, i) => ({ company_id: companyId, ordem: i, ...s }));
  const { data, error } = await a.from("crm_stage").insert(rows).select("id, nome, ordem");
  if (error) { console.error("crm_stage:", error.message); }
  stageRows = data ?? [];
  console.log(`✓ ${stageRows.length} etapas CRM`);
} else {
  console.log("↻ etapas CRM já existem");
}
const stageByName = Object.fromEntries((stageRows ?? []).map((s) => [s.nome, s.id]));

// ── 6. Dados de ~3 meses (só se ainda não houver) ──
const { data: hasCards } = await a.from("crm_cards").select("id").eq("company_id", companyId).limit(1);
if (hasCards && hasCards.length > 0) {
  console.log("↻ já há dados — pulando seed transacional");
  console.log("\nPronto.");
  process.exit(0);
}

const FIRST = ["Mike", "Jennifer", "Carlos", "Ashley", "David", "Maria", "Robert", "Linda", "James", "Patricia", "John", "Sandra", "William", "Karen", "Richard", "Nancy", "Joseph", "Lisa", "Thomas", "Betty", "Diego", "Emily", "Frank", "Sofia"];
const LAST = ["Johnson", "Williams", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis"];
const AREAS = ["Winter Park", "Lake Nona", "Windermere", "Oviedo", "Apopka", "Kissimmee", "Sanford", "Maitland", "Altamonte Springs", "Clermont", "Dr. Phillips", "Baldwin Park"];
const PROJECTS = [
  { svc: "Full Design Service", first: "Hi, I'd like to redesign my front yard. Can you help?", value: 6500 },
  { svc: "Artificial Turf / Putting Green", first: "Do you install artificial turf? My backyard never grows grass.", value: 4200 },
  { svc: "Low-Voltage Landscape Lighting", first: "Looking for landscape lighting for the front of the house.", value: 2100 },
  { svc: "Summer Kitchen", first: "Interested in an outdoor summer kitchen. What's the cost?", value: 12500 },
  { svc: "Landscape Installation", first: "Need new plants and sod installed in the backyard.", value: 3400 },
  { svc: "Irrigation & French Drains", first: "My yard floods when it rains. Do you do French drains?", value: 1900 },
  { svc: "Landscape Installation", first: "Can you do a full cleanup and replant the beds?", value: 2800 },
];

const AI_REPLIES = [
  "Hi {name}! Thanks for reaching out to Imperial Landscaping 🌿 We'd love to help with your {svc_l}. We serve the {area} area and we're licensed & insured. Could you tell me a bit more about the space?",
  "Great! For a project like that, we usually start with a FREE on-site estimate so we can measure and give you an accurate quote. What day this week works for you?",
  "Perfect 👍 I have you down. Our team will confirm the visit. Anything specific you'd like us to focus on?",
];

// distribui ~24 leads ao longo de 90 dias
const N = 24;
const cards = [];
const messages = [];
const appts = [];
const finance = [];
const quotes = [];

for (let i = 0; i < N; i++) {
  const nome = `${pick(FIRST, i)} ${pick(LAST, i * 3 + 1)}`;
  const numero = `1407555${String(1000 + i).slice(-4)}`;
  const area = pick(AREAS, i * 2);
  const proj = pick(PROJECTS, i);
  const daysAgo = Math.floor(((N - i) / N) * 88) + 1; // mais antigos primeiro
  // distribuição por etapa
  let stageName;
  const r = i % 10;
  if (r < 2) stageName = "New Lead";
  else if (r < 4) stageName = "Qualified";
  else if (r < 5) stageName = "Estimate Sent";
  else if (r < 6) stageName = "Scheduled";
  else if (r < 9) stageName = "Won";
  else stageName = "Lost";
  const stageId = stageByName[stageName];
  const won = stageName === "Won";
  const value = proj.value + (i % 5) * 250;

  cards.push({
    company_id: companyId, user_id: ownerId, owner_id: ownerId,
    numero, nome, status: stageName, stage_id: stageId,
    valor: won ? value : (stageName === "Lost" ? 0 : value),
    tags: [proj.svc.split(" ")[0]],
    ultima_mensagem: proj.first,
    ultima_em: iso(daysAgo, 9 + (i % 8)),
    observacao: `${proj.svc} — ${area}`,
    follow_up: (stageName === "Qualified" || stageName === "Estimate Sent") ? iso(-(2 + (i % 5)), 11) : null,
  });

  // conversa (para ~metade dos leads)
  if (i % 2 === 0) {
    const svc_l = proj.svc.toLowerCase();
    messages.push({ company_id: companyId, user_id: ownerId, numero, contato_nome: nome, direcao: "entrada", autor: "contato", texto: proj.first, created_at: iso(daysAgo, 9, 2) });
    messages.push({ company_id: companyId, user_id: ownerId, numero, contato_nome: nome, direcao: "saida", autor: "ia", texto: AI_REPLIES[0].replace("{name}", nome.split(" ")[0]).replace("{svc_l}", svc_l).replace("{area}", area), created_at: iso(daysAgo, 9, 3) });
    messages.push({ company_id: companyId, user_id: ownerId, numero, contato_nome: nome, direcao: "entrada", autor: "contato", texto: "Sure! It's about 800 sq ft. When can you come take a look?", created_at: iso(daysAgo, 9, 9) });
    messages.push({ company_id: companyId, user_id: ownerId, numero, contato_nome: nome, direcao: "saida", autor: "ia", texto: AI_REPLIES[1], created_at: iso(daysAgo, 9, 10) });
  }

  // agendamento para Scheduled/Won
  if (stageName === "Scheduled" || won) {
    const svcId = serviceIds[i % serviceIds.length] ?? null;
    const apptDaysAgo = won ? Math.max(1, daysAgo - 7) : -(3 + (i % 10)); // won no passado, scheduled no futuro
    const startISO = iso(apptDaysAgo, 8 + (i % 6));
    const endISO = new Date(new Date(startISO).getTime() + 3 * 3600000).toISOString();
    appts.push({
      company_id: companyId, titulo: proj.svc, inicio: startISO, fim: endISO,
      status: won ? "concluido" : "confirmado", source: i % 3 === 0 ? "online" : "interno",
      service_id: svcId, customer_name: nome, customer_phone: numero,
      address: `${100 + i} Oak St, ${area}, FL`, price: value, notes: proj.svc,
    });
    // financeiro: entrada quando concluído
    if (won) {
      finance.push({ company_id: companyId, type: "entrada", category: "Job", description: `${proj.svc} — ${nome}`, amount: value, date: iso(apptDaysAgo).slice(0, 10), status: "confirmado" });
    }
  }

  // orçamentos para Estimate Sent / Won
  if (stageName === "Estimate Sent" || won) {
    quotes.push({
      company_id: companyId, customer_name: nome, customer_phone: numero,
      items: [{ name: proj.svc, qty: 1, unit_price: value, total: value }], subtotal: value, discount: 0, total_amount: value,
      notes: `${proj.svc} — ${area}`, validity_days: 7,
      status: won ? "accepted" : "sent",
      sent_at: iso(daysAgo - 1, 14), accepted_at: won ? iso(Math.max(1, daysAgo - 4), 16) : null,
    });
  }
}

// despesas de materiais (algumas por mês)
for (let m = 0; m < 9; m++) {
  finance.push({ company_id: companyId, type: "saida", category: pick(["Materials", "Fuel", "Subcontractor", "Plants"], m), description: pick(["Mulch & soil", "Truck fuel", "Sod pallet", "Nursery plants", "Crew pay"], m), amount: 180 + (m % 5) * 90, date: iso(8 + m * 9).slice(0, 10), status: "confirmado" });
}

async function insertChunked(table, rows) {
  if (!rows.length) return;
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await a.from(table).insert(rows.slice(i, i + 200));
    if (error) { console.error(`${table}:`, error.message); break; }
  }
  console.log(`✓ ${rows.length} ${table}`);
}

await insertChunked("crm_cards", cards);
await insertChunked("mensagens", messages);
await insertChunked("agendamento", appts);
await insertChunked("financial_entry", finance);
try { await insertChunked("quote", quotes); } catch (e) { console.error("quote:", e.message); }

console.log(`\nPronto! Imperial Landscaping semeada.`);
console.log(`Login: ${COMPANY.email}  (ou usuário "${COMPANY.username}")`);
console.log(`Slug de agendamento: /book/${COMPANY.slug}`);
