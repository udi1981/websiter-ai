'use client'

import { useState } from 'react'

type AnalyticsData = {
  pageViews: number
  uniqueVisitors: number
  avgSession: string
  bounceRate: number
  topPages: { path: string; views: number }[]
  topSources: { source: string; visits: number }[]
}

type CrmAnalyticsTabProps = {
  data: AnalyticsData | null
  loading: boolean
}

type Period = '1d' | '7d' | '30d' | '90d' | 'all'

const periods: { value: Period; label: string }[] = [
  { value: '1d', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'all', label: 'All Time' },
]

const SkeletonMetric = () => (
  <div className="rounded-2xl border border-border bg-bg-secondary p-5 animate-pulse">
    <div className="h-3 w-20 rounded bg-bg-tertiary mb-3" />
    <div className="h-7 w-16 rounded bg-bg-tertiary" />
  </div>
)

const SkeletonList = () => (
  <div className="rounded-2xl border border-border bg-bg-secondary p-5 animate-pulse">
    <div className="h-5 w-24 rounded bg-bg-tertiary mb-4" />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex justify-between py-2">
        <div className="h-4 w-32 rounded bg-bg-tertiary" />
        <div className="h-4 w-12 rounded bg-bg-tertiary" />
      </div>
    ))}
  </div>
)

export const CrmAnalyticsTab = ({ data, loading }: CrmAnalyticsTabProps) => {
  const [period, setPeriod] = useState<Period>('30d')

  return (
    <div>
      {/* Period Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              period === p.value
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-bg-secondary text-text-muted border border-border hover:border-primary/30 hover:text-text'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Metric Cards */}
      {loading || !data ? (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMetric key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            { label: 'Page Views', labelHe: 'צפיות בדף', value: data.pageViews.toLocaleString(), color: 'text-primary' },
            { label: 'Unique Visitors', labelHe: 'מבקרים ייחודיים', value: data.uniqueVisitors.toLocaleString(), color: 'text-secondary' },
            { label: 'Avg Session', labelHe: 'זמן ממוצע', value: data.avgSession, color: 'text-amber-500' },
            { label: 'Bounce Rate', labelHe: 'שיעור נטישה', value: `${data.bounceRate}%`, color: data.bounceRate > 60 ? 'text-error' : 'text-success' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-border bg-bg-secondary p-5 transition-all hover:border-primary/20"
            >
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{metric.label}</span>
              <p className={`text-2xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
              <p className="text-[11px] text-text-muted mt-1">{metric.labelHe}</p>
            </div>
          ))}
        </div>
      )}

      {/* Top Pages & Sources */}
      {loading || !data ? (
        <div className="grid gap-5 md:grid-cols-2">
          <SkeletonList />
          <SkeletonList />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {/* Top Pages */}
          <div className="rounded-2xl border border-border bg-bg-secondary p-5">
            <h4 className="font-semibold text-text mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Top Pages / דפים מובילים
            </h4>
            {data.topPages.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">No page data yet</p>
            ) : (
              <div className="space-y-1">
                {data.topPages.map((page, i) => {
                  const maxViews = data.topPages[0]?.views || 1
                  return (
                    <div key={page.path} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-bg-tertiary/50 transition-colors">
                      <span className="text-xs font-semibold text-text-muted w-5 text-end">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text truncate">{page.path}</p>
                        <div className="mt-1 h-1 rounded-full bg-bg-tertiary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                            style={{ width: `${(page.views / maxViews) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-text-muted shrink-0">{page.views.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="rounded-2xl border border-border bg-bg-secondary p-5">
            <h4 className="font-semibold text-text mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              Traffic Sources / מקורות תנועה
            </h4>
            {data.topSources.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">No source data yet</p>
            ) : (
              <div className="space-y-1">
                {data.topSources.map((source, i) => {
                  const maxVisits = data.topSources[0]?.visits || 1
                  const colors = ['from-secondary to-secondary/60', 'from-primary to-primary/60', 'from-amber-500 to-amber-500/60', 'from-success to-success/60', 'from-purple-500 to-purple-500/60']
                  return (
                    <div key={source.source} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-bg-tertiary/50 transition-colors">
                      <span className="text-xs font-semibold text-text-muted w-5 text-end">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text capitalize">{source.source}</p>
                        <div className="mt-1 h-1 rounded-full bg-bg-tertiary overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]}`}
                            style={{ width: `${(source.visits / maxVisits) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-text-muted shrink-0">{source.visits.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
