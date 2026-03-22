/**
 * Premium Utility Section Generators — Partners, How-It-Works, Blog,
 * Portfolio, Comparison, Newsletter, About.
 *
 * Generates raw HTML section strings for iframe rendering.
 * Quality target: $50K custom agency site (Apple, Stripe, Linear, Airbnb).
 *
 * Every generator accepts a simple params object and returns a standalone
 * HTML section string ready to be injected into an iframe document.
 * Tailwind CSS CDN is assumed to be loaded in the host document.
 */

/* ------------------------------------------------------------------ */
/*  Shared types & helpers                                            */
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
  items?: { title?: string; description?: string; icon?: string }[]
  notes?: string
  palette?: { primary: string; primaryHover: string; secondary: string; accent: string; background: string; backgroundAlt: string; text: string; textMuted: string; border: string }
  fonts?: { heading: string; body: string; headingWeight: string; bodyWeight: string }
}

const dir = (p: SectionParams) => (p.locale === 'he' ? 'rtl' : 'ltr')
const isRtl = (p: SectionParams) => p.locale === 'he'
const pc = (p: SectionParams) => p.primaryColor || '#7C3AED'
const sc = (p: SectionParams) => p.secondaryColor || '#06B6D4'
const uid = () => Math.random().toString(36).slice(2, 8)

/** Returns locale-aware placeholder text */
const t = (p: SectionParams, en: string, he: string) =>
  p.locale === 'he' ? he : en

const partnerNames = (p: SectionParams) => [
  'TechCorp', 'InnovateLab', 'CloudSync', 'DataPrime', 'NextWave', 'Elevate',
]

const blogPosts = (p: SectionParams) => [
  {
    title: t(p, `How ${p.businessType} Is Changing in 2025`, `איך ${p.businessType} משתנה ב-2025`),
    excerpt: t(p, 'Discover the latest trends shaping the industry and how forward-thinking businesses are adapting.', 'גלו את המגמות האחרונות שמעצבות את התעשייה ואיך עסקים חדשניים מסתגלים.'),
    date: '2025-03-10',
    category: t(p, 'Industry', 'תעשייה'),
    readTime: t(p, '5 min read', '5 דק׳ קריאה'),
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
  },
  {
    title: t(p, `10 Tips to Grow Your ${p.businessType} Business`, `10 טיפים לצמיחת העסק שלכם`),
    excerpt: t(p, 'Proven strategies from industry leaders that you can implement today.', 'אסטרטגיות מוכחות ממובילי התעשייה שתוכלו ליישם היום.'),
    date: '2025-03-05',
    category: t(p, 'Growth', 'צמיחה'),
    readTime: t(p, '7 min read', '7 דק׳ קריאה'),
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  },
  {
    title: t(p, 'The Future of Digital Transformation', 'העתיד של הטרנספורמציה הדיגיטלית'),
    excerpt: t(p, 'How AI and automation are reshaping the way we do business in the modern world.', 'איך בינה מלאכותית ואוטומציה משנות את הדרך שבה אנחנו עושים עסקים.'),
    date: '2025-02-28',
    category: t(p, 'Technology', 'טכנולוגיה'),
    readTime: t(p, '6 min read', '6 דק׳ קריאה'),
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  },
  {
    title: t(p, 'Building Customer Trust Online', 'בניית אמון לקוחות באונליין'),
    excerpt: t(p, 'Essential practices for establishing credibility and trust with your digital audience.', 'שיטות חיוניות לבניית אמינות ואמון עם הקהל הדיגיטלי שלכם.'),
    date: '2025-02-20',
    category: t(p, 'Marketing', 'שיווק'),
    readTime: t(p, '4 min read', '4 דק׳ קריאה'),
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  },
  {
    title: t(p, 'Sustainability in Modern Business', 'קיימות בעסקים מודרניים'),
    excerpt: t(p, 'How sustainable practices are becoming a competitive advantage in today\'s market.', 'איך פרקטיקות בנות קיימא הופכות ליתרון תחרותי בשוק של היום.'),
    date: '2025-02-14',
    category: t(p, 'Strategy', 'אסטרטגיה'),
    readTime: t(p, '8 min read', '8 דק׳ קריאה'),
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  },
]

const portfolioItems = (p: SectionParams) => [
  {
    title: t(p, 'Brand Identity Redesign', 'עיצוב זהות מותג מחדש'),
    category: t(p, 'Branding', 'מיתוג'),
    description: t(p, 'Complete visual identity overhaul for a leading tech startup.', 'שדרוג מלא של הזהות החזותית לסטארטאפ טכנולוגי מוביל.'),
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
  },
  {
    title: t(p, 'E-Commerce Platform', 'פלטפורמת מסחר אלקטרוני'),
    category: t(p, 'Web Development', 'פיתוח אתרים'),
    description: t(p, 'Full-stack e-commerce solution with AI-powered recommendations.', 'פתרון מסחר אלקטרוני מלא עם המלצות מבוססות AI.'),
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  },
  {
    title: t(p, 'Mobile App Launch', 'השקת אפליקציה'),
    category: t(p, 'Mobile', 'מובייל'),
    description: t(p, 'Cross-platform mobile app reaching 100K users in first month.', 'אפליקציה חוצת פלטפורמות שהגיעה ל-100K משתמשים בחודש הראשון.'),
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
  },
  {
    title: t(p, 'Marketing Campaign', 'קמפיין שיווקי'),
    category: t(p, 'Marketing', 'שיווק'),
    description: t(p, 'Multi-channel campaign that increased conversions by 340%.', 'קמפיין רב-ערוצי שהגדיל המרות ב-340%.'),
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=80',
  },
]

/* ================================================================== */
/*  PARTNERS / LOGOS — 3 variants                                     */
/* ================================================================== */

/** Partners marquee — infinite CSS scroll of logos */
export const generatePartnersMarquee = (p: SectionParams): string => {
  const id = `marquee-${uid()}`
  const partners = partnerNames(p)
  const logoSvg = (name: string) =>
    `<div style="display:flex;align-items:center;gap:8px;padding-inline:32px;flex-shrink:0;opacity:0.5;transition:opacity 0.3s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.5'">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="${pc(p)}22"/><text x="16" y="21" text-anchor="middle" fill="${pc(p)}" font-size="14" font-weight="700">${name.charAt(0)}</text></svg>
      <span style="font-size:1.125rem;font-weight:600;color:#64748b;white-space:nowrap">${name}</span>
    </div>`
  const track = partners.map(logoSvg).join('')
  return `<section dir="${dir(p)}" style="background:#fafafa;padding:48px 0;overflow:hidden">
  <style>
    @keyframes ${id}-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .${id}-track { animation: none !important; }
    }
    [dir="rtl"] .${id}-track {
      animation-direction: reverse;
    }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;padding-inline:24px;margin-block-end:32px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'Trusted By', 'בוטחים בנו')}</p>
    <h2 style="font-size:clamp(1.5rem,3vw,2.25rem);font-weight:700;color:#0f172a;margin:8px 0 0">${t(p, `Industry Leaders Trust ${p.businessName}`, `מובילי התעשייה בוטחים ב${p.businessName}`)}</h2>
  </div>
  <div style="display:flex;overflow:hidden;mask-image:linear-gradient(to right,transparent,black 10%,black 90%,transparent)">
    <div class="${id}-track" style="display:flex;align-items:center;animation:${id}-scroll 30s linear infinite;will-change:transform">
      ${track}${track}
    </div>
  </div>
</section>`
}

/** Partners grid — grayscale to color hover */
export const generatePartnersGrid = (p: SectionParams): string => {
  const partners = partnerNames(p)
  const gridId = `pgrid-${uid()}`
  const logos = partners.map((name) =>
    `<div class="${gridId}-logo" style="display:flex;align-items:center;justify-content:center;padding:24px;border:1px solid #e2e8f0;border-radius:12px;transition:all 0.4s ease;filter:grayscale(100%);opacity:0.6;cursor:pointer" onmouseenter="this.style.filter='grayscale(0%)';this.style.opacity='1';this.style.transform='scale(1.05)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.08)'" onmouseleave="this.style.filter='grayscale(100%)';this.style.opacity='0.6';this.style.transform='scale(1)';this.style.boxShadow='none'">
      <div style="text-align:center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="${pc(p)}18"/><text x="24" y="31" text-anchor="middle" fill="${pc(p)}" font-size="20" font-weight="700">${name.charAt(0)}</text></svg>
        <p style="margin:12px 0 0;font-size:0.875rem;font-weight:600;color:#475569">${name}</p>
      </div>
    </div>`
  ).join('\n    ')
  return `<section dir="${dir(p)}" style="background:#fff;padding:80px 24px">
  <style>
    .${gridId}-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; max-width:900px; margin:0 auto; }
    @media(max-width:640px) { .${gridId}-grid { grid-template-columns:repeat(2,1fr); } }
    @media(prefers-reduced-motion:reduce) { .${gridId}-logo { transition:none !important; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:48px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'Our Partners', 'השותפים שלנו')}</p>
    <h2 style="font-size:clamp(1.5rem,3vw,2.25rem);font-weight:700;color:#0f172a;margin:8px 0 0">${t(p, 'Working With the Best', 'עובדים עם הטובים ביותר')}</h2>
  </div>
  <div class="${gridId}-grid">
    ${logos}
  </div>
</section>`
}

/** Partners tiered — featured (large) + standard (small) */
export const generatePartnersTiered = (p: SectionParams): string => {
  const partners = partnerNames(p)
  const featured = partners.slice(0, 2)
  const standard = partners.slice(2)
  const renderLogo = (name: string, size: 'lg' | 'sm') => {
    const w = size === 'lg' ? 64 : 40
    const fontSize = size === 'lg' ? '28' : '16'
    return `<div style="display:flex;align-items:center;gap:${size === 'lg' ? '16' : '10'}px;padding:${size === 'lg' ? '24px 32px' : '16px 20px'};background:#fff;border:1px solid #e2e8f0;border-radius:12px;transition:box-shadow 0.3s" onmouseenter="this.style.boxShadow='0 8px 30px rgba(0,0,0,0.08)'" onmouseleave="this.style.boxShadow='none'">
      <svg width="${w}" height="${w}" viewBox="0 0 ${w} ${w}" fill="none"><rect width="${w}" height="${w}" rx="${size === 'lg' ? 16 : 10}" fill="${pc(p)}18"/><text x="${w / 2}" y="${w * 0.65}" text-anchor="middle" fill="${pc(p)}" font-size="${fontSize}" font-weight="700">${name.charAt(0)}</text></svg>
      <div>
        <p style="margin:0;font-size:${size === 'lg' ? '1.125rem' : '0.875rem'};font-weight:700;color:#0f172a">${name}</p>
        <p style="margin:4px 0 0;font-size:${size === 'lg' ? '0.875rem' : '0.75rem'};color:#64748b">${size === 'lg' ? t(p, 'Premium Partner', 'שותף פרימיום') : t(p, 'Partner', 'שותף')}</p>
      </div>
    </div>`
  }
  const tierId = `tier-${uid()}`
  return `<section dir="${dir(p)}" style="background:#f8fafc;padding:80px 24px">
  <style>
    .${tierId}-featured { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; max-width:800px; margin:0 auto 40px; }
    .${tierId}-standard { display:flex; flex-wrap:wrap; gap:16px; max-width:900px; margin:0 auto; justify-content:center; }
    @media(max-width:640px) { .${tierId}-featured { grid-template-columns:1fr; } }
    @media(prefers-reduced-motion:reduce) { .${tierId}-featured div, .${tierId}-standard div { transition:none !important; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:48px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'Partner Ecosystem', 'מערך השותפים')}</p>
    <h2 style="font-size:clamp(1.5rem,3vw,2.25rem);font-weight:700;color:#0f172a;margin:8px 0 0">${t(p, 'Our Trusted Partners', 'השותפים המובילים שלנו')}</h2>
  </div>
  <div class="${tierId}-featured">
    ${featured.map(n => renderLogo(n, 'lg')).join('\n    ')}
  </div>
  <div class="${tierId}-standard">
    ${standard.map(n => renderLogo(n, 'sm')).join('\n    ')}
  </div>
</section>`
}

/* ================================================================== */
/*  HOW-IT-WORKS — 4 variants                                        */
/* ================================================================== */

const defaultSteps = (p: SectionParams) => [
  {
    num: '01',
    title: t(p, 'Tell Us Your Vision', 'ספרו לנו על החזון שלכם'),
    desc: t(p, `Describe what you need for your ${p.businessType} business and our AI will understand your goals.`, `תארו מה אתם צריכים לעסק ה${p.businessType} שלכם וה-AI שלנו יבין את המטרות.`),
    icon: '💡',
  },
  {
    num: '02',
    title: t(p, 'AI Creates Your Site', 'AI בונה את האתר שלכם'),
    desc: t(p, 'Our AI generates a complete, professional website tailored to your brand in minutes.', 'הבינה המלאכותית שלנו מייצרת אתר מקצועי ומותאם למותג שלכם תוך דקות.'),
    icon: '🤖',
  },
  {
    num: '03',
    title: t(p, 'Customize & Refine', 'התאימו ושפרו'),
    desc: t(p, 'Use our visual editor to fine-tune every detail until it is exactly what you want.', 'השתמשו בעורך הוויזואלי שלנו כדי לשפר כל פרט עד שהתוצאה מושלמת.'),
    icon: '✨',
  },
  {
    num: '04',
    title: t(p, 'Launch & Grow', 'השיקו וצמחו'),
    desc: t(p, 'Publish your site with built-in SEO, analytics, and growth tools ready to go.', 'פרסמו את האתר עם SEO מובנה, אנליטיקס וכלי צמיחה מוכנים לשימוש.'),
    icon: '🚀',
  },
]

/** How it works — numbered steps with connecting lines */
export const generateHowItWorksSteps = (p: SectionParams): string => {
  const steps = (p as Record<string, unknown>).steps as { num: number | string; title: string; desc: string; icon: string }[] || defaultSteps(p)
  const stepsId = `steps-${uid()}`
  const stepCards = steps.map((step, i) =>
    `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;flex:1;min-width:200px">
      <div style="width:56px;height:56px;border-radius:50%;background:${pc(p)};color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:800;position:relative;z-index:1">${step.num}</div>
      ${i < steps.length - 1 ? `<div class="${stepsId}-line" style="position:absolute;top:28px;inset-inline-start:calc(50% + 28px);width:calc(100% - 56px);height:2px;background:linear-gradient(to right,${pc(p)},${sc(p)})"></div>` : ''}
      <div style="font-size:1.75rem;margin:16px 0 8px">${step.icon}</div>
      <h3 style="font-size:1.125rem;font-weight:700;color:#0f172a;margin:0 0 8px">${step.title}</h3>
      <p style="font-size:0.875rem;color:#64748b;margin:0;line-height:1.6;max-width:240px">${step.desc}</p>
    </div>`
  ).join('\n    ')

  return `<section dir="${dir(p)}" style="background:#fff;padding:80px 24px">
  <style>
    .${stepsId}-wrap { display:flex; gap:16px; max-width:1100px; margin:0 auto; align-items:flex-start; }
    @media(max-width:768px) {
      .${stepsId}-wrap { flex-direction:column; align-items:center; }
      .${stepsId}-line { display:none !important; }
    }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:56px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'How It Works', 'איך זה עובד')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, 'Simple Steps to Get Started', 'צעדים פשוטים להתחלה')}</h2>
  </div>
  <div class="${stepsId}-wrap">
    ${stepCards}
  </div>
</section>`
}

/** How it works — vertical timeline with alternating left/right + scroll reveal */
export const generateHowItWorksTimeline = (p: SectionParams): string => {
  const steps = (p as Record<string, unknown>).steps as { num: number | string; title: string; desc: string; icon: string }[] || defaultSteps(p)
  const tlId = `tl-${uid()}`
  const items = steps.map((step, i) => {
    const side = i % 2 === 0 ? 'start' : 'end'
    return `<div class="${tlId}-item ${tlId}-${side}" data-reveal style="opacity:0;transform:translateY(24px);transition:opacity 0.6s ease ${i * 0.15}s,transform 0.6s ease ${i * 0.15}s">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.04);max-width:400px;position:relative">
        <div style="position:absolute;top:28px;${side === 'start' ? 'inset-inline-end:-8px' : 'inset-inline-start:-8px'};width:16px;height:16px;background:${pc(p)};border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px ${pc(p)}"></div>
        <span style="font-size:0.75rem;font-weight:700;color:${pc(p)};text-transform:uppercase;letter-spacing:0.1em">${t(p, 'Step', 'שלב')} ${step.num}</span>
        <h3 style="font-size:1.125rem;font-weight:700;color:#0f172a;margin:8px 0">${step.title}</h3>
        <p style="font-size:0.875rem;color:#64748b;margin:0;line-height:1.6">${step.desc}</p>
      </div>
    </div>`
  }).join('\n    ')

  return `<section dir="${dir(p)}" style="background:#f8fafc;padding:80px 24px">
  <style>
    .${tlId}-wrap { position:relative; max-width:900px; margin:0 auto; }
    .${tlId}-wrap::before { content:''; position:absolute; inset-inline-start:50%; top:0; bottom:0; width:2px; background:linear-gradient(to bottom,${pc(p)}44,${sc(p)}44); transform:translateX(-50%); }
    .${tlId}-item { display:flex; margin-block-end:40px; }
    .${tlId}-start { justify-content:flex-start; padding-inline-end:calc(50% + 24px); }
    .${tlId}-end { justify-content:flex-end; padding-inline-start:calc(50% + 24px); }
    .${tlId}-item[data-visible] { opacity:1 !important; transform:translateY(0) !important; }
    @media(max-width:768px) {
      .${tlId}-wrap::before { inset-inline-start:24px; }
      .${tlId}-start, .${tlId}-end { justify-content:flex-start; padding-inline-start:56px; padding-inline-end:0; }
    }
    @media(prefers-reduced-motion:reduce) {
      .${tlId}-item { opacity:1 !important; transform:none !important; transition:none !important; }
    }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:56px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'Our Process', 'התהליך שלנו')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, 'From Idea to Launch', 'מרעיון להשקה')}</h2>
  </div>
  <div class="${tlId}-wrap">
    ${items}
  </div>
  <script>
    (function(){
      if(typeof IntersectionObserver==='undefined')return;
      var items=document.querySelectorAll('.${tlId}-item[data-reveal]');
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){if(e.isIntersecting){e.target.setAttribute('data-visible','');obs.unobserve(e.target);}});
      },{threshold:0.2});
      items.forEach(function(el){obs.observe(el);});
    })();
  </script>
</section>`
}

/** How it works — interactive tab style (click to reveal detail) */
export const generateHowItWorksInteractive = (p: SectionParams): string => {
  const steps = (p as Record<string, unknown>).steps as { num: number | string; title: string; desc: string; icon: string }[] || defaultSteps(p)
  const iId = `hiw-int-${uid()}`
  const tabs = steps.map((step, i) =>
    `<button class="${iId}-tab ${i === 0 ? iId + '-active' : ''}" onclick="document.querySelectorAll('.${iId}-tab').forEach(t=>t.classList.remove('${iId}-active'));this.classList.add('${iId}-active');document.querySelectorAll('.${iId}-panel').forEach(p=>p.style.display='none');document.getElementById('${iId}-panel-${i}').style.display='block'" style="display:flex;align-items:center;gap:12px;padding:16px 20px;border:none;background:transparent;cursor:pointer;text-align:start;width:100%;border-radius:12px;transition:background 0.3s">
      <span style="width:40px;height:40px;border-radius:50%;background:${pc(p)}15;color:${pc(p)};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.875rem;flex-shrink:0">${step.num}</span>
      <span style="font-size:1rem;font-weight:600;color:#0f172a">${step.title}</span>
    </button>`
  ).join('\n      ')

  const panels = steps.map((step, i) =>
    `<div id="${iId}-panel-${i}" class="${iId}-panel" style="display:${i === 0 ? 'block' : 'none'};animation:${iId}-fade 0.4s ease">
      <div style="font-size:2.5rem;margin-block-end:16px">${step.icon}</div>
      <h3 style="font-size:1.5rem;font-weight:700;color:#0f172a;margin:0 0 12px">${step.title}</h3>
      <p style="font-size:1rem;color:#64748b;line-height:1.7;margin:0">${step.desc}</p>
    </div>`
  ).join('\n      ')

  return `<section dir="${dir(p)}" style="background:#fff;padding:80px 24px">
  <style>
    @keyframes ${iId}-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    .${iId}-active { background:${pc(p)}08 !important; box-shadow:inset 3px 0 0 ${pc(p)}; }
    [dir="rtl"] .${iId}-active { box-shadow:inset -3px 0 0 ${pc(p)}; }
    .${iId}-layout { display:grid; grid-template-columns:1fr 1.2fr; gap:48px; max-width:1000px; margin:0 auto; align-items:start; }
    @media(max-width:768px) { .${iId}-layout { grid-template-columns:1fr; } }
    @media(prefers-reduced-motion:reduce) { .${iId}-panel { animation:none !important; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:56px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'How It Works', 'איך זה עובד')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, 'Your Journey With Us', 'המסע שלכם איתנו')}</h2>
  </div>
  <div class="${iId}-layout">
    <div style="display:flex;flex-direction:column;gap:4px">
      ${tabs}
    </div>
    <div style="background:#f8fafc;border-radius:16px;padding:40px">
      ${panels}
    </div>
  </div>
</section>`
}

/** How it works — steps with video/image placeholder per step */
export const generateHowItWorksVideo = (p: SectionParams): string => {
  const steps = (p as Record<string, unknown>).steps as { num: number | string; title: string; desc: string; icon: string }[] || defaultSteps(p)
  const vId = `hiw-vid-${uid()}`
  const items = steps.map((step, i) =>
    `<div class="${vId}-item" style="display:grid;grid-template-columns:${i % 2 === 0 ? '1fr 1.2fr' : '1.2fr 1fr'};gap:40px;align-items:center;margin-block-end:64px">
      <div style="${i % 2 !== 0 ? 'order:2;' : ''}">
        <span style="display:inline-block;font-size:0.75rem;font-weight:700;color:${pc(p)};text-transform:uppercase;letter-spacing:0.1em;margin-block-end:8px">${t(p, 'Step', 'שלב')} ${step.num}</span>
        <h3 style="font-size:clamp(1.25rem,2.5vw,1.75rem);font-weight:700;color:#0f172a;margin:0 0 12px">${step.title}</h3>
        <p style="font-size:1rem;color:#64748b;line-height:1.7;margin:0">${step.desc}</p>
      </div>
      <div style="aspect-ratio:16/10;background:linear-gradient(135deg,${pc(p)}12,${sc(p)}12);border-radius:16px;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;${i % 2 !== 0 ? 'order:1;' : ''}">
        <div style="text-align:center;color:#94a3b8">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <p style="margin:8px 0 0;font-size:0.75rem">${t(p, 'Video Placeholder', 'מקום לווידאו')}</p>
        </div>
      </div>
    </div>`
  ).join('\n    ')

  return `<section dir="${dir(p)}" style="background:#fff;padding:80px 24px">
  <style>
    @media(max-width:768px) { .${vId}-item { grid-template-columns:1fr !important; } .${vId}-item > * { order:unset !important; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:64px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'See It in Action', 'ראו את זה בפעולה')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, `How ${p.businessName} Works`, `איך ${p.businessName} עובד`)}</h2>
  </div>
  <div style="max-width:1000px;margin:0 auto">
    ${items}
  </div>
</section>`
}

/* ================================================================== */
/*  BLOG — 4 variants                                                 */
/* ================================================================== */

/** Blog card grid — 3-column with tilt hover */
export const generateBlogCardGrid = (p: SectionParams): string => {
  const posts = blogPosts(p).slice(0, 3)
  const bId = `blog-grid-${uid()}`
  const cards = posts.map((post) =>
    `<article class="${bId}-card" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;transition:transform 0.4s ease,box-shadow 0.4s ease;cursor:pointer" onmouseenter="this.style.transform='translateY(-6px) rotateX(2deg)';this.style.boxShadow='0 20px 60px rgba(0,0,0,0.1)'" onmouseleave="this.style.transform='none';this.style.boxShadow='none'">
      <div style="aspect-ratio:16/10;overflow:hidden">
        <img src="${post.image}" alt="${post.title}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s ease" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'" loading="lazy" />
      </div>
      <div style="padding:24px">
        <div style="display:flex;align-items:center;gap:12px;margin-block-end:12px">
          <span style="font-size:0.75rem;font-weight:600;color:${pc(p)};background:${pc(p)}10;padding:4px 10px;border-radius:100px">${post.category}</span>
          <span style="font-size:0.75rem;color:#94a3b8">${post.readTime}</span>
        </div>
        <h3 style="font-size:1.125rem;font-weight:700;color:#0f172a;margin:0 0 8px;line-height:1.4">${post.title}</h3>
        <p style="font-size:0.875rem;color:#64748b;margin:0;line-height:1.6">${post.excerpt}</p>
        <div style="margin-block-start:16px;display:flex;align-items:center;gap:8px">
          <span style="font-size:0.8125rem;font-weight:600;color:${pc(p)}">${t(p, 'Read More', 'קרא עוד')}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${pc(p)}" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
    </article>`
  ).join('\n    ')

  return `<section dir="${dir(p)}" style="background:#f8fafc;padding:80px 24px">
  <style>
    .${bId}-wrap { display:grid; grid-template-columns:repeat(3,1fr); gap:28px; max-width:1200px; margin:0 auto; }
    @media(max-width:968px) { .${bId}-wrap { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:640px) { .${bId}-wrap { grid-template-columns:1fr; } }
    @media(prefers-reduced-motion:reduce) { .${bId}-card { transition:none !important; } .${bId}-card img { transition:none !important; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:48px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'Our Blog', 'הבלוג שלנו')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, 'Latest Insights & Stories', 'תובנות וסיפורים אחרונים')}</h2>
  </div>
  <div class="${bId}-wrap">
    ${cards}
  </div>
</section>`
}

/** Blog featured list — 1 large featured + smaller list */
export const generateBlogFeaturedList = (p: SectionParams): string => {
  const posts = blogPosts(p)
  const featured = posts[0]
  const rest = posts.slice(1, 5)
  const bfId = `blog-feat-${uid()}`

  const smallItems = rest.map((post) =>
    `<article style="display:flex;gap:16px;padding:16px 0;border-block-end:1px solid #e2e8f0;cursor:pointer;transition:opacity 0.3s" onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'">
      <img src="${post.image}" alt="${post.title}" style="width:100px;height:72px;object-fit:cover;border-radius:10px;flex-shrink:0" loading="lazy" />
      <div>
        <span style="font-size:0.7rem;font-weight:600;color:${pc(p)}">${post.category}</span>
        <h4 style="font-size:0.9375rem;font-weight:700;color:#0f172a;margin:4px 0;line-height:1.4">${post.title}</h4>
        <span style="font-size:0.75rem;color:#94a3b8">${post.date} &middot; ${post.readTime}</span>
      </div>
    </article>`
  ).join('\n      ')

  return `<section dir="${dir(p)}" style="background:#fff;padding:80px 24px">
  <style>
    .${bfId}-layout { display:grid; grid-template-columns:1.2fr 1fr; gap:48px; max-width:1100px; margin:0 auto; align-items:start; }
    @media(max-width:768px) { .${bfId}-layout { grid-template-columns:1fr; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:48px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'Featured', 'מומלץ')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, 'From the Blog', 'מהבלוג')}</h2>
  </div>
  <div class="${bfId}-layout">
    <article style="cursor:pointer">
      <div style="aspect-ratio:16/10;overflow:hidden;border-radius:16px;margin-block-end:20px">
        <img src="${featured.image}" alt="${featured.title}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s ease" onmouseenter="this.style.transform='scale(1.03)'" onmouseleave="this.style.transform='scale(1)'" loading="lazy" />
      </div>
      <span style="font-size:0.75rem;font-weight:600;color:${pc(p)};background:${pc(p)}10;padding:4px 10px;border-radius:100px">${featured.category}</span>
      <h3 style="font-size:1.5rem;font-weight:700;color:#0f172a;margin:12px 0 8px;line-height:1.3">${featured.title}</h3>
      <p style="font-size:1rem;color:#64748b;margin:0;line-height:1.6">${featured.excerpt}</p>
      <span style="display:inline-block;margin-block-start:12px;font-size:0.8125rem;font-weight:600;color:${pc(p)}">${t(p, 'Read Full Article', 'קרא את הכתבה')}</span>
    </article>
    <div>
      ${smallItems}
    </div>
  </div>
</section>`
}

/** Blog magazine — asymmetric grid layout */
export const generateBlogMagazine = (p: SectionParams): string => {
  const posts = blogPosts(p).slice(0, 5)
  const bmId = `blog-mag-${uid()}`
  const card = (post: ReturnType<typeof blogPosts>[0], large: boolean) =>
    `<article style="position:relative;overflow:hidden;border-radius:16px;${large ? 'grid-row:span 2;' : ''}cursor:pointer;min-height:${large ? '400px' : '180px'}">
      <img src="${post.image}" alt="${post.title}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;transition:transform 0.6s" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'" loading="lazy" />
      <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.75),transparent 60%)"></div>
      <div style="position:absolute;bottom:0;padding:24px;color:#fff;z-index:1">
        <span style="font-size:0.7rem;font-weight:600;background:${pc(p)};padding:3px 8px;border-radius:4px;text-transform:uppercase">${post.category}</span>
        <h3 style="font-size:${large ? '1.375rem' : '1rem'};font-weight:700;margin:8px 0 4px;line-height:1.3">${post.title}</h3>
        <span style="font-size:0.75rem;opacity:0.8">${post.date}</span>
      </div>
    </article>`

  return `<section dir="${dir(p)}" style="background:#0f172a;padding:80px 24px">
  <style>
    .${bmId}-grid { display:grid; grid-template-columns:1fr 1fr; grid-auto-rows:200px; gap:16px; max-width:1100px; margin:0 auto; }
    @media(max-width:640px) { .${bmId}-grid { grid-template-columns:1fr; grid-auto-rows:220px; } .${bmId}-grid article { grid-row:span 1 !important; } }
    @media(prefers-reduced-motion:reduce) { .${bmId}-grid img { transition:none !important; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:48px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${sc(p)}">${t(p, 'Stories & Insights', 'סיפורים ותובנות')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#fff;margin:8px 0 0">${t(p, `${p.businessName} Magazine`, `מגזין ${p.businessName}`)}</h2>
  </div>
  <div class="${bmId}-grid">
    ${card(posts[0], true)}
    ${card(posts[1], false)}
    ${card(posts[2], false)}
    ${card(posts[3], false)}
    ${card(posts[4], false)}
  </div>
</section>`
}

/** Blog minimal — text-focused list with dates */
export const generateBlogMinimal = (p: SectionParams): string => {
  const posts = blogPosts(p)
  const minId = `blog-min-${uid()}`
  const items = posts.map((post) =>
    `<article class="${minId}-row" style="display:grid;grid-template-columns:auto 1fr auto;gap:24px;align-items:baseline;padding:20px 0;border-block-end:1px solid #e2e8f0;cursor:pointer;transition:opacity 0.3s" onmouseenter="this.style.opacity='0.7'" onmouseleave="this.style.opacity='1'">
      <time style="font-size:0.8125rem;font-weight:500;color:#94a3b8;white-space:nowrap;font-variant-numeric:tabular-nums">${post.date}</time>
      <div>
        <h3 style="font-size:1.125rem;font-weight:700;color:#0f172a;margin:0 0 4px">${post.title}</h3>
        <p style="font-size:0.875rem;color:#64748b;margin:0;line-height:1.5">${post.excerpt}</p>
      </div>
      <span style="font-size:0.75rem;color:${pc(p)};font-weight:600;white-space:nowrap">${post.readTime}</span>
    </article>`
  ).join('\n    ')

  return `<section dir="${dir(p)}" style="background:#fff;padding:80px 24px">
  <style>
    @media(max-width:640px) { .${minId}-row { grid-template-columns:1fr !important; gap:4px !important; } }
  </style>
  <div style="max-width:720px;margin-inline:auto">
    <div style="text-align:center;margin-block-end:48px">
      <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'Journal', 'יומן')}</p>
      <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, 'Recent Writings', 'כתיבות אחרונות')}</h2>
    </div>
    ${items}
  </div>
</section>`
}

/* ================================================================== */
/*  PORTFOLIO — 3 variants                                            */
/* ================================================================== */

/** Portfolio case study — large showcase cards with overlay on hover */
export const generatePortfolioCaseStudy = (p: SectionParams): string => {
  const items = portfolioItems(p)
  const csId = `pf-cs-${uid()}`
  const cards = items.map((item) =>
    `<article class="${csId}-card" style="position:relative;overflow:hidden;border-radius:16px;aspect-ratio:4/3;cursor:pointer">
      <img src="${item.image}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s ease" loading="lazy" />
      <div class="${csId}-overlay" style="position:absolute;inset:0;background:linear-gradient(to top,${pc(p)}ee,transparent 60%);opacity:0;transition:opacity 0.4s ease;display:flex;flex-direction:column;justify-content:flex-end;padding:28px">
        <span style="font-size:0.75rem;font-weight:600;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.08em">${item.category}</span>
        <h3 style="font-size:1.375rem;font-weight:700;color:#fff;margin:6px 0">${item.title}</h3>
        <p style="font-size:0.875rem;color:rgba(255,255,255,0.85);margin:0;line-height:1.5">${item.description}</p>
      </div>
    </article>`
  ).join('\n    ')

  return `<section dir="${dir(p)}" style="background:#0f172a;padding:80px 24px">
  <style>
    .${csId}-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; max-width:1100px; margin:0 auto; }
    .${csId}-card:hover img { transform:scale(1.08); }
    .${csId}-card:hover .${csId}-overlay { opacity:1; }
    @media(max-width:640px) { .${csId}-grid { grid-template-columns:1fr; } }
    @media(prefers-reduced-motion:reduce) { .${csId}-card img, .${csId}-overlay { transition:none !important; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:48px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${sc(p)}">${t(p, 'Our Work', 'העבודות שלנו')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#fff;margin:8px 0 0">${t(p, 'Selected Projects', 'פרויקטים נבחרים')}</h2>
  </div>
  <div class="${csId}-grid">
    ${cards}
  </div>
</section>`
}

/** Portfolio filterable — category buttons + grid with fade */
export const generatePortfolioFilterable = (p: SectionParams): string => {
  const items = portfolioItems(p)
  const categories = [...new Set(items.map(i => i.category))]
  const fId = `pf-filt-${uid()}`

  const filterBtns = [t(p, 'All', 'הכל'), ...categories].map((cat, i) =>
    `<button class="${fId}-btn ${i === 0 ? fId + '-active' : ''}" onclick="
      document.querySelectorAll('.${fId}-btn').forEach(b=>b.classList.remove('${fId}-active'));
      this.classList.add('${fId}-active');
      var cards=document.querySelectorAll('.${fId}-card');
      cards.forEach(function(c){
        c.style.opacity='0';c.style.transform='scale(0.95)';
        setTimeout(function(){
          c.style.display=(c.dataset.cat==='${cat}'||'${cat}'==='${t(p, 'All', 'הכל')}')?'block':'none';
          c.style.opacity='1';c.style.transform='scale(1)';
        },200);
      });
    " style="padding:8px 20px;border:1px solid #e2e8f0;border-radius:100px;background:transparent;cursor:pointer;font-size:0.8125rem;font-weight:600;color:#64748b;transition:all 0.3s">${cat}</button>`
  ).join('\n      ')

  const cards = items.map((item) =>
    `<div class="${fId}-card" data-cat="${item.category}" style="transition:opacity 0.3s,transform 0.3s">
      <div style="overflow:hidden;border-radius:12px;aspect-ratio:4/3;margin-block-end:12px">
        <img src="${item.image}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'" loading="lazy" />
      </div>
      <span style="font-size:0.75rem;font-weight:600;color:${pc(p)}">${item.category}</span>
      <h3 style="font-size:1.0625rem;font-weight:700;color:#0f172a;margin:4px 0">${item.title}</h3>
      <p style="font-size:0.8125rem;color:#64748b;margin:0">${item.description}</p>
    </div>`
  ).join('\n    ')

  return `<section dir="${dir(p)}" style="background:#fff;padding:80px 24px">
  <style>
    .${fId}-active { background:${pc(p)} !important; color:#fff !important; border-color:${pc(p)} !important; }
    .${fId}-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; max-width:1100px; margin:0 auto; }
    @media(max-width:768px) { .${fId}-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:480px) { .${fId}-grid { grid-template-columns:1fr; } }
    @media(prefers-reduced-motion:reduce) { .${fId}-card { transition:none !important; } .${fId}-card img { transition:none !important; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:48px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'Portfolio', 'תיק עבודות')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, 'What We\'ve Built', 'מה שבנינו')}</h2>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-block-end:36px">
      ${filterBtns}
  </div>
  <div class="${fId}-grid">
    ${cards}
  </div>
</section>`
}

/** Portfolio masonry — Pinterest-style with lightbox */
export const generatePortfolioMasonry = (p: SectionParams): string => {
  const items = portfolioItems(p)
  const mId = `pf-mas-${uid()}`
  const heights = ['320px', '240px', '360px', '280px']

  const cards = items.map((item, i) =>
    `<div style="break-inside:avoid;margin-block-end:16px">
      <div class="${mId}-card" onclick="var lb=document.getElementById('${mId}-lb');lb.querySelector('img').src='${item.image}';lb.querySelector('h3').textContent='${item.title.replace(/'/g, "\\'")}';lb.querySelector('p').textContent='${item.description.replace(/'/g, "\\'")}';lb.style.display='flex'" style="position:relative;overflow:hidden;border-radius:12px;cursor:pointer;height:${heights[i % heights.length]}">
        <img src="${item.image}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s" loading="lazy" />
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);opacity:0;transition:opacity 0.3s;display:flex;align-items:center;justify-content:center" onmouseenter="this.style.opacity='1';this.parentElement.querySelector('img').style.transform='scale(1.05)'" onmouseleave="this.style.opacity='0';this.parentElement.querySelector('img').style.transform='scale(1)'">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </div>
      </div>
      <div style="padding:8px 4px">
        <span style="font-size:0.7rem;font-weight:600;color:${pc(p)};text-transform:uppercase">${item.category}</span>
        <h4 style="font-size:0.9375rem;font-weight:700;color:#0f172a;margin:2px 0 0">${item.title}</h4>
      </div>
    </div>`
  ).join('\n    ')

  return `<section dir="${dir(p)}" style="background:#f8fafc;padding:80px 24px">
  <style>
    .${mId}-cols { column-count:3; column-gap:16px; max-width:1100px; margin:0 auto; }
    @media(max-width:768px) { .${mId}-cols { column-count:2; } }
    @media(max-width:480px) { .${mId}-cols { column-count:1; } }
    @media(prefers-reduced-motion:reduce) { .${mId}-card img { transition:none !important; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:48px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'Gallery', 'גלריה')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, 'Our Creative Work', 'היצירות שלנו')}</h2>
  </div>
  <div class="${mId}-cols">
    ${cards}
  </div>
  <!-- Lightbox -->
  <div id="${mId}-lb" onclick="if(event.target===this)this.style.display='none'" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(8px)">
    <div style="max-width:700px;width:100%;background:#fff;border-radius:16px;overflow:hidden;position:relative">
      <button onclick="this.closest('[id]').style.display='none'" style="position:absolute;top:12px;inset-inline-end:12px;z-index:1;background:rgba(0,0,0,0.5);color:#fff;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1.25rem;display:flex;align-items:center;justify-content:center">&times;</button>
      <img src="" alt="" style="width:100%;aspect-ratio:16/10;object-fit:cover" />
      <div style="padding:24px">
        <h3 style="font-size:1.25rem;font-weight:700;color:#0f172a;margin:0 0 8px"></h3>
        <p style="font-size:0.9375rem;color:#64748b;margin:0"></p>
      </div>
    </div>
  </div>
</section>`
}

/* ================================================================== */
/*  COMPARISON — 2 variants                                           */
/* ================================================================== */

/** Comparison feature matrix — table with sticky header */
export const generateComparisonFeatureMatrix = (p: SectionParams): string => {
  const cmId = `comp-mat-${uid()}`
  const features = [
    { name: t(p, 'AI Website Generation', 'יצירת אתר עם AI'), us: true, them: false },
    { name: t(p, 'Built-in CRM', 'CRM מובנה'), us: true, them: false },
    { name: t(p, 'SEO Optimization', 'אופטימיזציית SEO'), us: true, them: true },
    { name: t(p, 'Custom Domain', 'דומיין מותאם'), us: true, them: true },
    { name: t(p, 'E-Commerce', 'מסחר אלקטרוני'), us: true, them: true },
    { name: t(p, 'AI Chatbot', 'צ׳אטבוט AI'), us: true, them: false },
    { name: t(p, 'Multi-Language', 'רב-שפתי'), us: true, them: false },
    { name: t(p, '24/7 Support', 'תמיכה 24/7'), us: true, them: true },
  ]
  const check = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
  const cross = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`

  const rows = features.map((f) =>
    `<tr>
        <td style="padding:14px 16px;font-size:0.9375rem;color:#334155;font-weight:500;border-block-end:1px solid #f1f5f9">${f.name}</td>
        <td style="padding:14px 16px;text-align:center;border-block-end:1px solid #f1f5f9">${f.us ? check : cross}</td>
        <td style="padding:14px 16px;text-align:center;border-block-end:1px solid #f1f5f9">${f.them ? check : cross}</td>
      </tr>`
  ).join('\n      ')

  return `<section dir="${dir(p)}" style="background:#fff;padding:80px 24px">
  <style>
    .${cmId}-table { width:100%; max-width:800px; margin:0 auto; border-collapse:collapse; }
    .${cmId}-table thead { position:sticky; top:0; z-index:1; }
    @media(max-width:480px) { .${cmId}-table { font-size:0.8125rem; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:48px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'Compare', 'השוואה')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, `Why Choose ${p.businessName}`, `למה לבחור ב${p.businessName}`)}</h2>
  </div>
  <div style="overflow-x:auto">
    <table class="${cmId}-table">
      <thead>
        <tr style="background:#f8fafc">
          <th style="padding:16px;text-align:start;font-size:0.8125rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">${t(p, 'Feature', 'תכונה')}</th>
          <th style="padding:16px;text-align:center;font-size:0.9375rem;font-weight:700;color:${pc(p)}">${p.businessName}</th>
          <th style="padding:16px;text-align:center;font-size:0.9375rem;font-weight:600;color:#94a3b8">${t(p, 'Others', 'אחרים')}</th>
        </tr>
      </thead>
      <tbody>
      ${rows}
      </tbody>
    </table>
  </div>
</section>`
}

/** Comparison before/after — side-by-side cards */
export const generateComparisonBeforeAfter = (p: SectionParams): string => {
  const baId = `comp-ba-${uid()}`
  const beforeItems = [
    t(p, 'Generic templates', 'תבניות גנריות'),
    t(p, 'Manual SEO setup', 'הגדרת SEO ידנית'),
    t(p, 'No CRM integration', 'ללא אינטגרציית CRM'),
    t(p, 'Limited customization', 'התאמה מוגבלת'),
    t(p, 'Slow loading speeds', 'מהירות טעינה איטית'),
  ]
  const afterItems = [
    t(p, 'AI-generated unique designs', 'עיצובים ייחודיים שנוצרו ב-AI'),
    t(p, 'Automatic SEO optimization', 'אופטימיזציית SEO אוטומטית'),
    t(p, 'Built-in CRM & analytics', 'CRM ואנליטיקס מובנים'),
    t(p, 'Full visual editor', 'עורך ויזואלי מלא'),
    t(p, 'Blazing fast performance', 'ביצועים מהירים במיוחד'),
  ]
  const check = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" style="flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>`
  const cross = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" style="flex-shrink:0"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`

  return `<section dir="${dir(p)}" style="background:#f8fafc;padding:80px 24px">
  <style>
    .${baId}-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; max-width:900px; margin:0 auto; }
    @media(max-width:640px) { .${baId}-grid { grid-template-columns:1fr; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:48px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'The Difference', 'ההבדל')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, 'Before vs After', 'לפני ואחרי')}</h2>
  </div>
  <div class="${baId}-grid">
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #fecaca">
      <div style="display:flex;align-items:center;gap:8px;margin-block-end:24px">
        <div style="width:36px;height:36px;border-radius:50%;background:#fef2f2;display:flex;align-items:center;justify-content:center">
          ${cross}
        </div>
        <h3 style="font-size:1.125rem;font-weight:700;color:#0f172a;margin:0">${t(p, 'Without Us', 'בלעדינו')}</h3>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        ${beforeItems.map(item => `<div style="display:flex;align-items:center;gap:10px">${cross}<span style="font-size:0.9375rem;color:#64748b">${item}</span></div>`).join('\n        ')}
      </div>
    </div>
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #bbf7d0;box-shadow:0 8px 30px rgba(16,185,129,0.08)">
      <div style="display:flex;align-items:center;gap:8px;margin-block-end:24px">
        <div style="width:36px;height:36px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center">
          ${check}
        </div>
        <h3 style="font-size:1.125rem;font-weight:700;color:#0f172a;margin:0">${t(p, `With ${p.businessName}`, `עם ${p.businessName}`)}</h3>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        ${afterItems.map(item => `<div style="display:flex;align-items:center;gap:10px">${check}<span style="font-size:0.9375rem;color:#334155;font-weight:500">${item}</span></div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>`
}

/* ================================================================== */
/*  NEWSLETTER — 3 variants                                           */
/* ================================================================== */

/** Newsletter inline — horizontal email bar */
export const generateNewsletterInline = (p: SectionParams): string => {
  const nlId = `nl-inline-${uid()}`
  return `<section dir="${dir(p)}" style="background:linear-gradient(135deg,${pc(p)}08,${sc(p)}08);padding:48px 24px">
  <style>
    .${nlId}-wrap { display:flex; align-items:center; justify-content:space-between; max-width:900px; margin:0 auto; gap:24px; flex-wrap:wrap; }
    .${nlId}-form { display:flex; gap:8px; flex:1; max-width:440px; min-width:280px; }
    .${nlId}-input { flex:1; padding:12px 18px; border:1px solid #e2e8f0; border-radius:10px; font-size:0.9375rem; outline:none; transition:border-color 0.3s; background:#fff; }
    .${nlId}-input:focus { border-color:${pc(p)}; box-shadow:0 0 0 3px ${pc(p)}22; }
    .${nlId}-btn { padding:12px 24px; background:${pc(p)}; color:#fff; border:none; border-radius:10px; font-weight:600; font-size:0.9375rem; cursor:pointer; white-space:nowrap; transition:background 0.3s; }
    .${nlId}-btn:hover { background:${pc(p)}dd; }
    @media(max-width:640px) { .${nlId}-wrap { flex-direction:column; text-align:center; } }
  </style>
  <div class="${nlId}-wrap">
    <div>
      <h3 style="font-size:1.25rem;font-weight:700;color:#0f172a;margin:0 0 4px">${t(p, 'Stay in the Loop', 'הישארו מעודכנים')}</h3>
      <p style="font-size:0.875rem;color:#64748b;margin:0">${t(p, 'Get the latest updates delivered to your inbox.', 'קבלו את העדכונים האחרונים ישירות למייל.')}</p>
    </div>
    <form class="${nlId}-form" onsubmit="event.preventDefault();this.querySelector('button').textContent='${t(p, 'Subscribed!', 'נרשמת!')}';this.querySelector('input').value=''">
      <input class="${nlId}-input" type="email" placeholder="${t(p, 'Enter your email', 'הכניסו את המייל שלכם')}" required />
      <button class="${nlId}-btn" type="submit">${t(p, 'Subscribe', 'הרשמה')}</button>
    </form>
  </div>
</section>`
}

/** Newsletter popup — modal with blur backdrop */
export const generateNewsletterPopup = (p: SectionParams): string => {
  const npId = `nl-popup-${uid()}`
  return `<section dir="${dir(p)}" style="background:#fff;padding:60px 24px;text-align:center">
  <style>
    @keyframes ${npId}-fadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    .${npId}-modal { display:none; position:fixed; inset:0; z-index:9999; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); backdrop-filter:blur(6px); padding:24px; }
    .${npId}-modal[data-open] { display:flex; }
    .${npId}-content { background:#fff; border-radius:20px; padding:48px 36px; max-width:480px; width:100%; text-align:center; animation:${npId}-fadeIn 0.3s ease; position:relative; }
    .${npId}-input { width:100%; padding:14px 18px; border:1px solid #e2e8f0; border-radius:10px; font-size:1rem; margin-block-end:12px; outline:none; box-sizing:border-box; }
    .${npId}-input:focus { border-color:${pc(p)}; box-shadow:0 0 0 3px ${pc(p)}22; }
    .${npId}-submit { width:100%; padding:14px; background:${pc(p)}; color:#fff; border:none; border-radius:10px; font-weight:700; font-size:1rem; cursor:pointer; transition:background 0.3s; }
    .${npId}-submit:hover { background:${pc(p)}dd; }
    .${npId}-trigger { padding:14px 32px; background:${pc(p)}; color:#fff; border:none; border-radius:12px; font-weight:700; font-size:1rem; cursor:pointer; transition:transform 0.3s,box-shadow 0.3s; }
    .${npId}-trigger:hover { transform:translateY(-2px); box-shadow:0 8px 30px ${pc(p)}44; }
    @media(prefers-reduced-motion:reduce) { .${npId}-content { animation:none; } .${npId}-trigger { transition:none; } }
  </style>
  <div style="max-width:600px;margin:0 auto">
    <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;color:#0f172a;margin:0 0 12px">${t(p, 'Join Our Newsletter', 'הצטרפו לניוזלטר שלנו')}</h2>
    <p style="font-size:1rem;color:#64748b;margin:0 0 24px;line-height:1.6">${t(p, `Get exclusive insights and tips for your ${p.businessType} business.`, `קבלו תובנות וטיפים בלעדיים לעסק ה${p.businessType} שלכם.`)}</p>
    <button class="${npId}-trigger" onclick="document.getElementById('${npId}-modal').setAttribute('data-open','')">
      ${t(p, 'Subscribe Now', 'הירשמו עכשיו')}
    </button>
  </div>
  <div id="${npId}-modal" class="${npId}-modal" onclick="if(event.target===this)this.removeAttribute('data-open')">
    <div class="${npId}-content">
      <button onclick="this.closest('[id]').removeAttribute('data-open')" style="position:absolute;top:16px;inset-inline-end:16px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#94a3b8;line-height:1">&times;</button>
      <div style="font-size:2.5rem;margin-block-end:16px">&#9993;</div>
      <h3 style="font-size:1.5rem;font-weight:700;color:#0f172a;margin:0 0 8px">${t(p, 'Never Miss an Update', 'לעולם לא תפספסו עדכון')}</h3>
      <p style="font-size:0.9375rem;color:#64748b;margin:0 0 24px">${t(p, 'Weekly insights, no spam. Unsubscribe anytime.', 'תובנות שבועיות, ללא ספאם. ביטול בכל עת.')}</p>
      <form onsubmit="event.preventDefault();this.querySelector('button').textContent='${t(p, 'Subscribed!', 'נרשמת!')}';setTimeout(()=>this.closest('[id]').removeAttribute('data-open'),1500)">
        <input class="${npId}-input" type="email" placeholder="${t(p, 'Your email address', 'כתובת המייל שלכם')}" required />
        <button class="${npId}-submit" type="submit">${t(p, 'Subscribe', 'הרשמה')}</button>
      </form>
    </div>
  </div>
</section>`
}

/** Newsletter bottom bar — fixed sticky at bottom */
export const generateNewsletterBottomBar = (p: SectionParams): string => {
  const bbId = `nl-bb-${uid()}`
  return `<div id="${bbId}" dir="${dir(p)}" style="position:fixed;bottom:0;inset-inline:0;z-index:9998;background:#fff;box-shadow:0 -4px 20px rgba(0,0,0,0.08);border-block-start:1px solid #e2e8f0;padding:14px 24px;transform:translateY(100%);transition:transform 0.5s ease">
  <style>
    .${bbId}-inner { display:flex; align-items:center; justify-content:center; gap:16px; max-width:800px; margin:0 auto; flex-wrap:wrap; }
    .${bbId}-input { padding:10px 16px; border:1px solid #e2e8f0; border-radius:8px; font-size:0.875rem; outline:none; min-width:240px; flex:1; max-width:320px; }
    .${bbId}-input:focus { border-color:${pc(p)}; }
    .${bbId}-btn { padding:10px 20px; background:${pc(p)}; color:#fff; border:none; border-radius:8px; font-weight:600; font-size:0.875rem; cursor:pointer; white-space:nowrap; }
    .${bbId}-close { background:none; border:none; cursor:pointer; color:#94a3b8; font-size:1.25rem; padding:4px; line-height:1; }
    @media(max-width:480px) { .${bbId}-inner { flex-direction:column; } .${bbId}-input { min-width:unset; width:100%; max-width:unset; } }
    @media(prefers-reduced-motion:reduce) { #${bbId} { transition:none; } }
  </style>
  <div class="${bbId}-inner">
    <span style="font-size:0.875rem;font-weight:600;color:#0f172a;white-space:nowrap">${t(p, 'Get updates from', 'קבלו עדכונים מ')} ${p.businessName}</span>
    <form style="display:flex;gap:8px;flex:1;max-width:400px" onsubmit="event.preventDefault();document.getElementById('${bbId}').style.transform='translateY(100%)'">
      <input class="${bbId}-input" type="email" placeholder="${t(p, 'Email address', 'כתובת מייל')}" required />
      <button class="${bbId}-btn" type="submit">${t(p, 'Join', 'הצטרפו')}</button>
    </form>
    <button class="${bbId}-close" onclick="document.getElementById('${bbId}').style.transform='translateY(100%)'" aria-label="Close">&times;</button>
  </div>
  <script>
    (function(){
      setTimeout(function(){
        var el=document.getElementById('${bbId}');
        if(el)el.style.transform='translateY(0)';
      },3000);
    })();
  </script>
</div>`
}

/* ================================================================== */
/*  ABOUT — 3 variants                                                */
/* ================================================================== */

/** About story timeline — vertical timeline with year markers */
export const generateAboutStoryTimeline = (p: SectionParams): string => {
  const asId = `about-tl-${uid()}`
  const milestones = [
    { year: '2020', title: t(p, 'Founded', 'הוקמנו'), desc: t(p, `${p.businessName} was founded with a simple mission: make professional ${p.businessType} accessible to everyone.`, `${p.businessName} הוקמה עם משימה פשוטה: להנגיש ${p.businessType} מקצועי לכולם.`) },
    { year: '2021', title: t(p, 'First 1,000 Customers', '1,000 לקוחות ראשונים'), desc: t(p, 'Reached our first major milestone with customers across 15 countries.', 'הגענו לאבן דרך ראשונה עם לקוחות ב-15 מדינות.') },
    { year: '2022', title: t(p, 'AI Integration', 'אינטגרציית AI'), desc: t(p, 'Pioneered AI-powered tools that transformed how our customers work.', 'חידשנו עם כלי AI שהפכו את הדרך שבה הלקוחות שלנו עובדים.') },
    { year: '2023', title: t(p, 'Global Expansion', 'התרחבות גלובלית'), desc: t(p, 'Expanded to serve customers in over 50 countries with localized support.', 'הרחבנו שירות ללקוחות ביותר מ-50 מדינות עם תמיכה מקומית.') },
    { year: '2024', title: t(p, 'Industry Leader', 'מובילי תעשייה'), desc: t(p, 'Recognized as a leading platform with innovative features and world-class support.', 'הוכרנו כפלטפורמה מובילה עם תכונות חדשניות ותמיכה ברמה עולמית.') },
  ]

  const items = milestones.map((m, i) =>
    `<div class="${asId}-item" data-reveal style="display:flex;gap:24px;align-items:flex-start;margin-block-end:48px;opacity:0;transform:translateY(20px);transition:opacity 0.5s ease ${i * 0.12}s,transform 0.5s ease ${i * 0.12}s">
      <div style="flex-shrink:0;width:72px;text-align:center">
        <span style="font-size:1.25rem;font-weight:800;color:${pc(p)}">${m.year}</span>
        <div style="width:2px;height:48px;background:linear-gradient(to bottom,${pc(p)}44,transparent);margin:8px auto 0"></div>
      </div>
      <div style="background:#fff;border-radius:14px;padding:24px;border:1px solid #e2e8f0;flex:1;box-shadow:0 2px 12px rgba(0,0,0,0.03);transition:box-shadow 0.3s" onmouseenter="this.style.boxShadow='0 8px 30px rgba(0,0,0,0.08)'" onmouseleave="this.style.boxShadow='0 2px 12px rgba(0,0,0,0.03)'">
        <h3 style="font-size:1.125rem;font-weight:700;color:#0f172a;margin:0 0 8px">${m.title}</h3>
        <p style="font-size:0.9375rem;color:#64748b;margin:0;line-height:1.6">${m.desc}</p>
      </div>
    </div>`
  ).join('\n    ')

  return `<section dir="${dir(p)}" style="background:#f8fafc;padding:80px 24px">
  <style>
    .${asId}-item[data-visible] { opacity:1 !important; transform:translateY(0) !important; }
    @media(prefers-reduced-motion:reduce) { .${asId}-item { opacity:1 !important; transform:none !important; transition:none !important; } }
  </style>
  <div style="max-width:1200px;margin-inline:auto;text-align:center;margin-block-end:56px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'Our Story', 'הסיפור שלנו')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 0">${t(p, `The ${p.businessName} Journey`, `המסע של ${p.businessName}`)}</h2>
  </div>
  <div style="max-width:700px;margin:0 auto">
    ${items}
  </div>
  <script>
    (function(){
      if(typeof IntersectionObserver==='undefined')return;
      var items=document.querySelectorAll('.${asId}-item[data-reveal]');
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){if(e.isIntersecting){e.target.setAttribute('data-visible','');obs.unobserve(e.target);}});
      },{threshold:0.15});
      items.forEach(function(el){obs.observe(el);});
    })();
  </script>
</section>`
}

/** About team & mission — mission statement + team grid */
export const generateAboutTeamMission = (p: SectionParams): string => {
  const atmId = `about-tm-${uid()}`
  const team = [
    { name: t(p, 'Sarah Chen', 'שרה כהן'), role: t(p, 'CEO & Founder', 'מנכ"לית ומייסדת'), initials: 'SC' },
    { name: t(p, 'David Miller', 'דוד מילר'), role: t(p, 'CTO', 'מנהל טכנולוגי'), initials: 'DM' },
    { name: t(p, 'Maya Rodriguez', 'מאיה רודריגז'), role: t(p, 'Head of Design', 'מנהלת עיצוב'), initials: 'MR' },
    { name: t(p, 'Alex Kim', 'אלכס קים'), role: t(p, 'Lead Engineer', 'מהנדס ראשי'), initials: 'AK' },
    { name: t(p, 'Lena Novak', 'לנה נובק'), role: t(p, 'Product Manager', 'מנהלת מוצר'), initials: 'LN' },
    { name: t(p, 'Tom Harris', 'תום הריס'), role: t(p, 'Head of Growth', 'מנהל צמיחה'), initials: 'TH' },
  ]

  const teamCards = team.map((m) =>
    `<div style="text-align:center;transition:transform 0.3s" onmouseenter="this.style.transform='translateY(-4px)'" onmouseleave="this.style.transform='translateY(0)'">
      <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${pc(p)},${sc(p)});color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700;margin:0 auto 12px">${m.initials}</div>
      <h4 style="font-size:1rem;font-weight:700;color:#0f172a;margin:0">${m.name}</h4>
      <p style="font-size:0.8125rem;color:#64748b;margin:4px 0 0">${m.role}</p>
    </div>`
  ).join('\n      ')

  return `<section dir="${dir(p)}" style="background:#fff;padding:80px 24px">
  <style>
    .${atmId}-team { display:grid; grid-template-columns:repeat(3,1fr); gap:36px; max-width:700px; margin:0 auto; }
    @media(max-width:640px) { .${atmId}-team { grid-template-columns:repeat(2,1fr); } }
    @media(prefers-reduced-motion:reduce) { .${atmId}-team > div { transition:none !important; } }
  </style>
  <div style="max-width:800px;margin:0 auto;text-align:center;margin-block-end:56px">
    <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)}">${t(p, 'About Us', 'אודותינו')}</p>
    <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:8px 0 16px">${t(p, 'Our Mission', 'המשימה שלנו')}</h2>
    <p style="font-size:1.125rem;color:#475569;line-height:1.7;max-width:640px;margin:0 auto">${t(p, `At ${p.businessName}, we believe every ${p.businessType} business deserves a stunning online presence. Our team combines cutting-edge AI technology with thoughtful design to make that a reality.`, `ב${p.businessName}, אנחנו מאמינים שכל עסק ${p.businessType} ראוי לנוכחות מקוונת מרשימה. הצוות שלנו משלב טכנולוגיית AI מתקדמת עם עיצוב מחושב כדי להפוך את זה למציאות.`)}</p>
  </div>
  <div style="max-width:800px;margin:0 auto;text-align:center;margin-block-end:36px">
    <h3 style="font-size:1.25rem;font-weight:700;color:#0f172a;margin:0 0 8px">${t(p, 'Meet Our Team', 'הכירו את הצוות')}</h3>
    <p style="font-size:0.9375rem;color:#64748b;margin:0 0 32px">${t(p, 'The passionate people behind the platform.', 'האנשים הנלהבים מאחורי הפלטפורמה.')}</p>
  </div>
  <div class="${atmId}-team">
      ${teamCards}
  </div>
</section>`
}

/** About split image — large image on one side + story text on the other */
export const generateAboutSplitImage = (p: SectionParams): string => {
  const siId = `about-si-${uid()}`
  const stats = [
    { value: '10K+', label: t(p, 'Happy Customers', 'לקוחות מרוצים') },
    { value: '50+', label: t(p, 'Countries', 'מדינות') },
    { value: '99.9%', label: t(p, 'Uptime', 'זמינות') },
  ]

  return `<section dir="${dir(p)}" style="background:#fff;padding:80px 24px">
  <style>
    .${siId}-layout { display:grid; grid-template-columns:1fr 1.1fr; gap:56px; max-width:1100px; margin:0 auto; align-items:center; }
    .${siId}-stats { display:flex; gap:32px; margin-block-start:32px; }
    @media(max-width:768px) {
      .${siId}-layout { grid-template-columns:1fr; }
      .${siId}-stats { flex-wrap:wrap; gap:20px; }
    }
  </style>
  <div class="${siId}-layout">
    <div style="position:relative">
      <div style="aspect-ratio:4/3;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.1)">
        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" alt="${t(p, 'Our team at work', 'הצוות שלנו בעבודה')}" style="width:100%;height:100%;object-fit:cover" loading="lazy" />
      </div>
      <div style="position:absolute;bottom:-16px;inset-inline-end:-16px;background:${pc(p)};color:#fff;border-radius:12px;padding:16px 24px;font-weight:700;font-size:1.125rem;box-shadow:0 8px 24px ${pc(p)}44">
        ${t(p, 'Since 2020', 'מאז 2020')}
      </div>
    </div>
    <div>
      <p style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${pc(p)};margin-block-end:8px">${t(p, 'Our Story', 'הסיפור שלנו')}</p>
      <h2 style="font-size:clamp(1.75rem,3.5vw,2.5rem);font-weight:800;color:#0f172a;margin:0 0 16px;line-height:1.2">${t(p, `We\'re Building the Future of ${p.businessType}`, `אנחנו בונים את העתיד של ${p.businessType}`)}</h2>
      <p style="font-size:1rem;color:#475569;line-height:1.7;margin:0 0 12px">${t(p, `${p.businessName} started with a bold idea: what if creating a professional online presence was as simple as describing what you need? Today, thousands of businesses trust us to power their digital presence.`, `${p.businessName} התחילה עם רעיון נועז: מה אם יצירת נוכחות מקוונת מקצועית הייתה פשוטה כמו לתאר מה אתם צריכים? היום, אלפי עסקים סומכים עלינו.`)}</p>
      <p style="font-size:1rem;color:#475569;line-height:1.7;margin:0">${t(p, 'Our team of engineers, designers, and AI specialists works tirelessly to push the boundaries of what\'s possible in web creation.', 'הצוות שלנו של מהנדסים, מעצבים ומומחי AI עובד ללא לאות כדי לדחוף את הגבולות של מה שאפשרי ביצירת אתרים.')}</p>
      <div class="${siId}-stats">
        ${stats.map(s => `<div>
          <div style="font-size:1.5rem;font-weight:800;color:${pc(p)}">${s.value}</div>
          <div style="font-size:0.8125rem;color:#64748b;margin-block-start:2px">${s.label}</div>
        </div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>`
}
