-- ================================================================
-- VeloHUB: Módulos de Serviços, Agenda, Financeiro, Orçamentos
-- Aplicar via Supabase SQL Editor
-- ================================================================

-- 1. SLUG e campos extras na company para booking público
ALTER TABLE public.company ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE public.company ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '{"mon":{"open":"08:00","close":"18:00"},"tue":{"open":"08:00","close":"18:00"},"wed":{"open":"08:00","close":"18:00"},"thu":{"open":"08:00","close":"18:00"},"fri":{"open":"08:00","close":"18:00"},"sat":{"open":"09:00","close":"14:00"},"sun":null}';
ALTER TABLE public.company ADD COLUMN IF NOT EXISTS booking_enabled boolean DEFAULT true;
ALTER TABLE public.company ADD COLUMN IF NOT EXISTS booking_advance_days integer DEFAULT 30;
ALTER TABLE public.company ADD COLUMN IF NOT EXISTS google_review_url text;
ALTER TABLE public.company ADD COLUMN IF NOT EXISTS google_place_id text;

-- Gerar slug automático para empresas existentes
UPDATE public.company
SET slug = lower(regexp_replace(nome, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- 2. SERVICE CATEGORIES
CREATE TABLE IF NOT EXISTS public.service_category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.service_category ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sc_company" ON public.service_category;
DROP POLICY IF EXISTS "sc_public" ON public.service_category;
CREATE POLICY "sc_company" ON public.service_category FOR ALL
  USING (has_company_access(company_id));
CREATE POLICY "sc_public" ON public.service_category FOR SELECT
  USING (active = true);

-- 3. SERVICES (catálogo de serviços para agendamento)
CREATE TABLE IF NOT EXISTS public.service (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.service_category(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  duration_minutes integer DEFAULT 60,
  price numeric(10,2),
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.service ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "svc_company" ON public.service;
DROP POLICY IF EXISTS "svc_public" ON public.service;
CREATE POLICY "svc_company" ON public.service FOR ALL
  USING (has_company_access(company_id));
CREATE POLICY "svc_public" ON public.service FOR SELECT
  USING (active = true);
CREATE INDEX IF NOT EXISTS idx_service_company ON public.service(company_id, active);

-- 4. PROFESSIONALS (membros da equipe com agenda e comissão)
CREATE TABLE IF NOT EXISTS public.professional (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  specialty text,
  photo_url text,
  commission_type text DEFAULT 'percent',
  commission_value numeric(10,2) DEFAULT 0,
  work_schedule jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.professional ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prof_company" ON public.professional;
DROP POLICY IF EXISTS "prof_public" ON public.professional;
CREATE POLICY "prof_company" ON public.professional FOR ALL
  USING (has_company_access(company_id));
CREATE POLICY "prof_public" ON public.professional FOR SELECT
  USING (active = true);
CREATE INDEX IF NOT EXISTS idx_professional_company ON public.professional(company_id, active);

-- 5. PROFESSIONAL ↔ SERVICE
CREATE TABLE IF NOT EXISTS public.professional_service (
  professional_id uuid NOT NULL REFERENCES public.professional(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.service(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, service_id)
);
ALTER TABLE public.professional_service ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ps_company" ON public.professional_service;
CREATE POLICY "ps_company" ON public.professional_service FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.professional p
    WHERE p.id = professional_id AND has_company_access(p.company_id)
  ));
CREATE POLICY "ps_public" ON public.professional_service FOR SELECT USING (true);

-- 6. ESTENDER agendamento com campos do módulo de serviços
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES public.professional(id) ON DELETE SET NULL;
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.service(id) ON DELETE SET NULL;
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS price numeric(10,2);
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS source text DEFAULT 'interno';
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.agendamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ag_company" ON public.agendamento;
DROP POLICY IF EXISTS "ag_public_insert" ON public.agendamento;
DROP POLICY IF EXISTS "ag_public_read" ON public.agendamento;
CREATE POLICY "ag_company" ON public.agendamento FOR ALL
  USING (has_company_access(company_id));
CREATE POLICY "ag_public_insert" ON public.agendamento FOR INSERT
  WITH CHECK (true);
CREATE POLICY "ag_public_read" ON public.agendamento FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_agendamento_company_inicio ON public.agendamento(company_id, inicio);
CREATE INDEX IF NOT EXISTS idx_agendamento_professional ON public.agendamento(professional_id, inicio);

-- 7. FINANCIAL ENTRIES
CREATE TABLE IF NOT EXISTS public.financial_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('entrada', 'saida')),
  category text,
  description text NOT NULL,
  amount numeric(10,2) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'pendente', 'cancelado')),
  reference_agendamento_id uuid REFERENCES public.agendamento(id) ON DELETE SET NULL,
  reference_card_id uuid REFERENCES public.crm_cards(id) ON DELETE SET NULL,
  professional_id uuid REFERENCES public.professional(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.financial_entry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fe_company" ON public.financial_entry;
CREATE POLICY "fe_company" ON public.financial_entry FOR ALL
  USING (has_company_access(company_id));
CREATE INDEX IF NOT EXISTS idx_financial_company_date ON public.financial_entry(company_id, date DESC);

-- 8. JOB PHOTOS (antes/depois)
CREATE TABLE IF NOT EXISTS public.job_photo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  card_id uuid REFERENCES public.crm_cards(id) ON DELETE CASCADE,
  agendamento_id uuid REFERENCES public.agendamento(id) ON DELETE SET NULL,
  type text DEFAULT 'before' CHECK (type IN ('before', 'after', 'other')),
  url text NOT NULL,
  caption text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.job_photo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jp_company" ON public.job_photo;
CREATE POLICY "jp_company" ON public.job_photo FOR ALL
  USING (has_company_access(company_id));
CREATE INDEX IF NOT EXISTS idx_job_photo_card ON public.job_photo(card_id, created_at DESC);

-- 9. QUOTES / ORÇAMENTOS
CREATE TABLE IF NOT EXISTS public.quote (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  card_id uuid REFERENCES public.crm_cards(id) ON DELETE SET NULL,
  customer_name text,
  customer_phone text,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(10,2) DEFAULT 0,
  discount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) DEFAULT 0,
  notes text,
  validity_days integer DEFAULT 7,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.quote ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "qt_company" ON public.quote;
CREATE POLICY "qt_company" ON public.quote FOR ALL
  USING (has_company_access(company_id));
CREATE INDEX IF NOT EXISTS idx_quote_company ON public.quote(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_card ON public.quote(card_id);

-- 10. REVIEW REQUESTS (Google Reviews)
CREATE TABLE IF NOT EXISTS public.review_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  card_id uuid REFERENCES public.crm_cards(id) ON DELETE SET NULL,
  agendamento_id uuid REFERENCES public.agendamento(id) ON DELETE SET NULL,
  customer_name text,
  customer_phone text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'clicked')),
  sent_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.review_request ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rr_company" ON public.review_request;
CREATE POLICY "rr_company" ON public.review_request FOR ALL
  USING (has_company_access(company_id));

-- 11. Realtime para novas tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.agendamento;
ALTER PUBLICATION supabase_realtime ADD TABLE public.financial_entry;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quote;
