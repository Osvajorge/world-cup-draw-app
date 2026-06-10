import { BG } from '../constants';

export default function ModeScreen({ participants, onSelect, onBack }) {
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
