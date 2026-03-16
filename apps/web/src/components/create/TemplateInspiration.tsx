'use client'

import { useState } from 'react'

type TemplateCategory = 'all' | 'restaurant' | 'saas' | 'ecommerce' | 'portfolio' | 'business' | 'blog' | 'dental' | 'yoga' | 'law' | 'realestate' | 'fitness' | 'photography'

export type TemplateItem = {
  id: string
  name: string
  category: TemplateCategory
  pages: number
  seedText: string
  color: string
}

export const templateData: TemplateItem[] = [
  { id: 'restaurant', name: 'Saffron & Thyme', category: 'restaurant', pages: 5, seedText: 'A Mediterranean bistro restaurant with menu showcase, chef profiles, reservations, and gallery', color: 'from-amber-500 to-orange-600' },
  { id: 'saas', name: 'Metrica SaaS', category: 'saas', pages: 4, seedText: 'A data orchestration SaaS platform with pricing plans, feature highlights, integrations, and demo booking', color: 'from-primary to-indigo-600' },
  { id: 'ecommerce', name: 'ATELIER Store', category: 'ecommerce', pages: 6, seedText: 'A minimalist lifestyle e-commerce store with product catalog, collections, cart, and brand story', color: 'from-emerald-500 to-teal-600' },
  { id: 'portfolio', name: 'Creative Portfolio', category: 'portfolio', pages: 3, seedText: 'A creative director portfolio showcasing projects, case studies, skills, and contact', color: 'from-secondary to-blue-600' },
  { id: 'business', name: 'Vantage Studio', category: 'business', pages: 5, seedText: 'A brand strategy consultancy with services, case studies, team, and client testimonials', color: 'from-slate-500 to-zinc-700' },
  { id: 'blog', name: 'The Inkwell Blog', category: 'blog', pages: 4, seedText: 'A culture and ideas editorial blog with article listings, categories, newsletter signup, and about page', color: 'from-amber-400 to-yellow-600' },
  { id: 'dental', name: 'PearlCare Dental', category: 'dental', pages: 5, seedText: 'A dental clinic website with services, team profiles, appointment booking, patient testimonials, and location', color: 'from-sky-400 to-cyan-600' },
  { id: 'yoga', name: 'Lotus Path Wellness', category: 'yoga', pages: 5, seedText: 'A holistic wellness and yoga studio with class schedule, instructor profiles, pricing, and retreat info', color: 'from-lime-400 to-green-600' },
  { id: 'law', name: 'Prescott & Associates', category: 'law', pages: 4, seedText: 'A civil litigation law firm with practice areas, attorney profiles, case results, and consultation booking', color: 'from-slate-400 to-gray-600' },
  { id: 'realestate', name: 'Horizon Properties', category: 'realestate', pages: 5, seedText: 'A luxury real estate agency with property listings, agent profiles, market stats, and virtual tours', color: 'from-yellow-400 to-amber-600' },
  { id: 'fitness', name: 'Summit Fit', category: 'fitness', pages: 4, seedText: 'A performance training gym with programs, coach profiles, membership pricing, and transformation gallery', color: 'from-red-500 to-rose-600' },
  { id: 'photography', name: 'Ember Studio', category: 'photography', pages: 3, seedText: 'A fine art and wedding photography studio with portfolio galleries, packages, and booking info', color: 'from-violet-500 to-purple-600' },
]

export const categories: { id: TemplateCategory; label: string; labelHe: string }[] = [
  { id: 'all', label: 'All', labelHe: 'הכל' },
  { id: 'restaurant', label: 'Restaurant', labelHe: 'מסעדה' },
  { id: 'saas', label: 'SaaS', labelHe: 'SaaS' },
  { id: 'ecommerce', label: 'E-commerce', labelHe: 'חנות' },
  { id: 'portfolio', label: 'Portfolio', labelHe: 'תיק עבודות' },
  { id: 'business', label: 'Business', labelHe: 'עסקי' },
  { id: 'blog', label: 'Blog', labelHe: 'בלוג' },
  { id: 'dental', label: 'Dental', labelHe: 'מרפאה' },
  { id: 'yoga', label: 'Wellness', labelHe: 'בריאות' },
  { id: 'law', label: 'Legal', labelHe: 'משפטים' },
  { id: 'realestate', label: 'Real Estate', labelHe: 'נדל"ן' },
  { id: 'fitness', label: 'Fitness', labelHe: 'כושר' },
  { id: 'photography', label: 'Photography', labelHe: 'צילום' },
]

type TemplateInspirationProps = {
  selectedId: string | null
  onSelect: (template: TemplateItem) => void
}

export const TemplateInspiration = ({ selectedId, onSelect }: TemplateInspirationProps) => {
  const [activeFilter, setActiveFilter] = useState<TemplateCategory>('all')

  const filtered = activeFilter === 'all'
    ? templateData
    : templateData.filter((t) => t.category === activeFilter)

  return (
    <div>
      {/* Section Header — matches landing page style */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent uppercase tracking-wider mb-4">
          Templates
        </span>
        <h2 className="mt-2 text-2xl font-extrabold md:text-3xl text-text">
          Choose a Starting Point
        </h2>
        <p className="mt-3 text-text-secondary max-w-md mx-auto text-sm">
          בחר תבנית להשראה / Every template is AI-generated with live preview
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
        {categories.map((cat) => {
          const isActive = activeFilter === cat.id
          const count = cat.id === 'all'
            ? templateData.length
            : templateData.filter((t) => t.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'border border-border bg-bg-secondary text-text-muted hover:border-primary/30 hover:text-text'
              }`}
            >
              {cat.label}
              <span className={`ms-1.5 ${isActive ? 'text-white/70' : 'text-text-muted/50'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Template Grid — identical to landing page */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((template) => {
          const isSelected = selectedId === template.id

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`group rounded-2xl border bg-bg overflow-hidden text-start transition-all duration-500 ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/30 shadow-2xl shadow-primary/10'
                  : 'border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10'
              }`}
            >
              {/* Device Frame Preview */}
              <div className="relative p-4 pb-0">
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
                      src={`/templates/${template.id}/index.html`}
                      className="absolute inset-0 w-[200%] h-[200%] border-0 pointer-events-none"
                      style={{ transform: 'scale(0.5)', transformOrigin: 'top left' }}
                      title={`${template.name} preview`}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Mobile Frame - floating to the right */}
                <div className="absolute -bottom-1 end-6 w-[60px] rounded-lg border-2 border-white/15 bg-[#1a1a2e] overflow-hidden shadow-xl">
                  <div className="h-1.5 bg-[#12121f] flex items-center justify-center">
                    <div className="w-4 h-0.5 rounded-full bg-white/10" />
                  </div>
                  <div className="relative h-[100px] overflow-hidden">
                    <iframe
                      src={`/templates/${template.id}/index.html`}
                      className="absolute inset-0 border-0 pointer-events-none"
                      style={{ width: '375px', height: '667px', transform: 'scale(0.16)', transformOrigin: 'top left' }}
                      title={`${template.name} mobile`}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* AI Bot Badge */}
                <div className="absolute top-6 end-6 flex items-center gap-1 rounded-full bg-primary/90 backdrop-blur-sm px-2 py-1 shadow-lg">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-[8px] font-bold text-white">AI Bot</span>
                </div>

                {/* Selected check overlay */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[2px] rounded-t-2xl">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
                      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                {!isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px] rounded-t-2xl">
                    <span className="rounded-full bg-white/95 px-6 py-2.5 text-xs font-bold text-gray-900 shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Use Template
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer — matches landing page */}
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-text">{template.name}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{template.pages} pages</p>
                </div>
                <span className={`inline-block bg-gradient-to-r ${template.color} rounded-full px-3 py-1 text-[10px] font-bold text-white`}>
                  {categories.find(c => c.id === template.category)?.label || template.category}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
