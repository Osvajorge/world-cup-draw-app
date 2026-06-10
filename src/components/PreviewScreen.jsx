import { BG, ACCENT_COLORS, GROUPS } from '../constants';

export default function PreviewScreen({ onBeginDraw, onBack }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: BG }}>
      <div className="flex-shrink-0 px-6 pt-6 pb-2">
        <button onClick={onBack} className="mb-4 text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-2">← Volver</button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white mb-0.5 tracking-tight">
            LOS <span style={{ color: '#D4AF37' }}>12 GRUPOS</span>
          </h2>
          <p className="text-white/30 text-xs tracking-wider">48 SELECCIONES · FIFA WORLD CUP 2026</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {GROUPS.map((g, i) => (
              <div key={g.letter} className="rounded-xl border border-white/10 p-4"
                style={{ background: 'rgba(20,24,41,0.7)', animation: `fade-slide-in 0.4s ${i * 0.04}s both` }}>
                <div className="font-black text-base mb-2" style={{ color: ACCENT_COLORS[i] }}>GRUPO {g.letter}</div>
                {g.teams.map((t, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-white/80 py-0.5">
                    <span className="text-base">{t.flag}</span><span>{t.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 px-4 py-4 flex justify-center">
        <button onClick={onBeginDraw}
          className="px-10 py-4 rounded-2xl font-black text-lg tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D77A)', color: '#0B0E1A' }}>
          ⚽ INICIAR SORTEO
        </button>
      </div>
      <style>{`@keyframes fade-slide-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
