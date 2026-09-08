-- Lembretes de agendamento + status "a caminho"
-- Flags de controle do agendador (idempotência dos lembretes) e horário de saída.

ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS reminder_day_sent boolean DEFAULT false;
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS reminder_soon_sent boolean DEFAULT false;
ALTER TABLE public.agendamento ADD COLUMN IF NOT EXISTS on_the_way_at timestamptz;

-- Índice para o agendador varrer agendamentos próximos rapidamente
CREATE INDEX IF NOT EXISTS idx_agendamento_inicio ON public.agendamento (inicio);
