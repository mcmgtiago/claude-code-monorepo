import "server-only";

const SLACK_WEBHOOK_HOSTS = new Set(["hooks.slack.com", "hooks.slack-gov.com"]);

export function normalizeSlackWebhookUrl(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized);

    if (url.protocol !== "https:" || !SLACK_WEBHOOK_HOSTS.has(url.hostname) || !url.pathname.startsWith("/services/")) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function maskSlackWebhookUrl(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    const maskedSegments = segments.map((segment, index) => {
      if (index === segments.length - 1) {
        return `${segment.slice(0, 4)}...`;
      }

      return segment;
    });

    return `${url.hostname}/${maskedSegments.join("/")}`;
  } catch {
    return "Slack webhook saved";
  }
}

export async function sendSlackWebhookMessage(webhookUrl: string, text: string) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ text }),
    cache: "no-store"
  });

  const body = await response.text().catch(() => "");

  if (!response.ok) {
    throw new Error(body || "Slack webhook rejected the request.");
  }

  if (body && body.trim().toLowerCase() !== "ok") {
    throw new Error(body);
  }
}
