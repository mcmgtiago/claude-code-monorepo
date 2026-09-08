-- Add 'ativo' toggle to agent_config (IA on/off)
ALTER TABLE public.agent_config ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;
