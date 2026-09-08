import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function resolveCompanyId(supabase: any, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("company_user")
    .select("company_id")
    .eq("user_id", userId)
    .eq("ativo", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Você ainda não possui uma empresa. Finalize o onboarding.");
  return data.company_id as string;
}

// Verifica se as credenciais Meta estão configuradas e retorna status da conta
export const checkWhatsappStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const companyId = await resolveCompanyId(supabase, userId);

    const { data: inst } = await (supabase as any)
      .from("whatsapp_instances")
      .select("status, numero, instance_name")
      .eq("company_id", companyId)
      .maybeSingle();

    if (!inst) {
      return { status: "disconnected", state: null, numero: null, qrBase64: null, code: null };
    }

    // Com Meta API, tenta verificar as credenciais em tempo real
    try {
      const { metaGetPhoneInfo } = await import("./meta-whatsapp.server");
      const info = await metaGetPhoneInfo();
      const numero = info.display_phone_number || inst.numero;

      if (inst.status !== "connected" || (numero && numero !== inst.numero)) {
        await supabase
          .from("whatsapp_instances")
          .update({ status: "connected", numero })
          .eq("company_id", companyId);
      }

      return { status: "connected", state: "open", numero, qrBase64: null, code: null };
    } catch {
      return {
        status: inst.status || "disconnected",
        state: null,
        numero: inst.numero ?? null,
        qrBase64: null,
        code: null,
      };
    }
  });

// Salva as credenciais Meta no banco (sem QR code — número já está no Meta Business)
export const connectWhatsapp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const companyId = await resolveCompanyId(supabase, userId);

    // Verifica se as env vars estão configuradas
    const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
    const accessToken = process.env.META_WA_ACCESS_TOKEN;
    if (!phoneNumberId || !accessToken) {
      throw new Error(
        "Credenciais Meta WhatsApp não configuradas. Configure META_WA_PHONE_NUMBER_ID e META_WA_ACCESS_TOKEN no painel.",
      );
    }

    const { metaGetPhoneInfo } = await import("./meta-whatsapp.server");
    const info = await metaGetPhoneInfo();

    const instanceName = `meta_${companyId.replace(/-/g, "").slice(0, 16)}`;
    const webhookToken = crypto.randomUUID();

    await supabase
      .from("whatsapp_instances")
      .upsert(
        {
          company_id: companyId,
          user_id: userId,
          instance_name: instanceName,
          status: "connected",
          numero: info.display_phone_number,
          webhook_token: webhookToken,
          webhook_configured_at: new Date().toISOString(),
        } as any,
        { onConflict: "company_id" },
      );

    return {
      instanceName,
      qrBase64: null,
      code: null,
      state: "open",
      numero: info.display_phone_number,
    };
  });

export const disconnectWhatsapp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const companyId = await resolveCompanyId(supabase, userId);

    await supabase
      .from("whatsapp_instances")
      .update({ status: "disconnected" })
      .eq("company_id", companyId);

    return { ok: true };
  });

export const sendWhatsappText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { numero: string; texto: string; contatoNome?: string | null }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const companyId = await resolveCompanyId(supabase, userId);

    const { data: inst } = await supabase
      .from("whatsapp_instances")
      .select("instance_name, status")
      .eq("company_id", companyId)
      .maybeSingle();
    if (!inst?.instance_name) throw new Error("WhatsApp não conectado");

    // Janela de 24h: só responde a quem iniciou conversa
    const { data: recentInbound } = await supabase
      .from("mensagens")
      .select("id")
      .eq("company_id", companyId)
      .eq("numero", data.numero)
      .eq("direcao", "entrada")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60_000).toISOString())
      .limit(1);

    if (!recentInbound?.length) {
      throw new Error(
        "Por segurança, só é possível responder contatos que mandaram mensagem nas últimas 24h. Para iniciar conversa, use um template aprovado pelo Meta.",
      );
    }

    const { data: recentOutbound } = await supabase
      .from("mensagens")
      .select("id")
      .eq("company_id", companyId)
      .eq("numero", data.numero)
      .eq("direcao", "saida")
      .gte("created_at", new Date(Date.now() - 10 * 60_000).toISOString())
      .limit(6);
    if ((recentOutbound?.length ?? 0) >= 6) {
      throw new Error("Envio pausado por alguns minutos para proteger a qualidade do número.");
    }

    const { assertWithinLimit } = await import("./plan-limits.server");
    await assertWithinLimit(companyId, "mensagens");

    const { metaSendText } = await import("./meta-whatsapp.server");
    try {
      await metaSendText(data.numero, data.texto);
    } catch (e: any) {
      throw new Error(`Falha ao enviar: ${e?.message ?? e}`);
    }

    const { error } = await supabase.from("mensagens").insert({
      company_id: companyId,
      user_id: userId,
      numero: data.numero,
      contato_nome: data.contatoNome ?? null,
      direcao: "saida",
      autor: "humano",
      texto: data.texto,
    });
    if (error) throw new Error(error.message);

    await supabase.from("contact_pause").upsert(
      { company_id: companyId, user_id: userId, numero: data.numero, pausado: true },
      { onConflict: "company_id,numero" },
    );

    return { ok: true };
  });

export const setContactIaActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { numero: string; ativa: boolean }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const companyId = await resolveCompanyId(supabase, userId);
    const { error } = await supabase.from("contact_pause").upsert(
      { company_id: companyId, user_id: userId, numero: data.numero, pausado: !data.ativa },
      { onConflict: "company_id,numero" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const testAiReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { message: string }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const companyId = await resolveCompanyId(supabase, userId);
    const { lovableAiChat } = await import("./lovable-ai.server");
    const { buildSystemPrompt, parseAiOutput } = await import("./ai-prompt");

    const [{ data: cfg }, { data: stagesRows }, { data: prodRows }] = await Promise.all([
      supabase.from("agent_config").select("*").eq("company_id", companyId).maybeSingle(),
      supabase.from("crm_stage").select("nome, tipo, ordem").eq("company_id", companyId).order("ordem", { ascending: true }),
      supabase.from("produto").select("nome, preco, descricao, ordem").eq("company_id", companyId).eq("ativo", true).order("ordem", { ascending: true }),
    ]);
    const stages = (stagesRows ?? []).map((s: any) => ({ nome: s.nome, tipo: s.tipo }));
    const produtos = (prodRows ?? []).map((p: any) => ({ nome: p.nome, preco: p.preco, descricao: p.descricao }));
    const system = buildSystemPrompt(cfg ?? {}, { responderEmPartes: cfg?.responder_em_partes ?? true, stages, produtos });

    const { getCompanyPlan } = await import("./plan-limits.server");
    const { allowsProvider, PLAN_LABEL } = await import("./plan-features");
    const plan = await getCompanyPlan(companyId);
    let provider = ((cfg as any)?.ai_provider || "gemini") as string;
    let model = ((cfg as any)?.ai_model || "google/gemini-2.5-flash") as string;
    if (!allowsProvider(plan.slug, provider)) {
      throw new Error(`O provedor ${provider.toUpperCase()} não está incluso no plano ${PLAN_LABEL[plan.slug]}. Faça upgrade para Pro para usar GPT/Claude.`);
    }

    const raw = await lovableAiChat(
      [{ role: "system", content: system }, { role: "user", content: data.message }],
      { provider, model, openaiKey: (cfg as any)?.openai_api_key || "", anthropicKey: (cfg as any)?.anthropic_api_key || "" },
    );
    const { parts, stage } = parseAiOutput(raw, stages);
    return { reply: parts.join("\n\n"), parts, stage, system };
  });
