import { useMemo } from 'react';
import { GROUPS } from '../constants';

export default function ResultsGrid({ participants, completed, colorMap }) {
  const byPerson = useMemo(() => {
    const map = Object.fromEntries(participants.map(p => [p, []]));
    completed.forEach(c => { if (map[c.participant]) map[c.participant].push(c); });
    return map;
  }, [participants, completed]);

  const withResults = participants.filter(p => byPerson[p].length > 0);
  if (withResults.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {withResults.map((p, pi) => (
        <div key={p} className="rounded-xl border border-white/8 p-4"
          style={{ background: 'rgba(20,24,41,0.6)', animation: `fade-slide-in 0.4s ${pi * 0.04}s both` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: colorMap[p] || '#D4AF37', color: '#0B0E1A' }}>
              {p.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-white text-base">{p}</span>
          </div>
          <div className="space-y-2">
            {byPerson[p].map((a, ai) => (
              <div key={ai} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="font-bold text-xs mb-1.5" style={{ color: a.color }}>GRUPO {GROUPS[a.groupIdx].letter}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {GROUPS[a.groupIdx].teams.map((t, ti) => (
                    <span key={ti} className="text-xs text-white/70 flex items-center gap-1">
                      <span className="text-sm">{t.flag}</span>{t.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
