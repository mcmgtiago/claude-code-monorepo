-- === 20260615000249_186e6431-a8eb-4198-8b1e-5d1ca84f0ae3.sql ===

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- AGENT CONFIG (1 por usuÃ¡rio)
CREATE TABLE public.agent_config (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_agente text NOT NULL DEFAULT 'Atendente Virtual',
  nome_empresa text NOT NULL DEFAULT '',
  papel_objetivo text NOT NULL DEFAULT 'Atender clientes, tirar dÃºvidas e ajudar a fechar vendas.',
  estilo_comunicacao text NOT NULL DEFAULT 'Cordial, profissional e objetivo. Usa emojis com moderaÃ§Ã£o.',
  sobre_empresa text NOT NULL DEFAULT '',
  produtos_servicos text NOT NULL DEFAULT '',
  pode_fazer text NOT NULL DEFAULT '',
  nao_pode_fazer text NOT NULL DEFAULT '',
  telefone_transferencia text NOT NULL DEFAULT '',
  palavra_pausar text NOT NULL DEFAULT '/pausar',
  palavra_despausar text NOT NULL DEFAULT '/despausar',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_config TO authenticated;
GRANT ALL ON public.agent_config TO service_role;
ALTER TABLE public.agent_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_config_own" ON public.agent_config FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER agent_config_updated BEFORE UPDATE ON public.agent_config
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- WHATSAPP INSTANCES (1 por usuÃ¡rio)
CREATE TABLE public.whatsapp_instances (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_name text NOT NULL UNIQUE,
  numero text,
  status text NOT NULL DEFAULT 'disconnected',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_instances TO authenticated;
GRANT ALL ON public.whatsapp_instances TO service_role;
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "whatsapp_instances_own" ON public.whatsapp_instances FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER whatsapp_instances_updated BEFORE UPDATE ON public.whatsapp_instances
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- MENSAGENS
CREATE TABLE public.mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero text NOT NULL,
  contato_nome text,
  direcao text NOT NULL CHECK (direcao IN ('entrada','saida')),
  autor text NOT NULL CHECK (autor IN ('ia','humano','contato')),
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensagens TO authenticated;
GRANT ALL ON public.mensagens TO service_role;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mensagens_own" ON public.mensagens FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX mensagens_user_created_idx ON public.mensagens (user_id, created_at DESC);
CREATE INDEX mensagens_user_numero_idx ON public.mensagens (user_id, numero, created_at DESC);

-- CRM CARDS
CREATE TABLE public.crm_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero text NOT NULL,
  nome text,
  status text NOT NULL DEFAULT 'conversas' CHECK (status IN ('conversas','negociando','ganho','perda')),
  ultima_mensagem text,
  ultima_em timestamptz NOT NULL DEFAULT now(),
  observacao text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, numero)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_cards TO authenticated;
GRANT ALL ON public.crm_cards TO service_role;
ALTER TABLE public.crm_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_cards_own" ON public.crm_cards FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER crm_cards_updated BEFORE UPDATE ON public.crm_cards
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX crm_cards_user_status_idx ON public.crm_cards (user_id, status, ultima_em DESC);

-- realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_cards;
ALTER TABLE public.crm_cards REPLICA IDENTITY FULL;

-- CONTACT PAUSE
CREATE TABLE public.contact_pause (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero text NOT NULL,
  pausado boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, numero)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_pause TO authenticated;
GRANT ALL ON public.contact_pause TO service_role;
ALTER TABLE public.contact_pause ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_pause_own" ON public.contact_pause FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER contact_pause_updated BEFORE UPDATE ON public.contact_pause
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


-- === 20260615161507_34419168-e88f-48ea-b071-e4b7a619acfd.sql ===

-- =========================================================
-- FASE A â€” MULTI-TENANT BASE
-- =========================================================

-- ENUMS ---------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.tenant_role AS ENUM ('owner','admin','atendente');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- updated_at helper (idempotente) -------------------------
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS
$$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- COMPANY -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  primary_color text NOT NULL DEFAULT '#22C55E',
  logo_url text,
  telefone text,
  status_cobranca text NOT NULL DEFAULT 'trial',
  trial_ate timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company TO authenticated;
GRANT ALL ON public.company TO service_role;
ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_company_updated ON public.company;
CREATE TRIGGER trg_company_updated BEFORE UPDATE ON public.company
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- COMPANY_USER --------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  role public.tenant_role NOT NULL DEFAULT 'owner',
  ativo boolean NOT NULL DEFAULT true,
  forcar_troca_senha boolean NOT NULL DEFAULT false,
  convite_token text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id)
);
CREATE INDEX IF NOT EXISTS idx_company_user_user ON public.company_user(user_id) WHERE ativo;
CREATE INDEX IF NOT EXISTS idx_company_user_company ON public.company_user(company_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_user TO authenticated;
GRANT ALL ON public.company_user TO service_role;
ALTER TABLE public.company_user ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_company_user_updated ON public.company_user;
CREATE TRIGGER trg_company_user_updated BEFORE UPDATE ON public.company_user
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- USER_ROLES ----------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- APP_CONFIG (singleton) ----------------------------------
CREATE TABLE IF NOT EXISTS public.app_config (
  id boolean PRIMARY KEY DEFAULT true,
  super_admin_emails text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_config_singleton CHECK (id = true)
);
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
INSERT INTO public.app_config (id, super_admin_emails)
VALUES (true, ARRAY['luis.bedinot@gmail.com'])
ON CONFLICT (id) DO UPDATE
  SET super_admin_emails =
    (SELECT ARRAY(SELECT DISTINCT unnest(public.app_config.super_admin_emails || EXCLUDED.super_admin_emails)));

-- PROFILES ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  nome text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================
-- FUNÃ‡Ã•ES SECURITY DEFINER
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'::public.app_role
  );
$$;

CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT company_id FROM public.company_user
  WHERE user_id = auth.uid() AND ativo = true
  ORDER BY created_at ASC LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_company_access(_company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_user
    WHERE user_id = auth.uid()
      AND company_id = _company_id
      AND ativo = true
  );
$$;

CREATE OR REPLACE FUNCTION public.claim_super_admin_if_empty()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _email text;
  _emails text[];
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  IF _email IS NULL THEN RETURN; END IF;
  SELECT super_admin_emails INTO _emails FROM public.app_config WHERE id = true;
  IF _emails IS NULL THEN RETURN; END IF;
  IF _email = ANY(_emails) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), 'super_admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- handle_new_user trigger ---------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE _emails text[]; _email text;
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT super_admin_emails INTO _emails FROM public.app_config WHERE id = true;
  _email := NEW.email;
  IF _emails IS NOT NULL AND _email = ANY(_emails) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- POLICIES: company / company_user / user_roles / profiles
-- =========================================================
DROP POLICY IF EXISTS company_select ON public.company;
CREATE POLICY company_select ON public.company FOR SELECT TO authenticated
  USING (public.is_super_admin() OR public.has_company_access(id));

DROP POLICY IF EXISTS company_insert ON public.company;
CREATE POLICY company_insert ON public.company FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS company_update ON public.company;
CREATE POLICY company_update ON public.company FOR UPDATE TO authenticated
  USING (public.is_super_admin() OR public.has_company_access(id))
  WITH CHECK (public.is_super_admin() OR public.has_company_access(id));

DROP POLICY IF EXISTS company_delete ON public.company;
CREATE POLICY company_delete ON public.company FOR DELETE TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS company_user_select ON public.company_user;
CREATE POLICY company_user_select ON public.company_user FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR user_id = auth.uid()
    OR public.has_company_access(company_id)
  );

DROP POLICY IF EXISTS company_user_insert ON public.company_user;
CREATE POLICY company_user_insert ON public.company_user FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (user_id = auth.uid())  -- usuÃ¡rio se adiciona ao criar empresa
    OR public.has_company_access(company_id) -- owners convidam
  );

DROP POLICY IF EXISTS company_user_update ON public.company_user;
CREATE POLICY company_user_update ON public.company_user FOR UPDATE TO authenticated
  USING (public.is_super_admin() OR public.has_company_access(company_id) OR user_id = auth.uid())
  WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id) OR user_id = auth.uid());

DROP POLICY IF EXISTS company_user_delete ON public.company_user;
CREATE POLICY company_user_delete ON public.company_user FOR DELETE TO authenticated
  USING (public.is_super_admin() OR public.has_company_access(company_id));

DROP POLICY IF EXISTS user_roles_select ON public.user_roles;
CREATE POLICY user_roles_select ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =========================================================
-- RE-ESCOPE: add company_id Ã s tabelas do motor + backfill
-- =========================================================
ALTER TABLE public.agent_config        ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.whatsapp_instances  ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.mensagens           ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.crm_cards           ADD COLUMN IF NOT EXISTS company_id uuid;
ALTER TABLE public.contact_pause       ADD COLUMN IF NOT EXISTS company_id uuid;

-- Cria 1 company por user_id existente (em qualquer tabela do motor) que ainda nÃ£o tem company
DO $$
DECLARE r record; _cid uuid; _email text; _slug text; _base text; _i int;
BEGIN
  FOR r IN
    SELECT DISTINCT u_id FROM (
      SELECT user_id AS u_id FROM public.agent_config
      UNION SELECT user_id FROM public.whatsapp_instances
      UNION SELECT user_id FROM public.mensagens
      UNION SELECT user_id FROM public.crm_cards
      UNION SELECT user_id FROM public.contact_pause
    ) s WHERE u_id IS NOT NULL
  LOOP
    -- jÃ¡ tem company?
    SELECT company_id INTO _cid FROM public.company_user
      WHERE user_id = r.u_id AND ativo = true LIMIT 1;

    IF _cid IS NULL THEN
      SELECT email INTO _email FROM auth.users WHERE id = r.u_id;
      _base := COALESCE(regexp_replace(lower(split_part(COALESCE(_email,'minha-empresa'),'@',1)),'[^a-z0-9]+','-','g'), 'empresa');
      _slug := _base; _i := 1;
      WHILE EXISTS (SELECT 1 FROM public.company WHERE slug = _slug) LOOP
        _i := _i + 1; _slug := _base || '-' || _i;
      END LOOP;

      INSERT INTO public.company (nome, slug, created_by, status_cobranca, trial_ate)
      VALUES (COALESCE(_email,'Minha empresa'), _slug, r.u_id, 'trial', now() + interval '14 days')
      RETURNING id INTO _cid;

      INSERT INTO public.company_user (user_id, company_id, role, ativo)
      VALUES (r.u_id, _cid, 'owner', true)
      ON CONFLICT (user_id, company_id) DO NOTHING;
    END IF;

    UPDATE public.agent_config       SET company_id = _cid WHERE user_id = r.u_id AND company_id IS NULL;
    UPDATE public.whatsapp_instances SET company_id = _cid WHERE user_id = r.u_id AND company_id IS NULL;
    UPDATE public.mensagens          SET company_id = _cid WHERE user_id = r.u_id AND company_id IS NULL;
    UPDATE public.crm_cards          SET company_id = _cid WHERE user_id = r.u_id AND company_id IS NULL;
    UPDATE public.contact_pause      SET company_id = _cid WHERE user_id = r.u_id AND company_id IS NULL;
  END LOOP;
END $$;

-- NOT NULL + index
ALTER TABLE public.agent_config       ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.whatsapp_instances ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.mensagens          ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.crm_cards          ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE public.contact_pause      ALTER COLUMN company_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_agent_config_company       ON public.agent_config(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_company ON public.whatsapp_instances(company_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_company          ON public.mensagens(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_cards_company          ON public.crm_cards(company_id);
CREATE INDEX IF NOT EXISTS idx_contact_pause_company      ON public.contact_pause(company_id);

-- agent_config: chave Ãºnica por company
DO $$ BEGIN
  ALTER TABLE public.agent_config ADD CONSTRAINT agent_config_company_unique UNIQUE (company_id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN duplicate_table THEN NULL; END $$;

-- whatsapp_instances: Ãºnica por company
DO $$ BEGIN
  ALTER TABLE public.whatsapp_instances ADD CONSTRAINT whatsapp_instances_company_unique UNIQUE (company_id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN duplicate_table THEN NULL; END $$;

-- crm_cards: Ãºnica por (company, numero)
DO $$ BEGIN
  ALTER TABLE public.crm_cards ADD CONSTRAINT crm_cards_company_numero_unique UNIQUE (company_id, numero);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN duplicate_table THEN NULL; END $$;

-- contact_pause: Ãºnica por (company, numero)
DO $$ BEGIN
  ALTER TABLE public.contact_pause ADD CONSTRAINT contact_pause_company_numero_unique UNIQUE (company_id, numero);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN duplicate_table THEN NULL; END $$;

-- =========================================================
-- REESCREVE RLS: motor â†’ company-based
-- =========================================================
-- agent_config
DROP POLICY IF EXISTS agent_config_own ON public.agent_config;
CREATE POLICY agent_config_access ON public.agent_config FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_company_access(company_id))
  WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));

-- whatsapp_instances
DROP POLICY IF EXISTS whatsapp_instances_own ON public.whatsapp_instances;
CREATE POLICY whatsapp_instances_access ON public.whatsapp_instances FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_company_access(company_id))
  WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));

-- mensagens
DROP POLICY IF EXISTS mensagens_own ON public.mensagens;
CREATE POLICY mensagens_access ON public.mensagens FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_company_access(company_id))
  WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));

-- crm_cards
DROP POLICY IF EXISTS crm_cards_own ON public.crm_cards;
CREATE POLICY crm_cards_access ON public.crm_cards FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_company_access(company_id))
  WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));

-- contact_pause
DROP POLICY IF EXISTS contact_pause_own ON public.contact_pause;
CREATE POLICY contact_pause_access ON public.contact_pause FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_company_access(company_id))
  WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));


-- === 20260615170118_999eafb3-b44e-4361-9c0d-845dfd42d2c5.sql ===

-- 1) Esvaziar seed de super_admin_emails
UPDATE public.app_config SET super_admin_emails = '{}', updated_at = now() WHERE id = true;
INSERT INTO public.app_config (id, super_admin_emails) VALUES (true, '{}') ON CONFLICT (id) DO NOTHING;

-- 2) FunÃ§Ã£o claim_super_admin_if_empty: primeiro cadastro vira super admin se nÃ£o houver nenhum
CREATE OR REPLACE FUNCTION public.claim_super_admin_if_empty()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _email text;
  _exists boolean;
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'::public.app_role
  ) INTO _exists;

  IF _exists THEN RETURN; END IF;

  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  IF _email IS NULL THEN RETURN; END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'super_admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.app_config (id, super_admin_emails)
  VALUES (true, ARRAY[_email])
  ON CONFLICT (id) DO UPDATE
    SET super_admin_emails = (
      SELECT ARRAY(SELECT DISTINCT unnest(public.app_config.super_admin_emails || ARRAY[_email]))
    ),
    updated_at = now();
END $function$;

-- 3) Trigger handle_new_user: aplica a mesma regra "claim if empty" no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _exists boolean;
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'::public.app_role
  ) INTO _exists;

  IF NOT _exists AND NEW.email IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.app_config (id, super_admin_emails)
    VALUES (true, ARRAY[NEW.email])
    ON CONFLICT (id) DO UPDATE
      SET super_admin_emails = (
        SELECT ARRAY(SELECT DISTINCT unnest(public.app_config.super_admin_emails || ARRAY[NEW.email]))
      ),
      updated_at = now();
  END IF;

  RETURN NEW;
END $function$;


-- === 20260615173915_b3368c1a-4323-4e61-ab69-af56a91cd6ee.sql ===
ALTER TABLE public.agent_config
  ADD COLUMN IF NOT EXISTS segundos_buffer integer NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS responder_em_partes boolean NOT NULL DEFAULT true;

UPDATE public.agent_config SET segundos_buffer = COALESCE(segundos_buffer, 8), responder_em_partes = COALESCE(responder_em_partes, true);

-- === 20260615223352_0e5f2832-4b3b-43ad-b7a1-cf43ba9c3cbc.sql ===

-- ============ ENUM ============
DO $$ BEGIN
  CREATE TYPE public.stage_tipo AS ENUM ('normal','ganho','perda');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ crm_stage ============
CREATE TABLE IF NOT EXISTS public.crm_stage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  nome text NOT NULL,
  ordem int NOT NULL DEFAULT 0,
  cor text NOT NULL DEFAULT '#8AA89A',
  tipo public.stage_tipo NOT NULL DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_stage_company ON public.crm_stage(company_id, ordem);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_stage TO authenticated;
GRANT ALL ON public.crm_stage TO service_role;
ALTER TABLE public.crm_stage ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY crm_stage_access ON public.crm_stage
    FOR ALL TO authenticated
    USING (public.is_super_admin() OR public.has_company_access(company_id))
    WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ produto ============
CREATE TABLE IF NOT EXISTS public.produto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  nome text NOT NULL,
  preco numeric NOT NULL DEFAULT 0,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  ordem int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_produto_company ON public.produto(company_id, ordem);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.produto TO authenticated;
GRANT ALL ON public.produto TO service_role;
ALTER TABLE public.produto ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY produto_access ON public.produto
    FOR ALL TO authenticated
    USING (public.is_super_admin() OR public.has_company_access(company_id))
    WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ extend crm_cards ============
ALTER TABLE public.crm_cards DROP CONSTRAINT IF EXISTS crm_cards_status_check;
ALTER TABLE public.crm_cards
  ADD COLUMN IF NOT EXISTS stage_id uuid REFERENCES public.crm_stage(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS valor numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS origem text,
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS proxima_acao text,
  ADD COLUMN IF NOT EXISTS follow_up timestamptz;
CREATE INDEX IF NOT EXISTS idx_crm_cards_stage ON public.crm_cards(stage_id);

-- ============ lead_nota ============
CREATE TABLE IF NOT EXISTS public.lead_nota (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES public.crm_cards(id) ON DELETE CASCADE,
  autor_id uuid,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_nota_card ON public.lead_nota(card_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_nota TO authenticated;
GRANT ALL ON public.lead_nota TO service_role;
ALTER TABLE public.lead_nota ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY lead_nota_access ON public.lead_nota
    FOR ALL TO authenticated
    USING (public.is_super_admin() OR public.has_company_access(company_id))
    WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ lead_evento ============
CREATE TABLE IF NOT EXISTS public.lead_evento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES public.crm_cards(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_evento_card ON public.lead_evento(card_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_evento TO authenticated;
GRANT ALL ON public.lead_evento TO service_role;
ALTER TABLE public.lead_evento ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY lead_evento_access ON public.lead_evento
    FOR ALL TO authenticated
    USING (public.is_super_admin() OR public.has_company_access(company_id))
    WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ agendamento ============
CREATE TABLE IF NOT EXISTS public.agendamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  card_id uuid REFERENCES public.crm_cards(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  inicio timestamptz NOT NULL,
  fim timestamptz NOT NULL,
  google_event_id text,
  status text NOT NULL DEFAULT 'agendado',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agendamento_company ON public.agendamento(company_id, inicio);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agendamento TO authenticated;
GRANT ALL ON public.agendamento TO service_role;
ALTER TABLE public.agendamento ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY agendamento_access ON public.agendamento
    FOR ALL TO authenticated
    USING (public.is_super_admin() OR public.has_company_access(company_id))
    WITH CHECK (public.is_super_admin() OR public.has_company_access(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ google_integration ============
CREATE TABLE IF NOT EXISTS public.google_integration (
  company_id uuid PRIMARY KEY REFERENCES public.company(id) ON DELETE CASCADE,
  email text,
  access_token text,
  refresh_token text,
  expiry timestamptz,
  calendar_id text,
  conectado boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.google_integration TO authenticated;
GRANT ALL ON public.google_integration TO service_role;
ALTER TABLE public.google_integration ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY google_integration_access ON public.google_integration
    FOR ALL TO authenticated
    USING (
      public.is_super_admin() OR EXISTS (
        SELECT 1 FROM public.company_user cu
        WHERE cu.company_id = google_integration.company_id
          AND cu.user_id = auth.uid()
          AND cu.ativo = true
          AND cu.role IN ('owner','admin')
      )
    )
    WITH CHECK (
      public.is_super_admin() OR EXISTS (
        SELECT 1 FROM public.company_user cu
        WHERE cu.company_id = google_integration.company_id
          AND cu.user_id = auth.uid()
          AND cu.ativo = true
          AND cu.role IN ('owner','admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ agent_config extensions ============
ALTER TABLE public.agent_config
  ADD COLUMN IF NOT EXISTS segmento text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS descricao_negocio text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS diferenciais text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS publico_alvo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS regiao_horario text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ofertas text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cupom text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS como_vender text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS objecoes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS formas_pagamento text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ticket_medio text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS faq text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS politicas text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS posvenda_msg text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pedir_avaliacao boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reativar_cliente boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tom int NOT NULL DEFAULT 70,
  ADD COLUMN IF NOT EXISTS formalidade int NOT NULL DEFAULT 40,
  ADD COLUMN IF NOT EXISTS usar_emojis boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tamanho_resposta text NOT NULL DEFAULT 'curtas',
  ADD COLUMN IF NOT EXISTS apresentacao text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS agendamento_ativo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS servicos_agendaveis text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS duracao_padrao text NOT NULL DEFAULT '30 min',
  ADD COLUMN IF NOT EXISTS horarios_disponiveis text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS antecedencia_min text NOT NULL DEFAULT '2 horas';

-- ============ SEED default stages for existing companies ============
INSERT INTO public.crm_stage (company_id, nome, ordem, cor, tipo)
SELECT c.id, v.nome, v.ordem, v.cor, v.tipo::public.stage_tipo
FROM public.company c
CROSS JOIN (VALUES
  ('Conversas', 0, '#8AA89A', 'normal'),
  ('Negociando', 1, '#FFB020', 'normal'),
  ('Ganho', 2, '#22B85F', 'ganho'),
  ('Perda', 3, '#FF5A5A', 'perda')
) AS v(nome, ordem, cor, tipo)
WHERE NOT EXISTS (
  SELECT 1 FROM public.crm_stage s WHERE s.company_id = c.id
);

-- ============ BACKFILL crm_cards.stage_id ============
UPDATE public.crm_cards cc
SET stage_id = s.id
FROM public.crm_stage s
WHERE cc.stage_id IS NULL
  AND s.company_id = cc.company_id
  AND lower(s.nome) = CASE lower(cc.status)
    WHEN 'conversas' THEN 'conversas'
    WHEN 'negociando' THEN 'negociando'
    WHEN 'ganho' THEN 'ganho'
    WHEN 'perda' THEN 'perda'
    ELSE lower(cc.status)
  END;

-- ============ Trigger: seed default stages for new companies ============
CREATE OR REPLACE FUNCTION public.seed_default_stages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.crm_stage (company_id, nome, ordem, cor, tipo) VALUES
    (NEW.id, 'Conversas',  0, '#8AA89A', 'normal'),
    (NEW.id, 'Negociando', 1, '#FFB020', 'normal'),
    (NEW.id, 'Ganho',      2, '#22B85F', 'ganho'),
    (NEW.id, 'Perda',      3, '#FF5A5A', 'perda')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_company_seed_stages ON public.company;
CREATE TRIGGER trg_company_seed_stages
AFTER INSERT ON public.company
FOR EACH ROW EXECUTE FUNCTION public.seed_default_stages();

-- ============ Realtime ============
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_stage;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- === 20260616131406_30d61f4a-53ad-42c3-b26e-28ba2630cc25.sql ===

-- =====================================================================
-- SECURITY HARDENING
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Helper: check role within a company (SECURITY DEFINER, used by RLS)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_company_role(_company_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_user
    WHERE company_id = _company_id
      AND user_id = auth.uid()
      AND ativo = true
      AND role::text = ANY (_roles)
  );
$$;
REVOKE EXECUTE ON FUNCTION public.has_company_role(uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_company_role(uuid, text[]) TO authenticated, service_role;

-- ---------------------------------------------------------------------
-- 2) Prevent self privilege escalation in company_user
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS company_user_update ON public.company_user;
CREATE POLICY company_user_update ON public.company_user
FOR UPDATE TO authenticated
USING (
  public.is_super_admin()
  OR public.has_company_role(company_id, ARRAY['owner','admin'])
)
WITH CHECK (
  public.is_super_admin()
  OR public.has_company_role(company_id, ARRAY['owner','admin'])
);

DROP POLICY IF EXISTS company_user_insert ON public.company_user;
CREATE POLICY company_user_insert ON public.company_user
FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin()
  OR public.has_company_role(company_id, ARRAY['owner','admin'])
  OR (
    -- Allow the original company creator to bootstrap themselves as owner
    user_id = auth.uid()
    AND role = 'owner'::tenant_role
    AND EXISTS (
      SELECT 1 FROM public.company c
      WHERE c.id = company_user.company_id
        AND c.created_by = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.company_user existing
      WHERE existing.company_id = company_user.company_id
    )
  )
);

-- ---------------------------------------------------------------------
-- 3) app_config: explicit super-admin-only write/read policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS app_config_select ON public.app_config;
DROP POLICY IF EXISTS app_config_insert ON public.app_config;
DROP POLICY IF EXISTS app_config_update ON public.app_config;
DROP POLICY IF EXISTS app_config_delete ON public.app_config;

CREATE POLICY app_config_select ON public.app_config
FOR SELECT TO authenticated USING (public.is_super_admin());

CREATE POLICY app_config_insert ON public.app_config
FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());

CREATE POLICY app_config_update ON public.app_config
FOR UPDATE TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY app_config_delete ON public.app_config
FOR DELETE TO authenticated USING (public.is_super_admin());

REVOKE ALL ON public.app_config FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_config TO authenticated;
GRANT ALL ON public.app_config TO service_role;

-- ---------------------------------------------------------------------
-- 4) google_integration: hide tokens from authenticated reads/writes
--    Tokens are only accessible through service_role (server functions).
-- ---------------------------------------------------------------------
REVOKE ALL ON public.google_integration FROM anon, authenticated;

GRANT SELECT (company_id, email, conectado, calendar_id, expiry, updated_at)
  ON public.google_integration TO authenticated;
GRANT INSERT (company_id, email, conectado, calendar_id, expiry)
  ON public.google_integration TO authenticated;
GRANT UPDATE (email, conectado, calendar_id, expiry)
  ON public.google_integration TO authenticated;
GRANT DELETE ON public.google_integration TO authenticated;
GRANT ALL ON public.google_integration TO service_role;

-- ---------------------------------------------------------------------
-- 5) Realtime: tenant-scoped channel subscriptions
--    Channel topics must be 'tenant:<company_uuid>[:suffix]'
-- ---------------------------------------------------------------------
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_topic_subscription" ON realtime.messages;
CREATE POLICY "tenant_topic_subscription"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic())::text ~ '^tenant:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(:.*)?$'
  AND public.has_company_access(split_part((realtime.topic())::text, ':', 2)::uuid)
);

-- ---------------------------------------------------------------------
-- 6) Revoke EXECUTE on SECURITY DEFINER functions that are not meant
--    to be callable as RPC by API roles. RLS helpers
--    (is_super_admin / has_company_access / current_company_id /
--    has_company_role) must stay executable for authenticated,
--    otherwise Row Level Security stops working.
-- ---------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.handle_new_user()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_default_stages()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at()           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_super_admin_if_empty()  FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.is_super_admin()              FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_company_access(uuid)      FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_company_id()          FROM PUBLIC, anon;


-- === 20260616142617_c3a1170e-db18-406f-9748-ffb8cc67f4d9.sql ===

ALTER TABLE public.agent_config
  ADD COLUMN IF NOT EXISTS ai_provider text NOT NULL DEFAULT 'gemini',
  ADD COLUMN IF NOT EXISTS ai_model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  ADD COLUMN IF NOT EXISTS openai_api_key text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS anthropic_api_key text NOT NULL DEFAULT '';

ALTER TABLE public.agent_config
  DROP CONSTRAINT IF EXISTS agent_config_ai_provider_check;
ALTER TABLE public.agent_config
  ADD CONSTRAINT agent_config_ai_provider_check
  CHECK (ai_provider IN ('gemini','openai','anthropic'));


-- === 20260616143152_61e51431-50b6-4ca4-85e4-0273ef4d3810.sql ===
INSERT INTO public.user_roles (user_id, role) VALUES ('5d59803b-d8b6-492c-870f-597bf304cd9e', 'super_admin'::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.app_config (id, super_admin_emails) VALUES (true, ARRAY['luis.bedinot@gmail.com']) ON CONFLICT (id) DO UPDATE SET super_admin_emails = (SELECT ARRAY(SELECT DISTINCT unnest(public.app_config.super_admin_emails || ARRAY['luis.bedinot@gmail.com']))), updated_at = now();

-- === 20260616143953_1b959f2d-7a6a-4538-857d-39da1fbd4230.sql ===

-- ============ EXPAND COMPANY ============
ALTER TABLE public.company
  ADD COLUMN IF NOT EXISTS tipo_pessoa text NOT NULL DEFAULT 'PJ' CHECK (tipo_pessoa IN ('PF','PJ')),
  ADD COLUMN IF NOT EXISTS cnpj_cpf text,
  ADD COLUMN IF NOT EXISTS razao_social text,
  ADD COLUMN IF NOT EXISTS nome_fantasia text,
  ADD COLUMN IF NOT EXISTS inscricao_estadual text,
  ADD COLUMN IF NOT EXISTS segmento text,
  ADD COLUMN IF NOT EXISTS porte text,
  ADD COLUMN IF NOT EXISTS site text,
  ADD COLUMN IF NOT EXISTS email_corporativo text,
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS rua text,
  ADD COLUMN IF NOT EXISTS numero text,
  ADD COLUMN IF NOT EXISTS complemento text,
  ADD COLUMN IF NOT EXISTS bairro text,
  ADD COLUMN IF NOT EXISTS cidade text,
  ADD COLUMN IF NOT EXISTS estado text,
  ADD COLUMN IF NOT EXISTS pais text DEFAULT 'BR',
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step int NOT NULL DEFAULT 0;

-- ============ EXPAND PROFILES ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nome_completo text,
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS cargo text,
  ADD COLUMN IF NOT EXISTS telefone text;

-- ============ PLAN TABLE ============
CREATE TABLE IF NOT EXISTS public.plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nome text NOT NULL,
  descricao text,
  preco_cents int NOT NULL DEFAULT 0,
  moeda text NOT NULL DEFAULT 'BRL',
  intervalo text NOT NULL DEFAULT 'month' CHECK (intervalo IN ('month','year')),
  trial_days int NOT NULL DEFAULT 3,
  limite_mensagens int NOT NULL DEFAULT 1000,
  limite_instancias int NOT NULL DEFAULT 1,
  limite_usuarios int NOT NULL DEFAULT 2,
  limite_contatos int NOT NULL DEFAULT 1000,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  destaque boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  ordem int NOT NULL DEFAULT 0,
  paddle_product_id text,
  paddle_price_id text,
  stripe_product_id text,
  stripe_price_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plan TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan TO authenticated;
GRANT ALL ON public.plan TO service_role;
ALTER TABLE public.plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans public read active" ON public.plan FOR SELECT TO anon USING (ativo = true);
CREATE POLICY "plans authenticated read" ON public.plan FOR SELECT TO authenticated USING (true);
CREATE POLICY "plans super admin write" ON public.plan FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_plan_updated_at BEFORE UPDATE ON public.plan FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ SUBSCRIPTION TABLE ============
CREATE TABLE IF NOT EXISTS public.subscription (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plan(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing','active','past_due','canceled','incomplete','paused')),
  paddle_subscription_id text,
  paddle_customer_id text,
  stripe_subscription_id text,
  stripe_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz,
  payment_method_brand text,
  payment_method_last4 text,
  payment_method_exp text,
  next_billing_amount_cents int,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS subscription_company_unique ON public.subscription(company_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription TO authenticated;
GRANT ALL ON public.subscription TO service_role;
ALTER TABLE public.subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscription company access" ON public.subscription FOR SELECT TO authenticated
  USING (public.has_company_access(company_id) OR public.is_super_admin());
CREATE POLICY "subscription super admin write" ON public.subscription FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "subscription owner update" ON public.subscription FOR UPDATE TO authenticated
  USING (public.has_company_role(company_id, ARRAY['owner','admin']))
  WITH CHECK (public.has_company_role(company_id, ARRAY['owner','admin']));
CREATE TRIGGER trg_subscription_updated_at BEFORE UPDATE ON public.subscription FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ COMPANY BILLING TABLE ============
CREATE TABLE IF NOT EXISTS public.company_billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL UNIQUE REFERENCES public.company(id) ON DELETE CASCADE,
  tipo_pessoa text NOT NULL DEFAULT 'PJ' CHECK (tipo_pessoa IN ('PF','PJ')),
  cnpj_cpf text,
  razao_social text,
  nome_responsavel text,
  email_cobranca text,
  telefone text,
  inscricao_estadual text,
  cep text,
  rua text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  pais text DEFAULT 'BR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_billing TO authenticated;
GRANT ALL ON public.company_billing TO service_role;
ALTER TABLE public.company_billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing company read" ON public.company_billing FOR SELECT TO authenticated
  USING (public.has_company_access(company_id) OR public.is_super_admin());
CREATE POLICY "billing owner write" ON public.company_billing FOR ALL TO authenticated
  USING (public.has_company_role(company_id, ARRAY['owner','admin']) OR public.is_super_admin())
  WITH CHECK (public.has_company_role(company_id, ARRAY['owner','admin']) OR public.is_super_admin());
CREATE TRIGGER trg_billing_updated_at BEFORE UPDATE ON public.company_billing FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ SEED DEFAULT PLANS ============
INSERT INTO public.plan (slug, nome, descricao, preco_cents, intervalo, trial_days, limite_mensagens, limite_instancias, limite_usuarios, limite_contatos, features, destaque, ordem) VALUES
  ('starter', 'Starter', 'Para autÃ´nomos e pequenos negÃ³cios comeÃ§ando com automaÃ§Ã£o no WhatsApp.', 9700, 'month', 3, 2000, 1, 2, 1000,
    '["1 nÃºmero de WhatsApp","2 usuÃ¡rios","CRM Kanban completo","IA Gemini incluÃ­da","Suporte por email"]'::jsonb,
    false, 1),
  ('pro', 'Pro', 'Para times de vendas que precisam escalar atendimento e conversÃ£o.', 19700, 'month', 3, 10000, 3, 8, 5000,
    '["3 nÃºmeros de WhatsApp","8 usuÃ¡rios","CRM Kanban + AutomaÃ§Ãµes","IA Gemini, GPT e Claude","IntegraÃ§Ã£o Google Agenda","RelatÃ³rios avanÃ§ados","Suporte prioritÃ¡rio"]'::jsonb,
    true, 2),
  ('business', 'Business', 'Para empresas que recebem alto volume e precisam de SLA dedicado.', 49700, 'month', 3, 50000, 10, 30, 25000,
    '["10 nÃºmeros de WhatsApp","30 usuÃ¡rios","Todas as integraÃ§Ãµes","IA ilimitada (Gemini, GPT, Claude)","API e Webhooks","Gerente de conta dedicado","SLA 99,9% + suporte 24/7"]'::jsonb,
    false, 3)
ON CONFLICT (slug) DO NOTHING;


-- === 20260617003800_16d5fcfd-a4af-4286-ba3e-e1ec977d476a.sql ===

-- 1) agent_config: restrict to owner/admin (protects openai/anthropic api keys)
DROP POLICY IF EXISTS agent_config_access ON public.agent_config;
CREATE POLICY agent_config_owner_admin ON public.agent_config
  FOR ALL
  USING (is_super_admin() OR has_company_role(company_id, ARRAY['owner','admin']))
  WITH CHECK (is_super_admin() OR has_company_role(company_id, ARRAY['owner','admin']));

-- 2) google_integration: confirm owner/admin only (recreate idempotently)
DROP POLICY IF EXISTS google_integration_access ON public.google_integration;
CREATE POLICY google_integration_owner_admin ON public.google_integration
  FOR ALL
  USING (is_super_admin() OR has_company_role(company_id, ARRAY['owner','admin']))
  WITH CHECK (is_super_admin() OR has_company_role(company_id, ARRAY['owner','admin']));

-- 3) company_billing: restrict reads to owner/admin
DROP POLICY IF EXISTS "billing company read" ON public.company_billing;
DROP POLICY IF EXISTS "billing owner write" ON public.company_billing;
CREATE POLICY billing_owner_admin_read ON public.company_billing
  FOR SELECT
  USING (is_super_admin() OR has_company_role(company_id, ARRAY['owner','admin']));
CREATE POLICY billing_owner_admin_write ON public.company_billing
  FOR ALL
  USING (is_super_admin() OR has_company_role(company_id, ARRAY['owner','admin']))
  WITH CHECK (is_super_admin() OR has_company_role(company_id, ARRAY['owner','admin']));

-- 4) subscription: restrict reads to owner/admin (hides paddle/stripe IDs)
DROP POLICY IF EXISTS "subscription company access" ON public.subscription;
CREATE POLICY subscription_owner_admin_read ON public.subscription
  FOR SELECT
  USING (is_super_admin() OR has_company_role(company_id, ARRAY['owner','admin']));

-- 5) profiles: owners/admins can view profiles of company members
DROP POLICY IF EXISTS profiles_company_admin_select ON public.profiles;
CREATE POLICY profiles_company_admin_select ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_user me
      JOIN public.company_user target
        ON target.company_id = me.company_id
      WHERE me.user_id = auth.uid()
        AND me.ativo = true
        AND me.role IN ('owner'::public.tenant_role, 'admin'::public.tenant_role)
        AND target.user_id = profiles.user_id
        AND target.ativo = true
    )
  );

-- 6) Lock down SECURITY DEFINER helpers that should only run from triggers
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_default_stages() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_super_admin_if_empty() FROM PUBLIC, anon, authenticated;

-- Harden search_path on tg_set_updated_at
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;


-- === 20260617175632_5474601b-0fe5-4177-b5c6-23f7cd0e5527.sql ===

ALTER TABLE public.plan ADD COLUMN IF NOT EXISTS checkout_url text;

ALTER TABLE public.subscription ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'manual';
ALTER TABLE public.subscription ADD COLUMN IF NOT EXISTS external_subscription_id text;
ALTER TABLE public.subscription ADD COLUMN IF NOT EXISTS external_customer_id text;
ALTER TABLE public.subscription ADD COLUMN IF NOT EXISTS buyer_email text;

CREATE INDEX IF NOT EXISTS subscription_provider_external_idx ON public.subscription (provider, external_subscription_id);
CREATE INDEX IF NOT EXISTS subscription_buyer_email_idx ON public.subscription (lower(buyer_email));

CREATE TABLE IF NOT EXISTS public.billing_event_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_type text,
  external_id text,
  buyer_email text,
  matched_company_id uuid REFERENCES public.company(id) ON DELETE SET NULL,
  processed boolean NOT NULL DEFAULT false,
  error text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.billing_event_log TO authenticated;
GRANT ALL ON public.billing_event_log TO service_role;

ALTER TABLE public.billing_event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "billing_event_log super admin read"
  ON public.billing_event_log FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE INDEX IF NOT EXISTS billing_event_log_created_idx ON public.billing_event_log (created_at DESC);
CREATE INDEX IF NOT EXISTS billing_event_log_provider_idx ON public.billing_event_log (provider, created_at DESC);


-- === 20260617201615_a25f3252-ecda-40d4-b8bc-18420729aa4b.sql ===
ALTER TABLE public.whatsapp_instances
  ADD COLUMN IF NOT EXISTS webhook_token text;

UPDATE public.whatsapp_instances
SET webhook_token = gen_random_uuid()::text
WHERE webhook_token IS NULL;

ALTER TABLE public.whatsapp_instances
  ALTER COLUMN webhook_token SET DEFAULT gen_random_uuid()::text,
  ALTER COLUMN webhook_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_instances_webhook_token_idx
  ON public.whatsapp_instances(webhook_token);

-- === 20260617201857_e58e43cc-82ca-4497-8f3a-59d262800864.sql ===
ALTER TABLE public.mensagens
  ADD COLUMN IF NOT EXISTS whatsapp_message_id text;

CREATE UNIQUE INDEX IF NOT EXISTS mensagens_company_whatsapp_message_id_idx
  ON public.mensagens(company_id, whatsapp_message_id)
  WHERE whatsapp_message_id IS NOT NULL;

ALTER TABLE public.whatsapp_instances
  ADD COLUMN IF NOT EXISTS webhook_configured_at timestamptz;

