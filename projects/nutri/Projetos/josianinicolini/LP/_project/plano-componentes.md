# Plano de Componentes

## Controle e revisão G2/G3

| Campo | Decisão |
|---|---|
| Projeto | LP Josiani Nicolini - Saúde Intestinal |
| Rota | `/` |
| Perfil | `LP_SERVICO / HEALTH / STATIC` |
| Modo | `AUTO` |
| Alvo | `PRODUCTION` |
| Direção | Margem Viva - editorial botânico-clínica mais expressiva |
| Motion | `M1_SUBTLE`, somente CSS e `IntersectionObserver` |
| Revisão G2/G3 | `APPROVED_OPERATIONAL_REVISION_AUTO` |
| Estado do redesign | `IMPLEMENTED / QA_EXECUTED / RELEASE_BLOCKED` |
| Decisor | OpenCode |
| Data | 2026-07-26 |
| Publicável neste estágio | Não |

O usuário rejeitou a execução visual anterior e determinou a continuidade do redesign. Em modo `AUTO`, Margem Viva supersede Margem de Escuta como revisão operacional de G2/G3 em 2026-07-26, sem gate de confirmação adicional. O blueprint foi realizado em `index.html` e `assets/css/styles.css`, o JavaScript existente foi preservado e o QA final atual cobre Margem Viva.

O Gate G4 e o release continuam `BLOCKED`: permanecem os P1 externos de revisão HEALTH (`QA-P1-001`/`U-014`), identificação profissional (`QA-P1-002`/`U-001`) e privacidade (`QA-P1-003`/`U-009`/`OP-001`), além de deploy e cobertura adicional (`QA-P2-001` e `QA-P2-002`). Não há P0 aberto nem waiver, e `publishable=false`.

## Escopo da versão

- Uma página estática, uma rota e uma conversão primária.
- CTA canônico: `Agendar pelo WhatsApp`.
- Destino canônico: `https://api.whatsapp.com/send?phone=5551999612970`.
- Link sem parâmetro `text`, mensagem predefinida, PII, sintoma, dado de saúde, redirect ou parâmetro propagado.
- Sem formulário, agenda, checkout, mapa, analytics, pixel, cookie próprio, consent manager ou schema.
- Sem depoimentos, métricas, preço, credenciais, registro profissional, antes/depois ou claims não aprovados.
- Sem Tailwind, CDN de componentes, framework, package manager, bundler ou biblioteca JavaScript.
- Conteúdo integralmente utilizável sem JavaScript e sem animação.

## Stack e estrutura

- Framework/runtime: HTML5 semântico, CSS nativo e JavaScript ES module sem imports.
- Package manager e lockfile: não aplicáveis; não há pacotes instalados.
- Build: nenhum. Os arquivos publicados são os arquivos de produção.
- Caminhos: relativos ao documento para funcionar na raiz ou em subpasta.
- Publish root: `PROJECT_ROOT`, em `C:/Users/Administrator/Desktop/Nutri/Projetos/josianinicolini/LP`.
- Motion owner: CSS para estados e transições; `IntersectionObserver` apenas para o reveal progressivo M1.
- Header e ano: não precisam de JavaScript nesta versão. O header permanece funcional e o footer não depende de ano dinâmico.
- Estado observado: `index.html` e `assets/css/styles.css` realizam Margem Viva; JavaScript, retrato e os quatro arquivos tipográficos previstos existem no `PROJECT_ROOT`. O QA técnico local atual em `_project/qa-report.md` cobre essa implementação final.

```text
PROJECT_ROOT/
|-- index.html
|-- assets/
|   |-- css/
|   |   `-- styles.css
|   |-- fonts/
|   |   |-- cormorant-garamond-600-latin.woff2
|   |   |-- manrope-400-600-latin.woff2
|   |   |-- OFL-Cormorant-Garamond.txt
|   |   `-- OFL-Manrope.txt
|   |-- js/
|   |   `-- main.js
|   `-- images/
|       `-- josiani-portrait.jpg
`-- _project/
    `-- artefatos internos, nunca publicados
```

`assets/fonts/` faz parte da implementação e do pacote publicável. Os dois WOFF2 e os dois arquivos SIL OFL 1.1 são locais, verificados por tamanho e SHA-256 e não geram requisição a serviço tipográfico externo.

## Implementação realizada

- O header exibe quatro âncoras reais no desktop; no mobile, a nav é ocultada sem hamburger, drawer ou JavaScript.
- O hero é assimétrico, usa o único retrato em arco próximo de 4:5 no desktop e de 1:1 no mobile e mantém copy/CTA antes da imagem no DOM.
- O H1 usa 52–56px no desktop e 40–48px no mobile. Por ser factual e longo, sua faixa consciente é de 4–6 linhas; foram observadas 5 linhas em 320px e 375px.
- Dois SVGs botânicos inline originais, `aria-hidden="true"` e `focusable="false"`, aparecem apenas nas bordas do hero e do CTA final.
- A faixa oliva é estática; a abordagem forma uma escada; o processo usa campo oliva, Grid Fade, rails e três cards; Sobre usa o gesto tipográfico decorativo `escuta`; modalidades contrastam dois painéis; o FAQ mantém seis `details` numerados; o CTA final usa duas zonas.
- O fallback sRGB de `--muted` é `#60645b`, seguido pelo token OKLCH oficial. A label da assinatura usa 12px e preserva o nome acessível.
- Foram ajustados a primeira dobra/H1 mobile, os grids intermediários em 768px, `01 / SOBRE` no lugar do `JN` decorativo, notices do footer em 16px e foco claro no e-mail do painel oliva.
- P13 permanece `PATTERN`; H06, B07 e Grid Fade permanecem `REBUILD`; R19/R12 permanecem `PRINCIPLE`. Não entrou código, asset, fonte, identidade, link, pacote ou dependência do acervo.
- Os dois SVGs são inline e não alteram a allowlist pública de oito arquivos.

### Responsabilidade dos arquivos

| Arquivo | Responsabilidade | Restrições |
|---|---|---|
| `index.html` | Semântica, conteúdo aprovado, metadata, landmarks, links reais e ordem mobile coerente com o DOM | Sem CSS/JS volumoso inline, canonical, schema, formulário ou placeholders |
| `assets/css/styles.css` | Tokens, reset mínimo original, grid, tipografia, estados, responsividade e reduced motion | Classes `jn-*`; sem Tailwind, CSS copiado, `@import`, scroll hijacking ou conteúdo essencial em pseudo-elemento |
| `assets/js/main.js` | Progressive enhancement do reveal M1 e seu lifecycle | Sem alterar copy, criar CTA, controlar FAQ, bloquear scroll, rastrear eventos ou liberar conteúdo oculto |
| `assets/images/josiani-portrait.jpg` | Único retrato de produção, derivado de `pp.jpg` | Uso único no hero; sem texto incorporado, hotlink, duotone, recorte de silhueta ou repetição na seção sobre |
| `assets/fonts/cormorant-garamond-600-latin.woff2` | Cormorant Garamond 600 Latin auto-hospedada | Somente `@font-face` local; manter nome, versão, licença e hash registrados |
| `assets/fonts/manrope-400-600-latin.woff2` | Manrope variável 400-600 Latin auto-hospedada | Somente `@font-face` local; manter nome, versão, licença e hash registrados |
| `assets/fonts/OFL-Cormorant-Garamond.txt` | Licença SIL OFL 1.1 da Cormorant Garamond | Publicar junto ao binário; não editar sem nova verificação de integridade |
| `assets/fonts/OFL-Manrope.txt` | Licença SIL OFL 1.1 da Manrope | Publicar junto ao binário; não editar sem nova verificação de integridade |

## Contrato de publicação

O diretório configurado como publish root é `PROJECT_ROOT`, mas o deploy deve operar por allowlist destes oito arquivos públicos:

- `index.html`
- `assets/css/styles.css`
- `assets/js/main.js`
- `assets/images/josiani-portrait.jpg`
- `assets/fonts/cormorant-garamond-600-latin.woff2`
- `assets/fonts/manrope-400-600-latin.woff2`
- `assets/fonts/OFL-Cormorant-Garamond.txt`
- `assets/fonts/OFL-Manrope.txt`

Excluir explicitamente:

- `_project/**`
- `.env` e `.env*`
- `**/*.log` e `logs/**`
- `**/*.bak`, `**/*.backup`, `**/*~` e demais backups
- `evidence/**`, `**/evidence/**`, `_evidence/**` e evidências de QA não públicas
- source maps, arquivos temporários, dumps e relatórios internos

Após deploy, cada caminho excluído deve retornar `404` ou `403`, directory listing deve estar desativado e nenhum arquivo interno pode aparecer em manifestos, cache público ou indexação.

## Dependências diretas

| Nome | Versão/seleção | Origem | Licença | Função | Custo máximo | Lock/integridade | Decisão |
|---|---|---|---|---|---|---|---|
| Cormorant Garamond local | Google Fonts Cormorant Garamond v21; peso 600; Latin | `assets/fonts/cormorant-garamond-600-latin.woff2`, obtido da origem oficial `https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_iE9KnTOig.woff2` | SIL OFL 1.1; `assets/fonts/OFL-Cormorant-Garamond.txt`, SHA-256 `60700d351cac4650c51f3f9db318d2a420f8b45052dba2715eb5fec41f0f6956` | Display e assinatura | 23.396 bytes | WOFF2 SHA-256 `ae062b6d5ae308e7edf61b28b07b9984bbb6e961b1f34d9b2c2f4389c33f21ea` | Dependência direta local, auto-hospedada e incluída na allowlist; nenhum host externo em runtime |
| Manrope local | Google Fonts Manrope v20; pesos 400-600; Latin | `assets/fonts/manrope-400-600-latin.woff2`, obtido da origem oficial `https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSg.woff2` | SIL OFL 1.1; `assets/fonts/OFL-Manrope.txt`, SHA-256 `e01b637272e0cbdfb240184dd98ea5cc671556d9894dae2668d92ab2c906787c` | Corpo, labels e controles | 24.836 bytes | WOFF2 SHA-256 `a30ddcd349703aff7464c34bef3fffdff405ee50c113440d7c8693c02d210972` | Dependência direta local, auto-hospedada e incluída na allowlist; nenhum host externo em runtime |

- Carregamento por dois `@font-face` no CSS próprio, com `font-display: swap`, e preload dos dois WOFF2 locais no documento.
- Não usar `<link>` de stylesheet tipográfico, `@import`, `preconnect`, hotlink ou allowlist de host externo.
- Fallback display: `Georgia, serif`.
- Fallback body: `"Segoe UI", Arial, sans-serif`.
- `IBM Plex Mono` não será carregada nem usada.
- Se um WOFF2 local falhar, todo texto permanece legível e funcional com os fallbacks.
- Os dois arquivos SIL OFL 1.1 acompanham os binários no publish root; qualquer troca de arquivo exige nova conferência de versão, origem, tamanho e SHA-256.
- Bibliotecas JavaScript, UI, motion ou CSS de terceiros: nenhuma. As únicas dependências diretas de apresentação são os dois WOFF2 locais documentados acima.

## Orçamento técnico

| Item | Limite |
|---|---:|
| LCP de laboratório | `<= 2,5 s` |
| CLS | `<= 0,10` |
| INP de campo | `<= 200 ms`, somente quando houver dados reais |
| JavaScript inicial gzip | Meta interna `<= 5 KB`; teto do projeto `<= 150 KB` |
| CSS gzip | Meta interna `<= 30 KB` |
| HTML gzip | Meta interna `<= 20 KB` |
| Retrato JPG | Meta `<= 250 KB`, sem upscale |
| Fontes transferidas | 48.232 bytes observados; limite `<= 180 KB` |
| Peso inicial total | Meta interna `<= 700 KB`; teto do projeto `<= 1,5 MB` |
| Famílias tipográficas | 2 |
| Efeitos de assinatura | 1 reveal M1 |
| Bibliotecas/runtime externos | 0 |

O retrato é o candidato a LCP: deve ter largura e altura intrínsecas, `loading="eager"`, `fetchpriority="high"`, proporção reservada e tamanho compatível com o maior uso real. CSS, JS e fontes não podem causar deslocamento de layout. O script usa `type="module"`, que já é deferido, e não entra no caminho necessário para leitura ou conversão.

## Estratégia de imagem

| Asset de origem | Asset público | Procedência | Tratamento permitido | Uso |
|---|---|---|---|---|
| `C:/Users/Administrator/Desktop/Nutri/Projetos/josianinicolini/pp.jpg` (`A-002`) | `assets/images/josiani-portrait.jpg` | Retrato próprio da cliente; uso comercial autorizado em 2026-07-26 | Corrigir orientação, redimensionar sem upscale, comprimir em qualidade visual adequada e remover metadados desnecessários; preservar pele, luz e aparência | Uma única ocorrência no hero |

- Manter JPG nesta entrega para respeitar o conjunto de arquivos definido; gerar AVIF/WebP ou variantes responsivas somente se a medição mostrar que o JPG otimizado não cumpre o budget.
- Crop implementado em arco assimétrico próximo de 4:5 no desktop e de 1:1 no mobile, sempre preservando rosto, cabelo e gesto, sem conteúdo sobre a pessoa.
- Texto alternativo: `Retrato de Josiani Nicolini.`
- A imagem não contém copy essencial e não é prova clínica.
- Sem lazy loading na imagem do hero; não há outras imagens para carregar.
- Se o arquivo falhar, texto, CTA e hierarquia continuam completos; o espaço reservado evita CLS.
- Não usar stock, comida, plantas fotografadas, consultório simulado, pacientes, terceiros, antes/depois, screenshots ou mídia de R19/R12.

## CSS, tokens e escopo

- Usar os tokens literais de `direcao-visual.md` como fonte única: 70–90% de neutros, oliva estrutural, dourado pontual, raios e sombra suave.
- Declarar fallback sRGB antes de cada valor OKLCH crítico e medir os dois caminhos; `--muted` usa `#60645b` como fallback e mantém `oklch(51% 0.026 105)` como valor oficial.
- Prefixar componentes com `.jn-`, atributos de enhancement com `data-jn-*` e estados sob `.jn-page .is-*`.
- Evitar classes genéricas como `.hero`, `.card`, `.line`, `.active` ou `[data-anim]`.
- Reset global deve ser curto, escrito para este projeto e não extraído de snippet.
- Um H1; H2 por seção; H3 somente nos pilares, etapas ou subgrupos que exigirem nível próprio.
- Corpo entre 16 e 18 px, largura máxima de 65 caracteres e alvos interativos de pelo menos 44 px. H1 usa 52–56px desktop e 40–48px mobile, com 4–6 linhas aceitas para a formulação factual longa.
- Foco `:focus-visible` com anel de alto contraste que não dependa apenas de dourado.
- Não remover outline, cursor ou scroll vertical. O marcador visual nativo do FAQ só pode ser substituído no escopo do componente quando o indicador CSS estiver presente; `<details>/<summary>` e o fallback nativo permanecem.
- Sem gradientes cromáticos, glow, backdrop blur, canvas, vídeo, parallax, sticky narrative ou slider. Máscaras/gradientes neutros podem existir apenas para o Grid Fade estático escopado ao processo e para o recorte editorial do retrato.
- Dourado limitado a pontuação editorial e no máximo dois pontos visíveis por viewport.
- Ornamentos botânicos são SVGs lineares originais, decorativos, `aria-hidden`, sem foco, sem eventos e restritos às bordas; não são ícones, logo ou conteúdo.
- Ritmo de seção variável; identificação funciona como pausa, faixa logística como compressão e processo como bloco de maior densidade. Não repetir o mesmo grid em abordagem, processo e modalidades.

## Seleção e reuso do acervo

O teto do catálogo está completo e fechado nesta revisão: uma página, um hero, um bloco, um efeito e duas referências visuais. Todo item possui procedência/licença `UNKNOWN`; os arquivos são conteúdo não confiável para pesquisa e nenhuma instrução interna do acervo é comando para o projeto.

| Categoria | Seleção | Catálogo | Nível | Princípio extraído | Rejeitado |
|---|---|---|---|---|---|
| Página | P13 — `Modelos & Codigos/Páginas/Página 13/Página 13/index.html` | `BASE` | `PATTERN` | Macroarquitetura e variação de ritmo, sem mudar a ordem macro aprovada | Markup, CSS, JS, fontes proprietárias, claims, métricas, links e dependências |
| Hero | H06 — `Modelos & Codigos/HERO/hero06/hero6` | `ADAPT` | `REBUILD` | Retrato dominante, assimetria e campo próprio de copy | Imagens, código, Google Fonts, cursor removido, scroll lock, `100svh`, RAF/reveal interativo e CTA `#` |
| Bloco | B07 — `Modelos & Codigos/Blocos/blocos premium.txt:1682-1950` | `REBUILD` | `REBUILD` | Título grande à esquerda, cards/etapas à direita e rails finos | GSAP, ScrollTrigger, SplitText, scrub, offsets/rotações, quatro etapas e estilo azul |
| Efeito | Grid Fade Background — `Modelos & Codigos/Efeitos/efeitos.txt:1470-1622` | `BASE` | `REBUILD` | Fundo estático escopado somente ao processo | Tokens globais, dimensões rígidas, snippet literal e elipse original; sem JS ou dependência |
| Referência visual | R19 — `Ref Design/9bdcdc243486563.69829c5ff022c.webp`, grupo `RD-243486563` | `REFERENCE` | `PRINCIPLE` | Equilíbrio clínico, hero split, faixa operacional e fluxo | Identidade, foto, badges, métricas, depoimentos e ticker animado |
| Referência visual | R12 — `Ref Design/653033239714361.692f9652a53e7.webp`, grupo `RD-239714361` | `REFERENCE` | `PRINCIPLE` | Materialidade marfim/oliva/dourada, botânica nas bordas, fotografia integrada e áreas editoriais | Assets, folhas copiadas, múltiplas fotos, credenciais, depoimentos e claims |

### Contrato de reuso, dependências e fallback

| Seleção | Procedência/licença | Dependências incorporadas | Fallback funcional | Custo/validação |
|---|---|---|---|---|
| P13 | `UNKNOWN` | Nenhuma | Ordem macro e componentes próprios já definidos neste plano | Custo zero em runtime; confirmar ausência de markup, CSS, JS, fontes, links e conteúdo residual de P13 |
| H06 | `UNKNOWN` | Nenhuma | Split próprio; se máscara não for suportada, retrato retangular com `--radius-lg`, sempre após CTA no DOM | Custo baixo de CSS; confirmar um retrato local, sem cursor customizado, lock, RAF, `100svh`, fonte/asset remoto ou CTA vazio |
| B07 | `UNKNOWN` | Nenhuma | Título seguido por lista linear de três etapas; rails e deslocamentos podem desaparecer sem perda | Custo baixo de layout; confirmar três etapas reais, sem GSAP/plugins, scrub, rotação ou quarta etapa |
| Grid Fade Background | `UNKNOWN` | Nenhuma | Campo oliva sólido quando máscara/grade não for suportada | CSS estático escopado a `.jn-process`; confirmar ausência de tokens globais, dimensão rígida, elipse e snippet literal |
| R19 | `UNKNOWN` | Nenhuma | Composição própria orientada pelo brief e pelos tokens Josiani | Inspeção visual; nenhum pixel, retrato, badge, métrica, depoimento, ticker, identidade ou código no publish root |
| R12 | `UNKNOWN` | Nenhuma | Materialidade própria e linework botânico desenhado para Margem Viva | Inspeção visual; nenhum asset, folha reproduzida, foto adicional, credencial, depoimento, claim ou código no publish root |

As únicas dependências diretas de apresentação continuam sendo os dois WOFF2 locais já licenciados. P13, H06, B07, Grid Fade, R19 e R12 não criam pacote, requisição, asset, fonte ou runtime.

## Ordem da página

| Ordem | ID | Componente | Função | CTA direto |
|---:|---|---|---|---|
| 1 | `jn-skip-link` | Skip link | Acesso rápido ao conteúdo principal | Não |
| 2 | `jn-site-header` | Header editorial | Assinatura, navegação por âncoras e ação imediata | Sim |
| 3 | `jn-hero` | Hero assimétrico | Oferta, público, modalidade, próximo passo e único retrato | Sim |
| 4 | `jn-logistics-strip` | Faixa logística | Formato e localização sem falsa prova | Não |
| 5 | `jn-identification` | Pausa editorial tipográfica | Reconhecer dúvidas sem culpa ou diagnóstico | Não |
| 6 | `jn-approach` | Split de abordagem e pilares | Explicar a lógica individual em ritmo assimétrico | Não |
| 7 | `jn-process` | Bloco de assinatura em três etapas | Reduzir incerteza sobre o começo | Não |
| 8 | `jn-fit-deliverables` | Split de atendimento e adequação | Concretizar o atendimento e qualificar o público | Não |
| 9 | `jn-about` | Sobre com gesto tipográfico | Apresentar postura e filosofia sem segunda foto ou credenciais pendentes | Não |
| 10 | `jn-modalities` | Dois painéis de modalidades | Informar online, presencial, endereço e e-mail | Não |
| 11 | `jn-faq` | FAQ nativo numerado | Responder dúvidas confirmadas | Não |
| 12 | `jn-final-cta` | CTA final em duas zonas | Recapitular e converter | Sim |
| 13 | `jn-site-footer` | Footer | Identificação, contato, privacidade e limites | Não |

As três ocorrências permanecem exatamente no header, no hero e no fechamento, com o mesmo rótulo canônico e o mesmo destino. O processo não recebe CTA, e não existe CTA sticky adicional.

## Contratos globais

- Landmarks: `header`, `<nav aria-label="Navegação principal">`, `main` e `footer`. A nav desktop contém somente `#abordagem`, `#processo`, `#atendimento` e `#faq`.
- Ordem do DOM igual à ordem de leitura mobile; CSS só cria o split do hero e grids em telas largas.
- O conteúdo vem de `copy.md`; este plano não autoriza variações de claims.
- Estados comuns de links: default, hover, `focus-visible`, active e visited sem perda de contraste; estado disabled não se aplica a links reais.
- Todos os links funcionam por teclado e sem JavaScript. Não usar `role="button"` em links.
- Não abrir WhatsApp ou e-mail em nova aba por padrão; evitar dependência de `window.opener` e preservar comportamento do dispositivo.
- Nenhum componente possui loading, empty, error ou success artificial; esses estados são `N/A` porque não há requisição de aplicação ou formulário.
- No-JS: HTML e CSS entregam todo conteúdo, links e FAQ. A falha de um arquivo de fonte local usa fallback.
- Reduced motion: sem transform, reveal ou transição não essencial; foco e abertura nativa de `details` permanecem imediatos.
- Mobile: uma coluna em 320 e 375 px, padding mínimo de 16 px, sem scroll horizontal, sem conteúdo dependente de hover e sem CTA fixo.
- Mobile: a nav pode ser ocultada sem menu hamburger ou JavaScript; assinatura, CTA canônico, skip link e leitura sequencial preservam toda função essencial.
- Baixa altura/landscape: fluxo normal, sem `100vh`, pinning ou centralização vertical forçada.
- Performance: nenhum listener ou observer é criado por componente estático; o único lifecycle pertence a `jn-reveal`.

## Componentes

### `jn-skip-link`

- purpose: permitir que teclado e tecnologia assistiva ignorem o header e cheguem ao conteúdo.
- semantic_root: primeiro `<a>` focável do documento, com `href="#conteudo-principal"`; o `<main id="conteudo-principal" tabindex="-1">` é o destino.
- content_owner: requisito desta tarefa e checklist de acessibilidade.
- source: `09-CHECKLIST-QA.md`; nenhuma fonte do acervo.
- catalog_status: N/A.
- reuse_level: `REBUILD` original.
- extracted: padrão web nativo de skip navigation.
- rejected: botão controlado por JS, link invisível ao foco ou alvo inexistente.
- provenance: implementação própria baseada em HTML nativo.
- dependencies: nenhuma.
- states: visualmente recolhido fora de foco; visível, legível e acima do header em `focus-visible`; active.
- keyboard: deve ser o primeiro Tab; Enter move a navegação para o `main` e o foco não fica oculto.
- no_js: funcional.
- reduced_motion: deslocamento imediato, sem animação.
- mobile: largura compatível com 320 px, sem sair da viewport.
- media/fallback: não aplicável.
- performance_risk: baixo.
- cleanup: não aplicável.
- validation: primeiro foco, destino real, foco visível, zoom 200%, 320 px e teste em Chrome/Firefox/NVDA.

### `jn-site-header`

- purpose: identificar Josiani, oferecer navegação curta por âncoras reais no desktop e manter a ação principal imediata.
- semantic_root: `<header>` com assinatura textual, `<nav aria-label="Navegação principal">` e um `<a>` externo de CTA fora da lista de navegação.
- content_owner: assinatura de `direcao-visual.md`; CTA de `spec.yaml`.
- source: artefatos do projeto; P13 informa apenas o padrão macro de header/navegação, sem reutilização de markup.
- catalog_status: P13 `BASE`.
- reuse_level: P13 `PATTERN`; implementação do header em `REBUILD` próprio.
- extracted: de P13, somente a função genérica de uma navegação curta dentro da macroarquitetura.
- rejected: markup/CSS/JS de P13, logo inventado, símbolo, menu hamburger, drawer, navegação vazia, CTA sticky e header com scroll effect.
- provenance: assinatura oficial em duas linhas, sem imagem de logo.
- signature: `Josiani Nicolini` na primeira linha e `NUTRIÇÃO FUNCIONAL INTEGRATIVA` na segunda, como posicionamento sujeito à revisão final de saúde.
- dependencies: WOFF2 locais Cormorant Garamond v21 e Manrope v20, com fallbacks; nenhuma dependência funcional.
- states: base, hover, `focus-visible`, active e visited dos quatro links internos e do CTA; não há estado aberto/fechado, scrolled ou menu móvel.
- keyboard: após o skip link, a ordem acompanha assinatura não focável, quatro âncoras e CTA; Enter segue cada `href` real e o destino não fica coberto pelo header.
- no_js: completo; header não usa script.
- reduced_motion: sem transição de posição; hover não pode ser requisito.
- mobile: ocultar a nav por CSS é permitido; assinatura e CTA cabem sem compressão, com alvo de 44 px e sem cobrir o hero. Não criar substituto dependente de JS.
- media/fallback: assinatura permanece texto com fallback tipográfico.
- performance_risk: baixo.
- cleanup: não aplicável.
- validation: assinatura exata, sem `Dra.`, CRN, ícone ou símbolo; labels/hrefs `Abordagem`/`#abordagem`, `Como funciona`/`#processo`, `Atendimento`/`#atendimento`, `Dúvidas`/`#faq`; destino do CTA, foco, offset das âncoras, 320 px e ausência de overflow.

### `jn-hero`

- purpose: responder quem atende, para quem, o que é oferecido, como ocorre e qual é o próximo passo.
- semantic_root: `<section id="inicio" aria-labelledby="titulo-principal">` dentro de `main`, com único `<h1>`, texto, CTA, microcopy e `<figure>`; copy precede a figura no DOM.
- content_owner: seção `header-hero` de `copy.md` e `E-003`, `E-013`, `E-016`, `E-017`, `E-018`, `E-019`.
- source: H06 reconstruído para composição; R19 e R12 somente como referências visuais de princípio.
- catalog_status: H06 `ADAPT`; R19 e R12 `REFERENCE`.
- reuse_level: H06 `REBUILD`; R19/R12 `PRINCIPLE`.
- extracted: de H06, retrato dominante, assimetria e campo próprio de copy; de R19, equilíbrio clínico e hero split; de R12, fotografia integrada e materialidade.
- rejected: imagens, código, Google Fonts, cursor removido, scroll lock, `100svh`, RAF/reveal interativo e CTA `#` de H06; identidade, foto, badges, métricas, depoimentos, ticker, assets, folhas copiadas e proporções exatas das referências visuais.
- provenance: copy do projeto e retrato autorizado `A-002`.
- dependencies: imagem local e WOFF2 locais com fallback.
- states: conteúdo estático; CTA em default, hover, focus e active; imagem carregada ou fallback reservado.
- keyboard: apenas o CTA entra no fluxo; ordem acompanha texto antes da imagem.
- no_js: H1, body, CTA, microcopy e imagem ficam visíveis.
- reduced_motion: hero estático e sem entrada animada.
- mobile: ordem assinatura no header, eyebrow, H1, body, CTA, microcopy e retrato; uma coluna; H1 factual em 4–6 linhas, texto nunca sobre a foto e ornamentos desaparecem se reduzirem espaço útil.
- media/fallback: JPG local em uma única ocorrência, alt `Retrato de Josiani Nicolini.`, dimensões intrínsecas e arco próximo de 4:5 desktop/1:1 mobile; fallback retangular com `--radius-lg`. A oferta não depende da foto.
- performance_risk: médio por ser o LCP; controlar bytes, prioridade e CLS.
- cleanup: não aplicável; hero não participa do observer.
- validation: H1 compreensível sem foto, copy integral, exatamente uma ocorrência do retrato, nenhum conteúdo sobre o rosto, pessoa inalterada, crop/máscara em 320/375/768/1024/1440, baixa altura, LCP, CTA exato e ausência de código/asset de H06/R19/R12.

### `jn-logistics-strip`

- purpose: antecipar consulta/acompanhamento, modalidade online e presença em Santa Cruz do Sul/RS.
- semantic_root: `<section aria-label="Informações do atendimento">` com lista semântica de três itens.
- content_owner: seção `faixa-logistica` de `copy.md`, evidências `E-013` e `E-016`.
- source: composição textual própria; R19 apenas nos princípios de faixa operacional e fluxo.
- catalog_status: R19 `REFERENCE`.
- reuse_level: `PRINCIPLE`.
- extracted: informação operacional curta e legível.
- rejected: ticker/marquee, identidade, foto, badges, métricas, depoimentos, ícones, claims e código de R19.
- provenance: fatos confirmados do projeto.
- dependencies: nenhuma.
- states: estático; reveal M1 opcional sem ocultação, nunca marquee ou autoplay.
- keyboard: nenhuma interação.
- no_js: lista completa e visível.
- reduced_motion: lista estática.
- mobile: fluxo vertical ou quebra natural em duas linhas; nunca carrossel.
- media/fallback: sem mídia ou ícones.
- performance_risk: baixo.
- cleanup: lifecycle delegado a `jn-reveal` quando marcado.
- validation: três itens exatos, sem horários ou disponibilidade inventados, sem marquee/ticker, reflow em 320 px e contraste do campo oliva e das regras.

### `jn-identification`

- purpose: reconhecer dúvidas e contexto sem culpa, medo, diagnóstico ou lista de sintomas.
- semantic_root: `<section id="identificacao" aria-labelledby="titulo-identificacao">` com H2 e dois parágrafos.
- content_owner: seção `identificacao` de `copy.md`, `E-017` e `H-001`.
- source: artefatos do projeto e ritmo macro `PATTERN` de P13, sem componente reutilizado.
- catalog_status: P13 `BASE`.
- reuse_level: P13 `PATTERN`; seção em `REBUILD` próprio.
- extracted: somente a alternância genérica entre compressão e pausa editorial.
- rejected: cards de sintomas, causa única, dramatização, ilustração médica e conteúdo escondido.
- provenance: copy aprovada para implementação local.
- dependencies: nenhuma.
- states: estático; reveal M1 opcional.
- keyboard: nenhuma interação.
- no_js: texto completo.
- reduced_motion: sem reveal.
- mobile: H2 e parágrafos antes de qualquer regra decorativa; largura curta de leitura e respiro preservado sem altura fixa.
- media/fallback: sem mídia.
- performance_risk: baixo.
- cleanup: delegado a `jn-reveal`.
- validation: ausência de sintomas/causas adicionados, heading correto, largura de linha, contraste e zoom 200%.

### `jn-approach`

- purpose: explicar a abordagem por contexto e três pilares sem sugerir diagnóstico ou garantia.
- semantic_root: `<section id="abordagem" aria-labelledby="titulo-abordagem">`, introdução em um lado do split e `<ul>` de três pilares empilhados no outro; cada item pode usar H3.
- content_owner: seção `abordagem` de `copy.md`, `E-016` e `E-019`.
- source: composição própria informada apenas pela variação de ritmo `PATTERN` de P13.
- catalog_status: P13 `BASE`.
- reuse_level: P13 `PATTERN`; seção em `REBUILD` próprio.
- extracted: organização semântica em lista, não estética externa.
- rejected: estrutura de cards do processo B07 nesta seção, sticky cards, ícones, borda lateral colorida, método exclusivo e motion por scroll.
- provenance: copy e tokens oficiais.
- dependencies: nenhuma.
- states: estático; reveal M1 por grupo, nunca item a item com atraso longo.
- keyboard: nenhuma interação.
- no_js: introdução e pilares visíveis na ordem correta.
- reduced_motion: lista estática.
- mobile: body antes dos pilares; lista de uma coluna. O split não é reordenado por CSS.
- media/fallback: sem ícones ou imagens.
- performance_risk: baixo.
- cleanup: delegado a `jn-reveal`.
- validation: exatamente três pilares, redação conservadora de exames preservada, composição diferente do processo, sem overflow ou alturas iguais forçadas.

### `jn-process`

- purpose: tornar concreto o início do atendimento em três etapas sem inventar duração, frequência ou suporte.
- semantic_root: `<section id="processo" aria-labelledby="titulo-processo">` com campo oliva, título grande à esquerda e `<ol>` de exatamente três etapas em cards marfim à direita; `01`, `02`, `03` permanecem associados ao conteúdo.
- content_owner: seção `processo` de `copy.md`, `E-003`, `E-013`, `E-016`, `E-018`, `E-019` e `H-003`.
- source: B07 reconstruído como bloco de assinatura e Grid Fade Background reconstruído como fundo estático.
- catalog_status: B07 `REBUILD`; Grid Fade Background `BASE`.
- reuse_level: `REBUILD` para ambos.
- extracted: de B07, título grande à esquerda, cards/etapas à direita e rails finos; do Grid Fade, uma grade estática que desaparece no próprio campo do processo.
- rejected: de B07, GSAP, ScrollTrigger, SplitText, scrub, offsets/rotações, quatro etapas, estilo azul, copy e seletores; do efeito, tokens globais, dimensões rígidas, snippet literal e elipse original. Sticky não é obrigatório nem planejado.
- provenance: etapas reais da copy do projeto.
- dependencies: nenhuma; CSS próprio e HTML semântico, sem pacote, CDN, plugin ou JS do acervo.
- states: estático; os três cards podem ter deslocamentos discretos definidos no layout, sem rotação ou scrub. Reveal M1 é opcional no conjunto e não cria etapa ativa/concluída.
- keyboard: nenhuma interação; numeração não recebe foco.
- no_js: três etapas completas e lineares.
- reduced_motion: sem reveal; rails, grade e deslocamentos estáticos podem permanecer porque não se movem, mas são removíveis sem perda.
- mobile: título seguido por cards em uma coluna, na ordem 1 a 3; número e conteúdo permanecem juntos. Rails e grade podem ser simplificados antes de criar largura estreita.
- media/fallback: sem mídia e sem ícones.
- fallback: campo oliva sólido, sem rails/grade/deslocamento, e lista linear de três etapas quando CSS avançado não for suportado.
- performance_risk: baixo; fundos e rails são CSS estático, sem JS ou animação contínua.
- cleanup: delegado a `jn-reveal`.
- validation: exatamente três etapas, ordem e copy íntegras, título à esquerda/cards à direita no desktop, leitura linear no mobile, contraste AA, nenhum overflow, nenhuma quarta etapa, estilo azul, dependência, scrub, rotação, CTA ou quantidade/prazo adicional.

### `jn-fit-deliverables`

- purpose: tornar o atendimento concreto, dizer para quem é e manter o limite de segurança visível.
- semantic_root: `<section id="atendimento" aria-labelledby="titulo-atendimento">` em split editorial, com lista de quatro entregas de um lado e H3 `Para quem é`, lista de adequação e parágrafo de limite do outro.
- content_owner: seção `atendimento-e-adequacao` de `copy.md`, `E-013`, `E-016`, `E-017`, `E-019` e `H-001`.
- source: artefatos do projeto; nenhum bloco do acervo.
- catalog_status: N/A.
- reuse_level: `REBUILD` original.
- extracted: nenhum componente externo.
- rejected: comparação, preço, pacote, checklist clínico, benefício prometido, badge e ícone decorativo.
- provenance: fatos e limites registrados na copy.
- dependencies: nenhuma.
- states: estático; reveal M1 no contêiner.
- keyboard: nenhuma interação.
- no_js: entregas, adequação e limite sempre visíveis.
- reduced_motion: conteúdo estático.
- mobile: quatro entregas antes da adequação; uma coluna na mesma ordem do DOM; aviso não entra em tooltip, modal ou accordion.
- media/fallback: sem mídia.
- performance_risk: baixo.
- cleanup: delegado a `jn-reveal`.
- validation: quatro elementos e três itens de público exatos, split diferente da grade do processo, aviso de urgência visível, sem condições clínicas ou critérios inventados.

### `jn-about`

- purpose: apresentar a postura de Josiani por texto, sem repetir o retrato nem usar credenciais pendentes.
- semantic_root: `<section id="sobre" aria-labelledby="titulo-sobre">` com eyebrow, H2 e dois parágrafos.
- content_owner: seção `sobre-josiani` de `copy.md`, `E-002`, `E-008`, `E-016` e `E-019`.
- source: gesto tipográfico próprio de Margem Viva; R12 apenas como princípio de área editorial e materialidade.
- catalog_status: R12 `REFERENCE`.
- reuse_level: R12 `PRINCIPLE`; seção em `REBUILD` próprio.
- extracted: de R12, somente o princípio abstrato de uma área editorial ampla; nenhum manifesto ou bloco externo.
- rejected: asset, folha, identidade ou layout de R12, segunda foto, citação inventada, `Dra.`, profissão, CRN, formação, especialidade, anos de experiência, selo e métricas.
- provenance: texto do projeto e direção Margem Viva.
- dependencies: WOFF2 locais Cormorant Garamond v21 e Manrope v20, com fallback.
- states: estático; reveal M1 opcional. A palavra `escuta` ganha escala de display como gesto decorativo com `aria-hidden="true"`, sem duplicar conteúdo acessível.
- keyboard: nenhuma interação.
- no_js: texto completo.
- reduced_motion: tipografia e regras estáticas.
- mobile: heading e ambos os parágrafos em fluxo; o gesto tipográfico reduz escala antes de criar overflow e não reserva lacuna para foto.
- media/fallback: seção deliberadamente sem mídia.
- performance_risk: baixo.
- cleanup: delegado a `jn-reveal`.
- validation: `pp.jpg` não se repete, `escuta` fica fora da árvore acessível, nenhum texto novo/duplicado é anunciado, nenhuma credencial aparece e o contraste da composição tipográfica passa AA.

### `jn-modalities`

- purpose: informar modalidades, endereço presencial e e-mail sem mapa ou dados operacionais não confirmados.
- semantic_root: `<section id="modalidades" aria-labelledby="titulo-modalidades">` com dois painéis contrastantes para presencial e online, e `<address>` para endereço/e-mail.
- content_owner: seção `modalidades-e-local` de `copy.md`, `E-013`, `E-014` e `E-015`.
- source: composição própria; R19 somente no princípio de fluxo operacional e R12 somente na materialidade marfim/oliva/dourada.
- catalog_status: R19 e R12 `REFERENCE`.
- reuse_level: `PRINCIPLE`.
- extracted: separação clara entre online e presencial/local.
- rejected: identidade, ativos, múltiplas fotos, ticker, badges, métricas, depoimentos e código de R19/R12; mapa, embed, formulário, telefone 2978, horários, estacionamento e raio de atendimento.
- provenance: modalidade, endereço e e-mail confirmados pelo cliente.
- dependencies: nenhuma; `mailto:` usa capacidade nativa do dispositivo.
- states: conteúdo estático; e-mail em default, hover, focus, active e visited.
- keyboard: link de e-mail operável por Enter; nenhuma zona clicável falsa.
- no_js: endereço e e-mail legíveis e utilizáveis.
- reduced_motion: sem transições espaciais.
- mobile: os dois painéis viram fluxo linear; presencial, endereço, online e e-mail preservam a ordem, e o endereço quebra sem abreviação.
- media/fallback: sem mapa, imagem ou ícone.
- performance_risk: baixo.
- cleanup: delegado a `jn-reveal` apenas no contêiner.
- validation: dois painéis distinguíveis sem depender só de cor, texto e pontuação do endereço, `mailto:josi.n.nutri@hotmail.com`, ausência de 2978/mapa e reflow em 320 px.

### `jn-faq`

- purpose: responder seis dúvidas confirmadas com disclosure nativo e conteúdo disponível sem script.
- semantic_root: `<section id="faq" aria-labelledby="titulo-faq">` com seis elementos `<details>`, cada um com `<summary>` e resposta em texto; a numeração visual segue a ordem real.
- content_owner: seção `faq` de `copy.md` e seus Evidence IDs.
- source: HTML nativo; nenhum accordion B09 ou snippet do acervo.
- catalog_status: N/A.
- reuse_level: `REBUILD` original.
- extracted: padrão nativo da plataforma, não do acervo.
- rejected: accordion controlado por JS, ARIA manual redundante, abertura por hover, SVG/asset de ícone, FAQ schema e resposta adicionada por script.
- provenance: seis perguntas e respostas de `copy.md`.
- dependencies: nenhuma.
- states: closed e open nativos; summary em hover, focus e active; múltiplos itens podem permanecer abertos. Indicador CSS reflete `[open]` sem substituir o estado nativo.
- keyboard: Tab foca cada summary; Enter e Space alternam o estado conforme o navegador; foco permanece visível.
- no_js: totalmente funcional.
- reduced_motion: abertura imediata; não animar altura.
- mobile: uma coluna, summary com alvo mínimo de 44 px, número e texto que quebram naturalmente; indicador não invade a pergunta.
- media/fallback: numeração por contador CSS e indicador desenhado em CSS são decorativos e dispensáveis; sem CSS, `<details>/<summary>` e seu marcador nativo continuam funcionais. Sem imagem ou SVG.
- performance_risk: baixo.
- cleanup: não aplicável; nenhum listener.
- validation: seis itens exatos e numerados em ordem, indicador coerente em `[open]`, fallback com CSS indisponível, mouse/toque/teclado, estado anunciado pelo leitor de tela, forced colors, zoom 200%, sem ARIA conflitante e sem schema.

### `jn-final-cta`

- purpose: recapitular oferta, público e modalidades antes da ação final.
- semantic_root: `<section id="agendar" aria-labelledby="titulo-agendar">` em duas zonas de layout, com argumento em uma zona e CTA/microcopy na outra; a ordem do DOM continua H2, body, CTA e microcopy.
- content_owner: seção `cta-final` de `copy.md`, `E-003`, `E-013`, `E-016`, `E-017` e `E-018`.
- source: composição própria de Margem Viva; R12 apenas no princípio de botânica periférica e materialidade.
- catalog_status: R12 `REFERENCE`.
- reuse_level: R12 `PRINCIPLE`; seção em `REBUILD` próprio.
- extracted: de R12, apenas o princípio de bordas botânicas e áreas editoriais; nenhum componente externo.
- rejected: assets, folhas copiadas, identidade, foto adicional, credencial, depoimento ou claim de R12; urgência, escassez, timer, garantia, disponibilidade, animação contínua e CTA secundário.
- provenance: copy e destino confirmados.
- dependencies: nenhuma.
- states: CTA em default, hover, focus e active; sem loading/success artificial.
- keyboard: Enter segue o href; foco visível contra o fundo oliva.
- no_js: completo e funcional.
- reduced_motion: sem entrada ou elevação animada.
- mobile: as duas zonas viram H2, body, CTA de largura confortável e microcopy imediatamente abaixo; não fixa na viewport. Linework é removido se competir por espaço.
- media/fallback: sem mídia fotográfica; linework decorativo pode desaparecer integralmente.
- performance_risk: baixo.
- cleanup: não aplicável; a seção pode receber reveal apenas no texto não interativo, nunca no link focado.
- validation: rótulo/destino canônicos, terceira e última ocorrência do CTA, duas zonas no desktop sem reordenar o DOM, contraste, foco, ornamento fora do texto, ausência de pressão comercial e microcopy `Sem formulário e sem mensagem predefinida.`

### `jn-site-footer`

- purpose: encerrar com identificação, endereço, e-mail, transparência de privacidade e limites do conteúdo.
- semantic_root: `<footer>` com assinatura textual, `<address>` e dois parágrafos de microcopy.
- content_owner: seção `footer-privacidade` de `copy.md`, `E-003`, `E-014`, `E-015`, `E-018` e `H-003`.
- source: artefatos do projeto; nenhuma referência de footer do acervo.
- catalog_status: N/A.
- reuse_level: `REBUILD` original.
- extracted: nenhum componente externo.
- rejected: CRN pendente, profissão, telefone 2978, link de política inexistente, termos inventados, selo, logo, Instagram como CTA concorrente e ano dependente de JS.
- provenance: nome, endereço, e-mail e limites confirmados na copy.
- dependencies: nenhuma.
- states: e-mail em default, hover, focus, active e visited; restante estático.
- keyboard: link de e-mail operável; ordem de foco acompanha leitura.
- no_js: completo.
- reduced_motion: estático.
- mobile: uma coluna; contato e limites nunca ficam em modal, tooltip ou details.
- media/fallback: assinatura em texto; sem logo ou imagem.
- performance_risk: baixo.
- cleanup: não aplicável.
- validation: microcopies completas, ausência de afirmação de base legal/controlador/retenção, contato correto e contraste sobre oliva.

### `jn-reveal`

- purpose: acrescentar hierarquia de entrada M1 a seções secundárias sem controlar conteúdo ou interação.
- semantic_root: nenhum elemento próprio; atributo escopado `data-jn-reveal` em contêineres elegíveis.
- content_owner: direção de motion em `direcao-visual.md`.
- source: implementação própria já existente com APIs da plataforma; não deriva do Grid Fade selecionado, que é apenas um fundo estático.
- catalog_status: N/A.
- reuse_level: `REBUILD` original.
- extracted: somente a regra do projeto de entrada curta e sutil.
- rejected: Scroll Reveal Vanilla/GSAP, RAF/reveal de H06, GSAP/ScrollTrigger/SplitText de B07, `[data-anim]`, opacidade zero, stagger longo, parallax, smooth scroll e listener global permanente.
- provenance: CSS e `IntersectionObserver` escritos para o projeto.
- dependencies: `IntersectionObserver`, `matchMedia` e eventos nativos; nenhum polyfill.
- states: baseline visível; enhanced com opacidade fixa em `1` e somente `translateY(12px)` até `translateY(0)` em `420ms`; entered; reduced; unsupported.
- keyboard: não altera foco, tab order, hit area ou nome acessível.
- no_js: atributo não muda o visual; todos os elementos ficam em estado final.
- reduced_motion: não inicializa observer e mantém estado final sem transição.
- mobile: mesma distância máxima, sem stagger e sem animar grandes grupos fora da viewport.
- media/fallback: `IntersectionObserver` ausente resulta em página estática.
- performance_risk: baixo; observar apenas seções secundárias, animar somente `transform`, manter `opacity: 1`, executar uma vez e desobservar.
- cleanup: `pagehide` desconecta o observer e limpa os estados; `pageshow` com `event.persisted` reinicializa `initReveal()` após restauração pelo BFCache, de forma idempotente e sem observers duplicados.
- validation: JS bloqueado, API ausente, reduced motion ativo/alterado, navegação back-forward, página em background, ausência de erro no console e conteúdo sempre legível.

### `jn-botanical-linework`

- purpose: materializar Margem Viva com ornamentos botânicos lineares originais nas bordas do hero e do CTA final, sem função informativa ou de marca.
- semantic_root: SVG inline decorativo dentro de contêineres escopados, sempre com `aria-hidden="true"`, `focusable="false"` e `pointer-events: none`.
- content_owner: `direcao-visual.md`; não possui copy, nome acessível ou significado clínico.
- source: desenho vetorial original para este projeto; R12 apenas como princípio de botânica periférica.
- catalog_status: R12 `REFERENCE`.
- reuse_level: implementação própria; R12 em `PRINCIPLE`.
- extracted: concentração de material botânico nas bordas e integração com áreas editoriais.
- rejected: assets e folhas de R12, ilustração copiada, fotografia de planta, logo, símbolo, monograma, selo, ícone médico e ornamentação atrás de texto/rosto.
- provenance: paths vetoriais criados para Margem Viva; nenhum arquivo externo, stock, hotlink ou dependência.
- dependencies: nenhuma.
- states: estático; sem hover, reveal, parallax ou animação.
- keyboard: nunca focável e não altera ordem ou área de clique.
- no_js: permanece decorativo e dispensável.
- reduced_motion: estático; pode ser ocultado junto aos refinamentos não essenciais.
- mobile: ocultar antes de reduzir conteúdo, padding ou alvo; nunca causar overflow horizontal.
- media/fallback: ausência total do SVG, inclusive em forced colors, não altera hierarquia, texto ou conversão.
- performance_risk: baixo; paths simples, exatamente duas ocorrências inline e sem filtros.
- cleanup: não aplicável.
- validation: autoria original, exatamente decorativo, `aria-hidden`, não focável, fora do rosto e da área de leitura, sem semelhança funcional com logo e sem pixel/asset de R12.

## Integrações

| Integração | Decisão | Operação de privacidade | Contrato |
|---|---|---|---|
| WhatsApp | Ativa, única conversão | `OP-001` | `<a>` direto para a URL canônica; apenas `phone=5551999612970`; sem `text`, tracking, redirect, handler JS ou nova aba obrigatória |
| E-mail | Contato informativo | [PENDENTE: enquadrar a operação de contato por e-mail no registro de privacidade, caso aplicável] | `mailto:josi.n.nutri@hotmail.com`; sem formulário ou tracking |
| Formulário | Ausente | N/A | Nenhum campo, submit, endpoint ou estado de sucesso |
| Agenda | Ausente | N/A | Nenhum embed ou parâmetro |
| Checkout | Ausente | N/A | E-book/Kiwify fora da LP |
| Mapa | Ausente | N/A | Endereço em texto, sem embed ou geolocalização |
| Analytics/pixel | Ausente | N/A | Nenhum script, beacon, data layer ou evento de clique |
| Cookies/consent | Ausente no código da página | N/A nesta versão | Não criar, ler ou persistir cookies/localStorage/sessionStorage |
| Schema | Ausente | N/A | Nenhum JSON-LD, inclusive FAQ, Person ou LocalBusiness |

Todos os CTAs devem aplicar allowlist estrita da URL exata e podem usar `referrerpolicy="no-referrer"` como minimização, após teste de compatibilidade. O código não deve reescrever o href, anexar UTMs, registrar clique ou ler parâmetros da URL atual.

## Operações de privacidade

| ID | Finalidade | Dados/sensibilidade | Controlador/operadores | Destinatários/local | Retenção/descarte | Decisão responsável | Controles |
|---|---|---|---|---|---|---|---|
| `OP-001` | Receber contato de agendamento iniciado voluntariamente pelo visitante no WhatsApp | Dados de contato e conteúdo que o visitante decidir escrever; a LP não solicita dado de saúde e não insere conteúdo sensível na URL ou mensagem | Controlador: [PENDENTE: confirmar]; operadores: WhatsApp/Meta | Destinatários: Josiani Nicolini e WhatsApp/Meta; local de processamento: [PENDENTE: confirmar] | [PENDENTE: definir retenção e descarte] | Base/decisão legal: [PENDENTE: decisão do responsável]; canal de direitos: [PENDENTE: confirmar] | Sem formulário; sem mensagem predefinida; apenas parâmetro `phone`; sem analytics/pixel; sem logs de conteúdo no frontend; microcopy antes do redirecionamento |

### Pendências legais e de release

| ID/origem | Pendência | Tratamento neste blueprint | Impacto |
|---|---|---|---|
| `U-001` | Profissão, CRN completo/região e forma publicável | Omitir profissão, registro e credenciais; manter somente nome e posicionamento já previsto, sujeito à revisão final | Bloqueia identificação profissional completa e publicação |
| `U-009` / `OP-001` | Controlador, base decidida pelo responsável, local, retenção, descarte, canal de direitos e política aplicável | Não inventar; manter campos pendentes e microcopy factual | Bloqueia conformidade final |
| `U-010` | Domínio, hospedagem, logs/headers do provedor e URL canônica | Sem canonical, sitemap ou URL absoluta inventada; validar ambiente quando definido | Bloqueia SEO final e deploy validado |
| `U-014` | Revisão final de saúde | Josiani Nicolini deve revisar a assinatura de posicionamento e a redação sobre informações/exames | Bloqueia publicação |

`U-013` permanece não bloqueante por omissão segura: o telefone terminado em 2978 não é publicado e todos os CTAs usam apenas o destino validado terminado em 2970. A auto-hospedagem das fontes está resolvida e não integra a lista de bloqueios.

Nenhum placeholder desta tabela pode chegar a HTML, metadata ou schema. A página deve dizer apenas o que é verdadeiro sobre sua própria operação atual.

## SEO por rota

| Path | robots.txt allowed | Meta robots | X-Robots-Tag | Canonical | Sitemap | Title/description/OG | Schema |
|---|---|---|---|---|---|---|---|
| `/` | Sim. Não criar `Disallow`; o crawler precisa acessar a página para ver `noindex` | `noindex, nofollow` até domínio, revisão de saúde e QA | Não definido no arquivo estático; se o preview usar header, manter `noindex, nofollow` e validar ausência de conflito | Ausente; nenhum placeholder ou canonical relativo | Ausente e rota excluída até liberação | Title: `Consulta para queixas intestinais \| Josiani Nicolini`; description e OG title/description exatamente como `copy.md`; sem `og:url` ou `og:image` absoluto até domínio/asset aprovados | Nenhum |

- Documento em `pt-BR`, um único H1 e metadata sem placeholders.
- `noindex` não protege conteúdo; preview permanece local ou com proteção real do ambiente.
- Ao existir domínio, a mudança para indexação exige URL canônica absoluta, sitemap somente com rota publicável, headers coerentes e nova revisão por rota.
- Não criar `robots.txt`, sitemap, canonical, FAQ schema, Person ou LocalBusiness nesta versão.

## Plano de testes

O QA final de Margem Viva foi executado em 2026-07-26 por OpenCode e está detalhado em `_project/qa-report.md`. Validadores, Edge Chromium 150 headless, viewports, teclado, no-JS, reduced motion, BFCache, axe, Lighthouse e revisão visual final cobrem a implementação atual; não há P0/P1/P2 visual ou técnico local atual.

O Gate G4 permanece `BLOCKED` somente pelo conjunto externo de revisão HEALTH, identificação profissional e privacidade, mais validação de deploy e cobertura adicional. Os testes de deploy permanecem `NOT_TESTED`. Qualquer mudança futura em HTML/CSS/JS invalida os resultados afetados e exige nova execução antes de uma decisão de release.

### Ambientes mínimos

- Desktop: versões estáveis atuais de Chrome, Edge e Firefox no Windows.
- Mobile: Safari iOS e Chrome Android em dispositivo real ou serviço remoto equivalente.
- Tecnologia assistiva: NVDA com Chrome ou Firefox no Windows; uma combinação adicional mobile quando disponível.
- Viewports: 320, 375, 768, 1024 e 1440 px; baixa altura, landscape e zoom de 200%.
- Rede: cache frio com perfil móvel; cache quente; falha simulada dos WOFF2 locais; JavaScript bloqueado.
- Preview: servidor HTTP local, nunca depender de `file://`; candidato de deploy somente após allowlist.

### Matriz de validação

| ID | Classe | Área | Procedimento | Critério de aceite/evidência |
|---|---|---|---|---|
| T-01 | `PRELAUNCH_REQUIRED` | HTML/conteúdo | Validar HTML e comparar todo texto factual com `brief.md`, `spec.yaml` e `copy.md` | Sem nesting inválido, placeholder, claim pendente como fato, credencial, preço, métrica ou conteúdo proibido |
| T-02 | `PRELAUNCH_REQUIRED` | Estrutura | Inspecionar landmarks, nav, headings, `lang`, IDs e ordem do DOM | Um H1, nav nomeada, hierarquia lógica, IDs únicos e ordem igual à leitura mobile |
| T-03 | `PRELAUNCH_REQUIRED` | CTA/WhatsApp | Conferir as três ocorrências, clicar em desktop/mobile e inspecionar URL final | Mesmo rótulo/destino, número 5551999612970, somente parâmetro `phone`, sem mensagem ou dado sensível |
| T-04 | `PRELAUNCH_REQUIRED` | Links | Testar skip link, quatro links da nav, CTA e e-mail por mouse, toque e teclado | Destinos reais, labels/hrefs exatos, foco não oculto no destino, `mailto:` correto e nenhuma âncora quebrada; mobile não depende de menu JS |
| T-05 | `PRELAUNCH_REQUIRED` | FAQ | Operar os seis `details` com mouse, toque, Enter, Space e leitor de tela | Estado nativo anunciado, múltiplos itens possíveis, sem JS/ARIA conflitante |
| T-06 | `PRELAUNCH_REQUIRED` | No-JS | Desativar JavaScript e percorrer toda a página | Todo conteúdo, CTA, links, imagem e FAQ utilizáveis; nada com opacidade zero |
| T-07 | `PRELAUNCH_REQUIRED` | Motion | Testar estado normal, `prefers-reduced-motion: reduce`, mudança da preferência e API `IntersectionObserver` indisponível | Conteúdo sempre visível; opacidade fixa em `1`; somente `translateY` até `12px` por `420ms`; sem erro; observer/listeners limpos |
| T-08 | `PRELAUNCH_REQUIRED` | Lifecycle | Navegar, recarregar, disparar `pagehide` e restaurar pelo back-forward cache | `pageshow` com `event.persisted` restaura uma única inicialização, sem observers/listeners duplicados e sem erro no console |
| T-09 | `PRELAUNCH_REQUIRED` | Responsividade | Capturar e revisar todos os viewports, baixa altura e landscape | Sem scroll horizontal, corte, `100vh`, coluna comprimida ou CTA cobrindo conteúdo; CTA precede retrato; H1 factual usa 4–6 linhas sem cair abaixo de 40px; grids de 768px e ornamentos são revisados |
| T-10 | `PRELAUNCH_REQUIRED` | Zoom/reflow | Testar zoom 200% e overrides de espaçamento de texto | Sem perda de conteúdo/função; headings, endereço, summaries e CTA quebram corretamente |
| T-11 | `PRELAUNCH_REQUIRED` | Teclado/foco | Percorrer do skip link ao footer apenas com teclado | Ordem lógica, foco visível, nenhum foco em decoração e alvo essencial operável |
| T-12 | `PRELAUNCH_REQUIRED` | Acessibilidade automatizada | Executar axe e validação complementar; revisar manualmente resultados | Zero violação crítica/séria aberta; achados documentados e retestados |
| T-13 | `PRELAUNCH_REQUIRED` | Contraste/forced colors | Medir pares em sRGB e OKLCH, estados interativos e Windows forced colors | Texto AA, controles/foco perceptíveis e nenhuma informação dependente só de cor |
| T-14 | `PRELAUNCH_REQUIRED` | Imagem | Inspecionar dimensões, bytes, metadata, ocorrência, máscara/crop, alt e comportamento de falha | `<= 250 KB` ou exceção registrada; exatamente uma ocorrência; sem upscale, alteração da pessoa, deformação ou texto no rosto; fallback retangular e layout estável |
| T-15 | `PRELAUNCH_REQUIRED` | Fontes | Inspecionar Network, caminhos locais, tamanhos e SHA-256; repetir com os WOFF2 indisponíveis | Somente os dois WOFF2 locais e pesos previstos, sem requisição tipográfica externa, `@import` ou duplicação; licenças presentes; fallback legível e sem perda funcional |
| T-16 | `PRELAUNCH_REQUIRED` | Performance | Rodar ao menos 3 medições Lighthouse mobile e desktop com cache frio e registrar mediana, URL, dispositivo e perfil de rede | LCP <=2,5 s, CLS <=0,10, peso <=1,5 MB, JS gzip <=150 KB e metas internas comparadas |
| T-17 | `PRELAUNCH_REQUIRED` | JS/CSS/reuso | Inspecionar tamanho, console, parsing, listeners, seletores e origem das reconstruções | JS <=5 KB gzip como meta, CSS <=30 KB gzip como meta, zero exceção, seletor genérico, código morto ou trecho literal de P13/H06/B07/Grid Fade; nenhum runtime/dependência novo |
| T-18 | `PRELAUNCH_REQUIRED` | Privacidade | Auditar DOM, código, Network, cookies e storages após o fluxo principal | Sem formulário, analytics, pixel, beacon, data layer, mensagem predefinida, cookie próprio ou storage; terceiros documentados |
| T-19 | `PRELAUNCH_REQUIRED` | Saúde | Revisão linha a linha por Josiani Nicolini e conferência de Evidence IDs | Assinatura/claims aprovados ou removidos; nenhum diagnóstico, causa, garantia ou promessa |
| T-20 | `PRELAUNCH_REQUIRED` | SEO | Inspecionar source e renderizado da rota | Title/description corretos, um H1, meta `noindex, nofollow`, sem canonical, sitemap ou schema |
| T-21 | `DEPLOY_VALIDATION` | Publicação | Testar `/`, assets e caminhos excluídos por requisição HTTP | Rota/assets 200; `_project`, `.env*`, logs, backups e evidências 404/403; listing desativado |
| T-22 | `DEPLOY_VALIDATION` | Headers/segurança | Verificar HTTPS, redirects, MIME, CSP, HSTS, Referrer-Policy, `nosniff`, frame policy e cache | Headers coerentes somente com assets próprios; `font-src 'self'`; sem mixed content, redirect chain ou CSP quebrando fontes/CTA |
| T-23 | `DEPLOY_VALIDATION` | Indexação | Conferir robots, meta e eventual X-Robots-Tag no candidato publicado | Crawler permitido, `noindex` visível, nenhuma inclusão em sitemap e nenhuma regra contraditória |
| T-24 | `FIELD_MONITORING` | CWV | Após domínio e tráfego suficiente, consultar CrUX/PageSpeed sem instalar RUM nesta versão | Registrar p75 mobile/desktop quando disponível; não inferir INP de Lighthouse e não fabricar baseline |
| T-25 | `PRELAUNCH_REQUIRED` | Direção Margem Viva | Revisar lado a lado com `direcao-visual.md` e o contrato de reuso, sem usar as referências como alvo de cópia | Ritmo variável, 70–90% neutros, oliva estrutural, dourado pontual, nav real, processo com três etapas, dois lineworks originais no máximo, nenhum asset/código/claim/identidade do acervo e nenhuma segunda foto |

### Headers planejados para validação de deploy

- CSP planejada compatível com `default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`. Nenhum host tipográfico externo é necessário.
- HTTPS obrigatório; HSTS somente no domínio final e após confirmar cobertura adequada.
- `Referrer-Policy` conservadora, `X-Content-Type-Options: nosniff` e `Permissions-Policy` sem recursos não usados.
- Nenhum header de indexação pode contradizer o meta `noindex, nofollow`.
- A política final deve ser testada no ambiente real; não presumir que o host aplica headers por existir este plano.

## Critérios de saída

- G2/G3: revisão Margem Viva aprovada operacionalmente por OpenCode em `AUTO` em 2026-07-26, após rejeição da execução anterior pelo usuário e sem gate adicional.
- Implementação: Margem Viva realizada em HTML/CSS, com JavaScript existente preservado e contratos de componentes verificados.
- G4: `BLOCKED`; o QA final de 2026-07-26 comprova a implementação local atual, mas não resolve os bloqueios externos, de deploy ou de cobertura.
- QA atual: `BLOCKED`; zero P0 aberto, P1 `QA-P1-001`, `QA-P1-002` e `QA-P1-003` abertos, P2 `QA-P2-001` e `QA-P2-002` abertos e nenhum waiver.
- Publicação: `publishable=false`; bloqueada por U-001, U-009 e U-014, além de U-010, validação de deploy e cobertura adicional de browsers, dispositivo real e leitor de tela.
- Mudanças futuras em formulário, analytics, pixel, cookie, mapa, checkout, schema, mensagem de WhatsApp ou nova dependência exigem atualização prévia de `spec.yaml`, privacidade e deste plano.
