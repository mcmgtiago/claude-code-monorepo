-- Fix RLS: Allow authenticated users to INSERT into company (onboarding)
-- The existing policy only covers SELECT/UPDATE via has_company_access() which fails on INSERT
-- because the company doesn't exist yet when the user tries to create it.

-- Drop the overly restrictive "super_admin_all" FOR ALL policy and replace with granular ones
DROP POLICY IF EXISTS "super_admin_all" ON public.company;
DROP POLICY IF EXISTS "users_own_company" ON public.company;

-- Super admin can do everything
CREATE POLICY "company_super_admin" ON public.company
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- Any authenticated user can INSERT a company (onboarding creates the company)
CREATE POLICY "company_insert_authenticated" ON public.company
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Users can SELECT their own company
CREATE POLICY "company_select_own" ON public.company
  FOR SELECT TO authenticated
  USING (
    public.has_company_access(id)
  );

-- Users can UPDATE their own company
CREATE POLICY "company_update_own" ON public.company
  FOR UPDATE TO authenticated
  USING (public.has_company_access(id))
  WITH CHECK (public.has_company_access(id));

-- Fix company_user: allow INSERT (to link user to new company during onboarding)
DROP POLICY IF EXISTS "company_user_policy" ON public.company_user;

CREATE POLICY "company_user_super_admin" ON public.company_user
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- User can INSERT themselves into a company (self-link during onboarding)
CREATE POLICY "company_user_insert_self" ON public.company_user
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- User can SELECT/UPDATE their own company_user rows
CREATE POLICY "company_user_select_own" ON public.company_user
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_company_access(company_id));

CREATE POLICY "company_user_update_own" ON public.company_user
  FOR UPDATE TO authenticated
  USING (public.has_company_access(company_id))
  WITH CHECK (public.has_company_access(company_id));

-- Fix: user_roles needs INSERT for claim_super_admin_if_empty RPC
-- The function is SECURITY DEFINER so it bypasses RLS, but just in case:
DROP POLICY IF EXISTS "user_roles_read" ON public.user_roles;
CREATE POLICY "user_roles_read" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Allow anon to read company (for public booking page)
CREATE POLICY "company_anon_select" ON public.company
  FOR SELECT TO anon
  USING (true);
