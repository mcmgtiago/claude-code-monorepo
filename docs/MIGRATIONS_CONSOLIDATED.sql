-- Supabase Schema for Barbearia SaaS
-- Generated from types.ts (Database schema)
-- 2025-08-26

-- ============================================================
-- RESET: Drop everything in public schema (keeps auth.users intact)
-- ============================================================
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Also clean realtime policies that reference old functions
DO $$ BEGIN
  DROP POLICY IF EXISTS tenant_topic_subscription ON realtime.messages;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================
-- FRESH SCHEMA
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tenant_role AS ENUM ('owner', 'admin', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ciclo_type AS ENUM ('mensal', 'semestral', 'anual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE plano_type AS ENUM ('starter', 'pro', 'business', 'trial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE status_cobranca AS ENUM ('ativo', 'suspenso', 'cancelado', 'atrasado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('agendado', 'confirmado', 'realizado', 'cancelado', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_source AS ENUM ('internal', 'booking_link', 'whatsapp');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE customer_status AS ENUM ('ativo', 'inativo', 'bloqueado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE financial_type AS ENUM ('receita', 'despesa', 'comissao');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE financial_status AS ENUM ('pendente', 'realizado', 'cancelado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create tables

CREATE TABLE IF NOT EXISTS public.app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name text DEFAULT 'BarbeiroPro AI',
  super_admin_emails text[] DEFAULT '{}',
  system_settings jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'super_admin',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  nome text NOT NULL,
  preco_cents integer NOT NULL,
  dias_trial integer DEFAULT 7,
  limite_profissionais integer,
  limite_clientes integer,
  limite_agendamentos_mes integer,
  features jsonb DEFAULT '{}',
  checkout_url text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company (
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

  -- Plano e cobrança
  plano plano_type DEFAULT 'trial',
  ciclo ciclo_type DEFAULT 'mensal',
  selected_plan_slug text REFERENCES public.plan(slug),
  trial_ate timestamp with time zone,
  status_cobranca status_cobranca DEFAULT 'ativo',
  proximo_vencimento timestamp with time zone,
  valor_mensal integer DEFAULT 0,

  -- Fidelidade
  fidelidade_ativa boolean DEFAULT false,
  fidelidade_meta integer DEFAULT 10,
  fidelidade_premio text,

  -- Onboarding
  onboarding_concluido boolean DEFAULT false,
  onboarding_step integer DEFAULT 0,

  -- Audit
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ultimo_acesso_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.subscription (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  plan_slug text NOT NULL REFERENCES public.plan(slug),
  inicio_em timestamp with time zone DEFAULT now(),
  vencimento_em timestamp with time zone,
  status text DEFAULT 'ativo',
  external_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.billing_event_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_type text,
  external_id text,
  buyer_email text,
  payload jsonb,
  matched_company_id uuid REFERENCES public.company(id),
  processed boolean DEFAULT false,
  error text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nome text,
  role tenant_role DEFAULT 'staff',
  ativo boolean DEFAULT true,
  convite_aceito boolean DEFAULT false,
  convite_token text,
  forcar_troca_senha boolean DEFAULT false,
  ultimo_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.professional (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text,
  telefone text,
  especialidade text,
  comissao_padrao numeric(5,2),
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  duracao_minutos integer DEFAULT 30,
  preco_cents integer NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.professional_service (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professional(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.service(id) ON DELETE CASCADE,
  comissao_pct numeric(5,2),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  status customer_status DEFAULT 'ativo',
  fidelidade_contador integer DEFAULT 0,
  total_appointments integer DEFAULT 0,
  last_appointment_at timestamp with time zone,
  tags text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appointment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professional(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customer(id) ON DELETE SET NULL,
  service_id uuid NOT NULL REFERENCES public.service(id) ON DELETE RESTRICT,

  scheduled_at timestamp with time zone NOT NULL,
  customer_name text,
  customer_phone text,
  professional_name text,
  service_name text,
  price integer,
  notes text,

  status appointment_status DEFAULT 'agendado',
  source appointment_source DEFAULT 'internal',

  confirm_token text UNIQUE,
  confirmed_at timestamp with time zone,
  completed_at timestamp with time zone,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  preco_cents integer NOT NULL,
  estoque integer DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sale (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointment(id),
  customer_id uuid REFERENCES public.customer(id),

  total_cents integer NOT NULL,
  desconto_cents integer DEFAULT 0,
  forma_pagamento text,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sale_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sale(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.service(id),
  product_id uuid REFERENCES public.product(id),

  quantidade integer DEFAULT 1,
  preco_unitario_cents integer NOT NULL,
  total_cents integer NOT NULL,

  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.club_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  nome text NOT NULL,
  preco_cents integer NOT NULL,
  beneficios jsonb DEFAULT '{}',
  checkout_url text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.club_member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customer(id) ON DELETE CASCADE,
  club_plan_id uuid NOT NULL REFERENCES public.club_plan(id) ON DELETE CASCADE,

  started_at timestamp with time zone DEFAULT now(),
  current_period_end timestamp with time zone,
  status text DEFAULT 'ativo',

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.financial_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  reference_appointment_id uuid REFERENCES public.appointment(id),

  type financial_type NOT NULL,
  status financial_status DEFAULT 'pendente',
  date date NOT NULL,
  amount integer NOT NULL,
  description text,
  category text,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoice_simulated (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  mes integer NOT NULL,
  ano integer NOT NULL,
  total_cents integer NOT NULL,
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes

CREATE INDEX IF NOT EXISTS idx_company_user_company_id ON public.company_user(company_id);
CREATE INDEX IF NOT EXISTS idx_company_user_user_id ON public.company_user(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_company_id ON public.professional(company_id);
CREATE INDEX IF NOT EXISTS idx_service_company_id ON public.service(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_company_id ON public.customer(company_id);
CREATE INDEX IF NOT EXISTS idx_appointment_company_id ON public.appointment(company_id);
CREATE INDEX IF NOT EXISTS idx_appointment_professional_id ON public.appointment(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointment_customer_id ON public.appointment(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointment_scheduled_at ON public.appointment(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sale_company_id ON public.sale(company_id);
CREATE INDEX IF NOT EXISTS idx_sale_customer_id ON public.sale(customer_id);
CREATE INDEX IF NOT EXISTS idx_club_member_customer_id ON public.club_member(customer_id);
CREATE INDEX IF NOT EXISTS idx_club_member_club_plan_id ON public.club_member(club_plan_id);
CREATE INDEX IF NOT EXISTS idx_financial_entry_company_id ON public.financial_entry(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_entry_date ON public.financial_entry(date);

-- Enable RLS

ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_simulated ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Helper function: check if user has access to company
CREATE OR REPLACE FUNCTION public.has_company_access(company_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_user
    WHERE company_user.company_id = $1
      AND company_user.user_id = auth.uid()
      AND company_user.ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: company (super_admin can see all, users see their own)
CREATE POLICY "super_admin_all" ON public.company
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "users_own_company" ON public.company
  FOR SELECT TO authenticated
  USING (
    public.has_company_access(id)
  );

-- RLS: company_user (by company_id)
CREATE POLICY "company_user_policy" ON public.company_user
  FOR ALL TO authenticated
  USING (
    public.has_company_access(company_id) OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- RLS: tenant tables (all share same pattern: by company_id)
CREATE POLICY "professional_by_company" ON public.professional
  FOR ALL TO authenticated
  USING (public.has_company_access(company_id));

CREATE POLICY "service_by_company" ON public.service
  FOR ALL TO authenticated
  USING (public.has_company_access(company_id));

CREATE POLICY "customer_by_company" ON public.customer
  FOR ALL TO authenticated
  USING (public.has_company_access(company_id));

CREATE POLICY "appointment_by_company" ON public.appointment
  FOR ALL TO authenticated
  USING (public.has_company_access(company_id));

CREATE POLICY "product_by_company" ON public.product
  FOR ALL TO authenticated
  USING (public.has_company_access(company_id));

CREATE POLICY "sale_by_company" ON public.sale
  FOR ALL TO authenticated
  USING (public.has_company_access(company_id));

CREATE POLICY "sale_item_by_sale" ON public.sale_item
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sale
      WHERE sale.id = sale_item.sale_id
        AND public.has_company_access(sale.company_id)
    )
  );

CREATE POLICY "club_plan_by_company" ON public.club_plan
  FOR ALL TO authenticated
  USING (public.has_company_access(company_id));

CREATE POLICY "club_member_by_company" ON public.club_member
  FOR ALL TO authenticated
  USING (public.has_company_access(company_id));

CREATE POLICY "financial_entry_by_company" ON public.financial_entry
  FOR ALL TO authenticated
  USING (public.has_company_access(company_id));

CREATE POLICY "invoice_by_company" ON public.invoice_simulated
  FOR ALL TO authenticated
  USING (public.has_company_access(company_id));

-- Create helpful RPCs

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
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
