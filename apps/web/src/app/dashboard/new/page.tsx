'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
    name: 'Restaurant & Cafe',
    category: 'restaurant' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    pages: 5,
  },
  {
    id: 'saas',
    name: 'SaaS Landing Page',
    category: 'saas' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
    pages: 4,
  },
  {
    id: 'ecommerce',
    name: 'Online Store',
    category: 'ecommerce' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
    pages: 6,
  },
  {
    id: 'portfolio',
    name: 'Creative Portfolio',
    category: 'portfolio' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&q=80',
    pages: 3,
  },
  {
    id: 'business',
    name: 'Business Pro',
    category: 'business' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
    pages: 5,
  },
  {
    id: 'blog',
    name: 'Modern Blog',
    category: 'blog' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80',
    pages: 4,
  },
  {
    id: 'dental',
    name: 'Dental Clinic',
    category: 'dental' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&q=80',
    pages: 5,
  },
  {
    id: 'yoga',
    name: 'Yoga & Wellness',
    category: 'yoga' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80',
    pages: 5,
  },
  {
    id: 'law',
    name: 'Law Firm',
    category: 'law' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80',
    pages: 4,
  },
  {
    id: 'realestate',
    name: 'Real Estate Agency',
    category: 'realestate' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
    pages: 5,
  },
  {
    id: 'fitness',
    name: 'Gym & Fitness',
    category: 'fitness' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
    pages: 4,
  },
  {
    id: 'photography',
    name: 'Photography Studio',
    category: 'photography' as TemplateCategory,
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&q=80',
    pages: 3,
  },
]

const scannerSteps = [
  { label: 'Colors', delay: 800 },
  { label: 'Fonts', delay: 1600 },
  { label: 'Layout', delay: 2400 },
  { label: 'Content', delay: 3200 },
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
    const name = prompt.trim().slice(0, 40)
    await new Promise(r => setTimeout(r, 1500))
    await createSite('saas', name, prompt.trim())
    setLoading(false)
  }

  const handleUrlScan = async () => {
    if (!siteUrl.trim()) return
    setScanning(true)
    setScanStep(0)

    for (let i = 0; i < scannerSteps.length; i++) {
      await new Promise(r => setTimeout(r, 800))
      setScanStep(i + 1)
    }

    await new Promise(r => setTimeout(r, 500))

    let domain = siteUrl.trim()
    try {
      domain = new URL(domain.startsWith('http') ? domain : `https://${domain}`).hostname.replace('www.', '')
    } catch {
      // keep as-is
    }

    await createSite('business', `${domain} - Recreated`, `Recreated from ${siteUrl}`)
    setScanning(false)
    setScanStep(-1)
  }

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
                AI is generating your website...
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
                  className="w-full rounded-xl border border-border bg-bg ps-12 pe-4 py-3.5 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleUrlScan}
                disabled={scanning || !siteUrl.trim()}
                className="rounded-xl bg-gradient-to-r from-primary to-primary-hover px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {scanning ? (
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
          </div>

          {/* Scanner Steps */}
          <div className="rounded-2xl border border-border bg-bg-secondary p-8">
            <h3 className="text-sm font-medium text-text mb-5">Scanner Process</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {scannerSteps.map((step, i) => {
                const isComplete = scanStep > i
                const isActive = scanStep === i
                return (
                  <div
                    key={step.label}
                    className={`flex flex-col items-center gap-3 rounded-xl border p-5 transition-all duration-500 ${
                      isComplete
                        ? 'border-success/30 bg-success/5'
                        : isActive
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border bg-bg'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ${
                      isComplete
                        ? 'bg-success/20'
                        : isActive
                          ? 'bg-primary/20'
                          : 'bg-bg-tertiary'
                    }`}>
                      {isComplete ? (
                        <svg className="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : isActive ? (
                        <svg className="h-5 w-5 text-primary animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-text-muted/30" />
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-colors ${
                      isComplete ? 'text-success' : isActive ? 'text-primary' : 'text-text-muted'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
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
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={template.image}
                    alt={template.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
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
