// Wrapper server-only para a Meta WhatsApp Business Cloud API v20.
// Arquivo *.server.ts é bloqueado do bundle client.

const GRAPH_BASE = "https://graph.facebook.com/v20.0";

function env() {
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
  const accessToken = process.env.META_WA_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    throw new Error(
      "WhatsApp não configurado. Configure META_WA_PHONE_NUMBER_ID e META_WA_ACCESS_TOKEN nos segredos do backend.",
    );
  }
  return { phoneNumberId, accessToken };
}

async function metaFetch<T = any>(path: string, init: RequestInit & { json?: any } = {}): Promise<T> {
  const { accessToken } = env();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  let res: Response;
  try {
    res = await fetch(`${GRAPH_BASE}${path}`, {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    });
  } catch (e: any) {
    throw new Error(`Meta WhatsApp API indisponível: ${e?.message || "falha de rede"}`);
  }
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || text || `HTTP ${res.status}`;
    throw new Error(`Meta WhatsApp API: ${msg}`);
  }
  return data as T;
}

export async function metaSendText(to: string, text: string): Promise<{ messages: Array<{ id: string }> }> {
  const { phoneNumberId } = env();
  // Normaliza número: remove +, espaços, traços
  const normalized = to.replace(/[^0-9]/g, "");
  return metaFetch(`/${phoneNumberId}/messages`, {
    method: "POST",
    json: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalized,
      type: "text",
      text: { body: text, preview_url: false },
    },
  });
}

export async function metaSendTemplate(
  to: string,
  templateName: string,
  languageCode: string,
  components?: any[],
): Promise<{ messages: Array<{ id: string }> }> {
  const { phoneNumberId } = env();
  const normalized = to.replace(/[^0-9]/g, "");
  const body: any = {
    messaging_product: "whatsapp",
    to: normalized,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
    },
  };
  if (components?.length) body.template.components = components;
  return metaFetch(`/${phoneNumberId}/messages`, { method: "POST", json: body });
}

export async function metaMarkAsRead(messageId: string): Promise<void> {
  const { phoneNumberId } = env();
  await metaFetch(`/${phoneNumberId}/messages`, {
    method: "POST",
    json: {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    },
  });
}

// Verifica se as credenciais estão configuradas e retorna info da conta
export async function metaGetPhoneInfo(): Promise<{ id: string; display_phone_number: string; verified_name: string }> {
  const { phoneNumberId } = env();
  return metaFetch(`/${phoneNumberId}?fields=id,display_phone_number,verified_name`);
}

// Verifica o token de webhook (usado no handler GET da rota)
export function verifyWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null,
): { valid: boolean; challenge: string | null } {
  const expectedToken = process.env.META_WA_VERIFY_TOKEN;
  if (!expectedToken) return { valid: false, challenge: null };
  if (mode === "subscribe" && token === expectedToken) {
    return { valid: true, challenge };
  }
  return { valid: false, challenge: null };
}

// Extrai mensagens de texto do payload do webhook Meta
export interface MetaIncomingMessage {
  from: string; // número do remetente (sem +)
  messageId: string;
  text: string;
  pushName: string | undefined;
  phoneNumberId: string;
  wabaId: string;
}

export function parseMetaWebhookPayload(payload: any): MetaIncomingMessage[] {
  const result: MetaIncomingMessage[] = [];
  const entries: any[] = payload?.entry ?? [];
  for (const entry of entries) {
    const wabaId: string = entry.id ?? "";
    const changes: any[] = entry.changes ?? [];
    for (const change of changes) {
      if (change.field !== "messages") continue;
      const value = change.value ?? {};
      const phoneNumberId: string = value.metadata?.phone_number_id ?? "";
      const messages: any[] = value.messages ?? [];
      const contacts: any[] = value.contacts ?? [];
      const contactMap = new Map<string, string>(
        contacts.map((c: any) => [c.wa_id, c.profile?.name]),
      );
      for (const msg of messages) {
        if (msg.type !== "text") continue;
        const text: string = msg.text?.body ?? "";
        if (!text.trim()) continue;
        result.push({
          from: msg.from,
          messageId: msg.id,
          text,
          pushName: contactMap.get(msg.from),
          phoneNumberId,
          wabaId,
        });
      }
    }
  }
  return result;
}
