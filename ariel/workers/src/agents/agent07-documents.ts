import { callLLM, type LLMMessage } from '../services/llm.js';
import { supabase, auditLog } from '../services/supabase.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROMPT_TEMPLATE = readFileSync(
  resolve(__dirname, '../prompts/accounting/agent07.system.md'),
  'utf-8'
);

export interface Agent07Context {
  tenantId: string;
  tenantName: string;
  contactId: string;
  conversationId: string;
  contactName?: string;
  message: string;       // caption ou texto da mensagem
  mediaUrl?: string;     // URL da imagem/documento
  mediaType: 'image' | 'document' | 'text';
}

interface DocumentResult {
  document_type: string;
  confidence: number;
  extracted_data: Record<string, unknown>;
  validation_errors: string[];
  status: 'auto_approved' | 'pending_review' | 'rejected';
  client_message: string;
}

export async function runAgent07(ctx: Agent07Context): Promise<{
  replyText: string;
  documentSaved: boolean;
  documentType?: string;
  confidence?: number;
  tokensInput: number;
  tokensOutput: number;
}> {
  // Montar prompt
  const systemPrompt = PROMPT_TEMPLATE
    .replace('{{ tenant_name }}', ctx.tenantName)
    .replace('{{ client_name }}', ctx.contactName || 'Cliente')
    .replace('{{ media_type }}', ctx.mediaType)
    .replace('{{ caption }}', ctx.message || 'nenhuma');

  // Montar mensagem com imagem (se houver)
  const userContent: LLMMessage['content'] = [];

  if (ctx.mediaUrl && ctx.mediaType === 'image') {
    // Claude Vision — enviar imagem como URL
    userContent.push({
      type: 'image',
      source: { type: 'url', url: ctx.mediaUrl },
    } as any);
  }

  if (ctx.message) {
    userContent.push({ type: 'text', text: ctx.message } as any);
  } else {
    userContent.push({ type: 'text', text: 'Documento enviado. Identifique e extraia os dados.' } as any);
  }

  const messages: LLMMessage[] = [
    { role: 'user', content: userContent as any },
  ];

  const response = await callLLM({
    system: systemPrompt,
    messages,
    temperature: 0.1, // Baixa para extração precisa
    maxTokens: 2048,
  });

  // Tentar parsear JSON da resposta
  let result: DocumentResult;
  try {
    // Extrair JSON do texto (pode vir com markdown code block)
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found');
    }
  } catch {
    // Fallback se não conseguiu parsear
    result = {
      document_type: 'desconhecido',
      confidence: 0.3,
      extracted_data: {},
      validation_errors: ['Não foi possível processar o documento'],
      status: 'rejected',
      client_message: 'Não consegui ler esse documento. Pode mandar de novo com melhor qualidade? 📸',
    };
  }

  // Salvar documento no banco
  let documentSaved = false;
  if (result.document_type !== 'desconhecido' && result.confidence >= 0.5) {
    const { error } = await supabase.from('ariel_documents').insert({
      tenant_id: ctx.tenantId,
      contact_id: ctx.contactId,
      type: result.document_type,
      raw_media_url: ctx.mediaUrl,
      extracted_data: result.extracted_data,
      confidence: Math.round(result.confidence * 100),
      status: result.status,
    });

    if (!error) {
      documentSaved = true;
    }
  }

  await auditLog({
    tenantId: ctx.tenantId,
    actor: 'agent07',
    action: documentSaved ? 'document.processed' : 'document.failed',
    resourceType: 'document',
    resourceId: ctx.contactId,
    payload: {
      type: result.document_type,
      confidence: result.confidence,
      status: result.status,
      errors: result.validation_errors,
    },
  });

  return {
    replyText: result.client_message,
    documentSaved,
    documentType: result.document_type,
    confidence: result.confidence,
    tokensInput: response.inputTokens,
    tokensOutput: response.outputTokens,
  };
}
