'use client'

type RecentLead = {
  id: string
  name: string | null
  email: string | null
  status: string
  createdAt: string
}

type CampaignSummary = {
  active: number
  totalSent: number
  avgOpenRate: number
  avgClickRate: number
}

type CrmOverviewTabProps = {
  recentLeads: RecentLead[]
  campaignSummary: CampaignSummary | null
  loading: boolean
  onAddLead: () => void
  onCreateCampaign: () => void
  onViewAnalytics: () => void
}

const statusDot: Record<string, string> = {
  new: 'bg-blue-400',
  contacted: 'bg-yellow-400',
  qualified: 'bg-purple-400',
  converted: 'bg-success',
  lost: 'bg-error',
}

const SkeletonOverview = () => (
  <div className="grid gap-5 md:grid-cols-2">
    <div className="rounded-2xl border border-border bg-bg-secondary p-5 animate-pulse">
      <div className="h-5 w-24 rounded bg-bg-tertiary mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-bg-tertiary" />
          <div className="flex-1">
            <div className="h-4 w-24 rounded bg-bg-tertiary mb-1" />
            <div className="h-3 w-32 rounded bg-bg-tertiary" />
          </div>
        </div>
      ))}
    </div>
    <div className="rounded-2xl border border-border bg-bg-secondary p-5 animate-pulse">
      <div className="h-5 w-32 rounded bg-bg-tertiary mb-4" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-bg-tertiary" />
        ))}
      </div>
    </div>
  </div>
)

export const CrmOverviewTab = ({
  recentLeads,
  campaignSummary,
  loading,
  onAddLead,
  onCreateCampaign,
  onViewAnalytics,
}: CrmOverviewTabProps) => {
  if (loading) return <SkeletonOverview />

  return (
    <div>
      {/* Two-column grid */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
        {/* Recent Leads */}
        <div className="rounded-2xl border border-border bg-bg-secondary p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-text flex items-center gap-2">
              <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Recent Leads / לידים אחרונים
            </h4>
            <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">
              {recentLeads.length}
            </span>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-text-muted">No leads yet. They will appear once visitors interact with your site.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-bg-tertiary/50 transition-colors cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">
                      {(lead.name || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{lead.name || 'Unknown'}</p>
                    <p className="text-[11px] text-text-muted truncate">{lead.email || 'No email'}</p>
                  </div>
                  <span className={`h-2 w-2 rounded-full shrink-0 ${statusDot[lead.status] || 'bg-text-muted'}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaign Performance */}
        <div className="rounded-2xl border border-border bg-bg-secondary p-5">
          <h4 className="font-semibold text-text mb-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Campaign Performance / ביצועי קמפיינים
          </h4>

          {!campaignSummary || campaignSummary.totalSent === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-text-muted">No campaigns sent yet. Create one to start engaging.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-bg-tertiary/50 p-3 text-center">
                <p className="text-lg font-bold text-primary">{campaignSummary.active}</p>
                <p className="text-[10px] text-text-muted">Active Campaigns</p>
              </div>
              <div className="rounded-xl bg-bg-tertiary/50 p-3 text-center">
                <p className="text-lg font-bold text-text">{campaignSummary.totalSent.toLocaleString()}</p>
                <p className="text-[10px] text-text-muted">Total Sent</p>
              </div>
              <div className="rounded-xl bg-bg-tertiary/50 p-3 text-center">
                <p className="text-lg font-bold text-success">{campaignSummary.avgOpenRate}%</p>
                <p className="text-[10px] text-text-muted">Avg Open Rate</p>
              </div>
              <div className="rounded-xl bg-bg-tertiary/50 p-3 text-center">
                <p className="text-lg font-bold text-secondary">{campaignSummary.avgClickRate}%</p>
                <p className="text-[10px] text-text-muted">Avg Click Rate</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={onAddLead}
          className="group flex items-center gap-3 rounded-2xl border border-border bg-bg-secondary p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <div className="text-start">
            <p className="text-sm font-semibold text-text">Add Lead</p>
            <p className="text-[11px] text-text-muted">הוסף ליד חדש</p>
          </div>
        </button>

        <button
          onClick={onCreateCampaign}
          className="group flex items-center gap-3 rounded-2xl border border-border bg-bg-secondary p-4 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/5 transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
            <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div className="text-start">
            <p className="text-sm font-semibold text-text">Create Campaign</p>
            <p className="text-[11px] text-text-muted">צור קמפיין חדש</p>
          </div>
        </button>

        <button
          onClick={onViewAnalytics}
          className="group flex items-center gap-3 rounded-2xl border border-border bg-bg-secondary p-4 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
            <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div className="text-start">
            <p className="text-sm font-semibold text-text">View Analytics</p>
            <p className="text-[11px] text-text-muted">צפה באנליטיקס מלא</p>
          </div>
        </button>
      </div>
    </div>
  )
}
