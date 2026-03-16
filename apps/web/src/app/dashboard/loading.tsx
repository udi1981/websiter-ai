const DashboardLoading = () => {
  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-bg-tertiary rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-72 bg-bg-tertiary rounded-lg animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-bg-secondary overflow-hidden"
          >
            <div className="h-40 bg-bg-tertiary animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-bg-tertiary rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-bg-tertiary rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardLoading
