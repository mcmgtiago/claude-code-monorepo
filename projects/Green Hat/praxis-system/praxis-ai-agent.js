/**
 * PRÁXIS — Agente de IA Principal
 * Triagem respeitosa para especialidades médicas delicadas
 *
 * Casos de uso:
 * - Urologia
 * - Proctologia
 * - Andrologia
 * - Coloproctologia
 * - Sexologia
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_AUTH_TOKEN,
  baseURL: process.env.ANTHROPIC_BASE_URL || 'https://avellogateway.online',
  authToken: process.env.ANTHROPIC_AUTH_TOKEN,
});

// Override: Avello gateway usa Bearer token ao invés de x-api-key
client._options.defaultHeaders = {
  ...client._options.defaultHeaders,
  'Authorization': `Bearer ${process.env.ANTHROPIC_AUTH_TOKEN}`,
};

const MODEL = process.env.MODEL_NAME || 'claude-sonnet-4-6';

/**
 * SYSTEM PROMPT — Personalidade do Agente
 * Tom: profissional, respeitoso, discreto, médico
 */
const SYSTEM_PROMPT = `Você é a assistente virtual do consultório do Dr. Carlos Mendes, urologista.

**SUA PERSONALIDADE:**
- Tom profissional, discreto e acolhedor
- Você entende que temas urológicos são sensíveis
- NUNCA faça o paciente se sentir julgado
- Use linguagem médica acessível (sem jargões desnecessários)
- Seja objetivo mas empático

**SEU OBJETIVO:**
1. Fazer triagem respeitosa em 3-4 perguntas
2. Entender o que o paciente precisa
3. Qualificar se é caso para o médico
4. Se sim, agendar consulta
5. Se não for caso, redirecionar educadamente

**TOM DE COMUNICAÇÃO:**
- "Você" (não "vossa senhoria")
- Frases curtas e diretas
- Emojis sutis quando apropriado (sem exagero)
- Nunca diminua o problema do paciente
- Exemplo: "Entendo, vamos te ajudar com isso" (não "Não se preocupe")

**NÃO FAÇA:**
- Não dê diagnóstico médico
- Não sugira tratamento
- Não mencione "IA" ou "bot" (você é "assistente do consultório")
- Não use linguagem冷 distante
- Não use piadas ou leve demais

**FLUXO DE TRIAGEM (siga nesta ordem):**

1. **Saudação + Apresentação**
   "Olá, sou a assistente virtual do consultório do Dr. Carlos Mendes. Como posso ajudá-lo hoje?"

2. **Identificação do que trouxe**
   "Posso te ajudar com uma dúvida, agendamento ou tem algo mais específico?"
   - Opções: Agendar / Tenho dúvida / Sobre sintomas / Outro

3. **Triagem (se for sobre sintomas)**
   "Para te direcionar melhor, pode me dizer brevemente o que está sentindo?"
   - Tipo de problema (disfunção, dor, check-up, etc)
   - Tempo de duração
   - Primeira vez ou recorrente

4. **Qualificação (pós-sintomas)**
   "Você já consultou urologista antes?"
   - Se sim: "Já tem exames recentes?"
   - Se não: "É sua primeira consulta?"

5. **Agendamento (se qualificado)**
   "Vou te ajudar a agendar. Qual seu nome completo?"
   → Nome
   → Telefone (WhatsApp)
   → Email
   → Data preferida (haverá opções)

6. **Confirmação**
   "Perfeito! Consulta agendada para [DATA] às [HORA]. Você receberá confirmação por email e WhatsApp. Até lá!"

**EXEMPLOS DE BOA INTERAÇÃO:**

❌ RUIM: "Oi, tudo bem? Posso te ajudar?"
✅ BOM: "Olá, sou a assistente do consultório do Dr. Carlos. Como posso te ajudar hoje?"

❌ RUIM: "Ok, anotei. Mais alguma coisa?"
✅ BOM: "Entendi. Vou te ajudar a resolver isso. Pode me confirmar [dado]?"

❌ RUIM: "Não se preocupe, deve ser passageiro"
✅ BOM: "Entendo que isso está te incomodando. Vamos te ajudar a encontrar o melhor tratamento."

**HORÁRIOS DISPONÍVEIS DO DR. CARLOS (para usar):**
- Segunda: 8h, 9h, 10h, 14h, 15h, 16h
- Terça: 8h, 9h, 10h, 14h, 15h, 16h
- Quarta: 8h, 9h, 10h, 14h, 15h, 16h
- Quinta: 8h, 9h, 10h, 14h, 15h, 16h
- Sexta: 8h, 9h, 10h, 14h, 15h

**SERVIÇOS:**
- Consulta urológica: R$ 350 (45 min)
- Exame de PSA: R$ 200 (20 min)
- Consulta de retorno: R$ 180 (30 min)
- Cirurgias: orçamento à parte

**REGRA CRÍTICA:**
Se o paciente perguntar algo realmente urgente (dor extrema, sangramento, retenção urinária), oriente a procurar pronto-socorro imediatamente. Não tente tratar urgência.

**INSTRUÇÕES FINAIS:**
- Sempre termine ofertas de agendamento com pergunta direta
- Sempre confirme nome + contato + data antes de agendar
- Sempre termine com "Até lá!" ou similar caloroso
- Paciente pode desistir a qualquer momento — seja educado e pergunte se prefere ser contactado depois`;

/**
 * Processa uma mensagem do paciente e retorna resposta do agente
 *
 * @param {string} sessionId - ID da sessão (pode ser número WhatsApp ou sessionId web)
 * @param {string} userMessage - Mensagem do paciente
 * @param {Array} history - Histórico de mensagens [{role, content}]
 * @returns {Promise<Object>} { response, intent, requiresBooking, extractedData }
 */
export async function processMessage(sessionId, userMessage, history = []) {
  const messages = [
    ...history,
    { role: 'user', content: userMessage }
  ];

  try {
    const completion = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [
        {
          name: 'agendar_consulta',
          description: 'Agenda uma consulta quando o paciente já forneceu nome completo, telefone, e nome do horário preferido.',
          input_schema: {
            type: 'object',
            properties: {
              paciente_nome: { type: 'string', description: 'Nome completo do paciente' },
              paciente_telefone: { type: 'string', description: 'Telefone de contato (com DDD)' },
              paciente_email: { type: 'string', description: 'Email do paciente' },
              data_preferida: { type: 'string', description: 'Data preferida (YYYY-MM-DD)' },
              hora_preferida: { type: 'string', description: 'Horário preferido (HH:MM)' },
              tipo_servico: { type: 'string', description: 'Tipo: Consulta, Exame, Retorno, Cirurgia' },
              motivo_resumido: { type: 'string', description: 'Resumo breve do motivo (1 linha)' }
            },
            required: ['paciente_nome', 'paciente_telefone', 'data_preferida', 'hora_preferida', 'tipo_servico']
          }
        },
        {
          name: 'enviar_lembrete',
          description: 'Envia um lembrete ao paciente (confirmação 24h, lembrete 1h, etc)',
          input_schema: {
            type: 'object',
            properties: {
              tipo_lembrete: { type: 'string', enum: ['24h_antes', '1h_antes', 'pos_consulta'], description: 'Tipo de lembrete' },
              appointment_id: { type: 'string', description: 'ID do agendamento' }
            },
            required: ['tipo_lembrete', 'appointment_id']
          }
        }
      ],
      messages: messages
    });

    // Extrair resposta de texto
    let responseText = '';
    let toolUse = null;

    for (const block of completion.content) {
      if (block.type === 'text') {
        responseText += block.text;
      } else if (block.type === 'tool_use') {
        toolUse = block;
      }
    }

    return {
      sessionId,
      response: responseText,
      toolUse, // {name: 'agendar_consulta', input: {...}}
      stopReason: completion.stop_reason,
      model: completion.model,
      usage: completion.usage
    };
  } catch (error) {
    console.error('❌ Erro no agente PRÁXIS:', error);
    throw error;
  }
}

/**
 * Processa primeiro contato (caso especial)
 * Sistema: "Olá, sou a assistente do consultório..."
 */
export async function getWelcomeMessage() {
  return `Olá, sou a assistente virtual do consultório do Dr. Carlos Mendes, urologista.

Estou aqui para te ajudar com:
• Agendar uma consulta
• Tirar dúvidas sobre urologia
• Entender se seu caso precisa de avaliação

Por onde você quer começar?`;
}

/**
 * Valida se dados estão completos para agendar
 */
export function validateBookingData(data) {
  const required = ['paciente_nome', 'paciente_telefone', 'data_preferida', 'hora_preferida', 'tipo_servico'];
  const missing = required.filter(field => !data[field]);

  if (missing.length > 0) {
    return {
      valid: false,
      missing,
      message: `Faltam dados: ${missing.join(', ')}. Preciso que você confirme essas informações.`
    };
  }

  // Validar email (opcional mas se tiver, validar formato)
  if (data.paciente_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.paciente_email)) {
    return {
      valid: false,
      message: 'Email parece estar inválido. Pode conferir?'
    };
  }

  // Validar telefone (formato BR)
  if (!/^\d{10,11}$/.test(data.paciente_telefone.replace(/\D/g, ''))) {
    return {
      valid: false,
      message: 'Telefone precisa ter DDD + número (ex: 51999999999).'
    };
  }

  return { valid: true };
}

/**
 * Verifica urgência da mensagem
 * Retorna 'emergency' | 'urgent' | 'normal'
 */
export function checkUrgency(message) {
  const emergencyKeywords = [
    'sangrando', 'sangramento', 'sangue',
    'não consigo urinar', 'retenção',
    'dor extrema', 'dor insuportável',
    'desmaiei', 'desmaio',
    'emergência', 'urgente',
    'dor forte', 'muita dor'
  ];

  const urgentKeywords = [
    'dor', 'dói', 'incomoda',
    'infecção', 'febre',
    'súbito', 'começou hoje'
  ];

  const lowerMsg = message.toLowerCase();

  if (emergencyKeywords.some(k => lowerMsg.includes(k))) {
    return 'emergency';
  }

  if (urgentKeywords.some(k => lowerMsg.includes(k))) {
    return 'urgent';
  }

  return 'normal';
}

/**
 * Resposta de emergência (caso detecte urgência)
 */
export function getEmergencyResponse() {
  return `⚠️ Entendo que você está passando por uma situação difícil.

Para sintomas agudos como o que você está descrevendo, é importante buscar atendimento IMEDIATO:

• **Pronto-Socorro mais próximo** (se dor extrema, sangramento, ou não conseguir urinar)
• **SAMU 192** (se necessário)

Depois que estiver estável, podemos marcar uma consulta para acompanhamento.

Posso te ajudar com algo mais?`;
}
