-- Migration 015: Waitlist + NPS + appointment nps_token
-- Run after 013 (branches) and 014 (customer birthday)

-- === WAITLIST (Lista de Espera) ===
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  phone text,
  service_id uuid REFERENCES public.service(id) ON DELETE SET NULL,
  professional_id uuid REFERENCES public.professional(id) ON DELETE SET NULL,
  branch_id uuid REFERENCES public.branch(id) ON DELETE SET NULL,
  preferred_date date,
  preferred_time text,
  notes text,
  status text DEFAULT 'waiting', -- waiting, notified, booked, cancelled
  notified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_waitlist_company ON public.waitlist(company_id);
CREATE INDEX idx_waitlist_status ON public.waitlist(status);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waitlist_tenant" ON public.waitlist FOR ALL TO authenticated
  USING (public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'))
  WITH CHECK (public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "waitlist_anon" ON public.waitlist FOR SELECT TO anon USING (true);
CREATE POLICY "waitlist_anon_insert" ON public.waitlist FOR INSERT TO anon WITH CHECK (true);

-- === NPS (Pesquisa de Satisfação) ===
CREATE TABLE IF NOT EXISTS public.nps_response (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customer(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES public.appointment(id) ON DELETE SET NULL,
  token text UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  score integer CHECK (score >= 1 AND score <= 10),
  comment text,
  customer_name text,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_nps_company ON public.nps_response(company_id);
CREATE INDEX idx_nps_token ON public.nps_response(token);

ALTER TABLE public.nps_response ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nps_tenant" ON public.nps_response FOR ALL TO authenticated
  USING (public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'))
  WITH CHECK (public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
-- Anon can read + update (respond to NPS)
CREATE POLICY "nps_anon_read" ON public.nps_response FOR SELECT TO anon USING (true);
CREATE POLICY "nps_anon_update" ON public.nps_response FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Add nps_token to appointment (generated on close_sale)
ALTER TABLE public.appointment ADD COLUMN IF NOT EXISTS nps_token text;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist TO authenticated;
GRANT SELECT, INSERT ON public.waitlist TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nps_response TO authenticated;
GRANT SELECT, UPDATE ON public.nps_response TO anon;
