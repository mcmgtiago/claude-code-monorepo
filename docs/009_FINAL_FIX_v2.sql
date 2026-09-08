-- Fix: drop conflicting plan policy first, then create the rest
DROP POLICY IF EXISTS "plan_all" ON public.plan;
DROP POLICY IF EXISTS "plan_read_all" ON public.plan;
DROP POLICY IF EXISTS "plan_write_admin" ON public.plan;

-- Recreate
CREATE POLICY "plan_all" ON public.plan
  FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- user_roles (the main fix)
DROP POLICY IF EXISTS "user_roles_read" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_all_authenticated" ON public.user_roles;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_all_authenticated" ON public.user_roles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- app_config
DROP POLICY IF EXISTS "app_config_all" ON public.app_config;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_config_all" ON public.app_config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- subscription
DROP POLICY IF EXISTS "subscription_all" ON public.subscription;
DROP POLICY IF EXISTS "subscription_all_authenticated" ON public.subscription;
ALTER TABLE public.subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscription_all" ON public.subscription
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- billing_event_log
DROP POLICY IF EXISTS "billing_event_log_all" ON public.billing_event_log;
DROP POLICY IF EXISTS "billing_event_log_all_authenticated" ON public.billing_event_log;
ALTER TABLE public.billing_event_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_event_log_all" ON public.billing_event_log
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
