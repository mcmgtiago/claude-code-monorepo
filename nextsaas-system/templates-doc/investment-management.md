---
slug: investment-management
nome: Investment Management
nicho: Fintech / Investimentos / SaaS
estilo: Moderno, Profissional, Limpo
qualidade: 8
paleta_principal: #864ffe (Roxo)
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: Média
uso_recomendado: Plataformas de investimento, gestão de portfólio, consultoria financeira, aplicativos de poupança e planejamento de aposentadoria
limitacoes: Textos genéricos em algumas seções, layout responsivo pode sofrer em telas muito pequenas (<320px), testimunhos com avatares dinâmicos (requer JS)
---

# Investment Management

Template completo NextSaaS focado em fintech de investimentos. Interface sofisticada com suporte a tema claro/escuro e animações suaves para transmitir confiança e profissionalismo.

## Páginas disponíveis

47 páginas HTML estruturadas em seções completas:

- **Principais**: index.html, about.html, services.html, features.html, pricing.html
- **Autenticação**: login.html, signup.html, download.html
- **Conteúdo**: blog.html, blog-details.html, case-study.html, case-study-details.html, whitepaper.html, whitepaper-details.html
- **Comunidade**: team.html, team-details.html, customer.html, customers-details.html, testimonial.html, career.html, career-details.html
- **Integração**: affiliates.html, referral-program.html, integration.html, contact.html, analytics.html
- **Recursos**: documentation.html, learn.html, faq.html, use-case.html, success-stories.html, support.html
- **Compliance**: terms-conditions.html, privacy-policy.html, refund-policy.html, gdpr.html, affiliate-policy.html, legal.html, press.html, security.html, changelog.html, glossary.html
- **Sistema**: 404.html, service-details.html, our-manifesto.html, why-choose-us.html, process.html, brandkit.html

## Seções (index.html)

1. **Header v1** - Navegação fixa com mega menus (Company, Collaborate, Resources, People & Culture) + menu mobile colapsável
2. **Hero Section** - Call-to-action duplo ("Start Investing" + "Learn more"), background com onda SVG, copywriting investimento
3. **Clients Section** - Marquee duplo de logos (scroll infinito), gradient fade nas laterais, 5 logos por fila
4. **Feature Section** - Grid 3 colunas (6 features ao redor de imagem central), ícones customizados (ns-shape-*), descrições curtas
5. **Feature v2 Section** - Layout 2 colunas: conteúdo à esquerda + imagem decorativa direita, background com gradiente 
6. **Feature v3 Section** - Imagem esquerda (savings visualization) + conteúdo direita, background PNG customizado
7. **Services Section** - 3 cards (Portfolio Management, Financial Planning, Retirement Planning), ícones SVG, CTA "Talk to an expert"
8. **Investment Section** - Layout 2 colunas com imagem ilustrativa, CTA "Learn more", fundo branco com arredondamento
9. **Testimonial Section** - Card único com avatar group dinâmico (5 avatares sobrepostos), citação vazia (preenchida via JS), info cliente
10. **Journal Section** - Grid blog posts com imagem, data, tempo leitura, cards escaláveis (hover:scale)
11. **Contact Section** - Contato à esquerda (email, phone, address) + form à direita (fullName, email, message, termos checkbox)
12. **CTA Section** - Banner full-width com gradiente background, heading grande "Let's build your future", booking CTA
13. **Footer v1** - Fundo escuro (secondary/background-8), 3 colunas (company, support, legal), social links, copyright

## Recursos visuais

**Cores**:
- Primária: `#864ffe` (roxo vibrante), `#a585ff` (roxo mais claro)
- Secundária: `#1a1a1c` (preto/cinza muito escuro)
- Accent (dark): `#fcfcfc` (branco puro)
- Backgrounds: `#f9fafb` (luz), `#0f1217` (dark mode)
- Strokes: `#dfe4eb` (luz), `#202731` (dark)
- Destaques: Cyan `#83e7ee`, Verde `#c6f56f`, Amarelo `#f9eb57`

**Tipografia**:
- Fonte: Inter Tight (Google Fonts), peso 100-900
- H1: 4.25rem / 110%
- H5 (Heading médio): 1.5rem / 140%
- Tagline-1 (body): 1rem / 150%
- Tagline-2 (small): 0.875rem / 150%
- Tagline-3 (tiny): 0.75rem / 150%

**Componentes**:
- Buttons: Variantes (secondary, accent, white, transparent), tamanhos (md, lg, xl)
- Badges: badge-cyan, inline-block
- Inputs: Rounded-full (bordas arredondadas), border-stroke-3, focus outline-primary-500
- Cards: Rounded-[20px], espaçamento 32px padding, background white/dark
- Modals/Dropdowns: 20px border-radius, shadow-14

**Animações**:
- GSAP + ScrollTrigger para scroll triggers
- data-ns-animate: delay (0.1-0.7s), direction (left/right/up), offset (50-400px)
- Marquee infinita (vanilla-infinite-marquee.min.js)
- Scale hover em cards (scale-100 → scale-102%)
- Tema toggle com transitions suaves

## Notas de qualidade

**Pontos fortes**:
- Estrutura semântica HTML5 completa
- Suporte full dark mode com CSS custom properties
- Responsividade em breakpoints Tailwind (sm, md, lg, xl, 2xl)
- Acessibilidade: aria-labels, sr-only, semantic roles
- Performance: Lazy loading em imagens, vendor JS separado
- Animações fluidas sem overhead (GSAP otimizado)
- Paleta de cores profissional e conversível para outros nichos

**Limitações**:
- Textos placeholder genéricos ("At the heart of our approach...")
- Formulário de contato é apenas HTML (sem backend integrado)
- Testimonials requer data dinâmica preenchida via JavaScript
- Alcune SVGs inline podem aumentar tamanho do HTML (3.750 linhas)
- Gradientes de background em PNGs são fixos (não escaláveis)

**Recomendações de customização**:
1. Substituir logos do marquee por clients reais
2. Preencher copywriting específico ao nicho (agora genérico para investimentos)
3. Integrar testimonials com dados reais (API ou CMS)
4. Conectar formulário de contato a backend (node-mailer, Sendgrid, etc)
5. Adicionar analytics tracking (GTM, Mixpanel)
6. Testes de acessibilidade com WAVE, Axe
