// Supabase Edge Function: push-notify
// Dispara notificações push para todos os dispositivos da empresa quando um novo lead entra.
// Chamada via Database Webhook em INSERT na tabela crm_cards.
//
// Deploy: supabase functions deploy push-notify
// Secret:  supabase secrets set VAPID_PRIVATE_KEY=<chave>
//          supabase secrets set VAPID_PUBLIC_KEY=<chave>
//          supabase secrets set VAPID_SUBJECT=mailto:seu@email.com

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const VAPID_PUBLIC_KEY  = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT     = Deno.env.get("VAPID_SUBJECT") ?? "mailto:noreply@velohub.app";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" } });
  }

  try {
    const body = await req.json();

    // Database webhook sends: { type, table, schema, record, old_record }
    const record = body.record ?? body;
    const companyId: string = record.company_id;
    if (!companyId) return new Response("no company_id", { status: 400 });

    const leadName: string = record.nome ?? record.name ?? "Novo lead";
    const channel: string  = record.canal ?? record.origem ?? "";

    // Fetch all push subscriptions for this company
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .eq("company_id", companyId);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no subscribers" }), { status: 200 });
    }

    const payload = JSON.stringify({
      title: "Novo lead! 🚀",
      body: `${leadName}${channel ? ` via ${channel}` : ""} entrou no CRM`,
      url: "/app/crm",
    });

    let sent = 0;
    const stale: string[] = [];

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
            payload,
          );
          sent++;
          // Update last_used_at
          await supabase.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("endpoint", sub.endpoint);
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription expired — mark for removal
            stale.push(sub.endpoint);
          }
        }
      })
    );

    // Remove expired subscriptions
    if (stale.length > 0) {
      await supabase.from("push_subscriptions").delete().in("endpoint", stale);
    }

    return new Response(JSON.stringify({ sent, stale: stale.length }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
