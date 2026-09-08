# PRÁXIS — Sistema de IA para Especialidades Médicas Delicadas

## Visão Geral

PRÁXIS é um sistema de comunicação inteligente para consultórios médicos de especialidades sensíveis (urologia, proctologia, andrologia, coloproctologia).

Remove a barreira emocional entre paciente e consultório. Paciente interage via chat (website ou WhatsApp) sem precisar falar com humano sobre problemas íntimos.

## Stack

- **Frontend:** HTML/CSS/JS (chat widget embeddable + dashboard médico)
- **Backend:** Node.js + Express
- **IA:** Anthropic Claude API (opus-4-8)
- **Database:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage (exames/documentos)

## Módulos

### 1. Chat Widget (Frontend)
- Widget embeddable em qualquer site
- Comunicação respeitosa e discreta
- Upload de exames/documentos
- Design profissional médico

### 2. Agente de Triagem (IA)
- Recebe mensagem do paciente
- Faz triagem respeitosa (3-4 perguntas)
- Qualifica: é caso para o médico?
- Se sim → agenda consulta
- Se não → redireciona educadamente

### 3. Agendamento Automático
- Verifica disponibilidade na agenda
- Oferece 3 horários
- Confirma agendamento
- Envia confirmação

### 4. Lembretes
- 24h antes: confirmação automática
- 1h antes: lembrete final
- Pós-consulta: follow-up

### 5. Upload de Exames
- Paciente envia exame/documento antes da consulta
- Sistema armazena vinculado ao paciente
- Médico vê no dashboard

### 6. Dashboard Médico
- Lista de pacientes agendados
- Status de cada triagem
- Métricas (no-show, conversão, etc)
- Histórico de conversas

## Cliente Demo

**Dr. Carlos Mendes**
- Especialidade: Urologia
- Cidade: Porto Alegre, RS
- Consultório: Centro Urológico Mendes
- Horários: Seg-Sex, 8h-18h
- Procedimentos: Consulta (R$ 350), Exame (R$ 200), Cirurgia (R$ 3.500)

## Como Rodar

```bash
cd praxis-system
npm install
npm run dev
```

Acesse: http://localhost:3000
