export const FAQSection = () => (
  <section className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
    <div className="relative mx-auto max-w-3xl px-6">
      <div className="text-center mb-16 reveal">
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wider mb-4">
          FAQ
        </span>
        <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
          Common Questions
        </h2>
      </div>

      <div className="space-y-3">
        {[
          { q: 'How does AI website generation work?', a: 'You describe your website in plain text — the type of business, style preferences, and content needs. Our AI engine analyzes your prompt, selects the optimal layout, generates professional copy, sources relevant images, and builds a complete multi-page website in under 60 seconds.' },
          { q: 'Can I edit the generated website?', a: 'Absolutely! Every element is fully editable through our visual drag-and-drop editor. You can also chat with the AI to make changes — just type "make the headline bigger" or "change the color scheme to blue" and it updates instantly.' },
          { q: 'What is GSO (Generative Search Optimization)?', a: 'GSO goes beyond traditional SEO. It optimizes your website to be found and cited by AI search engines like ChatGPT, Google AI Overviews, Perplexity, and Claude. This includes structured data, Schema.org markup, and content formatting that AI models can easily understand.' },
          { q: 'Do I need coding skills?', a: 'Not at all. UBuilder is designed for everyone — from small business owners to designers. The AI handles all the technical work. If you want to export the code, Pro plans include full code export in clean HTML/CSS/JS.' },
          { q: 'Can I use my own domain?', a: 'Yes! Free plans include a *.ubuilder.co subdomain. Pro and Business plans support custom domains with free SSL certificates and CDN. Just point your domain to us and we handle the rest.' },
          { q: 'What languages do you support?', a: 'UBuilder supports 12+ languages including English, Hebrew, Arabic, French, German, Spanish, Russian, Chinese, Japanese, Korean, Portuguese, and Italian. Full RTL (right-to-left) support is built-in for Hebrew and Arabic.' },
          { q: 'Is there a free plan?', a: 'Yes! Our free plan includes 1 website, AI generation, a *.ubuilder.co subdomain, and basic analytics. No credit card required. Upgrade to Pro ($19/mo) for custom domains, code export, AI Agent, and more.' },
          { q: 'How does the AI chatbot agent work?', a: 'The AI Agent is a smart chatbot that lives on your published website. It answers visitor questions, collects leads, books appointments, and provides customer support — all automatically, 24/7. It learns from your website content and can be customized with your own knowledge base.' },
        ].map((faq, i) => (
          <details key={i} className={`reveal reveal-delay-${Math.min(i + 1, 4)} group rounded-xl border border-border bg-bg hover:border-border-hover transition-colors`}>
            <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-sm font-semibold text-text list-none">
              <span>{faq.q}</span>
              <svg className="faq-chevron h-5 w-5 text-text-muted shrink-0 ms-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="faq-content px-6 pb-5">
              <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  </section>
)
