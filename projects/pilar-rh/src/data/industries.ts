export interface Industry {
  id: string;
  name: string;
  description: string;
  positions: string[];
  image?: string;
}

export const industries: Industry[] = [
  {
    id: "industria",
    name: "Indústria",
    description:
      "Recrutamento e gestão de equipes para produção, qualidade, manutenção, logística interna e áreas de apoio industrial.",
    positions: [
      "Operadores de máquina",
      "Auxiliares de produção",
      "Supervisores",
      "Técnicos de manutenção",
      "Analistas de qualidade",
    ],
  },
  {
    id: "logistica",
    name: "Logística e distribuição",
    description:
      "Recrutamento e gestão de equipes para armazenagem, separação, expedição, transporte e apoio administrativo.",
    positions: [
      "Auxiliares de logística",
      "Separadores",
      "Conferentes",
      "Motoristas",
      "Líderes de expedição",
    ],
  },
  {
    id: "varejo",
    name: "Varejo",
    description:
      "Profissionais para atendimento, caixa, reposição, estoque e gestão de loja em redes e unidades individuais.",
    positions: [
      "Vendedores",
      "Operadores de caixa",
      "Repositores",
      "Líderes de loja",
      "Gerentes comerciais",
    ],
  },
  {
    id: "saude",
    name: "Saúde",
    description:
      "Apoio para clínicas, hospitais e laboratórios com profissionais administrativos, técnicos e de atendimento.",
    positions: [
      "Recepcionistas",
      "Auxiliares administrativos",
      "Técnicos de enfermagem",
      "Faturistas",
      "Coordenadores de unidade",
    ],
  },
  {
    id: "servicos",
    name: "Serviços",
    description:
      "Profissionais para empresas de facilities, limpeza, portaria, manutenção predial e serviços especializados.",
    positions: [
      "Auxiliares de limpeza",
      "Porteiros",
      "Zeladores",
      "Recepcionistas",
      "Encarregados",
    ],
  },
  {
    id: "construcao",
    name: "Construção",
    description:
      "Recrutamento para obras, reformas e projetos com profissionais qualificados em diferentes etapas.",
    positions: [
      "Pedreiros",
      "Eletricistas",
      "Encanadores",
      "Mestres de obra",
      "Engenheiros de campo",
    ],
  },
  {
    id: "agronegocio",
    name: "Agronegócio",
    description:
      "Apoio para safras, processamento, armazéns e operações rurais com trabalhadores temporários e permanentes.",
    positions: [
      "Trabalhadores rurais",
      "Operadores de colheitadeira",
      "Técnicos agrícolas",
      "Auxiliares de armazém",
      "Motoristas agrícolas",
    ],
  },
  {
    id: "escritorios",
    name: "Administração e escritórios",
    description:
      "Profissionais para rotinas administrativas, financeiras, contábeis, jurídicas e de apoio corporativo.",
    positions: [
      "Assistentes administrativos",
      "Analistas financeiros",
      "Auxiliares contábeis",
      "Secretárias executivas",
      "Recepcionistas",
    ],
  },
];
