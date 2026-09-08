// Full system test — tests every module CRUD operation
const SUPABASE_URL = "https://dxvamljoffvbpruljiqa.supabase.co";
const ANON_KEY = "sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz";
const CID = "ecdd67c5-2972-40f4-a5d9-4598a5bdf69d";

async function main() {
  const login = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "apikey": ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "mcmgtiagoonline@gmail.com", password: "Barber2026!" })
  }).then(r => r.json());

  if (!login.access_token) { console.error("LOGIN FAILED", login); return; }
  const AT = login.access_token;
  const h = { "apikey": ANON_KEY, "Authorization": `Bearer ${AT}`, "Content-Type": "application/json", "Prefer": "return=representation" };

  const results = [];

  async function test(name, method, path, body) {
    const opts = { method, headers: h };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
    const data = await res.text();
    const ok = res.ok;
    results.push({ name, ok, status: res.status, error: ok ? null : data.slice(0, 200) });
    if (!ok) console.error(`❌ ${name}: ${data.slice(0, 150)}`);
    else console.log(`✅ ${name}`);
    try { return JSON.parse(data); } catch { return null; }
  }

  // === CUSTOMER ===
  const cust = await test("Customer INSERT", "POST", "customer", { company_id: CID, name: "Test Client", phone: "51900000000" });
  const custId = Array.isArray(cust) ? cust[0]?.id : cust?.id;
  if (custId) {
    await test("Customer UPDATE", "PATCH", `customer?id=eq.${custId}`, { notes: "VIP" });
    await test("Customer SELECT", "GET", `customer?id=eq.${custId}`);
  }

  // === PROFESSIONAL ===
  const prof = await test("Professional INSERT", "POST", "professional", { company_id: CID, name: "Test Pro", specialty: "Barba", active: true, work_schedule: { filial: "Centro" } });
  const profId = Array.isArray(prof) ? prof[0]?.id : prof?.id;
  if (profId) {
    await test("Professional UPDATE", "PATCH", `professional?id=eq.${profId}`, { comissao_percentual: 30 });
  }

  // === SERVICE CATEGORY ===
  const cat = await test("ServiceCategory INSERT", "POST", "service_category", { company_id: CID, name: "Test Cat", sort_order: 99 });
  const catId = Array.isArray(cat) ? cat[0]?.id : cat?.id;

  // === SERVICE ===
  const svc = await test("Service INSERT", "POST", "service", { company_id: CID, name: "Test Service", price: 5000, duration_minutes: 30, category_id: catId, active: true });
  const svcId = Array.isArray(svc) ? svc[0]?.id : svc?.id;
  if (svcId) {
    await test("Service UPDATE", "PATCH", `service?id=eq.${svcId}`, { price: 6000, featured: true });
  }

  // === PROFESSIONAL_SERVICE ===
  if (profId && svcId) {
    await test("ProfessionalService INSERT", "POST", "professional_service", { professional_id: profId, service_id: svcId, comissao_percentual: 25 });
  }

  // === APPOINTMENT ===
  const apt = await test("Appointment INSERT", "POST", "appointment", {
    company_id: CID, professional_id: profId, service_id: svcId,
    scheduled_at: "2026-08-28T10:00:00Z", customer_name: "Test Client", professional_name: "Test Pro",
    service_name: "Test Service", price: 5000, customer_id: custId, branch: "Centro"
  });
  const aptId = Array.isArray(apt) ? apt[0]?.id : apt?.id;
  if (aptId) {
    await test("Appointment UPDATE status", "PATCH", `appointment?id=eq.${aptId}`, { status: "confirmado" });
    await test("Appointment GET by token", "GET", `appointment?id=eq.${aptId}&select=confirm_token`);
  }

  // === SALE (Comanda) ===
  const sale = await test("Sale INSERT", "POST", "sale", { company_id: CID, professional_id: profId, customer_id: custId, status: "aberta", branch: "Centro" });
  const saleId = Array.isArray(sale) ? sale[0]?.id : sale?.id;
  if (saleId) {
    // Sale item
    await test("SaleItem INSERT", "POST", "sale_item", {
      sale_id: saleId, company_id: CID, professional_id: profId,
      tipo: "servico", descricao: "Test Service", preco_cents: 5000, quantidade: 1,
      comissao_percentual: 30, comissao_cents: 1500
    });
    // Close sale via RPC
    const closeRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/close_sale`, {
      method: "POST", headers: h,
      body: JSON.stringify({ _sale_id: saleId, _forma_pagamento: "pix", _desconto_cents: 0 })
    });
    const closeData = await closeRes.text();
    results.push({ name: "RPC close_sale", ok: closeRes.ok, status: closeRes.status, error: closeRes.ok ? null : closeData.slice(0, 200) });
    if (closeRes.ok) console.log("✅ RPC close_sale");
    else console.error("❌ RPC close_sale:", closeData.slice(0, 150));
  }

  // === PRODUCT ===
  const prod = await test("Product INSERT", "POST", "product", { company_id: CID, nome: "Pomada", preco_cents: 3500, custo_cents: 1500, estoque: 10 });
  const prodId = Array.isArray(prod) ? prod[0]?.id : prod?.id;

  // === CLUB PLAN ===
  await test("ClubPlan SELECT", "GET", `club_plan?company_id=eq.${CID}&limit=1`);

  // === CLUB MEMBER ===
  const plans = await test("ClubPlan GET for member", "GET", `club_plan?company_id=eq.${CID}&limit=1`);
  const planId = Array.isArray(plans) ? plans[0]?.id : null;
  if (planId && custId) {
    const member = await test("ClubMember INSERT", "POST", "club_member", {
      company_id: CID, customer_id: custId, club_plan_id: planId, status: "ativo"
    });
  }

  // === FINANCIAL ENTRY ===
  await test("FinancialEntry INSERT", "POST", "financial_entry", {
    company_id: CID, type: "entrada", status: "confirmado", date: "2026-08-26", amount: 5000, description: "Test entry", category: "servico", branch: "Centro"
  });

  // === USER_ROLES ===
  await test("UserRoles SELECT", "GET", `user_roles?limit=1`);

  // === APP_CONFIG ===
  await test("AppConfig SELECT", "GET", `app_config?limit=1`);

  // === PLAN ===
  await test("Plan SELECT", "GET", `plan?limit=3`);

  // === RPC: is_super_admin ===
  const saRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_super_admin`, { method: "POST", headers: h, body: "{}" });
  console.log(saRes.ok ? "✅ RPC is_super_admin" : "❌ RPC is_super_admin: " + await saRes.text());

  // === RPC: has_company_access ===
  const hcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_company_access`, { method: "POST", headers: h, body: JSON.stringify({ _company_id: CID }) });
  console.log(hcRes.ok ? "✅ RPC has_company_access" : "❌ RPC has_company_access: " + await hcRes.text());

  // === RPC: get_busy_slots ===
  if (profId) {
    const bsRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_busy_slots`, { method: "POST", headers: h, body: JSON.stringify({ _company_id: CID, _professional_id: profId, _date: "2026-08-28" }) });
    console.log(bsRes.ok ? "✅ RPC get_busy_slots" : "❌ RPC get_busy_slots: " + await bsRes.text());
  }

  // === CLEANUP test data ===
  if (custId) await fetch(`${SUPABASE_URL}/rest/v1/customer?id=eq.${custId}`, { method: "DELETE", headers: { ...h, "Prefer": "return=minimal" } });
  if (profId) await fetch(`${SUPABASE_URL}/rest/v1/professional?id=eq.${profId}`, { method: "DELETE", headers: { ...h, "Prefer": "return=minimal" } });
  if (catId) await fetch(`${SUPABASE_URL}/rest/v1/service_category?id=eq.${catId}`, { method: "DELETE", headers: { ...h, "Prefer": "return=minimal" } });
  if (svcId) await fetch(`${SUPABASE_URL}/rest/v1/service?id=eq.${svcId}`, { method: "DELETE", headers: { ...h, "Prefer": "return=minimal" } });
  if (prodId) await fetch(`${SUPABASE_URL}/rest/v1/product?id=eq.${prodId}`, { method: "DELETE", headers: { ...h, "Prefer": "return=minimal" } });

  // === SUMMARY ===
  console.log("\n========== SUMMARY ==========");
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  if (failed > 0) {
    console.log("\nFailed operations:");
    results.filter(r => !r.ok).forEach(r => console.log(`  - ${r.name}: ${r.error?.slice(0, 100)}`));
  }
}

main().catch(console.error);
