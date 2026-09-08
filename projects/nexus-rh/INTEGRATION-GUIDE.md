# 🚀 Guia de Integração — NEXUS Landing Page

## Status da Geração

⏳ **Agente está gerando:** `App.tsx` com todas as 9 seções integradas

---

## Próximos Passos (assim que o código chegar)

### 1️⃣ Criar Projeto React

```bash
npm create vite@latest nexus-landing -- --template react-ts
cd nexus-landing
npm install
```

### 2️⃣ Instalar Dependências

```bash
npm install tailwindcss postcss autoprefixer motion/react lucide-react react-hook-form zod
npx tailwindcss init -p
```

### 3️⃣ Configurar Tailwind (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

### 4️⃣ Criar globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --paper: #fafaf8;
  --paper-strong: #ffffff;
  --paper-muted: #f0eeea;
  --ink: #1a1a1a;
  --ink-soft: #4a4a4a;
  --ink-muted: #7a7a7a;
  --signal: #2d6a4f;
  --signal-light: #40916c;
  --signal-pale: #d8f3dc;
  --signal-deep: #1b4332;
  --tension: #d4622c;
  --tension-pale: #f4d5c9;
  --line: rgba(26, 26, 26, 0.12);
  --line-dark: rgba(255, 255, 255, 0.12);
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}

body {
  font-family: var(--font-sans);
  color: var(--ink);
  background: var(--paper);
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: var(--signal);
  color: white;
}
```

### 5️⃣ Estrutura de Arquivos

```
src/
├── components/
│   ├── base/
│   │   ├── Reveal.tsx
│   │   ├── WordReveal.tsx
│   │   ├── MagneticButton.tsx
│   │   ├── MetricTicker.tsx
│   │   ├── SignalMap.tsx
│   │   ├── AccordionItem.tsx
│   │   └── SectionLabel.tsx
│   ├── sections/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Tensions.tsx
│   │   ├── Services.tsx
│   │   ├── Method.tsx
│   │   ├── Cases.tsx
│   │   ├── Formats.tsx
│   │   ├── Testimonials.tsx
│   │   ├── FAQ.tsx
│   │   ├── CTA.tsx
│   │   └── Footer.tsx
│   └── App.tsx (integrado)
├── data/
│   ├── mock.ts (todos os dados)
│   └── types.ts (TypeScript types)
├── styles/
│   └── globals.css
├── main.tsx
└── index.html
```

### 6️⃣ Copiar o Código Gerado

O agente vai gerar:
- `App.tsx` — Componente raiz com todas as seções
- Componentes de base (já inclusos ou separados)
- Dados mock (já inclusos ou em arquivo separado)

**Cole em:** `src/components/App.tsx`

### 7️⃣ Iniciar o Projeto

```bash
npm run dev
```

✅ Landing page está rodando em `http://localhost:5173`

---

## Customizações Pós-Geração

### Mudar Cores

Editar `:root` no `globals.css` ou no componente App.tsx:

```css
--signal: #sua-cor-aqui;
--signal-light: #sua-cor-clara;
```

### Conectar Formulário a API

Editar a seção CTA (`Section09` ou `CTA.tsx`):

```typescript
const onSubmit = async (data) => {
  // POST para sua API
  const res = await fetch('https://api.seu-dominio.com/leads', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  })
  // Handle response
}
```

### Adicionar Analytics

Em `main.tsx`:

```typescript
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

useEffect(() => {
  // Google Analytics, Segment, etc
  gtag.pageview({
    page_path: location.pathname,
    page_title: document.title,
  })
}, [location])
```

### Smooth Scroll

Adicionado automaticamente com motion/react. Para links internos:

```typescript
<a href="#secao-tensoes" className="scroll-smooth">
  Ir para Tensões
</a>
```

---

## Deploy

### Vercel (recomendado)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Arrastar pasta 'dist' no Netlify Dashboard
```

### Self-hosted (Node.js)

```bash
npm run build
node -e "const http = require('http'); const fs = require('fs'); const mime = require('mime-types'); const server = http.createServer((req, res) => { const file = req.url === '/' ? 'dist/index.html' : 'dist' + req.url; fs.readFile(file, (err, data) => { res.writeHead(200, {'Content-Type': mime.lookup(file)}); res.end(data || ''); }); }); server.listen(3000);"
```

---

## Checklist Final

- [ ] Código React gerado e salvo em `src/components/App.tsx`
- [ ] Dependências instaladas (`npm install`)
- [ ] `globals.css` com variáveis CSS criado
- [ ] `tailwind.config.ts` configurado
- [ ] Fonts Google carregadas
- [ ] `npm run dev` iniciado com sucesso
- [ ] Landing page renderiza em `localhost:5173`
- [ ] Navbar fixa funciona ao scroll
- [ ] Todas as 9 seções visíveis
- [ ] Animações rodando suavemente
- [ ] Responsivo em mobile (640px)
- [ ] Formulário valida com Zod
- [ ] Acessibilidade testada (tab, focus)
- [ ] Build otimizado: `npm run build`
- [ ] Deploy em produção

---

## Suporte

**Problema:** Animações lentas
**Solução:** Desativar em `prefers-reduced-motion`

**Problema:** Formulário não valida
**Solução:** Verificar `zod` version compatibility

**Problema:** Cores não aparecem
**Solução:** Verificar Tailwind content paths

---

## Performance

🎯 **Web Vitals Target:**
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

**Otimizações incluídas:**
- ✅ Code splitting automático (Vite)
- ✅ SVG inline (sem requests)
- ✅ CSS variables (sem duplication)
- ✅ Motion.js (GPU accelerated)
- ✅ Lazy loading de seções (ao viewport)

---

## Roadmap Pós-Launch

1. **Blog/Insights** — Adicionar rota `/blog`
2. **CMS** — Integrar Sanity ou Strapi
3. **Email** — Resend ou SendGrid para formulário
4. **Analytics** — Mixpanel, Amplitude ou GA4
5. **A/B Testing** — Optimizely ou VWO
6. **Dark Mode** — Tailwind dark mode

---

**Gerada em:** 2026-07-30  
**Versão:** 1.0 (NEXUS People Strategy)
