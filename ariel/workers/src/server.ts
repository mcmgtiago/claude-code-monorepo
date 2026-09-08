import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { parseWahaWebhook, sendMessage, cleanNumber } from './services/whatsapp.js';
import {
  findContactByPhone,
  createContact,
  findOrCreateConversation,
  saveMessage,
  getDefaultTenant,
  auditLog,
} from './services/supabase.js';
import { detectIntent, type IntentContext } from './router/intent-detector.js';
import { runAgent01 } from './agents/agent01-lead-qualification.js';
import { runAgent02 } from './agents/agent02-proposals.js';
import { runAgent04 } from './agents/agent04-support.js';
import { runAgent05 } from './agents/agent05-summarizer.js';
import { runAgent06 } from './agents/agent06-task-manager.js';
import { runAgent07 } from './agents/agent07-documents.js';
import { runAgent03, type WebchatMessage } from './agents/agent03-webchat.js';
import { runAgent08OnDemand, generateWeeklyReport } from './agents/agent08-reports.js';
import { runComplianceScan } from './agents/agent09-compliance.js';
import { runAgent11 } from './agents/agent11-research.js';
import { runAgent12 } from './agents/agent12-scheduling.js';
import { runAgent13OnMessage, runContractScan } from './agents/agent13-contracts.js';

const app = new Hono();
app.use(logger());
app.use(cors());

const WAHA_SECRET = process.env.WAHA_SECRET || '';

// ============================================
// WEBHOOK — Recebe mensagens do WhatsApp
// ============================================

app.post('/webhook/whatsapp', async (c) => {
  // Auth check
  const token = c.req.header('X-Waha-Token') || c.req.header('Authorization');
  if (WAHA_SECRET && token !== WAHA_SECRET && token !== `Bearer ${WAHA_SECRET}`) {
    return c.json({ error: 'unauthorized' }, 401);
  }

  const rawPayload = await c.req.json();
  const incoming = parseWahaWebhook(rawPayload);

  if (!incoming) {
    return c.json({ ok: true, skipped: true });
  }

  // Ignorar mensagens de grupos
  if (incoming.from.includes('@g.us')) {
    return c.json({ ok: true, skipped: true, reason: 'group' });
  }

  const phone = cleanNumber(incoming.from);

  try {
    // 1. Resolver tenant (MVP: pegar o tenant padrão)
    const tenant = await getDefaultTenant();
    if (!tenant) {
      console.error('[Webhook] Nenhum tenant configurado');
      return c.json({ error: 'no_tenant' }, 500);
    }

    // 2. Encontrar ou criar contato
    let contact = await findContactByPhone(tenant.id, phone);
    const isNewContact = !contact;

    if (!contact) {
      contact = await createContact(tenant.id, phone, incoming.pushName);
      console.log(`[Webhook] Novo contato criado: ${phone} (${incoming.pushName})`);
    }

    // 3. Encontrar ou criar conversa
    const conversation = await findOrCreateConversation(tenant.id, contact.id);

    // 4. Salvar mensagem inbound
    await saveMessage({
      tenantId: tenant.id,
      conversationId: conversation.id,
      contactId: contact.id,
      direction: 'in',
      contentType: incoming.type,
      contentText: incoming.body,
      mediaUrl: incoming.mediaUrl,
    });

    // 5. Detectar intenção
    const intentCtx: IntentContext = {
      isNewContact,
      contactType: contact.type as 'lead' | 'client' | 'lost',
      messageType: incoming.type,
      messageText: incoming.body,
      lastAgentId: contact.last_agent_id || undefined,
      contactScore: contact.score,
      contactClassification: contact.classification || undefined,
    };

    const intent = detectIntent(intentCtx);
    console.log(`[Router] ${phone} → ${intent.agentId} (${intent.reason}, confidence: ${intent.confidence})`);

    // 6. Executar agente
    let replyText: string;
    let tokensInput = 0;
    let tokensOutput = 0;

    switch (intent.agentId) {
      case 'agent01': {
        const result = await runAgent01({
          tenantId: tenant.id,
          tenantName: tenant.name,
          contactId: contact.id,
          conversationId: conversation.id,
          contactData: contact.data as Record<string, unknown>,
          pushName: contact.push_name || incoming.pushName,
          message: incoming.body,
        });
        replyText = result.replyText;
        tokensInput = result.tokensInput;
        tokensOutput = result.tokensOutput;

        if (result.score) {
          console.log(`[Agent01] Score: ${result.score} (${result.classification})`);
        }
        if (result.proposalGenerated) {
          console.log(`[Agent01] Proposta gerada para ${phone}`);
        }
        break;
      }

      case 'agent02': {
        const result = await runAgent02({
          tenantId: tenant.id,
          tenantName: tenant.name,
          contactId: contact.id,
          conversationId: conversation.id,
          contactData: contact.data as Record<string, unknown>,
          contactName: contact.name || contact.push_name || undefined,
          contactScore: contact.score || 0,
          contactClassification: contact.classification || 'morno',
          message: incoming.body,
        });
        replyText = result.replyText;
        tokensInput = result.tokensInput;
        tokensOutput = result.tokensOutput;
        console.log(`[Agent02] Proposta gerada para ${phone}`);
        break;
      }

      case 'agent04': {
        const result = await runAgent04({
          tenantId: tenant.id,
          tenantName: tenant.name,
          contactId: contact.id,
          conversationId: conversation.id,
          contactData: contact.data as Record<string, unknown>,
          contactName: contact.name || contact.push_name || undefined,
          message: incoming.body,
        });
        replyText = result.replyText;
        tokensInput = result.tokensInput;
        tokensOutput = result.tokensOutput;
        if (result.escalated) {
          console.log(`[Agent04] Escalado para humano: ${phone}`);
        }
        break;
      }

      case 'agent07': {
        const result = await runAgent07({
          tenantId: tenant.id,
          tenantName: tenant.name,
          contactId: contact.id,
          conversationId: conversation.id,
          contactName: contact.name || contact.push_name || undefined,
          message: incoming.body,
          mediaUrl: incoming.mediaUrl,
          mediaType: incoming.type as 'image' | 'document' | 'text',
        });
        replyText = result.replyText;
        tokensInput = result.tokensInput;
        tokensOutput = result.tokensOutput;
        if (result.documentSaved) {
          console.log(`[Agent07] Doc processado: ${result.documentType} (${Math.round((result.confidence || 0) * 100)}%)`);
        }
        break;
      }

      case 'agent09': {
        // Agent09 é chamado via scheduler, não por mensagem direta
        // Mas se alguém perguntar sobre compliance, respondemos
        replyText = 'Vou verificar suas obrigações fiscais e te aviso! 📅';
        break;
      }

      default: {
        replyText = `Recebi sua mensagem! Vou encaminhar para o time. 😊`;
        break;
      }
    }

    // 7. Enviar resposta via WhatsApp
    if (replyText && replyText.trim()) {
      // Splitting: se resposta >1000 chars, divide em 2 mensagens
      const messages = splitMessage(replyText, 1000);

      for (const msg of messages) {
        await sendMessage({ to: incoming.from, text: msg });

        // Salvar resposta no banco
        await saveMessage({
          tenantId: tenant.id,
          conversationId: conversation.id,
          contactId: contact.id,
          direction: 'out',
          contentType: 'text',
          contentText: msg,
          agentId: intent.agentId,
          tokensInput,
          tokensOutput,
        });

        // Pequeno delay entre mensagens para parecer humano
        if (messages.length > 1) {
          await sleep(800);
        }
      }
    }

    return c.json({ ok: true, agent: intent.agentId });
  } catch (err) {
    console.error('[Webhook] Erro processando mensagem:', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (c) => c.json({ status: 'ok', version: '0.1.0' }));

// ============================================
// CRON TRIGGERS (manual para teste)
// ============================================

app.post('/api/cron/compliance', async (c) => {
  const secret = c.req.header('Authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: 'unauthorized' }, 401);
  }
  const tenant = await getDefaultTenant();
  if (!tenant) return c.json({ error: 'no_tenant' }, 500);

  const result = await runComplianceScan(tenant.id);
  return c.json({ ok: true, ...result });
});

// ============================================
// WEBCHAT — Agent 03 (Site Inteligente)
// ============================================

app.post('/api/webchat', async (c) => {
  const body = await c.req.json() as WebchatMessage;
  if (!body.sessionId || !body.message) {
    return c.json({ error: 'sessionId and message required' }, 400);
  }

  const tenant = await getDefaultTenant();
  if (!tenant) return c.json({ error: 'no_tenant' }, 500);

  body.tenantId = tenant.id;
  const result = await runAgent03(body);
  return c.json(result);
});

// ============================================
// RELATÓRIOS — Agent 08
// ============================================

app.get('/api/reports/weekly', async (c) => {
  const secret = c.req.header('Authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: 'unauthorized' }, 401);
  }
  const tenant = await getDefaultTenant();
  if (!tenant) return c.json({ error: 'no_tenant' }, 500);

  const report = await generateWeeklyReport(tenant.id);
  return c.json({ ok: true, report });
});

// ============================================
// PESQUISA TÉCNICA — Agent 11
// ============================================

app.post('/api/research', async (c) => {
  const secret = c.req.header('Authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: 'unauthorized' }, 401);
  }
  const { question, userName, userRole } = await c.req.json();
  if (!question) return c.json({ error: 'question required' }, 400);

  const tenant = await getDefaultTenant();
  if (!tenant) return c.json({ error: 'no_tenant' }, 500);

  const result = await runAgent11({
    tenantId: tenant.id,
    tenantName: tenant.name,
    userName: userName || 'Equipe',
    userRole: userRole || 'assistant',
    question,
  });
  return c.json({ ok: true, answer: result.replyText });
});

// ============================================
// CONTRATOS — Agent 13 (trigger manual)
// ============================================

app.post('/api/cron/contracts', async (c) => {
  const secret = c.req.header('Authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: 'unauthorized' }, 401);
  }
  const tenant = await getDefaultTenant();
  if (!tenant) return c.json({ error: 'no_tenant' }, 500);

  const result = await runContractScan(tenant.id);
  return c.json({ ok: true, ...result });
});

// ============================================
// UTILS
// ============================================

function splitMessage(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];

  const parts: string[] = [];
  const paragraphs = text.split('\n\n');
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > maxLength && current) {
      parts.push(current.trim());
      current = para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current.trim()) parts.push(current.trim());

  return parts.length > 0 ? parts : [text.slice(0, maxLength)];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { app };
