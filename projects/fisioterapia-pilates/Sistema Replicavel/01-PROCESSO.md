# Processo Operacional Padrão

## Visão geral

O processo possui um preflight, oito fases e um sprint obrigatório de hero. Há seis verificações: G0–G4 e `G-HERO`. Em modo `GATED`, G1–G3 exigem aprovação humana; `G-HERO` exige aprovação humana em todos os modos. Um projeto não avança apenas porque uma resposta “parece boa”; cada gate possui entregáveis e critérios observáveis.

| Fase | Resultado | Gate |
|---|---|---|
| 0. Escopo | modo, stack, objetivo e diretório definidos | G0 |
| 1. Materiais e identidade | materiais organizados; identidade e cores extraídas com evidência | G1 |
| 2. Estratégia | público, oferta, mensagem e CTA decididos | G1 |
| 3. Arquitetura e copy | sequência, função e copy integral de todas as páginas/seções | G2 |
| 4. Acervo e direção de arte | fontes locais inspecionadas, rota única, tokens e tipo de hero | G2 |
| 5. Blueprint técnico | componentes, dependências, contratos e plano de adaptação local | G3 |
| 6A. Sprint de hero | exatamente V1, V2 e V3 isoladas | G-HERO |
| 6B. Implementação | restante da página/site após escolha humana | G4 |
| 7. QA e correção | relatório sem bloqueadores | G4 |
| 8. Entrega | documentação e pendências finais | concluído |

## Fase 0: enquadramento

### Decisões obrigatórias

- tipo de projeto;
- objetivo de negócio;
- conversão primária;
- fonte principal de tráfego;
- diretório de destino;
- raiz dos materiais do cliente;
- status da autorização para adaptar o código local;
- perfil técnico: `STATIC`, `REACT` ou `EXISTING`;
- modo de execução: `GATED`, `AUTO` ou `AUDIT`;
- alvo de entrega: `PROTOTYPE` ou `PRODUCTION`;
- perfil regulado: `FISIOTERAPIA`, `EDUCACAO_FISICA`, `MULTIPROFISSIONAL` ou `GENERAL`.

### G0: pronto para começar

- O diretório correto está confirmado.
- A raiz dos materiais está confirmada e os originais serão preservados.
- A autorização para uso direto do código local está registrada; autorização de código não presume licença de mídia, fonte ou plugin incorporado.
- O agente sabe se deve criar, reconstruir ou auditar.
- O resultado esperado não está em conflito com a stack.

### Ramo de auditoria

Quando `EXECUTION_MODE=AUDIT`, não siga automaticamente as fases de criação:

- `AUDIT_ACTION=REPORT_ONLY`: leia e inspecione; crie ou atualize somente `_project/qa-report.md`. Não instale dependências, não execute scripts não confiáveis e não altere implementação ou outros artefatos sem autorização.
- `AUDIT_ACTION=FIX_P0_P1`: audite, corrija somente P0/P1 com a menor mudança segura e atualize os artefatos diretamente afetados.
- Em ambos os casos, não faça redesign, migração ou mudança de arquitetura salvo requisito explícito.

## Fase 1: organização de materiais, identidade e evidências

### Ações

1. Confirmar `CLIENT_MATERIALS_ROOT` e preservar os arquivos originais; não renomear, mover, sobrescrever ou apagar sem autorização.
2. Criar no `brief.md` um manifesto lógico por categoria: marca, logo, cores, fontes, fotos, vídeos, textos, provas, credenciais, contatos, documentos e itens descartados/duplicados.
3. Registrar caminho original, proprietário, licença/permissão, qualidade, duplicidade, sensibilidade e uso permitido de cada item.
4. Só depois da organização, ler todos os materiais antes de propor layout ou copy.
5. Extrair identidade visual com evidência: cores oficiais, cores inferidas, tipografia, formas, tratamento fotográfico, voz, atributos e restrições. Para cada cor/decisão, registrar arquivo, página ou amostra de origem.
6. Separar identidade confirmada de inferência. Cor inferida não vira “cor oficial” sem aprovação.
7. Classificar cada informação:
   - `FACT`: comprovada pelo cliente;
   - `ASSET`: arquivo recebido e com uso permitido;
   - `CLAIM_PENDING`: alegação sem comprovação anexada;
   - `HYPOTHESIS`: decisão provisória de estratégia;
   - `UNKNOWN`: dado ausente;
   - `FORBIDDEN`: informação que não deve ser publicada.
8. Registrar qualidade, proporção e melhor uso das imagens.
9. Separar conteúdo público de informação sensível ou desnecessária.

### Dados críticos

- nome público, profissão e papel no atendimento;
- serviço ou produto;
- público prioritário;
- CTA e canal de conversão;
- modalidade, cidade e área atendida;
- contato real;
- conselho, registro, responsabilidade técnica e credenciais publicáveis quando aplicáveis;
- natureza do serviço: avaliação/tratamento fisioterapêutico, Pilates, reabilitação, condicionamento, performance ou educação;
- formato, duração, frequência, tamanho de turma e equipamentos quando aplicáveis;
- limites de escopo, critérios de encaminhamento e orientação para urgência/emergência;
- preços, condições e garantias, se a página os exibir;
- provas reais e autorização de uso;
- política de privacidade quando houver coleta.
- fontes documentais da identidade, paleta e tipografia;
- autorização de uso do acervo de código local e limites dessa autorização.

### Regra de ausência

Em `GATED`, dados críticos ausentes geram uma pergunta curta antes do próximo gate. Em `AUTO`, o agente usa `[PENDENTE: descrição]` somente em `_project/`, não fabrica conteúdo e continua apenas se a ausência não tornar a implementação enganosa. Em `PRODUCTION`, nenhum placeholder entra em UI, metadata ou schema. Em `PROTOTYPE`, conteúdo provisório deve estar claramente marcado como demonstração e manter a entrega `noindex`/`CONDITIONAL`. `noindex` não é controle de acesso; previews com conteúdo não público devem ser locais, autenticados ou protegidos por allowlist.

## Fase 2: estratégia e mensagem

### Entregáveis

- objetivo mensurável da página;
- audiência principal e audiência excluída;
- estágio de consciência e temperatura do tráfego;
- problema percebido, problema real e resultado desejado;
- mecanismo ou abordagem da oferta;
- diferenciais sustentáveis;
- objeções prioritárias;
- hierarquia de provas disponíveis;
- promessa central segura;
- CTA principal e microcopy de risco;
- tom de voz com exemplos de “usar” e “evitar”.

### Matriz de mensagem

```text
Contexto da pessoa
  -> tensão reconhecível
  -> reenquadramento sem culpa
  -> abordagem da profissional
  -> evidência
  -> próximo passo de baixa fricção
```

### Regras para fisioterapia, Pilates e movimento

- Não diagnosticar, prescrever ou realizar triagem clínica pela página.
- Não garantir cura, ausência de dor, prevenção, recuperação completa, retorno ao esporte ou resposta funcional em prazo fixo.
- Não amplificar medo de movimento, lesão, envelhecimento, postura ou incapacidade para gerar conversão.
- Não tratar postura “perfeita”, alinhamento isolado ou dor como explicação universal sem evidência e contexto.
- Não publicar antes/depois, imagem de paciente, caso ou depoimento sem validação profissional/jurídica e autorização documentada; o padrão conservador é não usar.
- Não chamar técnica comum de “exclusiva”, “comprovada” ou “a mais avançada” sem evidência específica e uso permitido.
- Diferenciar avaliação, tratamento, aula, condicionamento, educação, acompanhamento e conteúdo informativo.
- Pilates é um método: declarar a profissão responsável e não atribuir ato privativo de outra profissão.
- Orientação sobre sinais de alerta deve encaminhar para serviço apropriado e nunca simular avaliação individual.

### G1: estratégia aprovada

- Existe uma única conversão primária.
- A promessa cabe nas provas existentes.
- O público entende para quem é, o que recebe e qual é o próximo passo.
- Fatos e hipóteses estão separados.
- Em perfil regulado, a necessidade de revisão profissional, o responsável, o escopo e a justificativa foram resolvidos; não permanecem indefinidos.
- A aprovação, responsável e data foram registrados em `spec.yaml`.
- Os materiais foram organizados sem destruir originais e a identidade visual possui fontes rastreáveis.

## Fase 3: arquitetura e copy

### Método

1. Selecionar uma arquitetura em `03-MATRIZ-ARQUITETURA.md`.
2. Remover seções sem função; não preencher um template universal.
3. Atribuir a cada seção uma tarefa na jornada:
   - chamar atenção;
   - gerar identificação;
   - explicar;
   - provar;
   - reduzir risco;
   - converter.
4. Definir a evidência que sustenta cada afirmação.
5. Escrever a copy já considerando o espaço visual e a leitura mobile.
6. Concluir a copy de todas as páginas, seções, estados, metadata, FAQ e integrações previstas antes de selecionar o tipo de hero.
7. Marcar `copy.status=complete_for_hero` em `spec.yaml`; amostra ou copy apenas do hero não atende esta fase.

### Contrato de seção

Cada seção deve registrar:

- ID e objetivo;
- pergunta que responde;
- headline;
- corpo;
- prova ou asset;
- CTA, se houver;
- componente pretendido;
- risco de compliance;
- comportamento mobile.

### Regras de copy

- Um H1 específico e compreensível fora do contexto visual.
- Headline de benefício sem esconder a natureza do serviço.
- Parágrafos curtos e linguagem que o público usa.
- CTA descreve a ação real: “Agendar avaliação inicial” ou “Conhecer horários das turmas” é melhor que “Voltar a viver sem dor”.
- Prova aparece próxima à afirmação que sustenta.
- FAQ responde objeções reais; não repete propaganda.
- Dados pendentes permanecem visíveis como pendência interna, nunca disfarçados como verdade.

## Fase 4: inspeção do acervo e direção de arte

### Método

1. Consultar `06-CATALOGO-ACERVO.md` para formar uma shortlist; o catálogo não substitui a leitura do código.
2. Abrir os arquivos reais dos candidatos nas quatro fontes obrigatórias: `Modelos & Codigos/Páginas`, `HERO`, `Blocos` e `Efeitos`. Inspecionar entrypoint, CSS, JS, assets e dependências relevantes; usar pastas extraídas, não ZIPs, quando disponíveis.
3. Selecionar 1 base de página, 3 bases distintas de hero, 1 especificação de bloco e 1 efeito elegível. Itens `AVOID` e escolhas sem inspeção não contam.
4. Registrar autorização, procedência, licença, função, trecho a adaptar, trecho a rejeitar, dependências, fallback, risco e nível de reuso de cada escolha.
5. Criar um fingerprint visual exclusivamente a partir do brief e dos materiais do cliente. O acervo fornece implementação/composição, não identidade.
6. Selecionar uma única rota primária em `04-DIRECOES-DE-ARTE.md` e definir uma taxonomia explícita de `hero_type` usando `03-MATRIZ-ARQUITETURA.md`.
7. Definir tokens funcionais, tipografia, grid, fotografia, iconografia e motion. Cores e identidade vêm do cliente; não são herdadas dos projetos-base.
8. `Ref Design` é opcional e secundário. Se usado, selecionar no máximo duas imagens e registrar somente princípios; nunca usá-lo no lugar do código local obrigatório.

Se a autorização não permitir adaptação direta ou nenhum candidato seguro cumprir uma categoria obrigatória, marque `BLOCKED` e peça decisão. Não substitua silenciosamente o acervo por layout genérico.

### G2: direção e conteúdo aprovados

- A sequência da página está ligada à estratégia.
- `copy.status=complete_for_hero` e a copy integral não depende de texto a ser inventado durante o design.
- A copy não depende de afirmação pendente para funcionar.
- A direção usa identidade/cores rastreadas aos materiais do cliente.
- Uma base de página, três bases de hero, um bloco e um efeito foram inspecionados e registrados.
- Existe uma única direção e um único `hero_type` para V1/V2/V3.
- Desktop e mobile têm composição planejada.
- O orçamento de motion foi definido.
- A rota escolhida, responsável e data foram registrados em `spec.yaml`.

## Fase 5: blueprint técnico

### Plano de adaptação do acervo

Usar as escolhas obrigatórias da Fase 4 e registrar para cada uma:

- fonte;
- função no novo projeto;
- princípio aproveitado;
- implementação que será descartada;
- dependências;
- licença/procedência;
- fallback;
- custo de performance.
- arquivos de origem realmente lidos;
- arquivos/trechos que serão adaptados diretamente;
- mudanças exigidas para aplicar copy, cores, tipografia, mídia e tokens do cliente;
- correções mínimas de escopo, acessibilidade, performance e compatibilidade.

Quando `ADAPT_CODE` estiver autorizado, partir do código local real. Não redesenhar do zero nem apenas imitar visualmente. `REBUILD` só é válido quando o catálogo ou uma restrição técnica/legal exigir e a exceção estiver registrada.

### Plano mínimo

- mapa de componentes;
- estrutura de arquivos e rotas;
- tokens;
- contratos de dados/conteúdo;
- estratégia de mídia;
- runtime principal de motion;
- comportamento sem JavaScript e com reduced motion;
- formulários e integrações, quando aplicáveis;
- fronteira entre captação, agendamento e coleta clínica;
- operações de privacidade por finalidade e seus IDs nas integrações;
- SEO e dados estruturados;
- orçamento de performance;
- plano de testes.
- publish root e lista explícita de exclusões, incluindo `_project/**`.
- contrato do sprint em `_project/hero-variants/v1`, `v2` e `v3`;
- trava `hero_sprint.rest_implementation_allowed=false` até aprovação humana.

### G3: blueprint aprovado

- Nenhuma dependência é carregada por hábito.
- Não existem classes globais ou resets copiados de snippets.
- Todos os assets têm origem e finalidade.
- Efeitos caros têm fallback e justificativa.
- O plano cabe no stack e no prazo do projeto.
- As três fontes de hero são distintas, elegíveis e compatíveis com o mesmo `hero_type`.
- A primeira escrita de código está limitada às três variantes do hero.
- A aprovação, exceções e data foram registradas em `spec.yaml`.

## Fase 6A: sprint obrigatório de hero

### Escopo da primeira entrega de código

1. Criar exatamente três variantes isoladas:
   - `PROJECT_ROOT/_project/hero-variants/v1`;
   - `PROJECT_ROOT/_project/hero-variants/v2`;
   - `PROJECT_ROOT/_project/hero-variants/v3`.
2. Usar uma fonte distinta de `Modelos & Codigos/HERO` em cada variante e adaptar o código real quando autorizado.
3. Manter idênticos nas três: H1, texto de apoio, CTA, microcopy, fatos, tokens de marca, assets aprovados e `hero_type`.
4. Variar composição, hierarquia espacial, tratamento de mídia e execução de motion dentro do mesmo tipo de hero.
5. Limitar cada preview ao hero e ao header essencial quando ele fizer parte inseparável da fonte. Não implementar seções seguintes, footer, rotas internas ou integrações finais.
6. Garantir viewport 320/375/768/1024/1440, tela baixa, teclado, foco, conteúdo sem motion e `prefers-reduced-motion`.
7. Manter as variantes fora do publish root e sem indexação.

Não crie quarta variante. Não altere a copy para favorecer uma opção. Não integre ainda a variante ao produto final.

### G-HERO: aprovação humana obrigatória

- Atualizar `hero_sprint.status=awaiting_approval`, `status=AWAITING_HERO_APPROVAL` e manter `hero_sprint.rest_implementation_allowed=false`.
- Apresentar somente links/caminhos de V1, V2 e V3, diferenças objetivas e limitações verificadas.
- Parar a execução. `AUTO` não escolhe vencedor, não preenche aprovador humano e não inicia a Fase 6B.
- Para retomar, uma pessoa deve escolher `v1`, `v2` ou `v3`; registrar variante, aprovador, decisão e data em `spec.yaml`.
- Ajustes solicitados no hero permanecem dentro do sprint. Depois da aprovação final, `hero_sprint.rest_implementation_allowed=true`.

## Fase 6B: implementação do restante

### Pré-condição

`approvals.hero.status=approved`, `hero_sprint.selected_variant` preenchida e `hero_sprint.rest_implementation_allowed=true`. Sem os três campos, nenhuma seção adicional ou rota pode ser escrita.

### Ordem recomendada

1. Integrar somente a variante aprovada ao projeto final.
2. Aplicar a base selecionada de `Páginas` à estrutura semântica e às rotas.
3. Implementar o componente selecionado de `Blocos` e o item elegível de `Efeitos` conforme o plano.
4. Completar seções estáticas e conteúdo real.
5. Completar mecanismos de conversão aplicáveis e navegação.
6. Completar responsividade.
7. Completar progressive enhancement e motion.
8. Completar SEO, schema e detalhes finais.

### Regras de implementação

- A página deve ser útil antes de adicionar motion.
- O hero não deve ocultar H1 ou CTA enquanto JavaScript carrega.
- Âncoras, botões e mecanismos de conversão aplicáveis devem apontar para destinos reais.
- Formulários públicos de interesse/agendamento coletam apenas dados operacionais; anamnese, diagnóstico, exames e histórico clínico exigem fluxo separado e aprovado.
- Mídia não crítica e distante do viewport usa lazy loading; LCP e mídia quase visível não devem ser atrasados por uma regra automática.
- Código adaptado do acervo deve ser copiado para o projeto, escopado, limpo de conteúdo/identidade de terceiros e testado no contexto atual; não editar a fonte em `Modelos & Codigos`.
- No perfil `STATIC`, usar caminhos relativos e arquivos compartilhados; evitar código inline gigantesco.
- Em projeto existente, seguir lint, formatação e padrões já instalados.

## Fase 7: QA e correção

Executar `09-CHECKLIST-QA.md` somente após G-HERO aprovado e Fase 6B concluída. O relatório final deve conter evidências, não apenas afirmações. Antes disso, execute apenas o checklist intermediário do sprint e use `AWAITING_HERO_APPROVAL`, nunca `PASS`.

### Ciclo

```text
testar -> registrar falha -> corrigir -> retestar -> atualizar relatório
```

Um problema `P0` aberto bloqueia entrega e publicação. P1/P2 `OPEN` bloqueia `PASS`; P1/P2 só pode ser `WAIVED` por responsável identificado, com motivo e risco, resultando no máximo em `CONDITIONAL`. Item `PRELAUNCH_REQUIRED` ou `DEPLOY_VALIDATION` não testado também impede `PASS`; `FIELD_MONITORING` segue o plano pós-lançamento.

### G4: pronto para entrega

- Não há P0/P1/P2 `OPEN` ou P1/P2 `WAIVED` para status `PASS`.
- CTA e todos os mecanismos de conversão aplicáveis funcionam.
- Layout foi verificado nos tamanhos obrigatórios.
- A página funciona com teclado e reduced motion.
- Links, assets e rotas não estão quebrados.
- Claims publicados existem no registro de evidências.
- O relatório registra limitações reais.

## Fase 8: entrega

### Pacote final

- implementação;
- arquivos de projeto atualizados;
- `qa-report.md`;
- pendências de conteúdo do cliente;
- dependências e instruções de execução;
- lista curta de decisões importantes.
- `_project/handoff.md` com execução, publicação, dependências, pendências e status de liberação.

## Definition of Done

Um projeto de produção está concluído com status `PASS` quando:

- resolve o objetivo definido no brief;
- possui uma direção própria e coerente;
- não depende de prova inventada;
- é responsivo, acessível e utilizável;
- respeita o orçamento de motion e performance;
- não contém links, integrações ou assets de demonstração em `PRODUCTION`;
- foi testado e corrigido;
- pode ser mantido sem conhecer o snippet original.
- integra uma base de página, o hero aprovado, um bloco e um efeito do acervo obrigatório com origem e adaptação documentadas.

Um protótipo pode ser entregue como `CONDITIONAL`, desde que esteja `noindex`, claramente identificado como não publicável e tenha pendências/riscos registrados em `handoff.md`.
