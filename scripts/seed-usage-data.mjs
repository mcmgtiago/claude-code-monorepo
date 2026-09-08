// Seed realistic usage data for Junior Barber (appointments, sales, financial)
const SUPABASE_URL = "https://dxvamljoffvbpruljiqa.supabase.co";
const ANON_KEY = "sb_publishable_kgv2lh6ekHz0Bx9Sgy_H_w_ZKKrsffz";
const CID = "ecdd67c5-2972-40f4-a5d9-4598a5bdf69d";

async function main() {
  const login = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "apikey": ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "mcmgtiagoonline@gmail.com", password: "Barber2026!" })
  }).then(r => r.json());
  const AT = login.access_token;
  const h = { "apikey": ANON_KEY, "Authorization": `Bearer ${AT}`, "Content-Type": "application/json", "Prefer": "return=representation" };

  // Get pros, services, customers
  const pros = await fetch(`${SUPABASE_URL}/rest/v1/professional?company_id=eq.${CID}&select=id,name,work_schedule`, { headers: h }).then(r => r.json());
  const services = await fetch(`${SUPABASE_URL}/rest/v1/service?company_id=eq.${CID}&select=id,name,price,duration_minutes&active=eq.true`, { headers: h }).then(r => r.json());
  const customers = await fetch(`${SUPABASE_URL}/rest/v1/customer?company_id=eq.${CID}&select=id,name,phone`, { headers: h }).then(r => r.json());

  console.log(`${pros.length} pros, ${services.length} services, ${customers.length} customers`);

  // Generate appointments over the last 30 days + next 7 days
  const now = new Date();
  const statuses = ["concluido", "concluido", "concluido", "confirmado", "agendado", "cancelado", "nao_compareceu"];
  let aptCount = 0, saleCount = 0;

  for (let dayOffset = -30; dayOffset <= 7; dayOffset++) {
    // 2-6 appointments per day
    const numApts = 2 + Math.floor((Math.abs(dayOffset * 7) % 5));
    for (let i = 0; i < numApts; i++) {
      const pro = pros[Math.abs(dayOffset + i) % pros.length];
      const svc = services[Math.abs(dayOffset * 3 + i) % services.length];
      const cust = customers[Math.abs(dayOffset + i) % customers.length];
      const hour = 9 + (i * 2) % 9;
      const date = new Date(now);
      date.setDate(date.getDate() + dayOffset);
      date.setHours(hour, 0, 0, 0);

      // Past = mostly concluido, future = agendado/confirmado
      let status;
      if (dayOffset < 0) status = statuses[(i + Math.abs(dayOffset)) % statuses.length];
      else status = i % 2 === 0 ? "agendado" : "confirmado";

      const apt = await fetch(`${SUPABASE_URL}/rest/v1/appointment`, {
        method: "POST", headers: h,
        body: JSON.stringify({
          company_id: CID,
          professional_id: pro.id,
          service_id: svc.id,
          customer_id: cust.id,
          scheduled_at: date.toISOString(),
          customer_name: cust.name,
          customer_phone: cust.phone,
          professional_name: pro.name,
          service_name: svc.name,
          price: svc.price,
          status,
          source: "interno",
          branch: pro.work_schedule?.filial ?? null,
        })
      }).then(r => r.json());
      aptCount++;

      // For concluido appointments, create a closed sale + financial entry
      if (status === "concluido" && Array.isArray(apt) && apt[0]) {
        const sale = await fetch(`${SUPABASE_URL}/rest/v1/sale`, {
          method: "POST", headers: h,
          body: JSON.stringify({
            company_id: CID,
            appointment_id: apt[0].id,
            customer_id: cust.id,
            professional_id: pro.id,
            total_cents: svc.price,
            status: "fechada",
            forma_pagamento: ["pix", "dinheiro", "cartao_credito"][i % 3],
            closed_at: date.toISOString(),
            branch: pro.work_schedule?.filial ?? null,
          })
        }).then(r => r.json());

        if (Array.isArray(sale) && sale[0]) {
          const comissao = Math.round(svc.price * 0.4);
          await fetch(`${SUPABASE_URL}/rest/v1/sale_item`, {
            method: "POST", headers: { ...h, "Prefer": "return=minimal" },
            body: JSON.stringify({
              sale_id: sale[0].id, company_id: CID, professional_id: pro.id,
              tipo: "servico", descricao: svc.name, preco_cents: svc.price, quantidade: 1,
              comissao_percentual: 40, comissao_cents: comissao,
            })
          });
          // Financial entry (receita)
          await fetch(`${SUPABASE_URL}/rest/v1/financial_entry`, {
            method: "POST", headers: { ...h, "Prefer": "return=minimal" },
            body: JSON.stringify({
              company_id: CID, type: "entrada", status: "confirmado",
              date: date.toISOString().slice(0, 10), amount: svc.price,
              description: `${svc.name} - ${cust.name}`, category: "servico",
              branch: pro.work_schedule?.filial ?? null,
            })
          });
          saleCount++;
        }
      }
    }
  }

  // Some expenses
  const expenses = [
    { desc: "Aluguel", amount: 250000, cat: "fixo" },
    { desc: "Produtos (pomada, gel)", amount: 45000, cat: "insumo" },
    { desc: "Energia", amount: 38000, cat: "fixo" },
    { desc: "Internet", amount: 12000, cat: "fixo" },
  ];
  for (const e of expenses) {
    const d = new Date(now); d.setDate(5);
    await fetch(`${SUPABASE_URL}/rest/v1/financial_entry`, {
      method: "POST", headers: { ...h, "Prefer": "return=minimal" },
      body: JSON.stringify({
        company_id: CID, type: "saida", status: "confirmado",
        date: d.toISOString().slice(0, 10), amount: e.amount,
        description: e.desc, category: e.cat,
      })
    });
  }

  // Add club members (recurring revenue)
  const plans = await fetch(`${SUPABASE_URL}/rest/v1/club_plan?company_id=eq.${CID}&select=id,nome,preco_cents&limit=5`, { headers: h }).then(r => r.json());
  let memberCount = 0;
  for (let i = 0; i < Math.min(8, customers.length); i++) {
    const plan = plans[i % plans.length];
    const periodEnd = new Date(now); periodEnd.setDate(periodEnd.getDate() + 30);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/club_member`, {
      method: "POST", headers: { ...h, "Prefer": "return=minimal" },
      body: JSON.stringify({
        company_id: CID, customer_id: customers[i].id, club_plan_id: plan.id,
        status: "ativo", current_period_end: periodEnd.toISOString(),
      })
    });
    if (res.ok) memberCount++;
  }

  // Update customer stats (fidelidade + last visit)
  for (let i = 0; i < customers.length; i++) {
    const lastVisit = new Date(now); lastVisit.setDate(lastVisit.getDate() - (i * 8));
    await fetch(`${SUPABASE_URL}/rest/v1/customer?id=eq.${customers[i].id}`, {
      method: "PATCH", headers: { ...h, "Prefer": "return=minimal" },
      body: JSON.stringify({
        fidelidade_contador: (i * 3) % 10,
        total_appointments: 5 + i * 2,
        last_appointment_at: lastVisit.toISOString(),
      })
    });
  }

  console.log(`\n=== DADOS DE USO CRIADOS ===`);
  console.log(`${aptCount} agendamentos`);
  console.log(`${saleCount} comandas fechadas`);
  console.log(`${expenses.length} despesas`);
  console.log(`${memberCount} membros do clube`);
}

main().catch(console.error);
