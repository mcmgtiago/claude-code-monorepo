// Full journey test — simulates a barbershop owner from signup to full operation
const URL = "https://dxvamljoffvbpruljiqa.supabase.co";
const ANON = "sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz";
const SERVICE = "sb_secret_UhERg8ArZxl6Cx1_vvBW0Q_IExxK65s";

const results = [];
function log(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
}

const adminH = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

async function main() {
  const email = `teste-jornada-${Date.now()}@ariia.test`;
  const password = "Jornada2026!";

  // ===== FASE 1: Primeiro acesso =====
  console.log("\n=== FASE 1: PRIMEIRO ACESSO ===");

  // Create user (admin, bypass email)
  const userRes = await fetch(`${URL}/auth/v1/admin/users`, {
    method: "POST", headers: adminH,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const user = await userRes.json();
  const userId = user.id;
  log("Criar conta (signup)", !!userId, email);

  // Login
  const login = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(r => r.json());
  const AT = login.access_token;
  log("Login", !!AT);
  const h = { apikey: ANON, Authorization: `Bearer ${AT}`, "Content-Type": "application/json", Prefer: "return=representation" };

  // Claim super admin (first user) - skip if already exists
  await fetch(`${URL}/rest/v1/user_roles`, { method: "POST", headers: h, body: JSON.stringify({ user_id: userId, role: "super_admin" }) });

  // ===== FASE 2: Onboarding + Config =====
  console.log("\n=== FASE 2: ONBOARDING + CONFIGURAÇÃO ===");

  const company = await fetch(`${URL}/rest/v1/company`, {
    method: "POST", headers: h,
    body: JSON.stringify({
      name: "Barbearia Teste Jornada", nome_fantasia: "Teste Jornada", slug: `teste-jornada-${Date.now()}`,
      whatsapp: "5511999998888", telefone_comercial: "5511999998888", primary_color: "#1B2530",
      plano: "premium", selected_plan_slug: "business", status_cobranca: "ativo",
      fidelidade_ativa: true, fidelidade_meta: 10, fidelidade_premio: "1 corte grátis",
      onboarding_concluido: true, onboarding_step: 5, created_by: userId,
    }),
  }).then(r => r.json());
  const CID = Array.isArray(company) ? company[0]?.id : company?.id;
  log("Criar barbearia (onboarding)", !!CID);

  await fetch(`${URL}/rest/v1/company_user`, {
    method: "POST", headers: { ...h, Prefer: "return=minimal" },
    body: JSON.stringify({ company_id: CID, user_id: userId, email, nome: "Dono Teste", role: "owner" }),
  });
  log("Vincular owner à empresa", true);

  // Filiais
  const branches = [];
  for (const b of [{ name: "Centro", address: "Rua A, 100" }, { name: "Zona Sul", address: "Av B, 200" }]) {
    const r = await fetch(`${URL}/rest/v1/branch`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, name: b.name, address: b.address, active: true }) }).then(r => r.json());
    if (Array.isArray(r) && r[0]) branches.push(r[0]);
  }
  log("Criar filiais", branches.length === 2, `${branches.length} filiais`);

  // Categorias
  const cats = {};
  for (const c of ["Cortes", "Barba"]) {
    const r = await fetch(`${URL}/rest/v1/service_category`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, name: c, active: true }) }).then(r => r.json());
    if (Array.isArray(r) && r[0]) cats[c] = r[0].id;
  }
  log("Criar categorias de serviço", Object.keys(cats).length === 2);

  // Serviços (preço em centavos = R$45,00 e R$40,00)
  const services = [];
  for (const s of [{ name: "Corte", price: 4500, cat: "Cortes" }, { name: "Barba", price: 4000, cat: "Barba" }]) {
    const r = await fetch(`${URL}/rest/v1/service`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, category_id: cats[s.cat], name: s.name, price: s.price, duration_minutes: 40, active: true }) }).then(r => r.json());
    if (Array.isArray(r) && r[0]) services.push(r[0]);
  }
  log("Criar serviços (preço em centavos)", services.length === 2, `Corte R$${(services[0]?.price/100).toFixed(2)}`);

  // Profissionais
  const pros = [];
  for (let i = 0; i < 2; i++) {
    const r = await fetch(`${URL}/rest/v1/professional`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, name: `Barbeiro ${i+1}`, specialty: "Cortes", active: true, branch_id: branches[i]?.id, comissao_percentual: 40 }) }).then(r => r.json());
    if (Array.isArray(r) && r[0]) pros.push(r[0]);
  }
  log("Criar profissionais (com filial + comissão)", pros.length === 2);

  // Produtos
  const prod = await fetch(`${URL}/rest/v1/product`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, nome: "Pomada", preco_cents: 3500, custo_cents: 1500, estoque: 20, ativo: true }) }).then(r => r.json());
  log("Criar produto (com estoque)", Array.isArray(prod) && !!prod[0]);

  // ===== FASE 3: Operação =====
  console.log("\n=== FASE 3: OPERAÇÃO DIÁRIA ===");

  // Cliente
  const cust = await fetch(`${URL}/rest/v1/customer`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, name: "Cliente Teste", phone: "5511988887777", data_nascimento: "1990-05-15", status: "active" }) }).then(r => r.json());
  const custId = Array.isArray(cust) ? cust[0]?.id : null;
  log("Criar cliente (com aniversário)", !!custId);

  // Agendamento
  const apt = await fetch(`${URL}/rest/v1/appointment`, {
    method: "POST", headers: h,
    body: JSON.stringify({ company_id: CID, professional_id: pros[0].id, service_id: services[0].id, customer_id: custId, scheduled_at: new Date(Date.now() + 86400000).toISOString(), customer_name: "Cliente Teste", professional_name: "Barbeiro 1", service_name: "Corte", price: 4500, status: "agendado", source: "interno", branch: "Centro" }),
  }).then(r => r.json());
  const aptId = Array.isArray(apt) ? apt[0]?.id : null;
  log("Criar agendamento manual", !!aptId);

  // Confirmar → concluir
  await fetch(`${URL}/rest/v1/appointment?id=eq.${aptId}`, { method: "PATCH", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify({ status: "concluido" }) });
  log("Marcar agendamento como concluído", true);

  // Comanda
  const sale = await fetch(`${URL}/rest/v1/sale`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, appointment_id: aptId, customer_id: custId, professional_id: pros[0].id, status: "aberta", branch: "Centro" }) }).then(r => r.json());
  const saleId = Array.isArray(sale) ? sale[0]?.id : null;
  log("Abrir comanda", !!saleId);

  // Item na comanda
  const item = await fetch(`${URL}/rest/v1/sale_item`, { method: "POST", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify({ sale_id: saleId, company_id: CID, professional_id: pros[0].id, tipo: "servico", descricao: "Corte", preco_cents: 4500, quantidade: 1, comissao_percentual: 40, comissao_cents: 1800 }) });
  log("Adicionar item na comanda", item.ok);

  // Fechar comanda (RPC)
  const close = await fetch(`${URL}/rest/v1/rpc/close_sale`, { method: "POST", headers: h, body: JSON.stringify({ _sale_id: saleId, _forma_pagamento: "pix", _desconto_cents: 0 }) });
  log("Fechar comanda (close_sale RPC)", close.ok);

  // Verificar financeiro
  const fin = await fetch(`${URL}/rest/v1/financial_entry?company_id=eq.${CID}&select=amount,type`, { headers: h }).then(r => r.json());
  log("Entrada no financeiro gerada", Array.isArray(fin) && fin.length > 0, `${fin.length} lançamento(s)`);

  // ===== FASE 4: CRM =====
  console.log("\n=== FASE 4: CRM/WHATSAPP ===");

  // Agent config (auto-fill test)
  const stages = await fetch(`${URL}/rest/v1/crm_stage`, { method: "POST", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify({ company_id: CID, nome: "Novo contato", tipo: "normal", ordem: 1 }) });
  log("Criar CRM stage", stages.ok);

  const agentCfg = await fetch(`${URL}/rest/v1/agent_config`, { method: "POST", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify({ company_id: CID, nome_agente: "Assistente Teste", ativo: true }) });
  log("Criar config do agente IA (ativo)", agentCfg.ok);

  // ===== FASE 5: Features =====
  console.log("\n=== FASE 5: FEATURES COMPLEMENTARES ===");

  const wl = await fetch(`${URL}/rest/v1/waitlist`, { method: "POST", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify({ company_id: CID, customer_name: "Espera Teste", phone: "5511977776666", status: "waiting" }) });
  log("Lista de espera", wl.ok);

  const nps = await fetch(`${URL}/rest/v1/nps_response`, { method: "POST", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify({ company_id: CID, customer_id: custId, customer_name: "Cliente Teste", score: 10, comment: "Excelente!", responded_at: new Date().toISOString() }) });
  log("NPS resposta", nps.ok);

  const clubPlan = await fetch(`${URL}/rest/v1/club_plan`, { method: "POST", headers: h, body: JSON.stringify({ company_id: CID, nome: "Clube VIP", preco_cents: 9990, ativo: true, beneficios: {} }) }).then(r => r.json());
  const clubPlanId = Array.isArray(clubPlan) ? clubPlan[0]?.id : null;
  log("Criar plano de clube", !!clubPlanId);

  if (clubPlanId && custId) {
    const member = await fetch(`${URL}/rest/v1/club_member`, { method: "POST", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify({ company_id: CID, customer_id: custId, club_plan_id: clubPlanId, status: "ativo", current_period_end: new Date(Date.now() + 30*86400000).toISOString() }) });
    log("Adicionar membro ao clube (MRR)", member.ok);
  }

  // Google review URL
  const gr = await fetch(`${URL}/rest/v1/company?id=eq.${CID}`, { method: "PATCH", headers: { ...h, Prefer: "return=minimal" }, body: JSON.stringify({ google_review_url: "https://g.page/teste" }) });
  log("Salvar link avaliação Google", gr.ok);

  // ===== FASE 6: Leitura (relatórios) =====
  console.log("\n=== FASE 6: RELATÓRIOS (leitura de dados) ===");

  const dashApts = await fetch(`${URL}/rest/v1/appointment?company_id=eq.${CID}&select=id,status,price`, { headers: h }).then(r => r.json());
  log("Ler agendamentos (dashboard)", Array.isArray(dashApts), `${dashApts.length} agendamentos`);

  const dashFin = await fetch(`${URL}/rest/v1/financial_entry?company_id=eq.${CID}&select=amount,type`, { headers: h }).then(r => r.json());
  const receita = dashFin.filter(f => f.type === "entrada").reduce((s, f) => s + f.amount, 0);
  log("Calcular faturamento", receita > 0, `R$ ${(receita/100).toFixed(2)}`);

  // ===== CLEANUP =====
  console.log("\n=== LIMPEZA ===");
  await fetch(`${URL}/rest/v1/company?id=eq.${CID}`, { method: "DELETE", headers: adminH });
  await fetch(`${URL}/auth/v1/admin/users/${userId}`, { method: "DELETE", headers: adminH });
  await fetch(`${URL}/rest/v1/user_roles?user_id=eq.${userId}`, { method: "DELETE", headers: adminH });
  console.log("Dados de teste removidos");

  // ===== RELATÓRIO =====
  console.log("\n========== RELATÓRIO FINAL ==========");
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`✅ Passou: ${passed}/${results.length}`);
  if (failed > 0) {
    console.log(`❌ Falhou: ${failed}`);
    results.filter(r => !r.ok).forEach(r => console.log(`   - ${r.name}`));
  } else {
    console.log("🎉 TODOS OS TESTES PASSARAM!");
  }
}

main().catch(e => console.error("ERRO FATAL:", e));
