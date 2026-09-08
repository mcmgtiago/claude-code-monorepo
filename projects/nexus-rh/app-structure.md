# Estrutura do Projeto NEXUS Landing Page

## Diretório
```
nexus-rh/
├── 01-briefing/
│   ├── empresa-nexus.md
│   └── PROMPT-01-visual-briefing-hero.md
├── 02-secoes/
│   ├── PROMPT-02 até PROMPT-09
│   ├── SECAO-01-HERO.tsx
│   ├── SECAO-02-TENSOES.tsx
│   ├── SECAO-03-FRENTES.tsx
│   ├── ... (até SECAO-09)
│   └── App.tsx (integrado)
├── 03-recursos/
│   ├── componentes-base.tsx
│   ├── dados-mock.ts
│   └── paleta-cores.css
└── 99-skill/
```

## Execução em Ordem
1. ✅ Briefing visual (Hero v1: Editorial Minimalista)
2. ⏳ Geração da landing page completa com as 9 seções
3. 📝 Salvar componentes em 02-secoes/
4. 🎨 Testar responsividade
5. ✅ Integrar tudo em um App.tsx final

## Stack Confirmado
- React 18 + TypeScript
- Tailwind CSS v4
- motion/react
- lucide-react
- react-hook-form + zod (para formulário)

## Paleta Visual Fixa
- Signal (verde): #2d6a4f
- Paper (fundo claro): #fafaf8
- Ink (texto): #1a1a1a
- Dark (seções escuras): #1a1a1a

## Fonts
- Manrope (sans)
- Instrument Serif (destaque)
- DM Mono (labels)
