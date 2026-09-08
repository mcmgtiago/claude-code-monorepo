/**
 * WhatsApp Service — abstrai WAHA para que no futuro
 * troquemos para API oficial sem mudar o resto do código.
 */

const WAHA_BASE_URL = process.env.WAHA_BASE_URL || 'http://localhost:3000';
const WAHA_SESSION = process.env.WAHA_SESSION || 'default';

export interface IncomingMessage {
  from: string;      // 5511999999999@s.whatsapp.net
  body: string;
  type: 'text' | 'image' | 'audio' | 'document' | 'video';
  mediaUrl?: string;
  pushName?: string;
  timestamp: number;
}

export interface OutgoingMessage {
  to: string;
  text: string;
  mediaUrl?: string;
}

/**
 * Enviar mensagem de texto via WAHA
 */
export async function sendMessage(msg: OutgoingMessage): Promise<{ success: boolean; messageId?: string }> {
  try {
    const chatId = msg.to.includes('@') ? msg.to : `${msg.to}@s.whatsapp.net`;

    const response = await fetch(`${WAHA_BASE_URL}/api/sendText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId,
        text: msg.text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[WhatsApp] Erro ao enviar:', error);
      return { success: false };
    }

    const data = await response.json();
    return { success: true, messageId: data.key?.id };
  } catch (err) {
    console.error('[WhatsApp] Erro de conexão:', err);
    return { success: false };
  }
}

/**
 * Enviar imagem/documento via WAHA
 */
export async function sendMedia(opts: {
  to: string;
  mediaUrl: string;
  caption?: string;
  mimeType?: string;
}): Promise<{ success: boolean }> {
  try {
    const chatId = opts.to.includes('@') ? opts.to : `${opts.to}@s.whatsapp.net`;

    const response = await fetch(`${WAHA_BASE_URL}/api/sendFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId,
        file: { url: opts.mediaUrl },
        caption: opts.caption || '',
      }),
    });

    return { success: response.ok };
  } catch (err) {
    console.error('[WhatsApp] Erro ao enviar mídia:', err);
    return { success: false };
  }
}

/**
 * Parsear payload de webhook WAHA → formato normalizado
 */
export function parseWahaWebhook(payload: Record<string, unknown>): IncomingMessage | null {
  try {
    // WAHA v2024+ format
    const event = payload.event as string;
    if (event !== 'message') return null;

    const data = payload.payload as Record<string, unknown> || payload.data as Record<string, unknown>;
    if (!data) return null;

    // Extrair dados baseado no formato WAHA
    const from = (data.from as string) || '';
    const body = (data.body as string) || '';
    const hasMedia = !!(data.hasMedia || data.mediaUrl);
    const mediaUrl = (data.mediaUrl as string) || undefined;

    let type: IncomingMessage['type'] = 'text';
    if (hasMedia) {
      const mimeType = (data.mimetype as string) || '';
      if (mimeType.startsWith('image/')) type = 'image';
      else if (mimeType.startsWith('audio/')) type = 'audio';
      else if (mimeType.startsWith('video/')) type = 'video';
      else type = 'document';
    }

    return {
      from,
      body,
      type,
      mediaUrl,
      pushName: (data.pushName as string) || (data._data as Record<string, unknown>)?.pushName as string || undefined,
      timestamp: (data.timestamp as number) || Date.now() / 1000,
    };
  } catch (err) {
    console.error('[WhatsApp] Erro ao parsear webhook:', err);
    return null;
  }
}

/**
 * Extrair número limpo do WhatsApp ID
 * '5511999999999@s.whatsapp.net' → '5511999999999'
 */
export function cleanNumber(whatsappId: string): string {
  return whatsappId.replace('@s.whatsapp.net', '').replace('@c.us', '');
}
