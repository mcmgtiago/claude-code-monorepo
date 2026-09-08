-- Fix RLS permissions after DROP SCHEMA CASCADE
-- The schema was recreated but table-level grants are missing

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant ALL on all tables to service_role (admin operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant SELECT/INSERT/UPDATE/DELETE on all tables to authenticated (RLS handles filtering)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant SELECT on specific tables to anon (for public booking pages)
GRANT SELECT ON public.company TO anon;
GRANT SELECT ON public.professional TO anon;
GRANT SELECT ON public.service TO anon;
GRANT SELECT ON public.professional_service TO anon;
GRANT SELECT ON public.appointment TO anon;
GRANT INSERT ON public.appointment TO anon;
GRANT SELECT ON public.customer TO anon;
GRANT INSERT ON public.customer TO anon;

-- Ensure future tables also get grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- Also grant execute on RPC functions specifically
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.super_admin_claim_available() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_super_admin_if_empty() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_company_access(uuid) TO authenticated;
