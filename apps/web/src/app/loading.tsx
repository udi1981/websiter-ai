const GlobalLoading = () => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    </div>
  )
}

export default GlobalLoading
