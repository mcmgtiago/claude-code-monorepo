import { callLLM, type LLMMessage } from '../services/llm.js';
import { getRecentMessages, auditLog, supabase } from '../services/supabase.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROMPT_TEMPLATE = readFileSync(
  resolve(__dirname, '../prompts/accounting/agent04.system.md'),
  'utf-8'
);

// Carregar KB do banco
async function loadKnowledgeBase(tenantId: string): Promise<string> {
  const { data, error } = await supabase
    .from('ariel_knowledge_base')
    .select('intent, keywords, response_template')
    .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
    .eq('enabled', true);

  if (error || !data?.length) {
    return 'Nenhum artigo na base de conhecimento.';
  }

  return data
    .map((item) => `[${item.intent}]\nKeywords: ${item.keywords.join(', ')}\nResposta: ${item.response_template}`)
    .join('\n\n---\n\n');
}

export interface Agent04Context {
  tenantId: string;
  tenantName: string;
  contactId: string;
  conversationId: string;
  contactData: Record<string, unknown>;
  contactName?: string;
  message: string;
}

export async function runAgent04(ctx: Agent04Context): Promise<{
  replyText: string;
  escalated: boolean;
  intent?: string;
  tokensInput: number;
  tokensOutput: number;
}> {
  const recentMessages = await getRecentMessages(ctx.conversationId, 8);
  const kb = await loadKnowledgeBase(ctx.tenantId);

  const history: LLMMessage[] = recentMessages.map((msg) => ({
    role: msg.direction === 'in' ? 'user' : 'assistant',
    content: msg.content_text || '[mídia]',
  }));
  history.push({ role: 'user', content: ctx.message });

  const activeServices = (ctx.contactData as Record<string, unknown>)?.tipo_empresa
    ? `Regime: ${(ctx.contactData as Record<string, unknown>).tipo_empresa}`
    : 'Não informado';

  const systemPrompt = PROMPT_TEMPLATE
    .replace('{{ tenant_name }}', ctx.tenantName)
    .replace('{{ knowledge_base }}', kb)
    .replace('{{ client_name }}', ctx.contactName || 'Cliente')
    .replace('{{ active_services }}', activeServices)
    .replace('{{ client_data }}', JSON.stringify(ctx.contactData))
    .replace('{{ current_message }}', ctx.message)
    .replace('{{ current_datetime }}', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));

  const response = await callLLM({
    system: systemPrompt,
    messages: history,
    temperature: 0.2,
    maxTokens: 512,
  });

  let replyText = response.text;
  let escalated = false;

  // Detectar se precisa escalar
  if (replyText.startsWith('[ESCALAR]')) {
    escalated = true;
    const parts = replyText.split('\n\n');
    const reason = parts[0].replace('[ESCALAR]', '').trim();

    // Mensagem para o cliente (após o motivo)
    replyText = parts.slice(1).join('\n\n') ||
      'Vou encaminhar sua questão para o especialista. Ele te retorna em breve! 🤝';

    await auditLog({
      tenantId: ctx.tenantId,
      actor: 'agent04',
      action: 'support.escalated',
      resourceType: 'contact',
      resourceId: ctx.contactId,
      payload: { reason, message: ctx.message },
    });

    // TODO: Notificar humano via push/WhatsApp interno
  } else {
    await auditLog({
      tenantId: ctx.tenantId,
      actor: 'agent04',
      action: 'support.resolved',
      resourceType: 'contact',
      resourceId: ctx.contactId,
      payload: { message: ctx.message },
    });
  }

  return {
    replyText,
    escalated,
    tokensInput: response.inputTokens,
    tokensOutput: response.outputTokens,
  };
}
