# Handoff

## Status

- Projeto: LP Josiani Nicolini - Saude Intestinal
- Data: 2026-07-26
- Responsavel: OpenCode
- Release target: `PRODUCTION`
- QA status: `BLOCKED`
- Publicavel: `false`
- Build/versao: Margem Viva final, snapshot estatico local de 2026-07-26; nao existe etapa de build
- Acesso ao preview: local em `http://127.0.0.1:4173/`
- Deploy: nao realizado; validacao de deploy `NOT_TESTED`
- Waivers: nenhum

A implementacao Margem Viva e seu QA final local estao concluidos, mas a publicacao permanece bloqueada pelos P1 `QA-P1-001`, `QA-P1-002` e `QA-P1-003`. Os P2 `QA-P2-001` e `QA-P2-002` tambem permanecem abertos. Nao ha P0 nem waiver.

## Entrega Margem Viva

- `index.html` e `assets/css/styles.css` realizam Margem Viva; `assets/js/main.js` foi preservado.
- Header com quatro ancoras desktop e mobile sem menu JS; hero assimetrico com retrato unico em arco proximo de 4:5 desktop e 1:1 mobile.
- Dois SVGs botanicos inline originais usam `aria-hidden="true"` e `focusable="false"`; a faixa oliva e estatica.
- Abordagem em escada; processo oliva com Grid Fade, rails e tres cards; Sobre tipografico com `escuta`; modalidades contrastantes; FAQ nativo numerado; CTA final em duas zonas.
- O H1 factual usa 52-56px desktop e 40-48px mobile. Foram observadas 5 linhas em 320/375, dentro da decisao consciente de 4-6 linhas; a label da assinatura usa 12px e preserva o nome acessivel.
- Copy factual e tres CTAs exatos foram preservados.

## Reuso e allowlist

- P13: `PATTERN`.
- H06, B07 e Grid Fade: `REBUILD`.
- R19 e R12: `PRINCIPLE`.
- Nenhum codigo, asset, fonte, identidade, link, pacote ou dependencia do acervo entrou na producao.
- Os dois ornamentos SVG sao inline e nao alteram a allowlist publica de oito arquivos.

## Metricas locais atuais

- Validadores HTML/CSS e sintaxe de JavaScript/test script: `PASS`; runtime com 0 erros de console, 0 page errors e 0 respostas com falha.
- axe-core: 0 violations; um grupo `incomplete` em 21 nos, com revisao manual de contraste `PASS`.
- Lighthouse mobile, 3 runs: 99/100/100/63; LCP 2.110/2.105/2.107s, mediana 2.107s; CLS 0; TBT 0.
- Lighthouse desktop, 3 runs: 100/100/100/63; LCP 0.486/0.487/0.487s, mediana 0.487s; CLS 0; TBT 0.
- Transfer Lighthouse: 198.3 KiB. HTML 18.550/4.763 bytes gzip; CSS 28.649/5.686; JS 1.283/515; imagem 105.254; Cormorant 23.396; Manrope 24.836.
- INP real permanece `FIELD_MONITORING`; SEO 63 decorre do `noindex` intencional.

## Como executar

- Requisitos: Python com o modulo padrao `http.server` e um navegador moderno.
- Instalacao: nenhuma.
- Variaveis de ambiente: nenhuma.
- Dependencias de projeto: nenhuma instalacao; HTML, CSS, JavaScript, imagem e fontes sao arquivos locais.
- Build: nenhum.
- Diretorio de execucao: `C:/Users/Administrator/Desktop/Nutri/Projetos/josianinicolini/LP`.
- Comando: `python -m http.server 4173`.
- URL: `http://127.0.0.1:4173/`.
- Encerramento: interromper o processo do servidor local no terminal.

Os resultados e as limitacoes de teste estao em `_project/qa-report.md`. O preview local nao equivale a um candidato publicado.

## Integracoes

| Integracao | Estado | Contrato |
|---|---|---|
| WhatsApp | Ativa | 3 links com rotulo `Agendar pelo WhatsApp` e URL exata `https://api.whatsapp.com/send?phone=5551999612970`; apenas `phone`, sem `text`, PII, dado de saude, tracking ou redirect |
| E-mail | Ativa como contato | `mailto:josi.n.nutri@hotmail.com`, sem formulario ou tracking |
| Formulario | Ausente | Nenhum campo, submit, backend ou coleta no site |
| Agenda/CRM | Ausentes | Nenhuma credencial ou integracao necessaria |
| Checkout | Ausente | E-book/Kiwify fora desta LP |
| Analytics/pixel | Ausentes | Nenhum script, evento, beacon, cookie ou storage |
| Cookies/consent manager | Ausentes | Nenhum cookie, `localStorage` ou `sessionStorage` criado pela pagina |
| Schema | Ausente | Nenhum JSON-LD ate identificacao profissional e dados finais serem validados |

Nao existe proprietario de credencial tecnica nesta versao, pois nao ha segredo, token, API, backend ou variavel de ambiente. A operacao de contato pelo WhatsApp permanece vinculada a `OP-001` e depende das decisoes de privacidade de `U-009`.

## Publicacao bloqueada

O destino, o dominio e a hospedagem ainda nao foram definidos (`U-010`). Esta entrega nao deve ser publicada. Um futuro candidato so pode ser preparado depois do fechamento dos P1 e deve passar pela validacao no ambiente real.

### Allowlist publica

Allowlist reservada para um futuro candidato autorizado:

- `index.html`
- `assets/css/styles.css`
- `assets/js/main.js`
- `assets/images/josiani-portrait.jpg`
- `assets/fonts/cormorant-garamond-600-latin.woff2`
- `assets/fonts/manrope-400-600-latin.woff2`
- `assets/fonts/OFL-Cormorant-Garamond.txt`
- `assets/fonts/OFL-Manrope.txt`

### Exclusoes obrigatorias

- `_project/**`
- `.env` e `.env*`
- logs e `**/*.log`
- backups, incluindo `**/*.bak`, `**/*.backup` e `**/*~`
- evidencias e diretorios `evidence/**`, `**/evidence/**` e `_evidence/**`
- source maps, temporarios, dumps e relatorios internos

Quando os bloqueios forem fechados e existir um candidato autorizado, o deploy devera usar allowlist, nao a copia irrestrita do diretorio. Nesse candidato, cada caminho excluido devera retornar `404` ou `403`, e directory listing devera permanecer desativado.

### Headers planejados

Como todos os assets de runtime sao locais, validar em enforcement a CSP:

```text
default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

Validar tambem:

- HTTPS obrigatorio e redirect consistente para a origem canonica.
- HSTS somente depois de definir o dominio e confirmar a cobertura pretendida.
- `X-Content-Type-Options: nosniff`.
- Referrer-Policy conservadora e coerente com o meta atual.
- Permissions-Policy desabilitando recursos nao utilizados.
- MIME correto para HTML, CSS, JavaScript, JPG, WOFF2 e TXT.
- Nenhum header de indexacao contradizendo `noindex, nofollow` enquanto a pagina estiver bloqueada.

### Checklist futuro de validacao do candidato

1. Confirmar `200` para `/` e para cada arquivo da allowlist.
2. Confirmar `404` ou `403` para `_project/**`, `.env*`, logs, backups e evidencias.
3. Confirmar directory listing desativado.
4. Confirmar HTTPS, redirects, MIME, CSP, HSTS quando aplicavel, `nosniff`, Referrer-Policy e Permissions-Policy.
5. Confirmar 0 erros de console, 0 respostas com falha e carregamento local das fontes e imagem.
6. Definir canonical absoluto somente depois de confirmar o dominio e a rota final.
7. Manter `noindex, nofollow` e fora do sitemap enquanto o status geral for `BLOCKED`.
8. Reexecutar CTA, teclado, reduced motion, no-JS, axe e Lighthouse no candidato autorizado em ambiente real.

## Pendencias externas

| ID | Responsavel | Pendencia | Impacto/fechamento |
|---|---|---|---|
| `QA-P1-001` / `U-014` | Josiani Nicolini | Revisao final HEALTH da assinatura e das formulacoes de saude | Registrar aprovacao linha a linha ou remover/ajustar o que nao for aprovado; bloqueia publicacao |
| `QA-P1-002` / `U-001` | Cliente/Josiani Nicolini | Profissao, CRN completo, regiao, situacao e forma publicavel | Confirmar em fonte apropriada e decidir apresentacao; a UI atual omite corretamente esses dados, mas o release exige identificacao profissional |
| `QA-P1-003` / `U-009` / `OP-001` | Responsavel pelo tratamento | Controlador, decisao de base, locais, retencao, descarte e canal de direitos | Documentar a operacao real de WhatsApp e a politica aplicavel; bloqueia conformidade final |
| `QA-P2-001` / `U-010` | Cliente/operacao de deploy | Dominio, hospedagem, canonical, headers, allowlist, exclusoes e validacao de deploy | Definir ambiente e executar todos os testes `DEPLOY_VALIDATION` |
| `QA-P2-002` | Operacao de QA | Firefox, Safari/iOS, Chrome Android, dispositivo real e leitor de tela | Executar matriz adicional e registrar resultados antes da liberacao |

Nenhuma pendencia foi aceita por waiver.

## Monitoramento de campo

- INP real permanece `FIELD_MONITORING`; nao inferir INP a partir de TBT/Lighthouse.
- Depois do release e de trafego suficiente, consultar dados p75 mobile e desktop em fonte de campo adequada, sem instalar RUM nesta versao por padrao.
- Registrar baseline, periodo, origem dos dados e qualquer regressao de LCP, CLS ou INP.

## Manutencao

- A pagina nao usa package manager, framework, CDN, runtime externo, instalacao ou build.
- As fontes Cormorant Garamond v21 e Manrope v20 sao WOFF2 locais. Manter junto delas as duas licencas SIL OFL 1.1.
- Qualquer troca de fonte exige nova verificacao de origem, versao, bytes, licenca e SHA-256, alem de reteste de LCP/CLS.
- O retrato `assets/images/josiani-portrait.jpg` e o unico asset fotografico publicavel desta versao; preservar alt, dimensoes e uso unico no hero.
- Preservar o arco proximo de 4:5 desktop/1:1 mobile, os dois SVGs inline decorativos, o H1 mobile de 40-48px com faixa consciente de 4-6 linhas e a label da assinatura em 12px.
- Alteracoes no WhatsApp devem manter as 3 ocorrencias, o mesmo rotulo e uma URL em allowlist sem `text` ou dados do visitante; sincronizar artefatos e retestar.
- Alteracoes de copy de saude, profissao, CRN, schema, canonical, privacidade ou indexacao exigem atualizar `brief.md`, `spec.yaml`, o artefato afetado e o QA.
- Adicionar formulario, analytics, pixel, cookie, agenda, checkout, mapa ou nova dependencia exige decisao de privacidade e novo blueprint antes da implementacao.
- Reexecutar validadores, browser QA, axe e Lighthouse depois de qualquer mudanca de implementacao ou de ambiente.

## Decisao de entrega

- Status final geral: `BLOCKED`.
- Publicavel: `false`.
- Motivo: Margem Viva esta implementada e validada localmente, mas existem tres P1 externos reais e dois P2 de deploy/cobertura abertos; os testes de deploy nao foram executados.
