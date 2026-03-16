'use client'

const EditorError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error/10 mb-6">
          <svg
            className="w-8 h-8 text-error"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">Editor failed to load</h1>
        <p className="text-text-muted mb-8">
          We could not load the editor for this site. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-text-secondary font-medium hover:bg-bg-secondary transition-colors"
          >
            Back to Dashboard
          </a>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditorError
