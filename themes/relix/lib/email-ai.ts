import "server-only";

import { getPlatformSettings } from "@/lib/platform-settings";

export type EmailAiAction = "write" | "rephrase" | "analyze";

type GenerateEmailAiResult = {
  action: EmailAiAction;
  output: string;
  model: string;
};

type GenerateEmailAiInput = {
  action: EmailAiAction;
  to?: string;
  subject?: string;
  message?: string;
  signatureEnabled?: boolean;
};

const OPENAI_RESPONSES_API_URL = "https://api.openai.com/v1/responses";
async function getOpenAiConfiguration() {
  const platform = await getPlatformSettings();
  const apiKey = platform.openAiApiKey.trim();
  const model = platform.openAiModel.trim() || "gpt-5-mini";

  if (!apiKey) {
    throw new Error("OpenAI API key is missing. Add it in Superuser > Platform or set OPENAI_API_KEY.");
  }

  return {
    apiKey,
    model
  };
}

function createEmailAiInstructions(action: EmailAiAction, signatureEnabled: boolean) {
  const signatureInstruction = signatureEnabled
    ? "Do not add a signature block, sender name, or sign-off because the app may append a saved signature automatically."
    : "You may include a short natural sign-off only if it improves the draft.";

  if (action === "write") {
    return [
      "You are an expert CRM email copilot.",
      "Write a clear, professional email body in plain text.",
      "Return only the email body.",
      "Do not use markdown, bullets, code blocks, or a subject line.",
      "Keep the tone natural, concise, and ready to send.",
      signatureInstruction
    ].join(" ");
  }

  if (action === "rephrase") {
    return [
      "You are an expert CRM email editor.",
      "Rewrite the provided email body in plain text.",
      "Preserve the original meaning, asks, commitments, and intent.",
      "Improve clarity, polish, and flow without becoming verbose.",
      "Return only the rewritten email body.",
      "Do not use markdown, bullets, code blocks, or a subject line.",
      signatureInstruction
    ].join(" ");
  }

  return [
    "You are an expert CRM email reviewer.",
    "Analyze the draft and return concise plain text feedback.",
    "Use this exact format:",
    "Summary: ...",
    "Tone: ...",
    "Strengths:",
    "- ...",
    "Risks:",
    "- ...",
    "Suggested improvements:",
    "- ...",
    "Keep the response actionable and under 180 words."
  ].join(" ");
}

function createEmailAiPrompt({ action, to, subject, message }: GenerateEmailAiInput) {
  const recipient = to?.trim() || "Not provided";
  const normalizedSubject = subject?.trim() || "Not provided";
  const normalizedMessage = message?.trim() || "Not provided";

  if (action === "write") {
    return [
      "Create or improve an outbound email draft using the context below.",
      `Recipient: ${recipient}`,
      `Subject: ${normalizedSubject}`,
      `Current notes or draft: ${normalizedMessage}`,
      "If the current draft already has content, keep its intent and make it more polished.",
      "If the context is thin, write a short practical draft instead of inventing detailed facts."
    ].join("\n");
  }

  if (action === "rephrase") {
    return [
      "Rephrase this outbound email draft.",
      `Recipient: ${recipient}`,
      `Subject: ${normalizedSubject}`,
      "Draft:",
      normalizedMessage
    ].join("\n");
  }

  return [
    "Analyze this outbound email draft before send.",
    `Recipient: ${recipient}`,
    `Subject: ${normalizedSubject}`,
    "Draft:",
    normalizedMessage
  ].join("\n");
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const typedPayload = payload as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<{
        text?: string;
      }>;
    }>;
  };

  if (typeof typedPayload.output_text === "string" && typedPayload.output_text.trim()) {
    return typedPayload.output_text.trim();
  }

  const fallbackText = typedPayload.output
    ?.flatMap((item) => item.content || [])
    .map((item) => item.text)
    .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
    .join("\n")
    .trim();

  return fallbackText || "";
}

export async function generateEmailAiResult(input: GenerateEmailAiInput): Promise<GenerateEmailAiResult> {
  const { apiKey, model } = await getOpenAiConfiguration();
  const response = await fetch(OPENAI_RESPONSES_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      instructions: createEmailAiInstructions(input.action, Boolean(input.signatureEnabled)),
      input: createEmailAiPrompt(input),
      max_output_tokens: input.action === "analyze" ? 450 : 900
    }),
    cache: "no-store"
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && payload.error && typeof payload.error === "object" && "message" in payload.error
        ? String(payload.error.message || "")
        : "";

    throw new Error(message || "OpenAI request failed.");
  }

  const output = extractOutputText(payload);

  if (!output) {
    throw new Error("Email AI returned an empty response.");
  }

  return {
    action: input.action,
    output,
    model
  };
}
