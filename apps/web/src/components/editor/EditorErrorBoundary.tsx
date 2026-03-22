'use client'

import React from 'react'

type EditorErrorBoundaryProps = {
  children: React.ReactNode
}

type EditorErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary for the editor — catches render errors and shows a recovery UI
 * instead of a blank screen. Uses class component as required by React error boundaries.
 */
class EditorErrorBoundary extends React.Component<EditorErrorBoundaryProps, EditorErrorBoundaryState> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[EditorErrorBoundary] Caught error:', error)
    console.error('[EditorErrorBoundary] Component stack:', errorInfo.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-[#0d1117]">
          <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
            {/* Error icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
              <p className="text-sm text-white/40 leading-relaxed">
                The editor encountered an unexpected error. Your work has been saved automatically.
              </p>
            </div>

            {/* Error details (collapsed) */}
            {this.state.error && (
              <div className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
                <p className="text-xs text-white/20 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export { EditorErrorBoundary }
