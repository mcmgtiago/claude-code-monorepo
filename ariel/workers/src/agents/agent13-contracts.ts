import { callLLM } from '../services/llm.js';
import { supabase, auditLog } from '../services/supabase.js';
import { sendMessage } from '../services/whatsapp.js';

/**
 * Agent 13 — Contratos & Renovações
 * Monitora vencimento de contratos, envia alertas, sugere reajuste.
 * Chamado pelo scheduler diário.
 */

/**
 * Scan diário de contratos vencendo
 */
export async function runContractScan(tenantId: string): Promise<{
  alertsSent: number;
  contractsChecked: number;
}> {
  // Por enquanto, usamos proposals aceitas como "contratos"
  // No futuro terá tabela ariel_contracts dedicada
  const now = new Date();
  const in30days = new Date(now.getTime() + 30 * 86400000);
  const in60days = new Date(now.getTime() + 60 * 86400000);

  // Buscar propostas aceitas há ~11 meses (vence em ~1 mês)
  const elevenMonthsAgo = new Date(now.getTime() - 330 * 86400000);
  const twelveMonthsAgo = new Date(now.getTime() - 365 * 86400000);

  const { data: expiringContracts } = await supabase
    .from('ariel_proposals')
    .select('*, ariel_contacts(name, whatsapp_number)')
    .eq('tenant_id', tenantId)
    .eq('status', 'accepted')
    .gte('accepted_at', twelveMonthsAgo.toISOString())
    .lte('accepted_at', elevenMonthsAgo.toISOString());

  if (!expiringContracts?.length) return { alertsSent: 0, contractsChecked: 0 };

  let alertsSent = 0;

  for (const contract of expiringContracts) {
    const contact = (contract as any).ariel_contacts;
    if (!contact?.whatsapp_number) continue;

    const name = contact.name || 'Olá';
    const monthlyValue = (contract.monthly_fee_cents / 100).toFixed(2);

    // Calcular reajuste (IGPM estimado 5%)
    const reajuste = 1.05;
    const newValue = (contract.monthly_fee_cents * reajuste / 100).toFixed(2);

    const message = `Oi ${name}! 📋\n\nSeu contrato conosco completa 1 ano em breve.\n\nValor atual: R$ ${monthlyValue}/mês\nReajuste sugerido (IGPM ~5%): R$ ${newValue}/mês\n\nQueremos continuar trabalhando juntos! 🤝\n\nQuer manter os mesmos termos? [SIM] [CONVERSAR]`;

    await sendMessage({ to: contact.whatsapp_number, text: message });
    alertsSent++;

    await auditLog({
      tenantId,
      actor: 'agent13',
      action: 'contract.renewal_alert',
      resourceType: 'proposal',
      resourceId: contract.id,
      payload: { name: contact.name, current_value: contract.monthly_fee_cents, suggested_value: Math.round(contract.monthly_fee_cents * reajuste) },
    });

    // Rate limit
    await new Promise((r) => setTimeout(r, 2000));
  }

  return { alertsSent, contractsChecked: expiringContracts.length };
}

/**
 * Responde quando cliente pergunta sobre renovação/contrato
 */
export async function runAgent13OnMessage(opts: {
  tenantId: string;
  tenantName: string;
  contactId: string;
  contactName: string;
  message: string;
}): Promise<{ replyText: string; tokensInput: number; tokensOutput: number }> {
  // Buscar proposta aceita do cliente
  const { data: proposal } = await supabase
    .from('ariel_proposals')
    .select('*')
    .eq('contact_id', opts.contactId)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const contractInfo = proposal
    ? `Contrato ativo: R$ ${(proposal.monthly_fee_cents / 100).toFixed(2)}/mês, regime: ${proposal.regime}, aceito em: ${proposal.accepted_at}`
    : 'Nenhum contrato ativo encontrado';

  const response = await callLLM({
    system: `Você é ARIEL do escritório "${opts.tenantName}". Cliente perguntou sobre contrato/renovação. Responda de forma amigável e informativa.\n\nDados do contrato: ${contractInfo}\n\nSe não tem contrato: ofereça fazer uma proposta.\nSe tem: informe status, valores, vencimento.`,
    messages: [{ role: 'user', content: opts.message }],
    temperature: 0.3,
    maxTokens: 512,
  });

  return {
    replyText: response.text,
    tokensInput: response.inputTokens,
    tokensOutput: response.outputTokens,
  };
}
