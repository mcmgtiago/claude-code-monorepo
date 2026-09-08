export const ROUTES = {
  home: "/",
  companies: "/empresas",
  candidates: "/candidatos",
  jobs: "/vagas",
  jobDetail: (slug: string) => `/vagas/${slug}`,
  about: "/sobre",
  insights: "/conteudos",
  contact: "/contato",
  privacy: "/privacidade",
  terms: "/termos",
} as const;

export const navLinks = [
  { label: "Para empresas", href: ROUTES.companies },
  { label: "Para profissionais", href: ROUTES.candidates },
  { label: "Vagas", href: ROUTES.jobs },
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: ROUTES.about },
  { label: "Conteúdos", href: ROUTES.insights },
] as const;
