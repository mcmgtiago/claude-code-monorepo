# D:\Claude Code — Workspace Centralizado

**Data de Organização**: 2026-07-31  
**Status**: ✅ Organização completa

---

## 📁 Estrutura

```
D:\Claude Code\
├── projects/              # 16 projetos em desenvolvimento
├── libraries/             # 5 bibliotecas e kits reutilizáveis
├── brands/                # Design systems e brand guidelines
├── _archive/              # Arquivos históricos e backups
├── _references/           # Pesquisa e configuração de ferramentas
├── _cleanup-residual.sh   # Script para limpar pastas travadas (após fechar VS Code)
├── README.md              # Este arquivo
└── 000-DIAGNOSTICO-ORGANIZACAO.md  # Detalhes técnicos da reorganização
```

---

## 🚀 PROJETOS (projects/)

### Web & Landing Pages
- **lp-eixo** — Landing page Eixo (Vite + React)
- **axion-studio** — Axion Studio (Vite + React)
- **dental-landing** — Landing page dentária (Vite + React)
- **pilar-rh** — PILAR RH (Vite + React + Supabase) — 3 heróis variantes
- **rh-consultoria-landing** — Landing RH Consultoria (Vite + React)
- **template-gallery** — Galeria de templates (Next.js)
- **nexus-rh** — NEXUS RH (projeto avançado)
- **green-hat** — Green Hat Project
- **bros-home-improvement** — Home Improvement Landing

### Automação & Ferramentas
- **ugly-dispatcher** — Despachador de emails (Node.js)
- **whatsapp-dispatcher** — Despachador WhatsApp (Node.js)
- **email-dispatcher** — Email SaaS (Node.js)
- **whatsapp-saas** — WhatsApp SaaS (Node.js)
- **build-lead-intelligence-ai** — Build Lead AI (Node.js)

### Vertical/Nicho
- **fisioterapia-pilates** — Landing + recursos para Fisio e Pilates
- **nutri** — Landing + recursos para Nutrição
- **velo** — Projeto Velo (CRM + legacy)

---

## 📚 BIBLIOTECAS (libraries/)

- **base-prompts-consultoria-rh** — 10 variantes de prompts para RH (HUMANTECH, People First, Stratego, etc.)
- **premium-agency-site-kit** — Kit premium com prompts, docs e checklist
- **lps-resources** — Recursos para landing pages
- **opendesign-media-library-plugin** — Plugin de mídia para Open Design
- **prompts-rh** — Biblioteca adicional de prompts RH

---

## 🎨 BRANDS (brands/)

- **brenda-ariel** — Brand guidelines, design tokens, paletas de referência
- **assets-generated** — Assets gerados (imagens, ícones)

---

## 📋 ARCHIVE (_archive/)

- **open-design-logs/** — 50+ arquivos JSON e ZIPs de histórico Open Design
- **legacy-scripts/** — Scripts e código-fonte antigo (dominante, create-projects, etc.)
- **backups/open-design-data-2026-07-29** — Backup SQLite completo do Open Design
- **nova-pasta/** — Projeto experimental/sketch (investigar depois)

---

## 🔧 REFERÊNCIAS (_references/)

- **icp-fisioterapia/** — ICP (Ideal Customer Profile) para Fisioterapia
- **icp-pilates/** — ICP para Pilates
- **cline-config/** — Configuração local de hooks, rules e workflows do Cline

---

## ⚡ Setup Rápido

### 1. Restaurar node_modules (em qualquer projeto)
```bash
cd projects/seu-projeto
npm install
```

### 2. Rodar um projeto (exemplos)
```bash
cd projects/pilar-rh
npm run dev  # Para Vite

cd projects/template-gallery
npm run dev  # Para Next.js

cd projects/whatsapp-dispatcher
node dispatcher.js  # Para Node.js puro
```

### 3. Limpar pastas residuais (após fechar VS Code)
```bash
bash _cleanup-residual.sh
```

---

## 📊 Estatísticas

- **16 projetos** em desenvolvimento
- **5 bibliotecas** reutilizáveis
- **2 design systems** (brenda-ariel + assets-generated)
- **3 arquivos** de configuração na raiz (agora organizado)
- **87 arquivos soltos** arquivados → 0 na raiz ✅
- **Espaço economizado**: ~500MB (node_modules removidos)

---

## 🎯 Próximos Passos

1. ✅ Organização concluída
2. [ ] Feche VS Code/Terminal
3. [ ] Execute `bash _cleanup-residual.sh`
4. [ ] Teste cada projeto com `npm install && npm run dev`
5. [ ] Atualize caminhos em scripts que referenciem locais antigos
6. [ ] Considere adicionar `.gitignore` global em `.claude/`

---

## 📝 Notas Importantes

- **Projetos em C:\Users\Administrator\Downloads** foram deixados lá (99GB de arquivos pessoais).
- **Projetos originais em Desktop/Documentos** ainda existem — você pode deletar manualmente após confirmar que as cópias estão funcionando.
- **node_modules** foram removidos de todos os projetos para economizar espaço. Execute `npm install` quando precisar rodar.
- **Backup do Open Design** foi arquivado em `_archive/backups/` — não é mais necessário, mas preservado.

---

**Gerado por Claude Code em 2026-07-31** 🤖
