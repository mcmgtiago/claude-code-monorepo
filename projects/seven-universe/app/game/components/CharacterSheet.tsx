'use client';

export default function CharacterSheet({ character, gameState, universe, portrait }: any) {
  if (!character?.name) return <div className="p-4 text-center"><p className="text-gray-600 text-xs mt-8">Ficha aparecerá após criação.</p></div>;
  const quests = gameState?.quests?.filter((q: any) => q.status === 'active') || [];
  const accent = universe?.theme?.accentHex || '#a855f7';
  const attrDefs = universe?.attributes || [];

  const Bar = ({ label, value, max, color }: any) => (
    <div className="mb-1.5"><div className="flex justify-between text-xs text-gray-400"><span>{label}</span><span>{value}/{max}</span></div><div className="w-full h-1.5 bg-gray-800 rounded-full"><div className="h-full rounded-full" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color }} /></div></div>
  );

  return (
    <div className="p-3 space-y-3 text-xs">
      {portrait && <img src={portrait} className="w-full rounded-lg border border-gray-800" />}
      <div className="text-center border-b border-gray-800 pb-2">
        <h2 className="text-base font-bold text-white">{character.name}</h2>
        <p className="text-gray-400">{character.rank} • Nv{character.level}</p>
        <p className="text-gray-600">{character.powerType} • {character.powerStage}{character.fastGrowth ? ' • ⚡rápido' : ''}</p>
      </div>
      <div>
        <Bar label="HP" value={character.hp} max={character.hpMax} color="#ef4444" />
        <Bar label="Energia" value={character.energy} max={character.energyMax} color={accent} />
        <Bar label="Stress" value={character.stress} max={100} color="#eab308" />
        <div className="flex justify-between text-xs mt-1"><span className="text-gray-500">Moralidade</span><span className="text-gray-300">{character.morality}</span></div>
      </div>
      <div>
        <h3 className="text-[9px] text-gray-500 uppercase mb-1">Atributos</h3>
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(character.attributes || {}).map(([k, v]) => { const def = attrDefs.find((a: any) => a.key === k); return (
            <div key={k} className="text-center bg-gray-900 rounded py-0.5"><span className="text-gray-600 block" style={{ fontSize: '8px' }}>{def?.short || k}</span><span className="text-white font-bold">{v as number}</span></div>
          ); })}
        </div>
      </div>
      {character.power && <div><h3 className="text-[9px] text-gray-500 uppercase mb-1">{universe?.powerLabel}</h3><div className="border rounded p-2" style={{ borderColor: accent + '40' }}><p className="text-xs" style={{ color: accent }}>{character.power.description}</p></div></div>}
      {character.skills?.length > 0 && <div><h3 className="text-[9px] text-gray-500 uppercase mb-1">Habilidades</h3>{character.skills.map((s: any) => <div key={s.id} className="flex justify-between bg-gray-900 rounded px-2 py-0.5 mb-0.5"><span className="text-white text-[11px]">{s.name}</span><span className="text-gray-600 text-[9px]">{s.tree}</span></div>)}</div>}
      {character.powerHistory?.length > 0 && <div><h3 className="text-[9px] text-gray-500 uppercase mb-1">Evoluções</h3>{character.powerHistory.map((h: string, i: number) => <p key={i} className="text-[10px]" style={{ color: accent }}>⚡ {h}</p>)}</div>}
      {(character.alliances?.length > 0) && <div><span className="text-gray-600 text-[9px]">Aliados:</span> <span className="text-green-300 text-[11px]">{character.alliances.join(', ')}</span></div>}
      {quests.length > 0 && <div><h3 className="text-[9px] text-gray-500 uppercase mb-1">Missões</h3>{quests.map((q: any) => <p key={q.id} className="text-yellow-200 text-xs">• {q.title}</p>)}</div>}
      <div className="border-t border-gray-800 pt-2 text-gray-500">📍 {gameState?.world?.location} • Dia {gameState?.world?.day}</div>
    </div>
  );
}
