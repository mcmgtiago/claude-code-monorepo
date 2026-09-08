// Geração de imagens GRÁTIS via Pollinations.ai
// Sem key, sem signup, sem limite. Modelo Flux.
// Alternativa gratuita ao DALL-E/OpenAI.

const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';

/** Gera URL de imagem via Pollinations (grátis). Retorna URL direto. */
export function generateImageFree(prompt: string, options?: { width?: number; height?: number }): string {
  const width = options?.width || 1024;
  const height = options?.height || 1024;
  const encoded = encodeURIComponent(prompt);
  return `${POLLINATIONS_BASE}/${encoded}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;
}

/** Gera prompt de retrato GoT */
export function buildGotPortraitPrompt(character: {
  name?: string;
  appearance?: string;
  house?: string;
  title?: string;
}): string {
  const style = 'Highly detailed digital portrait, upper body, dramatic lighting, medieval dark fantasy style like Game of Thrones HBO series. Cinematic, atmospheric, realistic.';
  const subject = character.appearance
    ? `${character.appearance}. Medieval Westeros setting.`
    : `A ${character.title || 'warrior'} from House ${character.house || 'unknown'} in Westeros.`;
  return `${style} ${subject} No text, no watermarks.`;
}

/** Gera prompt de retrato X-Men */
export function buildXmenPortraitPrompt(character: {
  name?: string;
  appearance?: string;
  xGeneClass?: string;
}): string {
  const style = 'Highly detailed digital portrait, upper body, dark moody lighting, cinematic. Style: realistic comic book art meets cyberpunk noir. Rain, neon ambient.';
  const subject = character.appearance
    ? `${character.appearance}. Mutant in dark X-Men cyberpunk universe.`
    : `A mysterious mutant with ${character.xGeneClass || 'unknown'} powers.`;
  return `${style} ${subject} No text, no watermarks.`;
}

/** Gera prompt de local */
export function buildLocationPrompt(location: string, style: 'got' | 'xmen' = 'xmen'): string {
  if (style === 'got') {
    return `Wide shot, ${location}, medieval dark fantasy Game of Thrones style, atmospheric, cinematic, dramatic lighting. No text.`;
  }
  return `Wide shot, ${location}, dark cyberpunk X-Men universe, neon lights, rain, atmospheric. No text.`;
}
