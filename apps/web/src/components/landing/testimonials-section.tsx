export const TestimonialsSection = () => (
  <section className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
    <div className="relative mx-auto max-w-7xl px-6">
      <div className="text-center mb-16 reveal">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent uppercase tracking-wider mb-4">
          Testimonials
        </span>
        <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
          Loved by Builders Everywhere
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { quote: 'UBuilder replaced our entire web team workflow. We went from 2-week design cycles to launching sites in under an hour. The AI generation quality is unreal.', name: 'Sarah Chen', title: 'Head of Marketing', company: 'TechCorp', initials: 'SC', color: 'bg-primary' },
          { quote: 'The GSO feature alone is worth the subscription. Our sites now get cited by ChatGPT and Google AI Overviews. Traffic from AI sources increased 340%.', name: 'David Katz', title: 'CEO & Founder', company: 'GrowthLab', initials: 'DK', color: 'bg-secondary' },
          { quote: 'As an Israeli startup, the RTL + Hebrew support is perfect. We build bilingual sites in minutes. The AI even translates our content beautifully.', name: 'Maya Levi', title: 'Product Designer', company: 'DesignHub', initials: 'ML', color: 'bg-accent' },
        ].map((testimonial, i) => (
          <div key={testimonial.name} className={`reveal reveal-delay-${i + 1} rounded-2xl border border-border bg-bg p-8 hover:border-primary/20 transition-all duration-300 hover-lift`}>
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, j) => (
                <svg key={j} className="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">&quot;{testimonial.quote}&quot;</p>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full ${testimonial.color} flex items-center justify-center text-xs font-bold text-white`}>
                {testimonial.initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-text">{testimonial.name}</div>
                <div className="text-xs text-text-muted">{testimonial.title}, {testimonial.company}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)
