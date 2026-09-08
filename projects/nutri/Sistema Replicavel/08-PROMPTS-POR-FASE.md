# Prompts por Fase

Use estes prompts quando o modelo não tiver autonomia para executar todo o processo em uma sessão.

## Configuração comum

Preencha em cada execução:

```text
WORKSPACE_ROOT = "[caminho absoluto]"
SYSTEM_ROOT = "${WORKSPACE_ROOT}/Sistema Replicavel"
PROJECT_ROOT = "[caminho absoluto do projeto]"
PROJECT_TYPE = "[LP_SERVICO | LP_PROGRAMA | LP_PRODUTO | SITE_SOLO | SITE_CLINICA | FITNESS_PERFORMANCE | GENERIC_LP | GENERIC_SITE]"
REGULATED_PROFILE = "[HEALTH | FITNESS | GENERAL]"
STACK_PROFILE = "[STATIC | REACT | EXISTING]"
EXECUTION_MODE = "[GATED | AUTO]"
RELEASE_TARGET = "[PROTOTYPE | PRODUCTION]"
AUDIT_ACTION = "NOT_APPLICABLE"
PRIMARY_GOAL = "[objetivo]"
PRIMARY_CTA = "[ação e destino]"
```

Em `GATED`, não execute uma fase que dependa de gate ainda não aprovado. Registre cada aprovação em `spec.yaml`. Os prompts por fase não se aplicam ao modo `AUDIT`; use o prompt 9.

## 1. Descoberta e brief

```text
Use a configuração comum. Leia SYSTEM_ROOT/01-PROCESSO.md, SYSTEM_ROOT/02-BRIEF-MESTRE.template.md, SYSTEM_ROOT/10-SPEC-PROJETO.template.yaml e SYSTEM_ROOT/11-ARTEFATOS-PROJETO.template.md, depois todos os materiais do projeto.

Crie PROJECT_ROOT/_project/brief.md. Inventarie oferta, público, CTA, marca, assets, tecnologia, SEO, privacidade e provas. Classifique cada dado como FACT, ASSET, CLAIM_PENDING, HYPOTHESIS, UNKNOWN ou FORBIDDEN. Não invente dados. [PENDENTE: ...] só pode existir em Markdown de _project; spec.yaml usa null + evidence.unknowns.

Retorne somente síntese, riscos/contradições e uma rodada consolidada de perguntas críticas. Não escreva copy, direção ou código.
```

## 2. Estratégia e Gate G1

```text
Use a configuração comum. Leia PROJECT_ROOT/_project/brief.md, SYSTEM_ROOT/01-PROCESSO.md e SYSTEM_ROOT/03-MATRIZ-ARQUITETURA.md.

Defina audiência, contexto, estágio de consciência, problema percebido, reenquadramento, oferta, mecanismo real, diferenciais comprováveis, objeções, hierarquia de prova, promessa segura, CTA e tom. Proponha uma arquitetura, sem escrever copy completa.

Atualize PROJECT_ROOT/_project/brief.md e crie PROJECT_ROOT/_project/spec.yaml pelo template. Resolva `compliance.health_review` em HEALTH/FITNESS. Em GATED, apresente o pacote G1, aguarde e registre decisão/aprovador/data antes da fase 3. Em AUTO, registre decisão/autorização operacional justificada.
```

## 3. Arquitetura e copy

```text
Use a configuração comum. Pré-condição: G1 aprovado/registrado. Leia PROJECT_ROOT/_project/brief.md, PROJECT_ROOT/_project/spec.yaml e SYSTEM_ROOT/03-MATRIZ-ARQUITETURA.md.

Finalize arquitetura por página/seção, com objetivo, pergunta, evidence IDs, CTA e ordem mobile. Crie PROJECT_ROOT/_project/copy.md conforme o template 11, incluindo metadata, headings, corpo, CTAs, estados, FAQ e integração quando aplicáveis. Não escreva código.
```

## 4. Direção de arte e Gate G2

```text
Use a configuração comum. Pré-condição: arquitetura e copy prontas. Leia PROJECT_ROOT/_project/brief.md, PROJECT_ROOT/_project/spec.yaml e PROJECT_ROOT/_project/copy.md, mais SYSTEM_ROOT/04-DIRECOES-DE-ARTE.md e SYSTEM_ROOT/06-CATALOGO-ACERVO.md.

Crie PROJECT_ROOT/_project/direcao-visual.md conforme SYSTEM_ROOT/11-ARTEFATOS-PROJETO.template.md. Em GATED, proponha duas rotas distintas, aguarde escolha e registre G2; em AUTO, escolha uma e registre aprovação operacional. Use source groups diferentes; repetição exige justificativa/aprovação G2. Não selecione `AVOID_HEALTH` em HEALTH/FITNESS. Não escreva código.
```

## 5. Blueprint e Gate G3

```text
Use a configuração comum. Pré-condição: G2 aprovado/registrado. Leia PROJECT_ROOT/_project/* e SYSTEM_ROOT/05-POLITICA-DE-REUSO.md, SYSTEM_ROOT/06-CATALOGO-ACERVO.md, SYSTEM_ROOT/09-CHECKLIST-QA.md e SYSTEM_ROOT/11-ARTEFATOS-PROJETO.template.md.

Crie PROJECT_ROOT/_project/plano-componentes.md. Defina arquivos/rotas, publish root com exclusão de `_project/**` e arquivos internos, componentes, assets, estados, integrações ligadas a privacy.processing_operations, SEO por rota com mecanismos de robots separados, runtime principal de motion, fallbacks, segurança, budget de performance e testes. Selecione no máximo 1 página, 1 hero, 1 bloco, 1 efeito e 2 refs. Separe catalog_status de reuse_level; procedência desconhecida limita o uso a PRINCIPLE/PATTERN/REBUILD.

Em GATED, apresente dependências/exceções, aguarde e registre G3. Não implemente antes disso.
```

## 6. Implementação

```text
Use a configuração comum. Pré-condição: G1, G2 e G3 aprovados/registrados em GATED. Implemente em PROJECT_ROOT conforme todos os artefatos.

Preserve a stack. Implemente conteúdo e conversão sem motion, depois responsividade e por último progressive enhancement. Não hotlink assets, não renderize placeholders em PRODUCTION, não introduza segundo runtime e não deixe conteúdo essencial invisível sem JS. Em PROTOTYPE, integração simulada deve estar rotulada, não fingir sucesso, permanecer noindex e não publicável; preview não sanitizado deve ser local/autenticado/allowlisted. Escreva nos arquivos e execute apenas comandos seguros/aprovados.
```

## 7. QA e correção

```text
Use a configuração comum. Audite a implementação com SYSTEM_ROOT/09-CHECKLIST-QA.md.

Crie PROJECT_ROOT/_project/qa-report.md com PASS/FAIL/NOT_TESTED/N/A e OPEN/FIXED/WAIVED. Para PASS, corrija P0/P1/P2 OPEN; P1/P2 WAIVED resulta em CONDITIONAL. Sincronize spec.status, spec.qa, blockers_open, release.* e approvals. PRODUCTION só pode ter PASS sem teste obrigatório ausente. PROTOTYPE termina CONDITIONAL, noindex e não publicável.
```

## 8. Handoff

```text
Use a configuração comum. Leia PROJECT_ROOT/_project/spec.yaml, PROJECT_ROOT/_project/qa-report.md e SYSTEM_ROOT/11-ARTEFATOS-PROJETO.template.md.

Crie PROJECT_ROOT/_project/handoff.md com status, execução, build, publicação, integrações, nomes de variáveis sem valores secretos, licenças, decisões, pendências, itens WAIVED e manutenção. Marque publishable=true somente se RELEASE_TARGET=PRODUCTION e QA=PASS. Sincronize o mesmo estado em spec.yaml.
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
