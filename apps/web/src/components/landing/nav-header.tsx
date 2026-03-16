'use client'

import Link from 'next/link'

type NavHeaderProps = {
  theme: 'dark' | 'light'
  toggleTheme: () => void
  headerScrolled: boolean
}

export const NavHeader = ({ theme, toggleTheme, headerScrolled }: NavHeaderProps) => (
  <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${headerScrolled ? 'border-border bg-bg/80 backdrop-blur-2xl shadow-lg shadow-black/5' : 'border-white/5 bg-bg/60 backdrop-blur-2xl'}`}>
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
          </svg>
        </div>
        <span className="text-xl font-extrabold text-text tracking-tight">UBuilder</span>
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
        <a href="#features" className="hover:text-text transition-colors duration-200">Features</a>
        <a href="#how-it-works" className="hover:text-text transition-colors duration-200">How It Works</a>
        <a href="#demo" className="hover:text-text transition-colors duration-200">Demo</a>
        <a href="#pricing" className="hover:text-text transition-colors duration-200">Pricing</a>
      </nav>
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-secondary hover:bg-bg-tertiary transition-all duration-300 hover:border-primary/30"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>
        <Link
          href="/login"
          className="hidden sm:inline-flex text-sm font-medium text-text-secondary hover:text-text transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/login"
          className="rounded-full bg-gradient-to-r from-primary to-primary-hover px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
        >
          Get Started Free
        </Link>
      </div>
    </div>
  </header>
)
