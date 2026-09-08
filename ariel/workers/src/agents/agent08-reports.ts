import { supabase, auditLog } from '../services/supabase.js';
import { callLLM } from '../services/llm.js';

/**
 * Agent 08 — Relatórios e Insights
 * Gera relatório semanal/mensal com métricas do escritório.
 * Chamado pelo scheduler (segunda 9h) ou sob demanda.
 */

export async function generateWeeklyReport(tenantId: string): Promise<string> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  // Métricas da semana
  const [newLeads, newClients, proposalsSent, proposalsAccepted, docsProcessed, tasksCompleted, obligationsMet] = await Promise.all([
    supabase.from('ariel_contacts').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('type', 'lead').gte('created_at', weekAgo.toISOString()),
    supabase.from('ariel_contacts').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('type', 'client').gte('converted_at', weekAgo.toISOString()),
    supabase.from('ariel_proposals').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).gte('sent_at', weekAgo.toISOString()),
    supabase.from('ariel_proposals').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'accepted').gte('accepted_at', weekAgo.toISOString()),
    supabase.from('ariel_documents').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).gte('created_at', weekAgo.toISOString()),
    supabase.from('ariel_tasks').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'done').gte('completed_at', weekAgo.toISOString()),
    supabase.from('ariel_fiscal_obligations').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'completed').gte('completed_at', weekAgo.toISOString()),
  ]);

  const leads = newLeads.count || 0;
  const clients = newClients.count || 0;
  const proposals = proposalsSent.count || 0;
  const accepted = proposalsAccepted.count || 0;
  const docs = docsProcessed.count || 0;
  const tasks = tasksCompleted.count || 0;
  const obligations = obligationsMet.count || 0;

  const conversionRate = proposals > 0 ? Math.round((accepted / proposals) * 100) : 0;

  let report = `📊 RELATÓRIO SEMANAL — ARIEL\n`;
  report += `Período: ${weekAgo.toLocaleDateString('pt-BR')} a ${now.toLocaleDateString('pt-BR')}\n\n`;

  report += `🎯 AQUISIÇÃO:\n`;
  report += `• Novos leads: ${leads}\n`;
  report += `• Propostas enviadas: ${proposals}\n`;
  report += `• Propostas aceitas: ${accepted} (${conversionRate}%)\n`;
  report += `• Novos clientes: ${clients}\n\n`;

  report += `📄 OPERAÇÃO:\n`;
  report += `• Documentos processados: ${docs}\n`;
  report += `• Tarefas concluídas: ${tasks}\n`;
  report += `• Obrigações fiscais cumpridas: ${obligations}\n\n`;

  // Insights
  report += `💡 INSIGHTS:\n`;
  if (leads > 0 && accepted === 0) report += `• ⚠️ Nenhuma proposta aceita essa semana — revisar abordagem?\n`;
  if (conversionRate >= 30) report += `• ✅ Conversão acima de 30% — bom ritmo!\n`;
  if (docs > 20) report += `• 🚀 Volume alto de documentos — considerando automação avançada?\n`;
  if (leads === 0) report += `• ⚠️ Nenhum lead novo — precisa investir em captação?\n`;

  report += `\n📅 Próximo relatório: ${new Date(now.getTime() + 7 * 86400000).toLocaleDateString('pt-BR')}`;

  await auditLog({
    tenantId,
    actor: 'agent08',
    action: 'report.weekly_generated',
    resourceType: 'report',
    payload: { leads, clients, proposals, accepted, docs, tasks, obligations },
  });

  return report;
}

/**
 * Gera insights sob demanda (quando cliente pergunta "como tá?")
 */
export async function runAgent08OnDemand(tenantId: string, contactName: string): Promise<{
  replyText: string;
  tokensInput: number;
  tokensOutput: number;
}> {
  const report = await generateWeeklyReport(tenantId);

  // Simplificar via LLM para tom conversacional
  const response = await callLLM({
    system: `Você é ARIEL. O dono do escritório pediu um resumo rápido. Transforme este relatório em uma mensagem WhatsApp curta (max 200 palavras), amigável, com os destaques mais importantes. Não repita todos os números — foque no que importa.`,
    messages: [{ role: 'user', content: `Relatório:\n${report}\n\nResuma de forma conversacional para o dono do escritório ${contactName}.` }],
    temperature: 0.4,
    maxTokens: 512,
  });

  return {
    replyText: response.text,
    tokensInput: response.inputTokens,
    tokensOutput: response.outputTokens,
  };
}
