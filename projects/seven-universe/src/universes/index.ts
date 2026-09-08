import { XMEN } from './xmen';
import { GOT } from './got';
import { BLEACH } from './bleach';
import { BRIDGERTON } from './bridgerton';
import { CYBERPUNK } from './cyberpunk';
import { COWBOY } from './cowboy';
import { SAMURAI } from './samurai';
import { SKYRIM } from './skyrim';
import { NARUTO } from './naruto';
import { MHA } from './mha';
import { JJK } from './jjk';
import { DBZ } from './dbz';
import { ONEPIECE } from './onepiece';
import { DEMONSLAYER } from './demonslayer';
import { HXH } from './hxh';
import { WITCHER } from './witcher';
import { MAFIA } from './mafia';
import { REALLIFE } from './reallife';
import { FIGHTNIGHT } from './fightnight';
import { WRESTLING } from './wrestling';
import { BASQUETE } from './basquete';
import { BEISEBOL } from './beisebol';
import type { Universe } from './types';

export const UNIVERSES: Universe[] = [
  // Anime
  NARUTO, MHA, JJK, DBZ, ONEPIECE, BLEACH, DEMONSLAYER, HXH,
  // Games/Fantasia
  SKYRIM, WITCHER, XMEN,
  // Séries/Mundos
  GOT, MAFIA, BRIDGERTON, CYBERPUNK, COWBOY, SAMURAI,
  // Mundo Real & Esportes
  REALLIFE, FIGHTNIGHT, WRESTLING, BASQUETE, BEISEBOL,
];

export function getUniverse(id: string): Universe | undefined {
  return UNIVERSES.find(u => u.id === id);
}

export type { Universe } from './types';
