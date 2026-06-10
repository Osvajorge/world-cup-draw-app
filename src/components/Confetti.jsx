import { useMemo } from 'react';
import { ACCENT_COLORS } from '../constants';
import { secureRandom, secureInt } from '../utils/random';

export default function Confetti({ active }) {
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
      rot: secureRandom() * 360,
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
          transform: `rotate(${p.rot}deg)`,
          animation: `confetti-up ${p.duration}s ${p.delay}s ease-out forwards`,
          '--drift': `${p.drift}px`,
        }} />
      ))}
    </div>
  );
}
