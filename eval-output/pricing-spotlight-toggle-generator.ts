/**
 * eval-output/pricing-spotlight-toggle-generator.ts
 *
 * Generator for the `pricing-spotlight-toggle` section variant.
 *
 * Paste this export into:
 *   apps/web/src/lib/sections/content-sections.ts
 *
 * Then wire it into the section-composer.ts dispatch map under the key
 * 'pricing-spotlight-toggle'.
 *
 * Design goals (distinct from existing `pricing-toggle`):
 *   - Glassmorphism cards: semi-transparent + backdrop-filter blur
 *   - Segmented-control toggle (not a pill-slider)
 *   - Radial spotlight glow behind the popular plan card
 *   - Per-card "Save $X/yr" badge that animates in/out on toggle
 *   - Counter-flip price animation (vertical slide out → slide in)
 *   - RTL-native: all logical CSS properties
 *   - Accessible: role="group", keyboard-friendly buttons, prefers-reduced-motion
 */

import type { ColorPalette, FontCombo } from '../design-presets'

// ---------------------------------------------------------------------------
// Shared helpers (already present in content-sections.ts — shown for clarity)
// ---------------------------------------------------------------------------

const fontStyle = (fonts: FontCombo, role: 'heading' | 'body') => {
  const family = role === 'heading' ? fonts.heading : fonts.body
  const weight = role === 'heading' ? fonts.headingWeight : fonts.bodyWeight
  return `font-family:'${family}',sans-serif;font-weight:${weight}`
}
const s = (css: string) => `style="${css}"`

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PricingPlan = {
  name: string
  /** Monthly price string, e.g. "$29" or "29" */
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  popular?: boolean
  /** Monthly-equivalent price when billed annually, e.g. "$23" or "23" */
  annualPrice?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip non-numeric characters and parse to float. Returns 0 on failure. */
const parsePrice = (raw: string): number => parseFloat(raw.replace(/[^0-9.]/g, '')) || 0

/**
 * Compute per-plan annual savings in whole currency units.
 * Returns null if no annualPrice provided or savings ≤ 0.
 */
const annualSavings = (plan: PricingPlan): number | null => {
  if (!plan.annualPrice) return null
  const monthly = parsePrice(plan.price)
  const annual = parsePrice(plan.annualPrice)
  const saved = Math.round((monthly - annual) * 12)
  return saved > 0 ? saved : null
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/** 9. Spotlight Glass Toggle — glassmorphism cards with segmented billing toggle */
export const generatePricingSpotlightToggle = (params: {
  title: string
  subtitle: string
  plans: PricingPlan[]
  /** Percentage shown in the toggle badge, e.g. 20 → "Save 20%" */
  savingsPercent?: number
  /** Currency symbol prepended to savings amounts, e.g. "$" */
  currency?: string
  monthlyLabel?: string
  annualLabel?: string
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const {
    title,
    subtitle,
    plans,
    savingsPercent = 20,
    currency = '$',
    monthlyLabel = 'Monthly',
    annualLabel = 'Annual',
    palette,
    fonts,
  } = params

  const colCount = Math.min(plans.length, 4)

  // ------------------------------------------------------------------
  // Card HTML
  // ------------------------------------------------------------------
  const cards = plans
    .map(plan => {
      const saved = annualSavings(plan)
      const monthlyRaw = plan.price
      const annualRaw = plan.annualPrice ?? plan.price

      const featureList = plan.features
        .map(
          f => `<li ${s(`display:flex;align-items:flex-start;gap:10px;padding:6px 0`)}>
          <svg width="16" height="16" viewBox="0 0 16 16" ${s(`flex-shrink:0;margin-top:2px`)}>
            <circle cx="8" cy="8" r="8" fill="${palette.primary}20"/>
            <path d="M5 8l2 2 4-4" stroke="${palette.primary}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem;line-height:1.5`)}>${f}</span>
        </li>`,
        )
        .join('')

      const popularBadge = plan.popular
        ? `<div ${s(
            `position:absolute;top:-13px;inset-inline-start:50%;transform:translateX(-50%);background:${palette.primary};color:#fff;${fontStyle(fonts, 'body')};font-size:0.75rem;font-weight:600;padding:4px 14px;border-radius:20px;white-space:nowrap;letter-spacing:0.5px`,
          )}>Recommended</div>`
        : ''

      // Spotlight radial gradient — only rendered for popular plan
      const spotlight = plan.popular
        ? `<div ${s(
            `position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(ellipse 80% 50% at 50% -10%,${palette.primary}28,transparent 70%);z-index:0`,
          )}></div>`
        : ''

      // Per-card savings badge (hidden until annual mode is active)
      const savingsBadge =
        saved !== null
          ? `<div class="psg-savings" ${s(
              `display:inline-flex;align-items:center;gap:4px;background:#DCFCE7;color:#15803D;${fontStyle(fonts, 'body')};font-size:0.8rem;padding:3px 10px;border-radius:20px;opacity:0;transform:translateY(-6px);transition:opacity .3s,transform .3s`,
            )}>Save ${currency}${saved}/yr</div>`
          : `<div class="psg-savings" ${s(`height:0;overflow:hidden`)}></div>`

      const cardBg = plan.popular
        ? `background:${palette.primary}14;border:1.5px solid ${palette.primary}60;box-shadow:0 0 40px ${palette.primary}18`
        : `background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1)`

      const ctaStyle = plan.popular
        ? `background:${palette.primary};color:#fff;border:none`
        : `background:transparent;color:${palette.text};border:1px solid ${palette.border}`

      return `<div class="psg-card${plan.popular ? ' psg-popular' : ''}" ${s(
        `${cardBg};border-radius:20px;padding:32px;display:flex;flex-direction:column;gap:0;position:relative;overflow:hidden;transition:transform .3s,box-shadow .3s`,
      )}>
        ${spotlight}
        ${popularBadge}
        <div ${s(`position:relative;z-index:1;display:flex;flex-direction:column;flex:1;gap:0`)}>
          <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.1rem;color:${palette.text};margin:0 0 6px`)}>${plan.name}</h3>
          <p ${s(`${fontStyle(fonts, 'body')};font-size:0.85rem;color:${palette.textMuted};margin:0 0 20px;line-height:1.5`)}>${plan.description}</p>
          <div ${s(`display:flex;align-items:baseline;gap:2px;margin-bottom:6px`)}>
            <span ${s(`${fontStyle(fonts, 'heading')};font-size:1.1rem;color:${palette.textMuted}`)}>${currency}</span>
            <span class="psg-price" data-monthly="${parsePrice(monthlyRaw)}" data-annual="${parsePrice(annualRaw)}" ${s(
              `${fontStyle(fonts, 'heading')};font-size:2.75rem;color:${palette.text};line-height:1;display:inline-block`,
            )}>${parsePrice(monthlyRaw)}</span>
            <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem;margin-inline-start:2px`)}>/mo</span>
          </div>
          <div ${s(`margin-bottom:24px;min-height:24px`)}>${savingsBadge}</div>
          <ul ${s(`list-style:none;padding:0;margin:0 0 24px;flex:1;display:flex;flex-direction:column`)}>${featureList}</ul>
          <button class="psg-cta${plan.popular ? ' psg-cta-primary' : ''}" ${s(
            `width:100%;padding:14px;border-radius:12px;${ctaStyle};${fontStyle(fonts, 'heading')};font-size:0.95rem;cursor:pointer;transition:all .3s;margin-top:auto`,
          )}>${plan.cta}</button>
        </div>
      </div>`
    })
    .join('')

  // ------------------------------------------------------------------
  // CSS
  // ------------------------------------------------------------------
  const css = `
    .psg-wrap{max-width:1100px;margin:0 auto}
    .psg-grid{display:grid;grid-template-columns:repeat(${colCount},1fr);gap:24px;align-items:stretch}
    @media(max-width:900px){.psg-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:580px){.psg-grid{grid-template-columns:1fr;max-width:400px;margin-inline:auto}}
    .psg-card:not(.psg-popular):hover{transform:translateY(-6px)}
    .psg-popular:hover{transform:translateY(-6px);box-shadow:0 0 60px ${palette.primary}28!important}
    /* Segmented toggle */
    .psg-toggle-wrap{display:flex;justify-content:center;margin-bottom:40px}
    .psg-toggle{display:inline-flex;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:4px;gap:0;position:relative}
    .psg-opt{position:relative;z-index:1;flex:1;padding:10px 22px;border:none;background:transparent;cursor:pointer;border-radius:10px;${fontStyle(fonts, 'body')};font-size:0.9rem;transition:color .25s;white-space:nowrap;display:inline-flex;align-items:center;gap:8px}
    .psg-opt-pill{position:absolute;top:4px;inset-inline-start:4px;height:calc(100% - 8px);width:calc(50% - 4px);background:${palette.primary};border-radius:10px;transition:inset-inline-start .3s cubic-bezier(.4,0,.2,1),width .3s cubic-bezier(.4,0,.2,1)}
    .psg-toggle.annual .psg-opt-pill{inset-inline-start:calc(50%)}
    .psg-save-tag{background:#16A34A;color:#fff;font-size:0.72rem;padding:2px 8px;border-radius:10px;font-weight:600}
    /* Price flip animation */
    @keyframes psgFlipOut{from{transform:translateY(0);opacity:1}to{transform:translateY(-16px);opacity:0}}
    @keyframes psgFlipIn{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
    .psg-price.flipping-out{animation:psgFlipOut .2s ease forwards}
    .psg-price.flipping-in{animation:psgFlipIn .2s ease forwards}
    /* Savings badge reveal */
    .psg-toggle.annual~*  .psg-savings,
    .psg-annual-active .psg-savings{opacity:1!important;transform:translateY(0)!important}
    /* Reduced motion */
    @media(prefers-reduced-motion:reduce){
      .psg-price.flipping-out,.psg-price.flipping-in{animation:none}
      .psg-card,.psg-popular{transition:none!important}
      .psg-opt-pill{transition:none}
      .psg-savings{transition:none!important}
    }
  `

  // ------------------------------------------------------------------
  // Inline JS (self-contained IIFE — no globals)
  // ------------------------------------------------------------------
  const js = `
(function(){
  var toggle=document.getElementById('psgToggle');
  var grid=document.getElementById('psgGrid');
  if(!toggle||!grid)return;
  var pill=toggle.querySelector('.psg-opt-pill');
  var opts=toggle.querySelectorAll('.psg-opt');
  var isAnnual=false;

  function setActive(annual){
    isAnnual=annual;
    toggle.classList.toggle('annual',annual);
    opts.forEach(function(o){
      o.style.color=o.dataset.mode===(annual?'annual':'monthly')?'#fff':'${palette.textMuted}';
    });

    // Animate prices
    grid.querySelectorAll('.psg-price').forEach(function(p){
      p.classList.remove('flipping-in');
      p.classList.add('flipping-out');
      setTimeout(function(){
        p.textContent=annual?p.dataset.annual:p.dataset.monthly;
        p.classList.remove('flipping-out');
        p.classList.add('flipping-in');
        setTimeout(function(){p.classList.remove('flipping-in')},200);
      },200);
    });

    // Reveal/hide savings badges
    grid.querySelectorAll('.psg-savings').forEach(function(b){
      b.style.opacity=annual?'1':'0';
      b.style.transform=annual?'translateY(0)':'translateY(-6px)';
    });
  }

  toggle.addEventListener('click',function(e){
    var btn=e.target.closest('[data-mode]');
    if(!btn)return;
    var mode=btn.dataset.mode;
    if((mode==='annual')===isAnnual)return;
    setActive(mode==='annual');
  });

  // Keyboard: allow arrow keys to switch tabs
  toggle.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
      e.preventDefault();
      setActive(!isAnnual);
    }
  });

  // Init label colours
  opts.forEach(function(o){
    o.style.color=o.dataset.mode==='monthly'?'#fff':'${palette.textMuted}';
  });
})();
  `

  // ------------------------------------------------------------------
  // Final HTML
  // ------------------------------------------------------------------
  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px;position:relative;overflow:hidden`)}>
  <!-- Ambient background gradient for glass effect context -->
  <div ${s(`position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 50% 0%,${palette.primary}12,transparent 60%)`)}></div>
  <style>${css}</style>
  <div class="psg-wrap">
    <div ${s(`text-align:center;margin-bottom:40px;position:relative;z-index:1`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 14px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};font-size:1.1rem;color:${palette.textMuted};margin:0;max-width:560px;margin-inline:auto`)}>${subtitle}</p>
    </div>

    <!-- Billing toggle -->
    <div class="psg-toggle-wrap">
      <div class="psg-toggle" id="psgToggle" role="group" aria-label="Billing period">
        <div class="psg-opt-pill" aria-hidden="true"></div>
        <button class="psg-opt" data-mode="monthly" aria-pressed="true">${monthlyLabel}</button>
        <button class="psg-opt" data-mode="annual" aria-pressed="false">
          ${annualLabel}
          <span class="psg-save-tag">Save ${savingsPercent}%</span>
        </button>
      </div>
    </div>

    <!-- Pricing grid -->
    <div class="psg-grid" id="psgGrid">${cards}</div>
  </div>
  <script>${js}</script>
</section>`
}
