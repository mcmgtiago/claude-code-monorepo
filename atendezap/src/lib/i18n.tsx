import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "pt" | "en" | "es";

const T = {
  pt: {
    nav: {
      dashboard: "Dashboard", conversas: "Conversas", crm: "CRM Kanban",
      agente: "Agente IA", agenda: "Agenda", orcamentos: "Orçamentos",
      financeiro: "Financeiro", servicos: "Serviços", contatos: "Contatos",
      equipe: "Equipe", aigrowth: "AI Growth", relatorios: "Relatórios",
      conexao: "Canais", configuracoes: "Configurações",
    },
    sections: {
      atendimento: "Atendimento", negocios: "Negócios", operacoes: "Operações",
      growth: "Growth", config: "Configurações",
    },
    common: {
      save: "Salvar", cancel: "Cancelar", back: "Voltar", next: "Avançar",
      confirm: "Confirmar", delete: "Excluir", edit: "Editar", new: "Novo",
      loading: "Carregando…", saving: "Salvando…", sending: "Enviando…",
      noResults: "Nenhum resultado", search: "Buscar…", optional: "opcional",
      yes: "Sim", no: "Não", close: "Fechar", add: "Adicionar",
      required: "obrigatório", learnMore: "Saiba mais",
    },
    dashboard: {
      title: "Dashboard", subtitle: "Visão geral do seu negócio",
      leadsToday: "Leads hoje", answeredByAI: "Respondidos pela IA",
      activePipeline: "Pipeline ativo", monthRevenue: "Receita (mês)",
      lastMessages: "Últimas mensagens", recentActivity: "atividade recente",
      agentConnected: "Agente conectado", agentOffline: "Agente offline",
    },
    crm: {
      title: "CRM Kanban", subtitle: "Gerencie seus leads e negociações",
      newCard: "Novo card", moveCard: "Mover card",
      cols: { conversas: "Conversas", negociando: "Negociando", ganho: "Ganho", perda: "Perda" },
    },
    agenda: {
      title: "Agenda", subtitle: "Jobs e agendamentos da semana",
      newAppointment: "Novo agendamento", noJobs: "Nenhum job agendado",
      status: { agendado: "Agendado", confirmado: "Confirmado", em_andamento: "Em andamento", concluido: "Concluído", cancelado: "Cancelado" },
    },
    orcamentos: {
      title: "Orçamentos", subtitle: "Crie e envie orçamentos pelo WhatsApp",
      newQuote: "Novo orçamento", sendWhatsApp: "Enviar pelo WhatsApp",
      status: { draft: "Rascunho", sent: "Enviado", accepted: "Aceito", rejected: "Recusado", expired: "Expirado" },
      items: "Itens do orçamento", subtotal: "Subtotal", discount: "Desconto", total: "Total",
      validity: "Validade (dias)", notes: "Observações",
    },
    financeiro: {
      title: "Financeiro", subtitle: "Entradas, saídas e resultado do mês",
      newEntry: "Novo lançamento", income: "Entradas", expense: "Saídas", result: "Resultado",
      all: "Todos", type: { entrada: "Entrada", saida: "Saída" },
    },
    servicos: {
      title: "Serviços", subtitle: "Catálogo de serviços e profissionais",
      newService: "Novo serviço", newPro: "Novo profissional",
      duration: "Duração (min)", price: "Preço ($)", category: "Categoria",
      tabs: { services: "Serviços", professionals: "Profissionais" },
    },
    aigrowth: {
      title: "AI Growth Engine", subtitle: "A IA analisa seu negócio e sugere ações para crescer",
      reanalyze: "Reanalisar", analyzing: "Analisando…", allGood: "Tudo certo por aqui!",
      noOpportunities: "Nenhuma oportunidade imediata identificada. Continue assim!",
      urgency: { high: "Urgente", medium: "Recomendado", low: "Sugestão" },
    },
    onboarding: {
      title: "Configure seu VeloHUB", subtitle: "Leva uns 3 minutos. Você pode ajustar depois.",
      steps: { nicho: "Nicho", empresa: "Empresa", endereco: "Endereço", identidade: "Identidade", agente: "Agente IA", concluir: "Concluir" },
      nichoTitle: "Qual é o seu nicho?", nichoSub: "Vamos pré-configurar tudo baseado no seu tipo de negócio.",
      finishTitle: "Tudo pronto!", finishSub: "Sua conta está pronta. Conecte seu WhatsApp e a IA já começa a atender.",
    },
  },

  en: {
    nav: {
      dashboard: "Dashboard", conversas: "Conversations", crm: "CRM Kanban",
      agente: "AI Agent", agenda: "Schedule", orcamentos: "Quotes",
      financeiro: "Financials", servicos: "Services", contatos: "Contacts",
      equipe: "Team", aigrowth: "AI Growth", relatorios: "Reports",
      conexao: "Channels", configuracoes: "Settings",
    },
    sections: {
      atendimento: "Attendance", negocios: "Business", operacoes: "Operations",
      growth: "Growth", config: "Settings",
    },
    common: {
      save: "Save", cancel: "Cancel", back: "Back", next: "Next",
      confirm: "Confirm", delete: "Delete", edit: "Edit", new: "New",
      loading: "Loading…", saving: "Saving…", sending: "Sending…",
      noResults: "No results", search: "Search…", optional: "optional",
      yes: "Yes", no: "No", close: "Close", add: "Add",
      required: "required", learnMore: "Learn more",
    },
    dashboard: {
      title: "Dashboard", subtitle: "Your business overview",
      leadsToday: "Leads today", answeredByAI: "Answered by AI",
      activePipeline: "Active pipeline", monthRevenue: "Revenue (month)",
      lastMessages: "Latest messages", recentActivity: "recent activity",
      agentConnected: "Agent connected", agentOffline: "Agent offline",
    },
    crm: {
      title: "CRM Kanban", subtitle: "Manage your leads and deals",
      newCard: "New card", moveCard: "Move card",
      cols: { conversas: "Leads", negociando: "Negotiating", ganho: "Won", perda: "Lost" },
    },
    agenda: {
      title: "Schedule", subtitle: "Jobs and appointments this week",
      newAppointment: "New appointment", noJobs: "No jobs scheduled",
      status: { agendado: "Scheduled", confirmado: "Confirmed", em_andamento: "In progress", concluido: "Completed", cancelado: "Cancelled" },
    },
    orcamentos: {
      title: "Quotes", subtitle: "Create and send quotes via WhatsApp",
      newQuote: "New quote", sendWhatsApp: "Send via WhatsApp",
      status: { draft: "Draft", sent: "Sent", accepted: "Accepted", rejected: "Rejected", expired: "Expired" },
      items: "Quote items", subtotal: "Subtotal", discount: "Discount", total: "Total",
      validity: "Valid for (days)", notes: "Notes",
    },
    financeiro: {
      title: "Financials", subtitle: "Income, expenses and monthly result",
      newEntry: "New entry", income: "Income", expense: "Expenses", result: "Net result",
      all: "All", type: { entrada: "Income", saida: "Expense" },
    },
    servicos: {
      title: "Services", subtitle: "Service catalog and team members",
      newService: "New service", newPro: "New professional",
      duration: "Duration (min)", price: "Price ($)", category: "Category",
      tabs: { services: "Services", professionals: "Professionals" },
    },
    aigrowth: {
      title: "AI Growth Engine", subtitle: "AI analyzes your business and suggests growth actions",
      reanalyze: "Reanalyze", analyzing: "Analyzing…", allGood: "Everything looks great!",
      noOpportunities: "No immediate opportunities detected. Keep it up!",
      urgency: { high: "Urgent", medium: "Recommended", low: "Suggestion" },
    },
    onboarding: {
      title: "Set up your VeloHUB", subtitle: "Takes about 3 minutes. You can adjust later.",
      steps: { nicho: "Niche", empresa: "Business", endereco: "Address", identidade: "Branding", agente: "AI Agent", concluir: "Done" },
      nichoTitle: "What's your niche?", nichoSub: "We'll pre-configure everything based on your type of business.",
      finishTitle: "All set!", finishSub: "Your account is ready. Connect WhatsApp and the AI starts working immediately.",
    },
  },

  es: {
    nav: {
      dashboard: "Dashboard", conversas: "Conversaciones", crm: "CRM Kanban",
      agente: "Agente IA", agenda: "Agenda", orcamentos: "Presupuestos",
      financeiro: "Finanzas", servicos: "Servicios", contatos: "Contactos",
      equipe: "Equipo", aigrowth: "IA Growth", relatorios: "Reportes",
      conexao: "Canales", configuracoes: "Configuración",
    },
    sections: {
      atendimento: "Atención", negocios: "Negocios", operacoes: "Operaciones",
      growth: "Growth", config: "Configuración",
    },
    common: {
      save: "Guardar", cancel: "Cancelar", back: "Volver", next: "Siguiente",
      confirm: "Confirmar", delete: "Eliminar", edit: "Editar", new: "Nuevo",
      loading: "Cargando…", saving: "Guardando…", sending: "Enviando…",
      noResults: "Sin resultados", search: "Buscar…", optional: "opcional",
      yes: "Sí", no: "No", close: "Cerrar", add: "Agregar",
      required: "requerido", learnMore: "Más información",
    },
    dashboard: {
      title: "Dashboard", subtitle: "Resumen de tu negocio",
      leadsToday: "Leads hoy", answeredByAI: "Respondidos por IA",
      activePipeline: "Pipeline activo", monthRevenue: "Ingresos (mes)",
      lastMessages: "Últimos mensajes", recentActivity: "actividad reciente",
      agentConnected: "Agente conectado", agentOffline: "Agente desconectado",
    },
    crm: {
      title: "CRM Kanban", subtitle: "Gestiona tus leads y negociaciones",
      newCard: "Nueva tarjeta", moveCard: "Mover tarjeta",
      cols: { conversas: "Leads", negociando: "Negociando", ganho: "Ganado", perda: "Perdido" },
    },
    agenda: {
      title: "Agenda", subtitle: "Trabajos y citas de la semana",
      newAppointment: "Nueva cita", noJobs: "Sin trabajos programados",
      status: { agendado: "Programado", confirmado: "Confirmado", em_andamento: "En progreso", concluido: "Completado", cancelado: "Cancelado" },
    },
    orcamentos: {
      title: "Presupuestos", subtitle: "Crea y envía presupuestos por WhatsApp",
      newQuote: "Nuevo presupuesto", sendWhatsApp: "Enviar por WhatsApp",
      status: { draft: "Borrador", sent: "Enviado", accepted: "Aceptado", rejected: "Rechazado", expired: "Vencido" },
      items: "Ítems del presupuesto", subtotal: "Subtotal", discount: "Descuento", total: "Total",
      validity: "Vigencia (días)", notes: "Notas",
    },
    financeiro: {
      title: "Finanzas", subtitle: "Ingresos, gastos y resultado mensual",
      newEntry: "Nuevo registro", income: "Ingresos", expense: "Gastos", result: "Resultado",
      all: "Todos", type: { entrada: "Ingreso", saida: "Gasto" },
    },
    servicos: {
      title: "Servicios", subtitle: "Catálogo de servicios y profesionales",
      newService: "Nuevo servicio", newPro: "Nuevo profesional",
      duration: "Duración (min)", price: "Precio ($)", category: "Categoría",
      tabs: { services: "Servicios", professionals: "Profesionales" },
    },
    aigrowth: {
      title: "IA Growth Engine", subtitle: "La IA analiza tu negocio y sugiere acciones de crecimiento",
      reanalyze: "Reanalizar", analyzing: "Analizando…", allGood: "¡Todo en orden!",
      noOpportunities: "Sin oportunidades inmediatas detectadas. ¡Sigue así!",
      urgency: { high: "Urgente", medium: "Recomendado", low: "Sugerencia" },
    },
    onboarding: {
      title: "Configura tu VeloHUB", subtitle: "Tarda unos 3 minutos. Puedes ajustar después.",
      steps: { nicho: "Nicho", empresa: "Empresa", endereco: "Dirección", identidade: "Identidad", agente: "Agente IA", concluir: "Finalizar" },
      nichoTitle: "¿Cuál es tu nicho?", nichoSub: "Preconfiguraremos todo según tu tipo de negocio.",
      finishTitle: "¡Todo listo!", finishSub: "Tu cuenta está lista. Conecta WhatsApp y el agente comienza a trabajar.",
    },
  },
} as const;

export type Translations = typeof T.pt;

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void; t: Translations };
const I18nContext = createContext<I18nCtx>({ lang: "pt", setLang: () => {}, t: T.pt });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try { return (localStorage.getItem("lang") as Lang) ?? "pt"; } catch { return "pt"; }
  });

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t: T[lang] as unknown as Translations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() { return useContext(I18nContext); }

export const LANG_OPTIONS: { value: Lang; label: string; flag: string }[] = [
  { value: "pt", label: "Português", flag: "🇧🇷" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇲🇽" },
];
