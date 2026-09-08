-- Enable pg_net extension (necessário para webhooks HTTP)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Webhook: dispara push-notify quando novo card CRM é inserido (lead novo)
-- ATENÇÃO: substitua <SUPABASE_PROJECT_REF> pela referência do seu projeto Supabase
-- e <SUPABASE_ANON_KEY> pelo anon key do projeto.
--
-- Para criar o webhook via API (sem precisar de extensão net):
-- Acesse o painel Supabase > Database > Webhooks e crie manualmente:
--   Table: crm_cards
--   Events: INSERT
--   URL: https://<ref>.supabase.co/functions/v1/push-notify
--   Headers: Authorization: Bearer <service_role_key>

-- Alternatively, se pg_net estiver disponível, a trigger function abaixo
-- funciona sem painel. Basta substituir a URL correta.

-- Tabela push_subscriptions já foi criada via SQL Editor.
-- Esta migration apenas garante que o índice de endpoint exista.
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_endpoint_key ON public.push_subscriptions (endpoint);
