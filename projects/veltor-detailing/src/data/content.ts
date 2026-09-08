/* ====== SINGLE SOURCE OF TRUTH FOR VELTOR DETAILING HOME ====== */

export const brandInfo = {
  name: 'Veltor Detailing',
  tagline: 'Automotive Detailing Studio',
  slogan: 'Precisão em cada detalhe. Excelência em cada acabamento.',
  description: 'Estúdio especializado em estética, proteção e conservação automotiva premium em Goiânia.',
  location: 'Av. Prime, 1240 Jardim Europa, Goiânia — GO',
  phone: '(62) 99999-9999',
  whatsapp: '5562999999999',
  hours: {
    weekdays: 'Segunda a sexta 08:00–18:00',
    saturday: 'Sábado 08:00–14:00',
  },
}

export const services = [
  {
    id: 'vitrificacao',
    title: 'Vitrificação Cerâmica',
    description: 'Proteção avançada para pintura com brilho intenso, maior resistência e facilidade de manutenção.',
    cta: 'Conhecer vitrificação',
  },
  {
    id: 'polimento',
    title: 'Polimento Técnico',
    description: 'Correção profissional de marcas, micro riscos e imperfeições para recuperar profundidade e reflexo da pintura.',
    cta: 'Conhecer polimento',
  },
  {
    id: 'detalhamento-interno',
    title: 'Detalhamento Interno',
    description: 'Limpeza e revitalização profunda de bancos, couro, carpetes, painéis e superfícies internas.',
    cta: 'Mais detalhes',
  },
  {
    id: 'higienizacao',
    title: 'Higienização',
    description: 'Tratamento completo do interior para remover sujeiras, odores e contaminantes de forma profissional.',
    cta: 'Saiba mais',
  },
  {
    id: 'ppf',
    title: 'PPF',
    description: 'Filme transparente de proteção para áreas vulneráveis da pintura contra impactos e pequenas agressões.',
    cta: 'Conheça o PPF',
  },
  {
    id: 'detalhamento-premium',
    title: 'Detalhamento Premium',
    description: 'Processo completo de estética automotiva para restaurar e elevar o acabamento do veículo ao máximo padrão.',
    cta: 'Explorar serviço',
  },
]

export const whyItems = [
  {
    number: '01',
    title: 'Diagnóstico Individual',
    description: 'Cada veículo é analisado antes da definição do procedimento específico para garantir melhor resultado.',
  },
  {
    number: '02',
    title: 'Produtos Profissionais',
    description: 'Utilização de produtos selecionados para cada superfície com rigor técnico e qualidade premium.',
  },
  {
    number: '03',
    title: 'Processos Técnicos',
    description: 'Cada etapa segue procedimentos padronizados para consistência e excelência em todos os serviços.',
  },
  {
    number: '04',
    title: 'Ambiente Controlado',
    description: 'Espaço preparado especificamente para serviços de estética e proteção automotiva com ótimas condições.',
  },
  {
    number: '05',
    title: 'Transparência Total',
    description: 'O cliente sabe exatamente qual serviço será realizado, custo e tempo de execução antes de começar.',
  },
  {
    number: '06',
    title: 'Atenção aos Detalhes',
    description: 'Nenhuma etapa é tratada como secundária — cada detalhe recebe o cuidado máximo do início ao fim.',
  },
]

export const processSteps = [
  {
    number: '01',
    title: 'Contato',
    description: 'Cliente entra em contato conosco pelo WhatsApp ou telefone para iniciar o processo.',
  },
  {
    number: '02',
    title: 'Avaliação',
    description: 'Identificamos a condição atual do veículo e suas necessidades específicas de tratamento.',
  },
  {
    number: '03',
    title: 'Recomendação',
    description: 'Indicamos os procedimentos adequados com transparência sobre resultados esperados e investimento.',
  },
  {
    number: '04',
    title: 'Execução',
    description: 'O veículo passa pelo processo técnico em nosso estúdio com máxima atenção e profissionalismo.',
  },
  {
    number: '05',
    title: 'Inspeção',
    description: 'Realizamos conferência final rigorosa para garantir que cada detalhe atende nossos padrões.',
  },
  {
    number: '06',
    title: 'Entrega',
    description: 'Cliente recebe o veículo finalizado e impecável com instruções de manutenção pós-serviço.',
  },
]

export const portfolio = [
  {
    id: 1,
    name: 'Porsche 911',
    service: 'Polimento técnico + Vitrificação cerâmica',
    image: 'portfolio-1',
  },
  {
    id: 2,
    name: 'Mercedes-Benz C63',
    service: 'Detalhamento premium + PPF',
    image: 'portfolio-2',
  },
  {
    id: 3,
    name: 'BMW X5',
    service: 'Higienização interna + Vitrificação',
    image: 'portfolio-3',
  },
  {
    id: 4,
    name: 'Audi RS6',
    service: 'Polimento + Proteção cerâmica completa',
    image: 'portfolio-4',
  },
  {
    id: 5,
    name: 'Range Rover Sport',
    service: 'Detalhamento interior + PPF frontal',
    image: 'portfolio-5',
  },
  {
    id: 6,
    name: 'Ferrari F8',
    service: 'Polimento especial + Vitrificação premium',
    image: 'portfolio-6',
  },
]

export const stats = [
  { value: '+800', label: 'veículos atendidos' },
  { value: '7+', label: 'anos de experiência' },
  { value: '4,9', label: 'avaliação no Google' },
  { value: '98%', label: 'clientes satisfeitos' },
]

export const testimonials = [
  {
    rating: 5,
    text: 'Levei meu carro para realizar polimento e vitrificação e o resultado superou minhas expectativas. Atendimento extremamente profissional e transparente.',
    author: 'Rafael Martins',
    vehicle: 'BMW 330i',
  },
  {
    rating: 5,
    text: 'O nível de atenção aos detalhes é impressionante. O carro ficou melhor do que quando retirei da concessionária. Voltaria com certeza.',
    author: 'Lucas Almeida',
    vehicle: 'Mercedes C200',
  },
  {
    rating: 5,
    text: 'Equipe transparente, cuidadosa e extremamente profissional. Recomendo para qualquer um que se importa com seu veículo.',
    author: 'Felipe Rocha',
    vehicle: 'Porsche Cayman',
  },
]

export const faqItems = [
  {
    question: 'Quanto custa um serviço de estética automotiva?',
    answer: 'O investimento varia conforme o estado do veículo, tamanho e procedimentos necessários. Oferecemos orçamento detalhado e gratuito após avaliação do veículo. Entre em contato pelo WhatsApp para uma triagem inicial.',
  },
  {
    question: 'Quanto tempo demora uma vitrificação?',
    answer: 'O tempo depende da preparação necessária da pintura e do tratamento escolhido. Em média, de 2 a 5 dias úteis para conclusão completa.',
  },
  {
    question: 'Preciso agendar?',
    answer: 'Recomendamos agendamento prévio para garantir disponibilidade e planejar melhor o processo de atendimento.',
  },
  {
    question: 'A vitrificação remove riscos?',
    answer: 'A vitrificação protege a superfície contra futuros danos. Quando existem marcas ou riscos, é necessário realizar correção de pintura antes da aplicação.',
  },
  {
    question: 'Vocês atendem qualquer veículo?',
    answer: 'Sim, atendemos veículos de todos os tamanhos e modelos. O procedimento é definido de acordo com as características e condições específicas de cada veículo.',
  },
  {
    question: 'Posso solicitar orçamento pelo WhatsApp?',
    answer: 'Sim. Nossa equipe pode realizar uma triagem inicial pelo WhatsApp e orientar sobre os próximos passos para agendamento da avaliação.',
  },
]

export const beforeAfterExamples = [
  {
    id: 1,
    label: 'Polimento & Vitrificação',
    before: 'Pintura opaca com marcas de oxidação',
    after: 'Brilho profundo e espelhado',
  },
  {
    id: 2,
    label: 'Detalhamento Interior',
    before: 'Bancos gastos e sujos',
    after: 'Couro revitalizado e impecável',
  },
  {
    id: 3,
    label: 'Higienização Completa',
    before: 'Interior sujo e com odor',
    after: 'Ambiente limpo e fresquejante',
  },
]

export const heroContent = {
  eyebrow: 'AUTOMOTIVE DETAILING STUDIO',
  mainTitle: 'Seu carro merece mais do que estar limpo.',
  highlight: 'Merece estar impecável.',
  subtitle: 'Estética, proteção e conservação automotiva executadas com precisão para elevar cada detalhe do seu veículo ao máximo padrão de excelência.',
  primaryCta: 'Solicitar orçamento',
  secondaryCta: 'Conhecer serviços',
}

export const manifestoContent = {
  eyebrow: 'NOSSO PADRÃO',
  title: 'Detalhes que a maioria não percebe. Nós percebemos.',
  text: 'Para nós, estética automotiva não significa simplesmente lavar um veículo. Cada superfície é analisada, tratada e protegida de acordo com suas características únicas.\n\nTrabalhamos com processos técnicos rigorosos, produtos profissionais selecionados e atenção minuciosa aos detalhes para entregar resultados que podem ser vistos — e sentidos. Cada carro que passa por nossas mãos recebe o tratamento de uma obra de arte automotiva.',
  cta: 'Conheça a Veltor',
}

export const highlightContent = {
  title: 'Brilho impressionante. Proteção além da superfície.',
  description: 'A vitrificação cerâmica é mais do que aparência. É um investimento na longevidade e conservação do seu veículo.',
  benefits: [
    'Maior repelência à água e resistência',
    'Brilho profundo e duradouro',
    'Proteção contra contaminantes ambientais',
    'Manutenção significativamente facilitada',
    'Maior conservação do valor do veículo',
    'Acabamento premium e sofisticado',
  ],
  cta: 'Quero proteger meu veículo',
}

export const ctaContent = {
  title: 'Seu carro pode voltar a impressionar você.',
  subtitle: 'Fale com nossa equipe especializada e descubra qual tratamento é ideal para transformar seu veículo.',
  cta: 'Solicitar orçamento no WhatsApp',
  footnote: 'Resposta rápida durante o horário comercial',
}

export const seoLocalContent = {
  title: 'Estética Automotiva Premium em Goiânia',
  text: 'A Veltor Detailing oferece serviços especializados de estética automotiva em Goiânia, incluindo vitrificação cerâmica, polimento técnico, higienização interna, detalhamento automotivo premium e proteção de pintura (PPF). Atendemos clientes que valorizam conservação, estética e proteção profissional para seus veículos em Goiânia e região.',
}
