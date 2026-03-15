type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

type AvatarProps = {
  src?: string | null
  alt?: string
  fallback?: string
  size?: AvatarSize
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

/** Avatar with image or initials fallback */
export const Avatar = ({ src, alt = '', fallback, size = 'md', className = '' }: AvatarProps) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover ${sizeStyles[size]} ${className}`}
      />
    )
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium ${sizeStyles[size]} ${className}`}
      aria-label={alt}
    >
      {fallback ?? alt.charAt(0).toUpperCase()}
    </div>
  )
}
