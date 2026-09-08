// Seed Cashbarber - creates all services and professionals
const SUPABASE_URL = "https://dxvamljoffvbpruljiqa.supabase.co";
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
  console.log("Logged in");

  const headers = {
    "apikey": ANON_KEY,
    "Authorization": `Bearer ${AT}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };

  // Get categories
  const cats = await fetch(`${SUPABASE_URL}/rest/v1/service_category?company_id=eq.${CID}&order=sort_order`, { headers }).then(r => r.json());
  const catMap = {};
  cats.forEach(c => catMap[c.name] = c.id);
  console.log("Categories:", Object.keys(catMap).join(", "));

  // Create services one by one
  const services = [
    { cat: "Cortes", name: "Corte", price: 4500, duration_minutes: 40, featured: true },
    { cat: "Cortes", name: "Corte de seg. a quarta", price: 4000, duration_minutes: 40 },
    { cat: "Cortes", name: "Corte kids (ate 5 anos)", price: 4000, duration_minutes: 30 },
    { cat: "Cortes", name: "Corte clube", price: 4500, duration_minutes: 40 },
    { cat: "Cortes", name: "Primeiro corte", price: 2500, duration_minutes: 30 },
    { cat: "Cortes", name: "Raspar na maquina", price: 2500, duration_minutes: 20 },
    { cat: "Barba", name: "Barba", price: 4000, duration_minutes: 30, featured: true },
    { cat: "Barba", name: "Barba clube", price: 0, duration_minutes: 30 },
    { cat: "Barba", name: "Alinhamento de barba", price: 1500, duration_minutes: 15 },
    { cat: "Barba", name: "Bigode", price: 1500, duration_minutes: 10 },
    { cat: "Barba", name: "Pigmentacao de Barba", price: 3000, duration_minutes: 30, featured: true },
    { cat: "Tratamentos", name: "Selagem", price: 6000, duration_minutes: 60 },
    { cat: "Tratamentos", name: "Selagem so no topete/franja", price: 2000, duration_minutes: 30 },
    { cat: "Tratamentos", name: "Hidratacao", price: 2000, duration_minutes: 30 },
    { cat: "Tratamentos", name: "Limpeza de pele premium", price: 6000, duration_minutes: 45 },
    { cat: "Tratamentos", name: "Mascara preta no nariz", price: 2000, duration_minutes: 15 },
    { cat: "Tratamentos", name: "Pigmentacao", price: 4000, duration_minutes: 40 },
    { cat: "Combos", name: "Raspar maquina e barba", price: 5500, duration_minutes: 50 },
    { cat: "Combos", name: "Combo 2 cortes", price: 8000, duration_minutes: 80 },
    { cat: "Combos", name: "Combo 2 (corte e barba)", price: 14000, duration_minutes: 70, featured: true },
    { cat: "Depilacao", name: "Sobrancelhas", price: 1500, duration_minutes: 10 },
    { cat: "Depilacao", name: "Depilacao orelhas", price: 1500, duration_minutes: 10 },
    { cat: "Depilacao", name: "Depilacao de nariz", price: 1500, duration_minutes: 10 },
    { cat: "Depilacao", name: "Pezinho (Acabamento)", price: 1000, duration_minutes: 10 },
    { cat: "Coloracao", name: "Platinados", price: 16000, duration_minutes: 90, featured: true },
    { cat: "Coloracao", name: "Luzes/Reflexos", price: 13000, duration_minutes: 90 },
  ];

  let created = 0;
  for (const s of services) {
    const body = {
      company_id: CID,
      category_id: catMap[s.cat] || null,
      name: s.name,
      price: s.price,
      duration_minutes: s.duration_minutes,
      featured: s.featured || false,
    };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/service`, {
      method: "POST", headers, body: JSON.stringify(body)
    });
    if (res.ok) created++;
    else console.error(`Failed: ${s.name}`, await res.text());
  }
  console.log(`Services created: ${created}/${services.length}`);

  // Create professionals
  const pros = [
    { name: "Samuel Jackson", specialty: "Cortes e Barba" },
    { name: "Matheus Lirio", specialty: "Cortes e Barba" },
    { name: "Junior Cardoso", specialty: "Cortes e Barba" },
    { name: "Justin Cardoso", specialty: "Cortes e Barba" },
    { name: "Douglas Chaves", specialty: "Cortes e Barba" },
    { name: "Aislan Garcia", specialty: "Cortes e Barba" },
  ];

  let proCreated = 0;
  for (const p of pros) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/professional`, {
      method: "POST", headers,
      body: JSON.stringify({ company_id: CID, name: p.name, specialty: p.specialty, active: true })
    });
    if (res.ok) proCreated++;
    else console.error(`Failed pro: ${p.name}`, await res.text());
  }
  console.log(`Professionals created: ${proCreated}/${pros.length}`);

  // Create club plans
  const clubs = [
    { nome: "Corte e Barba VIP", preco_cents: 15990 },
    { nome: "Corte e Barba Senior", preco_cents: 13490 },
    { nome: "Corte e Barba Unico Mensal", preco_cents: 6000 },
    { nome: "Corte Clube VIP", preco_cents: 9990 },
    { nome: "Corte Clube Senior", preco_cents: 7490 },
    { nome: "Corte Unico Mensal", preco_cents: 3000 },
    { nome: "Barba Clube", preco_cents: 8490 },
    { nome: "Raspar na Maquina e Barba VIP", preco_cents: 14490 },
    { nome: "Raspar na Maquina e Barba Senior", preco_cents: 12490 },
    { nome: "Pai e Filho Corte Unico", preco_cents: 6000 },
  ];

  let clubCreated = 0;
  for (const c of clubs) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/club_plan`, {
      method: "POST", headers,
      body: JSON.stringify({ company_id: CID, nome: c.nome, preco_cents: c.preco_cents, ativo: true, beneficios: {} })
    });
    if (res.ok) clubCreated++;
    else console.error(`Failed club: ${c.nome}`, await res.text());
  }
  console.log(`Club plans created: ${clubCreated}/${clubs.length}`);

  // Create some customers
  const customers = [
    { name: "Junior Cardoso", phone: "51999001122" },
    { name: "Carlos Silva", phone: "51988776655" },
    { name: "Pedro Santos", phone: "51977665544" },
    { name: "Lucas Oliveira", phone: "51966554433" },
    { name: "Rafael Costa", phone: "51955443322" },
  ];

  let custCreated = 0;
  for (const c of customers) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/customer`, {
      method: "POST", headers,
      body: JSON.stringify({ company_id: CID, name: c.name, phone: c.phone })
    });
    if (res.ok) custCreated++;
  }
  console.log(`Customers created: ${custCreated}/${customers.length}`);

  console.log("\n=== CASHBARBER PRONTA ===");
  console.log("Login: mcmgtiagoonline@gmail.com / Barber2026!");
  console.log("Company ID:", CID);
}

main().catch(console.error);
