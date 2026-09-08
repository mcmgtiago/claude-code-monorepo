# Landing page da GREENHAT

## Escopo

Documento-fonte para a landing page em ingles da GREENHAT.

O site deve posicionar a GREENHAT como estudio independente de produto digital para fintech, SaaS B2B e produtos operacionais complexos. A pagina usa experiencia internacional real, projetos reais, depoimentos verificaveis e conceitos independentes claramente identificados.

## Verdades que podem aparecer no site

Substituir os colchetes por informacoes verificadas antes da publicacao.

```text
10+ years in digital
Clients across [5+] countries
[20+] verified client reviews
Clients in Australia, Brazil, the Netherlands, Portugal and the United States
```

Usar logos somente com permissao. Se parte dos projetos foi entregue antes da criacao da GREENHAT, usar o rotulo `Selected clients and founder experience`, e nao `Selected Clients`.

## Estrutura

```text
1. Header
2. Hero
3. Proof strip and infinite logo carousel
4. Selected client work
5. Independent concepts
6. Capabilities
7. Testimonials
8. Process
9. About GREENHAT
10. FAQ
11. Final CTA
12. Footer
```

## Direcionamento visual

### Intencao

A pagina deve parecer uma parceira de produto senior para operacoes importantes. O visual precisa equilibrar precisao de sistemas, presenca corporativa e uma camada editorial forte. Nao deve parecer uma startup generica, uma agencia criativa de tendencias ou um dashboard SaaS cheio de cards.

### Sistema visual atual

Usar os tokens vivos do projeto em `assets/css/tokens/` como fonte de verdade.

| Elemento | Direcao |
| --- | --- |
| Fundo escuro | Ink `#000A0F` e preto profundo |
| Verde principal | Sage/turf green `#0E7A5B` |
| Verde secundario | Teal `#278567` |
| Fundo claro | Cream `#F8F1E7` |
| Display | Cormorant Garamond |
| Interface e corpo | Raleway |
| Labels e dados | Roboto Mono |

### Tipografia

- Hero: serif editorial em escala grande, com uma ou duas palavras em verde.
- Titulos de secao: serif forte ou sans pesada, nunca ambos no mesmo nivel visual.
- Corpo: Raleway, curto e objetivo.
- Labels: Roboto Mono, uppercase, tracking amplo e tamanho pequeno.
- Evitar blocos longos de texto e headlines com mais de quatro linhas em desktop.

### Layout

- Grid de 12 colunas no desktop e uma coluna no mobile.
- Largura maxima de conteudo entre 1200px e 1440px.
- Hero com muito respiro e um unico foco visual dominante.
- Alternar areas escuras e claras para separar narrativa, nao usar cards para cada frase.
- Cases devem aparecer grandes, em proporcao editorial, e nao em mosaico de miniaturas.
- Usar linhas finas, marcadores numericos e rotulos de sistema para sustentar linguagem operacional.

### Imagens e interfaces

- Hero: video abstrato atual ou composicao de dados e interfaces em escala grande.
- Projetos reais: screenshots, mockups e trechos de interface com contexto.
- Conceitos: usar etiqueta `Independent Concept` em todas as imagens e cards.
- Evitar fotos genericas de reuniao, apertos de mao, pessoas olhando para notebook e imagens de banco de imagem sem funcao narrativa.
- Evitar mockups de dispositivo empilhados e excesso de sombras flutuantes.

### Movimento

- Hero pode ter video ou movimento ambiental lento.
- Logo carousel e portfolio carousel podem rodar continuamente, mas devem pausar em hover, foco e `prefers-reduced-motion`.
- Revelacoes de scroll devem ser curtas e discretas: opacity + translateY pequeno.
- Nao usar animacao decorativa em cada card.
- Respeitar `prefers-reduced-motion` em todos os efeitos.

### O que evitar

- Gradientes arco-iris.
- Glassmorphism excessivo.
- Neon ou verde-lima como cor dominante.
- Bento grid generico.
- Icones 3D, blobs e sombras pesadas.
- Carrosseis sem controle de acessibilidade.
- Logo carousel com logos ficticios.

## Copy completa

### 1. Header

```text
GREENHAT

Expertise
Work
Process
About
FAQs

Start a project
```

### 2. Hero

Eyebrow:

```text
INDEPENDENT DIGITAL PRODUCT STUDIO
```

Headline:

```text
Complex work. Clear digital products.
```

Body:

```text
GREENHAT designs brands, websites, platforms and dashboards for fintech,
B2B SaaS and complex operational products.

We make dense workflows, data and business logic easier to understand,
trust and use.
```

CTAs:

```text
Start a project
View selected work
```

Proof points:

```text
10+ years in digital
Clients across [5+] countries
[20+] verified client reviews
```

### 3. Proof strip and infinite logo carousel

Section label:

```text
Built with teams around the world.
```

Body:

```text
Selected clients across Australia, Brazil, the Netherlands, Portugal and
the United States.
```

Carousel label:

```text
Selected Clients
```

Alternative label for historic personal work:

```text
Selected clients and founder experience
```

Supporting line:

```text
A history of collaboration across brands, websites, digital products and
business-critical systems.
```

### 4. Selected client work

```text
Selected work

Strategic design across brands, websites, products and operational systems.
```

Intro:

```text
Every project starts with a different business challenge. The common goal
is to make the product, brand or workflow easier to understand and
stronger in the market.
```

Case card template:

```text
[CLIENT NAME]

[PROJECT TYPE] · [YEAR]

[One concise sentence describing the business challenge, scope or verified result.]

View case
```

Case card example:

```text
[CLIENT NAME]

Website Redesign · [YEAR]

Repositioning a digital business through clearer messaging, stronger
information architecture and a more credible online experience.

View case
```

### 5. Independent concepts

```text
Independent concepts

A forward-looking exploration of how financial, B2B and operational
products can become clearer, more trusted and easier to operate.
```

Card 1:

```text
Financial Operations Platform

A command center for cash visibility, approvals, transactions and reporting.

Independent Concept
Product Strategy · UX/UI · Dashboard Design
```

Card 2:

```text
Revenue Operations Platform

A B2B workspace for pipeline visibility, account management, approvals
and sales operations.

Independent Concept
Information Architecture · UX/UI · Design System
```

Card 3:

```text
B2B Fintech Website

A credible digital presence for a financial infrastructure, payments or credit business.

Independent Concept
Positioning · Visual Identity · Website Design
```

Transparency note:

```text
Independent concepts are self-initiated explorations. They are not client work.
```

### 6. Capabilities

```text
Focused work. Connected thinking.
```

Body:

```text
GREENHAT can lead a focused piece of work or connect the full experience
across brand, website, product and operational system.
```

```text
Brand & Web

Positioning, visual systems and websites designed to make a business
easier to understand, easier to trust and ready to grow.
```

```text
Product Experiences

Product strategy, UX, UI and prototypes for customer-facing platforms,
self-service journeys and complex B2B experiences.
```

```text
Operational Systems

Dashboards, internal tools and design systems that make data, workflows
and decisions easier to navigate.
```

CTA:

```text
Discuss your project
```

### 7. Testimonials

```text
Trusted for clarity, partnership and execution.
```

Body:

```text
Client feedback from projects delivered across digital products, websites,
brands and business-critical experiences.
```

Review proof:

```text
[RATING]/5 average rating from [20+] verified Google reviews.

Read all reviews
```

Testimonial card template:

```text
"[USE EXACT VERIFIED CLIENT QUOTE.]"

[CLIENT NAME]
[ROLE], [COMPANY]
```

Usar tres depoimentos:

```text
One about strategic thinking
One about communication and partnership
One about quality, speed or business outcome
```

### 8. Process

```text
A clear process for complex work.

Every engagement is shaped by the problem. The process keeps decisions
visible, aligned and moving.
```

```text
01. Context

We begin by understanding the business, users, constraints and desired outcomes.
```

```text
02. Structure

We define priorities, journeys, information architecture and the decisions
the experience needs to support.
```

```text
03. Design

We turn strategy into focused interfaces, prototypes and scalable visual systems.
```

```text
04. Launch Support

We document the work, prepare handoff and support implementation where needed.
```

### 9. About GREENHAT

```text
A focused studio, built around senior product thinking.
```

```text
GREENHAT is an independent digital product studio founded by [FOUNDER NAME].

With more than a decade in digital, [FOUNDER NAME] has worked with clients
across Australia, Brazil, the Netherlands, Portugal and the United States.

Today, GREENHAT brings that experience to brands, websites, platforms and
operational systems, with a growing focus on fintech, B2B SaaS and complex
digital operations.

The approach is senior, hands-on and built around clarity from the first
conversation to final handoff.
```

CTA:

```text
Meet the founder
```

### 10. FAQ

```text
Questions, answered.
```

```text
Do you work with international clients?

Yes. GREENHAT is based in Brazil and works remotely with clients across
different time zones and markets.
```

```text
What types of projects does GREENHAT take on?

GREENHAT works across brand positioning, websites, product experiences,
dashboards, internal tools and design systems.
```

```text
Do you only work with fintech?

Fintech is GREENHAT's primary focus. We also work with B2B SaaS and
operational products where workflows, data and business logic need to
become clearer.
```

```text
Can GREENHAT work with our existing product and engineering team?

Yes. GREENHAT can work alongside internal teams, external agencies and
technical partners from discovery through handoff.
```

Escolher uma das respostas abaixo, conforme o servico real.

```text
Does GREENHAT build websites?

GREENHAT can design and build marketing websites in Framer when it is the
right fit. For platforms and applications, we work alongside your
engineering team or technical partners.
```

```text
Does GREENHAT handle development?

GREENHAT leads strategy and design, then works alongside your internal
engineering team or technical partners during implementation.
```

```text
How does a project begin?

Every project starts with a conversation about the challenge, scope,
timeline and desired outcome. GREENHAT then prepares a focused proposal.
```

```text
How long does a project take?

Timelines depend on scope, team involvement and project complexity.
A clear delivery plan is defined before work begins.
```

```text
Can GREENHAT work under an NDA?

Yes. GREENHAT can begin under an NDA when the project requires it.
```

```text
What are independent concepts?

Independent concepts are self-initiated explorations created by GREENHAT.
They are clearly identified and are not presented as client work.
```

### 11. Final CTA

```text
Bring clarity to what comes next.
```

```text
Whether you are launching a new offer, rethinking an existing product or
making an internal operation easier to run, GREENHAT helps turn complexity
into a focused digital experience.
```

CTA:

```text
Start a project
```

Form title:

```text
Tell us about your project.
```

Form fields:

```text
Name
Work email
Company
Company website
Project type
What are you looking to improve?
Timeline
Budget range
```

Contact line:

```text
Prefer email? Reach us at [EMAIL].
```

### 12. Footer

```text
GREENHAT

Complex work. Clear digital products.

Brands, websites, platforms and dashboards for fintech, B2B SaaS and
complex operational products.

[EMAIL]
LinkedIn
Instagram

Brazil-based. Available worldwide.

© [YEAR] GREENHAT. All rights reserved.
```

## SEO

Title:

```text
GREENHAT | Digital Product Studio for Fintech and Complex B2B Operations
```

Description:

```text
GREENHAT designs brands, websites, platforms and dashboards for fintech,
B2B SaaS and complex operational products.
```

## Checklist de ativos

```text
[ ] Logo horizontal escuro e claro
[ ] Marca reduzida para avatar
[ ] Foto profissional do fundador
[ ] Logos de clientes autorizados
[ ] Dados reais para os tres proof points do hero
[ ] Quatro a seis cases reais
[ ] Dois ou tres conceitos independentes
[ ] Tres depoimentos aprovados
[ ] Link de avaliacoes Google
[ ] E-mail comercial e dominio
[ ] Escolha entre design-only ou design + Framer para a FAQ
```
