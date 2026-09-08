# QA Report

## Resumo

- Projeto: LP Josiani Nicolini - Saude Intestinal
- Build/versao: Margem Viva final, snapshot estatico local de 2026-07-26, sem build
- Data: 2026-07-26
- Responsavel: OpenCode
- Release target: `PRODUCTION`
- Escopo executado: preview local em `http://127.0.0.1:4173/`; nenhum deploy foi realizado
- Status final geral: `BLOCKED`
- Publicavel: `false`
- P0 abertos: 0
- P1 abertos: 3
- P2 abertos: 2
- Waivers: nenhum

O QA final local cobre a implementacao Margem Viva atual e os testes abaixo passaram. O resultado geral permanece `BLOCKED`, porque existem P1 externos reais: revisao final HEALTH, identificacao profissional/CRN e decisoes de privacidade da operacao de WhatsApp. Nao ha P0 nem achado visual/tecnico local P1/P2 atual.

## Ambiente e ferramentas

| Item | Evidencia |
|---|---|
| Servidor | `http://127.0.0.1:4173/`, preview local apenas |
| Sistema | Windows |
| Browser testado | Microsoft Edge Chromium 150, headless |
| Automacao | Playwright Core 1.55.0 |
| Acessibilidade automatizada | axe-core 4.10.3 |
| Performance | Lighthouse 12.8.2 |
| HTML | html-validate 9.7.1 |
| CSS | csstree-validator via `npx` |
| JavaScript | Node `--check` |
| Viewports | `320`, `375`, `768`, `1024`, `1440` e baixa altura/landscape `667x375` |
| Zoom equivalente | viewport de 512 CSS px com DPR 2 |

O servidor local pode ser iniciado no `PROJECT_ROOT` com `python -m http.server 4173`. Nao houve instalacao, build ou deploy do projeto.

## Implementacao sob teste

- Margem Viva esta implementada em `index.html` e `assets/css/styles.css`; `assets/js/main.js` foi preservado.
- Header com quatro ancoras desktop e mobile sem menu JS; hero assimetrico com retrato unico em arco proximo de 4:5 desktop e 1:1 mobile.
- Dois SVGs botanicos inline originais usam `aria-hidden="true"` e `focusable="false"`; a faixa oliva e estatica.
- Abordagem em escada; processo oliva com Grid Fade, rails e tres cards; Sobre tipografico com `escuta`; modalidades contrastantes; FAQ nativo numerado; CTA final em duas zonas.
- Copy factual e exatamente tres CTAs foram preservados.
- P13 esta em `PATTERN`; H06, B07 e Grid Fade em `REBUILD`; R19/R12 em `PRINCIPLE`. Nao existe codigo, asset, fonte, identidade ou dependencia do acervo na producao.
- A allowlist publica permanece com oito arquivos; os dois SVGs inline nao adicionam asset publicavel.

## Cobertura por classe

| Classe | Status | Evidencia |
|---|---|---|
| `PRELAUNCH_REQUIRED` | `PARTIAL_BLOCKED` | QA local final de Margem Viva executado; revisao HEALTH, identificacao profissional, privacidade e cobertura adicional de browsers/AT permanecem abertas |
| `DEPLOY_VALIDATION` | `NOT_TESTED` | Dominio e hospedagem nao definidos; HTTPS, headers, canonical, allowlist e exclusoes ainda nao puderam ser verificados no ambiente publicado |
| `FIELD_MONITORING` | `FIELD_MONITORING` | INP real depende de dados de campo apos publicacao e trafego suficiente |

## Resultados locais

| Area | Status | Evidencia factual |
|---|---|---|
| Validacao HTML | `PASS` | html-validate 9.7.1 sem erros |
| Validacao CSS | `PASS` | csstree-validator via `npx` sem erros |
| Sintaxe JavaScript | `PASS` | `assets/js/main.js` e `_project/qa-browser.cjs` sem erro no Node `--check` |
| Runtime do browser | `PASS` | 0 erros de console, 0 `pageerror` e 0 respostas com falha |
| Estrutura | `PASS` | 1 H1, 6 elementos `details`, 0 formulario, 0 canonical, 0 schema e IDs sem duplicata |
| CTA | `PASS` | 3 ocorrencias, todas com rotulo `Agendar pelo WhatsApp` e URL exata `https://api.whatsapp.com/send?phone=5551999612970` |
| Minimizacao do CTA | `PASS` | Apenas `phone=5551999612970`; sem parametro `text`, PII, sintoma, dado de saude ou tracking |
| Conteudo proibido | `PASS` | Sem placeholders, conteudo proibido, telefone terminado em `2978`, e-book ou preco na interface |
| Imagem | `PASS` | Uma ocorrencia de `assets/images/josiani-portrait.jpg`: 1064x1064 px, 105254 bytes, alt presente e `loading="eager"` |
| Assets | `PASS` | Imagem e duas fontes WOFF2 servidas localmente; licencas OFL locais presentes |
| Privacidade tecnica local | `PASS` | 0 cookies, 0 entradas em `localStorage` e 0 entradas em `sessionStorage` |
| Responsividade | `PASS` | Sem overflow horizontal em 320, 375, 768, 1024, 1440 e 667x375; grids intermediarios de 768 revisados visualmente |
| Alvos interativos | `PASS` | CTAs, `summary` e links `mailto:` com largura e altura de pelo menos 44 px |
| Teclado e foco | `PASS` | Skip link e foco visivel funcionam; primeiro foco aponta para `#conteudo-principal` |
| FAQ | `PASS` | Seis disclosures nativos; Enter abre e Space fecha o item testado |
| BFCache | `PASS` | Navegacao `back_forward` restaura o reveal visivel, sem estado pendente, com `opacity: 1` e `transform: none` |
| Sem JavaScript | `PASS` | Conteudo, H1, 3 CTAs e 6 FAQs permanecem visiveis e funcionais |
| Reduced motion | `PASS` | Todos os reveals permanecem com `opacity: 1` e `transform: none` |
| Forced colors | `PASS` | H1 e CTAs permanecem visiveis |
| Espacamento de texto WCAG | `PASS` | Sem overflow horizontal ou clipping de texto no override testado |
| Zoom equivalente a 200% | `PASS` | 512 CSS px/DPR 2, sem overflow horizontal |
| H1 mobile | `PASS` | 40-48px; 5 linhas observadas em 320/375 dentro da decisao consciente de 4-6 linhas para o H1 factual longo; primeira dobra ajustada sem reduzir abaixo de 40px |
| Revisao visual final | `PASS` | Revisao somente leitura sem P0/P1/P2 visual ou tecnico atual; recorte seguro, sem colagem, overflow ou sobreposicao |
| axe-core | `PASS` | 0 violations; um grupo `incomplete` de contraste em 21 nos revisado manualmente |

## Contraste manual

O unico grupo `incomplete` do axe-core reuniu 21 nos em que pseudo-elementos, SVG/imagem ou camadas impediram a inferencia automatica do fundo. A revisao manual de todos os nos confirmou:

| Par | Razao | Criterio | Resultado |
|---|---:|---|---|
| `#60645b` sobre `#edf0e8` | 5.25:1 | WCAG AA para texto normal | `PASS` |
| `#60645b` sobre `#faf8f2` | 5.70:1 | WCAG AA para texto normal | `PASS` |
| `#60645b` sobre `#fffdfa` | 5.96:1 | WCAG AA para texto normal | `PASS` |
| `#34402e` sobre `#faf8f2` | 10.31:1 | WCAG AA para texto normal | `PASS` |
| `#34402e` sobre `#fffdfa` | 10.78:1 | WCAG AA para texto normal | `PASS` |
| `#faf8f2` sobre `#34402e` | 10.31:1 | WCAG AA para texto normal | `PASS` |
| `#d7dccf` sobre `#34402e` | 7.83:1 | WCAG AA para texto normal | `PASS` |
| `#c7cec0` sobre `#283124` | 8.37:1 | WCAG AA para texto normal | `PASS` |

O caminho oficial OKLCH `--muted`/`--surface-alt` mede aproximadamente `4.81:1` e passa AA. O fallback sRGB muted foi corrigido para `#60645b`, sem alterar o token OKLCH oficial. O texto ampliado `escuta` e decorativo e esta fora da arvore acessivel com `aria-hidden="true"`.

## Lighthouse final

Foram executadas 3 medicoes por perfil, com cache frio e simulacao do respectivo perfil. Os valores abaixo sao dados de laboratorio; TBT nao e apresentado como INP.

### Mobile

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | Peso |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 99 | 100 | 100 | 63 | 2.110 s | 0 | 0 ms | 198.3 KiB |
| 2 | 99 | 100 | 100 | 63 | 2.105 s | 0 | 0 ms | 198.3 KiB |
| 3 | 99 | 100 | 100 | 63 | 2.107 s | 0 | 0 ms | 198.3 KiB |

- Mediana de LCP mobile: `2.107 s`.
- Resultado contra o budget local: `PASS` para LCP, CLS e peso.

### Desktop

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | Peso |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 100 | 100 | 100 | 63 | 0.486 s | 0 | 0 ms | 198.3 KiB |
| 2 | 100 | 100 | 100 | 63 | 0.487 s | 0 | 0 ms | 198.3 KiB |
| 3 | 100 | 100 | 100 | 63 | 0.487 s | 0 | 0 ms | 198.3 KiB |

- Mediana de LCP desktop: `0.487 s`.
- Resultado contra o budget local: `PASS` para LCP, CLS e peso.

O score SEO 63 decorre do `noindex, nofollow`, intencional ate o release. Isso nao e uma falha a corrigir no preview local. Canonical, indexacao e headers dependem do dominio e da validacao de deploy. INP real permanece `FIELD_MONITORING`.

## Tamanhos dos artefatos

| Artefato | Bytes | Gzip |
|---|---:|---:|
| HTML | 18.550 | 4.763 |
| CSS | 28.649 | 5.686 |
| JavaScript | 1.283 | 515 |
| Imagem | 105.254 | N/A |
| Cormorant Garamond WOFF2 | 23.396 | N/A |
| Manrope WOFF2 | 24.836 | N/A |

O transfer registrado pelo Lighthouse foi `198.3 KiB` nos dois perfis.

## Achados corrigidos e retestados

| ID | Severidade | Disposicao | Area | Arquivo/linha atual | Falha corrigida | Reteste |
|---|---|---|---|---|---|---|
| `QA-FIX-001` | P1 | `FIXED` | Contraste/motion | `assets/css/styles.css:1108-1122` | Contraste do reveal corrigido ao remover opacidade reduzida | axe, no-JS, reduced motion e browser `PASS` |
| `QA-FIX-002` | P2 | `FIXED` | Semantica | `index.html:210-218` | Landmark `aside` indevido convertido em `div` | axe e inspecao estrutural `PASS` |
| `QA-FIX-003` | P2 | `FIXED` | Rede | `index.html:16` | Requisicao 404 de favicon removida | 0 failed responses |
| `QA-FIX-004` | P1 | `FIXED` | Dependencias/privacidade | `index.html:18-19`, `assets/css/styles.css:1-15`, `assets/fonts/` | Fontes externas substituidas por dois WOFF2 locais com licencas OFL e hashes registrados | Network local, fallback e validacao de assets `PASS` |
| `QA-FIX-005` | P1 | `FIXED` | Acessibilidade | `assets/css/styles.css:887-897,1081-1088` | Links `mailto:` ampliados para alvo minimo de 44 px | Medicao de alvos `PASS` |
| `QA-FIX-006` | P1 | `FIXED` | Lifecycle | `assets/js/main.js:46-53` | Estado do reveal restaurado na volta por BFCache | `back_forward` `PASS` |
| `QA-FIX-007` | P1 | `FIXED` | Conversao/conteudo | `index.html`, `copy.md`, `brief.md`, `spec.yaml` | CTA, copy e documentos sincronizados | 3 rotulos e URLs canonicos `PASS` |
| `QA-FIX-008` | P2 | `FIXED` | Tipografia | `assets/css/styles.css` | Texto substantivo mantido em pelo menos 16 px e fonte mono removida da interface | Viewports, zoom e text spacing `PASS` |
| `QA-FIX-009` | P1 | `FIXED` | Contraste | `assets/css/styles.css` | Fallback sRGB muted alterado para `#60645b`; OKLCH oficial preservado | axe 0 violations e pares manuais AA `PASS` |
| `QA-FIX-010` | P2 | `FIXED` | Hero/mobile | `index.html`, `assets/css/styles.css` | H1 e primeira dobra ajustados sem reduzir o H1 abaixo de 40px | 320/375 com 5 linhas, dentro da decisao de 4-6; reflow `PASS` |
| `QA-FIX-011` | P2 | `FIXED` | Responsividade | `assets/css/styles.css` | Grids intermediarios de 768px revisados e ajustados | Revisao visual em 768px `PASS` |
| `QA-FIX-012` | P2 | `FIXED` | Marca/semantica | `index.html`, `assets/css/styles.css` | `JN` decorativo removido e substituido por `01 / SOBRE` | Revisao visual e de conteudo `PASS` |
| `QA-FIX-013` | P2 | `FIXED` | Legibilidade | `assets/css/styles.css` | Notices do footer elevados para 16px | Viewports, zoom e contraste `PASS` |
| `QA-FIX-014` | P1 | `FIXED` | Foco | `assets/css/styles.css` | Foco do e-mail no painel oliva tornou-se claramente perceptivel | Teclado e forced colors `PASS` |
| `QA-FIX-015` | P1 | `FIXED` | Assinatura/acessibilidade | `index.html`, `assets/css/styles.css` | Label da assinatura ajustada para 12px e nome acessivel preservado | Arvore acessivel e viewports `PASS` |
| `QA-FIX-016` | P2 | `FIXED` | Documentacao/reuso | `_project/brief.md`, `_project/direcao-visual.md`, `_project/plano-componentes.md`, `_project/spec.yaml`, `_project/qa-report.md`, `_project/handoff.md` | Estado Margem Viva, QA final e contrato de reuso sincronizados | YAML e buscas de coerencia `PASS` |

## Achados abertos

| ID | Severidade | Disposicao | Classe | Origem | Falha/pendencia | Impacto e criterio de fechamento |
|---|---|---|---|---|---|---|
| `QA-P1-001` | P1 | `OPEN` | `PRELAUNCH_REQUIRED` | `U-014` | Revisao final HEALTH por Josiani Nicolini ainda nao registrada | Bloqueia release; revisar linha a linha a assinatura e as formulacoes de saude e registrar aprovacao ou remocao |
| `QA-P1-002` | P1 | `OPEN` | `PRELAUNCH_REQUIRED` | `U-001` | Identificacao profissional e CRN completo/regiao/forma publicavel nao confirmados | Necessario para release; a UI omitiu corretamente os dados nao comprovados |
| `QA-P1-003` | P1 | `OPEN` | `PRELAUNCH_REQUIRED` | `OP-001`, `U-009` | Faltam controlador, decisao de base pelo responsavel, locais, retencao/descarte e canal de direitos | Bloqueia conformidade final e publicacao |
| `QA-P2-001` | P2 | `OPEN` | `DEPLOY_VALIDATION` | `U-010` | Dominio, hospedagem, canonical, headers, exclusoes e validacao do deploy nao testados | Definir ambiente e, somente apos autorizacao, validar um candidato por allowlist com toda a matriz de deploy |
| `QA-P2-002` | P2 | `OPEN` | `PRELAUNCH_REQUIRED` | Cobertura de compatibilidade | Firefox, Safari/iOS, Chrome Android, dispositivo real e leitor de tela nao foram testados | Executar matriz adicional e registrar resultados antes da liberacao |

Nenhum achado recebeu `WAIVED`.

## Claims e conteudo verificados

| Escopo | Evidence IDs | Status |
|---|---|---|
| Oferta, publico, modalidades, endereco, e-mail e CTA | `E-003`, `E-013` a `E-018` | `PASS` contra os artefatos e a interface |
| Ausencia de preco, e-book, telefone 2978, credenciais e claims proibidos | `U-001`, `U-011` a `U-013`, `F-001` a `F-004` | `PASS` por omissao segura na interface |
| Redacao sobre informacoes/exames e escopo HEALTH | `E-019`, `C-011`, `U-014` | `NOT_TESTED` pela revisora final; associado a `QA-P1-001` |
| Identificacao profissional/CRN para release | `U-001` | `NOT_TESTED`; associado a `QA-P1-002` |

## Validacao de deploy

Todos os testes de deploy estao `NOT_TESTED`. Nao foram verificados em ambiente publicado: URL final, HTTPS, redirects, status/MIME, canonical absoluto, CSP, HSTS, `nosniff`, Referrer-Policy, Permissions-Policy, allowlist, exclusoes, directory listing, cache, robots ou headers de indexacao.

## Decisao final

- P0 abertos: 0.
- P1 abertos: `QA-P1-001`, `QA-P1-002`, `QA-P1-003`.
- P2 abertos: `QA-P2-001`, `QA-P2-002`.
- P1/P2 waived: nenhum.
- Publicavel: `false`.
- Status final geral: `BLOCKED`.
- Motivo: os P1 externos reais impedem liberacao, independentemente dos testes tecnicos locais aprovados.
