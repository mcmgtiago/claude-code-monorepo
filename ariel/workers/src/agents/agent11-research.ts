import { callLLM } from '../services/llm.js';
import { auditLog } from '../services/supabase.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROMPT_TEMPLATE = readFileSync(
  resolve(__dirname, '../prompts/accounting/agent11.system.md'),
  'utf-8'
);

/**
 * Agent 11 — Pesquisa Técnica
 * Para uso INTERNO do time do escritório.
 * Ativado por comando especial: "@ariel_tech [pergunta]"
 */

export interface Agent11Context {
  tenantId: string;
  tenantName: string;
  userName: string;
  userRole: string;
  question: string;
}

export async function runAgent11(ctx: Agent11Context): Promise<{
  replyText: string;
  tokensInput: number;
  tokensOutput: number;
}> {
  const systemPrompt = PROMPT_TEMPLATE
    .replace('{{ tenant_name }}', ctx.tenantName)
    .replace('{{ user_name }}', ctx.userName)
    .replace('{{ user_role }}', ctx.userRole)
    .replace('{{ question }}', ctx.question)
    .replace('{{ current_datetime }}', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));

  const response = await callLLM({
    system: systemPrompt,
    messages: [{ role: 'user', content: ctx.question }],
    temperature: 0.2,
    maxTokens: 1024,
  });

  await auditLog({
    tenantId: ctx.tenantId,
    actor: 'agent11',
    action: 'research.answered',
    payload: { question: ctx.question, user: ctx.userName },
  });

  return {
    replyText: response.text,
    tokensInput: response.inputTokens,
    tokensOutput: response.outputTokens,
  };
}
