-- Migration 017: CRM/WhatsApp module (isolated)
-- Zero ALTER on existing Ari.IA tables. New tables only.

-- === WhatsApp Instance (1 per company) ===
CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL UNIQUE REFERENCES public.company(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  session_name text NOT NULL,
  status text DEFAULT 'disconnected', -- disconnected, connecting, connected
  numero text,
  webhook_token text DEFAULT encode(gen_random_bytes(16), 'hex'),
  webhook_configured_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wi_tenant" ON public.whatsapp_instances FOR ALL TO authenticated
  USING (public.has_company_access(company_id)) WITH CHECK (public.has_company_access(company_id));

-- === Messages (inbox) ===
CREATE TABLE IF NOT EXISTS public.mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  user_id uuid,
  numero text NOT NULL,
  contato_nome text,
  direcao text NOT NULL DEFAULT 'entrada', -- entrada | saida
  autor text NOT NULL DEFAULT 'contato', -- contato | ia | humano
  texto text NOT NULL,
  waha_message_id text,
  media_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_mensagens_company ON public.mensagens(company_id);
CREATE INDEX idx_mensagens_numero ON public.mensagens(company_id, numero);
CREATE INDEX idx_mensagens_created ON public.mensagens(created_at DESC);
CREATE UNIQUE INDEX idx_mensagens_dedup ON public.mensagens(company_id, waha_message_id) WHERE waha_message_id IS NOT NULL;

ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_tenant" ON public.mensagens FOR ALL TO authenticated
  USING (public.has_company_access(company_id)) WITH CHECK (public.has_company_access(company_id));

-- === CRM Stages (kanban columns) ===
CREATE TABLE IF NOT EXISTS public.crm_stage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text DEFAULT 'normal', -- normal | ganho | perda
  ordem integer DEFAULT 0,
  cor text DEFAULT '#6b7280',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_crm_stage_company ON public.crm_stage(company_id);

ALTER TABLE public.crm_stage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stage_tenant" ON public.crm_stage FOR ALL TO authenticated
  USING (public.has_company_access(company_id)) WITH CHECK (public.has_company_access(company_id));

-- === CRM Cards (leads) ===
CREATE TABLE IF NOT EXISTS public.crm_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  user_id uuid,
  numero text NOT NULL,
  nome text,
  status text DEFAULT 'Conversas',
  stage_id uuid REFERENCES public.crm_stage(id) ON DELETE SET NULL,
  ultima_mensagem text,
  ultima_em timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, numero)
);

CREATE INDEX idx_crm_cards_company ON public.crm_cards(company_id);
CREATE INDEX idx_crm_cards_stage ON public.crm_cards(stage_id);

ALTER TABLE public.crm_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards_tenant" ON public.crm_cards FOR ALL TO authenticated
  USING (public.has_company_access(company_id)) WITH CHECK (public.has_company_access(company_id));

-- === Contact Pause (opt-out / handoff) ===
CREATE TABLE IF NOT EXISTS public.contact_pause (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company(id) ON DELETE CASCADE,
  user_id uuid,
  numero text NOT NULL,
  pausado boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, numero)
);

ALTER TABLE public.contact_pause ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pause_tenant" ON public.contact_pause FOR ALL TO authenticated
  USING (public.has_company_access(company_id)) WITH CHECK (public.has_company_access(company_id));

-- === Agent Config (IA settings per company) ===
CREATE TABLE IF NOT EXISTS public.agent_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL UNIQUE REFERENCES public.company(id) ON DELETE CASCADE,

  -- Identity
  nome_agente text DEFAULT 'Atendente IA',
  nome_empresa text,
  papel_objetivo text DEFAULT 'Atender clientes, agendar horários e ajudar a fechar vendas.',
  estilo_comunicacao text,
  sobre_empresa text,

  -- Knowledge
  servicos_agendaveis text,
  horarios_disponiveis text,
  duracao_padrao text DEFAULT '30 min',
  pode_fazer text,
  nao_pode_fazer text,
  telefone_transferencia text,

  -- Personality
  tom integer DEFAULT 70, -- 0-100
  formalidade integer DEFAULT 30, -- 0-100
  usar_emojis boolean DEFAULT true,
  tamanho_resposta text DEFAULT 'curtas', -- curtas | medias | longas
  apresentacao text,

  -- Control
  palavra_pausar text DEFAULT '/pausar',
  palavra_despausar text DEFAULT '/despausar',
  segundos_buffer integer DEFAULT 8,
  responder_em_partes boolean DEFAULT true,

  -- Booking integration
  agendamento_ativo boolean DEFAULT true,
  antecedencia_min text DEFAULT '2 horas',

  -- Review
  pedir_avaliacao boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ac_tenant" ON public.agent_config FOR ALL TO authenticated
  USING (public.has_company_access(company_id)) WITH CHECK (public.has_company_access(company_id));

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_instances TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensagens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_stage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_pause TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_config TO authenticated;

-- Enable Supabase Realtime for mensagens (for inbox live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens;
