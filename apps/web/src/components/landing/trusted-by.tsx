export const TrustedBy = () => (
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
)
