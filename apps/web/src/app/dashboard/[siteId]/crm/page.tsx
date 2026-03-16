'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { CrmKpiCards } from '../../../../components/crm/CrmKpiCards'
import { CrmOverviewTab } from '../../../../components/crm/CrmOverviewTab'
import { CrmLeadsTab } from '../../../../components/crm/CrmLeadsTab'
import { CrmCampaignsTab } from '../../../../components/crm/CrmCampaignsTab'
import { CrmAnalyticsTab } from '../../../../components/crm/CrmAnalyticsTab'

type Tab = 'overview' | 'leads' | 'campaigns' | 'analytics'

type KpiData = {
  totalLeads: number
  leadsTrend: number
  activeCustomers: number
  monthRevenue: number
  conversionRate: number
}

type LeadRow = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  score: number
  source: string
  createdAt: string
}

type CampaignRow = {
  id: string
  name: string
  type: 'email' | 'sms' | 'push'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  stats: { sent: number; delivered: number; opened: number; clicked: number }
  sentAt: string | null
  createdAt: string
}

type AnalyticsData = {
  pageViews: number
  uniqueVisitors: number
  avgSession: string
  bounceRate: number
  topPages: { path: string; views: number }[]
  topSources: { source: string; visits: number }[]
}

type CampaignSummary = {
  active: number
  totalSent: number
  avgOpenRate: number
  avgClickRate: number
}

const tabs: { value: Tab; label: string; labelHe: string; icon: string }[] = [
  {
    value: 'overview',
    label: 'Overview',
    labelHe: 'סקירה',
    icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
  },
  {
    value: 'leads',
    label: 'Leads',
    labelHe: 'לידים',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
  {
    value: 'campaigns',
    label: 'Campaigns',
    labelHe: 'קמפיינים',
    icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  },
  {
    value: 'analytics',
    label: 'Analytics',
    labelHe: 'אנליטיקס',
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
]

/** Demo data generator for development — will be replaced by real API calls */
const generateDemoData = () => {
  const kpi: KpiData = {
    totalLeads: 142,
    leadsTrend: 12,
    activeCustomers: 38,
    monthRevenue: 12400,
    conversionRate: 26.8,
  }

  const leads: LeadRow[] = [
    { id: 'lead_1', name: 'Sarah Mizrahi', email: 'sarah@gmail.com', phone: '052-1234567', status: 'qualified', score: 85, source: 'website_form', createdAt: '2026-03-15T10:30:00Z' },
    { id: 'lead_2', name: 'David Katz', email: 'david.k@mail.com', phone: '054-9876543', status: 'new', score: 45, source: 'chat', createdAt: '2026-03-15T08:15:00Z' },
    { id: 'lead_3', name: 'Maya Levi', email: 'maya@outlook.com', phone: null, status: 'contacted', score: 62, source: 'website_form', createdAt: '2026-03-14T16:45:00Z' },
    { id: 'lead_4', name: 'Dan Rosen', email: 'dan.r@company.io', phone: '03-6789012', status: 'converted', score: 95, source: 'manual', createdAt: '2026-03-14T09:20:00Z' },
    { id: 'lead_5', name: 'Noa Ben-David', email: 'noa.bd@gmail.com', phone: '050-5556789', status: 'new', score: 30, source: 'import', createdAt: '2026-03-13T14:00:00Z' },
    { id: 'lead_6', name: 'Amit Cohen', email: 'amit.c@work.co.il', phone: null, status: 'qualified', score: 78, source: 'website_form', createdAt: '2026-03-13T11:30:00Z' },
    { id: 'lead_7', name: 'Rachel Goldberg', email: 'rachel.g@email.com', phone: '058-1112233', status: 'lost', score: 20, source: 'chat', createdAt: '2026-03-12T15:45:00Z' },
    { id: 'lead_8', name: 'Yossi Abramov', email: 'yossi@startup.io', phone: '054-4445566', status: 'contacted', score: 55, source: 'api', createdAt: '2026-03-12T10:00:00Z' },
  ]

  const campaigns: CampaignRow[] = [
    { id: 'camp_1', name: 'Spring Sale 2026', type: 'email', status: 'sent', stats: { sent: 1250, delivered: 1198, opened: 456, clicked: 89 }, sentAt: '2026-03-10T09:00:00Z', createdAt: '2026-03-08T14:00:00Z' },
    { id: 'camp_2', name: 'New Collection Alert', type: 'email', status: 'sent', stats: { sent: 980, delivered: 945, opened: 312, clicked: 67 }, sentAt: '2026-03-05T10:00:00Z', createdAt: '2026-03-03T11:00:00Z' },
    { id: 'camp_3', name: 'Flash Sale SMS', type: 'sms', status: 'draft', stats: { sent: 0, delivered: 0, opened: 0, clicked: 0 }, sentAt: null, createdAt: '2026-03-14T16:00:00Z' },
    { id: 'camp_4', name: 'Welcome Series', type: 'email', status: 'scheduled', stats: { sent: 0, delivered: 0, opened: 0, clicked: 0 }, sentAt: null, createdAt: '2026-03-12T09:00:00Z' },
  ]

  const analytics: AnalyticsData = {
    pageViews: 8432,
    uniqueVisitors: 3216,
    avgSession: '2m 34s',
    bounceRate: 42.1,
    topPages: [
      { path: '/', views: 3245 },
      { path: '/products', views: 1876 },
      { path: '/about', views: 982 },
      { path: '/contact', views: 754 },
      { path: '/blog/top-10-tips', views: 621 },
    ],
    topSources: [
      { source: 'Google', visits: 1845 },
      { source: 'Direct', visits: 1234 },
      { source: 'Facebook', visits: 678 },
      { source: 'Instagram', visits: 456 },
      { source: 'Email', visits: 234 },
    ],
  }

  const campaignSummary: CampaignSummary = {
    active: 2,
    totalSent: 2230,
    avgOpenRate: 34.4,
    avgClickRate: 7.0,
  }

  return { kpi, leads, campaigns, analytics, campaignSummary }
}

const CrmDashboardPage = () => {
  const params = useParams()
  const siteId = params.siteId as string

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [campaignSummary, setCampaignSummary] = useState<CampaignSummary | null>(null)

  const fetchCrmData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Try fetching from real API first
      const [leadsRes, campaignsRes, analyticsRes] = await Promise.allSettled([
        fetch(`/api/crm/leads?siteId=${siteId}`),
        fetch(`/api/crm/campaigns?siteId=${siteId}`),
        fetch(`/api/crm/analytics?siteId=${siteId}`),
      ])

      // If all API calls fail (expected during dev), use demo data
      const allFailed =
        leadsRes.status === 'rejected' ||
        (leadsRes.status === 'fulfilled' && !leadsRes.value.ok) ||
        campaignsRes.status === 'rejected' ||
        (campaignsRes.status === 'fulfilled' && !campaignsRes.value.ok)

      if (allFailed) {
        // Use demo data for development
        const demo = generateDemoData()
        setKpi(demo.kpi)
        setLeads(demo.leads)
        setCampaigns(demo.campaigns)
        setAnalytics(demo.analytics)
        setCampaignSummary(demo.campaignSummary)
      } else {
        // Parse real API responses
        if (leadsRes.status === 'fulfilled' && leadsRes.value.ok) {
          const data = await leadsRes.value.json()
          setLeads(data.data || [])
        }
        if (campaignsRes.status === 'fulfilled' && campaignsRes.value.ok) {
          const data = await campaignsRes.value.json()
          setCampaigns(data.data || [])
        }
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
          const data = await analyticsRes.value.json()
          setAnalytics(data.data || null)
        }
      }
    } catch {
      // Fallback to demo data on network error
      const demo = generateDemoData()
      setKpi(demo.kpi)
      setLeads(demo.leads)
      setCampaigns(demo.campaigns)
      setAnalytics(demo.analytics)
      setCampaignSummary(demo.campaignSummary)
    } finally {
      setLoading(false)
    }
  }, [siteId])

  useEffect(() => {
    fetchCrmData()
  }, [fetchCrmData])

  const handleAddLead = () => {
    // Placeholder — will open lead creation modal
    alert('Add Lead modal coming soon')
  }

  const handleCreateCampaign = () => {
    // Placeholder — will open campaign creation flow
    alert('Create Campaign flow coming soon')
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/dashboard" className="text-text-muted hover:text-text transition-colors">
          Dashboard
        </Link>
        <svg className="h-4 w-4 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-text font-medium">CRM</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">CRM Dashboard</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage leads, campaigns & analytics / ניהול לידים, קמפיינים ואנליטיקס
          </p>
        </div>
        <button
          onClick={fetchCrmData}
          disabled={loading}
          className="rounded-xl border border-border bg-bg-secondary px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text hover:border-primary/30 transition-all disabled:opacity-50 shrink-0"
        >
          <span className="flex items-center gap-2">
            <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Refresh
          </span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="mb-8">
        <CrmKpiCards data={kpi} loading={loading} />
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-1 overflow-x-auto -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text hover:border-border'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
              <span className="hidden sm:inline text-[11px] text-text-muted">/ {tab.labelHe}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <CrmOverviewTab
            recentLeads={leads.slice(0, 5).map((l) => ({
              id: l.id,
              name: l.name,
              email: l.email,
              status: l.status,
              createdAt: l.createdAt,
            }))}
            campaignSummary={campaignSummary}
            loading={loading}
            onAddLead={handleAddLead}
            onCreateCampaign={handleCreateCampaign}
            onViewAnalytics={() => setActiveTab('analytics')}
          />
        )}
        {activeTab === 'leads' && (
          <CrmLeadsTab
            leads={leads}
            loading={loading}
            onAddLead={handleAddLead}
          />
        )}
        {activeTab === 'campaigns' && (
          <CrmCampaignsTab
            campaigns={campaigns}
            loading={loading}
            onCreateCampaign={handleCreateCampaign}
          />
        )}
        {activeTab === 'analytics' && (
          <CrmAnalyticsTab
            data={analytics}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}

export default CrmDashboardPage
