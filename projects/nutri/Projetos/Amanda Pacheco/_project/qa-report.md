# QA Report

## Resumo

- Projeto: Landing Page Amanda Pacheco
- Build/versão: protótipo estático, revisão de 2026-07-26
- Data: 2026-07-26
- Responsável: OpenCode
- Status: `BLOCKED`
- Motivo: o protótipo está funcional, mas faltam dados profissionais, oferta, contacto, integração, RGPD e assets licenciados para produção.

## Ambiente

- URL/local server: `http://127.0.0.1:4173/`
- Browser automatizado: Microsoft Edge 150, Chromium headless
- Viewports: 320×740, 375×812, 768×900, 1024×900 e 1440×1000
- Cenários adicionais: 740×360 landscape e 720×450 como proxy de reflow equivalente a 200% sobre 1440 px
- Ferramentas: Playwright, axe-core 4.12.1, HTML Validate 11.5.6, Lighthouse 13.4.1, Prettier e Impeccable
- Dados de campo/CrUX/RUM: indisponíveis

### Comandos executados

- `npx --yes html-validate "index.html"`
- `npx --yes prettier --check ".htmlvalidate.json" "_project\spec.yaml" "_project\*.md" "_project\*.cjs"`
- `playwright test --config="_project\playwright.config.cjs"`
- `npx --yes lighthouse "http://127.0.0.1:4173/" --only-categories=performance,accessibility,best-practices,seo`
- `npx --yes impeccable detect "index.html"`

## Resultado

Cada linha representa um gate verificável, não uma estimativa do número total de itens do checklist.

| Área                                         | PASS | FAIL | NOT_TESTED | N/A |
| -------------------------------------------- | ---: | ---: | ---------: | --: |
| Integridade do conteúdo visível              |    1 |    0 |          0 |   0 |
| Identificação, oferta e provas para produção |    0 |    1 |          0 |   0 |
| Fluxo demonstrativo                          |    1 |    0 |          0 |   0 |
| Conversão real                               |    0 |    1 |          0 |   0 |
| Formulário sem transmissão no protótipo      |    1 |    0 |          0 |   0 |
| RGPD e política para produção                |    0 |    1 |          0 |   0 |
| Visual e marca                               |    1 |    0 |          0 |   0 |
| Responsividade e reflow                      |    1 |    0 |          0 |   0 |
| Acessibilidade e motion                      |    1 |    0 |          0 |   0 |
| Performance de laboratório                   |    1 |    0 |          0 |   0 |
| Core Web Vitals de campo e INP               |    0 |    0 |          1 |   0 |
| SEO de staging/noindex                       |    1 |    0 |          0 |   0 |
| SEO de produção                              |    0 |    0 |          1 |   0 |
| Edge/Chromium                                |    1 |    0 |          0 |   0 |
| Firefox e Safari/WebKit                      |    0 |    0 |          1 |   0 |
| Headers e infraestrutura de produção         |    0 |    0 |          1 |   0 |
| Site multipágina                             |    0 |    0 |          0 |   1 |

## Achados

| ID     | Severidade | Disposição | Área                | Arquivo/linha                                                      | Falha                                                                                                          | Impacto                                                                       | Correção/waiver                                                                       | Reteste                        |
| ------ | ---------- | ---------- | ------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------ |
| QA-001 | P1         | OPEN       | Conteúdo/compliance | `brief.md:37-43`, `brief.md:136-144`                               | Cédula, formação, especializações, biografia e dados profissionais não foram fornecidos.                       | Impede validar autoridade, âmbito profissional e publicação regulada.         | Amanda deve fornecer e aprovar os dados; revisão técnica/jurídica local obrigatória.  | Pendente                       |
| QA-002 | P1         | OPEN       | Oferta/logística    | `brief.md:54-57`, `brief.md:139-144`                               | Serviços, modalidade, duração, frequência, suporte, preço, cancelamento, morada e horários estão ausentes.     | Impede uma decisão comercial informada e a marcação real.                     | Confirmar oferta completa e atualizar interface, FAQ e metadata.                      | Pendente                       |
| QA-003 | P1         | OPEN       | Conversão           | `index.html:4929`, `brief.md:193`                                  | `whatsappNumber` está vazio e não existe endpoint de formulário.                                               | O fluxo apenas demonstra validação; não gera contacto real.                   | Aprovar canal e integração, implementar envio seguro e testar ponta a ponta.          | Pendente                       |
| QA-004 | P1         | OPEN       | Privacidade         | `brief.md:169-176`, `brief.md:198`                                 | Base legal, política, controlador, operadores, destinatários, retenção e canal do titular não estão definidos. | Formulário real não pode ser ativado com segurança jurídica.                  | Definição RGPD pelo responsável; reduzir campos e implementar backend aprovado.       | Pendente                       |
| QA-005 | P1         | OPEN       | Assets/licenças     | `index.html:33-50`, `index.html:3017-3021`, `index.html:3597-3601` | Google Fonts e duas imagens Unsplash são remotas e provisórias.                                                | Risco de licença, privacidade, disponibilidade e coerência de identidade.     | Substituir por fotos autorizadas e fontes locais/licenciadas ou documentar a decisão. | Pendente                       |
| QA-006 | P1         | OPEN       | Produção/CSS        | `index.html:77`, `spec.yaml:283`                                   | Tailwind Play CDN é dependência de protótipo.                                                                  | Não cumpre o perfil de produção recomendado e depende de terceiro em runtime. | Compilar ou remover a camada Tailwind antes do go-live.                               | Pendente                       |
| QA-007 | P2         | OPEN       | Compatibilidade     | `spec.yaml:338-343`                                                | Firefox e Safari/WebKit não foram executados neste ambiente.                                                   | Pode restar incompatibilidade específica de browser.                          | Executar matriz final em browsers reais antes de publicar.                            | Pendente                       |
| QA-008 | P2         | OPEN       | Medição             | `spec.yaml:297-304`                                                | Não existem dados de campo; zoom real de browser a 200% foi aproximado por viewport de 720 px.                 | INP e experiência real não podem ser inferidos pelo Lighthouse.               | Validar zoom manual e recolher CrUX/RUM após deploy elegível.                         | Pendente                       |
| QA-009 | P3         | OPEN       | Ferramenta          | relatório Lighthouse temporário                                    | O Lighthouse conclui a auditoria, grava JSON válido e depois falha ao apagar a pasta temporária com `EPERM`.   | Não afeta a página; faz o comando terminar com código não zero neste Windows. | Corrigir permissões/cleanup do ambiente de QA.                                        | Relatório validado manualmente |
| QA-F01 | P1         | FIXED      | Conteúdo            | `index.html`, `smoke.spec.cjs`                                     | A primeira versão expunha marcadores e schema baseado em dados não validados.                                  | Poderia publicar lacunas ou claims sem evidência.                             | Marcadores removidos da UI, schema omitido e regressão automatizada adicionada.       | PASS                           |
| QA-F02 | P1         | FIXED      | Acessibilidade      | `index.html:93`                                                    | Terracota tinha contraste 2,9:1 sobre a secção de prova.                                                       | Falhava WCAG AA para texto grande no Lighthouse.                              | Token alterado de `#b76f58` para `#ad654e`.                                           | Lighthouse Accessibility 100   |
| QA-F03 | P2         | FIXED      | Performance         | `index.html:33-77`                                                 | Fontes e Tailwind bloqueavam mais do que o necessário.                                                         | Performance inicial de laboratório em 88.                                     | Fontes carregadas de forma assíncrona e script Tailwind adiado.                       | Lighthouse Performance 97      |

## Evidências

- Playwright: 12 testes definidos; suíte completa e cenários direcionados sem falhas.
- Fluxos cobertos: anchors, menu mobile, dialog e retorno de foco, dois formulários, erros, sucesso demonstrativo, FAQ por teclado, reduced motion, no-JS e falha de terceiros.
- Viewports sem overflow horizontal: 320, 375, 768, 1024 e 1440 px.
- Cenários adicionais sem overflow: landscape 740×360 e proxy de reflow 720×450.
- Screenshots: `C:\Users\Administrator\AppData\Local\Temp\opencode\amanda-screenshots\`.
- HTML Validate: `PASS`, zero erros.
- Axe: zero violações `serious` ou `critical`.
- Lighthouse mobile/laboratório: Performance 97, Accessibility 100, Best Practices 100 e SEO 63.
- Métricas de laboratório: FCP 1,5 s, LCP 2,5 s, TBT 20 ms e CLS 0.
- SEO 63 é consequência exclusiva do `noindex` intencional no protótipo.
- Relatório Lighthouse: `C:\Users\Administrator\AppData\Local\Temp\opencode\amanda-lighthouse-final.json`.
- Impeccable reportou 15 heurísticas; revisão visual confirmou padding por contentores internos, clipping restrito a decoração e uso deliberado de creme/grid pela metáfora cartográfica. Não foi identificado defeito funcional ou de leitura.

## Claims verificados

| Claim                                                | Evidence ID | Status                                             |
| ---------------------------------------------------- | ----------- | -------------------------------------------------- |
| Nome público: Amanda Pacheco                         | E-001       | PASS, informado pelo utilizador                    |
| Profissão: nutricionista                             | E-002       | PASS no escopo do brief; cédula não fornecida      |
| País: Portugal                                       | E-003       | PASS, informado pelo utilizador                    |
| Imagens são ilustrativas                             | E-004       | PASS; legenda e `alt` deixam isso explícito        |
| Posicionamento com ciência, contexto e sem extremos  | E-005       | NOT_TESTED; hipótese sujeita à aprovação de Amanda |
| Cédula, formação, contactos, preços, morada e provas | E-006       | UNKNOWN; não apresentados como factos ou schema    |

## Pendências externas

- Responsável e data de aprovação do projeto.
- Cédula, formação, especializações e biografia aprovadas.
- Serviços, limites, duração, frequência, suporte, preços e cancelamento.
- Modalidade, cidade, morada, horários e canais de contacto.
- WhatsApp ou endpoint de formulário e proprietário das credenciais.
- Política RGPD, base legal, controlador, operadores, retenção e canal do titular.
- Fotos reais/autorizadas, logo e decisão de licença/self-host das fontes.
- Domínio, canonical, OG final, schema aplicável, hosting e headers.
- Aprovação da copy e revisão profissional/jurídica para Portugal.

## Decisão final

- P0 abertos: 0
- P1 abertos: 6
- P1 waived e aprovador: nenhum
- Limitações não testadas: Firefox, Safari/WebKit, zoom real a 200%, headers de produção, CrUX/RUM e INP
- Publicável: não
- Status final: `BLOCKED`
