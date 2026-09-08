# ✅ GREENHAT Radar — Checklist de Uso

## Setup Inicial

- [ ] Confirmar que `.env` tem token/API key correto
- [ ] Confirmar que server está rodando em http://127.0.0.1:5050
- [ ] Confirmar que banco tem 1.178 empresas (`SELECT COUNT(*) FROM companies`)
- [ ] Testar `/api/health` — deve retornar `"claude_configured": true`

---

## Análise em Lote (1º Dia)

- [ ] Abrir http://127.0.0.1:5050
- [ ] Ir para "Análise em lote"
- [ ] Digitar `1178` em "Quantidade"
- [ ] Clicar "Iniciar análise"
- [ ] **ESPERAR 15-20 minutos** (processa 5 empresas/vez em paralelo)
- [ ] Ver progresso em tempo real (X empresas analisadas, Y sem site)
- [ ] Checar dashboard — números devem mudar em "Prioridade alta", "Prontas para revisar"

---

## Filtrar Oportunidades (2º Dia)

- [ ] Filtrar por **Segmento**: `B2B SaaS` ou `Fintech`
- [ ] Filtrar por **Foco**: `Aderentes` (mais qualificadas)
- [ ] Filtrar por **Score mínimo** (optional, via export): `≥70`
- [ ] Ordenar por "Maior fit primeiro"
- [ ] Contar quantas empresas passaram (target: 50-100 leads qualificados)

---

## Enriquecer Manualmente (2º Dia)

Para cada empresa que parece promissora:

- [ ] Clicar na empresa para abrir painel de detalhe
- [ ] Ler resumo do site (title, description, excerpt)
- [ ] Clicar "Enriquecer com IA" (novo botão azul)
- [ ] Esperar 5-10 seg por enriquecimento
- [ ] Verificar campos:
  - **Tech stack**: React? Node? Python? Docker?
  - **Leader names**: Nomes de sócios/fundadores?
  - **Suggested angle**: Ângulo de venda sugerido?
- [ ] Se não gostou do ângulo, editar manualmente
- [ ] Se tudo bem, marcar como `researching` no pipeline

---

## Gerar Rascunhos (3º Dia)

Para leads pronto para contato:

- [ ] Abrir empresa
- [ ] Ir para "Rascunhos"
- [ ] Selecionar **Canal**: `email`, `linkedin`, ou `instagram`
- [ ] Selecionar **Idioma**: `pt-BR` ou `en`
- [ ] (Opcional) Digitar **Objetivo** customizado (ex: "Discutir integrações bancárias")
- [ ] Clicar "Gerar rascunho"
- [ ] Esperar Claude gerar texto (~20 seg)
- [ ] **REVISAR** o rascunho — sempre!
  - Menciona stack tech que você viu? ✓
  - Ângulo é relevante? ✓
  - Sem spam, com pergunta aberta? ✓
- [ ] Se OK, clicar "Aprovar"
- [ ] Se não OK, editar manualmente ou rejeitar + tenta de novo

---

## Exportar para CRM (3º Dia)

- [ ] Clicar em "Exportar CSV" (novo botão)
- [ ] Digitar score mínimo (ex: `70`)
- [ ] (Opcional) Filtrar por estado ou segmento antes
- [ ] Download automático → `greenhat-export.csv`
- [ ] Abrir em Excel
- [ ] Colunas exportadas:
  - `trade_name`: Nome da empresa
  - `website`: URL para pesquisa rápida
  - `decision_maker`: Nome do decisor (se encontrado)
  - `email`, `phone`: Contato
  - `fit_score`: Score final (0-100)
  - `segment`: Fintech/SaaS/etc
  - **`suggested_angle`**: COPIA PARA SEU RASCUNHO
  - **`tech_stack`**: COPIA PARA CONVERSA TÉCNICA
  - **`leader_names`**: COPIA PARA LINKEDIN

---

## Contatar (4º Dia+)

Ao enviar primeiro email/LinkedIn:

- [ ] Voltar no Radar
- [ ] Abrir empresa
- [ ] Mudar pipeline de `new` → `contacted`
- [ ] Sistema registra `contacted_at` automaticamente
- [ ] Adicionar nota privada: "Enviado email sobre [ângulo]"

Conforme avança:

- [ ] Se agendou ligação → `call_scheduled`
- [ ] Se mandou proposta → `proposal_sent`
- [ ] Se entrou em negociação → `negotiation`
- [ ] Se ganhou → `won` + preencher `opportunity_value` (valor do projeto)
- [ ] Se perdeu → `lost` + preencher `loss_reason` (competitor? orçamento? timing?)

---

## Acompanhamento & Analytics

A cada semana:

- [ ] Dashboard mostra: Total, Prioridade alta, Prontas para revisar, Em andamento
- [ ] Filtrar por `pipeline_status` = `contacted` → quantos já contatou?
- [ ] Filtrar por `pipeline_status` = `won` → quantos projetos fechou?
- [ ] Calcular taxa:
  - Leads qualificados: ? (score ≥70)
  - Contatados: ? (mudaram pra `contacted`+)
  - Ganhos: ? (pipeline `won`)
  - **Taxa de conversão:** ganhosão/contatados × 100%

---

## Troubleshooting Rápido

| Problema | Solução |
|----------|----------|
| Análise em lote travou | Clique "Parar análise" e recomece, ou reinicie server |
| IA não gera rascunho | Confirme `.env` tem token/key, tente novamente |
| Score não subiu após análise | Rodou análise mesmo? Confirme website_status = 'available' |
| Não vê rascunhos aprovados | Filtrar por `status` = `ready_for_review`, não `approved` |
| Empresa desapareceu | Pode ter sido deletada. Check que não é filtro inativo |
| Export vazio | Filtro de score muito alto? Tente `min_score=0` |

---

## Keyboard Shortcuts

- **K** — Abre busca (você pode digitar nome, CNAE, cidade)
- **N** — Próxima empresa na lista (se uma estiver selecionada)
- **P** — Abre formulário de rascunho para empresa selecionada

---

## Tema Escuro

- Ativa automaticamente se seu SO preferir modo escuro
- Nenhuma ação necessária — é automático

---

## Dicas Pro

✨ **Rápido qual empresa contatar?**
1. Filtrar `Foco = Aderente` + `Score ≥ 50`
2. Ordenar "Maior fit primeiro"
3. Ver primeiras 20 — são os leads melhores

✨ **Rascunho muito genérico?**
1. Abrir empresa
2. Clicar "Enriquecer com IA"
3. Editar "Ângulo de venda sugerido" manualmente
4. Gerar novo rascunho (vai usar seu ângulo customizado)

✨ **Muitos lá perdidos? Entender por quê?**
1. Filtrar `Status = Lost`
2. Clicar em alguns
3. Ver campo `loss_reason` — você preencheu?
4. Se sim, agrupa por motivo (competitor, orçamento, etc.)
5. Ajusta estratégia pro próximo batch

✨ **Quer reprocessar tudo?**
```bash
rm instance/radar.db
python app.py  # Reconstrói banco limpo
```
Depois reimporta CSV.

---

## Métricas de Sucesso

**Objetivo:** Fechar 10-20 projetos de SaaS/Fintech em Brasília

- ✅ Leads qualificados (score ≥70): **50-100** esperado
- ✅ Contatados: **30-50** (60% dos qualificados)
- ✅ Ganhos: **5-10** (15-20% dos contatados = taxa normal)
- ✅ Tempo por lead: **~5 min** (ler, enriquecer, gerar rascunho)

---

**Última atualização:** 2026-08-04  
**Versão:** 1.0 (com 8 melhorias implementadas)
