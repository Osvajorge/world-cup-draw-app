import { useMemo } from 'react';
import { ACCENT_COLORS } from '../constants';
import { shuffle } from '../utils/random';
import { useSlotMachine } from '../hooks/useSlotMachine';
import DrawShell from './DrawShell';

export default function DrawEqual({ participants, onReset }) {
  const colorMap = useMemo(() => {
    const m = {};
    participants.forEach((p, i) => { m[p] = ACCENT_COLORS[i % 12]; });
    return m;
  }, [participants]);

  const draws = useMemo(() => {
    const expanded = Array.from({ length: 12 }, (_, i) => participants[i % participants.length]);
    const sNames = shuffle(expanded);
    const sGroups = shuffle([...Array(12).keys()]);
    return sNames.map((p, i) => ({ participant: p, groupIdx: sGroups[i], color: ACCENT_COLORS[i] }));
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
      revealedColor={slot.revealedColor}
      idx={slot.idx}
      total={12}
      isComplete={slot.isComplete}
      doShuffle={slot.doShuffle}
      doNext={slot.doNext}
      colorMap={colorMap}
      onReset={onReset}
      title="REPARTO EQUITATIVO"
    />
  );
}
