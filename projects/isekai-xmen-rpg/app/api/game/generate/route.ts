import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  defaultHeaders: {
    'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN}`,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, sex, mutant } = body;

    if (type === 'character') {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 500,
        temperature: 1.0,
        system: 'Você gera personagens de RPG X-Men. Responda APENAS com JSON válido, sem markdown, sem explicação.',
        messages: [{
          role: 'user',
          content: `Gere um personagem RPG X-Men. Sexo: ${sex || 'masculino'}. Tipo: ${mutant || 'mutante'}.
Responda EXATAMENTE neste formato JSON:
{"name":"nome criativo","age":numero_18_35,"personality":"2 frases sobre temperamento","appearance":"descricao fisica detalhada: rosto cabelo corpo roupas","power":"${mutant === 'humano' ? 'nenhum' : 'nome do poder: descricao curta do que faz'}","background":"1 frase sobre vida antes do transporte"}`
        }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return NextResponse.json(JSON.parse(jsonMatch[0]));
      }
      return NextResponse.json({ error: 'Falha ao gerar', raw: text }, { status: 500 });
    }

    if (type === 'powers') {
      const { style } = body;
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: 400,
        temperature: 1.0,
        system: 'Você cria poderes mutantes criativos. Responda APENAS com JSON array.',
        messages: [{
          role: 'user',
          content: `Crie 4 poderes mutantes X-Men baseados nesta descrição: "${style}".
Responda EXATAMENTE neste formato JSON array:
[{"name":"Nome do Poder","description":"O que faz em 1 frase"},{"name":"...","description":"..."},{"name":"...","description":"..."},{"name":"...","description":"..."}]`
        }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return NextResponse.json(JSON.parse(jsonMatch[0]));
      }
      return NextResponse.json({ error: 'Falha ao gerar poderes', raw: text }, { status: 500 });
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
