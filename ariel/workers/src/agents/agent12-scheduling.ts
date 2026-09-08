import { callLLM } from '../services/llm.js';
import { supabase, auditLog } from '../services/supabase.js';
import { sendMessage } from '../services/whatsapp.js';

/**
 * Agent 12 — Agendamento Inteligente
 * Marca reuniões, sugere horários, confirma, lembra.
 */

export interface Agent12Context {
  tenantId: string;
  tenantName: string;
  contactId: string;
  conversationId: string;
  contactName?: string;
  message: string;
}

interface SchedulingConfig {
  business_hours: { start: string; end: string };
  days_working: string[];
  meeting_duration_min: number;
  buffer_min: number;
}

const DEFAULT_CONFIG: SchedulingConfig = {
  business_hours: { start: '09:00', end: '18:00' },
  days_working: ['mon', 'tue', 'wed', 'thu', 'fri'],
  meeting_duration_min: 30,
  buffer_min: 15,
};

/**
 * Gera slots disponíveis dos próximos 5 dias úteis
 */
function generateAvailableSlots(config: SchedulingConfig): string[] {
  const slots: string[] = [];
  const now = new Date();
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  for (let i = 1; i <= 10 && slots.length < 6; i++) {
    const date = new Date(now.getTime() + i * 86400000);
    const dayName = dayNames[date.getDay()];

    if (!config.days_working.includes(dayName)) continue;

    const [startH] = config.business_hours.start.split(':').map(Number);
    const [endH] = config.business_hours.end.split(':').map(Number);

    // Gerar 2-3 slots por dia
    const hours = [startH, Math.floor((startH + endH) / 2), endH - 2];
    for (const h of hours) {
      if (slots.length >= 6) break;
      const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
      slots.push(`${dateStr} às ${h}:00`);
    }
  }

  return slots;
}

export async function runAgent12(ctx: Agent12Context): Promise<{
  replyText: string;
  meetingScheduled: boolean;
  tokensInput: number;
  tokensOutput: number;
}> {
  // Buscar config do tenant
  const { data: tenant } = await supabase
    .from('ariel_tenants')
    .select('config')
    .eq('id', ctx.tenantId)
    .single();

  const config = { ...DEFAULT_CONFIG, ...(tenant?.config || {}) };
  const slots = generateAvailableSlots(config);

  const systemPrompt = `Você é ARIEL, assistente de agendamento do escritório "${ctx.tenantName}".

OBJETIVO: Ajudar o cliente a agendar uma reunião/consulta.

HORÁRIOS DISPONÍVEIS:
${slots.map((s, i) => `${i + 1}️⃣ ${s}`).join('\n')}

REGRAS:
- Apresente os horários numerados
- Se cliente escolher um número, confirme
- Se nenhum servir, ofereça mais opções
- Tom: amigável, WhatsApp
- Duração padrão: ${config.meeting_duration_min} min
- Se online: informe que link será enviado antes

CONTEXTO:
- Cliente: ${ctx.contactName || 'Cliente'}
- Mensagem: "${ctx.message}"

Responda de forma natural (não JSON).`;

  const response = await callLLM({
    system: systemPrompt,
    messages: [{ role: 'user', content: ctx.message }],
    temperature: 0.4,
    maxTokens: 512,
  });

  // Detectar se confirmou agendamento (simplificado para MVP)
  const confirmed = response.text.toLowerCase().includes('confirmad') ||
                    response.text.toLowerCase().includes('agendad');

  if (confirmed) {
    await auditLog({
      tenantId: ctx.tenantId,
      actor: 'agent12',
      action: 'meeting.scheduled',
      resourceType: 'contact',
      resourceId: ctx.contactId,
      payload: { message: ctx.message },
    });
  }

  return {
    replyText: response.text,
    meetingScheduled: confirmed,
    tokensInput: response.inputTokens,
    tokensOutput: response.outputTokens,
  };
}

/**
 * Envia lembretes de reunião (chamado 24h e 1h antes)
 */
export async function sendMeetingReminder(opts: {
  phone: string;
  name: string;
  dateTime: string;
  hoursUntil: number;
}): Promise<void> {
  const timeLabel = opts.hoursUntil <= 1 ? 'daqui 1 hora' : 'amanhã';
  const message = `Oi ${opts.name}! 👋\n\nLembrete: sua reunião é ${timeLabel} (${opts.dateTime}).\n\nConfirma que vai? [Sim ✅] [Remarcar 📅]`;

  await sendMessage({ to: opts.phone, text: message });
}
