---
slug: consora
nome: Consora Business Finance Consulting
nicho: Consultoria de Finanças / Business Services
estilo: Corporativo minimal com toque orgânico — fundo off-white, grandes blocos de copy tipográfica, detalhes em lima neon e hierarquia sans-serif geométrica. Tem um ar "magazine" (Studio Pieper, Pentagram) misturado com dashboards de fintech. Limpo, arejado, com microinterações fade-up e contraste cromático pontual.
qualidade: 8
paleta_principal:
  - "#CEF79E"   # lima elétrico (primary finance)
  - "#222F30"   # dark teal/charcoal (secondary, footer)
  - "#F7F7F5"   # off-white warm (fundos suaves)
  - "#E7E8E1"   # sage gray neutro
  - "#FFFFFF"   # branco puro
fonte_titulo: TT Hoves Pro Trial (Bold/DemiBold)
fonte_corpo: TT Hoves Pro Trial (Regular/Light) — sans-serif geométrica premium carregada em @font-face
densidade_secoes: alta
uso_recomendado:
  - Sites institucionais de consultoria financeira, advisory, wealth management
  - Landing pages premium para escritórios de M&A, contabilidade boutique, financial advisors
  - B2B que precisa transmitir "premium + moderno" sem parecer corporativo genérico
  - Nichos correlatos (legal, advisory, contabilidade) — basta trocar paleta via variáveis CSS
limitacoes:
  - CopiaLorem ipsum em vários blocos (about, offcanvas, FAQ) — exige reescrita de copy
  - 5 demos de homepage (index-2 a index-5) compartilham mesmo DNA visual, não trazem diversificação estrutural real
  - Tema "finance" usa lima neon muito saturado; pode parecer vibrante demais para marcas sóbrias
  - PHPMailer + mail.php indicam stack PHP — devs JS-only precisarão portar o form
  - Slider de marcas tem apenas placeholder logos genéricos
source: C:/Users/Administrator/Downloads/finance/consora-business-finance-consulting-html-temple-2026-07-07-08-41-08-utc/consora/
---

# Consora Business Finance Consulting

Template multi-nicho da ThemePure voltado a empresas de serviços financeiros (consultoria, advisory, contabilidade, corporate). Tem **5 demos de homepage** e mais de **20 páginas internas** prontas — provavelmente o pacote mais completo deste segmento no mercado de ThemeForest. Identidade visual firme: off-white com lima neon, tipografia sans-serif geométrica premium (TT Hoves Pro Trial), hierarquia editorial marcada e sensação de "revista financeira".

A grande sacada: cada página pode trocar de tema (Finance, Consulting, Advisory, Corporate, Accounting) trocando a classe `body` e re-mapeando as CSS variables (`--tp-theme-primary` etc.) — o desenvolvedor ganha 5 skins sem reescrever HTML.

## Páginas disponíveis

- `index.html` — Homepage demo "Finance" (lima neon)
- `index-2.html` — Homepage "Consulting" (verde lima sobre teal escuro)
- `index-3.html` — Homepage "Advisory" (dark teal + laranja)
- `index-4.html` — Homepage "Corporate" (teal escuro + sulu green)
- `index-5.html` — Homepage "Accounting" (laranja/coral sobre marrom)
- `about.html` — Sobre a empresa
- `service.html` — Lista de serviços
- `service-details.html` — Página individual de serviço
- `industries.html` — Indústrias atendidas
- `industries-details.html` — Indústria detalhada
- `case-studies.html` — Grid de case studies
- `case-studies-details.html` — Case individual
- `pricing.html` — Tabela de planos
- `team.html` — Grid de equipe
- `team-details.html` — Perfil individual
- `career.html` — Lista de vagas
- `career-details.html` — Vaga individual
- `blog.html` — Lista de posts
- `blog-standard.html` — Lista em layout padrão
- `blog-details.html` — Post completo
- `testimonial.html` — Página dedicada de depoimentos
- `worksheet.html` — Recursos/downloads
- `success-story.html` — Páginas de sucesso
- `story-details.html` — Detalhe de história de sucesso
- `press-release.html` — Sala de imprensa
- `contact.html` — Contato (com formulário + mapa)
- `error.html` — 404

## Seções encontradas (na index.html)

Ordem real lida direto do markup (classe `tp-fi-*` mapeia cada bloco):

1. **Loader** — `tp-fading-circle` (12 círculos animados) + título "Consora"
2. **Back to top** — botão flutuante SVG chevron
3. **Offcanvas mobile** — menu lateral com gallery, contato, social icons
4. **Search overlay** — modal de busca full-screen
5. **Header** — `tp-header-height` com logo, language switcher, mega menu dropdown, action buttons (search/phone)
6. **Header bottom bar** — `tp-header-bottom` em fundo `#CEF79E` com info de contato e social
7. **Hero** — `tp-fi-hero` com overlay, sub-headline fade-up, título grande, dois CTAs (primary lima + outline dark), card de contato com telefone/email
8. **Brand slider** — `tp-fi-brand` — logos de clientes em swiper loop infinito
9. **Stories / Cases cards** — `tp-fi-stories` — 3 cards com logo, thumb grande e CTA
10. **About** — `tp-fi-about` — split imagem + copy + lista de bullets (3 itens com check icons)
11. **Services** — `tp-fi-service` — 4 cards de serviço (icon, título, descrição, link "Read more")
12. **Banner CTA** — `tp-fi-banner` — bloco de conversão
13. **Marquee text** — `tp-fi-text` em faixa lima (`#CEF79E`) — texto rolando infinito
14. **Values / Feature grid** — `tp-fi-value` — grid de valores/diferenciais com thumbs
15. **Testimonial** — `tp-fi-testimonial` — slider de depoimentos em fundo `#F7F7F5`
16. **Partner / Trusted by** — `tp-fi-partner` em fundo dark `#222F30`
17. **Team** — `tp-fi-team` — grid de membros com hover
18. **Banner CTA 2** — segundo banner de conversão
19. **FAQ** — `tp-fi-faq` — accordion (provavelmente)
20. **CTA final** — `tp-fi-cta` — call to action pré-footer
21. **Footer** — widget de marca + 2 colunas de menu + bloco de contato
22. **Footer copyright** — barra com ©, links legais

## Recursos e diferenciais visuais

- **5 temas via CSS variables**: trocar `--tp-theme-primary` recolore toda a página; classes `theme-finances`, `theme-consulting`, `theme-advisory`, `theme-corporate`, `theme-accounting` aplicadas em `body`
- **Fonte customizada**: TT Hoves Pro Trial (7 pesos incluindo italic) — sans-serif geométrica com cara de "Banque Suisse"
- **Plugins JS carregados**: Swiper (sliders), Magnific Popup (lightbox/vídeo), Nice Select (dropdowns estilizados), PureCounter (animated numbers), isotope provavelmente, parallax
- **Animações**: classe `tp-fade-anim` + atributo `data-delay` para reveal sequencial; parallax via `include-bg`; shape SVG overlay no hero
- **Marquee text** em faixa colorida — efeito de texto rolando infinito (diferencial forte)
- **Offcanvas mobile** rico: logo + gallery de thumbs + info contato + social — mais completo que média do mercado
- **Loading screen** com 12 círculos pulsando — primeira impressão polida
- **Back to top + sticky header + mega menu** com dropdown multi-coluna
- **Spacing CSS separado** (`spacing.css`) — utility classes para padding/margin
- **PHP backend** (`mail.php` + PHPMailer) — formulário de contato funcional out-of-the-box

## Notas de qualidade

**Pontos fortes (8/10):**

- 28 páginas funcionais — um dos pacotes mais extensos já vistos para o nicho
- Sistema multi-tema real (5 skins via CSS vars) — reutilização máxima
- Tipografia carregada em 7 pesos dá flexibilidade editorial rara
- Estrutura semântica BEM-like (`tp-[seção]-[elemento]`) consistente
- Loader + marquee + offcanvas mostram cuidado com detalhes de UX
- Slider de marcas, accordion FAQ, popup de vídeo — componentes prontos

**Pontos fracos:**

- Lorem ipsum literal em vários blocos (about, offcanvas "Hello There", FAQ) — exige copywriter
- 5 homepages similares (mesma estrutura, só cores/ordem mudam) — variação estrutural limitada
- Marca d'água ThemePure sutil no rodapé de algumas páginas
- Sem dark mode real (só o "advisory" que é naturalmente dark)
- Paleta lima neon muito específica — limitante fora do nicho fintech moderno
- Sem TypeScript, sem build system moderno — HTML estático + jQuery

**Score: 8/10** — Recomendado para projetos B2B financeiros premium que precisam de muitas páginas prontas e podem arcar com copy + customização de paleta. Não recomendado para quem quer estrutura radicalmente diferente ou prefere stack JS moderno.

Caminho do template: `C:/Users/Administrator/Downloads/finance/consora-business-finance-consulting-html-temple-2026-07-07-08-41-08-utc/consora/`