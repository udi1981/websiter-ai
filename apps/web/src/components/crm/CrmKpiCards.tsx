'use client'

type KpiData = {
  totalLeads: number
  leadsTrend: number
  activeCustomers: number
  monthRevenue: number
  conversionRate: number
}

type CrmKpiCardsProps = {
  data: KpiData | null
  loading: boolean
}

const SkeletonCard = () => (
  <div className="rounded-2xl border border-border bg-bg-secondary p-5 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-3 w-20 rounded-full bg-bg-tertiary" />
      <div className="h-9 w-9 rounded-xl bg-bg-tertiary" />
    </div>
    <div className="h-7 w-16 rounded-lg bg-bg-tertiary mb-1" />
    <div className="h-3 w-24 rounded-full bg-bg-tertiary" />
  </div>
)

const TrendArrow = ({ value }: { value: number }) => {
  const isPositive = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-success' : 'text-error'}`}>
      <svg className={`h-3 w-3 ${isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
      {Math.abs(value)}%
    </span>
  )
}

export const CrmKpiCards = ({ data, loading }: CrmKpiCardsProps) => {
  if (loading || !data) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  const cards = [
    {
      label: 'Total Leads',
      labelHe: 'סה"כ לידים',
      value: data.totalLeads.toLocaleString(),
      trend: data.leadsTrend,
      icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Active Customers',
      labelHe: 'לקוחות פעילים',
      value: data.activeCustomers.toLocaleString(),
      icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Monthly Revenue',
      labelHe: 'הכנסות חודשיות',
      value: `$${data.monthRevenue.toLocaleString()}`,
      icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      label: 'Conversion Rate',
      labelHe: 'אחוז המרה',
      value: `${data.conversionRate}%`,
      icon: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-border bg-bg-secondary p-5 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{card.label}</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bg}`}>
              <svg className={`h-4.5 w-4.5 ${card.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{card.value}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[11px] text-text-muted">{card.labelHe}</span>
            {card.trend !== undefined && <TrendArrow value={card.trend} />}
          </div>
        </div>
      ))}
    </div>
  )
}
