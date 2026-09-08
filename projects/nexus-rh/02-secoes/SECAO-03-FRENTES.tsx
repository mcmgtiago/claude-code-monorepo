# Seção 03 — Frentes de Atuação

## Status: ⏳ Prompt ainda não criado

## O que vai ter aqui

Seletor interativo com as 3 frentes da NEXUS:

1. **People OS** — Diagnóstico e redesenho do sistema operacional de gente
2. **Liderança em Escala** — Programa para primeira e segunda linha de gestão
3. **Cultura por Desenho** — Tradução de valores em comportamentos observáveis

## Estrutura esperada

- Desktop: Lista vertical à esquerda + painel visual à direita
- Mobile: Accordion (apenas uma frente aberta por vez)
- Cada item clicável muda conteúdo e visual

## Próximo passo

O prompt desta seção será criado em breve. Por enquanto, você pode:

1. **Gerar manualmente:** Chame `/design-taste-frontend` ou `/impeccable craft` e peça:

```
Crie uma seção de "Frentes de Atuação" para a NEXUS People Strategy, uma consultoria de estratégia de pessoas.

[cole o briefing de 01-briefing/empresa-nexus.md]

A seção deve ter:
- Section Label: "03 / FRENTES DE ATUAÇÃO"
- Headline: "Não vendemos pacotes. Construímos sistemas que a operação sustenta."
- 3 frentes (People OS, Liderança em Escala, Cultura por Desenho) como seletor interativo
- Desktop: lista vertical + painel visual
- Mobile: accordion
- Dados mock das 3 frentes estão em 03-recursos/dados-mock.ts (export const services)
- Stack: React 18 + Tailwind v4 + motion + Lucide
- Paleta: var(--paper), var(--ink), var(--signal)
- Reveal + AnimatePresence na troca de painel
```

2. **Aguardar:** Posso gerar o prompt completo em outra iteração

## Critérios de aceite

- [ ] Section Label com índice "03"
- [ ] Headline com destaque em serif itálica
- [ ] 3 frentes listadas como seletor
- [ ] Painel visual à direita (desktop) ou abaixo (mobile)
- [ ] AnimatePresence com fade + slide na troca
- [ ] Cada frente mostra: número, título, descrição, lista de outcomes
- [ ] Mobile: vira accordion
- [ ] Reduced motion respeitado