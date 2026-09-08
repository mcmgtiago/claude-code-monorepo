# Handoff

## Status

- Release target: `PROTOTYPE`
- QA status: `BLOCKED`
- Publicável: não
- Build/commit/version: protótipo estático, revisão de 2026-07-26; sem commit solicitado
- Motivo: implementação aprovada tecnicamente para demonstração, mas dados, integração, RGPD e assets de produção permanecem abertos.

## Como executar

- Requisitos da página: browser evergreen; não há instalação nem build.
- Requisitos do servidor local: Python 3.
- Desenvolvimento: executar `python -m http.server 4173 --bind 127.0.0.1` na pasta `Amanda Pacheco` e abrir `http://127.0.0.1:4173/`.
- Build: não se aplica; a entrega é `index.html` estático.
- Validação HTML: `npx --yes html-validate "index.html"`.
- Testes: usar Node, Microsoft Edge, `@playwright/test` e `@axe-core/playwright`; executar `playwright test --config="_project\playwright.config.cjs"` com as dependências no `NODE_PATH`.
- Relatório detalhado: `_project/qa-report.md`.

## Como publicar

- Destino: não definido.
- Variáveis/segredos necessários: nenhum no protótipo; credenciais futuras devem permanecer no backend, nunca no `index.html`.
- Base path/domínio: caminhos atuais suportam subpasta; domínio e canonical ainda não existem.
- Headers/consentimento: definir CSP, `form-action`, `connect-src`, `frame-ancestors`, HSTS e `Referrer-Policy` no host final; aprovar o fluxo RGPD antes de qualquer recolha.
- Indexação: manter `noindex, nofollow` até fechar todos os bloqueadores e realizar QA no domínio final.

### Checklist pré-deploy

1. Validar cédula, biografia, formação, especializações e âmbito profissional.
2. Substituir a copy hipotética por conteúdo aprovado por Amanda.
3. Confirmar serviços, modalidade, logística, duração, suporte, preço e cancelamento.
4. Substituir imagens ilustrativas por assets autorizados e decidir logo/fotografia final.
5. Self-host ou documentar legalmente as fontes; remover Tailwind Play CDN em favor de CSS de produção.
6. Aprovar RGPD e implementar o formulário com POST/TLS, minimização, retenção e proteção contra abuso.
7. Configurar contacto real sem enviar dados de saúde por URL, analytics, logs ou WhatsApp pré-preenchido.
8. Adicionar canonical, OG absoluto e somente o schema sustentado por dados visíveis e comprovados.
9. Validar Firefox, Safari/WebKit, zoom real a 200% e dispositivos reais.
10. Reexecutar HTML Validate, Playwright, axe e Lighthouse no ambiente final.
11. Só então remover `noindex` e incluir a URL no sitemap, se aplicável.

## Integrações

- Formulário: validação local demonstrativa; não envia nem guarda dados.
- WhatsApp: `CONFIG.whatsappNumber` vazio; mensagem futura é genérica e não inclui campos do formulário.
- Agenda/checkout: inexistentes.
- Analytics/pixels: inexistentes.
- Proprietário das credenciais: não definido.

## Decisões principais

- Um único `index.html`, sem build, para cumprir o perfil estático e o uso em subpasta.
- Direção “Clínica Editorial Atlântica”, com Newsreader, Manrope, verde-pinho, calcário e terracota.
- Motion limitado a CSS + IntersectionObserver; sticky apenas no processo.
- Conteúdo essencial visível sem JavaScript e fluxo linear com `prefers-reduced-motion`.
- Nenhum depoimento, métrica, preço, credencial, contacto ou resultado inventado.
- Placeholders permanecem apenas nos artefactos de `_project/`; a interface usa somente informação confirmada ou explicita o estado demonstrativo.
- Structured data omitido até existirem perfil, oferta, NAP e URL final verificáveis.
- Formulários não transmitem dados até existir integração e decisão RGPD aprovadas.

## Pendências externas

| ID    | Pendência                                      | Responsável       | Impacto                          |
| ----- | ---------------------------------------------- | ----------------- | -------------------------------- |
| P-001 | WhatsApp, e-mail e integração de envio         | Cliente/dev       | Bloqueia conversão real          |
| P-002 | Cédula, formação, especializações e biografia  | Amanda            | Bloqueia autoridade e compliance |
| P-003 | Cidade, morada, horários e modalidade          | Amanda            | Bloqueia logística e SEO local   |
| P-004 | Oferta, duração, suporte, preço e cancelamento | Amanda            | Bloqueia informação comercial    |
| P-005 | Provas reais e autorizações, se forem usadas   | Amanda            | Impede prova social              |
| P-006 | RGPD, base legal, política e operação de dados | Responsável legal | Bloqueia formulário real         |
| P-007 | Público, dores, processo e copy                | Amanda/estratégia | Exige aprovação factual          |
| P-008 | Fotos, logo, fontes e respetivas licenças      | Design/dev        | Bloqueia assets finais           |
| P-009 | Hosting, domínio, headers e matriz de browsers | Dev/infra         | Bloqueia go-live                 |

## Limitações e itens waived

- Não existem waivers aprovados.
- Firefox e Safari/WebKit não foram testados neste ambiente.
- O teste de zoom usa viewport equivalente; falta validação manual a 200% no browser.
- Lighthouse é laboratório mobile local; não representa dados de campo nem INP.
- O comando Lighthouse encontra `EPERM` apenas no cleanup temporário, após gravar o relatório válido.

## Manutenção

- Dependências críticas do protótipo: Tailwind Play CDN, Google Fonts e Unsplash.
- Runtime próprio: JavaScript vanilla; sem framework ou biblioteca de motion.
- Assets/fontes e licenças: estado `LICENSE_PENDING` no brief.
- Pontos de atualização: `CONFIG` no fim de `index.html`, metadata no `<head>`, copy das secções e dados documentados em `_project/spec.yaml`.
- Alterações de conteúdo devem atualizar `brief.md`, `spec.yaml`, `copy.md` e, quando afetado, este handoff e o QA report.
