// Create demo user + clone all Junior Barber data
const SUPABASE_URL = "https://dxvamljoffvbpruljiqa.supabase.co";
const SERVICE_KEY = "sb_secret_UhERg8ArZxl6Cx1_vvBW0Q_IExxK65s";
const ANON_KEY = "sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz";
const SOURCE_CID = "ecdd67c5-2972-40f4-a5d9-4598a5bdf69d"; // Junior Barber

const DEMO_EMAIL = "demojunior@ariia.app";
const DEMO_PASSWORD = "demojunior";

const adminH = { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };

async function main() {
  // 1. Create demo user (or find existing)
  let userId;
  const existing = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, { headers: adminH }).then(r => r.json());
  const found = existing.users?.find(u => u.email === DEMO_EMAIL);
  if (found) {
    userId = found.id;
    console.log("User já existe:", userId);
  } else {
    const created = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST", headers: adminH,
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD, email_confirm: true, user_metadata: { username: "demojunior" } })
    }).then(r => r.json());
    userId = created.id;
    console.log("User criado:", userId);
  }

  // Login as demo user to get authenticated token (respects RLS)
  const login = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { "apikey": ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
  }).then(r => r.json());
  const AT = login.access_token;
  const h = { "apikey": ANON_KEY, "Authorization": `Bearer ${AT}`, "Content-Type": "application/json", "Prefer": "return=representation" };

  // Use service key to READ source data (bypass RLS), authenticated to WRITE
  const srcGet = (path) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: adminH }).then(r => r.json());

  // 2. Delete any existing demo company for this user (clean slate)
  const oldCompanies = await srcGet(`company?created_by=eq.${userId}&select=id`);
  for (const c of (oldCompanies || [])) {
    await fetch(`${SUPABASE_URL}/rest/v1/company?id=eq.${c.id}`, { method: "DELETE", headers: adminH });
  }

  // 3. Read source company
  const srcCompany = (await srcGet(`company?id=eq.${SOURCE_CID}`))[0];

  // 4. Create demo company
  const demoCompany = await fetch(`${SUPABASE_URL}/rest/v1/company`, {
    method: "POST", headers: h,
    body: JSON.stringify({
      name: "Junior Barber (Demo)",
      nome_fantasia: "Junior Barber Demo",
      slug: "junior-barber-demo",
      telefone_comercial: srcCompany.telefone_comercial,
      whatsapp: srcCompany.whatsapp,
      primary_color: srcCompany.primary_color,
      endereco: srcCompany.endereco,
      plano: "premium",
      selected_plan_slug: "business",
      status_cobranca: "ativo",
      fidelidade_ativa: true,
      fidelidade_meta: 10,
      fidelidade_premio: "1 corte grátis",
      onboarding_concluido: true,
      onboarding_step: 5,
      created_by: userId,
    })
  }).then(r => r.json());
  const CID = Array.isArray(demoCompany) ? demoCompany[0].id : demoCompany.id;
  console.log("Demo company:", CID);

  // 5. Link user as owner
  await fetch(`${SUPABASE_URL}/rest/v1/company_user`, {
    method: "POST", headers: { ...h, "Prefer": "return=minimal" },
    body: JSON.stringify({ company_id: CID, user_id: userId, email: DEMO_EMAIL, nome: "Demo Junior", role: "owner" })
  });

  // 6. Clone categories (keep id mapping)
  const srcCats = await srcGet(`service_category?company_id=eq.${SOURCE_CID}`);
  const catMap = {};
  for (const c of srcCats) {
    const nc = await fetch(`${SUPABASE_URL}/rest/v1/service_category`, {
      method: "POST", headers: h,
      body: JSON.stringify({ company_id: CID, name: c.name, sort_order: c.sort_order, active: c.active })
    }).then(r => r.json());
    catMap[c.id] = Array.isArray(nc) ? nc[0].id : nc.id;
  }
  console.log(`${srcCats.length} categorias clonadas`);

  // 7. Clone services (map category)
  const srcServices = await srcGet(`service?company_id=eq.${SOURCE_CID}`);
  const svcMap = {};
  for (const s of srcServices) {
    const ns = await fetch(`${SUPABASE_URL}/rest/v1/service`, {
      method: "POST", headers: h,
      body: JSON.stringify({
        company_id: CID, category_id: s.category_id ? catMap[s.category_id] : null,
        name: s.name, price: s.price, duration_minutes: s.duration_minutes,
        active: s.active, featured: s.featured, description: s.description,
      })
    }).then(r => r.json());
    svcMap[s.id] = Array.isArray(ns) ? ns[0].id : ns.id;
  }
  console.log(`${srcServices.length} serviços clonados`);

  // 8. Clone professionals
  const srcPros = await srcGet(`professional?company_id=eq.${SOURCE_CID}`);
  const proMap = {};
  const proByName = {};
  for (const p of srcPros) {
    const np = await fetch(`${SUPABASE_URL}/rest/v1/professional`, {
      method: "POST", headers: h,
      body: JSON.stringify({
        company_id: CID, name: p.name, specialty: p.specialty,
        comissao_percentual: p.comissao_percentual, work_schedule: p.work_schedule, active: p.active,
      })
    }).then(r => r.json());
    proMap[p.id] = Array.isArray(np) ? np[0].id : np.id;
    proByName[p.name] = proMap[p.id];
  }
  console.log(`${srcPros.length} profissionais clonados`);

  // 9. Clone customers
  const srcCustomers = await srcGet(`customer?company_id=eq.${SOURCE_CID}`);
  const custMap = {};
  const custByName = {};
  for (const c of srcCustomers) {
    const nc = await fetch(`${SUPABASE_URL}/rest/v1/customer`, {
      method: "POST", headers: h,
      body: JSON.stringify({
        company_id: CID, name: c.name, phone: c.phone, email: c.email,
        status: c.status, fidelidade_contador: c.fidelidade_contador,
        total_appointments: c.total_appointments, last_appointment_at: c.last_appointment_at, notes: c.notes,
      })
    }).then(r => r.json());
    custMap[c.id] = Array.isArray(nc) ? nc[0].id : nc.id;
    custByName[c.name] = custMap[c.id];
  }
  console.log(`${srcCustomers.length} clientes clonados`);

  // 10. Clone club plans
  const srcClubs = await srcGet(`club_plan?company_id=eq.${SOURCE_CID}`);
  const clubMap = {};
  for (const cp of srcClubs) {
    const ncp = await fetch(`${SUPABASE_URL}/rest/v1/club_plan`, {
      method: "POST", headers: h,
      body: JSON.stringify({ company_id: CID, nome: cp.nome, preco_cents: cp.preco_cents, beneficios: cp.beneficios, ativo: cp.ativo })
    }).then(r => r.json());
    clubMap[cp.id] = Array.isArray(ncp) ? ncp[0].id : ncp.id;
  }
  console.log(`${srcClubs.length} planos de clube clonados`);

  // 11. Clone appointments (map pro/service/customer by id)
  const srcApts = await srcGet(`appointment?company_id=eq.${SOURCE_CID}`);
  let aptCount = 0;
  for (const a of srcApts) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/appointment`, {
      method: "POST", headers: { ...h, "Prefer": "return=minimal" },
      body: JSON.stringify({
        company_id: CID,
        professional_id: proMap[a.professional_id],
        service_id: svcMap[a.service_id],
        customer_id: a.customer_id ? custMap[a.customer_id] : null,
        scheduled_at: a.scheduled_at,
        customer_name: a.customer_name, customer_phone: a.customer_phone,
        professional_name: a.professional_name, service_name: a.service_name,
        price: a.price, status: a.status, source: a.source, branch: a.branch, notes: a.notes,
      })
    });
    if (res.ok) aptCount++;
  }
  console.log(`${aptCount} agendamentos clonados`);

  // 12. Clone financial entries
  const srcFin = await srcGet(`financial_entry?company_id=eq.${SOURCE_CID}`);
  let finCount = 0;
  for (const f of srcFin) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/financial_entry`, {
      method: "POST", headers: { ...h, "Prefer": "return=minimal" },
      body: JSON.stringify({
        company_id: CID, type: f.type, status: f.status, date: f.date,
        amount: f.amount, description: f.description, category: f.category, branch: f.branch,
      })
    });
    if (res.ok) finCount++;
  }
  console.log(`${finCount} lançamentos financeiros clonados`);

  // 13. Clone club members
  const srcMembers = await srcGet(`club_member?company_id=eq.${SOURCE_CID}`);
  let memberCount = 0;
  for (const m of srcMembers) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/club_member`, {
      method: "POST", headers: { ...h, "Prefer": "return=minimal" },
      body: JSON.stringify({
        company_id: CID, customer_id: custMap[m.customer_id], club_plan_id: clubMap[m.club_plan_id],
        status: m.status, current_period_end: m.current_period_end,
      })
    });
    if (res.ok) memberCount++;
  }
  console.log(`${memberCount} membros de clube clonados`);

  console.log(`\n=== DEMO CRIADA ===`);
  console.log(`Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Company: Junior Barber (Demo) — ${CID}`);
}

main().catch(console.error);
