import { createFileRoute } from "@tanstack/react-router";
import { brand } from "@/config/brand";
import { supportWhatsapp } from "@/config/brand";
import { useEffect, useState } from "react";
import { useI18n, LANG_OPTIONS, type Lang } from "@/lib/i18n";
import {
  Zap, Check, MessageSquareText, Bot, KanbanSquare, Calendar,
  FileText, BarChart3, ArrowRight, Plus, Minus, Play,
  Globe, Star, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/lp")({
  head: () => ({
    meta: [
      { title: `${brand.name} — O CRM com IA que fecha mais negócios` },
      { name: "description", content: "A IA atende, qualifica e organiza cada lead do Instagram, Facebook e WhatsApp — 24/7. Pipeline, agenda, orçamentos e relatórios num só lugar. Feito para negócios de serviço." },
      { property: "og:title", content: `${brand.name} — IA + CRM para negócios de serviço` },
      { property: "og:description", content: "Atenda cada lead na hora e feche mais negócios. A IA responde por você; você só aparece pra fechar." },
    ],
  }),
  component: Landing,
});

/* ── LP translations ────────────────────────────── */
const LP = {
  pt: {
    badge: "CRM com IA para negócios de serviço nos EUA",
    h1a: "Atenda cada lead na hora",
    h1b: "e feche mais negócios",
    h1c: "— a IA cuida do resto.",
    sub: "A IA responde, qualifica e organiza cada lead do Instagram, Facebook e WhatsApp automaticamente. Você só aparece pra fechar.",
    ctaStart: "Solicitar acesso",
    ctaDemo: "Ver demonstração",
    trust: ["Resposta em segundos", "Funciona 24/7", "Sem complicação"],
    statsLabel: ["leads respondidos", "no automático (média)", "pipeline por cliente", "mais conversão"],
    statsVal: ["24/7", "84%", "$18k", "+38%"],
    painTitle: "Lead sem resposta vai pro concorrente.",
    painSub: "A primeira empresa a responder vende sempre. Enquanto você está na obra, no carro ou dormindo, o VeloHUB responde, qualifica e organiza tudo no CRM.",
    howTitle: ["Conecte seus canais", "Configure o agente", "A IA fecha o lead"],
    howDesc: ["Ligue Instagram, Facebook e WhatsApp em poucos cliques. Toda mensagem cai numa caixa só.", "Uma tela com o tom da sua empresa, serviços e preços. Salvou? Já tá atendendo.", "Responde no idioma do cliente, qualifica e move o card no funil. Você só aparece pra fechar."],
    nichoTitle: "Feito para o seu nicho",
    nichoSub: "Cada nicho tem templates de agente, serviços e funil pré-configurados.",
    nichoDemo: "Ver demo interativo",
    featTitle: "Tudo que você precisa, num só lugar",
    featItems: [
      { t: "Inbox unificado", d: "Instagram, Facebook, WhatsApp e SMS numa caixa só. Nenhuma mensagem perdida." },
      { t: "CRM Kanban automático", d: "A IA qualifica e move: Novo Lead → Visita → Orçamento → Fechado." },
      { t: "Orçamentos em 1 clique", d: "Gere e envie propostas profissionais direto na conversa, na hora." },
      { t: "Agenda de jobs", d: "Agende visitas e instalações. O cliente confirma sozinho pela conversa." },
      { t: "Financeiro e jobs", d: "Registre entradas por job, controle pagamentos pendentes e o resultado do mês." },
      { t: "Relatórios de crescimento", d: "Taxa de conversão, pipeline, receita e oportunidades identificadas pela IA." },
    ],
    pricingTitle: "Pronto pra começar?",
    pricingSub: "Sua conta é configurada sob medida pela equipe Velo, conforme o porte da sua operação. Fale com a gente e a gente te coloca pra rodar.",
    pricingCta: "Falar com a Velo",
    testimonials: [
      { n: "Carlos — Flooring, Miami", t: "A IA responde meus leads enquanto eu tô na obra. Fechei 3 contratos novos só na primeira semana." },
      { n: "Ana — Cleaning, Fort Lauderdale", t: "Meus clientes de Airbnb agendam sozinhos. A receita subiu 28% no segundo mês." },
      { n: "Roberto — Roofing, Broward", t: "A IA cuida de toda consulta de storm damage 24/7. Meu pipeline foi de $40k pra $84k em 60 dias." },
    ],
    faqQ: ["Preciso saber mexer com tecnologia?", "Em quais idiomas a IA responde?", "Quais canais o VeloHUB conecta?", "Como começo a usar?"],
    faqA: [
      "Não. A equipe Velo configura tudo pra você e você recebe o acesso pronto. Se você sabe usar o celular, sabe usar o VeloHUB.",
      "A IA responde no mesmo idioma em que o cliente escreveu — inglês, espanhol ou português. Você define o tom e a personalidade.",
      "Instagram DMs, Facebook Messenger e WhatsApp, com SMS a caminho. Toda mensagem chega numa caixa de entrada só.",
      "Fale com a equipe Velo. A gente cria sua conta, configura o agente e te entrega tudo pronto pra rodar.",
    ],
    finalTitle: "Pare de perder lead enquanto trabalha.",
    finalSub: "A IA começa a trabalhar pra você em minutos. Fale com a gente e comece hoje.",
    footerProduct: "Produto",
    footerCompany: "Empresa",
    footerLegal: "Legal",
    footerMade: "Feito para empreendedores brasileiros nos 🇺🇸",
    footerCopy: `© ${new Date().getFullYear()} ${brand.name}. Todos os direitos reservados.`,
    navHow: "Como funciona",
    navFeatures: "Recursos",
    navNichos: "Nichos",
    navPricing: "Começar",
    navFaq: "FAQ",
    login: "Entrar",
    signup: "Solicitar acesso",
    howSection: "Como funciona",
    howTitleSection: "3 passos. Só isso.",
    nichoSection: "Nichos",
    featSection: "Recursos",
    testimonialSection: "Prova social",
    testimonialTitle: "Equipes que pararam de perder lead.",
    pricingSection: "Começar",
    faqSection: "FAQ",
    faqTitle: "Perguntas comuns.",
  },
  en: {
    badge: "AI-powered CRM for service businesses in the USA",
    h1a: "Answer every lead instantly",
    h1b: "and win more jobs",
    h1c: "— the AI handles the rest.",
    sub: "The AI replies, qualifies and organizes every lead from Instagram, Facebook and WhatsApp automatically. You just show up to close.",
    ctaStart: "Request access",
    ctaDemo: "See demo",
    trust: ["Replies in seconds", "Works 24/7", "No hassle"],
    statsLabel: ["leads answered", "on autopilot (avg)", "pipeline per client", "more conversion"],
    statsVal: ["24/7", "84%", "$18k", "+38%"],
    painTitle: "Unanswered leads go to your competitor.",
    painSub: "The first company to respond wins every time. While you're on the job, in the truck, or asleep — VeloHUB replies, qualifies and organizes your CRM.",
    howTitle: ["Connect your channels", "Configure your agent", "AI closes the lead"],
    howDesc: ["Link Instagram, Facebook and WhatsApp in a few clicks. Every message lands in one inbox.", "One screen with your company tone, services and prices. Save it — the AI is already working.", "Replies in your client's language, qualifies, and moves the card in the pipeline. You just show up to close."],
    nichoTitle: "Built for your niche",
    nichoSub: "Each niche has pre-configured agent templates, services and pipeline stages.",
    nichoDemo: "See interactive demo",
    featTitle: "Everything you need, in one place",
    featItems: [
      { t: "Unified inbox", d: "Instagram, Facebook, WhatsApp and SMS in one box. No more ghost leads." },
      { t: "Automatic CRM Kanban", d: "AI qualifies and moves: New Lead → Visit → Quote → Closed." },
      { t: "Quotes in one click", d: "Generate and send professional quotes right in the conversation, instantly." },
      { t: "Job schedule", d: "Schedule visits and installs. Clients confirm right from the chat." },
      { t: "Financials & jobs", d: "Track income per job, pending payments and monthly results." },
      { t: "Growth reports", d: "Conversion rate, pipeline, revenue and opportunities identified by AI." },
    ],
    pricingTitle: "Ready to start?",
    pricingSub: "Your account is set up by the Velo team to match the size of your operation. Talk to us and we'll get you up and running.",
    pricingCta: "Talk to Velo",
    testimonials: [
      { n: "Carlos — Flooring, Miami", t: "The AI responds to my leads in English while I'm on the job site. Closed 3 new contracts in the first week alone." },
      { n: "Ana — Cleaning, Fort Lauderdale", t: "My Airbnb clients book automatically. Revenue went up 28% in the second month." },
      { n: "Roberto — Roofing, Broward", t: "The AI handles all storm damage inquiries 24/7. My pipeline went from $40k to $84k in 60 days." },
    ],
    faqQ: ["Do I need to be tech-savvy?", "What languages does the AI reply in?", "Which channels does VeloHUB connect?", "How do I get started?"],
    faqA: [
      "No. The Velo team sets everything up for you and hands over a ready account. If you can use a phone, you can use VeloHUB.",
      "The AI replies in the same language your client wrote in — English, Spanish or Portuguese. You set the tone and personality.",
      "Instagram DMs, Facebook Messenger and WhatsApp, with SMS on the way. Every message lands in a single inbox.",
      "Talk to the Velo team. We create your account, configure the agent and hand it over ready to run.",
    ],
    finalTitle: "Stop losing leads while you work.",
    finalSub: "The AI starts working for you in minutes. Talk to us and start today.",
    footerProduct: "Product",
    footerCompany: "Company",
    footerLegal: "Legal",
    footerMade: "Made for Brazilian entrepreneurs in 🇺🇸",
    footerCopy: `© ${new Date().getFullYear()} ${brand.name}. All rights reserved.`,
    navHow: "How it works",
    navFeatures: "Features",
    navNichos: "Niches",
    navPricing: "Start",
    navFaq: "FAQ",
    login: "Log in",
    signup: "Request access",
    howSection: "How it works",
    howTitleSection: "3 steps. That's it.",
    nichoSection: "Niches",
    featSection: "Features",
    testimonialSection: "Social proof",
    testimonialTitle: "Teams that stopped losing leads.",
    pricingSection: "Start",
    faqSection: "FAQ",
    faqTitle: "Common questions.",
  },
  es: {
    badge: "CRM con IA para empresas de servicios en EE.UU.",
    h1a: "Responde cada lead al instante",
    h1b: "y gana más trabajos",
    h1c: "— la IA hace el resto.",
    sub: "La IA responde, califica y organiza cada lead de Instagram, Facebook y WhatsApp automáticamente. Tú solo apareces para cerrar.",
    ctaStart: "Solicitar acceso",
    ctaDemo: "Ver demo",
    trust: ["Responde en segundos", "Funciona 24/7", "Sin complicaciones"],
    statsLabel: ["leads respondidos", "en automático (prom.)", "pipeline por cliente", "más conversión"],
    statsVal: ["24/7", "84%", "$18k", "+38%"],
    painTitle: "Un lead sin respuesta se va a la competencia.",
    painSub: "La primera empresa en responder siempre vende. Mientras estás en obra, en el camión o durmiendo — VeloHUB responde, califica y organiza tu CRM.",
    howTitle: ["Conecta tus canales", "Configura tu agente", "La IA cierra el lead"],
    howDesc: ["Conecta Instagram, Facebook y WhatsApp en pocos clics. Cada mensaje llega a una sola bandeja.", "Una pantalla con el tono de tu empresa, servicios y precios. ¿Guardado? Ya está atendiendo.", "Responde en el idioma del cliente, califica y mueve la tarjeta en el pipeline. Tú solo apareces para cerrar."],
    nichoTitle: "Hecho para tu nicho",
    nichoSub: "Cada nicho tiene plantillas de agente, servicios y etapas de pipeline preconfiguradas.",
    nichoDemo: "Ver demo interactivo",
    featTitle: "Todo lo que necesitas, en un solo lugar",
    featItems: [
      { t: "Bandeja unificada", d: "Instagram, Facebook, WhatsApp y SMS en una sola caja. Sin más leads fantasma." },
      { t: "CRM Kanban automático", d: "La IA califica y mueve: Nuevo Lead → Visita → Presupuesto → Cerrado." },
      { t: "Presupuestos en 1 clic", d: "Genera y envía presupuestos profesionales directo en la conversación, al instante." },
      { t: "Agenda de trabajos", d: "Programa visitas e instalaciones. El cliente confirma desde el chat." },
      { t: "Finanzas y trabajos", d: "Registra ingresos por trabajo, pagos pendientes y resultado mensual." },
      { t: "Reportes de crecimiento", d: "Tasa de conversión, pipeline, ingresos y oportunidades identificadas por IA." },
    ],
    pricingTitle: "¿Listo para empezar?",
    pricingSub: "Tu cuenta la configura el equipo Velo según el tamaño de tu operación. Habla con nosotros y te ponemos a funcionar.",
    pricingCta: "Hablar con Velo",
    testimonials: [
      { n: "Carlos — Flooring, Miami", t: "La IA responde a mis leads en inglés mientras estoy en obra. Cerré 3 contratos nuevos en la primera semana." },
      { n: "Ana — Cleaning, Fort Lauderdale", t: "Mis clientes de Airbnb agendan solos. Los ingresos subieron 28% en el segundo mes." },
      { n: "Roberto — Roofing, Broward", t: "La IA maneja todas las consultas de daños por tormenta 24/7. Mi pipeline pasó de $40k a $84k en 60 días." },
    ],
    faqQ: ["¿Necesito saber de tecnología?", "¿En qué idiomas responde la IA?", "¿Qué canales conecta VeloHUB?", "¿Cómo empiezo?"],
    faqA: [
      "No. El equipo Velo configura todo por ti y recibes la cuenta lista. Si sabes usar el celular, sabes usar VeloHUB.",
      "La IA responde en el mismo idioma en que el cliente escribió — inglés, español o portugués. Tú defines el tono y la personalidad.",
      "Instagram DMs, Facebook Messenger y WhatsApp, con SMS en camino. Cada mensaje llega a una sola bandeja.",
      "Habla con el equipo Velo. Creamos tu cuenta, configuramos el agente y te lo entregamos listo para usar.",
    ],
    finalTitle: "Deja de perder leads mientras trabajas.",
    finalSub: "La IA empieza a trabajar para ti en minutos. Habla con nosotros y empieza hoy.",
    footerProduct: "Producto",
    footerCompany: "Empresa",
    footerLegal: "Legal",
    footerMade: "Hecho para emprendedores brasileños en 🇺🇸",
    footerCopy: `© ${new Date().getFullYear()} ${brand.name}. Todos los derechos reservados.`,
    navHow: "Cómo funciona",
    navFeatures: "Funciones",
    navNichos: "Nichos",
    navPricing: "Empezar",
    navFaq: "FAQ",
    login: "Iniciar sesión",
    signup: "Solicitar acceso",
    howSection: "Cómo funciona",
    howTitleSection: "3 pasos. Eso es todo.",
    nichoSection: "Nichos",
    featSection: "Funciones",
    testimonialSection: "Testimonios",
    testimonialTitle: "Equipos que dejaron de perder leads.",
    pricingSection: "Empezar",
    faqSection: "FAQ",
    faqTitle: "Preguntas frecuentes.",
  },
} as const;

const G = "#0efa71";
const BG = "#0a0a0a";
const CARD = "#111111";
const CARD2 = "#171717";
const BORDER = "#1f1f1f";
const BORDER2 = "#262626";
const MUTED = "#737373";
const FG = "#fafafa";

const CONTACT_URL = `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent("Olá! Quero conhecer o VeloHUB para o meu negócio.")}`;

const NICHOS_LP = [
  { key: "flooring", emoji: "🪵", label: "Flooring", sub: "Hardwood · LVP · Tile · Refinishing" },
  { key: "roofing", emoji: "🏠", label: "Roofing", sub: "Shingle · Metal · TPO · Insurance" },
  { key: "painting", emoji: "🎨", label: "Painting", sub: "Interior · Exterior · Commercial" },
  { key: "cleaning", emoji: "🧹", label: "Cleaning", sub: "Residential · Airbnb · Commercial" },
  { key: "landscaping", emoji: "🌿", label: "Landscaping", sub: "Lawn · Design · Irrigation · Trees" },
];

function Landing() {
  const { lang, setLang } = useI18n();
  const lp = LP[lang] ?? LP.en;
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  function goStart() {
    window.location.href = CONTACT_URL;
  }

  useScrollReveal();

  return (
    <div style={{ background: BG, color: FG, fontFamily: "Figtree, system-ui, sans-serif", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── Grain overlay ─────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(at 20% 80%, #fff 1px, transparent 0)", backgroundSize: "3px 3px", opacity: 0.025, pointerEvents: "none", zIndex: 9999, mixBlendMode: "plus-lighter" }} />

      {/* ── Top glow orbs ─────────────────────────── */}
      <div style={{ position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)", width: 900, height: 520, borderRadius: "50%", background: `radial-gradient(circle, rgba(14,250,113,0.10) 0%, transparent 65%)`, filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── HEADER ─────────────────────────────── */}
        <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,10,0.82)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <a href="/lp" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: FG }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: G, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px rgba(14,250,113,0.35)` }}>
                <Zap size={18} color="#050f07" strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>{brand.name}</span>
            </a>

            <nav style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 14, fontWeight: 500, color: MUTED }}>
              <a href="#como" style={{ color: "inherit", textDecoration: "none" }}>{lp.navHow}</a>
              <a href="#nichos" style={{ color: "inherit", textDecoration: "none" }}>{lp.navNichos}</a>
              <a href="#planos" style={{ color: "inherit", textDecoration: "none" }}>{lp.navPricing}</a>
              <a href="#faq" style={{ color: "inherit", textDecoration: "none" }}>{lp.navFaq}</a>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Language switcher */}
              <div style={{ position: "relative", display: "flex", gap: 4, background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 10, padding: "4px 6px" }}>
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setLang(opt.value as Lang)}
                    title={opt.label}
                    style={{ width: 28, height: 28, borderRadius: 7, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", background: lang === opt.value ? BORDER2 : "transparent", transition: "background 0.15s" }}
                  >
                    {opt.flag}
                  </button>
                ))}
              </div>

              <a href="/entrar" style={{ padding: "8px 16px", borderRadius: 9, fontSize: 14, fontWeight: 600, color: MUTED, textDecoration: "none" }}>{lp.login}</a>
              <button
                onClick={goStart}
                style={{ padding: "9px 20px", borderRadius: 9, fontSize: 14, fontWeight: 700, background: G, color: "#050f07", border: "none", cursor: "pointer", boxShadow: `0 0 20px rgba(14,250,113,0.30)` }}
              >
                {lp.signup}
              </button>
            </div>
          </div>
        </header>

        {/* ── HERO ───────────────────────────────── */}
        <section style={{ padding: "100px 24px 80px", textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(14,250,113,0.10)", border: `1px solid rgba(14,250,113,0.22)`, color: G, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 28 }}>
            <Sparkles size={12} />
            {lp.badge.toUpperCase()}
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 20, color: FG }}>
            {lp.h1a}<br />
            <span style={{ color: G }}>{lp.h1b}</span><br />
            {lp.h1c}
          </h1>

          <p style={{ fontSize: 18, color: "rgba(250,250,250,0.55)", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.65 }}>
            {lp.sub}
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
            <button
              onClick={goStart}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: G, color: "#050f07", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", boxShadow: `0 12px 40px rgba(14,250,113,0.35)` }}
            >
              {lp.ctaStart} <ArrowRight size={16} />
            </button>
            <a
              href="/demos"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: CARD, border: `1px solid ${BORDER2}`, color: FG, fontWeight: 600, fontSize: 16, textDecoration: "none" }}
            >
              <Play size={15} /> {lp.ctaDemo}
            </a>
          </div>

          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {lp.trust.map(t => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(250,250,250,0.45)", fontWeight: 500 }}>
                <Check size={13} color={G} /> {t}
              </span>
            ))}
          </div>

          {/* Phone mock */}
          <div style={{ marginTop: 64, display: "flex", justifyContent: "center" }}>
            <PhoneMock lang={lang} />
          </div>
        </section>

        {/* ── STATS ──────────────────────────────── */}
        <section style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: BORDER, borderRadius: 20, overflow: "hidden", border: `1px solid ${BORDER}` }}>
            {lp.statsVal.map((v, i) => (
              <div key={i} style={{ background: CARD, padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: G, letterSpacing: "-0.02em" }}>{v}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{lp.statsLabel[i]}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PAIN ───────────────────────────────── */}
        <section style={{ padding: "60px 24px 80px", textAlign: "center" }}>
          <div className="reveal" data-reveal style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.12, marginBottom: 20, color: FG }}>
              {lp.painTitle}
            </h2>
            <p style={{ fontSize: 17, color: "rgba(250,250,250,0.50)", lineHeight: 1.7 }}>{lp.painSub}</p>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────── */}
        <section id="como" style={{ padding: "60px 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <EyebrowTitle eyebrow={lp.howSection} title={lp.howTitleSection} />
            <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {lp.howTitle.map((t, i) => (
                <div key={i} className="reveal" data-reveal style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 20, padding: "28px 24px", position: "relative" }}>
                  <div style={{ position: "absolute", top: 20, right: 24, fontSize: 48, fontWeight: 900, color: "rgba(250,250,250,0.05)", lineHeight: 1 }}>0{i + 1}</div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(14,250,113,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    {[<MessageSquareText size={20} color={G} />, <Bot size={20} color={G} />, <KanbanSquare size={20} color={G} />][i]}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: FG }}>{t}</h3>
                  <p style={{ fontSize: 14, color: "rgba(250,250,250,0.50)", lineHeight: 1.65 }}>{lp.howDesc[i]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── NICHOS ─────────────────────────────── */}
        <section id="nichos" style={{ padding: "60px 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <EyebrowTitle eyebrow={lp.nichoSection} title={lp.nichoTitle} sub={lp.nichoSub} />
            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14 }}>
              {NICHOS_LP.map((n) => (
                <a
                  key={n.key}
                  href={`/demo/dashboard?n=${n.key}`}
                  className="reveal"
                  data-reveal
                  style={{ display: "block", textDecoration: "none", color: "inherit", borderRadius: 16, border: `1px solid ${BORDER2}`, background: CARD, padding: "20px 18px", transition: "border-color 0.2s, background 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as any).style.borderColor = "rgba(14,250,113,0.35)"; (e.currentTarget as any).style.background = "#151515"; }}
                  onMouseLeave={e => { (e.currentTarget as any).style.borderColor = BORDER2; (e.currentTarget as any).style.background = CARD; }}
                >
                  <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>{n.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, display: "block", marginBottom: 3 }}>{n.label}</span>
                  <span style={{ fontSize: 11, color: MUTED, display: "block" }}>{n.sub}</span>
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: G, fontWeight: 600 }}>
                    {lp.nichoDemo} <ArrowRight size={11} />
                  </div>
                </a>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <a href="/demos" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 10, border: `1px solid ${BORDER2}`, background: CARD, color: FG, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                {lp.nichoDemo} <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────── */}
        <section id="recursos" style={{ padding: "60px 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <EyebrowTitle eyebrow={lp.featSection} title={lp.featTitle} />
            <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {lp.featItems.map((it, i) => (
                <div key={i} className="reveal" data-reveal style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 18, padding: "22px 22px" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(14,250,113,0.10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    {[<MessageSquareText size={19} color={G} />, <KanbanSquare size={19} color={G} />, <FileText size={19} color={G} />, <Calendar size={19} color={G} />, <BarChart3 size={19} color={G} />, <Sparkles size={19} color={G} />][i]}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: FG }}>{it.t}</h3>
                  <p style={{ fontSize: 13.5, color: "rgba(250,250,250,0.50)", lineHeight: 1.6 }}>{it.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING / START ────────────────────── */}
        <section id="planos" style={{ padding: "60px 24px 80px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <EyebrowTitle eyebrow={lp.pricingSection} title={lp.pricingTitle} />
            <div
              className="reveal"
              data-reveal
              style={{ marginTop: 40, borderRadius: 24, padding: "44px 32px", textAlign: "center", background: CARD2, border: `1px solid rgba(14,250,113,0.25)`, boxShadow: `0 30px 80px rgba(14,250,113,0.12)` }}
            >
              <p style={{ fontSize: 17, color: "rgba(250,250,250,0.65)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 28px" }}>{lp.pricingSub}</p>
              <button
                onClick={goStart}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 32px", borderRadius: 14, background: G, color: "#050f07", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", boxShadow: `0 12px 40px rgba(14,250,113,0.35)` }}
              >
                {lp.pricingCta} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ───────────────────────── */}
        <section style={{ padding: "60px 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <EyebrowTitle eyebrow={lp.testimonialSection} title={lp.testimonialTitle} />
            <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {lp.testimonials.map((it: any, i: number) => (
                <div key={i} className="reveal" data-reveal style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 18, padding: "22px 22px" }}>
                  <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={14} color="#facc15" fill="#facc15" />)}
                  </div>
                  <p style={{ fontSize: 15, color: "rgba(250,250,250,0.80)", lineHeight: 1.65, marginBottom: 14 }}>"{it.t}"</p>
                  <div style={{ fontSize: 13, color: MUTED, fontWeight: 600 }}>{it.n}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────── */}
        <section id="faq" style={{ padding: "60px 24px 80px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <EyebrowTitle eyebrow={lp.faqSection} title={lp.faqTitle} />
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 10 }}>
              {lp.faqQ.map((q: string, i: number) => {
                const open = faqOpen === i;
                return (
                  <div key={i} style={{ background: CARD, border: `1px solid ${open ? "rgba(14,250,113,0.25)" : BORDER2}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
                    <button
                      onClick={() => setFaqOpen(open ? null : i)}
                      style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "none", border: "none", cursor: "pointer", color: FG, textAlign: "left", fontSize: 15, fontWeight: 600 }}
                    >
                      {q}
                      <span style={{ width: 28, height: 28, borderRadius: "50%", background: open ? "rgba(14,250,113,0.15)" : BORDER2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: open ? G : MUTED }}>
                        {open ? <Minus size={14} /> : <Plus size={14} />}
                      </span>
                    </button>
                    {open && <div style={{ padding: "0 20px 16px", fontSize: 14, color: "rgba(250,250,250,0.55)", lineHeight: 1.7 }}>{lp.faqA[i]}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────── */}
        <section style={{ padding: "40px 24px 80px" }}>
          <div
            className="reveal"
            data-reveal
            style={{ maxWidth: 900, margin: "0 auto", borderRadius: 28, padding: "64px 32px", textAlign: "center", background: CARD2, border: `1px solid rgba(14,250,113,0.20)`, boxShadow: `0 40px 100px rgba(14,250,113,0.10)`, position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 500, height: 300, background: `radial-gradient(circle, rgba(14,250,113,0.10), transparent 65%)`, filter: "blur(40px)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <h2 style={{ fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 16, color: FG }}>
                {lp.finalTitle}
              </h2>
              <p style={{ fontSize: 17, color: "rgba(250,250,250,0.50)", marginBottom: 36 }}>{lp.finalSub}</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={goStart}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: G, color: "#050f07", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", boxShadow: `0 12px 40px rgba(14,250,113,0.30)` }}
                >
                  {lp.ctaStart} <ArrowRight size={16} />
                </button>
                <a href="/demos" style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: CARD, border: `1px solid ${BORDER2}`, color: FG, fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
                  <Play size={15} /> {lp.ctaDemo}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────── */}
        <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "60px 24px 32px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 32, marginBottom: 48 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: G, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={15} color="#050f07" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 16, color: FG }}>{brand.name}</span>
                </div>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65, maxWidth: 220 }}>
                  {lp.badge}
                </p>
                <div style={{ marginTop: 16, display: "flex", gap: 6 }}>
                  {LANG_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setLang(opt.value as Lang)} title={opt.label} style={{ fontSize: 18, background: lang === opt.value ? "rgba(14,250,113,0.12)" : "transparent", border: "none", borderRadius: 6, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {opt.flag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 14 }}>{lp.footerProduct}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["#como", lp.navHow], ["#nichos", lp.navNichos], ["#planos", lp.navPricing], ["/demos", "Demos"]].map(([href, label]) => (
                    <a key={href} href={href} style={{ fontSize: 13.5, color: MUTED, textDecoration: "none" }}>{label}</a>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 14 }}>{lp.footerCompany}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["#faq", lp.navFaq], ["/entrar", lp.login]].map(([href, label]) => (
                    <a key={href} href={href} style={{ fontSize: 13.5, color: MUTED, textDecoration: "none" }}>{label}</a>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 14 }}>{lp.footerLegal}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["/termos", "Terms"], ["/privacidade", "Privacy"], ["/reembolso", "Refunds"]].map(([href, label]) => (
                    <a key={href} href={href} style={{ fontSize: 13.5, color: MUTED, textDecoration: "none" }}>{label}</a>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(250,250,250,0.25)" }}>{lp.footerCopy}</span>
              <span style={{ fontSize: 12, color: "rgba(250,250,250,0.25)" }}>
                {lp.footerMade} · <a href="https://law.velocitycompany.com.br" target="_blank" rel="noopener noreferrer" style={{ color: G, textDecoration: "none" }}>Velo</a>
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* scroll reveal CSS */}
      <style>{`
        .reveal { opacity: 0; transform: translateY(20px); filter: blur(4px); transition: opacity 0.65s ease, transform 0.65s ease, filter 0.65s ease; }
        .reveal.in { opacity: 1; transform: translateY(0); filter: blur(0); }
        @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; filter: none; transition: none; } }
      `}</style>
    </div>
  );
}

/* ── Phone mock ─────────────────────────────────── */
function PhoneMock({ lang }: { lang: Lang }) {
  const chats = {
    pt: [
      { side: "left", text: "Oi! Vocês fazem piso de madeira no Brickell?" },
      { side: "right", text: "Oi! Sim, atendemos Brickell e região. Hardwood fica em torno de $8–$12/sq ft instalado. Quer um estimate grátis?" },
      { side: "left", text: "Sí, por favor!" },
      { side: "right", text: "¡Perfecto! Puedo coordinar esta semana. ¿Cuántos sq ft aproximadamente?" },
    ],
    en: [
      { side: "left", text: "Hi! Do you do hardwood floors in Brickell?" },
      { side: "right", text: "Hi! Yes, we serve Brickell! Hardwood is typically $8–$12/sq ft installed. Want a FREE in-home estimate?" },
      { side: "left", text: "Yes please! Thursday works." },
      { side: "right", text: "Perfect! I'll confirm Thursday at 2pm. What's the address? 🏡" },
    ],
    es: [
      { side: "left", text: "Hola! ¿Hacen pisos de madera en Brickell?" },
      { side: "right", text: "¡Hola! Sí, atendemos Brickell. El hardwood ronda $8–$12/sq ft instalado. ¿Quieres un estimate gratis?" },
      { side: "left", text: "Yes! Thursday afternoon!" },
      { side: "right", text: "Great! Thursday at 2pm confirmed. What's your address? 🏡" },
    ],
  };
  const msgs = chats[lang];

  return (
    <div style={{ position: "relative", width: 300 }}>
      <div style={{ position: "absolute", inset: -40, borderRadius: "50%", background: `radial-gradient(circle, rgba(14,250,113,0.12), transparent 60%)`, filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", width: 300, borderRadius: 40, padding: 10, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ borderRadius: 32, overflow: "hidden", background: "#0d0d0d", height: 540, display: "flex", flexDirection: "column" }}>
          {/* status bar */}
          <div style={{ padding: "14px 20px 6px", display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            <span>9:41</span><span>●●● 5G</span>
          </div>
          {/* chat header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 10px", background: "#111", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#050f07", flexShrink: 0 }}>V</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: FG }}>{brand.name} AI</div>
              <div style={{ fontSize: 10.5, color: G, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: G, display: "inline-block" }} /> online
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.35)", background: "rgba(14,250,113,0.08)", border: "1px solid rgba(14,250,113,0.16)", padding: "3px 8px", borderRadius: 999 }}>
              <Globe size={9} color={G} /> {lang === "pt" ? "Trilingue" : lang === "es" ? "Trilingüe" : "Trilingual"}
            </div>
          </div>
          {/* messages */}
          <div style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 8, overflowY: "hidden" }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.side === "right" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "78%", padding: "9px 13px", borderRadius: m.side === "right" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", fontSize: 12.5, lineHeight: 1.5, background: m.side === "right" ? `linear-gradient(135deg, #1a7a44, #0efa71)` : "#1f1f1f", color: m.side === "right" ? "#050f07" : FG }}>
                  {m.side === "right" && <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(5,15,7,0.65)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>⚡ AI</div>}
                  {m.text}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "rgba(255,255,255,0.35)", paddingLeft: 4, marginTop: 4 }}>
              <Sparkles size={9} color={G} /> {lang === "pt" ? "respondido em 3s" : lang === "es" ? "respondido en 3s" : "replied in 3s"}
            </div>
          </div>
          {/* input */}
          <div style={{ padding: "10px 12px", display: "flex", gap: 8, alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ flex: 1, height: 34, borderRadius: 999, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", paddingLeft: 14, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
              {lang === "pt" ? "Mensagem" : lang === "es" ? "Mensaje" : "Message"}
            </div>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ArrowRight size={14} color="#050f07" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────── */
function EyebrowTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="reveal" data-reveal style={{ textAlign: "center", marginBottom: 8 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 700, color: G, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 16 }}>
        <span style={{ width: 32, height: 1, background: `rgba(14,250,113,0.5)`, display: "inline-block" }} />
        {eyebrow}
        <span style={{ width: 32, height: 1, background: `rgba(14,250,113,0.5)`, display: "inline-block" }} />
      </div>
      <h2 style={{ fontSize: "clamp(26px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.1, color: FG }}>{title}</h2>
      {sub && <p style={{ fontSize: 15, color: MUTED, marginTop: 10, maxWidth: 480, margin: "10px auto 0" }}>{sub}</p>}
    </div>
  );
}

function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("in"); io.unobserve(e.target); } } },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
