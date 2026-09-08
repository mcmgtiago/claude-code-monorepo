import { callLLM } from '../services/llm.js';
import { supabase, auditLog } from '../services/supabase.js';
import { sendMessage } from '../services/whatsapp.js';

/**
 * Agent 10 — Newsletter & Comunicação Segmentada
 * Envia updates relevantes baseados no perfil do cliente.
 * Chamado pelo scheduler (terça/quinta 14h) ou por evento.
 */

interface CampaignTarget {
  contactId: string;
  phone: string;
  name: string;
  data: Record<string, unknown>;
}

/**
 * Envia campanha segmentada para clientes de um tenant
 */
export async function runNewsletter(tenantId: string, opts: {
  topic: string;          // ex: "nova_lei_simples", "prazo_irpf", "dica_fiscal"
  segment?: string;       // ex: "simples", "mei", "lucro_real"
  customMessage?: string; // mensagem override (se não, IA gera)
}): Promise<{ sent: number; failed: number }> {
  // Buscar contatos do segmento
  let query = supabase
    .from('ariel_contacts')
    .select('id, whatsapp_number, name, data')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .in('type', ['client', 'lead']);

  if (opts.segment) {
    query = query.contains('data', { tipo_empresa: opts.segment });
  }

  const { data: contacts } = await query;
  if (!contacts?.length) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const contact of contacts as CampaignTarget[]) {
    let message = opts.customMessage;

    if (!message) {
      // Gerar mensagem personalizada via IA
      const response = await callLLM({
        system: `Você é ARIEL. Gere uma mensagem curta de newsletter (max 150 palavras) sobre "${opts.topic}" para ${contact.name || 'cliente'}. Perfil: ${JSON.stringify(contact.data)}. Tom: informativo, útil, WhatsApp. Não pareça spam. Termine com pergunta ou CTA leve.`,
        messages: [{ role: 'user', content: `Gere a mensagem de newsletter sobre: ${opts.topic}` }],
        temperature: 0.5,
        maxTokens: 256,
      });
      message = response.text;
    }

    const result = await sendMessage({ to: contact.phone, text: message });

    if (result.success) {
      sent++;
    } else {
      failed++;
    }

    // Rate limit: 1 msg a cada 2s para não ser bloqueado
    await new Promise((r) => setTimeout(r, 2000));
  }

  await auditLog({
    tenantId,
    actor: 'agent10',
    action: 'newsletter.sent',
    payload: { topic: opts.topic, segment: opts.segment, sent, failed },
  });

  return { sent, failed };
}

/**
 * Gera e envia update fiscal relevante (evento automático)
 */
export async function sendFiscalUpdate(tenantId: string, opts: {
  title: string;
  description: string;
  affectsRegimes: string[];
}): Promise<{ sent: number }> {
  return runNewsletter(tenantId, {
    topic: opts.title,
    segment: opts.affectsRegimes[0], // simplificado: pega primeiro regime
    customMessage: `📢 ${opts.title}\n\n${opts.description}\n\nAlguma dúvida? Responde aqui!`,
  });
}
