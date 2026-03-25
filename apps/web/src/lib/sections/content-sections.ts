/**
 * Premium content section generators — Features, Testimonials, Pricing.
 * Generates raw HTML strings for iframe rendering.
 * Quality target: $50K custom agency site.
 */

import type { ColorPalette, FontCombo } from '../design-presets'

const fontStyle = (fonts: FontCombo, role: 'heading' | 'body') => {
  const family = role === 'heading' ? fonts.heading : fonts.body
  const weight = role === 'heading' ? fonts.headingWeight : fonts.bodyWeight
  return `font-family:'${family}',sans-serif;font-weight:${weight}`
}
const s = (css: string) => `style="${css}"`

type FeatureItem = {
  icon: string
  title: string
  description: string
  image?: string
}

type TestimonialItem = {
  quote: string
  author: string
  role: string
  avatar?: string
  rating?: number
  image?: string
  company?: string
}

type PricingPlan = {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  popular?: boolean
  annualPrice?: string
}

/* ==========================================================================
   FEATURES — 12 variants
   ========================================================================== */

/** 1. Bento grid with mixed spans, tilt + glow effect */
export const generateFeaturesBentoGrid = (params: {
  title: string
  subtitle: string
  items: FeatureItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map((item, i) => {
    const span = i === 0 ? 'grid-column:span 2;grid-row:span 2;' : ''
    return `<div class="sc-card" onmousemove="(function(c,e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');var cx=r.width/2,cy=r.height/2;c.style.transform='perspective(800px) rotateX('+((e.clientY-r.top-cy)/cy*-4)+'deg) rotateY('+((e.clientX-r.left-cx)/cx*4)+'deg)'})(this,event)" onmouseleave="this.style.transform='perspective(800px) rotateX(0) rotateY(0)'" ${s(`${span}background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:16px;padding:32px;display:flex;flex-direction:column;gap:16px;transition:transform .3s,box-shadow .3s`)}>
      <div ${s(`width:48px;height:48px;border-radius:12px;background:${palette.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px`)}>${item.icon}</div>
      <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:${i === 0 ? '1.5rem' : '1.125rem'};color:${palette.text};margin:0`)}>${item.title}</h3>
      <p ${s(`${fontStyle(fonts, 'body')};font-size:0.95rem;color:${palette.textMuted};margin:0;line-height:1.6`)}>${item.description}</p>
      ${item.image ? `<img src="${item.image}?w=800&q=80" alt="${item.title}" ${s(`width:100%;border-radius:12px;margin-top:auto;object-fit:cover;max-height:200px`)} loading="lazy" />` : ''}
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .bento-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1200px;margin:0 auto}
    @media(max-width:768px){.bento-grid{grid-template-columns:1fr}.bento-grid>*{grid-column:span 1!important;grid-row:span 1!important}}
    .sc-card{position:relative;overflow:hidden;transition:transform .2s ease-out,box-shadow .3s ease}
    .sc-card::before{content:'';position:absolute;inset:0;border-radius:inherit;background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%),${palette.primary}18,transparent 40%);opacity:0;transition:opacity .3s;pointer-events:none;z-index:1}
    .sc-card:hover::before{opacity:1}
    .sc-card:hover{box-shadow:0 0 5px ${palette.primary}30,0 0 15px ${palette.primary}20,0 0 30px ${palette.primary}15,0 0 60px ${palette.primary}10,inset 0 0 20px ${palette.primary}08}
    @media(prefers-reduced-motion:reduce){.sc-card{transition:none!important}.sc-card::before{display:none}}
  </style>
  <div ${s(`max-width:1200px;margin:0 auto 48px;text-align:center`)}>
    <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 16px`)}>${title}</h2>
    <p ${s(`${fontStyle(fonts, 'body')};font-size:1.125rem;color:${palette.textMuted};margin:0;max-width:600px;margin-inline:auto`)}>${subtitle}</p>
  </div>
  <div class="bento-grid">${cards}</div>
</section>`
}

/** 2. Tabbed features with fade animation */
export const generateFeaturesTabs = (params: {
  title: string
  subtitle: string
  items: FeatureItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const tabs = items.slice(0, 4)
  const tabBtns = tabs.map((t, i) => `<button class="ftab-btn${i === 0 ? ' ftab-active' : ''}" data-tab="${i}" ${s(`${fontStyle(fonts, 'body')};padding:12px 24px;border:none;background:${i === 0 ? palette.primary : 'transparent'};color:${i === 0 ? '#fff' : palette.textMuted};border-radius:8px;cursor:pointer;font-size:0.95rem;transition:all .3s;display:flex;align-items:center;gap:8px`)}><span>${t.icon}</span> ${t.title}</button>`).join('')

  const panels = tabs.map((t, i) => `<div class="ftab-panel blur-fade" data-panel="${i}" ${s(`display:${i === 0 ? 'grid' : 'none'};grid-template-columns:1fr 1fr;gap:40px;align-items:center`)}>
    <div>
      <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.75rem;color:${palette.text};margin:0 0 16px`)}>${t.title}</h3>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};line-height:1.7;margin:0`)}>${t.description}</p>
    </div>
    ${t.image ? `<img src="${t.image}?w=800&q=80" alt="${t.title}" ${s(`width:100%;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.12)`)} loading="lazy" />` : `<div ${s(`width:100%;aspect-ratio:4/3;background:${palette.backgroundAlt};border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:64px`)}>${t.icon}</div>`}
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .ftab-btn:hover{background:${palette.primary}22;color:${palette.text}}
    .ftab-active{background:${palette.primary}!important;color:#fff!important}
    .blur-fade{animation:blurIn .4s ease}
    @keyframes blurIn{from{opacity:0;filter:blur(8px)}to{opacity:1;filter:blur(0)}}
    @media(max-width:768px){.ftab-panel{grid-template-columns:1fr!important}.ftab-wrap{flex-wrap:wrap}}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:40px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="ftab-wrap" ${s(`display:flex;gap:8px;justify-content:center;margin-bottom:40px`)}>${tabBtns}</div>
    ${panels}
  </div>
  <script>document.querySelectorAll('.ftab-btn').forEach(b=>{b.onclick=()=>{document.querySelectorAll('.ftab-btn').forEach(x=>{x.classList.remove('ftab-active');x.style.background='transparent';x.style.color='${palette.textMuted}'});b.classList.add('ftab-active');b.style.background='${palette.primary}';b.style.color='#fff';document.querySelectorAll('.ftab-panel').forEach(p=>p.style.display='none');const p=document.querySelector('[data-panel=\"'+b.dataset.tab+'\"]');if(p){p.style.display='grid';p.classList.remove('blur-fade');void p.offsetWidth;p.classList.add('blur-fade')}}})</script>
</section>`
}

/** 3. Accordion features — left heading, right expandable details */
export const generateFeaturesAccordion = (params: {
  title: string
  subtitle: string
  items: FeatureItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const accordionItems = items.map((item, i) => `<details class="smooth-accordion" ${i === 0 ? 'open' : ''} ${s(`border-bottom:1px solid ${palette.border};padding:20px 0`)}>
    <summary ${s(`${fontStyle(fonts, 'heading')};font-size:1.125rem;color:${palette.text};cursor:pointer;display:flex;align-items:center;gap:12px;list-style:none`)}>
      <span ${s(`font-size:24px`)}>${item.icon}</span>
      <span ${s(`flex:1`)}>${item.title}</span>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" ${s(`transition:transform .3s;flex-shrink:0`)}><path d="M5 8l5 5 5-5" stroke="${palette.textMuted}" stroke-width="2" stroke-linecap="round"/></svg>
    </summary>
    <div ${s(`padding:16px 0 8px 36px;display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap`)}>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};line-height:1.7;margin:0;flex:1;min-width:200px`)}>${item.description}</p>
      ${item.image ? `<img src="${item.image}?w=800&q=80" alt="${item.title}" ${s(`width:280px;border-radius:12px;object-fit:cover`)} loading="lazy" />` : ''}
    </div>
  </details>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .smooth-accordion summary::-webkit-details-marker{display:none}
    .smooth-accordion[open] summary svg{transform:rotate(180deg)}
    .smooth-accordion[open]>div{animation:slideDown .3s ease}
    @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    @media(max-width:768px){.acc-grid{grid-template-columns:1fr!important}}
  </style>
  <div class="acc-grid" ${s(`max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:60px;align-items:flex-start`)}>
    <div>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,2.75rem);color:${palette.text};margin:0 0 16px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;line-height:1.7;margin:0`)}>${subtitle}</p>
    </div>
    <div>${accordionItems}</div>
  </div>
</section>`
}

/** 4. Zigzag alternating rows with motion reveal */
export const generateFeaturesZigzag = (params: {
  title: string
  subtitle: string
  items: FeatureItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const rows = items.map((item, i) => {
    const imgFirst = i % 2 === 0
    const img = item.image
      ? `<img src="${item.image}?w=800&q=80" alt="${item.title}" ${s(`width:100%;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.1);object-fit:cover;aspect-ratio:4/3`)} loading="lazy" />`
      : `<div ${s(`width:100%;aspect-ratio:4/3;background:${palette.backgroundAlt};border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:72px`)}>${item.icon}</div>`
    const text = `<div ${s(`display:flex;flex-direction:column;justify-content:center;gap:16px`)}>
      <div ${s(`width:48px;height:48px;border-radius:12px;background:${palette.primary}15;color:${palette.primary};display:flex;align-items:center;justify-content:center;font-size:24px`)}>${item.icon}</div>
      <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.5rem;color:${palette.text};margin:0`)}>${item.title}</h3>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};line-height:1.7;margin:0`)}>${item.description}</p>
    </div>`
    return `<div class="motion-reveal stagger-reveal" ${s(`display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center`)}>
      ${imgFirst ? img + text : text + img}
    </div>`
  }).join('')

  return `<section ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .stagger-reveal:nth-child(odd){animation-delay:.1s}
    .stagger-reveal:nth-child(even){animation-delay:.25s}
    @media(max-width:768px){.zigzag-rows>*{grid-template-columns:1fr!important}}
  </style>
  <div ${s(`text-align:center;max-width:700px;margin:0 auto 56px`)}>
    <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
    <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
  </div>
  <div class="zigzag-rows" ${s(`max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:64px`)}>${rows}</div>
</section>`
}

/** 5. Icon grid with animated colored circles */
export const generateFeaturesIconGrid = (params: {
  title: string
  subtitle: string
  items: FeatureItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map(item => `<div class="sc-card motion-reveal" onmousemove="(function(c,e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');var cx=r.width/2,cy=r.height/2;c.style.transform='perspective(800px) rotateX('+((e.clientY-r.top-cy)/cy*-4)+'deg) rotateY('+((e.clientX-r.left-cx)/cx*4)+'deg)'})(this,event)" onmouseleave="this.style.transform='perspective(800px) rotateX(0) rotateY(0)'" ${s(`text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px`)}>
    <div class="icon-pulse" ${s(`width:64px;height:64px;border-radius:50%;background:${palette.primary}12;color:${palette.primary};display:flex;align-items:center;justify-content:center;font-size:28px;transition:transform .3s`)}>
      ${item.icon}
    </div>
    <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.125rem;color:${palette.text};margin:0`)}>${item.title}</h3>
    <p ${s(`${fontStyle(fonts, 'body')};font-size:0.95rem;color:${palette.textMuted};margin:0;line-height:1.6;max-width:280px`)}>${item.description}</p>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.backgroundAlt};padding:80px 24px`)}>
  <style>
    .icon-pulse{animation:iconPulse 3s ease infinite}
    @keyframes iconPulse{0%,100%{box-shadow:0 0 0 0 ${palette.primary}22}50%{box-shadow:0 0 0 12px ${palette.primary}00}}
    .icon-pulse:hover{transform:scale(1.15)}
    .igrid{display:grid;grid-template-columns:repeat(4,1fr);gap:40px}
    @media(max-width:1024px){.igrid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:600px){.igrid{grid-template-columns:1fr}}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="igrid">${cards}</div>
  </div>
</section>`
}

/** 6. Horizontal snap-scroll carousel with arrows */
export const generateFeaturesCarousel = (params: {
  title: string
  subtitle: string
  items: FeatureItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map(item => `<div ${s(`flex:0 0 320px;scroll-snap-align:start;background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:16px;overflow:hidden;transition:transform .3s`)}>
    ${item.image ? `<img src="${item.image}?w=800&q=80" alt="${item.title}" ${s(`width:100%;height:200px;object-fit:cover`)} loading="lazy" />` : `<div ${s(`width:100%;height:200px;background:${palette.primary}10;display:flex;align-items:center;justify-content:center;font-size:56px`)}>${item.icon}</div>`}
    <div ${s(`padding:24px`)}>
      <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.125rem;color:${palette.text};margin:0 0 8px`)}>${item.title}</h3>
      <p ${s(`${fontStyle(fonts, 'body')};font-size:0.9rem;color:${palette.textMuted};margin:0;line-height:1.6`)}>${item.description}</p>
    </div>
  </div>`).join('')

  const arrowBtn = (dir: 'left' | 'right') => `<button class="fcar-${dir}" ${s(`position:absolute;${dir === 'left' ? 'inset-inline-start' : 'inset-inline-end'}:-20px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;border:1px solid ${palette.border};background:${palette.background};color:${palette.text};cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.08);z-index:2;font-size:20px`)}>${dir === 'left' ? '&#8249;' : '&#8250;'}</button>`

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <div ${s(`max-width:1200px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:40px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div ${s(`position:relative`)}>
      ${arrowBtn('left')}${arrowBtn('right')}
      <div class="fcar-track" ${s(`display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:8px 0`)}>${cards}</div>
    </div>
  </div>
  <style>.fcar-track::-webkit-scrollbar{display:none}</style>
  <script>document.querySelector('.fcar-right')?.addEventListener('click',()=>{document.querySelector('.fcar-track').scrollBy({left:340,behavior:'smooth'})});document.querySelector('.fcar-left')?.addEventListener('click',()=>{document.querySelector('.fcar-track').scrollBy({left:-340,behavior:'smooth'})})</script>
</section>`
}

/** 7. Side-by-side comparison: Without Us vs With Us */
export const generateFeaturesComparison = (params: {
  title: string
  subtitle: string
  items: { without: string; withUs: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const rows = items.map(item => `<div ${s(`display:grid;grid-template-columns:1fr 1fr;gap:2px`)}>
    <div ${s(`background:#FEE2E2;padding:16px 20px;display:flex;align-items:center;gap:12px`)}>
      <span ${s(`color:#DC2626;font-size:18px;flex-shrink:0`)}>&#10007;</span>
      <span ${s(`${fontStyle(fonts, 'body')};color:#991B1B;font-size:0.95rem`)}>${item.without}</span>
    </div>
    <div ${s(`background:#DCFCE7;padding:16px 20px;display:flex;align-items:center;gap:12px`)}>
      <span ${s(`color:#16A34A;font-size:18px;flex-shrink:0`)}>&#10003;</span>
      <span ${s(`${fontStyle(fonts, 'body')};color:#14532D;font-size:0.95rem`)}>${item.withUs}</span>
    </div>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>@media(max-width:600px){.comp-table>div{grid-template-columns:1fr!important}}</style>
  <div ${s(`max-width:900px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:40px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div ${s(`display:grid;grid-template-columns:1fr 1fr;gap:0;margin-bottom:2px`)}>
      <div ${s(`background:${palette.text};color:#fff;padding:16px 20px;border-radius:12px 0 0 0;${fontStyle(fonts, 'heading')};font-size:1rem;text-align:center`)}>Without Us</div>
      <div ${s(`background:${palette.primary};color:#fff;padding:16px 20px;border-radius:0 12px 0 0;${fontStyle(fonts, 'heading')};font-size:1rem;text-align:center`)}>With Us</div>
    </div>
    <div class="comp-table" ${s(`display:flex;flex-direction:column;gap:2px;border-radius:0 0 12px 12px;overflow:hidden`)}>${rows}</div>
  </div>
</section>`
}

/** 8. Vertical timeline with animated line + dots */
export const generateFeaturesTimeline = (params: {
  title: string
  subtitle: string
  items: FeatureItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const entries = items.map((item, i) => {
    const isLeft = i % 2 === 0
    return `<div class="motion-reveal tl-entry" ${s(`display:flex;gap:24px;align-items:flex-start;${isLeft ? '' : 'flex-direction:row-reverse;text-align:end'}`)}>
      <div ${s(`flex:1;background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:16px;padding:24px`)}>
        <div ${s(`font-size:24px;margin-bottom:8px`)}>${item.icon}</div>
        <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.125rem;color:${palette.text};margin:0 0 8px`)}>${item.title}</h3>
        <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem;margin:0;line-height:1.6`)}>${item.description}</p>
      </div>
      <div ${s(`display:flex;flex-direction:column;align-items:center;flex-shrink:0`)}>
        <div ${s(`width:16px;height:16px;border-radius:50%;background:${palette.primary};border:3px solid ${palette.background};box-shadow:0 0 0 2px ${palette.primary}`)}></div>
        ${i < items.length - 1 ? `<div ${s(`width:2px;height:60px;background:${palette.border}`)}></div>` : ''}
      </div>
      <div ${s(`flex:1`)}></div>
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>@media(max-width:768px){.tl-entry{flex-direction:row!important;text-align:start!important}.tl-entry>div:last-child{display:none}}</style>
  <div ${s(`max-width:900px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:56px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div ${s(`display:flex;flex-direction:column;gap:0`)}>${entries}</div>
  </div>
</section>`
}

/** 9. Video cards grid with play button hover */
export const generateFeaturesVideoCards = (params: {
  title: string
  subtitle: string
  items: (FeatureItem & { video?: string })[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map(item => `<div class="motion-reveal" ${s(`background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:16px;overflow:hidden`)}>
    <div class="vid-thumb" ${s(`position:relative;width:100%;aspect-ratio:16/9;background:${palette.text}11;overflow:hidden;cursor:pointer`)}>
      ${item.image ? `<img src="${item.image}?w=800&q=80" alt="${item.title}" ${s(`width:100%;height:100%;object-fit:cover`)} loading="lazy" />` : ''}
      <div class="vid-play" ${s(`position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.3);opacity:0;transition:opacity .3s`)}>
        <div ${s(`width:56px;height:56px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center`)}>
          <svg width="20" height="20" viewBox="0 0 20 20"><polygon points="6,3 18,10 6,17" fill="${palette.primary}"/></svg>
        </div>
      </div>
    </div>
    <div ${s(`padding:20px`)}>
      <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.05rem;color:${palette.text};margin:0 0 6px`)}>${item.title}</h3>
      <p ${s(`${fontStyle(fonts, 'body')};font-size:0.9rem;color:${palette.textMuted};margin:0;line-height:1.5`)}>${item.description}</p>
    </div>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .vid-thumb:hover .vid-play{opacity:1}
    .vid-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    @media(max-width:768px){.vid-grid{grid-template-columns:1fr}}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:40px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="vid-grid">${cards}</div>
  </div>
</section>`
}

/** 10. Interactive expandable feature cards */
export const generateFeaturesInteractive = (params: {
  title: string
  subtitle: string
  items: FeatureItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map((item, i) => `<div class="fi-card" data-fi="${i}" ${s(`background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:16px;padding:28px;cursor:pointer;transition:all .4s cubic-bezier(.4,0,.2,1)`)}>
    <div ${s(`display:flex;align-items:center;gap:14px;margin-bottom:12px`)}>
      <span ${s(`font-size:28px`)}>${item.icon}</span>
      <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.125rem;color:${palette.text};margin:0`)}>${item.title}</h3>
    </div>
    <p ${s(`${fontStyle(fonts, 'body')};font-size:0.9rem;color:${palette.textMuted};margin:0;line-height:1.6`)}>${item.description}</p>
    <div class="fi-extra" ${s(`max-height:0;overflow:hidden;transition:max-height .4s ease,opacity .3s;opacity:0;margin-top:0`)}>
      ${item.image ? `<img src="${item.image}?w=800&q=80" alt="${item.title}" ${s(`width:100%;border-radius:12px;margin-top:16px;object-fit:cover`)} loading="lazy" />` : ''}
    </div>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .fi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
    .fi-card.fi-expanded{transform:scale(1.03);box-shadow:0 20px 60px rgba(0,0,0,.1);border-color:${palette.primary};z-index:2}
    .fi-card.fi-dimmed{opacity:.55}
    .fi-card.fi-expanded .fi-extra{max-height:300px!important;opacity:1!important;margin-top:16px!important}
    @media(max-width:768px){.fi-grid{grid-template-columns:1fr}}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:40px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="fi-grid">${cards}</div>
  </div>
  <script>document.querySelectorAll('.fi-card').forEach(c=>{c.onclick=()=>{const isExp=c.classList.contains('fi-expanded');document.querySelectorAll('.fi-card').forEach(x=>{x.classList.remove('fi-expanded','fi-dimmed')});if(!isExp){c.classList.add('fi-expanded');document.querySelectorAll('.fi-card').forEach(x=>{if(x!==c)x.classList.add('fi-dimmed')})}}});</script>
</section>`
}

/** 11. Features with large animated stat numbers */
export const generateFeaturesStatsIntegrated = (params: {
  title: string
  subtitle: string
  items: (FeatureItem & { stat: string; statLabel: string })[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map(item => `<div class="motion-reveal" ${s(`background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:16px;padding:32px;text-align:center`)}>
    <div class="counter-value" ${s(`${fontStyle(fonts, 'heading')};font-size:3rem;color:${palette.primary};margin:0 0 4px;line-height:1`)}>${item.stat}</div>
    <div ${s(`${fontStyle(fonts, 'body')};font-size:0.85rem;color:${palette.textMuted};margin-bottom:16px;text-transform:uppercase;letter-spacing:1px`)}>${item.statLabel}</div>
    <div ${s(`width:48px;height:2px;background:${palette.primary};margin:0 auto 16px;border-radius:1px`)}></div>
    <div ${s(`font-size:28px;margin-bottom:12px`)}>${item.icon}</div>
    <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.05rem;color:${palette.text};margin:0 0 8px`)}>${item.title}</h3>
    <p ${s(`${fontStyle(fonts, 'body')};font-size:0.9rem;color:${palette.textMuted};margin:0;line-height:1.6`)}>${item.description}</p>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
    @media(max-width:1024px){.stats-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:600px){.stats-grid{grid-template-columns:1fr}}
  </style>
  <div ${s(`max-width:1200px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="stats-grid">${cards}</div>
  </div>
</section>`
}

/** 12. Hoverable cards with tilt + glow + gradient border */
export const generateFeaturesHoverableCards = (params: {
  title: string
  subtitle: string
  items: FeatureItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map(item => `<div class="tilt-card glow-card hov-card" ${s(`position:relative;background:${palette.backgroundAlt};border-radius:16px;padding:32px;display:flex;flex-direction:column;gap:14px;transition:all .35s cubic-bezier(.4,0,.2,1)`)}>
    <div ${s(`width:52px;height:52px;border-radius:14px;background:${palette.primary}12;color:${palette.primary};display:flex;align-items:center;justify-content:center;font-size:26px;transition:background .3s`)}>${item.icon}</div>
    <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.125rem;color:${palette.text};margin:0`)}>${item.title}</h3>
    <p ${s(`${fontStyle(fonts, 'body')};font-size:0.9rem;color:${palette.textMuted};margin:0;line-height:1.6`)}>${item.description}</p>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .hov-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    @media(max-width:768px){.hov-grid{grid-template-columns:1fr}}
    .hov-card{border:2px solid transparent;background-clip:padding-box}
    .hov-card:hover{transform:translateY(-6px);box-shadow:0 24px 64px rgba(0,0,0,.1);border-image:linear-gradient(135deg,${palette.primary},${palette.accent}) 1}
    .hov-card:hover div:first-child{background:${palette.primary};color:#fff}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="hov-grid">${cards}</div>
  </div>
</section>`
}

/* ==========================================================================
   TESTIMONIALS — 10 variants
   ========================================================================== */

/** 1. Horizontal carousel with auto-play and dots */
export const generateTestimonialsCarousel = (params: {
  title: string
  subtitle: string
  items: TestimonialItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const stars = (n: number) => Array.from({ length: 5 }, (_, i) => `<span ${s(`color:${i < n ? '#FBBF24' : palette.border};font-size:18px`)}>&#9733;</span>`).join('')
  const slides = items.map((item, i) => `<div class="tcar-slide" data-slide="${i}" ${s(`display:${i === 0 ? 'flex' : 'none'};flex-direction:column;align-items:center;gap:20px;text-align:center;animation:blurIn .5s ease`)}>
    <div ${s(`font-size:48px;color:${palette.primary};opacity:.3;line-height:1`)}>&ldquo;</div>
    <p ${s(`${fontStyle(fonts, 'body')};font-size:1.25rem;color:${palette.text};margin:0;max-width:700px;line-height:1.8`)}>${item.quote}</p>
    ${item.rating ? `<div>${stars(item.rating)}</div>` : ''}
    <div ${s(`display:flex;align-items:center;gap:14px;margin-top:8px`)}>
      ${item.avatar ? `<img src="${item.avatar}?w=96&q=80" alt="${item.author}" ${s(`width:48px;height:48px;border-radius:50%;object-fit:cover`)} loading="lazy" />` : `<div ${s(`width:48px;height:48px;border-radius:50%;background:${palette.primary};color:#fff;display:flex;align-items:center;justify-content:center;${fontStyle(fonts, 'heading')};font-size:1.1rem`)}>${item.author.charAt(0)}</div>`}
      <div>
        <div ${s(`${fontStyle(fonts, 'heading')};color:${palette.text};font-size:0.95rem`)}>${item.author}</div>
        <div ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.85rem`)}>${item.role}</div>
      </div>
    </div>
  </div>`).join('')

  const dots = items.map((_, i) => `<button class="tcar-dot" data-dot="${i}" ${s(`width:${i === 0 ? '24px' : '8px'};height:8px;border-radius:4px;border:none;background:${i === 0 ? palette.primary : palette.border};cursor:pointer;transition:all .3s`)}></button>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.backgroundAlt};padding:80px 24px`)}>
  <style>@keyframes blurIn{from{opacity:0;filter:blur(8px)}to{opacity:1;filter:blur(0)}}</style>
  <div ${s(`max-width:800px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    ${slides}
    <div ${s(`display:flex;gap:6px;justify-content:center;margin-top:32px`)}>${dots}</div>
  </div>
  <script>
  (function(){let cur=0;const total=${items.length};function show(n){document.querySelectorAll('.tcar-slide').forEach(s=>s.style.display='none');const sl=document.querySelector('[data-slide="'+n+'"]');if(sl){sl.style.display='flex';sl.classList.remove('blur-fade');void sl.offsetWidth;sl.style.animation='blurIn .5s ease'}document.querySelectorAll('.tcar-dot').forEach((d,i)=>{d.style.width=i===n?'24px':'8px';d.style.background=i===n?'${palette.primary}':'${palette.border}'})}document.querySelectorAll('.tcar-dot').forEach(d=>{d.onclick=()=>{cur=+d.dataset.dot;show(cur)}});setInterval(()=>{cur=(cur+1)%total;show(cur)},5000)})();
  </script>
</section>`
}

/** 2. Masonry grid with CSS columns */
export const generateTestimonialsMasonry = (params: {
  title: string
  subtitle: string
  items: TestimonialItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map(item => `<div class="stagger-reveal" ${s(`break-inside:avoid;background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:16px;padding:24px;margin-bottom:20px`)}>
    <div ${s(`font-size:32px;color:${palette.primary};opacity:.25;margin-bottom:8px`)}>&ldquo;</div>
    <p ${s(`${fontStyle(fonts, 'body')};color:${palette.text};font-size:0.95rem;line-height:1.7;margin:0 0 16px`)}>${item.quote}</p>
    <div ${s(`display:flex;align-items:center;gap:12px;border-top:1px solid ${palette.border};padding-top:16px`)}>
      ${item.avatar ? `<img src="${item.avatar}?w=96&q=80" alt="${item.author}" ${s(`width:40px;height:40px;border-radius:50%;object-fit:cover`)} loading="lazy" />` : `<div ${s(`width:40px;height:40px;border-radius:50%;background:${palette.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.9rem;${fontStyle(fonts, 'heading')}`)}>${item.author.charAt(0)}</div>`}
      <div>
        <div ${s(`${fontStyle(fonts, 'heading')};color:${palette.text};font-size:0.9rem`)}>${item.author}</div>
        <div ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.8rem`)}>${item.role}</div>
      </div>
    </div>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .masonry-col{column-count:3;column-gap:20px}
    @media(max-width:1024px){.masonry-col{column-count:2}}
    @media(max-width:600px){.masonry-col{column-count:1}}
  </style>
  <div ${s(`max-width:1200px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="masonry-col">${cards}</div>
  </div>
</section>`
}

/** 3. One large featured + 3 smaller cards */
export const generateTestimonialsFeatured = (params: {
  title: string
  subtitle: string
  items: TestimonialItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const featured = items[0]
  const rest = items.slice(1, 4)
  const stars = (n: number) => Array.from({ length: 5 }, (_, i) => `<span ${s(`color:${i < n ? '#FBBF24' : palette.border};font-size:18px`)}>&#9733;</span>`).join('')

  const smallCards = rest.map(item => `<div class="motion-reveal" ${s(`background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:16px;padding:24px`)}>
    ${item.rating ? `<div ${s(`margin-bottom:12px`)}>${stars(item.rating)}</div>` : ''}
    <p ${s(`${fontStyle(fonts, 'body')};color:${palette.text};font-size:0.9rem;line-height:1.6;margin:0 0 16px`)}>&ldquo;${item.quote}&rdquo;</p>
    <div ${s(`display:flex;align-items:center;gap:10px`)}>
      ${item.avatar ? `<img src="${item.avatar}?w=96&q=80" alt="${item.author}" ${s(`width:36px;height:36px;border-radius:50%;object-fit:cover`)} loading="lazy" />` : `<div ${s(`width:36px;height:36px;border-radius:50%;background:${palette.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;${fontStyle(fonts, 'heading')}`)}>${item.author.charAt(0)}</div>`}
      <div>
        <div ${s(`${fontStyle(fonts, 'heading')};color:${palette.text};font-size:0.85rem`)}>${item.author}</div>
        <div ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.75rem`)}>${item.role}</div>
      </div>
    </div>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .tf-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    @media(max-width:768px){.tf-grid{grid-template-columns:1fr}}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="motion-reveal" ${s(`background:${palette.primary};border-radius:20px;padding:40px;color:#fff;margin-bottom:32px;display:flex;gap:32px;align-items:center;flex-wrap:wrap`)}>
      ${featured?.avatar ? `<img src="${featured.avatar}?w=200&q=80" alt="${featured?.author}" ${s(`width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.3)`)} loading="lazy" />` : `<div ${s(`width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;${fontStyle(fonts, 'heading')};font-size:2rem`)}>${featured?.author?.charAt(0) ?? 'A'}</div>`}
      <div ${s(`flex:1;min-width:250px`)}>
        ${featured?.rating ? `<div ${s(`margin-bottom:12px`)}>${stars(featured.rating)}</div>` : ''}
        <p ${s(`${fontStyle(fonts, 'body')};font-size:1.25rem;line-height:1.7;margin:0 0 16px;opacity:.95`)}>&ldquo;${featured?.quote}&rdquo;</p>
        <div ${s(`${fontStyle(fonts, 'heading')};font-size:1rem`)}>${featured?.author}</div>
        <div ${s(`${fontStyle(fonts, 'body')};font-size:0.85rem;opacity:.8`)}>${featured?.role}</div>
      </div>
    </div>
    <div class="tf-grid">${smallCards}</div>
  </div>
</section>`
}

/** 4. Video testimonial grid with thumbnails */
export const generateTestimonialsVideo = (params: {
  title: string
  subtitle: string
  items: (TestimonialItem & { video?: string })[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map(item => `<div class="motion-reveal" ${s(`background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:16px;overflow:hidden`)}>
    <div class="tv-thumb" ${s(`position:relative;aspect-ratio:16/9;background:#111;cursor:pointer`)}>
      ${item.avatar ? `<img src="${item.avatar}?w=800&q=80" alt="${item.author}" ${s(`width:100%;height:100%;object-fit:cover;opacity:.7`)} loading="lazy" />` : ''}
      <div class="tv-play" ${s(`position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transition:opacity .3s`)}>
        <div ${s(`width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(0,0,0,.2)`)}>
          <svg width="22" height="22" viewBox="0 0 20 20"><polygon points="6,3 18,10 6,17" fill="${palette.primary}"/></svg>
        </div>
      </div>
    </div>
    <div ${s(`padding:20px`)}>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.text};font-size:0.9rem;line-height:1.5;margin:0 0 12px`)}>&ldquo;${item.quote.slice(0, 120)}...&rdquo;</p>
      <div ${s(`${fontStyle(fonts, 'heading')};color:${palette.text};font-size:0.9rem`)}>${item.author}</div>
      <div ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.8rem`)}>${item.role}</div>
    </div>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .tv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    @media(max-width:768px){.tv-grid{grid-template-columns:1fr}}
    .tv-thumb:hover .tv-play div{transform:scale(1.1)}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="tv-grid">${cards}</div>
  </div>
</section>`
}

/** 5. Social proof wall — tweet/post style cards */
export const generateTestimonialsWall = (params: {
  title: string
  subtitle: string
  items: TestimonialItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const stars = (n: number) => Array.from({ length: 5 }, (_, i) => `<span ${s(`color:${i < n ? '#FBBF24' : palette.border};font-size:14px`)}>&#9733;</span>`).join('')
  const cards = items.map((item, i) => {
    const variant = i % 3
    const hasImg = variant === 1 && item.image
    return `<div class="stagger-reveal" ${s(`break-inside:avoid;background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:12px;padding:20px;margin-bottom:16px`)}>
      <div ${s(`display:flex;align-items:center;gap:10px;margin-bottom:12px`)}>
        ${item.avatar ? `<img src="${item.avatar}?w=96&q=80" alt="${item.author}" ${s(`width:36px;height:36px;border-radius:50%;object-fit:cover`)} loading="lazy" />` : `<div ${s(`width:36px;height:36px;border-radius:50%;background:${palette.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;${fontStyle(fonts, 'heading')}`)}>${item.author.charAt(0)}</div>`}
        <div ${s(`flex:1`)}>
          <div ${s(`${fontStyle(fonts, 'heading')};color:${palette.text};font-size:0.85rem`)}>${item.author}</div>
          <div ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.75rem`)}>${item.role}</div>
        </div>
      </div>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.text};font-size:0.9rem;line-height:1.6;margin:0 0 ${item.rating || hasImg ? '12px' : '0'}`)}>${item.quote}</p>
      ${hasImg ? `<img src="${item.image}?w=600&q=80" alt="" ${s(`width:100%;border-radius:8px;margin-bottom:8px`)} loading="lazy" />` : ''}
      ${item.rating ? `<div>${stars(item.rating)}</div>` : ''}
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .tw-wall{column-count:3;column-gap:16px}
    @media(max-width:1024px){.tw-wall{column-count:2}}
    @media(max-width:600px){.tw-wall{column-count:1}}
  </style>
  <div ${s(`max-width:1200px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="tw-wall">${cards}</div>
  </div>
</section>`
}

/** 6. Minimal — full-width large quote, rotating */
export const generateTestimonialsMinimal = (params: {
  title: string
  subtitle: string
  items: TestimonialItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const slides = items.map((item, i) => `<div class="tmin-slide" data-tmin="${i}" ${s(`display:${i === 0 ? 'block' : 'none'};text-align:center`)}>
    <p ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(1.5rem,3.5vw,2.5rem);color:${palette.text};line-height:1.5;margin:0 0 32px;font-style:italic`)}>&ldquo;${item.quote}&rdquo;</p>
    <div ${s(`display:flex;align-items:center;justify-content:center;gap:12px`)}>
      ${item.avatar ? `<img src="${item.avatar}?w=96&q=80" alt="${item.author}" ${s(`width:44px;height:44px;border-radius:50%;object-fit:cover`)} loading="lazy" />` : ''}
      <div ${s(`text-align:start`)}>
        <div ${s(`${fontStyle(fonts, 'heading')};color:${palette.text};font-size:0.95rem`)}>${item.author}</div>
        <div ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.85rem`)}>${item.role}</div>
      </div>
    </div>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.backgroundAlt};padding:100px 24px`)}>
  <div ${s(`max-width:800px;margin:0 auto`)}>
    ${title ? `<div ${s(`text-align:center;margin-bottom:48px`)}><h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(1.5rem,3vw,2rem);color:${palette.text};margin:0 0 8px`)}>${title}</h2><p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1rem;margin:0`)}>${subtitle}</p></div>` : ''}
    ${slides}
  </div>
  <script>
  (function(){let c=0;const t=${items.length};setInterval(()=>{document.querySelectorAll('.tmin-slide').forEach(s=>{s.style.display='none';s.style.opacity='0'});c=(c+1)%t;const el=document.querySelector('[data-tmin="'+c+'"]');if(el){el.style.display='block';el.style.animation='blurIn .6s ease forwards'}},6000)})();
  </script>
  <style>@keyframes blurIn{from{opacity:0;filter:blur(6px);transform:translateY(8px)}to{opacity:1;filter:blur(0);transform:translateY(0)}}</style>
</section>`
}

/** 7. Star rating cards with animated gold stars */
export const generateTestimonialsStarRating = (params: {
  title: string
  subtitle: string
  items: TestimonialItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map((item, i) => {
    const rating = item.rating ?? 5
    const starHtml = Array.from({ length: 5 }, (_, j) => `<span class="star-anim" ${s(`color:${j < rating ? '#FBBF24' : palette.border};font-size:20px;display:inline-block;animation:starPop .4s ease ${j * 0.1}s both`)}}>&#9733;</span>`).join('')
    return `<div class="motion-reveal" ${s(`background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:16px;padding:28px`)}>
      <div ${s(`margin-bottom:14px`)}>${starHtml}</div>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.text};font-size:0.95rem;line-height:1.7;margin:0 0 20px`)}>&ldquo;${item.quote}&rdquo;</p>
      <div ${s(`display:flex;align-items:center;gap:12px`)}>
        ${item.avatar ? `<img src="${item.avatar}?w=96&q=80" alt="${item.author}" ${s(`width:40px;height:40px;border-radius:50%;object-fit:cover`)} loading="lazy" />` : `<div ${s(`width:40px;height:40px;border-radius:50%;background:${palette.primary};color:#fff;display:flex;align-items:center;justify-content:center;${fontStyle(fonts, 'heading')};font-size:0.9rem`)}>${item.author.charAt(0)}</div>`}
        <div>
          <div ${s(`${fontStyle(fonts, 'heading')};color:${palette.text};font-size:0.9rem`)}>${item.author}</div>
          <div ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.8rem`)}>${item.role}</div>
        </div>
      </div>
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    @keyframes starPop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
    .tsr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    @media(max-width:768px){.tsr-grid{grid-template-columns:1fr}}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="tsr-grid">${cards}</div>
  </div>
</section>`
}

/** 8. Logo bar marquee + rotating testimonial */
export const generateTestimonialsLogoBar = (params: {
  title: string
  subtitle: string
  items: TestimonialItem[]
  logos: { src: string; alt: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, logos, palette, fonts } = params
  const logoEls = [...logos, ...logos].map(l => `<img src="${l.src}?w=200&q=80" alt="${l.alt}" ${s(`height:36px;object-fit:contain;opacity:.5;flex-shrink:0;filter:grayscale(1);transition:filter .3s,opacity .3s`)} loading="lazy" />`).join('')

  const slides = items.map((item, i) => `<div class="tlb-slide" data-tlb="${i}" ${s(`display:${i === 0 ? 'flex' : 'none'};flex-direction:column;align-items:center;text-align:center;gap:16px`)}>
    <p ${s(`${fontStyle(fonts, 'body')};font-size:1.15rem;color:${palette.text};line-height:1.7;margin:0;max-width:650px`)}>&ldquo;${item.quote}&rdquo;</p>
    <div ${s(`${fontStyle(fonts, 'heading')};color:${palette.text};font-size:0.95rem`)}>${item.author} <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted}`)}>&mdash; ${item.role}</span></div>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.backgroundAlt};padding:80px 24px;overflow:hidden`)}>
  <style>
    .marquee-track{display:flex;gap:48px;animation:marquee 30s linear infinite;width:max-content}
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    .marquee-track img:hover{filter:grayscale(0);opacity:1}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:40px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div ${s(`overflow:hidden;margin-bottom:48px`)}>
      <div class="marquee-track">${logoEls}</div>
    </div>
    ${slides}
  </div>
  <script>
  (function(){let c=0;const t=${items.length};setInterval(()=>{document.querySelectorAll('.tlb-slide').forEach(s=>s.style.display='none');c=(c+1)%t;const el=document.querySelector('[data-tlb="'+c+'"]');if(el){el.style.display='flex';el.style.animation='blurIn .5s ease'}},5000)})();
  </script>
</section>`
}

/** 9. Before/After split comparison testimonials */
export const generateTestimonialsBeforeAfter = (params: {
  title: string
  subtitle: string
  items: { before: string; after: string; author: string; role: string; avatar?: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map(item => `<div class="motion-reveal" ${s(`background:${palette.backgroundAlt};border:1px solid ${palette.border};border-radius:16px;overflow:hidden`)}>
    <div ${s(`display:grid;grid-template-columns:1fr 1fr;min-height:200px`)}>
      <div ${s(`background:#FEF2F2;padding:24px;display:flex;flex-direction:column;gap:12px;border-inline-end:2px dashed ${palette.border}`)}>
        <div ${s(`${fontStyle(fonts, 'heading')};font-size:0.75rem;text-transform:uppercase;letter-spacing:1.5px;color:#DC2626`)}>Before</div>
        <p ${s(`${fontStyle(fonts, 'body')};color:#991B1B;font-size:0.9rem;line-height:1.6;margin:0`)}>${item.before}</p>
      </div>
      <div ${s(`background:#F0FDF4;padding:24px;display:flex;flex-direction:column;gap:12px`)}>
        <div ${s(`${fontStyle(fonts, 'heading')};font-size:0.75rem;text-transform:uppercase;letter-spacing:1.5px;color:#16A34A`)}>After</div>
        <p ${s(`${fontStyle(fonts, 'body')};color:#14532D;font-size:0.9rem;line-height:1.6;margin:0`)}>${item.after}</p>
      </div>
    </div>
    <div ${s(`padding:16px 24px;display:flex;align-items:center;gap:12px;border-top:1px solid ${palette.border}`)}>
      ${item.avatar ? `<img src="${item.avatar}?w=96&q=80" alt="${item.author}" ${s(`width:36px;height:36px;border-radius:50%;object-fit:cover`)} loading="lazy" />` : `<div ${s(`width:36px;height:36px;border-radius:50%;background:${palette.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;${fontStyle(fonts, 'heading')}`)}>${item.author.charAt(0)}</div>`}
      <div>
        <span ${s(`${fontStyle(fonts, 'heading')};color:${palette.text};font-size:0.85rem`)}>${item.author}</span>
        <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.8rem;margin-inline-start:8px`)}>${item.role}</span>
      </div>
    </div>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .tba-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
    @media(max-width:768px){.tba-grid{grid-template-columns:1fr}.tba-grid>div>div:first-child{grid-template-columns:1fr!important}}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="tba-grid">${cards}</div>
  </div>
</section>`
}

/** 10. Glassmorphism frosted glass cards */
export const generateTestimonialsGlassmorphism = (params: {
  title: string
  subtitle: string
  items: TestimonialItem[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items.map(item => `<div class="motion-reveal glass-card" ${s(`backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:28px`)}>
    <div ${s(`font-size:36px;color:${palette.primary};opacity:.4;margin-bottom:8px`)}>&ldquo;</div>
    <p ${s(`${fontStyle(fonts, 'body')};color:${palette.text};font-size:0.95rem;line-height:1.7;margin:0 0 20px`)}>${item.quote}</p>
    <div ${s(`display:flex;align-items:center;gap:12px`)}>
      ${item.avatar ? `<img src="${item.avatar}?w=96&q=80" alt="${item.author}" ${s(`width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.2)`)} loading="lazy" />` : `<div ${s(`width:44px;height:44px;border-radius:50%;background:${palette.primary};color:#fff;display:flex;align-items:center;justify-content:center;${fontStyle(fonts, 'heading')};font-size:1rem`)}>${item.author.charAt(0)}</div>`}
      <div>
        <div ${s(`${fontStyle(fonts, 'heading')};color:${palette.text};font-size:0.9rem`)}>${item.author}</div>
        <div ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.8rem`)}>${item.role}</div>
      </div>
    </div>
  </div>`).join('')

  return `<section class="motion-reveal" ${s(`background:linear-gradient(135deg,${palette.primary}22,${palette.accent}22);padding:80px 24px;position:relative;overflow:hidden`)}>
  <style>
    .tg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;position:relative;z-index:1}
    @media(max-width:768px){.tg-grid{grid-template-columns:1fr}}
    .glass-card{transition:transform .3s,box-shadow .3s}
    .glass-card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,.1)}
    .tg-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.3;z-index:0}
  </style>
  <div class="tg-orb" ${s(`width:400px;height:400px;background:${palette.primary};top:-100px;inset-inline-start:-100px`)}></div>
  <div class="tg-orb" ${s(`width:300px;height:300px;background:${palette.accent};bottom:-50px;inset-inline-end:-50px`)}></div>
  <div ${s(`max-width:1100px;margin:0 auto;position:relative;z-index:1`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="tg-grid">${cards}</div>
  </div>
</section>`
}

/* ==========================================================================
   PRICING — 8 variants
   ========================================================================== */

/** 1. Animated expanding cards (21st.dev style) */
export const generatePricingAnimatedCards = (params: {
  title: string
  subtitle: string
  plans: PricingPlan[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, plans, palette, fonts } = params
  const cards = plans.map(plan => {
    const featureList = plan.features.map(f => `<li ${s(`display:flex;align-items:center;gap:10px;padding:6px 0`)}>
      <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="${palette.primary}15"/><path d="M5 8l2 2 4-4" stroke="${palette.primary}" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
      <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem`)}>${f}</span>
    </li>`).join('')

    const planWithImg = plan as PricingPlan & { image?: string; originalPrice?: string; onSale?: boolean }
    return `<div class="pac-card${plan.popular ? ' pac-popular' : ''}" ${s(`background:${palette.backgroundAlt};border:${plan.popular ? '2px' : '1px'} solid ${plan.popular ? palette.primary : palette.border};border-radius:20px;padding:32px;display:flex;flex-direction:column;gap:8px;transition:all .4s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden`)}>
      ${plan.popular ? `<div ${s(`position:absolute;top:16px;inset-inline-end:16px;background:${palette.primary};color:#fff;${fontStyle(fonts, 'body')};font-size:0.75rem;padding:4px 12px;border-radius:20px`)}>Most Popular</div>` : ''}
      ${planWithImg.image ? `<img src="${planWithImg.image}${planWithImg.image.includes('?') ? '&' : '?'}w=400&q=80" alt="${plan.name}" ${s(`width:100%;height:160px;object-fit:contain;border-radius:12px;margin-bottom:8px;background:${palette.background}`)} loading="lazy" />` : ''}
      <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.1rem;color:${palette.text};margin:0`)}>${plan.name}</h3>
      <p ${s(`${fontStyle(fonts, 'body')};font-size:0.85rem;color:${palette.textMuted};margin:0`)}>${plan.description}</p>
      <div ${s(`margin:12px 0`)}>
        ${planWithImg.originalPrice ? `<span ${s(`${fontStyle(fonts, 'body')};font-size:1rem;color:${palette.textMuted};text-decoration:line-through;margin-inline-end:8px`)}>${planWithImg.originalPrice}</span>` : ''}
        <span ${s(`${fontStyle(fonts, 'heading')};font-size:2.75rem;color:${palette.text}`)}>${plan.price}</span>
        ${plan.period ? `<span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem`)}>/${plan.period}</span>` : ''}
      </div>
      <ul ${s(`list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:4px`)}>${featureList}</ul>
      <button class="${plan.popular ? 'shimmer-btn' : ''}" ${s(`width:100%;padding:14px;border-radius:12px;border:${plan.popular ? 'none' : `1px solid ${palette.border}`};background:${plan.popular ? palette.primary : 'transparent'};color:${plan.popular ? '#fff' : palette.text};${fontStyle(fonts, 'heading')};font-size:0.95rem;cursor:pointer;transition:all .3s;margin-top:auto`)}>${plan.cta}</button>
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .pac-grid{display:grid;grid-template-columns:repeat(${plans.length},1fr);gap:24px;align-items:stretch}
    @media(max-width:768px){.pac-grid{grid-template-columns:1fr;max-width:400px;margin-inline:auto}}
    .pac-card:hover{transform:translateY(-8px);box-shadow:0 24px 64px rgba(0,0,0,.1)}
    .pac-popular{box-shadow:0 16px 48px ${palette.primary}22}
    .shimmer-btn{position:relative;overflow:hidden}
    .shimmer-btn::after{content:'';position:absolute;inset:-50%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);animation:shimmer 3s infinite}
    @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
  </style>
  <div ${s(`max-width:1200px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="pac-grid">${cards}</div>
  </div>
</section>`
}

/** 2. Monthly/Annual toggle with animated price switch */
export const generatePricingToggle = (params: {
  title: string
  subtitle: string
  plans: PricingPlan[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, plans, palette, fonts } = params
  const cards = plans.map(plan => {
    const featureList = plan.features.map(f => `<li ${s(`display:flex;align-items:center;gap:10px;padding:6px 0`)}>
      <span ${s(`color:${palette.primary}`)}>&check;</span>
      <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem`)}>${f}</span>
    </li>`).join('')

    return `<div class="${plan.popular ? 'pt-popular' : ''}" ${s(`background:${palette.backgroundAlt};border:${plan.popular ? '2px' : '1px'} solid ${plan.popular ? palette.primary : palette.border};border-radius:20px;padding:32px;display:flex;flex-direction:column;position:relative`)}>
      ${plan.popular ? `<div ${s(`position:absolute;top:-14px;inset-inline-start:50%;transform:translateX(-50%);background:${palette.primary};color:#fff;${fontStyle(fonts, 'body')};font-size:0.8rem;padding:4px 16px;border-radius:20px;white-space:nowrap`)}>Most Popular</div>` : ''}
      <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.1rem;color:${palette.text};margin:0 0 4px`)}>${plan.name}</h3>
      <p ${s(`${fontStyle(fonts, 'body')};font-size:0.85rem;color:${palette.textMuted};margin:0 0 16px`)}>${plan.description}</p>
      <div>
        <span class="pt-price" data-monthly="${plan.price}" data-annual="${plan.annualPrice ?? plan.price}" ${s(`${fontStyle(fonts, 'heading')};font-size:2.75rem;color:${palette.text};transition:opacity .3s`)}>${plan.price}</span>
        <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem`)}>/mo</span>
      </div>
      <ul ${s(`list-style:none;padding:0;margin:20px 0;display:flex;flex-direction:column;gap:4px;flex:1`)}>${featureList}</ul>
      <button ${s(`width:100%;padding:14px;border-radius:12px;border:${plan.popular ? 'none' : `1px solid ${palette.border}`};background:${plan.popular ? palette.primary : 'transparent'};color:${plan.popular ? '#fff' : palette.text};${fontStyle(fonts, 'heading')};font-size:0.95rem;cursor:pointer;transition:all .3s`)}>${plan.cta}</button>
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .pt-grid{display:grid;grid-template-columns:repeat(${plans.length},1fr);gap:24px;align-items:stretch}
    @media(max-width:768px){.pt-grid{grid-template-columns:1fr;max-width:400px;margin-inline:auto}}
    .pt-toggle{position:relative;width:240px;height:44px;background:${palette.backgroundAlt};border-radius:22px;border:1px solid ${palette.border};cursor:pointer;display:flex;align-items:center;padding:4px}
    .pt-slider{position:absolute;width:50%;height:36px;background:${palette.primary};border-radius:18px;transition:inset-inline-start .3s;inset-inline-start:4px;top:4px}
    .pt-toggle.annual .pt-slider{inset-inline-start:calc(50% - 4px)}
    .pt-label{flex:1;text-align:center;position:relative;z-index:1;${fontStyle(fonts, 'body')};font-size:0.85rem;transition:color .3s}
  </style>
  <div ${s(`max-width:1200px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:40px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div ${s(`display:flex;justify-content:center;align-items:center;gap:12px;margin-bottom:40px`)}>
      <div class="pt-toggle" id="ptToggle">
        <div class="pt-slider"></div>
        <span class="pt-label" ${s(`color:#fff`)}>Monthly</span>
        <span class="pt-label" ${s(`color:${palette.textMuted}`)}>Annual</span>
      </div>
      <span ${s(`background:#DCFCE7;color:#16A34A;${fontStyle(fonts, 'body')};font-size:0.8rem;padding:4px 10px;border-radius:12px`)}>Save 20%</span>
    </div>
    <div class="pt-grid">${cards}</div>
  </div>
  <script>
  document.getElementById('ptToggle').onclick=function(){this.classList.toggle('annual');const isAnn=this.classList.contains('annual');const labels=this.querySelectorAll('.pt-label');labels[0].style.color=isAnn?'${palette.textMuted}':'#fff';labels[1].style.color=isAnn?'#fff':'${palette.textMuted}';document.querySelectorAll('.pt-price').forEach(p=>{p.style.opacity='0';setTimeout(()=>{p.textContent=isAnn?p.dataset.annual:p.dataset.monthly;p.style.opacity='1'},200)})};
  </script>
</section>`
}

/** 3. Full comparison table with sticky header */
export const generatePricingComparisonTable = (params: {
  title: string
  subtitle: string
  plans: PricingPlan[]
  features: { name: string; values: (boolean | string)[] }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, palette, fonts } = params
  const plans = params.plans || []
  const features = params.features || []
  if (plans.length === 0) return `<!-- pricing-comparison-table: no plans provided -->`
  const headerCells = plans.map(plan => `<th ${s(`padding:20px;${fontStyle(fonts, 'heading')};font-size:1rem;color:${plan.popular ? '#fff' : palette.text};background:${plan.popular ? palette.primary : 'transparent'};border-radius:${plan.popular ? '12px 12px 0 0' : '0'}`)}>
    <div>${plan.name}</div>
    <div ${s(`font-size:1.75rem;margin:8px 0`)}>${plan.price}</div>
    <div ${s(`${fontStyle(fonts, 'body')};font-size:0.8rem;opacity:.8`)}>${plan.description}</div>
  </th>`).join('')

  const rows = features.map(feat => {
    const cells = feat.values.map((v, i) => `<td ${s(`padding:14px 20px;text-align:center;border-bottom:1px solid ${palette.border};${plans[i]?.popular ? `background:${palette.primary}08` : ''}`)}>
      ${typeof v === 'boolean' ? (v ? `<span ${s(`color:${palette.primary};font-size:18px`)}>&#10003;</span>` : `<span ${s(`color:${palette.border};font-size:18px`)}>&#10007;</span>`) : `<span ${s(`${fontStyle(fonts, 'body')};color:${palette.text};font-size:0.9rem`)}>${v}</span>`}
    </td>`).join('')
    return `<tr><td ${s(`padding:14px 20px;${fontStyle(fonts, 'body')};color:${palette.text};font-size:0.9rem;border-bottom:1px solid ${palette.border}`)}>${feat.name}</td>${cells}</tr>`
  }).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .pct-table{width:100%;border-collapse:collapse;table-layout:fixed}
    .pct-table thead{position:sticky;top:0;z-index:2}
    .pct-wrap{overflow-x:auto;border:1px solid ${palette.border};border-radius:16px}
    .pct-table tr:hover td{background:${palette.backgroundAlt}}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="pct-wrap">
      <table class="pct-table">
        <thead><tr><th ${s(`padding:20px;background:${palette.backgroundAlt}`)}></th>${headerCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>
</section>`
}

/** 4. Range slider with dynamic price calculation */
export const generatePricingSlider = (params: {
  title: string
  subtitle: string
  basePrice: number
  pricePerUnit: number
  unitLabel: string
  currency: string
  features: string[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, basePrice, pricePerUnit, unitLabel, currency, features, palette, fonts } = params
  const featureList = features.map(f => `<li ${s(`display:flex;align-items:center;gap:10px;padding:6px 0`)}>
    <span ${s(`color:${palette.primary}`)}>&#10003;</span>
    <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.95rem`)}>${f}</span>
  </li>`).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.backgroundAlt};padding:80px 24px`)}>
  <style>
    .ps-slider{width:100%;height:8px;-webkit-appearance:none;appearance:none;border-radius:4px;background:${palette.border};outline:none;cursor:pointer}
    .ps-slider::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:${palette.primary};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer}
    .ps-slider::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:${palette.primary};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer}
  </style>
  <div ${s(`max-width:700px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div ${s(`background:${palette.background};border:1px solid ${palette.border};border-radius:20px;padding:40px;text-align:center`)}>
      <div ${s(`margin-bottom:32px`)}>
        <div ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem;margin-bottom:8px`)}><span id="psCount">5</span> ${unitLabel}</div>
        <input type="range" min="1" max="100" value="5" class="ps-slider" id="psSlider" />
        <div ${s(`display:flex;justify-content:space-between;${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.8rem;margin-top:8px`)}><span>1</span><span>100</span></div>
      </div>
      <div ${s(`margin-bottom:24px`)}>
        <span ${s(`${fontStyle(fonts, 'heading')};font-size:3rem;color:${palette.text}`)}>${currency}<span id="psPrice">${basePrice + pricePerUnit * 5}</span></span>
        <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1rem`)}>/mo</span>
      </div>
      <ul ${s(`list-style:none;padding:0;margin:0 0 24px;text-align:start`)}>${featureList}</ul>
      <button class="shimmer-btn" ${s(`width:100%;padding:16px;border-radius:12px;border:none;background:${palette.primary};color:#fff;${fontStyle(fonts, 'heading')};font-size:1rem;cursor:pointer`)}>Get Started</button>
    </div>
  </div>
  <script>
  document.getElementById('psSlider').oninput=function(){document.getElementById('psCount').textContent=this.value;document.getElementById('psPrice').textContent=${basePrice}+${pricePerUnit}*parseInt(this.value)};
  </script>
</section>`
}

/** 5. Minimal clean pricing cards */
export const generatePricingMinimal = (params: {
  title: string
  subtitle: string
  plans: PricingPlan[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, plans, palette, fonts } = params
  const cards = plans.map(plan => {
    const featureList = plan.features.map(f => `<li ${s(`display:flex;align-items:center;gap:10px;padding:8px 0`)}>
      <span ${s(`color:${palette.primary};font-size:14px`)}>&#10003;</span>
      <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem`)}>${f}</span>
    </li>`).join('')

    return `<div class="motion-reveal pm-card" ${s(`background:${palette.background};border:1px solid ${palette.border};border-radius:16px;padding:36px;display:flex;flex-direction:column;transition:all .3s`)}>
      <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.05rem;color:${palette.text};margin:0 0 4px`)}>${plan.name}</h3>
      <p ${s(`${fontStyle(fonts, 'body')};font-size:0.85rem;color:${palette.textMuted};margin:0 0 20px`)}>${plan.description}</p>
      <div ${s(`margin-bottom:20px`)}>
        <span ${s(`${fontStyle(fonts, 'heading')};font-size:2.5rem;color:${palette.text}`)}>${plan.price}</span>
        ${plan.period ? `<span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem`)}> /${plan.period}</span>` : ''}
      </div>
      <ul ${s(`list-style:none;padding:0;margin:0 0 24px;flex:1`)}>${featureList}</ul>
      <button ${s(`width:100%;padding:14px;border-radius:10px;border:1px solid ${palette.border};background:transparent;color:${palette.text};${fontStyle(fonts, 'heading')};font-size:0.9rem;cursor:pointer;transition:all .3s`)}>${plan.cta}</button>
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.backgroundAlt};padding:80px 24px`)}>
  <style>
    .pm-grid{display:grid;grid-template-columns:repeat(${Math.min(plans.length, 3)},1fr);gap:24px}
    @media(max-width:768px){.pm-grid{grid-template-columns:1fr;max-width:400px;margin-inline:auto}}
    .pm-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,.08)}
    .pm-card:hover button{background:${palette.primary};color:#fff;border-color:${palette.primary}}
  </style>
  <div ${s(`max-width:1000px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="pm-grid">${cards}</div>
  </div>
</section>`
}

/** 6. Animated gradient border cards with shimmer */
export const generatePricingGradient = (params: {
  title: string
  subtitle: string
  plans: PricingPlan[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, plans, palette, fonts } = params
  const cards = plans.map(plan => {
    const featureList = plan.features.map(f => `<li ${s(`display:flex;align-items:center;gap:10px;padding:6px 0`)}>
      <span ${s(`color:${palette.primary}`)}>&#10003;</span>
      <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem`)}>${f}</span>
    </li>`).join('')

    return `<div class="pg-outer${plan.popular ? ' pg-popular' : ''}" ${s(`background:${plan.popular ? `linear-gradient(135deg,${palette.primary},${palette.accent})` : palette.border};border-radius:22px;padding:${plan.popular ? '2px' : '1px'}`)}>
      <div ${s(`background:${palette.backgroundAlt};border-radius:20px;padding:32px;display:flex;flex-direction:column;height:100%`)}>
        ${plan.popular ? `<div ${s(`${fontStyle(fonts, 'body')};font-size:0.8rem;color:${palette.primary};margin-bottom:12px;text-transform:uppercase;letter-spacing:1px`)}>Recommended</div>` : ''}
        <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.1rem;color:${palette.text};margin:0 0 4px`)}>${plan.name}</h3>
        <p ${s(`${fontStyle(fonts, 'body')};font-size:0.85rem;color:${palette.textMuted};margin:0 0 16px`)}>${plan.description}</p>
        <div ${s(`margin-bottom:20px`)}>
          <span ${s(`${fontStyle(fonts, 'heading')};font-size:2.75rem;color:${palette.text}`)}>${plan.price}</span>
          ${plan.period ? `<span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem`)}>/${plan.period}</span>` : ''}
        </div>
        <ul ${s(`list-style:none;padding:0;margin:0 0 24px;flex:1`)}>${featureList}</ul>
        <button class="${plan.popular ? 'shimmer-btn' : ''}" ${s(`width:100%;padding:14px;border-radius:12px;border:none;background:${plan.popular ? palette.primary : palette.background};color:${plan.popular ? '#fff' : palette.text};${fontStyle(fonts, 'heading')};font-size:0.95rem;cursor:pointer;transition:all .3s`)}>${plan.cta}</button>
      </div>
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .pg-grid{display:grid;grid-template-columns:repeat(${plans.length},1fr);gap:24px;align-items:stretch}
    @media(max-width:768px){.pg-grid{grid-template-columns:1fr;max-width:400px;margin-inline:auto}}
    .pg-popular{animation:borderGlow 3s ease infinite alternate}
    @keyframes borderGlow{0%{box-shadow:0 0 20px ${palette.primary}33}100%{box-shadow:0 0 40px ${palette.primary}55}}
    .shimmer-btn{position:relative;overflow:hidden}
    .shimmer-btn::after{content:'';position:absolute;inset:-50%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);animation:shimmer 3s infinite}
    @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="pg-grid">${cards}</div>
  </div>
</section>`
}

/** 7. Enterprise pricing — 2 standard + 1 enterprise dark card */
export const generatePricingEnterprise = (params: {
  title: string
  subtitle: string
  plans: PricingPlan[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, plans, palette, fonts } = params
  const cards = plans.map((plan, i) => {
    const isEnterprise = i === plans.length - 1
    const featureList = plan.features.map(f => `<li ${s(`display:flex;align-items:center;gap:10px;padding:6px 0`)}>
      <span ${s(`color:${isEnterprise ? '#A78BFA' : palette.primary}`)}>&#10003;</span>
      <span ${s(`${fontStyle(fonts, 'body')};color:${isEnterprise ? '#CBD5E1' : palette.textMuted};font-size:0.9rem`)}>${f}</span>
    </li>`).join('')

    return `<div class="motion-reveal" ${s(`background:${isEnterprise ? '#0F172A' : palette.backgroundAlt};border:1px solid ${isEnterprise ? '#334155' : palette.border};border-radius:20px;padding:36px;display:flex;flex-direction:column`)}>
      ${isEnterprise ? `<div ${s(`${fontStyle(fonts, 'body')};font-size:0.75rem;color:#A78BFA;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px`)}>Enterprise</div>` : ''}
      <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.1rem;color:${isEnterprise ? '#F8FAFC' : palette.text};margin:0 0 4px`)}>${plan.name}</h3>
      <p ${s(`${fontStyle(fonts, 'body')};font-size:0.85rem;color:${isEnterprise ? '#94A3B8' : palette.textMuted};margin:0 0 20px`)}>${plan.description}</p>
      <div ${s(`margin-bottom:20px`)}>
        ${isEnterprise ? `<span ${s(`${fontStyle(fonts, 'heading')};font-size:1.5rem;color:#F8FAFC`)}>Custom Pricing</span>` : `<span ${s(`${fontStyle(fonts, 'heading')};font-size:2.5rem;color:${palette.text}`)}>${plan.price}</span><span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem`)}>${plan.period ? `/${plan.period}` : ''}</span>`}
      </div>
      <ul ${s(`list-style:none;padding:0;margin:0 0 24px;flex:1`)}>${featureList}</ul>
      <button ${s(`width:100%;padding:14px;border-radius:12px;border:${isEnterprise ? 'none' : `1px solid ${palette.border}`};background:${isEnterprise ? 'linear-gradient(135deg,#7C3AED,#6366F1)' : plan.popular ? palette.primary : 'transparent'};color:${isEnterprise || plan.popular ? '#fff' : palette.text};${fontStyle(fonts, 'heading')};font-size:0.95rem;cursor:pointer;transition:all .3s`)}>${plan.cta}</button>
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px`)}>
  <style>
    .pe-grid{display:grid;grid-template-columns:repeat(${plans.length},1fr);gap:24px;align-items:stretch}
    @media(max-width:768px){.pe-grid{grid-template-columns:1fr;max-width:400px;margin-inline:auto}}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:48px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div class="pe-grid">${cards}</div>
  </div>
</section>`
}

/** 8. Israeli pricing — NIS, Hebrew-friendly, Bit badge, toggle */
export const generatePricingIsraeli = (params: {
  title: string
  subtitle: string
  plans: PricingPlan[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, plans, palette, fonts } = params
  const cards = plans.map(plan => {
    const featureList = plan.features.map(f => `<li ${s(`display:flex;align-items:center;gap:10px;padding:6px 0`)}>
      <span ${s(`color:${palette.primary}`)}>&#10003;</span>
      <span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem`)}>${f}</span>
    </li>`).join('')

    return `<div class="${plan.popular ? 'pil-popular' : ''}" ${s(`background:${palette.backgroundAlt};border:${plan.popular ? '2px' : '1px'} solid ${plan.popular ? palette.primary : palette.border};border-radius:20px;padding:32px;display:flex;flex-direction:column;position:relative`)}>
      ${plan.popular ? `<div ${s(`position:absolute;top:-14px;inset-inline-end:24px;background:${palette.primary};color:#fff;${fontStyle(fonts, 'body')};font-size:0.8rem;padding:4px 14px;border-radius:20px`)}>הכי פופולרי</div>` : ''}
      <h3 ${s(`${fontStyle(fonts, 'heading')};font-size:1.1rem;color:${palette.text};margin:0 0 4px`)}>${plan.name}</h3>
      <p ${s(`${fontStyle(fonts, 'body')};font-size:0.85rem;color:${palette.textMuted};margin:0 0 16px`)}>${plan.description}</p>
      <div ${s(`display:flex;align-items:baseline;gap:4px;margin-bottom:20px`)}>
        <span ${s(`${fontStyle(fonts, 'heading')};font-size:2.75rem;color:${palette.text}`)}>${plan.price}</span>
        <span ${s(`${fontStyle(fonts, 'heading')};font-size:1.5rem;color:${palette.text}`)}>&#8362;</span>
        ${plan.period ? `<span ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:0.9rem`)}>/${plan.period}</span>` : ''}
      </div>
      <ul ${s(`list-style:none;padding:0;margin:0 0 24px;flex:1`)}>${featureList}</ul>
      <button ${s(`width:100%;padding:14px;border-radius:12px;border:${plan.popular ? 'none' : `1px solid ${palette.border}`};background:${plan.popular ? palette.primary : 'transparent'};color:${plan.popular ? '#fff' : palette.text};${fontStyle(fonts, 'heading')};font-size:0.95rem;cursor:pointer;transition:all .3s`)}>${plan.cta}</button>
      <div ${s(`display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid ${palette.border}`)}>
        <span ${s(`${fontStyle(fonts, 'body')};font-size:0.8rem;color:${palette.textMuted}`)}>ניתן לשלם עם</span>
        <span ${s(`background:#00D4AA;color:#fff;${fontStyle(fonts, 'heading')};font-size:0.75rem;padding:3px 10px;border-radius:6px`)}>Bit</span>
        <span ${s(`background:#0070E0;color:#fff;${fontStyle(fonts, 'heading')};font-size:0.75rem;padding:3px 10px;border-radius:6px`)}>PayPal</span>
      </div>
    </div>`
  }).join('')

  return `<section class="motion-reveal" ${s(`background:${palette.background};padding:80px 24px;direction:rtl`)}>
  <style>
    .pil-grid{display:grid;grid-template-columns:repeat(${plans.length},1fr);gap:24px;align-items:stretch}
    @media(max-width:768px){.pil-grid{grid-template-columns:1fr;max-width:400px;margin-inline:auto}}
    .pil-popular{box-shadow:0 16px 48px ${palette.primary}22}
  </style>
  <div ${s(`max-width:1100px;margin:0 auto`)}>
    <div ${s(`text-align:center;margin-bottom:40px`)}>
      <h2 ${s(`${fontStyle(fonts, 'heading')};font-size:clamp(2rem,4vw,3rem);color:${palette.text};margin:0 0 12px`)}>${title}</h2>
      <p ${s(`${fontStyle(fonts, 'body')};color:${palette.textMuted};font-size:1.1rem;margin:0`)}>${subtitle}</p>
    </div>
    <div ${s(`display:flex;justify-content:center;align-items:center;gap:12px;margin-bottom:40px`)}>
      <div class="pil-toggle" id="pilToggle" ${s(`position:relative;width:220px;height:44px;background:${palette.backgroundAlt};border-radius:22px;border:1px solid ${palette.border};cursor:pointer;display:flex;align-items:center;padding:4px`)}>
        <div class="pil-slider" ${s(`position:absolute;width:50%;height:36px;background:${palette.primary};border-radius:18px;transition:inset-inline-start .3s;inset-inline-start:4px;top:4px`)}></div>
        <span ${s(`flex:1;text-align:center;position:relative;z-index:1;${fontStyle(fonts, 'body')};font-size:0.85rem;color:#fff`)}>חודשי</span>
        <span ${s(`flex:1;text-align:center;position:relative;z-index:1;${fontStyle(fonts, 'body')};font-size:0.85rem;color:${palette.textMuted}`)}>שנתי</span>
      </div>
      <span ${s(`background:#DCFCE7;color:#16A34A;${fontStyle(fonts, 'body')};font-size:0.8rem;padding:4px 10px;border-radius:12px`)}>חסכו 20%</span>
    </div>
    <div class="pil-grid">${cards}</div>
  </div>
</section>`
}
