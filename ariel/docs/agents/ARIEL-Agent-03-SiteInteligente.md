# 🧜‍♀️ ARIEL — Agent 3: Site Inteligente (Webchat)

**Status:** Fase 2 — Semana 5-6  
**Complexidade:** ⭐⭐☆ (Média)  
**Impacto:** 🟡 Médio (captura visitante do site)

---

## 📋 O Que Faz

Widget de chat no site institucional que detecta origem do visitante, adapta conteúdo, qualifica em tempo real e converte para WhatsApp ou agendamento.

---

## 🔔 Quando Ativa

**Triggers:**
1. Visitante entra no site (após 5 segundos)
2. Visitante scrollou 50%+ da página
3. Visitante clicou em "Fale conosco"
4. Exit intent (mouse vai para fechar aba)

---

## 🔄 Fluxo Detalhado

```
1. DETECÇÃO DE ORIGEM
   ├─ Google Ads → adapta oferta (urgência)
   ├─ Orgânico → adapta oferta (educacional)
   ├─ Indicação (UTM) → personaliza saudação
   └─ Direto → mensagem genérica

2. CHAT PROATIVO
   ├─ Exibe bolha com mensagem contextual
   ├─ Se clicou: abre chat
   └─ Se ignorou: fecha após 10s

3. QUALIFICAÇÃO INLINE
   ├─ 2-3 perguntas rápidas (tipo quiz)
   ├─ Calcula fit em tempo real
   └─ Se fit alto → CTA forte

4. CONVERSÃO
   ├─ "Quer continuar no WhatsApp?" → captura número
   ├─ "Quer agendar uma call?" → link Calendly/interno
   └─ "Quer receber proposta?" → coleta email + telefone

5. HANDOFF PARA WHATSAPP
   ├─ Cria lead no CRM com contexto do site
   ├─ Manda primeira mensagem no WhatsApp (contexto)
   └─ Agente 1 assume no WhatsApp
```

---

## 💬 Sistema de Prompts

### **Prompt de Saudação Contextual**

```markdown
Você é ARIEL, assistente de chat no site de {{ company_name }}.

**Contexto do visitante:**
- Origem: {{ utm_source }} ({{ utm_campaign }})
- Página atual: {{ current_page }}
- Tempo no site: {{ time_on_site }}s
- Dispositivo: {{ device }}

**Regras:**
1. Saudação curta (máximo 2 linhas)
2. Referencie o que o visitante está vendo
3. Faça 1 pergunta simples
4. Não seja invasivo

**Exemplos por página:**
- /servicos/contabilidade → "Precisa de contabilidade? Qual tipo de empresa?"
- /precos → "Quer saber o valor certinho pra sua empresa?"
- /blog/simples-nacional → "Tá pesquisando sobre Simples? Posso ajudar!"
```

---

## ⚙️ Configuração

```json
{
  "widget": {
    "position": "bottom-right",
    "delay_show": 5000,
    "proactive_message": true,
    "exit_intent": true,
    "colors": "{{ brand_colors }}",
    "avatar": "ariel_avatar.png"
  },
  "behavior": {
    "pages_to_show": ["*"],
    "pages_to_hide": ["/admin", "/login"],
    "max_proactive_per_session": 1,
    "collect_before_chat": ["nome", "whatsapp"]
  },
  "conversion": {
    "primary_cta": "whatsapp",
    "secondary_cta": "agendar",
    "fallback_cta": "email"
  }
}
```

---

## 💬 Exemplos Reais

### Visitante de Google Ads "contador São Paulo"

```
[Bolha aparece após 5s]
"Procurando contador em SP? Posso ajudar! 
Qual tipo de empresa você tem?"

Visitante: "Simples Nacional, 80k mês"

Bot:
"Temos especialistas em Simples! Pra sua faixa de faturamento, 
a mensalidade fica em torno de R$ 450/mês.

Quer que eu mande os detalhes no seu WhatsApp? 
Assim você tem tudo salvo lá. 📱"

Visitante: "Pode ser, 21 98765-4321"

Bot:
"Perfeito! Mandei mensagem no WhatsApp agora. 
Confere lá! Se precisar de algo mais, tô aqui. 😊"

→ Agente 1 ativa no WhatsApp com contexto completo
```

---

## 📊 Métricas

| Métrica | Target |
|---------|--------|
| Taxa de abertura do chat | 8-15% dos visitantes |
| Taxa de qualificação | 40-60% dos que abrem |
| Conversão para WhatsApp | 30-50% dos qualificados |
| Leads gerados/mês via site | 20-50 |

---

## ✅ Checklist

- [ ] Widget de chat (Tidio, Crisp, ou custom)
- [ ] Detecção de UTM/origem
- [ ] Lógica de mensagem proativa por página
- [ ] Integração com Supabase (salvar lead)
- [ ] Handoff para WhatsApp (trigger Agente 1)
- [ ] Analytics de conversão
- [ ] A/B test de mensagens
