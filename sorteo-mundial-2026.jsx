import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/* ─── Constantes ─── */
const BG = 'radial-gradient(ellipse at top, #1a1f3a 0%, #0B0E1A 60%)';

const ACCENT_COLORS = [
  '#D4AF37', '#E8632B', '#3B82F6', '#10B981',
  '#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4',
  '#EF4444', '#84CC16', '#A855F7', '#14B8A6',
];

const GROUPS = [
  { letter: 'A', teams: [{ flag: '🇲🇽', name: 'México' }, { flag: '🇨🇦', name: 'Canadá' }, { flag: '🇺🇸', name: 'USA' }, { flag: '🇪🇸', name: 'España' }] },
  { letter: 'B', teams: [{ flag: '🇦🇷', name: 'Argentina' }, { flag: '🇧🇷', name: 'Brasil' }, { flag: '🇫🇷', name: 'Francia' }, { flag: '🇩🇪', name: 'Alemania' }] },
  { letter: 'C', teams: [{ flag: '🇮🇹', name: 'Italia' }, { flag: '🇵🇹', name: 'Portugal' }, { flag: '🇳🇱', name: 'Holanda' }, { flag: '🇧🇪', name: 'Bélgica' }] },
  { letter: 'D', teams: [{ flag: '🇬🇧', name: 'Inglaterra' }, { flag: '🇭🇷', name: 'Croacia' }, { flag: '🇨🇭', name: 'Suiza' }, { flag: '🇩🇰', name: 'Dinamarca' }] },
  { letter: 'E', teams: [{ flag: '🇺🇾', name: 'Uruguay' }, { flag: '🇨🇴', name: 'Colombia' }, { flag: '🇪🇨', name: 'Ecuador' }, { flag: '🇨🇱', name: 'Chile' }] },
  { letter: 'F', teams: [{ flag: '🇯🇵', name: 'Japón' }, { flag: '🇰🇷', name: 'Corea' }, { flag: '🇦🇺', name: 'Australia' }, { flag: '🇮🇷', name: 'Irán' }] },
  { letter: 'G', teams: [{ flag: '🇲🇦', name: 'Marruecos' }, { flag: '🇸🇳', name: 'Senegal' }, { flag: '🇳🇬', name: 'Nigeria' }, { flag: '🇨🇮', name: 'C. Marfil' }] },
  { letter: 'H', teams: [{ flag: '🇵🇱', name: 'Polonia' }, { flag: '🇦🇹', name: 'Austria' }, { flag: '🇸🇪', name: 'Suecia' }, { flag: '🇳🇴', name: 'Noruega' }] },
  { letter: 'I', teams: [{ flag: '🇷🇸', name: 'Serbia' }, { flag: '🇹🇷', name: 'Turquía' }, { flag: '🇬🇷', name: 'Grecia' }, { flag: '🇺🇦', name: 'Ucrania' }] },
  { letter: 'J', teams: [{ flag: '🇵🇪', name: 'Perú' }, { flag: '🇵🇾', name: 'Paraguay' }, { flag: '🇻🇪', name: 'Venezuela' }, { flag: '🇧🇴', name: 'Bolivia' }] },
  { letter: 'K', teams: [{ flag: '🇸🇦', name: 'A. Saudí' }, { flag: '🇶🇦', name: 'Catar' }, { flag: '🇦🇪', name: 'EAU' }, { flag: '🇪🇬', name: 'Egipto' }] },
  { letter: 'L', teams: [{ flag: '🇨🇷', name: 'Costa Rica' }, { flag: '🇵🇦', name: 'Panamá' }, { flag: '🇯🇲', name: 'Jamaica' }, { flag: '🇭🇳', name: 'Honduras' }] },
];

/* ─── Utilidades de aleatoriedad (criptográficamente seguras) ─── */
const secureRandom = () => {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 0xFFFFFFFF;
};

const secureInt = (max) => {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
};

const pick = (arr) => arr[secureInt(arr.length)];

// Fisher-Yates con random seguro y sin sesgo
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Hook compartido: máquina tragamonedas ─── */
function useSlotMachine({ participants, draws, onComplete }) {
  const [completed, setCompleted] = useState([]);
  const [phase, setPhase] = useState('idle');
  const [dispName, setDispName] = useState('');
  const [dispGroup, setDispGroup] = useState(null);
  const [confetti, setConfetti] = useState(false);

  const timeoutsRef = useRef([]);
  const mountedRef = useRef(true);
  const completedRef = useRef(completed);
  completedRef.current = completed;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const safeTimeout = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      if (mountedRef.current) fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  // Easing easeOutQuint: arranca rápido, frena suave
  const tickDelay = (step, total) => {
    const t = step / total;
    const eased = 1 - Math.pow(1 - t, 5);
    return 30 + eased * 220; // 30ms → 250ms
  };

  const idx = completed.length;
  const isComplete = idx >= draws.length;
  const current = draws[idx];

  const runShuffle = useCallback((max, pickFn, onTick, onEnd) => {
    const step = (i) => {
      if (i >= max) return onEnd();
      onTick(pickFn());
      safeTimeout(() => step(i + 1), tickDelay(i, max));
    };
    step(0);
  }, [safeTimeout]);

  const doShuffle = useCallback(() => {
    if (phase !== 'idle' || isComplete || !current) return;

    setPhase('shuffling-name');
    setConfetti(false);
    setDispGroup(null);
    setDispName('');

    const nMax = 12 + secureInt(5);
    const gMax = 12 + secureInt(6);
    const remainingGroups = draws.slice(idx).map(d => d.groupIdx);

    // Fase 1: nombre
    runShuffle(
      nMax,
      () => pick(participants),
      setDispName,
      () => {
        setDispName(current.participant);
        setPhase('name-locked');

        safeTimeout(() => {
          setPhase('shuffling-group');

          // Fase 2: grupo
          runShuffle(
            gMax,
            () => GROUPS[pick(remainingGroups)],
            setDispGroup,
            () => {
              setDispGroup(GROUPS[current.groupIdx]);
              setPhase('revealed');
              const next = [...completedRef.current, current];
              setCompleted(next);
              setConfetti(true);

              safeTimeout(() => {
                setConfetti(false);
                setPhase('idle');
                setDispName('');
                setDispGroup(null);
                if (next.length >= draws.length) onComplete(next);
              }, 2400);
            }
          );
        }, 550);
      }
    );
  }, [phase, isComplete, current, draws, idx, participants, runShuffle, safeTimeout, onComplete]);

  return { completed, phase, dispName, dispGroup, confetti, idx, isComplete, current, doShuffle };
}

/* ─── Confetti ─── */
function Confetti({ active }) {
  const particles = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 80 }, () => ({
      left: secureRandom() * 100,
      duration: 2 + secureRandom() * 2,
      delay: secureRandom() * 0.3,
      drift: (secureRandom() - 0.5) * 200,
      size: 4 + secureRandom() * 6,
      color: ACCENT_COLORS[secureInt(ACCENT_COLORS.length)],
      round: secureRandom() > 0.5,
    }));
  }, [active]);

  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {particles.map((p, i) => (
        <div key={i} className="absolute bottom-0" style={{
          left: `${p.left}%`,
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: p.round ? '50%' : '1px',
          transform: `rotate(${secureRandom() * 360}deg)`,
          animation: `confetti-up ${p.duration}s ${p.delay}s ease-out forwards`,
          '--drift': `${p.drift}px`,
        }} />
      ))}
    </div>
  );
}

/* ─── Setup Screen ─── */
function SetupScreen({ onStart }) {
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

/* ─── Mode Select ─── */
function ModeScreen({ participants, onSelect, onBack }) {
  const n = participants.length;
  const remainder = 12 % n;
  const base = Math.floor(12 / n);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: BG }}>
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="mb-8 text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-2">← Volver</button>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            ¿CÓMO <span style={{ color: '#D4AF37' }}>JUEGAN</span>?
          </h2>
          <p className="text-white/35 text-sm tracking-wider">{n} participante{n > 1 ? 's' : ''} · 12 grupos</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <button onClick={() => onSelect('one')} className="group text-left rounded-2xl border border-white/10 p-6 transition-all hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] hover:scale-[1.02]" style={{ background: 'rgba(20,24,41,0.8)' }}>
            <div className="text-3xl mb-4">🎫</div>
            <div className="font-black text-white text-xl mb-2 tracking-tight">Un grupo por persona</div>
            <div className="text-white/45 text-sm leading-relaxed mb-4">
              Cada quien recibe exactamente un grupo.
              {n < 12 ? (
                <span className="block mt-2 text-amber-400/80">
                  Sobran <strong>{12 - n}</strong> grupo{12 - n > 1 ? 's' : ''}. Al final se pregunta quién quiere uno más.
                </span>
              ) : (
                <span className="block mt-2 text-emerald-400/80">¡Perfecto, son 12 personas y 12 grupos!</span>
              )}
            </div>
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#D4AF37' }}>SELECCIONAR →</div>
          </button>

          <button onClick={() => onSelect('equal')} className="group text-left rounded-2xl border border-white/10 p-6 transition-all hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] hover:scale-[1.02]" style={{ background: 'rgba(20,24,41,0.8)' }}>
            <div className="text-3xl mb-4">⚖️</div>
            <div className="font-black text-white text-xl mb-2 tracking-tight">Reparto equitativo</div>
            <div className="text-white/45 text-sm leading-relaxed mb-4">
              Los 12 grupos se distribuyen entre todos por igual.
              {remainder === 0 ? (
                <span className="block mt-2 text-emerald-400/80">Tocan exactamente <strong>{base}</strong> grupo{base > 1 ? 's' : ''} por persona.</span>
              ) : (
                <span className="block mt-2 text-sky-400/80">
                  <strong>{remainder}</strong> persona{remainder > 1 ? 's' : ''} recibirán <strong>{base + 1}</strong> grupos y el resto <strong>{base}</strong>. El sorteo decide quién.
                </span>
              )}
            </div>
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#D4AF37' }}>SELECCIONAR →</div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Preview ─── */
function PreviewScreen({ onBeginDraw, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center p-6 pt-10" style={{ background: BG }}>
      <div className="w-full max-w-5xl">
        <button onClick={onBack} className="mb-6 text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-2">← Volver</button>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-1 tracking-tight">
            LOS <span style={{ color: '#D4AF37' }}>12 GRUPOS</span>
          </h2>
          <p className="text-white/30 text-sm tracking-wider">48 SELECCIONES · FIFA WORLD CUP 2026</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {GROUPS.map((g, i) => (
            <div key={g.letter} className="rounded-xl border border-white/10 p-3" style={{ background: 'rgba(20,24,41,0.7)', animation: `fade-slide-in 0.5s ${i * 0.05}s both` }}>
              <div className="font-black text-base mb-2" style={{ color: ACCENT_COLORS[i] }}>GRUPO {g.letter}</div>
              {g.teams.map((t, j) => (
                <div key={j} className="flex items-center gap-2 text-sm text-white/80 py-0.5">
                  <span className="text-base">{t.flag}</span><span>{t.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button onClick={onBeginDraw} className="px-10 py-4 rounded-2xl font-black text-lg tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D77A)', color: '#0B0E1A' }}>
            ⚽ INICIAR SORTEO
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Results grid ─── */
function ResultsGrid({ participants, completed, colorMap }) {
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

/* ─── Slot Stage ─── */
function SlotStage({ phase, dispName, dispGroup, current, totalLabel, doShuffle }) {
  const nameLocked = phase === 'name-locked' || phase === 'shuffling-group' || phase === 'revealed';
  const groupLocked = phase === 'revealed';

  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center py-6 px-4">
      <div className="text-xs font-bold tracking-widest mb-6 uppercase text-white/30">{totalLabel}</div>
      {phase === 'idle' ? (
        <button onClick={doShuffle}
          className="group relative px-14 py-6 rounded-2xl font-black text-xl tracking-wide transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D77A)', color: '#0B0E1A' }}>
          <span className="relative z-10">SORTEAR</span>
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ boxShadow: '0 0 30px rgba(212,175,55,0.5)' }} />
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <div className={`w-full rounded-2xl border-2 p-5 text-center transition-all duration-500 ${nameLocked ? 'border-amber-400 shadow-[0_0_30px_rgba(212,175,55,0.25)]' : 'border-white/15'}`}
            style={{ background: 'rgba(20,24,41,0.9)' }}>
            <div className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2"
              style={{ color: nameLocked ? '#D4AF37' : 'rgba(255,255,255,0.25)' }}>Participante</div>
            <div className={`text-3xl font-black transition-all duration-300 ${nameLocked ? 'text-white scale-105' : 'text-white/50'}`}>
              {dispName || '?'}
            </div>
            {nameLocked && (
              <div className="mt-1.5" style={{ animation: 'fade-slide-in 0.3s both' }}>
                <span className="text-xs font-semibold px-3 py-0.5 rounded-full" style={{ background: '#D4AF3720', color: '#D4AF37' }}>
                  ✓ Seleccionado
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className={`w-0.5 h-4 rounded transition-all duration-500 ${nameLocked ? 'bg-amber-400/50' : 'bg-white/10'}`} />
            <div className={`text-base transition-all duration-500 ${nameLocked ? 'opacity-100' : 'opacity-20'}`}>↓</div>
            <div className={`w-0.5 h-4 rounded transition-all duration-500 ${nameLocked ? 'bg-amber-400/50' : 'bg-white/10'}`} />
          </div>

          <div className={`w-full rounded-2xl border-2 p-5 transition-all duration-500 ${groupLocked ? 'border-amber-400 shadow-[0_0_40px_rgba(212,175,55,0.3)]' : phase === 'shuffling-group' ? 'border-white/20' : 'border-white/5'}`}
            style={{ background: 'rgba(20,24,41,0.9)' }}>
            <div className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2 text-center"
              style={{ color: groupLocked ? '#D4AF37' : 'rgba(255,255,255,0.25)' }}>Grupo</div>
            {dispGroup ? (
              <>
                <div className={`text-center font-black text-2xl mb-3 transition-all duration-300 ${phase === 'shuffling-group' ? 'text-white/50' : ''}`}
                  style={groupLocked ? { color: '#D4AF37' } : {}}>
                  GRUPO {dispGroup.letter}
                </div>
                <div className={`space-y-2 transition-all duration-500 ${phase === 'shuffling-group' ? 'opacity-30 blur-[3px]' : 'opacity-100 blur-0'}`}>
                  {dispGroup.teams.map((t, i) => (
                    <div key={i} className="flex items-center gap-2.5 justify-center"
                      style={groupLocked ? { animation: `fade-slide-in 0.4s ${i * 0.08}s both` } : {}}>
                      <span className="text-2xl">{t.flag}</span>
                      <span className="text-white/90 font-medium text-base">{t.name}</span>
                    </div>
                  ))}
                </div>
                {groupLocked && current && (
                  <div className="mt-4 text-center py-2 rounded-xl font-bold text-base"
                    style={{ background: `${current.color}20`, color: current.color, animation: 'fade-slide-in 0.5s 0.4s both' }}>
                    ¡{current.participant} tiene el Grupo {GROUPS[current.groupIdx].letter}!
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-28 text-white/10">
                <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Draw Header ─── */
function DrawHeader({ onReset, completed, total, title, badge }) {
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

/* ─── Draw Shell ─── */
function DrawShell({ participants, completed, phase, dispName, dispGroup, confetti, idx, total, isComplete, current, doShuffle, colorMap, onReset, title }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>
      <Confetti active={confetti} />
      <DrawHeader onReset={onReset} completed={completed} total={total} title={title} />
      {!isComplete && (
        <SlotStage
          phase={phase} dispName={dispName} dispGroup={dispGroup}
          current={current}
          totalLabel={`Sorteo ${idx + 1} de ${total}`}
          doShuffle={doShuffle}
        />
      )}
      {isComplete && (
        <div className="text-center py-8 px-4" style={{ animation: 'fade-slide-in 0.6s both' }}>
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-3xl font-black text-white mb-1">¡SORTEO COMPLETO!</h2>
          <p className="text-white/40 text-sm tracking-wider">Que gane el mejor grupo</p>
        </div>
      )}
      {completed.length > 0 && (
        <div className="flex-1 px-4 pb-8">
          <div className="max-w-5xl mx-auto">
            {!isComplete && <div className="text-xs font-semibold text-white/20 tracking-widest uppercase text-center mb-4">Resultados</div>}
            <ResultsGrid participants={participants} completed={completed} colorMap={colorMap} />
            {isComplete && (
              <div className="flex justify-center mt-8">
                <button onClick={onReset} className="px-8 py-3 rounded-xl font-bold text-sm tracking-wide border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all">
                  NUEVO SORTEO
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <GlobalStyles />
    </div>
  );
}

/* ─── DrawEqual ─── */
function DrawEqual({ participants, onReset }) {
  const colorMap = useMemo(() => {
    const m = {};
    participants.forEach((p, i) => { m[p] = ACCENT_COLORS[i % 12]; });
    return m;
  }, [participants]);

  const draws = useMemo(() => {
    // Intercala participantes (ronda robin) para evitar repeticiones seguidas.
    const slots = Array.from({ length: 12 }, (_, i) => participants[i % participants.length]);
    const sGroups = shuffle([...Array(12).keys()]);
    return slots.map((p, i) => ({ participant: p, groupIdx: sGroups[i], color: ACCENT_COLORS[i] }));
  }, [participants]);

  const slot = useSlotMachine({ participants, draws, onComplete: () => {} });

  return (
    <DrawShell
      participants={participants}
      completed={slot.completed}
      phase={slot.phase}
      dispName={slot.dispName}
      dispGroup={slot.dispGroup}
      confetti={slot.confetti}
      idx={slot.idx}
      total={12}
      isComplete={slot.isComplete}
      current={slot.current}
      doShuffle={slot.doShuffle}
      colorMap={colorMap}
      onReset={onReset}
      title="REPARTO EQUITATIVO"
    />
  );
}

/* ─── DrawOne ─── */
function DrawOne({ participants, onReset }) {
  const n = participants.length;
  const remaining = 12 - n;

  const colorMap = useMemo(() => {
    const m = {};
    participants.forEach((p, i) => { m[p] = ACCENT_COLORS[i % 12]; });
    return m;
  }, [participants]);

  // Precomputa nombres y grupos barajados una sola vez
  const baseShuffle = useMemo(() => ({
    sNames: shuffle(participants),
    sGroups: shuffle([...Array(12).keys()]),
  }), [participants]);

  const mainDraws = useMemo(() => (
    baseShuffle.sNames.map((p, i) => ({
      participant: p,
      groupIdx: baseShuffle.sGroups[i],
      color: ACCENT_COLORS[i],
    }))
  ), [baseShuffle]);

  const extraGroupSlots = useMemo(() => (
    baseShuffle.sGroups.slice(n).map((gi, i) => ({
      groupIdx: gi,
      color: ACCENT_COLORS[n + i],
    }))
  ), [baseShuffle, n]);

  const [extraDraws, setExtraDraws] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [drawPhase, setDrawPhase] = useState('main'); // main | volunteering | extras | done
  const [mainCompleted, setMainCompleted] = useState([]);
  const [extraCompleted, setExtraCompleted] = useState([]);

  const mainSlot = useSlotMachine({
    participants,
    draws: mainDraws,
    onComplete: (comp) => {
      setMainCompleted(comp);
      setDrawPhase(remaining === 0 ? 'done' : 'volunteering');
    },
  });

  const extraSlot = useSlotMachine({
    participants,
    draws: extraDraws,
    onComplete: (comp) => {
      setExtraCompleted(comp);
      setDrawPhase('done');
    },
  });

  const toggleVolunteer = useCallback((p) => {
    setVolunteers(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }, []);

  const startExtras = useCallback(() => {
    if (volunteers.length < remaining) return;
    const shuffledVols = shuffle(volunteers).slice(0, remaining);
    const assigned = extraGroupSlots.map((d, i) => ({
      ...d,
      participant: shuffledVols[i],
      color: ACCENT_COLORS[n + i],
    }));
    setExtraDraws(assigned);
    setDrawPhase('extras');
  }, [volunteers, remaining, extraGroupSlots, n]);

  const allCompleted = useMemo(() => [...mainCompleted, ...extraCompleted], [mainCompleted, extraCompleted]);

  if (drawPhase === 'volunteering') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: BG }}>
        <DrawHeader onReset={onReset} completed={mainCompleted} total={12} title="UN GRUPO POR PERSONA" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md text-center mb-8" style={{ animation: 'fade-slide-in 0.5s both' }}>
            <div className="text-4xl mb-4">🙋</div>
            <h2 className="text-2xl font-black text-white mb-2">
              {remaining === 1 ? 'Queda' : 'Quedan'} <span style={{ color: '#D4AF37' }}>{remaining} grupo{remaining > 1 ? 's' : ''}</span>
            </h2>
            <p className="text-white/45 text-sm leading-relaxed">
              ¿Quién quiere un grupo extra?<br />
              {volunteers.length < remaining
                ? <span className="text-amber-400/70">Necesita{remaining - volunteers.length > 1 ? 'n' : 's'} {remaining - volunteers.length} voluntario{remaining - volunteers.length > 1 ? 's' : ''} más</span>
                : <span className="text-emerald-400/70">¡Listo para sortear!</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {participants.map((p, i) => {
              const isVol = volunteers.includes(p);
              return (
                <button key={p} onClick={() => toggleVolunteer(p)}
                  className="px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 border-2"
                  style={{
                    background: isVol ? `${ACCENT_COLORS[i % 12]}20` : 'rgba(20,24,41,0.8)',
                    borderColor: isVol ? ACCENT_COLORS[i % 12] : 'rgba(255,255,255,0.12)',
                    color: isVol ? ACCENT_COLORS[i % 12] : 'rgba(255,255,255,0.5)',
                    boxShadow: isVol ? `0 0 16px ${ACCENT_COLORS[i % 12]}30` : 'none',
                  }}>
                  {isVol ? '✓ ' : ''}{p}
                </button>
              );
            })}
          </div>
          <button onClick={startExtras} disabled={volunteers.length < remaining}
            className="px-10 py-4 rounded-2xl font-black text-lg tracking-wide transition-all disabled:opacity-25 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D77A)', color: '#0B0E1A' }}>
            SORTEAR EXTRAS ⚽
          </button>
        </div>
        <div className="px-4 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-xs font-semibold text-white/20 tracking-widest uppercase text-center mb-4">Sorteo principal</div>
            <ResultsGrid participants={participants} completed={mainCompleted} colorMap={colorMap} />
          </div>
        </div>
        <GlobalStyles />
      </div>
    );
  }

  if (drawPhase === 'main') {
    return (
      <DrawShell
        participants={participants}
        completed={mainSlot.completed}
        phase={mainSlot.phase}
        dispName={mainSlot.dispName}
        dispGroup={mainSlot.dispGroup}
        confetti={mainSlot.confetti}
        idx={mainSlot.idx}
        total={n}
        isComplete={mainSlot.isComplete}
        current={mainSlot.current}
        doShuffle={mainSlot.doShuffle}
        colorMap={colorMap}
        onReset={onReset}
        title="UN GRUPO POR PERSONA"
      />
    );
  }

  if (drawPhase === 'extras') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: BG }}>
        <Confetti active={extraSlot.confetti} />
        <DrawHeader onReset={onReset} completed={[...mainCompleted, ...extraSlot.completed]} total={12} title="SORTEO EXTRA" badge="EXTRA" />
        <SlotStage
          phase={extraSlot.phase}
          dispName={extraSlot.dispName}
          dispGroup={extraSlot.dispGroup}
          current={extraSlot.current}
          totalLabel={`Extra ${extraSlot.idx + 1} de ${remaining}`}
          doShuffle={extraSlot.doShuffle}
        />
        <div className="flex-1 px-4 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-xs font-semibold text-white/20 tracking-widest uppercase text-center mb-4">Todos los grupos</div>
            <ResultsGrid participants={participants} completed={[...mainCompleted, ...extraSlot.completed]} colorMap={colorMap} />
          </div>
        </div>
        <GlobalStyles />
      </div>
    );
  }

  // done
  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>
      <DrawHeader onReset={onReset} completed={allCompleted} total={12} title="UN GRUPO POR PERSONA" />
      <div className="text-center py-8 px-4" style={{ animation: 'fade-slide-in 0.6s both' }}>
        <div className="text-5xl mb-3">🏆</div>
        <h2 className="text-3xl font-black text-white mb-1">¡SORTEO COMPLETO!</h2>
        <p className="text-white/40 text-sm tracking-wider">Que gane el mejor grupo</p>
      </div>
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <ResultsGrid participants={participants} completed={allCompleted} colorMap={colorMap} />
          <div className="flex justify-center mt-8">
            <button onClick={onReset} className="px-8 py-3 rounded-xl font-bold text-sm tracking-wide border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all">
              NUEVO SORTEO
            </button>
          </div>
        </div>
      </div>
      <GlobalStyles />
    </div>
  );
}

/* ─── Estilos globales ─── */
function GlobalStyles() {
  return (
    <style>{`
      @keyframes confetti-up {
        0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-110vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
      }
      @keyframes fade-slide-in {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}

/* ─── App root ─── */
export default function App() {
  const [screen, setScreen] = useState('setup'); // setup | mode | preview | draw
  const [participants, setParticipants] = useState([]);
  const [mode, setMode] = useState(null);

  const reset = useCallback(() => {
    setScreen('setup');
    setParticipants([]);
    setMode(null);
  }, []);

  if (screen === 'setup') {
    return <SetupScreen onStart={names => { setParticipants(names); setScreen('mode'); }} />;
  }
  if (screen === 'mode') {
    return <ModeScreen participants={participants} onSelect={m => { setMode(m); setScreen('preview'); }} onBack={() => setScreen('setup')} />;
  }
  if (screen === 'preview') {
    return <PreviewScreen onBeginDraw={() => setScreen('draw')} onBack={() => setScreen('mode')} />;
  }
  if (mode === 'equal') return <DrawEqual participants={participants} onReset={reset} />;
  return <DrawOne participants={participants} onReset={reset} />;
}
