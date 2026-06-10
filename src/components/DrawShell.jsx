import { BG } from '../constants';
import Confetti from './Confetti';
import DrawHeader from './DrawHeader';
import SlotStage from './SlotStage';
import ResultsGrid from './ResultsGrid';
import GlobalStyles from './GlobalStyles';

export default function DrawShell({
  participants, completed, phase, dispName, dispGroup, confetti,
  revealedColor, idx, total, isComplete, doShuffle, doNext, colorMap, onReset, title,
}) {
  const showStage = !(phase === 'idle' && isComplete);
  const showCompletion = phase === 'idle' && isComplete;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: BG }}>
      <Confetti active={confetti} />
      <DrawHeader onReset={onReset} completed={completed} total={total} title={title} />
      {showStage && (
        <SlotStage
          phase={phase}
          dispName={dispName}
          dispGroup={dispGroup}
          revealedColor={revealedColor}
          totalLabel={`Sorteo ${Math.min(idx + 1, total)} de ${total}`}
          doShuffle={doShuffle}
          doNext={doNext}
          isComplete={isComplete}
        />
      )}
      {showCompletion && (
        <div className="flex-shrink-0 text-center py-4 px-4" style={{ animation: 'fade-slide-in 0.6s both' }}>
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-2xl font-black text-white mb-0.5">¡SORTEO COMPLETO!</h2>
          <p className="text-white/40 text-xs tracking-wider">Que gane el mejor grupo</p>
        </div>
      )}
      {completed.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="max-w-5xl mx-auto">
            {!showCompletion && (
              <div className="text-xs font-semibold text-white/20 tracking-widest uppercase text-center mb-3">
                Resultados
              </div>
            )}
            <ResultsGrid participants={participants} completed={completed} colorMap={colorMap} />
            {showCompletion && (
              <div className="flex justify-center mt-6">
                <button onClick={onReset}
                  className="px-8 py-3 rounded-xl font-bold text-sm tracking-wide border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all">
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
