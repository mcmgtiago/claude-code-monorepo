-- ================================================================
-- VeloHUB: login por nome de usuário (username)
-- Aplicar via Supabase SQL Editor
-- ================================================================

-- 1. Coluna username em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;

-- 2. Backfill a partir do metadata do Auth (onde o app já grava hoje)
UPDATE public.profiles p
SET username = lower(u.raw_user_meta_data->>'username')
FROM auth.users u
WHERE u.id = p.user_id
  AND (u.raw_user_meta_data->>'username') IS NOT NULL
  AND (p.username IS NULL OR p.username = '');

-- 3. Unicidade case-insensitive (ignora nulos/vazios)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL AND username <> '';

-- 4. Índice de busca por username
CREATE INDEX IF NOT EXISTS idx_profiles_username
  ON public.profiles (username);
