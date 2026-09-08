import { callLLM } from '../services/llm.js';
import { supabase, auditLog } from '../services/supabase.js';

/**
 * Agent 03 — Site Inteligente (Webchat)
 * Endpoint REST que o widget do site chama.
 * Qualifica visitante, captura dados, converte para WhatsApp.
 */

export interface WebchatMessage {
  sessionId: string;
  tenantId: string;
  message: string;
  visitorData?: {
    page: string;
    utm_source?: string;
    utm_campaign?: string;
    referrer?: string;
    device?: string;
  };
}

export interface WebchatResponse {
  reply: string;
  actions?: Array<{
    type: 'collect_phone' | 'redirect_whatsapp' | 'show_calendar' | 'show_pricing';
    data?: Record<string, unknown>;
  }>;
}

// Conversas de webchat em memória (MVP — depois vai pro Redis/DB)
const webchatSessions = new Map<string, Array<{ role: string; content: string }>>();

export async function runAgent03(input: WebchatMessage): Promise<WebchatResponse> {
  const history = webchatSessions.get(input.sessionId) || [];
  history.push({ role: 'user', content: input.message });

  const pageContext = input.visitorData?.page || '/';
  const utmSource = input.visitorData?.utm_source || 'direto';

  const systemPrompt = `Você é ARIEL, assistente no site do escritório contábil.

OBJETIVO: Qualificar visitante e converter para WhatsApp (ou agendamento).

CONTEXTO DO VISITANTE:
- Página atual: ${pageContext}
- Origem: ${utmSource}
- Device: ${input.visitorData?.device || 'desconhecido'}

REGRAS:
1. Seja conciso (max 80 palavras por mensagem)
2. Qualifique em 2-3 perguntas
3. Quando tiver dados suficientes, ofereça: "Quer continuar no WhatsApp?"
4. Se visitante não quiser WhatsApp, ofereça agendar call
5. NUNCA diga "sou IA"
6. Tom: amigável, direto, profissional

FLOW:
- Msg 1: Saudação contextual + 1 pergunta
- Msg 2-3: Coletar tipo empresa + urgência
- Msg 4: Oferecer WhatsApp ou agendamento

Se visitante deu telefone: responda com action "redirect_whatsapp"
Se pediu preço: responda com action "show_pricing"
Se quer agendar: responda com action "show_calendar"

FORMATO (JSON):
{
  "reply": "mensagem de texto",
  "actions": [{"type": "collect_phone|redirect_whatsapp|show_calendar|show_pricing", "data": {}}]
}`;

  const response = await callLLM({
    system: systemPrompt,
    messages: history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    temperature: 0.5,
    maxTokens: 256,
  });

  let result: WebchatResponse;
  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    result = JSON.parse(jsonMatch![0]);
  } catch {
    result = { reply: response.text, actions: [] };
  }

  // Salvar na sessão
  history.push({ role: 'assistant', content: result.reply });
  webchatSessions.set(input.sessionId, history);

  // Limpar sessões antigas (24h)
  if (webchatSessions.size > 1000) {
    webchatSessions.clear();
  }

  await auditLog({
    tenantId: input.tenantId,
    actor: 'agent03',
    action: 'webchat.message',
    payload: { sessionId: input.sessionId, page: pageContext, utm: utmSource },
  });

  return result;
}
