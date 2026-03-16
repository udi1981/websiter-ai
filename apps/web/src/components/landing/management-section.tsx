export const ManagementSection = () => (
  <section className="relative border-t border-border bg-bg-secondary py-24 md:py-32">
    <div className="absolute top-[20%] right-[5%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px]" />
    <div className="absolute bottom-[10%] left-[10%] h-[250px] w-[250px] rounded-full bg-secondary/5 blur-[100px]" />

    <div className="relative mx-auto max-w-7xl px-6">
      <div className="text-center mb-20 reveal">
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wider mb-4">
          Built-in Management
        </span>
        <h2 className="mt-4 text-4xl font-extrabold md:text-5xl lg:text-6xl text-text">
          Not Just a Website — A Complete{' '}
          <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Business Platform</span>
        </h2>
        <p className="mt-6 text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
          Every website comes with a built-in smart management system, CRM, analytics, and AI agent — all customizable via AI prompts.
        </p>
      </div>

      {/* Smart Management System — Full width */}
      <div className="reveal rounded-3xl border border-border bg-bg p-8 md:p-12 mb-6 overflow-hidden group hover:border-secondary/20 transition-all duration-500 hover-lift">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary mb-4">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
              Smart Management
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-text mb-4">
              Your Business. <span className="text-secondary">Fully Managed.</span>
            </h3>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              A complete management dashboard included with every site. Leads, invoices, direct marketing, inventory, orders — all in one place. Tell the AI to customize it to your needs.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Lead Management', 'Invoicing', 'Direct Marketing', 'Inventory', 'Orders', 'AI Customizable'].map((tag) => (
                <span key={tag} className="rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {/* CRM Visual */}
          <div className="rounded-2xl border border-border bg-bg-secondary overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-text">BabyStyle — Management Hub</span>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-[8px] text-success"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> All systems active</span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Active Leads', value: '142', delta: '+12', color: 'text-blue-400' },
                  { label: 'Invoices', value: '$8.4K', delta: '8 pending', color: 'text-amber-400' },
                  { label: 'Campaigns', value: '3 live', delta: '67% open', color: 'text-green-400' },
                  { label: 'Orders', value: '89', delta: '+18 today', color: 'text-purple-400' },
                ].map((card) => (
                  <div key={card.label} className="rounded-lg bg-bg p-2 border border-border">
                    <div className={`text-sm font-bold ${card.color}`}>{card.value}</div>
                    <div className="text-[8px] text-text-muted">{card.label}</div>
                    <div className="text-[7px] text-success">{card.delta}</div>
                  </div>
                ))}
              </div>
              {/* Pipeline kanban row */}
              <div className="rounded-lg bg-bg border border-border p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-semibold text-text">Sales Pipeline</span>
                  <span className="text-[7px] text-text-muted">$24.6K total</span>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { title: 'New', count: 12, val: '$3.2K', color: 'border-blue-500' },
                    { title: 'Contacted', count: 8, val: '$5.8K', color: 'border-yellow-500' },
                    { title: 'Qualified', count: 5, val: '$7.4K', color: 'border-green-500' },
                    { title: 'Won', count: 3, val: '$8.2K', color: 'border-purple-500' },
                  ].map((col) => (
                    <div key={col.title} className={`flex-1 bg-bg-tertiary/50 rounded border-t-2 ${col.color} p-1.5`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[7px] font-semibold text-text-secondary">{col.title}</span>
                        <span className="text-[6px] bg-bg-tertiary rounded px-1 text-text-muted">{col.count}</span>
                      </div>
                      <div className="text-[8px] font-bold text-text">{col.val}</div>
                      {/* Mini cards */}
                      <div className="mt-1 space-y-0.5">
                        {[0, 1].map(i => (
                          <div key={i} className="bg-bg rounded p-1 border border-border">
                            <div className="h-1.5 w-8 rounded bg-bg-tertiary" />
                            <div className="h-1 w-12 rounded bg-bg-tertiary mt-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Bottom row: Calendar + Activity */}
              <div className="flex gap-2">
                {/* Mini calendar */}
                <div className="flex-1 rounded-lg bg-bg border border-border p-2">
                  <div className="text-[8px] font-semibold text-text mb-1">March 2026</div>
                  <div className="grid grid-cols-7 gap-0.5 text-center">
                    {['S','M','T','W','T','F','S'].map(d => (
                      <span key={d} className="text-[6px] text-text-muted font-medium">{d}</span>
                    ))}
                    {[...Array(31)].map((_, i) => (
                      <span key={i} className={`text-[6px] rounded-full h-3 w-3 flex items-center justify-center mx-auto ${i === 15 ? 'bg-primary text-white' : i === 10 || i === 22 ? 'bg-secondary/20 text-secondary' : 'text-text-muted'}`}>{i + 1}</span>
                    ))}
                  </div>
                </div>
                {/* Recent activity */}
                <div className="flex-1 rounded-lg bg-bg border border-border p-2">
                  <div className="text-[8px] font-semibold text-text mb-1">Activity</div>
                  {[
                    { text: 'Sarah M. placed order', time: '2m', icon: 'bg-green-400' },
                    { text: 'Email campaign sent', time: '1h', icon: 'bg-blue-400' },
                    { text: 'New lead: David K.', time: '3h', icon: 'bg-purple-400' },
                    { text: 'Invoice #142 paid', time: '5h', icon: 'bg-amber-400' },
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-1.5 py-0.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${a.icon} shrink-0`} />
                      <span className="text-[7px] text-text-muted flex-1 truncate">{a.text}</span>
                      <span className="text-[6px] text-text-muted shrink-0">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* AI Prompt bar */}
              <div className="rounded-lg bg-bg border border-primary/20 p-2 flex items-center gap-2">
                <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                </div>
                <span className="text-[9px] text-text-muted flex-1 animate-typing-cursor">&quot;Add a loyalty points system to the CRM and create a VIP tier for orders over $200&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analytics — Full width */}
      <div className="reveal rounded-3xl border border-border bg-bg p-8 md:p-12 overflow-hidden group hover:border-primary/20 transition-all duration-500 hover-lift">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-border bg-bg-secondary overflow-hidden">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text">AI Analytics</span>
                  <span className="flex items-center gap-1 text-[7px] text-green-400"><span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> Live</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[7px] bg-bg-tertiary px-1.5 py-0.5 rounded text-text-muted">7d</span>
                  <span className="text-[7px] bg-primary/20 px-1.5 py-0.5 rounded text-primary font-medium">30d</span>
                  <span className="text-[7px] bg-bg-tertiary px-1.5 py-0.5 rounded text-text-muted">90d</span>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Visitors', value: '24.8K', delta: '+18%' },
                    { label: 'Sales', value: '$48.2K', delta: '+31%' },
                    { label: 'Conversion', value: '5.2%', delta: '+0.8%' },
                    { label: 'Bounce', value: '28%', delta: '-4%' },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg bg-bg p-2 border border-border">
                      <div className="text-sm font-bold text-text">{m.value}</div>
                      <div className="text-[8px] text-text-muted">{m.label}</div>
                      <div className="text-[7px] text-success">{m.delta}</div>
                    </div>
                  ))}
                </div>
                {/* Charts row */}
                <div className="flex gap-2">
                  {/* Revenue chart */}
                  <div className="flex-[2] rounded-lg bg-bg p-2 border border-border">
                    <div className="text-[8px] text-text-muted mb-1.5">Revenue Trend</div>
                    <div className="flex items-end gap-0.5 h-14 relative">
                      {[35, 42, 38, 55, 48, 62, 58, 72, 68, 78, 85, 92].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/80 to-secondary/80 transition-all duration-300 hover:from-primary hover:to-secondary" style={{ height: `${h}%` }} />
                      ))}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 120 56" fill="none" preserveAspectRatio="none">
                        <polyline points="5,36 15,32 25,35 35,25 45,28 55,18 65,22 75,14 85,16 95,10 105,7 115,3" stroke="#F59E0B" strokeWidth="1.2" fill="none" opacity="0.7" strokeDasharray="2,2" />
                      </svg>
                    </div>
                    <div className="flex justify-between mt-0.5 text-[6px] text-text-muted">
                      <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
                    </div>
                  </div>
                  {/* Donut chart (CSS) */}
                  <div className="flex-1 rounded-lg bg-bg p-2 border border-border">
                    <div className="text-[8px] text-text-muted mb-1">Traffic Source</div>
                    <div className="relative h-16 w-16 mx-auto">
                      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-bg-tertiary" strokeWidth="4" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#7C3AED" strokeWidth="4" strokeDasharray="35 65" strokeDashoffset="0" strokeLinecap="round" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#06B6D4" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-35" strokeLinecap="round" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-60" strokeLinecap="round" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-80" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-text">24.8K</span>
                      </div>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {[
                        { src: 'Organic', pct: '40%', color: 'bg-primary' },
                        { src: 'Direct', pct: '28%', color: 'bg-secondary' },
                        { src: 'Social', pct: '22%', color: 'bg-success' },
                        { src: 'Referral', pct: '10%', color: 'bg-accent' },
                      ].map(s => (
                        <div key={s.src} className="flex items-center gap-1 text-[6px]">
                          <div className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
                          <span className="text-text-muted flex-1">{s.src}</span>
                          <span className="text-text-secondary font-medium">{s.pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Funnel + Top pages */}
                <div className="flex gap-2">
                  {/* Funnel */}
                  <div className="flex-1 rounded-lg bg-bg p-2 border border-border">
                    <div className="text-[8px] text-text-muted mb-1">Conversion Funnel</div>
                    <div className="space-y-0.5">
                      {[
                        { stage: 'Views', val: '24.8K', pct: 100, color: 'bg-blue-400' },
                        { stage: 'Cart', val: '4.9K', pct: 60, color: 'bg-purple-400' },
                        { stage: 'Checkout', val: '2.4K', pct: 36, color: 'bg-pink-400' },
                        { stage: 'Purchase', val: '1.2K', pct: 20, color: 'bg-green-400' },
                      ].map(f => (
                        <div key={f.stage} className="flex items-center gap-1">
                          <span className="text-[6px] text-text-muted w-10 truncate">{f.stage}</span>
                          <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                            <div className={`h-full ${f.color} rounded-full`} style={{ width: `${f.pct}%` }} />
                          </div>
                          <span className="text-[6px] text-text-secondary w-6 text-end">{f.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Top pages */}
                  <div className="flex-1 rounded-lg bg-bg p-2 border border-border">
                    <div className="text-[8px] text-text-muted mb-1">Top Pages</div>
                    {[
                      { page: '/pajamas', views: '8.2K', cvr: '6.1%' },
                      { page: '/gift-sets', views: '5.4K', cvr: '8.3%' },
                      { page: '/sale', views: '4.1K', cvr: '4.7%' },
                      { page: '/onesies', views: '3.8K', cvr: '5.2%' },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-1 py-0.5 text-[6px]">
                        <span className="text-text-muted w-2">{i + 1}.</span>
                        <span className="flex-1 text-text-secondary truncate">{p.page}</span>
                        <span className="text-text-muted">{p.views}</span>
                        <span className="text-success font-medium">{p.cvr}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* AI Prompt */}
                <div className="rounded-lg bg-bg border border-primary/20 p-2 flex items-center gap-2">
                  <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" /></svg>
                  </div>
                  <span className="text-[9px] text-text-muted flex-1 animate-typing-cursor">&quot;Generate a visual report comparing Q1 vs Q2 sales by product category&quot;</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              AI Analytics
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-text mb-4">
              Your Data. <span className="text-primary">AI-Powered Insights.</span>
            </h3>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              A complete analytics dashboard managed by AI. See all your site data, visitor behavior, conversion funnels, and revenue — then ask AI to generate custom visual reports with a simple prompt.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Real-time Analytics', 'AI Reports', 'Conversion Tracking', 'Revenue Insights', 'Custom Dashboards', 'Prompt-based'].map((tag) => (
                <span key={tag} className="rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)
