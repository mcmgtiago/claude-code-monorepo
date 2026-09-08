# 🧜‍♀️ ARIEL — Agent 1: Lead Qualification

**Status:** MVP Priority — Semana 1-2  
**Complexidade:** ⭐⭐☆ (Média)  
**Impacto:** 🔴 Alto (entrada de negócio novo)

---

## 📋 O Que Faz

Qualifica novo lead que chega no WhatsApp. Coleta dados relevantes, calcula score de encaixe, e roteia para ação (proposta, agendamento, nutrição automática).

**Resultado:** Lead entra "frio" e sai com score e ação definida.

---

## 🔔 Quando Ativa

Trigger: **Novo contato envia primeira mensagem**

```
Cliente novo: "Oi, tenho uma clínica odontológica"
        ↓
Sistema detecta: número não está em "clientes"
        ↓
Agente 1 ativa
```

---

## 🔄 Fluxo Detalhado

```
1. ENTRADA
   └─ Cliente envia mensagem
   
2. DETECÇÃO
   ├─ É novo? (não existe em DB)
   ├─ É contato conhecido? (skip agent)
   └─ É resposta a mensagem anterior? (se sim, vai para outro agente)
   
3. COLETA DE DADOS
   ├─ Nome (já vem do WhatsApp)
   ├─ Negócio/Serviço (qual tipo?)
   ├─ Tamanho (faturamento, clientes, funcionários)
   ├─ Urgência (já tem provider? vai abrir? vai migrar?)
   └─ Contexto (como encontrou a gente?)
   
4. VALIDAÇÃO
   ├─ Dados completos?
   ├─ Faz sentido para o nicho?
   └─ Se não: pede mais info
   
5. CÁLCULO DE SCORE
   ├─ Aplica regras de scoring (por nicho)
   ├─ Soma pontos: urgência, fit, tamanho
   └─ Resultado: 0-100
   
6. CLASSIFICAÇÃO
   ├─ Score 80+: HOT (responder imediato)
   ├─ Score 50-79: MORNO (agendar proposta)
   ├─ Score 0-49: FRIO (nutrição automática)
   └─ Score negativo: DESCARTA (fora do escopo)
   
7. AÇÃO IMEDIATA
   ├─ HOT: convida para call → Agente 12 (Agendamento)
   ├─ MORNO: propõe orçamento → Agente 2 (Propostas)
   ├─ FRIO: manda info + newsletter
   └─ Cria registro no CRM
   
8. SAÍDA
   └─ Resposta amigável + próximo passo claro
```

---

## 📊 Contexto Necessário

**O agente consulta no Supabase:**

1. **clientes** — verificar se é novo
2. **leads_scoring_rules** — regras por nicho
3. **niches** — configuração do setor
4. **conversations** — histórico (se houver)

---

## 💬 Sistema de Prompts (Opus 4.7)

### **Prompt Principal**

```markdown
Você é ARIEL, um assistente de qualificação de leads inteligente.

**Contexto:**
- Nicho: {{ niche_name }} (ex: Contábil, Odontológico, Jurídico)
- Cliente novo: {{ customer_name }}
- Mensagem inicial: "{{ initial_message }}"

**Seu objetivo:** Qualificar este lead em 2-3 mensagens, sem parecer robô.

**Regras de qualificação para {{ niche_name }}:**
{{ qualification_rules }}

**Exemplo de conversa natural:**
Cliente: "Oi, tenho uma clínica"
Você: "Opa, legal! 🦷 Quantos pacientes você atende por mês, mais ou menos?"
Cliente: "Uns 150"
Você: "Bacana! E você já tem um sistema para controlar tudo isso?"
Cliente: "Tenho, mas é bem bagunçado"
Você: "Entendo, é comum! Deixa eu ver se consigo ajudar..."

**Seu próximo passo:**
- Se tiver 2+ dados de qualificação → calcula score e responde com ação clara
- Se tiver <2 dados → faz pergunta natural (máximo 1 pergunta por mensagem)
- Se parecer fora do escopo → avisa educadamente e oferece alternativa

**Após qualificar, retorne JSON:**
{
  "classification": "HOT|MORNO|FRIO|DESCARTA",
  "score": 0-100,
  "reasoning": "por que esse score",
  "recommended_action": "agendar|proposta|newsletter|descarta",
  "next_message": "mensagem para cliente"
}
```

### **Prompt de Contexto por Nicho**

#### CONTÁBIL
```markdown
**Qualificação para Contábil:**
- Faturamento >100k: +30 pontos
- Tipo empresa (Simples/Lucro Real/MEI): +20 pontos
- Urgência (vai abrir/migrar): +40 pontos
- Já tem contador: -20 pontos

Score mínimo para HOT: 70
Tipo de pergunta: "E qual é o faturamento mensal da empresa?"
```

#### ODONTOLÓGICO
```markdown
**Qualificação para Odontológico:**
- Pacientes/mês >100: +30 pontos
- Tem sistema de agendamento: +20 pontos
- Quer melhorar faturamento: +40 pontos
- Consultório estabelecido: +10 pontos

Score mínimo para HOT: 60
Tipo de pergunta: "Quantos pacientes você atende por semana?"
```

#### JURÍDICO
```markdown
**Qualificação para Jurídico:**
- Área especializada: +30 pontos
- Alto ticket médio: +40 pontos
- Precisa de especialista urgente: +50 pontos
- Já tem advogado: -25 pontos

Score mínimo para HOT: 75
Tipo de pergunta: "Qual área do direito você atua?"
```

#### CONSIGNADORA
```markdown
**Qualificação para Consignadora:**
- Renda comprovada: +40 pontos
- Sem outros consignados: +30 pontos
- Urgência financeira detectada: +30 pontos
- Renda <5 salários mínimos: -50 pontos

Score mínimo para HOT: 70
Tipo de pergunta: "E qual é sua renda mensal aproximada?"
```

---

## 🔗 Integrações

### **Entrada (WhatsApp)**
```javascript
POST /webhook/whatsapp
{
  "from": "5521987654321",
  "message": "Oi, sou dentista",
  "timestamp": "2024-08-22T09:00:00Z"
}
```

### **Consulta CRM**
```sql
SELECT * FROM clientes WHERE numero = '5521987654321';
-- Resultado: NULL (é novo)

SELECT * FROM leads_scoring_rules WHERE niche = 'odonto';
-- Resultado: regras de pontuação
```

### **Ação: Criar Lead**
```sql
INSERT INTO leads (numero, niche, score, classification, status)
VALUES ('5521987654321', 'odonto', 85, 'HOT', 'created');
```

### **Saída (Resposta WhatsApp)**
```javascript
POST /send-whatsapp
{
  "to": "5521987654321",
  "message": "Opa, legal! Quantos pacientes você atende por mês?",
  "type": "text"
}
```

---

## ⚙️ Configuração por Nicho

**config/niches/contabil.json**
```json
{
  "niche_id": "contabil",
  "agent_1_config": {
    "questions": [
      {
        "id": "tipo_empresa",
        "question": "Qual é o tipo da sua empresa?",
        "options": ["MEI", "Simples Nacional", "Lucro Real"],
        "weight": 20
      },
      {
        "id": "faturamento",
        "question": "Qual é o faturamento mensal?",
        "type": "number",
        "weight": 30
      },
      {
        "id": "urgencia",
        "question": "Qual é sua urgência?",
        "options": ["Preciso abrir agora", "Vou abrir em breve", "Já tenho, quer migrar"],
        "weight": 40
      }
    ],
    "scoring_thresholds": {
      "hot": 70,
      "morno": 40,
      "frio": 0,
      "descarta": -10
    },
    "actions": {
      "HOT": "agent_12_schedule",
      "MORNO": "agent_2_proposal",
      "FRIO": "agent_10_newsletter",
      "DESCARTA": "none"
    }
  }
}
```

---

## 💬 Exemplos Reais

### Exemplo 1: Contábil HOT

```
ENTRADA:
Cliente: "Oi, tenho uma empresa e preciso migrar de contador, urgente"

AGENTE:
Score: 85 (urgência 50 + tipo 20 + faturamento não informado mas contexto sugere +15)
Classification: HOT
Resposta:
"Opa, ótimo! Entendo a urgência. Que legal que você quer melhorar isso.
Qual é seu faturamento mensal, pra eu montar uma proposta bem certeira?
E qual é o tipo da sua empresa? (MEI, Simples ou Lucro Real?)"

PRÓXIMA AÇÃO:
→ Agenda call com especialista em contabilidade (Agente 12)
```

### Exemplo 2: Odonto MORNO

```
ENTRADA:
Cliente: "Oi, meu consultório é pequeno, tenho 40 pacientes por mês"

AGENTE:
Score: 45 (pacientes 20 + consultório estabelecido 10 + margem 15)
Classification: MORNO
Resposta:
"Opa, bacana! 40 pacientes por mês é legal. 
Vejo que há espaço pra crescer aí. 😊

Quer que eu mande um orçamento de como poderíamos ajudar seu consultório 
a crescer e organizar melhor? Leva 5 min pra gente falar por aqui."

PRÓXIMA AÇÃO:
→ Agente 2 monta proposta (Propostas)
```

### Exemplo 3: Jurídico HOT

```
ENTRADA:
Cliente: "Oi, sou advogado, preciso urgente de parceria em tributário"

AGENTE:
Score: 85 (especialidade 30 + urgência 50 + já tem prática +5)
Classification: HOT
Resposta:
"Opa! Tributário é nossa praia! 📜
Entendo a urgência. Qual é o case principal que você tá trabalhando agora?
Pra eu ver se consigo ajudar com expertise específica."

PRÓXIMA AÇÃO:
→ Agenda call imediato com especialista em tributário (Agente 12)
```

---

## 📊 Métricas

**O agente deve rastrear:**

1. **Leads qualificados/dia**
   - Meta: 5-10 novos leads
   - KPI: taxa de conversão (lead → cliente)

2. **Score médio dos leads**
   - Target: média 55-65 (mix saudável)
   - Alertar se: média <30 ou >85 (algo estranho)

3. **Tempo de qualificação**
   - Target: <5 minutos
   - Métrica: tempo entre primeira msg e score calculado

4. **Taxa de encaixe por nicho**
   - HOT: 20-30% dos leads
   - MORNO: 40-50%
   - FRIO: 20-30%
   - Descarta: <5%

5. **Follow-up success rate**
   - HOT → proposta em 24h: 90%+
   - MORNO → proposta em 48h: 85%+
   - FRIO → newsletter: 70%+ open rate

---

## 🐛 Troubleshooting

| Problema | Causa | Solução |
|----------|-------|--------|
| Lead com score muito baixo mas parece bom | Regras de scoring desatualizadas | Revise regras no DB |
| Está pedindo as mesmas perguntas 2x | Contexto não está sendo lido | Verifique query ao banco |
| Classificação errada (HOT virou FRIO) | Ponderação de pesos errada | Ajuste weights no config |
| Cliente fica em loop (1 pergunta, outra, outra) | Prompt muito rigoroso | Solte para 2+ dados coletados |
| Não está detectando novos clientes | Webhook não disparando | Verifique WAHA connection |

---

## 🔧 Implementação (Pseudocódigo)

```javascript
// 1. Webhook recebe mensagem
router.post('/webhook/whatsapp', async (req, res) => {
  const { from, message, timestamp } = req.body;
  
  // 2. Verifica se é novo
  const existingClient = await supabase
    .from('clientes')
    .select('*')
    .eq('numero', from);
    
  if (existingClient.data.length === 0) {
    // 3. É novo → ativa Agente 1
    await runAgent1LeadQualification(from, message);
  }
  
  res.json({ ok: true });
});

// 4. Agente 1 executa
async function runAgent1LeadQualification(numero, message) {
  // Detecta nicho
  const niche = await detectNiche(message);
  
  // Consulta contexto
  const config = await loadNicheConfig(niche);
  
  // Monta prompt
  const prompt = buildPrompt(config, numero, message);
  
  // Chama Opus 4.7
  const response = await callClaude(prompt);
  
  // Parse resultado
  const result = JSON.parse(response);
  
  // Salva no banco
  await supabase.from('leads').insert({
    numero,
    niche,
    score: result.score,
    classification: result.classification
  });
  
  // Envia resposta
  await sendWhatsApp(numero, result.next_message);
  
  // Se HOT, roteia para próximo agente
  if (result.classification === 'HOT') {
    await routeToAgent(result.recommended_action, numero);
  }
}
```

---

## ✅ Checklist de Implementação

- [ ] Setup Supabase: tabelas `clientes`, `leads`, `leads_scoring_rules`
- [ ] Webhook WAHA recebendo mensagens
- [ ] Função de detecção de nicho
- [ ] Carregamento de config por nicho
- [ ] Integração com Opus 4.7 API
- [ ] Parser de resposta JSON
- [ ] Salvar lead no banco
- [ ] Enviar resposta no WhatsApp
- [ ] Testes com 10 leads reais
- [ ] Ajustar scoring rules conforme feedback
- [ ] Deploy em Coolify

---

## 📚 Referências

- Config de nicho: `config/niches/`
- Banco de dados: `ARIEL-DATABASE-SCHEMA.md`
- Arquivo de regras: `data/scoring-rules.json`
- Próximo agente: [Agent 2 — Gerador de Propostas](./ARIEL-Agent-02-Propostas.md)
