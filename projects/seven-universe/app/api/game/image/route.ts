import { generateImageFree } from '@/src/ai/FreeImageGen';
import { getUniverse } from '@/src/universes';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, universeId } = body;
    const uni = getUniverse(universeId || 'xmen');
    const style = uni?.imageStyle || 'cinematic, detailed';

    let prompt = '';
    if (type === 'character') prompt = `Portrait, upper body. ${data.appearance || data.name}. ${style}. No text.`;
    else if (type === 'scene') prompt = `${data.prompt}. ${style}. No text.`;
    else return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });

    const url = generateImageFree(prompt, { width: 1024, height: 1024 });
    return NextResponse.json({ url, prompt });
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }); }
}
