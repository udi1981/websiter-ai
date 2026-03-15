/**
 * Section template generators for the site rebuilder.
 * Each function returns production-quality HTML using Tailwind CSS,
 * parameterized by color palette, fonts, and content data.
 */

import type { ColorPalette, FontCombo } from './design-presets'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds an inline style string for font family + weight. */
const fontStyle = (fonts: FontCombo, role: 'heading' | 'body') => {
  const family = role === 'heading' ? fonts.heading : fonts.body
  const weight = role === 'heading' ? fonts.headingWeight : fonts.bodyWeight
  return `font-family:'${family}',sans-serif;font-weight:${weight}`
}

/** Shorthand: wrap value in style attr. */
const s = (css: string) => `style="${css}"`

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

export const generateNavbar = (params: {
  siteName: string
  links: { text: string; href: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { siteName, links, palette, fonts } = params
  const linkItems = links
    .map(
      (l) =>
        `<a href="${l.href}" class="text-sm hover:opacity-80 transition-opacity" ${s(`color:${palette.text};${fontStyle(fonts, 'body')}`)}>${l.text}</a>`,
    )
    .join('\n          ')

  return `<nav class="fixed top-0 inset-x-0 z-50 backdrop-blur-md" ${s(`background:${palette.background}ee;border-bottom:1px solid ${palette.border}`)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <a href="/" class="text-xl font-bold tracking-tight" ${s(`color:${palette.primary};${fontStyle(fonts, 'heading')}`)}>
        ${siteName}
      </a>
      <div class="hidden sm:flex items-center gap-6">
        ${linkItems}
      </div>
      <button class="sm:hidden p-2" ${s(`color:${palette.text}`)} aria-label="Menu">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  </div>
</nav>`
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export const generateHero = (params: {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  imageUrl: string
  style: 'fullscreen-image' | 'split' | 'gradient' | 'minimal'
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, ctaText, ctaLink, imageUrl, style, palette, fonts } = params

  const ctaButton = `<a href="${ctaLink}" class="inline-block px-8 py-3 rounded-lg text-base font-semibold transition-colors" ${s(`background:${palette.primary};color:${palette.background};${fontStyle(fonts, 'body')}`)}>
        ${ctaText}
      </a>`

  if (style === 'fullscreen-image') {
    return `<section class="relative min-h-screen flex items-center justify-center motion-reveal" ${s(`background:url('${imageUrl}?w=1600&q=80') center/cover no-repeat`)}>
  <div class="absolute inset-0" ${s(`background:linear-gradient(to bottom,${palette.text}99,${palette.text}cc)`)}></div>
  <div class="relative z-10 max-w-3xl mx-auto px-4 text-center">
    <h1 class="text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight" ${s(`color:#ffffff;${fontStyle(fonts, 'heading')}`)}>
      ${title}
    </h1>
    <p class="text-lg sm:text-xl mb-8 max-w-xl mx-auto" ${s(`color:#ffffffcc;${fontStyle(fonts, 'body')}`)}>
      ${subtitle}
    </p>
    ${ctaButton}
  </div>
</section>`
  }

  if (style === 'split') {
    return `<section class="min-h-screen flex items-center motion-reveal" ${s(`background:${palette.background}`)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-24">
    <div>
      <h1 class="text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
        ${title}
      </h1>
      <p class="text-lg mb-8" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>
        ${subtitle}
      </p>
      ${ctaButton}
    </div>
    <div class="relative">
      <img src="${imageUrl}?w=800&q=80" alt="${title}" class="w-full rounded-2xl shadow-2xl object-cover aspect-[4/3]" />
    </div>
  </div>
</section>`
  }

  if (style === 'gradient') {
    return `<section class="min-h-screen flex items-center justify-center motion-reveal" ${s(`background:linear-gradient(135deg,${palette.primary},${palette.accent})`)}>
  <div class="max-w-3xl mx-auto px-4 text-center py-24">
    <h1 class="text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight" ${s(`color:#ffffff;${fontStyle(fonts, 'heading')}`)}>
      ${title}
    </h1>
    <p class="text-lg sm:text-xl mb-8 max-w-xl mx-auto" ${s(`color:#ffffffcc;${fontStyle(fonts, 'body')}`)}>
      ${subtitle}
    </p>
    ${ctaButton.replace(`background:${palette.primary}`, 'background:#ffffff').replace(`color:${palette.background}`, `color:${palette.primary}`)}
  </div>
</section>`
  }

  // minimal
  return `<section class="min-h-[80vh] flex items-center motion-reveal" ${s(`background:${palette.background}`)}>
  <div class="max-w-4xl mx-auto px-4 py-24 text-center">
    <h1 class="text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
      ${title}
    </h1>
    <p class="text-lg sm:text-xl mb-8 max-w-2xl mx-auto" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>
      ${subtitle}
    </p>
    ${ctaButton}
  </div>
</section>`
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

export const generateFeatures = (params: {
  title: string
  subtitle: string
  items: { icon: string; title: string; description: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, items, palette, fonts } = params
  const cards = items
    .map(
      (item) => `
      <div class="p-6 sm:p-8 rounded-xl transition-shadow hover:shadow-lg motion-reveal" ${s(`background:${palette.background};border:1px solid ${palette.border}`)}>
        <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl" ${s(`background:${palette.primary}15;color:${palette.primary}`)}>
          ${item.icon}
        </div>
        <h3 class="text-lg font-semibold mb-2" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
          ${item.title}
        </h3>
        <p class="text-sm leading-relaxed" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>
          ${item.description}
        </p>
      </div>`,
    )
    .join('\n')

  return `<section class="py-20 sm:py-28 motion-reveal" ${s(`background:${palette.backgroundAlt}`)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl mb-4" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
        ${title}
      </h2>
      <p class="text-lg max-w-2xl mx-auto" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>
        ${subtitle}
      </p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      ${cards}
    </div>
  </div>
</section>`
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export const generateTestimonials = (params: {
  title: string
  items: { name: string; role: string; quote: string; avatarUrl: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, items, palette, fonts } = params
  const cards = items
    .map(
      (item) => `
      <div class="p-6 sm:p-8 rounded-xl motion-reveal" ${s(`background:${palette.background};border:1px solid ${palette.border}`)}>
        <svg class="w-8 h-8 mb-4" ${s(`color:${palette.primary}33`)} fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z"/></svg>
        <p class="text-base leading-relaxed mb-6" ${s(`color:${palette.text};${fontStyle(fonts, 'body')}`)}>
          "${item.quote}"
        </p>
        <div class="flex items-center gap-3">
          <img src="${item.avatarUrl}?w=80&q=80" alt="${item.name}" class="w-10 h-10 rounded-full object-cover" />
          <div>
            <p class="text-sm font-semibold" ${s(`color:${palette.text};${fontStyle(fonts, 'body')}`)}>
              ${item.name}
            </p>
            <p class="text-xs" ${s(`color:${palette.textMuted}`)}>
              ${item.role}
            </p>
          </div>
        </div>
      </div>`,
    )
    .join('\n')

  return `<section class="py-20 sm:py-28 motion-reveal" ${s(`background:${palette.background}`)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl sm:text-4xl text-center mb-16" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
      ${title}
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      ${cards}
    </div>
  </div>
</section>`
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export const generatePricing = (params: {
  title: string
  plans: { name: string; price: string; features: string[]; popular?: boolean }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, plans, palette, fonts } = params
  const cards = plans
    .map((plan) => {
      const isPopular = plan.popular ?? false
      const bg = isPopular ? palette.primary : palette.background
      const text = isPopular ? '#ffffff' : palette.text
      const muted = isPopular ? '#ffffffcc' : palette.textMuted
      const border = isPopular ? 'none' : `1px solid ${palette.border}`
      const shadow = isPopular ? 'shadow-2xl scale-105' : 'shadow-sm'
      const badge = isPopular
        ? `<span class="absolute -top-3 inset-x-0 mx-auto w-fit px-3 py-1 text-xs font-semibold rounded-full" ${s(`background:${palette.accent};color:#ffffff`)}>Most Popular</span>`
        : ''

      const featureList = plan.features
        .map(
          (f) =>
            `<li class="flex items-start gap-2 text-sm"><svg class="w-5 h-5 mt-0.5 shrink-0" ${s(`color:${isPopular ? '#ffffff' : palette.primary}`)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>${f}</span></li>`,
        )
        .join('\n            ')

      return `
      <div class="relative p-6 sm:p-8 rounded-xl ${shadow} motion-reveal" ${s(`background:${bg};border:${border};color:${text}`)}>
        ${badge}
        <h3 class="text-lg font-semibold mb-2" ${s(`${fontStyle(fonts, 'heading')}`)}>
          ${plan.name}
        </h3>
        <p class="text-4xl font-bold mb-6" ${s(`${fontStyle(fonts, 'heading')}`)}>
          ${plan.price}
        </p>
        <ul class="space-y-3 mb-8" ${s(`color:${muted};${fontStyle(fonts, 'body')}`)}>
          ${featureList}
        </ul>
        <a href="#" class="block text-center py-3 rounded-lg font-semibold transition-colors" ${s(`background:${isPopular ? '#ffffff' : palette.primary};color:${isPopular ? palette.primary : '#ffffff'};${fontStyle(fonts, 'body')}`)}>
          Get Started
        </a>
      </div>`
    })
    .join('\n')

  return `<section class="py-20 sm:py-28 motion-reveal" ${s(`background:${palette.backgroundAlt}`)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl sm:text-4xl text-center mb-16" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
      ${title}
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
      ${cards}
    </div>
  </div>
</section>`
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export const generateFAQ = (params: {
  title: string
  items: { question: string; answer: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, items, palette, fonts } = params
  const faqItems = items
    .map(
      (item) => `
      <details class="group p-5 rounded-xl motion-reveal" ${s(`border:1px solid ${palette.border}`)}>
        <summary class="flex items-center justify-between cursor-pointer list-none text-base font-semibold" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
          ${item.question}
          <svg class="w-5 h-5 transition-transform group-open:rotate-180 shrink-0" ${s(`color:${palette.textMuted}`)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </summary>
        <p class="mt-4 text-sm leading-relaxed" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>
          ${item.answer}
        </p>
      </details>`,
    )
    .join('\n')

  return `<section class="py-20 sm:py-28 motion-reveal" ${s(`background:${palette.background}`)}>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl sm:text-4xl text-center mb-16" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
      ${title}
    </h2>
    <div class="space-y-4">
      ${faqItems}
    </div>
  </div>
</section>`
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const generateContact = (params: {
  title: string
  subtitle: string
  address?: string
  phone?: string
  email?: string
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, palette, fonts } = params

  const infoItems: string[] = []
  if (params.address) {
    infoItems.push(`
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 mt-1 shrink-0" ${s(`color:${palette.primary}`)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span class="text-sm" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>${params.address}</span>
        </div>`)
  }
  if (params.phone) {
    infoItems.push(`
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 mt-1 shrink-0" ${s(`color:${palette.primary}`)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          <span class="text-sm" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>${params.phone}</span>
        </div>`)
  }
  if (params.email) {
    infoItems.push(`
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 mt-1 shrink-0" ${s(`color:${palette.primary}`)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span class="text-sm" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>${params.email}</span>
        </div>`)
  }

  return `<section class="py-20 sm:py-28 motion-reveal" ${s(`background:${palette.backgroundAlt}`)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      <div>
        <h2 class="text-3xl sm:text-4xl mb-4" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
          ${title}
        </h2>
        <p class="text-lg mb-8" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>
          ${subtitle}
        </p>
        <div class="space-y-4">
          ${infoItems.join('\n')}
        </div>
      </div>
      <form class="p-6 sm:p-8 rounded-xl space-y-5" ${s(`background:${palette.background};border:1px solid ${palette.border}`)}>
        <div>
          <label class="block text-sm font-medium mb-1" ${s(`color:${palette.text};${fontStyle(fonts, 'body')}`)}>Name</label>
          <input type="text" class="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors" ${s(`background:${palette.backgroundAlt};border:1px solid ${palette.border};color:${palette.text};${fontStyle(fonts, 'body')}`)} placeholder="Your name" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" ${s(`color:${palette.text};${fontStyle(fonts, 'body')}`)}>Email</label>
          <input type="email" class="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors" ${s(`background:${palette.backgroundAlt};border:1px solid ${palette.border};color:${palette.text};${fontStyle(fonts, 'body')}`)} placeholder="your@email.com" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" ${s(`color:${palette.text};${fontStyle(fonts, 'body')}`)}>Message</label>
          <textarea rows="4" class="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors resize-none" ${s(`background:${palette.backgroundAlt};border:1px solid ${palette.border};color:${palette.text};${fontStyle(fonts, 'body')}`)} placeholder="How can we help?"></textarea>
        </div>
        <button type="submit" class="w-full py-3 rounded-lg font-semibold transition-colors" ${s(`background:${palette.primary};color:#ffffff;${fontStyle(fonts, 'body')}`)}>
          Send Message
        </button>
      </form>
    </div>
  </div>
</section>`
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export const generateFooter = (params: {
  siteName: string
  links: { text: string; href: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { siteName, links, palette, fonts } = params
  const linkItems = links
    .map(
      (l) =>
        `<a href="${l.href}" class="text-sm hover:opacity-80 transition-opacity" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>${l.text}</a>`,
    )
    .join('\n          ')

  return `<footer class="py-12 motion-reveal" ${s(`background:${palette.text};color:${palette.background}`)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
      <a href="/" class="text-xl font-bold" ${s(`color:${palette.background};${fontStyle(fonts, 'heading')}`)}>
        ${siteName}
      </a>
      <div class="flex flex-wrap items-center justify-center gap-6">
        ${linkItems}
      </div>
    </div>
    <div class="mt-8 pt-8 text-center text-sm" ${s(`border-top:1px solid ${palette.textMuted}33;color:${palette.textMuted}`)}>
      &copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.
    </div>
  </div>
</footer>`
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export const generateGallery = (params: {
  title: string
  images: { src: string; alt: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, images, palette, fonts } = params
  const imageItems = images
    .map(
      (img) => `
      <div class="group relative overflow-hidden rounded-xl motion-reveal">
        <img src="${img.src}?w=600&q=80" alt="${img.alt}" class="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110" />
        <div class="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" ${s(`background:linear-gradient(to top,${palette.text}cc,transparent)`)}>
          <p class="text-sm font-medium" ${s(`color:#ffffff;${fontStyle(fonts, 'body')}`)}>
            ${img.alt}
          </p>
        </div>
      </div>`,
    )
    .join('\n')

  return `<section class="py-20 sm:py-28 motion-reveal" ${s(`background:${palette.background}`)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl sm:text-4xl text-center mb-16" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
      ${title}
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      ${imageItems}
    </div>
  </div>
</section>`
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export const generateTeam = (params: {
  title: string
  members: { name: string; role: string; imageUrl: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, members, palette, fonts } = params
  const cards = members
    .map(
      (m) => `
      <div class="text-center motion-reveal">
        <img src="${m.imageUrl}?w=600&q=80" alt="${m.name}" class="w-full aspect-square object-cover rounded-xl mb-4" />
        <h3 class="text-lg font-semibold" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
          ${m.name}
        </h3>
        <p class="text-sm mt-1" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>
          ${m.role}
        </p>
      </div>`,
    )
    .join('\n')

  return `<section class="py-20 sm:py-28 motion-reveal" ${s(`background:${palette.backgroundAlt}`)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl sm:text-4xl text-center mb-16" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
      ${title}
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      ${cards}
    </div>
  </div>
</section>`
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export const generateStats = (params: {
  items: { value: string; label: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { items, palette, fonts } = params
  const statItems = items
    .map(
      (item) => `
      <div class="text-center motion-reveal">
        <p class="text-4xl sm:text-5xl font-bold mb-2" ${s(`color:${palette.primary};${fontStyle(fonts, 'heading')}`)}>
          ${item.value}
        </p>
        <p class="text-sm uppercase tracking-wider" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>
          ${item.label}
        </p>
      </div>`,
    )
    .join('\n')

  return `<section class="py-16 sm:py-24 motion-reveal" ${s(`background:${palette.background};border-top:1px solid ${palette.border};border-bottom:1px solid ${palette.border}`)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
      ${statItems}
    </div>
  </div>
</section>`
}

// ---------------------------------------------------------------------------
// CTA (Call to Action)
// ---------------------------------------------------------------------------

export const generateCTA = (params: {
  title: string
  subtitle: string
  buttonText: string
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, buttonText, palette, fonts } = params

  return `<section class="py-20 sm:py-28 motion-reveal" ${s(`background:${palette.primary}`)}>
  <div class="max-w-3xl mx-auto px-4 text-center">
    <h2 class="text-3xl sm:text-4xl lg:text-5xl mb-6" ${s(`color:#ffffff;${fontStyle(fonts, 'heading')}`)}>
      ${title}
    </h2>
    <p class="text-lg mb-8 max-w-xl mx-auto" ${s(`color:#ffffffcc;${fontStyle(fonts, 'body')}`)}>
      ${subtitle}
    </p>
    <a href="#" class="inline-block px-10 py-4 rounded-lg text-base font-semibold transition-transform hover:scale-105" ${s(`background:#ffffff;color:${palette.primary};${fontStyle(fonts, 'body')}`)}>
      ${buttonText}
    </a>
  </div>
</section>`
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

export const generateNewsletter = (params: {
  title: string
  subtitle: string
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, subtitle, palette, fonts } = params

  return `<section class="py-20 sm:py-28 motion-reveal" ${s(`background:${palette.backgroundAlt}`)}>
  <div class="max-w-2xl mx-auto px-4 text-center">
    <h2 class="text-3xl sm:text-4xl mb-4" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
      ${title}
    </h2>
    <p class="text-lg mb-8" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>
      ${subtitle}
    </p>
    <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input type="email" class="flex-1 px-4 py-3 rounded-lg text-sm outline-none" ${s(`background:${palette.background};border:1px solid ${palette.border};color:${palette.text};${fontStyle(fonts, 'body')}`)} placeholder="Enter your email" />
      <button type="submit" class="px-6 py-3 rounded-lg font-semibold transition-colors shrink-0" ${s(`background:${palette.primary};color:#ffffff;${fontStyle(fonts, 'body')}`)}>
        Subscribe
      </button>
    </form>
  </div>
</section>`
}

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export const generateAbout = (params: {
  title: string
  description: string
  imageUrl: string
  stats?: { value: string; label: string }[]
  palette: ColorPalette
  fonts: FontCombo
}): string => {
  const { title, description, imageUrl, stats, palette, fonts } = params

  const statsHtml = stats?.length
    ? `<div class="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8" ${s(`border-top:1px solid ${palette.border}`)}>
        ${stats
          .map(
            (stat) => `
          <div class="text-center">
            <p class="text-2xl font-bold" ${s(`color:${palette.primary};${fontStyle(fonts, 'heading')}`)}>
              ${stat.value}
            </p>
            <p class="text-xs uppercase tracking-wider mt-1" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>
              ${stat.label}
            </p>
          </div>`,
          )
          .join('\n')}
      </div>`
    : ''

  return `<section class="py-20 sm:py-28 motion-reveal" ${s(`background:${palette.background}`)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div class="relative">
        <img src="${imageUrl}?w=800&q=80" alt="${title}" class="w-full rounded-2xl shadow-lg object-cover aspect-[4/3]" />
      </div>
      <div>
        <h2 class="text-3xl sm:text-4xl mb-6" ${s(`color:${palette.text};${fontStyle(fonts, 'heading')}`)}>
          ${title}
        </h2>
        <p class="text-base leading-relaxed" ${s(`color:${palette.textMuted};${fontStyle(fonts, 'body')}`)}>
          ${description}
        </p>
        ${statsHtml}
      </div>
    </div>
  </div>
</section>`
}
