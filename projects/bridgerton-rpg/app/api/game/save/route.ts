import { saveGame, loadGame, listSaves, deleteSave } from '@/src/engine/persistence';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const saves = listSaves();
  return NextResponse.json(saves);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, saveId, state } = body;

  if (action === 'save' && state) {
    const id = saveGame(state);
    return NextResponse.json({ success: true, saveId: id });
  }

  if (action === 'load' && saveId) {
    const data = loadGame(saveId);
    if (!data) return NextResponse.json({ error: 'Save não encontrado' }, { status: 404 });
    return NextResponse.json(data);
  }

  if (action === 'delete' && saveId) {
    deleteSave(saveId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
}
