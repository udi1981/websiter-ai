'use client'

type CampaignType = 'email' | 'sms' | 'push'
type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'

type Campaign = {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
  }
  sentAt: string | null
  createdAt: string
}

type CrmCampaignsTabProps = {
  campaigns: Campaign[]
  loading: boolean
  onCreateCampaign: () => void
}

const typeConfig: Record<CampaignType, { label: string; bg: string; text: string }> = {
  email: { label: 'Email', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  sms: { label: 'SMS', bg: 'bg-green-500/10', text: 'text-green-400' },
  push: { label: 'Push', bg: 'bg-purple-500/10', text: 'text-purple-400' },
}

const statusConfig: Record<CampaignStatus, { label: string; bg: string; text: string; dot: string }> = {
  draft: { label: 'Draft', bg: 'bg-text-muted/10', text: 'text-text-muted', dot: 'bg-text-muted' },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  sending: { label: 'Sending', bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400 animate-pulse' },
  sent: { label: 'Sent', bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  paused: { label: 'Paused', bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
}

const SkeletonCard = () => (
  <div className="rounded-2xl border border-border bg-bg-secondary p-5 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-5 w-32 rounded bg-bg-tertiary" />
      <div className="h-5 w-16 rounded-full bg-bg-tertiary" />
    </div>
    <div className="flex gap-2 mb-4">
      <div className="h-5 w-14 rounded-full bg-bg-tertiary" />
      <div className="h-5 w-14 rounded-full bg-bg-tertiary" />
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="h-10 rounded-lg bg-bg-tertiary" />
      <div className="h-10 rounded-lg bg-bg-tertiary" />
      <div className="h-10 rounded-lg bg-bg-tertiary" />
    </div>
  </div>
)

export const CrmCampaignsTab = ({ campaigns, loading, onCreateCampaign }: CrmCampaignsTabProps) => {
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 rounded bg-bg-tertiary animate-pulse" />
          <div className="h-10 w-36 rounded-xl bg-bg-tertiary animate-pulse" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text">Campaigns</h3>
          <p className="text-xs text-text-muted mt-0.5">Manage your email & SMS campaigns / ניהול קמפיינים</p>
        </div>
        <button
          onClick={onCreateCampaign}
          className="rounded-xl bg-gradient-to-r from-primary to-primary-hover px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          + Create Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-bg-secondary py-20 px-8">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
            <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-text mb-1">No campaigns yet</h3>
          <p className="text-xs text-text-muted mb-6 text-center max-w-xs">
            Create your first campaign to engage with your leads and customers.
          </p>
          <button
            onClick={onCreateCampaign}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {campaigns.map((campaign) => {
            const type = typeConfig[campaign.type]
            const status = statusConfig[campaign.status]
            const openRate = campaign.stats.sent > 0 ? ((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1) : '0'
            const clickRate = campaign.stats.sent > 0 ? ((campaign.stats.clicked / campaign.stats.sent) * 100).toFixed(1) : '0'

            return (
              <div
                key={campaign.id}
                className="group rounded-2xl border border-border bg-bg-secondary p-5 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
              >
                {/* Title & Status */}
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-text truncate pe-3">{campaign.name}</h4>
                  <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${type.bg} ${type.text}`}>
                    {type.label}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {campaign.stats.sent.toLocaleString()} recipients
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-bg-tertiary/50 p-2.5 text-center">
                    <p className="text-sm font-bold text-text">{campaign.stats.delivered.toLocaleString()}</p>
                    <p className="text-[10px] text-text-muted">Delivered</p>
                  </div>
                  <div className="rounded-xl bg-bg-tertiary/50 p-2.5 text-center">
                    <p className="text-sm font-bold text-success">{openRate}%</p>
                    <p className="text-[10px] text-text-muted">Open Rate</p>
                  </div>
                  <div className="rounded-xl bg-bg-tertiary/50 p-2.5 text-center">
                    <p className="text-sm font-bold text-secondary">{clickRate}%</p>
                    <p className="text-[10px] text-text-muted">Click Rate</p>
                  </div>
                </div>

                {/* Date */}
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">
                    {campaign.sentAt
                      ? `Sent ${new Date(campaign.sentAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                      : `Created ${new Date(campaign.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`}
                  </span>
                  <svg className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
