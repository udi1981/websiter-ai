/** Lead source channels */
export type LeadSource = 'website_form' | 'chat' | 'manual' | 'import' | 'api'

/** Lead lifecycle status */
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'

/** Interaction types across all touchpoints */
export type InteractionType =
  | 'page_view'
  | 'form_submit'
  | 'chat_message'
  | 'email_open'
  | 'email_click'
  | 'purchase'
  | 'phone_call'
  | 'note'

/** Interaction channel */
export type InteractionChannel = 'website' | 'email' | 'phone' | 'chat' | 'social' | 'manual'

/** Campaign delivery type */
export type CampaignType = 'email' | 'sms' | 'push'

/** Campaign lifecycle status */
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'

/** A lead captured from a site */
export type Lead = {
  id: string
  siteId: string
  name: string | null
  email: string | null
  phone: string | null
  source: LeadSource
  status: LeadStatus
  score: number
  notes: string | null
  metadata: Record<string, unknown> | null
  assignedTo: string | null
  createdAt: Date
  updatedAt: Date
}

/** A converted customer */
export type Customer = {
  id: string
  siteId: string
  leadId: string | null
  name: string
  email: string
  phone: string | null
  company: string | null
  totalSpent: number
  orderCount: number
  tags: string[]
  metadata: Record<string, unknown> | null
  lastActivityAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** A single interaction/touchpoint */
export type Interaction = {
  id: string
  siteId: string
  leadId: string | null
  customerId: string | null
  type: InteractionType
  channel: InteractionChannel
  data: Record<string, unknown>
  createdAt: Date
}

/** Campaign stats */
export type CampaignStats = {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
}

/** An email/SMS/push campaign */
export type Campaign = {
  id: string
  siteId: string
  name: string
  subject: string
  type: CampaignType
  status: CampaignStatus
  content: string
  audience: Record<string, unknown>
  stats: CampaignStats
  scheduledAt: Date | null
  sentAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** Top page entry in analytics */
export type TopPageEntry = {
  path: string
  views: number
}

/** Top source entry in analytics */
export type TopSourceEntry = {
  source: string
  visits: number
}

/** Daily aggregated analytics for a site */
export type Analytics = {
  id: string
  siteId: string
  date: string
  pageViews: number
  uniqueVisitors: number
  avgSessionDuration: number
  bounceRate: number
  topPages: TopPageEntry[]
  topSources: TopSourceEntry[]
  conversions: number
  revenue: number
  createdAt: Date
}

/** CRM dashboard summary for a site */
export type CrmDashboardSummary = {
  siteId: string
  leads: {
    total: number
    new: number
    qualified: number
    converted: number
    conversionRate: number
  }
  customers: {
    total: number
    totalRevenue: number
    avgOrderValue: number
  }
  campaigns: {
    active: number
    totalSent: number
    avgOpenRate: number
    avgClickRate: number
  }
  analytics: {
    todayPageViews: number
    todayVisitors: number
    weeklyPageViews: number
    weeklyVisitors: number
    bounceRate: number
  }
  recentInteractions: Interaction[]
}
