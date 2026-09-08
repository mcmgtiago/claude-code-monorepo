import 'dotenv/config';
import { serve } from '@hono/node-server';
import { app } from './server.js';
import { initScheduler } from './services/scheduler.js';

const PORT = parseInt(process.env.API_PORT || '4000', 10);

console.log('');
console.log('🧜‍♀️ ARIEL Accounting — Worker v0.1.0');
console.log('=========================================');
console.log(`🌐 API Server: http://localhost:${PORT}`);
console.log(`📡 Webhook: POST http://localhost:${PORT}/webhook/whatsapp`);
console.log(`💚 Health: GET http://localhost:${PORT}/health`);
console.log('=========================================');
console.log('');
console.log('🤖 Agentes ativos:');
console.log('  • Agent 01 — Lead Qualification');
console.log('  • Agent 02 — Propostas');
console.log('  • Agent 04 — Customer Support');
console.log('  • Agent 07 — Processamento de Documentos');
console.log('  • Agent 09 — Compliance Fiscal');
console.log('');

// Inicializar scheduler (cron jobs)
initScheduler();

serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`✅ Server rodando na porta ${PORT}`);
console.log(`📱 Aguardando mensagens do WhatsApp...`);
console.log('');
