# CORA (Psicologia)

**AI Operating System para Psicólogos.** 10 skills para documentação clínica, triagem, avaliação de risco, formulação de caso e gestão de consultório.

Para começar: `/clinic-setup`

---

## ✅ O que você consegue fazer

### Jornada Clínica Completa

| Skill | O que faz | Tempo economizado |
|-------|-----------|-------------------|
| `/clinic-setup` | Configura o sistema para SUA prática | 20 min (1x) |
| `/client-intake` | Triagem de paciente novo + scoring + red flags | 30min → 10min |
| `/session-notes` | Evolução pós-sessão (SOAP, narrativa, compact) | 15min → 2min |
| `/treatment-plan` | Plano terapêutico com objetivos SMART | 45min → 15min |
| `/case-formulation` | Formulação clínica (TCC, psicodinâmica, humanista, sistêmica) | 20min → 5min |
| `/risk-assessment` | Avaliação de risco estruturada (C-SSRS) | Protocolo completo |
| `/progress-tracker` | Evolução ao longo do tempo + recomendação | Auto-gerado |
| `/discharge-summary` | Resumo de alta / encerramento de caso | 30min → 10min |
| `/supervision-prep` | Preparação para supervisão clínica | 20min → 5min |
| `/content-creator` | Posts psicoeducativos (Instagram, LinkedIn) | 3 posts em 15min |

---

## 🗺️ Workflow — Jornada do Paciente

```
Novo paciente → /client-intake (triagem)
                     │
          ACEITAR ───┼─── REFERIR (sai)
                     │
               Sessão 1 → /session-notes
                     │
             Sessão 3-5 → /case-formulation + /treatment-plan
                     │
         Sessões regulares → /session-notes (cada sessão)
                     │
           Se risco → /risk-assessment
                     │
          Trimestral → /progress-tracker
                     │
              Alta → /discharge-summary
```

---

## 🏛️ Arquitetura — 3 Engines

| Engine | Skills | Objetivo |
|--------|--------|----------|
| **Intake** | clinic-setup, client-intake | Configurar + qualificar pacientes |
| **Clínico** | session-notes, treatment-plan, case-formulation, risk-assessment, progress-tracker, discharge-summary | Documentação profissional completa |
| **Profissional** | supervision-prep, content-creator | Desenvolvimento + marketing |

---

## 🚀 Começar em 5 Minutos

```bash
# 1. Instalar plugin
claude --plugin-dir ./cora-aios

# 2. Configurar
/clinic-setup

# 3. Usar
/session-notes Maria
```

---

## 📚 References Incluídas

| Arquivo | Conteúdo |
|---------|----------|
| `references/clinical-scales.md` | PHQ-9, GAD-7, BDI-II, C-SSRS, PCL-5, K-10 — itens, scoring, cutoffs |
| `references/dsm5-categories.md` | CID-10/DSM-5 — ansiedade, depressão, personalidade, trauma |
| `references/intervention-library.md` | 50+ técnicas por abordagem: TCC, psicodinâmica, humanista, sistêmica, 3ª onda |

---

## 🔒 Segurança & Ética

- ✅ Dados de paciente **NUNCA** saem da sua máquina
- ✅ Todo output clínico é **rascunho** — você assina antes de usar
- ✅ Sigilo profissional (CFP Art. 9º + LGPD)
- ✅ Safety guard bloqueia exposição acidental de dados
- ✅ Audit trail (`data/audit-log.md`) para compliance
- ✅ Posts nunca parecem terapia individual (sempre psicoeducativo)
- ✅ Risk assessment com log obrigatório

---

## 📋 Estrutura de Pastas (Após Setup)

```
context/
├── my-clinic.md           # Identidade + especialidades + CRP
├── my-voice.md            # Tom de comunicação
├── my-icp.md              # Paciente ideal
├── practice-rules.md      # Compliance + políticas
└── tools-stack.md         # Ferramentas usadas

data/
├── patients/              # Prontuários (CONFIDENCIAL — nunca em git)
│   └── maria-silva.md     # Um arquivo por paciente
├── audit-log.md           # Log de ações sensíveis
└── content-calendar.md    # Posts planejados

deliverables/
└── exports/               # PDFs, posts gerados
```

---

## 📖 Onboarding — Primeiras 4 Semanas

**Semana 1**: `/clinic-setup` → `/client-intake` (1 paciente novo de teste)

**Semana 2**: `/session-notes` após cada sessão (sentir o ganho de tempo)

**Semana 3**: `/treatment-plan` + `/case-formulation` para 1 paciente

**Semana 4**: `/content-creator` (3 posts) + `/progress-tracker` (1 revisão)

---

## ⚖️ Disclaimer

Este sistema é uma **ferramenta de produtividade**, não um PEP certificado.

✅ Rascunhos de notas, planos, formulações
✅ Estruturação de avaliações de risco
✅ Conteúdo psicoeducativo
✅ Organização de supervisão

❌ Não substitui revisão do profissional
❌ Não substitui supervisão clínica
❌ Não gera diagnóstico
❌ Não substitui PEP certificado

**Você é responsável por tudo que sai daqui.** CORA te ajuda a ser mais rápido, organizado e consistente — não a ser melhor terapeuta.

---

## 📊 Números

- **10 skills** especializadas
- **3 reference files** (escalas, DSM-5, intervenções)
- **4 templates** de contexto
- **1 safety hook** (previne vazamento de dados)
- **1 guardrails file** (ética CFP + LGPD)

---

**Começar agora**: `/clinic-setup`
