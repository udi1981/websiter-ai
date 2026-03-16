import Image from 'next/image'

export const HowItWorks = () => (
  <section id="how-it-works" className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[150px]" />
    <div className="relative mx-auto max-w-7xl px-6">
      <div className="text-center mb-20 reveal">
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wider mb-4">
          How It Works
        </span>
        <h2 className="mt-4 text-4xl font-extrabold md:text-5xl lg:text-6xl text-text">
          Three Steps to{' '}
          <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Your Website</span>
        </h2>
        <p className="mt-6 text-text-secondary max-w-xl mx-auto text-lg">
          From idea to published website in under 60 seconds. No coding, no templates — just AI.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          {
            num: '1', title: 'Describe Your Vision', color: 'from-primary to-primary-hover', shadowColor: 'shadow-primary/20',
            desc: 'Type, speak, or upload an image. Describe any website you can imagine.',
            visual: (
              <div className="rounded-xl bg-bg-tertiary p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  <svg className="h-4 w-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.507a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.257" /></svg>
                </div>
                <div className="h-px bg-border mb-2" />
                <p className="text-[11px] text-text-muted">&quot;A modern SaaS landing page with pricing table, feature grid, and dark mode...&quot;</p>
              </div>
            ),
          },
          {
            num: '2', title: 'AI Generates Everything', color: 'from-secondary to-primary', shadowColor: 'shadow-secondary/20',
            desc: 'Our AI creates pages, content, images, and optimized code in real-time.',
            visual: (
              <div className="rounded-xl bg-bg-tertiary p-4 border border-border space-y-2">
                {[
                  { name: 'index.html', status: 'Created', color: 'text-success' },
                  { name: 'styles.css', status: 'Generated', color: 'text-secondary' },
                  { name: 'hero-image.webp', status: 'AI Generated', color: 'text-primary' },
                  { name: 'schema.json', status: 'Optimized', color: 'text-accent' },
                ].map((file) => (
                  <div key={file.name} className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted font-mono">{file.name}</span>
                    <span className={`${file.color} font-medium`}>{file.status}</span>
                  </div>
                ))}
                <div className="mt-2 h-1.5 rounded-full bg-bg overflow-hidden">
                  <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-primary to-secondary" />
                </div>
              </div>
            ),
          },
          {
            num: '3', title: 'Publish & Go Live', color: 'from-success to-secondary', shadowColor: 'shadow-success/20',
            desc: 'Publish instantly with a custom domain. Your site is live, fast, and SEO-ready.',
            visual: (
              <div className="rounded-xl bg-bg-tertiary p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-[11px] font-semibold text-success">Live</span>
                  <span className="text-[11px] text-text-muted ms-auto font-mono">yourdomain.com</span>
                </div>
                <div className="relative h-24 rounded-lg overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80" alt="Published website" fill className="object-cover" sizes="300px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-tertiary/80 to-transparent" />
                </div>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-text-muted">
                  <span className="flex items-center gap-1"><span className="text-success">SSL</span></span>
                  <span className="flex items-center gap-1"><span className="text-secondary">CDN</span></span>
                  <span className="flex items-center gap-1"><span className="text-primary">SEO</span></span>
                </div>
              </div>
            ),
          },
        ].map((step, i) => (
          <div key={step.num} className={`reveal reveal-delay-${i + 1} relative group`}>
            <div className="rounded-2xl border border-border bg-bg p-8 hover:border-primary/30 transition-all duration-300 h-full hover-lift">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-2xl font-extrabold text-white mb-6 shadow-lg ${step.shadowColor}`}>
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-text mb-3">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">{step.desc}</p>
              {step.visual}
            </div>
            {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/50 to-transparent" />}
          </div>
        ))}
      </div>
    </div>
  </section>
)
