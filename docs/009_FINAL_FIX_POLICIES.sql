-- FINAL FIX: user_roles + app_config + plan + subscription + billing_event_log
-- Drop and recreate ALL policies on these tables

-- user_roles
DO $$ BEGIN
  DROP POLICY IF EXISTS "user_roles_read" ON public.user_roles;
  DROP POLICY IF EXISTS "user_roles_all_authenticated" ON public.user_roles;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_all_authenticated" ON public.user_roles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- app_config
DO $$ BEGIN
  DROP POLICY IF EXISTS "app_config_all" ON public.app_config;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_config_all" ON public.app_config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- plan
DO $$ BEGIN
  DROP POLICY IF EXISTS "plan_read_all" ON public.plan;
  DROP POLICY IF EXISTS "plan_write_admin" ON public.plan;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_all" ON public.plan
  FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- subscription
DO $$ BEGIN
  DROP POLICY IF EXISTS "subscription_all_authenticated" ON public.subscription;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscription_all" ON public.subscription
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- billing_event_log
DO $$ BEGIN
  DROP POLICY IF EXISTS "billing_event_log_all_authenticated" ON public.billing_event_log;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.billing_event_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_event_log_all" ON public.billing_event_log
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Verify
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_roles', 'app_config', 'plan', 'subscription', 'billing_event_log')
ORDER BY tablename;
