-- SEED: Cashbarber — empresa completa de demonstração
-- Roda DEPOIS do DEFINITIVE_SCHEMA.sql

-- Company (sede)
INSERT INTO public.company (id, name, nome_fantasia, slug, telefone_comercial, whatsapp, plano, status_cobranca, onboarding_concluido, onboarding_step, primary_color)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Cashbarber', 'Cashbarber', 'cashbarber', '5199999999', '5199999999', 'premium', 'ativo', true, 5, '#1B1B1B');

-- Service Categories
INSERT INTO public.service_category (id, company_id, name, sort_order) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Cortes', 1),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Barba', 2),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Tratamentos', 3),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Combos', 4),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Depilação', 5),
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Coloração', 6);

-- Services (all from Cashbarber)
INSERT INTO public.service (company_id, category_id, name, price, duration_minutes, active, featured) VALUES
-- Cortes
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Corte', 4500, 40, true, true),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Corte de seg. a quarta', 4000, 40, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Corte kids (até 5 anos)', 4000, 30, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Corte clube', 4500, 40, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Primeiro corte', 2500, 30, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Raspar na máquina', 2500, 20, true, false),
-- Barba
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Barba', 4000, 30, true, true),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Barba clube', 0, 30, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Alinhamento de barba', 1500, 15, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Bigode', 1500, 10, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Pigmentação de Barba', 3000, 30, true, true),
-- Tratamentos
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Selagem', 6000, 60, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Selagem só no topete/franja', 2000, 30, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Hidratação', 2000, 30, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Limpeza de pele premium', 6000, 45, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Máscara preta no nariz', 2000, 15, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Pigmentação', 4000, 40, true, false),
-- Combos
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Raspar máquina e barba', 5500, 50, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Combo 2 cortes', 8000, 80, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Combo 2 (corte e barba)', 14000, 70, true, true),
-- Depilação
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Sobrancelhas', 1500, 10, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Depilação orelhas', 1500, 10, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Depilação de nariz', 1500, 10, true, false),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Pezinho (Acabamento)', 1000, 10, true, false),
-- Coloração
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Platinados', 16000, 90, true, true),
('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Luzes/Reflexos', 13000, 90, true, false);

-- Professionals (Filial Ceará)
INSERT INTO public.professional (id, company_id, name, specialty, active) VALUES
('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Samuel Jackson', 'Cortes e Barba', true),
('p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Matheus Lirio', 'Cortes e Barba', true),
('p0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Junior Cardoso', 'Cortes e Barba', true),
('p0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Justin Cardoso', 'Cortes e Barba', true),
('p0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Douglas Chaves', 'Cortes e Barba', true),
('p0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Aislan Garcia', 'Cortes e Barba', true);

-- Club Plans (Clube do Assinante)
INSERT INTO public.club_plan (company_id, nome, preco_cents, beneficios, ativo) VALUES
('a0000000-0000-0000-0000-000000000001', 'Corte e Barba VIP', 15990, '{"servicos":["Corte ilimitado","Barba ilimitada","Prioridade no agendamento","Desconto em produtos"],"destaque":false}', true),
('a0000000-0000-0000-0000-000000000001', 'Corte e Barba Sênior', 13490, '{"servicos":["Corte ilimitado","Barba ilimitada"],"destaque":true,"maisVendido":true}', true),
('a0000000-0000-0000-0000-000000000001', 'Corte e Barba Único Mensal', 6000, '{"servicos":["1 corte por mês","1 barba por mês"]}', true),
('a0000000-0000-0000-0000-000000000001', 'Corte Clube VIP', 9990, '{"servicos":["Corte ilimitado","Prioridade no agendamento","Desconto em produtos"]}', true),
('a0000000-0000-0000-0000-000000000001', 'Corte Clube Sênior', 7490, '{"servicos":["Corte ilimitado"]}', true),
('a0000000-0000-0000-0000-000000000001', 'Corte Único Mensal', 3000, '{"servicos":["1 corte por mês"]}', true),
('a0000000-0000-0000-0000-000000000001', 'Barba Clube', 8490, '{"servicos":["Barba ilimitada"]}', true),
('a0000000-0000-0000-0000-000000000001', 'Raspar na Máquina e Barba VIP', 14490, '{"servicos":["Raspar ilimitado","Barba ilimitada","Prioridade"]}', true),
('a0000000-0000-0000-0000-000000000001', 'Raspar na Máquina e Barba Sênior', 12490, '{"servicos":["Raspar ilimitado","Barba ilimitada"]}', true),
('a0000000-0000-0000-0000-000000000001', 'Pai e Filho Corte Único', 6000, '{"servicos":["1 corte adulto","1 corte kids"],"vagas":100}', true);

-- Some test customers
INSERT INTO public.customer (company_id, name, phone, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'Junior Cardoso', '51999001122', 'active'),
('a0000000-0000-0000-0000-000000000001', 'Carlos Silva', '51988776655', 'active'),
('a0000000-0000-0000-0000-000000000001', 'Pedro Santos', '51977665544', 'active'),
('a0000000-0000-0000-0000-000000000001', 'Lucas Oliveira', '51966554433', 'active'),
('a0000000-0000-0000-0000-000000000001', 'Rafael Costa', '51955443322', 'active');

-- Verify
SELECT 'Cashbarber criada com sucesso!' AS status,
  (SELECT count(*) FROM public.service WHERE company_id = 'a0000000-0000-0000-0000-000000000001') AS servicos,
  (SELECT count(*) FROM public.professional WHERE company_id = 'a0000000-0000-0000-0000-000000000001') AS profissionais,
  (SELECT count(*) FROM public.club_plan WHERE company_id = 'a0000000-0000-0000-0000-000000000001') AS planos_clube,
  (SELECT count(*) FROM public.customer WHERE company_id = 'a0000000-0000-0000-0000-000000000001') AS clientes;
