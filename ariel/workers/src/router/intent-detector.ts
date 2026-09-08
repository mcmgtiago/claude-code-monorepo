/**
 * Intent Detector — Detecta o que o lead/cliente quer
 * e decide qual agente acionar.
 *
 * Lógica simples para MVP (sem LLM extra, baseado em regras + contexto):
 * - Novo contato → Agent 01 (Lead Qualification)
 * - Contato existente tipo 'client' → Agent 04 (Support)
 * - Mensagem com mídia (imagem/doc) → Agent 07 (Documentos)
 * - Mensagem contém keywords de proposta → Agent 02 (Propostas)
 * - Conversa em andamento com agent01 → Continua agent01
 */

export type AgentId = 'agent01' | 'agent02' | 'agent04' | 'agent07' | 'agent09';

export interface IntentResult {
  agentId: AgentId;
  confidence: number;
  reason: string;
}

export interface IntentContext {
  isNewContact: boolean;
  contactType: 'lead' | 'client' | 'lost';
  messageType: 'text' | 'image' | 'audio' | 'document' | 'video';
  messageText: string;
  lastAgentId?: string;
  contactScore?: number;
  contactClassification?: string;
}

export function detectIntent(ctx: IntentContext): IntentResult {
  const text = ctx.messageText.toLowerCase().trim();

  // 1. Novo contato → sempre qualificação
  if (ctx.isNewContact) {
    return { agentId: 'agent01', confidence: 1.0, reason: 'novo_contato' };
  }

  // 2. Imagem ou documento de cliente existente → processamento de docs
  if (ctx.contactType === 'client' && (ctx.messageType === 'image' || ctx.messageType === 'document')) {
    return { agentId: 'agent07', confidence: 0.9, reason: 'cliente_enviou_midia' };
  }

  // 3. Lead em qualificação → continua com agent01
  if (ctx.contactType === 'lead' && ctx.lastAgentId === 'agent01') {
    // A menos que pergunte preço explicitamente
    if (matchesProposalKeywords(text)) {
      return { agentId: 'agent02', confidence: 0.85, reason: 'lead_pediu_preco' };
    }
    return { agentId: 'agent01', confidence: 0.95, reason: 'lead_em_qualificacao' };
  }

  // 4. Lead já qualificado → proposta
  if (ctx.contactType === 'lead' && (ctx.contactClassification === 'hot' || ctx.contactClassification === 'morno')) {
    if (matchesProposalKeywords(text)) {
      return { agentId: 'agent02', confidence: 0.9, reason: 'lead_qualificado_pediu_proposta' };
    }
  }

  // 5. Cliente existente → suporte
  if (ctx.contactType === 'client') {
    return { agentId: 'agent04', confidence: 0.85, reason: 'cliente_existente' };
  }

  // 6. Lead sem contexto anterior → qualificação
  if (ctx.contactType === 'lead') {
    return { agentId: 'agent01', confidence: 0.8, reason: 'lead_sem_contexto' };
  }

  // Default: suporte (catch-all)
  return { agentId: 'agent04', confidence: 0.5, reason: 'fallback' };
}

// Keywords que indicam interesse em proposta/preço
function matchesProposalKeywords(text: string): boolean {
  const keywords = [
    'quanto custa', 'preço', 'preco', 'valor',
    'proposta', 'orçamento', 'orcamento',
    'planos', 'pacote', 'mensalidade',
    'quanto é', 'quanto e', 'quanto fica',
    'tabela', 'investimento',
  ];
  return keywords.some((kw) => text.includes(kw));
}
