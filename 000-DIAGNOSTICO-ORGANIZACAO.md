# Diagnóstico de Organização de Projetos
**Data**: 2026-07-31  
**Status**: Mapeamento completo realizado

---

## 1. ARQUIVOS SOLTOS EM D:\Claude Code (87 arquivos no raiz)

### Categorias encontradas:

**A) Logs e Dados de Open Design** (30+ arquivos)
- `open-design-*.json` — projetos, status, arquivos
- `open-design-diagnostics-*.zip` — backups diagnósticos
- `open-design-rh-*.json` — dados de execução RH
- Recomendação: **ARQUIVAR** em `_archive/open-design-logs/`

**B) Código Fonte de Projetos** (5 arquivos)
- `dominante-source.jsx` — código-fonte do projeto DOMINANTE
- `dominante-compiled.js` — versão compilada
- `dominante-jsx-check.jsx` — verificação
- `complete-dominante-fallback.py` — fallback Python
- Recomendação: **MOVER** para `projects/dominante-agencia/src/` ou pasta dedicada

**C) Scripts de Automação** (2 arquivos)
- `create-10-projects.sh` — gerador de projetos
- `final-run-all.sh` — executor final
- Recomendação: **MOVER** para `_scripts/` ou `utils/`

**D) Documentação Técnica** (3 arquivos)
- `PREMIUM-LANDING-SKILL-SETUP.md` — setup de skill
- Vários `.md` — docs de projetos
- Recomendação: **MOVER** para `_docs/` com estrutura por projeto

**E) Bases de Dados e Configuração**
- `.mcp.json` — config MCP
- Recomendação: **MOVER** para `.claude/` ou `config/`

---

## 2. PROJETOS EM D:\Claude Code (14 pastas de projetos)

### Projetos Estruturados (têm package.json + node_modules)
1. **LP-Eixo** — Landing page Eixo (Vite + React + TypeScript)
2. **axion-studio** — Studio Axion (Vite + React)
3. **dental-landing** — Landing dentária (Vite + React)
4. **pilar-rh** — PILAR RH (Vite + React + Supabase) ✓ Documentado na memória
5. **rh-consultoria-landing** — Landing RH Consultoria (Vite + React)
6. **template-gallery** — Galeria de templates (Next.js)

### Pastas de Recursos/Biblioteca (sem package.json)
7. **base-prompts-consultoria-rh** — Biblioteca de prompts RH (10 variantes)
8. **prompts-rh** — Pasta vazia (candidata a remover ou consolidar)
9. **template-gallery** — Kit de templates premium

### Plugins/Extensões
10. **opendesign-media-library-plugin** — Plugin de mídia Open Design

### Automação
11. **ugly-dispatcher** — Despachador de emails (Node.js)
12. **whatsapp-dispatcher** — Despachador WhatsApp (Node.js)

### Documentação/Especificação
13. **premium-agency-site-kit** — Kit com docs e prompts (ZIP + MDs)
14. **generated-assets** — Assets gerados (pastas vazias ou testes)
15. **lps-rs** — Landing pages resources (pasta com subpastas)

---

## 3. PROJETOS ESPALHADOS EM OUTROS LOCAIS

### C:\Users\Administrator\Documents\

#### brenda-ariel-brand/
- Arquivos de brand guidelines e design tokens
- **Status**: Documentação/referência pura
- **Ação**: Mover para `D:\Claude Code\brands\brenda-ariel/` ou `_references/brands/`

#### nexus-rh/
- Projeto bem estruturado com README, guias, landing/
- **Status**: Projeto em estágio avançado
- **Ação**: Mover para `D:\Claude Code\projects\nexus-rh/`

#### web/
- 2 subprojetos: `bros-home-improvement` (HTML estático) e `green-hat` (com ZIP)
- **Status**: Projetos web incompletos
- **Ação**: Mover para `D:\Claude Code\projects\` individualizados

#### Cline/ (Documentos\Cline)
- Hooks, Rules, Workflows — configuração de tools
- **Status**: Configuração local de ferramenta
- **Ação**: Deixar em Documentos ou mover para `.claude/tools/`

### C:\Users\Administrator\Desktop\

#### Fisioterapia & Pilates/
- Projeto estruturado com AGENTS.md, pastas de ICP, modelos, recursos
- **Status**: Projeto completo
- **Ação**: Mover para `D:\Claude Code\projects\fisioterapia-pilates/`

#### Nutri/
- Similar a Fisioterapia — estrutura de projeto
- **Status**: Projeto completo
- **Ação**: Mover para `D:\Claude Code\projects\nutri/`

#### Velo/
- Pastas CRM e old
- **Status**: Projeto experimental/arquivado
- **Ação**: Mover para `D:\Claude Code\projects\velo/` ou `_archive/velo/`

#### Softwares/
- BuildLeadIntelligenceAI, Email, Whatsapp (3 projetos Node.js com package.json)
- **Status**: Projetos em desenvolvimento
- **Ação**: Mover para `D:\Claude Code\projects/` individualizados

#### Nova pasta/
- 3 subpastas: barra, carrocerto, mae
- **Status**: Desconhecido — parece teste/sketch
- **Ação**: Inspecionar e categorizar ou arquivar

#### backup-open-design-data-2026-07-29/
- Backup completo do Open Design (SQLite, artifacts, etc.)
- **Status**: Backup — não é projeto ativo
- **Ação**: Arquivar em `D:\Claude Code\_archive\backups/`

### C:\Users\Administrator\Downloads/
- **99GB** de arquivos diversos (PDFs, vídeos, imagens)
- **Status**: Arquivos pessoais/referência
- **Ação**: **NÃO MOVER** — deixar onde está; apenas catalogar se necessário

---

## 4. ESTRUTURA PROPOSTA

```
D:\Claude Code\
│
├── projects/                         # Projetos ativos em desenvolvimento
│   ├── pilar-rh/                    # ✓ Já existe
│   ├── axion-studio/                # ✓ Já existe
│   ├── lp-eixo/                     # Renomeado: LP-Eixo → lp-eixo
│   ├── dental-landing/              # ✓ Já existe
│   ├── rh-consultoria-landing/      # ✓ Já existe
│   ├── template-gallery/            # ✓ Já existe
│   ├── nexus-rh/                    # Movido de Documentos/
│   ├── fisioterapia-pilates/        # Movido de Desktop/
│   ├── nutri/                       # Movido de Desktop/
│   ├── velo/                        # Movido de Desktop/ (ou arquivar)
│   ├── build-lead-intelligence-ai/  # Movido de Desktop/Softwares/
│   ├── email-dispatcher/            # Movido de Desktop/Softwares/
│   ├── whatsapp-dispatcher/         # ✓ Já existe
│   ├── ugly-dispatcher/             # ✓ Já existe
│   ├── bros-home-improvement/       # Movido de Documentos/web/
│   └── green-hat/                   # Movido de Documentos/web/
│
├── libraries/                        # Bibliotecas e kits reutilizáveis
│   ├── base-prompts-consultoria-rh/ # ✓ Já existe
│   ├── premium-agency-site-kit/     # ✓ Já existe
│   ├── opendesign-media-library-plugin/  # ✓ Já existe
│   └── lps-resources/               # Renomear: lps-rs → lps-resources
│
├── brands/                          # Brand guidelines e design systems
│   ├── brenda-ariel/                # Movido de Documentos/
│   └── generated-assets/            # ✓ Já existe
│
├── _archive/                        # Arquivos/projetos archivados
│   ├── open-design-logs/            # Logs Open Design (.json, .zip)
│   ├── backups/                     # Backups (SQLite, etc.)
│   ├── velo-old/                    # Se arquivar Velo
│   └── nova-pasta/                  # Investigar e arquivar
│
├── _scripts/                        # Scripts de automação
│   ├── create-projects.sh           # create-10-projects.sh
│   ├── run-all.sh                   # final-run-all.sh
│   └── utils/
│
├── _docs/                           # Documentação central
│   ├── SETUP.md                     # Instruções de setup
│   ├── PROJECTS.md                  # Catálogo de projetos
│   ├── PROMPTS.md                   # Prompts mestres
│   └── premium-agency-kit/          # Docs do kit
│
├── _references/                     # Referências e pesquisa
│   ├── design-systems/              # Design systems
│   ├── icp-fisioterapia/            # ICP para Fisio
│   ├── icp-pilates/                 # ICP para Pilates
│   └── modelos-codigo/              # Modelos de código reutilizável
│
├── config/                          # Configurações globais
│   ├── .mcp.json
│   ├── .claude/                     # ✓ Já existe
│   └── ...
│
└── README.md                        # Índice principal
```

---

## 5. AÇÕES RECOMENDADAS (POR PRIORIDADE)

### FASE 1: Arquivar soltos (não-destrutivo)
1. Criar `D:\Claude Code\_archive/` com subpastas
2. Mover 87 arquivos soltos em categorias:
   - `_archive/open-design-logs/` (30+ JSONs e ZIPs)
   - `_archive/backups/` (SQLite backup)
   - `_archive/scripts-legacy/` (se houver scripts antigos)
3. Tempo estimado: **15 min**

### FASE 2: Consolidar projetos (com renomeação)
1. Renomear pastas para kebab-case consistente:
   - LP-Eixo → lp-eixo
   - axion-studio → axion-studio ✓ OK
   - dental-landing → dental-landing ✓ OK
   - etc.
2. Mover de outros locais para `D:\Claude Code\projects/`
3. Tempo estimado: **30 min** (com testes de integridade)

### FASE 3: Organizar bibliotecas
1. Consolidar `prompts-rh` vazio com `base-prompts-consultoria-rh` (se duplicado)
2. Mover para `D:\Claude Code\libraries/`
3. Tempo estimado: **10 min**

### FASE 4: Documentação
1. Gerar `D:\Claude Code\README.md` com catálogo
2. Gerar `D:\Claude Code\_docs/PROJECTS.md` com resumo de cada projeto
3. Criar `.claude/MEMORY.md` atualizado
4. Tempo estimado: **20 min**

---

## 6. RISCOS IDENTIFICADOS

⚠️ **Alto Risco:**
- `pilar-rh` tem caminhos relativos em scripts — testar após mover
- `template-gallery` está com `.next/` grande — limpar antes de mover
- Projetos em Desktop/Softwares podem ter dependências locais

⚠️ **Médio Risco:**
- `nexus-rh` tem pasta `landing/` interna — preservar estrutura
- `green-hat` tem `.zip` grande — verificar antes de mover

✅ **Baixo Risco:**
- Projetos Vite/Next.js são portáveis (node_modules reconstruíveis)
- Brand guidelines são estáticos (seguro mover)

---

## 7. PRÓXIMOS PASSOS

1. Você quer que eu **proceda com as ações** ou **revise primeiro**?
2. Quer que eu **teste cada projeto após mover** (rodar `npm install && npm run dev`)?
3. Quer que eu **delete `node_modules`** antes de mover (reduz tamanho 70%)?
4. Deve gerar **manifesto de migração** (log de tudo que foi movido)?

