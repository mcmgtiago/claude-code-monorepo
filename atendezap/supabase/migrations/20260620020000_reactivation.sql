-- Recuperação de base: campanhas de reativação de clientes antigos por e-mail

CREATE TABLE IF NOT EXISTS public.reactivation_campaign (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT 'Reativação',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reactivation_campaign TO authenticated;
GRANT ALL ON public.reactivation_campaign TO service_role;
ALTER TABLE public.reactivation_campaign ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY reactivation_campaign_access ON public.reactivation_campaign
    FOR ALL TO authenticated
    USING (public.is_super_admin() OR public.has_company_access(company_id))
    WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.reactivation_contact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.reactivation_campaign(id) ON DELETE CASCADE,
  email text NOT NULL,
  nome text,
  telefone text,
  step int NOT NULL DEFAULT 0,
  next_at timestamptz,
  status text NOT NULL DEFAULT 'pending', -- pending | done | unsubscribed | failed
  unsubscribe_token text,
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);
CREATE INDEX IF NOT EXISTS idx_reactivation_contact_company ON public.reactivation_contact (company_id);
CREATE INDEX IF NOT EXISTS idx_reactivation_contact_due ON public.reactivation_contact (next_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reactivation_contact_token ON public.reactivation_contact (unsubscribe_token);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reactivation_contact TO authenticated;
GRANT ALL ON public.reactivation_contact TO service_role;
ALTER TABLE public.reactivation_contact ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY reactivation_contact_access ON public.reactivation_contact
    FOR ALL TO authenticated
    USING (public.is_super_admin() OR public.has_company_access(company_id))
    WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
