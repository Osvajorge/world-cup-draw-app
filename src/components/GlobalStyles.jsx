export default function GlobalStyles() {
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
