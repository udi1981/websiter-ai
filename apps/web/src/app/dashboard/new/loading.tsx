const NewSiteLoading = () => {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-8">
        {/* Title skeleton */}
        <div className="text-center space-y-3">
          <div className="h-8 w-64 bg-bg-tertiary rounded-lg animate-pulse mx-auto" />
          <div className="h-4 w-96 bg-bg-tertiary rounded-lg animate-pulse mx-auto max-w-full" />
        </div>

        {/* Input area skeleton */}
        <div className="rounded-lg border border-border bg-bg-secondary p-6 space-y-4">
          <div className="h-12 bg-bg-tertiary rounded-lg animate-pulse" />
          <div className="h-12 bg-bg-tertiary rounded-lg animate-pulse" />
        </div>

        {/* Template grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-bg-tertiary animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default NewSiteLoading
