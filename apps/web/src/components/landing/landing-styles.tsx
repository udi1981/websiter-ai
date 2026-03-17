export const LandingStyles = () => (
  <style>{`
    /* ===== SCROLL REVEAL SYSTEM ===== */
    .reveal {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reveal.revealed { opacity: 1; transform: translateY(0); }
    .reveal.from-left { transform: translateX(-60px) translateY(0); }
    .reveal.from-left.revealed { transform: translateX(0) translateY(0); }
    .reveal.from-right { transform: translateX(60px) translateY(0); }
    .reveal.from-right.revealed { transform: translateX(0) translateY(0); }
    .reveal.scale-in { transform: scale(0.85); }
    .reveal.scale-in.revealed { transform: scale(1); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }
    .reveal-delay-5 { transition-delay: 0.5s; }
    .reveal-delay-6 { transition-delay: 0.6s; }
    .reveal-delay-7 { transition-delay: 0.7s; }

    /* ===== KEYFRAMES ===== */
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-20px) rotate(1deg); }
      66% { transform: translateY(10px) rotate(-1deg); }
    }
    @keyframes float-slow {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-30px); }
    }
    @keyframes glow {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
    @keyframes glow-border {
      0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
      50% { box-shadow: 0 0 40px rgba(124, 58, 237, 0.6), 0 0 60px rgba(6, 182, 212, 0.2); }
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes score-fill {
      from { stroke-dashoffset: 251; }
      to { stroke-dashoffset: 62; }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes typing-cursor {
      0%, 100% { border-color: transparent; }
      50% { border-color: #7C3AED; }
    }
    @keyframes slide-in-demo {
      0% { opacity: 0; transform: translateY(20px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes progress-fill {
      0% { width: 0%; }
      60% { width: 75%; }
      100% { width: 100%; }
    }
    @keyframes morph-blob {
      0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
      25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
      50% { border-radius: 50% 60% 30% 60% / 40% 70% 50% 60%; }
      75% { border-radius: 60% 30% 50% 40% / 70% 40% 60% 30%; }
    }

    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
    .animate-float-delay { animation: float 6s ease-in-out 2s infinite; }
    .animate-glow { animation: glow 3s ease-in-out infinite; }
    .animate-glow-border { animation: glow-border 3s ease-in-out infinite; }
    .animate-marquee { animation: marquee 30s linear infinite; }
    .animate-shimmer { animation: shimmer 3s linear infinite; background-size: 200% 100%; }
    .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
    .animate-score { animation: score-fill 2s ease-out forwards; }
    .animate-spin-slow { animation: spin-slow 20s linear infinite; }
    .animate-gradient { animation: gradient-shift 6s ease infinite; background-size: 200% 200%; }
    .animate-morph { animation: morph-blob 8s ease-in-out infinite; }
    .animate-typing-cursor { border-right: 2px solid; animation: typing-cursor 1s step-end infinite; }

    /* ===== HERO ENTRANCE (CSS-only, no JS dependency) ===== */
    @keyframes hero-enter {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .hero-enter { opacity: 0; animation: hero-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .hero-enter-1 { animation-delay: 0.1s; }
    .hero-enter-2 { animation-delay: 0.2s; }
    .hero-enter-3 { animation-delay: 0.3s; }
    .hero-enter-4 { animation-delay: 0.4s; }
    .hero-enter-5 { animation-delay: 0.5s; }

    /* ===== HOVER EFFECTS ===== */
    .hover-lift { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease; }
    .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(124, 58, 237, 0.15); }
    .hover-glow:hover { box-shadow: 0 0 30px rgba(124, 58, 237, 0.2), 0 0 60px rgba(124, 58, 237, 0.1); }
    .hover-scale { transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .hover-scale:hover { transform: scale(1.03); }

    /* ===== MISC ===== */
    details summary::-webkit-details-marker { display: none; }
    details summary::marker { display: none; content: ''; }
    details[open] summary .faq-chevron { transform: rotate(180deg); }
    details[open] .faq-content { animation: slide-in-demo 0.3s ease-out; }

    /* ===== DEMO ANIMATION ===== */
    .demo-screen { animation: slide-in-demo 0.8s ease-out forwards; }
    .demo-progress { animation: progress-fill 3s ease-out forwards; }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .reveal { opacity: 1; transform: none; transition: none; }
      .hero-enter { opacity: 1; transform: none; animation: none; }
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
  `}</style>
)
