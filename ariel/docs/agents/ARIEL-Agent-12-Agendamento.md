# 🧜‍♀️ ARIEL — Agent 12: Agendamento Inteligente

**Status:** Fase 2 — Semana 5-6  
**Complexidade:** ⭐⭐⭐ (Alta)  
**Impacto:** 🔴 Alto (conversão + retenção)

---

## 📋 O Que Faz

Marca reuniões automático. Verifica disponibilidade, sugere horários, confirma, lembra, reagenda. Integra com Google Calendar.

---

## 🔔 Quando Ativa

**Triggers:**
1. Lead classificado como HOT (Agente 1 roteia)
2. Cliente pede "agendar" ou "marcar reunião"
3. Follow-up automático pós-proposta
4. Reagendamento (cliente pede trocar horário)

---

## 🔄 Fluxo Detalhado

```
1. SOLICITAÇÃO
   ├─ Cliente: "Quero agendar uma reunião"
   └─ Ou: Lead HOT → oferece call automático

2. VERIFICAÇÃO DE DISPONIBILIDADE
   ├─ Consulta calendário do profissional (Google Calendar)
   ├─ Aplica regras: horário comercial, buffer entre reuniões
   ├─ Filtra: apenas dias úteis, 8h-18h
   └─ Retorna: 3-5 opções de horário

3. OFERTA
   ├─ Apresenta opções formatadas
   ├─ Cliente escolhe (responde número ou texto)
   └─ Se nenhuma serve: oferece mais opções / outro dia

4. CONFIRMAÇÃO
   ├─ Cria evento no Google Calendar
   ├─ Envia confirmação: data, hora, link/endereço
   ├─ Se online: gera link Meet/Zoom
   └─ Registra no CRM

5. LEMBRETES
   ├─ 24h antes: "Lembrete da sua reunião amanhã às 14h"
   ├─ 1h antes: "Sua reunião é daqui 1 hora!"
   └─ Se confirmação necessária: "Confirma? [Sim] [Remarcar]"

6. REAGENDAMENTO
   ├─ Cliente: "Preciso remarcar"
   ├─ Oferece novas opções
   ├─ Atualiza evento
   └─ Avisa profissional

7. CANCELAMENTO
   ├─ Cliente: "Preciso cancelar"
   ├─ Pergunta motivo (opcional)
   ├─ Remove evento
   └─ Oferece reagendar depois
```

---

## 💬 Exemplos Reais

### Agendar

```
Cliente: "Quero marcar uma conversa"

Ariel:
"Claro! 📅 Tenho esses horários disponíveis:

1️⃣ Terça 27/08 — 9:00
2️⃣ Terça 27/08 — 14:00
3️⃣ Quarta 28/08 — 10:00
4️⃣ Quinta 29/08 — 16:00

Qual prefere? (responde o número)"

Cliente: "2"

Ariel:
"Perfeito! ✅ Agendado:

📅 Terça, 27 de agosto
🕐 14:00 (45 minutos)
📍 Online (link Meet abaixo)
🔗 https://meet.google.com/xxx-yyy-zzz

Vou te lembrar 1 dia antes!
Qualquer coisa, é só falar."
```

### Lembrete (24h antes)

```
"Oi João! 👋

Lembrando: sua reunião é AMANHÃ:
📅 Terça 27/08 às 14:00
🔗 https://meet.google.com/xxx-yyy-zzz

Confirma que vai? [Sim ✅] [Remarcar 📅]"
```

### Reagendamento

```
Cliente: "Preciso remarcar, não vou poder amanhã"

Ariel:
"Sem problema! Outros horários disponíveis:

1️⃣ Quinta 29/08 — 9:00
2️⃣ Sexta 30/08 — 11:00
3️⃣ Segunda 02/09 — 14:00

Qual fica melhor?"
```

---

## ⚙️ Configuração

```json
{
  "scheduling": {
    "business_hours": { "start": "08:00", "end": "18:00" },
    "days": ["mon", "tue", "wed", "thu", "fri"],
    "meeting_duration": 45,
    "buffer_between": 15,
    "max_meetings_per_day": 8,
    "advance_booking_max": "7 days",
    "reminders": ["24h", "1h"],
    "confirmation_required": true,
    "timezone": "America/Sao_Paulo"
  },
  "calendars": [
    {
      "professional": "Karen",
      "calendar_id": "karen@empresa.com",
      "specialties": ["simples", "mei"]
    },
    {
      "professional": "Marcos",
      "calendar_id": "marcos@empresa.com",
      "specialties": ["lucro_real", "tributario"]
    }
  ]
}
```

---

## 📊 Métricas

| Métrica | Target |
|---------|--------|
| Reuniões agendadas/semana | 10-30 |
| Taxa de comparecimento | 85%+ |
| No-show rate | <15% |
| Cancelamentos | <20% |
| Reagendamentos | <25% |
| Tempo para agendar | <2 minutos |

---

## ✅ Checklist

- [ ] Integração Google Calendar API (leitura + escrita)
- [ ] Algoritmo de slot disponível (buffer + horário comercial)
- [ ] Criação de evento com attendee
- [ ] Geração de link Meet/Zoom
- [ ] Scheduler de lembretes (24h, 1h antes)
- [ ] Handler de reagendamento/cancelamento
- [ ] Registro no CRM (appointment_id)
- [ ] Dashboard: calendário visual do dia
- [ ] Testes: 20 agendamentos reais
