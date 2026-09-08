-- Fix service_category: match the TypeScript types exactly
-- Types expect: id, company_id, name, sort_order, active, created_at, updated_at

DROP TABLE IF EXISTS public.service_category CASCADE;

CREATE TABLE public.service_category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_service_category_company_id ON public.service_category(company_id);

ALTER TABLE public.service_category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_category_all_authenticated" ON public.service_category
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "service_category_anon_read" ON public.service_category
  FOR SELECT TO anon USING (true);
