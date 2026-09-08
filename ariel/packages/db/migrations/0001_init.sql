-- ============================================
-- ARIEL Accounting - Schema Inicial
-- Multi-tenant com Row Level Security
-- ============================================

-- Habilitar extensions necessarias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- TABELAS CORE
-- ============================================

-- Tenants (escritorios contabeis clientes do ARIEL)
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  whatsapp_number text,
  waha_session text,
  plan text not null default 'starter' check (plan in ('starter', 'professional', 'enterprise')),
  monthly_fee_cents integer not null default 39900,
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Usuarios do escritorio (contadores, assistentes, socios)
create table public.tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  auth_user_id uuid, -- referencia para Supabase Auth quando implementado
  email text not null,
  name text not null,
  role text not null default 'assistant' check (role in ('owner', 'senior', 'assistant')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(tenant_id, email)
);
create index idx_tenant_users_tenant on public.tenant_users(tenant_id);

-- Contatos (clientes finais + leads unificados)
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  whatsapp_number text not null,
  name text,
  push_name text,
  type text not null default 'lead' check (type in ('lead', 'client', 'lost')),
  -- Lead scoring
  score integer not null default 0,
  classification text check (classification in ('hot', 'morno', 'frio')),
  -- Dados coletados via conversa
  data jsonb not null default '{}'::jsonb,
  -- Status e engajamento
  status text not null default 'active' check (status in ('active', 'inactive', 'blocked')),
  last_message_at timestamptz,
  last_agent_id text,
  -- Datas
  qualified_at timestamptz,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, whatsapp_number)
);
create index idx_contacts_tenant on public.contacts(tenant_id);
create index idx_contacts_type on public.contacts(tenant_id, type);
create index idx_contacts_classification on public.contacts(tenant_id, classification);
create index idx_contacts_last_message on public.contacts(tenant_id, last_message_at desc);

-- Conversas (1 conversa ativa por contato por padrao)
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed', 'archived')),
  assigned_agent text,
  -- Lock para evitar concorrencia entre agentes
  locked_until timestamptz,
  locked_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_conversations_contact on public.conversations(contact_id);
create index idx_conversations_tenant_status on public.conversations(tenant_id, status);

-- Mensagens (histórico completo)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  direction text not null check (direction in ('in', 'out')),
  -- Conteudo
  content_type text not null default 'text' check (content_type in ('text', 'image', 'audio', 'document', 'video')),
  content_text text,
  media_url text,
  -- Quem processou
  agent_id text,
  -- Custos / métricas
  tokens_input integer default 0,
  tokens_output integer default 0,
  latency_ms integer,
  -- Metadados
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index idx_messages_conv_created on public.messages(conversation_id, created_at desc);
create index idx_messages_tenant_created on public.messages(tenant_id, created_at desc);
create index idx_messages_contact on public.messages(contact_id);

-- ============================================
-- DOCUMENTOS FISCAIS
-- ============================================

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  -- Classificacao
  type text check (type in ('nfe', 'folha', 'rpa', 'contrato', 'recibo', 'outro')),
  -- Arquivo original
  raw_media_url text,
  raw_filename text,
  -- Dados extraidos pela IA
  extracted_data jsonb not null default '{}'::jsonb,
  -- Confianca da extracao (0-100)
  confidence numeric(5,2),
  -- Status
  status text not null default 'pending_review' check (status in ('pending_review', 'auto_approved', 'approved', 'rejected')),
  reviewed_by uuid references public.tenant_users(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now()
);
create index idx_documents_tenant_status on public.documents(tenant_id, status);
create index idx_documents_contact on public.documents(contact_id);
create index idx_documents_type on public.documents(tenant_id, type);

-- ============================================
-- OBRIGACOES FISCAIS (COMPLIANCE)
-- ============================================

create table public.fiscal_obligations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  obligation_type text not null, -- das_simples, fgts, esocial, defis, dctf, irpf, irrf
  -- Periodo
  reference_period text, -- ex: 2024-08, 2024 (DEFIS)
  -- Vencimento
  due_date date not null,
  -- Valor estimado (quando aplicavel)
  estimated_value_cents integer,
  -- Status
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'late', 'cancelled')),
  completed_at timestamptz,
  completed_by uuid references public.tenant_users(id),
  -- Alertas enviados
  alert_sent_d5 boolean not null default false,
  alert_sent_d3 boolean not null default false,
  alert_sent_d1 boolean not null default false,
  alert_sent_d0 boolean not null default false,
  -- Notas
  notes text,
  created_at timestamptz not null default now()
);
create index idx_obligations_tenant_due on public.fiscal_obligations(tenant_id, due_date);
create index idx_obligations_pending on public.fiscal_obligations(due_date) where status = 'pending';
create index idx_obligations_contact on public.fiscal_obligations(contact_id);

-- ============================================
-- TAREFAS
-- ============================================

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  title text not null,
  description text,
  assigned_to uuid references public.tenant_users(id),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  due_date timestamptz,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  source text not null default 'manual', -- manual, agent01, agent04, ...
  source_metadata jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_tasks_tenant_status on public.tasks(tenant_id, status);
create index idx_tasks_assigned on public.tasks(assigned_to, status);
create index idx_tasks_due on public.tasks(tenant_id, due_date);

-- ============================================
-- PROPOSTAS
-- ============================================

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  -- Detalhes
  regime text, -- mei, simples, lucro_presumido, lucro_real
  monthly_fee_cents integer not null,
  setup_fee_cents integer default 0,
  services jsonb not null default '[]'::jsonb, -- array de servicos inclusos
  -- Texto da proposta (WhatsApp)
  message_text text,
  -- Status e ciclo
  status text not null default 'sent' check (status in ('sent', 'viewed', 'accepted', 'rejected', 'expired')),
  sent_at timestamptz not null default now(),
  viewed_at timestamptz,
  responded_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  -- Conversao
  accepted_at timestamptz
);
create index idx_proposals_tenant_status on public.proposals(tenant_id, status);
create index idx_proposals_contact on public.proposals(contact_id);

-- ============================================
-- AUDITORIA / LGPD
-- ============================================

create table public.audit_log (
  id bigserial primary key,
  tenant_id uuid,
  actor text not null, -- agent_id ou user_id
  action text not null, -- ex: 'message.sent', 'contact.qualified'
  resource_type text, -- 'contact', 'message', 'document'
  resource_id uuid,
  payload jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);
create index idx_audit_tenant_created on public.audit_log(tenant_id, created_at desc);
create index idx_audit_resource on public.audit_log(resource_type, resource_id);

-- ============================================
-- KNOWLEDGE BASE (FAQ por nicho)
-- ============================================

create table public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade, -- null = global
  intent text not null,
  keywords text[] not null default '{}',
  response_template text not null,
  requires_action text, -- ex: 'consult_status_das'
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_kb_tenant_intent on public.knowledge_base(tenant_id, intent);
create index idx_kb_keywords on public.knowledge_base using gin(keywords);

-- ============================================
-- TRIGGERS
-- ============================================

-- Atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_tenants
  before update on public.tenants
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_contacts
  before update on public.contacts
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_conversations
  before update on public.conversations
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_kb
  before update on public.knowledge_base
  for each row execute function public.handle_updated_at();

-- Atualizar last_message_at quando chega mensagem
create or replace function public.update_contact_last_message()
returns trigger as $$
begin
  update public.contacts
  set last_message_at = new.created_at,
      last_agent_id = coalesce(new.agent_id, last_agent_id)
  where id = new.contact_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_update_contact_last_message
  after insert on public.messages
  for each row execute function public.update_contact_last_message();

-- ============================================
-- ROW LEVEL SECURITY (multi-tenant)
-- ============================================

alter table public.tenants enable row level security;
alter table public.tenant_users enable row level security;
alter table public.contacts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;
alter table public.fiscal_obligations enable row level security;
alter table public.tasks enable row level security;
alter table public.proposals enable row level security;
alter table public.knowledge_base enable row level security;
alter table public.audit_log enable row level security;

-- Policy helper: todas as tabelas tenant-scoped filtram por tenant_id
-- O worker usa service_role key que bypassa RLS
-- Quando implementar auth de usuarios, policies vao usar auth.uid()

-- Policy para service_role (ja bypassa, mas documentando)
-- Policy para anon/authenticated sera criada quando integrarmos Supabase Auth

-- ============================================
-- VIEWS UTEIS
-- ============================================

-- Visao consolidada de leads quentes
create or replace view public.v_hot_leads as
select
  c.id,
  c.tenant_id,
  c.whatsapp_number,
  c.name,
  c.score,
  c.classification,
  c.data,
  c.last_message_at,
  t.name as tenant_name
from public.contacts c
join public.tenants t on t.id = c.tenant_id
where c.type = 'lead'
  and c.classification = 'hot'
  and c.status = 'active'
order by c.last_message_at desc;

-- Visao de obrigacoes proximas
create or replace view public.v_upcoming_obligations as
select
  fo.*,
  c.name as contact_name,
  c.whatsapp_number,
  t.name as tenant_name,
  (fo.due_date - current_date) as days_until_due
from public.fiscal_obligations fo
left join public.contacts c on c.id = fo.contact_id
join public.tenants t on t.id = fo.tenant_id
where fo.status in ('pending', 'in_progress')
  and fo.due_date >= current_date - interval '1 day'
order by fo.due_date asc;

-- ============================================
-- GRANTS
-- ============================================

-- service_role tem acesso total (bypassa RLS)
-- anon e authenticated terao policies quando Supabase Auth for integrado

grant usage on schema public to anon, authenticated;
grant select, insert, update on all tables in schema public to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;