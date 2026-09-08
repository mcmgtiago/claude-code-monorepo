class WhatsAppApiError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "WhatsAppApiError";
    this.status = status;
  }
}

function buildTemplatePayload(contact, template) {
  const payload = {
    messaging_product: "whatsapp",
    to: contact.phone.replace(/^\+/, ""),
    type: "template",
    template: {
      name: template.name,
      language: { code: template.language }
    }
  };

  if (template.useContactName) {
    payload.template.components = [
      {
        type: "body",
        parameters: [{ type: "text", text: contact.name }]
      }
    ];
  }

  return payload;
}

function apiErrorMessage(body, fallback) {
  const error = body && body.error;
  if (!error) return fallback;
  return error.error_user_msg || error.message || fallback;
}

async function sendTemplate({ config, contact, template, fetchImpl = fetch }) {
  if (!config.accessToken || !config.phoneNumberId) {
    throw new WhatsAppApiError("Configure WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID no arquivo .env.", 503);
  }

  const response = await fetchImpl(
    `${config.graphBaseUrl}/${config.apiVersion}/${config.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildTemplatePayload(contact, template))
    }
  );

  let body = null;
  try {
    body = await response.json();
  } catch {
    // A API deve responder JSON, mas um erro de rede pode retornar outro formato.
  }

  if (!response.ok) {
    throw new WhatsAppApiError(apiErrorMessage(body, `A API respondeu com status ${response.status}.`), response.status);
  }

  return { messageId: body?.messages?.[0]?.id || null };
}

module.exports = { WhatsAppApiError, buildTemplatePayload, sendTemplate };
