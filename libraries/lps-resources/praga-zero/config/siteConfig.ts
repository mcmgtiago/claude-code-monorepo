export const siteConfig = {
  company: {
    name: "Praga Zero Dedetização",
    cnpj: "00.000.000/0001-00",
    cnae: "8122-2/00",
    phone: "51999999999",
    phoneFormatted: "(51) 99999-9999",
    email: "contato@pragazero.com.br",
    whatsappMessage:
      "Olá! Vim pelo site e gostaria de um orçamento grátis para dedetização em {cidade}.",
    instagram: "@pragazero",
    facebook: "/pragazero",
    yearsExperience: 15,
    googleRating: 4.9,
    propertiesServed: 2000,
    shortDescription:
      "Empresa especializada em dedetização e controle de pragas urbanas com produtos ANVISA e atendimento 24h.",
  },
  theme: {
    primary: "#25D366",
    danger: "#DC2626",
    warning: "#FCD34D",
    bg: "#FFFFFF",
    text: "#1F2937",
    muted: "#6B7280",
    surface: "#F9FAFB",
  },
  services: [
    { icon: "Bug", title: "Dedetização contra baratas", desc: "Elimina focos e previne retorno" },
    { icon: "Rat", title: "Desratização", desc: "Ratos, ratazanas e rato do telhado" },
    { icon: "Ants", title: "Controle de formigas", desc: "Sem danificar a estrutura" },
    { icon: "Worm", title: "Cupins", desc: "Tratamento de madeira e alvenaria" },
    { icon: "Spider", title: "Escorpiões", desc: "Aplicação segura em ralos e quartos" },
    { icon: "Mosquito", title: "Mosquitos e muriçocas", desc: "Pulverização externa" },
    { icon: "PawPrint", title: "Carrapatos e pulgas", desc: "Tratamento residencial completo" },
    { icon: "Spray", title: "Sanitização de ambientes", desc: "Desinfecção profissional" },
  ],
  differentials: [
    { icon: "ShieldCheck", title: "Produtos ANVISA", desc: "Todos registrados e aprovados" },
    { icon: "PawPrint", title: "Pet friendly", desc: "Seguro para cães e gatos" },
    { icon: "Users", title: "Sem cheiro forte", desc: "Família pode permanecer em casa" },
    { icon: "Clock", title: "Atendimento 24h", desc: "Emergência? A gente vem" },
    { icon: "FileCheck", title: "Garantia escrita", desc: "90 dias — se voltar, voltamos grátis" },
    { icon: "BadgeDollarSign", title: "Orçamento grátis", desc: "Sem compromisso" },
  ],
  testimonials: [
    { name: "João Silva", district: "Centro", rating: 5, text: "Atendimento rápido, resolveu o problema das baratas. Recomendo!" },
    { name: "Maria Oliveira", district: "Jardim Europa", rating: 5, text: "Profissionais cuidadosos com meus cachorros. Voltaram para garantia sem custo." },
    { name: "Carlos Mendes", district: "Vila Nova", rating: 5, text: "Escorpiões sumiram em 24h. Atendimento nota 10." },
    { name: "Ana Pereira", district: "São José", rating: 5, text: "Chegaram no horário marcado e explicaram tudo. Preço justo." },
    { name: "Roberto Lima", district: "Boa Vista", rating: 5, text: "Já é a terceira vez que contrato. Empresa séria." },
  ],
  faq: [
    { q: "Os produtos são seguros?", a: "Sim, todos registrados na ANVISA e pet friendly." },
    { q: "Quanto tempo dura o efeito?", a: "3 a 6 meses, dependendo da praga e do ambiente." },
    { q: "Preciso sair de casa?", a: "Não, mas recomendamos 2h sem crianças e animais no local." },
    { q: "Atendem emergência?", a: "Sim, 24h incluindo finais de semana e feriados." },
    { q: "Tem garantia?", a: "Sim, garantia escrita de 90 dias." },
    { q: "Fazem orçamento grátis?", a: "Sim, sem compromisso. Avaliamos e orçamos em até 30 minutos." },
  ],
  coverage: {
    defaultCity: "Porto Alegre",
    defaultState: "RS",
    neighborhoods: [
      "Centro", "Jardim Europa", "Vila Nova", "São José",
      "Boa Vista", "Petrópolis", "Moinhos", "Bela Vista",
    ],
    regions: ["Centro", "Zona Norte", "Zona Sul", "Zona Leste", "Zona Oeste"],
  },
} as const;

export type SiteConfig = typeof siteConfig;