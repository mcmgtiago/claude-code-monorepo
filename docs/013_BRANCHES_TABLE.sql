-- Create branch (filial) table
CREATE TABLE IF NOT EXISTS public.branch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  phone text,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_branch_company ON public.branch(company_id);

ALTER TABLE public.branch ENABLE ROW LEVEL SECURITY;

-- RLS: tenant access
CREATE POLICY "branch_tenant" ON public.branch FOR ALL TO authenticated
  USING (public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'))
  WITH CHECK (public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "branch_anon" ON public.branch FOR SELECT TO anon USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.branch TO authenticated;
GRANT SELECT ON public.branch TO anon;

-- Add branch_id to professional (optional link)
ALTER TABLE public.professional ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branch(id) ON DELETE SET NULL;
