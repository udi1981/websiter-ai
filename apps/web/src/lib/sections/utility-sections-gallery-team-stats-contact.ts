/**
 * Premium Utility Section Generators — Gallery, Team, Stats, Contact.
 *
 * Generates raw HTML section strings for iframe rendering.
 * Quality target: $50K custom agency site (Apple, Stripe, Linear, Airbnb).
 *
 * Each function returns a complete HTML section string (not a full page).
 * Tailwind CSS CDN assumed. All sections are responsive (mobile-first),
 * RTL-safe via CSS logical properties, and respect prefers-reduced-motion.
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
  items?: { title?: string; description?: string; icon?: string; value?: string; label?: string }[]
  stats?: { value: string; label: string }[]
  notes?: string
  palette?: { primary: string; primaryHover: string; secondary: string; accent: string; background: string; backgroundAlt: string; text: string; textMuted: string; border: string }
  fonts?: { heading: string; body: string; headingWeight: string; bodyWeight: string }
}

const defaults = (p: SectionParams) => {
  const primary = p.primaryColor || '#7C3AED'
  const secondary = p.secondaryColor || '#06B6D4'
  const dir = p.locale === 'he' ? 'rtl' : 'ltr'
  const lang = p.locale || 'en'
  const hf = p.fonts?.heading || (p.locale === 'he' ? 'Heebo' : 'Inter')
  const bf = p.fonts?.body || (p.locale === 'he' ? 'Heebo' : 'Inter')
  return { primary, secondary, dir, lang, hf, bf }
}

const uid = () => Math.random().toString(36).slice(2, 8)

/** Handle both Unsplash URLs and base64 data URLs */
const imgSrc = (url?: string, fallback?: string) => {
  if (!url && !fallback) return 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80'
  const src = url || fallback || ''
  if (src.startsWith('data:')) return src
  return `${src}${src.includes('?') ? '&' : '?'}w=800&q=80`
}

/** Generate placeholder team members contextual to business type */
const teamMembers = (businessType: string, locale?: string) => {
  const isHe = locale === 'he'
  const teams: Record<string, { name: string; role: string; bio: string }[]> = {
    default: isHe
      ? [
          { name: 'דניאל כהן', role: 'מנכ"ל', bio: 'מוביל חזון אסטרטגי עם 15+ שנות ניסיון בתעשייה.' },
          { name: 'מיכל לוי', role: 'סמנכ"ל טכנולוגיה', bio: 'מומחית טכנולוגיה עם רקע בחברות הייטק מובילות.' },
          { name: 'יוסי אברהם', role: 'מנהל עיצוב', bio: 'מעצב חוויית משתמש עם עין לפרטים ויצירתיות.' },
          { name: 'שרה גולדברג', role: 'מנהלת שיווק', bio: 'מובילה אסטרטגיות שיווק דיגיטלי ומיתוג.' },
          { name: 'אבי רוזנברג', role: 'מהנדס ראשי', bio: 'מפתח Full Stack עם תשוקה לקוד נקי.' },
          { name: 'נועה פרידמן', role: 'מנהלת מוצר', bio: 'מחברת בין צרכי לקוח לפתרונות טכנולוגיים.' },
        ]
      : [
          { name: 'Daniel Cohen', role: 'CEO & Founder', bio: 'Driving strategic vision with 15+ years of industry experience.' },
          { name: 'Michelle Levy', role: 'CTO', bio: 'Technology expert with background in leading tech companies.' },
          { name: 'Joseph Abraham', role: 'Head of Design', bio: 'UX designer with an eye for detail and creativity.' },
          { name: 'Sarah Goldberg', role: 'Marketing Director', bio: 'Leading digital marketing strategies and brand identity.' },
          { name: 'Avi Rosenberg', role: 'Lead Engineer', bio: 'Full-stack developer with a passion for clean code.' },
          { name: 'Noa Friedman', role: 'Product Manager', bio: 'Bridging customer needs with technology solutions.' },
        ],
  }
  return teams.default
}

/** Generate placeholder stats contextual to business type */
const statsData = (businessType: string, locale?: string) => {
  const isHe = locale === 'he'
  return isHe
    ? [
        { value: 2500, label: 'לקוחות מרוצים', suffix: '+' },
        { value: 98, label: 'אחוז שביעות רצון', suffix: '%' },
        { value: 15, label: 'שנות ניסיון', suffix: '+' },
        { value: 50, label: 'אנשי צוות', suffix: '+' },
      ]
    : [
        { value: 2500, label: 'Happy Clients', suffix: '+' },
        { value: 98, label: 'Satisfaction Rate', suffix: '%' },
        { value: 15, label: 'Years Experience', suffix: '+' },
        { value: 50, label: 'Team Members', suffix: '+' },
      ]
}

/** Generate placeholder gallery items */
const galleryItems = (businessType: string) => {
  const categories = ['All', 'Branding', 'Web Design', 'Photography', 'Marketing']
  return Array.from({ length: 8 }, (_, i) => ({
    src: `https://images.unsplash.com/photo-${1550000000000 + i * 5000000}?w=600&q=80`,
    alt: `${businessType} project ${i + 1}`,
    category: categories[i % categories.length],
  }))
}

const reducedMotionCSS = `@media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}}`

/* ==========================================================================
   GALLERY — 6 variants
   ========================================================================== */

/**
 * 1. Masonry gallery with CSS columns and lightbox modal
 */
export const generateGalleryMasonry = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `masonry-${uid()}`
  const baseItems = galleryItems(params.businessType)
  const isHe = params.locale === 'he'
  const title = isHe ? 'הגלריה שלנו' : 'Our Gallery'
  const subtitle = isHe ? 'עבודות נבחרות שמציגות את המומחיות שלנו' : 'Selected works showcasing our expertise'

  // Use generated images (gallery_0, gallery_1, gallery_2) when available
  const p = params as Record<string, unknown>
  const items = baseItems.map((item, i) => ({
    ...item,
    src: imgSrc(p[`gallery_${i}`] as string | undefined, item.src),
  }))

  return `<section dir="${dir}" lang="${lang}" style="background:#0B0F1A;padding:80px 24px;position:relative;overflow:hidden">
  <style>
    ${reducedMotionCSS}
    .${id}-grid{columns:4;column-gap:16px;max-width:1200px;margin:0 auto}
    .${id}-item{break-inside:avoid;margin-bottom:16px;border-radius:12px;overflow:hidden;position:relative;cursor:pointer;transition:transform .3s ease,box-shadow .3s ease}
    .${id}-item:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.4)}
    .${id}-item img{width:100%;display:block;transition:transform .5s ease}
    .${id}-item:hover img{transform:scale(1.05)}
    .${id}-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%);opacity:0;transition:opacity .3s;display:flex;align-items:flex-end;padding:20px}
    .${id}-item:hover .${id}-overlay{opacity:1}
    .${id}-modal{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.9);backdrop-filter:blur(20px);display:none;align-items:center;justify-content:center;padding:24px}
    .${id}-modal.active{display:flex}
    .${id}-modal img{max-width:90vw;max-height:85vh;border-radius:12px;object-fit:contain}
    .${id}-close{position:absolute;top:24px;inset-inline-end:24px;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.1);border:none;color:#fff;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .3s}
    .${id}-close:hover{background:rgba(255,255,255,.2)}
    @media(max-width:1024px){.${id}-grid{columns:3}}
    @media(max-width:768px){.${id}-grid{columns:2}}
    @media(max-width:480px){.${id}-grid{columns:1}}
    @keyframes ${id}-fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .${id}-anim{animation:${id}-fadeUp .6s ease forwards;opacity:0}
  </style>

  <div style="max-width:1200px;margin:0 auto 48px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.125rem;color:rgba(255,255,255,.6);margin:0;max-width:600px;margin-inline:auto">${subtitle}</p>
  </div>

  <div class="${id}-grid">
    ${items.map((item, i) => {
      const heights = [240, 320, 280, 360, 300, 260, 340, 290]
      return `<div class="${id}-item ${id}-anim" style="animation-delay:${i * 0.08}s" onclick="document.getElementById('${id}-lightbox').classList.add('active');document.getElementById('${id}-lightbox-img').src=this.querySelector('img').src">
      <img src="${item.src}" alt="${item.alt}" loading="lazy" style="height:${heights[i]}px;object-fit:cover" />
      <div class="${id}-overlay">
        <span style="color:#fff;font-family:'${bf}',sans-serif;font-weight:600;font-size:0.875rem">${item.alt}</span>
      </div>
    </div>`
    }).join('\n    ')}
  </div>

  <div id="${id}-lightbox" class="${id}-modal" onclick="if(event.target===this)this.classList.remove('active')">
    <button class="${id}-close" onclick="this.parentElement.classList.remove('active')" aria-label="Close">&times;</button>
    <img id="${id}-lightbox-img" src="" alt="Gallery preview" />
  </div>
</section>`
}

/**
 * 2. Grid gallery with blur-fade lightbox backdrop
 */
export const generateGalleryLightbox = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `lightbox-${uid()}`
  const items = galleryItems(params.businessType)
  const isHe = params.locale === 'he'
  const title = isHe ? 'העבודות שלנו' : 'Our Work'
  const subtitle = isHe ? 'לחצו על תמונה לצפייה מלאה' : 'Click any image for a closer look'

  return `<section dir="${dir}" lang="${lang}" style="background:#111827;padding:80px 24px;position:relative">
  <style>
    ${reducedMotionCSS}
    .${id}-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:1200px;margin:0 auto}
    .${id}-cell{aspect-ratio:1;border-radius:12px;overflow:hidden;cursor:pointer;position:relative}
    .${id}-cell img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease,filter .3s}
    .${id}-cell:hover img{transform:scale(1.08);filter:brightness(1.1)}
    .${id}-badge{position:absolute;bottom:12px;inset-inline-start:12px;background:${primary};color:#fff;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:600;font-family:'${bf}',sans-serif;opacity:0;transform:translateY(8px);transition:all .3s}
    .${id}-cell:hover .${id}-badge{opacity:1;transform:translateY(0)}
    .${id}-modal{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:24px}
    .${id}-modal.open{display:flex}
    .${id}-backdrop{position:absolute;inset:0;background:rgba(11,15,26,.85);backdrop-filter:blur(24px);animation:${id}-backdropIn .3s ease}
    @keyframes ${id}-backdropIn{from{opacity:0}to{opacity:1}}
    .${id}-modal-img{position:relative;z-index:1;max-width:90vw;max-height:85vh;border-radius:16px;object-fit:contain;animation:${id}-imgIn .4s ease}
    @keyframes ${id}-imgIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
    .${id}-close{position:absolute;top:20px;inset-inline-end:20px;z-index:2;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
    .${id}-close:hover{background:rgba(255,255,255,.2)}
    .${id}-nav{position:absolute;top:50%;z-index:2;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.1);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transform:translateY(-50%);transition:background .2s}
    .${id}-nav:hover{background:rgba(255,255,255,.2)}
    .${id}-prev{inset-inline-start:20px}
    .${id}-next{inset-inline-end:20px}
    @media(max-width:768px){.${id}-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:480px){.${id}-grid{grid-template-columns:1fr}}
  </style>

  <div style="max-width:1200px;margin:0 auto 48px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.125rem;color:rgba(255,255,255,.5);margin:0;max-width:540px;margin-inline:auto">${subtitle}</p>
  </div>

  <div class="${id}-grid">
    ${items.map((item, i) => `<div class="${id}-cell" onclick="(function(){var m=document.getElementById('${id}-m');m.classList.add('open');document.getElementById('${id}-mi').src='${item.src}';m.dataset.idx=${i}})()">
      <img src="${item.src}" alt="${item.alt}" loading="lazy" />
      <span class="${id}-badge">${item.category}</span>
    </div>`).join('\n    ')}
  </div>

  <div id="${id}-m" class="${id}-modal" onclick="if(event.target.classList.contains('${id}-backdrop'))this.classList.remove('open')">
    <div class="${id}-backdrop"></div>
    <button class="${id}-close" onclick="this.parentElement.classList.remove('open')" aria-label="Close">&times;</button>
    <button class="${id}-nav ${id}-prev" onclick="(function(m){var imgs=${JSON.stringify(items.map(it => it.src))};var idx=parseInt(m.dataset.idx||'0');idx=(idx-1+imgs.length)%imgs.length;m.dataset.idx=idx;document.getElementById('${id}-mi').src=imgs[idx]})(this.parentElement)" aria-label="Previous">&#8249;</button>
    <img id="${id}-mi" class="${id}-modal-img" src="" alt="Gallery preview" />
    <button class="${id}-nav ${id}-next" onclick="(function(m){var imgs=${JSON.stringify(items.map(it => it.src))};var idx=parseInt(m.dataset.idx||'0');idx=(idx+1)%imgs.length;m.dataset.idx=idx;document.getElementById('${id}-mi').src=imgs[idx]})(this.parentElement)" aria-label="Next">&#8250;</button>
  </div>
</section>`
}

/**
 * 3. Horizontal snap-scroll carousel with arrow navigation
 */
export const generateGalleryCarousel = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `carousel-${uid()}`
  const items = galleryItems(params.businessType)
  const isHe = params.locale === 'he'
  const title = isHe ? 'גלריית פרויקטים' : 'Project Gallery'

  return `<section dir="${dir}" lang="${lang}" style="background:#0F172A;padding:80px 0;overflow:hidden">
  <style>
    ${reducedMotionCSS}
    .${id}-track{display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:0 calc((100vw - 1200px)/2);-ms-overflow-style:none;scrollbar-width:none}
    .${id}-track::-webkit-scrollbar{display:none}
    .${id}-slide{flex:0 0 400px;scroll-snap-align:center;border-radius:16px;overflow:hidden;position:relative;transition:transform .3s}
    .${id}-slide:hover{transform:scale(1.02)}
    .${id}-slide img{width:100%;height:300px;object-fit:cover;display:block}
    .${id}-caption{position:absolute;bottom:0;inset-inline-start:0;inset-inline-end:0;padding:24px;background:linear-gradient(to top,rgba(0,0,0,.8),transparent)}
    .${id}-caption span{color:#fff;font-family:'${bf}',sans-serif;font-weight:600;font-size:0.95rem}
    .${id}-arrows{display:flex;justify-content:center;gap:12px;margin-top:32px;padding:0 24px}
    .${id}-arrow{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .${id}-arrow:hover{background:${primary};border-color:${primary}}
    .${id}-dots{display:flex;justify-content:center;gap:8px;margin-top:20px}
    .${id}-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.2);border:none;cursor:pointer;transition:all .3s;padding:0}
    .${id}-dot.active{background:${primary};width:24px;border-radius:4px}
    @media(max-width:768px){.${id}-slide{flex:0 0 85vw}.${id}-track{padding:0 24px;gap:12px}}
  </style>

  <div style="max-width:1200px;margin:0 auto 40px;padding:0 24px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0;letter-spacing:-0.02em">${title}</h2>
  </div>

  <div class="${id}-track" id="${id}-track">
    ${items.map((item, i) => `<div class="${id}-slide">
      <img src="${item.src}" alt="${item.alt}" loading="lazy" />
      <div class="${id}-caption"><span>${item.alt}</span></div>
    </div>`).join('\n    ')}
  </div>

  <div class="${id}-arrows">
    <button class="${id}-arrow" onclick="document.getElementById('${id}-track').scrollBy({left:${dir === 'rtl' ? '' : '-'}420,behavior:'smooth'})" aria-label="Previous">&#8249;</button>
    <button class="${id}-arrow" onclick="document.getElementById('${id}-track').scrollBy({left:${dir === 'rtl' ? '-' : ''}420,behavior:'smooth'})" aria-label="Next">&#8250;</button>
  </div>

  <div class="${id}-dots" id="${id}-dots">
    ${items.map((_, i) => `<button class="${id}-dot${i === 0 ? ' active' : ''}" onclick="document.getElementById('${id}-track').children[${i}].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})" aria-label="Go to slide ${i + 1}"></button>`).join('\n    ')}
  </div>

  <script>
    (function(){
      var track=document.getElementById('${id}-track');
      var dots=document.querySelectorAll('.${id}-dot');
      if(!track)return;
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){
            var idx=Array.from(track.children).indexOf(e.target);
            dots.forEach(function(d,di){d.classList.toggle('active',di===idx)});
          }
        });
      },{root:track,threshold:0.6});
      Array.from(track.children).forEach(function(c){observer.observe(c)});
    })();
  </script>
</section>`
}

/**
 * 4. Filterable gallery with category tabs and fade transition
 */
export const generateGalleryFilterable = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `filter-${uid()}`
  const items = galleryItems(params.businessType)
  const isHe = params.locale === 'he'
  const title = isHe ? 'העבודות שלנו' : 'Our Portfolio'
  const subtitle = isHe ? 'סננו לפי קטגוריה' : 'Filter by category'
  const categories = ['All', 'Branding', 'Web Design', 'Photography', 'Marketing']

  return `<section dir="${dir}" lang="${lang}" style="background:#0B0F1A;padding:80px 24px">
  <style>
    ${reducedMotionCSS}
    .${id}-tabs{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:40px}
    .${id}-tab{padding:8px 20px;border-radius:100px;border:1px solid rgba(255,255,255,.12);background:transparent;color:rgba(255,255,255,.6);font-family:'${bf}',sans-serif;font-size:0.875rem;font-weight:500;cursor:pointer;transition:all .3s}
    .${id}-tab:hover,.${id}-tab.active{background:${primary};color:#fff;border-color:${primary}}
    .${id}-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:1200px;margin:0 auto}
    .${id}-card{border-radius:12px;overflow:hidden;position:relative;aspect-ratio:4/3;transition:opacity .4s,transform .4s}
    .${id}-card.hidden{opacity:0;transform:scale(.95);position:absolute;pointer-events:none;width:0;height:0;overflow:hidden}
    .${id}-card img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
    .${id}-card:hover img{transform:scale(1.06)}
    .${id}-label{position:absolute;bottom:0;inset-inline-start:0;inset-inline-end:0;padding:16px;background:linear-gradient(to top,rgba(0,0,0,.7),transparent);color:#fff;font-family:'${bf}',sans-serif;font-size:0.85rem;font-weight:500}
    @media(max-width:768px){.${id}-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:480px){.${id}-grid{grid-template-columns:1fr}}
  </style>

  <div style="max-width:1200px;margin:0 auto;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.5);margin:0 0 32px">${subtitle}</p>
  </div>

  <div class="${id}-tabs" id="${id}-tabs">
    ${categories.map((cat, i) => `<button class="${id}-tab${i === 0 ? ' active' : ''}" data-cat="${cat}" onclick="(function(btn){
      document.querySelectorAll('.${id}-tab').forEach(function(t){t.classList.remove('active')});
      btn.classList.add('active');
      var cat=btn.dataset.cat;
      document.querySelectorAll('.${id}-card').forEach(function(c){
        if(cat==='All'||c.dataset.cat===cat){c.classList.remove('hidden')}else{c.classList.add('hidden')}
      });
    })(this)">${cat}</button>`).join('\n    ')}
  </div>

  <div class="${id}-grid">
    ${items.map((item, i) => `<div class="${id}-card" data-cat="${item.category}">
      <img src="${item.src}" alt="${item.alt}" loading="lazy" />
      <div class="${id}-label">${item.alt}</div>
    </div>`).join('\n    ')}
  </div>
</section>`
}

/**
 * 5. Fullscreen slideshow with counter indicator
 */
export const generateGalleryFullscreen = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `fs-${uid()}`
  const items = galleryItems(params.businessType)
  const isHe = params.locale === 'he'

  return `<section dir="${dir}" lang="${lang}" style="position:relative;width:100%;height:100vh;overflow:hidden;background:#000">
  <style>
    ${reducedMotionCSS}
    .${id}-slide{position:absolute;inset:0;opacity:0;transition:opacity .8s ease;z-index:0}
    .${id}-slide.active{opacity:1;z-index:1}
    .${id}-slide img{width:100%;height:100%;object-fit:cover}
    .${id}-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.3),rgba(0,0,0,.5))}
    .${id}-counter{position:absolute;bottom:40px;inset-inline-start:50%;transform:translateX(-50%);z-index:10;display:flex;align-items:center;gap:16px;color:#fff;font-family:'${bf}',sans-serif}
    .${id}-counter-num{font-size:1.5rem;font-weight:700;letter-spacing:-0.02em}
    .${id}-counter-total{font-size:1rem;color:rgba(255,255,255,.5)}
    .${id}-progress{position:absolute;bottom:0;inset-inline-start:0;height:3px;background:${primary};z-index:10;transition:width .3s}
    .${id}-ctrl{position:absolute;top:50%;z-index:10;width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transform:translateY(-50%);transition:background .3s}
    .${id}-ctrl:hover{background:rgba(255,255,255,.25)}
    .${id}-prev{inset-inline-start:24px}
    .${id}-next{inset-inline-end:24px}
    .${id}-title{position:absolute;bottom:100px;inset-inline-start:50%;transform:translateX(-50%);z-index:10;text-align:center;color:#fff;font-family:'${bf}',sans-serif}
    .${id}-title h3{font-size:clamp(1.5rem,3vw,2.5rem);font-weight:700;margin:0 0 8px;letter-spacing:-0.02em}
    .${id}-title p{font-size:1rem;color:rgba(255,255,255,.7);margin:0}
    @media(max-width:768px){.${id}-ctrl{width:40px;height:40px;font-size:16px}.${id}-prev{inset-inline-start:12px}.${id}-next{inset-inline-end:12px}}
  </style>

  ${items.map((item, i) => `<div class="${id}-slide${i === 0 ? ' active' : ''}" data-idx="${i}">
    <img src="${item.src}" alt="${item.alt}" />
    <div class="${id}-overlay"></div>
  </div>`).join('\n  ')}

  <div class="${id}-title">
    <h3 id="${id}-label">${items[0].alt}</h3>
    <p id="${id}-cat">${items[0].category}</p>
  </div>

  <div class="${id}-counter">
    <span class="${id}-counter-num" id="${id}-cur">01</span>
    <span class="${id}-counter-total">/ ${String(items.length).padStart(2, '0')}</span>
  </div>
  <div class="${id}-progress" id="${id}-prog" style="width:${100 / items.length}%"></div>

  <button class="${id}-ctrl ${id}-prev" onclick="${id}Go(-1)" aria-label="Previous">&#8249;</button>
  <button class="${id}-ctrl ${id}-next" onclick="${id}Go(1)" aria-label="Next">&#8250;</button>

  <script>
    (function(){
      var slides=document.querySelectorAll('.${id}-slide');
      var cur=0;var total=slides.length;
      var labels=${JSON.stringify(items.map(i => i.alt))};
      var cats=${JSON.stringify(items.map(i => i.category))};
      window['${id}Go']=function(d){
        slides[cur].classList.remove('active');
        cur=(cur+d+total)%total;
        slides[cur].classList.add('active');
        document.getElementById('${id}-cur').textContent=String(cur+1).padStart(2,'0');
        document.getElementById('${id}-prog').style.width=((cur+1)/total*100)+'%';
        document.getElementById('${id}-label').textContent=labels[cur];
        document.getElementById('${id}-cat').textContent=cats[cur];
      };
      var auto=setInterval(function(){window['${id}Go'](1)},5000);
      document.querySelector('.${id}-prev').addEventListener('mouseenter',function(){clearInterval(auto)});
      document.querySelector('.${id}-next').addEventListener('mouseenter',function(){clearInterval(auto)});
    })();
  </script>
</section>`
}

/**
 * 6. Before/After drag slider comparison
 */
export const generateGalleryBeforeAfter = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `ba-${uid()}`
  const isHe = params.locale === 'he'
  const title = isHe ? 'לפני ואחרי' : 'Before & After'
  const subtitle = isHe ? 'גררו את המחוון כדי לראות את ההבדל' : 'Drag the slider to see the difference'

  return `<section dir="${dir}" lang="${lang}" style="background:#0B0F1A;padding:80px 24px">
  <style>
    ${reducedMotionCSS}
    .${id}-wrap{position:relative;max-width:900px;margin:0 auto;aspect-ratio:16/9;border-radius:16px;overflow:hidden;cursor:col-resize;user-select:none;-webkit-user-select:none}
    .${id}-img{position:absolute;inset:0}
    .${id}-img img{width:100%;height:100%;object-fit:cover;display:block}
    .${id}-before{clip-path:inset(0 50% 0 0)}
    .${id}-line{position:absolute;top:0;bottom:0;width:3px;background:${primary};left:50%;transform:translateX(-50%);z-index:10;pointer-events:none}
    .${id}-handle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:11;width:48px;height:48px;border-radius:50%;background:${primary};border:3px solid #fff;display:flex;align-items:center;justify-content:center;pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,.3)}
    .${id}-handle svg{width:20px;height:20px;color:#fff}
    .${id}-label{position:absolute;top:16px;z-index:5;padding:6px 16px;border-radius:100px;font-family:'${bf}',sans-serif;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;backdrop-filter:blur(8px)}
    .${id}-lbl-before{inset-inline-start:16px;background:rgba(0,0,0,.5);color:#fff}
    .${id}-lbl-after{inset-inline-end:16px;background:rgba(255,255,255,.15);color:#fff}
  </style>

  <div style="max-width:900px;margin:0 auto 48px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.5);margin:0">${subtitle}</p>
  </div>

  <div class="${id}-wrap" id="${id}-wrap">
    <div class="${id}-img">
      <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80" alt="After" />
    </div>
    <div class="${id}-img ${id}-before" id="${id}-before">
      <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80" alt="Before" />
    </div>
    <div class="${id}-line" id="${id}-line"></div>
    <div class="${id}-handle" id="${id}-handle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/><polyline points="9 18 15 12 9 6" transform="translate(6,0)"/></svg>
    </div>
    <span class="${id}-label ${id}-lbl-before">${isHe ? 'לפני' : 'Before'}</span>
    <span class="${id}-label ${id}-lbl-after">${isHe ? 'אחרי' : 'After'}</span>
  </div>

  <script>
    (function(){
      var wrap=document.getElementById('${id}-wrap');
      var before=document.getElementById('${id}-before');
      var line=document.getElementById('${id}-line');
      var handle=document.getElementById('${id}-handle');
      if(!wrap)return;
      var dragging=false;
      function update(x){
        var rect=wrap.getBoundingClientRect();
        var pct=Math.max(0,Math.min(1,(x-rect.left)/rect.width))*100;
        before.style.clipPath='inset(0 '+(100-pct)+'% 0 0)';
        line.style.left=pct+'%';
        handle.style.left=pct+'%';
      }
      wrap.addEventListener('mousedown',function(e){dragging=true;update(e.clientX)});
      window.addEventListener('mousemove',function(e){if(dragging)update(e.clientX)});
      window.addEventListener('mouseup',function(){dragging=false});
      wrap.addEventListener('touchstart',function(e){dragging=true;update(e.touches[0].clientX)},{passive:true});
      window.addEventListener('touchmove',function(e){if(dragging)update(e.touches[0].clientX)},{passive:true});
      window.addEventListener('touchend',function(){dragging=false});
    })();
  </script>
</section>`
}

/* ==========================================================================
   TEAM — 4 variants
   ========================================================================== */

/**
 * 1. Team grid with 3D tilt effect on hover
 */
export const generateTeamGrid = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `team-grid-${uid()}`
  const members = teamMembers(params.businessType, params.locale)
  const isHe = params.locale === 'he'
  const title = isHe ? 'הצוות שלנו' : 'Meet Our Team'
  const subtitle = isHe ? 'האנשים שעומדים מאחורי ההצלחה שלנו' : 'The people behind our success'

  return `<section dir="${dir}" lang="${lang}" style="background:#0B0F1A;padding:80px 24px">
  <style>
    ${reducedMotionCSS}
    .${id}-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto}
    .${id}-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:32px;text-align:center;transition:transform .4s,box-shadow .4s;transform-style:preserve-3d;perspective:800px}
    .${id}-card:hover{box-shadow:0 20px 60px rgba(124,58,237,.15)}
    .${id}-avatar{width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,${primary},${secondary});margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;font-family:'${hf}',sans-serif;font-weight:700;position:relative;overflow:hidden}
    .${id}-avatar::after{content:'';position:absolute;inset:3px;border-radius:50%;background:#1a1f2e}
    .${id}-avatar span{position:relative;z-index:1}
    .${id}-name{font-family:'${hf}',sans-serif;font-weight:700;font-size:1.125rem;color:#fff;margin:0 0 4px}
    .${id}-role{font-family:'${bf}',sans-serif;font-size:0.875rem;color:${primary};margin:0 0 12px;font-weight:500}
    .${id}-bio{font-family:'${bf}',sans-serif;font-size:0.875rem;color:rgba(255,255,255,.5);margin:0 0 16px;line-height:1.6}
    .${id}-socials{display:flex;justify-content:center;gap:8px}
    .${id}-socials a{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;transition:all .3s;text-decoration:none}
    .${id}-socials a:hover{background:${primary};border-color:${primary}}
    .${id}-socials svg{width:14px;height:14px;color:rgba(255,255,255,.6)}
    .${id}-socials a:hover svg{color:#fff}
    @media(max-width:768px){.${id}-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:480px){.${id}-grid{grid-template-columns:1fr}}
  </style>

  <div style="max-width:1100px;margin:0 auto 56px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.125rem;color:rgba(255,255,255,.5);margin:0;max-width:540px;margin-inline:auto">${subtitle}</p>
  </div>

  <div class="${id}-grid">
    ${members.map(m => {
      const initials = m.name.split(' ').map(w => w[0]).join('')
      return `<div class="${id}-card" onmousemove="(function(e,el){var r=el.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5;var y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(800px) rotateY('+x*10+'deg) rotateX('+(-y*10)+'deg) scale(1.02)'})(event,this)" onmouseleave="this.style.transform='perspective(800px) rotateY(0) rotateX(0) scale(1)'">
      <div class="${id}-avatar"><span>${initials}</span></div>
      <h3 class="${id}-name">${m.name}</h3>
      <p class="${id}-role">${m.role}</p>
      <p class="${id}-bio">${m.bio}</p>
      <div class="${id}-socials">
        <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
        <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 7.5v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>
      </div>
    </div>`
    }).join('\n    ')}
  </div>
</section>`
}

/**
 * 2. Horizontal scroll team carousel with snap points
 */
export const generateTeamCarousel = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `team-car-${uid()}`
  const members = teamMembers(params.businessType, params.locale)
  const isHe = params.locale === 'he'
  const title = isHe ? 'הכירו את הצוות' : 'Our Team'

  return `<section dir="${dir}" lang="${lang}" style="background:#111827;padding:80px 0;overflow:hidden">
  <style>
    ${reducedMotionCSS}
    .${id}-track{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:0 calc((100vw - 1100px)/2);-ms-overflow-style:none;scrollbar-width:none}
    .${id}-track::-webkit-scrollbar{display:none}
    .${id}-card{flex:0 0 320px;scroll-snap-align:center;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:20px;overflow:hidden;transition:transform .3s,box-shadow .3s}
    .${id}-card:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,.3)}
    .${id}-photo{height:280px;background:linear-gradient(135deg,${primary}33,${secondary}33);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
    .${id}-photo::after{content:'';position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to top,#111827,transparent)}
    .${id}-initial{font-size:4rem;font-weight:800;color:rgba(255,255,255,.15);font-family:'${bf}',sans-serif}
    .${id}-info{padding:24px}
    .${id}-name{font-family:'${hf}',sans-serif;font-weight:700;font-size:1.125rem;color:#fff;margin:0 0 4px}
    .${id}-role{font-family:'${bf}',sans-serif;font-size:0.85rem;color:${primary};margin:0 0 12px;font-weight:500}
    .${id}-bio{font-family:'${bf}',sans-serif;font-size:0.85rem;color:rgba(255,255,255,.45);margin:0;line-height:1.6}
    .${id}-nav{display:flex;justify-content:center;gap:12px;margin-top:32px;padding:0 24px}
    .${id}-btn{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .${id}-btn:hover{background:${primary};border-color:${primary}}
    @media(max-width:768px){.${id}-card{flex:0 0 85vw}.${id}-track{padding:0 24px}}
  </style>

  <div style="padding:0 24px;max-width:1100px;margin:0 auto 48px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0;letter-spacing:-0.02em">${title}</h2>
  </div>

  <div class="${id}-track" id="${id}-track">
    ${members.map(m => {
      const initials = m.name.split(' ').map(w => w[0]).join('')
      return `<div class="${id}-card">
      <div class="${id}-photo"><span class="${id}-initial">${initials}</span></div>
      <div class="${id}-info">
        <h3 class="${id}-name">${m.name}</h3>
        <p class="${id}-role">${m.role}</p>
        <p class="${id}-bio">${m.bio}</p>
      </div>
    </div>`
    }).join('\n    ')}
  </div>

  <div class="${id}-nav">
    <button class="${id}-btn" onclick="document.getElementById('${id}-track').scrollBy({left:-344,behavior:'smooth'})" aria-label="Previous">&#8249;</button>
    <button class="${id}-btn" onclick="document.getElementById('${id}-track').scrollBy({left:344,behavior:'smooth'})" aria-label="Next">&#8250;</button>
  </div>
</section>`
}

/**
 * 3. 3D flip cards — front: photo placeholder, back: bio
 */
export const generateTeamFlipCards = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `team-flip-${uid()}`
  const members = teamMembers(params.businessType, params.locale)
  const isHe = params.locale === 'he'
  const title = isHe ? 'הצוות שלנו' : 'The Team'
  const subtitle = isHe ? 'העבירו את העכבר כדי ללמוד עוד' : 'Hover to learn more'

  return `<section dir="${dir}" lang="${lang}" style="background:#0B0F1A;padding:80px 24px">
  <style>
    ${reducedMotionCSS}
    .${id}-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto}
    .${id}-flip{perspective:1000px;height:380px}
    .${id}-inner{position:relative;width:100%;height:100%;transition:transform .6s;transform-style:preserve-3d}
    .${id}-flip:hover .${id}-inner{transform:rotateY(180deg)}
    .${id}-front,.${id}-back{position:absolute;inset:0;backface-visibility:hidden;border-radius:16px;overflow:hidden}
    .${id}-front{background:linear-gradient(135deg,${primary}22,${secondary}22);border:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px}
    .${id}-back{background:linear-gradient(135deg,${primary},${secondary});transform:rotateY(180deg);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center}
    .${id}-avatar-front{width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,${primary},${secondary});display:flex;align-items:center;justify-content:center;font-size:2.5rem;font-weight:800;color:#fff;font-family:'${bf}',sans-serif}
    .${id}-front-name{font-family:'${hf}',sans-serif;font-weight:700;font-size:1.25rem;color:#fff;margin:0}
    .${id}-front-role{font-family:'${bf}',sans-serif;font-size:0.875rem;color:rgba(255,255,255,.5);margin:0}
    .${id}-back-name{font-family:'${hf}',sans-serif;font-weight:700;font-size:1.375rem;color:#fff;margin:0 0 8px}
    .${id}-back-role{font-family:'${bf}',sans-serif;font-size:0.875rem;color:rgba(255,255,255,.8);margin:0 0 16px;font-weight:500}
    .${id}-back-bio{font-family:'${bf}',sans-serif;font-size:0.95rem;color:rgba(255,255,255,.85);margin:0 0 24px;line-height:1.7}
    .${id}-back-link{display:inline-flex;align-items:center;gap:6px;padding:10px 24px;border-radius:100px;background:rgba(255,255,255,.2);color:#fff;font-family:'${bf}',sans-serif;font-size:0.85rem;font-weight:600;text-decoration:none;transition:background .3s;border:none;cursor:pointer}
    .${id}-back-link:hover{background:rgba(255,255,255,.3)}
    @media(max-width:768px){.${id}-grid{grid-template-columns:repeat(2,1fr)}.${id}-flip{height:340px}}
    @media(max-width:480px){.${id}-grid{grid-template-columns:1fr}}
  </style>

  <div style="max-width:1100px;margin:0 auto 56px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.5);margin:0">${subtitle}</p>
  </div>

  <div class="${id}-grid">
    ${members.map(m => {
      const initials = m.name.split(' ').map(w => w[0]).join('')
      return `<div class="${id}-flip">
      <div class="${id}-inner">
        <div class="${id}-front">
          <div class="${id}-avatar-front">${initials}</div>
          <h3 class="${id}-front-name">${m.name}</h3>
          <p class="${id}-front-role">${m.role}</p>
        </div>
        <div class="${id}-back">
          <h3 class="${id}-back-name">${m.name}</h3>
          <p class="${id}-back-role">${m.role}</p>
          <p class="${id}-back-bio">${m.bio}</p>
          <a href="#" class="${id}-back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            LinkedIn
          </a>
        </div>
      </div>
    </div>`
    }).join('\n    ')}
  </div>
</section>`
}

/**
 * 4. Hoverable cards with glow border + expand on hover
 */
export const generateTeamHoverable = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `team-hover-${uid()}`
  const members = teamMembers(params.businessType, params.locale)
  const isHe = params.locale === 'he'
  const title = isHe ? 'הצוות שעומד מאחורי הקלעים' : 'Behind the Scenes'
  const subtitle = isHe ? 'הכירו את האנשים שמובילים את החדשנות' : 'Meet the people driving innovation'

  return `<section dir="${dir}" lang="${lang}" style="background:#111827;padding:80px 24px">
  <style>
    ${reducedMotionCSS}
    .${id}-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto}
    .${id}-card{position:relative;background:#1a1f2e;border-radius:16px;padding:32px;text-align:center;overflow:hidden;transition:all .4s ease}
    .${id}-card::before{content:'';position:absolute;inset:-2px;border-radius:18px;background:linear-gradient(135deg,${primary},${secondary});z-index:-1;opacity:0;transition:opacity .4s}
    .${id}-card::after{content:'';position:absolute;inset:0;border-radius:16px;background:#1a1f2e;z-index:-1}
    .${id}-card:hover::before{opacity:1}
    .${id}-card:hover{transform:translateY(-4px);box-shadow:0 0 40px ${primary}22}
    .${id}-details{max-height:0;overflow:hidden;transition:max-height .5s ease,opacity .3s;opacity:0}
    .${id}-card:hover .${id}-details{max-height:120px;opacity:1}
    .${id}-avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${primary}44,${secondary}44);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:1.75rem;font-weight:700;color:${primary};font-family:'${bf}',sans-serif;transition:transform .4s}
    .${id}-card:hover .${id}-avatar{transform:scale(1.1)}
    .${id}-name{font-family:'${hf}',sans-serif;font-weight:700;font-size:1.05rem;color:#fff;margin:0 0 4px}
    .${id}-role{font-family:'${bf}',sans-serif;font-size:0.8rem;color:${primary};margin:0 0 12px;font-weight:500}
    .${id}-bio{font-family:'${bf}',sans-serif;font-size:0.85rem;color:rgba(255,255,255,.5);margin:0 0 16px;line-height:1.6}
    .${id}-socials{display:flex;justify-content:center;gap:8px}
    .${id}-socials a{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;transition:background .3s;text-decoration:none}
    .${id}-socials a:hover{background:${primary}}
    .${id}-socials svg{width:12px;height:12px;color:rgba(255,255,255,.5)}
    .${id}-socials a:hover svg{color:#fff}
    @media(max-width:768px){.${id}-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:480px){.${id}-grid{grid-template-columns:1fr}}
  </style>

  <div style="max-width:1100px;margin:0 auto 56px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.125rem;color:rgba(255,255,255,.5);margin:0;max-width:540px;margin-inline:auto">${subtitle}</p>
  </div>

  <div class="${id}-grid">
    ${members.map(m => {
      const initials = m.name.split(' ').map(w => w[0]).join('')
      return `<div class="${id}-card">
      <div class="${id}-avatar">${initials}</div>
      <h3 class="${id}-name">${m.name}</h3>
      <p class="${id}-role">${m.role}</p>
      <div class="${id}-details">
        <p class="${id}-bio">${m.bio}</p>
        <div class="${id}-socials">
          <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
          <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 7.5v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5"/></svg></a>
        </div>
      </div>
    </div>`
    }).join('\n    ')}
  </div>
</section>`
}

/* ==========================================================================
   STATS — 4 variants
   ========================================================================== */

/**
 * 1. Animated counting numbers on scroll (IntersectionObserver + rAF)
 */
export const generateStatsCounters = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `stats-cnt-${uid()}`
  const stats = statsData(params.businessType, params.locale)
  const isHe = params.locale === 'he'
  const title = isHe ? 'המספרים מדברים' : 'Numbers Speak'
  const subtitle = isHe ? 'תוצאות שאנחנו גאים בהן' : 'Results we are proud of'

  return `<section dir="${dir}" lang="${lang}" style="background:#0B0F1A;padding:80px 24px;position:relative;overflow:hidden">
  <style>
    ${reducedMotionCSS}
    .${id}-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;max-width:1100px;margin:0 auto}
    .${id}-card{text-align:center;padding:40px 24px;border-radius:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);transition:transform .3s,box-shadow .3s}
    .${id}-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.2)}
    .${id}-value{font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2.5rem,5vw,3.5rem);color:${primary};margin:0 0 8px;letter-spacing:-0.03em;line-height:1}
    .${id}-label{font-family:'${bf}',sans-serif;font-size:0.95rem;color:rgba(255,255,255,.5);margin:0;font-weight:500}
    .${id}-divider{width:40px;height:3px;background:linear-gradient(90deg,${primary},${secondary});border-radius:2px;margin:12px auto 0}
    .${id}-bg{position:absolute;top:50%;left:50%;width:600px;height:600px;background:radial-gradient(circle,${primary}08 0%,transparent 70%);transform:translate(-50%,-50%);pointer-events:none}
    @media(max-width:768px){.${id}-grid{grid-template-columns:repeat(2,1fr);gap:20px}}
    @media(max-width:480px){.${id}-grid{grid-template-columns:1fr}}
  </style>

  <div class="${id}-bg"></div>

  <div style="max-width:1100px;margin:0 auto 56px;text-align:center;position:relative">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.125rem;color:rgba(255,255,255,.5);margin:0;max-width:500px;margin-inline:auto">${subtitle}</p>
  </div>

  <div class="${id}-grid" id="${id}-grid">
    ${stats.map(s => `<div class="${id}-card">
      <div class="${id}-value"><span data-target="${s.value}" data-suffix="${s.suffix}">0${s.suffix}</span></div>
      <p class="${id}-label">${s.label}</p>
      <div class="${id}-divider"></div>
    </div>`).join('\n    ')}
  </div>

  <script>
    (function(){
      var grid=document.getElementById('${id}-grid');
      if(!grid)return;
      var animated=false;
      function animateCounters(){
        if(animated)return;
        animated=true;
        var spans=grid.querySelectorAll('[data-target]');
        spans.forEach(function(span){
          var target=parseInt(span.dataset.target,10);
          var suffix=span.dataset.suffix||'';
          var duration=2000;
          var start=performance.now();
          function step(now){
            var elapsed=now-start;
            var progress=Math.min(elapsed/duration,1);
            var eased=1-Math.pow(1-progress,3);
            var current=Math.floor(eased*target);
            span.textContent=current.toLocaleString()+suffix;
            if(progress<1)requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      }
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){if(e.isIntersecting)animateCounters()});
      },{threshold:0.3});
      obs.observe(grid);
    })();
  </script>
</section>`
}

/**
 * 2. Animated horizontal progress bars that fill on scroll
 */
export const generateStatsProgressBars = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `stats-prog-${uid()}`
  const isHe = params.locale === 'he'
  const title = isHe ? 'הכישורים שלנו' : 'Our Expertise'
  const subtitle = isHe ? 'תחומי ההתמחות המובילים שלנו' : 'Key areas where we excel'
  const skills = isHe
    ? [
        { label: 'עיצוב ממשק', value: 95 },
        { label: 'פיתוח Frontend', value: 90 },
        { label: 'פיתוח Backend', value: 85 },
        { label: 'אסטרטגיה דיגיטלית', value: 88 },
      ]
    : [
        { label: 'UI/UX Design', value: 95 },
        { label: 'Frontend Development', value: 90 },
        { label: 'Backend Engineering', value: 85 },
        { label: 'Digital Strategy', value: 88 },
      ]

  return `<section dir="${dir}" lang="${lang}" style="background:#111827;padding:80px 24px">
  <style>
    ${reducedMotionCSS}
    .${id}-wrap{max-width:800px;margin:0 auto}
    .${id}-bar-group{margin-bottom:32px}
    .${id}-bar-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
    .${id}-bar-label{font-family:'${bf}',sans-serif;font-weight:600;font-size:0.95rem;color:#fff}
    .${id}-bar-pct{font-family:'${hf}',sans-serif;font-weight:700;font-size:0.95rem;color:${primary}}
    .${id}-track{width:100%;height:10px;background:rgba(255,255,255,.06);border-radius:100px;overflow:hidden}
    .${id}-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,${primary},${secondary});width:0;transition:width 1.5s cubic-bezier(0.4,0,0.2,1)}
    .${id}-fill.animated{width:var(--target-width)}
  </style>

  <div style="max-width:800px;margin:0 auto 56px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.125rem;color:rgba(255,255,255,.5);margin:0">${subtitle}</p>
  </div>

  <div class="${id}-wrap" id="${id}-wrap">
    ${skills.map(s => `<div class="${id}-bar-group">
      <div class="${id}-bar-header">
        <span class="${id}-bar-label">${s.label}</span>
        <span class="${id}-bar-pct">${s.value}%</span>
      </div>
      <div class="${id}-track">
        <div class="${id}-fill" style="--target-width:${s.value}%"></div>
      </div>
    </div>`).join('\n    ')}
  </div>

  <script>
    (function(){
      var wrap=document.getElementById('${id}-wrap');
      if(!wrap)return;
      var animated=false;
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting&&!animated){
            animated=true;
            wrap.querySelectorAll('.${id}-fill').forEach(function(el,i){
              setTimeout(function(){el.classList.add('animated')},i*200);
            });
          }
        });
      },{threshold:0.3});
      obs.observe(wrap);
    })();
  </script>
</section>`
}

/**
 * 3. Dashboard-style metric cards with mini CSS sparkline charts
 */
export const generateStatsDashboard = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `stats-dash-${uid()}`
  const isHe = params.locale === 'he'
  const title = isHe ? 'הביצועים שלנו' : 'Performance Metrics'
  const metrics = isHe
    ? [
        { label: 'הכנסות חודשיות', value: '₪1.2M', change: '+12.5%', up: true, bars: [40, 55, 45, 60, 75, 65, 80] },
        { label: 'לקוחות חדשים', value: '847', change: '+8.2%', up: true, bars: [30, 45, 50, 40, 65, 55, 70] },
        { label: 'שיעור המרה', value: '4.8%', change: '+2.1%', up: true, bars: [50, 45, 55, 60, 50, 65, 70] },
        { label: 'שביעות רצון', value: '98.5%', change: '-0.2%', up: false, bars: [85, 90, 88, 92, 90, 95, 93] },
      ]
    : [
        { label: 'Monthly Revenue', value: '$1.2M', change: '+12.5%', up: true, bars: [40, 55, 45, 60, 75, 65, 80] },
        { label: 'New Clients', value: '847', change: '+8.2%', up: true, bars: [30, 45, 50, 40, 65, 55, 70] },
        { label: 'Conversion Rate', value: '4.8%', change: '+2.1%', up: true, bars: [50, 45, 55, 60, 50, 65, 70] },
        { label: 'Satisfaction', value: '98.5%', change: '-0.2%', up: false, bars: [85, 90, 88, 92, 90, 95, 93] },
      ]

  return `<section dir="${dir}" lang="${lang}" style="background:#0B0F1A;padding:80px 24px">
  <style>
    ${reducedMotionCSS}
    .${id}-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:1200px;margin:0 auto}
    .${id}-card{background:#141922;border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:24px;transition:transform .3s,box-shadow .3s}
    .${id}-card:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.2)}
    .${id}-label{font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.4);margin:0 0 12px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em}
    .${id}-row{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px}
    .${id}-val{font-family:'${hf}',sans-serif;font-weight:800;font-size:1.75rem;color:#fff;letter-spacing:-0.02em;margin:0}
    .${id}-change{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-family:'${bf}',sans-serif;font-size:0.75rem;font-weight:600}
    .${id}-up{background:rgba(16,185,129,.12);color:#10B981}
    .${id}-down{background:rgba(239,68,68,.12);color:#EF4444}
    .${id}-spark{display:flex;align-items:flex-end;gap:4px;height:40px}
    .${id}-bar{flex:1;border-radius:3px 3px 0 0;background:linear-gradient(to top,${primary}66,${primary});transition:height .6s ease;min-width:0}
    @media(max-width:1024px){.${id}-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:480px){.${id}-grid{grid-template-columns:1fr}}
  </style>

  <div style="max-width:1200px;margin:0 auto 48px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0;letter-spacing:-0.02em">${title}</h2>
  </div>

  <div class="${id}-grid">
    ${metrics.map(m => `<div class="${id}-card">
      <p class="${id}-label">${m.label}</p>
      <div class="${id}-row">
        <p class="${id}-val">${m.value}</p>
        <span class="${id}-change ${m.up ? `${id}-up` : `${id}-down`}">
          ${m.up ? '&#9650;' : '&#9660;'} ${m.change}
        </span>
      </div>
      <div class="${id}-spark">
        ${m.bars.map(h => `<div class="${id}-bar" style="height:${h}%"></div>`).join('')}
      </div>
    </div>`).join('\n    ')}
  </div>
</section>`
}

/**
 * 4. Radial/circular progress indicators using SVG circles
 */
export const generateStatsRadial = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `stats-rad-${uid()}`
  const isHe = params.locale === 'he'
  const title = isHe ? 'ההישגים שלנו' : 'Our Achievements'
  const subtitle = isHe ? 'מספרים שמדברים בעד עצמם' : 'Numbers that tell our story'
  const metrics = isHe
    ? [
        { label: 'שביעות רצון', value: 98, suffix: '%', color: primary },
        { label: 'פרויקטים שהושלמו', value: 85, suffix: '%', color: secondary },
        { label: 'לקוחות חוזרים', value: 92, suffix: '%', color: '#F59E0B' },
        { label: 'יעדים שהושגו', value: 88, suffix: '%', color: '#10B981' },
      ]
    : [
        { label: 'Client Satisfaction', value: 98, suffix: '%', color: primary },
        { label: 'Projects Completed', value: 85, suffix: '%', color: secondary },
        { label: 'Returning Clients', value: 92, suffix: '%', color: '#F59E0B' },
        { label: 'Goals Achieved', value: 88, suffix: '%', color: '#10B981' },
      ]

  const radius = 70
  const circumference = 2 * Math.PI * radius

  return `<section dir="${dir}" lang="${lang}" style="background:#111827;padding:80px 24px">
  <style>
    ${reducedMotionCSS}
    .${id}-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;max-width:1100px;margin:0 auto}
    .${id}-card{text-align:center;padding:32px 16px}
    .${id}-ring{position:relative;width:160px;height:160px;margin:0 auto 20px}
    .${id}-ring svg{transform:rotate(-90deg)}
    .${id}-ring circle{fill:none;stroke-width:8;stroke-linecap:round}
    .${id}-bg-circle{stroke:rgba(255,255,255,.06)}
    .${id}-fg-circle{transition:stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1);filter:drop-shadow(0 0 8px var(--ring-color))}
    .${id}-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
    .${id}-num{font-family:'${hf}',sans-serif;font-weight:800;font-size:2rem;color:#fff;letter-spacing:-0.02em;margin:0}
    .${id}-label{font-family:'${bf}',sans-serif;font-size:0.85rem;color:rgba(255,255,255,.5);margin:8px 0 0;font-weight:500}
    @media(max-width:768px){.${id}-grid{grid-template-columns:repeat(2,1fr);gap:20px}}
    @media(max-width:480px){.${id}-grid{grid-template-columns:1fr}}
  </style>

  <div style="max-width:1100px;margin:0 auto 56px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.125rem;color:rgba(255,255,255,.5);margin:0;max-width:500px;margin-inline:auto">${subtitle}</p>
  </div>

  <div class="${id}-grid" id="${id}-grid">
    ${metrics.map(m => {
      const offset = circumference - (m.value / 100) * circumference
      return `<div class="${id}-card">
      <div class="${id}-ring">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle class="${id}-bg-circle" cx="80" cy="80" r="${radius}" />
          <circle class="${id}-fg-circle" cx="80" cy="80" r="${radius}" stroke="${m.color}" style="--ring-color:${m.color};stroke-dasharray:${circumference};stroke-dashoffset:${circumference}" data-offset="${offset}" />
        </svg>
        <div class="${id}-center">
          <span class="${id}-num" data-target="${m.value}" data-suffix="${m.suffix}">0${m.suffix}</span>
        </div>
      </div>
      <p class="${id}-label">${m.label}</p>
    </div>`
    }).join('\n    ')}
  </div>

  <script>
    (function(){
      var grid=document.getElementById('${id}-grid');
      if(!grid)return;
      var animated=false;
      function animate(){
        if(animated)return;
        animated=true;
        grid.querySelectorAll('.${id}-fg-circle').forEach(function(circle,i){
          setTimeout(function(){
            circle.style.strokeDashoffset=circle.dataset.offset;
          },i*150);
        });
        grid.querySelectorAll('.${id}-num').forEach(function(span,i){
          var target=parseInt(span.dataset.target,10);
          var suffix=span.dataset.suffix||'';
          var duration=1500;
          var start=performance.now();
          setTimeout(function(){
            function step(now){
              var elapsed=now-start;
              var progress=Math.min(elapsed/duration,1);
              var eased=1-Math.pow(1-progress,3);
              span.textContent=Math.floor(eased*target)+suffix;
              if(progress<1)requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
          },i*150);
        });
      }
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){if(e.isIntersecting)animate()});
      },{threshold:0.3});
      obs.observe(grid);
    })();
  </script>
</section>`
}

/* ==========================================================================
   CONTACT — 4 variants
   ========================================================================== */

/**
 * 1. Contact form + embedded map placeholder area
 */
export const generateContactFormMap = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `contact-map-${uid()}`
  const isHe = params.locale === 'he'
  const title = isHe ? 'צרו קשר' : 'Get In Touch'
  const subtitle = isHe ? 'נשמח לשמוע מכם' : "We'd love to hear from you"
  const namePlaceholder = isHe ? 'שם מלא' : 'Full Name'
  const emailPlaceholder = isHe ? 'כתובת אימייל' : 'Email Address'
  const phonePlaceholder = isHe ? 'טלפון' : 'Phone'
  const msgPlaceholder = isHe ? 'ההודעה שלכם' : 'Your Message'
  const sendText = isHe ? 'שליחה' : 'Send Message'
  const addressLabel = isHe ? 'כתובת' : 'Address'
  const phoneLabel = isHe ? 'טלפון' : 'Phone'
  const emailLabel = isHe ? 'אימייל' : 'Email'

  return `<section dir="${dir}" lang="${lang}" style="background:#0B0F1A;padding:80px 24px">
  <style>
    ${reducedMotionCSS}
    .${id}-wrap{display:grid;grid-template-columns:1fr 1fr;gap:40px;max-width:1100px;margin:0 auto;align-items:start}
    .${id}-form-side{background:#141922;border:1px solid rgba(255,255,255,.06);border-radius:20px;padding:40px}
    .${id}-input{width:100%;padding:14px 18px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#fff;font-family:'${bf}',sans-serif;font-size:0.95rem;outline:none;transition:border-color .3s,box-shadow .3s;box-sizing:border-box}
    .${id}-input:focus{border-color:${primary};box-shadow:0 0 0 3px ${primary}22}
    .${id}-input::placeholder{color:rgba(255,255,255,.3)}
    .${id}-textarea{min-height:120px;resize:vertical}
    .${id}-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .${id}-group{margin-bottom:16px}
    .${id}-btn{width:100%;padding:16px;border-radius:10px;border:none;background:linear-gradient(135deg,${primary},${secondary});color:#fff;font-family:'${bf}',sans-serif;font-size:1rem;font-weight:600;cursor:pointer;transition:opacity .3s,transform .2s}
    .${id}-btn:hover{opacity:.9;transform:translateY(-1px)}
    .${id}-btn:active{transform:translateY(0)}
    .${id}-map-side{border-radius:20px;overflow:hidden;display:flex;flex-direction:column;gap:20px}
    .${id}-map{width:100%;height:300px;border-radius:16px;background:linear-gradient(135deg,#1a1f2e,#0f1319);display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.06)}
    .${id}-map-placeholder{color:rgba(255,255,255,.2);font-family:'${bf}',sans-serif;font-size:0.875rem;text-align:center}
    .${id}-info{display:flex;flex-direction:column;gap:16px}
    .${id}-info-item{display:flex;align-items:flex-start;gap:14px;padding:16px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}
    .${id}-info-icon{width:40px;height:40px;border-radius:10px;background:${primary}18;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .${id}-info-icon svg{width:18px;height:18px;color:${primary}}
    .${id}-info-label{font-family:'${bf}',sans-serif;font-size:0.75rem;color:rgba(255,255,255,.4);margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;font-weight:500}
    .${id}-info-value{font-family:'${bf}',sans-serif;font-size:0.95rem;color:#fff;margin:0;font-weight:500}
    @media(max-width:768px){.${id}-wrap{grid-template-columns:1fr}.${id}-row{grid-template-columns:1fr}}
  </style>

  <div style="max-width:1100px;margin:0 auto 48px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.125rem;color:rgba(255,255,255,.5);margin:0">${subtitle}</p>
  </div>

  <div class="${id}-wrap">
    <div class="${id}-form-side">
      <form onsubmit="event.preventDefault()">
        <div class="${id}-row">
          <div class="${id}-group">
            <input class="${id}-input" type="text" placeholder="${namePlaceholder}" required />
          </div>
          <div class="${id}-group">
            <input class="${id}-input" type="email" placeholder="${emailPlaceholder}" required />
          </div>
        </div>
        <div class="${id}-group">
          <input class="${id}-input" type="tel" placeholder="${phonePlaceholder}" />
        </div>
        <div class="${id}-group">
          <textarea class="${id}-input ${id}-textarea" placeholder="${msgPlaceholder}" required></textarea>
        </div>
        <button type="submit" class="${id}-btn">${sendText}</button>
      </form>
    </div>

    <div class="${id}-map-side">
      <div class="${id}-map">
        <div class="${id}-map-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:rgba(255,255,255,.15);margin-bottom:8px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <br/>${isHe ? 'מיקום המפה יוצג כאן' : 'Map location will appear here'}
        </div>
      </div>

      <div class="${id}-info">
        <div class="${id}-info-item">
          <div class="${id}-info-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
          <div>
            <p class="${id}-info-label">${addressLabel}</p>
            <p class="${id}-info-value">${isHe ? 'רחוב הרצל 1, תל אביב' : '123 Business Ave, Suite 100'}</p>
          </div>
        </div>
        <div class="${id}-info-item">
          <div class="${id}-info-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
          <div>
            <p class="${id}-info-label">${phoneLabel}</p>
            <p class="${id}-info-value">${isHe ? '03-123-4567' : '+1 (555) 123-4567'}</p>
          </div>
        </div>
        <div class="${id}-info-item">
          <div class="${id}-info-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
          <div>
            <p class="${id}-info-label">${emailLabel}</p>
            <p class="${id}-info-value">hello@${params.businessName.toLowerCase().replace(/\s+/g, '')}.com</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`
}

/**
 * 2. Split layout — image/illustration on one side, form on the other
 */
export const generateContactSplit = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `contact-split-${uid()}`
  const isHe = params.locale === 'he'
  const title = isHe ? 'בואו נדבר' : "Let's Talk"
  const subtitle = isHe ? 'מוכנים להתחיל? ספרו לנו על הפרויקט שלכם' : 'Ready to get started? Tell us about your project'
  const namePlaceholder = isHe ? 'שם מלא' : 'Full Name'
  const emailPlaceholder = isHe ? 'אימייל' : 'Email'
  const subjectPlaceholder = isHe ? 'נושא' : 'Subject'
  const msgPlaceholder = isHe ? 'איך נוכל לעזור?' : 'How can we help?'
  const sendText = isHe ? 'שלחו הודעה' : 'Send Message'

  return `<section dir="${dir}" lang="${lang}" style="background:#0B0F1A;padding:80px 24px;overflow:hidden">
  <style>
    ${reducedMotionCSS}
    .${id}-wrap{display:grid;grid-template-columns:1fr 1fr;gap:0;max-width:1200px;margin:0 auto;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,.06)}
    .${id}-visual{background:linear-gradient(135deg,${primary}22,${secondary}22);padding:60px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
    .${id}-visual::before{content:'';position:absolute;width:300px;height:300px;border-radius:50%;background:${primary}15;top:-50px;inset-inline-end:-50px}
    .${id}-visual::after{content:'';position:absolute;width:200px;height:200px;border-radius:50%;background:${secondary}10;bottom:-30px;inset-inline-start:-30px}
    .${id}-visual-title{font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,3.5vw,2.75rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em;position:relative;z-index:1}
    .${id}-visual-sub{font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.6);margin:0 0 40px;line-height:1.7;position:relative;z-index:1}
    .${id}-highlights{display:flex;flex-direction:column;gap:16px;position:relative;z-index:1}
    .${id}-highlight{display:flex;align-items:center;gap:12px}
    .${id}-highlight-dot{width:8px;height:8px;border-radius:50%;background:${primary};flex-shrink:0}
    .${id}-highlight-text{font-family:'${bf}',sans-serif;font-size:0.95rem;color:rgba(255,255,255,.7)}
    .${id}-form{background:#141922;padding:60px}
    .${id}-input{width:100%;padding:14px 18px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#fff;font-family:'${bf}',sans-serif;font-size:0.95rem;outline:none;transition:border-color .3s,box-shadow .3s;box-sizing:border-box}
    .${id}-input:focus{border-color:${primary};box-shadow:0 0 0 3px ${primary}22}
    .${id}-input::placeholder{color:rgba(255,255,255,.25)}
    .${id}-textarea{min-height:140px;resize:vertical}
    .${id}-group{margin-bottom:20px}
    .${id}-label{display:block;font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.5);margin-bottom:6px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em}
    .${id}-btn{width:100%;padding:16px;border-radius:10px;border:none;background:${primary};color:#fff;font-family:'${bf}',sans-serif;font-size:1rem;font-weight:600;cursor:pointer;transition:all .3s;position:relative;overflow:hidden}
    .${id}-btn:hover{background:${primary}dd;transform:translateY(-1px);box-shadow:0 8px 24px ${primary}33}
    @media(max-width:768px){.${id}-wrap{grid-template-columns:1fr}.${id}-visual{padding:40px}.${id}-form{padding:40px}}
  </style>

  <div class="${id}-wrap">
    <div class="${id}-visual">
      <h2 class="${id}-visual-title">${title}</h2>
      <p class="${id}-visual-sub">${subtitle}</p>
      <div class="${id}-highlights">
        <div class="${id}-highlight">
          <span class="${id}-highlight-dot"></span>
          <span class="${id}-highlight-text">${isHe ? 'תגובה תוך 24 שעות' : 'Response within 24 hours'}</span>
        </div>
        <div class="${id}-highlight">
          <span class="${id}-highlight-dot"></span>
          <span class="${id}-highlight-text">${isHe ? 'ייעוץ ראשוני ללא עלות' : 'Free initial consultation'}</span>
        </div>
        <div class="${id}-highlight">
          <span class="${id}-highlight-dot"></span>
          <span class="${id}-highlight-text">${isHe ? 'צוות מומחים זמין עבורכם' : 'Expert team at your service'}</span>
        </div>
      </div>
    </div>

    <div class="${id}-form">
      <form onsubmit="event.preventDefault()">
        <div class="${id}-group">
          <label class="${id}-label">${namePlaceholder}</label>
          <input class="${id}-input" type="text" placeholder="${namePlaceholder}" required />
        </div>
        <div class="${id}-group">
          <label class="${id}-label">${emailPlaceholder}</label>
          <input class="${id}-input" type="email" placeholder="${emailPlaceholder}" required />
        </div>
        <div class="${id}-group">
          <label class="${id}-label">${subjectPlaceholder}</label>
          <input class="${id}-input" type="text" placeholder="${subjectPlaceholder}" />
        </div>
        <div class="${id}-group">
          <label class="${id}-label">${msgPlaceholder}</label>
          <textarea class="${id}-input ${id}-textarea" placeholder="${msgPlaceholder}" required></textarea>
        </div>
        <button type="submit" class="${id}-btn">${sendText}</button>
      </form>
    </div>
  </div>
</section>`
}

/**
 * 3. Chat-style contact form (like AI prompt input)
 */
export const generateContactChatWidget = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `contact-chat-${uid()}`
  const isHe = params.locale === 'he'
  const title = isHe ? 'שוחחו איתנו' : 'Chat With Us'
  const subtitle = isHe ? 'שלחו לנו הודעה ונחזור אליכם בהקדם' : 'Send us a message and we\'ll get back to you shortly'
  const placeholder = isHe ? 'כתבו את ההודעה שלכם...' : 'Type your message...'
  const sendText = isHe ? 'שלח' : 'Send'

  const messages = isHe
    ? [
        { from: 'bot', text: `שלום! 👋 ברוכים הבאים ל-${params.businessName}. איך אפשר לעזור?` },
        { from: 'user', text: 'שלום, אני מתעניין/ת בשירותים שלכם' },
        { from: 'bot', text: 'נשמח לעזור! ספרו לנו קצת על הפרויקט שלכם ונחזור אליכם עם הצעה מותאמת.' },
      ]
    : [
        { from: 'bot', text: `Hi there! 👋 Welcome to ${params.businessName}. How can we help you today?` },
        { from: 'user', text: "Hi, I'm interested in your services" },
        { from: 'bot', text: "We'd love to help! Tell us a bit about your project and we'll get back to you with a tailored proposal." },
      ]

  return `<section dir="${dir}" lang="${lang}" style="background:#0B0F1A;padding:80px 24px">
  <style>
    ${reducedMotionCSS}
    .${id}-wrap{max-width:640px;margin:0 auto}
    .${id}-chat{background:#141922;border:1px solid rgba(255,255,255,.06);border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3)}
    .${id}-header{padding:20px 24px;background:linear-gradient(135deg,${primary},${secondary});display:flex;align-items:center;gap:12px}
    .${id}-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center}
    .${id}-avatar svg{width:20px;height:20px;color:#fff}
    .${id}-header-info h3{font-family:'${hf}',sans-serif;font-weight:700;font-size:0.95rem;color:#fff;margin:0}
    .${id}-header-info p{font-family:'${bf}',sans-serif;font-size:0.75rem;color:rgba(255,255,255,.7);margin:2px 0 0}
    .${id}-status{width:8px;height:8px;border-radius:50%;background:#10B981;display:inline-block;margin-inline-start:6px}
    .${id}-messages{padding:24px;display:flex;flex-direction:column;gap:16px;min-height:280px}
    .${id}-msg{display:flex;gap:10px;max-width:85%}
    .${id}-msg-bot{align-self:flex-start}
    .${id}-msg-user{align-self:flex-end;flex-direction:row-reverse}
    .${id}-msg-avatar{width:32px;height:32px;border-radius:50%;background:${primary}22;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .${id}-msg-user .${id}-msg-avatar{background:rgba(255,255,255,.08)}
    .${id}-msg-avatar svg{width:14px;height:14px;color:${primary}}
    .${id}-msg-user .${id}-msg-avatar svg{color:rgba(255,255,255,.5)}
    .${id}-bubble{padding:12px 16px;border-radius:16px;font-family:'${bf}',sans-serif;font-size:0.9rem;line-height:1.5}
    .${id}-msg-bot .${id}-bubble{background:rgba(255,255,255,.06);color:rgba(255,255,255,.8);border-end-start-radius:4px}
    .${id}-msg-user .${id}-bubble{background:${primary};color:#fff;border-end-end-radius:4px}
    .${id}-input-wrap{display:flex;align-items:center;gap:8px;padding:16px 20px;border-top:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02)}
    .${id}-input{flex:1;padding:12px 16px;border-radius:100px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#fff;font-family:'${bf}',sans-serif;font-size:0.9rem;outline:none;transition:border-color .3s}
    .${id}-input:focus{border-color:${primary}}
    .${id}-input::placeholder{color:rgba(255,255,255,.25)}
    .${id}-send{width:44px;height:44px;border-radius:50%;background:${primary};border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s;flex-shrink:0}
    .${id}-send:hover{background:${primary}dd;transform:scale(1.05)}
    .${id}-send svg{width:18px;height:18px}
    .${id}-typing{display:flex;gap:4px;padding:8px 12px;align-items:center}
    .${id}-typing-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);animation:${id}-typing-anim 1.4s infinite}
    .${id}-typing-dot:nth-child(2){animation-delay:.2s}
    .${id}-typing-dot:nth-child(3){animation-delay:.4s}
    @keyframes ${id}-typing-anim{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}
  </style>

  <div style="max-width:640px;margin:0 auto 40px;text-align:center">
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 12px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.5);margin:0">${subtitle}</p>
  </div>

  <div class="${id}-wrap">
    <div class="${id}-chat">
      <div class="${id}-header">
        <div class="${id}-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="${id}-header-info">
          <h3>${params.businessName}<span class="${id}-status"></span></h3>
          <p>${isHe ? 'בדרך כלל משיבים תוך דקות' : 'Usually replies within minutes'}</p>
        </div>
      </div>

      <div class="${id}-messages">
        ${messages.map(m => `<div class="${id}-msg ${id}-msg-${m.from}">
          <div class="${id}-msg-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${m.from === 'bot' ? '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' : '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'}</svg>
          </div>
          <div class="${id}-bubble">${m.text}</div>
        </div>`).join('\n        ')}

        <div class="${id}-msg ${id}-msg-bot">
          <div class="${id}-msg-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="${id}-typing">
            <span class="${id}-typing-dot"></span>
            <span class="${id}-typing-dot"></span>
            <span class="${id}-typing-dot"></span>
          </div>
        </div>
      </div>

      <div class="${id}-input-wrap">
        <input class="${id}-input" type="text" placeholder="${placeholder}" />
        <button class="${id}-send" aria-label="${sendText}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  </div>
</section>`
}

/**
 * 4. Simple centered minimal contact form
 */
export const generateContactMinimal = (params: SectionParams): string => {
  const { primary, secondary, dir, lang, hf, bf } = defaults(params)
  const id = `contact-min-${uid()}`
  const isHe = params.locale === 'he'
  const title = isHe ? 'דברו איתנו' : 'Contact Us'
  const subtitle = isHe ? 'מלאו את הטופס ונחזור אליכם בהקדם' : 'Fill out the form and we\'ll be in touch soon'
  const namePlaceholder = isHe ? 'שם' : 'Name'
  const emailPlaceholder = isHe ? 'אימייל' : 'Email'
  const msgPlaceholder = isHe ? 'הודעה' : 'Message'
  const sendText = isHe ? 'שלח' : 'Send'

  return `<section dir="${dir}" lang="${lang}" style="background:#111827;padding:100px 24px">
  <style>
    ${reducedMotionCSS}
    .${id}-wrap{max-width:520px;margin:0 auto;text-align:center}
    .${id}-badge{display:inline-block;padding:6px 16px;border-radius:100px;background:${primary}15;color:${primary};font-family:'${bf}',sans-serif;font-size:0.8rem;font-weight:600;margin-bottom:20px;letter-spacing:0.03em}
    .${id}-form{display:flex;flex-direction:column;gap:16px;margin-top:40px;text-align:start}
    .${id}-input{width:100%;padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#fff;font-family:'${bf}',sans-serif;font-size:0.95rem;outline:none;transition:border-color .3s,box-shadow .3s;box-sizing:border-box}
    .${id}-input:focus{border-color:${primary};box-shadow:0 0 0 3px ${primary}15}
    .${id}-input::placeholder{color:rgba(255,255,255,.25)}
    .${id}-textarea{min-height:140px;resize:vertical}
    .${id}-btn{padding:16px;border-radius:12px;border:none;background:${primary};color:#fff;font-family:'${bf}',sans-serif;font-size:1rem;font-weight:600;cursor:pointer;transition:all .3s;letter-spacing:0.01em}
    .${id}-btn:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 8px 24px ${primary}33}
    .${id}-btn:active{transform:translateY(0)}
    .${id}-note{font-family:'${bf}',sans-serif;font-size:0.8rem;color:rgba(255,255,255,.3);margin:8px 0 0;text-align:center}
  </style>

  <div class="${id}-wrap">
    <span class="${id}-badge">${isHe ? '✉ צור קשר' : '✉ Get in touch'}</span>
    <h2 style="font-family:'${hf}',sans-serif;font-weight:800;font-size:clamp(2rem,4vw,3rem);color:#fff;margin:0 0 16px;letter-spacing:-0.02em">${title}</h2>
    <p style="font-family:'${bf}',sans-serif;font-size:1.05rem;color:rgba(255,255,255,.5);margin:0;line-height:1.7">${subtitle}</p>

    <form class="${id}-form" onsubmit="event.preventDefault()">
      <input class="${id}-input" type="text" placeholder="${namePlaceholder}" required />
      <input class="${id}-input" type="email" placeholder="${emailPlaceholder}" required />
      <textarea class="${id}-input ${id}-textarea" placeholder="${msgPlaceholder}" required></textarea>
      <button type="submit" class="${id}-btn">${sendText}</button>
      <p class="${id}-note">${isHe ? 'לא נשתף את הפרטים שלכם עם צד שלישי' : 'We never share your information with third parties'}</p>
    </form>
  </div>
</section>`
}
