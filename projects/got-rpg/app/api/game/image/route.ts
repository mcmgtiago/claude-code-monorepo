import { generateImageFree, buildGotPortraitPrompt, buildLocationPrompt } from '@/src/ai/FreeImageGen';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let prompt = '';
    switch (type) {
      case 'character': prompt = buildGotPortraitPrompt(data); break;
      case 'location': prompt = buildLocationPrompt(data.location, 'got'); break;
      case 'scene': prompt = `${data.prompt}. Medieval dark fantasy Game of Thrones style, cinematic, atmospheric. No text.`; break;
      default: return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    // Pollinations é grátis e retorna URL direto
    const url = generateImageFree(prompt, { width: 1024, height: 1024 });
    return NextResponse.json({ url, prompt });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
