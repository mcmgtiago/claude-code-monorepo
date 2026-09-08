import cron from 'node-cron';
import { supabase } from './supabase.js';
import { runComplianceScan, generateComplianceReport } from '../agents/agent09-compliance.js';
import { sendMessage } from './whatsapp.js';

/**
 * Inicializa todos os cron jobs do ARIEL
 */
export function initScheduler(): void {
  console.log('⏰ Scheduler iniciado');

  // ============================================
  // COMPLIANCE SCAN — Diário às 6h (Brasília)
  // Varre obrigações próximas e envia alertas
  // ============================================
  cron.schedule('0 9 * * *', async () => {
    // 9h UTC = 6h BRT
    console.log('[Cron] Rodando compliance scan...');

    try {
      const { data: tenants } = await supabase
        .from('ariel_tenants')
        .select('id, name')
        .eq('active', true);

      if (!tenants?.length) return;

      for (const tenant of tenants) {
        const result = await runComplianceScan(tenant.id);
        console.log(`[Cron] ${tenant.name}: ${result.alertsSent} alertas enviados (${result.obligationsChecked} verificadas)`);
      }
    } catch (err) {
      console.error('[Cron] Erro no compliance scan:', err);
    }
  }, { timezone: 'America/Sao_Paulo' });

  // ============================================
  // COMPLIANCE REPORT — Diário às 8h (para o dono)
  // Manda resumo do dia para o owner do escritório
  // ============================================
  cron.schedule('0 11 * * 1-5', async () => {
    // 11h UTC = 8h BRT (apenas dias úteis seg-sex)
    console.log('[Cron] Gerando relatório de compliance...');

    try {
      const { data: tenants } = await supabase
        .from('ariel_tenants')
        .select('id, name, whatsapp_number')
        .eq('active', true);

      if (!tenants?.length) return;

      for (const tenant of tenants) {
        if (!tenant.whatsapp_number) continue;

        const report = await generateComplianceReport(tenant.id);

        await sendMessage({
          to: tenant.whatsapp_number,
          text: report,
        });

        console.log(`[Cron] Report enviado para ${tenant.name}`);
      }
    } catch (err) {
      console.error('[Cron] Erro no report:', err);
    }
  }, { timezone: 'America/Sao_Paulo' });

  // ============================================
  // FOLLOW-UP DE PROPOSTAS — Diário às 10h
  // Verifica propostas sem resposta e manda follow-up
  // ============================================
  cron.schedule('0 13 * * 1-5', async () => {
    // 13h UTC = 10h BRT
    console.log('[Cron] Verificando follow-ups de propostas...');

    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Propostas enviadas há 3 dias sem resposta
      const { data: proposals3d } = await supabase
        .from('ariel_proposals')
        .select('*, contacts(name, whatsapp_number)')
        .eq('status', 'sent')
        .lte('sent_at', threeDaysAgo.toISOString())
        .gte('sent_at', sevenDaysAgo.toISOString());

      for (const proposal of proposals3d || []) {
        const contact = (proposal as any).contacts;
        if (!contact?.whatsapp_number) continue;

        const name = contact.name || 'Olá';
        const followUp = `Oi ${name}! 👋\n\nPassei pra saber se viu a proposta que enviei.\nAlguma dúvida? Posso ajustar algo?\n\nSe quiser, marco uma call rápida de 10 min. Que dia fica bom?`;

        await sendMessage({ to: contact.whatsapp_number, text: followUp });
        console.log(`[Cron] Follow-up D+3 enviado para ${contact.name}`);
      }

      // Propostas enviadas há 7+ dias → último follow-up
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data: proposals7d } = await supabase
        .from('ariel_proposals')
        .select('*, contacts(name, whatsapp_number)')
        .eq('status', 'sent')
        .lte('sent_at', sevenDaysAgo.toISOString())
        .gte('sent_at', fourteenDaysAgo.toISOString());

      for (const proposal of proposals7d || []) {
        const contact = (proposal as any).contacts;
        if (!contact?.whatsapp_number) continue;

        const name = contact.name || '';
        const lastFollowUp = `Oi ${name}! Sei que tá corrido.\n\nSó queria dizer que a proposta continua de pé. Se não fizer sentido agora, sem problema nenhum.\n\nSe mudar de ideia, me chama aqui. 👋`;

        await sendMessage({ to: contact.whatsapp_number, text: lastFollowUp });

        // Marcar como expirada após 14 dias
        await supabase
          .from('ariel_proposals')
          .update({ status: 'expired' })
          .eq('id', proposal.id)
          .lte('sent_at', fourteenDaysAgo.toISOString());
      }
    } catch (err) {
      console.error('[Cron] Erro no follow-up:', err);
    }
  }, { timezone: 'America/Sao_Paulo' });

  console.log('  📅 Compliance scan: 6h BRT (diário)');
  console.log('  📊 Compliance report: 8h BRT (seg-sex)');
  console.log('  📬 Follow-up propostas: 10h BRT (seg-sex)');
  console.log('');
}
