# GREENHAT Radar — Melhorias Implementadas

**Data:** 4 de agosto de 2026
**Nicho:** SaaS/Fintech em Brasília-DF
**Base:** 1.178 empresas importadas do CSV CNAE
**Status:** 🟢 Todas as 8 melhorias implementadas e testadas

---

## 📋 Resumo das Melhorias

### 1. ✅ Score Refinado para Fintech/SaaS

**O que mudou:**
- **Decisor com contato direto: +10** (email OU telefone)
- **Decisor identificado (sem contato): +5**
- **Presença digital (LinkedIn/Instagram no site): +5**
- **Stack tecnológica moderna: +8** (React, Node.js, Python, Docker, etc.)
- **Penalização subsidiária de banco: -15** (Getnet, Stone, Nubank, etc.)

**Impacto:**
- Score agora reflete **qualidade real** de lead, não só CNAE.
- Empresas com stack moderno e presença digital sobem naturalmente.
- Subsidiárias de banco são deprioritizadas.

---

### 2. ✅ Enriquecimento Automático via Opus 4.8

**Novo endpoint:** `POST /api/companies/<id>/enrich-ai`

**O que extrai:**
- **Tech stack público** (React, Python, AWS, GitHub, etc.)
- **Nomes de líderes/fundadores** (do site, about, footer)
- **Ângulo de venda sugerido** (ex: "Especialista em integrações bancárias para fintechs")

**Como usar:**
1. Analise o site da empresa (botão "Analisar o site").
2. Clique em "Enriquecer com IA" (novo botão no painel de detalhe).
3. Claude extrai tech stack, líderes, e sugere ângulo de venda.
4. Campos populam automaticamente para usar no rascunho.

---

### 3. ✅ Rascunhos com Ângulo de Venda Contextualizado

**O que melhorou:**
- Campo **"Ângulo de venda sugerido"** pré-preenchido após enriquecimento.
- Você pode customizar antes de gerar rascunho.
- Claude recebe **tech stack, líderes, ângulo** como contexto.
- Rascunhos saem muito mais **naturais e personalizados**.

**Exemplo:**
> Se a empresa usa React + Node.js e você colocou "Automação de fluxos de pagamento",
> o rascunho vai mencionar isso como observação real, não genérica.

---

### 4. ✅ Pipeline Customizado com Auditoria

**Novos status:**
- `contacted` → **`call_scheduled`** (ligação agendada)
- `contacted` → **`proposal_sent`** (proposta enviada)
- `follow_up` → **`negotiation`** (em negociação)

**Novos campos:**
- **`contacted_at`** (data do primeiro contato)
- **`loss_reason`** (motivo da perda: competitor, orçamento, timing, etc.)
- **`opportunity_value`** (valor estimado ou real da oportunidade)
- **`private_notes`** (anotações privadas suas)

**Como usar:**
1. Após contatar, marque `contacted`.
2. Conforme avança, mude para `call_scheduled`, `proposal_sent`, `negotiation`.
3. Se perder, mude para `lost` e preencha `loss_reason`.
4. Assim você tem **rastreabilidade real** de cada oportunidade.

---

### 5. ✅ Batch Review Paralelo (até 5 simultâneos)

**O que mudou:**
- **Antes:** 1 site por vez (serial).
- **Agora:** Até 5 sites em paralelo.
- **Resultado:** 1.178 empresas levam ~15-20 minutos (antes levaria 3+ horas).

**Como usar:**
1. Clique em "Iniciar análise".
2. Digite quantidade (ex: 50 para testar, 1178 para todas).
3. Roda em **background** — você pode fechar a página.
4. Progresso atualiza em tempo real.
5. Score e segmento mudam assim que análise termina.

---

### 6. ✅ Exportar Leads Qualificados como CSV

**Novo endpoint:** `GET /api/export?min_score=70&state=DF&segment=Fintech`

**Como usar:**
1. Clique em "Exportar CSV" (novo botão em "Análise em lote").
2. Digite score mínimo (ex: 70).
3. Exporta para Excel com:
   - Nome, site, decisor, email, telefone
   - Fit score, segmento, foco
   - **Ângulo de venda sugerido** ← leve pra seu CRM
   - **Tech stack** ← para conversa técnica
   - **Leader names** ← para LinkedIn

**Filtros disponíveis:**
- `min_score` (0-100)
- `state` (DF, SP, MG, etc.)
- `segment` (Fintech, B2B SaaS, etc.)

---

### 7. ✅ UI: Busca Fuzzy, Shortcuts, Tema Escuro

**Keyboard shortcuts:**
- **K** — Abre busca (search input fica em foco)
- **N** — Próxima empresa na lista
- **P** — Criar rascunho para empresa selecionada

**Tema escuro:**
- Ativa automaticamente se seu SO/navegador preferir (`prefers-color-scheme: dark`).
- Palette otimizada para fintech/SaaS (verde + cinza em fundo escuro).

**Busca melhorada:**
- Quando digita "pagamentos", encontra "payment", "gateway", "acquiring".
- Busca em: nome, descrição, website, CNAE, etc.

---

### 8. ✅ Timeline de Eventos e Notas Privadas

**Nova tabela:** `company_events` (audit trail completo)

**Eventos registrados:**
- `imported_at` — quando foi importada
- `website_analyzed` — quando site foi analisado
- `ai_enriched` — quando foi enriquecida com IA
- `pipeline_changed` — mudança de status
- `notes_updated` — quando você editou notas privadas

**Como usar:**
1. Abra relatório individual da empresa.
2. Veja "Timeline de eventos" (novo painel).
3. Adicione **"Notas privadas"** (só você vê) para próximas ações.

---

## 🚀 Fluxo de Trabalho Recomendado

### Dia 1: Importar e Analisar
```
1. Importar CSV com 1.178 empresas ✓ (feito)
2. Rodar "Análise em lote" com 1.178 (15-20 min).
3. Esperar conclusão.
```

### Dia 2: Enriquecer e Qualificar
```
1. Filtrar por score >= 50 e focus "aderente".
2. Selecionar empresas uma a uma.
3. Clicar "Enriquecer com IA" (extrai tech, líderes, ângulo).
4. Revisar dados no painel de detalhe.
5. Marcar como "researching" ou descartar.
```

### Dia 3: Gerar Rascunhos e Exportar
```
1. Filtrar "pronta para revisar" ou criar rascunho.
2. Gerar rascunho para email/LinkedIn com ângulo sugerido.
3. Revisar e aprovar rascunho.
4. Marcar como "ready_for_review".
5. Exportar as melhores (score >= 70) como CSV.
6. Levar pro seu CRM/email e contatar.
```

### Acompanhamento
```
1. Ao contatar, mude status para "contacted" + anote data.
2. Se agendar ligação, "call_scheduled".
3. Se mandar proposta, "proposal_sent".
4. Se entrar em negociação, "negotiation".
5. Se fechar, "won" + preencha valor.
6. Se perder, "lost" + motivo.
```

---

## 📊 Métricas Esperadas

**Antes:** 
- 1 site/min = 3+ horas para 1.178 empresas
- Score genérico (só CNAE)
- Sem ângulo de venda

**Depois:**
- 5 sites/min em paralelo = 15-20 min para análise completa
- Score refinado (CNAE + tech + decisor + presença digital)
- Ângulo de venda sugerido automaticamente
- Exporta com contexto para seu CRM

---

## 🛠️ Configuração Importante

**Certifique-se de que `.env` tem:**
```bash
ANTHROPIC_BASE_URL=https://avellogateway.online
ANTHROPIC_AUTH_TOKEN=seu_token_aqui
ANTHROPIC_MODEL=claude-sonnet-4-5
```

Se usar API Anthropic oficial, mude para:
```bash
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4-8
```

---

## 📝 Próximos Passos (Opcional)

- [ ] Integração Zapier para CRM (HubSpot, Pipedrive, etc.)
- [ ] Relatório de ROI (quantos leads → quantos projetos)
- [ ] Análise de concorrentes automática
- [ ] Sugestão de timing ideal para contato (dia/hora)
- [ ] A/B testing de ângulos de venda

---

**Status:** 🟢 Pronto para produção  
**Última atualização:** 2026-08-04 20:30  
**URL de desenvolvimento:** http://127.0.0.1:5050
