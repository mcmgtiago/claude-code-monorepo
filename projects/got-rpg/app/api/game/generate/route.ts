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
    const { type, sex, house, era, tier, magic } = body;

    if (type === 'character') {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6-20250514', max_tokens: 500, temperature: 1.0,
        system: 'Gere personagens Game of Thrones. Responda APENAS com JSON válido.',
        messages: [{ role: 'user', content: `Gere personagem GoT. Sexo: ${sex || 'masculino'}. Casa: ${house || 'aleatória'}. Era: ${era || 'Guerra dos Cinco Reis'}. Posição: ${tier || 'cavaleiro'}. Magia: ${magic || 'nenhuma'}.
JSON exato: {"name":"nome realista de Westeros","age":numero,"house":"casa","title":"título/posição","personality":"2 frases","appearance":"rosto cabelo corpo roupas armas","magic":"${magic !== 'nenhuma' ? 'tipo: descrição' : 'nenhuma'}","background":"1 frase de história"}` }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return NextResponse.json(JSON.parse(match[0]));
      return NextResponse.json({ error: 'Falha', raw: text }, { status: 500 });
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
