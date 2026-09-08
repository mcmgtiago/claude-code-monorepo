// Reconfigure Junior Barber with correct data
// 3 filiais, profissionais por filial, serviços corretos, planos clube

const SUPABASE_URL = "https://dxvamljoffvbpruljiqa.supabase.co";
const SERVICE_KEY = "sb_secret_UhERg8ArZxl6Cx1_vvBW0Q_IExxK65s";
const ANON_KEY = "sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz";
const CID = "ecdd67c5-2972-40f4-a5d9-4598a5bdf69d";

async function main() {
  // Login
  const login = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "apikey": ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "mcmgtiagoonline@gmail.com", password: "Barber2026!" })
  }).then(r => r.json());
  const AT = login.access_token;
  if (!AT) { console.error("Login failed", login); return; }
  console.log("Logged in");

  const headers = {
    "apikey": ANON_KEY,
    "Authorization": `Bearer ${AT}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };

  // Delete old data (service_category, service, professional, club_plan, customer)
  console.log("Limpando dados antigos...");
  for (const table of ["club_member", "club_plan", "appointment", "sale_item", "sale", "financial_entry", "professional_service", "service", "service_category", "professional", "customer"]) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?company_id=eq.${CID}`, {
      method: "DELETE", headers: { ...headers, "Prefer": "return=minimal" }
    });
  }
  console.log("Dados antigos limpos");

  // Update company info
  await fetch(`${SUPABASE_URL}/rest/v1/company?id=eq.${CID}`, {
    method: "PATCH", headers,
    body: JSON.stringify({
      name: "Junior Barber",
      nome_fantasia: "Junior Barber",
      slug: "junior-barber",
      telefone_comercial: "5541999999999",
      whatsapp: "5541999999999",
      primary_color: "#1B1B1B",
      fidelidade_ativa: true,
      fidelidade_meta: 10,
      fidelidade_premio: "1 corte grátis",
      endereco: JSON.stringify({
        filiais: [
          { nome: "Portão Velho", rua: "Imbuia, 663" },
          { nome: "Centro", rua: "Rua Cuiabá, 231" },
          { nome: "Ceará", rua: "Ceará, 1045" }
        ]
      })
    })
  });
  console.log("Company atualizada");

  // Professionals por filial
  const professionals = [
    // Portão Velho
    { name: "Samuel Jackson", specialty: "Cortes e Barba", work_schedule: { filial: "Portão Velho" } },
    { name: "Matheus Lirio", specialty: "Cortes e Barba", work_schedule: { filial: "Portão Velho" } },
    // Centro
    { name: "Matheus Lirio", specialty: "Cortes e Barba", work_schedule: { filial: "Centro" } },
    { name: "Junior Cardoso", specialty: "Cortes e Barba", work_schedule: { filial: "Centro" } },
    { name: "Douglas Chaves", specialty: "Cortes e Barba", work_schedule: { filial: "Centro" } },
    { name: "Aislan Garcia", specialty: "Cortes e Barba", work_schedule: { filial: "Centro" } },
    // Ceará
    { name: "Justin Cardoso", specialty: "Cortes e Barba", work_schedule: { filial: "Ceará" } },
    { name: "Junior Cardoso", specialty: "Cortes e Barba", work_schedule: { filial: "Ceará" } },
  ];

  console.log("Criando profissionais...");
  for (const p of professionals) {
    await fetch(`${SUPABASE_URL}/rest/v1/professional`, {
      method: "POST", headers,
      body: JSON.stringify({ company_id: CID, name: p.name, specialty: p.specialty, active: true, work_schedule: p.work_schedule })
    });
  }
  console.log(`${professionals.length} profissionais criados`);

  // Service categories
  const categories = [
    { name: "Cortes", sort_order: 1 },
    { name: "Barba", sort_order: 2 },
    { name: "Tratamentos", sort_order: 3 },
    { name: "Combos", sort_order: 4 },
    { name: "Depilacao", sort_order: 5 },
    { name: "Coloracao", sort_order: 6 },
  ];

  console.log("Criando categorias...");
  const catIds = {};
  for (const c of categories) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/service_category`, {
      method: "POST", headers,
      body: JSON.stringify({ company_id: CID, name: c.name, sort_order: c.sort_order, active: true })
    }).then(r => r.json());
    catIds[c.name] = Array.isArray(res) ? res[0]?.id : res?.id;
  }
  console.log("Categorias criadas:", Object.keys(catIds).join(", "));

  // Services (preços em centavos)
  const services = [
    // Cortes
    { cat: "Cortes", name: "Corte", price: 4500, duration_minutes: 40, featured: true },
    { cat: "Cortes", name: "Corte de seg. a quarta", price: 4000, duration_minutes: 40 },
    { cat: "Cortes", name: "Corte kids (ate 5 anos)", price: 4000, duration_minutes: 30 },
    { cat: "Cortes", name: "Corte clube", price: 4500, duration_minutes: 40 },
    { cat: "Cortes", name: "Primeiro corte", price: 2500, duration_minutes: 30 },
    { cat: "Cortes", name: "Raspar na maquina", price: 2500, duration_minutes: 20 },
    // Barba
    { cat: "Barba", name: "Barba", price: 4000, duration_minutes: 30, featured: true },
    { cat: "Barba", name: "Barba clube", price: 0, duration_minutes: 30 },
    { cat: "Barba", name: "Alinhamento de barba", price: 1500, duration_minutes: 15 },
    { cat: "Barba", name: "Bigode", price: 1500, duration_minutes: 10 },
    { cat: "Barba", name: "Pigmentacao de Barba", price: 3000, duration_minutes: 30, featured: true },
    // Tratamentos
    { cat: "Tratamentos", name: "Selagem", price: 6000, duration_minutes: 60 },
    { cat: "Tratamentos", name: "Selagem so no topete/franja", price: 2000, duration_minutes: 30 },
    { cat: "Tratamentos", name: "Hidratacao", price: 2000, duration_minutes: 30 },
    { cat: "Tratamentos", name: "Limpeza de pele premium", price: 6000, duration_minutes: 45 },
    { cat: "Tratamentos", name: "Mascara preta no nariz", price: 2000, duration_minutes: 15 },
    { cat: "Tratamentos", name: "Pigmentacao", price: 4000, duration_minutes: 40 },
    // Combos
    { cat: "Combos", name: "Raspar maquina e barba", price: 5500, duration_minutes: 50 },
    { cat: "Combos", name: "Combo 2 cortes", price: 8000, duration_minutes: 80 },
    { cat: "Combos", name: "Combo 2 (corte e barba)", price: 14000, duration_minutes: 70, featured: true },
    // Depilacao
    { cat: "Depilacao", name: "Sobrancelhas", price: 1500, duration_minutes: 10 },
    { cat: "Depilacao", name: "Depilacao orelhas", price: 1500, duration_minutes: 10 },
    { cat: "Depilacao", name: "Depilacao de nariz", price: 1500, duration_minutes: 10 },
    { cat: "Depilacao", name: "Pezinho (Acabamento)", price: 1000, duration_minutes: 10 },
    // Coloracao
    { cat: "Coloracao", name: "Platinados", price: 16000, duration_minutes: 90, featured: true },
    { cat: "Coloracao", name: "Luzes/Reflexos", price: 13000, duration_minutes: 90 },
  ];

  console.log("Criando servicos...");
  let svcCount = 0;
  for (const s of services) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/service`, {
      method: "POST", headers,
      body: JSON.stringify({
        company_id: CID,
        category_id: catIds[s.cat] || null,
        name: s.name,
        price: s.price,
        duration_minutes: s.duration_minutes,
        featured: s.featured || false,
        active: true
      })
    });
    if (res.ok) svcCount++;
    else console.error(`Falhou: ${s.name}`, await res.text());
  }
  console.log(`${svcCount}/${services.length} servicos criados`);

  // Club plans (preços em centavos)
  const clubPlans = [
    { nome: "Corte e Barba VIP", preco_cents: 15990, beneficios: { servicos: ["Corte ilimitado", "Barba ilimitada", "Prioridade no agendamento", "Desconto em produtos"], destaque: false } },
    { nome: "Corte e Barba Senior", preco_cents: 13490, beneficios: { servicos: ["Corte ilimitado", "Barba ilimitada"], maisVendido: true } },
    { nome: "Corte e Barba Unico Mensal", preco_cents: 6000, beneficios: { servicos: ["1 corte por mes", "1 barba por mes"] } },
    { nome: "Corte Clube VIP", preco_cents: 9990, beneficios: { servicos: ["Corte ilimitado", "Prioridade no agendamento", "Desconto em produtos"] } },
    { nome: "Corte Clube Senior", preco_cents: 7490, beneficios: { servicos: ["Corte ilimitado"] } },
    { nome: "Corte Unico Mensal", preco_cents: 3000, beneficios: { servicos: ["1 corte por mes"] } },
    { nome: "Barba Clube", preco_cents: 8490, beneficios: { servicos: ["Barba ilimitada"] } },
    { nome: "Raspar na Maquina e Barba VIP", preco_cents: 14490, beneficios: { servicos: ["Raspar ilimitado", "Barba ilimitada", "Prioridade"] } },
    { nome: "Raspar na Maquina e Barba Senior", preco_cents: 12490, beneficios: { servicos: ["Raspar ilimitado", "Barba ilimitada"] } },
    { nome: "Pai e Filho Corte Unico", preco_cents: 6000, beneficios: { servicos: ["1 corte adulto", "1 corte kids"], vagas: 100 } },
  ];

  console.log("Criando planos do clube...");
  let clubCount = 0;
  for (const c of clubPlans) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/club_plan`, {
      method: "POST", headers,
      body: JSON.stringify({ company_id: CID, nome: c.nome, preco_cents: c.preco_cents, ativo: true, beneficios: c.beneficios })
    });
    if (res.ok) clubCount++;
    else console.error(`Falhou clube: ${c.nome}`, await res.text());
  }
  console.log(`${clubCount}/${clubPlans.length} planos do clube criados`);

  // Sample customers
  const customers = [
    { name: "Junior Cardoso", phone: "5541999001122" },
    { name: "Carlos Silva", phone: "5541988776655" },
    { name: "Pedro Santos", phone: "5541977665544" },
    { name: "Lucas Oliveira", phone: "5541966554433" },
    { name: "Rafael Costa", phone: "5541955443322" },
    { name: "Marcos Souza", phone: "5541944332211" },
    { name: "Felipe Lima", phone: "5541933221100" },
    { name: "Bruno Pereira", phone: "5541922110099" },
  ];

  console.log("Criando clientes...");
  let custCount = 0;
  for (const c of customers) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/customer`, {
      method: "POST", headers,
      body: JSON.stringify({ company_id: CID, name: c.name, phone: c.phone, status: "active" })
    });
    if (res.ok) custCount++;
  }
  console.log(`${custCount}/${customers.length} clientes criados`);

  console.log("\n=== JUNIOR BARBER CONFIGURADA ===");
  console.log("3 filiais: Portao Velho, Centro, Ceara");
  console.log(`${professionals.length} profissionais`);
  console.log(`${svcCount} servicos`);
  console.log(`${clubCount} planos clube`);
  console.log(`${custCount} clientes`);
}

main().catch(console.error);
