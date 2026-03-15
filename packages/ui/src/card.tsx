type CardProps = {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const Card = ({ children, className = '', padding = 'md' }: CardProps) => {
  return (
    <div className={`rounded-xl border border-border bg-bg shadow-sm ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  )
}
