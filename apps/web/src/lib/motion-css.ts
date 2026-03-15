/**
 * Generates motion CSS for the site rebuilder.
 * All animations use transform + opacity only (GPU-accelerated).
 * Supports prefers-reduced-motion and mobile safety.
 */

import type { MotionPreset } from './motion-presets'

/**
 * Generates a complete CSS string for the given motion preset.
 * Replaces the old `.fade-in` class with a full motion system.
 */
export const generateMotionCSS = (preset: MotionPreset): string => {
  if (preset.id === 'none') {
    return `
    /* Motion: none */
    .motion-reveal { opacity: 1; }
    `
  }

  const { entrance, hover, scroll } = preset
  const dist = entrance.distance
  const dur = entrance.duration
  const ease = entrance.easing

  return `
    /* ============================================
       Motion System: ${preset.id}
       ============================================ */

    /* --- Keyframes --- */
    @keyframes motionFadeInUp {
      from { opacity: 0; transform: translateY(var(--motion-distance, ${dist}px)); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes motionFadeInLeft {
      from { opacity: 0; transform: translateX(calc(var(--motion-distance, ${dist}px) * -1)); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes motionFadeInRight {
      from { opacity: 0; transform: translateX(var(--motion-distance, ${dist}px)); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes motionScaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes motionClipReveal {
      from { clip-path: inset(100% 0 0 0); opacity: 0; }
      to { clip-path: inset(0 0 0 0); opacity: 1; }
    }
    @keyframes motionGradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes motionShine {
      0% { left: -100%; }
      100% { left: 200%; }
    }
    @keyframes motionTypewriter {
      from { width: 0; }
      to { width: 100%; }
    }
    @keyframes motionBorderGlow {
      0%, 100% { border-color: var(--motion-glow-color, currentColor); box-shadow: 0 0 5px var(--motion-glow-color, currentColor); }
      50% { border-color: transparent; box-shadow: none; }
    }

    /* --- Base reveal class --- */
    .motion-reveal {
      opacity: 0;
      transform: translateY(var(--motion-distance, ${dist}px));
      transition: none;
      will-change: opacity, transform;
    }

    .motion-reveal.visible {
      animation: motionFadeInUp var(--motion-duration, ${dur}ms) ${ease} forwards;
    }

    /* Alternate direction variants */
    .motion-reveal.motion-from-left.visible {
      animation-name: motionFadeInLeft;
    }
    .motion-reveal.motion-from-right.visible {
      animation-name: motionFadeInRight;
    }
    .motion-reveal.motion-scale.visible {
      animation-name: motionScaleIn;
    }
    .motion-reveal.motion-clip.visible {
      animation-name: motionClipReveal;
    }

    /* --- Stagger delays --- */
    ${Array.from({ length: 12 }, (_, i) => `.motion-stagger-${i + 1} { --motion-stagger-delay: ${(i + 1) * entrance.stagger}ms; }`).join('\n    ')}
    .motion-reveal[class*="motion-stagger-"].visible {
      animation-delay: var(--motion-stagger-delay, 0ms);
    }

    /* --- Hero animations --- */
    .motion-hero-title {
      opacity: 0;
      transform: translateY(${dist}px);
    }
    .motion-hero-title.visible {
      animation: motionFadeInUp ${dur + 200}ms ${ease} forwards;
    }
    .motion-hero-subtitle {
      opacity: 0;
      transform: translateY(${Math.round(dist * 0.7)}px);
    }
    .motion-hero-subtitle.visible {
      animation: motionFadeInUp ${dur}ms ${ease} ${preset.hero.subtitleDelay}ms forwards;
    }
    .motion-hero-cta {
      opacity: 0;
      transform: translateY(${Math.round(dist * 0.5)}px);
    }
    .motion-hero-cta.visible {
      animation: motionFadeInUp ${dur}ms ${ease} ${preset.hero.ctaDelay}ms forwards;
    }

    /* Typewriter hero */
    [data-hero-animation="typewriter"] .motion-hero-title.visible {
      animation: none;
      opacity: 1;
      transform: none;
    }
    .motion-typewriter-text {
      overflow: hidden;
      border-right: 3px solid currentColor;
      white-space: nowrap;
      animation: motionTypewriter ${preset.hero.ctaDelay + 500}ms steps(40, end) forwards,
                 motionTypewriterBlink 750ms step-end infinite;
      width: 0;
    }
    @keyframes motionTypewriterBlink {
      from, to { border-color: currentColor; }
      50% { border-color: transparent; }
    }

    /* Split words hero */
    .motion-split-word {
      display: inline-block;
      opacity: 0;
      transform: translateY(${dist}px);
    }
    .motion-split-word.visible {
      animation: motionFadeInUp ${dur}ms ${ease} forwards;
    }

    /* Gradient shift for hero backgrounds */
    ${preset.hero.gradientShift ? `.motion-gradient-shift { background-size: 200% 200%; animation: motionGradientShift 8s ease infinite; }` : ''}

    /* --- Hover effects --- */
    ${hover.cards !== 'none' ? generateHoverCSS('card', hover.cards, hover.duration, preset) : ''}
    ${hover.buttons !== 'none' ? generateHoverCSS('button', hover.buttons, hover.duration, preset) : ''}
    ${hover.images !== 'none' ? generateHoverCSS('image', hover.images, hover.duration, preset) : ''}

    /* Shine overlay for images */
    .motion-hover-shine {
      position: relative;
      overflow: hidden;
    }
    .motion-hover-shine::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: none;
      pointer-events: none;
    }
    .motion-hover-shine:hover::after {
      animation: motionShine 600ms ease forwards;
    }

    /* --- Sticky header --- */
    ${scroll.stickyHeader ? `
    nav {
      transition: all 300ms ease;
    }
    nav.header-scrolled {
      ${scroll.headerShadow ? 'box-shadow: 0 4px 20px rgba(0,0,0,0.08);' : ''}
      ${scroll.headerBlur ? 'backdrop-filter: blur(12px);' : ''}
      ${scroll.headerShrink ? `
      padding-top: 0;
      padding-bottom: 0;
      ` : ''}
    }
    nav.header-scrolled .flex.items-center.justify-between {
      ${scroll.headerShrink ? 'height: 3.5rem;' : ''}
    }
    ` : ''}

    /* --- Animated counters --- */
    .motion-counter {
      font-variant-numeric: tabular-nums;
    }

    /* --- Parallax containers --- */
    [data-parallax-speed] {
      will-change: transform;
    }

    /* --- Reduced motion --- */
    @media (prefers-reduced-motion: reduce) {
      .motion-reveal,
      .motion-hero-title,
      .motion-hero-subtitle,
      .motion-hero-cta,
      .motion-split-word {
        opacity: 1 !important;
        transform: none !important;
        animation: none !important;
        transition: none !important;
      }
      .motion-typewriter-text {
        width: 100% !important;
        border-right: none !important;
        animation: none !important;
      }
      [data-parallax-speed] {
        transform: none !important;
      }
      .motion-gradient-shift {
        animation: none !important;
      }
    }

    /* --- Mobile safety --- */
    @media (max-width: 768px) {
      .motion-reveal {
        --motion-distance: ${Math.round(dist / 2)}px;
      }
      .motion-hero-title {
        transform: translateY(${Math.round(dist / 2)}px);
      }
      [data-parallax-speed] {
        transform: none !important;
      }
      .motion-hover-shine::after {
        display: none;
      }
    }
  `
}

/**
 * Generates hover CSS for a specific element type.
 */
const generateHoverCSS = (
  element: string,
  effect: string,
  duration: number,
  preset: MotionPreset,
): string => {
  const cls = `.motion-hover-${element}`

  switch (effect) {
    case 'lift':
      return `
    ${cls} { transition: transform ${duration}ms ease, box-shadow ${duration}ms ease; }
    ${cls}:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }`

    case 'glow':
      return `
    ${cls} { transition: box-shadow ${duration}ms ease; }
    ${cls}:hover { box-shadow: 0 0 20px var(--motion-glow-color, rgba(99,102,241,0.3)); }`

    case 'tilt':
      return `
    ${cls} { transition: transform ${duration}ms ease; perspective: 800px; }
    ${cls}[data-motion-tilt] { transform-style: preserve-3d; }`

    case 'shine':
      return `
    ${cls} { position: relative; overflow: hidden; }
    ${cls}::after {
      content: '';
      position: absolute;
      top: 0; left: -100%; width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
      pointer-events: none;
    }
    ${cls}:hover::after { animation: motionShine 600ms ease forwards; }`

    case 'border-glow':
      return `
    ${cls} { transition: border-color ${duration}ms ease, box-shadow ${duration}ms ease; border: 1px solid transparent; }
    ${cls}:hover { border-color: var(--motion-glow-color, rgba(99,102,241,0.5)); box-shadow: 0 0 15px var(--motion-glow-color, rgba(99,102,241,0.15)); }`

    default:
      return ''
  }
}
