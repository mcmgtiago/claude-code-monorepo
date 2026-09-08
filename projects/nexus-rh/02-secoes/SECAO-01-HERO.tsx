# Seção 01 — HERO

## Status: ⏳ Aguardando execução do PROMPT #1

## Versão escolhida (preencher): [1 / 2 / 3]

## O que vai ter aqui

O código React/TSX da seção Hero com:

- Navbar fixa (transparente no topo, muda ao rolar)
- Headline com WordReveal
- Subheadline
- CTAs (MagneticButton primário + outline secundário)
- SignalMap SVG (visualização proprietária)
- Microcopy
- Eyebrow com label "01 / ESTRATÉGIA DE PESSOAS"

## Após gerar

1. Copie o código do agente para este arquivo (substitua o conteúdo)
2. Renomeie para `.tsx`
3. Teste com `npm run dev`
4. Integre ao `App.tsx` no final

## Estrutura de pastas esperada

```
src/
├── components/
│   ├── Reveal.tsx          ← já criado em 03-recursos/
│   ├── WordReveal.tsx      ← já criado
│   ├── MagneticButton.tsx  ← já criado
│   ├── SignalMap.tsx       ← já criado
│   ├── MetricTicker.tsx    ← já criado
│   ├── Navbar.tsx          ← a ser criado
│   └── Hero.tsx            ← este arquivo
└── App.tsx
```

## Dependências para o Hero

- `lucide-react` para ícones (ArrowUpRight, etc)
- `motion` para animação
- React 18 + TypeScript

## Critérios de aceite

- [ ] Navbar muda de transparente para cápsula clara ao rolar (após 60px)
- [ ] Hero responsivo (mobile, tablet, desktop)
- [ ] Headline com palavra de destaque em serif itálica verde
- [ ] SignalMap funcional em SVG (sem imagem raster)
- [ ] CTAs funcionando (primário abre modal de diagnóstico ou smooth scroll)
- [ ] Reveal + WordReveal disparando ao entrar em viewport
- [ ] Reduced motion respeitado
- [ ] Acessibilidade: h1 único, landmarks, focus-visible

---

**Próximo passo:** Abra `01-briefing/PROMPT-01-visual-briefing-hero.md`, copie o prompt inteiro, e execute em um chat com `/design-taste-frontend`.