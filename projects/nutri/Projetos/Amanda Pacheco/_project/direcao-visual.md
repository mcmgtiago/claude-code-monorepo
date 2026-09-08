# Direção Visual — Amanda Pacheco

## Diagnóstico de marca

Não foram recebidos logo, Instagram, fotografias reais, manual de marca, consultório ou materiais próprios. Portanto, a direção é uma hipótese de protótipo e não uma leitura de identidade existente.

**Factos disponíveis:** nome Amanda Pacheco, profissão nutricionista e Portugal.

**Intenção solicitada:** autoridade, acolhimento e ciência; experiência premium; ética; ausência de terrorismo nutricional.

## Rotas consideradas

### Principal — Clínica Editorial Atlântica

Segurança clínica com calor humano, inspirada de forma abstrata em orientação, linhas cartográficas, luz atlântica, calcário, linho e vegetação dessaturada. Não usa azulejo literal, ícones de folha repetidos ou referências turísticas.

### Alternativa — Clínica Contemporânea de Evidência

Branco quente, carvão e acento verde mais nítido, tipografia sans dominante, cards objetivos e menor carga fotográfica. Rejeitada para esta versão porque se aproximava demasiado de health-tech/fitness e oferecia menos conexão humana.

## Fingerprint

| Eixo        | Decisão               |
| ----------- | --------------------- |
| Autoridade  | Humana + científica   |
| Temperatura | Quente controlada     |
| Energia     | 2/5                   |
| Densidade   | Editorial espaçada    |
| Expressão   | Fotográfica + gráfica |

## Conceito

**“Nutrição com norte.”**

A assinatura visual usa meridianos, curvas topográficas, pontos de orientação e uma sequência de processo que avança como um mapa. A metáfora traduz a principal função do serviço: sair da confusão e ganhar direção sem receber uma rota rígida.

Não se afirma que “Norte” seja um método proprietário. É um conceito visual/verbal de direção.

## Anti-genérico

A combinação creme + serif + terracota é comum em wellness e foi pedida no material de entrada. Para não depender desse preset, a versão diferencia-se por:

- sistema cartográfico em vez de folhas/botânica;
- recorte de retrato em arco assimétrico, não blob genérico;
- método como meridiano visual;
- verde profundo de algas/pinheiro, não verde-lima;
- composição assimétrica e alternância entre editorial, lista e processo;
- ausência de métricas, estrelas, antes/depois e urgência artificial.

## Tokens

| Token             | Valor     | Uso                                      |
| ----------------- | --------- | ---------------------------------------- |
| `--bg`            | `#f4f0e8` | Fundo calcário                           |
| `--surface`       | `#fefcf8` | Superfície principal                     |
| `--surface-2`     | `#e9ede4` | Sálvia mineral                           |
| `--surface-3`     | `#ead8d0` | Rosa argila                              |
| `--primary`       | `#20382f` | Verde-pinho para CTA e seções profundas  |
| `--primary-hover` | `#172b24` | Hover do CTA                             |
| `--accent`        | `#ad654e` | Terracota controlada                     |
| `--text`          | `#1f2622` | Tinta esverdeada                         |
| `--text-muted`    | `#5b665f` | Texto secundário com contraste funcional |
| `--focus`         | `#d08a71` | Foco visível                             |
| `--error`         | `#a34040` | Erros de formulário                      |

## Tipografia

- **Display:** Newsreader, peso 400/500, itálico apenas como acento.
- **Interface:** Manrope, pesos 400–700.
- **H1:** `clamp(3.6rem, 11vw, 7.15rem)` com ajuste no desktop.
- **Títulos de seção:** `clamp(2.65rem, 6.5vw, 5.4rem)`.
- **Corpo:** mínimo de 16 px no conteúdo principal.
- **Labels:** 9–12 px apenas em textos utilitários curtos, com contraste alto e tracking controlado.

As fontes remotas devem ser revistas para self-host e RGPD na produção.

## Grid, forma e espaço

- Container máximo: 1160 px.
- Padding lateral: 20 px mobile, 28 px tablet/desktop.
- Grid: 4 colunas conceituais no mobile, 8 no tablet, 12 no desktop.
- Seções: 92–154 px de respiro vertical.
- Controles: 14 px ou pill conforme ergonomia.
- Cards: 20–28 px, sem aplicar o mesmo raio a tudo.
- Fotografia: arco assimétrico no hero; canto orgânico controlado na seção sobre.

## Fotografia

### Protótipo

Duas imagens Unsplash são usadas como material ilustrativo e claramente identificadas. Não representam Amanda, pacientes, consultório ou resultados.

### Produção

Shot list recomendada:

- retrato vertical com luz natural para hero;
- retrato no ambiente de trabalho;
- conversa/preparação sem expor paciente;
- mãos, materiais e detalhes do processo;
- consultório e acesso;
- variação horizontal para Open Graph.

Evitar jaleco se não fizer parte da prática, balança, fita métrica, maçã com estetoscópio, comida perfeita como narrativa única e corpo como prova.

## Iconografia

SVG monoline consistente, `stroke-width` 1.8–2.0, cantos arredondados e sem emojis. Ícones decorativos usam `aria-hidden="true"`.

## Motion system

**Nível:** `M2_SIGNATURE`, com apenas uma assinatura e o restante em `M1_SUBTLE`.

| Área     | Gatilho             | Movimento                    |  Duração | Objetivo                        |
| -------- | ------------------- | ---------------------------- | -------: | ------------------------------- |
| Hero     | carregamento        | fade + `y:18px` em sequência |   650 ms | estabelecer hierarquia          |
| Conteúdo | entrada na viewport | fade + 16 px                 |   560 ms | orientar leitura                |
| Cards    | hover               | elevação de 5 px             |   250 ms | feedback, sem esconder conteúdo |
| Processo | scroll desktop      | pilha CSS sticky             |   nativo | continuidade entre etapas       |
| Botões   | hover/active        | `y:-2px` / `scale(.98)`      |   200 ms | resposta tátil                  |
| Drawer   | ação                | diálogo nativo               | imediato | foco e segurança                |

### Reduced motion

- revela todo o conteúdo imediatamente;
- remove transições extensas;
- transforma os cards sticky em fluxo normal;
- não existe parallax, autoplay, canvas, WebGL ou smooth-scroll por biblioteca.

## Mobile

- Copy do hero antes do retrato.
- H1 entre aproximadamente 58 px e o clamp disponível; deve ser revisto visualmente a 320 px.
- Cards em coluna única; mosaico só aparece em breakpoints seguros.
- Processo linear sem sticky abaixo de 1024 px.
- CTA inferior respeita safe area e desaparece quando o formulário final entra na viewport.
- Drawer ocupa toda a altura e permite scroll interno.
- Alvos mínimos de 44 px.

## Referências selecionadas

O teto do sistema foi respeitado:

- Página principal: P22, apenas tom institucional e humano.
- Hero: H06, apenas princípio de split com retrato.
- Bloco: B07, apenas progressão de quatro etapas; código refeito.
- Efeito: Ambient Glow, estático e moderado.
- Referências visuais: `9bdcdc...` e `427acb...`, apenas princípios de equilíbrio e contenção.

Nenhum texto, identidade, asset, bundle ou efeito foi copiado integralmente.
