-- =============================================================
-- DEFINITIVE SCHEMA — Generated from types.ts (BarbeiroPro AI)
-- This drops EVERYTHING and recreates correctly.
-- Run this ONCE in the SQL Editor.
-- =============================================================

-- RESET
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Clean realtime policies
DO $$ BEGIN
  DROP POLICY IF EXISTS tenant_topic_subscription ON realtime.messages;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- ENUMS (exact values from types.ts)
-- =============================================================
CREATE TYPE app_role AS ENUM ('super_admin');
CREATE TYPE tenant_role AS ENUM ('owner', 'admin', 'recepcao', 'barbeiro', 'financeiro');
CREATE TYPE appointment_status AS ENUM ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu');
CREATE TYPE appointment_source AS ENUM ('interno', 'online', 'demo');
CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'vip');
CREATE TYPE financial_type AS ENUM ('entrada', 'saida');
CREATE TYPE financial_status AS ENUM ('confirmado', 'pendente', 'cancelado');
CREATE TYPE invoice_status AS ENUM ('pago', 'pendente', 'vencido', 'cancelado');
CREATE TYPE plano_type AS ENUM ('starter', 'pro', 'premium');
CREATE TYPE ciclo_type AS ENUM ('mensal', 'anual');
CREATE TYPE status_cobranca AS ENUM ('trial', 'ativo', 'inadimplente', 'suspenso', 'cancelado');
CREATE TYPE commission_type AS ENUM ('percent', 'fixed');

-- =============================================================
-- TABLES (exact columns from types.ts Row definitions)
-- =============================================================

CREATE TABLE public.app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name text DEFAULT 'BarbeiroPro AI',
  super_admin_emails text[] DEFAULT '{}',
  system_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'super_admin',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  nome text NOT NULL,
  descricao text,
  preco_cents integer DEFAULT 0,
  moeda text DEFAULT 'BRL',
  intervalo text DEFAULT 'mensal',
  trial_days integer DEFAULT 7,
  limite_profissionais integer DEFAULT 1,
  limite_clientes integer DEFAULT 50,
  limite_agendamentos_mes integer DEFAULT 100,
  limite_usuarios integer DEFAULT 1,
  features jsonb DEFAULT '{}',
  checkout_url text,
  provider_price_ids jsonb,
  ativo boolean DEFAULT true,
  destaque boolean DEFAULT false,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.company (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  nome_fantasia text,
  slug text UNIQUE,
  razao_social text,
  cnpj text,
  cpf_responsavel text,
  email_contato text,
  telefone_comercial text,
  whatsapp text,
  endereco jsonb,
  business_hours jsonb,
  logo_url text,
  primary_color text,
  plano plano_type DEFAULT 'starter',
  ciclo ciclo_type DEFAULT 'mensal',
  selected_plan_slug text,
  trial_ate timestamptz,
  status_cobranca status_cobranca DEFAULT 'trial',
  proximo_vencimento timestamptz,
  valor_mensal integer DEFAULT 0,
  fidelidade_ativa boolean DEFAULT false,
  fidelidade_meta integer DEFAULT 10,
  fidelidade_premio text,
  onboarding_concluido boolean DEFAULT false,
  onboarding_step integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  ultimo_acesso_at timestamptz
);

CREATE TABLE public.company_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nome text,
  role tenant_role DEFAULT 'barbeiro',
  ativo boolean DEFAULT true,
  convite_aceito boolean DEFAULT false,
  convite_token text,
  forcar_troca_senha boolean DEFAULT false,
  ultimo_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.subscription (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plan(id),
  provider text DEFAULT 'manual',
  status text DEFAULT 'active',
  external_subscription_id text,
  external_customer_id text,
  buyer_email text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  canceled_at timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id)
);

CREATE TABLE public.billing_event_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_type text,
  external_id text,
  buyer_email text,
  payload jsonb,
  matched_company_id uuid REFERENCES public.company(id),
  processed boolean DEFAULT false,
  error text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.trial_identity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  company_id uuid REFERENCES public.company(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.service_category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.service (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.service_category(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  duration_minutes integer DEFAULT 30,
  price integer DEFAULT 0,
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.professional (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  specialty text,
  photo_url text,
  comissao_percentual numeric DEFAULT 0,
  commission_type text,
  commission_value numeric,
  work_schedule jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.professional_service (
  professional_id uuid NOT NULL REFERENCES public.professional(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.service(id) ON DELETE CASCADE,
  comissao_percentual numeric,
  commission_type text,
  commission_value numeric,
  PRIMARY KEY (professional_id, service_id)
);

CREATE TABLE public.customer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  status customer_status DEFAULT 'active',
  fidelidade_contador integer DEFAULT 0,
  total_appointments integer DEFAULT 0,
  last_appointment_at timestamptz,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.appointment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professional(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customer(id) ON DELETE SET NULL,
  service_id uuid NOT NULL REFERENCES public.service(id) ON DELETE RESTRICT,
  scheduled_at timestamptz NOT NULL,
  customer_name text,
  customer_phone text,
  professional_name text,
  service_name text,
  price integer,
  notes text,
  status appointment_status DEFAULT 'agendado',
  source appointment_source DEFAULT 'interno',
  confirm_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  confirmed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.product (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  nome text NOT NULL,
  preco_cents integer DEFAULT 0,
  custo_cents integer DEFAULT 0,
  estoque integer,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.sale (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointment(id),
  customer_id uuid REFERENCES public.customer(id),
  professional_id uuid REFERENCES public.professional(id),
  created_by uuid,
  total_cents integer DEFAULT 0,
  desconto_cents integer DEFAULT 0,
  forma_pagamento text,
  observacao text,
  status text DEFAULT 'aberta',
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.sale_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sale(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES public.professional(id),
  tipo text NOT NULL,
  descricao text NOT NULL,
  ref_id uuid,
  quantidade integer DEFAULT 1,
  preco_cents integer DEFAULT 0,
  comissao_percentual numeric DEFAULT 0,
  comissao_cents integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.club_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  nome text NOT NULL,
  preco_cents integer NOT NULL,
  beneficios jsonb DEFAULT '{}',
  checkout_url text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.club_member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customer(id) ON DELETE CASCADE,
  club_plan_id uuid NOT NULL REFERENCES public.club_plan(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  current_period_end timestamptz,
  status text DEFAULT 'ativo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.financial_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  reference_appointment_id uuid REFERENCES public.appointment(id),
  type financial_type NOT NULL,
  status financial_status DEFAULT 'pendente',
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount integer NOT NULL,
  description text,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.invoice_simulated (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  reference_month text NOT NULL,
  amount integer NOT NULL,
  due_date date NOT NULL,
  status invoice_status DEFAULT 'pendente',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX idx_company_user_company ON public.company_user(company_id);
CREATE INDEX idx_company_user_user ON public.company_user(user_id);
CREATE INDEX idx_service_category_company ON public.service_category(company_id);
CREATE INDEX idx_service_company ON public.service(company_id);
CREATE INDEX idx_professional_company ON public.professional(company_id);
CREATE INDEX idx_customer_company ON public.customer(company_id);
CREATE INDEX idx_appointment_company ON public.appointment(company_id);
CREATE INDEX idx_appointment_scheduled ON public.appointment(scheduled_at);
CREATE INDEX idx_appointment_professional ON public.appointment(professional_id);
CREATE INDEX idx_sale_company ON public.sale(company_id);
CREATE INDEX idx_sale_item_sale ON public.sale_item(sale_id);
CREATE INDEX idx_financial_company ON public.financial_entry(company_id);
CREATE INDEX idx_financial_date ON public.financial_entry(date);

-- =============================================================
-- RLS — Permissive (security via server-side auth middleware)
-- =============================================================
DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'app_config','user_roles','plan','company','company_user','subscription',
    'billing_event_log','trial_identity','service_category','service',
    'professional','professional_service','customer','appointment',
    'product','sale','sale_item','club_plan','club_member',
    'financial_entry','invoice_simulated'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "%s_auth" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "%s_anon" ON public.%I FOR SELECT TO anon USING (true)', tbl, tbl);
  END LOOP;
END $$;

-- Anon can also INSERT into appointment and customer (public booking)
CREATE POLICY "appointment_anon_insert" ON public.appointment FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "customer_anon_insert" ON public.customer FOR INSERT TO anon WITH CHECK (true);

-- =============================================================
-- FUNCTIONS (RPCs used by the app)
-- =============================================================

CREATE OR REPLACE FUNCTION public.has_company_access(_company_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_user
    WHERE company_user.company_id = _company_id
      AND company_user.user_id = auth.uid()
      AND company_user.ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_company_role(_company_id uuid, _roles text[])
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_user
    WHERE company_user.company_id = _company_id
      AND company_user.user_id = auth.uid()
      AND company_user.ativo = true
      AND company_user.role::text = ANY(_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT company_id FROM public.company_user
    WHERE user_id = auth.uid() AND ativo = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.super_admin_claim_available()
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.claim_super_admin_if_empty()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'super_admin')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.confirm_appointment_by_token(_token text)
RETURNS boolean AS $$
DECLARE apt_id uuid;
BEGIN
  SELECT id INTO apt_id FROM public.appointment WHERE confirm_token = _token AND status = 'agendado';
  IF apt_id IS NULL THEN RETURN false; END IF;
  UPDATE public.appointment SET status = 'confirmado', confirmed_at = now() WHERE id = apt_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.cancel_appointment_by_token(_token text)
RETURNS boolean AS $$
DECLARE apt_id uuid;
BEGIN
  SELECT id INTO apt_id FROM public.appointment WHERE confirm_token = _token AND status IN ('agendado','confirmado');
  IF apt_id IS NULL THEN RETURN false; END IF;
  UPDATE public.appointment SET status = 'cancelado' WHERE id = apt_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_appointment_by_token(_token text)
RETURNS TABLE(
  id uuid, company_id uuid, scheduled_at timestamptz, status appointment_status,
  customer_name text, professional_name text, service_name text, confirmed_at timestamptz,
  company_nome text, company_telefone text, company_endereco text, company_primary_color text
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.company_id, a.scheduled_at, a.status,
    a.customer_name, a.professional_name, a.service_name, a.confirmed_at,
    c.nome_fantasia, c.telefone_comercial, (c.endereco->>'rua')::text, c.primary_color
  FROM public.appointment a
  JOIN public.company c ON c.id = a.company_id
  WHERE a.confirm_token = _token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_busy_slots(_company_id uuid, _professional_id uuid, _date text)
RETURNS TABLE(starts_at timestamptz, ends_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT a.scheduled_at AS starts_at,
    (a.scheduled_at + (s.duration_minutes || ' minutes')::interval) AS ends_at
  FROM public.appointment a
  JOIN public.service s ON s.id = a.service_id
  WHERE a.company_id = _company_id
    AND a.professional_id = _professional_id
    AND a.scheduled_at::date = _date::date
    AND a.status NOT IN ('cancelado', 'nao_compareceu');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.upsert_customer_public(_company_id uuid, _name text, _phone text)
RETURNS uuid AS $$
DECLARE cid uuid;
BEGIN
  SELECT id INTO cid FROM public.customer WHERE company_id = _company_id AND phone = _phone LIMIT 1;
  IF cid IS NOT NULL THEN RETURN cid; END IF;
  INSERT INTO public.customer(company_id, name, phone) VALUES (_company_id, _name, _phone) RETURNING id INTO cid;
  RETURN cid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.close_sale(_sale_id uuid, _forma_pagamento text DEFAULT NULL, _desconto_cents integer DEFAULT 0)
RETURNS SETOF public.sale AS $$
DECLARE
  s public.sale;
  item record;
  total integer := 0;
BEGIN
  SELECT * INTO s FROM public.sale WHERE id = _sale_id AND status = 'aberta';
  IF s.id IS NULL THEN RAISE EXCEPTION 'Sale not found or already closed'; END IF;

  -- Sum items
  SELECT COALESCE(SUM(preco_cents * quantidade), 0) INTO total FROM public.sale_item WHERE sale_id = _sale_id;

  -- Update sale
  UPDATE public.sale SET
    status = 'fechada',
    total_cents = total - COALESCE(_desconto_cents, 0),
    desconto_cents = COALESCE(_desconto_cents, 0),
    forma_pagamento = COALESCE(_forma_pagamento, forma_pagamento),
    closed_at = now(),
    updated_at = now()
  WHERE id = _sale_id;

  -- Create financial entry
  INSERT INTO public.financial_entry (company_id, reference_appointment_id, type, status, date, amount, description, category)
  VALUES (s.company_id, s.appointment_id, 'entrada', 'confirmado', CURRENT_DATE, total - COALESCE(_desconto_cents, 0), 'Comanda #' || LEFT(_sale_id::text, 8), 'servico');

  -- Increment customer fidelidade
  IF s.customer_id IS NOT NULL THEN
    UPDATE public.customer SET
      fidelidade_contador = fidelidade_contador + 1,
      total_appointments = total_appointments + 1,
      last_appointment_at = now()
    WHERE id = s.customer_id;
  END IF;

  -- Mark appointment as completed
  IF s.appointment_id IS NOT NULL THEN
    UPDATE public.appointment SET status = 'concluido', completed_at = now() WHERE id = s.appointment_id;
  END IF;

  RETURN QUERY SELECT * FROM public.sale WHERE id = _sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.trial_identity_conflict(_cpf text, _email text, _phone text)
RETURNS text AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.trial_identity WHERE cpf = _cpf) THEN RETURN 'cpf'; END IF;
  IF EXISTS (SELECT 1 FROM public.trial_identity WHERE email = _email) THEN RETURN 'email'; END IF;
  IF EXISTS (SELECT 1 FROM public.trial_identity WHERE phone = _phone) THEN RETURN 'phone'; END IF;
  RETURN 'none';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- GRANTS
-- =============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT INSERT ON public.appointment TO anon;
GRANT INSERT ON public.customer TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- =============================================================
-- SEED: Default plans
-- =============================================================
INSERT INTO public.plan (slug, nome, descricao, preco_cents, trial_days, limite_profissionais, limite_clientes, limite_agendamentos_mes, limite_usuarios, features, ordem) VALUES
('starter', 'Starter', 'Ideal para começar', 4900, 7, 1, 50, 100, 1, '{"agendamento":true,"clientes":true,"relatoriosBasicos":true}', 1),
('pro', 'Pro', 'Para barbearias em crescimento', 12900, 7, 5, 500, 1000, 5, '{"agendamento":true,"clientes":true,"multiprofissional":true,"comissoes":true,"financeiro":true,"relatoriosAvancados":true,"fidelidade":true,"lembretesWhatsapp":true}', 2),
('premium', 'Premium', 'Tudo liberado', 24900, 7, 99, 9999, 99999, 99, '{"agendamento":true,"clientes":true,"multiprofissional":true,"comissoes":true,"financeiro":true,"relatoriosAvancados":true,"fidelidade":true,"lembretesWhatsapp":true,"clubeAssinatura":true,"apiWebhooks":true,"aiGrowth":true}', 3);

-- Done!
SELECT 'Schema created successfully. Tables: ' || count(*)::text FROM information_schema.tables WHERE table_schema = 'public';
