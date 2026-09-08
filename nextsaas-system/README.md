# NextSaaS System

Sistema de montagem de sites SaaS de alto padrão usando templates reais do bundle NextSaaS (47 templates) como biblioteca de seções.

## Como funciona

1. **Você pede** — descreve o tipo de site, as seções desejadas e o copy/cores
2. **IA seleciona** — com base no catálogo documentado, escolhe as melhores seções de diferentes templates
3. **Montagem** — combina seções reais, aplica os tokens de customização
4. **Resultado** — HTML pronto com seu texto, cores e imagens

## Estrutura do projeto

```
nextsaas-system/
├── templates-doc/          # 1 doc por template (47 arquivos .md)
│   ├── ai-saas-software.md
│   ├── crypto-marketing.md
│   └── ...
├── catalog/                # Catálogo de seções deduplicado
│   ├── sections-index.md   # Índice geral
│   ├── hero/               # Variantes de Hero
│   ├── pricing/            # Variantes de Pricing
│   ├── features/           # Variantes de Features
│   └── ...
├── tokens/                 # Sistema de customização
│   └── tokens.css          # CSS variables (cores, fontes, espaçamentos)
├── sites/                  # Sites montados (output)
│   └── [nome-projeto]/     # Cada site gerado fica aqui
└── README.md               # Este arquivo
```

## Fluxo de uso

### 1. Pedir um site
```
"Quero um site para SaaS de gestão de projetos. 
Seções: hero com vídeo, social proof logos, features grid, pricing toggle, FAQ, CTA, footer.
Cor: azul #2563eb. Fonte: Inter. Nome: TaskFlow."
```

### 2. IA consulta o catálogo
- Busca no `catalog/` as melhores variantes de cada seção pedida
- Prioriza coerência visual (mesmo template ou templates similares)
- Seleciona com base em qualidade e adequação ao nicho

### 3. Montagem
- Extrai HTML das seções selecionadas
- Aplica `tokens.css` com as cores/fontes pedidas
- Substitui copy placeholder por texto real
- Gera em `sites/[nome-projeto]/`

### 4. Output
- `index.html` — página montada
- `tokens.css` — customizado pro projeto
- `assets/` — imagens e fontes necessárias

## Customização via tokens

Edite `tokens/tokens.css` para mudar globalmente:

| Token | O que muda |
|-------|-----------|
| `--color-primary` | Cor principal do brand |
| `--color-secondary` | Cor de contraste (dark) |
| `--color-accent` | Highlights e detalhes |
| `--font-display` | Fonte dos títulos |
| `--font-body` | Fonte do corpo de texto |
| `--radius-lg` | Arredondamento dos cards |
| `--shadow-lg` | Sombra padrão dos cards |

## Templates disponíveis

Os 47 templates documentados cobrem nichos como:
- AI/SaaS (ai-saas-software, ai-chatbot, ai-solutions, ai-software...)
- Finanças (investment-management, forex-trading, personal-finance, wealth-management...)
- Marketing (digital-agency, email-marketing, social-media-management...)
- Infra/Tech (cloud-software, cyber-security, web-hosting, security-software...)
- Pagamentos (payment-solution, pos-system, online-banking...)
- Gestão (nuvexa-crm, time-tracking, property-management...)

Cada template tem doc completo em `templates-doc/[slug].md` com:
- Páginas disponíveis
- Seções mapeadas (ordem, tipo, variante)
- Paleta de cores
- Tipografia
- Score de qualidade
- Notas de uso/limitações

## Seções disponíveis (catálogo)

O catálogo em `catalog/` organiza seções por tipo:
- **Hero** — variantes com gradiente, vídeo, ilustração, parallax, animação
- **Navigation** — pill floating, sticky, mega-menu, hamburger
- **Social Proof** — logos, stats, badges, counters
- **Features** — grid, tabs, accordion, cards, before/after
- **Services** — cards, list, icons, hover effects
- **Pricing** — toggle mensal/anual, 3-4 colunas, comparison table
- **Testimonials** — carousel, grid, flip cards, marquee
- **FAQ** — accordion, 2-column, categorized
- **CTA** — newsletter, trial, demo, contact
- **Blog** — grid, list, featured
- **Footer** — multi-column, minimal, mega-footer
- **About** — timeline, team grid, values
- **Contact** — form, map, office cards
- **Integration** — logo grid, marquee, orbit

## 🎯 Foco: Fintech & Finanças

Seu foco está em **fintech, banking, investimentos e serviços financeiros**. Para isso, você tem:

- **47 templates NextSaaS** — dos quais 11 especializados em finanças
- **4 templates especializados** — Advitex, Consora (5 variantes!), FinWice, Finazze (Flask)
- **Total: 51 templates para fintech**

Veja `finance-specialized/` para:
- **CATALOGO-FINTECH.md** — guia de nichos e templates recomendados
- **MODELOS-FINTECH.md** — 6 exemplos prontos (payment, neobank, investimentos, consultoria, trading, lending)
- **templates-doc/** — análise dos 4 templates especializados

## Fonte dos templates

### NextSaaS Mega Bundle (47 templates)
Localização: `C:/Users/Administrator/Downloads/ui88/Organizado/A - Dashboards & SaaS/NextSaaS - Mega Bundle (47 templates)/main/templates/`

### Finance Specialized (4 templates)
Localização: `C:/Users/Administrator/Downloads/finance/`
- Advitex, Consora, FinWice, Finazze

### Consalt (1 template React)
Localização: `C:/Users/Administrator/Downloads/envato_LV9Z9DE/Consalt-Buyerfile/consalt/`
- React 18 + Vite + Tailwind + GSAP (10 variantes de layout)

## 📚 Documentos de Referência

| Documento | O que Tem |
|-----------|-----------|
| **CATALOGO-MASTER.md** | Índice de TODOS os templates por nicho com ranking de fit |
| **INDICE-SECOES-POR-TIPO.md** | Mapa cruzado: cada tipo de seção (Hero, Pricing, FAQ...) → quais templates |
| **MAPEAMENTO-COMPLETO-NICHOS.md** | Análise detalhada por nicho + gaps + soluções |
| **RESUMO-EXECUTIVO.md** | Status final com cobertura por nicho |
| **GUIA-RAPIDO.md** | Como usar o sistema passo-a-passo |
| **MODELO-PEDIDO.md** | Templates de pedido para montar sites |
| **finance-specialized/MODELOS-FINTECH.md** | 6 exemplos prontos fintech |
| **templates-doc/*.md** | 47 docs detalhados (1 por template NextSaaS) |
| **finance-specialized/templates-doc/*.md** | 5 docs (Advitex, Consora, FinWice, Finazze, Consalt) |

---

*Sistema criado para acelerar a montagem de landing pages SaaS de alto padrão usando componentes reais testados.*
