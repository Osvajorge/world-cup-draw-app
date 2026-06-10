import { useState, useEffect, useRef, useCallback } from 'react';
import { GROUPS } from '../constants';
import { pick, secureInt } from '../utils/random';

const ALL_GROUP_INDICES = [...Array(12).keys()];

const tickDelay = (step, total) => {
  const t = step / total;
  return 15 + Math.pow(t, 3) * 250;
};

export function useSlotMachine({ participants, draws, onComplete, excludeGroupIndices }) {
  const [completed, setCompleted] = useState([]);
  const [phase, setPhase] = useState('idle');
  const [dispName, setDispName] = useState('');
  const [dispGroup, setDispGroup] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [revealedColor, setRevealedColor] = useState(null);

  const timeoutsRef = useRef([]);
  const mountedRef = useRef(true);
  const completedRef = useRef(completed);
  completedRef.current = completed;
  const drawsRef = useRef(draws);
  drawsRef.current = draws;
  const excludeRef = useRef(excludeGroupIndices || []);
  excludeRef.current = excludeGroupIndices || [];

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

  const idx = completed.length;
  const isComplete = idx >= draws.length;
  const current = draws[idx];

  const runShuffle = useCallback((max, pickFn, onTick, onEnd, delayFn) => {
    const step = (i) => {
      if (i >= max) return onEnd();
      onTick(pickFn());
      safeTimeout(() => step(i + 1), delayFn(i, max));
    };
    step(0);
  }, [safeTimeout]);

  const startShuffle = useCallback((drawItem) => {
    setPhase('shuffling');
    setConfetti(false);
    setDispGroup(null);
    setDispName('');
    setRevealedColor(null);

    const remaining = drawsRef.current.slice(completedRef.current.length);
    const remNames = [...new Set(remaining.map(d => d.participant))];
    const namePool = remNames.length >= 2 ? remNames : participants;

    const usedInternal = new Set(completedRef.current.map(c => c.groupIdx));
    const usedExternal = new Set(excludeRef.current);
    const remGroups = ALL_GROUP_INDICES.filter(i => !usedInternal.has(i) && !usedExternal.has(i));
    const groupPool = remGroups.length >= 2 ? remGroups : ALL_GROUP_INDICES;

    const nMax = 12 + secureInt(4);
    const gMax = nMax + 1;

    let nameDone = false;
    let groupDone = false;

    const checkBothDone = () => {
      if (!nameDone || !groupDone) return;
      setRevealedColor(drawItem.color);
      setPhase('revealed');
      const next = [...completedRef.current, drawItem];
      setCompleted(next);
      setConfetti(true);
      safeTimeout(() => {
        setConfetti(false);
        setPhase('hold');
      }, 1400);
    };

    runShuffle(nMax, () => pick(namePool), setDispName, () => {
      setDispName(drawItem.participant);
      setPhase('name-locked');
      nameDone = true;
      checkBothDone();
    }, tickDelay);

    runShuffle(gMax, () => GROUPS[pick(groupPool)], setDispGroup, () => {
      setDispGroup(GROUPS[drawItem.groupIdx]);
      groupDone = true;
      checkBothDone();
    }, tickDelay);
  }, [participants, runShuffle, safeTimeout]);

  const doShuffle = useCallback(() => {
    if (phase !== 'idle' && phase !== 'hold') return;
    if (isComplete || !current) return;
    startShuffle(current);
  }, [phase, isComplete, current, startShuffle]);

  const doNext = useCallback(() => {
    if (phase !== 'hold') return;
    setPhase('idle');
    setDispName('');
    setDispGroup(null);
    setRevealedColor(null);
    if (completedRef.current.length >= draws.length) {
      onComplete(completedRef.current);
    }
  }, [phase, draws.length, onComplete]);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    completedRef.current = [];
    setCompleted([]);
    setPhase('idle');
    setDispName('');
    setDispGroup(null);
    setConfetti(false);
    setRevealedColor(null);
  }, []);

  return { completed, phase, dispName, dispGroup, confetti, revealedColor, idx, isComplete, current, doShuffle, doNext, reset };
}
