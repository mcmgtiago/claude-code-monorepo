-- ============================================
-- ARIEL Accounting - Schema Inicial
-- PREFIXO ariel_ para evitar conflito com tabelas existentes
-- Multi-tenant com Row Level Security
-- ============================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- TABELAS CORE
-- ============================================

create table if not exists public.ariel_tenants (
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

create table if not exists public.ariel_tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.ariel_tenants(id) on delete cascade,
  auth_user_id uuid,
  email text not null,
  name text not null,
  role text not null default 'assistant' check (role in ('owner', 'senior', 'assistant')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(tenant_id, email)
);
create index if not exists idx_ariel_tenant_users_tenant on public.ariel_tenant_users(tenant_id);

create table if not exists public.ariel_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.ariel_tenants(id) on delete cascade,
  whatsapp_number text not null,
  name text,
  push_name text,
  type text not null default 'lead' check (type in ('lead', 'client', 'lost')),
  score integer not null default 0,
  classification text check (classification in ('hot', 'morno', 'frio')),
  data jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive', 'blocked')),
  last_message_at timestamptz,
  last_agent_id text,
  qualified_at timestamptz,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, whatsapp_number)
);
create index if not exists idx_ariel_contacts_tenant on public.ariel_contacts(tenant_id);
create index if not exists idx_ariel_contacts_type on public.ariel_contacts(tenant_id, type);
create index if not exists idx_ariel_contacts_classification on public.ariel_contacts(tenant_id, classification);
create index if not exists idx_ariel_contacts_last_message on public.ariel_contacts(tenant_id, last_message_at desc);

create table if not exists public.ariel_conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.ariel_tenants(id) on delete cascade,
  contact_id uuid not null references public.ariel_contacts(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed', 'archived')),
  assigned_agent text,
  locked_until timestamptz,
  locked_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ariel_conversations_contact on public.ariel_conversations(contact_id);
create index if not exists idx_ariel_conversations_tenant_status on public.ariel_conversations(tenant_id, status);

create table if not exists public.ariel_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.ariel_tenants(id) on delete cascade,
  conversation_id uuid not null references public.ariel_conversations(id) on delete cascade,
  contact_id uuid not null references public.ariel_contacts(id) on delete cascade,
  direction text not null check (direction in ('in', 'out')),
  content_type text not null default 'text' check (content_type in ('text', 'image', 'audio', 'document', 'video')),
  content_text text,
  media_url text,
  agent_id text,
  tokens_input integer default 0,
  tokens_output integer default 0,
  latency_ms integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_ariel_messages_conv_created on public.ariel_messages(conversation_id, created_at desc);
create index if not exists idx_ariel_messages_tenant_created on public.ariel_messages(tenant_id, created_at desc);
create index if not exists idx_ariel_messages_contact on public.ariel_messages(contact_id);

-- ============================================
-- DOCUMENTOS FISCAIS
-- ============================================

create table if not exists public.ariel_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.ariel_tenants(id) on delete cascade,
  contact_id uuid references public.ariel_contacts(id) on delete set null,
  type text check (type in ('nfe', 'folha', 'rpa', 'contrato', 'recibo', 'outro')),
  raw_media_url text,
  raw_filename text,
  extracted_data jsonb not null default '{}'::jsonb,
  confidence numeric(5,2),
  status text not null default 'pending_review' check (status in ('pending_review', 'auto_approved', 'approved', 'rejected')),
  reviewed_by uuid references public.ariel_tenant_users(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_ariel_documents_tenant_status on public.ariel_documents(tenant_id, status);
create index if not exists idx_ariel_documents_contact on public.ariel_documents(contact_id);

-- ============================================
-- OBRIGACOES FISCAIS (COMPLIANCE)
-- ============================================

create table if not exists public.ariel_fiscal_obligations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.ariel_tenants(id) on delete cascade,
  contact_id uuid references public.ariel_contacts(id) on delete cascade,
  obligation_type text not null,
  reference_period text,
  due_date date not null,
  estimated_value_cents integer,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'late', 'cancelled')),
  completed_at timestamptz,
  completed_by uuid references public.ariel_tenant_users(id),
  alert_sent_d5 boolean not null default false,
  alert_sent_d3 boolean not null default false,
  alert_sent_d1 boolean not null default false,
  alert_sent_d0 boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_ariel_obligations_tenant_due on public.ariel_fiscal_obligations(tenant_id, due_date);
create index if not exists idx_ariel_obligations_pending on public.ariel_fiscal_obligations(due_date) where status = 'pending';

-- ============================================
-- TAREFAS
-- ============================================

create table if not exists public.ariel_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.ariel_tenants(id) on delete cascade,
  contact_id uuid references public.ariel_contacts(id) on delete cascade,
  conversation_id uuid references public.ariel_conversations(id) on delete set null,
  title text not null,
  description text,
  assigned_to uuid references public.ariel_tenant_users(id),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  due_date timestamptz,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  source text not null default 'manual',
  source_metadata jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_ariel_tasks_tenant_status on public.ariel_tasks(tenant_id, status);
create index if not exists idx_ariel_tasks_due on public.ariel_tasks(tenant_id, due_date);

-- ============================================
-- PROPOSTAS
-- ============================================

create table if not exists public.ariel_proposals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.ariel_tenants(id) on delete cascade,
  contact_id uuid not null references public.ariel_contacts(id) on delete cascade,
  regime text,
  monthly_fee_cents integer not null,
  setup_fee_cents integer default 0,
  services jsonb not null default '[]'::jsonb,
  message_text text,
  status text not null default 'sent' check (status in ('sent', 'viewed', 'accepted', 'rejected', 'expired')),
  sent_at timestamptz not null default now(),
  viewed_at timestamptz,
  responded_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz
);
create index if not exists idx_ariel_proposals_tenant_status on public.ariel_proposals(tenant_id, status);
create index if not exists idx_ariel_proposals_contact on public.ariel_proposals(contact_id);

-- ============================================
-- KNOWLEDGE BASE
-- ============================================

create table if not exists public.ariel_knowledge_base (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.ariel_tenants(id) on delete cascade,
  intent text not null,
  keywords text[] not null default '{}',
  response_template text not null,
  requires_action text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ariel_kb_tenant_intent on public.ariel_knowledge_base(tenant_id, intent);

-- ============================================
-- AUDITORIA
-- ============================================

create table if not exists public.ariel_audit_log (
  id bigserial primary key,
  tenant_id uuid,
  actor text not null,
  action text not null,
  resource_type text,
  resource_id uuid,
  payload jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);
create index if not exists idx_ariel_audit_tenant_created on public.ariel_audit_log(tenant_id, created_at desc);

-- ============================================
-- TRIGGERS
-- ============================================

create or replace function public.ariel_handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_ariel_tenants on public.ariel_tenants;
create trigger set_updated_at_ariel_tenants
  before update on public.ariel_tenants
  for each row execute function public.ariel_handle_updated_at();

drop trigger if exists set_updated_at_ariel_contacts on public.ariel_contacts;
create trigger set_updated_at_ariel_contacts
  before update on public.ariel_contacts
  for each row execute function public.ariel_handle_updated_at();

drop trigger if exists set_updated_at_ariel_conversations on public.ariel_conversations;
create trigger set_updated_at_ariel_conversations
  before update on public.ariel_conversations
  for each row execute function public.ariel_handle_updated_at();

drop trigger if exists set_updated_at_ariel_kb on public.ariel_knowledge_base;
create trigger set_updated_at_ariel_kb
  before update on public.ariel_knowledge_base
  for each row execute function public.ariel_handle_updated_at();

-- Trigger: atualiza last_message_at do contato
create or replace function public.ariel_update_contact_last_message()
returns trigger as $$
begin
  update public.ariel_contacts
  set last_message_at = new.created_at,
      last_agent_id = coalesce(new.agent_id, last_agent_id)
  where id = new.contact_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_ariel_update_contact_last_message on public.ariel_messages;
create trigger trg_ariel_update_contact_last_message
  after insert on public.ariel_messages
  for each row execute function public.ariel_update_contact_last_message();

-- ============================================
-- RLS (Row Level Security)
-- ============================================

alter table public.ariel_tenants enable row level security;
alter table public.ariel_tenant_users enable row level security;
alter table public.ariel_contacts enable row level security;
alter table public.ariel_conversations enable row level security;
alter table public.ariel_messages enable row level security;
alter table public.ariel_documents enable row level security;
alter table public.ariel_fiscal_obligations enable row level security;
alter table public.ariel_tasks enable row level security;
alter table public.ariel_proposals enable row level security;
alter table public.ariel_knowledge_base enable row level security;
alter table public.ariel_audit_log enable row level security;

-- Grants
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;
