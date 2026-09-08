---
slug: consalt
nome: Consalt Consultancy & Business
nicho: Consultoria, Agências, Business Services, Fintech Moderno
estilo: React moderno, Tailwind, GSAP, 10 variantes de layout
qualidade: 8
paleta_principal: ["#6366f1", "#10b981", "#f97316", "variável por tema"]
fonte_titulo: Sistema, custom
fonte_corpo: Sistema, custom
densidade_secoes: média-alta
uso_recomendado: Agências, consultoria, SaaS B2B, fintechs que querem componentes reutilizáveis, qualquer nicho que queira React
limitacoes: Exige npm build, precisa de Node.js, não é HTML estático. Copy genérico (React placeholders).
stack: React 18 + Vite + Tailwind CSS 3.4 + GSAP + Swiper + React Router
source: C:/Users/Administrator/Downloads/envato_LV9Z9DE/Consalt-Buyerfile/consalt/
---

# Consalt — React Consultancy & Business Template

Template React moderno (Vite) voltado para consultoria, agências e SaaS. **Diferencial principal:** 10 variantes de layout (Component1/2/3/4 × Classic/Dark/Default), componentes modulares reutilizáveis, e stack Javascript moderno (React + Tailwind + GSAP).

## Tecnologia

- **React 18.3.1** — JSX components
- **Vite 5.3.4** — Fast dev server + build
- **Tailwind CSS 3.4.7** — Utility-first CSS
- **GSAP 3.12.5** — Animações premium
- **React Router 6.25.1** — Multi-page routing
- **Swiper 11.1.9** — Sliders/carousels
- **React Icons 5.2.1** — Iconografia
- **AOS 2.3.4** — Scroll animations
- **React CountUp 6.5.3** — Contadores animados

## Páginas/Variantes Disponíveis

```
src/
├── Component1Classic/   → Tema clássico
├── Component1Dark/      → Tema escuro
├── Component1Default/   → Tema padrão
├── Component2Classic/   → Variante 2 clássica
├── Component2Dark/      → Variante 2 escura
├── Component2Default/   → Variante 2 padrão
├── Component3/          → Variante 3 (simplificada)
├── Component4Classic/   → Variante 4 clássica
├── Component4Dark/      → Variante 4 escura
└── Component4Default/   → Variante 4 padrão
```

## Componentes Principais

### Seções Mapeadas

Cada variante inclui:

1. **Banner/Hero** — Headline + CTA + visual
2. **Feature** — Grid de features com cards
3. **Service** — Serviços em cards (ServiceCard.jsx)
4. **About** — Sobre a empresa
5. **Team** — Time com TeamCard.jsx
6. **Pricing** — Tabela de preços (Pricing.jsx)
7. **Process** — Steps/workflow (ProcessCard.jsx)
8. **Counter** — Estatísticas animadas (CounterCard.jsx)
9. **Blog** — Artigos (BlogCard.jsx)
10. **Contact** — Contato (ContactCard.jsx)
11. **LatestWork** — Portfolio/case studies (LatestWorkCard.jsx)
12. **ContentSlider** — Carousel customizado
13. **Brand** — Logos de clientes

### Componentes Reutilizáveis

- `ServiceCard.jsx` — Card de serviço
- `FeatureCard.jsx` — Card de feature
- `TeamCard.jsx` — Membro do time
- `ProcessCard.jsx` — Passo do processo
- `CounterCard.jsx` — Estatística animada
- `BlogCard.jsx` — Post de blog
- `ContactCard.jsx` — Info de contato
- `LatestWorkCard.jsx` — Item de portfolio

## Recursos Visuais

- **10 layouts diferentes** — Component1-4 × Classic/Dark/Default
- **Animações GSAP** — Smooth, GPU-accelerated
- **Tailwind CSS** — Utility-first, dark mode ready
- **Responsive mobile-first** — Media queries integradas
- **Swiper carousels** — Sliders interativos
- **React Icons** — 50+ ícones prontos

## Diferenciais

✅ **Modular** — Componentes reutilizáveis importáveis  
✅ **10 variantes** — Para A/B testing ou multi-brand  
✅ **React modern** — Vite + JSX, não template string  
✅ **Animações** — GSAP integration nativa  
✅ **Desenvolvimento ágil** — Hot reload com Vite  

## Limitações

❌ Exige `npm install` + `npm run build`  
❌ Copy genérico — precisa reescrita  
❌ Não é plug-and-play HTML (precisa dev React)  
❌ Node.js + npm obrigatórios  
❌ Deploy diferente (build → output static)  

## Stack Comparativo

| Aspecto | Consalt (React) | Outros (HTML) |
|---------|---|---|
| Desenvolvimento | Rápido, modular | Estático, simples |
| Build | npm run build | Nenhum (copy HTML) |
| Componentes | Reutilizáveis (.jsx) | Inline HTML |
| Animações | GSAP nativo | GSAP via <script> |
| Deploy | SPA ou SSG | Estático puro |
| Manutenção | Centralizada em .jsx | Espalhada em .html |
| Time skills | React, Node.js | HTML/CSS/JS vanilla |

## Casos de Uso

- ✅ Agência que quer biblioteca de componentes
- ✅ SaaS B2B que quer landing modernas rapidamente
- ✅ Fintech que quer reutilizar componentes entre projetos
- ✅ Consultoria que quer manter um design system
- ✅ Time React que prefere framework próprio
- ❌ Projeto sem dev React (exige frontend)
- ❌ Hostagem estática básica (precisa build)

## Qualidade: 8/10

**Pontos fortes:**
- 10 layouts prontos
- Componentes modulares
- Stack moderno (React + Vite)
- Animações nativas
- Muito espaço pra customização
- Dark mode nativo

**Pontos fracos:**
- Precisa de build/dev
- Copy placeholder
- Não é HTML estático (não pra não-devs)
- Jinja complexity se não sabe React

## Recomendação

**Use Consalt se:**
- Você tem dev React no time
- Quer reutilizar componentes entre clientes
- Quer manter biblioteca/design system
- Fintech/SaaS que evolui rápido

**Use templates HTML se:**
- Quer plug-and-play (copy → go)
- Sem dev React
- Deploy estático simples (Netlify/Vercel)
