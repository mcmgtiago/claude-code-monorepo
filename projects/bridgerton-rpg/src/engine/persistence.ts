// Persistência de saves em filesystem (JSON).
// Cada save é um arquivo JSON no diretório data/saves/
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import path from 'path';
import type { GameState } from './state';

const SAVES_DIR = path.join(process.cwd(), 'data', 'saves');

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
        power: data.character?.xGene?.class || 'Humano Puro',
        location: data.world?.location || 'Desconhecido',
        turnCount: data.turnCount || 0,
        updatedAt: data.updatedAt || '',
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
