'use client'

import { useState, useMemo } from 'react'

type SidebarSection = 'pages' | 'layers' | 'design' | 'settings'

type EditorSidebarProps = {
  expanded: boolean
  onToggle: () => void
  htmlContent: string
  onHtmlChange: (html: string) => void
  siteName: string
  onSiteNameChange: (name: string) => void
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

    // Only show top-level semantic sections or divs with id/class
    if (tag === 'div') {
      const hasId = /id=["']([^"']*)["']/i.exec(attrs)
      const hasClass = /class=["']([^"']*)["']/i.exec(attrs)
      if (!hasId && !hasClass) continue
      // Skip deeply nested divs, only show meaningful ones
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
  // Hex colors
  const hexRegex = /#([0-9a-fA-F]{6})\b/g
  let match
  while ((match = hexRegex.exec(html)) !== null) {
    colors.add(match[0].toUpperCase())
  }
  // Also look for common Tailwind color classes and extract the semantic colors
  return Array.from(colors).slice(0, 12)
}

export const EditorSidebar = ({
  expanded,
  onToggle,
  htmlContent,
  onHtmlChange,
  siteName,
  onSiteNameChange,
}: EditorSidebarProps) => {
  const [activeSection, setActiveSection] = useState<SidebarSection>('pages')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc, setMetaDesc] = useState('')

  const pages = useMemo(() => extractPages(htmlContent), [htmlContent])
  const layers = useMemo(() => extractLayers(htmlContent), [htmlContent])
  const colors = useMemo(() => extractColors(htmlContent), [htmlContent])

  // Extract meta info
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

  const sidebarIcons = [
    { key: 'pages' as const, icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2' },
    { key: 'layers' as const, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { key: 'design' as const, icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { key: 'settings' as const, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ]

  if (!expanded) {
    return (
      <div className="flex w-10 flex-col items-center border-e border-border bg-bg py-2">
        <button
          onClick={onToggle}
          className="rounded p-1.5 text-text-muted hover:text-text hover:bg-bg-tertiary transition-colors"
          title="Expand sidebar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>

        <div className="mt-4 flex flex-col gap-1">
          {sidebarIcons.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveSection(key)
                onToggle()
              }}
              className={`rounded p-1.5 transition-colors ${
                activeSection === key
                  ? 'text-primary bg-primary-light'
                  : 'text-text-muted hover:text-text hover:bg-bg-tertiary'
              }`}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-60 flex-col border-e border-border bg-bg">
      {/* Sidebar Header */}
      <div className="flex h-10 items-center justify-between border-b border-border px-3">
        <div className="flex gap-0.5">
          {(['pages', 'layers', 'design', 'settings'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                activeSection === section
                  ? 'bg-primary-light text-primary'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={onToggle}
          className="rounded p-1 text-text-muted hover:text-text hover:bg-bg-tertiary transition-colors"
          title="Collapse sidebar"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeSection === 'pages' && (
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Pages</span>
            </div>
            <div className="space-y-0.5">
              {pages.map((page) => (
                <button
                  key={page.id}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-bg-tertiary transition-colors group"
                >
                  <svg className="h-3.5 w-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                  </svg>
                  <span className="flex-1 truncate text-text-secondary">{page.name}</span>
                  <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100">{page.href}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'layers' && (
          <div>
            <div className="mb-2 px-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">DOM Layers</span>
            </div>
            <div className="space-y-0.5">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  className="flex w-full items-center gap-1.5 rounded-md py-1 text-start text-xs hover:bg-bg-tertiary transition-colors"
                  style={{ paddingInlineStart: `${layer.depth * 16 + 8}px`, paddingInlineEnd: '8px' }}
                >
                  {layer.depth === 0 ? (
                    <svg className="h-3 w-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <span className="h-3 w-3" />
                  )}
                  <span className="flex-1 truncate text-text-secondary">{layer.name}</span>
                  <span className="rounded bg-bg-tertiary px-1 py-0.5 text-[10px] text-text-muted">
                    {layer.tag}
                  </span>
                </button>
              ))}
              {layers.length === 0 && (
                <p className="text-xs text-text-muted px-2 py-4">No sections detected</p>
              )}
            </div>
          </div>
        )}

        {activeSection === 'design' && (
          <div className="space-y-4">
            <div>
              <div className="mb-2 px-1">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Colors Found</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 px-1">
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
                      className="h-7 w-7 rounded-md border border-border hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                ))}
                {colors.length === 0 && (
                  <p className="col-span-5 text-xs text-text-muted py-2">No hex colors found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="space-y-3 px-1">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted uppercase tracking-wider">
                Site Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => onSiteNameChange(e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted uppercase tracking-wider">
                Page Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                onBlur={handleMetaTitleSave}
                className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted uppercase tracking-wider">
                Meta Description
              </label>
              <textarea
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                onBlur={handleMetaDescSave}
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted uppercase tracking-wider">
                Language
              </label>
              <select className="w-full rounded-md border border-border bg-bg px-2 py-1.5 text-sm text-text focus:border-primary focus:outline-none">
                <option>English</option>
                <option>Hebrew</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
