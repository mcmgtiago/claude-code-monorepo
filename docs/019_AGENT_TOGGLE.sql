-- Add ativo toggle to agent_config
ALTER TABLE public.agent_config ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;
