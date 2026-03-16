import Link from 'next/link'

export const PricingSection = () => (
  <section id="pricing" className="relative border-t border-border bg-bg py-24 md:py-32">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
    <div className="relative mx-auto max-w-7xl px-6">
      <div className="text-center mb-16 reveal">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
          Pricing
        </span>
        <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
          Simple, Transparent Pricing
        </h2>
        <p className="mt-6 text-text-secondary max-w-xl mx-auto text-lg">
          Start free. Upgrade when you need more power. No hidden fees.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Free */}
        <div className="reveal reveal-delay-1 rounded-2xl border border-border bg-bg-secondary p-8 hover:border-border-hover transition-all duration-300 hover-lift">
          <h3 className="text-lg font-bold text-text mb-2">Free</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-extrabold text-text">$0</span>
            <span className="text-text-muted text-sm">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            {['1 website', 'AI generation', '*.ubuilder.co domain', 'Basic analytics', 'Community support'].map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <svg className="h-4 w-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {feature}
              </li>
            ))}
          </ul>
          <Link href="/login" className="block w-full rounded-xl border border-border py-3 text-center text-sm font-semibold text-text hover:bg-bg-tertiary transition-colors">
            Get Started Free
          </Link>
        </div>

        {/* Pro */}
        <div className="reveal reveal-delay-2 relative rounded-2xl border-2 border-primary bg-bg-secondary p-8 shadow-xl shadow-primary/10 hover-lift">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1 text-xs font-bold text-white shadow-lg">
              Most Popular
            </span>
          </div>
          <h3 className="text-lg font-bold text-text mb-2">Pro</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-extrabold text-text">$19</span>
            <span className="text-text-muted text-sm">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            {['10 websites', 'Custom domains', 'Code export', 'AI Agent chatbot', 'GSO optimization', 'Priority support', 'Advanced analytics'].map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <svg className="h-4 w-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {feature}
              </li>
            ))}
          </ul>
          <Link href="/login" className="block w-full rounded-xl bg-gradient-to-r from-primary to-primary-hover py-3 text-center text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
            Start Free Trial
          </Link>
        </div>

        {/* Business */}
        <div className="reveal reveal-delay-3 rounded-2xl border border-border bg-bg-secondary p-8 hover:border-border-hover transition-all duration-300 hover-lift">
          <h3 className="text-lg font-bold text-text mb-2">Business</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-extrabold text-text">$49</span>
            <span className="text-text-muted text-sm">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            {['Unlimited websites', 'White label', 'API access', 'Team collaboration', 'SLA guarantee', 'Dedicated support', 'Custom integrations'].map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <svg className="h-4 w-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {feature}
              </li>
            ))}
          </ul>
          <Link href="/login" className="block w-full rounded-xl border border-border py-3 text-center text-sm font-semibold text-text hover:bg-bg-tertiary transition-colors">
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  </section>
)
