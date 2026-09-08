# Prompts por Fase

Use estes prompts quando o modelo não tiver autonomia para executar todo o processo em uma sessão.

## Configuração comum

Preencha em cada execução:

```text
WORKSPACE_ROOT = "[caminho absoluto]"
SYSTEM_ROOT = "${WORKSPACE_ROOT}/Sistema Replicavel"
PROJECT_ROOT = "[caminho absoluto do projeto]"
CLIENT_MATERIALS_ROOT = "[caminho absoluto dos materiais originais]"
LOCAL_CODE_AUTHORIZATION = "[CONFIRMED | PENDING | DENIED]"
PROJECT_TYPE = "[LP_FISIOTERAPIA | LP_PILATES | LP_REABILITACAO | LP_PROGRAMA | LP_PRODUTO | SITE_PROFISSIONAL | SITE_CLINICA_ESTUDIO | PERFORMANCE_MOVIMENTO | GENERIC_LP | GENERIC_SITE]"
REGULATED_PROFILE = "[FISIOTERAPIA | EDUCACAO_FISICA | MULTIPROFISSIONAL | GENERAL]"
STACK_PROFILE = "[STATIC | REACT | EXISTING]"
EXECUTION_MODE = "[GATED | AUTO]"
RELEASE_TARGET = "[PROTOTYPE | PRODUCTION]"
AUDIT_ACTION = "NOT_APPLICABLE"
PRIMARY_GOAL = "[objetivo]"
PRIMARY_CTA = "[ação e destino]"
```

Em `GATED`, não execute uma fase que dependa de gate ainda não aprovado. Registre cada aprovação em `spec.yaml`. Em `GATED` e `AUTO`, o gate do hero é humano e obrigatório. Os prompts por fase não se aplicam ao modo `AUDIT`; use o prompt 9.

## 1. Descoberta e brief

```text
Use a configuração comum. Leia SYSTEM_ROOT/01-PROCESSO.md, SYSTEM_ROOT/02-BRIEF-MESTRE.template.md, SYSTEM_ROOT/10-SPEC-PROJETO.template.yaml e SYSTEM_ROOT/11-ARTEFATOS-PROJETO.template.md.

Primeiro organize `CLIENT_MATERIALS_ROOT` por manifesto lógico sem mover, renomear, sobrescrever ou apagar originais. Registre categoria, caminho, dono/licença, duplicidade, sensibilidade, qualidade, status e uso permitido. Depois leia todos os materiais. Extraia identidade, cores oficiais/inferidas, tipografia, voz, fotografia e restrições com fonte exata.

Crie PROJECT_ROOT/_project/brief.md. Inventarie oferta, público, CTA, marca, assets, tecnologia, SEO, privacidade e provas. Registre `LOCAL_CODE_AUTHORIZATION`. Confirme natureza do serviço, profissão responsável, CREFITO/CREF quando aplicável, escopo, jornada, modalidade, limites e objetivo funcional sem inferir diagnóstico. Classifique cada dado como FACT, ASSET, CLAIM_PENDING, HYPOTHESIS, UNKNOWN ou FORBIDDEN. Não invente dados. [PENDENTE: ...] só pode existir em Markdown de _project; spec.yaml usa null + evidence.unknowns.

Retorne somente síntese, riscos/contradições e uma rodada consolidada de perguntas críticas. Não escreva copy, direção ou código.
```

## 2. Estratégia e Gate G1

```text
Use a configuração comum. Leia PROJECT_ROOT/_project/brief.md, SYSTEM_ROOT/01-PROCESSO.md e SYSTEM_ROOT/03-MATRIZ-ARQUITETURA.md.

Defina audiência, contexto, estágio de consciência, problema percebido, reenquadramento, oferta, mecanismo real, diferenciais comprováveis, objeções, hierarquia de prova, promessa segura, CTA e tom. Proponha uma arquitetura, sem escrever copy completa.

Atualize PROJECT_ROOT/_project/brief.md e crie PROJECT_ROOT/_project/spec.yaml pelo template. Resolva `compliance.professional_review` em todo perfil diferente de `GENERAL`; diferencie tratamento, avaliação, aula, condicionamento e educação. Em GATED, apresente o pacote G1, aguarde e registre decisão/aprovador/data antes da fase 3. Em AUTO, registre decisão/autorização operacional justificada.
```

## 3. Arquitetura e copy

```text
Use a configuração comum. Pré-condição: G1 aprovado/registrado. Leia PROJECT_ROOT/_project/brief.md, PROJECT_ROOT/_project/spec.yaml e SYSTEM_ROOT/03-MATRIZ-ARQUITETURA.md.

Finalize arquitetura por página/seção, com objetivo, pergunta, evidence IDs, CTA e ordem mobile. Crie PROJECT_ROOT/_project/copy.md integral conforme o template 11, incluindo todas as rotas/seções, profissão responsável, natureza do serviço, jornada inicial, modalidade/local, limites, metadata, headings, corpo, CTAs, estados, FAQ e integração quando aplicáveis. Marque `copy.status=complete_for_hero`. Amostra ou copy apenas do hero não basta. Não escreva código nem diagnostique pela página.
```

## 4. Acervo, direção de arte e Gate G2

```text
Use a configuração comum. Pré-condição: arquitetura pronta e `copy.status=complete_for_hero`. Leia PROJECT_ROOT/_project/brief.md, PROJECT_ROOT/_project/spec.yaml e PROJECT_ROOT/_project/copy.md, mais SYSTEM_ROOT/03-MATRIZ-ARQUITETURA.md, SYSTEM_ROOT/04-DIRECOES-DE-ARTE.md, SYSTEM_ROOT/05-POLITICA-DE-REUSO.md e SYSTEM_ROOT/06-CATALOGO-ACERVO.md.

Consulte o catálogo e depois abra o entrypoint, CSS, JS, assets e dependências reais dos candidatos. Selecione 1 base de `Páginas`, 3 bases distintas de `HERO`, 1 item de `Blocos` e 1 efeito elegível de `Efeitos`; item `AVOID` ou não inspecionado não conta. Registre autorização, arquivos lidos, código mantido/rejeitado, dependências, fallback e nível de reuso.

Crie PROJECT_ROOT/_project/direcao-visual.md conforme o template 11. Escolha uma única direção e um único `hero_type` derivados dos materiais do cliente; cores/identidade dos demos não entram. `Ref Design` é opcional e secundário. Em GATED, apresente direção/tipo/fontes e registre G2; em AUTO, registre aprovação operacional. Não escreva código.
```

## 5. Blueprint e Gate G3

```text
Use a configuração comum. Pré-condição: G2 aprovado/registrado. Leia PROJECT_ROOT/_project/* e SYSTEM_ROOT/05-POLITICA-DE-REUSO.md, SYSTEM_ROOT/06-CATALOGO-ACERVO.md, SYSTEM_ROOT/09-CHECKLIST-QA.md e SYSTEM_ROOT/11-ARTEFATOS-PROJETO.template.md.

Crie PROJECT_ROOT/_project/plano-componentes.md. Defina arquivos/rotas, publish root com exclusão de `_project/**`, componentes, assets, estados, integrações ligadas a privacy.processing_operations, SEO por rota, runtime principal de motion, fallbacks, segurança, budget e testes. Detalhe adaptação da base de página, das 3 fontes de hero, do bloco e do efeito. Com autorização confirmada, parta do código local real; procedência desconhecida bloqueia `ADAPT_CODE`. Defina exatamente `_project/hero-variants/v1`, `v2` e `v3` e mantenha `hero_sprint.rest_implementation_allowed=false`.

Em GATED, apresente dependências/exceções, aguarde e registre G3. Não implemente antes disso.
```

## 6A. Sprint de hero e Gate G-HERO

```text
Use a configuração comum. Pré-condição: G1, G2 e G3 aprovados/registrados em GATED; em AUTO, decisões operacionais registradas. Implemente somente em PROJECT_ROOT/_project/hero-variants/ conforme todos os artefatos.

Crie exatamente `v1`, `v2` e `v3`, cada uma adaptando uma base distinta de `Modelos & Codigos/HERO`. Mantenha a mesma copy, H1, CTA/destino, microcopy, fatos, tokens, tipografia, assets e `hero_type`; varie somente composição/execução. Escopo máximo: hero e header essencial inseparável. Não crie quarta variante, seção seguinte, footer, rota interna ou integração final.

Valide 320/375/768/1024/1440 px, tela baixa, teclado, foco, contraste, conteúdo sem motion e reduced motion. Mantenha previews internos/noindex/excluídos do deploy. Grave `status=AWAITING_HERO_APPROVAL`, apresente V1/V2/V3 e PARE. Nenhum modo escolhe ou autoaprova.
```

## 6B. Implementação após aprovação do hero

```text
Use a configuração comum. Pré-condição obrigatória: `approvals.hero.status=approved`, `hero_sprint.selected_variant` preenchida e `hero_sprint.rest_implementation_allowed=true`.

Integre somente a variante aprovada. Implemente o restante usando a base selecionada de `Páginas`, o item de `Blocos` e o item de `Efeitos`. Preserve a stack. Implemente conteúdo/conversão sem motion, depois responsividade e progressive enhancement. Não hotlink assets, não renderize placeholders em PRODUCTION, não introduza segundo runtime e não deixe conteúdo essencial invisível sem JS.
```

## 7. QA e correção

```text
Use a configuração comum. Audite a implementação com SYSTEM_ROOT/09-CHECKLIST-QA.md.

Pré-condição: hero aprovado e Fase 6B concluída. Antes disso, execute apenas checklist intermediário e mantenha `AWAITING_HERO_APPROVAL`. Crie PROJECT_ROOT/_project/qa-report.md com PASS/FAIL/NOT_TESTED/N/A e OPEN/FIXED/WAIVED. Para PASS, corrija P0/P1/P2 OPEN; P1/P2 WAIVED resulta em CONDITIONAL. Sincronize spec.status, spec.qa, blockers_open, release.* e approvals.
```

## 8. Handoff

```text
Use a configuração comum. Leia PROJECT_ROOT/_project/spec.yaml, PROJECT_ROOT/_project/qa-report.md e SYSTEM_ROOT/11-ARTEFATOS-PROJETO.template.md.

Pré-condição: hero aprovado, Fase 6B e QA final concluídos. Crie PROJECT_ROOT/_project/handoff.md com status, execução, build, publicação, integrações, nomes de variáveis sem valores secretos, licenças, decisões, pendências, itens WAIVED e manutenção. Marque publishable=true somente se RELEASE_TARGET=PRODUCTION e QA=PASS. Sincronize o mesmo estado em spec.yaml.
```

## 9. Auditoria de projeto existente

```text
WORKSPACE_ROOT = "[caminho absoluto]"
SYSTEM_ROOT = "${WORKSPACE_ROOT}/Sistema Replicavel"
PROJECT_ROOT = "[caminho absoluto do projeto]"
AUDIT_ACTION = "[REPORT_ONLY | FIX_P0_P1]"
RELEASE_TARGET = "[PROTOTYPE | PRODUCTION | UNKNOWN]"

Leia o projeto e SYSTEM_ROOT/09-CHECKLIST-QA.md. Em REPORT_ONLY, não instale dependências, não execute scripts não confiáveis e altere somente _project/qa-report.md. Em FIX_P0_P1, inspecione scripts antes de executar comandos, corrija somente P0/P1 com a menor mudança segura e atualize apenas arquivos afetados. Não faça redesign.
```
