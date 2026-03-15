import Link from 'next/link'
import Image from 'next/image'

const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes glow-border {
          0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
          50% { box-shadow: 0 0 40px rgba(124, 58, 237, 0.6), 0 0 60px rgba(6, 182, 212, 0.2); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes typing {
          0%, 100% { width: 0; }
          30%, 70% { width: 100%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes score-fill {
          from { stroke-dashoffset: 251; }
          to { stroke-dashoffset: 62; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-delay { animation: float 6s ease-in-out 2s infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-glow-border { animation: glow-border 3s ease-in-out infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-shimmer { animation: shimmer 3s linear infinite; background-size: 200% 100%; }
        .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        .animate-score { animation: score-fill 2s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .fade-in-1 { animation: fadeInUp 0.6s ease-out 0.1s both; }
        .fade-in-2 { animation: fadeInUp 0.6s ease-out 0.2s both; }
        .fade-in-3 { animation: fadeInUp 0.6s ease-out 0.3s both; }
        .fade-in-4 { animation: fadeInUp 0.6s ease-out 0.4s both; }
        .fade-in-5 { animation: fadeInUp 0.6s ease-out 0.5s both; }
        .fade-in-6 { animation: fadeInUp 0.6s ease-out 0.6s both; }
        .fade-in-7 { animation: fadeInUp 0.6s ease-out 0.7s both; }
        .fade-in-8 { animation: fadeInUp 0.6s ease-out 0.8s both; }

        details summary::-webkit-details-marker { display: none; }
        details summary::marker { display: none; content: ''; }
        details[open] summary .faq-chevron { transform: rotate(180deg); }
        details[open] .faq-content { animation: fadeInUp 0.3s ease-out; }
      `}</style>

      {/* ===== 1. NAVIGATION ===== */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-bg/60 backdrop-blur-2xl">
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
            <a href="#templates" className="hover:text-text transition-colors duration-200">Templates</a>
            <a href="#pricing" className="hover:text-text transition-colors duration-200">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-text-secondary hover:text-text transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-primary to-primary-hover px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* ===== 2. HERO SECTION ===== */}
      <section className="relative overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Animated gradient orbs */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 h-[700px] w-[900px] rounded-full bg-primary/20 blur-[150px] animate-glow" />
        <div className="absolute top-[100px] left-[10%] h-[400px] w-[400px] rounded-full bg-secondary/15 blur-[120px] animate-float-slow" />
        <div className="absolute top-[200px] right-[10%] h-[350px] w-[350px] rounded-full bg-primary/10 blur-[100px] animate-float-delay" />
        <div className="absolute bottom-[100px] left-[30%] h-[250px] w-[250px] rounded-full bg-accent/8 blur-[80px] animate-float" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />

        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-12 md:pt-20 md:pb-16 text-center">
          {/* Badge */}
          <div className="fade-in-1 inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary mb-10 animate-glow-border">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-pulse-ring" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            The #1 AI Website Builder
          </div>

          {/* Heading */}
          <h1 className="fade-in-2 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl max-w-5xl mx-auto leading-[1.05]">
            <span className="text-text">Build Websites That </span>
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              Blow Minds
            </span>
            <span className="text-text"> — With AI</span>
          </h1>

          {/* Subheading */}
          <p className="fade-in-3 mt-8 text-lg text-text-secondary max-w-2xl mx-auto md:text-xl leading-relaxed">
            Describe your vision in plain text. Our AI generates a complete, multi-page website with stunning design,
            real images, and SEO optimization — in under 60 seconds.
          </p>

          {/* CTAs */}
          <div className="fade-in-4 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group relative rounded-full bg-gradient-to-r from-primary via-purple-500 to-secondary px-10 py-4 text-base font-semibold text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Building Free
                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </span>
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-3 rounded-full border border-border hover:border-primary/40 px-8 py-4 text-base font-semibold text-text-secondary hover:text-text hover:bg-primary/5 transition-all duration-300"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <svg className="h-3.5 w-3.5 text-primary ms-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
              Watch Demo
            </a>
          </div>

          {/* Stats Row */}
          <div className="fade-in-5 mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
            {[
              { value: '50,000+', label: 'Sites Built' },
              { value: '4.9★', label: 'Rating' },
              { value: '12', label: 'Languages' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xl font-bold text-text">{stat.value}</span>
                <span className="text-text-muted">{stat.label}</span>
                {i < 3 && <span className="hidden sm:block ms-8 h-5 w-px bg-border" />}
              </div>
            ))}
          </div>

          {/* Editor Mockup */}
          <div className="fade-in-6 mt-16 rounded-2xl border border-border/60 bg-bg-secondary/80 shadow-2xl shadow-primary/10 overflow-hidden max-w-6xl mx-auto backdrop-blur-sm">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-bg/60">
              <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              <div className="ms-4 flex-1 max-w-md">
                <div className="rounded-md bg-bg-tertiary/80 px-3 py-1.5 text-xs text-text-muted text-start">
                  app.ubuilder.ai/editor/my-website
                </div>
              </div>
            </div>
            <div className="flex h-80 md:h-[420px] lg:h-[480px]">
              {/* Left sidebar */}
              <div className="w-14 md:w-56 border-e border-border bg-bg flex flex-col">
                <div className="p-2 md:p-4 space-y-1.5 flex-1">
                  {[
                    { icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', label: 'Pages', active: false },
                    { icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', label: 'Layers', active: true },
                    { icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', label: 'Design', active: false },
                    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: 'Settings', active: false },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${item.active ? 'bg-primary/15 text-primary' : 'text-text-muted hover:bg-bg-tertiary'}`}>
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                      <span className="hidden md:inline">{item.label}</span>
                    </div>
                  ))}
                  <div className="hidden md:block pt-4 border-t border-border mt-4">
                    <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Blocks</div>
                    {['Hero Section', 'Features Grid', 'Testimonials', 'CTA Banner', 'Footer'].map((block, i) => (
                      <div key={block} className={`rounded-md px-2.5 py-1.5 text-[11px] mb-1 cursor-pointer transition-colors ${i === 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-muted hover:bg-bg-tertiary'}`}>
                        {block}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Main canvas */}
              <div className="flex-1 bg-bg-tertiary/30 relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
                  alt="Website builder dashboard preview"
                  fill
                  className="object-cover object-top opacity-60"
                  sizes="(max-width: 768px) 100vw, 70vw"
                />
                {/* Overlay with editor UI elements */}
                <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg/60" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-bg/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-[10px] text-text-muted font-medium">Live Preview</span>
                </div>
                {/* Selection outline on a "component" */}
                <div className="absolute top-[30%] left-[10%] right-[10%] h-24 border-2 border-primary rounded-lg">
                  <div className="absolute -top-6 left-0 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded">Hero Section</div>
                  <div className="absolute -top-2 -right-2 h-4 w-4 bg-primary rounded-full border-2 border-white" />
                </div>
              </div>
              {/* Right AI chat panel */}
              <div className="w-72 border-s border-border bg-bg hidden lg:flex flex-col">
                <div className="p-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                    </div>
                    <span className="text-xs font-bold text-text">AI Assistant</span>
                    <span className="ms-auto h-1.5 w-1.5 rounded-full bg-success" />
                  </div>
                </div>
                <div className="flex-1 p-3 space-y-3 overflow-hidden">
                  <div className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-bg-tertiary shrink-0 mt-0.5" />
                    <div className="rounded-xl rounded-tl-sm bg-bg-tertiary px-3 py-2 text-[11px] text-text-secondary leading-relaxed">
                      Make the hero section more dramatic with a gradient background and bigger headline
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="rounded-xl rounded-tr-sm bg-primary/15 px-3 py-2 text-[11px] text-primary leading-relaxed max-w-[85%]">
                      Done! I&apos;ve updated the hero with a purple-to-cyan gradient, increased the heading to 72px, and added an animated glow effect.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-bg-tertiary shrink-0 mt-0.5" />
                    <div className="rounded-xl rounded-tl-sm bg-bg-tertiary px-3 py-2 text-[11px] text-text-secondary leading-relaxed">
                      Add a pricing section with 3 tiers and a highlighted &quot;Pro&quot; plan
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="rounded-xl rounded-tr-sm bg-primary/15 px-3 py-2 text-[11px] text-primary leading-relaxed max-w-[85%]">
                      Added! 3-tier pricing with Free, Pro (highlighted), and Business plans. Pro has a gradient border.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-bg-tertiary shrink-0 mt-0.5" />
                    <div className="rounded-xl rounded-tl-sm bg-bg-tertiary px-3 py-2 text-[11px] text-text-secondary leading-relaxed">
                      Generate AI images for the team section
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-border">
                  <div className="flex items-center gap-2 rounded-lg bg-bg-tertiary px-3 py-2">
                    <span className="text-[11px] text-text-muted flex-1">Ask AI to edit your site...</span>
                    <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. TRUSTED BY / SOCIAL PROOF BAR ===== */}
      <section className="border-y border-border bg-bg-secondary/50 py-10 overflow-hidden">
        <p className="text-center text-sm font-medium text-text-muted mb-8">
          Trusted by <span className="text-text">10,000+</span> businesses worldwide
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-secondary/50 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-secondary/50 to-transparent z-10" />
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-16 px-8">
                {['TechCorp', 'DesignHub', 'StartupX', 'MediaFlow', 'CloudBase', 'DataSync', 'AppForge', 'PixelLab', 'NovaTech', 'BuildRight'].map((name) => (
                  <span key={`${setIdx}-${name}`} className="text-xl font-bold text-text-muted/30 tracking-wider whitespace-nowrap">
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. FEATURES SECTION ===== */}
      <section id="features" className="relative bg-bg py-24 md:py-32">
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
              Features
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl lg:text-6xl text-text">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Build & Grow</span>
            </h2>
            <p className="mt-6 text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
              From AI generation to visual editing to search optimization — one platform for your entire web presence.
            </p>
          </div>

          {/* Feature 1: AI-Powered Generation — Full width */}
          <div className="rounded-3xl border border-border bg-bg-secondary/50 p-8 md:p-12 mb-6 overflow-hidden group hover:border-primary/20 transition-all duration-500">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  AI-Powered
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-text mb-4">
                  Describe It. <span className="text-primary">AI Builds It.</span>
                </h3>
                <p className="text-text-secondary text-lg leading-relaxed mb-6">
                  Type a description of your website in plain text. Our AI creates everything — layout, content, images, and code.
                  Multi-page sites generated in under 60 seconds.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Multi-page sites', 'SEO-optimized', 'Real content', 'Custom images'].map((tag) => (
                    <span key={tag} className="rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {/* Visual: Prompt → Website */}
              <div className="relative">
                <div className="rounded-2xl border border-border bg-bg p-6 space-y-4">
                  {/* Prompt input */}
                  <div className="rounded-xl bg-bg-tertiary p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </div>
                      <span className="text-[11px] font-semibold text-text-muted">Your Prompt</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      &quot;Build a modern coffee shop website with an online menu, reservation system, warm earthy tones, and hero image of latte art&quot;
                    </p>
                  </div>
                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-b from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    </div>
                  </div>
                  {/* Generated website preview */}
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-1.5 bg-bg-tertiary px-3 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                      <div className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
                      <div className="h-2 w-2 rounded-full bg-[#28C840]" />
                      <span className="ms-2 text-[9px] text-text-muted">cafebloom.ubuilder.co</span>
                    </div>
                    <div className="relative h-44">
                      <Image
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"
                        alt="AI generated restaurant website"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <div className="text-xs font-bold text-text">Cafe Bloom</div>
                        <div className="text-[10px] text-text-muted">Your cozy neighborhood cafe</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features 2 & 3: Side by side */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Feature 2: Visual Editor + AI Chat */}
            <div className="rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary mb-4">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Visual Editor
              </div>
              <h3 className="text-2xl font-bold text-text mb-3">Click to Edit. Chat to Change.</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Click any element to edit visually. Or tell the AI what to change. Real-time preview with instant updates.
              </p>
              {/* Visual mockup */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src="https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80"
                    alt="Visual editor interface"
                    fill
                    className="object-cover opacity-50"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
                  {/* Floating edit UI elements */}
                  <div className="absolute top-4 right-4 rounded-lg bg-bg/90 backdrop-blur-sm border border-border px-2 py-1.5 flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-primary" />
                    <div className="h-3 w-3 rounded bg-secondary" />
                    <div className="h-3 w-3 rounded bg-accent" />
                    <div className="h-3 w-px bg-border" />
                    <span className="text-[9px] text-text-muted font-medium">Aa</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-bg/90 backdrop-blur-sm border border-primary/30 px-3 py-2 flex items-center gap-2">
                    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                    <span className="text-[10px] text-text-muted">&quot;Make this heading larger and bolder&quot;</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: AI Image Generation */}
            <div className="rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-4">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                AI Images
              </div>
              <h3 className="text-2xl font-bold text-text mb-3">Generate Stunning Visuals</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Generate images, icons, backgrounds, and logos. Every visual element is customizable and on-brand.
              </p>
              {/* Image grid */}
              <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
                {[
                  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&q=80',
                  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&q=80',
                  'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=300&q=80',
                ].map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image src={src} alt={`AI generated visual ${i + 1}`} fill className="object-cover" sizes="150px" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features 4 & 5: Side by side */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Feature 4: Website Scanner */}
            <div className="rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500">
              <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success mb-4">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Scanner
              </div>
              <h3 className="text-2xl font-bold text-text mb-3">Scan & Clone Any Website</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Paste any URL. Our AI analyzes the design DNA — colors, fonts, layout — and creates an improved version.
              </p>
              {/* URL Scanner visual */}
              <div className="rounded-xl bg-bg p-4 border border-border space-y-4">
                <div className="flex items-center gap-2 rounded-lg bg-bg-tertiary px-3 py-2.5 border border-border">
                  <svg className="h-4 w-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.507a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.257" /></svg>
                  <span className="text-xs text-text-muted">https://competitor-site.com</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['Colors', 'Fonts', 'Layout', 'Content'].map((item, i) => (
                    <div key={item} className="text-center">
                      <div className={`h-8 w-8 mx-auto rounded-lg flex items-center justify-center mb-1 ${i === 0 ? 'bg-primary/20' : i === 1 ? 'bg-secondary/20' : i === 2 ? 'bg-accent/20' : 'bg-success/20'}`}>
                        <svg className={`h-4 w-4 ${i === 0 ? 'text-primary' : i === 1 ? 'text-secondary' : i === 2 ? 'text-accent' : 'text-success'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-[9px] text-text-muted">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-success font-medium">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  DNA extraction complete — ready to improve
                </div>
              </div>
            </div>

            {/* Feature 5: GSO */}
            <div className="rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary mb-4">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                GSO
              </div>
              <h3 className="text-2xl font-bold text-text mb-3">Generative Search Optimization</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Not just SEO. Optimize for ChatGPT, Google AI Overviews, Perplexity, and all AI search engines.
              </p>
              {/* GSO Score Gauge */}
              <div className="rounded-xl bg-bg p-6 border border-border flex items-center justify-center">
                <div className="text-center">
                  <div className="relative inline-block">
                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-bg-tertiary" />
                      <circle cx="50" cy="50" r="40" fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray="251" strokeDashoffset="62" className="text-success animate-score" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-text">92</span>
                      <span className="text-[9px] text-text-muted">GSO Score</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-4 text-[10px]">
                    <span className="flex items-center gap-1 text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />SEO: 95</span>
                    <span className="flex items-center gap-1 text-secondary"><span className="h-1.5 w-1.5 rounded-full bg-secondary" />AI: 89</span>
                    <span className="flex items-center gap-1 text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Schema: 92</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features 6, 7, 8: Three columns */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 6: Multi-Language & RTL */}
            <div className="rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                i18n
              </div>
              <h3 className="text-xl font-bold text-text mb-3">12+ Languages & RTL</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                Full RTL support. Hebrew, Arabic, English, and more. One click to translate your entire site.
              </p>
              <div className="flex flex-wrap gap-2">
                {['EN', 'HE', 'AR', 'FR', 'DE', 'ES', 'RU', 'ZH'].map((lang) => (
                  <span key={lang} className="rounded-md bg-bg-tertiary px-2 py-1 text-[10px] font-bold text-text-muted">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Feature 7: CRM & AI Agent */}
            <div className="rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-4">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                AI Agent
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Built-in CRM & AI Chat</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                AI chatbot for your visitors. Collect leads, book appointments, answer questions — 24/7.
              </p>
              {/* Chat bubbles */}
              <div className="rounded-xl bg-bg p-3 border border-border space-y-2">
                <div className="flex gap-2">
                  <div className="h-5 w-5 rounded-full bg-accent/20 shrink-0 flex items-center justify-center">
                    <span className="text-[8px]">👤</span>
                  </div>
                  <div className="rounded-lg bg-bg-tertiary px-2.5 py-1.5 text-[10px] text-text-secondary">
                    Do you offer free delivery?
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-[10px] text-primary max-w-[80%]">
                    Yes! Free delivery on orders over $50. Would you like to browse our menu?
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 8: E-commerce */}
            <div className="rounded-3xl border border-border bg-bg-secondary/50 p-8 group hover:border-primary/20 transition-all duration-500">
              <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success mb-4">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                Commerce
              </div>
              <h3 className="text-xl font-bold text-text mb-3">E-commerce & Payments</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                Built-in online store. Accept payments with Stripe & PayPlus. No extra plugins needed.
              </p>
              {/* Product card mockup */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="relative h-28">
                  <Image
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=80"
                    alt="E-commerce product"
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
                <div className="bg-bg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-text">Premium Bundle</div>
                      <div className="text-sm font-bold text-primary">$49.99</div>
                    </div>
                    <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. HOW IT WORKS ===== */}
      <section id="how-it-works" className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
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
            {/* Step 1 */}
            <div className="relative group">
              <div className="rounded-2xl border border-border bg-bg p-8 hover:border-primary/30 transition-all duration-300 h-full">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-2xl font-extrabold text-white mb-6 shadow-lg shadow-primary/20">
                  1
                </div>
                <h3 className="text-xl font-bold text-text mb-3">Describe Your Vision</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  Type, speak, or upload an image. Describe any website you can imagine.
                </p>
                {/* Visual */}
                <div className="rounded-xl bg-bg-tertiary p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    <svg className="h-4 w-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.507a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.257" /></svg>
                  </div>
                  <div className="h-px bg-border mb-2" />
                  <p className="text-[11px] text-text-muted">
                    &quot;A modern SaaS landing page with pricing table, feature grid, and dark mode...&quot;
                  </p>
                </div>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="rounded-2xl border border-border bg-bg p-8 hover:border-secondary/30 transition-all duration-300 h-full">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-primary text-2xl font-extrabold text-white mb-6 shadow-lg shadow-secondary/20">
                  2
                </div>
                <h3 className="text-xl font-bold text-text mb-3">AI Generates Everything</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  Our AI creates pages, content, images, and optimized code in real-time.
                </p>
                {/* Visual: File operations */}
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
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-secondary/50 to-transparent" />
            </div>

            {/* Step 3 */}
            <div className="group">
              <div className="rounded-2xl border border-border bg-bg p-8 hover:border-success/30 transition-all duration-300 h-full">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-success to-secondary text-2xl font-extrabold text-white mb-6 shadow-lg shadow-success/20">
                  3
                </div>
                <h3 className="text-xl font-bold text-text mb-3">Publish & Go Live</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  Publish instantly with a custom domain. Your site is live, fast, and SEO-ready.
                </p>
                {/* Visual: Published site */}
                <div className="rounded-xl bg-bg-tertiary p-4 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-[11px] font-semibold text-success">Live</span>
                    <span className="text-[11px] text-text-muted ms-auto font-mono">yourdomain.com</span>
                  </div>
                  <div className="relative h-24 rounded-lg overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80"
                      alt="Published website on mobile"
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-tertiary/80 to-transparent" />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-text-muted">
                    <span className="flex items-center gap-1"><span className="text-success">SSL</span></span>
                    <span className="flex items-center gap-1"><span className="text-secondary">CDN</span></span>
                    <span className="flex items-center gap-1"><span className="text-primary">SEO</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 6. TEMPLATES SHOWCASE ===== */}
      <section id="templates" className="relative border-t border-border bg-bg py-24 md:py-32">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent uppercase tracking-wider mb-4">
              Templates
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
              See What Our AI Can Build
            </h2>
            <p className="mt-6 text-text-secondary max-w-xl mx-auto text-lg">
              Every template is AI-generated. Customize any of them with a single prompt.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Cafe Bloom', category: 'Restaurant', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', color: 'bg-accent' },
              { name: 'LaunchPad SaaS', category: 'SaaS', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', color: 'bg-primary' },
              { name: 'StyleShop', category: 'E-commerce', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', color: 'bg-success' },
              { name: 'Artfolio', category: 'Portfolio', image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&q=80', color: 'bg-secondary' },
              { name: 'PropHome', category: 'Real Estate', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80', color: 'bg-primary' },
              { name: 'Bistro Milano', category: 'Restaurant', image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80', color: 'bg-accent' },
            ].map((template) => (
              <div key={template.name} className="group rounded-2xl border border-border bg-bg-secondary/50 overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={template.image}
                    alt={`${template.name} template`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary to-transparent opacity-60" />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-block ${template.color} rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white`}>
                      {template.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="rounded-full bg-white/90 px-5 py-2 text-xs font-bold text-bg shadow-lg">
                      Preview
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-text">{template.name}</h3>
                  <p className="text-xs text-text-muted mt-1">AI-generated {template.category.toLowerCase()} template</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. AI CAPABILITIES SHOWCASE ===== */}
      <section className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
        <div className="absolute top-0 right-[20%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
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
                ].map((capability) => (
                  <div key={capability} className="flex items-start gap-3 py-2">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20">
                      <svg className="h-3 w-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm text-text-secondary">{capability}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Visual */}
            <div className="relative">
              <div className="rounded-3xl border border-border bg-bg p-8 relative overflow-hidden">
                {/* Spinning gradient ring */}
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
                      <div key={item.model} className="flex items-center gap-3 rounded-xl bg-bg-tertiary/50 border border-border p-3">
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

      {/* ===== 8. TESTIMONIALS ===== */}
      <section className="relative border-t border-border bg-bg py-24 md:py-32">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent uppercase tracking-wider mb-4">
              Testimonials
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
              Loved by Builders Everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'UBuilder replaced our entire web team workflow. We went from 2-week design cycles to launching sites in under an hour. The AI generation quality is unreal.',
                name: 'Sarah Chen',
                title: 'Head of Marketing',
                company: 'TechCorp',
                initials: 'SC',
                color: 'bg-primary',
              },
              {
                quote: 'The GSO feature alone is worth the subscription. Our sites now get cited by ChatGPT and Google AI Overviews. Traffic from AI sources increased 340%.',
                name: 'David Katz',
                title: 'CEO & Founder',
                company: 'GrowthLab',
                initials: 'DK',
                color: 'bg-secondary',
              },
              {
                quote: 'As an Israeli startup, the RTL + Hebrew support is perfect. We build bilingual sites in minutes. The AI even translates our content beautifully.',
                name: 'Maya Levi',
                title: 'Product Designer',
                company: 'DesignHub',
                initials: 'ML',
                color: 'bg-accent',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="rounded-2xl border border-border bg-bg-secondary/50 p-8 hover:border-primary/20 transition-all duration-300">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  &quot;{testimonial.quote}&quot;
                </p>
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

      {/* ===== 9. PRICING ===== */}
      <section id="pricing" className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
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
            <div className="rounded-2xl border border-border bg-bg p-8 hover:border-border-hover transition-all duration-300">
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

            {/* Pro — highlighted */}
            <div className="relative rounded-2xl border-2 border-primary bg-bg p-8 shadow-xl shadow-primary/10">
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
            <div className="rounded-2xl border border-border bg-bg p-8 hover:border-border-hover transition-all duration-300">
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

      {/* ===== 10. FAQ SECTION ===== */}
      <section className="relative border-t border-border bg-bg py-24 md:py-32">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wider mb-4">
              FAQ
            </span>
            <h2 className="mt-4 text-4xl font-extrabold md:text-5xl text-text">
              Common Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does AI website generation work?',
                a: 'You describe your website in plain text — the type of business, style preferences, and content needs. Our AI engine analyzes your prompt, selects the optimal layout, generates professional copy, sources relevant images, and builds a complete multi-page website in under 60 seconds.',
              },
              {
                q: 'Can I edit the generated website?',
                a: 'Absolutely! Every element is fully editable through our visual drag-and-drop editor. You can also chat with the AI to make changes — just type "make the headline bigger" or "change the color scheme to blue" and it updates instantly.',
              },
              {
                q: 'What is GSO (Generative Search Optimization)?',
                a: 'GSO goes beyond traditional SEO. It optimizes your website to be found and cited by AI search engines like ChatGPT, Google AI Overviews, Perplexity, and Claude. This includes structured data, Schema.org markup, and content formatting that AI models can easily understand.',
              },
              {
                q: 'Do I need coding skills?',
                a: 'Not at all. UBuilder is designed for everyone — from small business owners to designers. The AI handles all the technical work. If you want to export the code, Pro plans include full code export in clean HTML/CSS/JS.',
              },
              {
                q: 'Can I use my own domain?',
                a: 'Yes! Free plans include a *.ubuilder.co subdomain. Pro and Business plans support custom domains with free SSL certificates and CDN. Just point your domain to us and we handle the rest.',
              },
              {
                q: 'What languages do you support?',
                a: 'UBuilder supports 12+ languages including English, Hebrew, Arabic, French, German, Spanish, Russian, Chinese, Japanese, Korean, Portuguese, and Italian. Full RTL (right-to-left) support is built-in for Hebrew and Arabic.',
              },
              {
                q: 'Is there a free plan?',
                a: 'Yes! Our free plan includes 1 website, AI generation, a *.ubuilder.co subdomain, and basic analytics. No credit card required. Upgrade to Pro ($19/mo) for custom domains, code export, AI Agent, and more.',
              },
              {
                q: 'How does the AI chatbot agent work?',
                a: 'The AI Agent is a smart chatbot that lives on your published website. It answers visitor questions, collects leads, books appointments, and provides customer support — all automatically, 24/7. It learns from your website content and can be customized with your own knowledge base.',
              },
            ].map((faq, i) => (
              <details key={i} className="group rounded-xl border border-border bg-bg-secondary/50 hover:border-border-hover transition-colors">
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

      {/* ===== 11. FINAL CTA ===== */}
      <section className="relative border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-bg to-secondary/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-0 right-[20%] h-[300px] w-[300px] rounded-full bg-secondary/10 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
          <h2 className="text-4xl font-extrabold md:text-5xl lg:text-6xl text-text mb-6">
            Ready to Build Something{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">Amazing</span>?
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10">
            Join 50,000+ businesses building beautiful websites with AI. Start free — no credit card required.
          </p>

          <form className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 rounded-xl border border-border bg-bg-secondary/80 px-5 py-3.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary to-primary-hover px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 whitespace-nowrap"
            >
              Get Started Free
            </Link>
          </form>
          <p className="text-xs text-text-muted">
            No credit card required. Free forever for 1 site.
          </p>
        </div>
      </section>

      {/* ===== 12. FOOTER ===== */}
      <footer className="border-t border-border bg-bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
                  </svg>
                </div>
                <span className="text-xl font-extrabold text-text tracking-tight">UBuilder</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs mb-6">
                AI-powered website builder. Build, optimize, and grow your online presence with the power of artificial intelligence.
              </p>
              <div className="flex items-center gap-4">
                {/* Twitter/X */}
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-tertiary hover:bg-primary/20 text-text-muted hover:text-primary transition-all">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                {/* GitHub */}
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-tertiary hover:bg-primary/20 text-text-muted hover:text-primary transition-all">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-tertiary hover:bg-primary/20 text-text-muted hover:text-primary transition-all">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Product', links: ['Features', 'Templates', 'Pricing', 'AI Assistant', 'API'] },
              { title: 'Resources', links: ['Documentation', 'Blog', 'Support', 'Changelog', 'Status'] },
              { title: 'Company', links: ['About', 'Privacy Policy', 'Terms of Service', 'Contact', 'Careers'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm text-text mb-5">{col.title}</h4>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-text-muted hover:text-text transition-colors duration-200">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">&copy; 2026 UBuilder AI. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs text-text-muted">
              <a href="#" className="hover:text-text transition-colors">Privacy</a>
              <a href="#" className="hover:text-text transition-colors">Terms</a>
              <a href="#" className="hover:text-text transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
