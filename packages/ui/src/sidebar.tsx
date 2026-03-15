'use client'

type SidebarProps = {
  expanded: boolean
  onToggle: () => void
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/** Collapsible sidebar with animated width transition */
export const Sidebar = ({ expanded, onToggle, header, footer, children, className = '' }: SidebarProps) => {
  return (
    <aside
      className={`flex flex-col border-e border-border bg-bg-secondary transition-all duration-300 ${
        expanded ? 'w-64' : 'w-16'
      } ${className}`}
    >
      {header && (
        <div className="flex items-center border-b border-border p-3">
          {header}
        </div>
      )}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        {children}
      </div>
      {footer && (
        <div className="border-t border-border p-3">
          {footer}
        </div>
      )}
      <button
        onClick={onToggle}
        className="border-t border-border p-3 text-text-secondary hover:bg-bg-tertiary hover:text-text transition-colors"
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`mx-auto transition-transform duration-300 ${expanded ? '' : 'rotate-180'}`}
        >
          <polyline points="11 17 6 12 11 7" />
          <polyline points="18 17 13 12 18 7" />
        </svg>
      </button>
    </aside>
  )
}
