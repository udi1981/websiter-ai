'use client'

type TabItem = {
  label: string
  value: string
  content: React.ReactNode
}

type TabsProps = {
  items: TabItem[]
  activeTab: string
  onChange: (value: string) => void
  className?: string
}

/** Controlled tabs component with tab buttons and content panels */
export const Tabs = ({ items, activeTab, onChange, className = '' }: TabsProps) => {
  return (
    <div className={className}>
      <div className="flex border-b border-border" role="tablist">
        {items.map((item) => (
          <button
            key={item.value}
            role="tab"
            aria-selected={activeTab === item.value}
            onClick={() => onChange(item.value)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === item.value
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text hover:border-border'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="pt-4" role="tabpanel">
        {items.find((item) => item.value === activeTab)?.content}
      </div>
    </div>
  )
}
