// Geração de imagens via OpenAI DALL-E API
// Gera retratos de personagens, cenários, NPCs, cenas

const OPENAI_BASE = 'https://api.openai.com/v1';

export interface ImageGenerateOptions {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  quality?: 'standard' | 'hd';
}

/** Gera imagem via OpenAI gpt-image-1. Retorna base64 data. */
export async function generateImage(options: ImageGenerateOptions): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[image] OPENAI_API_KEY não configurada');
    return null;
  }

  try {
    const response = await fetch(`${OPENAI_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: options.prompt,
        n: 1,
        size: options.size || '1024x1024',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[image] OpenAI error:', err);
      return null;
    }

    const data = await response.json();
    const b64 = data.data?.[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
    const url = data.data?.[0]?.url;
    return url || null;
  } catch (err) {
    console.error('[image] Error:', err);
    return null;
  }
}

/** Gera prompt de retrato de personagem a partir da descrição do user */
export function buildCharacterPortraitPrompt(character: {
  name: string;
  appearance?: string;
  xGeneClass?: string;
  powerStage?: string;
  race?: string;
}): string {
  const style = `Highly detailed digital portrait, upper body shot, dark moody lighting, cinematic composition. Style: realistic comic book art meets cyberpunk noir. Rain droplets, neon ambient light in background. Sharp focus on face and expression.`;

  const subject = character.appearance
    ? `Subject: ${character.appearance}. They are a mutant in a dark X-Men cyberpunk universe.`
    : `Subject: A mysterious figure named ${character.name}. Mutant with ${character.xGeneClass || 'unknown'} powers. Intense expression, dangerous aura.`;

  return `${style} ${subject} No text, no watermarks, no logos.`;
}

/** Gera prompt de cenário */
export function buildLocationPrompt(location: string, weather?: string, timeOfDay?: string): string {
  return `Wide shot digital art of "${location}" in X-Men cyberpunk universe. ${weather || 'rainy'} ${timeOfDay || 'night'}. Neon lights, urban decay, mutant graffiti. Atmospheric, cinematic, dark and moody. No text or logos.`;
}

/** Gera prompt de NPC */
export function buildNpcPortraitPrompt(name: string, description: string): string {
  return `Digital art portrait of ${name} from X-Men universe. ${description}. Dark cyberpunk style, cinematic lighting, atmospheric. Comic book realism.`;
}
