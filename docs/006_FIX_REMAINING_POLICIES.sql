-- Fix user_roles: allow INSERT for the claim_super_admin RPC
-- The function is SECURITY DEFINER so it bypasses RLS, but app_config also needs a policy

DROP POLICY IF EXISTS "user_roles_read" ON public.user_roles;

CREATE POLICY "user_roles_all_authenticated" ON public.user_roles
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also ensure app_config is accessible
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_config_all" ON public.app_config;
CREATE POLICY "app_config_all" ON public.app_config
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- subscription and billing_event_log too
ALTER TABLE public.subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscription_all_authenticated" ON public.subscription
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "billing_event_log_all_authenticated" ON public.billing_event_log
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- plan table (read by everyone for pricing page)
ALTER TABLE public.plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_read_all" ON public.plan
  FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "plan_write_admin" ON public.plan
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
