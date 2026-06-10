import { useState, useRef, useCallback } from 'react';
import { BG, ACCENT_COLORS } from '../constants';

export default function SetupScreen({ onStart }) {
  const [names, setNames] = useState([]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const add = useCallback(() => {
    const t = input.trim();
    if (t && !names.includes(t) && names.length < 12) {
      setNames(prev => [...prev, t]);
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, names]);

  const remove = useCallback((idx) => {
    setNames(prev => prev.filter((_, j) => j !== idx));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: BG }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">⚽</div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            SORTEO <span style={{ color: '#D4AF37' }}>MUNDIAL</span>
          </h1>
          <div className="text-lg text-white/40 font-medium tracking-widest">FIFA WORLD CUP 2026</div>
          <div className="text-sm text-white/25 mt-1 tracking-wider">USA · MÉXICO · CANADÁ</div>
        </div>
        <div className="rounded-2xl p-6 border border-white/10 mb-6" style={{ background: 'rgba(20,24,41,0.7)' }}>
          <label className="block text-white/60 text-sm font-semibold mb-3 tracking-wide uppercase">
            Participantes ({names.length}/12)
          </label>
          <div className="flex gap-2 mb-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="Nombre del participante..."
              maxLength={20}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-amber-400/50 transition-colors text-base"
            />
            <button
              onClick={add}
              disabled={!input.trim() || names.length >= 12}
              className="px-5 py-3 rounded-xl font-bold text-sm tracking-wide transition-all disabled:opacity-30"
              style={{ background: '#D4AF37', color: '#0B0E1A' }}
            >
              AÑADIR
            </button>
          </div>
          {names.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {names.map((n, i) => (
                <span key={n} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border border-white/10"
                  style={{ background: `${ACCENT_COLORS[i % 12]}18`, color: ACCENT_COLORS[i % 12] }}>
                  {n}
                  <button onClick={() => remove(i)} className="ml-1 opacity-50 hover:opacity-100 transition-opacity text-xs" aria-label={`Quitar ${n}`}>✕</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => names.length >= 2 && onStart(names)}
          disabled={names.length < 2}
          className="w-full py-4 rounded-2xl font-black text-lg tracking-wide transition-all disabled:opacity-20 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: names.length >= 2 ? 'linear-gradient(135deg, #D4AF37, #F5D77A)' : 'rgba(255,255,255,0.1)', color: '#0B0E1A' }}
        >
          CONTINUAR →
        </button>
      </div>
    </div>
  );
}
