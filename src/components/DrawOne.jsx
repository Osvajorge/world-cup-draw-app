import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { BG, ACCENT_COLORS } from '../constants';
import { shuffle } from '../utils/random';
import { useSlotMachine } from '../hooks/useSlotMachine';
import DrawShell from './DrawShell';
import DrawHeader from './DrawHeader';
import SlotStage from './SlotStage';
import ResultsGrid from './ResultsGrid';
import Confetti from './Confetti';
import GlobalStyles from './GlobalStyles';

export default function DrawOne({ participants, onReset }) {
  const n = participants.length;
  const remaining = 12 - n;

  const colorMap = useMemo(() => {
    const m = {};
    participants.forEach((p, i) => { m[p] = ACCENT_COLORS[i % 12]; });
    return m;
  }, [participants]);

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

  const [drawPhase, setDrawPhase] = useState('main');
  const [mainCompleted, setMainCompleted] = useState([]);
  const [extraResults, setExtraResults] = useState([]);
  const [currentExtraDraw, setCurrentExtraDraw] = useState([]);

  const extraResultsRef = useRef(extraResults);
  extraResultsRef.current = extraResults;

  const extraExclude = useMemo(() => [
    ...mainCompleted.map(c => c.groupIdx),
    ...extraResults.map(c => c.groupIdx),
  ], [mainCompleted, extraResults]);

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
    draws: currentExtraDraw,
    excludeGroupIndices: extraExclude,
    onComplete: (comp) => {
      const newResults = [...extraResultsRef.current, ...comp];
      setExtraResults(newResults);
      setCurrentExtraDraw([]);
      if (newResults.length >= remaining) {
        setDrawPhase('done');
      } else {
        setDrawPhase('volunteering');
      }
    },
  });

  const doShuffleRef = useRef(extraSlot.doShuffle);
  doShuffleRef.current = extraSlot.doShuffle;

  useEffect(() => {
    if (drawPhase !== 'extra-draw') return;
    const t = setTimeout(() => doShuffleRef.current(), 80);
    return () => clearTimeout(t);
  }, [drawPhase]);

  const assignExtra = useCallback((volunteer) => {
    const idx = extraResultsRef.current.length;
    if (idx >= extraGroupSlots.length) return;
    const slot = extraGroupSlots[idx];
    extraSlot.reset();
    setCurrentExtraDraw([{ ...slot, participant: volunteer }]);
    setDrawPhase('extra-draw');
  }, [extraGroupSlots, extraSlot]);

  const allCompleted = useMemo(
    () => [...mainCompleted, ...extraResults],
    [mainCompleted, extraResults]
  );

  const extrasAssigned = extraResults.length;
  const extrasRemaining = remaining - extrasAssigned;

  if (drawPhase === 'volunteering') {
    return (
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: BG }}>
        <DrawHeader onReset={onReset} completed={allCompleted} total={12} />
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center px-4 py-6">
            <div className="w-full max-w-md text-center mb-6" style={{ animation: 'fade-slide-in 0.5s both' }}>
              <div className="text-4xl mb-3">🙋</div>
              <h2 className="text-2xl font-black text-white mb-2">
                {extrasRemaining === 1 ? 'Queda' : 'Quedan'}{' '}
                <span style={{ color: '#D4AF37' }}>{extrasRemaining} grupo{extrasRemaining > 1 ? 's' : ''}</span>
              </h2>
              <p className="text-white/45 text-sm leading-relaxed">
                ¿Quién quiere un grupo extra?
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {participants.map((p, i) => (
                <button key={p} onClick={() => assignExtra(p)}
                  className="px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 border-2 hover:border-amber-400/50"
                  style={{
                    background: 'rgba(20,24,41,0.8)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: ACCENT_COLORS[i % 12],
                  }}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={() => setDrawPhase('done')}
              className="px-8 py-3 rounded-xl font-bold text-sm tracking-wide border border-white/10 text-white/40 hover:text-white/70 hover:border-white/25 transition-all">
              TERMINAR SORTEO
            </button>
            <div className="w-full max-w-5xl mt-6">
              <div className="text-xs font-semibold text-white/20 tracking-widest uppercase text-center mb-3">Resultados</div>
              <ResultsGrid participants={participants} completed={allCompleted} colorMap={colorMap} />
            </div>
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
        revealedColor={mainSlot.revealedColor}
        idx={mainSlot.idx}
        total={n}
        isComplete={mainSlot.isComplete}
        doShuffle={mainSlot.doShuffle}
        doNext={mainSlot.doNext}
        colorMap={colorMap}
        onReset={onReset}
        title="UN GRUPO POR PERSONA"
      />
    );
  }

  if (drawPhase === 'extra-draw') {
    const allSoFar = [...allCompleted, ...extraSlot.completed];
    const showStage = !(extraSlot.phase === 'idle' && extraSlot.isComplete);

    return (
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: BG }}>
        <Confetti active={extraSlot.confetti} />
        <DrawHeader onReset={onReset} completed={allSoFar} total={12} badge="EXTRA" />
        {showStage && (
          <SlotStage
            phase={extraSlot.phase}
            dispName={extraSlot.dispName}
            dispGroup={extraSlot.dispGroup}
            revealedColor={extraSlot.revealedColor}
            totalLabel={`Extra ${extrasAssigned + 1} de ${remaining}`}
            doShuffle={extraSlot.doShuffle}
            doNext={extraSlot.doNext}
            isComplete={extraSlot.isComplete}
            holdButtonLabel={extrasRemaining <= 1 ? 'VER RESULTADOS →' : 'CONTINUAR →'}
          />
        )}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-xs font-semibold text-white/20 tracking-widest uppercase text-center mb-3">Todos los grupos</div>
            <ResultsGrid participants={participants} completed={allSoFar} colorMap={colorMap} />
          </div>
        </div>
        <GlobalStyles />
      </div>
    );
  }

  // done
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: BG }}>
      <DrawHeader onReset={onReset} completed={allCompleted} total={12} />
      <div className="flex-shrink-0 text-center py-4 px-4" style={{ animation: 'fade-slide-in 0.6s both' }}>
        <div className="text-4xl mb-2">🏆</div>
        <h2 className="text-2xl font-black text-white mb-0.5">¡SORTEO COMPLETO!</h2>
        <p className="text-white/40 text-xs tracking-wider">Que gane el mejor grupo</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-5xl mx-auto">
          <ResultsGrid participants={participants} completed={allCompleted} colorMap={colorMap} />
          <div className="flex justify-center mt-6">
            <button onClick={onReset}
              className="px-8 py-3 rounded-xl font-bold text-sm tracking-wide border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all">
              NUEVO SORTEO
            </button>
          </div>
        </div>
      </div>
      <GlobalStyles />
    </div>
  );
}
