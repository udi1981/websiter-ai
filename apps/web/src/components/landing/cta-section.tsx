import Link from 'next/link'

export const CTASection = () => (
  <section className="relative border-t border-border overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-bg to-secondary/20 animate-gradient" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-primary/15 blur-[120px]" />
    <div className="absolute bottom-0 right-[20%] h-[300px] w-[300px] rounded-full bg-secondary/10 blur-[100px]" />

    <div className="relative mx-auto max-w-4xl px-6 py-24 md:py-32 text-center reveal">
      <h2 className="text-4xl font-extrabold md:text-5xl lg:text-6xl text-text mb-6">
        Ready to Build Something{' '}
        <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">Amazing</span>?
      </h2>
      <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">
        Join 50,000+ businesses building beautiful websites with AI. Start free — no credit card required.
      </p>

      <form className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-6" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full sm:flex-1 rounded-xl border border-border bg-bg-secondary/80 px-5 py-3.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        <Link
          href="/login"
          className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-primary-hover px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 whitespace-nowrap"
        >
          Get Started Free
        </Link>
      </form>
      <p className="text-xs text-text-muted">
        No credit card required. Free forever for 1 site.
      </p>
    </div>
  </section>
)
