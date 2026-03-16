type AIEngineSectionProps = {
  scrollY: number
}

export const AIEngineSection = ({ scrollY }: AIEngineSectionProps) => (
  <section className="relative border-t border-border bg-bg py-24 md:py-32">
    <div className="absolute top-0 right-[20%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" style={{ transform: `translateY(${scrollY * 0.03}px)` }} />
    <div className="relative mx-auto max-w-7xl px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="reveal from-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            AI Engine
          </span>
          <h2 className="text-4xl font-extrabold md:text-5xl text-text mb-6">
            Our AI Doesn&apos;t Just Build — <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">It Thinks</span>
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed mb-10">
            Powered by multiple AI models working together. Each task gets routed to the perfect model for speed, quality, and cost efficiency.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Generates multi-page websites',
              'Creates custom images & icons',
              'Writes SEO-optimized content',
              'Scans & improves competitor sites',
              'Optimizes for AI search (GSO)',
              'Translates to 12+ languages',
              'Built-in AI chatbot agent',
              'Auto Schema.org markup',
            ].map((capability, i) => (
              <div key={capability} className={`reveal reveal-delay-${(i % 4) + 1} flex items-start gap-3 py-2`}>
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20">
                  <svg className="h-3 w-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-sm text-text-secondary">{capability}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal from-right">
          <div className="rounded-3xl border border-border bg-bg-secondary p-8 relative overflow-hidden hover-glow transition-all duration-500">
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full border border-primary/20 animate-spin-slow" />
            <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full border border-secondary/20 animate-spin-slow" style={{animationDirection: 'reverse'}} />
            <div className="relative">
              <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25 mb-4">
                  <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-text">AI Router</h3>
                <p className="text-xs text-text-muted mt-1">Smart model selection</p>
              </div>
              <div className="space-y-3">
                {[
                  { model: 'Claude', task: 'Complex generation', speed: 'High quality', color: 'bg-primary' },
                  { model: 'Gemini Flash', task: 'Fast tasks', speed: 'Ultra fast', color: 'bg-secondary' },
                  { model: 'Gemini Nano', task: 'On-device', speed: 'Instant', color: 'bg-accent' },
                ].map((item) => (
                  <div key={item.model} className="flex items-center gap-3 rounded-xl bg-bg/50 border border-border p-3 hover:border-primary/20 transition-colors duration-300">
                    <div className={`h-8 w-8 rounded-lg ${item.color} flex items-center justify-center`}>
                      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-text">{item.model}</div>
                      <div className="text-[10px] text-text-muted">{item.task}</div>
                    </div>
                    <span className="text-[10px] font-medium text-text-muted bg-bg rounded-full px-2 py-0.5">{item.speed}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)
