/**
 * Premium Hero & Navbar Section Generators
 *
 * Generates raw HTML strings for premium website sections.
 * These run inside iframes for generated websites — NOT React components.
 * Quality target: $50K custom-built sites (Apple, Stripe, Linear, Airbnb).
 *
 * Uses CSS classes from section-effects.ts:
 *   motion-reveal, parallax-float, tilt-card, glow-card, shimmer-btn,
 *   counter-value, gradient-mesh, noise-overlay, typewriter-cursor, marquee-track
 */

import type { ColorPalette, FontCombo } from '../design-presets'
import { floatingOrbs, particlesCanvas, shootingStars, gridPattern, waveCanvas, auroraGradient } from '../background-effects'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const fontStyle = (fonts: FontCombo, role: 'heading' | 'body') => {
  const family = role === 'heading' ? fonts.heading : fonts.body
  const weight = role === 'heading' ? fonts.headingWeight : fonts.bodyWeight
  return `font-family:'${family}',sans-serif;font-weight:${weight}`
}

const s = (css: string) => `style="${css}"`

const imgSrc = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=80'
  if (url.startsWith('data:')) return url  // AI-generated base64 image
  return `${url}${url.includes('?') ? '&' : '?'}w=1600&q=80`
}

type HeroParams = {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  imageUrl?: string
  badge?: string
  stats?: { value: string; label: string }[]
  items?: { icon: string; title: string; description: string }[]
  palette: ColorPalette
  fonts: FontCombo
}

type NavParams = {
  brand: string
  links: { label: string; href: string }[]
  ctaText?: string
  ctaLink?: string
  palette: ColorPalette
  fonts: FontCombo
}

/* ------------------------------------------------------------------ */
/*  NAVBAR 1 — Transparent → Solid on Scroll                         */
/* ------------------------------------------------------------------ */

export const generateNavbarTransparent = (p: NavParams): string => {
  const { brand, links, ctaText, ctaLink, palette: c, fonts: f } = p
  return `<nav class="motion-reveal" ${s(`position:fixed;top:0;left:0;right:0;z-index:1000;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;transition:background 0.4s,box-shadow 0.4s,backdrop-filter 0.4s;background:transparent`)} id="nav-transparent" aria-label="Main navigation">
  <a href="/" ${s(`${fontStyle(f, 'heading')};font-size:1.5rem;color:${c.text};text-decoration:none;letter-spacing:-0.02em`)}>${brand}</a>
  <div ${s(`display:flex;align-items:center;gap:2rem`)} class="nav-links-desktop">
    ${links.map(l => `<a href="${l.href}" ${s(`${fontStyle(f, 'body')};font-size:0.925rem;color:${c.textMuted};text-decoration:none;position:relative;padding-bottom:2px;transition:color 0.3s`)} onmouseenter="this.style.color='${c.primary}'" onmouseleave="this.style.color='${c.textMuted}'">${l.label}<span ${s(`position:absolute;bottom:0;left:0;width:0;height:2px;background:${c.primary};transition:width 0.3s ease`)} class="nav-underline"></span></a>`).join('\n    ')}
    ${ctaText ? `<a href="${ctaLink || '#'}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:0.875rem;padding:0.6rem 1.5rem;background:${c.primary};color:#fff;border-radius:8px;text-decoration:none;transition:background 0.3s`)}>${ctaText}</a>` : ''}
  </div>
  <button ${s(`display:none;background:none;border:none;cursor:pointer;padding:0.5rem`)} class="nav-hamburger" aria-label="Toggle menu" onclick="document.getElementById('mobile-menu-transparent').classList.toggle('mobile-open')">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${c.text}" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  </button>
</nav>
<div id="mobile-menu-transparent" ${s(`position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;background:${c.background};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;transform:translateY(-100%);transition:transform 0.4s ease;padding:2rem`)}>
  ${links.map(l => `<a href="${l.href}" ${s(`${fontStyle(f, 'heading')};font-size:1.5rem;color:${c.text};text-decoration:none`)}>${l.label}</a>`).join('\n  ')}
  ${ctaText ? `<a href="${ctaLink || '#'}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.75rem 2rem;background:${c.primary};color:#fff;border-radius:8px;text-decoration:none;margin-top:1rem`)}>${ctaText}</a>` : ''}
</div>
<style>
  #nav-transparent.nav-scrolled { background:${c.background}ee; backdrop-filter:blur(12px); box-shadow:0 1px 3px rgba(0,0,0,0.08); }
  .nav-links-desktop a:hover .nav-underline { width:100%; }
  .mobile-open { transform:translateY(0) !important; }
  @media (max-width:768px) {
    .nav-links-desktop { display:none !important; }
    .nav-hamburger { display:block !important; }
  }
</style>
<script>
(function(){
  var nav=document.getElementById('nav-transparent');
  if(!nav)return;
  window.addEventListener('scroll',function(){
    nav.classList.toggle('nav-scrolled',window.scrollY>40);
  },{passive:true});
})();
</script>`
}

/* ------------------------------------------------------------------ */
/*  NAVBAR 2 — Floating Pill                                         */
/* ------------------------------------------------------------------ */

export const generateNavbarFloating = (p: NavParams): string => {
  const { brand, links, ctaText, ctaLink, palette: c, fonts: f } = p
  const half = Math.ceil(links.length / 2)
  const left = links.slice(0, half)
  const right = links.slice(half)
  return `<nav class="motion-reveal" ${s(`position:fixed;top:1rem;left:50%;transform:translateX(-50%);z-index:1000;display:flex;align-items:center;gap:1.5rem;padding:0.6rem 2rem;background:${c.background}dd;backdrop-filter:blur(16px);border-radius:9999px;border:1px solid ${c.border};box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:90vw`)} aria-label="Main navigation">
  <div ${s(`display:flex;align-items:center;gap:1.25rem`)}>
    ${left.map(l => `<a href="${l.href}" ${s(`${fontStyle(f, 'body')};font-size:0.85rem;color:${c.textMuted};text-decoration:none;transition:color 0.3s;white-space:nowrap`)} onmouseenter="this.style.color='${c.primary}'" onmouseleave="this.style.color='${c.textMuted}'">${l.label}</a>`).join('')}
  </div>
  <a href="/" ${s(`${fontStyle(f, 'heading')};font-size:1.25rem;color:${c.text};text-decoration:none;letter-spacing:-0.02em;padding:0 0.75rem;white-space:nowrap`)}>${brand}</a>
  <div ${s(`display:flex;align-items:center;gap:1.25rem`)}>
    ${right.map(l => `<a href="${l.href}" ${s(`${fontStyle(f, 'body')};font-size:0.85rem;color:${c.textMuted};text-decoration:none;transition:color 0.3s;white-space:nowrap`)} onmouseenter="this.style.color='${c.primary}'" onmouseleave="this.style.color='${c.textMuted}'">${l.label}</a>`).join('')}
    ${ctaText ? `<a href="${ctaLink || '#'}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:0.8rem;padding:0.45rem 1.2rem;background:${c.primary};color:#fff;border-radius:9999px;text-decoration:none`)}>${ctaText}</a>` : ''}
  </div>
</nav>`
}

/* ------------------------------------------------------------------ */
/*  NAVBAR 3 — Minimal                                               */
/* ------------------------------------------------------------------ */

export const generateNavbarMinimal = (p: NavParams): string => {
  const { brand, links, ctaText, ctaLink, palette: c, fonts: f } = p
  return `<nav class="motion-reveal" ${s(`display:flex;align-items:center;justify-content:space-between;padding:1.25rem 2rem;max-width:1200px;margin:0 auto;background:${c.background}`)} aria-label="Main navigation">
  <a href="/" ${s(`${fontStyle(f, 'heading')};font-size:1.35rem;color:${c.text};text-decoration:none;letter-spacing:-0.02em`)}>${brand}</a>
  <div ${s(`display:flex;align-items:center;gap:2.5rem`)}>
    ${links.slice(0, 3).map(l => `<a href="${l.href}" ${s(`${fontStyle(f, 'body')};font-size:0.9rem;color:${c.textMuted};text-decoration:none;transition:color 0.3s`)} onmouseenter="this.style.color='${c.text}'" onmouseleave="this.style.color='${c.textMuted}'">${l.label}</a>`).join('\n    ')}
  </div>
  ${ctaText ? `<a href="${ctaLink || '#'}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:0.875rem;padding:0.55rem 1.4rem;background:${c.primary};color:#fff;border-radius:8px;text-decoration:none`)}>${ctaText}</a>` : '<div></div>'}
</nav>`
}

/* ------------------------------------------------------------------ */
/*  NAVBAR 4 — Split (Logo left, Nav center, CTA right)              */
/* ------------------------------------------------------------------ */

export const generateNavbarSplit = (p: NavParams): string => {
  const { brand, links, ctaText, ctaLink, palette: c, fonts: f } = p
  return `<nav class="motion-reveal" ${s(`display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:1rem 2rem;max-width:1280px;margin:0 auto;background:${c.background}`)} aria-label="Main navigation">
  <a href="/" ${s(`${fontStyle(f, 'heading')};font-size:1.35rem;color:${c.text};text-decoration:none;letter-spacing:-0.02em`)}>${brand}</a>
  <div ${s(`display:flex;align-items:center;gap:2rem`)}>
    ${links.map(l => `<a href="${l.href}" ${s(`${fontStyle(f, 'body')};font-size:0.9rem;color:${c.textMuted};text-decoration:none;transition:color 0.3s`)} onmouseenter="this.style.color='${c.primary}'" onmouseleave="this.style.color='${c.textMuted}'">${l.label}</a>`).join('\n    ')}
  </div>
  <div ${s(`display:flex;justify-content:flex-end`)}>
    ${ctaText ? `<a href="${ctaLink || '#'}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:0.875rem;padding:0.55rem 1.4rem;background:${c.primary};color:#fff;border-radius:8px;text-decoration:none`)}>${ctaText}</a>` : ''}
  </div>
</nav>`
}

/* ------------------------------------------------------------------ */
/*  NAVBAR 5 — Mega Menu                                             */
/* ------------------------------------------------------------------ */

export const generateNavbarMegaMenu = (p: NavParams & { megaItems?: { category: string; items: { icon: string; title: string; desc: string; href: string }[] }[] }): string => {
  const { brand, links, ctaText, ctaLink, palette: c, fonts: f, megaItems } = p
  const megas = megaItems || []
  return `<nav class="motion-reveal" ${s(`position:relative;display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;max-width:1280px;margin:0 auto;background:${c.background}`)} aria-label="Main navigation">
  <a href="/" ${s(`${fontStyle(f, 'heading')};font-size:1.35rem;color:${c.text};text-decoration:none;letter-spacing:-0.02em`)}>${brand}</a>
  <div ${s(`display:flex;align-items:center;gap:2rem`)}>
    ${links.map((l, i) => {
      const mega = megas[i]
      if (!mega) return `<a href="${l.href}" ${s(`${fontStyle(f, 'body')};font-size:0.9rem;color:${c.textMuted};text-decoration:none;transition:color 0.3s`)}>${l.label}</a>`
      return `<div class="mega-trigger" ${s(`position:relative`)}>
        <button ${s(`${fontStyle(f, 'body')};font-size:0.9rem;color:${c.textMuted};background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:0.3rem;padding:0;transition:color 0.3s`)}>${l.label}<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5l3 3 3-3"/></svg></button>
        <div class="mega-dropdown" ${s(`position:absolute;top:calc(100% + 0.75rem);left:50%;transform:translateX(-50%) translateY(8px);opacity:0;pointer-events:none;transition:opacity 0.3s,transform 0.3s;background:${c.background};border:1px solid ${c.border};border-radius:12px;padding:1.5rem;min-width:480px;box-shadow:0 20px 60px rgba(0,0,0,0.12);display:grid;grid-template-columns:repeat(${Math.min(mega.items.length, 3)},1fr);gap:1rem;z-index:100`)}>
          ${mega.items.map(it => `<a href="${it.href}" ${s(`display:flex;gap:0.75rem;padding:0.75rem;border-radius:8px;text-decoration:none;transition:background 0.2s`)} onmouseenter="this.style.background='${c.backgroundAlt}'" onmouseleave="this.style.background='transparent'">
            <span ${s(`font-size:1.5rem;line-height:1`)}>${it.icon}</span>
            <div>
              <div ${s(`${fontStyle(f, 'body')};font-size:0.875rem;color:${c.text};font-weight:600`)}>${it.title}</div>
              <div ${s(`${fontStyle(f, 'body')};font-size:0.75rem;color:${c.textMuted};margin-top:0.2rem`)}>${it.desc}</div>
            </div>
          </a>`).join('')}
        </div>
      </div>`
    }).join('\n    ')}
    ${ctaText ? `<a href="${ctaLink || '#'}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:0.875rem;padding:0.55rem 1.4rem;background:${c.primary};color:#fff;border-radius:8px;text-decoration:none`)}>${ctaText}</a>` : ''}
  </div>
</nav>
<style>
  .mega-trigger:hover .mega-dropdown { opacity:1; pointer-events:auto; transform:translateX(-50%) translateY(0); }
  .mega-trigger:hover button { color:${c.primary}; }
</style>`
}

/* ------------------------------------------------------------------ */
/*  NAVBAR 6 — Hamburger Fullscreen                                  */
/* ------------------------------------------------------------------ */

export const generateNavbarHamburger = (p: NavParams): string => {
  const { brand, links, ctaText, ctaLink, palette: c, fonts: f } = p
  return `<nav class="motion-reveal" ${s(`display:flex;align-items:center;justify-content:space-between;padding:1.25rem 2rem;position:fixed;top:0;left:0;right:0;z-index:1000;background:transparent`)} aria-label="Main navigation">
  <a href="/" ${s(`${fontStyle(f, 'heading')};font-size:1.35rem;color:${c.text};text-decoration:none;letter-spacing:-0.02em;z-index:1001`)}>${brand}</a>
  <button id="fullscreen-hamburger-btn" ${s(`background:none;border:none;cursor:pointer;z-index:1001;padding:0.5rem`)} aria-label="Open menu" onclick="document.getElementById('fullscreen-overlay').classList.toggle('fs-open')">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${c.text}" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
  </button>
</nav>
<div id="fullscreen-overlay" ${s(`position:fixed;inset:0;z-index:1000;background:${c.background};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.5rem;opacity:0;pointer-events:none;transition:opacity 0.5s ease`)}>
  ${links.map((l, i) => `<a href="${l.href}" ${s(`${fontStyle(f, 'heading')};font-size:clamp(2rem,5vw,3.5rem);color:${c.text};text-decoration:none;opacity:0;transform:translateY(20px);transition:opacity 0.4s ease ${0.1 + i * 0.08}s,transform 0.4s ease ${0.1 + i * 0.08}s,color 0.3s`)} class="fs-link" onmouseenter="this.style.color='${c.primary}'" onmouseleave="this.style.color='${c.text}'">${l.label}</a>`).join('\n  ')}
  ${ctaText ? `<a href="${ctaLink || '#'}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:1.1rem;padding:0.9rem 2.5rem;background:${c.primary};color:#fff;border-radius:8px;text-decoration:none;margin-top:1rem;opacity:0;transform:translateY(20px);transition:opacity 0.4s ease ${0.1 + links.length * 0.08}s,transform 0.4s ease ${0.1 + links.length * 0.08}s`)} class="fs-link">${ctaText}</a>` : ''}
</div>
<style>
  .fs-open { opacity:1 !important; pointer-events:auto !important; }
  .fs-open .fs-link { opacity:1 !important; transform:translateY(0) !important; }
</style>`
}

/* ------------------------------------------------------------------ */
/*  NAVBAR 7 — Sidebar (Vertical)                                    */
/* ------------------------------------------------------------------ */

export const generateNavbarSidebar = (p: NavParams): string => {
  const { brand, links, ctaText, ctaLink, palette: c, fonts: f } = p
  return `<nav class="motion-reveal" ${s(`position:fixed;top:0;left:0;bottom:0;width:240px;z-index:1000;background:${c.background};border-right:1px solid ${c.border};display:flex;flex-direction:column;padding:2rem 1.5rem;gap:0.5rem`)} aria-label="Main navigation">
  <a href="/" ${s(`${fontStyle(f, 'heading')};font-size:1.3rem;color:${c.text};text-decoration:none;letter-spacing:-0.02em;margin-bottom:2rem`)}>${brand}</a>
  ${links.map(l => `<a href="${l.href}" ${s(`${fontStyle(f, 'body')};font-size:0.9rem;color:${c.textMuted};text-decoration:none;padding:0.6rem 0.75rem;border-radius:8px;transition:background 0.2s,color 0.2s`)} onmouseenter="this.style.background='${c.backgroundAlt}';this.style.color='${c.text}'" onmouseleave="this.style.background='transparent';this.style.color='${c.textMuted}'">${l.label}</a>`).join('\n  ')}
  <div ${s(`flex:1`)}></div>
  ${ctaText ? `<a href="${ctaLink || '#'}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:0.875rem;padding:0.65rem 1rem;background:${c.primary};color:#fff;border-radius:8px;text-decoration:none;text-align:center`)}>${ctaText}</a>` : ''}
</nav>`
}

/* ------------------------------------------------------------------ */
/*  NAVBAR 8 — Command Palette                                       */
/* ------------------------------------------------------------------ */

export const generateNavbarCommand = (p: NavParams): string => {
  const { brand, links, ctaText, ctaLink, palette: c, fonts: f } = p
  return `<nav class="motion-reveal" ${s(`display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;max-width:1280px;margin:0 auto;background:${c.background}`)} aria-label="Main navigation">
  <a href="/" ${s(`${fontStyle(f, 'heading')};font-size:1.35rem;color:${c.text};text-decoration:none;letter-spacing:-0.02em`)}>${brand}</a>
  <div ${s(`display:flex;align-items:center;gap:2rem`)}>
    ${links.map(l => `<a href="${l.href}" ${s(`${fontStyle(f, 'body')};font-size:0.9rem;color:${c.textMuted};text-decoration:none;transition:color 0.3s`)} onmouseenter="this.style.color='${c.primary}'" onmouseleave="this.style.color='${c.textMuted}'">${l.label}</a>`).join('\n    ')}
  </div>
  <div ${s(`display:flex;align-items:center;gap:1rem`)}>
    <button ${s(`${fontStyle(f, 'body')};font-size:0.8rem;display:flex;align-items:center;gap:0.6rem;padding:0.45rem 0.9rem;background:${c.backgroundAlt};border:1px solid ${c.border};border-radius:8px;color:${c.textMuted};cursor:pointer;transition:border-color 0.3s`)} aria-label="Open search" onmouseenter="this.style.borderColor='${c.primary}'" onmouseleave="this.style.borderColor='${c.border}'">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      Search...
      <kbd ${s(`font-size:0.7rem;padding:0.15rem 0.4rem;background:${c.background};border:1px solid ${c.border};border-radius:4px;color:${c.textMuted};${fontStyle(f, 'body')}`)}>⌘K</kbd>
    </button>
    ${ctaText ? `<a href="${ctaLink || '#'}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:0.875rem;padding:0.55rem 1.4rem;background:${c.primary};color:#fff;border-radius:8px;text-decoration:none`)}>${ctaText}</a>` : ''}
  </div>
</nav>`
}


/* ================================================================== */
/*  HERO SECTIONS                                                     */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  HERO 1 — Gradient Mesh                                           */
/* ------------------------------------------------------------------ */

export const generateHeroGradientMesh = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink, palette: c, fonts: f } = p
  const bg = floatingOrbs({ c1: c.primary, c2: c.secondary, c3: c.accent })
  const stars = particlesCanvas({ color: 'rgba(255,255,255,0.4)', count: 40 })
  return `<section class="motion-reveal" ${s(`position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:6rem 2rem;background:#0B0F1A`)}>
  ${bg}${stars}
  <div ${s(`position:relative;z-index:2;text-align:center;max-width:800px`)}>
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2.5rem,6vw,5rem);line-height:1.08;letter-spacing:-0.03em;margin:0 0 1.5rem;background:linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.7) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text`)}>${title}</h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,2vw,1.25rem);color:rgba(255,255,255,0.8);line-height:1.6;margin:0 0 2.5rem;max-width:600px;margin-inline:auto`)}>${subtitle}</p>
    <div ${s(`display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap`)}>
      <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.85rem 2.25rem;background:#fff;color:${c.primary};border-radius:10px;text-decoration:none;font-weight:600;transition:transform 0.3s,box-shadow 0.3s`)} onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.2)'" onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='none'">${ctaText}</a>
      ${secondaryCtaText ? `<a href="${secondaryCtaLink || '#'}" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.85rem 2.25rem;background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:10px;text-decoration:none;transition:border-color 0.3s`)} onmouseenter="this.style.borderColor='rgba(255,255,255,0.7)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.3)'">${secondaryCtaText}</a>` : ''}
    </div>
  </div>
</section>`
}

/* ------------------------------------------------------------------ */
/*  HERO 2 — Split Image                                             */
/* ------------------------------------------------------------------ */

export const generateHeroSplitImage = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink, imageUrl, badge, palette: c, fonts: f } = p
  return `<section class="motion-reveal" ${s(`display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;min-height:90vh;padding:6rem 4rem;max-width:1280px;margin:0 auto;background:${c.background}`)}>
  <div>
    ${badge ? `<span ${s(`${fontStyle(f, 'body')};display:inline-flex;align-items:center;gap:0.4rem;font-size:0.8rem;padding:0.4rem 1rem;background:${c.backgroundAlt};color:${c.primary};border-radius:9999px;border:1px solid ${c.border};margin-bottom:1.5rem`)}>${badge}</span>` : ''}
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2rem,4.5vw,3.75rem);line-height:1.1;letter-spacing:-0.03em;color:${c.text};margin:0 0 1.5rem`)}>${title}</h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(0.95rem,1.5vw,1.15rem);color:${c.textMuted};line-height:1.7;margin:0 0 2rem;max-width:520px`)}>${subtitle}</p>
    <div ${s(`display:flex;align-items:center;gap:1rem;flex-wrap:wrap`)}>
      <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:0.95rem;padding:0.8rem 2rem;background:${c.primary};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;transition:background 0.3s,transform 0.2s`)} onmouseenter="this.style.background='${c.primaryHover}';this.style.transform='translateY(-1px)'" onmouseleave="this.style.background='${c.primary}';this.style.transform='translateY(0)'">${ctaText}</a>
      ${secondaryCtaText ? `<a href="${secondaryCtaLink || '#'}" ${s(`${fontStyle(f, 'body')};font-size:0.95rem;padding:0.8rem 2rem;background:transparent;color:${c.text};border:1px solid ${c.border};border-radius:10px;text-decoration:none;transition:border-color 0.3s`)} onmouseenter="this.style.borderColor='${c.primary}'" onmouseleave="this.style.borderColor='${c.border}'">${secondaryCtaText}</a>` : ''}
    </div>
  </div>
  <div ${s(`position:relative`)}>
    <img src="${imgSrc(imageUrl)}" alt="" loading="eager" class="parallax-float" ${s(`width:100%;height:auto;border-radius:16px;box-shadow:0 25px 60px rgba(0,0,0,0.12);object-fit:cover;aspect-ratio:4/3`)} />
    <div ${s(`position:absolute;inset:-8px;border-radius:20px;background:linear-gradient(135deg,${c.primary}22,${c.accent}22);z-index:-1`)}></div>
  </div>
</section>
<style>
  @media (max-width:768px) {
    .motion-reveal[style*="grid-template-columns:1fr 1fr"] { grid-template-columns:1fr !important; padding:4rem 1.5rem !important; gap:2.5rem !important; text-align:center; }
  }
</style>`
}

/* ------------------------------------------------------------------ */
/*  HERO 3 — Fullscreen Video Background                             */
/* ------------------------------------------------------------------ */

export const generateHeroFullscreenVideo = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, imageUrl, palette: c, fonts: f } = p
  const poster = imgSrc(imageUrl)
  return `<section class="motion-reveal" ${s(`position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden`)}>
  <video autoplay muted loop playsinline poster="${poster}" ${s(`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0`)}>
    <source src="" type="video/mp4">
  </video>
  <div ${s(`position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.7) 100%);z-index:1`)}></div>
  <div ${s(`position:relative;z-index:2;text-align:center;padding:2rem;max-width:800px`)}>
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2.5rem,6vw,5rem);line-height:1.08;letter-spacing:-0.03em;color:#fff;margin:0 0 1.5rem`)}>${title}</h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,2vw,1.25rem);color:rgba(255,255,255,0.8);line-height:1.6;margin:0 0 2.5rem;max-width:600px;margin-inline:auto`)}>${subtitle}</p>
    <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};display:inline-flex;align-items:center;gap:0.5rem;font-size:1rem;padding:0.9rem 2.5rem;background:#fff;color:${c.primary};border-radius:10px;text-decoration:none;font-weight:600;transition:transform 0.3s`)} onmouseenter="this.style.transform='scale(1.04)'" onmouseleave="this.style.transform='scale(1)'">${ctaText}</a>
  </div>
  <div ${s(`position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);z-index:2;animation:hero-bounce 2s infinite`)}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
  </div>
</section>
<style>
  @keyframes hero-bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
</style>`
}

/* ------------------------------------------------------------------ */
/*  HERO 4 — Particles Canvas                                        */
/* ------------------------------------------------------------------ */

export const generateHeroParticles = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, palette: c, fonts: f } = p
  return `<section class="motion-reveal" ${s(`position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:${c.background}`)}>
  <canvas id="particles-canvas" ${s(`position:absolute;inset:0;z-index:0`)}></canvas>
  <div ${s(`position:relative;z-index:2;text-align:center;padding:2rem;max-width:800px`)}>
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2.5rem,6vw,4.5rem);line-height:1.1;letter-spacing:-0.03em;color:${c.text};margin:0 0 1.5rem`)}>${title}</h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,2vw,1.2rem);color:${c.textMuted};line-height:1.6;margin:0 0 2.5rem;max-width:580px;margin-inline:auto`)}>${subtitle}</p>
    <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.85rem 2.25rem;background:${c.primary};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;transition:transform 0.3s,box-shadow 0.3s`)} onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 30px ${c.primary}44'" onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='none'">${ctaText}</a>
  </div>
</section>
<script>
(function(){
  var canvas=document.getElementById('particles-canvas');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var particles=[];
  var mouse={x:null,y:null};
  var color='${c.primary}';
  function resize(){canvas.width=canvas.parentElement.offsetWidth;canvas.height=canvas.parentElement.offsetHeight;}
  resize();window.addEventListener('resize',resize);
  canvas.parentElement.addEventListener('mousemove',function(e){var r=canvas.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});
  canvas.parentElement.addEventListener('mouseleave',function(){mouse.x=null;mouse.y=null;});
  for(var i=0;i<80;i++){
    particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.5,r:Math.random()*2+1});
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(var i=0;i<particles.length;i++){
      var p=particles[i];
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>canvas.width)p.vx*=-1;
      if(p.y<0||p.y>canvas.height)p.vy*=-1;
      if(mouse.x!==null){
        var dx=p.x-mouse.x,dy=p.y-mouse.y,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120){p.x+=dx*0.02;p.y+=dy*0.02;}
      }
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=color+'40';ctx.fill();
      for(var j=i+1;j<particles.length;j++){
        var p2=particles[j],dx2=p.x-p2.x,dy2=p.y-p2.y,dist2=Math.sqrt(dx2*dx2+dy2*dy2);
        if(dist2<150){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle=color+(Math.round((1-dist2/150)*30)).toString(16).padStart(2,'0');ctx.lineWidth=0.5;ctx.stroke();}
      }
    }
    requestAnimationFrame(draw);
  }
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)draw();
})();
</script>`
}

/* ------------------------------------------------------------------ */
/*  HERO 5 — Typewriter                                              */
/* ------------------------------------------------------------------ */

export const generateHeroTypewriter = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, palette: c, fonts: f } = p
  // Split title on first | to get static part and rotating words
  const parts = title.split('|')
  const staticPart = parts[0].trim()
  const typingWord = parts[1]?.trim() || ''
  return `<section class="motion-reveal" ${s(`min-height:90vh;display:flex;align-items:center;justify-content:center;padding:6rem 2rem;background:${c.background}`)}>
  <div ${s(`text-align:center;max-width:800px`)}>
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2.5rem,6vw,4.5rem);line-height:1.12;letter-spacing:-0.03em;color:${c.text};margin:0 0 1.5rem`)}>${staticPart} <span ${s(`background:linear-gradient(135deg,${c.primary},${c.accent});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text`)} data-typewriter-text="${typingWord}" data-typewriter-loop><span class="typewriter-cursor"></span></span></h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,2vw,1.2rem);color:${c.textMuted};line-height:1.7;margin:0 0 2.5rem;max-width:560px;margin-inline:auto`)}>${subtitle}</p>
    <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.85rem 2.5rem;background:${c.primary};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;transition:background 0.3s,transform 0.2s`)} onmouseenter="this.style.background='${c.primaryHover}';this.style.transform='translateY(-2px)'" onmouseleave="this.style.background='${c.primary}';this.style.transform='translateY(0)'">${ctaText}</a>
  </div>
</section>`
}

/* ------------------------------------------------------------------ */
/*  HERO 6 — Parallax Layers                                         */
/* ------------------------------------------------------------------ */

export const generateHeroParallaxLayers = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, palette: c, fonts: f } = p
  return `<section class="motion-reveal" ${s(`position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:${c.background}`)}>
  <!-- Decorative layers at different z-depths -->
  <div class="parallax-float" ${s(`position:absolute;top:10%;left:5%;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,${c.primary}20,transparent 70%);filter:blur(40px);z-index:0`)} data-speed="0.08"></div>
  <div class="parallax-float" ${s(`position:absolute;bottom:15%;right:8%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,${c.accent}18,transparent 70%);filter:blur(50px);z-index:0`)} data-speed="0.12"></div>
  <div class="parallax-float" ${s(`position:absolute;top:40%;left:60%;width:200px;height:200px;border-radius:30%;background:radial-gradient(circle,${c.secondary}15,transparent 70%);filter:blur(30px);transform:rotate(45deg);z-index:0`)} data-speed="0.05"></div>
  <div class="parallax-float" ${s(`position:absolute;top:20%;right:20%;width:80px;height:80px;border:2px solid ${c.primary}20;border-radius:12px;transform:rotate(15deg);z-index:0`)} data-speed="0.18"></div>
  <div class="parallax-float" ${s(`position:absolute;bottom:25%;left:15%;width:60px;height:60px;border:2px solid ${c.accent}20;border-radius:50%;z-index:0`)} data-speed="0.14"></div>
  <!-- Content -->
  <div ${s(`position:relative;z-index:2;text-align:center;padding:2rem;max-width:780px`)}>
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2.5rem,6vw,4.75rem);line-height:1.08;letter-spacing:-0.03em;color:${c.text};margin:0 0 1.5rem`)}>${title}</h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,2vw,1.2rem);color:${c.textMuted};line-height:1.7;margin:0 0 2.5rem;max-width:560px;margin-inline:auto`)}>${subtitle}</p>
    <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.85rem 2.25rem;background:${c.primary};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;transition:background 0.3s,transform 0.2s`)} onmouseenter="this.style.background='${c.primaryHover}'" onmouseleave="this.style.background='${c.primary}'">${ctaText}</a>
  </div>
</section>`
}

/* ------------------------------------------------------------------ */
/*  HERO 7 — Magazine / Editorial                                    */
/* ------------------------------------------------------------------ */

export const generateHeroMagazine = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, imageUrl, badge, palette: c, fonts: f } = p
  return `<section class="motion-reveal" ${s(`display:grid;grid-template-columns:2fr 1fr;min-height:90vh;background:${c.background}`)}>
  <div ${s(`position:relative;overflow:hidden`)}>
    <img src="${imgSrc(imageUrl)}" alt="" loading="eager" ${s(`width:100%;height:100%;object-fit:cover`)} />
    <div ${s(`position:absolute;inset:0;background:linear-gradient(to right,transparent 60%,${c.background} 100%)`)}></div>
  </div>
  <div ${s(`display:flex;flex-direction:column;justify-content:center;padding:4rem 3rem 4rem 0`)}>
    ${badge ? `<span ${s(`${fontStyle(f, 'body')};font-size:0.75rem;text-transform:uppercase;letter-spacing:0.15em;color:${c.primary};margin-bottom:1rem`)}>${badge}</span>` : ''}
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2rem,4vw,3.5rem);line-height:1.08;letter-spacing:-0.03em;color:${c.text};margin:0 0 1.5rem`)}>${title}</h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:1rem;color:${c.textMuted};line-height:1.7;margin:0 0 2rem`)}>${subtitle}</p>
    <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};display:inline-block;width:fit-content;font-size:0.9rem;padding:0.75rem 2rem;background:${c.primary};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;transition:background 0.3s`)} onmouseenter="this.style.background='${c.primaryHover}'" onmouseleave="this.style.background='${c.primary}'">${ctaText}</a>
  </div>
</section>
<style>
  @media (max-width:768px) {
    .motion-reveal[style*="grid-template-columns:2fr 1fr"] { grid-template-columns:1fr !important; }
    .motion-reveal[style*="grid-template-columns:2fr 1fr"] > div:first-child { max-height:50vh; }
    .motion-reveal[style*="grid-template-columns:2fr 1fr"] > div:last-child { padding:2rem 1.5rem !important; }
  }
</style>`
}

/* ------------------------------------------------------------------ */
/*  HERO 8 — Product Showcase                                        */
/* ------------------------------------------------------------------ */

export const generateHeroProductShowcase = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, imageUrl, palette: c, fonts: f } = p
  return `<section class="motion-reveal" ${s(`min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6rem 2rem;background:${c.background};text-align:center`)}>
  <div ${s(`position:relative;margin-bottom:3rem`)}>
    <img src="${imgSrc(imageUrl)}" alt="" loading="eager" ${s(`max-width:480px;width:100%;height:auto;border-radius:20px;position:relative;z-index:1;animation:product-float 4s ease-in-out infinite`)} />
    <div ${s(`position:absolute;inset:0;border-radius:20px;box-shadow:0 0 60px 20px ${c.primary}25;z-index:0;animation:product-glow 4s ease-in-out infinite`)}></div>
  </div>
  <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2rem,4.5vw,3.5rem);line-height:1.12;letter-spacing:-0.03em;color:${c.text};margin:0 0 1rem;max-width:700px`)}>${title}</h1>
  <p ${s(`${fontStyle(f, 'body')};font-size:clamp(0.95rem,1.5vw,1.15rem);color:${c.textMuted};line-height:1.7;margin:0 0 2rem;max-width:520px`)}>${subtitle}</p>
  <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.85rem 2.5rem;background:${c.primary};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;transition:background 0.3s,transform 0.2s`)} onmouseenter="this.style.background='${c.primaryHover}';this.style.transform='translateY(-2px)'" onmouseleave="this.style.background='${c.primary}';this.style.transform='translateY(0)'">${ctaText}</a>
</section>
<style>
  @keyframes product-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes product-glow { 0%,100%{box-shadow:0 0 60px 20px ${c.primary}20} 50%{box-shadow:0 0 80px 30px ${c.primary}35} }
</style>`
}

/* ------------------------------------------------------------------ */
/*  HERO 9 — Minimal Text                                            */
/* ------------------------------------------------------------------ */

export const generateHeroMinimalText = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink, palette: c, fonts: f } = p
  // Wrap last word with animated underline
  const words = title.split(' ')
  const lastWord = words.pop() || ''
  const rest = words.join(' ')
  return `<section class="motion-reveal" ${s(`min-height:85vh;display:flex;align-items:center;justify-content:center;padding:6rem 2rem;background:${c.background}`)}>
  <div ${s(`text-align:center;max-width:900px`)}>
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(3rem,8vw,7rem);line-height:1.05;letter-spacing:-0.04em;color:${c.text};margin:0 0 1.5rem`)}>${rest} <span ${s(`position:relative;display:inline-block`)}>${lastWord}<span ${s(`position:absolute;bottom:0.08em;left:0;width:100%;height:0.08em;background:linear-gradient(90deg,${c.primary},${c.accent});border-radius:4px;animation:underline-grow 1.2s ease forwards`)}></span></span></h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,2vw,1.3rem);color:${c.textMuted};line-height:1.7;margin:0 0 2.5rem;max-width:600px;margin-inline:auto`)}>${subtitle}</p>
    <div ${s(`display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap`)}>
      <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.9rem 2.5rem;background:${c.primary};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;transition:background 0.3s,transform 0.2s`)} onmouseenter="this.style.background='${c.primaryHover}';this.style.transform='translateY(-2px)'" onmouseleave="this.style.background='${c.primary}';this.style.transform='translateY(0)'">${ctaText}</a>
      ${secondaryCtaText ? `<a href="${secondaryCtaLink || '#'}" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.9rem 2.5rem;color:${c.text};text-decoration:none;border:1px solid ${c.border};border-radius:10px;transition:border-color 0.3s`)} onmouseenter="this.style.borderColor='${c.primary}'" onmouseleave="this.style.borderColor='${c.border}'">${secondaryCtaText}</a>` : ''}
    </div>
  </div>
</section>
<style>
  @keyframes underline-grow { 0%{transform:scaleX(0);transform-origin:left} 100%{transform:scaleX(1);transform-origin:left} }
</style>`
}

/* ------------------------------------------------------------------ */
/*  HERO 10 — Counter Stats                                          */
/* ------------------------------------------------------------------ */

export const generateHeroCounterStats = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, stats = [], palette: c, fonts: f } = p
  const statItems = stats.length > 0 ? stats : [
    { value: '10K+', label: 'Customers' },
    { value: '99%', label: 'Satisfaction' },
    { value: '150+', label: 'Countries' },
    { value: '24/7', label: 'Support' },
  ]
  return `<section class="motion-reveal" ${s(`padding:6rem 2rem;background:${c.background}`)}>
  <div ${s(`max-width:900px;margin:0 auto;text-align:center`)}>
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2.5rem,5vw,4rem);line-height:1.1;letter-spacing:-0.03em;color:${c.text};margin:0 0 1.25rem`)}>${title}</h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,1.8vw,1.2rem);color:${c.textMuted};line-height:1.7;margin:0 0 2rem;max-width:560px;margin-inline:auto`)}>${subtitle}</p>
    <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};display:inline-block;font-size:1rem;padding:0.85rem 2.25rem;background:${c.primary};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;margin-bottom:4rem;transition:background 0.3s,transform 0.2s`)} onmouseenter="this.style.background='${c.primaryHover}'" onmouseleave="this.style.background='${c.primary}'">${ctaText}</a>
  </div>
  <div ${s(`display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;max-width:960px;margin:0 auto`)}>
    ${statItems.map(st => {
      const numericVal = parseFloat(st.value.replace(/[^0-9.]/g, ''))
      const prefix = st.value.match(/^[^0-9]*/)?.[0] || ''
      const suffix = st.value.match(/[^0-9.]*$/)?.[0] || ''
      return `<div ${s(`text-align:center;padding:1.5rem`)}>
      <span class="counter-value" data-count-target="${isNaN(numericVal) ? 0 : numericVal}" data-count-prefix="${prefix}" data-count-suffix="${suffix}" ${s(`${fontStyle(f, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${c.primary};display:block;margin-bottom:0.5rem`)}>${st.value}</span>
      <span ${s(`${fontStyle(f, 'body')};font-size:0.9rem;color:${c.textMuted}`)}>${st.label}</span>
    </div>`
    }).join('\n    ')}
  </div>
</section>
<style>
  @media (max-width:640px) {
    [style*="grid-template-columns:repeat(4"] { grid-template-columns:repeat(2,1fr) !important; }
  }
</style>`
}

/* ------------------------------------------------------------------ */
/*  HERO 11 — Carousel                                               */
/* ------------------------------------------------------------------ */

export const generateHeroCarousel = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, palette: c, fonts: f, items } = p
  const slides = items && items.length >= 3 ? items.slice(0, 3) : [
    { icon: '', title: title, description: subtitle },
    { icon: '', title: 'Slide 2', description: 'Your second key message goes here.' },
    { icon: '', title: 'Slide 3', description: 'Your third key message goes here.' },
  ]
  return `<section class="motion-reveal" ${s(`position:relative;min-height:80vh;overflow:hidden;background:${c.background}`)}>
  <div id="hero-carousel" ${s(`display:flex;transition:transform 0.7s cubic-bezier(0.4,0,0.2,1);width:${slides.length * 100}%`)}>
    ${slides.map((sl, i) => `<div ${s(`min-width:${100 / slides.length}%;display:flex;align-items:center;justify-content:center;padding:6rem 2rem;background:${i === 0 ? c.background : i === 1 ? c.backgroundAlt : c.background}`)}>
      <div ${s(`text-align:center;max-width:700px`)}>
        <h2 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2rem,5vw,3.75rem);line-height:1.1;letter-spacing:-0.03em;color:${c.text};margin:0 0 1.25rem`)}>${sl.title}</h2>
        <p ${s(`${fontStyle(f, 'body')};font-size:clamp(0.95rem,1.5vw,1.15rem);color:${c.textMuted};line-height:1.7;margin:0 0 2rem;max-width:500px;margin-inline:auto`)}>${sl.description}</p>
        <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:0.95rem;padding:0.8rem 2rem;background:${c.primary};color:#fff;border-radius:10px;text-decoration:none;font-weight:600`)}>${ctaText}</a>
      </div>
    </div>`).join('\n    ')}
  </div>
  <div ${s(`position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);display:flex;gap:0.5rem;z-index:3`)}>
    ${slides.map((_, i) => `<button class="carousel-dot" data-index="${i}" ${s(`width:10px;height:10px;border-radius:50%;border:none;cursor:pointer;background:${i === 0 ? c.primary : c.border};transition:background 0.3s`)} aria-label="Slide ${i + 1}"></button>`).join('')}
  </div>
</section>
<script>
(function(){
  var carousel=document.getElementById('hero-carousel');
  if(!carousel)return;
  var dots=document.querySelectorAll('.carousel-dot');
  var total=${slides.length},current=0;
  function goTo(idx){
    current=idx;
    carousel.style.transform='translateX(-'+(current*(100/total))+'%)';
    dots.forEach(function(d,i){d.style.background=i===current?'${c.primary}':'${c.border}';});
  }
  dots.forEach(function(d){d.addEventListener('click',function(){goTo(parseInt(d.getAttribute('data-index')));});});
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    setInterval(function(){goTo((current+1)%total);},5000);
  }
})();
</script>`
}

/* ------------------------------------------------------------------ */
/*  HERO 12 — Aurora (Northern Lights)                               */
/* ------------------------------------------------------------------ */

export const generateHeroAurora = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink, palette: c, fonts: f } = p
  const aurora = auroraGradient({ colors: [c.primary, c.secondary, c.accent, c.primary] })
  const stars = shootingStars({ count: 5, color: c.primary })
  const particles = particlesCanvas({ color: 'rgba(255,255,255,0.3)', count: 30 })
  return `<section class="motion-reveal" ${s(`position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#0a0a1a`)}>
  ${aurora}${stars}${particles}
  <div class="aurora-layer aurora-1" ${s(`position:absolute;inset:-50%;background:radial-gradient(ellipse at 30% 50%,${c.primary}40,transparent 60%);animation:aurora-drift-1 12s ease-in-out infinite;filter:blur(80px)`)}></div>
  <div class="aurora-layer aurora-2" ${s(`position:absolute;inset:-50%;background:radial-gradient(ellipse at 70% 40%,${c.accent}30,transparent 55%);animation:aurora-drift-2 15s ease-in-out infinite;filter:blur(90px)`)}></div>
  <div class="aurora-layer aurora-3" ${s(`position:absolute;inset:-50%;background:radial-gradient(ellipse at 50% 60%,${c.secondary}25,transparent 50%);animation:aurora-drift-3 18s ease-in-out infinite;filter:blur(100px)`)}></div>
  <div ${s(`position:relative;z-index:2;text-align:center;padding:2rem;max-width:800px`)}>
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2.5rem,6vw,5rem);line-height:1.08;letter-spacing:-0.03em;color:#fff;margin:0 0 1.5rem`)}>${title}</h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,2vw,1.25rem);color:rgba(255,255,255,0.7);line-height:1.6;margin:0 0 2.5rem;max-width:600px;margin-inline:auto`)}>${subtitle}</p>
    <div ${s(`display:flex;align-items:center;justify-content:center;gap:1rem;flex-wrap:wrap`)}>
      <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.85rem 2.25rem;background:rgba(255,255,255,0.12);backdrop-filter:blur(10px);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:10px;text-decoration:none;font-weight:600;transition:background 0.3s`)} onmouseenter="this.style.background='rgba(255,255,255,0.2)'" onmouseleave="this.style.background='rgba(255,255,255,0.12)'">${ctaText}</a>
      ${secondaryCtaText ? `<a href="${secondaryCtaLink || '#'}" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.85rem 2.25rem;color:rgba(255,255,255,0.7);text-decoration:none;transition:color 0.3s`)} onmouseenter="this.style.color='#fff'" onmouseleave="this.style.color='rgba(255,255,255,0.7)'">${secondaryCtaText}</a>` : ''}
    </div>
  </div>
</section>
<style>
  @keyframes aurora-drift-1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(10%,5%) scale(1.1)} 66%{transform:translate(-5%,-8%) scale(0.95)} }
  @keyframes aurora-drift-2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-8%,6%) scale(1.05)} 66%{transform:translate(6%,-4%) scale(1.1)} }
  @keyframes aurora-drift-3 { 0%,100%{transform:translate(0,0) scale(1.05)} 33%{transform:translate(5%,-7%) scale(1)} 66%{transform:translate(-10%,3%) scale(1.08)} }
  @media (prefers-reduced-motion: reduce) { .aurora-layer { animation:none !important; } }
</style>`
}

/* ------------------------------------------------------------------ */
/*  HERO 13 — Noise Gradient                                         */
/* ------------------------------------------------------------------ */

export const generateHeroNoiseGradient = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, palette: c, fonts: f } = p
  const grid = gridPattern({ color: 'rgba(255,255,255,0.08)', size: 40, fade: true })
  const waves = waveCanvas({ color: c.secondary, waves: 3 })
  return `<section class="motion-reveal noise-overlay" ${s(`position:relative;min-height:90vh;display:flex;align-items:center;justify-content:center;padding:6rem 2rem;background:linear-gradient(135deg,${c.primary},${c.primaryHover},${c.accent})`)}>
  ${grid}${waves}
  <div ${s(`position:relative;z-index:2;text-align:center;max-width:800px`)}>
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2.5rem,6vw,5rem);line-height:1.08;letter-spacing:-0.03em;color:#fff;margin:0 0 1.5rem`)}>${title}</h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,2vw,1.25rem);color:rgba(255,255,255,0.8);line-height:1.6;margin:0 0 2.5rem;max-width:600px;margin-inline:auto`)}>${subtitle}</p>
    <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:0.9rem 2.5rem;background:#fff;color:${c.primary};border-radius:10px;text-decoration:none;font-weight:600;transition:transform 0.3s,box-shadow 0.3s`)} onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.15)'" onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='none'">${ctaText}</a>
  </div>
  <svg ${s(`position:absolute;inset:0;width:100%;height:100%;z-index:1;opacity:0.04;pointer-events:none`)} xmlns="http://www.w3.org/2000/svg">
    <filter id="hero-noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter>
    <rect width="100%" height="100%" filter="url(#hero-noise)"/>
  </svg>
</section>`
}

/* ------------------------------------------------------------------ */
/*  HERO 14 — Interactive Cards                                      */
/* ------------------------------------------------------------------ */

export const generateHeroInteractiveCards = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, items, palette: c, fonts: f } = p
  const cards = items && items.length >= 3 ? items.slice(0, 3) : [
    { icon: '⚡', title: 'Lightning Fast', description: 'Optimized for speed from the ground up.' },
    { icon: '🛡️', title: 'Secure by Default', description: 'Enterprise-grade security built in.' },
    { icon: '🎯', title: 'Precision Focus', description: 'Every detail designed with purpose.' },
  ]
  return `<section class="motion-reveal" ${s(`padding:6rem 2rem;background:${c.background}`)}>
  <div ${s(`max-width:800px;margin:0 auto 4rem;text-align:center`)}>
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2.5rem,5vw,4rem);line-height:1.1;letter-spacing:-0.03em;color:${c.text};margin:0 0 1.25rem`)}>${title}</h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,1.8vw,1.2rem);color:${c.textMuted};line-height:1.7;margin:0 0 2rem;max-width:560px;margin-inline:auto`)}>${subtitle}</p>
    <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};display:inline-block;font-size:1rem;padding:0.85rem 2.25rem;background:${c.primary};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;transition:background 0.3s`)} onmouseenter="this.style.background='${c.primaryHover}'" onmouseleave="this.style.background='${c.primary}'">${ctaText}</a>
  </div>
  <div ${s(`display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;max-width:960px;margin:0 auto`)}>
    ${cards.map(card => `<div class="tilt-card glow-card" ${s(`position:relative;padding:2rem;background:${c.backgroundAlt};border:1px solid ${c.border};border-radius:16px;cursor:default;transition:transform 0.6s cubic-bezier(0.23,1,0.32,1),box-shadow 0.4s`)}>
      <span ${s(`font-size:2.5rem;display:block;margin-bottom:1rem`)}>${card.icon}</span>
      <h3 ${s(`${fontStyle(f, 'heading')};font-size:1.15rem;color:${c.text};margin:0 0 0.6rem`)}>${card.title}</h3>
      <p ${s(`${fontStyle(f, 'body')};font-size:0.9rem;color:${c.textMuted};line-height:1.6;margin:0`)}>${card.description}</p>
    </div>`).join('\n    ')}
  </div>
</section>
<style>
  @media (max-width:768px) {
    [style*="grid-template-columns:repeat(3"] { grid-template-columns:1fr !important; }
  }
</style>`
}

/* ------------------------------------------------------------------ */
/*  HERO 15 — 3D Globe                                               */
/* ------------------------------------------------------------------ */

export const generateHero3DGlobe = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, palette: c, fonts: f } = p
  return `<section class="motion-reveal" ${s(`display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;min-height:85vh;padding:6rem 4rem;max-width:1280px;margin:0 auto;background:${c.background}`)}>
  <div>
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2rem,4.5vw,3.75rem);line-height:1.1;letter-spacing:-0.03em;color:${c.text};margin:0 0 1.5rem`)}>${title}</h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(0.95rem,1.5vw,1.15rem);color:${c.textMuted};line-height:1.7;margin:0 0 2rem;max-width:480px`)}>${subtitle}</p>
    <a href="${ctaLink}" class="shimmer-btn" ${s(`${fontStyle(f, 'body')};display:inline-block;font-size:1rem;padding:0.85rem 2.25rem;background:${c.primary};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;transition:background 0.3s,transform 0.2s`)} onmouseenter="this.style.background='${c.primaryHover}';this.style.transform='translateY(-2px)'" onmouseleave="this.style.background='${c.primary}';this.style.transform='translateY(0)'">${ctaText}</a>
  </div>
  <div ${s(`display:flex;align-items:center;justify-content:center`)}>
    <div ${s(`position:relative;width:clamp(280px,28vw,420px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 35%,${c.primary}30,${c.primaryHover}80,${c.primary});box-shadow:0 0 80px ${c.primary}30,inset 0 0 60px ${c.primary}20;overflow:hidden`)}>
      <!-- Grid lines -->
      <div ${s(`position:absolute;inset:0;border-radius:50%;border:1px solid ${c.primary}25;animation:globe-spin 20s linear infinite`)}>
        ${[20, 40, 60, 80].map(pct => `<div ${s(`position:absolute;top:0;bottom:0;left:${pct}%;width:1px;background:${c.primary}15;transform:scaleX(${1 - Math.abs(pct - 50) / 50})`)}></div>`).join('')}
        ${[25, 50, 75].map(pct => `<div ${s(`position:absolute;left:0;right:0;top:${pct}%;height:1px;background:${c.primary}15`)}></div>`).join('')}
      </div>
      <!-- Highlight -->
      <div ${s(`position:absolute;top:15%;left:20%;width:30%;height:30%;background:radial-gradient(circle,rgba(255,255,255,0.12),transparent 70%);border-radius:50%`)}></div>
      <!-- Dot accents -->
      <div ${s(`position:absolute;top:30%;left:45%;width:6px;height:6px;background:${c.accent};border-radius:50%;box-shadow:0 0 10px ${c.accent}`)}></div>
      <div ${s(`position:absolute;top:55%;left:60%;width:4px;height:4px;background:${c.secondary};border-radius:50%;box-shadow:0 0 8px ${c.secondary}`)}></div>
      <div ${s(`position:absolute;top:40%;left:25%;width:5px;height:5px;background:${c.accent};border-radius:50%;box-shadow:0 0 8px ${c.accent}`)}></div>
    </div>
  </div>
</section>
<style>
  @keyframes globe-spin { 0%{transform:rotateY(0deg)} 100%{transform:rotateY(360deg)} }
  @media (prefers-reduced-motion: reduce) { [style*="globe-spin"] { animation:none !important; } }
  @media (max-width:768px) {
    .motion-reveal[style*="grid-template-columns:1fr 1fr"][style*="min-height:85vh"] { grid-template-columns:1fr !important; padding:4rem 1.5rem !important; text-align:center; }
  }
</style>`
}
