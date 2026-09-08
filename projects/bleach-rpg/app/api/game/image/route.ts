import { generateImageFree, buildPortraitPrompt } from '@/src/ai/FreeImageGen';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;
    let prompt = '';
    if (type === 'character') prompt = buildPortraitPrompt(data);
    else if (type === 'scene') prompt = `${data.prompt}. Bleach anime style, cinematic, spiritual atmosphere. No text.`;
    else return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    const url = generateImageFree(prompt, { width: 1024, height: 1024 });
    return NextResponse.json({ url, prompt });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
