---
slug: cyber-security
nome: Nexsas Cyber Security
nicho: Cybersecurity SaaS (AI-powered threat protection)
estilo: Moderno, dark-first com acentos pastel (verde/ciano/amarelo)
qualidade: 8
paleta_principal: #864ffe (primary-500) sobre #13171e (background-5) / #f4f5f8 (background-3)
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado:
  - Landing para produto de cibersegurança/SaaS B2B
  - Página de captação para suite de threat-intelligence
  - Marketing de MSSP ou ferramenta de AI security
  - Reaproveitamento como base SaaS genérica com troca de copy
limitacoes:
  - Header fixo em pill rounded-full com mega-menu extenso (47+ páginas no bundle) pode ser overkill para projetos simples
  - Identidade visual genérica NextSaaS — não diferencia visualmente de outras variantes (mesma nav, mesmo footer)
  - Cobertura escassa de elementos específicos do nicho (sem dashboards reais, sem threat map, sem tabela de CVEs)
  - Bundle traz 47 templates — código duplicado e paths relativos exigem refactor se for consumir só um
---

# Nexsas Cyber Security

Variante "Cyber Security" do bundle NextSaaS Mega (47 templates, mesmo core HTML/CSS/JS).

## Páginas disponíveis

47 páginas HTML no diretório `main/templates/cyber-security/`:

- Core: `index`, `about`, `services`, `service-details`, `features`, `pricing`, `contact`, `faq`, `404`
- Auth: `login`, `signup`
- Conteúdo: `blog`, `blog-details`, `changelog`, `documentation`, `tutorial`, `glossary`, `glossary-details`, `whitepaper`, `whitepaper-details`
- Social proof: `testimonial`, `case-study`, `case-study-details`, `customer`, `customer-details`, `success-stories`, `team`, `team-details`
- Produto: `integration`, `use-case`, `process`, `why-choose-us`, `analytics`, `download`, `support`
- Marca: `brandkit`, `press`, `our-manifesto`, `career`, `career-details`
- Afiliados: `affiliates`, `affiliate-policy`, `referral-program`
- Legal: `legal`, `privacy-policy`, `terms-conditions`, `gdpr`, `refund-policy`, `security`

## Seções (index.html)

1. **Header v1** — pill rounded-full fixa no topo, mega-menu Company/Product/Resources com dropdowns animados.
2. **Mobile Menu** — aside off-canvas com todos os links.
3. **Hero section** — copy "AI-powered cybersecurity for a safer tomorrow", CTAs primário/secundário, faixa de stats com 3 cards (verde/ciano/lavanda), busca por threat actors + ilustração.
4. **Features section** — título "Managing your money has never been easier" + 3 cards (Web security, Software analytics, Payment security).
5. **Feature v2 section** — título "Unmatched security performance", showcase visual de dashboard.
6. **Services section** — tabs/pills (Big data consulting, Machine learning & AI, Business analysis) sob "Enterprise-grade security & intelligence".
7. **Integration section** — badge verde "Integrations", grid de logos de parceiros.
8. **Testimonial section** — slider com 4 reviews (Sarah Johnson, Michael Chen, Emma Rodriguez, Jaks Rodriguez) + rating 4.9/5.0/4.8/3.8.
9. **CTA section** — banner com fundo escuro + CTA primário sobre ilustração `ns-img-499.png`.
10. **Footer v3** — multi-coluna (Company, Resources, Social, Newsletter).

## Recursos visuais

- **Framework**: Tailwind CSS v4.1.4 (`assets/main.css`, 292 KB)
- **JS vendors** em `vendor/`: GSAP + ScrollTrigger + MotionPath + SplitText + Lenis (smooth scroll), Swiper, Leaflet, Vanilla Infinite Marquee, Number Counter, Draw SVG, Stack Card.
- **Custom fonts**: `next-sass` (icon font próprio, eot/svg/ttf/woff) em `fonts/`.
- **Google Font**: Inter Tight (100–900, italic).
- **Dark mode**: nativo via classes `dark:` em todo o markup (alternância por cor do sistema).
- **Animações**: GSAP com `data-ns-animate` (direction, offset, delay) em quase todas as seções; efeito split-text nos headings.
- **Iconografia**: SVG inline + sprite em `images/icons/` (190+ ícones temáticos: shield, lock, scan, fingerprint etc.).
- **Imagens**: 189 arquivos em `images/`, nomenclatura `ns-img-NNN` (PNG/SVG/JPG). Sem assets únicos do tema cyber — reaproveita do bundle.
- **Paleta** (extraída de `:root` em `main.css`):
  - Primary: `#864ffe` (500), `#7c31f6` (600), `#a585ff` (400), `#dcd4ff` (200), `#f4f2fe` (50)
  - Secondary: `#1a1a1c` | Accent: `#fcfcfc`
  - Background light: `#fcfcfd` → `#f0f2f6`
  - Background dark: `#181d26` → `#070b10` (mais profundos), `#13171e`, `#1f252f`
  - Stroke: `#dfe4eb` → `#1b232f` (gradiente claro→escuro)
  - Acentos ns: verde `#c6f56f`, ciano `#83e7ee`, amarelo `#f9eb57`, vermelho pastel `#ffb9a2`
- **Tipografia**: tudo Inter Tight. Headings com pesos 300–500 (leves, modernos). Body em 1rem/150%.

## Notas de qualidade

- **Estrutura sólida** (8/10): marcação semântica, ARIA, dark mode coerente, animações bem amarradas via GSAP.
- **Reaproveitamento**: variantes do mesmo bundle compartilham `index.html`, `assets/` e `vendor/`. O "tema" cyber-security se diferencia quase só pelo copy do hero — código base é o NextSaaS genérico.
- **Atenção**: alguns textos do hero ("Managing your money") não foram trocados na variante cyber — sinal de que o tema é skin/cosmético, não um redesign profundo.
- **Performance**: CSS único de 292 KB é pesado para o que entrega; vendor JS soma ~600 KB. Sem build step / Tailwind CLI configurado — usa CDN-style preflight v4.
- **Acessibilidade**: skip-link ausente, foco visível depende do Tailwind default; contraste dark mode OK (fundo #070b10 sobre accent #fcfcfc = 19:1).
- **Limitações para uso sério**: sem casos de uso reais do nicho (não há "threat map", "compliance badges", "SOC2/ISO27001 marks"), pricing genérico, sem dashboard de produto, formulários de captura básicos.
- **Quando vale usar**: ponto de partida rápido para landing de SaaS com cara profissional e animações polidas; precisa de copy próprio + identidade visual para sair do genérico.
- **Quando evitar**: projetos que pedem autenticidade cyber (visual hacker, terminal, código, mapas de ataque) — o tema é mais "SaaS startup clean" do que "security ops".
