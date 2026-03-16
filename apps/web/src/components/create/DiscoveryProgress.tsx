'use client'

type DiscoveryProgressProps = {
  current: number
  total: number
}

export const DiscoveryProgress = ({ current, total }: DiscoveryProgressProps) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 rounded-full bg-bg-tertiary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-text-muted shrink-0">
        {current}/{total}
      </span>
    </div>
  )
}
