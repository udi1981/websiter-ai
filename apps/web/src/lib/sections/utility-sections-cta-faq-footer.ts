/**
 * Premium CTA, FAQ & Footer Section Generators
 *
 * Generates raw HTML strings for premium website sections.
 * These run inside iframes for generated websites — NOT React components.
 * Quality target: $50K custom-built sites (Apple, Stripe, Linear, Airbnb).
 *
 * Inspired by 21st.dev components: Sparkles (664), Background Paths (619),
 * Expandable Tabs (827), smooth accordion patterns.
 *
 * Uses CSS classes from section-effects.ts:
 *   motion-reveal, parallax-float, shimmer-btn, glow-card, gradient-mesh
 */

/* ------------------------------------------------------------------ */
/*  Types & Helpers                                                    */
/* ------------------------------------------------------------------ */

type SectionParams = {
  businessName: string
  businessType: string
  locale?: 'en' | 'he'
  primaryColor?: string
  secondaryColor?: string
  /** Content from AI planning — overrides hardcoded defaults when provided */
  title?: string
  subtitle?: string
  headline?: string
  subheadline?: string
  ctaText?: string
  ctaLink?: string
  items?: { title?: string; description?: string; icon?: string; q?: string; a?: string }[]
  notes?: string
  palette?: { primary: string; primaryHover: string; secondary: string; accent: string; background: string; backgroundAlt: string; text: string; textMuted: string; border: string }
  fonts?: { heading: string; body: string; headingWeight: string; bodyWeight: string }
}

const defaults = (p: SectionParams) => ({
  name: p.businessName,
  type: p.businessType,
  dir: p.locale === 'he' ? 'rtl' : 'ltr',
  lang: p.locale || 'en',
  primary: p.primaryColor || '#7C3AED',
  secondary: p.secondaryColor || '#06B6D4',
  isHe: p.locale === 'he',
  hf: p.fonts?.heading || (p.locale === 'he' ? 'Heebo' : 'Inter'),
  bf: p.fonts?.body || (p.locale === 'he' ? 'Heebo' : 'Inter'),
})

/** Generate a hex color with opacity suffix */
const alpha = (hex: string, a: string) => `${hex}${a}`

/** CTA copy — uses plan content when available, falls back to business type defaults */
const ctaCopy = (type: string, isHe: boolean, planContent?: { headline?: string; title?: string; subtitle?: string; subheadline?: string; ctaText?: string }) => {
  // Use plan-provided content when available
  if (planContent?.headline || planContent?.title) {
    return {
      heading: planContent.headline || planContent.title || '',
      sub: planContent.subheadline || planContent.subtitle || '',
      btn: planContent.ctaText || 'Get Started',
    }
  }
  // Fall back to hardcoded defaults
  const map: Record<string, { heading: string; sub: string; btn: string; heHeading: string; heSub: string; heBtn: string }> = {
    restaurant: {
      heading: 'Ready to Reserve Your Table?',
      sub: 'Experience culinary excellence — book your table today and enjoy an unforgettable dining experience.',
      btn: 'Reserve Now',
      heHeading: 'מוכנים להזמין שולחן?',
      heSub: 'חוו חוויה קולינרית יוצאת דופן — הזמינו שולחן היום.',
      heBtn: 'הזמינו עכשיו',
    },
    saas: {
      heading: 'Start Building Something Amazing',
      sub: 'Join thousands of teams already using our platform to ship faster and scale smarter.',
      btn: 'Start Free Trial',
      heHeading: 'התחילו לבנות משהו מדהים',
      heSub: 'הצטרפו לאלפי צוותים שכבר משתמשים בפלטפורמה שלנו.',
      heBtn: 'התחילו בחינם',
    },
    ecommerce: {
      heading: 'Don\'t Miss Out — Shop Now',
      sub: 'Free shipping on orders over $50. Premium quality products delivered to your door.',
      btn: 'Shop Collection',
      heHeading: 'אל תפספסו — קנו עכשיו',
      heSub: 'משלוח חינם בהזמנות מעל ₪200. מוצרים איכותיים עד הבית.',
      heBtn: 'לקולקציה',
    },
    default: {
      heading: 'Ready to Get Started?',
      sub: 'Take the first step toward transforming your business. Our team is here to help you succeed.',
      btn: 'Get Started',
      heHeading: 'מוכנים להתחיל?',
      heSub: 'עשו את הצעד הראשון לקראת הצלחה עסקית. הצוות שלנו כאן בשבילכם.',
      heBtn: 'בואו נתחיל',
    },
  }
  const c = map[type] || map.default
  return isHe
    ? { heading: c.heHeading, sub: c.heSub, btn: c.heBtn }
    : { heading: c.heading, sub: c.sub, btn: c.btn }
}

/** FAQ items — uses plan items when available, falls back to business type defaults */
const faqItems = (type: string, isHe: boolean, planItems?: { title?: string; description?: string; q?: string; a?: string }[]): { q: string; a: string }[] => {
  // Use plan-provided FAQ items when available
  if (planItems?.length) {
    return planItems.map(item => ({
      q: item.q || item.title || 'Question',
      a: item.a || item.description || 'Answer',
    }))
  }
  // Fall back to hardcoded defaults
  if (isHe) {
    return [
      { q: 'איך מתחילים?', a: 'ההרשמה פשוטה ולוקחת פחות מדקה. פשוט לחצו על "התחילו בחינם" ועקבו אחר ההוראות.' },
      { q: 'האם יש תקופת ניסיון?', a: 'כן! אנחנו מציעים 14 ימי ניסיון חינם ללא צורך בכרטיס אשראי. תוכלו לבדוק את כל התכונות.' },
      { q: 'מהן אפשרויות התשלום?', a: 'אנחנו מקבלים כרטיסי אשראי, PayPal, והעברות בנקאיות. כל התשלומים מאובטחים ומוצפנים.' },
      { q: 'האם אפשר לבטל בכל עת?', a: 'בהחלט. אין התחייבויות ואפשר לבטל את המנוי בכל רגע דרך הגדרות החשבון.' },
      { q: 'יש תמיכה טכנית?', a: 'הצוות שלנו זמין 24/7 דרך צ\'אט, אימייל וטלפון. זמן התגובה הממוצע הוא פחות מ-5 דקות.' },
      { q: 'האם הנתונים שלי מאובטחים?', a: 'אבטחת המידע היא בראש סדר העדיפויות שלנו. אנחנו משתמשים בהצפנה מתקדמת ועומדים בתקני אבטחה בינלאומיים.' },
    ]
  }
  const items: Record<string, { q: string; a: string }[]> = {
    restaurant: [
      { q: 'How do I make a reservation?', a: 'You can book a table directly through our website, call us, or use the reservation button. Walk-ins are also welcome based on availability.' },
      { q: 'Do you accommodate dietary restrictions?', a: 'Absolutely! Our kitchen can accommodate vegetarian, vegan, gluten-free, and other dietary needs. Please let us know when booking.' },
      { q: 'What are your opening hours?', a: 'We are open Monday to Saturday from 11:00 AM to 11:00 PM, and Sunday from 10:00 AM to 10:00 PM for brunch and dinner.' },
      { q: 'Is there parking available?', a: 'Yes, we offer complimentary valet parking for dinner guests. There is also a public parking garage within a 2-minute walk.' },
      { q: 'Can I host a private event?', a: 'We have a beautiful private dining room that seats up to 40 guests. Contact our events team for custom menus and pricing.' },
      { q: 'Do you offer takeout or delivery?', a: 'Yes! Order through our website or major delivery platforms. Takeout orders receive a 10% discount when ordered directly.' },
    ],
    default: [
      { q: 'How do I get started?', a: 'Getting started is simple and takes less than a minute. Click the "Get Started" button and follow the step-by-step onboarding process.' },
      { q: 'Is there a free trial?', a: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.' },
      { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and bank transfers. All payments are secured with bank-level encryption.' },
      { q: 'Can I cancel anytime?', a: 'Absolutely. There are no long-term commitments. You can cancel your subscription at any time from your account settings.' },
      { q: 'Do you offer customer support?', a: 'Our support team is available 24/7 via live chat, email, and phone. Average response time is under 5 minutes.' },
      { q: 'Is my data secure?', a: 'Security is our top priority. We use industry-leading encryption and comply with international security standards including SOC 2 and GDPR.' },
    ],
  }
  return items[type] || items.default
}

/** Footer links */
const footerLinks = (isHe: boolean) => isHe
  ? {
    product: { title: 'מוצר', links: ['תכונות', 'תמחור', 'אינטגרציות', 'עדכונים'] },
    company: { title: 'חברה', links: ['אודות', 'קריירה', 'בלוג', 'צור קשר'] },
    resources: { title: 'משאבים', links: ['מדריכים', 'תיעוד', 'API', 'קהילה'] },
    legal: { title: 'משפטי', links: ['פרטיות', 'תנאי שימוש', 'אבטחה', 'נגישות'] },
  }
  : {
    product: { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
    company: { title: 'Company', links: ['About', 'Careers', 'Blog', 'Contact'] },
    resources: { title: 'Resources', links: ['Guides', 'Documentation', 'API Reference', 'Community'] },
    legal: { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security', 'Accessibility'] },
  }

const reducedMotionCSS = `@media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important}}`

/* ================================================================== */
/*  CTA SECTIONS — 8 variants                                         */
/* ================================================================== */

/** 1. Full-width animated gradient + large CTA button with shimmer effect */
export const generateCtaGradientBanner = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const copy = ctaCopy(params.businessType, isHe, params)
  return `<section dir="${dir}" style="position:relative;overflow:hidden;padding:100px 24px;text-align:center;background:linear-gradient(135deg,${primary},${secondary},${alpha(primary, 'CC')});background-size:300% 300%;animation:ctaGradientShift 8s ease infinite">
  <style>
    @keyframes ctaGradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes ctaShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    .cta-grad-btn{display:inline-block;padding:18px 48px;font-size:1.125rem;font-weight:700;color:${primary};background:#fff;border-radius:12px;text-decoration:none;position:relative;overflow:hidden;transition:transform .3s,box-shadow .3s}
    .cta-grad-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);background-size:200% 100%;animation:ctaShimmer 3s ease infinite}
    .cta-grad-btn:hover{transform:translateY(-3px);box-shadow:0 20px 60px rgba(0,0,0,.2)}
    .cta-grad-sparkle{position:absolute;border-radius:50%;background:rgba(255,255,255,.15);pointer-events:none}
    ${reducedMotionCSS}
  </style>
  <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none">
    <div class="cta-grad-sparkle" style="width:300px;height:300px;top:-50px;inset-inline-end:-50px;filter:blur(80px)"></div>
    <div class="cta-grad-sparkle" style="width:250px;height:250px;bottom:-40px;inset-inline-start:-40px;filter:blur(60px)"></div>
  </div>
  <div style="position:relative;z-index:1;max-width:800px;margin:0 auto">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,5vw,3.5rem);color:#fff;margin:0 0 20px;line-height:1.15;letter-spacing:-0.02em">${copy.heading}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.2rem;color:rgba(255,255,255,.85);margin:0 0 40px;line-height:1.6;max-width:600px;margin-inline:auto">${copy.sub}</p>
    <a href="#" class="cta-grad-btn">${copy.btn}</a>
    <p style="font-family:'${bf}',sans-serif;font-size:0.85rem;color:rgba(255,255,255,.6);margin-top:16px">${isHe ? 'ללא התחייבות · ביטול בכל עת' : 'No commitment · Cancel anytime'}</p>
  </div>
</section>`
}

/** 2. Text on one side, image placeholder on the other, with parallax float */
export const generateCtaSplitImage = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const copy = ctaCopy(params.businessType, isHe, params)
  return `<section dir="${dir}" style="background:#0B0F1A;padding:80px 24px;overflow:hidden">
  <style>
    .cta-split-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;max-width:1200px;margin:0 auto}
    @media(max-width:768px){.cta-split-grid{grid-template-columns:1fr;text-align:center}}
    .cta-split-img{position:relative;border-radius:20px;overflow:hidden;aspect-ratio:4/3;background:linear-gradient(135deg,${alpha(primary, '33')},${alpha(secondary, '33')});display:flex;align-items:center;justify-content:center}
    .cta-split-float{animation:ctaSplitFloat 6s ease-in-out infinite}
    @keyframes ctaSplitFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
    .cta-split-btn{display:inline-block;padding:16px 40px;background:${primary};color:#fff;font-weight:700;font-size:1.05rem;border-radius:12px;text-decoration:none;transition:all .3s}
    .cta-split-btn:hover{background:${secondary};transform:translateY(-2px);box-shadow:0 12px 40px ${alpha(primary, '44')}}
    ${reducedMotionCSS}
  </style>
  <div class="cta-split-grid">
    <div>
      <span style="display:inline-block;padding:6px 16px;background:${alpha(primary, '22')};color:${primary};border-radius:9999px;font-size:0.85rem;font-weight:600;margin-bottom:20px;font-family:'${bf}',sans-serif">${isHe ? 'הצטרפו אלינו' : 'Join Us Today'}</span>
      <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(1.8rem,4vw,3rem);color:#fff;margin:0 0 20px;line-height:1.2;letter-spacing:-0.02em">${copy.heading}</h2>
      <p style="font-family:'${bf}',sans-serif;font-size:1.1rem;color:rgba(255,255,255,.65);margin:0 0 36px;line-height:1.7">${copy.sub}</p>
      <a href="#" class="cta-split-btn">${copy.btn}</a>
    </div>
    <div class="cta-split-img cta-split-float">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
      <div style="position:absolute;inset:0;border:2px solid ${alpha(primary, '33')};border-radius:20px;pointer-events:none"></div>
    </div>
  </div>
</section>`
}

/** 3. Elevated card centered on the page with glow effect + shimmer button */
export const generateCtaFloatingCard = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const copy = ctaCopy(params.businessType, isHe, params)
  return `<section dir="${dir}" style="padding:100px 24px;background:#0B0F1A;display:flex;align-items:center;justify-content:center">
  <style>
    @keyframes ctaGlow{0%,100%{box-shadow:0 0 40px ${alpha(primary, '22')},0 20px 80px ${alpha(primary, '11')}}50%{box-shadow:0 0 60px ${alpha(primary, '33')},0 20px 100px ${alpha(primary, '22')}}}
    @keyframes ctaCardShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    .cta-float-card{position:relative;max-width:640px;width:100%;padding:56px 48px;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.08);border-radius:24px;text-align:center;animation:ctaGlow 4s ease-in-out infinite;backdrop-filter:blur(12px)}
    .cta-float-btn{display:inline-block;padding:16px 44px;font-size:1.05rem;font-weight:700;background:${primary};color:#fff;border-radius:12px;text-decoration:none;position:relative;overflow:hidden;transition:transform .3s,box-shadow .3s}
    .cta-float-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);background-size:200% 100%;animation:ctaCardShimmer 2.5s ease infinite}
    .cta-float-btn:hover{transform:translateY(-3px);box-shadow:0 16px 48px ${alpha(primary, '44')}}
    ${reducedMotionCSS}
  </style>
  <div class="cta-float-card motion-reveal">
    <div style="width:56px;height:56px;border-radius:16px;background:${alpha(primary, '22')};display:flex;align-items:center;justify-content:center;margin:0 auto 24px">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="2" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    </div>
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(1.6rem,3.5vw,2.5rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em">${copy.heading}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.6);margin:0 0 36px;line-height:1.7;max-width:460px;margin-inline:auto">${copy.sub}</p>
    <a href="#" class="cta-float-btn">${copy.btn}</a>
    <div style="display:flex;gap:32px;justify-content:center;margin-top:32px">
      <div style="text-align:center"><div style="font-family:'${hf}',sans-serif;font-weight:800;font-size:1.5rem;color:#fff">10K+</div><div style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.45)">${isHe ? 'לקוחות' : 'Customers'}</div></div>
      <div style="text-align:center"><div style="font-family:'${hf}',sans-serif;font-weight:800;font-size:1.5rem;color:#fff">99%</div><div style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.45)">${isHe ? 'שביעות רצון' : 'Satisfaction'}</div></div>
      <div style="text-align:center"><div style="font-family:'${hf}',sans-serif;font-weight:800;font-size:1.5rem;color:#fff">24/7</div><div style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.45)">${isHe ? 'תמיכה' : 'Support'}</div></div>
    </div>
  </div>
</section>`
}

/** 4. Email capture CTA with input validation animation + spring effect */
export const generateCtaNewsletter = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  return `<section dir="${dir}" style="padding:80px 24px;background:#0B0F1A">
  <style>
    @keyframes ctaSpring{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
    .cta-nl-wrap{max-width:600px;margin:0 auto;text-align:center}
    .cta-nl-form{display:flex;gap:12px;margin-top:32px;position:relative}
    .cta-nl-input{flex:1;padding:16px 20px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:1rem;font-family:'${bf}',sans-serif;outline:none;transition:border-color .3s,box-shadow .3s}
    .cta-nl-input:focus{border-color:${primary};box-shadow:0 0 20px ${alpha(primary, '22')}}
    .cta-nl-input.invalid{border-color:#EF4444;animation:ctaShake .4s ease}
    .cta-nl-input.valid{border-color:#10B981}
    .cta-nl-submit{padding:16px 32px;background:${primary};color:#fff;border:none;border-radius:12px;font-weight:700;font-size:1rem;cursor:pointer;transition:all .3s;font-family:'${bf}',sans-serif;white-space:nowrap}
    .cta-nl-submit:hover{background:${secondary};animation:ctaSpring .4s ease}
    @keyframes ctaShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
    @media(max-width:640px){.cta-nl-form{flex-direction:column}}
    ${reducedMotionCSS}
  </style>
  <div class="cta-nl-wrap motion-reveal">
    <div style="width:48px;height:48px;border-radius:12px;background:${alpha(primary, '22')};display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    </div>
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(1.6rem,3.5vw,2.5rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${isHe ? 'הישארו מעודכנים' : 'Stay in the Loop'}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.6);margin:0;line-height:1.6">${isHe ? `קבלו עדכונים, טיפים ומבצעים ישירות מ${name}.` : `Get the latest updates, tips, and exclusive offers from ${name}.`}</p>
    <form class="cta-nl-form" onsubmit="return false">
      <input type="email" class="cta-nl-input" placeholder="${isHe ? 'כתובת אימייל' : 'Enter your email'}" id="ctaNlEmail" />
      <button type="button" class="cta-nl-submit" onclick="(function(){var e=document.getElementById('ctaNlEmail');var v=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(e.value);e.classList.remove('valid','invalid');e.classList.add(v?'valid':'invalid');if(v){e.value='';e.placeholder='${isHe ? 'תודה! ✓' : 'Thank you! ✓'}'}})()">
        ${isHe ? 'הרשמה' : 'Subscribe'}
      </button>
    </form>
    <p style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.35);margin-top:16px">${isHe ? 'ללא ספאם. ניתן לבטל בכל עת.' : 'No spam. Unsubscribe anytime.'}</p>
  </div>
</section>`
}

/** 5. Urgency timer (animated digits) + CTA button */
export const generateCtaCountdown = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const copy = ctaCopy(params.businessType, isHe, params)
  return `<section dir="${dir}" style="padding:80px 24px;background:linear-gradient(180deg,#0B0F1A 0%,${alpha(primary, '11')} 100%);text-align:center">
  <style>
    .cta-cd-grid{display:flex;gap:16px;justify-content:center;margin:32px 0 40px;flex-wrap:wrap}
    .cta-cd-box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px 24px;min-width:90px;text-align:center;backdrop-filter:blur(8px)}
    .cta-cd-num{font-family:'${bf}',monospace;font-weight:800;font-size:clamp(2rem,5vw,3rem);color:#fff;line-height:1;transition:transform .3s}
    .cta-cd-label{font-family:'${bf}',sans-serif;font-size:0.75rem;color:rgba(255,255,255,.45);margin-top:8px;text-transform:uppercase;letter-spacing:0.1em}
    .cta-cd-btn{display:inline-block;padding:18px 48px;background:${primary};color:#fff;font-weight:700;font-size:1.1rem;border-radius:12px;text-decoration:none;transition:all .3s;position:relative;overflow:hidden}
    .cta-cd-btn:hover{background:${secondary};transform:translateY(-2px);box-shadow:0 16px 48px ${alpha(primary, '33')}}
    .cta-cd-pulse{animation:cdPulse 2s ease-in-out infinite}
    @keyframes cdPulse{0%,100%{box-shadow:0 0 0 0 ${alpha(primary, '44')}}50%{box-shadow:0 0 0 12px ${alpha(primary, '00')}}}
    ${reducedMotionCSS}
  </style>
  <div style="max-width:700px;margin:0 auto" class="motion-reveal">
    <span style="display:inline-block;padding:6px 16px;background:${alpha(primary, '22')};color:${primary};border-radius:9999px;font-size:0.85rem;font-weight:600;margin-bottom:16px;font-family:'${bf}',sans-serif">${isHe ? '⏰ מבצע מוגבל בזמן' : '⏰ Limited Time Offer'}</span>
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(1.8rem,4vw,2.75rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${isHe ? 'המבצע נגמר בקרוב' : 'Offer Ends Soon'}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.6);margin:0;line-height:1.6">${copy.sub}</p>
    <div class="cta-cd-grid">
      <div class="cta-cd-box"><div class="cta-cd-num" id="cd-days">03</div><div class="cta-cd-label">${isHe ? 'ימים' : 'Days'}</div></div>
      <div class="cta-cd-box"><div class="cta-cd-num" id="cd-hours">12</div><div class="cta-cd-label">${isHe ? 'שעות' : 'Hours'}</div></div>
      <div class="cta-cd-box"><div class="cta-cd-num" id="cd-mins">45</div><div class="cta-cd-label">${isHe ? 'דקות' : 'Minutes'}</div></div>
      <div class="cta-cd-box"><div class="cta-cd-num" id="cd-secs">00</div><div class="cta-cd-label">${isHe ? 'שניות' : 'Seconds'}</div></div>
    </div>
    <a href="#" class="cta-cd-btn cta-cd-pulse">${copy.btn}</a>
  </div>
  <script>
  (function(){
    var end=Date.now()+3*24*60*60*1000+12*60*60*1000+45*60*1000;
    function pad(n){return n<10?'0'+n:''+n}
    function tick(){
      var d=Math.max(0,end-Date.now());
      var s=Math.floor(d/1000);
      var m=Math.floor(s/60);s%=60;
      var h=Math.floor(m/60);m%=60;
      var dy=Math.floor(h/24);h%=24;
      var el=document.getElementById('cd-days');if(el)el.textContent=pad(dy);
      el=document.getElementById('cd-hours');if(el)el.textContent=pad(h);
      el=document.getElementById('cd-mins');if(el)el.textContent=pad(m);
      el=document.getElementById('cd-secs');if(el)el.textContent=pad(s);
    }
    tick();setInterval(tick,1000);
  })();
  </script>
</section>`
}

/** 6. Fixed bottom bar with blur backdrop (position: fixed) */
export const generateCtaStickyBottom = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const copy = ctaCopy(params.businessType, isHe, params)
  return `<div dir="${dir}" id="cta-sticky-bar" style="position:fixed;bottom:0;inset-inline-start:0;inset-inline-end:0;z-index:9999;background:rgba(11,15,26,.85);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,.08);padding:14px 24px;transform:translateY(100%);transition:transform .5s cubic-bezier(.4,0,.2,1)">
  <style>
    .cta-sticky-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
    .cta-sticky-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 32px;background:${primary};color:#fff;font-weight:700;font-size:0.95rem;border-radius:10px;text-decoration:none;transition:all .3s;font-family:'${bf}',sans-serif;white-space:nowrap}
    .cta-sticky-btn:hover{background:${secondary};transform:translateY(-1px);box-shadow:0 8px 24px ${alpha(primary, '33')}}
    .cta-sticky-close{background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;padding:8px;font-size:1.2rem;transition:color .3s}
    .cta-sticky-close:hover{color:#fff}
    @media(max-width:640px){.cta-sticky-inner{flex-direction:column;text-align:center}}
    ${reducedMotionCSS}
  </style>
  <div class="cta-sticky-inner">
    <div>
      <p style="font-family:'${hf}',sans-serif;font-weight:700;font-size:1rem;color:#fff;margin:0">${copy.heading}</p>
      <p style="font-family:'${bf}',sans-serif;font-size:0.85rem;color:rgba(255,255,255,.5);margin:4px 0 0">${isHe ? 'הטבה מיוחדת למצטרפים חדשים' : 'Special offer for new members'}</p>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <a href="#" class="cta-sticky-btn">${copy.btn} →</a>
      <button class="cta-sticky-close" onclick="document.getElementById('cta-sticky-bar').style.transform='translateY(100%)'" aria-label="${isHe ? 'סגור' : 'Close'}">✕</button>
    </div>
  </div>
</div>
<script>
(function(){
  var bar=document.getElementById('cta-sticky-bar');
  if(!bar)return;
  setTimeout(function(){bar.style.transform='translateY(0)'},2000);
  window.addEventListener('scroll',function(){
    bar.style.transform=window.scrollY>400?'translateY(0)':'translateY(100%)';
  },{passive:true});
})();
</script>`
}

/** 7. CTA overlay on a gradient background simulating video */
export const generateCtaVideoBackground = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const copy = ctaCopy(params.businessType, isHe, params)
  return `<section dir="${dir}" style="position:relative;min-height:500px;display:flex;align-items:center;justify-content:center;padding:80px 24px;overflow:hidden">
  <style>
    @keyframes ctaVideoBg{0%{background-position:0% 0%}50%{background-position:100% 100%}100%{background-position:0% 0%}}
    @keyframes ctaVideoOrb{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.1)}66%{transform:translate(-20px,30px) scale(0.9)}}
    .cta-video-bg{position:absolute;inset:0;background:linear-gradient(135deg,#0B0F1A,${alpha(primary, '44')},${alpha(secondary, '33')},#0B0F1A);background-size:400% 400%;animation:ctaVideoBg 12s ease infinite}
    .cta-video-orb{position:absolute;border-radius:50%;filter:blur(100px);opacity:.4;animation:ctaVideoOrb 10s ease-in-out infinite;pointer-events:none}
    .cta-video-overlay{position:absolute;inset:0;background:rgba(0,0,0,.4);z-index:1}
    .cta-video-content{position:relative;z-index:2;text-align:center;max-width:700px}
    .cta-video-btn{display:inline-flex;align-items:center;gap:10px;padding:18px 44px;background:#fff;color:${primary};font-weight:700;font-size:1.1rem;border-radius:12px;text-decoration:none;transition:all .3s;font-family:'${bf}',sans-serif}
    .cta-video-btn:hover{transform:scale(1.05);box-shadow:0 20px 60px rgba(0,0,0,.3)}
    .cta-video-play{display:inline-flex;align-items:center;gap:8px;color:rgba(255,255,255,.8);font-family:'${bf}',sans-serif;font-size:0.95rem;text-decoration:none;margin-inline-start:24px;transition:color .3s}
    .cta-video-play:hover{color:#fff}
    ${reducedMotionCSS}
  </style>
  <div class="cta-video-bg"></div>
  <div class="cta-video-orb" style="width:400px;height:400px;background:${primary};top:-100px;inset-inline-end:-100px"></div>
  <div class="cta-video-orb" style="width:300px;height:300px;background:${secondary};bottom:-80px;inset-inline-start:-80px;animation-delay:-5s"></div>
  <div class="cta-video-overlay"></div>
  <div class="cta-video-content motion-reveal">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,5vw,3.5rem);color:#fff;margin:0 0 20px;line-height:1.15;letter-spacing:-0.02em">${copy.heading}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.15rem;color:rgba(255,255,255,.75);margin:0 0 40px;line-height:1.7">${copy.sub}</p>
    <div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:16px">
      <a href="#" class="cta-video-btn">${copy.btn}</a>
      <a href="#" class="cta-video-play">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
        ${isHe ? 'צפו בסרטון' : 'Watch Video'}
      </a>
    </div>
  </div>
</section>`
}

/** 8. Frosted glass card with blur + refraction gradient border */
export const generateCtaGlassmorphism = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const copy = ctaCopy(params.businessType, isHe, params)
  return `<section dir="${dir}" style="padding:100px 24px;background:#0B0F1A;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
  <style>
    .cta-glass-card{position:relative;max-width:560px;width:100%;padding:52px 44px;border-radius:24px;text-align:center;background:rgba(255,255,255,.04);backdrop-filter:blur(24px);z-index:1}
    .cta-glass-border{position:absolute;inset:-1px;border-radius:25px;background:linear-gradient(135deg,${alpha(primary, '66')},transparent 40%,transparent 60%,${alpha(secondary, '66')});z-index:-1;animation:ctaGlassRotate 6s linear infinite}
    .cta-glass-inner{position:absolute;inset:1px;border-radius:23px;background:#0B0F1A;z-index:-1}
    @keyframes ctaGlassRotate{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
    .cta-glass-btn{display:inline-block;padding:16px 44px;background:linear-gradient(135deg,${primary},${secondary});color:#fff;font-weight:700;font-size:1.05rem;border-radius:12px;text-decoration:none;transition:all .3s;font-family:'${bf}',sans-serif}
    .cta-glass-btn:hover{transform:translateY(-3px);box-shadow:0 16px 48px ${alpha(primary, '44')}}
    .cta-glass-orb{position:absolute;border-radius:50%;filter:blur(120px);pointer-events:none}
    @media(max-width:640px){.cta-glass-card{padding:40px 24px}}
    ${reducedMotionCSS}
  </style>
  <div class="cta-glass-orb" style="width:300px;height:300px;background:${primary};top:-100px;inset-inline-start:20%;opacity:.15"></div>
  <div class="cta-glass-orb" style="width:250px;height:250px;background:${secondary};bottom:-80px;inset-inline-end:20%;opacity:.12"></div>
  <div class="cta-glass-card motion-reveal">
    <div class="cta-glass-border"></div>
    <div class="cta-glass-inner"></div>
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(1.6rem,3.5vw,2.25rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em">${copy.heading}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1rem;color:rgba(255,255,255,.55);margin:0 0 32px;line-height:1.7">${copy.sub}</p>
    <a href="#" class="cta-glass-btn">${copy.btn}</a>
    <div style="display:flex;gap:8px;justify-content:center;align-items:center;margin-top:20px">
      <div style="display:flex">
        ${[1,2,3,4,5].map(() => `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,${alpha(primary, '44')},${alpha(secondary, '44')});border:2px solid #0B0F1A;margin-inline-start:-8px"></div>`).join('')}
      </div>
      <span style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.45);margin-inline-start:4px">${isHe ? '1,000+ הצטרפו השבוע' : '1,000+ joined this week'}</span>
    </div>
  </div>
</section>`
}


/* ================================================================== */
/*  FAQ SECTIONS — 5 variants                                         */
/* ================================================================== */

/** 1. Smooth details/summary with CSS grid-template-rows transition */
export const generateFaqAccordion = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const items = faqItems(params.businessType, isHe, params.items)
  const accordionItems = items.map((item, i) => `
    <div class="faq-acc-item" style="border-bottom:1px solid rgba(255,255,255,.08)">
      <button class="faq-acc-trigger" onclick="(function(el){var c=el.nextElementSibling;var open=c.classList.toggle('faq-acc-open');el.querySelector('.faq-acc-icon').style.transform=open?'rotate(45deg)':'rotate(0)'})(this)" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:24px 0;background:none;border:none;cursor:pointer;text-align:inherit">
        <span style="font-family:'${bf}',sans-serif;font-weight:600;font-size:1.05rem;color:#fff">${item.q}</span>
        <span class="faq-acc-icon" style="font-size:1.5rem;color:${primary};transition:transform .3s ease;flex-shrink:0;margin-inline-start:16px">+</span>
      </button>
      <div class="faq-acc-content" style="display:grid;grid-template-rows:0fr;transition:grid-template-rows .35s ease,padding .35s ease;padding-bottom:0">
        <div style="overflow:hidden">
          <p style="font-family:'${bf}',sans-serif;font-size:0.95rem;color:rgba(255,255,255,.6);line-height:1.7;margin:0;padding-bottom:24px">${item.a}</p>
        </div>
      </div>
    </div>`).join('')

  return `<section dir="${dir}" style="padding:80px 24px;background:#0B0F1A">
  <style>
    .faq-acc-content{display:grid;grid-template-rows:0fr;transition:grid-template-rows .35s ease}
    .faq-acc-content.faq-acc-open{grid-template-rows:1fr}
    .faq-acc-trigger:hover span:first-child{color:${primary}}
    ${reducedMotionCSS}
  </style>
  <div style="max-width:720px;margin:0 auto" class="motion-reveal">
    <div style="text-align:center;margin-bottom:48px">
      <span style="display:inline-block;padding:6px 16px;background:${alpha(primary, '22')};color:${primary};border-radius:9999px;font-size:0.85rem;font-weight:600;margin-bottom:16px;font-family:'${bf}',sans-serif">${isHe ? 'שאלות נפוצות' : 'FAQ'}</span>
      <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(1.8rem,4vw,2.75rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${isHe ? 'שאלות ותשובות' : 'Frequently Asked Questions'}</h2>
      <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.55);margin:0">${isHe ? `כל מה שצריך לדעת על ${name}` : `Everything you need to know about ${name}`}</p>
    </div>
    <div>${accordionItems}</div>
    <div style="text-align:center;margin-top:40px;padding:32px;background:rgba(255,255,255,.03);border-radius:16px;border:1px solid rgba(255,255,255,.06)">
      <p style="font-family:'${bf}',sans-serif;font-size:0.95rem;color:rgba(255,255,255,.5);margin:0 0 12px">${isHe ? 'עדיין יש שאלות?' : 'Still have questions?'}</p>
      <a href="#" style="font-family:'${bf}',sans-serif;font-weight:600;color:${primary};text-decoration:none;font-size:0.95rem;transition:color .3s" onmouseenter="this.style.color='${secondary}'" onmouseleave="this.style.color='${primary}'">${isHe ? 'צרו איתנו קשר →' : 'Contact our team →'}</a>
    </div>
  </div>
</section>`
}

/** 2. Search input + filtered accordion */
export const generateFaqSearchable = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const items = faqItems(params.businessType, isHe, params.items)
  const faqDataAttr = items.map((item, i) => `data-q${i}="${item.q.toLowerCase()}" data-a${i}="${item.a.toLowerCase()}"`).join(' ')

  const accordionItems = items.map((item, i) => `
    <div class="faq-search-item" data-index="${i}" data-text="${item.q.toLowerCase()} ${item.a.toLowerCase()}" style="border:1px solid rgba(255,255,255,.06);border-radius:12px;margin-bottom:8px;overflow:hidden;transition:opacity .3s,max-height .3s">
      <button class="faq-search-trigger" onclick="(function(el){var c=el.nextElementSibling;var open=c.style.maxHeight;c.style.maxHeight=open&&open!=='0px'?'0px':c.scrollHeight+'px';el.querySelector('.faq-s-chevron').style.transform=(!open||open==='0px')?'rotate(180deg)':'rotate(0)'})(this)" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:18px 20px;background:rgba(255,255,255,.03);border:none;cursor:pointer;text-align:inherit">
        <span style="font-family:'${bf}',sans-serif;font-weight:600;font-size:1rem;color:#fff">${item.q}</span>
        <svg class="faq-s-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="2" stroke-linecap="round" style="transition:transform .3s;flex-shrink:0;margin-inline-start:12px"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div style="max-height:0;overflow:hidden;transition:max-height .35s ease">
        <p style="font-family:'${bf}',sans-serif;font-size:0.95rem;color:rgba(255,255,255,.6);line-height:1.7;margin:0;padding:0 20px 20px">${item.a}</p>
      </div>
    </div>`).join('')

  return `<section dir="${dir}" style="padding:80px 24px;background:#0B0F1A">
  <style>
    .faq-search-input{width:100%;padding:16px 20px 16px 48px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.08);border-radius:14px;color:#fff;font-size:1rem;font-family:'${bf}',sans-serif;outline:none;transition:border-color .3s,box-shadow .3s}
    .faq-search-input:focus{border-color:${primary};box-shadow:0 0 20px ${alpha(primary, '15')}}
    .faq-search-trigger:hover{background:rgba(255,255,255,.05)!important}
    .faq-search-item.faq-hidden{opacity:0;max-height:0!important;margin:0!important;padding:0!important;border:none!important;pointer-events:none}
    ${reducedMotionCSS}
  </style>
  <div style="max-width:720px;margin:0 auto" class="motion-reveal">
    <div style="text-align:center;margin-bottom:40px">
      <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(1.8rem,4vw,2.75rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${isHe ? 'איך נוכל לעזור?' : 'How Can We Help?'}</h2>
      <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.55);margin:0">${isHe ? 'חפשו בין השאלות הנפוצות שלנו' : 'Search through our frequently asked questions'}</p>
    </div>
    <div style="position:relative;margin-bottom:32px">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round" style="position:absolute;inset-inline-start:16px;top:50%;transform:translateY(-50%)"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" class="faq-search-input" placeholder="${isHe ? 'חיפוש שאלות...' : 'Search questions...'}" id="faqSearchInput" oninput="(function(v){var items=document.querySelectorAll('.faq-search-item');items.forEach(function(el){var t=el.getAttribute('data-text');el.classList.toggle('faq-hidden',v.length>1&&t.indexOf(v.toLowerCase())===-1)})})(this.value)" />
    </div>
    <div id="faqSearchList">${accordionItems}</div>
  </div>
</section>`
}

/** 3. Tab categories + accordion groups */
export const generateFaqCategorized = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const items = faqItems(params.businessType, isHe, params.items)
  const categories = isHe
    ? [{ name: 'כללי', items: items.slice(0, 3) }, { name: 'חשבון ותשלום', items: items.slice(3) }]
    : [{ name: 'General', items: items.slice(0, 3) }, { name: 'Billing & Account', items: items.slice(3) }]

  const tabBtns = categories.map((cat, ci) => `<button class="faq-cat-tab${ci === 0 ? ' faq-cat-active' : ''}" data-cattab="${ci}" onclick="(function(el){document.querySelectorAll('.faq-cat-tab').forEach(function(t){t.classList.remove('faq-cat-active');t.style.background='transparent';t.style.color='rgba(255,255,255,.5)'});el.classList.add('faq-cat-active');el.style.background='${alpha(primary, '22')}';el.style.color='${primary}';document.querySelectorAll('.faq-cat-panel').forEach(function(p){p.style.display='none'});var p=document.querySelector('[data-catpanel=\"'+el.dataset.cattab+'\"]');if(p)p.style.display='block'})(this)" style="padding:10px 24px;border:none;border-radius:10px;cursor:pointer;font-family:'${bf}',sans-serif;font-size:0.95rem;font-weight:600;transition:all .3s;background:${ci === 0 ? alpha(primary, '22') : 'transparent'};color:${ci === 0 ? primary : 'rgba(255,255,255,.5)'}">${cat.name}</button>`).join('')

  const panels = categories.map((cat, ci) => {
    const catItems = cat.items.map((item, i) => `
      <div style="border-bottom:1px solid rgba(255,255,255,.06)">
        <button onclick="(function(el){var c=el.nextElementSibling;var open=c.style.maxHeight;c.style.maxHeight=open&&open!=='0px'?'0px':c.scrollHeight+'px';el.querySelector('.faq-cat-icon').textContent=(!open||open==='0px')?'−':'+'})(this)" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:20px 0;background:none;border:none;cursor:pointer;text-align:inherit">
          <span style="font-family:'${bf}',sans-serif;font-weight:600;font-size:1rem;color:#fff">${item.q}</span>
          <span class="faq-cat-icon" style="color:${primary};font-size:1.3rem;flex-shrink:0;margin-inline-start:16px;transition:transform .3s">+</span>
        </button>
        <div style="max-height:0;overflow:hidden;transition:max-height .35s ease">
          <p style="font-family:'${bf}',sans-serif;font-size:0.95rem;color:rgba(255,255,255,.6);line-height:1.7;margin:0;padding-bottom:20px">${item.a}</p>
        </div>
      </div>`).join('')
    return `<div class="faq-cat-panel" data-catpanel="${ci}" style="display:${ci === 0 ? 'block' : 'none'}">${catItems}</div>`
  }).join('')

  return `<section dir="${dir}" style="padding:80px 24px;background:#0B0F1A">
  <style>
    .faq-cat-tab:hover{background:${alpha(primary, '11')}!important;color:${primary}!important}
    ${reducedMotionCSS}
  </style>
  <div style="max-width:720px;margin:0 auto" class="motion-reveal">
    <div style="text-align:center;margin-bottom:40px">
      <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(1.8rem,4vw,2.75rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${isHe ? 'שאלות נפוצות' : 'Frequently Asked Questions'}</h2>
      <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.55);margin:0">${isHe ? 'בחרו קטגוריה למצוא תשובות' : 'Choose a category to find answers'}</p>
    </div>
    <div style="display:flex;gap:8px;justify-content:center;margin-bottom:36px;flex-wrap:wrap">${tabBtns}</div>
    ${panels}
  </div>
</section>`
}

/** 4. 2-column split layout with stagger reveal on scroll */
export const generateFaqTwoColumn = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const items = faqItems(params.businessType, isHe, params.items)
  const half = Math.ceil(items.length / 2)
  const col1 = items.slice(0, half)
  const col2 = items.slice(half)

  const renderItem = (item: { q: string; a: string }, delay: number) => `
    <div class="faq-2col-item motion-reveal" style="padding:24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;transition:transform .3s,box-shadow .3s;animation-delay:${delay}ms">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">
        <div style="width:28px;height:28px;border-radius:8px;background:${alpha(primary, '22')};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h3 style="font-family:'${hf}',sans-serif;font-weight:700;font-size:1rem;color:#fff;margin:0">${item.q}</h3>
      </div>
      <p style="font-family:'${bf}',sans-serif;font-size:0.9rem;color:rgba(255,255,255,.55);line-height:1.7;margin:0;padding-inline-start:40px">${item.a}</p>
    </div>`

  return `<section dir="${dir}" style="padding:80px 24px;background:#0B0F1A">
  <style>
    .faq-2col-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:1000px;margin:0 auto}
    .faq-2col-item:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.15)}
    @media(max-width:768px){.faq-2col-grid{grid-template-columns:1fr}}
    ${reducedMotionCSS}
  </style>
  <div style="max-width:1000px;margin:0 auto" class="motion-reveal">
    <div style="text-align:center;margin-bottom:48px">
      <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(1.8rem,4vw,2.75rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${isHe ? 'יש לכם שאלות? יש לנו תשובות' : 'Questions? We Have Answers'}</h2>
      <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.55);margin:0">${isHe ? `הנה התשובות לשאלות הנפוצות ביותר על ${name}` : `Here are the answers to the most common questions about ${name}`}</p>
    </div>
    <div class="faq-2col-grid">
      <div style="display:flex;flex-direction:column;gap:16px">
        ${col1.map((item, i) => renderItem(item, i * 100)).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        ${col2.map((item, i) => renderItem(item, (i + half) * 100)).join('')}
      </div>
    </div>
  </div>
</section>`
}

/** 5. Chat bubble Q&A format (alternating left/right bubbles) */
export const generateFaqChatStyle = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const items = faqItems(params.businessType, isHe, params.items)

  const chatItems = items.map((item, i) => `
    <div class="motion-reveal" style="display:flex;flex-direction:column;gap:12px;max-width:720px;margin:0 auto;animation-delay:${i * 150}ms">
      <div style="display:flex;justify-content:flex-end;gap:12px;align-items:flex-end">
        <div style="max-width:85%;padding:16px 20px;background:${primary};color:#fff;border-radius:16px 16px 4px 16px;font-family:'${bf}',sans-serif;font-size:0.95rem;line-height:1.6">${item.q}</div>
        <div style="width:32px;height:32px;border-radius:50%;background:${alpha(primary, '33')};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px">👤</div>
      </div>
      <div style="display:flex;gap:12px;align-items:flex-end">
        <div style="width:32px;height:32px;border-radius:50%;background:${alpha(secondary, '33')};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px">🤖</div>
        <div style="max-width:85%;padding:16px 20px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.8);border-radius:16px 16px 16px 4px;font-family:'${bf}',sans-serif;font-size:0.95rem;line-height:1.6;border:1px solid rgba(255,255,255,.06)">${item.a}</div>
      </div>
    </div>`).join('')

  return `<section dir="${dir}" style="padding:80px 24px;background:#0B0F1A">
  <style>
    ${reducedMotionCSS}
  </style>
  <div style="max-width:800px;margin:0 auto">
    <div style="text-align:center;margin-bottom:48px" class="motion-reveal">
      <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:9999px;margin-bottom:16px">
        <div style="width:8px;height:8px;border-radius:50%;background:#10B981;animation:faqChatPulse 2s ease infinite"></div>
        <span style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.5)">${isHe ? `צוות ${name} מחובר` : `${name} team is online`}</span>
      </div>
      <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(1.8rem,4vw,2.75rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${isHe ? 'שיחה עם הצוות שלנו' : 'Chat With Our Team'}</h2>
      <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.55);margin:0">${isHe ? 'הנה השאלות הנפוצות ביותר שאנחנו מקבלים' : 'Here are the most common questions we receive'}</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:28px">
      ${chatItems}
    </div>
    <div style="text-align:center;margin-top:40px" class="motion-reveal">
      <a href="#" style="display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:${primary};color:#fff;font-weight:600;font-size:0.95rem;border-radius:12px;text-decoration:none;transition:all .3s;font-family:'${bf}',sans-serif" onmouseenter="this.style.background='${secondary}'" onmouseleave="this.style.background='${primary}'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        ${isHe ? 'שאלו אותנו ישירות' : 'Ask us directly'}
      </a>
    </div>
  </div>
  <style>@keyframes faqChatPulse{0%,100%{opacity:1}50%{opacity:.4}}</style>
</section>`
}


/* ================================================================== */
/*  FOOTER SECTIONS — 6 variants                                      */
/* ================================================================== */

/** 1. 4-column links + newsletter signup + social icons */
export const generateFooterMultiColumn = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const links = footerLinks(isHe)
  const year = new Date().getFullYear()

  const renderCol = (col: { title: string; links: string[] }) => `
    <div>
      <h4 style="font-family:'${hf}',sans-serif;font-weight:700;font-size:0.85rem;color:#fff;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em">${col.title}</h4>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">
        ${col.links.map(l => `<li><a href="#" style="font-family:'${bf}',sans-serif;font-size:0.9rem;color:rgba(255,255,255,.5);text-decoration:none;transition:color .3s" onmouseenter="this.style.color='${primary}'" onmouseleave="this.style.color='rgba(255,255,255,.5)'">${l}</a></li>`).join('')}
      </ul>
    </div>`

  return `<footer dir="${dir}" style="background:#060810;padding:64px 24px 0;border-top:1px solid rgba(255,255,255,.06)">
  <style>
    .footer-mc-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:40px;max-width:1200px;margin:0 auto}
    .footer-mc-nl{display:flex;gap:8px;margin-top:16px}
    .footer-mc-input{flex:1;padding:10px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#fff;font-size:0.9rem;font-family:'${bf}',sans-serif;outline:none;transition:border-color .3s}
    .footer-mc-input:focus{border-color:${primary}}
    .footer-mc-submit{padding:10px 20px;background:${primary};color:#fff;border:none;border-radius:8px;font-weight:600;font-size:0.85rem;cursor:pointer;transition:background .3s;font-family:'${bf}',sans-serif}
    .footer-mc-submit:hover{background:${secondary}}
    .footer-social-icon{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,.06);transition:background .3s,transform .3s;text-decoration:none}
    .footer-social-icon:hover{background:${alpha(primary, '33')};transform:translateY(-2px)}
    @media(max-width:768px){.footer-mc-grid{grid-template-columns:1fr 1fr}.footer-mc-grid>*:first-child{grid-column:span 2}}
    @media(max-width:480px){.footer-mc-grid{grid-template-columns:1fr}.footer-mc-grid>*:first-child{grid-column:span 1}}
    ${reducedMotionCSS}
  </style>
  <div class="footer-mc-grid">
    <div>
      <a href="/" style="font-family:'${hf}',sans-serif;font-weight:800;font-size:1.4rem;color:#fff;text-decoration:none;letter-spacing:-0.02em">${name}</a>
      <p style="font-family:'${bf}',sans-serif;font-size:0.9rem;color:rgba(255,255,255,.45);line-height:1.6;margin:16px 0 0;max-width:280px">${isHe ? `${name} — הפתרון המוביל לעסקים חכמים. הצטרפו לאלפי לקוחות מרוצים.` : `${name} — the leading solution for smart businesses. Join thousands of happy customers.`}</p>
      <form class="footer-mc-nl" onsubmit="return false">
        <input type="email" class="footer-mc-input" placeholder="${isHe ? 'אימייל שלכם' : 'Your email'}" />
        <button class="footer-mc-submit" type="button">${isHe ? 'הרשמה' : 'Subscribe'}</button>
      </form>
    </div>
    ${renderCol(links.product)}
    ${renderCol(links.company)}
    ${renderCol(links.resources)}
    ${renderCol(links.legal)}
  </div>
  <div style="max-width:1200px;margin:40px auto 0;padding:24px 0;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
    <p style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.35);margin:0">© ${year} ${name}. ${isHe ? 'כל הזכויות שמורות.' : 'All rights reserved.'}</p>
    <div style="display:flex;gap:8px">
      <a href="#" class="footer-social-icon" aria-label="Twitter"><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
      <a href="#" class="footer-social-icon" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
      <a href="#" class="footer-social-icon" aria-label="GitHub"><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg></a>
      <a href="#" class="footer-social-icon" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
    </div>
  </div>
</footer>`
}

/** 2. Single row: logo + links + copyright */
export const generateFooterMinimal = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const year = new Date().getFullYear()
  const links = isHe
    ? ['אודות', 'תכונות', 'תמחור', 'בלוג', 'צור קשר']
    : ['About', 'Features', 'Pricing', 'Blog', 'Contact']

  return `<footer dir="${dir}" style="background:#060810;padding:32px 24px;border-top:1px solid rgba(255,255,255,.06)">
  <style>
    .footer-min-wrap{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
    .footer-min-links{display:flex;gap:24px;flex-wrap:wrap}
    .footer-min-link{font-family:'${bf}',sans-serif;font-size:0.875rem;color:rgba(255,255,255,.5);text-decoration:none;transition:color .3s}
    .footer-min-link:hover{color:${primary}}
    @media(max-width:640px){.footer-min-wrap{flex-direction:column;text-align:center}.footer-min-links{justify-content:center}}
    ${reducedMotionCSS}
  </style>
  <div class="footer-min-wrap">
    <a href="/" style="font-family:'${hf}',sans-serif;font-weight:800;font-size:1.2rem;color:#fff;text-decoration:none;letter-spacing:-0.02em">${name}</a>
    <nav class="footer-min-links" aria-label="Footer navigation">
      ${links.map(l => `<a href="#" class="footer-min-link">${l}</a>`).join('')}
    </nav>
    <p style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.3);margin:0">© ${year} ${name}</p>
  </div>
</footer>`
}

/** 3. Full mega footer with gradient divider, CTA integration */
export const generateFooterMega = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const links = footerLinks(isHe)
  const year = new Date().getFullYear()

  const renderCol = (col: { title: string; links: string[] }) => `
    <div>
      <h4 style="font-family:'${hf}',sans-serif;font-weight:700;font-size:0.85rem;color:#fff;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em">${col.title}</h4>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">
        ${col.links.map(l => `<li><a href="#" style="font-family:'${bf}',sans-serif;font-size:0.9rem;color:rgba(255,255,255,.5);text-decoration:none;transition:color .3s" onmouseenter="this.style.color='#fff'" onmouseleave="this.style.color='rgba(255,255,255,.5)'">${l}</a></li>`).join('')}
      </ul>
    </div>`

  return `<footer dir="${dir}" style="background:#060810;position:relative;overflow:hidden">
  <style>
    .footer-mega-divider{height:2px;background:linear-gradient(90deg,transparent,${primary},${secondary},transparent);margin:0}
    .footer-mega-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:40px;max-width:1200px;margin:0 auto;padding:56px 24px}
    .footer-mega-cta{max-width:1200px;margin:0 auto;padding:0 24px 48px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
    .footer-mega-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:${primary};color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.95rem;font-family:'${bf}',sans-serif;transition:all .3s}
    .footer-mega-btn:hover{background:${secondary};transform:translateY(-2px);box-shadow:0 8px 24px ${alpha(primary, '33')}}
    .footer-mega-badge{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .footer-mega-badge-item{padding:8px 16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:8px;font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.4)}
    @media(max-width:768px){.footer-mega-grid{grid-template-columns:1fr 1fr}.footer-mega-cta{flex-direction:column;text-align:center}}
    @media(max-width:480px){.footer-mega-grid{grid-template-columns:1fr}}
    ${reducedMotionCSS}
  </style>
  <div class="footer-mega-divider"></div>
  <div class="footer-mega-cta" style="padding-top:48px">
    <div>
      <h3 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:1.5rem;color:#fff;margin:0 0 8px">${isHe ? `מוכנים להתחיל עם ${name}?` : `Ready to get started with ${name}?`}</h3>
      <p style="font-family:'${bf}',sans-serif;font-size:0.95rem;color:rgba(255,255,255,.45);margin:0">${isHe ? 'הצטרפו לאלפי עסקים שכבר סומכים עלינו' : 'Join thousands of businesses that already trust us'}</p>
    </div>
    <a href="#" class="footer-mega-btn">${isHe ? 'התחילו בחינם' : 'Start Free'} →</a>
  </div>
  <div style="max-width:1200px;margin:0 auto;padding:0 24px"><div style="height:1px;background:rgba(255,255,255,.06)"></div></div>
  <div class="footer-mega-grid">
    ${renderCol(links.product)}
    ${renderCol(links.company)}
    ${renderCol(links.resources)}
    ${renderCol(links.legal)}
  </div>
  <div style="max-width:1200px;margin:0 auto;padding:0 24px"><div style="height:1px;background:rgba(255,255,255,.06)"></div></div>
  <div style="max-width:1200px;margin:0 auto;padding:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
    <div style="display:flex;align-items:center;gap:16px">
      <a href="/" style="font-family:'${hf}',sans-serif;font-weight:800;font-size:1.2rem;color:#fff;text-decoration:none">${name}</a>
      <span style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.3)">© ${year} ${isHe ? 'כל הזכויות שמורות' : 'All rights reserved'}</span>
    </div>
    <div class="footer-mega-badge">
      <span class="footer-mega-badge-item">🔒 SSL ${isHe ? 'מאובטח' : 'Secured'}</span>
      <span class="footer-mega-badge-item">🛡️ GDPR</span>
      <span class="footer-mega-badge-item">⚡ 99.9% Uptime</span>
    </div>
  </div>
</footer>`
}

/** 4. Everything centered, social icons with hover glow */
export const generateFooterCentered = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const year = new Date().getFullYear()
  const links = isHe
    ? ['אודות', 'תכונות', 'תמחור', 'בלוג', 'קריירה', 'צור קשר']
    : ['About', 'Features', 'Pricing', 'Blog', 'Careers', 'Contact']

  return `<footer dir="${dir}" style="background:#060810;padding:64px 24px 32px;text-align:center;border-top:1px solid rgba(255,255,255,.06)">
  <style>
    .footer-ctr-links{display:flex;gap:28px;justify-content:center;flex-wrap:wrap;margin:24px 0 32px}
    .footer-ctr-link{font-family:'${bf}',sans-serif;font-size:0.9rem;color:rgba(255,255,255,.5);text-decoration:none;transition:color .3s}
    .footer-ctr-link:hover{color:#fff}
    .footer-ctr-social{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);transition:all .3s;text-decoration:none}
    .footer-ctr-social:hover{background:${alpha(primary, '22')};border-color:${alpha(primary, '44')};box-shadow:0 0 20px ${alpha(primary, '22')};transform:translateY(-3px)}
    ${reducedMotionCSS}
  </style>
  <a href="/" style="font-family:'${hf}',sans-serif;font-weight:800;font-size:1.75rem;color:#fff;text-decoration:none;letter-spacing:-0.03em">${name}</a>
  <p style="font-family:'${bf}',sans-serif;font-size:0.95rem;color:rgba(255,255,255,.4);margin:16px auto 0;max-width:400px;line-height:1.6">${isHe ? 'הפתרון המושלם לנוכחות דיגיטלית מקצועית' : 'The perfect solution for a professional digital presence'}</p>
  <nav class="footer-ctr-links" aria-label="Footer navigation">
    ${links.map(l => `<a href="#" class="footer-ctr-link">${l}</a>`).join('')}
  </nav>
  <div style="display:flex;gap:12px;justify-content:center;margin-bottom:32px">
    <a href="#" class="footer-ctr-social" aria-label="Twitter"><svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
    <a href="#" class="footer-ctr-social" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
    <a href="#" class="footer-ctr-social" aria-label="GitHub"><svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg></a>
    <a href="#" class="footer-ctr-social" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
  </div>
  <div style="height:1px;background:rgba(255,255,255,.06);max-width:600px;margin:0 auto 24px"></div>
  <p style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.3);margin:0">© ${year} ${name}. ${isHe ? 'כל הזכויות שמורות.' : 'All rights reserved.'}</p>
</footer>`
}

/** 5. Gradient mesh background footer */
export const generateFooterGradient = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const links = footerLinks(isHe)
  const year = new Date().getFullYear()

  const renderCol = (col: { title: string; links: string[] }) => `
    <div>
      <h4 style="font-family:'${hf}',sans-serif;font-weight:700;font-size:0.85rem;color:#fff;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em">${col.title}</h4>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">
        ${col.links.map(l => `<li><a href="#" style="font-family:'${bf}',sans-serif;font-size:0.9rem;color:rgba(255,255,255,.55);text-decoration:none;transition:color .3s" onmouseenter="this.style.color='#fff'" onmouseleave="this.style.color='rgba(255,255,255,.55)'">${l}</a></li>`).join('')}
      </ul>
    </div>`

  return `<footer dir="${dir}" style="position:relative;overflow:hidden;padding:64px 24px 32px">
  <style>
    @keyframes footerMesh{0%{background-position:0% 0%}50%{background-position:100% 100%}100%{background-position:0% 0%}}
    .footer-grad-bg{position:absolute;inset:0;background:linear-gradient(135deg,#060810 0%,${alpha(primary, '22')} 25%,#060810 50%,${alpha(secondary, '15')} 75%,#060810 100%);background-size:300% 300%;animation:footerMesh 15s ease infinite;z-index:0}
    .footer-grad-content{position:relative;z-index:1}
    .footer-grad-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:40px;max-width:1200px;margin:0 auto}
    @media(max-width:768px){.footer-grad-grid{grid-template-columns:1fr 1fr}.footer-grad-grid>*:first-child{grid-column:span 2}}
    @media(max-width:480px){.footer-grad-grid{grid-template-columns:1fr}.footer-grad-grid>*:first-child{grid-column:span 1}}
    ${reducedMotionCSS}
  </style>
  <div class="footer-grad-bg"></div>
  <div class="footer-grad-content">
    <div class="footer-grad-grid">
      <div>
        <a href="/" style="font-family:'${hf}',sans-serif;font-weight:800;font-size:1.4rem;color:#fff;text-decoration:none;letter-spacing:-0.02em">${name}</a>
        <p style="font-family:'${bf}',sans-serif;font-size:0.9rem;color:rgba(255,255,255,.45);line-height:1.6;margin:16px 0 0;max-width:280px">${isHe ? 'הפלטפורמה שמשנה את הדרך שעסקים בונים נוכחות דיגיטלית.' : 'The platform transforming how businesses build their digital presence.'}</p>
        <div style="display:flex;gap:8px;margin-top:20px">
          <a href="#" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,.06);text-decoration:none;transition:background .3s" onmouseenter="this.style.background='${alpha(primary, '33')}'" onmouseleave="this.style.background='rgba(255,255,255,.06)'" aria-label="Twitter"><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
          <a href="#" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,.06);text-decoration:none;transition:background .3s" onmouseenter="this.style.background='${alpha(primary, '33')}'" onmouseleave="this.style.background='rgba(255,255,255,.06)'" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,.5)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        </div>
      </div>
      ${renderCol(links.product)}
      ${renderCol(links.company)}
      ${renderCol(links.resources)}
      ${renderCol(links.legal)}
    </div>
    <div style="max-width:1200px;margin:40px auto 0;padding-top:24px;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <p style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.3);margin:0">© ${year} ${name}. ${isHe ? 'כל הזכויות שמורות.' : 'All rights reserved.'}</p>
      <div style="display:flex;gap:16px">
        <a href="#" style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.3);text-decoration:none;transition:color .3s" onmouseenter="this.style.color='rgba(255,255,255,.6)'" onmouseleave="this.style.color='rgba(255,255,255,.3)'">${isHe ? 'פרטיות' : 'Privacy'}</a>
        <a href="#" style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.3);text-decoration:none;transition:color .3s" onmouseenter="this.style.color='rgba(255,255,255,.6)'" onmouseleave="this.style.color='rgba(255,255,255,.3)'">${isHe ? 'תנאים' : 'Terms'}</a>
      </div>
    </div>
  </div>
</footer>`
}

/** 6. CTA section that blends into the footer seamlessly */
export const generateFooterCtaIntegrated = (params: SectionParams): string => {
  const { name, dir, primary, secondary, isHe, hf, bf } = defaults(params)
  const copy = ctaCopy(params.businessType, isHe, params)
  const links = footerLinks(isHe)
  const year = new Date().getFullYear()

  const renderCol = (col: { title: string; links: string[] }) => `
    <div>
      <h4 style="font-family:'${hf}',sans-serif;font-weight:700;font-size:0.85rem;color:#fff;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em">${col.title}</h4>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">
        ${col.links.map(l => `<li><a href="#" style="font-family:'${bf}',sans-serif;font-size:0.9rem;color:rgba(255,255,255,.5);text-decoration:none;transition:color .3s" onmouseenter="this.style.color='${primary}'" onmouseleave="this.style.color='rgba(255,255,255,.5)'">${l}</a></li>`).join('')}
      </ul>
    </div>`

  return `<footer dir="${dir}" style="background:#060810;overflow:hidden">
  <style>
    .footer-cta-hero{position:relative;padding:80px 24px;text-align:center;background:linear-gradient(180deg,#0B0F1A 0%,#060810 100%)}
    .footer-cta-orb{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;opacity:.15}
    .footer-cta-btn{display:inline-flex;align-items:center;gap:10px;padding:18px 48px;background:${primary};color:#fff;font-weight:700;font-size:1.1rem;border-radius:12px;text-decoration:none;transition:all .3s;font-family:'${bf}',sans-serif;position:relative;overflow:hidden}
    .footer-cta-btn:hover{transform:translateY(-3px);box-shadow:0 20px 60px ${alpha(primary, '33')}}
    @keyframes footerCtaShimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
    .footer-cta-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%);animation:footerCtaShimmer 3s ease infinite}
    .footer-cta-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:40px;max-width:1200px;margin:0 auto;padding:48px 24px}
    @media(max-width:768px){.footer-cta-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:480px){.footer-cta-grid{grid-template-columns:1fr}}
    ${reducedMotionCSS}
  </style>
  <div class="footer-cta-hero">
    <div class="footer-cta-orb" style="width:400px;height:400px;background:${primary};top:-100px;left:50%;transform:translateX(-50%)"></div>
    <div style="position:relative;z-index:1;max-width:600px;margin:0 auto" class="motion-reveal">
      <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(1.8rem,4vw,2.75rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em">${copy.heading}</h2>
      <p style="font-family:'${bf}',sans-serif;font-size:1.1rem;color:rgba(255,255,255,.55);margin:0 0 36px;line-height:1.6">${copy.sub}</p>
      <a href="#" class="footer-cta-btn">${copy.btn} →</a>
    </div>
  </div>
  <div style="max-width:1200px;margin:0 auto;padding:0 24px"><div style="height:1px;background:rgba(255,255,255,.06)"></div></div>
  <div class="footer-cta-grid">
    ${renderCol(links.product)}
    ${renderCol(links.company)}
    ${renderCol(links.resources)}
    ${renderCol(links.legal)}
  </div>
  <div style="max-width:1200px;margin:0 auto;padding:0 24px"><div style="height:1px;background:rgba(255,255,255,.06)"></div></div>
  <div style="max-width:1200px;margin:0 auto;padding:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
    <div style="display:flex;align-items:center;gap:12px">
      <a href="/" style="font-family:'${hf}',sans-serif;font-weight:800;font-size:1.1rem;color:#fff;text-decoration:none">${name}</a>
      <span style="font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.3)">© ${year}</span>
    </div>
    <div style="display:flex;gap:8px">
      <a href="#" style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.04);text-decoration:none;transition:background .3s" onmouseenter="this.style.background='${alpha(primary, '22')}'" onmouseleave="this.style.background='rgba(255,255,255,.04)'" aria-label="Twitter"><svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,.4)"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
      <a href="#" style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.04);text-decoration:none;transition:background .3s" onmouseenter="this.style.background='${alpha(primary, '22')}'" onmouseleave="this.style.background='rgba(255,255,255,.04)'" aria-label="LinkedIn"><svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,.4)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
      <a href="#" style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.04);text-decoration:none;transition:background .3s" onmouseenter="this.style.background='${alpha(primary, '22')}'" onmouseleave="this.style.background='rgba(255,255,255,.04)'" aria-label="Instagram"><svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,.4)"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
    </div>
  </div>
</footer>`
}
