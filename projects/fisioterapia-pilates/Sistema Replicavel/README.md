# Sistema Replicável de Landing Pages e Sites

Sistema operacional para criar páginas com IA de forma consistente e auditável, especializado em fisioterapia, Pilates, reabilitação, mobilidade e performance do movimento.

## O que este sistema resolve

Os prompts antigos tentavam executar diagnóstico, copy, direção de arte, seleção de componentes, motion, SEO e código em uma única resposta. Isso produzia quatro problemas:

- decisões visuais tomadas antes de compreender oferta, público e provas;
- páginas diferentes com a mesma paleta, tipografia e sequência de seções;
- mistura de stacks incompatíveis, como Framer Motion com HTML sem build;
- efeitos copiados sem avaliação de licença, performance, acessibilidade ou conflito.

A abordagem separa decisões em fases, usa o acervo local como base obrigatória e faz a primeira entrega de código somente com três heroes. A IA deixa de “gerar uma página” de uma vez e passa a operar como um pequeno estúdio com documentação, aprovação visual e QA.

## Acervo auditado

- 7 heroes completos;
- 24 páginas completas extraídas;
- 30 efeitos no arquivo de efeitos;
- 11 blocos premium únicos;
- 24 referências visuais;
- 3 launchers controlados para LP, site e auditoria;
- 2 prompts master de entrada para fisioterapia e Pilates na raiz do workspace.

`Modelos & Codigos/Páginas`, `HERO`, `Blocos` e `Efeitos` formam o acervo primário de implementação. Seu uso é obrigatório em criação/reconstrução, mas nenhuma peça entra em produção sem inspeção, autorização, adaptação e QA. O catálogo registra o que pode ser adaptado, o que precisa ser reconstruído e o que deve ser evitado.

## Fluxo resumido

```text
Organização dos materiais
  -> identidade e cores extraídas com fonte
  -> brief e evidências
  -> estratégia, arquitetura e copy completa
  -> inspeção obrigatória do código local
  -> direção única e tipo de hero
  -> blueprint
  -> exatamente 3 heroes em código
  -> aprovação humana obrigatória
  -> implementação do restante
  -> QA e correções
  -> entrega
```

Cada fase deixa um artefato no projeto. Isso reduz perda de contexto e permite trocar de modelo de IA sem recomeçar.

## Modos de uso

| Modo | Quando usar | Comportamento |
|---|---|---|
| `GATED` | Projetos de cliente, posicionamento novo, oferta sensível | A IA pede aprovação nos gates de estratégia, direção, blueprint e hero |
| `AUTO` | Protótipos ou brief já completo | A IA decide os gates pré-hero, cria V1/V2/V3 e para no gate humano do hero |
| `AUDIT` | Página existente | A IA diagnostica; só altera a implementação quando `AUDIT_ACTION=FIX_P0_P1` |

`EXECUTION_MODE` controla aprovações. `RELEASE_TARGET` controla o rigor de publicação:

- `PROTOTYPE`: pode terminar `CONDITIONAL`, permanece `noindex` e exibe somente conteúdo provisório claramente identificado; nunca inventa provas ou fatos. `noindex` não protege acesso: preview não sanitizado deve ser local, autenticado ou protegido por allowlist.
- `PRODUCTION`: não aceita placeholders na interface e só é liberado com QA `PASS`.

## Tipos de projeto

- `LP_FISIOTERAPIA`: avaliação e atendimento fisioterapêutico;
- `LP_PILATES`: aulas ou acompanhamento com Pilates, com responsável e escopo identificados;
- `LP_REABILITACAO`: jornada de reabilitação para uma necessidade funcional específica;
- `LP_PROGRAMA`: programa estruturado de movimento, cuidado ou acompanhamento;
- `LP_PRODUTO`: material ou produto educativo relacionado ao movimento;
- `SITE_PROFISSIONAL`: site multipágina de profissional individual;
- `SITE_CLINICA_ESTUDIO`: clínica, estúdio, equipe ou unidade multiprofissional;
- `PERFORMANCE_MOVIMENTO`: preparação, retorno ao esporte ou performance funcional;
- `GENERIC_LP`: landing page de outro nicho;
- `GENERIC_SITE`: site multipágina de outro nicho.

O perfil regulado é separado do tipo de projeto: `FISIOTERAPIA`, `EDUCACAO_FISICA`, `MULTIPROFISSIONAL` ou `GENERAL`. Pilates não define sozinho a profissão nem o conselho responsável.

## Como iniciar

1. Defina o diretório do projeto e `CLIENT_MATERIALS_ROOT`.
2. Peça ao agente para gerar `<projeto>/_project/brief.md` a partir de `02-BRIEF-MESTRE.template.md`.
3. Preencha ou forneça os dados críticos marcados como pendentes.
4. Envie o conteúdo de um prompt em `launchers/` ou use um dos prompts master da raiz, preenchendo `WORKSPACE_ROOT`, `PROJECT_ROOT`, `PROJECT_TYPE`, `REGULATED_PROFILE`, `STACK_PROFILE`, `EXECUTION_MODE` e `RELEASE_TARGET`.
5. Confirme a autorização de uso do código local e dos assets incorporados.
6. Em `GATED`, aprove ou ajuste G1–G3 antes do sprint. Em qualquer modo, escolha V1, V2 ou V3 no gate do hero.
7. Só depois da escolha implemente o restante. Produção termina somente com `qa-report.md` em `PASS`; protótipos terminam no máximo `CONDITIONAL` e não são publicáveis.

Exemplo de instrução curta para um agente com acesso ao workspace:

```text
Use Sistema Replicavel/launchers/prompt-lp.txt.
WORKSPACE_ROOT=C:/Users/Administrator/Desktop/Fisioterapia & Pilates
PROJECT_ROOT=<caminho do projeto>
CLIENT_MATERIALS_ROOT=<caminho dos materiais do cliente>
PROJECT_TYPE=LP_FISIOTERAPIA
REGULATED_PROFILE=FISIOTERAPIA
STACK_PROFILE=STATIC
EXECUTION_MODE=GATED
RELEASE_TARGET=PRODUCTION
LOCAL_CODE_AUTHORIZATION=CONFIRMED
Crie o brief, entregue exatamente três heroes e pare para minha escolha.
```

## Artefatos de cada projeto

```text
<projeto>/
  _project/
    brief.md
    spec.yaml
    copy.md
    direcao-visual.md
    plano-componentes.md
    hero-variants/
      v1/
      v2/
      v3/
    qa-report.md
    handoff.md
  ...arquivos da implementação
```

`spec.yaml` 2.2 é o contrato central. Ele registra materiais, identidade, copy, fontes locais obrigatórias, sprint de hero, aprovação humana, fatos, profissão/escopo, CTA, arquitetura, tokens, dependências, motion e QA.

`_project/` contém documentação e previews internos do hero; nunca faz parte do publish root. O deploy deve excluir `_project/**`, `.env*`, logs, backups, evidências e outros artefatos não públicos.

## Mapa dos arquivos

| Arquivo | Função |
|---|---|
| `01-PROCESSO.md` | SOP completo, gates e Definition of Done |
| `02-BRIEF-MESTRE.template.md` | coleta de dados e registro de evidências |
| `03-MATRIZ-ARQUITETURA.md` | escolha de seções e páginas por oferta |
| `04-DIRECOES-DE-ARTE.md` | rotas visuais e orçamento de motion |
| `05-POLITICA-DE-REUSO.md` | como aproveitar códigos sem criar conflitos ou cópia indevida |
| `06-CATALOGO-ACERVO.md` | classificação de heroes, páginas, efeitos, blocos e imagens |
| `07-PROMPT-ORQUESTRADOR.md` | prompt principal para agentes com acesso aos arquivos |
| `08-PROMPTS-POR-FASE.md` | prompts independentes para execução manual por fases |
| `09-CHECKLIST-QA.md` | validação visual, técnica, ética e de conversão |
| `10-SPEC-PROJETO.template.yaml` | contrato estruturado do projeto |
| `11-ARTEFATOS-PROJETO.template.md` | formato mínimo de copy, direção, componentes e handoff |
| `launchers/` | instruções curtas para LP, site e auditoria |

## Princípios permanentes

- Evidência antes de persuasão.
- Estratégia antes de estética.
- Copy completa antes de componentes.
- Identidade do cliente antes da estética do acervo.
- Código local inspecionado antes de código novo.
- Três heroes antes do restante da interface.
- Uma direção visual coerente antes de efeitos isolados.
- Progressive enhancement antes de espetáculo.
- Mobile real, não desktop comprimido.
- Uma ação principal por página.
- Comunicação clínica não diagnostica pela página nem usa medo, culpa, urgência falsa ou promessa de recuperação.
- Dor, mobilidade e função são descritas sem garantir desfecho; avaliação individual e limites do serviço ficam claros.
- Pilates sempre explicita objetivo, formato, tamanho de turma e profissão responsável quando essas informações forem publicadas.
- Código local autorizado serve como base de implementação; identidade, copy, mídia e tokens sempre vêm do cliente.
- A IA deve provar que testou; uma nota subjetiva “9/10” não substitui QA.

## Perfis técnicos

### `STATIC`

HTML semântico, CSS e JavaScript modular. É o padrão para projetos simples e para aproveitar a biblioteca atual. Não usar Tailwind CDN em produção. Bibliotecas externas entram apenas quando justificadas no plano de componentes.

### `REACT`

React/Next.js ou stack já existente. Motion pode ser usado quando instalado e coerente com o projeto. Componentes devem preservar SSR, acessibilidade, bundle e convenções do repositório.

### `EXISTING`

Mantém a stack encontrada. A IA corrige o mínimo necessário e não migra o projeto por preferência pessoal.

## Regra de ouro do acervo

Em todo `CREATE/REBUILD`, selecionar e usar:

- 1 projeto de `Páginas` como base principal da implementação;
- 3 projetos distintos de `HERO`, um para cada versão inicial;
- pelo menos 1 especificação de `Blocos` para um componente do restante da página;
- pelo menos 1 item elegível de `Efeitos`, com fallback estático/reduced motion;
- de 0 a 2 imagens de `Ref Design`, apenas como apoio secundário.

Primeiro consulte `06-CATALOGO-ACERVO.md`; depois abra os entrypoints, CSS, JS e dependências reais dos candidatos. Os ZIPs não contam como inspeção quando existe pasta extraída. Fonte `AVOID` não conta. O código preserva a estrutura/efeito útil do acervo quando autorizado, mas recebe copy, cores, tipografia, mídia e identidade do cliente, além das correções mínimas de escopo, acessibilidade, performance e compatibilidade.

## Gate obrigatório do hero

- Primeira entrega visual em código: somente `v1`, `v2` e `v3`.
- Mesma copy, CTA, identidade, tokens e `hero_type` nas três versões.
- Cada versão parte de um projeto local distinto de `Modelos & Codigos/HERO`.
- Nenhuma quarta versão, seção seguinte ou rota interna antes da decisão.
- `AUTO` também termina a primeira execução em `AWAITING_HERO_APPROVAL`.
- Só uma escolha humana registrada libera a implementação do restante.
