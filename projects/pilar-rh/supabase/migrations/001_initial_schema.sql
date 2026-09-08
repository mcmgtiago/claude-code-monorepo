-- PILAR Recursos Humanos — Schema Inicial
-- Executar via console Supabase ou CLI

-- ======================
-- TABELAS
-- ======================

-- Leads empresariais
create table if not exists company_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text not null,
  city text not null,
  state text not null,
  company_size text not null,
  service text not null,
  urgency text not null,
  description text not null,
  consent boolean not null default false,
  status text default 'novo',
  created_at timestamptz default now()
);

-- Candidatos
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  city text not null,
  state text not null,
  area text not null,
  experience_level text not null,
  linkedin text,
  resume_path text,
  consent boolean not null default false,
  status text default 'cadastrado',
  created_at timestamptz default now()
);

-- Vagas
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  company text,
  location text not null,
  city text,
  state text,
  area text not null,
  contract text not null,
  modality text not null,
  level text not null,
  summary text not null,
  description text not null,
  requirements jsonb default '[]',
  benefits jsonb default '[]',
  salary_min numeric,
  salary_max numeric,
  is_confidential boolean default false,
  is_active boolean default true,
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Candidaturas
create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id),
  candidate_id uuid references candidates(id),
  message text,
  status text default 'recebida',
  created_at timestamptz default now()
);

-- Newsletter
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  consent boolean not null default false,
  created_at timestamptz default now()
);

-- ======================
-- ROW LEVEL SECURITY
-- ======================

alter table company_leads enable row level security;
alter table candidates enable row level security;
alter table jobs enable row level security;
alter table job_applications enable row level security;
alter table newsletter_subscribers enable row level security;

-- Vagas: leitura pública apenas de vagas ativas
create policy "public_read_active_jobs" on jobs
  for select using (is_active = true);

-- Vagas: inserção apenas para usuários autenticados (admin)
create policy "admin_insert_jobs" on jobs
  for insert to authenticated with check (true);

create policy "admin_update_jobs" on jobs
  for update to authenticated using (true);

-- Company leads: inserção pública (formulário), leitura para admin
create policy "public_insert_leads" on company_leads
  for insert with check (consent = true);

create policy "admin_read_leads" on company_leads
  for select to authenticated using (true);

-- Candidates: inserção pública (formulário), leitura para admin
create policy "public_insert_candidates" on candidates
  for insert with check (consent = true);

create policy "admin_read_candidates" on candidates
  for select to authenticated using (true);

-- Job applications: inserção pública, leitura para admin
create policy "public_insert_applications" on job_applications
  for insert with check (true);

create policy "admin_read_applications" on job_applications
  for select to authenticated using (true);

-- Newsletter: inserção pública, leitura para admin
create policy "public_insert_newsletter" on newsletter_subscribers
  for insert with check (consent = true);

create policy "admin_read_newsletter" on newsletter_subscribers
  for select to authenticated using (true);

-- ======================
-- STORAGE
-- ======================

-- Bucket privado para currículos
-- Nota: criar via console Supabase:
-- insert into storage.buckets (id, name, public) values ('curriculos', 'curriculos', false);

-- Policy para upload público de currículos
-- create policy "public_upload_curriculos" on storage.objects
--   for insert with check (bucket_id = 'curriculos');

-- Policy para leitura autenticada
-- create policy "admin_read_curriculos" on storage.objects
--   for select to authenticated using (bucket_id = 'curriculos');
