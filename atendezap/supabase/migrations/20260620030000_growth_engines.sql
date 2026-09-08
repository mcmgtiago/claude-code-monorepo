-- Estratégias de crescimento + visibilidade das seções no relatório

-- Pós-job: review/indicação e lembrete de recorrência
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS review_sent_at timestamptz;
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS recurring_sent_at timestamptz;

-- Resgate de orçamento aberto
ALTER TABLE public.quote ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.quote ADD COLUMN IF NOT EXISTS rescue_sent_at timestamptz;

-- Win-back de leads perdidos
ALTER TABLE public.crm_cards ADD COLUMN IF NOT EXISTS winback_step int NOT NULL DEFAULT 0;
ALTER TABLE public.crm_cards ADD COLUMN IF NOT EXISTS winback_last_at timestamptz;
ALTER TABLE public.crm_cards ADD COLUMN IF NOT EXISTS winback_next_at timestamptz;

-- Config da empresa: link de review do Google, intervalo de recorrência, seções visíveis no relatório
ALTER TABLE public.company ADD COLUMN IF NOT EXISTS google_review_url text;
ALTER TABLE public.company ADD COLUMN IF NOT EXISTS recurring_days int NOT NULL DEFAULT 30;
ALTER TABLE public.company ADD COLUMN IF NOT EXISTS report_sections jsonb NOT NULL DEFAULT '{}'::jsonb;
