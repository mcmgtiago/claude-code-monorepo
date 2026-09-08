# Instruções do projeto — Premium Agency Site Kit

Este projeto é um kit mestre para criar landing pages e sites institucionais premium. Antes de executar qualquer projeto derivado deste kit, leia os documentos principais nesta ordem:

1. `00-LEIA-PRIMEIRO.md`
2. `02-PROMPT-MESTRE-COMPLETO.md`
3. `03-BRIEFING-CLIENTE.md`
4. `04-CHECKLIST-DE-QUALIDADE.md`
5. `05-MODULO-GREEN-HAT-AEC.md`, somente quando o projeto for da vertical Green Hat/AEC
6. `references/README.md` e, conforme a necessidade, os JSONs de referência

## Idioma

Responda sempre em português brasileiro. Código, nomes de variáveis, bibliotecas e APIs devem permanecer no idioma natural do stack.

## Regra de processo obrigatória

1. Em projeto novo, faça primeiro **nav + hero + 2ª seção** antes do restante da página.
2. Para apresentação inicial, implemente **4 variantes de hero realmente distintas**, alternáveis na própria página por seletor visível.
3. Aguarde aprovação da direção antes de expandir o restante, salvo se o usuário pedir explicitamente para seguir sem pausa.
4. Não invente clientes, resultados, depoimentos, números, certificações, localizações, metragens, prêmios ou provas comerciais.

## Skills globais que devem ser usadas neste kit

Use estas skills como ferramentas de qualidade, não como decoração. Quando uma situação abaixo ocorrer, invoque a skill correspondente antes de responder ou implementar.

### Estratégia visual e redesign

- `/design-taste-frontend` — use em landing pages, portfolios e redesigns para definir uma direção visual sem aparência de template. Deve orientar a leitura inicial do briefing e a proposta de linguagem visual.
- `/redesign-existing-projects` — use quando houver site/app existente para melhorar. Primeiro audite o que existe; depois preserve o que funciona e substitua o que está genérico.
- `/impeccable` — use para elevar craft, polish, layout, tipografia, UI, estados, responsividade e acabamento. Preferir em fases finais ou em páginas de alta importância.

### Tipografia

- `/audit-typography` — use quando já existir código/estilo para auditar hierarquia, escala, pesos, line-height, letter-spacing, carregamento e consistência.
- `/suggest-improvements` — use quando precisar recomendar pairing de fontes para o projeto. A recomendação deve considerar segmento, público, tom de marca e performance.

### Motion e interação

- `/find-animation-opportunities` — use antes de adicionar animações em massa. A skill deve filtrar com restrição: só sugerir movimento que melhore compreensão, hierarquia, feedback ou narrativa.
- `/improve-animations` — use para auditar o motion do projeto e gerar planos de melhoria detalhados. Não deve implementar por si só.
- `/review-animations` — use para revisar animações já implementadas, especialmente antes da entrega.
- `/animation-vocabulary` — use quando o usuário descrever um efeito sem saber o nome técnico, ou quando for necessário nomear uma mecânica de movimento com precisão.
- `/apple-design` — use em interações fluidas, sheets, drawers, gestures, momentum, springs, materiais translúcidos, profundidade e interfaces com sensação nativa.
- `/emil-design-eng` — use como lente de craft para microinterações, estados invisíveis, sensação de resposta e detalhes que fazem a UI “sentir certa”.

### Bibliotecas

- `/pick-ui-library` — use quando precisar escolher componente/biblioteca para dialog, popover, command menu, toast, OTP, drag-and-drop, charts, virtualization, state ou outras peças de UI. Verifique `package.json` antes de recomendar instalação.

## Fluxo recomendado com skills

### Fase 1 — Planejamento sem código

1. Inventariar material recebido e separar fatos, claims, ativos e lacunas.
2. Usar `/design-taste-frontend` para estabelecer a leitura visual quando o projeto for landing/portfolio/redesign.
3. Usar `/redesign-existing-projects` se houver site atual ou código existente.
4. Usar `/suggest-improvements` quando a tipografia não estiver definida.
5. Propor estrutura completa da página e 4 conceitos de hero distintos.
6. Aguardar aprovação.

### Fase 2 — Primeiro recorte construído

1. Implementar nav + seletor de hero + 4 variantes de hero + 2ª seção.
2. Usar `/find-animation-opportunities` para decidir onde o motion tem valor real.
3. Usar `/apple-design` e `/emil-design-eng` para calibrar springs, hover, feedback e sensação de resposta.
4. Validar mobile 375 px, tablet 768 px e desktop 1440 px.
5. Aguardar feedback quando o usuário estiver avaliando direção.

### Fase 3 — Expansão do site

1. Completar seções aprovadas.
2. Centralizar conteúdo em dados editáveis.
3. Modularizar componentes.
4. Implementar SEO técnico, acessibilidade essencial, formulários, CTAs e links reais.
5. Usar `/pick-ui-library` quando surgir uma necessidade de componente não trivial.

### Fase 4 — Refinamento e entrega

1. Usar `/audit-typography` para revisar escala, hierarquia e consistência.
2. Usar `/improve-animations` ou `/review-animations` para auditar motion.
3. Usar `/impeccable polish` ou `/impeccable audit` para o acabamento final.
4. Validar build, console, responsividade, SEO, formulários, links, placeholders e fidelidade ao briefing.

## Critério de qualidade

O resultado deve parecer autoral, específico ao cliente e pronto para apresentação comercial. Evite grids genéricos, copy vaga, animação sem motivo, excesso de efeitos, hero sem narrativa, cards repetidos sem função e layout que só funciona em desktop.
