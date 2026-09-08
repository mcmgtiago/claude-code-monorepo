import { callLLM, type LLMMessage } from '../services/llm.js';
import { supabase, auditLog } from '../services/supabase.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROMPT_TEMPLATE = readFileSync(
  resolve(__dirname, '../prompts/accounting/agent06.system.md'),
  'utf-8'
);

export interface Agent06Context {
  tenantId: string;
  tenantName: string;
  contactId: string;
  conversationId: string;
  contactName?: string;
  message: string;
}

interface TaskResult {
  has_task: boolean;
  task: { title: string; description?: string; responsavel: string; prazo?: string; prioridade: string } | null;
  reply_to_client: string;
}

export async function runAgent06(ctx: Agent06Context): Promise<{
  replyText: string;
  taskCreated: boolean;
  tokensInput: number;
  tokensOutput: number;
}> {
  // Buscar tarefas abertas do cliente
  const { data: openTasks } = await supabase
    .from('ariel_tasks')
    .select('title, due_date, priority')
    .eq('contact_id', ctx.contactId)
    .in('status', ['open', 'in_progress'])
    .limit(5);

  const systemPrompt = PROMPT_TEMPLATE
    .replace('{{ tenant_name }}', ctx.tenantName)
    .replace('{{ client_name }}', ctx.contactName || 'Cliente')
    .replace('{{ message }}', ctx.message)
    .replace('{{ open_tasks }}', JSON.stringify(openTasks || []))
    .replace('{{ current_datetime }}', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));

  const response = await callLLM({
    system: systemPrompt,
    messages: [{ role: 'user', content: ctx.message }],
    temperature: 0.2,
    maxTokens: 512,
  });

  let result: TaskResult;
  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    result = JSON.parse(jsonMatch![0]);
  } catch {
    return { replyText: '', taskCreated: false, tokensInput: response.inputTokens, tokensOutput: response.outputTokens };
  }

  let taskCreated = false;
  if (result.has_task && result.task) {
    await supabase.from('ariel_tasks').insert({
      tenant_id: ctx.tenantId,
      contact_id: ctx.contactId,
      conversation_id: ctx.conversationId,
      title: result.task.title,
      description: result.task.description,
      priority: result.task.prioridade || 'normal',
      due_date: result.task.prazo || null,
      source: 'agent06',
      source_metadata: { responsavel: result.task.responsavel },
    });
    taskCreated = true;

    await auditLog({
      tenantId: ctx.tenantId,
      actor: 'agent06',
      action: 'task.created',
      resourceType: 'task',
      resourceId: ctx.contactId,
      payload: result.task,
    });
  }

  return {
    replyText: result.reply_to_client || '',
    taskCreated,
    tokensInput: response.inputTokens,
    tokensOutput: response.outputTokens,
  };
}

/**
 * Gera lembretes contextualizados para tarefas vencendo
 * Chamado pelo scheduler diário
 */
export async function generateTaskReminders(tenantId: string): Promise<Array<{ contactId: string; phone: string; message: string }>> {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const { data: dueTasks } = await supabase
    .from('ariel_tasks')
    .select('*, ariel_contacts(name, whatsapp_number)')
    .eq('tenant_id', tenantId)
    .in('status', ['open', 'in_progress'])
    .lte('due_date', tomorrow)
    .gte('due_date', today);

  if (!dueTasks?.length) return [];

  const reminders: Array<{ contactId: string; phone: string; message: string }> = [];

  for (const task of dueTasks) {
    const contact = (task as any).ariel_contacts;
    if (!contact?.whatsapp_number) continue;

    const name = contact.name || 'Olá';
    const message = `Oi ${name}! 👋\n\nLembrete: "${task.title}" vence ${task.due_date === today ? 'HOJE' : 'amanhã'}.\n\nPrecisa de ajuda com isso?`;

    reminders.push({
      contactId: task.contact_id,
      phone: contact.whatsapp_number,
      message,
    });
  }

  return reminders;
}
