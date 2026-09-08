// Comprehensive test suite — tests everything end-to-end
const SUPA = "https://dxvamljoffvbpruljiqa.supabase.co";
const ANON = "sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz";
const SK = "sb_secret_UhERg8ArZxl6Cx1_vvBW0Q_IExxK65s";
const APP = "http://localhost:9200";
const CID = "3bc3516c-628c-4fdc-8065-8ee4d717fb3c"; // demo company

let pass = 0, fail = 0;
function t(name, ok, detail = "") {
  if (ok) { pass++; console.log(`✅ ${name}${detail ? " — " + detail : ""}`); }
  else { fail++; console.log(`❌ ${name}${detail ? " — " + detail : ""}`); }
}

const adminH = { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json" };

async function main() {
  // Login as demo user
  const login = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demojunior@ariia.app", password: "demojunior" }),
  }).then(r => r.json());
  const AT = login.access_token;
  t("Login demo user", !!AT);
  const h = { apikey: ANON, Authorization: `Bearer ${AT}`, "Content-Type": "application/json", Prefer: "return=representation" };

  // ======= ROUTE TESTS =======
  console.log("\n=== ROTAS (HTTP status) ===");
  const routes = [
    "/", "/entrar", "/app/dashboard", "/app/agenda", "/app/clientes", "/app/servicos",
    "/app/produtos", "/app/profissionais", "/app/filiais", "/app/comandas", "/app/financeiro",
    "/app/relatorios", "/app/relatorio-executivo", "/app/aigrowth", "/app/clube",
    "/app/lembretes", "/app/aniversariantes", "/app/lista-espera", "/app/nps",
    "/app/reativacao", "/app/avaliacoes", "/app/conexao", "/app/conversas", "/app/crm",
    "/app/agente", "/app/equipe", "/app/configuracoes", "/app/onboarding", "/app/checkout",
    "/master/painel", "/master/planos", "/barbeiro", "/cliente",
    "/agendar/junior-barber-demo", "/nps/fake-token-test",
  ];
  for (const r of routes) {
    const code = await fetch(`${APP}${r}`, { redirect: "manual" }).then(r => r.status).catch(() => 0);
    const ok = code === 200 || code === 307 || code === 302;
    t(`${r}`, ok, `HTTP ${code}`);
  }

  // ======= CRUD TESTS =======
  console.log("\n=== CRUD OPERATIONS ===");

  // Customer with birthday
  const cust = await fetch(`${SUPA}/rest/v1/customer`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, name: "Test QA", phone: "5511900000001", data_nascimento: "1995-03-15", email: "qa@test.com", status: "active" }) }).then(r => r.json());
  const custId = Array.isArray(cust) ? cust[0]?.id : null;
  t("Customer CREATE (with birthday+email)", !!custId);

  // Customer UPDATE
  if (custId) {
    const up = await fetch(`${SUPA}/rest/v1/customer?id=eq.${custId}`, { method: "PATCH", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify({ fidelidade_contador: 5 }) });
    t("Customer UPDATE (fidelidade)", up.ok);
  }

  // Service with correct price
  const svc = await fetch(`${SUPA}/rest/v1/service`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, name: "QA Corte", price: 5500, duration_minutes: 35, active: true }) }).then(r => r.json());
  const svcId = Array.isArray(svc) ? svc[0]?.id : null;
  t("Service CREATE (price 5500 = R$55)", !!svcId);

  // Verify price stored correctly
  if (svcId) {
    const check = await fetch(`${SUPA}/rest/v1/service?id=eq.${svcId}&select=price`, { headers: h }).then(r => r.json());
    t("Service price stored as centavos", check[0]?.price === 5500);
  }

  // Branch
  const branch = await fetch(`${SUPA}/rest/v1/branch`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, name: "QA Filial", address: "Rua QA, 123", active: true }) }).then(r => r.json());
  t("Branch CREATE", Array.isArray(branch) && !!branch[0]?.id);

  // Professional with branch
  const pro = await fetch(`${SUPA}/rest/v1/professional`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, name: "QA Barbeiro", specialty: "Testes", active: true, branch_id: branch[0]?.id, comissao_percentual: 35 }) }).then(r => r.json());
  const proId = Array.isArray(pro) ? pro[0]?.id : null;
  t("Professional CREATE (with branch + comissao)", !!proId);

  // Appointment
  const apt = await fetch(`${SUPA}/rest/v1/appointment`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, professional_id: proId, service_id: svcId, customer_id: custId, scheduled_at: new Date(Date.now() + 3600000).toISOString(), customer_name: "Test QA", professional_name: "QA Barbeiro", service_name: "QA Corte", price: 5500, status: "agendado", source: "interno", branch: "QA Filial" }) }).then(r => r.json());
  const aptId = Array.isArray(apt) ? apt[0]?.id : null;
  t("Appointment CREATE (with branch)", !!aptId);

  // Sale + close_sale RPC
  const sale = await fetch(`${SUPA}/rest/v1/sale`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, appointment_id: aptId, customer_id: custId, professional_id: proId, status: "aberta", branch: "QA Filial" }) }).then(r => r.json());
  const saleId = Array.isArray(sale) ? sale[0]?.id : null;
  t("Sale CREATE (comanda)", !!saleId);

  if (saleId) {
    await fetch(`${SUPA}/rest/v1/sale_item`, { method: "POST", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify({ sale_id: saleId, company_id: CID, professional_id: proId, tipo: "servico", descricao: "QA Corte", preco_cents: 5500, quantidade: 1, comissao_percentual: 35, comissao_cents: 1925 }) });
    const close = await fetch(`${SUPA}/rest/v1/rpc/close_sale`, { method: "POST", headers: h, body: JSON.stringify({ _sale_id: saleId, _forma_pagamento: "pix", _desconto_cents: 0 }) });
    t("close_sale RPC (pix)", close.ok);

    // Verify financial entry created
    const fin = await fetch(`${SUPA}/rest/v1/financial_entry?company_id=eq.${CID}&description=like.*QA*&select=amount,type`, { headers: h }).then(r => r.json());
    t("Financial entry auto-created", Array.isArray(fin) && fin.some(f => f.amount === 5500));
  }

  // ======= CRM/WHATSAPP TESTS =======
  console.log("\n=== CRM/WHATSAPP ===");

  // CRM stages
  const stages = await fetch(`${SUPA}/rest/v1/crm_stage?company_id=eq.${CID}&select=nome`, { headers: h }).then(r => r.json());
  t("CRM stages exist", Array.isArray(stages) && stages.length >= 1, `${stages.length} stages`);

  // Agent config (auto-filled)
  const agCfg = await fetch(`${SUPA}/rest/v1/agent_config?company_id=eq.${CID}&select=ativo,nome_agente`, { headers: h }).then(r => r.json());
  t("Agent config exists with ativo", Array.isArray(agCfg) && agCfg.length > 0);

  // Mensagens (from real WhatsApp test earlier)
  const msgs = await fetch(`${SUPA}/rest/v1/mensagens?company_id=eq.${CID}&select=id,direcao,autor&limit=5`, { headers: h }).then(r => r.json());
  t("Mensagens in DB", Array.isArray(msgs) && msgs.length > 0, `${msgs.length} mensagens`);

  // CRM cards
  const cards = await fetch(`${SUPA}/rest/v1/crm_cards?company_id=eq.${CID}&select=id,numero,nome,status`, { headers: h }).then(r => r.json());
  t("CRM cards exist", Array.isArray(cards) && cards.length > 0, `${cards.length} cards`);

  // WhatsApp instance
  const inst = await fetch(`${SUPA}/rest/v1/whatsapp_instances?company_id=eq.${CID}&select=status,session_name`, { headers: h }).then(r => r.json());
  t("WhatsApp instance", Array.isArray(inst) && inst.length > 0, inst[0]?.status);

  // ======= FEATURES TESTS =======
  console.log("\n=== FEATURES ===");

  // Waitlist
  const wl = await fetch(`${SUPA}/rest/v1/waitlist?company_id=eq.${CID}&select=id,customer_name,status`, { headers: h }).then(r => r.json());
  t("Waitlist entries", Array.isArray(wl) && wl.length > 0, `${wl.length} na fila`);

  // NPS
  const nps = await fetch(`${SUPA}/rest/v1/nps_response?company_id=eq.${CID}&select=score,customer_name`, { headers: h }).then(r => r.json());
  t("NPS responses", Array.isArray(nps) && nps.length > 0, `${nps.length} respostas`);

  // Club plan + members
  const club = await fetch(`${SUPA}/rest/v1/club_plan?company_id=eq.${CID}&select=nome,preco_cents`, { headers: h }).then(r => r.json());
  t("Club plans", Array.isArray(club) && club.length > 0, `${club.length} planos`);
  const members = await fetch(`${SUPA}/rest/v1/club_member?company_id=eq.${CID}&select=status`, { headers: h }).then(r => r.json());
  t("Club members (MRR)", Array.isArray(members) && members.length > 0, `${members.length} membros`);

  // Branches
  const branches = await fetch(`${SUPA}/rest/v1/branch?company_id=eq.${CID}&select=name`, { headers: h }).then(r => r.json());
  t("Branches/filiais", Array.isArray(branches) && branches.length > 0, `${branches.length} filiais`);

  // Birthday customers
  const bdays = await fetch(`${SUPA}/rest/v1/customer?company_id=eq.${CID}&data_nascimento=not.is.null&select=name,data_nascimento`, { headers: h }).then(r => r.json());
  t("Customers with birthday", Array.isArray(bdays) && bdays.length > 0, `${bdays.length} com aniversário`);

  // ======= FORMAT/LOGIC TESTS =======
  console.log("\n=== LÓGICA ===");

  // formatCents
  const fmtCents = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n / 100);
  t("formatCents(5500) = R$ 55,00", fmtCents(5500).includes("55,00"));
  t("formatCents(9990) = R$ 99,90", fmtCents(9990).includes("99,90"));

  // parseAiOutput
  function parseAiOutput(raw) {
    let text = raw || "", stage = null, agendar = null;
    const agMatch = text.match(/\[\s*AGENDAR\s*:\s*([^\]]+)\]/i);
    if (agMatch) { const p = agMatch[1].split("|").map(s => s.trim()); agendar = { inicio: p[0], servico: p[1] || "", nome: p[2] || "" }; text = text.replace(agMatch[0], "").trim(); }
    const stageMatch = text.match(/\[\s*ESTAGIO\s*:\s*([^\]]+)\]/i);
    if (stageMatch) { stage = stageMatch[1].trim(); text = text.replace(stageMatch[0], "").trim(); }
    return { parts: text.split("|||").map(p => p.trim()).filter(Boolean), stage, agendar };
  }
  const r1 = parseAiOutput("Oi! Tenho vaga às 14h e 16h. Qual prefere? [ESTAGIO: Interessado]");
  t("AI parser: extracts stage", r1.stage === "Interessado");
  const r2 = parseAiOutput("Agendado! [AGENDAR: 2026-08-28T14:00:00-03:00 | Corte | Maria] [ESTAGIO: Agendado]");
  t("AI parser: extracts booking", r2.agendar?.nome === "Maria" && r2.agendar?.servico === "Corte");
  t("AI parser: clean text without markers", !r2.parts[0]?.includes("[ESTAGIO"));

  // ======= PWA/PUBLIC TESTS =======
  console.log("\n=== PWA & PÚBLICO ===");

  // Cliente portal — search by phone
  const clienteSearch = await fetch(`${SUPA}/rest/v1/customer?phone=like.*999001122*&select=id,name`, { headers: h }).then(r => r.json());
  t("Cliente portal: find by phone", Array.isArray(clienteSearch) && clienteSearch.length > 0);

  // Booking page (public, no auth)
  const bookingCode = await fetch(`${APP}/agendar/junior-barber-demo`).then(r => r.status);
  t("Booking page loads (anon)", bookingCode === 200);

  // NPS page (public)
  const npsCode = await fetch(`${APP}/nps/fake-token`).then(r => r.status);
  t("NPS page loads (anon)", npsCode === 200);

  // ======= CLEANUP =======
  if (custId) await fetch(`${SUPA}/rest/v1/customer?id=eq.${custId}`, { method: "DELETE", headers: adminH });
  if (svcId) await fetch(`${SUPA}/rest/v1/service?id=eq.${svcId}`, { method: "DELETE", headers: adminH });
  if (proId) await fetch(`${SUPA}/rest/v1/professional?id=eq.${proId}`, { method: "DELETE", headers: adminH });
  if (branch?.[0]?.id) await fetch(`${SUPA}/rest/v1/branch?id=eq.${branch[0].id}`, { method: "DELETE", headers: adminH });

  // ======= REPORT =======
  console.log(`\n${"=".repeat(40)}`);
  console.log(`RESULTADO FINAL: ${pass} passou, ${fail} falhou (total ${pass + fail})`);
  if (fail === 0) console.log("🎉 TODOS OS TESTES PASSARAM!");
  else console.log(`⚠️ ${fail} teste(s) falharam — verificar.`);
}

main().catch(e => console.error("ERRO FATAL:", e));
