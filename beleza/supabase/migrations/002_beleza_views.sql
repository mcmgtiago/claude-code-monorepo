-- Views/aliases para o sistema Beleza
-- Mapeia nomes em português → tabelas reais em inglês
-- Rode DEPOIS da migration 001

-- salao → company
CREATE OR REPLACE VIEW public.salao AS
SELECT
  id,
  name AS nome_salao,
  nome_fantasia,
  slug,
  email_contato AS admin_email,
  email_contato AS owner_email,
  nome_fantasia AS owner_nome,
  telefone_comercial AS telefone,
  whatsapp,
  endereco::text AS endereco,
  cnpj,
  logo_url,
  primary_color AS cor_primaria,
  plano,
  status_cobranca AS status_cobranca,
  status_cobranca::text AS status,
  trial_ate,
  valor_mensal AS valor_plano,
  created_at,
  updated_at,
  ultimo_acesso_at AS ultimo_acesso
FROM public.company;

-- salao_user → company_user
CREATE OR REPLACE VIEW public.salao_user AS
SELECT
  id,
  company_id AS salao_id,
  user_id,
  email,
  nome,
  role::text AS role,
  ativo,
  ultimo_login,
  created_at,
  updated_at
FROM public.company_user;

-- cliente → customer
CREATE OR REPLACE VIEW public.cliente AS
SELECT
  id,
  company_id,
  name AS nome,
  phone AS telefone,
  email,
  NULL::date AS data_nascimento,
  notes AS observacoes,
  CASE WHEN status = 'ativo' THEN true ELSE false END AS ativo,
  created_at,
  updated_at
FROM public.customer;

-- profissional → professional
CREATE OR REPLACE VIEW public.profissional AS
SELECT
  id,
  company_id,
  nome,
  email,
  telefone,
  especialidade,
  '08:00'::text AS hora_inicio,
  '18:00'::text AS hora_fim,
  NULL::jsonb AS dias_atendimento,
  ativo,
  created_at,
  updated_at
FROM public.professional;

-- servico → service
CREATE OR REPLACE VIEW public.servico AS
SELECT
  id,
  company_id,
  nome,
  descricao,
  duracao_minutos,
  preco_cents AS valor,
  ativo,
  created_at,
  updated_at
FROM public.service;

-- agendamento → appointment
CREATE OR REPLACE VIEW public.agendamento AS
SELECT
  id,
  company_id,
  customer_id AS cliente_id,
  professional_id AS profissional_id,
  service_id AS servico_id,
  NULL::uuid AS pacote_cliente_id,
  customer_name AS cliente_nome,
  professional_name AS profissional_nome,
  service_name AS servico_nome,
  (scheduled_at::date)::text AS data,
  (scheduled_at::time)::text AS hora,
  30 AS duracao_minutos,
  NULL::text AS forma_pagamento,
  price AS valor,
  notes AS observacoes,
  status::text AS status,
  created_at,
  updated_at
FROM public.appointment;

-- lancamento → financial_entry
CREATE OR REPLACE VIEW public.lancamento AS
SELECT
  id,
  company_id,
  reference_appointment_id AS agendamento_id,
  type::text AS tipo,
  description AS descricao,
  category AS categoria,
  NULL::text AS forma_pagamento,
  amount AS valor,
  date AS data,
  created_at,
  updated_at
FROM public.financial_entry;

-- pacote → club_plan (adaptado)
CREATE OR REPLACE VIEW public.pacote AS
SELECT
  id,
  company_id,
  nome,
  beneficios::text AS descricao,
  1 AS total_sessoes,
  90 AS validade_dias,
  preco_cents AS valor,
  NULL::text[] AS servicos_incluidos,
  ativo,
  created_at,
  updated_at
FROM public.club_plan;

-- pacote_cliente → club_member (adaptado)
CREATE OR REPLACE VIEW public.pacote_cliente AS
SELECT
  id,
  company_id,
  customer_id AS cliente_id,
  club_plan_id AS pacote_id,
  NULL::text AS cliente_nome,
  NULL::text AS pacote_nome,
  started_at::date AS data_inicio,
  current_period_end::date AS data_validade,
  1 AS total_sessoes,
  0 AS sessoes_usadas,
  NULL::integer AS valor_pago,
  status,
  created_at,
  updated_at
FROM public.club_member;

-- has_salao_access → alias para has_company_access
CREATE OR REPLACE FUNCTION public.has_salao_access(salao_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN public.has_company_access(salao_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
