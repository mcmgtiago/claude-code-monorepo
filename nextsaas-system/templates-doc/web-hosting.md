---
slug: web-hosting
nome: Web Hosting (NextSaaS)
nicho: Serviço de hospedagem web / cloud hosting / domain registry
estilo: light + dark mode com cards limpos, animações `data-ns-animate`, tipografia Inter Tight, badges coloridas (cyan/verde/amarelo/vermelho)
qualidade: 8 - HTML bem estruturado, Tailwind customizado com CSS vars, animações suaves e responsivas, 48+ páginas de suporte. Penalizado pela copy genérica (template base) e pelo peso das imagens.
paleta_principal: "#1a1a1c (primary dark), #fcfcfc (accent light), #864ffe (primary-500), #c6f56f (ns-green), #83e7ee (ns-cyan), #f9eb57 (ns-yellow), #ffb9a2 (ns-red)"
fonte_titulo: Inter Tight (sem variantes serif - usa apenas para display, weights: 400-900)
fonte_corpo: Inter Tight + fallback sistema (sans-serif)
densidade_secoes: alta - 9 seções principais index + 48 páginas suporte (about, services, features, pricing, team, blog, contact, FAQ, docs, legal, etc)
uso_recomendado: Landing page + site completo para provedor de hospedagem web, registrador de domínios, ou serviço SaaS B2C com funil de vendas longo. Excelente para: apresentar planos de preço (3-4 tiers), showcasar features técnicas, reviews/testimonials, process/onboarding steps.
limitacoes: NAO usar para portfolios criativos ou sites single-product; copy muito genérica ("web hosting solutions") requer replace 100%; imagens em PNG (sem WebP) podem impactar performance; layout assume dark mode toggle sempre ativo.
---

# Web Hosting

## Paginas disponiveis
- `index.html` - Landing principal
- `about.html` - Sobre empresa
- `services.html` - Listagem de serviços (3+ detalhes com imagens)
- `service-details.html` - Detalhe de um serviço
- `features.html` - Features do produto
- `use-case.html` - Casos de uso / verticals
- `use-case-details.html` - Detalhe de caso uso
- `process.html` - Como funciona / onboarding steps
- `pricing.html` - Tabela de preços
- `team.html` - Time / about
- `team-details.html` - Perfil de membro
- `blog.html` - Listagem de posts
- `blog-details.html` - Post individual
- `contact-us.html` - Formulário contato
- `faq.html` - Perguntas frequentes
- `documentation.html` - Documentação / help
- `tutorial.html` - Guia passo-a-passo
- `support.html` - Central de suporte
- `success-stories.html` - Case studies
- `customer-details.html` - Perfil de customer
- `testimonial.html` - Página de depoimentos
- `whitepaper.html` - Whitepaper / recursos
- `whitepaper-details.html` - Whitepaper individual
- `login.html` - Tela de login
- `sign-up.html` - Tela de cadastro
- `affiliate-policy.html` - Política de afiliados
- `affiliates.html` - Dashboard de afiliados
- `referral-program.html` - Programa de referência
- `download.html` - Centro de download
- `analytics.html` - Dashboard analytics (exemplo)
- `career.html` - Página de carreira
- `career-details.html` - Job opening
- `case-study.html` - Listagem de case studies
- `case-study-details.html` - Case study individual
- `glossary.html` - Glossário de termos
- `glossary-details.html` - Termo individual
- `our-manifesto.html` - Missão/visão
- `press.html` - Press kit
- `security.html` - Segurança / compliance
- `changelog.html` - Changelog de atualizações
- `integration.html` - Integrações
- `legal.html` - Centro legal
- `terms-conditions.html` - Termos
- `privacy-policy.html` - Privacidade
- `refund-policy.html` - Reembolso
- `gdpr.html` - GDPR compliance
- `404.html` - Página de erro

## Secoes encontradas (na index.html)
1. **Header** - Mega menu (Company, Collaborate, Resources) + mobile hamburger + theme toggle
2. **Hero section** - H1 "Fastest web hosting performance", subheading, email CTA + avatar group ("Trusted by 20k+")
3. **CTA domain section** - Domain search form + "Domain checker" com TLDs listados (.com, .org, .io, etc) + divider + Trustpilot reviews + 5 star rating
4. **Solutions section** - 2 colunas: stats (60% web dev experts, 40% hosted sites) + imagem, com "Read More" CTA
5. **Services section** - 3 service cards com imagens alternadas light/dark, cada um com título H3 + "Read More" button. Inclui avatar group + revenue card animada
6. **Pricing section** - 4 planos (Essential Free, Advanced $99, Enterprise Enterprise) com tabela comparativa, check icons, featured plan destaque
7. **Reviews section** - Carrossel (marquee) de 5+ customer testimonials com avatar, nome, title, quote
8. **Process section** - 3 steps numerados (Choose domain, Login/register, Make payment) com imagem + descrição
9. **Blog section** - 3 blog cards com imagem, categoria badge, author, data, título (link para blog-details)
10. **Footer** - Logo, social links, 3 colunas (Company/Support/Legal Policies), copyright

## Recursos visuais principais
- **Animações**: `data-ns-animate` com atributos `data-delay`, `data-direction` (up/down/left/right), `data-offset` - processadas via JS inline
- **Badges**: `.badge.badge-cyan` / `.badge.badge-gray-light` com cores dinâmicas
- **Cards**: `.rounded-[20px]` com `dark:` prefix para tema escuro, `hover:shadow-1` transitions
- **Buttons**: `.btn.btn-primary` / `.btn-secondary` / `.btn-white` com variantes `btn-md` / `btn-xl`
- **Gradients**: `bg-(image:--color-gradient-5)` em seção CTA com blur effect
- **Counters**: `[data-counter]` que anima números (60%, 40%, revenue $53224)
- **Progress bars**: `[data-progress-bar]` para exibir percentual (ex: 88% credit usage)
- **Avatar groups**: Empilhados com `-space-x-3.5`, com cores de fundo (`bg-ns-yellow`, `bg-ns-red`, etc)
- **Marquee/carrossel**: `.cards-marquee-container` com scroll infinito de reviews
- **Light/Dark toggle**: Button fixo bottom-right `#theme-toggle` que alterna classes `dark:`

## Notas de qualidade

Pontos fortes:
- 48 páginas completas cobrindo funil B2C inteiro (landing > features > pricing > team > blog > docs > legal > affiliate)
- Tailwind com CSS variables customizadas (14 colors background, 9 stroke colors, 8 accent colors)
- Dark mode completo e bem implementado (toggle button, prefere-color-scheme suportado)
- Animações suaves por data-attributes, sem dependências externas (GSAP/Framer)
- SEO completo: Open Graph, Twitter cards, canonical, manifest, structured markup
- Responsivo mobile-first (XL / MD / SM breakpoints bem distribuídos)
- Acessibilidade: mega menu bridge (avoid flicker), skip-links, sr-only, semantic HTML
- Ícones SVG inline, não demanda assets externos

Pontos fracos:
- Copy muito genérica ("web hosting performance", "hosting solutions") - requer rewrite 100% para marca
- Imagens em PNG grandes (ns-img-43.png, ns-img-45.png, etc) sem WebP/AVIF alternativas
- CSS main.css com 13.343 linhas (não minificado em distribuição?)
- Sem `srcset`/`picture` para responsive images em mobile
- JavaScript próprio (`data-ns-animate`, `data-counter`) cria tech lock-in se migrar pra framework
- Nenhum framework CSS pré-construído (styled-components, Tailwind plugin) exportado - só HTML puro
- Assets vão p/ `/images/` e `/vendor/` (Google Fonts, etc) - URL-dependent
