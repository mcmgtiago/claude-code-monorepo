# Sistema Replicável de Landing Pages e Sites

Sistema operacional para criar páginas com IA de forma consistente, auditável e adaptável a qualquer nicho, com perfil especializado para nutrição, saúde e fitness.

## O que este sistema resolve

Os prompts antigos tentavam executar diagnóstico, copy, direção de arte, seleção de componentes, motion, SEO e código em uma única resposta. Isso produzia quatro problemas:

- decisões visuais tomadas antes de compreender oferta, público e provas;
- páginas diferentes com a mesma paleta, tipografia e sequência de seções;
- mistura de stacks incompatíveis, como Framer Motion com HTML sem build;
- efeitos copiados sem avaliação de licença, performance, acessibilidade ou conflito.

A nova abordagem separa decisões em fases com critérios de aprovação. A IA deixa de “gerar uma página” de uma vez e passa a operar como um pequeno estúdio com documentação e QA.

## Acervo auditado

- 7 heroes completos;
- 24 páginas completas extraídas;
- 30 efeitos no arquivo de efeitos;
- 11 blocos premium únicos;
- 24 referências visuais;
- 2 prompts master legados.

Nenhuma peça foi classificada como pronta para produção sem revisão. O catálogo registra o que pode ser aproveitado, o que precisa ser reconstruído e o que deve ser evitado.

## Fluxo resumido

```text
Brief e evidências
  -> estratégia e mensagem
  -> arquitetura e copy
  -> direção de arte
  -> seleção auditada de componentes
  -> implementação
  -> QA e correções
  -> entrega
```

Cada fase deixa um artefato no projeto. Isso reduz perda de contexto e permite trocar de modelo de IA sem recomeçar.

## Modos de uso

| Modo | Quando usar | Comportamento |
|---|---|---|
| `GATED` | Projetos de cliente, posicionamento novo, oferta sensível | A IA pede aprovação nos gates de estratégia, direção e blueprint |
| `AUTO` | Protótipos ou brief já completo | A IA decide de forma conservadora, registra hipóteses e segue até QA |
| `AUDIT` | Página existente | A IA diagnostica; só altera a implementação quando `AUDIT_ACTION=FIX_P0_P1` |

`EXECUTION_MODE` controla aprovações. `RELEASE_TARGET` controla o rigor de publicação:

- `PROTOTYPE`: pode terminar `CONDITIONAL`, permanece `noindex` e exibe somente conteúdo provisório claramente identificado; nunca inventa provas ou fatos. `noindex` não protege acesso: preview não sanitizado deve ser local, autenticado ou protegido por allowlist.
- `PRODUCTION`: não aceita placeholders na interface e só é liberado com QA `PASS`.

## Tipos de projeto

- `LP_SERVICO`: consulta, avaliação ou acompanhamento individual;
- `LP_PROGRAMA`: mentoria, programa em grupo ou acompanhamento premium;
- `LP_PRODUTO`: ebook, curso, desafio ou assinatura;
- `SITE_SOLO`: site multipágina de profissional individual;
- `SITE_CLINICA`: clínica ou equipe multiprofissional;
- `FITNESS_PERFORMANCE`: treinador, performance ou nutrição esportiva;
- `GENERIC_LP`: landing page de outro nicho;
- `GENERIC_SITE`: site multipágina de outro nicho.

## Como iniciar

1. Defina um diretório de projeto.
2. Peça ao agente para gerar `<projeto>/_project/brief.md` a partir de `02-BRIEF-MESTRE.template.md`.
3. Preencha ou forneça os dados críticos marcados como pendentes.
4. Envie o conteúdo de um prompt em `launchers/` ao agente, preenchendo `WORKSPACE_ROOT`, `PROJECT_ROOT`, `PROJECT_TYPE`, `STACK_PROFILE`, `EXECUTION_MODE` e `RELEASE_TARGET`.
5. Em modo `GATED`, aprove ou ajuste os três gates antes da implementação.
6. Considere uma entrega de produção concluída somente com `qa-report.md` em `PASS`; protótipos terminam no máximo `CONDITIONAL` e não são publicáveis.

Exemplo de instrução curta para um agente com acesso ao workspace:

```text
Use Sistema Replicavel/launchers/prompt-lp.txt.
WORKSPACE_ROOT=C:/Users/Administrator/Desktop/Nutri
PROJECT_ROOT=<caminho do projeto>
PROJECT_TYPE=LP_SERVICO
STACK_PROFILE=STATIC
EXECUTION_MODE=GATED
RELEASE_TARGET=PRODUCTION
Crie o brief com os dados que vou fornecer e conduza o processo completo.
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
    qa-report.md
    handoff.md
  ...arquivos da implementação
```

`spec.yaml` é o contrato central. Ele registra fatos, hipóteses, CTA, arquitetura, tokens, referências selecionadas, dependências, orçamento de motion e requisitos de QA.

`_project/` é documentação interna e nunca faz parte do publish root. O deploy deve excluir `_project/**`, `.env*`, logs, backups, evidências e outros artefatos não públicos.

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
- Copy antes de componentes.
- Uma direção visual coerente antes de efeitos isolados.
- Progressive enhancement antes de espetáculo.
- Mobile real, não desktop comprimido.
- Uma ação principal por página.
- Saúde não usa culpa, medo, urgência falsa ou promessa de resultado.
- Referência serve para extrair princípios, não para reproduzir identidade.
- A IA deve provar que testou; uma nota subjetiva “9/10” não substitui QA.

## Perfis técnicos

### `STATIC`

HTML semântico, CSS e JavaScript modular. É o padrão para projetos simples e para aproveitar a biblioteca atual. Não usar Tailwind CDN em produção. Bibliotecas externas entram apenas quando justificadas no plano de componentes.

### `REACT`

React/Next.js ou stack já existente. Motion pode ser usado quando instalado e coerente com o projeto. Componentes devem preservar SSR, acessibilidade, bundle e convenções do repositório.

### `EXISTING`

Mantém a stack encontrada. A IA corrige o mínimo necessário e não migra o projeto por preferência pessoal.

## Regra de ouro do acervo

Por projeto, selecionar no máximo:

- 1 referência principal de página;
- 1 referência de hero;
- 1 bloco de assinatura;
- 1 efeito de fundo ou microinteração relevante;
- 2 imagens de `Ref Design` para princípios visuais.

O restante deve nascer do brief e do design system do cliente. Essa limitação evita páginas compostas por estilos incompatíveis.
