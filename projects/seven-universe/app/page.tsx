'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { UNIVERSES, getUniverse } from '@/src/universes';

type Save = { id: string; name: string; level: number; power: string; location: string; turnCount: number; updatedAt: string; universeId?: string };

export default function Home() {
  const router = useRouter();
  const [saves, setSaves] = useState<Save[]>([]);
  const [loadingSaves, setLoadingSaves] = useState(true);

  const fetchSaves = async () => {
    setLoadingSaves(true);
    try {
      const r = await fetch('/api/game/save');
      const d = await r.json();
      if (Array.isArray(d)) setSaves(d.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')));
    } catch {} finally { setLoadingSaves(false); }
  };

  useEffect(() => { fetchSaves(); }, []);

  const delSave = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Apagar este save?')) return;
    try {
      await fetch('/api/game/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', saveId: id }) });
      setSaves(s => s.filter(x => x.id !== id));
    } catch {}
  };

  return (
    <div className="min-h-[100dvh] bg-black p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">SEVEN UNIVERSE</h1>
          <p className="text-sm text-gray-500">Escolha o mundo que vai viver hoje</p>
        </div>

        {/* Continuar jogo — saves */}
        {!loadingSaves && saves.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">▶ Continuar jogo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {saves.map(sv => {
                const uni = sv.universeId ? getUniverse(sv.universeId) : undefined;
                return (
                  <button key={sv.id} onClick={() => router.push(`/game?load=${sv.id}`)}
                    className="text-left p-3 border border-gray-800 rounded-xl hover:border-gray-500 active:scale-95 transition-all relative group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{uni?.emoji || '🎮'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-bold text-sm truncate">{sv.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{uni?.name || sv.universeId || 'Jogo'} • Nv{sv.level} • Turno {sv.turnCount}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-600 truncate">📍 {sv.location}</p>
                    <span onClick={(e) => delSave(sv.id, e)} className="absolute top-2 right-2 text-gray-700 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">✕</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">✦ Novo jogo</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {UNIVERSES.map(uni => (
            <button key={uni.id} onClick={() => router.push(`/game?u=${uni.id}`)}
              className="text-left p-5 border border-gray-800 rounded-xl hover:border-gray-500 active:scale-95 transition-all group">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{uni.emoji}</span>
                <div>
                  <h2 className="text-lg font-bold text-white">{uni.name}</h2>
                  <p className="text-xs text-gray-500">{uni.tagline}</p>
                </div>
              </div>
              <div className="mt-2 h-0.5 rounded-full transition-all" style={{ background: uni.theme.accentHex, opacity: 0.4 }} />
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-700 mt-8">22 mundos • Isekai, Fantasia & Mundo Real • Conteúdo adulto • IA Opus 4.8</p>
      </div>
    </div>
  );
}
