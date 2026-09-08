-- Speed-to-lead + follow-up de leads frios (estado por card) + gestão pública de agendamento

-- Estado do motor de cobrança de atendimento ao lead (speed-to-lead)
ALTER TABLE public.crm_cards ADD COLUMN IF NOT EXISTS speed_step int NOT NULL DEFAULT 0;
ALTER TABLE public.crm_cards ADD COLUMN IF NOT EXISTS speed_next_at timestamptz;
ALTER TABLE public.crm_cards ADD COLUMN IF NOT EXISTS speed_done boolean NOT NULL DEFAULT false;

-- Estado do follow-up automático de leads frios
ALTER TABLE public.crm_cards ADD COLUMN IF NOT EXISTS followup_step int NOT NULL DEFAULT 0;
ALTER TABLE public.crm_cards ADD COLUMN IF NOT EXISTS followup_next_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_crm_cards_speed ON public.crm_cards (speed_next_at) WHERE speed_done = false;
CREATE INDEX IF NOT EXISTS idx_crm_cards_followup ON public.crm_cards (followup_next_at);

-- Token público para o cliente final reagendar/cancelar pelo link
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS manage_token text;
CREATE INDEX IF NOT EXISTS idx_agendamento_manage_token ON public.agendamento (manage_token);
