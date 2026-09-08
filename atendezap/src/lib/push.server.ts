// Envio de notificações push pelo próprio servidor do VeloHUB (sem edge function).
// Carregue só dentro de handlers server-side: import("@/lib/push.server").
import webpush from "web-push";

let configured = false;
function ensureVapid(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:suporte@velocitycompany.com.br";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body: string; url?: string };

/** Envia uma notificação para todos os dispositivos inscritos de uma empresa. */
export async function sendPushToCompany(companyId: string, payload: PushPayload): Promise<{ sent: number; stale: number }> {
  if (!ensureVapid()) {
    console.warn("[push] VAPID não configurado — pulando envio");
    return { sent: 0, stale: 0 };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("company_id", companyId);

  if (!subs || subs.length === 0) return { sent: 0, stale: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  const stale: string[] = [];

  await Promise.allSettled(
    subs.map(async (s: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
          body,
        );
        sent++;
        await supabaseAdmin.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("endpoint", s.endpoint);
      } catch (err: any) {
        if (err?.statusCode === 410 || err?.statusCode === 404) stale.push(s.endpoint);
      }
    }),
  );

  if (stale.length > 0) {
    await supabaseAdmin.from("push_subscriptions").delete().in("endpoint", stale);
  }
  return { sent, stale: stale.length };
}

/** Notifica a empresa sobre um novo lead, indicando o canal de origem (Instagram, Facebook, WhatsApp…). */
export async function notifyNewLead(companyId: string, leadName: string, channel?: string): Promise<void> {
  const via = channel ? ` via ${channel}` : "";
  await sendPushToCompany(companyId, {
    title: "Novo lead! 🚀",
    body: `${leadName || "Um possível cliente"}${via} chegou — responda rápido!`,
    url: "/app/conversas",
  });
}
