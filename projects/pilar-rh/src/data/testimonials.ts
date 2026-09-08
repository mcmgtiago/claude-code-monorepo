export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "carolina",
    quote:
      "A equipe da PILAR entendeu nossa urgência sem transformar o processo em uma corrida desorganizada. Tivemos acompanhamento, informação e rapidez.",
    name: "Carolina Mendes",
    role: "Gerente de Recursos Humanos",
    company: "Álvora Varejo",
  },
  {
    id: "marcos",
    quote:
      "Precisávamos ampliar a operação temporariamente e a PILAR cuidou tanto da contratação quanto do atendimento aos trabalhadores.",
    name: "Marcos Ribeiro",
    role: "Diretor de Operações",
    company: "Nortelog",
  },
  {
    id: "fernanda",
    quote:
      "O processo foi claro desde a primeira conversa. Recebemos candidatos compatíveis e conseguimos decidir com mais segurança.",
    name: "Fernanda Lopes",
    role: "Coordenadora Administrativa",
    company: "Clínica Viva",
  },
];
