import Anthropic from '@anthropic-ai/sdk';

const AUTH_TOKEN = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
const BASE_URL = process.env.ANTHROPIC_BASE_URL || undefined;

// O gateway (avellogateway) usa Authorization: Bearer em vez de x-api-key.
// authToken configura o SDK para enviar o header Bearer.
const anthropic = new Anthropic({
  authToken: AUTH_TOKEN,
  apiKey: null, // desabilita x-api-key
  baseURL: BASE_URL,
});

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string | Anthropic.ContentBlockParam[];
}

export interface LLMTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface LLMResponse {
  text: string;
  toolCalls: Array<{
    id: string;
    name: string;
    input: Record<string, unknown>;
  }>;
  inputTokens: number;
  outputTokens: number;
}

export async function callLLM(opts: {
  system: string;
  messages: LLMMessage[];
  tools?: LLMTool[];
  maxTokens?: number;
  temperature?: number;
}): Promise<LLMResponse> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature ?? 0.3,
    system: opts.system,
    messages: opts.messages,
    tools: opts.tools as Anthropic.Tool[] | undefined,
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  const toolCalls = response.content
    .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
    .map((block) => ({
      id: block.id,
      name: block.name,
      input: block.input as Record<string, unknown>,
    }));

  return {
    text,
    toolCalls,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

export { anthropic, MODEL };
