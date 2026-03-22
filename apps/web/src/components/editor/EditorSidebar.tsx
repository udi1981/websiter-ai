'use client'

import { useState, useMemo } from 'react'

type SidebarSection = 'pages' | 'sections' | 'layers' | 'design' | 'settings'

type EditorSidebarProps = {
  expanded: boolean
  onToggle: () => void
  htmlContent: string
  onHtmlChange: (html: string) => void
  siteName: string
  onSiteNameChange: (name: string) => void
  onOpenSectionPicker?: () => void
  onSwapSection?: (category: string, oldVariantId: string, newVariantId: string) => void
  onRemoveSection?: (category: string, variantId: string) => void
}

type LayerItem = {
  id: string
  name: string
  tag: string
  depth: number
}

/** Extract page links from the HTML nav section */
const extractPages = (html: string): { id: string; name: string; href: string }[] => {
  const pages: { id: string; name: string; href: string }[] = []
  const navMatch = html.match(/<nav[\s\S]*?<\/nav>/i)
  if (!navMatch) return [{ id: 'home', name: 'Home', href: '#' }]

  const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match
  while ((match = linkRegex.exec(navMatch[0])) !== null) {
    const href = match[1]
    const textContent = match[2].replace(/<[^>]*>/g, '').trim()
    if (textContent) {
      pages.push({
        id: textContent.toLowerCase().replace(/\s+/g, '-'),
        name: textContent,
        href,
      })
    }
  }
  return pages.length > 0 ? pages : [{ id: 'home', name: 'Home', href: '#' }]
}

/** Extract major sections from the HTML */
const extractLayers = (html: string): LayerItem[] => {
  const layers: LayerItem[] = []
  const sectionRegex = /<(header|nav|section|main|article|aside|footer|div)([^>]*?)>/gi
  let match
  let id = 0

  while ((match = sectionRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    const attrs = match[2]

    if (tag === 'div') {
      const hasId = /id=["']([^"']*)["']/i.exec(attrs)
      const hasClass = /class=["']([^"']*)["']/i.exec(attrs)
      if (!hasId && !hasClass) continue
      const className = hasClass?.[1] || ''
      if (!hasId && !className.includes('container') && !className.includes('wrapper') && !className.includes('section') && !className.includes('hero') && !className.includes('feature') && !className.includes('footer')) continue
    }

    const idAttr = /id=["']([^"']*)["']/i.exec(attrs)
    const classAttr = /class=["']([^"']*)["']/i.exec(attrs)

    let label = tag.charAt(0).toUpperCase() + tag.slice(1)
    if (idAttr) {
      label = idAttr[1].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    } else if (classAttr) {
      const firstClass = classAttr[1].split(' ')[0]
      if (firstClass && !firstClass.includes(':') && !firstClass.startsWith('w-') && !firstClass.startsWith('h-') && !firstClass.startsWith('p-') && !firstClass.startsWith('m-') && !firstClass.startsWith('flex') && !firstClass.startsWith('grid') && !firstClass.startsWith('bg-') && !firstClass.startsWith('text-')) {
        label = firstClass.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      }
    }

    layers.push({
      id: `layer-${id++}`,
      name: label,
      tag,
      depth: ['header', 'nav', 'section', 'main', 'footer'].includes(tag) ? 0 : 1,
    })

    if (layers.length > 30) break
  }

  return layers
}

/** Extract colors from the HTML */
const extractColors = (html: string): string[] => {
  const colors = new Set<string>()
  const hexRegex = /#([0-9a-fA-F]{6})\b/g
  let match
  while ((match = hexRegex.exec(html)) !== null) {
    colors.add(match[0].toUpperCase())
  }
  return Array.from(colors).slice(0, 12)
}

/** Extract sections from HTML comment markers <!-- section:CATEGORY:VARIANT-ID --> */
const extractSections = (html: string): { category: string; variantId: string; name: string }[] => {
  const sections: { category: string; variantId: string; name: string }[] = []
  const regex = /<!-- section:(\w[\w-]*):(\w[\w-]*) -->/g
  let match
  while ((match = regex.exec(html)) !== null) {
    const category = match[1]
    const variantId = match[2]
    const name = variantId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    sections.push({ category, variantId, name })
  }
  return sections
}

const CATEGORY_ICONS: Record<string, string> = {
  navbar: '\u{1F9ED}', hero: '\u{1F31F}', features: '\u2728', testimonials: '\u{1F4AC}',
  pricing: '\u{1F4B0}', cta: '\u{1F3AF}', faq: '\u2753', footer: '\u{1F4CD}',
  gallery: '\u{1F5BC}\uFE0F', team: '\u{1F465}', stats: '\u{1F4CA}', contact: '\u{1F4E7}',
  partners: '\u{1F91D}', 'how-it-works': '\u{1F527}', blog: '\u{1F4DD}',
  portfolio: '\u{1F4BC}', comparison: '\u2696\uFE0F', newsletter: '\u{1F4EC}', about: '\u{1F4D6}',
}

const sidebarItems = [
  { key: 'pages' as const, label: 'Pages', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2' },
  { key: 'sections' as const, label: 'Sections', icon: 'M4 5h16M4 5v2h16V5M4 10h10M4 10v2h10v-2M4 15h13M4 15v2h13v-2' },
  { key: 'layers' as const, label: 'Layers', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { key: 'design' as const, label: 'Design', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { key: 'settings' as const, label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
]

export const EditorSidebar = ({
  expanded,
  onToggle,
  htmlContent,
  onHtmlChange,
  siteName,
  onSiteNameChange,
  onOpenSectionPicker,
  onRemoveSection,
}: EditorSidebarProps) => {
  const [activeSection, setActiveSection] = useState<SidebarSection>('pages')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc, setMetaDesc] = useState('')

  const pages = useMemo(() => extractPages(htmlContent), [htmlContent])
  const layers = useMemo(() => extractLayers(htmlContent), [htmlContent])
  const colors = useMemo(() => extractColors(htmlContent), [htmlContent])
  const sections = useMemo(() => extractSections(htmlContent), [htmlContent])

  useMemo(() => {
    const titleMatch = htmlContent.match(/<title>([\s\S]*?)<\/title>/i)
    setMetaTitle(titleMatch?.[1] || '')
    const descMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
    setMetaDesc(descMatch?.[1] || '')
  }, [htmlContent])

  const handleColorChange = (oldColor: string, newColor: string) => {
    if (oldColor === newColor) return
    const updated = htmlContent.replaceAll(oldColor, newColor).replaceAll(oldColor.toLowerCase(), newColor)
    onHtmlChange(updated)
  }

  const handleMetaTitleSave = () => {
    let updated = htmlContent
    if (updated.match(/<title>[\s\S]*?<\/title>/i)) {
      updated = updated.replace(/<title>[\s\S]*?<\/title>/i, `<title>${metaTitle}</title>`)
    }
    onHtmlChange(updated)
  }

  const handleMetaDescSave = () => {
    let updated = htmlContent
    if (updated.match(/<meta[^>]*name=["']description["'][^>]*/i)) {
      updated = updated.replace(
        /<meta[^>]*name=["']description["'][^>]*/i,
        `<meta name="description" content="${metaDesc}"`
      )
    } else {
      updated = updated.replace('</head>', `  <meta name="description" content="${metaDesc}">\n</head>`)
    }
    onHtmlChange(updated)
  }

  // Collapsed: slim icon rail
  if (!expanded) {
    return (
      <div className="flex w-12 flex-col items-center border-e border-white/[0.06] bg-[#0d1117] py-3 gap-1">
        {sidebarItems.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => {
              setActiveSection(key)
              onToggle()
            }}
            className={`group relative rounded-lg p-2 transition-all ${
              activeSection === key
                ? 'text-violet-400 bg-violet-500/10'
                : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
            }`}
            title={label}
            aria-label={`${label} section`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
            {/* Tooltip */}
            <span className="absolute start-full ms-2 top-1/2 -translate-y-1/2 rounded-md bg-white/10 backdrop-blur-sm px-2 py-1 text-[11px] text-white/80 font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {label}
            </span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex w-64 flex-col border-e border-white/[0.06] bg-[#0d1117]">
      {/* Section nav */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] px-2 py-2">
        {sidebarItems.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
              activeSection === key
                ? 'bg-violet-500/15 text-violet-300'
                : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
            }`}
            aria-label={`${label} section`}
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
            <span className="hidden xl:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeSection === 'pages' && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">Pages</span>
              <span className="text-[10px] text-white/20">{pages.length}</span>
            </div>
            <div className="space-y-0.5">
              {pages.map((page, idx) => (
                <button
                  key={`${page.id}-${idx}`}
                  onClick={() => {
                    // Navigate the preview iframe to this section/page anchor
                    const iframe = document.querySelector('iframe[title="Site Preview"]') as HTMLIFrameElement | null
                    if (iframe?.contentDocument) {
                      const href = page.href
                      if (href.startsWith('#') && href.length > 1) {
                        const target = iframe.contentDocument.querySelector(href) ||
                          iframe.contentDocument.getElementById(href.slice(1))
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      } else if (href === '#' || href === '/') {
                        iframe.contentWindow?.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[13px] text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.04]">
                    <svg className="h-3 w-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                    </svg>
                  </div>
                  <span className="flex-1 truncate">{page.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'sections' && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">Sections</span>
              <span className="text-[10px] text-white/20">{sections.length}</span>
            </div>
            {sections.length > 0 ? (
              <div className="space-y-0.5">
                {sections.map((section, idx) => (
                  <div
                    key={`${section.category}-${section.variantId}-${idx}`}
                    className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[13px] text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all border-b border-white/[0.03] last:border-b-0"
                  >
                    <span className="text-base shrink-0 leading-none" role="img" aria-label={section.category}>
                      {CATEGORY_ICONS[section.category] || '\u{1F4E6}'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-[13px] text-white/70">{section.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-white/25">{section.category}</span>
                        <span className="rounded bg-white/[0.06] px-1 py-0.5 text-[9px] text-white/20 font-mono">
                          {section.variantId}
                        </span>
                      </div>
                    </div>
                    {onRemoveSection && (
                      <button
                        onClick={() => onRemoveSection(section.category, section.variantId)}
                        className="opacity-0 group-hover:opacity-100 shrink-0 rounded p-1 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Remove section"
                        aria-label={`Remove ${section.name} section`}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/20 px-2 py-4">
                No sections detected. Generate a new site or add sections.
              </p>
            )}
            {onOpenSectionPicker && (
              <button
                onClick={onOpenSectionPicker}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-[12px] font-medium text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/30 transition-all"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Section
              </button>
            )}
          </div>
        )}

        {activeSection === 'layers' && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">Structure</span>
              <span className="text-[10px] text-white/20">{layers.length}</span>
            </div>
            <div className="space-y-0.5">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  className="flex w-full items-center gap-1.5 rounded-lg py-1.5 text-start text-[12px] text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                  style={{ paddingInlineStart: `${layer.depth * 16 + 8}px`, paddingInlineEnd: '8px' }}
                >
                  {layer.depth === 0 ? (
                    <svg className="h-3 w-3 shrink-0 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <span className="h-3 w-3 shrink-0" />
                  )}
                  <span className="flex-1 truncate">{layer.name}</span>
                  <span className="rounded bg-white/[0.04] px-1 py-0.5 text-[9px] text-white/20 font-mono">
                    {layer.tag}
                  </span>
                </button>
              ))}
              {layers.length === 0 && (
                <p className="text-xs text-white/20 px-2 py-4">No sections detected</p>
              )}
            </div>
          </div>
        )}

        {activeSection === 'design' && (
          <div className="space-y-5">
            <div>
              <div className="mb-3">
                <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">Color Palette</span>
              </div>
              <div className="grid grid-cols-6 gap-2 px-0.5">
                {colors.map((color) => (
                  <div key={color} className="relative group">
                    <input
                      type="color"
                      defaultValue={color}
                      onChange={(e) => handleColorChange(color, e.target.value.toUpperCase())}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title={`Change ${color}`}
                    />
                    <div
                      className="h-8 w-8 rounded-lg border border-white/[0.08] hover:scale-110 hover:border-white/20 transition-all cursor-pointer shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="absolute -bottom-5 start-1/2 -translate-x-1/2 text-[8px] text-white/20 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {color}
                    </span>
                  </div>
                ))}
                {colors.length === 0 && (
                  <p className="col-span-6 text-xs text-white/20 py-2">No hex colors found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                Site Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => onSiteNameChange(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                Page Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                onBlur={handleMetaTitleSave}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                Meta Description
              </label>
              <textarea
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                onBlur={handleMetaDescSave}
                rows={3}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                Language
              </label>
              <select className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/80 focus:border-violet-500/50 focus:outline-none appearance-none cursor-pointer">
                <option value="en">English</option>
                <option value="he">Hebrew</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
