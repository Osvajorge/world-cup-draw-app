import { ACCENT_COLORS } from '../constants';

export default function DrawHeader({ onReset, completed, total, badge }) {
  return (
    <div className="text-center pt-5 pb-2 px-4 relative">
      <button onClick={onReset} className="absolute left-4 top-5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border border-white/10 text-white/40 hover:text-white/80 hover:border-white/25 transition-all">
        ← Salir
      </button>
      <h1 className="text-xl font-black text-white tracking-tight">
        SORTEO <span style={{ color: '#D4AF37' }}>MUNDIAL 2026</span>
        {badge && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#E8632B20', color: '#E8632B' }}>
            {badge}
          </span>
        )}
      </h1>
      <div className="flex items-center justify-center gap-2 mt-2">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full transition-all duration-500" style={{
            background: i < completed.length ? ACCENT_COLORS[i] : 'rgba(255,255,255,0.1)',
            boxShadow: i < completed.length ? `0 0 8px ${ACCENT_COLORS[i]}60` : 'none',
          }} />
        ))}
      </div>
    </div>
  );
}
