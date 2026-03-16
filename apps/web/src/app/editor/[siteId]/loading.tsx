const EditorLoading = () => {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Toolbar skeleton */}
      <div className="h-14 border-b border-border bg-bg-secondary flex items-center px-4 gap-4">
        <div className="h-8 w-8 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-5 w-40 bg-bg-tertiary rounded animate-pulse" />
        <div className="flex-1" />
        <div className="h-8 w-20 bg-bg-tertiary rounded animate-pulse" />
        <div className="h-8 w-20 bg-bg-tertiary rounded animate-pulse" />
      </div>

      <div className="flex-1 flex">
        {/* Side panel skeleton */}
        <div className="hidden lg:block w-72 border-e border-border bg-bg-secondary p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-bg-tertiary rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Canvas skeleton */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-4xl space-y-6">
            <div className="h-64 bg-bg-secondary rounded-lg animate-pulse" />
            <div className="h-48 bg-bg-secondary rounded-lg animate-pulse" />
            <div className="h-32 bg-bg-secondary rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorLoading
