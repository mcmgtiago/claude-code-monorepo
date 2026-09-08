import type { TenantConfig } from "@/config/tenantTypes";

export type PexelsMediaSet = TenantConfig["media"] & {
  name: string;
  description: string;
};

export const pexelsMediaSets: PexelsMediaSet[] = [
  {
    setId: "premium-urbano",
    name: "Premium urbano",
    description: "Visual escuro, técnico e moderno para atendimento rápido em centros urbanos.",
    hero: {
      type: "video",
      src: "https://videos.pexels.com/video-files/6195711/6195711-uhd_2560_1440_25fps.mp4",
      poster: "https://images.pexels.com/photos/6195125/pexels-photo-6195125.jpeg?auto=compress&cs=tinysrgb&w=1800",
      alt: "Profissional equipado realizando controle técnico em ambiente urbano",
      photographer: "Pexels",
      href: "https://www.pexels.com/",
    },
    gallery: [
      { src: "https://images.pexels.com/photos/6195122/pexels-photo-6195122.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Técnico aplicando produto em ambiente residencial", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Limpeza profissional em cozinha", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Profissional com equipamento de proteção", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Ambiente higienizado após controle de pragas", photographer: "Pexels", href: "https://www.pexels.com/" }
    ],
    og: { src: "https://images.pexels.com/photos/6195125/pexels-photo-6195125.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop", alt: "Dedetização premium urbana", photographer: "Pexels", href: "https://www.pexels.com/" },
  },
  {
    setId: "residencial-familiar",
    name: "Residencial familiar",
    description: "Casa limpa, segurança para família e pets, com tom acolhedor.",
    hero: {
      type: "image",
      src: "https://images.pexels.com/photos/4107284/pexels-photo-4107284.jpeg?auto=compress&cs=tinysrgb&w=1800",
      poster: "https://images.pexels.com/photos/4107284/pexels-photo-4107284.jpeg?auto=compress&cs=tinysrgb&w=1800",
      alt: "Ambiente residencial limpo e seguro para família",
      photographer: "Pexels",
      href: "https://www.pexels.com/",
    },
    gallery: [
      { src: "https://images.pexels.com/photos/4107112/pexels-photo-4107112.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Profissional higienizando ambiente residencial", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/7218525/pexels-photo-7218525.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Casa limpa com pet em segurança", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/6197119/pexels-photo-6197119.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Equipe fazendo inspeção de limpeza", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Aplicação segura em ambiente interno", photographer: "Pexels", href: "https://www.pexels.com/" }
    ],
    og: { src: "https://images.pexels.com/photos/4107284/pexels-photo-4107284.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop", alt: "Controle de pragas residencial", photographer: "Pexels", href: "https://www.pexels.com/" },
  },
  {
    setId: "emergencia-24h",
    name: "Emergência 24h",
    description: "Visual dramático para serviços urgentes, com CTA forte e contraste alto.",
    hero: {
      type: "video",
      src: "https://videos.pexels.com/video-files/4106998/4106998-uhd_2560_1440_25fps.mp4",
      poster: "https://images.pexels.com/photos/4107098/pexels-photo-4107098.jpeg?auto=compress&cs=tinysrgb&w=1800",
      alt: "Atendimento emergencial de controle e higienização",
      photographer: "Pexels",
      href: "https://www.pexels.com/",
    },
    gallery: [
      { src: "https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Atendimento rápido em área crítica", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Profissional preparando aplicação", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/6195129/pexels-photo-6195129.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Ambiente técnico controlado", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/4107287/pexels-photo-4107287.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Resultado após higienização profissional", photographer: "Pexels", href: "https://www.pexels.com/" }
    ],
    og: { src: "https://images.pexels.com/photos/4107098/pexels-photo-4107098.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop", alt: "Dedetização emergencial 24h", photographer: "Pexels", href: "https://www.pexels.com/" },
  },
  {
    setId: "comercial-industrial",
    name: "Comercial e industrial",
    description: "Autoridade para cozinhas, comércios, condomínios e empresas.",
    hero: {
      type: "image",
      src: "https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=1800",
      poster: "https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=1800",
      alt: "Equipe profissional em ambiente comercial higienizado",
      photographer: "Pexels",
      href: "https://www.pexels.com/",
    },
    gallery: [
      { src: "https://images.pexels.com/photos/4099465/pexels-photo-4099465.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Higienização em área comercial", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/4239119/pexels-photo-4239119.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Inspeção técnica em cozinha", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/6197118/pexels-photo-6197118.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Aplicação profissional em empresa", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/4107277/pexels-photo-4107277.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Ambiente comercial seguro após serviço", photographer: "Pexels", href: "https://www.pexels.com/" }
    ],
    og: { src: "https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop", alt: "Controle de pragas comercial", photographer: "Pexels", href: "https://www.pexels.com/" },
  },
  {
    setId: "clean-saude",
    name: "Clean saúde",
    description: "Estética clara, higiênica e premium para passar confiança e cuidado.",
    hero: {
      type: "image",
      src: "https://images.pexels.com/photos/6197108/pexels-photo-6197108.jpeg?auto=compress&cs=tinysrgb&w=1800",
      poster: "https://images.pexels.com/photos/6197108/pexels-photo-6197108.jpeg?auto=compress&cs=tinysrgb&w=1800",
      alt: "Profissional com equipamento de proteção em ambiente limpo",
      photographer: "Pexels",
      href: "https://www.pexels.com/",
    },
    gallery: [
      { src: "https://images.pexels.com/photos/6197109/pexels-photo-6197109.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Procedimento seguro com EPI", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/6197110/pexels-photo-6197110.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Controle técnico com produto seguro", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/4108714/pexels-photo-4108714.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Ambiente claro e higienizado", photographer: "Pexels", href: "https://www.pexels.com/" },
      { src: "https://images.pexels.com/photos/4239116/pexels-photo-4239116.jpeg?auto=compress&cs=tinysrgb&w=1200", alt: "Profissional explicando procedimento", photographer: "Pexels", href: "https://www.pexels.com/" }
    ],
    og: { src: "https://images.pexels.com/photos/6197108/pexels-photo-6197108.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop", alt: "Dedetização clean e segura", photographer: "Pexels", href: "https://www.pexels.com/" },
  }
];

export function getPexelsMediaSet(setId: string): PexelsMediaSet {
  return pexelsMediaSets.find((set) => set.setId === setId) || pexelsMediaSets[0];
}
