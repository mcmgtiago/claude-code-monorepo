import { callLLM, type LLMMessage, type LLMTool } from '../services/llm.js';
import {
  updateContact,
  updateLeadScore,
  createProposal,
  getRecentMessages,
  auditLog,
} from '../services/supabase.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Carregar prompt template
const PROMPT_TEMPLATE = readFileSync(
  resolve(__dirname, '../prompts/accounting/agent01.system.md'),
  'utf-8'
);

// ============================================
// TOOLS que o Agent 01 pode chamar
// ============================================

const TOOLS: LLMTool[] = [
  {
    name: 'save_lead_data',
    description: 'Salva dados coletados do lead (tipo empresa, faturamento, funcionários, urgência)',
    input_schema: {
      type: 'object',
      properties: {
        nome: { type: 'string', description: 'Nome do lead' },
        tipo_empresa: {
          type: 'string',
          enum: ['mei', 'simples', 'lucro_presumido', 'lucro_real', 'vai_abrir'],
          description: 'Regime tributário atual ou desejado',
        },
        faturamento_mensal: {
          type: 'number',
          description: 'Faturamento mensal aproximado em reais',
        },
        funcionarios: {
          type: 'number',
          description: 'Quantidade de funcionários',
        },
        urgencia: {
          type: 'string',
          enum: ['migrar_agora', 'abrir_agora', 'proximos_3_meses', 'pesquisando'],
          description: 'Nível de urgência do lead',
        },
        setor: {
          type: 'string',
          description: 'Setor/atividade da empresa (ex: clínica, e-commerce, consultoria)',
        },
      },
      required: [],
    },
  },
  {
    name: 'generate_proposal',
    description: 'Gera proposta comercial quando lead já está qualificado (score >= 50)',
    input_schema: {
      type: 'object',
      properties: {
        regime: {
          type: 'string',
          enum: ['mei', 'simples_ate_50k', 'simples_50_150k', 'simples_150_500k', 'lucro_presumido', 'lucro_real'],
        },
        monthly_fee_cents: { type: 'number', description: 'Valor mensal em centavos' },
        setup_fee_cents: { type: 'number', description: 'Valor de setup em centavos' },
        services: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de serviços incluídos',
        },
        proposal_text: {
          type: 'string',
          description: 'Texto da proposta formatada para enviar no WhatsApp',
        },
      },
      required: ['regime', 'monthly_fee_cents', 'proposal_text'],
    },
  },
  {
    name: 'escalate_to_human',
    description: 'Escalação para atendente humano quando lead pede ou assunto é fora do escopo',
    input_schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Motivo da escalação' },
        summary: { type: 'string', description: 'Resumo da conversa até agora' },
      },
      required: ['reason'],
    },
  },
];

// ============================================
// CONFIGURAÇÃO DE SCORING
// ============================================

interface LeadData {
  nome?: string;
  tipo_empresa?: string;
  faturamento_mensal?: number;
  funcionarios?: number;
  urgencia?: string;
  setor?: string;
}

function calculateScore(data: LeadData): { score: number; classification: 'hot' | 'morno' | 'frio' } {
  let score = 0;

  // Regime tributário
  switch (data.tipo_empresa) {
    case 'lucro_real': score += 30; break;
    case 'lucro_presumido': score += 25; break;
    case 'simples':
      score += (data.faturamento_mensal && data.faturamento_mensal > 150000) ? 20 : 15;
      break;
    case 'mei': score += 10; break;
    case 'vai_abrir': score += 20; break;
  }

  // Faturamento
  const fat = data.faturamento_mensal || 0;
  if (fat > 300000) score += 40;
  else if (fat > 150000) score += 30;
  else if (fat > 50000) score += 20;
  else if (fat > 20000) score += 10;
  else score += 5;

  // Urgência
  switch (data.urgencia) {
    case 'migrar_agora': score += 30; break;
    case 'abrir_agora': score += 25; break;
    case 'proximos_3_meses': score += 15; break;
    case 'pesquisando': score += 5; break;
  }

  // Funcionários
  const func = data.funcionarios || 0;
  if (func > 10) score += 10;
  else if (func >= 5) score += 8;
  else if (func >= 1) score += 5;
  else score += 2;

  // Classificação
  const classification = score >= 80 ? 'hot' : score >= 50 ? 'morno' : 'frio';

  return { score, classification };
}

// ============================================
// EXECUÇÃO DO AGENTE
// ============================================

export interface AgentContext {
  tenantId: string;
  tenantName: string;
  contactId: string;
  conversationId: string;
  contactData: Record<string, unknown>;
  pushName?: string;
  message: string;
}

export async function runAgent01(ctx: AgentContext): Promise<{
  replyText: string;
  score?: number;
  classification?: string;
  proposalGenerated?: boolean;
  escalated?: boolean;
  tokensInput: number;
  tokensOutput: number;
}> {
  const startTime = Date.now();

  // Carregar histórico
  const recentMessages = await getRecentMessages(ctx.conversationId, 15);

  // Montar mensagens para o LLM
  const history: LLMMessage[] = recentMessages.map((msg) => ({
    role: msg.direction === 'in' ? 'user' : 'assistant',
    content: msg.content_text || '[mídia]',
  }));

  // Adicionar mensagem atual
  history.push({ role: 'user', content: ctx.message });

  // Renderizar system prompt
  const collectedData = (ctx.contactData as Record<string, unknown>) || {};
  const systemPrompt = PROMPT_TEMPLATE
    .replace('{{ tenant_name }}', ctx.tenantName)
    .replace('{{ push_name }}', ctx.pushName || 'não informado')
    .replace('{{ collected_data }}', JSON.stringify(collectedData))
    .replace('{{ conversation_history }}', `${recentMessages.length} mensagens anteriores`)
    .replace('{{ current_datetime }}', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));

  // Chamar LLM
  const response = await callLLM({
    system: systemPrompt,
    messages: history,
    tools: TOOLS,
    temperature: 0.4,
  });

  let replyText = response.text;
  let score: number | undefined;
  let classification: string | undefined;
  let proposalGenerated = false;
  let escalated = false;

  // Processar tool calls
  for (const toolCall of response.toolCalls) {
    switch (toolCall.name) {
      case 'save_lead_data': {
        const newData = { ...collectedData, ...toolCall.input };
        await updateContact(ctx.contactId, { data: newData });

        // Recalcular score
        const scoring = calculateScore(newData as LeadData);
        score = scoring.score;
        classification = scoring.classification;
        await updateLeadScore(ctx.contactId, scoring.score, scoring.classification);

        await auditLog({
          tenantId: ctx.tenantId,
          actor: 'agent01',
          action: 'lead.data_saved',
          resourceType: 'contact',
          resourceId: ctx.contactId,
          payload: { score, classification, data: newData },
        });
        break;
      }

      case 'generate_proposal': {
        const input = toolCall.input as {
          regime: string;
          monthly_fee_cents: number;
          setup_fee_cents?: number;
          services?: string[];
          proposal_text: string;
        };

        await createProposal({
          tenantId: ctx.tenantId,
          contactId: ctx.contactId,
          regime: input.regime,
          monthlyFeeCents: input.monthly_fee_cents,
          setupFeeCents: input.setup_fee_cents || 0,
          services: input.services || [],
          messageText: input.proposal_text,
        });

        // Atualizar contato
        await updateContact(ctx.contactId, { type: 'lead', classification: 'hot' });
        proposalGenerated = true;

        // Usar o texto da proposta como resposta se não tiver outro texto
        if (!replyText || replyText.trim() === '') {
          replyText = input.proposal_text;
        }

        await auditLog({
          tenantId: ctx.tenantId,
          actor: 'agent01',
          action: 'proposal.generated',
          resourceType: 'contact',
          resourceId: ctx.contactId,
          payload: { regime: input.regime, monthly_fee_cents: input.monthly_fee_cents },
        });
        break;
      }

      case 'escalate_to_human': {
        const input = toolCall.input as { reason: string; summary?: string };
        escalated = true;

        // TODO: Notificar humano (push notification ou mensagem interna)
        await auditLog({
          tenantId: ctx.tenantId,
          actor: 'agent01',
          action: 'lead.escalated',
          resourceType: 'contact',
          resourceId: ctx.contactId,
          payload: input,
        });
        break;
      }
    }
  }

  const latencyMs = Date.now() - startTime;

  return {
    replyText,
    score,
    classification,
    proposalGenerated,
    escalated,
    tokensInput: response.inputTokens,
    tokensOutput: response.outputTokens,
  };
}
