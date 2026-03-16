import Image from 'next/image'

export const DemoSection = () => (
  <section id="demo" className="relative border-t border-border bg-bg py-24 md:py-32 overflow-hidden">
    <div className="absolute top-[20%] left-[5%] h-[300px] w-[300px] rounded-full bg-primary/8 blur-[100px] animate-float" />
    <div className="absolute bottom-[10%] right-[10%] h-[250px] w-[250px] rounded-full bg-secondary/8 blur-[80px] animate-float-delay" />

    <div className="relative mx-auto max-w-7xl px-6">
      <div className="text-center mb-16 reveal">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent uppercase tracking-wider mb-4">
          Live Demo
        </span>
        <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
          See It In <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Action</span>
        </h2>
        <p className="mt-6 text-text-secondary max-w-xl mx-auto text-lg">
          Watch how UBuilder transforms a simple text prompt into a complete, stunning website.
        </p>
      </div>

      {/* Demo simulation */}
      <div className="reveal max-w-5xl mx-auto">
        <div className="rounded-2xl border border-border bg-bg-secondary/80 shadow-2xl shadow-primary/10 overflow-hidden backdrop-blur-sm">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-bg/60">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <div className="h-3 w-3 rounded-full bg-[#28C840]" />
            <div className="ms-4 flex-1 max-w-md">
              <div className="rounded-md bg-bg-tertiary/80 px-3 py-1.5 text-xs text-text-muted text-start">
                app.ubuilder.ai/dashboard/new
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {/* Step 1: Prompt */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                </div>
                <span className="text-sm font-semibold text-text">What would you like to build?</span>
              </div>
              <div className="rounded-xl border border-primary/30 bg-bg p-4 relative">
                <p className="text-sm text-text leading-relaxed animate-typing-cursor">
                  Build a premium dental clinic website with a modern hero section, services grid, patient testimonials, team section, and online booking. Use calming blue and white tones.
                </p>
              </div>
            </div>

            {/* Step 2: Progress */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-text-muted font-medium">Generating your website...</span>
                <span className="text-primary font-semibold">100%</span>
              </div>
              <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-primary demo-progress animate-gradient" />
              </div>
              <div className="flex items-center gap-6 mt-4 text-[11px] text-text-muted">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" />Layout created</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" />Content written</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" />Images matched</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" />SEO optimized</span>
              </div>
            </div>

            {/* Step 3: Result preview */}
            <div className="rounded-xl border border-border overflow-hidden shadow-xl demo-screen">
              <div className="relative h-64 md:h-96">
                <Image
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80"
                  alt="Generated dental clinic website"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
                {/* Overlay with generated UI elements */}
                <div className="absolute top-0 inset-x-0 h-12 bg-white/90 backdrop-blur flex items-center px-6 justify-between">
                  <span className="text-xs font-bold text-gray-800">SmilePro Dental</span>
                  <div className="hidden md:flex items-center gap-4 text-[10px] font-medium text-gray-600">
                    <span>Home</span><span>Services</span><span>Our Team</span><span>Testimonials</span>
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-white text-[10px]">Book Now</span>
                  </div>
                </div>
                <div className="absolute bottom-8 left-8 max-w-md">
                  <div className="text-xs font-medium text-primary mb-2">AI-Generated Website</div>
                  <h3 className="text-2xl md:text-3xl font-bold text-text mb-2">Your Smile, Our Priority</h3>
                  <p className="text-sm text-text-secondary mb-4">Expert dental care for the whole family. Book your appointment today.</p>
                  <div className="flex gap-3">
                    <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white">Book Appointment</span>
                    <span className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-text">Our Services</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)
