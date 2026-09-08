# Processo Operacional Padrão

## Visão geral

O processo possui um preflight e oito fases de entrega. Há cinco verificações G0–G4; em modo `GATED`, G1–G3 exigem aprovação humana. Um projeto não avança apenas porque uma resposta “parece boa”; cada gate possui entregáveis e critérios observáveis.

| Fase | Resultado | Gate |
|---|---|---|
| 0. Escopo | modo, stack, objetivo e diretório definidos | G0 |
| 1. Descoberta | brief, assets e evidências classificados | G1 |
| 2. Estratégia | público, oferta, mensagem e CTA decididos | G1 |
| 3. Arquitetura e copy | sequência, função e texto de cada seção | G2 |
| 4. Direção de arte | rota visual, tokens, mídia e motion | G2 |
| 5. Blueprint técnico | componentes, dependências e contratos | G3 |
| 6. Implementação | página funcional e responsiva | G4 |
| 7. QA e correção | relatório sem bloqueadores | G4 |
| 8. Entrega | documentação e pendências finais | concluído |

## Fase 0: enquadramento

### Decisões obrigatórias

- tipo de projeto;
- objetivo de negócio;
- conversão primária;
- fonte principal de tráfego;
- diretório de destino;
- perfil técnico: `STATIC`, `REACT` ou `EXISTING`;
- modo de execução: `GATED`, `AUTO` ou `AUDIT`;
- alvo de entrega: `PROTOTYPE` ou `PRODUCTION`;
- perfil regulado: `HEALTH`, `FITNESS`, `GENERAL`.

### G0: pronto para começar

- O diretório correto está confirmado.
- O agente sabe se deve criar, reconstruir ou auditar.
- O resultado esperado não está em conflito com a stack.

### Ramo de auditoria

Quando `EXECUTION_MODE=AUDIT`, não siga automaticamente as fases de criação:

- `AUDIT_ACTION=REPORT_ONLY`: leia e inspecione; crie ou atualize somente `_project/qa-report.md`. Não instale dependências, não execute scripts não confiáveis e não altere implementação ou outros artefatos sem autorização.
- `AUDIT_ACTION=FIX_P0_P1`: audite, corrija somente P0/P1 com a menor mudança segura e atualize os artefatos diretamente afetados.
- Em ambos os casos, não faça redesign, migração ou mudança de arquitetura salvo requisito explícito.

## Fase 1: descoberta e evidências

### Ações

1. Ler todos os materiais antes de propor layout.
2. Inventariar logos, fotos, vídeos, textos, avaliações, credenciais e dados de contato.
3. Classificar cada informação:
   - `FACT`: comprovada pelo cliente;
   - `ASSET`: arquivo recebido e com uso permitido;
   - `CLAIM_PENDING`: alegação sem comprovação anexada;
   - `HYPOTHESIS`: decisão provisória de estratégia;
   - `UNKNOWN`: dado ausente;
   - `FORBIDDEN`: informação que não deve ser publicada.
4. Registrar qualidade, proporção e melhor uso das imagens.
5. Separar conteúdo público de informação sensível ou desnecessária.

### Dados críticos

- nome público e profissão;
- serviço ou produto;
- público prioritário;
- CTA e canal de conversão;
- modalidade, cidade e área atendida;
- contato real;
- credenciais publicáveis;
- preços, condições e garantias, se a página os exibir;
- provas reais e autorização de uso;
- política de privacidade quando houver coleta.

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

### Regras para saúde e fitness

- Não diagnosticar pela página.
- Não garantir resultado, prazo corporal ou resposta clínica.
- Não moralizar alimentos, corpos, disciplina ou recaídas.
- Não usar medo de doença como motor principal de compra.
- Não publicar antes/depois ou depoimento sem validação ética, jurídica e consentimento; o padrão conservador é não usar.
- Não transformar um método comum em “exclusivo” ou “cientificamente comprovado” sem evidência específica.
- Diferenciar educação, consulta, acompanhamento e tratamento.

### G1: estratégia aprovada

- Existe uma única conversão primária.
- A promessa cabe nas provas existentes.
- O público entende para quem é, o que recebe e qual é o próximo passo.
- Fatos e hipóteses estão separados.
- Em HEALTH/FITNESS, a necessidade de revisão técnica, responsável e justificativa foi resolvida; não permanece indefinida.
- A aprovação, responsável e data foram registrados em `spec.yaml`.

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
- CTA descreve a ação real: “Agendar uma conversa” é melhor que “Transformar minha vida”.
- Prova aparece próxima à afirmação que sustenta.
- FAQ responde objeções reais; não repete propaganda.
- Dados pendentes permanecem visíveis como pendência interna, nunca disfarçados como verdade.

## Fase 4: direção de arte

### Método

1. Criar um fingerprint visual a partir do brief.
2. Selecionar uma rota primária em `04-DIRECOES-DE-ARTE.md`.
3. Selecionar no máximo duas referências visuais e registrar apenas os princípios extraídos.
4. Produzir duas rotas quando o modo for `GATED`; em `AUTO`, escolher uma e justificar.
5. Definir tokens funcionais, tipografia, grid, fotografia, iconografia e motion.

### G2: direção e conteúdo aprovados

- A sequência da página está ligada à estratégia.
- A copy não depende de afirmação pendente para funcionar.
- A direção não copia a identidade de uma referência.
- Desktop e mobile têm composição planejada.
- O orçamento de motion foi definido.
- A rota escolhida, responsável e data foram registrados em `spec.yaml`.

## Fase 5: blueprint técnico

### Seleção do acervo

Consultar `06-CATALOGO-ACERVO.md` e registrar para cada escolha:

- fonte;
- função no novo projeto;
- princípio aproveitado;
- implementação que será descartada;
- dependências;
- licença/procedência;
- fallback;
- custo de performance.

### Plano mínimo

- mapa de componentes;
- estrutura de arquivos e rotas;
- tokens;
- contratos de dados/conteúdo;
- estratégia de mídia;
- runtime principal de motion;
- comportamento sem JavaScript e com reduced motion;
- formulários e integrações, quando aplicáveis;
- operações de privacidade por finalidade e seus IDs nas integrações;
- SEO e dados estruturados;
- orçamento de performance;
- plano de testes.
- publish root e lista explícita de exclusões, incluindo `_project/**`.

### G3: blueprint aprovado

- Nenhuma dependência é carregada por hábito.
- Não existem classes globais ou resets copiados de snippets.
- Todos os assets têm origem e finalidade.
- Efeitos caros têm fallback e justificativa.
- O plano cabe no stack e no prazo do projeto.
- A aprovação, exceções e data foram registradas em `spec.yaml`.

## Fase 6: implementação

### Ordem recomendada

1. Estrutura semântica e rotas.
2. Tokens e estilos base.
3. Header, hero e CTA funcional.
4. Seções estáticas e conteúdo real.
5. Mecanismos de conversão aplicáveis e navegação.
6. Responsividade.
7. Progressive enhancement e motion.
8. SEO, schema e detalhes finais.

### Regras de implementação

- A página deve ser útil antes de adicionar motion.
- O hero não deve ocultar H1 ou CTA enquanto JavaScript carrega.
- Âncoras, botões e mecanismos de conversão aplicáveis devem apontar para destinos reais.
- Mídia não crítica e distante do viewport usa lazy loading; LCP e mídia quase visível não devem ser atrasados por uma regra automática.
- Um componente importado do acervo deve ser reescrito, escopado e testado no projeto atual.
- No perfil `STATIC`, usar caminhos relativos e arquivos compartilhados; evitar código inline gigantesco.
- Em projeto existente, seguir lint, formatação e padrões já instalados.

## Fase 7: QA e correção

Executar `09-CHECKLIST-QA.md`. O relatório deve conter evidências, não apenas afirmações.

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

Um protótipo pode ser entregue como `CONDITIONAL`, desde que esteja `noindex`, claramente identificado como não publicável e tenha pendências/riscos registrados em `handoff.md`.
