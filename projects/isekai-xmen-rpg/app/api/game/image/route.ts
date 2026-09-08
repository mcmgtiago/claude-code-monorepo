import { generateImage, buildCharacterPortraitPrompt, buildLocationPrompt, buildNpcPortraitPrompt } from '@/src/ai/ImageGenerator';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let prompt = '';

    switch (type) {
      case 'character':
        prompt = buildCharacterPortraitPrompt(data);
        break;
      case 'location':
        prompt = buildLocationPrompt(data.location, data.weather, data.timeOfDay);
        break;
      case 'npc':
        prompt = buildNpcPortraitPrompt(data.name, data.description);
        break;
      case 'scene':
        prompt = data.prompt; // custom prompt direto
        break;
      default:
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    const url = await generateImage({ prompt, size: '1024x1024' });

    if (!url) {
      return NextResponse.json({ error: 'Falha ao gerar imagem' }, { status: 500 });
    }

    return NextResponse.json({ url, prompt });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
