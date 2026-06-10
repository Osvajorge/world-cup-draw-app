export default function SlotStage({ phase, dispName, dispGroup, revealedColor, totalLabel, doShuffle, doNext, isComplete, holdButtonLabel }) {
  const active = phase !== 'idle';
  const nameLocked = phase === 'name-locked' || phase === 'revealed' || phase === 'hold';
  const groupLocked = phase === 'revealed' || phase === 'hold';
  const groupSpinning = phase === 'shuffling' || phase === 'name-locked';
  const isHold = phase === 'hold';

  return (
    <div className="flex-shrink-0 flex flex-col items-center py-2 px-4">
      {phase !== 'hold' && phase !== 'revealed' && (
        <div className="text-xs font-bold tracking-widest mb-2 uppercase text-white/30">{totalLabel}</div>
      )}
      {!active ? (
        <button onClick={doShuffle}
          className="group relative px-14 py-5 rounded-2xl font-black text-xl tracking-wide transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D77A)', color: '#0B0E1A' }}>
          <span className="relative z-10">SORTEAR</span>
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ boxShadow: '0 0 30px rgba(212,175,55,0.5)' }} />
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full max-w-2xl">
          <div className="flex items-stretch gap-3 w-full">
            <div className={`flex-1 rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all duration-300 ${nameLocked ? 'border-amber-400 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/15'}`}
              style={{ background: 'rgba(20,24,41,0.9)' }}>
              <div className="text-[10px] font-bold tracking-[0.25em] uppercase mb-1"
                style={{ color: nameLocked ? '#D4AF37' : 'rgba(255,255,255,0.25)' }}>Participante</div>
              <div className={`text-2xl font-black transition-all duration-200 ${nameLocked ? 'text-white' : 'text-white/50'}`}>
                {dispName || '?'}
              </div>
              {nameLocked && (
                <div className="mt-1" style={{ animation: 'fade-slide-in 0.3s both' }}>
                  <span className="text-xs font-semibold px-3 py-0.5 rounded-full"
                    style={{ background: '#D4AF3720', color: '#D4AF37' }}>
                    ✓ Seleccionado
                  </span>
                </div>
              )}
            </div>

            <div className={`flex items-center transition-all duration-300 ${nameLocked ? 'text-amber-400/60' : 'text-white/10'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>

            <div className={`flex-1 rounded-xl border-2 p-3 transition-all duration-300 ${groupLocked ? 'border-amber-400 shadow-[0_0_30px_rgba(212,175,55,0.25)]' : groupSpinning ? 'border-white/20' : 'border-white/5'}`}
              style={{ background: 'rgba(20,24,41,0.9)', minHeight: '140px' }}>
              <div className="text-[10px] font-bold tracking-[0.25em] uppercase mb-1 text-center"
                style={{ color: groupLocked ? '#D4AF37' : 'rgba(255,255,255,0.25)' }}>Grupo</div>
              {dispGroup ? (
                <>
                  <div className={`text-center font-black text-lg mb-1.5 transition-all duration-200 ${groupSpinning ? 'text-white/50' : ''}`}
                    style={groupLocked ? { color: '#D4AF37' } : {}}>
                    GRUPO {dispGroup.letter}
                  </div>
                  <div className={`space-y-0.5 transition-all duration-300 ${groupSpinning ? 'opacity-30 blur-[2px]' : 'opacity-100 blur-0'}`}>
                    {dispGroup.teams.map((t, i) => (
                      <div key={i} className="flex items-center gap-1.5 justify-center"
                        style={groupLocked ? { animation: `fade-slide-in 0.3s ${i * 0.06}s both` } : {}}>
                        <span className="text-base">{t.flag}</span>
                        <span className="text-white/90 font-medium text-xs">{t.name}</span>
                      </div>
                    ))}
                  </div>
                  {groupLocked && dispName && (
                    <div className="mt-2 text-center py-1 rounded-lg font-bold text-xs"
                      style={{ background: `${revealedColor}20`, color: revealedColor, animation: 'fade-slide-in 0.4s 0.3s both' }}>
                      ¡{dispName} tiene el Grupo {dispGroup.letter}!
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-[100px] text-white/10">
                  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {isHold && (
            <button onClick={isComplete ? doNext : doShuffle}
              className="mt-1 group relative px-10 py-3 rounded-2xl font-black text-lg tracking-wide transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D77A)', color: '#0B0E1A' }}>
              {holdButtonLabel || (isComplete ? 'VER RESULTADOS →' : 'SORTEAR SIGUIENTE →')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
