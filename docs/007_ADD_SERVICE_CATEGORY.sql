-- Create missing table: service_category
-- Used in onboarding step 4 to group services

CREATE TABLE IF NOT EXISTS public.service_category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  nome text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_category_company_id ON public.service_category(company_id);

ALTER TABLE public.service_category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_category_all_authenticated" ON public.service_category
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "service_category_anon_read" ON public.service_category
  FOR SELECT TO anon USING (true);

-- Also add category column to service if not exists
DO $$ BEGIN
  ALTER TABLE public.service ADD COLUMN category text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
