import Image from 'next/image'

type FeaturesSectionProps = {
  scrollY: number
}

export const FeaturesSection = ({ scrollY }: FeaturesSectionProps) => (
  <section id="features" className="relative bg-bg py-24 md:py-32">
    <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" style={{ transform: `translateY(${scrollY * 0.05}px)` }} />
    <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" style={{ transform: `translateY(${scrollY * -0.04}px)` }} />

    <div className="relative mx-auto max-w-7xl px-6">
      <div className="text-center mb-20 reveal">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
          Features
        </span>
        <h2 className="mt-4 text-4xl font-extrabold md:text-5xl lg:text-6xl text-text">
          Everything You Need to{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Build & Grow</span>
        </h2>
        <p className="mt-6 text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
          From AI generation to visual editing to search optimization — one platform for your entire web presence.
        </p>
      </div>

      {/* Feature 1: AI-Powered — Full width */}
      <div className="reveal rounded-3xl border border-border bg-bg-secondary/50 p-8 md:p-12 mb-6 overflow-hidden group hover:border-primary/20 transition-all duration-500 hover-lift">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              AI-Powered
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-text mb-4">
              Describe It. <span className="text-primary">AI Builds It.</span>
            </h3>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              Type a description of your website in plain text. Our AI creates everything — layout, content, images, and code.
              Multi-page sites generated in under 60 seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Multi-page sites', 'SEO-optimized', 'Real content', 'Custom images'].map((tag) => (
                <span key={tag} className="rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-border bg-bg p-5 space-y-3">
              {/* Prompt card */}
              <div className="rounded-xl bg-bg-tertiary p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted">Your Prompt</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  &quot;Build a complete website for Cafe Bloom — a modern coffee shop. Include homepage with hero, about page, full menu with categories, online reservation system, blog, and contact page. Use warm earthy tones, latte art imagery, and make it SEO-optimized.&quot;
                </p>
              </div>
              {/* Generation progress */}
              <div className="rounded-xl bg-bg-tertiary/50 border border-primary/10 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-b from-primary to-secondary flex items-center justify-center">
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                  </div>
                  <span className="text-[10px] font-semibold text-primary">AI Generating...</span>
                  <span className="text-[8px] text-text-muted ms-auto">42s</span>
                </div>
                <div className="space-y-1">
                  {[
                    { step: 'Analyzing layout requirements', done: true },
                    { step: 'Generating 6 pages (Home, About, Menu, Reservations, Blog, Contact)', done: true },
                    { step: 'Creating responsive design system', done: true },
                    { step: 'Optimizing for SEO + Schema.org', done: true },
                    { step: 'Generating AI-matched imagery', done: true },
                    { step: 'Adding AI chatbot agent', done: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {s.done ? (
                        <svg className="h-3 w-3 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                      )}
                      <span className={`text-[9px] ${s.done ? 'text-text-muted' : 'text-primary font-medium'}`}>{s.step}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 h-1 rounded-full bg-bg-tertiary overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: '85%' }} />
                </div>
              </div>
              {/* Result: multi-page browser */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-1.5 bg-bg-tertiary px-3 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                  <div className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
                  <div className="h-2 w-2 rounded-full bg-[#28C840]" />
                  <span className="ms-2 text-[8px] text-text-muted">cafebloom.ubuilder.co</span>
                </div>
                {/* Page tabs */}
                <div className="flex items-center gap-0 border-b border-border bg-bg-tertiary/50 px-2">
                  {['Home', 'About', 'Menu', 'Reservations', 'Blog', 'Contact'].map((tab, i) => (
                    <span key={tab} className={`text-[8px] px-2.5 py-1.5 font-medium border-b-2 ${i === 0 ? 'text-primary border-primary' : 'text-text-muted border-transparent'}`}>{tab}</span>
                  ))}
                </div>
                {/* CSS website preview */}
                <div className="h-40 bg-[#2C1810] relative overflow-hidden">
                  {/* Nav */}
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#1A0E08]/80">
                    <span className="text-[9px] font-bold text-amber-200">Cafe Bloom</span>
                    <div className="flex gap-2 text-[7px] text-amber-100/60">
                      <span>Menu</span><span>Reserve</span><span>About</span><span>Blog</span>
                    </div>
                  </div>
                  {/* Hero */}
                  <div className="px-3 py-3 bg-gradient-to-br from-[#3B2012] to-[#1A0E08]">
                    <div className="text-[7px] text-amber-400 uppercase tracking-wider mb-0.5">Est. 2020</div>
                    <div className="text-[12px] font-bold text-amber-50 leading-tight mb-1">Where Every Cup<br/>Tells a Story</div>
                    <div className="text-[7px] text-amber-100/50 mb-2">Specialty coffee, house-made pastries, cozy vibes.</div>
                    <div className="flex gap-1">
                      <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[6px] font-semibold text-white">View Menu</span>
                      <span className="rounded-full border border-amber-600/50 px-2 py-0.5 text-[6px] font-semibold text-amber-200">Reserve Table</span>
                    </div>
                  </div>
                  {/* Featured items row */}
                  <div className="px-3 py-2 bg-[#1A0E08]">
                    <div className="text-[7px] text-amber-300 font-semibold mb-1">Popular Today</div>
                    <div className="flex gap-1.5">
                      {[
                        { name: 'Flat White', price: '$4.50', color: 'bg-amber-900/40' },
                        { name: 'Croissant', price: '$3.80', color: 'bg-amber-800/40' },
                        { name: 'Matcha Latte', price: '$5.20', color: 'bg-green-900/40' },
                        { name: 'Avocado Toast', price: '$8.90', color: 'bg-amber-700/40' },
                      ].map((item) => (
                        <div key={item.name} className={`flex-1 ${item.color} rounded p-1.5 text-center`}>
                          <div className="text-[7px] text-amber-100 font-medium">{item.name}</div>
                          <div className="text-[7px] text-amber-400 font-bold">{item.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features 2 & 3 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="reveal from-left rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500 hover-lift">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary mb-4">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Visual Editor
          </div>
          <h3 className="text-2xl font-bold text-text mb-3">Click to Edit. Chat to Change.</h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            Click any element to edit visually. Or tell the AI what to change. Real-time preview with instant updates.
          </p>
          <div className="rounded-xl border border-border overflow-hidden bg-bg">
            <div className="h-52 flex">
              {/* Left sidebar: Elements */}
              <div className="w-16 border-e border-border bg-bg-secondary/50 p-1.5 flex flex-col gap-1">
                <div className="text-[7px] font-semibold text-text-muted uppercase tracking-wider px-0.5 mb-0.5">Elements</div>
                {[
                  { icon: 'T', name: 'Text' },
                  { icon: '\u25A2', name: 'Image' },
                  { icon: '\u25C9', name: 'Button' },
                  { icon: '\u2630', name: 'Form' },
                  { icon: '\u229E', name: 'Grid' },
                  { icon: '\u25B6', name: 'Video' },
                ].map((el) => (
                  <div key={el.name} className="flex items-center gap-1 px-1 py-1 rounded bg-bg-tertiary/50 hover:bg-bg-tertiary cursor-pointer">
                    <span className="text-[9px] text-text-muted w-3 text-center">{el.icon}</span>
                    <span className="text-[7px] text-text-muted">{el.name}</span>
                  </div>
                ))}
                <div className="mt-auto text-[7px] font-semibold text-text-muted uppercase tracking-wider px-0.5">Layers</div>
                {['Hero', 'Heading', 'Subtext', 'CTA Btn'].map((l, i) => (
                  <div key={l} className={`text-[7px] px-1 py-0.5 rounded truncate ${i === 1 ? 'bg-primary/10 text-primary font-medium' : 'text-text-muted'}`}>{l}</div>
                ))}
              </div>
              {/* Canvas */}
              <div className="flex-1 bg-bg-tertiary/30 p-2 relative overflow-hidden">
                <div className="rounded-lg bg-bg border border-border p-3 h-full relative">
                  <div className="text-[7px] text-text-muted uppercase tracking-wider mb-1">Hero Section</div>
                  {/* Selected element with handles */}
                  <div className="border-2 border-dashed border-primary rounded p-1.5 relative mb-1.5">
                    <div className="text-[11px] font-bold text-text leading-tight">Build Beautiful Websites</div>
                    {/* Selection handles */}
                    <div className="absolute -top-1 -start-1 h-2 w-2 rounded-full bg-primary border border-bg" />
                    <div className="absolute -top-1 -end-1 h-2 w-2 rounded-full bg-primary border border-bg" />
                    <div className="absolute -bottom-1 -start-1 h-2 w-2 rounded-full bg-primary border border-bg" />
                    <div className="absolute -bottom-1 -end-1 h-2 w-2 rounded-full bg-primary border border-bg" />
                    <div className="absolute -top-4 start-0 bg-primary text-[6px] text-white px-1 py-0.5 rounded">Heading</div>
                  </div>
                  <div className="text-[8px] text-text-muted mb-2 leading-relaxed">Your perfect website, powered by AI. Click to edit any element.</div>
                  <div className="flex gap-1">
                    <span className="rounded bg-primary px-2 py-0.5 text-[7px] font-semibold text-white">Get Started</span>
                    <span className="rounded border border-border px-2 py-0.5 text-[7px] text-text-muted">Learn More</span>
                  </div>
                  {/* Grid guide lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 start-1/2 h-full border-s border-primary/10 border-dashed" />
                  </div>
                </div>
              </div>
              {/* Right sidebar: Properties */}
              <div className="w-20 border-s border-border bg-bg-secondary/50 p-1.5 space-y-1.5 overflow-hidden">
                <div className="text-[7px] font-semibold text-text-muted uppercase tracking-wider">Properties</div>
                <div>
                  <div className="text-[6px] text-text-muted mb-0.5">Font Size</div>
                  <div className="flex items-center gap-1 bg-bg-tertiary rounded px-1 py-0.5">
                    <span className="text-[8px] text-text">24px</span>
                  </div>
                </div>
                <div>
                  <div className="text-[6px] text-text-muted mb-0.5">Font Weight</div>
                  <div className="flex items-center gap-1 bg-bg-tertiary rounded px-1 py-0.5">
                    <span className="text-[8px] text-text">Bold</span>
                  </div>
                </div>
                <div>
                  <div className="text-[6px] text-text-muted mb-0.5">Color</div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded bg-text border border-border" />
                    <span className="text-[7px] text-text-muted">#FFFFFF</span>
                  </div>
                </div>
                <div>
                  <div className="text-[6px] text-text-muted mb-0.5">Padding</div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {['8', '16', '8', '16'].map((v, i) => (
                      <div key={i} className="bg-bg-tertiary rounded px-1 py-0.5 text-[7px] text-text-muted text-center">{v}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[6px] text-text-muted mb-0.5">Colors</div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded bg-primary" />
                    <div className="h-3 w-3 rounded bg-secondary" />
                    <div className="h-3 w-3 rounded bg-accent" />
                  </div>
                </div>
              </div>
            </div>
            {/* Bottom AI prompt bar */}
            <div className="border-t border-border px-3 py-1.5 flex items-center gap-2 bg-bg-secondary/30">
              <svg className="h-3.5 w-3.5 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
              <span className="text-[9px] text-text-muted animate-typing-cursor">&quot;Make this heading larger and bolder&quot;</span>
            </div>
          </div>
        </div>

        <div className="reveal from-right rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500 hover-lift">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-4">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            AI Images
          </div>
          <h3 className="text-2xl font-bold text-text mb-3">Generate Stunning Visuals</h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            Generate images, icons, backgrounds, and logos. Every visual element is customizable and on-brand.
          </p>
          <div className="rounded-xl border border-border bg-bg overflow-hidden">
            {/* Prompt input */}
            <div className="px-3 py-2 border-b border-border flex items-center gap-2">
              <svg className="h-3.5 w-3.5 text-accent shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
              <span className="text-[9px] text-text-muted flex-1 truncate">&quot;Generate hero image for luxury spa, zen garden, warm lighting, soft tones&quot;</span>
              <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-medium shrink-0">Generate</span>
            </div>
            {/* Style selector */}
            <div className="px-3 py-1.5 border-b border-border flex items-center gap-1">
              <span className="text-[7px] text-text-muted me-1">Style:</span>
              {['Photorealistic', 'Illustration', 'Abstract', 'Minimalist'].map((s, i) => (
                <span key={s} className={`text-[7px] px-1.5 py-0.5 rounded-full font-medium ${i === 0 ? 'bg-accent/20 text-accent' : 'bg-bg-tertiary text-text-muted'}`}>{s}</span>
              ))}
            </div>
            {/* 2x2 Results grid */}
            <div className="grid grid-cols-2 gap-1.5 p-2">
              {[
                { gradient: 'from-emerald-800 via-teal-700 to-emerald-900', label: 'Zen Garden' },
                { gradient: 'from-amber-700 via-orange-600 to-amber-800', label: 'Warm Glow' },
                { gradient: 'from-slate-600 via-stone-500 to-slate-700', label: 'Stone Path' },
                { gradient: 'from-sky-700 via-cyan-600 to-sky-800', label: 'Water Flow' },
              ].map((img, i) => (
                <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden group/img">
                  <div className={`absolute inset-0 bg-gradient-to-br ${img.gradient}`} />
                  {/* Abstract shapes for visual interest */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/4 start-1/4 h-8 w-8 rounded-full bg-white/20 blur-sm" />
                    <div className="absolute bottom-1/3 end-1/3 h-6 w-10 rounded-full bg-white/10 blur-md" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                    <div className="text-[7px] text-white font-medium">{img.label}</div>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-1 opacity-0 group-hover/img:opacity-100">
                    <span className="text-[7px] bg-white/90 text-gray-800 px-1.5 py-0.5 rounded font-medium">Use This</span>
                    <span className="text-[7px] bg-white/20 text-white px-1.5 py-0.5 rounded font-medium backdrop-blur-sm">Regenerate</span>
                  </div>
                  {i === 0 && <div className="absolute top-1 end-1 text-[6px] bg-accent/90 text-white px-1 py-0.5 rounded font-medium">Best Match</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features 4 & 5 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="reveal from-left reveal-delay-1 rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500 hover-lift">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success mb-4">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Scanner
          </div>
          <h3 className="text-2xl font-bold text-text mb-3">Scan & Clone Any Website</h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            Paste any URL. Our AI analyzes the design DNA — colors, fonts, layout — and creates an improved version.
          </p>
          <div className="rounded-xl bg-bg p-4 border border-border space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-bg-tertiary px-3 py-2.5 border border-border">
              <svg className="h-4 w-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.507a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.257" /></svg>
              <span className="text-xs text-text-muted">https://competitor-site.com</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['Colors', 'Fonts', 'Layout', 'Content'].map((item, i) => (
                <div key={item} className="text-center">
                  <div className={`h-8 w-8 mx-auto rounded-lg flex items-center justify-center mb-1 ${i === 0 ? 'bg-primary/20' : i === 1 ? 'bg-secondary/20' : i === 2 ? 'bg-accent/20' : 'bg-success/20'}`}>
                    <svg className={`h-4 w-4 ${i === 0 ? 'text-primary' : i === 1 ? 'text-secondary' : i === 2 ? 'text-accent' : 'text-success'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-[9px] text-text-muted">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-success font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-success" />
              DNA extraction complete — ready to improve
            </div>
          </div>
        </div>

        <div className="reveal from-right reveal-delay-1 rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500 hover-lift">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary mb-4">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            GSO
          </div>
          <h3 className="text-2xl font-bold text-text mb-3">Generative Search Optimization</h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            Not just SEO. Optimize for ChatGPT, Google AI Overviews, Perplexity, and all AI search engines.
          </p>
          <div className="rounded-xl bg-bg p-6 border border-border flex items-center justify-center">
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-bg-tertiary" />
                  <circle cx="50" cy="50" r="40" fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray="251" strokeDashoffset="62" className="text-success animate-score" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-text">92</span>
                  <span className="text-[9px] text-text-muted">GSO Score</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-[10px]">
                <span className="flex items-center gap-1 text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />SEO: 95</span>
                <span className="flex items-center gap-1 text-secondary"><span className="h-1.5 w-1.5 rounded-full bg-secondary" />AI: 89</span>
                <span className="flex items-center gap-1 text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Schema: 92</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features 6, 7, 8 */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            badge: 'i18n', badgeColor: 'bg-primary/10 text-primary',
            icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            title: '12+ Languages & RTL',
            desc: 'Full RTL support. Hebrew, Arabic, English, and more. One click to translate your entire site.',
            visual: (
              <div className="flex flex-wrap gap-2">
                {['EN', 'HE', 'AR', 'FR', 'DE', 'ES', 'RU', 'ZH'].map((lang) => (
                  <span key={lang} className="rounded-md bg-bg-tertiary px-2 py-1 text-[10px] font-bold text-text-muted hover:bg-primary/10 hover:text-primary transition-colors cursor-default">
                    {lang}
                  </span>
                ))}
              </div>
            ),
          },
          {
            badge: 'AI Agent', badgeColor: 'bg-accent/10 text-accent',
            icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
            title: 'Built-in CRM & AI Chat',
            desc: 'AI chatbot for your visitors. Collect leads, book appointments, answer questions — 24/7.',
            visual: (
              <div className="rounded-xl bg-bg p-3 border border-border space-y-2">
                <div className="flex gap-2">
                  <div className="h-5 w-5 rounded-full bg-accent/20 shrink-0 flex items-center justify-center">
                    <span className="text-[8px]">?</span>
                  </div>
                  <div className="rounded-lg bg-bg-tertiary px-2.5 py-1.5 text-[10px] text-text-secondary">
                    Do you offer free delivery?
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-[10px] text-primary max-w-[80%]">
                    Yes! Free delivery on orders over $50. Would you like to browse our menu?
                  </div>
                </div>
              </div>
            ),
          },
          {
            badge: 'Commerce', badgeColor: 'bg-success/10 text-success',
            icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z',
            title: 'E-commerce & Payments',
            desc: 'Built-in online store. Accept payments with Stripe & PayPlus. No extra plugins needed.',
            visual: (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="relative h-28">
                  <Image src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80" alt="E-commerce store" fill className="object-cover" sizes="300px" />
                </div>
                <div className="bg-bg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-text">Premium Bundle</div>
                      <div className="text-sm font-bold text-primary">$49.99</div>
                    </div>
                    <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ].map((feat, i) => (
          <div key={feat.title} className={`reveal reveal-delay-${i + 1} rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500 hover-lift`}>
            <div className={`inline-flex items-center gap-2 rounded-full ${feat.badgeColor} px-3 py-1 text-xs font-semibold mb-4`}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} /></svg>
              {feat.badge}
            </div>
            <h3 className="text-xl font-bold text-text mb-3">{feat.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">{feat.desc}</p>
            {feat.visual}
          </div>
        ))}
      </div>
    </div>
  </section>
)
