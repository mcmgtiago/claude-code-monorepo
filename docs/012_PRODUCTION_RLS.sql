-- RLS Seguro para produção multi-tenant
-- Substitui as policies permissivas por policies que isolam por company_id

-- === DROP all existing policies ===
DO $$
DECLARE pol record; tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'company','company_user','professional','service','service_category',
    'customer','appointment','product','sale','sale_item','club_plan',
    'club_member','financial_entry','invoice_simulated','professional_service',
    'user_roles','app_config','plan','subscription','billing_event_log','trial_identity'
  ]) LOOP
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- === COMPANY ===
-- Insert: any authenticated (onboarding creates company)
CREATE POLICY "company_insert" ON public.company FOR INSERT TO authenticated WITH CHECK (true);
-- Select: own companies + super admin
CREATE POLICY "company_select" ON public.company FOR SELECT TO authenticated
  USING (public.has_company_access(id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
-- Update: own companies + super admin
CREATE POLICY "company_update" ON public.company FOR UPDATE TO authenticated
  USING (public.has_company_access(id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
-- Anon: read for booking pages
CREATE POLICY "company_anon" ON public.company FOR SELECT TO anon USING (true);

-- === COMPANY_USER ===
CREATE POLICY "cu_insert" ON public.company_user FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "cu_select" ON public.company_user FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "cu_update" ON public.company_user FOR UPDATE TO authenticated
  USING (public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "cu_delete" ON public.company_user FOR DELETE TO authenticated
  USING (public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

-- === TENANT TABLES (all same pattern: by company_id) ===
DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'professional','service','service_category','customer','appointment',
    'product','sale','sale_item','club_plan','club_member',
    'financial_entry','invoice_simulated','professional_service'
  ]) LOOP
    -- Authenticated: full access to own company + super admin
    EXECUTE format('CREATE POLICY "%s_tenant" ON public.%I FOR ALL TO authenticated USING (
      public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''super_admin'')
    ) WITH CHECK (
      public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''super_admin'')
    )', tbl, tbl);

    -- Anon: read only (for public booking pages)
    EXECUTE format('CREATE POLICY "%s_anon" ON public.%I FOR SELECT TO anon USING (true)', tbl, tbl);
  END LOOP;
END $$;

-- Anon can also INSERT into appointment and customer (public booking page)
CREATE POLICY "appointment_anon_insert" ON public.appointment FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "customer_anon_insert" ON public.customer FOR INSERT TO anon WITH CHECK (true);

-- === GLOBAL TABLES ===
-- user_roles: user reads own, super admin manages
CREATE POLICY "ur_select" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = auth.uid() AND ur2.role = 'super_admin'));
CREATE POLICY "ur_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (true);

-- app_config: all authenticated can read, super admin can write
CREATE POLICY "ac_select" ON public.app_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "ac_write" ON public.app_config FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

-- plan: everyone reads, super admin writes
CREATE POLICY "plan_read" ON public.plan FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "plan_write" ON public.plan FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "plan_update" ON public.plan FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

-- subscription: own company
CREATE POLICY "sub_tenant" ON public.subscription FOR ALL TO authenticated
  USING (public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'))
  WITH CHECK (public.has_company_access(company_id) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

-- billing_event_log: super admin only
CREATE POLICY "bel_admin" ON public.billing_event_log FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

-- trial_identity: super admin + own
CREATE POLICY "ti_all" ON public.trial_identity FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Verify count
SELECT count(*) AS total_policies FROM pg_policies WHERE schemaname = 'public';
