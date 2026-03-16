'use client'

import { useState } from 'react'

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'

type Lead = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  status: LeadStatus
  score: number
  source: string
  createdAt: string
}

type CrmLeadsTabProps = {
  leads: Lead[]
  loading: boolean
  onAddLead: () => void
}

const statusConfig: Record<LeadStatus, { label: string; labelHe: string; bg: string; text: string; dot: string }> = {
  new: { label: 'New', labelHe: 'חדש', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  contacted: { label: 'Contacted', labelHe: 'נוצר קשר', bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  qualified: { label: 'Qualified', labelHe: 'מתאים', bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  converted: { label: 'Converted', labelHe: 'הומר', bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  lost: { label: 'Lost', labelHe: 'אבד', bg: 'bg-error/10', text: 'text-error', dot: 'bg-error' },
}

const filterOptions: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
]

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-bg-tertiary" /></td>
    <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-bg-tertiary" /></td>
    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-24 rounded bg-bg-tertiary" /></td>
    <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-bg-tertiary" /></td>
    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3 w-full rounded-full bg-bg-tertiary" /></td>
    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-16 rounded bg-bg-tertiary" /></td>
    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-20 rounded bg-bg-tertiary" /></td>
  </tr>
)

export const CrmLeadsTab = ({ leads, loading, onAddLead }: CrmLeadsTabProps) => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all')

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      (lead.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (lead.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (lead.phone?.includes(search) ?? false)
    const matchesFilter = filter === 'all' || lead.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search leads... / חיפוש לידים..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg-secondary py-2.5 ps-10 pe-4 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        <button
          onClick={onAddLead}
          className="rounded-xl bg-gradient-to-r from-primary to-primary-hover px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all shrink-0"
        >
          + Add Lead / הוסף ליד
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              filter === opt.value
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-bg-secondary text-text-muted border border-border hover:border-primary/30 hover:text-text'
            }`}
          >
            {opt.label}
            {opt.value !== 'all' && (
              <span className="ms-1.5 opacity-70">
                ({leads.filter((l) => l.status === opt.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-bg-secondary">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Phone</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Score</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Source</th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-tertiary">
                      <svg className="h-7 w-7 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-text mb-1">No leads found</p>
                    <p className="text-xs text-text-muted">
                      {search || filter !== 'all' ? 'Try adjusting your filters' : 'Leads will appear here when visitors interact with your site'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((lead) => {
                const status = statusConfig[lead.status]
                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-bg-tertiary/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">
                            {(lead.name || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-text truncate">{lead.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted truncate max-w-[200px]">{lead.email || '-'}</td>
                    <td className="px-4 py-3 text-text-muted hidden md:table-cell">{lead.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                            style={{ width: `${Math.min(lead.score, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted w-7 text-end">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs hidden lg:table-cell capitalize">{lead.source.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-text-muted text-xs hidden md:table-cell">
                      {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <div className="mt-3 text-xs text-text-muted text-end">
          Showing {filtered.length} of {leads.length} leads
        </div>
      )}
    </div>
  )
}
