# ✅ Checklist Final — NEXUS Landing Page

## 📋 Antes do Agente Terminar

- [x] Briefing visual definido (Hero v1: Editorial Minimalista)
- [x] 9 prompts estruturados e numerados
- [x] Componentes base criados e documentados
- [x] Dados mock centralizados
- [x] Paleta CSS definida
- [x] Referência de seções criada
- [x] Guia de integração preparado
- [x] Memória do projeto atualizada

---

## 🚀 Assim que o App.tsx chegar

### Etapa 1: Validar Código
- [ ] Verificar importações (React, motion, lucide, etc)
- [ ] Verificar TypeScript types
- [ ] Verificar se todas as 9 seções estão presentes
- [ ] Verificar CSS variables utilizadas

### Etapa 2: Setup Projeto
- [ ] Criar projeto Vite: `npm create vite@latest nexus-landing -- --template react-ts`
- [ ] Instalar deps: `npm install`
- [ ] Instalar tailwind: `npm install tailwindcss postcss autoprefixer`
- [ ] Instalar motion: `npm install motion/react`
- [ ] Instalar lucide: `npm install lucide-react`
- [ ] Instalar form: `npm install react-hook-form zod`

### Etapa 3: Configurar
- [ ] Copiar App.tsx para src/components/App.tsx
- [ ] Criar globals.css com CSS variables
- [ ] Configurar tailwind.config.ts
- [ ] Copiar fonts Google em index.html
- [ ] Verificar main.tsx importa App

### Etapa 4: Testar
- [ ] `npm run dev` → localhost:5173 ✅
- [ ] Navbar funciona ao scroll
- [ ] Hero carrega com SignalMap
- [ ] Todas as 9 seções visíveis
- [ ] Animações rodando suavemente
- [ ] Hover effects em cards
- [ ] Formulário valida com Zod
- [ ] Mobile responsivo (640px)
- [ ] Acessibilidade: tab/focus funcionando

### Etapa 5: Otimizar
- [ ] `npm run build` sem erros
- [ ] Bundle size < 350kb
- [ ] Web Vitals OK (LCP < 2.5s)
- [ ] Lighthouse score > 90
- [ ] Sem console errors
- [ ] SEO tags presentes

### Etapa 6: Deploy
- [ ] Escolher plataforma (Vercel / Netlify / Auto-hosted)
- [ ] Deploy do build
- [ ] Verificar em produção
- [ ] Testar em diferentes browsers
- [ ] Testar em diferentes devices

---

## 📱 Responsividade — Testar em:

**Mobile (320px - 640px):**
- [ ] Hero se adapta corretamente
- [ ] Navbar mobile com drawer
- [ ] Cards empilhados
- [ ] Formulário legível
- [ ] Sem horizontal scroll
- [ ] Touch-friendly buttons

**Tablet (640px - 1024px):**
- [ ] Layout intermediário
- [ ] 2 colunas onde possível
- [ ] Navbar horizontal parcial
- [ ] Cards em 2 filas

**Desktop (1024px+):**
- [ ] Layout completo com 3+ colunas
- [ ] Animações completas
- [ ] Hover effects
- [ ] Timeline sticky

---

## ♿ Acessibilidade — Validar:

- [ ] Headings hierárquicos (h1→h2→h3)
- [ ] Landmarks: `<nav>`, `<main>`, `<footer>`
- [ ] Focus-visible em todos os links/botões
- [ ] ARIA labels em ícones
- [ ] Contraste mínimo 7:1 (WCAG AAA)
- [ ] Keyboard navigation (tab, enter, escape)
- [ ] Screen reader testing (NVDA/JAWS)
- [ ] Color blind simulation (Deuteranopia)
- [ ] Reduced motion respeitado
- [ ] Form labels associadas a inputs

---

## 🎨 Visual — Verificar:

- [ ] Tipografia correta (Manrope, Instrument Serif, DM Mono)
- [ ] Paleta verde/preto consistente
- [ ] Alinhamentos e espaçamento
- [ ] Grid 12-col alinhado
- [ ] Seções com respiro adequado
- [ ] Hover states definidos
- [ ] Nenhum "AI tell" visual
- [ ] Nenhuma imagem genérica

---

## 📊 Performance — Medir:

**Lighthouse (Chrome DevTools):**
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90

**Web Vitals:**
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Cumulative Layout Shift (CLS) < 0.1

**Bundle:**
- [ ] JavaScript < 150kb gzipped
- [ ] CSS < 50kb gzipped
- [ ] Total < 350kb gzipped

---

## 🔐 SEO — Incluir:

- [ ] `<title>` no head
- [ ] `<meta description>` no head
- [ ] `<meta og:>` para social sharing
- [ ] JSON-LD schema.org (ProfessionalService)
- [ ] Canonical URL
- [ ] Mobile viewport meta tag
- [ ] Robots meta tag (index, follow)
- [ ] Sitemap.xml (se houver múltiplas páginas)

---

## 🔗 Links Internos — Verificar:

- [ ] Navbar links funcionam (#secao-xxx)
- [ ] Scroll smooth ao clicar
- [ ] Links no footer funcionam
- [ ] CTA buttons levam para formulário
- [ ] Sem broken links

---

## 📧 Formulário — Testar:

- [ ] Validação de email
- [ ] Validação de campos obrigatórios
- [ ] Mensagens de erro claras
- [ ] Estado de loading ao enviar
- [ ] Estado de sucesso após envio
- [ ] Checkbox de consentimento
- [ ] Select de tamanho funciona
- [ ] Textarea aceita múltiplas linhas

---

## 🎬 Animações — Validar:

- [ ] Reveal ao scroll (fade-up + blur)
- [ ] WordReveal na headline (stagger)
- [ ] Hover effects em cards
- [ ] AnimatePresence na troca de seções
- [ ] MetricTicker conta até o valor
- [ ] Timeline progride ao scroll
- [ ] Transições suaves em modals
- [ ] Smooth scroll em links

---

## 🚀 Deploy — Final:

- [ ] Domínio registrado (se for próprio)
- [ ] SSL/HTTPS configurado
- [ ] CDN configurado (Cloudflare, AWS CloudFront)
- [ ] Cache headers configurados
- [ ] 404 page custom
- [ ] Redirects configurados
- [ ] Analytics integrado
- [ ] Form submissions chegando
- [ ] Monitoramento em tempo real (Sentry, LogRocket)

---

## 📝 Documentação — Antes de Entregar:

- [ ] README.md com instruções
- [ ] CONTRIBUTING.md se for open source
- [ ] Changelog.md
- [ ] License escolhido
- [ ] Componentes documentados (JSDoc)
- [ ] Types exportados corretamente

---

## ✨ Polish Final:

- [ ] Sem console.logs em produção
- [ ] Sem commented code
- [ ] Sem TODO comentários deixados
- [ ] Imports organizados
- [ ] Nomes de variáveis descritivos
- [ ] Sem warnings em build
- [ ] Code formatado (Prettier)
- [ ] Linted (ESLint)

---

## 🎉 Pronto para Produção!

✅ Todas as caixas marcadas = Landing page NEXUS pronta para o mundo! 🚀
