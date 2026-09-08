# Catálogo do Acervo

Auditoria realizada sobre o conteúdo disponível em `WORKSPACE_ROOT/Modelos & Codigos` e `WORKSPACE_ROOT/Ref Design`. Todos os caminhos deste arquivo partem de `WORKSPACE_ROOT`, não da pasta `Sistema Replicavel`. O catálogo orienta seleção; não concede licença nem transforma os arquivos em produção-ready.

## Legenda

| `catalog_status` | Significado |
|---|---|
| `BASE` | melhor ponto de partida relativo; ainda exige adaptação e QA |
| `ADAPT` | estrutura ou código aproveitável após normalização relevante |
| `REFERENCE` | extrair somente princípios de arquitetura/visual/copy |
| `REBUILD` | conceito útil, implementação deve ser refeita |
| `AVOID` | não usar no estado atual ou não adequado ao contexto |

`catalog_status` mede qualidade/risco, não permissão. Nenhum item do acervo possui licença local documentada; a procedência padrão é `UNKNOWN` e o teto de reuso é `PRINCIPLE`, `PATTERN` ou `REBUILD`. `ADAPT_CODE` só é permitido após licença/procedência explícita e registrada. `ADAPT` no catálogo nunca significa automaticamente `ADAPT_CODE` no plano.

Status exclusivos de `Ref Design`:

- `REFERENCE`: princípio visual utilizável após reprojeto;
- `CAUTION`: pode inspirar somente com riscos e elementos rejeitados registrados;
- `AVOID_HEALTH`: proibido como direção em HEALTH/FITNESS;
- `PORTFOLIO_ONLY`: serve para apresentação de case, não para definir a interface de produção.

P24 e P25 contêm remotes Git locais (`matheusaugusto-reserva/base-lp24` e `base-lp25`), mas nenhuma licença local foi encontrada; os URLs ajudam a investigar a origem, não autorizam reutilização.

## Regra de seleção

Por projeto, escolha no máximo:

- 1 página para arquitetura;
- 1 hero para composição;
- 1 bloco para assinatura;
- 1 efeito;
- 2 referências visuais.

Registre no plano de componentes o que será extraído e o que será rejeitado. Nenhuma seleção é obrigatória.

---

# Heroes

Base: `Modelos & Codigos/HERO/`

| ID | Fonte | Conceito e melhor uso | Custo/riscos | `catalog_status` |
|---|---|---|---|---|
| H01 | `hero01/hero01-pronta` | editorial claro e orgânico; wellness premium | WebGL contínuo, runtime opaco, Base64 duplicado e licença de shaders incerta | `REFERENCE` |
| H02 | `hero02 (1)/Hero Pronta 02` | futurista escuro; health-tech | WebGL multipass pesado, scroll bloqueado, sem reduced motion | `AVOID` para clínica; `REFERENCE` para health-tech |
| H03 | `hero03/hero3` | vídeo abstrato, badge, headline e CTA; programa premium | script força autoplay global, conteúdo invisível sem JS, scroll lock | `ADAPT` a hierarquia; reescrever comportamento |
| H04 | `hero04 (1)/hero04` | layout clínico com retrato, stats e dois CTAs | `canvas.toDataURL()` por frame, CTA quebrado, conteúdo espera `load` | `REBUILD` |
| H05 | `hero05/hero05` | energia laranja/preta; fitness e performance | RAF permanente, `toDataURL()` por frame, sem reduced motion | `REBUILD` |
| H06 | `hero06/hero6` | wellness editorial com reveal por `clip-path` | imagens grandes, cursor removido, scroll lock, reduced motion parcial | `ADAPT`; melhor base visual geral |
| H07 | `Hero07/hero7` | vídeo scrub cinematográfico e cards | vídeo usado ~9 MB, 420svh, loading sem fallback, trigger no documento | `AVOID` |

## Ranking de uso

1. H06 para linguagem wellness, após remover cursor/scroll lock e otimizar mídia.
2. H03 para hierarquia de conversão, sem o script de autoplay.
3. H04 para composição clínica e stats, com motor refeito.
4. H05 somente para performance e com interação reimplementada.
5. H01 apenas como conceito orgânico.
6. H02 apenas para produto tecnológico.
7. H07 não deve ser integrado.

Nenhum CTA desses heroes está pronto: existem botões inertes, `href="#"` ou âncoras inexistentes.

---

# Pacotes de página extraídos

Base: `Modelos & Codigos/Páginas/`. Os ZIPs são duplicatas; consulte as pastas extraídas.

| ID | Entrypoint relativo a `Modelos & Codigos/Páginas` | Tema original | O que aproveitar | Principal problema | `catalog_status` |
|---|---|---|---|---|---|
| P01 | `Página 01/Página 01/index.html` | curso de importação | jornada, oferta, garantia e FAQ | Elementor pesado, CTAs malformados, prova repetida | `REFERENCE` |
| P02 | `Página 02/Página 02/index.html` | automação de vendas | sequência de dor, método, módulos e oferta | produto residual, CTAs desativados, canvas contínuo | `AVOID` |
| P03 | `Página 03 (1)/Página 03/index.html` | tráfego pago | entregáveis, garantia e comparação | script neutraliza inclusive checkout real; legado Elementor | `AVOID` |
| P04 | `Página 04/Página 04/index.html` | curso de reuniões | estrutura consultiva, FAQ e objeções | checkout placeholder, sem H1, excesso de dependências | `REFERENCE` |
| P05 | `Página 05/Página 05/index.html` | produto low-ticket | formato para ebook/guia/desafio | placeholders, sem H1, VSL ausente, stack WordPress pesada | `REFERENCE` |
| P07 | `Página 07/Página 07/index.html` | template React de infoproduto | arquitetura de curso/comunidade | conteúdo depende de React, partículas e CTAs sem ação | `REBUILD` |
| P08 | `Página 08/Página 08/index.html` | desafio de 21 dias | processo, benefícios, oferta e FAQ | bundle obrigatório, checkout `#`, prova repetida, claims genéricos | `REFERENCE` |
| P10 | `Página 10 (1)/Página 10/index.html` | treino em casa | arquitetura temática para fitness | export Nuxt incompleto, HTML inválido e CTAs placeholders | `REFERENCE` |
| P11 | `Página 11 (1)/Página 11/index.html` | página modular | organização técnica, mobile e fallbacks | conflito de variáveis, checkout `#`, stack motion excessiva | `ADAPT` |
| P12 | `Página 12/Página 12/index.html` | aposentadoria/investimento | narrativa e organização HTML/CSS | placeholders, links `#`, FAQ ARIA incompleta e motion infinito sem reduced motion | `ADAPT` |
| P13 | `Página 13/Página 13/index.html` | posicionamento digital | arquitetura completa, H1 e FAQ | claims fictícios, links `#`, reduced motion parcial | `BASE` técnica relativa |
| P14 | `Página 14/Página 14/index.html` | curso de stories | hero mobile, comparação, módulos e FAQ | provas repetidas, autor/checkout placeholder, HTML reparado | `ADAPT` |
| P15 | `Página 15 (1)/Página 15/index.html` | edição de vídeo | funil problema–método–entregáveis–oferta | CSS com bloco quebrado, Lenis latest, motion excessivo | `REFERENCE` |
| P16 | `Página 16/Página 16/index.html` | curso de violão | apenas sequência comercial | dependência massiva de Elementor/WebGL e difícil manutenção | `AVOID` |
| P18 | `Página 18/Página 18/index.html` | automação Instagram | esqueleto de funil | 44 frames Full HD preloaded e inicialização frágil | `AVOID` |
| P20 | `Página 20/Página 20/index.html` | curso de IA | layout editorial e base vanilla | dois vídeos preloaded, CTAs para ID inexistente | `REFERENCE` |
| P21 | `Página 21/Página 21/index.html` | ebook Viva Leve | ordem temática de produto nutricional | descartar toda copy, identidade, claims, depoimentos, preços, garantia e marcas | `REFERENCE` de arquitetura |
| P22 | `Página 22/Página 22/index.html` | psicóloga clínica | tom institucional e humano | H1/conteúdo invisíveis sem JS, CTAs `#`, vídeo e copy alterada por JS | `REFERENCE` visual |
| P23 | `Página 23/Página 23/index.html` | medicina institucional | autoridade e estética médica premium | captura de frames em canvas, resíduos de template IA | `REFERENCE` visual |
| P24 | `Página 24 (1)/Página Pronta 24/index.html` | consultoria de IA | composição B2B e reveal moderado | CTA cancelado por JS e sem conversão real | `REFERENCE` |
| P25 | `Página 25 (1)/Página Pronta 25/index.html` | kit de prompts | visual de produto digital e benefícios | canvas caro, preço zerado, IDs e nav quebrados | `REBUILD` |
| P26 | `Página 26/Página Pronta 26/index.html` | comunidade Atlas | arquitetura de comunidade/programa | sem reduced motion, placeholders, oferta/CTA e provas não confiáveis | `ADAPT` de arquitetura |
| P27 | `Página 27/Página Pronta 27/index.html` | curso jurídico | método, manifesto e oferta editorial | assets quebrados/case-sensitive, sem funil completo | `ADAPT` para método |
| P28 | `Página 28/Página Pronta 28/index.html` | gestor de tráfego | serviço individual e processo sticky | múltiplos RAFs, imagens repetidas e contato placeholder | `ADAPT` para performance |

## Bases recomendadas por necessidade

| Necessidade | Fonte principal | Complemento |
|---|---|---|
| Consulta nutricional | escolher P13 | use a matriz 03 para conteúdo; P22 é apenas referência visual, não segunda página |
| Produto nutricional | escolher P21 apenas como arquitetura ou P13 como base técnica | não selecione ambas |
| Programa/comunidade | escolher P26 | use B07 reconstruído para método, não P27 adicional |
| Fitness | escolher P10 ou P28 | não selecione ambas |
| Clínica premium | escolher P13 como base | use `Ref Design`, não P22/P23 como páginas adicionais |
| Serviço B2B saúde | escolher P24 | reconstrução obrigatória no stack do projeto |

Não copiar bundles Nuxt/React/Elementor para um projeto estático. Extraia a arquitetura e reconstrua no stack escolhido.

---

# Efeitos

Fonte: `Modelos & Codigos/Efeitos/efeitos.txt`. Busque pelo cabeçalho exato `# Efeito: <nome>`.

## Baixo risco relativo

| Efeito | Uso recomendado | Ajustes obrigatórios | `catalog_status` |
|---|---|---|---|
| Grid Fade Hero | hero leve e técnico/editorial | trocar todos os destinos `#`, evitar H1 duplicado, escopar tokens, foco, forced colors e mobile | `BASE` |
| Grid Fade Background | fundo estático para método/FAQ | escopar variáveis e validar contraste | `BASE` |
| Dark Grid | serviços, benefícios ou especialidades | revisar contraste de labels | `BASE` |
| Cards Glow Hover | benefícios/recursos | esconder decoração de leitores de tela e incluir foco se link | `BASE` |
| Ambient Glow | fundo calmo de wellness | moderar blur e validar contraste | `BASE` |

## Exigem adaptação

| Efeito | Melhor contexto | Risco ou correção | `catalog_status` |
|---|---|---|---|
| Dotted Surface | health-tech | carrega duas versões de Three; limitar DPR/densidade e criar fallback | `REBUILD` |
| Neon Flow | campanha fitness/tech | ~775 KB, `touch-action:none`, mudança de motion não tratada | `REBUILD` |
| Lamp | abertura premium | conteúdo invisível sem JS e camadas possivelmente desalinhadas | `REBUILD` |
| Shiny Button | um CTA principal | animação pode rodar sempre; falta `type`, compatibilidade e contraste | `ADAPT` |
| Gradient Button | um CTA | contraste e animação contínua | `ADAPT` |
| Cards Empilhados com Hover Reveal | passos/benefícios | foco removido, overflow tablet e sem z-index correto | `ADAPT` |
| Neon Orbs | app/fitness | H1 vazio sem JS, bug de transform e custo de glow | `REBUILD` |
| Responsive Hero Banner | academia/produto | imagens externas, menu incompleto, fontes incoerentes | `ADAPT` |
| Cards Sticky Stack | jornada/entregáveis | sticky frágil, classes genéricas e reduced motion parcial | `ADAPT` |
| Bokeh Particles | wellness leve | limitar contagem, esconder decoração e evitar duplicação | `ADAPT` |
| Scroll Reveal GSAP | conteúdo secundário | conteúdo invisível sem fallback real, stack desnecessária e seletor global | `REBUILD` |
| Hero Orbs | app/wellness | grandes blurs contínuos e sem reduced motion | `ADAPT` |
| Steps BG Morph | processo | sem reduced motion, risco de overflow e contraste intermediário | `ADAPT` |
| Cards Overlap Stack | módulos/entregáveis | foco se interativo e motion reduzido | `ADAPT` |
| Scroll Reveal Vanilla | reveals leves | conteúdo invisível sem JS, sem reduced motion e seletor global | `REBUILD` |

## Não usar no estado atual

| Efeito | Motivo | `catalog_status` |
|---|---|---|
| Testimonials Columns | movimento contínuo sem pausa, clones e provas fictícias | `AVOID` |
| Infinite Looped Panels | scroll hijacking, loop impede leitura e mata triggers globais | `AVOID` |
| Horizontal Scrolling Gallery | wrapper fixo quebrado sem ScrollSmoother e mobile não desativa | `AVOID` |
| Masked Lines Reveal | CDN 404, API 3.13 usada com GSAP 3.12.5 e conteúdo invisível | `AVOID` |
| Energy Beam | CDN obrigatório 404, projeto remoto de terceiro e sem reduced motion | `AVOID` |
| Scroll Float Cards | parallax sem throttle, breakpoint conflitante e card invisível | `AVOID` |
| Gradient Bars Background | sem reduced motion, contraste instável e entrada não validada | `AVOID` |
| Neon Light Tubes | arquivo fora do local, WebGL roda mesmo escondido e sem cleanup | `AVOID` |
| Carousel Fade Infinito | autoplay sem controle; reduced motion não pausa Swiper | `AVOID` |
| Story Text Swap | conteúdo invisível sem JS, 250vh e copy coerciva | `AVOID` |

## Regras para efeitos

- Use no máximo um efeito listado como caro ou interativo.
- Não combine Dotted Surface, Neon Flow, Energy Beam ou Neon Light Tubes.
- Não combine Scroll Reveal GSAP e Scroll Reveal Vanilla: ambos usam `[data-anim]`.
- Um efeito não pode alterar `html`/`body` nem matar instâncias globais.
- Informação clínica, preço, consentimento e CTA devem permanecer visíveis sem efeito.

---

# Blocos premium

Fonte: `Modelos & Codigos/Blocos/blocos premium.txt`. Os itens B01–B11 são especificações/prompts (`artifact_type=PROMPT_SPEC`), não componentes executáveis. O teto padrão é `PATTERN` ou `REBUILD`; nunca trate `ADAPT` como permissão para copiar código.

| ID | Linhas | Alias de busca | Bloco | Uso potencial | Decisão | `catalog_status` |
|---|---:|---|---|---|---|---|
| B01 | 1–201 | `method-steps-stack` | Método em Quatro Etapas | explicar atendimento em 4 fases | manter conceito; remover pin longo, RAF e assets Imgur | `REBUILD` |
| B02 | 205–500 | “o que você recebe” | Cards horizontais | entregáveis de programa | oferecer controles e versão linear; trocar estética cyber | `REBUILD` |
| B03 | 504–724 | `.philosophy` | HX’s Philosophy | manifesto de marca | reescrever identidade/texto e preservar nome acessível | `REBUILD` |
| B04 | 728–1150 | `team-driven-curiosity` | Driven by Creative Curiosity | equipe ou princípios | fotos reais, alt correto, foco e clearProps | `REBUILD` |
| B05 | 1155–1446 | `hx-clinic-video-reveal` | HX Clinic Video Reveal | tour de clínica | autoplay sem controle e relayout contínuo | `AVOID` |
| B06 | 1450–1677 | `atelier-card-scroll` | Coleção Atelier Norte | três pilares | conteúdo está `aria-hidden`, 430vh e asset repetido | `REBUILD` |
| B07 | 1682–1950 | `processo-cards-scroll-reveal` | Processo Cards Scroll Reveal | método em quatro etapas | melhor padrão; reconstruir sem dependência/scroll excessivos | `REBUILD` preferencial |
| B08 | 1954–2364 | `client-confessions-drag-slider` | Vozes do Projeto | depoimentos | autoplay/drag sem controles, clones e risco ético | `AVOID` |
| B09 | 2368–2879 | `method-scroll-accordion` | Acordeão de Método | processo detalhado | reconstruir como accordion clicável; scroll opcional | `REBUILD` preferencial |
| B10 | 2883–3444 | `flick-cards-stack` | Flick Cards Stack | galeria de fases/receitas | assets vazios, drag-only, três plugins | `AVOID` |
| B11 | 3448–3927 | `recent-works-horizontal-scroll` | Trabalhos recentes horizontal | galeria editorial | nove assets vazios, sticky frágil e sem reduced motion | `AVOID` |

As linhas 3931–4410 repetem B11 e não constituem um novo bloco. Ignore a duplicata.

## Ranking dos blocos

1. B07 para processo claro, reimplementado com pouco motion.
2. B03 para manifesto curto e original.
3. B02 para entregáveis, com navegação acessível.
4. B09 como accordion real.
5. B01 somente em campanha editorial que justifique uma narrativa longa.

---

# Referências visuais

Base: `Ref Design/`. As imagens podem conter identidades de terceiros. Use apenas princípios, nunca marca, texto, retrato ou composição idêntica. Use `source_group` diferentes; repetir grupo exige justificativa explícita e aprovação no Gate G2.

| ID | Arquivo | `source_group` | Tipo/princípio útil | Melhor aplicação | Cuidado | Status visual |
|---|---|---|---|---|---|---|
| R01 | `024360243552637.6983c14c7282c.webp` | `RD-243552637` | hero health-tech com retrato e CTA duplo | performance/nutrição moderna | métricas e verde-lima não podem ser fictícios | `REFERENCE` |
| R02 | `041ea3243552637.6983c14ce0ccf.webp` | `RD-243552637` | seção sobre com filosofia e credenciais | autoridade profissional | não superficializar formação em badges | `REFERENCE` |
| R03 | `120114243486563.69829ac712c2f.webp` | `RD-243486563` | capa editorial com arco e selos | direção de marca | não copiar assinatura visual | `CAUTION` |
| R04 | `2133c0244980537.69a35c601b6a9.webp` | `RD-244980537` | ebook low-ticket com prévia e preço | produto educativo | pressão comercial e claims de peso | `CAUTION` |
| R05 | `26b527230405297.6876625db6280.webp` | `RD-230405297` | clínica coletiva, método e equipe | site de clínica | métricas e extensão mobile | `REFERENCE` |
| R06 | `2cbebd243552637.6983c14e1ae42.webp` | `RD-243552637` | antes/depois corporal com kg e prazo | nenhum uso visual regulado | comparação corporal e promessa implícita | `AVOID_HEALTH` |
| R07 | `2fbaac251363023.6a346e4041e96.webp` | `RD-251363023` | materno-infantil clássica | saúde da mulher/família | contraste e excesso de especialidades | `REFERENCE` |
| R08 | `35f1c8243552637.6983c14ee418d.webp` | `RD-243552637` | footer com CRN, NAP e legal | site de serviço | dados reais e links acessíveis | `REFERENCE` |
| R09 | `379bb2243552637.6983c14e9079f.webp` | `RD-243552637` | CTA final argumento/WhatsApp | fechamento de LP | alternativa ao WhatsApp e minimização de dados | `REFERENCE` |
| R10 | `3dcc24237890951.6909fbe0d7d59.webp` | `RD-237890951` | módulos, bônus e comunidade | programa educativo | não inflar valor ou moralizar disciplina | `CAUTION` |
| R11 | `427acb243555505.6983d6b08e213.webp` | `RD-243555505` | mentoria premium equilibrada | acompanhamento de alto valor | texto fino e CTA repetido | `REFERENCE` |
| R12 | `653033239714361.692f9652a53e7.webp` | `RD-239714361` | saúde da mulher botânica e madura | menopausa/longevidade | clichê de folhas e claims hormonais | `REFERENCE` |
| R13 | `68e0d1243469439.69824060670e9.webp` | `RD-243469439` | funil oncológico baseado em urgência | estudo crítico apenas | medo e promessa de prevenção/recidiva | `AVOID_HEALTH` |
| R14 | `69419c237890951.6909fbe0d842b.webp` | `RD-237890951` | hard sell, prazo e falsa escolha | estudo crítico apenas | prazo corporal, manipulação e urgência | `AVOID_HEALTH` |
| R15 | `713a2a248895901.69fba4e39fca0.webp` | `RD-248895901` | jornada orgânica e educativa | comportamento alimentar | excesso de textura e kg como prova | `REFERENCE` |
| R16 | `838e2c243486563.69829c5fee99c.webp` | `RD-243486563` | prancha de paleta/tipografia | documentação visual | contraste e Raleway Thin | `REFERENCE` |
| R17 | `8e731c243486563.69829ac7134d0.webp` | `RD-243486563` | apresentação editorial minimalista | case/manifesto | não é página de conversão | `PORTFOLIO_ONLY` |
| R18 | `987719237890951.6909fbe0d6585.webp` | `RD-237890951` | hero glamouroso de lançamento | campanha | promessa rápida, escassez e retoque | `CAUTION` |
| R19 | `9bdcdc243486563.69829c5ff022c.webp` | `RD-243486563` | fluxo clínico equilibrado | serviço clínico geral | placeholders/métricas e foto repetida | `REFERENCE` |
| R20 | `aab9ea248728843.69f8948607a6b.webp` | `RD-248728843` | especialista, processo e logística | condição clínica específica | densidade e superlativos | `REFERENCE` |
| R21 | `b86f03243552637.6983c14d54a35.webp` | `RD-243552637` | cards de depoimento | princípio de layout | prova genérica e estrelas uniformes | `CAUTION` |
| R22 | `bf77aa243486563.69829c5fef991.webp` | `RD-243486563` | notebook em perspectiva | apresentação do projeto | não prova UX ou responsividade | `PORTFOLIO_ONLY` |
| R23 | `e229ad253209575.6a62a24ea90f2.webp` | `RD-253209575` | jornada botânica de menopausa | saúde da mulher | estereótipo e claims sem contexto | `REFERENCE` |
| R24 | `f8ebc7243486563.69829c5fef19d.webp` | `RD-243486563` | mockup frontal de hero | apresentação do projeto | não é interface final | `PORTFOLIO_ONLY` |

## Referências prioritárias

- **Equilíbrio clínico:** R19
- **Serviço premium:** R11
- **Especialista e logística:** R20
- **Clínica/equipe:** R05
- **Produto digital:** R04
- **Saúde da mulher:** R12 ou R23
- **Orgânico/comportamental:** R15
- **Sistema institucional/footer:** R08

---

# Combinações recomendadas

## Consulta clínica equilibrada

- `primary_page`: P13, somente arquitetura técnica.
- `hero`: H06, `REBUILD` da composição.
- `block`: B07, `REBUILD` leve.
- `effect`: Ambient Glow.
- `visual_refs`: R19 + R20, grupos diferentes.
- `motion_owner`: CSS/IntersectionObserver; `M1_SUBTLE`.

## Comportamento alimentar ou wellness

- `primary_page`: P13, somente arquitetura.
- `hero`: H06, `REBUILD` sem cursor/scroll lock.
- `block`: B03, manifesto original reconstruído.
- `effect`: Ambient Glow.
- `visual_refs`: R11 + R15.
- `motion_owner`: CSS/IntersectionObserver; `M1_SUBTLE`.

## Saúde da mulher/materno-infantil

- `primary_page`: P13, somente arquitetura.
- `hero`: H06, `REBUILD` apenas da estrutura.
- `block`: B07, `REBUILD`.
- `effect`: Grid Fade Background.
- `visual_refs`: R12 + R07.
- `motion_owner`: CSS/IntersectionObserver; `M1_SUBTLE`.

## Clínica com equipe

- `primary_page`: nenhum; usar `SYSTEM_ROOT/03-MATRIZ-ARQUITETURA.md`, modelo `SITE_CLINICA`.
- `hero`: nenhum; composição própria com equipe real.
- `block`: B04, `REBUILD` após fotos/autorização.
- `effect`: Dark Grid para especialidades.
- `visual_refs`: R05 + R07.
- `motion_owner`: CSS/IntersectionObserver; `M1_SUBTLE`.

## Produto digital nutricional

- `primary_page`: P21, apenas sequência de arquitetura; descartar todo conteúdo factual/comercial.
- `hero`: nenhum; criar hero próprio com produto real.
- `block`: B02, `REBUILD` com controles.
- `effect`: Cards Glow Hover.
- `visual_refs`: R04 + R11; registrar e rejeitar os riscos `CAUTION` de R04.
- `motion_owner`: CSS/IntersectionObserver; `M1_SUBTLE`.

## Fitness/performance

- `primary_page`: P10, somente arquitetura temática.
- `hero`: H05, composição reconstruída sem motor de reveal atual.
- `block`: B07, `REBUILD`.
- `effect`: Dark Grid.
- `visual_refs`: R01 + R19, grupos diferentes.
- `motion_owner`: um runtime aprovado no G3; `M2_SIGNATURE`.

## Health-tech

- `primary_page`: P24, somente arquitetura B2B.
- `hero`: H02, conceito reconstruído com produto real prioritário.
- `block`: B02, `REBUILD`.
- `effect`: Grid Fade Background.
- `visual_refs`: R01 + R16, grupos diferentes.
- `motion_owner`: um runtime aprovado no G3; `M2_SIGNATURE`.

Para usar Neon Flow, Dotted Surface ou outro WebGL, crie uma nova decisão `M3_IMMERSIVE`; não acrescente o efeito a estas combinações.

---

# Score de seleção

Avalie cada fonte de 0 a 3:

| Critério | 0 | 3 |
|---|---|---|
| Relevância estratégica | decorativo | resolve pergunta crítica |
| Aderência de marca | contraditório | reforça fingerprint |
| Conteúdo disponível | depende de placeholder | possui conteúdo/asset real |
| Segurança técnica | quebrado/pesado | simples, escopável e com fallback |
| Acessibilidade | bloqueia leitura | semântica/nome/estado corretos, teclado/foco, contraste, zoom/reflow e reduced motion |
| Procedência | desconhecida | licença documentada |

Uma fonte com nota zero em procedência, conteúdo ou acessibilidade não entra como `ADAPT_CODE`; no máximo inspira um `REBUILD`.

# Alertas globais

- Todos os projetos do acervo contêm pelo menos uma pendência de produção.
- Claims, depoimentos, números e nomes dos modelos não são fatos do novo cliente.
- Assets locais e remotos exigem verificação de direito de uso.
- Muitos snippets redefinem elementos globais e não podem ser colados juntos.
- Há versões conflitantes de GSAP, Three.js e plugins.
- Vários exemplos dependem de CDNs sem SRI ou de arquivos ausentes.
- Use o acervo como inteligência de design, não como fornecedor automático de código.
