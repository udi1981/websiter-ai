'use client'

import Link from 'next/link'
import { useState } from 'react'

export const TemplatesSection = () => {
  const [previewTemplate, setPreviewTemplate] = useState<number | null>(null)

  const templates = [
    { name: 'Saffron & Thyme', category: 'Restaurant', slug: 'restaurant', color: 'from-amber-500 to-orange-600' },
    { name: 'Metrica SaaS', category: 'SaaS', slug: 'saas', color: 'from-primary to-indigo-600' },
    { name: 'ATELIER Store', category: 'E-commerce', slug: 'ecommerce', color: 'from-emerald-500 to-teal-600' },
    { name: 'Creative Portfolio', category: 'Portfolio', slug: 'portfolio', color: 'from-secondary to-blue-600' },
    { name: 'Vantage Studio', category: 'Business', slug: 'business', color: 'from-slate-500 to-zinc-700' },
    { name: 'PearlCare Dental', category: 'Dental', slug: 'dental', color: 'from-sky-400 to-cyan-600' },
  ]

  return (
    <section id="templates" className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-16 reveal">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent uppercase tracking-wider mb-4">
            Templates
          </span>
          <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
            See What Our AI Can Build
          </h2>
          <p className="mt-6 text-text-secondary max-w-xl mx-auto text-lg">
            Every template is AI-generated. Click to preview the real site — desktop, mobile, and AI chatbot included.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, i) => (
            <div key={template.name} className={`reveal reveal-delay-${(i % 3) + 1} group rounded-2xl border border-border bg-bg overflow-hidden hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500`}>
              {/* Device Frame Preview */}
              <div className="relative cursor-pointer p-4 pb-0" onClick={() => setPreviewTemplate(previewTemplate === i ? null : i)}>
                {/* Desktop Frame */}
                <div className="relative rounded-t-lg border border-white/10 bg-[#1a1a2e] overflow-hidden shadow-2xl">
                  {/* Browser Chrome */}
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#12121f] border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="rounded-md bg-white/5 px-3 py-1 text-[9px] text-white/30 text-center truncate">
                        {template.name.toLowerCase().replace(/\s+/g, '')}.ubuilder.co
                      </div>
                    </div>
                  </div>
                  {/* Site Preview */}
                  <div className="relative h-44 overflow-hidden">
                    <iframe
                      src={`/templates/${template.slug}/index.html`}
                      className="absolute inset-0 w-[200%] h-[200%] border-0 pointer-events-none"
                      style={{ transform: 'scale(0.5)', transformOrigin: 'top left' }}
                      title={`${template.name} preview`}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Mobile Frame - floating to the right */}
                <div className="absolute -bottom-1 right-6 w-[60px] rounded-lg border-2 border-white/15 bg-[#1a1a2e] overflow-hidden shadow-xl">
                  <div className="h-1.5 bg-[#12121f] flex items-center justify-center">
                    <div className="w-4 h-0.5 rounded-full bg-white/10" />
                  </div>
                  <div className="relative h-[100px] overflow-hidden">
                    <iframe
                      src={`/templates/${template.slug}/index.html`}
                      className="absolute inset-0 border-0 pointer-events-none"
                      style={{ width: '375px', height: '667px', transform: 'scale(0.16)', transformOrigin: 'top left' }}
                      title={`${template.name} mobile`}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* AI Bot Badge */}
                <div className="absolute top-6 right-6 flex items-center gap-1 rounded-full bg-primary/90 backdrop-blur-sm px-2 py-1 shadow-lg">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-[8px] font-bold text-white">AI Bot</span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px] rounded-t-2xl">
                  <span className="rounded-full bg-white/95 px-6 py-2.5 text-xs font-bold text-gray-900 shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    Live Preview
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-text">{template.name}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{template.category}</p>
                </div>
                <span className={`inline-block bg-gradient-to-r ${template.color} rounded-full px-3 py-1 text-[10px] font-bold text-white`}>
                  {template.category}
                </span>
              </div>
            </div>
          ))}

          {/* Template Preview Modal — live iframe */}
          {previewTemplate !== null && (() => {
            const t = templates[previewTemplate]
            return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setPreviewTemplate(null)}>
                <div className="relative w-full max-w-6xl h-[85vh] rounded-2xl border border-white/10 bg-[#0d0d1a] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-white/5 px-6 py-3 bg-[#0a0a15]">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400/70 cursor-pointer hover:bg-red-400" onClick={() => setPreviewTemplate(null)} />
                        <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                        <div className="w-3 h-3 rounded-full bg-green-400/70" />
                      </div>
                      <div className="rounded-lg bg-white/5 px-4 py-1.5 text-xs text-white/40">
                        {t.name.toLowerCase().replace(/\s+/g, '')}.ubuilder.co
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href="/dashboard/new" className="rounded-full bg-gradient-to-r from-primary to-primary-hover px-5 py-2 text-xs font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all">
                        Use This Template
                      </Link>
                      <button onClick={() => setPreviewTemplate(null)} className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                  {/* Live Site Preview */}
                  <iframe
                    src={`/templates/${t.slug}/index.html`}
                    className="w-full border-0"
                    style={{ height: 'calc(85vh - 52px)' }}
                    title={`${t.name} full preview`}
                  />
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </section>
  )
}
