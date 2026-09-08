import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

async function seed() {
  console.log('🌱 Rodando seed...\n');

  // 1. Criar tenant demo (escritório contábil de exemplo)
  const { data: tenant, error: tenantErr } = await supabase
    .from('ariel_tenants')
    .upsert({
      slug: 'demo-escritorio',
      name: 'Escritório Demo Contábil',
      whatsapp_number: '5511999999999',
      plan: 'professional',
      monthly_fee_cents: 79900,
      config: {
        vertical: 'accounting',
        timezone: 'America/Sao_Paulo',
        business_hours: { start: '09:00', end: '18:00' },
        days_working: ['mon', 'tue', 'wed', 'thu', 'fri'],
      },
    }, { onConflict: 'slug' })
    .select()
    .single();

  if (tenantErr) {
    console.error('❌ Erro ao criar tenant:', tenantErr);
    process.exit(1);
  }
  console.log('✅ Tenant criado:', tenant.name, `(${tenant.id})`);

  // 2. Criar usuário owner
  const { data: user, error: userErr } = await supabase
    .from('ariel_tenant_users')
    .upsert({
      tenant_id: tenant.id,
      email: 'admin@demo.ariel',
      name: 'Admin Demo',
      role: 'owner',
    }, { onConflict: 'tenant_id,email' })
    .select()
    .single();

  if (userErr) {
    console.error('❌ Erro ao criar user:', userErr);
  } else {
    console.log('✅ Usuário owner criado:', user.name);
  }

  // 3. Criar Knowledge Base (FAQ) para contábil
  const kbEntries = [
    {
      tenant_id: tenant.id,
      intent: 'prazo_das',
      keywords: ['prazo', 'das', 'simples', 'vencimento', 'quando vence'],
      response_template: 'O DAS Simples Nacional vence todo dia 20 do mês seguinte ao faturamento. Se cair em final de semana, antecipa pro dia útil anterior.',
    },
    {
      tenant_id: tenant.id,
      intent: 'prazo_fgts',
      keywords: ['fgts', 'prazo', 'vencimento', 'funcionário'],
      response_template: 'O FGTS Digital vence dia 20 do mês seguinte. Precisa ter a folha fechada antes pra gente gerar a guia.',
    },
    {
      tenant_id: tenant.id,
      intent: 'abrir_empresa',
      keywords: ['abrir', 'empresa', 'cnpj', 'mei', 'abertura'],
      response_template: 'Abrimos empresa em 15-20 dias úteis. Documentos necessários: CPF, RG, comprovante de residência e definição da atividade. Quer que eu te passe o checklist completo?',
    },
    {
      tenant_id: tenant.id,
      intent: 'mudar_regime',
      keywords: ['mudar', 'regime', 'simples', 'lucro', 'migrar', 'trocar'],
      response_template: 'A mudança de regime tributário pode ser feita até o último dia útil de dezembro (pro ano seguinte). Quer agendar uma reunião pra avaliar se vale a pena pra sua empresa?',
    },
    {
      tenant_id: tenant.id,
      intent: 'certidao',
      keywords: ['certidão', 'certidao', 'cnd', 'negativa'],
      response_template: 'Emitimos certidões negativas em até 48h úteis. Valor: R$ 50 por certidão. Precisa de qual? (Federal, Estadual, Municipal, FGTS, INSS)',
    },
    {
      tenant_id: tenant.id,
      intent: 'nota_fiscal',
      keywords: ['nota', 'nf', 'fiscal', 'emitir', 'nota fiscal'],
      response_template: 'Pra emitir nota fiscal, preciso de: nome do tomador, CNPJ/CPF, valor e descrição do serviço. Pode me mandar esses dados?',
    },
    {
      tenant_id: tenant.id,
      intent: 'folha_pagamento',
      keywords: ['folha', 'pagamento', 'holerite', 'funcionário', 'salário'],
      response_template: 'A folha de pagamento é processada até o dia 5 de cada mês. Precisa me informar qualquer alteração (horas extras, faltas, admissão, demissão) até o dia 25 do mês anterior.',
    },
    {
      tenant_id: tenant.id,
      intent: 'imposto_renda',
      keywords: ['imposto', 'renda', 'irpf', 'declaração', 'declarar'],
      response_template: 'O prazo da declaração de IRPF vai até 30 de abril. Precisamos dos seus informes de rendimento (banco, empregador), recibos médicos e comprovantes de despesas. Quer começar?',
    },
  ];

  const { error: kbErr } = await supabase
    .from('ariel_knowledge_base')
    .upsert(kbEntries, { onConflict: 'tenant_id,intent' });

  if (kbErr) {
    console.error('❌ Erro ao criar KB:', kbErr);
  } else {
    console.log(`✅ Knowledge Base: ${kbEntries.length} entradas criadas`);
  }

  // 4. Criar alguns contatos de exemplo
  const contacts = [
    {
      tenant_id: tenant.id,
      whatsapp_number: '5511888888888',
      name: 'João da Clínica',
      type: 'client',
      score: 85,
      classification: 'hot',
      data: { tipo_empresa: 'simples', faturamento_mensal: 90000, funcionarios: 3, setor: 'saude' },
    },
    {
      tenant_id: tenant.id,
      whatsapp_number: '5521777777777',
      name: 'Maria E-commerce',
      type: 'lead',
      score: 60,
      classification: 'morno',
      data: { tipo_empresa: 'simples', faturamento_mensal: 45000, setor: 'ecommerce' },
    },
    {
      tenant_id: tenant.id,
      whatsapp_number: '5511666666666',
      name: 'Pedro Consultor',
      type: 'lead',
      score: 30,
      classification: 'frio',
      data: { tipo_empresa: 'mei', urgencia: 'pesquisando' },
    },
  ];

  const { error: contactsErr } = await supabase
    .from('ariel_contacts')
    .upsert(contacts, { onConflict: 'tenant_id,whatsapp_number' });

  if (contactsErr) {
    console.error('❌ Erro ao criar contatos:', contactsErr);
  } else {
    console.log(`✅ Contatos demo: ${contacts.length} criados`);
  }

  console.log('\n🎉 Seed completo! Escritório demo pronto para uso.\n');
}

seed().catch(console.error);
