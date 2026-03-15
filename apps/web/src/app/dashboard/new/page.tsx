'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { scanWebsite, type ScanResult } from '@/lib/scanner'
import { rebuildSite } from '@/lib/site-rebuilder'
import type { MotionIntensity } from '@/lib/motion-presets'

type TabId = 'scratch' | 'url' | 'template'
type TemplateCategory = 'all' | 'restaurant' | 'saas' | 'ecommerce' | 'portfolio' | 'business' | 'blog' | 'dental' | 'yoga' | 'law' | 'realestate' | 'fitness' | 'photography'

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'scratch', label: 'Start from Scratch', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z' },
  { id: 'url', label: 'Start from URL', icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244' },
  { id: 'template', label: 'Start from Template', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
]

const categories: { id: TemplateCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'saas', label: 'SaaS' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'business', label: 'Business' },
  { id: 'blog', label: 'Blog' },
  { id: 'dental', label: 'Dental' },
  { id: 'yoga', label: 'Wellness' },
  { id: 'law', label: 'Legal' },
  { id: 'realestate', label: 'Real Estate' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'photography', label: 'Photography' },
]

const categoryColors: Record<string, string> = {
  restaurant: 'bg-orange-500/10 text-orange-400',
  saas: 'bg-blue-500/10 text-blue-400',
  ecommerce: 'bg-emerald-500/10 text-emerald-400',
  portfolio: 'bg-pink-500/10 text-pink-400',
  business: 'bg-cyan-500/10 text-cyan-400',
  blog: 'bg-amber-500/10 text-amber-400',
  dental: 'bg-sky-500/10 text-sky-400',
  yoga: 'bg-lime-500/10 text-lime-400',
  law: 'bg-slate-500/10 text-slate-400',
  realestate: 'bg-yellow-500/10 text-yellow-400',
  fitness: 'bg-red-500/10 text-red-400',
  photography: 'bg-violet-500/10 text-violet-400',
}

const templateData = [
  {
    id: 'restaurant',
    name: 'Saffron & Thyme',
    category: 'restaurant' as TemplateCategory,
    pages: 5,
  },
  {
    id: 'saas',
    name: 'Metrica SaaS',
    category: 'saas' as TemplateCategory,
    pages: 4,
  },
  {
    id: 'ecommerce',
    name: 'ATELIER Store',
    category: 'ecommerce' as TemplateCategory,
    pages: 6,
  },
  {
    id: 'portfolio',
    name: 'Creative Portfolio',
    category: 'portfolio' as TemplateCategory,
    pages: 3,
  },
  {
    id: 'business',
    name: 'Vantage Studio',
    category: 'business' as TemplateCategory,
    pages: 5,
  },
  {
    id: 'blog',
    name: 'The Inkwell Blog',
    category: 'blog' as TemplateCategory,
    pages: 4,
  },
  {
    id: 'dental',
    name: 'PearlCare Dental',
    category: 'dental' as TemplateCategory,
    pages: 5,
  },
  {
    id: 'yoga',
    name: 'Lotus Path Wellness',
    category: 'yoga' as TemplateCategory,
    pages: 5,
  },
  {
    id: 'law',
    name: 'Prescott & Associates',
    category: 'law' as TemplateCategory,
    pages: 4,
  },
  {
    id: 'realestate',
    name: 'Horizon Properties',
    category: 'realestate' as TemplateCategory,
    pages: 5,
  },
  {
    id: 'fitness',
    name: 'Summit Fit',
    category: 'fitness' as TemplateCategory,
    pages: 4,
  },
  {
    id: 'photography',
    name: 'Ember Studio',
    category: 'photography' as TemplateCategory,
    pages: 3,
  },
]

const scannerSteps = [
  { label: 'Fetching HTML', icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418' },
  { label: 'Stylesheets', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
  { label: 'Metadata', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
  { label: 'Colors', icon: 'M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z' },
  { label: 'Typography', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12' },
  { label: 'Content', icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z' },
  { label: 'Layout', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z' },
  { label: 'Motion', icon: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5' },
  { label: 'AI Analysis', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z' },
]

const NewSitePage = () => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<TabId>('scratch')
  const [loading, setLoading] = useState(false)

  // Scratch tab state
  const [prompt, setPrompt] = useState('')
  const [platform, setPlatform] = useState<'both' | 'mobile'>('both')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  // URL tab state
  const [siteUrl, setSiteUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanStep, setScanStep] = useState(-1)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanError, setScanError] = useState('')

  // Motion & media options
  const [selectedMotion, setSelectedMotion] = useState<MotionIntensity>('premium')

  // Template tab state
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all')

  const filteredTemplates = selectedCategory === 'all'
    ? templateData
    : templateData.filter(t => t.category === selectedCategory)

  const createSite = async (templateId: string, name: string, description: string) => {
    const siteId = `site_${Date.now()}`

    let html = ''
    try {
      const res = await fetch(`/templates/${templateId}/index.html`)
      html = await res.text()
    } catch {
      // fallback
    }

    // If from scratch, customize the heading
    if (activeTab === 'scratch' && description && html) {
      const heading = description.slice(0, 60)
      html = html.replace(/<h1[^>]*>([^<]*)<\/h1>/, `<h1>$1 - ${heading}</h1>`)
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const savedSites = JSON.parse(localStorage.getItem('ubuilder_sites') || '[]')
    savedSites.push({
      id: siteId,
      name,
      status: 'draft',
      lastEdited: 'Just now',
      url: `${slug}.ubuilder.co`,
      description,
      template: templateId,
    })
    localStorage.setItem('ubuilder_sites', JSON.stringify(savedSites))

    // Save HTML content for the editor to load
    if (html) {
      localStorage.setItem(`ubuilder_html_${siteId}`, html)
    }
    router.push(`/editor/${siteId}`)
  }

  const handleScratchCreate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setBuildProgress(0)
    setStreamPreview('')

    const name = prompt.trim().slice(0, 40)

    // Build a system prompt and user prompt for from-scratch generation
    const systemPrompt = `You are an elite web designer. Generate a complete, stunning HTML website.
Return ONLY the HTML — from <!DOCTYPE html> to </html>. No markdown fences, no explanations.
Include ALL CSS in a single <style> tag. Include JS for scroll animations, mobile menu, and smooth scroll in a single <script> before </body>.
Use Google Fonts via <link> tag. Use Unsplash images (https://images.unsplash.com/photo-{ID}?w={W}&h={H}&fit=crop&q=80).
Verified Unsplash IDs: 1522202176988-66273c2fd55f, 1507003211169-0a1dd7228f2d, 1497366216548-37526070297c, 1560472354-b33ff0c44a43, 1553877522-43269d4ea984, 1517248135467-4c7edcad34c4, 1460925895917-afdab827c52f, 1534438327276-14e5300c3a48, 1600596542815-ffad4c1539a9, 1441986300917-64674bd600d8, 1470071459604-3b5ec3a7fe05, 1629909613654-28e377c37b09, 1504674900247-0877df9cc836, 1555396273-367ea4eb4db5, 1571019613454-1cb2f99b2d8b, 1518770660439-4636190af475, 1556905055-8f358a7a47b2, 1573496359142-b8d87734a5a2, 1494790108377-be9c29b29330, 1542744173-8e7e91415657.
The site must have: fixed nav with mobile menu, full-height hero, features/services grid, about section, testimonials, stats with animated counters, CTA section, footer.
Use CSS custom properties, fluid typography with clamp(), smooth transitions, hover effects, scroll reveal animations via IntersectionObserver.
Make it look like a $10,000 agency-built website. 800+ lines minimum.`

    const userPrompt = `Create a stunning website based on this description: "${prompt.trim()}"
Make ALL content realistic and professional. Never use lorem ipsum. The design should be modern, premium, and responsive.
Include at least 8 sections with unique visual treatments. Every section must contribute to the conversion goal.`

    let html = ''

    // Try streaming generation
    try {
      setBuildStatus('AI is creating your website...')
      const res = await fetch('/api/ai/generate-site-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt, siteName: name }),
      })

      if (res.ok && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const event = JSON.parse(line.slice(6))
              if (event.type === 'chunk' && event.text) {
                html += event.text
                const progress = Math.min(95, Math.round((html.length / 20000) * 100))
                setBuildProgress(progress)
                setBuildStatus(`AI generating... ${progress}%`)
                if (html.length % 3000 < 100) setStreamPreview(html)
              } else if (event.type === 'done') {
                setBuildProgress(100)
              } else if (event.type === 'error') {
                throw new Error(event.error)
              }
            } catch { /* skip malformed */ }
          }
        }
        html = html.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim()
      }
    } catch {
      // Try non-streaming fallback
      try {
        setBuildStatus('Generating with AI...')
        const res = await fetch('/api/ai/generate-site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designDna: { designStyle: 'modern-premium' },
            siteName: name,
            businessType: 'business',
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.ok && data.data?.html) html = data.data.html
        }
      } catch { /* fall through to template */ }
    }

    // Final fallback to template
    if (!html || html.length < 500) {
      setBuildStatus('Building from templates...')
      await new Promise(r => setTimeout(r, 500))
      await createSite('saas', name, prompt.trim())
      setLoading(false)
      setBuildStatus('')
      setBuildProgress(0)
      return
    }

    // Save and navigate to editor
    const siteId = `site_${Date.now()}`
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const savedSites = JSON.parse(localStorage.getItem('ubuilder_sites') || '[]')
    savedSites.push({
      id: siteId,
      name,
      status: 'draft',
      lastEdited: 'Just now',
      url: `${slug}.ubuilder.co`,
      description: prompt.trim(),
      template: 'ai-generated',
    })
    localStorage.setItem('ubuilder_sites', JSON.stringify(savedSites))
    localStorage.setItem(`ubuilder_html_${siteId}`, html)
    router.push(`/editor/${siteId}`)
    setLoading(false)
    setBuildStatus('')
    setBuildProgress(0)
    setStreamPreview('')
  }

  const handleUrlScan = useCallback(async () => {
    if (!siteUrl.trim()) return
    setScanning(true)
    setScanStep(0)
    setScanError('')
    setScanResult(null)

    try {
      const url = siteUrl.trim().startsWith('http') ? siteUrl.trim() : `https://${siteUrl.trim()}`

      // Scan with progress callback — the scanner reports 8 steps
      const result = await scanWebsite(url, (progress) => {
        // Map scanner steps (1-8) to UI steps (0-7)
        setScanStep(progress.step - 1)
      })

      // Auto-set motion preset from scan
      if (result.motion?.suggestedPreset) {
        setSelectedMotion(result.motion.suggestedPreset)
      }

      // Show scan results
      setScanResult(result)
      setScanStep(9) // all steps complete

    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Failed to scan website. Please check the URL and try again.')
      setScanning(false)
      setScanStep(-1)
    }
  }, [siteUrl])

  const [buildStatus, setBuildStatus] = useState('')
  const [buildProgress, setBuildProgress] = useState(0)
  const [streamPreview, setStreamPreview] = useState('')

  /** Build original content payload for AI */
  const buildOriginalContent = useCallback((result: ScanResult) => ({
    headings: result.headings.map(h => h.text),
    paragraphs: result.paragraphs.slice(0, 20),
    navLinks: result.navigation.map(n => n.text),
    images: result.images.slice(0, 15).map(img => ({ alt: img.alt, role: img.role })),
    sections: result.sections.map(s => ({
      type: s.type,
      title: s.title,
      content: s.content,
      itemCount: s.itemCount,
    })),
    ctaButtons: result.ctaButtons.slice(0, 10).map(b => ({ text: b.text })),
    colors: result.colors.slice(0, 10).map(c => ({ hex: c.hex, usage: c.usage })),
    fonts: result.fonts.map(f => ({ family: f.family, usage: f.usage })),
  }), [])

  /** Try streaming generation first, fall back to regular */
  const generateWithStreaming = useCallback(async (result: ScanResult): Promise<string> => {
    const siteName = result.businessName || result.domain || 'My Website'

    try {
      const res = await fetch('/api/ai/generate-site-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designDna: result.designDna,
          siteName,
          businessType: result.businessType || 'business',
          originalContent: buildOriginalContent(result),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Stream unavailable')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let html = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'chunk' && event.text) {
              html += event.text
              // Update progress based on estimated HTML length
              const progress = Math.min(95, Math.round((html.length / 15000) * 100))
              setBuildProgress(progress)
              setBuildStatus(`AI generating... ${progress}%`)
              // Show preview every 2000 chars
              if (html.length % 2000 < 100) {
                setStreamPreview(html)
              }
            } else if (event.type === 'done') {
              setBuildProgress(100)
            } else if (event.type === 'error') {
              throw new Error(event.error)
            }
          } catch {
            // skip malformed events
          }
        }
      }

      // Clean up markdown fences if present
      return html.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim()
    } catch {
      return '' // fall back to non-streaming
    }
  }, [buildOriginalContent])

  const handleBuildFromScan = useCallback(async () => {
    if (!scanResult) return
    setLoading(true)
    setBuildProgress(0)
    setStreamPreview('')

    let html = ''

    // Try AI generation first if we have design DNA
    if (scanResult.designDna) {
      // Try streaming first
      setBuildStatus('AI is generating your unique website...')
      html = await generateWithStreaming(scanResult)

      // Fall back to non-streaming if streaming failed
      if (!html) {
        try {
          setBuildStatus('AI is generating your unique website...')
          const siteName = scanResult.businessName || scanResult.domain || 'My Website'
          const res = await fetch('/api/ai/generate-site', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              designDna: scanResult.designDna,
              siteName,
              businessType: scanResult.businessType || 'business',
              originalContent: buildOriginalContent(scanResult),
            }),
          })

          if (res.ok) {
            const data = await res.json()
            if (data.ok && data.data?.html) {
              html = data.data.html
            }
          }
        } catch {
          // Fall back to template-based generation
        }
      }
    }

    // Fallback: use template-based rebuilder if AI generation failed
    if (!html) {
      setBuildStatus('Building from templates...')
      html = rebuildSite(scanResult, {
        motionPreset: selectedMotion,
      })
    }

    const siteId = `site_${Date.now()}`
    const shortId = siteId.slice(-6)
    const generatedName = `My ${(scanResult.businessType || 'business').charAt(0).toUpperCase() + (scanResult.businessType || 'business').slice(1)} Site ${shortId}`
    const slug = generatedName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

    const savedSites = JSON.parse(localStorage.getItem('ubuilder_sites') || '[]')
    savedSites.push({
      id: siteId,
      name: generatedName,
      status: 'draft',
      lastEdited: 'Just now',
      url: `${slug}.ubuilder.co`,
      description: `Inspired by ${scanResult.domain}`,
      template: scanResult.businessType || 'business',
    })
    localStorage.setItem('ubuilder_sites', JSON.stringify(savedSites))
    localStorage.setItem(`ubuilder_html_${siteId}`, html)

    router.push(`/editor/${siteId}`)
    setLoading(false)
    setScanning(false)
    setScanStep(-1)
    setScanResult(null)
    setBuildStatus('')
    setBuildProgress(0)
    setStreamPreview('')
  }, [scanResult, router, selectedMotion, generateWithStreaming, buildOriginalContent])

  const handleTemplateSelect = async (templateId: string) => {
    setLoading(true)
    const template = templateData.find(t => t.id === templateId)
    const name = template ? template.name : 'New Site'
    await createSite(templateId, name, `Created from ${name} template`)
    setLoading(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setUploadedImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">Create a New Website</h1>
        <p className="mt-2 text-text-muted">Choose how you want to get started</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 p-1 rounded-2xl bg-bg-secondary border border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-text-muted hover:text-text hover:bg-bg-tertiary'
            }`}
          >
            <svg className="h-4.5 w-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'scratch' && (
        <div className="space-y-6">
          {/* Description */}
          <div className="rounded-2xl border border-border bg-bg-secondary p-6">
            <label className="block text-sm font-medium text-text mb-3">Describe your website</label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="I want to create a modern website for my coffee shop with a warm, inviting design. It should include a menu page, about us section, location map, and online ordering..."
                rows={5}
                className="w-full rounded-xl border border-border bg-bg px-4 py-3 pe-12 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none"
              />
              {/* Voice input icon (decorative) */}
              <button className="absolute end-3 bottom-3 rounded-lg p-2 text-text-muted hover:text-primary hover:bg-primary/10 transition-colors" title="Voice input (coming soon)">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div className="rounded-2xl border border-border bg-bg-secondary p-6">
            <label className="block text-sm font-medium text-text mb-3">Upload a reference image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {uploadedImage ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <Image src={uploadedImage} alt="Reference" width={600} height={300} className="w-full h-48 object-cover" />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-3 end-3 rounded-lg bg-bg/80 backdrop-blur-sm p-1.5 text-text-muted hover:text-error transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-bg p-8 text-center transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary group-hover:bg-primary/10 transition-colors">
                    <svg className="h-6 w-6 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-muted group-hover:text-text transition-colors">Click to upload an image</p>
                    <p className="text-xs text-text-muted mt-1">PNG, JPG, or WebP up to 10MB</p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Platform Selector */}
          <div className="rounded-2xl border border-border bg-bg-secondary p-6">
            <label className="block text-sm font-medium text-text mb-3">Platform</label>
            <div className="flex gap-3">
              <button
                onClick={() => setPlatform('both')}
                className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl border px-4 py-3.5 text-sm font-medium transition-all ${
                  platform === 'both'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-bg text-text-muted hover:border-primary/30'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                </svg>
                Web & Mobile
              </button>
              <button
                onClick={() => setPlatform('mobile')}
                className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl border px-4 py-3.5 text-sm font-medium transition-all ${
                  platform === 'mobile'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-bg text-text-muted hover:border-primary/30'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
                Mobile Only
              </button>
            </div>
          </div>

          {/* Build Progress */}
          {loading && buildProgress > 0 && (
            <div className="rounded-2xl border border-border bg-bg-secondary p-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text font-medium">{buildStatus || 'AI is generating your website...'}</span>
                <span className="text-primary font-semibold">{buildProgress}%</span>
              </div>
              <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>
              {streamPreview && (
                <div className="mt-4 rounded-xl overflow-hidden border border-border" style={{ height: '300px' }}>
                  <iframe
                    srcDoc={streamPreview}
                    className="w-full h-full border-0"
                    title="Live preview"
                    sandbox="allow-scripts"
                    style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleScratchCreate}
            disabled={loading || !prompt.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 py-4 text-sm font-semibold text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {buildStatus || 'AI is generating your website...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Generate with AI
              </span>
            )}
          </button>
        </div>
      )}

      {activeTab === 'url' && (
        <div className="space-y-6">
          {/* URL Input */}
          <div className="rounded-2xl border border-border bg-bg-secondary p-8">
            <label className="block text-sm font-medium text-text mb-3">Paste any website URL</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <svg className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={scanning}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlScan()}
                  className="w-full rounded-xl border border-border bg-bg ps-12 pe-4 py-3.5 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleUrlScan}
                disabled={scanning || !siteUrl.trim()}
                className="rounded-xl bg-gradient-to-r from-primary to-primary-hover px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {scanning && !scanResult ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Scanning...
                  </span>
                ) : (
                  'Scan & Recreate'
                )}
              </button>
            </div>
            <p className="mt-4 text-xs text-text-muted">
              Our AI will scan the website, extract its design DNA (colors, fonts, layout), and create an improved version.
            </p>

            {/* Optional: Reference Image Upload */}
            <div className="mt-5 pt-5 border-t border-border">
              <label className="block text-xs font-medium text-text-muted mb-2">Or upload a screenshot / design reference</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploadedImage ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <Image src={uploadedImage} alt="Reference" width={600} height={200} className="w-full h-32 object-cover" />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-2 end-2 rounded-lg bg-bg/80 backdrop-blur-sm p-1 text-text-muted hover:text-error transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl border border-dashed border-border hover:border-primary/50 bg-bg px-4 py-3 text-center transition-all group"
                >
                  <span className="text-xs text-text-muted group-hover:text-primary transition-colors">
                    Click to upload a screenshot or design mockup (optional)
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {scanError && (
            <div className="rounded-xl border border-error/30 bg-error/5 px-5 py-4 flex items-start gap-3">
              <svg className="h-5 w-5 text-error shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-error">Scan Failed</p>
                <p className="text-xs text-error/70 mt-1">{scanError}</p>
              </div>
            </div>
          )}

          {/* Scanner Steps */}
          {(scanning || scanResult) && (
            <div className="rounded-2xl border border-border bg-bg-secondary p-8">
              <h3 className="text-sm font-medium text-text mb-5">Scanner Process</h3>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                {scannerSteps.map((step, i) => {
                  const isComplete = scanStep > i
                  const isActive = scanStep === i
                  return (
                    <div
                      key={step.label}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-500 ${
                        isComplete
                          ? 'border-success/30 bg-success/5'
                          : isActive
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-border bg-bg'
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-500 ${
                        isComplete
                          ? 'bg-success/20'
                          : isActive
                            ? 'bg-primary/20'
                            : 'bg-bg-tertiary'
                      }`}>
                        {isComplete ? (
                          <svg className="h-4 w-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : isActive ? (
                          <svg className="h-4 w-4 text-primary animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs font-medium text-center transition-colors ${
                        isComplete ? 'text-success' : isActive ? 'text-primary' : 'text-text-muted'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Scan Results */}
          {scanResult && (
            <div className="space-y-4">
              {/* Header */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text">{scanResult.businessName || scanResult.domain}</h3>
                    <p className="text-sm text-text-muted">
                      {scanResult.businessType.charAt(0).toUpperCase() + scanResult.businessType.slice(1)} website &middot; {scanResult.sections.length} sections detected
                      {scanResult.designDna && (
                        <span className="inline-flex items-center gap-1 ms-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                          AI Design DNA
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Colors */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Colors Detected</h4>
                  <div className="flex gap-2 flex-wrap">
                    {scanResult.colors.slice(0, 8).map((color, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-1.5">
                        <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                        <span className="text-xs font-mono text-text-muted">{color.hex}</span>
                      </div>
                    ))}
                    {scanResult.colors.length === 0 && (
                      <span className="text-xs text-text-muted">No colors detected — will use industry defaults</span>
                    )}
                  </div>
                </div>

                {/* Fonts */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Fonts Detected</h4>
                  <div className="flex gap-2 flex-wrap">
                    {scanResult.fonts.slice(0, 4).map((font, i) => (
                      <span key={i} className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium text-text">
                        {font.family} <span className="text-text-muted">({font.usage})</span>
                      </span>
                    ))}
                    {scanResult.fonts.length === 0 && (
                      <span className="text-xs text-text-muted">No custom fonts detected — will use industry defaults</span>
                    )}
                  </div>
                </div>

                {/* Sections */}
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Sections Detected</h4>
                  <div className="flex gap-2 flex-wrap">
                    {scanResult.sections.map((section, i) => (
                      <span key={i} className="rounded-lg bg-bg-tertiary px-3 py-1.5 text-xs font-medium text-text capitalize">
                        {section.type === 'unknown' ? section.title || 'Section' : section.type}
                        {section.itemCount > 1 && <span className="text-text-muted ms-1">({section.itemCount})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Motion Preset Selector */}
              <div className="rounded-2xl border border-border bg-bg-secondary p-6">
                <h4 className="text-sm font-semibold text-text mb-1">Animation Style</h4>
                <p className="text-xs text-text-muted mb-4">Choose how animated your site will be</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {([
                    { id: 'none' as MotionIntensity, label: 'None', desc: 'Static' },
                    { id: 'subtle' as MotionIntensity, label: 'Subtle', desc: 'Gentle fades' },
                    { id: 'premium' as MotionIntensity, label: 'Premium', desc: 'Smooth & polished' },
                    { id: 'dynamic' as MotionIntensity, label: 'Dynamic', desc: 'Bold & engaging' },
                    { id: 'cinematic' as MotionIntensity, label: 'Cinematic', desc: 'Immersive feel' },
                    { id: 'storytelling' as MotionIntensity, label: 'Story', desc: 'Maximum impact' },
                  ]).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedMotion(preset.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-all ${
                        selectedMotion === preset.id
                          ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10'
                          : 'border-border bg-bg text-text-muted hover:border-primary/30 hover:text-text'
                      }`}
                    >
                      <span className="text-xs font-semibold">{preset.label}</span>
                      <span className="text-[10px] opacity-70">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Build Progress & Preview */}
              {loading && buildProgress > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-bg-secondary p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-text">AI Generation Progress</span>
                    <span className="text-primary font-bold">{buildProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                      style={{ width: `${buildProgress}%` }}
                    />
                  </div>
                  {streamPreview && (
                    <div className="rounded-xl border border-border overflow-hidden h-48">
                      <iframe
                        srcDoc={streamPreview}
                        className="w-full h-full pointer-events-none"
                        sandbox="allow-same-origin"
                        title="Live preview"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Build Button */}
              <button
                onClick={handleBuildFromScan}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-primary via-purple-500 to-secondary px-6 py-4 text-sm font-semibold text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {buildStatus || 'Building your improved website...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    {scanResult?.designDna ? 'Build with AI' : 'Build Improved Version'}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'template' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-bg-secondary border border-border text-text-muted hover:text-text hover:border-primary/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Template Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group flex flex-col rounded-2xl border border-border bg-bg-secondary overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all"
              >
                {/* Template Preview */}
                <div className="relative h-48 overflow-hidden bg-bg-tertiary">
                  <iframe
                    src={`/templates/${template.id}/index.html`}
                    title={template.name}
                    sandbox="allow-same-origin"
                    loading="lazy"
                    className="border-0 pointer-events-none"
                    style={{
                      transform: 'scale(0.25)',
                      transformOrigin: 'top left',
                      width: '400%',
                      height: '400%',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 start-3 flex gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${categoryColors[template.category]}`}>
                      {categories.find(c => c.id === template.category)?.label}
                    </span>
                    <span className="rounded-full bg-bg/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-text">
                      Multi Pages
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-bg/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => handleTemplateSelect(template.id)}
                      disabled={loading}
                      className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      Use Template
                    </button>
                    <button
                      onClick={() => window.open(`/templates/${template.id}/index.html`, '_blank')}
                      className="rounded-xl bg-bg-secondary px-5 py-2.5 text-xs font-semibold text-text shadow-lg border border-border hover:bg-bg-tertiary transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-text">{template.name}</h3>
                    <span className="text-xs text-text-muted">{template.pages} pages</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTemplateSelect(template.id)}
                      disabled={loading}
                      className="flex-1 rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      Use Template
                    </button>
                    <button
                      onClick={() => window.open(`/templates/${template.id}/index.html`, '_blank')}
                      className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-muted hover:text-text hover:bg-bg-tertiary transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NewSitePage
