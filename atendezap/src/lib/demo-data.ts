// Dados mockados para o modo demonstração público (/demo/*). NÃO toca no banco.
export const demoCompany = { nome: "Silva Flooring LLC", primary_color: "#0efa71" };

export type DemoMsg = {
  id: string; numero: string; nome: string;
  direcao: "entrada" | "saida"; autor: "ia" | "humano" | "contato";
  texto: string; quando: Date;
};

const NOW = new Date("2026-06-19T14:30:00.000Z").getTime();
const m = (min: number) => new Date(NOW - min * 60000);

const seedContatos = [
  { numero: "13054770001", nome: "Michael Thompson" },
  { numero: "17863450002", nome: "Jennifer Davis" },
  { numero: "13057890003", nome: "Robert Martinez" },
  { numero: "19546120004", nome: "Sarah Johnson" },
  { numero: "13052230005", nome: "David Wilson" },
  { numero: "17864560006", nome: "Amanda Torres" },
  { numero: "13059870007", nome: "Carlos Oliveira" },
  { numero: "17861230008", nome: "Lisa Anderson" },
];

export const demoMensagens: DemoMsg[] = [
  // Michael — lead quente, quer orçamento hardwood
  { id: "1", numero: seedContatos[0].numero, nome: seedContatos[0].nome, direcao: "entrada", autor: "contato", texto: "Hi! I need hardwood floors installed in my living room and hallway. About 800 sq ft total. Can you give me a quote?", quando: m(12) },
  { id: "2", numero: seedContatos[0].numero, nome: seedContatos[0].nome, direcao: "saida", autor: "ia", texto: "Hi Michael! 👋 We'd love to help with your hardwood installation. For 800 sq ft, prices typically range from $6,400–$9,600 depending on the wood species and subfloor condition. Can we schedule a free in-home estimate this week?", quando: m(11) },
  { id: "3", numero: seedContatos[0].numero, nome: seedContatos[0].nome, direcao: "entrada", autor: "contato", texto: "Yes! Thursday afternoon works. What time?", quando: m(5) },
  { id: "4", numero: seedContatos[0].numero, nome: seedContatos[0].nome, direcao: "saida", autor: "ia", texto: "Perfect! Thursday at 2pm works great. Our estimator will bring samples so you can choose your wood species on the spot. Address?", quando: m(4) },
  { id: "5", numero: seedContatos[0].numero, nome: seedContatos[0].nome, direcao: "entrada", autor: "contato", texto: "8540 SW 132nd St, Miami FL 33156", quando: m(2) },

  // Jennifer — LVP, já está negociando
  { id: "6", numero: seedContatos[1].numero, nome: seedContatos[1].nome, direcao: "entrada", autor: "contato", texto: "How long does LVP installation take for a 3-bedroom house?", quando: m(95) },
  { id: "7", numero: seedContatos[1].numero, nome: seedContatos[1].nome, direcao: "saida", autor: "ia", texto: "Hi Jennifer! For a 3-bedroom (approx. 1,200 sq ft), our crew usually finishes in 1–2 days. We handle furniture moving and full cleanup. Would you like a free estimate?", quando: m(93) },
  { id: "8", numero: seedContatos[1].numero, nome: seedContatos[1].nome, direcao: "entrada", autor: "contato", texto: "Yes please! I was quoted $4.50/sq ft by another company. Can you beat that?", quando: m(80) },
  { id: "9", numero: seedContatos[1].numero, nome: seedContatos[1].nome, direcao: "saida", autor: "humano", texto: "Hi Jennifer, this is Roberto from Silva Flooring. We can do $4.20/sq ft with 5-year labor warranty. Can I call you to go over the details?", quando: m(70) },
  { id: "10", numero: seedContatos[1].numero, nome: seedContatos[1].nome, direcao: "entrada", autor: "contato", texto: "That sounds great! Call me after 5pm today.", quando: m(60) },

  // Robert — tile banheiro, em dúvida
  { id: "11", numero: seedContatos[2].numero, nome: seedContatos[2].nome, direcao: "entrada", autor: "contato", texto: "Do you do bathroom tile as well or only floors?", quando: m(180) },
  { id: "12", numero: seedContatos[2].numero, nome: seedContatos[2].nome, direcao: "saida", autor: "ia", texto: "Hi Robert! We do full tile work — bathroom floors, shower walls, kitchen backsplash and more. What are you looking to redo?", quando: m(178) },
  { id: "13", numero: seedContatos[2].numero, nome: seedContatos[2].nome, direcao: "entrada", autor: "contato", texto: "Master bathroom floor and shower. It's old and cracking.", quando: m(170) },
  { id: "14", numero: seedContatos[2].numero, nome: seedContatos[2].nome, direcao: "saida", autor: "ia", texto: "Sounds like a full demo and retile. We can handle everything including waterproofing. Want to send me some photos of the current state?", quando: m(168) },
  { id: "15", numero: seedContatos[2].numero, nome: seedContatos[2].nome, direcao: "entrada", autor: "contato", texto: "Sure, let me take some pics and send.", quando: m(160) },

  // Sarah — job concluído, pedir review
  { id: "16", numero: seedContatos[3].numero, nome: seedContatos[3].nome, direcao: "saida", autor: "humano", texto: "Hi Sarah! The hardwood installation is complete. Hope you're loving the new floors! 🙌 If you're happy with our work, a Google review would mean the world to us: g.co/r/silva-flooring", quando: m(1440) },
  { id: "17", numero: seedContatos[3].numero, nome: seedContatos[3].nome, direcao: "entrada", autor: "contato", texto: "Oh my gosh, I LOVE them!! Already left a 5-star review. Roberto and his team were amazing. Will definitely recommend!", quando: m(1300) },

  // David — pergunta sobre refinishing
  { id: "18", numero: seedContatos[4].numero, nome: seedContatos[4].nome, direcao: "entrada", autor: "contato", texto: "My hardwood floors look old and scratched. Is refinishing cheaper than replacing?", quando: m(320) },
  { id: "19", numero: seedContatos[4].numero, nome: seedContatos[4].nome, direcao: "saida", autor: "ia", texto: "Hi David! Yes, refinishing is usually 60–70% cheaper than replacing. For 1,000 sq ft, refinishing costs around $2,000–$3,500 vs $8,000–$12,000 to replace. And the result looks brand new! Want a free inspection?", quando: m(318) },
  { id: "20", numero: seedContatos[4].numero, nome: seedContatos[4].nome, direcao: "entrada", autor: "contato", texto: "Wow that's a big difference. Yes, can someone come look this weekend?", quando: m(300) },

  // Amanda — carpet para bedroom
  { id: "21", numero: seedContatos[5].numero, nome: seedContatos[5].nome, direcao: "entrada", autor: "contato", texto: "Do you install carpet? I need 2 bedrooms done.", quando: m(45) },
  { id: "22", numero: seedContatos[5].numero, nome: seedContatos[5].nome, direcao: "saida", autor: "ia", texto: "Hi Amanda! Yes, we install carpet too. For 2 bedrooms (approx. 400 sq ft), price starts around $1,800 installed with padding. We carry several brands. Want to see samples?", quando: m(43) },
  { id: "23", numero: seedContatos[5].numero, nome: seedContatos[5].nome, direcao: "entrada", autor: "contato", texto: "Yes! Do you have any pet-friendly options?", quando: m(30) },

  // Carlos — brasileiro, referenciado
  { id: "24", numero: seedContatos[6].numero, nome: seedContatos[6].nome, direcao: "entrada", autor: "contato", texto: "Oi! O João me passou o contato de vocês. Preciso de piso no meu restaurante, uns 1200 sq ft de commercial vinyl. Vocês fazem?", quando: m(25) },
  { id: "25", numero: seedContatos[6].numero, nome: seedContatos[6].nome, direcao: "saida", autor: "ia", texto: "Oi Carlos! Claro, fazemos commercial flooring também. Commercial vinyl (VCT ou LVT) é perfeito pra restaurante — durável e fácil de limpar. Posso mandar orçamento essa semana. Qual é o endereço do restaurante?", quando: m(20) },

  // Lisa — fechou um job grande
  { id: "26", numero: seedContatos[7].numero, nome: seedContatos[7].nome, direcao: "entrada", autor: "contato", texto: "We're ready to move forward with the whole house. All 2,400 sq ft. Can we sign the contract this week?", quando: m(15) },
  { id: "27", numero: seedContatos[7].numero, nome: seedContatos[7].nome, direcao: "saida", autor: "humano", texto: "Lisa, that's great news! I'll send the contract via email today and we can start next Monday. Exciting!", quando: m(10) },
];

export type DemoCard = {
  id: string; numero: string; nome: string;
  status: "conversas" | "negociando" | "ganho" | "perda";
  ultima_mensagem: string; ultima_em: Date;
  valor?: number; observacao?: string;
};

export const demoCards: DemoCard[] = [
  { id: "c1", numero: seedContatos[0].numero, nome: "Michael Thompson", status: "negociando", ultima_mensagem: "8540 SW 132nd St, Miami FL 33156", ultima_em: m(2), valor: 7200, observacao: "800 sq ft hardwood. Visita quinta 2pm. Prioridade alta." },
  { id: "c2", numero: seedContatos[7].numero, nome: "Lisa Anderson", status: "ganho", ultima_mensagem: "Ready to move forward with the whole house!", ultima_em: m(10), valor: 19200, observacao: "2,400 sq ft full house. Contrato sendo assinado. Início segunda." },
  { id: "c3", numero: seedContatos[1].numero, nome: "Jennifer Davis", status: "negociando", ultima_mensagem: "Call me after 5pm today.", ultima_em: m(60), valor: 5040, observacao: "1,200 sq ft LVP. Contra-proposta $4.20/sq ft aceita. Ligar às 17h." },
  { id: "c4", numero: seedContatos[4].numero, nome: "David Wilson", status: "conversas", ultima_mensagem: "Can someone come look this weekend?", ultima_em: m(300), valor: 2800, observacao: "Hardwood refinishing. Quer visita no fim de semana." },
  { id: "c5", numero: seedContatos[2].numero, nome: "Robert Martinez", status: "conversas", ultima_mensagem: "Sure, let me take some pics and send.", ultima_em: m(160), observacao: "Tile banheiro principal e chuveiro. Aguardando fotos para orçar." },
  { id: "c6", numero: seedContatos[6].numero, nome: "Carlos Oliveira", status: "negociando", ultima_mensagem: "Qual é o endereço do restaurante?", ultima_em: m(20), valor: 8400, observacao: "Commercial vinyl 1,200 sq ft — restaurante. Indicação do João." },
  { id: "c7", numero: seedContatos[5].numero, nome: "Amanda Torres", status: "conversas", ultima_mensagem: "Yes! Do you have any pet-friendly options?", ultima_em: m(30), valor: 1800, observacao: "Carpet 2 quartos. Quer opções pet-friendly." },
  { id: "c8", numero: seedContatos[3].numero, nome: "Sarah Johnson", status: "ganho", ultima_mensagem: "Will definitely recommend!", ultima_em: m(1300), valor: 9600, observacao: "Job concluído. Deixou 5 estrelas no Google. ⭐⭐⭐⭐⭐" },
];

export const demoStats = {
  conversas: demoCards.filter((c) => c.status === "conversas").length,
  negociando: demoCards.filter((c) => c.status === "negociando").length,
  ganho: demoCards.filter((c) => c.status === "ganho").length,
  perda: demoCards.filter((c) => c.status === "perda").length,
};

export const demoAgentConfig = {
  nome_agente: "Sam (Silva Flooring Assistant)",
  nome_empresa: "Silva Flooring LLC",
  papel_objetivo: "Responder leads no WhatsApp, qualificar o projeto, agendar visita de orçamento e passar para Roberto fechar.",
  estilo_comunicacao: "Professional, friendly and confident. Direct answers. Light use of emojis.",
  sobre_empresa: "Brazilian-owned flooring company serving Miami-Dade and Broward since 2018. Hardwood, LVP, tile, carpet and refinishing. Licensed & insured. 5-star rated on Google.",
  produtos_servicos: "Hardwood installation, LVP/vinyl plank, tile (floor & walls), carpet, floor refinishing, subfloor repair, commercial flooring.",
  pode_fazer: "Provide price ranges, schedule free in-home estimates, send company info and photos, answer questions about materials.",
  nao_pode_fazer: "Give exact quotes without measurement, promise start dates without checking schedule, offer discounts without Roberto's approval.",
  telefone_transferencia: "+1 (305) 555-0100",
  palavra_pausar: "/pause",
  palavra_despausar: "/resume",
};

// ─── Dados extras para as novas telas demo ────────────────────────────────

export type DemoService = { id: string; name: string; category: string; duration_minutes: number; price: number; description: string };
export const demoServices: DemoService[] = [
  { id: "s1", name: "Hardwood Installation", category: "Wood", duration_minutes: 480, price: 8, description: "Supply & install solid or engineered hardwood. Price per sq ft." },
  { id: "s2", name: "LVP / Vinyl Plank", category: "Vinyl", duration_minutes: 360, price: 4.5, description: "Waterproof luxury vinyl plank. Great for kitchens and bathrooms." },
  { id: "s3", name: "Tile Installation", category: "Tile", duration_minutes: 480, price: 12, description: "Ceramic or porcelain tile. Floor and wall. Grout included." },
  { id: "s4", name: "Carpet Installation", category: "Carpet", duration_minutes: 240, price: 4, description: "Residential carpet with padding. Multiple styles available." },
  { id: "s5", name: "Floor Refinishing", category: "Wood", duration_minutes: 600, price: 3.5, description: "Sand, stain and finish existing hardwood. Like new results." },
  { id: "s6", name: "Free In-Home Estimate", category: "Admin", duration_minutes: 60, price: 0, description: "Measure the area and provide written quote on the spot." },
];

export type DemoProfessional = { id: string; name: string; specialty: string };
export const demoProfessionals: DemoProfessional[] = [
  { id: "p1", name: "Roberto Silva", specialty: "Hardwood & Refinishing" },
  { id: "p2", name: "Anderson Ferreira", specialty: "Tile & Bathroom" },
  { id: "p3", name: "Lucas Costa", specialty: "LVP & Vinyl" },
];

export type DemoAppointment = {
  id: string; title: string; professional: string; customer: string;
  date: string; slot: string; status: "agendado"|"confirmado"|"em_andamento"|"concluido"|"cancelado";
  address: string; value: number; service: string;
};
export const demoAppointments: DemoAppointment[] = [
  { id: "a1", title: "Free Estimate — Michael Thompson", professional: "Roberto Silva", customer: "Michael Thompson", date: "2026-06-19", slot: "14:00", status: "confirmado", address: "8540 SW 132nd St, Miami FL", value: 0, service: "Free In-Home Estimate" },
  { id: "a2", title: "LVP Installation — Jennifer Davis", professional: "Lucas Costa", customer: "Jennifer Davis", date: "2026-06-20", slot: "08:00", status: "agendado", address: "12300 SW 72nd Ave, Miami FL", value: 5040, service: "LVP / Vinyl Plank" },
  { id: "a3", title: "Tile — Robert Martinez (bathroom)", professional: "Anderson Ferreira", customer: "Robert Martinez", date: "2026-06-21", slot: "09:00", status: "agendado", address: "4501 NW 7th St, Miami FL", value: 3800, service: "Tile Installation" },
  { id: "a4", title: "Full House Hardwood — Lisa Anderson", professional: "Roberto Silva", customer: "Lisa Anderson", date: "2026-06-23", slot: "07:00", status: "agendado", address: "1890 Brickell Ave, Miami FL", value: 19200, service: "Hardwood Installation" },
  { id: "a5", title: "Refinishing — David Wilson", professional: "Roberto Silva", customer: "David Wilson", date: "2026-06-17", slot: "08:00", status: "concluido", address: "5530 SW 64th Ct, Miami FL", value: 2800, service: "Floor Refinishing" },
  { id: "a6", title: "Hardwood — Sarah Johnson", professional: "Lucas Costa", customer: "Sarah Johnson", date: "2026-06-14", slot: "08:00", status: "concluido", address: "9110 SW 148th Ter, Miami FL", value: 9600, service: "Hardwood Installation" },
];

export type DemoFinancial = { id: string; type: "entrada"|"saida"; description: string; amount: number; date: string; category: string; status: string };
export const demoFinancial: DemoFinancial[] = [
  { id: "f1", type: "entrada", description: "Sarah Johnson — Hardwood 960 sq ft", amount: 9600, date: "2026-06-14", category: "Job completo", status: "confirmado" },
  { id: "f2", type: "entrada", description: "David Wilson — Refinishing 800 sq ft", amount: 2800, date: "2026-06-17", category: "Job completo", status: "confirmado" },
  { id: "f3", type: "saida", description: "Materials — Bruce Hardwood 500 sq ft", amount: 2100, date: "2026-06-15", category: "Material", status: "confirmado" },
  { id: "f4", type: "saida", description: "Crew wages — week 06/09", amount: 3200, date: "2026-06-13", category: "Mão de obra", status: "confirmado" },
  { id: "f5", type: "saida", description: "Van fuel & maintenance", amount: 380, date: "2026-06-12", category: "Veículo", status: "confirmado" },
  { id: "f6", type: "entrada", description: "Down payment — Lisa Anderson (50%)", amount: 9600, date: "2026-06-18", category: "Sinal", status: "confirmado" },
  { id: "f7", type: "saida", description: "Adhesive & underlayment supplies", amount: 650, date: "2026-06-16", category: "Material", status: "confirmado" },
  { id: "f8", type: "entrada", description: "Jennifer Davis — LVP deposit 30%", amount: 1512, date: "2026-06-18", category: "Sinal", status: "confirmado" },
];

export type DemoQuote = {
  id: string; customer_name: string; customer_phone: string;
  status: string; total_amount: number; created_at: string;
  items: { name: string; qty: number; unit_price: number; total: number }[];
};
export const demoQuotes: DemoQuote[] = [
  {
    id: "q1", customer_name: "Michael Thompson", customer_phone: "+13054770001",
    status: "sent", total_amount: 7200, created_at: "2026-06-17T10:00:00Z",
    items: [
      { name: "Hardwood Supply & Install (800 sq ft @ $8)", qty: 800, unit_price: 8, total: 6400 },
      { name: "Subfloor preparation", qty: 1, unit_price: 450, total: 450 },
      { name: "Furniture moving", qty: 1, unit_price: 350, total: 350 },
    ],
  },
  {
    id: "q2", customer_name: "Jennifer Davis", customer_phone: "+17863450002",
    status: "accepted", total_amount: 5040, created_at: "2026-06-16T14:00:00Z",
    items: [
      { name: "LVP Supply & Install (1,200 sq ft @ $4.20)", qty: 1200, unit_price: 4.2, total: 5040 },
    ],
  },
  {
    id: "q3", customer_name: "Carlos Oliveira", customer_phone: "+17864560006",
    status: "draft", total_amount: 8400, created_at: "2026-06-18T09:00:00Z",
    items: [
      { name: "Commercial LVT (1,200 sq ft @ $6)", qty: 1200, unit_price: 6, total: 7200 },
      { name: "Adhesive & floor prep", qty: 1, unit_price: 800, total: 800 },
      { name: "Weekend work surcharge", qty: 1, unit_price: 400, total: 400 },
    ],
  },
];
