// Dados demo para cada nicho. Importado pelo contexto do /demo.

import type {
  DemoMsg, DemoCard, DemoService, DemoProfessional, DemoAppointment, DemoFinancial, DemoQuote
} from "./demo-data";

export type NichoKey = "flooring" | "roofing" | "painting" | "cleaning" | "landscaping";

export type NichoData = {
  key: NichoKey;
  label: string;
  emoji: string;
  tagline: string;
  company: string;
  phone: string;
  agentName: string;
  agentDesc: string;
  location: string;
  kpis: { conversas: number; aiRate: string; pipeline: string; revenue: string; trend: string };
  mensagens: DemoMsg[];
  cards: DemoCard[];
  services: DemoService[];
  professionals: DemoProfessional[];
  appointments: DemoAppointment[];
  financial: DemoFinancial[];
  quotes: DemoQuote[];
};

const NOW = new Date("2026-06-19T14:30:00.000Z").getTime();
const m = (min: number) => new Date(NOW - min * 60000);

/* ─────────────────────────────── FLOORING ─────────────────────────────── */
const flooringData: NichoData = {
  key: "flooring", label: "Flooring", emoji: "🪵", tagline: "Hardwood · LVP · Tile · Carpet · Refinishing",
  company: "Silva Flooring LLC", phone: "+1 (305) 555-0100",
  agentName: "Sam", agentDesc: "Qualify leads, provide price ranges, schedule free in-home estimates.",
  location: "Miami-Dade & Broward County, FL",
  kpis: { conversas: 11, aiRate: "82%", pipeline: "$20.6k", revenue: "$21.9k", trend: "+38%" },
  mensagens: [
    { id:"f1", numero:"13054770001", nome:"Michael Thompson", direcao:"entrada", autor:"contato", texto:"Hi! I need hardwood floors in my living room, about 800 sq ft. Can you give me a quote?", quando: m(12) },
    { id:"f2", numero:"13054770001", nome:"Michael Thompson", direcao:"saida", autor:"ia", texto:"Hi Michael! 👋 For 800 sq ft hardwood, prices typically range $6,400–$9,600. Want a FREE in-home estimate this week?", quando: m(11) },
    { id:"f3", numero:"13054770001", nome:"Michael Thompson", direcao:"entrada", autor:"contato", texto:"Thursday at 2pm works!", quando: m(5) },
    { id:"f4", numero:"17863450002", nome:"Jennifer Davis", direcao:"entrada", autor:"contato", texto:"How long does LVP installation take for a 3-bedroom house?", quando: m(95) },
    { id:"f5", numero:"17863450002", nome:"Jennifer Davis", direcao:"saida", autor:"ia", texto:"Hi Jennifer! For ~1,200 sq ft, our crew finishes in 1–2 days including furniture moving and cleanup. Want a free estimate?", quando: m(93) },
    { id:"f6", numero:"17863450002", nome:"Jennifer Davis", direcao:"entrada", autor:"contato", texto:"Yes! I was quoted $4.50/sq ft. Can you beat that?", quando: m(80) },
    { id:"f7", numero:"17863450002", nome:"Jennifer Davis", direcao:"saida", autor:"humano", texto:"Hi Jennifer, Roberto here. We can do $4.20/sq ft with 5-year labor warranty. Call you after 5pm?", quando: m(70) },
    { id:"f8", numero:"13057890003", nome:"Carlos Oliveira", direcao:"entrada", autor:"contato", texto:"Oi! Preciso de piso no meu restaurante, uns 1200 sq ft de commercial vinyl. Vocês fazem?", quando: m(25) },
    { id:"f9", numero:"13057890003", nome:"Carlos Oliveira", direcao:"saida", autor:"ia", texto:"Oi Carlos! Claro, fazemos commercial flooring. LVT é perfeito pra restaurante — durável e fácil de limpar. Qual o endereço?", quando: m(20) },
    { id:"f10", numero:"19546120004", nome:"Lisa Anderson", direcao:"entrada", autor:"contato", texto:"We're ready for the whole house. All 2,400 sq ft. Can we sign this week?", quando: m(15) },
  ],
  cards: [
    { id:"fc1", numero:"13054770001", nome:"Michael Thompson", status:"negociando", ultima_mensagem:"Thursday at 2pm works!", ultima_em: m(5), valor: 7200, observacao: "800 sq ft hardwood. Estimate Thursday 2pm." },
    { id:"fc2", numero:"19546120004", nome:"Lisa Anderson", status:"ganho", ultima_mensagem:"Ready for whole house!", ultima_em: m(15), valor: 19200, observacao: "2,400 sq ft full house. Contract signing this week." },
    { id:"fc3", numero:"17863450002", nome:"Jennifer Davis", status:"negociando", ultima_mensagem:"Call me after 5pm.", ultima_em: m(60), valor: 5040, observacao: "1,200 sq ft LVP @ $4.20. Call today." },
    { id:"fc4", numero:"13057890003", nome:"Carlos Oliveira", status:"negociando", ultima_mensagem:"Qual o endereço?", ultima_em: m(20), valor: 8400, observacao: "Commercial vinyl 1,200 sq ft — restaurant." },
    { id:"fc5", numero:"13052230005", nome:"David Wilson", status:"conversas", ultima_mensagem:"Can someone come this weekend?", ultima_em: m(300), observacao: "Floor refinishing inquiry." },
    { id:"fc6", numero:"17864560006", nome:"Amanda Torres", status:"conversas", ultima_mensagem:"Do you have pet-friendly carpet?", ultima_em: m(45), observacao: "Carpet 2 bedrooms." },
    { id:"fc7", numero:"13059870007", nome:"Sarah Johnson", status:"ganho", ultima_mensagem:"LOVED the floors! Left 5-star review ⭐⭐⭐⭐⭐", ultima_em: m(1300), valor: 9600 },
  ],
  services: [
    { id:"s1", name:"Hardwood Installation", category:"Wood", duration_minutes:480, price:8, description:"Supply & install solid or engineered hardwood." },
    { id:"s2", name:"LVP / Vinyl Plank", category:"Vinyl", duration_minutes:360, price:4.5, description:"Waterproof luxury vinyl plank." },
    { id:"s3", name:"Tile Installation", category:"Tile", duration_minutes:480, price:12, description:"Ceramic or porcelain. Floor and wall." },
    { id:"s4", name:"Carpet Installation", category:"Carpet", duration_minutes:240, price:4, description:"Residential carpet with padding." },
    { id:"s5", name:"Floor Refinishing", category:"Wood", duration_minutes:600, price:3.5, description:"Sand, stain and finish existing hardwood." },
    { id:"s6", name:"Free In-Home Estimate", category:"Admin", duration_minutes:60, price:0, description:"Measure and quote on the spot." },
  ],
  professionals: [
    { id:"p1", name:"Roberto Silva", specialty:"Hardwood & Refinishing" },
    { id:"p2", name:"Anderson Ferreira", specialty:"Tile & Bathroom" },
    { id:"p3", name:"Lucas Costa", specialty:"LVP & Vinyl" },
  ],
  appointments: [
    { id:"a1", title:"Estimate — Michael Thompson", professional:"Roberto Silva", customer:"Michael Thompson", date:"2026-06-19", slot:"14:00", status:"confirmado", address:"8540 SW 132nd St, Miami FL", value:0, service:"Free In-Home Estimate" },
    { id:"a2", title:"LVP Install — Jennifer Davis", professional:"Lucas Costa", customer:"Jennifer Davis", date:"2026-06-20", slot:"08:00", status:"agendado", address:"12300 SW 72nd Ave, Miami FL", value:5040, service:"LVP / Vinyl Plank" },
    { id:"a3", title:"Full House Hardwood — Lisa Anderson", professional:"Roberto Silva", customer:"Lisa Anderson", date:"2026-06-23", slot:"07:00", status:"agendado", address:"1890 Brickell Ave, Miami FL", value:19200, service:"Hardwood Installation" },
  ],
  financial: [
    { id:"ff1", type:"entrada", description:"Sarah Johnson — Hardwood 960 sq ft", amount:9600, date:"2026-06-14", category:"Job completo", status:"confirmado" },
    { id:"ff2", type:"entrada", description:"Lisa Anderson — Down payment 50%", amount:9600, date:"2026-06-18", category:"Sinal", status:"confirmado" },
    { id:"ff3", type:"saida", description:"Materials — Bruce Hardwood", amount:2100, date:"2026-06-15", category:"Material", status:"confirmado" },
    { id:"ff4", type:"saida", description:"Crew wages — week 06/09", amount:3200, date:"2026-06-13", category:"Mão de obra", status:"confirmado" },
  ],
  quotes: [
    { id:"q1", customer_name:"Michael Thompson", customer_phone:"+13054770001", status:"sent", total_amount:7200, created_at:"2026-06-17T10:00:00Z",
      items:[{ name:"Hardwood Supply & Install (800 sq ft @ $8)", qty:800, unit_price:8, total:6400 }, { name:"Subfloor prep", qty:1, unit_price:450, total:450 }, { name:"Furniture moving", qty:1, unit_price:350, total:350 }] },
    { id:"q2", customer_name:"Jennifer Davis", customer_phone:"+17863450002", status:"accepted", total_amount:5040, created_at:"2026-06-16T14:00:00Z",
      items:[{ name:"LVP Supply & Install (1,200 sq ft @ $4.20)", qty:1200, unit_price:4.2, total:5040 }] },
  ],
};

/* ─────────────────────────────── ROOFING ──────────────────────────────── */
const roofingData: NichoData = {
  key: "roofing", label: "Roofing", emoji: "🏠", tagline: "Repair · Replacement · TPO · Shingle · Metal",
  company: "Pro Roof USA LLC", phone: "+1 (786) 555-0200",
  agentName: "Rex", agentDesc: "Qualify storm damage claims, schedule free inspections, book insurance jobs.",
  location: "Miami-Dade & Broward County, FL",
  kpis: { conversas: 16, aiRate: "78%", pipeline: "$84k", revenue: "$67k", trend: "+52%" },
  mensagens: [
    { id:"r1", numero:"13054880001", nome:"James Carter", direcao:"entrada", autor:"contato", texto:"We had a big storm last night. My roof is leaking badly. Do you do emergency repairs?", quando: m(8) },
    { id:"r2", numero:"13054880001", nome:"James Carter", direcao:"saida", autor:"ia", texto:"Hi James! Yes, we do emergency roof repairs. We can have someone out today. What's your address and can you describe the damage?", quando: m(7) },
    { id:"r3", numero:"13054880001", nome:"James Carter", direcao:"entrada", autor:"contato", texto:"240 NW 14th Ave, Miami. There's a big hole in the corner. Water coming into the bedroom.", quando: m(3) },
    { id:"r4", numero:"17865550002", nome:"Patricia Gomez", direcao:"entrada", autor:"contato", texto:"My insurance adjuster is coming Thursday. Can someone from your company be there to represent me?", quando: m(90) },
    { id:"r5", numero:"17865550002", nome:"Patricia Gomez", direcao:"saida", autor:"ia", texto:"Hi Patricia! Absolutely — we work with insurance claims every day and can have our estimator meet you and the adjuster Thursday. What time is the appointment?", quando: m(88) },
    { id:"r6", numero:"17865550002", nome:"Patricia Gomez", direcao:"entrada", autor:"contato", texto:"10am. Can you help me get the maximum coverage?", quando: m(80) },
    { id:"r7", numero:"17865550002", nome:"Patricia Gomez", direcao:"saida", autor:"humano", texto:"Patricia, this is Bruno from Pro Roof. We've helped 200+ homeowners maximize their claims. I'll be there Thursday 10am personally.", quando: m(70) },
    { id:"r8", numero:"13058880003", nome:"Robert Kim", direcao:"entrada", autor:"contato", texto:"How much does it cost to replace a shingle roof on a 2,500 sq ft house?", quando: m(200) },
    { id:"r9", numero:"13058880003", nome:"Robert Kim", direcao:"saida", autor:"ia", texto:"Hi Robert! For 2,500 sq ft with standard shingles, expect $12,000–$18,000 installed. For architectural shingles (30-year), $16,000–$24,000. We offer free inspections — want to schedule?", quando: m(198) },
    { id:"r10", numero:"19547780004", nome:"Maria Santos", direcao:"entrada", autor:"contato", texto:"I need a new flat roof for my commercial building. 8,000 sq ft. What do you recommend?", quando: m(300) },
  ],
  cards: [
    { id:"rc1", numero:"13054880001", nome:"James Carter", status:"negociando", ultima_mensagem:"Water coming into the bedroom", ultima_em: m(3), valor:4800, observacao:"Emergency repair. Dispatch today. HIGH PRIORITY." },
    { id:"rc2", numero:"17865550002", nome:"Patricia Gomez", status:"negociando", ultima_mensagem:"Can you help maximize my claim?", ultima_em: m(70), valor:22000, observacao:"Insurance claim. Adjuster meeting Thursday 10am." },
    { id:"rc3", numero:"13058880003", nome:"Robert Kim", status:"conversas", ultima_mensagem:"Free inspection scheduled", ultima_em: m(198), valor:16000, observacao:"Full shingle replacement 2,500 sq ft." },
    { id:"rc4", numero:"19547780004", nome:"Maria Santos", status:"conversas", ultima_mensagem:"8,000 sq ft flat roof — commercial", ultima_em: m(300), valor:48000, observacao:"Commercial TPO. Big ticket." },
    { id:"rc5", numero:"17862220005", nome:"David Hernandez", status:"ganho", ultima_mensagem:"Contract signed! Start Monday.", ultima_em: m(2880), valor:19500, observacao:"3,200 sq ft metal roof. Job starts Monday." },
    { id:"rc6", numero:"13056660006", nome:"Lisa Fernandez", status:"ganho", ultima_mensagem:"Insurance approved $24k 🎉", ultima_em: m(4320), valor:24000, observacao:"Insurance replacement fully approved." },
  ],
  services: [
    { id:"s1", name:"Shingle Roof Replacement", category:"Residential", duration_minutes:960, price:7, description:"30-year architectural shingles. Per sq ft." },
    { id:"s2", name:"TPO Flat Roof", category:"Commercial", duration_minutes:960, price:6, description:"Single-ply thermoplastic. Per sq ft." },
    { id:"s3", name:"Metal Roof", category:"Residential", duration_minutes:1200, price:10, description:"Standing seam or corrugated. 50-year lifespan." },
    { id:"s4", name:"Emergency Repair", category:"Repair", duration_minutes:180, price:350, description:"Same-day tarping and emergency patch." },
    { id:"s5", name:"Roof Inspection", category:"Admin", duration_minutes:60, price:0, description:"Free inspection with written report and photos." },
    { id:"s6", name:"Insurance Claim Assistance", category:"Admin", duration_minutes:120, price:0, description:"We represent you during the adjuster visit." },
  ],
  professionals: [
    { id:"p1", name:"Bruno Silva", specialty:"Insurance Claims & Commercial" },
    { id:"p2", name:"Diego Rocha", specialty:"Residential Shingle" },
    { id:"p3", name:"Marcos Faria", specialty:"Metal & TPO" },
  ],
  appointments: [
    { id:"a1", title:"Emergency Repair — James Carter", professional:"Diego Rocha", customer:"James Carter", date:"2026-06-19", slot:"10:00", status:"em_andamento", address:"240 NW 14th Ave, Miami FL", value:4800, service:"Emergency Repair" },
    { id:"a2", title:"Insurance Adjuster — Patricia Gomez", professional:"Bruno Silva", customer:"Patricia Gomez", date:"2026-06-19", slot:"10:00", status:"confirmado", address:"1210 SW 8th St, Miami FL", value:22000, service:"Insurance Claim Assistance" },
    { id:"a3", title:"Metal Roof — David Hernandez", professional:"Marcos Faria", customer:"David Hernandez", date:"2026-06-22", slot:"07:00", status:"agendado", address:"4400 NW 2nd Ave, Miami FL", value:19500, service:"Metal Roof" },
  ],
  financial: [
    { id:"rf1", type:"entrada", description:"Lisa Fernandez — Insurance full payment", amount:24000, date:"2026-06-10", category:"Job completo", status:"confirmado" },
    { id:"rf2", type:"entrada", description:"David Hernandez — 40% down payment", amount:7800, date:"2026-06-18", category:"Sinal", status:"confirmado" },
    { id:"rf3", type:"saida", description:"Shingles & materials — ABC Supply", amount:6200, date:"2026-06-12", category:"Material", status:"confirmado" },
    { id:"rf4", type:"saida", description:"Crew wages — week 06/09", amount:4800, date:"2026-06-13", category:"Mão de obra", status:"confirmado" },
  ],
  quotes: [
    { id:"q1", customer_name:"Patricia Gomez", customer_phone:"+17865550002", status:"sent", total_amount:22000, created_at:"2026-06-18T09:00:00Z",
      items:[{ name:"Roof tear-off & disposal", qty:2800, unit_price:1.5, total:4200 }, { name:"Architectural shingles (2,800 sq ft)", qty:2800, unit_price:5.5, total:15400 }, { name:"Underlayment & flashing", qty:1, unit_price:2400, total:2400 }] },
    { id:"q2", customer_name:"Robert Kim", customer_phone:"+13058880003", status:"draft", total_amount:16800, created_at:"2026-06-17T14:00:00Z",
      items:[{ name:"30-yr architectural shingles (2,500 sq ft)", qty:2500, unit_price:6, total:15000 }, { name:"Decking repair (est.)", qty:1, unit_price:1200, total:1200 }, { name:"Ridge cap & ventilation", qty:1, unit_price:600, total:600 }] },
  ],
};

/* ─────────────────────────────── PAINTING ─────────────────────────────── */
const paintingData: NichoData = {
  key: "painting", label: "Painting", emoji: "🎨", tagline: "Interior · Exterior · Commercial · Stucco",
  company: "Vivid Painting Co.", phone: "+1 (954) 555-0300",
  agentName: "Ivy", agentDesc: "Qualify leads, collect room count/sq ft, schedule free color consultations.",
  location: "Broward & Palm Beach County, FL",
  kpis: { conversas: 9, aiRate: "85%", pipeline: "$28k", revenue: "$34k", trend: "+29%" },
  mensagens: [
    { id:"p1", numero:"19541110001", nome:"Angela Brown", direcao:"entrada", autor:"contato", texto:"I want to repaint my entire interior. 3 bed 2 bath, about 1,800 sq ft. How much?", quando: m(15) },
    { id:"p2", numero:"19541110001", nome:"Angela Brown", direcao:"saida", autor:"ia", texto:"Hi Angela! For 1,800 sq ft interior (3/2), typically $3,600–$5,400 including primer, 2 coats and all materials. Want a free color consultation at your home?", quando: m(14) },
    { id:"p3", numero:"19541110001", nome:"Angela Brown", direcao:"entrada", autor:"contato", texto:"Yes! Do you have Benjamin Moore?", quando: m(10) },
    { id:"p4", numero:"19541110001", nome:"Angela Brown", direcao:"saida", autor:"ia", texto:"We use Benjamin Moore, Sherwin-Williams and Behr. BM is our favorite for color depth! 🎨 What day works for the consultation?", quando: m(9) },
    { id:"p5", numero:"17541110002", nome:"Chris Patel", direcao:"entrada", autor:"contato", texto:"How long does exterior painting take for a 2-story house?", quando: m(120) },
    { id:"p6", numero:"17541110002", nome:"Chris Patel", direcao:"saida", autor:"ia", texto:"Hi Chris! Usually 3–5 days for a 2-story exterior. We do full prep (pressure wash, scrape, prime) before painting. Want a free estimate?", quando: m(118) },
    { id:"p7", numero:"13301110003", nome:"Sandra Lima", direcao:"entrada", autor:"contato", texto:"Oi! Eu tenho um restaurante. Quero pintar tudo, teto e paredes. Uns 2500 sq ft. Vcs fazem comercial?", quando: m(30) },
    { id:"p8", numero:"13301110003", nome:"Sandra Lima", direcao:"saida", autor:"ia", texto:"Oi Sandra! Claro! Fazemos pintura comercial — restaurantes, escritórios, galpões. Trabalhamos finais de semana pra não interromper o negócio. Posso mandar orçamento?", quando: m(28) },
    { id:"p9", numero:"19547770004", nome:"Tom Wilson", direcao:"entrada", autor:"contato", texto:"My HOA requires specific colors. Can you match them?", quando: m(200) },
    { id:"p10", numero:"19547770004", nome:"Tom Wilson", direcao:"saida", autor:"ia", texto:"Absolutely Tom! We work with HOA color specs all the time. Just send us the palette and we match exactly. Want a free exterior estimate?", quando: m(198) },
  ],
  cards: [
    { id:"pc1", numero:"19541110001", nome:"Angela Brown", status:"negociando", ultima_mensagem:"Do you have Benjamin Moore?", ultima_em: m(9), valor:4400, observacao:"Interior 3/2, 1,800 sq ft. Consultation pending." },
    { id:"pc2", numero:"17541110002", nome:"Chris Patel", status:"conversas", ultima_mensagem:"Free estimate scheduled", ultima_em: m(118), valor:6800, observacao:"2-story exterior. Estimate TBD." },
    { id:"pc3", numero:"13301110003", nome:"Sandra Lima", status:"negociando", ultima_mensagem:"Posso mandar orçamento?", ultima_em: m(28), valor:8500, observacao:"Commercial 2,500 sq ft. Weekend work." },
    { id:"pc4", numero:"19547770004", nome:"Tom Wilson", status:"conversas", ultima_mensagem:"HOA color match needed", ultima_em: m(198), valor:5200, observacao:"HOA exterior job. Send palette." },
    { id:"pc5", numero:"17548880005", nome:"Maria Garcia", status:"ganho", ultima_mensagem:"Contract signed. Start next Monday!", ultima_em: m(1440), valor:12000, observacao:"Full house interior + exterior. Big job." },
    { id:"pc6", numero:"13306660006", nome:"Paul Davis", status:"ganho", ultima_mensagem:"Looks amazing! Highly recommend!", ultima_em: m(3600), valor:3800, observacao:"Interior only. 5-star review left." },
  ],
  services: [
    { id:"s1", name:"Interior Painting", category:"Residential", duration_minutes:480, price:2.5, description:"Per sq ft. Walls & ceiling. 2 coats + primer." },
    { id:"s2", name:"Exterior Painting", category:"Residential", duration_minutes:600, price:3, description:"Per sq ft. Pressure wash, prime, 2 coats." },
    { id:"s3", name:"Commercial Painting", category:"Commercial", duration_minutes:600, price:2, description:"Per sq ft. Night/weekend shifts available." },
    { id:"s4", name:"Cabinet Painting", category:"Specialty", duration_minutes:480, price:75, description:"Per cabinet door. Factory-like finish." },
    { id:"s5", name:"Stucco Repair & Paint", category:"Exterior", duration_minutes:360, price:4, description:"Patch cracks and repaint. Per sq ft." },
    { id:"s6", name:"Color Consultation", category:"Admin", duration_minutes:60, price:0, description:"Free in-home color matching and samples." },
  ],
  professionals: [
    { id:"p1", name:"Felipe Santos", specialty:"Interior & Color Specialist" },
    { id:"p2", name:"André Moreira", specialty:"Exterior & Stucco" },
    { id:"p3", name:"Thiago Alves", specialty:"Commercial & Cabinets" },
  ],
  appointments: [
    { id:"a1", title:"Color Consult — Angela Brown", professional:"Felipe Santos", customer:"Angela Brown", date:"2026-06-20", slot:"10:00", status:"agendado", address:"3240 NE 12th Ave, Fort Lauderdale FL", value:0, service:"Color Consultation" },
    { id:"a2", title:"Full House — Maria Garcia", professional:"Felipe Santos", customer:"Maria Garcia", date:"2026-06-22", slot:"08:00", status:"agendado", address:"5510 NW 3rd Ave, Pompano Beach FL", value:12000, service:"Interior Painting" },
  ],
  financial: [
    { id:"pf1", type:"entrada", description:"Maria Garcia — Full house paint", amount:12000, date:"2026-06-14", category:"Job completo", status:"confirmado" },
    { id:"pf2", type:"entrada", description:"Paul Davis — Interior 3/2", amount:3800, date:"2026-06-10", category:"Job completo", status:"confirmado" },
    { id:"pf3", type:"saida", description:"Benjamin Moore paint — bulk order", amount:1800, date:"2026-06-13", category:"Material", status:"confirmado" },
    { id:"pf4", type:"saida", description:"Crew wages — week 06/09", amount:2800, date:"2026-06-13", category:"Mão de obra", status:"confirmado" },
  ],
  quotes: [
    { id:"q1", customer_name:"Angela Brown", customer_phone:"+19541110001", status:"sent", total_amount:4400, created_at:"2026-06-18T10:00:00Z",
      items:[{ name:"Interior walls (1,800 sq ft @ $2)", qty:1800, unit_price:2, total:3600 }, { name:"Trim & baseboards", qty:1, unit_price:500, total:500 }, { name:"Materials (BM Paint + primer)", qty:1, unit_price:300, total:300 }] },
    { id:"q2", customer_name:"Sandra Lima", customer_phone:"+13301110003", status:"draft", total_amount:8500, created_at:"2026-06-19T09:00:00Z",
      items:[{ name:"Commercial walls (2,500 sq ft @ $2)", qty:2500, unit_price:2, total:5000 }, { name:"Ceiling (2,500 sq ft @ $1.20)", qty:2500, unit_price:1.2, total:3000 }, { name:"Weekend surcharge", qty:1, unit_price:500, total:500 }] },
  ],
};

/* ─────────────────────────────── CLEANING ─────────────────────────────── */
const cleaningData: NichoData = {
  key: "cleaning", label: "Cleaning", emoji: "🧹", tagline: "Residential · Commercial · Deep Clean · Move In/Out",
  company: "SparkClean Services", phone: "+1 (305) 555-0400",
  agentName: "Lena", agentDesc: "Book recurring cleaning contracts, upsell deep cleans, manage client schedule.",
  location: "Miami-Dade County, FL",
  kpis: { conversas: 14, aiRate: "91%", pipeline: "$4.2k/mo", revenue: "$18k/mo", trend: "+22%" },
  mensagens: [
    { id:"cl1", numero:"13055550001", nome:"Rachel Green", direcao:"entrada", autor:"contato", texto:"I need a cleaning service for my 3-bedroom house. How does it work?", quando: m(10) },
    { id:"cl2", numero:"13055550001", nome:"Rachel Green", direcao:"saida", autor:"ia", texto:"Hi Rachel! 👋 We do weekly, bi-weekly or monthly cleanings. For a 3-bed house, we typically charge $150–$220/visit. Everything included — products, equipment, insured cleaners. Want to schedule a first visit?", quando: m(9) },
    { id:"cl3", numero:"13055550001", nome:"Rachel Green", direcao:"entrada", autor:"contato", texto:"Bi-weekly sounds perfect! Do you work on Saturdays?", quando: m(4) },
    { id:"cl4", numero:"17865550002", nome:"Jennifer Alvarez", direcao:"entrada", autor:"contato", texto:"I'm moving out of my apartment next week. Need a deep move-out clean. The whole place is a mess.", quando: m(60) },
    { id:"cl5", numero:"17865550002", nome:"Jennifer Alvarez", direcao:"saida", autor:"ia", texto:"Hi Jennifer! Move-out cleans are our specialty — we make sure you get your deposit back! For an apartment, pricing starts at $200. How many beds/baths and sq ft?", quando: m(58) },
    { id:"cl6", numero:"17865550002", nome:"Jennifer Alvarez", direcao:"entrada", autor:"contato", texto:"2 bed 2 bath, about 950 sq ft. When can you come?", quando: m(50) },
    { id:"cl7", numero:"17865550002", nome:"Jennifer Alvarez", direcao:"saida", autor:"ia", texto:"For 950 sq ft move-out clean, $250 all included. We have availability Tuesday or Wednesday next week. Which works better?", quando: m(48) },
    { id:"cl8", numero:"13052220003", nome:"Marcos Oliveira", direcao:"entrada", autor:"contato", texto:"Oi! Preciso de faxina toda semana no meu escritório. São 3 salas e recepção, umas 600 sq ft.", quando: m(120) },
    { id:"cl9", numero:"13052220003", nome:"Marcos Oliveira", direcao:"saida", autor:"ia", texto:"Oi Marcos! Para escritório 600 sq ft semanal, fica por volta de $160/semana. Inclui tudo, somos segurados e confiáveis. Posso agendar uma visita para avaliar?", quando: m(118) },
    { id:"cl10", numero:"19542220004", nome:"Susan Parker", direcao:"entrada", autor:"contato", texto:"Do you do Airbnb turnovers? I have 3 units that need cleaning between every guest.", quando: m(40) },
  ],
  cards: [
    { id:"cc1", numero:"13055550001", nome:"Rachel Green", status:"negociando", ultima_mensagem:"Do you work on Saturdays?", ultima_em: m(4), valor:220, observacao:"Bi-weekly 3-bed. Wants Saturdays. Recurring client." },
    { id:"cc2", numero:"17865550002", nome:"Jennifer Alvarez", status:"negociando", ultima_mensagem:"Tuesday or Wednesday?", ultima_em: m(48), valor:250, observacao:"Move-out clean. 2/2 950 sq ft." },
    { id:"cc3", numero:"13052220003", nome:"Marcos Oliveira", status:"conversas", ultima_mensagem:"Posso agendar visita?", ultima_em: m(118), valor:160, observacao:"Weekly office 600 sq ft. Recurring." },
    { id:"cc4", numero:"19542220004", nome:"Susan Parker", status:"negociando", ultima_mensagem:"3 Airbnb units between guests", ultima_em: m(40), valor:480, observacao:"Airbnb turnovers x3 units. High value recurring!" },
    { id:"cc5", numero:"17861110005", nome:"Amy Chen", status:"ganho", ultima_mensagem:"Love the team! See you every other week 💚", ultima_em: m(2880), valor:180, observacao:"Bi-weekly 4-bed. Active recurring contract." },
    { id:"cc6", numero:"13059990006", nome:"Carlos Martinez", status:"ganho", ultima_mensagem:"Perfect as always!", ultima_em: m(1440), valor:200, observacao:"Weekly recurring since January." },
    { id:"cc7", numero:"17867770007", nome:"Diana Ross", status:"ganho", ultima_mensagem:"Best cleaning service in Miami!", ultima_em: m(720), valor:160, observacao:"Monthly deep clean. 5-star Google review." },
  ],
  services: [
    { id:"s1", name:"Regular Cleaning", category:"Residential", duration_minutes:180, price:180, description:"Weekly or bi-weekly. All products included." },
    { id:"s2", name:"Deep Cleaning", category:"Residential", duration_minutes:360, price:320, description:"One-time thorough clean. Inside appliances, baseboards, cabinets." },
    { id:"s3", name:"Move In/Out Clean", category:"Specialty", duration_minutes:300, price:280, description:"Guarantee deposit return. Full clean top to bottom." },
    { id:"s4", name:"Airbnb Turnover", category:"Short-Term Rental", duration_minutes:120, price:120, description:"Fast between-guest clean. Restocking optional." },
    { id:"s5", name:"Office Cleaning", category:"Commercial", duration_minutes:120, price:160, description:"Weekly office clean. After-hours available." },
    { id:"s6", name:"Post-Construction Clean", category:"Specialty", duration_minutes:480, price:450, description:"Remove dust, debris and construction residue." },
  ],
  professionals: [
    { id:"p1", name:"Carla Souza", specialty:"Deep Clean & Move-Out" },
    { id:"p2", name:"Rita Mendes", specialty:"Residential Recurring" },
    { id:"p3", name:"Patrícia Lima", specialty:"Commercial & Airbnb" },
  ],
  appointments: [
    { id:"a1", title:"Bi-weekly — Amy Chen", professional:"Rita Mendes", customer:"Amy Chen", date:"2026-06-19", slot:"09:00", status:"em_andamento", address:"1200 Brickell Bay Dr, Miami FL", value:180, service:"Regular Cleaning" },
    { id:"a2", title:"Move-Out — Jennifer Alvarez", professional:"Carla Souza", customer:"Jennifer Alvarez", date:"2026-06-24", slot:"08:00", status:"agendado", address:"456 SW 2nd Ave, Miami FL", value:250, service:"Move In/Out Clean" },
    { id:"a3", title:"Weekly Office — Marcos Oliveira", professional:"Patrícia Lima", customer:"Marcos Oliveira", date:"2026-06-20", slot:"18:00", status:"agendado", address:"100 SE 2nd St, Miami FL", value:160, service:"Office Cleaning" },
  ],
  financial: [
    { id:"clf1", type:"entrada", description:"Amy Chen — Bi-weekly x4 visits", amount:720, date:"2026-06-14", category:"Recorrente", status:"confirmado" },
    { id:"clf2", type:"entrada", description:"Carlos Martinez — Weekly x4 visits", amount:800, date:"2026-06-14", category:"Recorrente", status:"confirmado" },
    { id:"clf3", type:"entrada", description:"Diana Ross — Deep clean", amount:320, date:"2026-06-11", category:"Job avulso", status:"confirmado" },
    { id:"clf4", type:"saida", description:"Cleaning supplies — monthly stock", amount:380, date:"2026-06-01", category:"Material", status:"confirmado" },
    { id:"clf5", type:"saida", description:"Team wages — week 06/09", amount:2100, date:"2026-06-13", category:"Mão de obra", status:"confirmado" },
  ],
  quotes: [
    { id:"q1", customer_name:"Rachel Green", customer_phone:"+13055550001", status:"sent", total_amount:2160, created_at:"2026-06-18T10:00:00Z",
      items:[{ name:"Bi-weekly cleaning (12x $180/visit)", qty:12, unit_price:180, total:2160 }] },
    { id:"q2", customer_name:"Susan Parker", customer_phone:"+19542220004", status:"draft", total_amount:1440, created_at:"2026-06-19T09:00:00Z",
      items:[{ name:"Airbnb turnover — Unit 1 (est. 8x/month)", qty:8, unit_price:120, total:960 }, { name:"Airbnb turnover — Units 2 & 3 (est. 4x each)", qty:8, unit_price:120, total:960 }] },
  ],
};

/* ─────────────────────────────── LANDSCAPING ──────────────────────────── */
const landscapingData: NichoData = {
  key: "landscaping", label: "Landscaping", emoji: "🌿", tagline: "Lawn Care · Design · Irrigation · Tree Service",
  company: "Verde Lawn & Landscape", phone: "+1 (305) 555-0500",
  agentName: "Gus", agentDesc: "Book lawn maintenance contracts, upsell landscape design and irrigation.",
  location: "Miami-Dade & Broward County, FL",
  kpis: { conversas: 12, aiRate: "88%", pipeline: "$12k/mo", revenue: "$22k/mo", trend: "+18%" },
  mensagens: [
    { id:"l1", numero:"13053330001", nome:"William Scott", direcao:"entrada", autor:"contato", texto:"I need someone to maintain my lawn weekly. About a quarter acre. What do you charge?", quando: m(20) },
    { id:"l2", numero:"13053330001", nome:"William Scott", direcao:"saida", autor:"ia", texto:"Hi William! For a quarter-acre weekly lawn service (mow, edge, blow), we typically charge $80–$120/week. Want a free on-site estimate?", quando: m(18) },
    { id:"l3", numero:"13053330001", nome:"William Scott", direcao:"entrada", autor:"contato", texto:"That sounds fair. Can you come Saturday morning?", quando: m(5) },
    { id:"l4", numero:"17864440002", nome:"Barbara King", direcao:"entrada", autor:"contato", texto:"I want to completely redo my backyard. New sod, plants, maybe a small water feature. Who do I talk to?", quando: m(90) },
    { id:"l5", numero:"17864440002", nome:"Barbara King", direcao:"saida", autor:"ia", texto:"Hi Barbara! That sounds like a beautiful project! We do full landscape design and installation. Our designer will come for a FREE consultation and bring a 3D rendering of the new backyard. Interested?", quando: m(88) },
    { id:"l6", numero:"17864440002", nome:"Barbara King", direcao:"entrada", autor:"contato", texto:"3D rendering?! Yes please!! When can he come?", quando: m(80) },
    { id:"l7", numero:"13054440003", nome:"Pedro Gomes", direcao:"entrada", autor:"contato", texto:"Oi! Tenho uma empresa com muito terreno aqui. Preciso de corte toda semana. São uns 2 acres. Vcs fazem comercial?", quando: m(35) },
    { id:"l8", numero:"13054440003", nome:"Pedro Gomes", direcao:"saida", autor:"ia", texto:"Oi Pedro! Claro, fazemos manutenção comercial. Para 2 acres semanais ficaria entre $350–$500/semana dependendo do terreno. Posso mandar alguém avaliar essa semana?", quando: m(33) },
    { id:"l9", numero:"19548880004", nome:"Nancy White", direcao:"entrada", autor:"contato", texto:"My sprinkler system is broken. Half the zones don't work. Do you fix irrigation?", quando: m(150) },
    { id:"l10", numero:"19548880004", nome:"Nancy White", direcao:"saida", autor:"ia", texto:"Hi Nancy! Yes, we do irrigation repair and installation. Sounds like a zone valve or controller issue. We can diagnose it tomorrow. Want to schedule a service call?", quando: m(148) },
  ],
  cards: [
    { id:"lc1", numero:"13053330001", nome:"William Scott", status:"negociando", ultima_mensagem:"Can you come Saturday morning?", ultima_em: m(5), valor:80, observacao:"Weekly lawn 1/4 acre. Convert to recurring contract." },
    { id:"lc2", numero:"17864440002", nome:"Barbara King", status:"negociando", ultima_mensagem:"Yes please!! When can he come?", ultima_em: m(80), valor:8500, observacao:"Full backyard redesign with sod, plants, water feature." },
    { id:"lc3", numero:"13054440003", nome:"Pedro Gomes", status:"conversas", ultima_mensagem:"Posso mandar alguém avaliar?", ultima_em: m(33), valor:400, observacao:"Commercial 2 acres weekly. High recurring value." },
    { id:"lc4", numero:"19548880004", nome:"Nancy White", status:"conversas", ultima_mensagem:"Schedule irrigation service call", ultima_em: m(148), valor:380, observacao:"Irrigation repair. Zone valves or controller." },
    { id:"lc5", numero:"17861110005", nome:"Robert Johnson", status:"ganho", ultima_mensagem:"Lawn looks perfect every week!", ultima_em: m(2880), valor:95, observacao:"Weekly contract. Client since March. Very happy." },
    { id:"lc6", numero:"13059990006", nome:"Elena Cruz", status:"ganho", ultima_mensagem:"New landscape is stunning 😍", ultima_em: m(1440), valor:14000, observacao:"Landscape redesign completed. 5 stars." },
    { id:"lc7", numero:"17867770007", nome:"Chris Thompson", status:"ganho", ultima_mensagem:"Contract renewed for another year!", ultima_em: m(720), valor:350, observacao:"Annual commercial contract renewed." },
  ],
  services: [
    { id:"s1", name:"Weekly Lawn Maintenance", category:"Recurring", duration_minutes:90, price:95, description:"Mow, edge, blow. Price per visit." },
    { id:"s2", name:"Landscape Design & Install", category:"Design", duration_minutes:960, price:0, description:"Custom design with 3D rendering + full installation." },
    { id:"s3", name:"Sod Installation", category:"Installation", duration_minutes:480, price:1.2, description:"Per sq ft. Bahia, St Augustine or Zoysia." },
    { id:"s4", name:"Irrigation Repair", category:"Irrigation", duration_minutes:120, price:150, description:"Diagnose and fix broken zones, heads or controllers." },
    { id:"s5", name:"Tree Trimming", category:"Tree Service", duration_minutes:180, price:250, description:"Per tree. Prune, shape and haul debris." },
    { id:"s6", name:"Fertilization & Pest Control", category:"Lawn Care", duration_minutes:60, price:80, description:"Liquid fertilizer + pest treatment. Monthly or quarterly." },
  ],
  professionals: [
    { id:"p1", name:"José Verde", specialty:"Landscape Design" },
    { id:"p2", name:"Renato Campos", specialty:"Lawn Maintenance" },
    { id:"p3", name:"Alex Martins", specialty:"Irrigation & Trees" },
  ],
  appointments: [
    { id:"a1", title:"Design Consult — Barbara King", professional:"José Verde", customer:"Barbara King", date:"2026-06-20", slot:"10:00", status:"confirmado", address:"5300 SW 62nd Ave, Miami FL", value:0, service:"Landscape Design & Install" },
    { id:"a2", title:"Weekly Lawn — Robert Johnson", professional:"Renato Campos", customer:"Robert Johnson", date:"2026-06-19", slot:"08:00", status:"em_andamento", address:"2100 NW 29th St, Miami FL", value:95, service:"Weekly Lawn Maintenance" },
    { id:"a3", title:"Irrigation Repair — Nancy White", professional:"Alex Martins", customer:"Nancy White", date:"2026-06-20", slot:"09:00", status:"agendado", address:"8800 Kendall Dr, Miami FL", value:380, service:"Irrigation Repair" },
  ],
  financial: [
    { id:"lf1", type:"entrada", description:"Elena Cruz — Landscape redesign final payment", amount:14000, date:"2026-06-12", category:"Job completo", status:"confirmado" },
    { id:"lf2", type:"entrada", description:"Recurring clients — June maintenance", amount:4200, date:"2026-06-07", category:"Recorrente", status:"confirmado" },
    { id:"lf3", type:"saida", description:"Plants, sod & materials", amount:3200, date:"2026-06-10", category:"Material", status:"confirmado" },
    { id:"lf4", type:"saida", description:"Crew wages — week 06/09", amount:2600, date:"2026-06-13", category:"Mão de obra", status:"confirmado" },
  ],
  quotes: [
    { id:"q1", customer_name:"Barbara King", customer_phone:"+17864440002", status:"sent", total_amount:8500, created_at:"2026-06-18T10:00:00Z",
      items:[{ name:"St Augustine sod (1,200 sq ft)", qty:1200, unit_price:1.5, total:1800 }, { name:"Plants & tropical design", qty:1, unit_price:3200, total:3200 }, { name:"Paver border 80 linear ft", qty:80, unit_price:22, total:1760 }, { name:"Water feature installation", qty:1, unit_price:1740, total:1740 }] },
    { id:"q2", customer_name:"Pedro Gomes", customer_phone:"+13054440003", status:"draft", total_amount:1600, created_at:"2026-06-19T09:00:00Z",
      items:[{ name:"Weekly commercial lawn 2 acres (4x $400)", qty:4, unit_price:400, total:1600 }] },
  ],
};

/* ─────────────────────────────── EXPORT ───────────────────────────────── */
export const NICHOS: Record<NichoKey, NichoData> = {
  flooring: flooringData,
  roofing: roofingData,
  painting: paintingData,
  cleaning: cleaningData,
  landscaping: landscapingData,
};

export const NICHO_LIST: NichoKey[] = ["flooring", "roofing", "painting", "cleaning", "landscaping"];

// Kanban stage templates por perfil
export const KANBAN_TEMPLATES: Record<string, { label: string; cor: string }[]> = {
  "quote-first": [
    { label: "Novo Lead", cor: "#3b82f6" },
    { label: "Visita Agendada", cor: "#8b5cf6" },
    { label: "Orçamento Enviado", cor: "#f59e0b" },
    { label: "Negociando", cor: "#f97316" },
    { label: "Job Fechado", cor: "#0efa71" },
    { label: "Executando", cor: "#06b6d4" },
    { label: "Concluído", cor: "#a3a3a3" },
    { label: "Perdido", cor: "#ef4444" },
  ],
  "recurring": [
    { label: "Novo Lead", cor: "#3b82f6" },
    { label: "Trial Agendado", cor: "#8b5cf6" },
    { label: "Proposta Enviada", cor: "#f59e0b" },
    { label: "Cliente Ativo", cor: "#0efa71" },
    { label: "Inativo (Risco)", cor: "#f97316" },
    { label: "Perdido", cor: "#ef4444" },
  ],
};

export const NICHO_KANBAN: Record<NichoKey, string> = {
  flooring: "quote-first",
  roofing: "quote-first",
  painting: "quote-first",
  cleaning: "recurring",
  landscaping: "recurring",
};
