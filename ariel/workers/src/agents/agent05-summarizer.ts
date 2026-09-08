import { callLLM, type LLMMessage } from '../services/llm.js';
import { getRecentMessages, supabase, auditLog } from '../services/supabase.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROMPT_TEMPLATE = readFileSync(
  resolve(__dirname, '../prompts/accounting/agent05.system.md'),
  'utf-8'
);

export interface Agent05Context {
  tenantId: string;
  tenantName: string;
  contactId: string;
  conversationId: string;
  contactName?: string;
  message: string;
}

interface SummaryResult {
  resumo_curto: string;
  decisoes: Array<{ decisao: string; responsavel: string }>;
  acoes: Array<{ acao: string; responsavel: string; prazo: string; prioridade: string }>;
  pendencias: string[];
  sentimento: string;
  mensagem_resumo: string;
}

export async function runAgent05(ctx: Agent05Context): Promise<{
  replyText: string;
  tasksCreated: number;
  tokensInput: number;
  tokensOutput: number;
}> {
  // Pegar últimas 20 mensagens para resumir
  const recentMessages = await getRecentMessages(ctx.conversationId, 20);

  const conversationContent = recentMessages
    .map((m) => `[${m.direction === 'in' ? 'Cliente' : 'Escritório'}]: ${m.content_text || '[mídia]'}`)
    .join('\n');

  const systemPrompt = PROMPT_TEMPLATE
    .replace('{{ tenant_name }}', ctx.tenantName)
    .replace('{{ client_name }}', ctx.contactName || 'Cliente')
    .replace('{{ conversation_content }}', conversationContent)
    .replace('{{ current_datetime }}', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));

  const response = await callLLM({
    system: systemPrompt,
    messages: [
      { role: 'user', content: 'Resuma esta conversa e extraia ações pendentes.' },
    ],
    temperature: 0.2,
    maxTokens: 1500,
  });

  let result: SummaryResult;
  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    result = JSON.parse(jsonMatch![0]);
  } catch {
    return {
      replyText: 'Conversa resumida, mas não consegui extrair ações estruturadas. Pode me dar mais contexto?',
      tasksCreated: 0,
      tokensInput: response.inputTokens,
      tokensOutput: response.outputTokens,
    };
  }

  // Criar tarefas a partir das ações
  let tasksCreated = 0;
  for (const acao of result.acoes) {
    await supabase.from('ariel_tasks').insert({
      tenant_id: ctx.tenantId,
      contact_id: ctx.contactId,
      conversation_id: ctx.conversationId,
      title: acao.acao,
      priority: acao.prioridade || 'normal',
      due_date: acao.prazo || null,
      source: 'agent05',
      source_metadata: { responsavel: acao.responsavel },
    });
    tasksCreated++;
  }

  await auditLog({
    tenantId: ctx.tenantId,
    actor: 'agent05',
    action: 'conversation.summarized',
    resourceType: 'conversation',
    resourceId: ctx.conversationId,
    payload: { decisoes: result.decisoes.length, acoes: result.acoes.length, sentimento: result.sentimento },
  });

  return {
    replyText: result.mensagem_resumo,
    tasksCreated,
    tokensInput: response.inputTokens,
    tokensOutput: response.outputTokens,
  };
}
