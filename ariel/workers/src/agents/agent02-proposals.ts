import { callLLM, type LLMMessage } from '../services/llm.js';
import {
  getRecentMessages,
  createProposal,
  updateContact,
  auditLog,
} from '../services/supabase.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROMPT_TEMPLATE = readFileSync(
  resolve(__dirname, '../prompts/accounting/agent02.system.md'),
  'utf-8'
);

// Tabela de preços (em centavos)
const PRICING: Record<string, { monthly: number; setup: number }> = {
  mei: { monthly: 19900, setup: 0 },
  simples_ate_50k: { monthly: 39900, setup: 50000 },
  simples_50_150k: { monthly: 59900, setup: 100000 },
  simples_150_500k: { monthly: 79900, setup: 150000 },
  lucro_presumido: { monthly: 99900, setup: 200000 },
  lucro_real: { monthly: 149900, setup: 300000 },
};

function detectRegime(data: Record<string, unknown>): string {
  const tipo = (data.tipo_empresa as string) || '';
  const fat = (data.faturamento_mensal as number) || 0;

  if (tipo === 'mei') return 'mei';
  if (tipo === 'lucro_real') return 'lucro_real';
  if (tipo === 'lucro_presumido') return 'lucro_presumido';

  // Simples — baseado no faturamento
  if (fat > 150000) return 'simples_150_500k';
  if (fat > 50000) return 'simples_50_150k';
  return 'simples_ate_50k';
}

export interface Agent02Context {
  tenantId: string;
  tenantName: string;
  contactId: string;
  conversationId: string;
  contactData: Record<string, unknown>;
  contactName?: string;
  contactScore: number;
  contactClassification: string;
  message: string;
}

export async function runAgent02(ctx: Agent02Context): Promise<{
  replyText: string;
  proposalGenerated: boolean;
  tokensInput: number;
  tokensOutput: number;
}> {
  const recentMessages = await getRecentMessages(ctx.conversationId, 10);

  const history: LLMMessage[] = recentMessages.map((msg) => ({
    role: msg.direction === 'in' ? 'user' : 'assistant',
    content: msg.content_text || '[mídia]',
  }));
  history.push({ role: 'user', content: ctx.message });

  const regime = detectRegime(ctx.contactData);
  const pricing = PRICING[regime] || PRICING.simples_ate_50k;

  const systemPrompt = PROMPT_TEMPLATE
    .replace('{{ tenant_name }}', ctx.tenantName)
    .replace('{{ lead_name }}', ctx.contactName || 'Lead')
    .replace('{{ lead_data }}', JSON.stringify(ctx.contactData))
    .replace('{{ lead_score }}', String(ctx.contactScore))
    .replace('{{ classification }}', ctx.contactClassification)
    .replace('{{ conversation_history }}', `${recentMessages.length} mensagens anteriores`)
    .replace('{{ current_datetime }}', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));

  const response = await callLLM({
    system: systemPrompt,
    messages: history,
    temperature: 0.5,
    maxTokens: 1024,
  });

  const replyText = response.text;

  // Salvar proposta no banco
  await createProposal({
    tenantId: ctx.tenantId,
    contactId: ctx.contactId,
    regime,
    monthlyFeeCents: pricing.monthly,
    setupFeeCents: pricing.setup,
    services: [
      'Escrituração fiscal completa',
      'Guias de impostos automáticas',
      'E-Social + FGTS + IRRF',
      'Suporte WhatsApp ilimitado',
      'Prazos sem atraso (garantia)',
    ],
    messageText: replyText,
  });

  await updateContact(ctx.contactId, { type: 'lead', classification: 'hot' });

  await auditLog({
    tenantId: ctx.tenantId,
    actor: 'agent02',
    action: 'proposal.generated',
    resourceType: 'contact',
    resourceId: ctx.contactId,
    payload: { regime, monthly: pricing.monthly, setup: pricing.setup },
  });

  return {
    replyText,
    proposalGenerated: true,
    tokensInput: response.inputTokens,
    tokensOutput: response.outputTokens,
  };
}
