/**
 * Premium Section Generators — Campaign-Grade Output
 *
 * These generators produce materially different section compositions
 * compared to the standard generators. They are designed for premium
 * art directions and showcase-quality output.
 *
 * Each generator family is designed for a specific emotional direction:
 * - Apple-clean: maximum whitespace, restrained color, product focus
 * - Tech-dark: dark backgrounds, gradient accents, glow effects
 * - Family-warm: soft colors, rounded elements, trust-first
 * - Editorial: large typography, asymmetric layout, storytelling
 * - Commerce-energy: bold CTAs, urgency signals, social proof
 */

import type { ColorPalette, FontCombo } from '../design-presets'

const fontStyle = (fonts: FontCombo, role: 'heading' | 'body') => {
  const family = role === 'heading' ? fonts.heading : fonts.body
  const weight = role === 'heading' ? fonts.headingWeight : fonts.bodyWeight
  return `font-family:'${family}',sans-serif;font-weight:${weight}`
}

const s = (css: string) => `style="${css}"`

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
  items?: { icon?: string; title?: string; description?: string; feature?: string }[]
  palette: ColorPalette
  fonts: FontCombo
}

type PricingParams = {
  title: string
  subtitle: string
  plans?: { name: string; price: string; originalPrice?: string; period?: string; description?: string; features: string[]; cta: string; href?: string; popular?: boolean; currency?: string }[]
  items?: unknown[]
  palette: ColorPalette
  fonts: FontCombo
}

type TestimonialParams = {
  title: string
  subtitle: string
  items?: { quote?: string; text?: string; author?: string; role?: string; rating?: number; avatar?: string }[]
  palette: ColorPalette
  fonts: FontCombo
}

type CTAParams = {
  title: string
  subtitle: string
  ctaText?: string
  ctaLink?: string
  items?: { benefit?: string; title?: string; description?: string }[]
  palette: ColorPalette
  fonts: FontCombo
}

// ─── HERO: Apple-Clean Product Hero ─────────────────────────────────

export const generateHeroAppleClean = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink, imageUrl, badge, stats, palette: c, fonts: f } = p
  const statsHtml = stats && stats.length > 0 ? `
  <div ${s(`display:flex;gap:48px;margin-top:48px;padding-top:32px;border-top:1px solid ${c.border}`)}>
    ${stats.map(st => `
    <div ${s('text-align:center')}>
      <div ${s(`${fontStyle(f, 'heading')};font-size:2rem;color:${c.text};letter-spacing:-0.03em`)}>${st.value}</div>
      <div ${s(`${fontStyle(f, 'body')};font-size:0.8rem;color:${c.textMuted};text-transform:uppercase;letter-spacing:0.1em;margin-top:4px`)}>${st.label}</div>
    </div>`).join('')}
  </div>` : ''

  return `<section class="motion-reveal" ${s(`min-height:100vh;display:flex;align-items:center;background:${c.background};padding:0;overflow:hidden`)}>
  <div ${s('display:grid;grid-template-columns:1fr 1fr;gap:0;width:100%;min-height:100vh;align-items:center')}>
    <div ${s('padding:clamp(2rem,6vw,8rem);display:flex;flex-direction:column;justify-content:center')}>
      ${badge ? `<span ${s(`display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:${c.primary}10;color:${c.primary};border-radius:100px;font-size:0.8rem;${fontStyle(f, 'body')};font-weight:600;letter-spacing:0.03em;margin-bottom:24px;width:fit-content`)}>${badge}</span>` : ''}
      <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2.5rem,5vw,4.5rem);line-height:1.05;letter-spacing:-0.04em;color:${c.text};margin:0 0 24px`)}>${title}</h1>
      <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,1.5vw,1.25rem);color:${c.textMuted};line-height:1.7;margin:0 0 36px;max-width:480px`)}>${subtitle}</p>
      <div ${s('display:flex;gap:12px;align-items:center;flex-wrap:wrap')}>
        <a href="${ctaLink}" ${s(`${fontStyle(f, 'body')};font-size:0.95rem;padding:14px 32px;background:${c.primary};color:#fff;border-radius:12px;text-decoration:none;font-weight:600;transition:all 0.3s;box-shadow:0 4px 16px ${c.primary}30`)} onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px ${c.primary}40'" onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 16px ${c.primary}30'">${ctaText}</a>
        ${secondaryCtaText ? `<a href="${secondaryCtaLink || '#'}" ${s(`${fontStyle(f, 'body')};font-size:0.95rem;padding:14px 32px;background:transparent;color:${c.text};border:1px solid ${c.border};border-radius:12px;text-decoration:none;font-weight:500;transition:all 0.3s`)} onmouseenter="this.style.borderColor='${c.primary}';this.style.color='${c.primary}'" onmouseleave="this.style.borderColor='${c.border}';this.style.color='${c.text}'">${secondaryCtaText}</a>` : ''}
      </div>
      ${statsHtml}
    </div>
    <div ${s(`position:relative;display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg, ${c.backgroundAlt} 0%, ${c.background} 100%)`)}>
      <div ${s('position:relative;width:80%;max-width:500px')}>
        <img src="${imageUrl || `https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80`}" alt="" loading="eager" ${s('width:100%;height:auto;border-radius:24px;position:relative;z-index:1')} />
        <div ${s(`position:absolute;inset:-20px;border-radius:32px;background:${c.primary}08;filter:blur(40px);z-index:0`)}></div>
      </div>
    </div>
  </div>
</section>
<style>
  @media(max-width:768px) {
    section:first-of-type > div:first-child { grid-template-columns:1fr !important; min-height:auto !important; }
    section:first-of-type > div:first-child > div:last-child { min-height:50vh !important; padding:2rem !important; }
  }
</style>`
}

// ─── HERO: Tech Dark Cinematic ──────────────────────────────────────

export const generateHeroTechDark = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, badge, items, palette: c, fonts: f } = p
  const features = (items || []).slice(0, 4)
  const featureHtml = features.length > 0 ? `
  <div ${s('display:flex;gap:32px;margin-top:48px;flex-wrap:wrap')}>
    ${features.map(item => `
    <div ${s(`flex:1;min-width:140px;padding:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;backdrop-filter:blur(10px)`)}>
      <div ${s(`font-size:1.5rem;margin-bottom:8px`)}>${item.icon || '⚡'}</div>
      <div ${s(`${fontStyle(f, 'body')};font-size:0.85rem;color:rgba(255,255,255,0.7);line-height:1.5`)}>${item.title || item.feature || item.description || ''}</div>
    </div>`).join('')}
  </div>` : ''

  return `<section class="motion-reveal" ${s(`min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0A0A0F;padding:clamp(3rem,8vw,6rem) 2rem;position:relative;overflow:hidden`)}>
  <div ${s(`position:absolute;top:20%;right:10%;width:500px;height:500px;background:radial-gradient(circle, ${c.primary}15 0%, transparent 70%);filter:blur(80px);pointer-events:none`)}></div>
  <div ${s(`position:absolute;bottom:10%;left:5%;width:400px;height:400px;background:radial-gradient(circle, ${c.secondary || c.accent}10 0%, transparent 70%);filter:blur(80px);pointer-events:none`)}></div>
  <div ${s('max-width:900px;width:100%;position:relative;z-index:1')}>
    ${badge ? `<span ${s(`display:inline-flex;align-items:center;gap:8px;padding:8px 20px;background:${c.primary}15;color:${c.primary};border:1px solid ${c.primary}30;border-radius:100px;font-size:0.8rem;${fontStyle(f, 'body')};font-weight:600;letter-spacing:0.05em;margin-bottom:32px`)}><span ${s('width:6px;height:6px;background:currentColor;border-radius:50%;animation:pulse 2s infinite')}></span> ${badge}</span>` : ''}
    <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2.5rem,6vw,5rem);line-height:1.05;letter-spacing:-0.04em;color:#fff;margin:0 0 24px`)}>
      ${title}
    </h1>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,1.5vw,1.2rem);color:rgba(255,255,255,0.5);line-height:1.8;margin:0 0 40px;max-width:600px`)}>${subtitle}</p>
    <div ${s('display:flex;gap:16px;align-items:center')}>
      <a href="${ctaLink}" ${s(`${fontStyle(f, 'body')};font-size:0.95rem;padding:16px 36px;background:${c.primary};color:#fff;border-radius:12px;text-decoration:none;font-weight:600;transition:all 0.3s;position:relative;overflow:hidden`)} onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 0 30px ${c.primary}50'" onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='none'">${ctaText}</a>
    </div>
    ${featureHtml}
  </div>
</section>
<style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}</style>`
}

// ─── HERO: Family Warm Trust ────────────────────────────────────────

export const generateHeroFamilyWarm = (p: HeroParams): string => {
  const { title, subtitle, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink, imageUrl, badge, palette: c, fonts: f } = p
  return `<section class="motion-reveal" ${s(`min-height:85vh;display:flex;align-items:center;background:linear-gradient(180deg, #F8FAFF 0%, ${c.background} 100%);padding:clamp(3rem,6vw,5rem) 2rem;position:relative`)}>
  <div ${s('max-width:1200px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,4vw,5rem);align-items:center')}>
    <div>
      ${badge ? `<div ${s(`display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:#E8F5E9;color:#2E7D32;border-radius:100px;font-size:0.85rem;${fontStyle(f, 'body')};font-weight:600;margin-bottom:20px`)}>✓ ${badge}</div>` : ''}
      <h1 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2rem,4.5vw,3.5rem);line-height:1.15;letter-spacing:-0.02em;color:${c.text};margin:0 0 20px`)}>${title}</h1>
      <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,1.3vw,1.15rem);color:${c.textMuted};line-height:1.75;margin:0 0 32px;max-width:480px`)}>${subtitle}</p>
      <div ${s('display:flex;gap:12px;align-items:center;flex-wrap:wrap')}>
        <a href="${ctaLink}" ${s(`${fontStyle(f, 'body')};font-size:1rem;padding:14px 32px;background:${c.primary};color:#fff;border-radius:50px;text-decoration:none;font-weight:600;transition:all 0.3s;box-shadow:0 4px 20px ${c.primary}25`)} onmouseenter="this.style.transform='scale(1.03)'" onmouseleave="this.style.transform='scale(1)'">${ctaText}</a>
        ${secondaryCtaText ? `<a href="${secondaryCtaLink || '#'}" ${s(`${fontStyle(f, 'body')};font-size:1rem;color:${c.primary};text-decoration:none;font-weight:500;display:flex;align-items:center;gap:6px`)}>${secondaryCtaText} →</a>` : ''}
      </div>
      <div ${s(`display:flex;gap:16px;margin-top:32px;padding-top:24px;border-top:1px solid ${c.border}`)}>
        <div ${s(`display:flex;align-items:center;gap:8px;${fontStyle(f, 'body')};font-size:0.85rem;color:${c.textMuted}`)}>
          <span ${s('color:#2E7D32;font-size:1.1rem')}>🛡️</span> אחריות מלאה
        </div>
        <div ${s(`display:flex;align-items:center;gap:8px;${fontStyle(f, 'body')};font-size:0.85rem;color:${c.textMuted}`)}>
          <span ${s('color:#1565C0;font-size:1.1rem')}>📍</span> GPS מדויק
        </div>
        <div ${s(`display:flex;align-items:center;gap:8px;${fontStyle(f, 'body')};font-size:0.85rem;color:${c.textMuted}`)}>
          <span ${s('color:#6A1B9A;font-size:1.1rem')}>💬</span> תמיכה 24/7
        </div>
      </div>
    </div>
    <div ${s('position:relative;display:flex;justify-content:center')}>
      <div ${s(`position:absolute;inset:-30px;background:${c.primary}06;border-radius:50%;filter:blur(40px)`)}></div>
      <img src="${imageUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80'}" alt="" loading="eager" ${s('max-width:100%;height:auto;border-radius:24px;position:relative;z-index:1;box-shadow:0 20px 60px rgba(0,0,0,0.08)')} />
    </div>
  </div>
</section>
<style>@media(max-width:768px){section > div:first-child{grid-template-columns:1fr !important}}</style>`
}

// ─── PRICING: Premium Showcase Cards ────────────────────────────────

export const generatePricingPremiumShowcase = (p: PricingParams): string => {
  const { title, subtitle, plans = [], palette: c, fonts: f } = p
  const validPlans = plans.filter(pl => pl.name)
  if (validPlans.length === 0) return ''

  const cards = validPlans.slice(0, 4).map((plan, i) => {
    const isPopular = plan.popular || i === 1
    const features = (plan.features || []).slice(0, 6)
    const hasOriginal = plan.originalPrice && plan.originalPrice !== plan.price

    return `<div ${s(`flex:1;min-width:280px;max-width:360px;padding:${isPopular ? '48px 36px' : '40px 32px'};background:${isPopular ? c.primary : c.backgroundAlt};color:${isPopular ? '#fff' : c.text};border-radius:24px;position:relative;transition:transform 0.3s,box-shadow 0.3s;${isPopular ? `box-shadow:0 20px 60px ${c.primary}30;transform:scale(1.02)` : `border:1px solid ${c.border}`}`)} onmouseenter="this.style.transform='translateY(-4px) ${isPopular ? 'scale(1.02)' : ''}'" onmouseleave="this.style.transform='translateY(0) ${isPopular ? 'scale(1.02)' : ''}'">
      ${isPopular ? `<div ${s(`position:absolute;top:-12px;right:24px;padding:6px 20px;background:${c.accent};color:#fff;border-radius:100px;font-size:0.75rem;${fontStyle(f, 'body')};font-weight:700;letter-spacing:0.05em`)}>הכי פופולרי</div>` : ''}
      ${(plan as Record<string, unknown>).image ? `<img src="${(plan as Record<string, unknown>).image}${String((plan as Record<string, unknown>).image).includes('?') ? '&' : '?'}w=400&q=80" alt="${plan.name}" ${s(`width:100%;height:140px;object-fit:contain;border-radius:16px;margin-bottom:12px;background:${isPopular ? 'rgba(255,255,255,0.1)' : c.background}`)} loading="lazy" />` : ''}
      <h3 ${s(`${fontStyle(f, 'heading')};font-size:1.3rem;margin:0 0 8px;letter-spacing:-0.01em`)}>${plan.name}</h3>
      ${plan.description ? `<p ${s(`${fontStyle(f, 'body')};font-size:0.85rem;margin:0 0 20px;opacity:0.7`)}>${plan.description}</p>` : ''}
      <div ${s('display:flex;align-items:baseline;gap:4px;margin-bottom:24px')}>
        ${hasOriginal ? `<span ${s(`${fontStyle(f, 'body')};font-size:1rem;text-decoration:line-through;opacity:0.5`)}>${plan.originalPrice}${plan.currency || '₪'}</span>` : ''}
        <span ${s(`${fontStyle(f, 'heading')};font-size:2.5rem;letter-spacing:-0.03em`)}>${plan.price || ''}</span>
        <span ${s(`${fontStyle(f, 'body')};font-size:1rem;opacity:0.6`)}>${plan.currency || '₪'}${plan.period ? `/${plan.period}` : ''}</span>
      </div>
      <ul ${s('list-style:none;padding:0;margin:0 0 28px;display:flex;flex-direction:column;gap:12px')}>
        ${features.map(feat => `<li ${s(`display:flex;align-items:center;gap:10px;${fontStyle(f, 'body')};font-size:0.9rem;opacity:0.85`)}>
          <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="${isPopular ? 'rgba(255,255,255,0.2)' : c.primary + '15'}"/><path d="M5 8l2 2 4-4" stroke="${isPopular ? '#fff' : c.primary}" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
          ${feat}
        </li>`).join('')}
      </ul>
      <a href="${plan.href || '#'}" ${s(`display:block;text-align:center;${fontStyle(f, 'body')};font-size:0.95rem;padding:14px 24px;background:${isPopular ? 'rgba(255,255,255,0.2)' : c.primary};color:${isPopular ? '#fff' : '#fff'};border-radius:12px;text-decoration:none;font-weight:600;transition:all 0.3s;border:${isPopular ? '1px solid rgba(255,255,255,0.3)' : 'none'}`)} onmouseenter="this.style.transform='translateY(-1px)'" onmouseleave="this.style.transform='translateY(0)'">${plan.cta || 'בחרו'}</a>
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`padding:clamp(4rem,8vw,7rem) 2rem;background:${c.background}`)}>
  <div ${s('max-width:1200px;margin:0 auto')}>
    <div ${s('text-align:center;margin-bottom:clamp(2rem,4vw,4rem)')}>
      <h2 ${s(`${fontStyle(f, 'heading')};font-size:clamp(1.8rem,4vw,3rem);color:${c.text};margin:0 0 12px;letter-spacing:-0.03em`)}>${title}</h2>
      <p ${s(`${fontStyle(f, 'body')};font-size:1.1rem;color:${c.textMuted};margin:0;max-width:500px;margin-inline:auto`)}>${subtitle}</p>
    </div>
    <div ${s('display:flex;gap:24px;justify-content:center;align-items:stretch;flex-wrap:wrap')}>
      ${cards}
    </div>
  </div>
</section>`
}

// ─── TESTIMONIALS: Premium Social Proof ─────────────────────────────

export const generateTestimonialsPremium = (p: TestimonialParams): string => {
  const { title, subtitle, items = [], palette: c, fonts: f } = p
  const testimonials = items.slice(0, 4)
  if (testimonials.length === 0) return ''

  const cards = testimonials.map(t => {
    const stars = t.rating ? Array.from({ length: 5 }, (_, i) => `<span ${s(`color:${i < t.rating! ? '#FBBF24' : c.border};font-size:14px`)}>&starf;</span>`).join('') : ''

    return `<div ${s(`flex:1;min-width:280px;padding:32px;background:${c.backgroundAlt};border:1px solid ${c.border};border-radius:20px;display:flex;flex-direction:column;gap:16px;transition:transform 0.3s`)} onmouseenter="this.style.transform='translateY(-4px)'" onmouseleave="this.style.transform='translateY(0)'">
      ${stars ? `<div>${stars}</div>` : ''}
      <p ${s(`${fontStyle(f, 'body')};font-size:0.95rem;color:${c.text};line-height:1.75;margin:0;flex:1`)}>"${t.quote || t.text || ''}"</p>
      <div ${s('display:flex;align-items:center;gap:12px;margin-top:auto')}>
        <div ${s(`width:40px;height:40px;border-radius:50%;background:${c.primary}15;display:flex;align-items:center;justify-content:center;${fontStyle(f, 'heading')};font-size:0.9rem;color:${c.primary}`)}>${(t.author || 'A')[0]}</div>
        <div>
          <div ${s(`${fontStyle(f, 'heading')};font-size:0.9rem;color:${c.text}`)}>${t.author || ''}</div>
          <div ${s(`${fontStyle(f, 'body')};font-size:0.8rem;color:${c.textMuted}`)}>${t.role || ''}</div>
        </div>
      </div>
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`padding:clamp(4rem,8vw,7rem) 2rem;background:${c.background}`)}>
  <div ${s('max-width:1200px;margin:0 auto')}>
    <div ${s('text-align:center;margin-bottom:clamp(2rem,4vw,3.5rem)')}>
      <h2 ${s(`${fontStyle(f, 'heading')};font-size:clamp(1.8rem,4vw,2.75rem);color:${c.text};margin:0 0 12px;letter-spacing:-0.02em`)}>${title}</h2>
      <p ${s(`${fontStyle(f, 'body')};font-size:1.05rem;color:${c.textMuted};margin:0`)}>${subtitle}</p>
    </div>
    <div ${s('display:flex;gap:20px;flex-wrap:wrap;justify-content:center')}>
      ${cards}
    </div>
  </div>
</section>`
}

// ─── CTA: Premium Closing Section ───────────────────────────────────

export const generateCtaPremiumClose = (p: CTAParams): string => {
  const { title, subtitle, ctaText, ctaLink, items = [], palette: c, fonts: f } = p
  const benefits = items.slice(0, 3)

  return `<section class="motion-reveal" ${s(`padding:clamp(4rem,8vw,7rem) 2rem;background:linear-gradient(135deg, ${c.primary} 0%, ${c.secondary || c.primary} 100%);position:relative;overflow:hidden`)}>
  <div ${s('position:absolute;top:-50%;right:-20%;width:600px;height:600px;background:rgba(255,255,255,0.05);border-radius:50%;pointer-events:none')}></div>
  <div ${s('max-width:800px;margin:0 auto;text-align:center;position:relative;z-index:1')}>
    <h2 ${s(`${fontStyle(f, 'heading')};font-size:clamp(2rem,5vw,3.5rem);color:#fff;margin:0 0 16px;letter-spacing:-0.03em`)}>${title}</h2>
    <p ${s(`${fontStyle(f, 'body')};font-size:clamp(1rem,1.5vw,1.2rem);color:rgba(255,255,255,0.8);line-height:1.7;margin:0 0 36px;max-width:600px;margin-inline:auto`)}>${subtitle}</p>
    <a href="${ctaLink || '#'}" ${s(`display:inline-block;${fontStyle(f, 'body')};font-size:1rem;padding:16px 40px;background:#fff;color:${c.primary};border-radius:12px;text-decoration:none;font-weight:700;transition:all 0.3s;box-shadow:0 4px 20px rgba(0,0,0,0.15)`)} onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 32px rgba(0,0,0,0.2)'" onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.15)'">${ctaText || 'התחילו עכשיו'}</a>
    ${benefits.length > 0 ? `
    <div ${s('display:flex;gap:32px;justify-content:center;margin-top:40px;flex-wrap:wrap')}>
      ${benefits.map(b => `
      <div ${s('display:flex;align-items:center;gap:8px')}>
        <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="rgba(255,255,255,0.2)"/><path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
        <span ${s(`${fontStyle(f, 'body')};font-size:0.9rem;color:rgba(255,255,255,0.9)`)}>${b.benefit || b.title || b.description || ''}</span>
      </div>`).join('')}
    </div>` : ''}
  </div>
</section>`
}
