import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

// Service role client — bypassa RLS (usado pelo worker)
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ============================================
// CONTACTS
// ============================================

export async function findContactByPhone(tenantId: string, phone: string) {
  const { data, error } = await supabase
    .from('ariel_contacts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('whatsapp_number', phone)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createContact(tenantId: string, phone: string, pushName?: string) {
  const { data, error } = await supabase
    .from('ariel_contacts')
    .insert({
      tenant_id: tenantId,
      whatsapp_number: phone,
      push_name: pushName,
      name: pushName,
      type: 'lead',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateContact(contactId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('ariel_contacts')
    .update(updates)
    .eq('id', contactId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// CONVERSATIONS
// ============================================

export async function findOrCreateConversation(tenantId: string, contactId: string) {
  // Buscar conversa aberta
  const { data: existing } = await supabase
    .from('ariel_conversations')
    .select('*')
    .eq('contact_id', contactId)
    .eq('status', 'open')
    .maybeSingle();

  if (existing) return existing;

  // Criar nova
  const { data, error } = await supabase
    .from('ariel_conversations')
    .insert({
      tenant_id: tenantId,
      contact_id: contactId,
      status: 'open',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// MESSAGES
// ============================================

export async function saveMessage(opts: {
  tenantId: string;
  conversationId: string;
  contactId: string;
  direction: 'in' | 'out';
  contentType: string;
  contentText?: string;
  mediaUrl?: string;
  agentId?: string;
  tokensInput?: number;
  tokensOutput?: number;
  latencyMs?: number;
}) {
  const { data, error } = await supabase
    .from('ariel_messages')
    .insert({
      tenant_id: opts.tenantId,
      conversation_id: opts.conversationId,
      contact_id: opts.contactId,
      direction: opts.direction,
      content_type: opts.contentType,
      content_text: opts.contentText,
      media_url: opts.mediaUrl,
      agent_id: opts.agentId,
      tokens_input: opts.tokensInput || 0,
      tokens_output: opts.tokensOutput || 0,
      latency_ms: opts.latencyMs,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentMessages(conversationId: string, limit = 10) {
  const { data, error } = await supabase
    .from('ariel_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// ============================================
// LEADS / SCORING
// ============================================

export async function updateLeadScore(contactId: string, score: number, classification: string) {
  return updateContact(contactId, {
    score,
    classification,
    qualified_at: new Date().toISOString(),
  });
}

// ============================================
// PROPOSALS
// ============================================

export async function createProposal(opts: {
  tenantId: string;
  contactId: string;
  regime: string;
  monthlyFeeCents: number;
  setupFeeCents: number;
  services: string[];
  messageText: string;
}) {
  const { data, error } = await supabase
    .from('ariel_proposals')
    .insert({
      tenant_id: opts.tenantId,
      contact_id: opts.contactId,
      regime: opts.regime,
      monthly_fee_cents: opts.monthlyFeeCents,
      setup_fee_cents: opts.setupFeeCents,
      services: opts.services,
      message_text: opts.messageText,
      status: 'sent',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// TENANTS
// ============================================

export async function getTenantByWhatsApp(whatsappNumber: string) {
  const { data, error } = await supabase
    .from('ariel_tenants')
    .select('*')
    .eq('whatsapp_number', whatsappNumber)
    .eq('active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getDefaultTenant() {
  const { data, error } = await supabase
    .from('ariel_tenants')
    .select('*')
    .eq('active', true)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ============================================
// AUDIT LOG
// ============================================

export async function auditLog(opts: {
  tenantId: string;
  actor: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  payload?: Record<string, unknown>;
}) {
  await supabase.from('ariel_audit_log').insert({
    tenant_id: opts.tenantId,
    actor: opts.actor,
    action: opts.action,
    resource_type: opts.resourceType,
    resource_id: opts.resourceId,
    payload: opts.payload || {},
  });
}
