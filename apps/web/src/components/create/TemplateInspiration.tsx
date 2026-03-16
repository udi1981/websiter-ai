'use client'

type TemplateCategory = 'all' | 'restaurant' | 'saas' | 'ecommerce' | 'portfolio' | 'business' | 'blog' | 'dental' | 'yoga' | 'law' | 'realestate' | 'fitness' | 'photography'

export type TemplateItem = {
  id: string
  name: string
  category: TemplateCategory
  pages: number
  seedText: string
}

export const templateData: TemplateItem[] = [
  { id: 'restaurant', name: 'Saffron & Thyme', category: 'restaurant', pages: 5, seedText: 'A Mediterranean bistro restaurant with menu showcase, chef profiles, reservations, and gallery' },
  { id: 'saas', name: 'Metrica SaaS', category: 'saas', pages: 4, seedText: 'A data orchestration SaaS platform with pricing plans, feature highlights, integrations, and demo booking' },
  { id: 'ecommerce', name: 'ATELIER Store', category: 'ecommerce', pages: 6, seedText: 'A minimalist lifestyle e-commerce store with product catalog, collections, cart, and brand story' },
  { id: 'portfolio', name: 'Creative Portfolio', category: 'portfolio', pages: 3, seedText: 'A creative director portfolio showcasing projects, case studies, skills, and contact' },
  { id: 'business', name: 'Vantage Studio', category: 'business', pages: 5, seedText: 'A brand strategy consultancy with services, case studies, team, and client testimonials' },
  { id: 'blog', name: 'The Inkwell Blog', category: 'blog', pages: 4, seedText: 'A culture and ideas editorial blog with article listings, categories, newsletter signup, and about page' },
  { id: 'dental', name: 'PearlCare Dental', category: 'dental', pages: 5, seedText: 'A dental clinic website with services, team profiles, appointment booking, patient testimonials, and location' },
  { id: 'yoga', name: 'Lotus Path Wellness', category: 'yoga', pages: 5, seedText: 'A holistic wellness and yoga studio with class schedule, instructor profiles, pricing, and retreat info' },
  { id: 'law', name: 'Prescott & Associates', category: 'law', pages: 4, seedText: 'A civil litigation law firm with practice areas, attorney profiles, case results, and consultation booking' },
  { id: 'realestate', name: 'Horizon Properties', category: 'realestate', pages: 5, seedText: 'A luxury real estate agency with property listings, agent profiles, market stats, and virtual tours' },
  { id: 'fitness', name: 'Summit Fit', category: 'fitness', pages: 4, seedText: 'A performance training gym with programs, coach profiles, membership pricing, and transformation gallery' },
  { id: 'photography', name: 'Ember Studio', category: 'photography', pages: 3, seedText: 'A fine art and wedding photography studio with portfolio galleries, packages, and booking info' },
]

export const categories: { id: TemplateCategory; label: string }[] = [
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

type TemplateInspirationProps = {
  selectedId: string | null
  onSelect: (template: TemplateItem) => void
}

export const TemplateInspiration = ({ selectedId, onSelect }: TemplateInspirationProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-text-muted mb-3">
        Or choose a template for inspiration
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {templateData.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`group relative overflow-hidden rounded-xl border transition-all text-start ${
              selectedId === template.id
                ? 'border-primary ring-1 ring-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {/* Iframe Preview */}
            <div className="relative h-32 overflow-hidden bg-bg-tertiary">
              <iframe
                src={`/templates/${template.id}/index.html`}
                title={template.name}
                sandbox="allow-same-origin"
                loading="lazy"
                className="border-0 pointer-events-none"
                style={{
                  transform: 'scale(0.2)',
                  transformOrigin: 'top left',
                  width: '500%',
                  height: '500%',
                }}
              />
              {selectedId === template.id && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {/* Info */}
            <div className="p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text truncate">{template.name}</span>
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${categoryColors[template.category] || ''}`}>
                  {template.category}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
