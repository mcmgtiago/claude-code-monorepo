# Direção Visual

## Controle

- Projeto: LP Josiani Nicolini - Saúde Intestinal
- Modo: `AUTO`
- Release target: `PRODUCTION`
- Rota operacional escolhida: **Margem Viva — editorial botânico-clínica mais expressiva**
- Status da rota: `IMPLEMENTED / QA_EXECUTED / RELEASE_BLOCKED`; revisão operacional G2/G3 decidida por OpenCode em `AUTO`, implementada e retestada em 2026-07-26.
- Motivo da revisão: o usuário rejeitou a execução visual anterior e determinou a continuidade do redesign. **Margem de Escuta** permanece superseded, e **Margem Viva** é a execução final atual.
- Aprovação: a instrução explícita do usuário e o modo `AUTO` autorizaram a execução sem gate adicional. A implementação e o QA final agora comprovam Margem Viva; apenas os bloqueios externos registrados impedem o release.
- Fonte de verdade: `josiani-design-system`, `DESIGN.md`, `brief.md` e `spec.yaml`.

## Decisão De Rota

Foi escolhida uma única rota de clínica editorial botânico-clínica, sem rota secundária: **Margem Viva**. Ela mantém clareza para uma oferta de consulta e acompanhamento individual, mas aumenta a expressão por ritmo variável, contraste de escalas, recorte editorial do retrato e linework botânico original nas bordas.

O modo `AUTO` eliminou a apresentação de alternativas para aprovação. Esta revisão operacional de G2/G3 foi realizada em 2026-07-26 com copy factual, ordem macro, três CTAs e bloqueios de release preservados.

A recomendação genérica do UI UX Pro Max — azul clínico, blocos vibrantes e storytelling pesado — foi rejeitada porque conflita com a identidade oficial marfim/oliva/dourado, aumenta a densidade de uma oferta simples e desloca a marca para um estereótipo health-tech. As recomendações da ferramenta ficam restritas a critérios funcionais de contraste, foco, responsividade e movimento reduzido.

## Fingerprint

| Eixo | Definição | Tradução visual |
|---|---|---|
| Autoridade | Humana-clínica | Retrato real, linguagem sóbria e processo legível; nenhuma credencial visual inventada. |
| Temperatura | Quente controlada | Marfim dominante, oliva profundo e fotografia quente, sem aparência de spa. |
| Energia | 3 de 5 | Mais contraste de escala e alternância de cadência, sem urgência artificial ou movimento contínuo. |
| Densidade | Editorial com ritmo variável | Pausas amplas alternam com faixa compacta, splits e processo mais denso; não repetir a mesma grade entre seções. |
| Expressão | Fotográfica-editorial e botânica linear | Um retrato autoral, tipografia expressiva e ornamentos lineares originais nas margens, nunca como identidade substituta. |

## Conceito

- Nome interno: **Margem Viva**.
- Ideia central: a página se comporta como uma publicação clínica cuja margem ganha vida. Campos tipográficos, rails finos e botânica linear original conduzem o olhar pelas bordas, enquanto o centro preserva leitura, evidência e conversão.
- Gesto proprietário: contraste entre margens vivas e campos clínicos contidos. Regras, numeração, arcos amplos e linework original formam o percurso, mas nunca viram logo, selo ou símbolo da marca.
- Hero: copy e CTA ocupam primeiro o DOM e o campo de leitura; `pp.jpg` aparece uma única vez em retrato dominante, alto, com máscara assimétrica ou arco amplo. Nenhum conteúdo cobre o rosto.
- Processo: o padrão B07 é reconstruído como bloco de assinatura, com título grande à esquerda, exatamente três cards marfim à direita, rails finos e Grid Fade estático sobre campo oliva; não há sticky, scrub ou runtime adicional.
- Logística: modalidade, cidade e endereço entram em um módulo textual direto, sem formulário, mapa decorativo ou fotografia não autorizada.
- Proporção cromática: manter 70–90% de marfim e superfícies neutras, com alvo geral de 75–85%; oliva completa a estrutura e dourado permanece em até 5% e no máximo dois pontos visíveis por viewport.

### Realização final

- Header editorial com quatro âncoras no desktop; no mobile, a navegação é ocultada sem menu ou dependência de JavaScript.
- Hero assimétrico com o único retrato em arco próximo de 4:5 no desktop e de 1:1 no mobile, sempre depois da proposta e do CTA no DOM.
- Dois SVGs botânicos inline originais ficam nas bordas do hero e do CTA final, ambos `aria-hidden="true"` e `focusable="false"`.
- Faixa oliva estática, abordagem em escada, processo oliva com Grid Fade/rails e três cards, Sobre tipográfico com o gesto `escuta`, modalidades contrastantes, FAQ nativo numerado e CTA final em duas zonas foram implementados como especificado.
- O JavaScript existente foi preservado. Não entrou código, asset, fonte, identidade, pacote ou dependência de P13, H06, B07, Grid Fade, R19 ou R12.

## Assinatura Tipográfica

A interface usa somente esta assinatura em duas linhas:

```text
Josiani Nicolini
NUTRIÇÃO FUNCIONAL INTEGRATIVA
```

- `Josiani Nicolini`: Cormorant Garamond, peso 600.
- `NUTRIÇÃO FUNCIONAL INTEGRATIVA`: Manrope, peso 600, `12px`, caixa alta e tracking de `0.08em` a `0.12em`; o nome acessível da assinatura permanece íntegro.
- Não usar `Dra.`, credencial, CRN ou outra qualificação não validada.
- Não criar logo, símbolo, folha, fruta, monograma, selo ou ícone médico como substituto de logo.
- A assinatura não recebe medalhão, contorno, brasão ou iniciais decorativas.

## Sistema Visual

### Tokens obrigatórios

Os tokens oficiais permanecem literais. Os aliases adicionais apenas descrevem função; não substituem os valores da marca.

```css
:root {
  --bg: oklch(97% 0.012 88);
  --surface: oklch(99% 0.006 88);
  --fg: oklch(29% 0.045 125);
  --muted: oklch(51% 0.026 105);
  --border: oklch(86% 0.022 91);
  --accent: oklch(68% 0.115 82);
  --success: oklch(48% 0.095 145);
  --danger: oklch(52% 0.14 28);
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-body: "Manrope", "Segoe UI", sans-serif;
  --font-mono: "IBM Plex Mono", Consolas, monospace;
  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-lg: 32px;
  --shadow-soft: 0 18px 50px oklch(29% 0.045 125 / 0.1);

  --surface-alt: oklch(94% 0.018 102);
  --primary: var(--fg);
  --on-primary: var(--bg);
  --on-accent: var(--fg);
  --focus: var(--fg);
  --warning: var(--accent);
}
```

Mapeamento funcional:

| Função | Token |
|---|---|
| `color.bg` | `--bg` |
| `color.surface` | `--surface` |
| `color.surfaceAlt` | `--surface-alt` |
| `color.text` | `--fg` |
| `color.textMuted` | `--muted` |
| `color.primary` | `--primary` |
| `color.onPrimary` | `--on-primary` |
| `color.accent` | `--accent` |
| `color.onAccent` | `--on-accent` |
| `color.border` | `--border` |
| `color.focus` | `--focus` |
| `color.success` | `--success` |
| `color.warning` | `--warning` |
| `color.error` | `--danger` |

Regras de cor:

- Oliva é estrutura: texto, CTA primário, footer e regras de hierarquia.
- Dourado é pontuação: número ativo, regra curta ou detalhe de foco editorial; não é fundo amplo nem cor de parágrafo.
- Rosa, teal, laranja vivo, azul clínico e verde-lima não entram no sistema.
- Gradientes cromáticos, glows e grandes manchas translúcidas ficam excluídos.

O fallback sRGB de `--muted` implementado em `assets/css/styles.css` é `#60645b`; o token oficial `oklch(51% 0.026 105)` permanece inalterado e vem depois do fallback.

### Contrastes validados

O QA final mediu os caminhos sRGB/fallback e revisou o caminho OKLCH, estados interativos e `forced-colors`. O axe retornou zero violações; um único grupo `incomplete` reuniu 21 nós cujo fundo não pôde ser inferido por pseudo-elementos, SVG, imagem ou camadas, todos aprovados na revisão manual.

| Primeiro plano | Fundo | Razão | Resultado |
|---|---|---:|---|
| `#60645b` | `#edf0e8` | `5.25:1` | `PASS` AA |
| `#60645b` | `#faf8f2` | `5.70:1` | `PASS` AA |
| `#60645b` | `#fffdfa` | `5.96:1` | `PASS` AA |
| `#34402e` | `#faf8f2` | `10.31:1` | `PASS` AA |
| `#34402e` | `#fffdfa` | `10.78:1` | `PASS` AA |
| `#faf8f2` | `#34402e` | `10.31:1` | `PASS` AA |
| `#d7dccf` | `#34402e` | `7.83:1` | `PASS` AA |
| `#c7cec0` | `#283124` | `8.37:1` | `PASS` AA |

O par oficial OKLCH `--muted`/`--surface-alt` mede aproximadamente `4.81:1` e também passa AA. O texto ampliado `escuta` é decorativo, usa `aria-hidden="true"` e não substitui conteúdo acessível.

### Tipografia

- Famílias visíveis: somente Cormorant Garamond e Manrope.
- H1: Cormorant Garamond 600, `52–56px` no desktop e `40–48px` no mobile, tracking levemente negativo. O H1 factual longo usa conscientemente 4–6 linhas; foram observadas 5 linhas em `320px` e `375px`, sem reduzir o texto abaixo de `40px`.
- H2: `32–40px`; H3: `22–26px`.
- Corpo: Manrope 400, `16–18px`, entrelinha `1.6` e largura máxima de `65ch`.
- Labels: Manrope 600, `12–13px`, caixa alta curta e tracking de `0.08em`; a label da assinatura usa `12px`.
- Botões: Manrope 600, sem caixa alta obrigatória e sem compressão de tracking.
- `--font-mono` permanece no contrato oficial, mas não será carregada nem exibida nesta LP; isso preserva o orçamento máximo de duas famílias.
- Estratégia implementada: servir os dois WOFF2 pelo próprio projeto, carregar apenas os pesos usados, aplicar `font-display: swap` e manter os fallbacks definidos. Não há stylesheet, preconnect ou requisição de fonte a host externo.

| Família | Versão e seleção | Arquivo local | Origem oficial | Bytes | SHA-256 | Licença local |
|---|---|---|---|---:|---|---|
| Cormorant Garamond | Google Fonts v21, peso 600, Latin | `assets/fonts/cormorant-garamond-600-latin.woff2` | `https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_iE9KnTOig.woff2` | 23.396 | `ae062b6d5ae308e7edf61b28b07b9984bbb6e961b1f34d9b2c2f4389c33f21ea` | SIL OFL 1.1 em `assets/fonts/OFL-Cormorant-Garamond.txt`; SHA-256 `60700d351cac4650c51f3f9db318d2a420f8b45052dba2715eb5fec41f0f6956` |
| Manrope | Google Fonts v20, pesos 400-600, Latin | `assets/fonts/manrope-400-600-latin.woff2` | `https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSg.woff2` | 24.836 | `a30ddcd349703aff7464c34bef3fffdff405ee50c113440d7c8693c02d210972` | SIL OFL 1.1 em `assets/fonts/OFL-Manrope.txt`; SHA-256 `e01b637272e0cbdfb240184dd98ea5cc671556d9894dae2668d92ab2c906787c` |

### Grid e espaçamento

O grid é mobile-first e não depende de altura de viewport.

| Faixa | Colunas | Gutter | Margem lateral |
|---|---:|---:|---:|
| `320–767px` | 4 | `16px` | `16–20px` |
| `768–1023px` | 8 | `24px` | `32px` |
| `>=1024px` | 12 | `24–32px` | `40–48px` |

- Container máximo: `1200px`.
- Escala de espaço: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128px`.
- Ritmo de seção: variável e intencional dentro da escala. Alternar trechos compactos (`48–64px` mobile, `64–80px` desktop), pausas editoriais (`80–96px` mobile, `112–128px` desktop) e campos intermediários; não aplicar o mesmo padding a todas as seções.
- Texto corrido ocupa no máximo 5–7 colunas, sem linhas longas atravessando o container.
- A margem editorial pode deslocar labels e números dentro do grid; nunca cria overflow horizontal.
- A variação de ritmo não altera a ordem do DOM nem usa altura fixa de viewport.

### Forma, cards e controles

- Botões e controles: `--radius-sm`, altura preferencial de `52px` e alvo tátil mínimo de `44px`.
- Cards: `--surface`, `--radius-md`, separação tonal ou contorno neutro uniforme de `1px`.
- Cards claros nunca recebem borda lateral colorida, faixa de acento ou sombra individual pesada.
- Foto principal: máscara editorial alta e assimétrica ou arco amplo, derivada de geometria própria. O fallback é um recorte retangular com `--radius-lg`; nunca alterar a pessoa ou recortar o rosto.
- `--shadow-soft` é reservado ao retrato ou a uma única superfície em destaque, nunca a todos os cards.
- Seções alternam fundo e espaço; não transformar cada trecho em uma coleção de retângulos arredondados.
- Pills só aparecem se houver estado ou categoria real. Eyebrows editoriais permanecem texto, sem badge.
- Cards do processo podem ter deslocamentos estáticos discretos entre si, sem rotação, sobreposição que esconda copy ou movimento por scroll.

### Iconografia

- Nenhuma família de ícones é necessária para o redesign.
- Numeração, regras e sinais tipográficos resolvem processo e hierarquia.
- Setas ou sinais de expansão, se necessários, são funcionais, discretos e acompanhados por nome acessível.
- Não usar folha, intestino estilizado, maçã, fita métrica, estetoscópio, cruz médica, monograma `JN` ou ícones como decoração de cards.
- São permitidos ornamentos botânicos **lineares originais**, desenhados para esta página, sempre decorativos, `aria-hidden="true"`, sem foco e sem conteúdo essencial. Eles ficam concentrados nas bordas do hero e do CTA final, não competem com texto e nunca funcionam como logo, símbolo, selo ou prova.

## Fotografia

- Único asset autorizado: `C:/Users/Administrator/Desktop/Nutri/Projetos/josianinicolini/pp.jpg`.
- Uso: exatamente uma vez no hero. A seção Sobre é tipográfica e não possui imagem.
- Direção: preservar a luz quente, os tons naturais de pele, a profundidade do ambiente e a postura frontal. Não aplicar duotone oliva, desfoque artificial, recorte de silhueta ou retoque que altere aparência.
- Crop desktop implementado: retrato grande em arco assimétrico próximo de `4:5`; rosto, cabelo e gesto corporal permanecem seguros e sem copy sobre a pessoa.
- Crop mobile implementado: arco próximo de `1:1`, com recorte pouco agressivo depois do CTA.
- Derivados responsivos podem ser gerados apenas a partir de `pp.jpg`, com foco revisado em cada proporção e sem texto incorporado.
- Alt recomendado: `Retrato de Josiani Nicolini`.
- Não usar stock, comida, plantas fotografadas, consultório simulado, pacientes, terceiros, antes/depois, screenshots ou imagens de R19/R12 na produção.
- Processo e logística serão contados por composição e texto, pois não há outra fotografia autorizada.

## Composição

### Desktop

- Header editorial com assinatura à esquerda, `<nav>` real no desktop e CTA canônico. A navegação contém `Abordagem` (`#abordagem`), `Como funciona` (`#processo`), `Atendimento` (`#atendimento`) e `Dúvidas` (`#faq`).
- Hero em 12 colunas com copy dominante em um campo próprio e retrato alto em composição assimétrica. O texto precede a imagem no DOM; legenda operacional e linework ficam fora do rosto.
- A faixa logística é oliva, estática e compacta. Não há ticker, marquee, autoplay ou repetição animada.
- A identificação cria uma pausa tipográfica; a abordagem usa split editorial com pilares empilhados e não repete a grade do processo.
- O processo é o bloco de assinatura: campo oliva, Grid Fade e rails estáticos, título grande à esquerda e três cards marfim discretamente deslocados à direita.
- Atendimento e adequação formam um split editorial e preservam o H3 exato `Para quem é`.
- Sobre usa um grande gesto tipográfico em vez de segunda imagem; modalidades usam dois painéis contrastantes; FAQ permanece nativo com numeração e indicador em CSS.
- CTA final usa duas zonas, argumento e ação, com botânica linear original nas bordas e nenhuma urgência falsa.

### Mobile

- Ordem intencional: preservar integralmente a ordem macro e a ordem do DOM registradas no blueprint; no hero, assinatura, proposta e CTA precedem o retrato.
- O split vira sequência de uma coluna; padding e ritmo da primeira dobra foram ajustados para priorizar proposta e CTA antes da foto.
- O H1 factual longo quebra conscientemente em 4–6 linhas; 5 linhas foram observadas em 320/375, dentro da escala de `40–48px`.
- Cards viram fluxo de uma coluna. O processo mantém números à esquerda e conteúdo à direita, sem carrossel.
- Padding mínimo de `16px`, alvos de `44px`, foco visível e nenhuma rolagem horizontal em `320px`.
- A navegação desktop pode ser ocultada no mobile sem criar menu dependente de JavaScript; assinatura, CTA e todas as seções permanecem acessíveis no fluxo.
- Ornamentos botânicos são removidos antes de reduzir texto, respiro necessário ou alvo tátil.
- Não usar CTA sticky por padrão; o CTA permanece no fluxo e não cobre conteúdo.

### Baixa altura e landscape

- Não usar `height: 100vh` nem centralização vertical forçada no hero.
- Em viewports com altura inferior a aproximadamente `700px`, reduzir padding vertical e usar o limite inferior da escala do H1; preservar conteúdo e CTA completos.
- Limitar visualmente o retrato sem cortar o rosto e permitir que a página continue em fluxo normal.
- Em mobile landscape, manter texto antes da foto e reduzir a foto depois do CTA; não criar duas colunas comprimidas.
- Header não sobrepõe hero, menu ou CTA. Não há seção sticky/pinned.

## Motion

- Nível: `M1_SUBTLE`.
- Proprietário técnico: CSS e `IntersectionObserver`, sem biblioteca ou runtime adicional.
- Assinatura: reveal com opacidade fixa em `1` durante todo o ciclo e apenas `translateY` de até `12px` até `0`, em `420ms` com curva suave; hover eleva no máximo `2px` em `180ms`.
- Estado inicial: todo conteúdo, CTA, navegação e imagem ficam visíveis e utilizáveis. JavaScript nunca é requisito para revelar informação.
- Progressive enhancement: o observer adiciona classes apenas após inicialização bem-sucedida; se JS ou observer falhar, o documento permanece estático e completo.
- Lifecycle: `pagehide` desconecta o observer e limpa estados; quando o navegador restaura a página pelo BFCache, `pageshow` com `event.persisted` reinicializa o reveal de forma idempotente.
- Reduced motion: em `prefers-reduced-motion: reduce`, remover deslocamentos, reveals e transições não essenciais; estados de foco e expansão permanecem imediatos.
- Sem parallax, smooth scroll, autoplay, marquee, contadores, pinning, canvas, WebGL, vídeo ou animação contínua.
- No reveal, animar somente `transform`; `opacity` permanece em `1`. Não animar grandes blurs, filtros ou propriedades de layout.
- O marquee foi descartado porque não acrescenta informação e introduziria movimento contínuo desnecessário.

## Referências Visuais

Esta seleção ocupa exatamente o teto do catálogo: uma página, um hero, um bloco, um efeito e duas referências visuais de grupos distintos. Todos possuem procedência e licença `UNKNOWN`; nenhum código, asset, texto, identidade ou dependência é copiado. Toda saída é reimplementação própria no stack e nos tokens do projeto.

| Categoria | Seleção | Catálogo / reuso | Extração permitida | Rejeições obrigatórias |
|---|---|---|---|---|
| `primary_page` | P13 — `Modelos & Codigos/Páginas/Página 13/Página 13/index.html` | `BASE` / `PATTERN` | Apenas macroarquitetura e variação de ritmo, sem alterar a ordem macro já aprovada. | Markup, CSS, JS, fontes proprietárias, claims, métricas, links e dependências. |
| `hero` | H06 — `Modelos & Codigos/HERO/hero06/hero6` | `ADAPT` / `REBUILD` | Retrato dominante, assimetria e campo próprio de copy. | Imagens, código, Google Fonts, cursor removido, scroll lock, `100svh`, RAF/reveal interativo e CTA `#`. |
| `block` | B07 — `Modelos & Codigos/Blocos/blocos premium.txt:1682-1950` | `REBUILD` / `REBUILD` | Título grande à esquerda, cards/etapas à direita e rails finos. | GSAP, ScrollTrigger, SplitText, scrub, offsets/rotações, quatro etapas e estilo azul. |
| `effect` | Grid Fade Background — `Modelos & Codigos/Efeitos/efeitos.txt:1470-1622` | `BASE` / `REBUILD` | Fundo estático escopado exclusivamente ao processo. | Tokens globais, dimensões rígidas, snippet literal e elipse original; sem dependência ou JS. |
| `visual_ref` | R19 — `Ref Design/9bdcdc243486563.69829c5ff022c.webp`, grupo `RD-243486563` | `REFERENCE` / `PRINCIPLE` | Equilíbrio clínico, hero split, faixa operacional e fluxo. | Identidade, foto, badges, métricas, depoimentos e ticker animado. |
| `visual_ref` | R12 — `Ref Design/653033239714361.692f9652a53e7.webp`, grupo `RD-239714361` | `REFERENCE` / `PRINCIPLE` | Materialidade marfim/oliva/dourada, botânica nas bordas, fotografia integrada e áreas editoriais. | Assets, folhas copiadas, múltiplas fotos, credenciais, depoimentos e claims. |

P13 permanece somente um padrão de macroarquitetura; H06, B07 e Grid Fade são reconstruções conceituais. Se qualquer referência ficar indisponível, o fallback é o próprio brief, a ordem vigente e o design system Josiani, sem perda de conteúdo ou função.

## Decisões Anti-Genérico

- A decisão de layout deriva da oferta: consulta e acompanhamento pedem sequência legível e CTA único, não um funil de prova social.
- O detalhe pertencente à marca é a **margem viva**: botânica linear original, regras finas, arcos amplos e numeração disciplinada em marfim/oliva/dourado.
- A única foto apresenta Josiani como presença humana; ela não simula atendimento, equipe, paciente ou resultado.
- O clichê “verde + folha” é evitado ao restringir a botânica a linework autoral nas bordas, subordinado à tipografia, à fotografia quente e à estrutura clínica.
- Foram removidos selos, badges, estrelas, números de pacientes, depoimentos, antes/depois, credenciais não validadas, fotos de comida e urgência artificial.
- Cards não formam um mosaico genérico de ícones: entram apenas quando organizam informação real e permanecem claros, sem borda lateral.
- No mobile, a proposta e o CTA vêm antes da imagem; o desktop split não é espremido.
- A página não usa estética de spa, dieta restritiva, emagrecimento rápido, health-tech azul ou “premium” baseado em sombras e dourado excessivos.
- O processo possui uma composição própria e reconhecível; abordagem, adequação e modalidades não repetem o mesmo grid de cards.
- Não há marquee: a faixa operacional informa, mas não cria movimento ou redundância.

## Critérios De Aceite Visual

- Assinatura tipográfica exata, sem símbolo substituto.
- Somente `pp.jpg` como fotografia de produção e sem repetição gratuita.
- Retrato em recorte alto assimétrico ou arco amplo, sem alteração da pessoa, sem texto no rosto e com fallback retangular seguro.
- P13 em `PATTERN`; H06, B07 e Grid Fade em `REBUILD`; R19 e R12 em `PRINCIPLE`, com procedência/licença `UNKNOWN` e rejeições preservadas.
- Nenhum markup, CSS, JS, fonte, mídia, claim, métrica, link, identidade ou dependência do acervo entra na produção.
- Navegação desktop com as quatro âncoras reais; mobile sem menu dependente de JS e com conversão essencial preservada.
- Processo com exatamente três etapas reais, cards legíveis, rails e grid estáticos; sem GSAP, scrub, sticky obrigatório ou runtime novo.
- Ornamentos botânicos originais, decorativos e `aria-hidden`, restritos às bordas e removíveis no mobile.
- Contrastes medidos antes da publicação; foco, teclado, zoom de 200% e `forced-colors` verificados.
- Reflow sem perda em `320`, `375`, `768`, `1024` e `1440px`, incluindo baixa altura e landscape.
- Conteúdo essencial visível com JS desabilitado e com `prefers-reduced-motion`.
- Fontes e licenças carregadas apenas de `assets/fonts/`, com os hashes registrados e sem dependência de host tipográfico externo.
- Dourado limitado, cards sem borda lateral colorida e nenhuma credencial, métrica ou prova inventada.
- Copy factual, ordem macro, três CTAs e bloqueios de release permanecem; todos os critérios visuais locais foram atendidos no QA final. Qualquer mudança futura de implementação invalida os resultados afetados e exige nova verificação antes de release.

## Fechamento visual

- Estado atual: `IMPLEMENTED / QA_EXECUTED / RELEASE_BLOCKED`.
- Revisão visual final somente leitura: nenhum P0/P1/P2 visual ou técnico local atual; recorte seguro, sem colagem, overflow ou sobreposição.
- Ajustes finais verificados: fallback muted `#60645b`, H1/primeira dobra mobile, grids intermediários em 768px, troca do `JN` decorativo por `01 / SOBRE`, notices do footer em 16px, foco claro no e-mail do painel oliva e assinatura em 12px com nome acessível.
- O bloqueio de release é externo à direção visual e à implementação.
