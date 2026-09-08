// Persistência de saves em filesystem (JSON).
// Cada save é um arquivo JSON no diretório data/saves/
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import path from 'path';
import type { GameState } from './state';

// Saves ficam num local estável. SAVES_DIR pode ser sobrescrito por env var.
// Fallback: sobe de .next/standalone pra raiz do projeto se detectar o build.
function resolveSavesDir(): string {
  if (process.env.SAVES_DIR) return process.env.SAVES_DIR;
  let cwd = process.cwd();
  // Se rodando do standalone, sobe 2 níveis pra raiz do projeto
  if (cwd.includes('.next')) {
    cwd = cwd.split('.next')[0];
  }
  return path.join(cwd, 'data', 'saves');
}

const SAVES_DIR = resolveSavesDir();

function ensureDir() {
  if (!existsSync(SAVES_DIR)) {
    mkdirSync(SAVES_DIR, { recursive: true });
  }
}

export function saveGame(state: GameState): string {
  ensureDir();
  const id = state.id;
  const filePath = path.join(SAVES_DIR, `${id}.json`);
  writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf8');
  return id;
}

export function loadGame(id: string): GameState | null {
  ensureDir();
  const filePath = path.join(SAVES_DIR, `${id}.json`);
  if (!existsSync(filePath)) return null;
  const data = readFileSync(filePath, 'utf8');
  return JSON.parse(data) as GameState;
}

export function listSaves(): Array<{
  id: string;
  name: string;
  level: number;
  power: string;
  location: string;
  turnCount: number;
  updatedAt: string;
  universeId: string;
}> {
  ensureDir();
  const files = readdirSync(SAVES_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    try {
      const data = JSON.parse(readFileSync(path.join(SAVES_DIR, f), 'utf8')) as GameState;
      return {
        id: data.id,
        name: data.character?.name || 'Sem nome',
        level: data.character?.level || 1,
        power: data.character?.power?.description || data.character?.powerType || 'Sem poder',
        location: data.world?.location || 'Desconhecido',
        turnCount: data.turnCount || 0,
        updatedAt: data.updatedAt || '',
        universeId: data.universeId || '',
      };
    } catch {
      return null;
    }
  }).filter(Boolean) as any[];
}

export function deleteSave(id: string): boolean {
  const filePath = path.join(SAVES_DIR, `${id}.json`);
  if (!existsSync(filePath)) return false;
  unlinkSync(filePath);
  return true;
}
