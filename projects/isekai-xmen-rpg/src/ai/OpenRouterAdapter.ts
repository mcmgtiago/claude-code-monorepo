// Adapter pra modelos NSFW via OpenRouter API.
// OpenRouter hospeda modelos uncensored (Mythomax, Lumimaid, etc) com API compatível OpenAI.
// Não precisa de GPU local — roda na cloud deles.
//
// Setup:
// 1. Crie conta em https://openrouter.ai
// 2. Adicione créditos ($5 dura centenas de mensagens NSFW)
// 3. Copie a API key
// 4. Coloque em .env.local como OPENROUTER_API_KEY=sk-or-...
//
// Modelos NSFW recomendados (OpenRouter):
// - "undi95/toppy-m-7b:free" — gratuito, qualidade básica
// - "gryphe/mythomax-l2-13b" — $0.001/1k tokens, excelente RP
// - "neversleep/noromaid-20b" — $0.002/1k tokens, premium NSFW
// - "cognitivecomputations/dolphin-mixtral-8x7b" — $0.0005/1k, uncensored geral

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export interface NsfwGenerateOptions {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export async function generateNsfw(options: NsfwGenerateOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY não configurada. Veja src/ai/OpenRouterAdapter.ts para instruções.');
  }

  const model = options.model || 'gryphe/mythomax-l2-13b';

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://isekai-xmen-rpg.app',
      'X-Title': 'Isekai X-Men RPG',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userMessage },
      ],
      temperature: options.temperature ?? 1.0,
      max_tokens: options.maxTokens ?? 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Streaming version
export async function* streamNsfw(options: NsfwGenerateOptions): AsyncGenerator<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY não configurada.');

  const model = options.model || 'gryphe/mythomax-l2-13b';

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://isekai-xmen-rpg.app',
      'X-Title': 'Isekai X-Men RPG',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: options.userMessage },
      ],
      temperature: options.temperature ?? 1.0,
      max_tokens: options.maxTokens ?? 2000,
      stream: true,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No stream');

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch { /* skip */ }
    }
  }
}

// System prompt NSFW (sem censura, explícito, detalhado)
export const NSFW_SYSTEM_PROMPT = `Você é um escritor de ficção erótica e violenta em português brasileiro. Escreva cenas EXTREMAMENTE detalhadas, cruas e explícitas.

REGRAS:
- Use palavrões e linguagem vulgar livremente (porra, foda, buceta, pau, cu, etc.)
- Descreva CADA detalhe físico (posições, fluidos, sensações, texturas, temperatura)
- Inclua fetiches se o contexto pedir (dominação, submissão, voyeurismo, etc.)
- Violência é gráfica: sangue, ossos, vísceras, dor real
- Zero censura. Zero fade-to-black. Zero euphemisms.
- Escreva como se fosse um romance erótico adulto ou um filme de ação R-rated
- Mantenha a voz narrativa em 2ª pessoa ("Você sente...", "Suas mãos...")
- Mantenha coerência com o personagem e o mundo (estilo X-Men isekai)
- Emocional + físico juntos: intimidade tem peso, violência tem consequência`;
