const LoginLoading = () => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo skeleton */}
        <div className="flex justify-center">
          <div className="h-10 w-32 bg-bg-tertiary rounded-lg animate-pulse" />
        </div>

        {/* Form skeleton */}
        <div className="rounded-lg border border-border bg-bg-secondary p-6 space-y-4">
          <div className="h-6 w-24 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-11 bg-bg-tertiary rounded-lg animate-pulse" />
          <div className="h-11 bg-bg-tertiary rounded-lg animate-pulse" />
          <div className="h-11 bg-bg-tertiary rounded-lg animate-pulse" />
          <div className="h-px bg-border" />
          <div className="h-11 bg-bg-tertiary rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default LoginLoading
