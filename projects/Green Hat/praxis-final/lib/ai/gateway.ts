/**
 * AI Gateway wrapper — PRÁXIS.
 *
 * Supports: Avello Gateway (primary), Vercel AI Gateway (fallback), Anthropic direct.
 * Centralises model routing so the rest of the codebase only references model
 * strings like `"anthropic/claude-sonnet-4-6"`.
 *
 * Avello Gateway uses Bearer token auth (not x-api-key).
 */

import { env } from "@/lib/env";

export type ModelId =
  | "anthropic/claude-sonnet-4-6"
  | "anthropic/claude-haiku-4-5"
  | "openai/text-embedding-3-small"
  | (string & {});

export const DEFAULT_BOT_MODEL: ModelId = "anthropic/claude-sonnet-4-6";
export const DEFAULT_CLASSIFIER_MODEL: ModelId = "anthropic/claude-haiku-4-5";
export const DEFAULT_EMBEDDING_MODEL: ModelId = "openai/text-embedding-3-small";

export function isAiGatewayConfigured(): boolean {
  return Boolean(env.AVELLO_AUTH_TOKEN) || Boolean(env.AI_GATEWAY_API_KEY) || Boolean(env.ANTHROPIC_API_KEY);
}

export function isEmbeddingProviderConfigured(): boolean {
  return Boolean(env.AI_GATEWAY_API_KEY) || Boolean(env.OPENAI_API_KEY);
}

/**
 * Headers for gateway calls. Tenant ID for usage tracking.
 */
export function gatewayHeaders(opts: { organizationId: string }): Record<string, string> {
  const headers: Record<string, string> = {
    "X-AI-Gateway-Tenant-Id": opts.organizationId,
    "X-AI-Gateway-Zero-Retention": "1",
  };
  // Avello uses Bearer auth
  if (env.AVELLO_AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${env.AVELLO_AUTH_TOKEN}`;
  }
  return headers;
}

/**
 * Gateway config resolution (priority order):
 * 1. Avello Gateway (AVELLO_AUTH_TOKEN + baseURL)
 * 2. Vercel AI Gateway (AI_GATEWAY_API_KEY)
 * 3. Anthropic direct (ANTHROPIC_API_KEY)
 */
export function gatewayConfig(): { apiKey: string; baseURL?: string; headers?: Record<string, string> } | null {
  // Priority 1: Avello
  if (env.AVELLO_AUTH_TOKEN) {
    return {
      apiKey: env.AVELLO_AUTH_TOKEN,
      baseURL: env.AVELLO_BASE_URL || "https://avellogateway.online",
      headers: { "Authorization": `Bearer ${env.AVELLO_AUTH_TOKEN}` },
    };
  }
  // Priority 2: Vercel AI Gateway
  if (env.AI_GATEWAY_API_KEY) {
    return {
      apiKey: env.AI_GATEWAY_API_KEY,
      baseURL: env.AI_GATEWAY_BASE_URL || undefined,
    };
  }
  // Priority 3: Anthropic direct
  if (env.ANTHROPIC_API_KEY) {
    return {
      apiKey: env.ANTHROPIC_API_KEY,
    };
  }
  return null;
}
