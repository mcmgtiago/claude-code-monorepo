import { callLLM, type LLMMessage } from '../services/llm.js';
import { supabase, auditLog } from '../services/supabase.js';
import { sendMessage } from '../services/whatsapp.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROMPT_TEMPLATE = readFileSync(
  resolve(__dirname, '../prompts/accounting/agent09.system.md'),
  'utf-8'
);

interface Obligation {
  id: string;
  tenant_id: string;
  contact_id: string;
  obligation_type: string;
  due_date: string;
  estimated_value_cents: number | null;
  status: string;
  alert_sent_d5: boolean;
  alert_sent_d3: boolean;
  alert_sent_d1: boolean;
  alert_sent_d0: boolean;
}

interface ContactInfo {
  id: string;
  name: string;
  whatsapp_number: string;
  data: Record<string, unknown>;
}

/**
 * Roda o scan de compliance para um tenant.
 * Chamado pelo scheduler diário (6h Brasília).
 */
export async function runComplianceScan(tenantId: string): Promise<{
  alertsSent: number;
  obligationsChecked: number;
}> {
  let alertsSent = 0;

  // Buscar obrigações pendentes dos próximos 7 dias
  const today = new Date();
  const in7days = new Date(today);
  in7days.setDate(in7days.getDate() + 7);

  const { data: obligations, error } = await supabase
    .from('ariel_fiscal_obligations')
    .select('*')
    .eq('tenant_id', tenantId)
    .in('status', ['pending', 'in_progress'])
    .gte('due_date', today.toISOString().split('T')[0])
    .lte('due_date', in7days.toISOString().split('T')[0]);

  if (error || !obligations?.length) {
    return { alertsSent: 0, obligationsChecked: 0 };
  }

  // Buscar nome do tenant
  const { data: tenant } = await supabase
    .from('ariel_tenants')
    .select('name')
    .eq('id', tenantId)
    .single();

  for (const ob of obligations as Obligation[]) {
    const daysUntil = Math.ceil(
      (new Date(ob.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Decidir qual alerta enviar (se ainda não foi enviado)
    let alertLevel: string | null = null;

    if (daysUntil <= 0 && !ob.alert_sent_d0) alertLevel = 'd0';
    else if (daysUntil === 1 && !ob.alert_sent_d1) alertLevel = 'd1';
    else if (daysUntil <= 3 && !ob.alert_sent_d3) alertLevel = 'd3';
    else if (daysUntil <= 5 && !ob.alert_sent_d5) alertLevel = 'd5';

    if (!alertLevel) continue; // Já enviou este alerta

    // Buscar contato
    if (!ob.contact_id) continue;
    const { data: contact } = await supabase
      .from('ariel_contacts')
      .select('id, name, whatsapp_number, data')
      .eq('id', ob.contact_id)
      .single();

    if (!contact) continue;

    // Gerar mensagem de alerta via LLM
    const alertMessage = await generateAlertMessage({
      tenantName: tenant?.name || 'Escritório',
      clientName: contact.name || 'Cliente',
      obligationType: ob.obligation_type,
      dueDate: ob.due_date,
      daysUntil,
      regime: (contact.data as Record<string, unknown>)?.tipo_empresa as string || '',
      estimatedValue: ob.estimated_value_cents
        ? `R$ ${(ob.estimated_value_cents / 100).toFixed(2)}`
        : 'a calcular',
      dataStatus: 'dados disponíveis', // simplificado para MVP
    });

    // Enviar alerta via WhatsApp
    await sendMessage({
      to: contact.whatsapp_number,
      text: alertMessage,
    });

    // Marcar alerta como enviado
    const updateField = `alert_sent_${alertLevel}`;
    await supabase
      .from('ariel_fiscal_obligations')
      .update({ [updateField]: true })
      .eq('id', ob.id);

    alertsSent++;

    await auditLog({
      tenantId,
      actor: 'agent09',
      action: `compliance.alert_${alertLevel}`,
      resourceType: 'fiscal_obligation',
      resourceId: ob.id,
      payload: {
        obligation_type: ob.obligation_type,
        due_date: ob.due_date,
        days_until: daysUntil,
        contact_name: contact.name,
      },
    });
  }

  return {
    alertsSent,
    obligationsChecked: obligations.length,
  };
}

/**
 * Gera mensagem de alerta personalizada via Opus 4.8
 */
async function generateAlertMessage(opts: {
  tenantName: string;
  clientName: string;
  obligationType: string;
  dueDate: string;
  daysUntil: number;
  regime: string;
  estimatedValue: string;
  dataStatus: string;
}): Promise<string> {
  const systemPrompt = PROMPT_TEMPLATE
    .replace('{{ tenant_name }}', opts.tenantName)
    .replace('{{ client_name }}', opts.clientName)
    .replace('{{ obligation_type }}', opts.obligationType)
    .replace('{{ due_date }}', opts.dueDate)
    .replace('{{ days_until }}', String(opts.daysUntil))
    .replace('{{ regime }}', opts.regime)
    .replace('{{ estimated_value }}', opts.estimatedValue)
    .replace('{{ data_status }}', opts.dataStatus);

  const response = await callLLM({
    system: systemPrompt,
    messages: [
      { role: 'user', content: `Gere o alerta D-${Math.max(0, opts.daysUntil)} para ${opts.clientName} sobre ${opts.obligationType} vencendo em ${opts.dueDate}.` },
    ],
    temperature: 0.3,
    maxTokens: 256,
  });

  return response.text;
}

/**
 * Gera relatório diário de compliance para o dono do escritório
 */
export async function generateComplianceReport(tenantId: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const in7days = new Date();
  in7days.setDate(in7days.getDate() + 7);

  // Obrigações da semana
  const { data: upcoming } = await supabase
    .from('ariel_fiscal_obligations')
    .select('*, contacts(name)')
    .eq('tenant_id', tenantId)
    .in('status', ['pending', 'in_progress'])
    .gte('due_date', today)
    .lte('due_date', in7days.toISOString().split('T')[0])
    .order('due_date', { ascending: true });

  // Obrigações atrasadas
  const { data: late } = await supabase
    .from('ariel_fiscal_obligations')
    .select('*, contacts(name)')
    .eq('tenant_id', tenantId)
    .eq('status', 'pending')
    .lt('due_date', today);

  let report = `📅 COMPLIANCE — Relatório do Dia\n\n`;

  if (late?.length) {
    report += `🚨 ATRASADAS (${late.length}):\n`;
    for (const ob of late) {
      report += `• ${ob.obligation_type.toUpperCase()} — ${(ob as any).contacts?.name || 'Cliente'} (venceu ${ob.due_date})\n`;
    }
    report += '\n';
  }

  if (upcoming?.length) {
    report += `⏰ PRÓXIMOS 7 DIAS (${upcoming.length}):\n`;
    for (const ob of upcoming) {
      const daysUntil = Math.ceil(
        (new Date(ob.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const urgency = daysUntil <= 1 ? '🔴' : daysUntil <= 3 ? '🟡' : '🟢';
      report += `${urgency} ${ob.obligation_type.toUpperCase()} — ${(ob as any).contacts?.name || 'Cliente'} (vence em ${daysUntil} dias)\n`;
    }
  } else {
    report += `✅ Nenhuma obrigação nos próximos 7 dias. Tudo em dia!\n`;
  }

  return report;
}
