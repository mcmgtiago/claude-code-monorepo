const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';

export function generateImageFree(prompt: string, options?: { width?: number; height?: number }): string {
  const width = options?.width || 1024, height = options?.height || 1024;
  return `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;
}

export function buildPortraitPrompt(character: { name?: string; appearance?: string; race?: string }): string {
  const style = 'Highly detailed anime portrait, Bleach manga/anime art style by Tite Kubo. Upper body, dramatic lighting, spiritual energy aura.';
  const subject = character.appearance ? `${character.appearance}. Bleach universe.` : `A ${character.race || 'shinigami'} character.`;
  return `${style} ${subject} No text.`;
}
