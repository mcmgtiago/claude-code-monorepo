-- Store the real WAHA chatId for replies (handles @lid → real phone mapping)
ALTER TABLE public.crm_cards ADD COLUMN IF NOT EXISTS chat_id text;
ALTER TABLE public.mensagens ADD COLUMN IF NOT EXISTS chat_id text;
