import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  defaultHeaders: { 'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN}` },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, sex, race, tier } = body;
    if (type === 'character') {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6-20250514', max_tokens: 500, temperature: 1.0,
        system: 'Gere personagens Bleach. Responda APENAS com JSON válido.',
        messages: [{ role: 'user', content: `Gere personagem Bleach. Sexo: ${sex || 'masculino'}. Raça: ${race || 'shinigami'}. Posição: ${tier || 'veterano'}.
JSON exato: {"name":"nome estilo japonês/bleach","age":numero,"race":"${race || 'shinigami'}","personality":"2 frases","appearance":"rosto cabelo corpo roupas (shihakushō/etc)","power":"${race === 'shinigami' || race === 'visored' ? 'zanpakutō: nome, elemento e habilidade shikai' : race === 'hollow' ? 'poderes hollow/arrancar' : race === 'quincy' ? 'poderes quincy' : 'poder ou nenhum'}","background":"1 frase de história"}` }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return NextResponse.json(JSON.parse(match[0]));
      return NextResponse.json({ error: 'Falha', raw: text }, { status: 500 });
    }
    if (type === 'powers') {
      const { style } = body;
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6-20250514', max_tokens: 400, temperature: 1.0,
        system: 'Crie zanpakutōs/poderes Bleach. Responda APENAS JSON array.',
        messages: [{ role: 'user', content: `Crie 4 zanpakutōs/poderes Bleach baseados em: "${style}". JSON array: [{"name":"Nome (comando de liberação)","description":"elemento + habilidade em 1 frase"},...]` }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const match = text.match(/\[[\s\S]*\]/);
      if (match) return NextResponse.json(JSON.parse(match[0]));
      return NextResponse.json({ error: 'Falha' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
