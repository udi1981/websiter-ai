import { NextResponse } from 'next/server'
import type { CrmDashboardSummary, TopPageEntry, TopSourceEntry } from '@ubuilder/types'

/**
 * Simple hash function to generate consistent pseudo-random numbers from a siteId.
 * This ensures the same siteId always returns the same mock data.
 */
const hashSeed = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/** Generate a seeded pseudo-random number in a range */
const seededRandom = (seed: number, min: number, max: number): number => {
  const x = Math.sin(seed) * 10000
  const normalized = x - Math.floor(x)
  return Math.floor(normalized * (max - min + 1)) + min
}

/** Generate realistic mock analytics for a period */
const generateMockAnalytics = (siteId: string, period: string) => {
  const seed = hashSeed(siteId)

  // Period multipliers for realistic scaling
  const multipliers: Record<string, number> = {
    today: 1,
    week: 7,
    month: 30,
    year: 365,
    all: 730,
  }
  const mult = multipliers[period] || 1

  const baseViews = seededRandom(seed, 50, 500)
  const baseVisitors = Math.floor(baseViews * 0.65)
  const baseConversions = seededRandom(seed + 1, 2, 20)
  const avgOrderValue = seededRandom(seed + 2, 50, 500)

  const pageViews = baseViews * mult + seededRandom(seed + 3, 0, mult * 10)
  const uniqueVisitors = Math.floor(baseVisitors * mult * 0.85)
  const conversions = baseConversions * mult + seededRandom(seed + 4, 0, mult)
  const revenue = conversions * avgOrderValue

  const bounceRate = 30 + seededRandom(seed + 5, 0, 35) // 30-65%

  const topPages: TopPageEntry[] = [
    { path: '/', views: Math.floor(pageViews * 0.35) },
    { path: '/about', views: Math.floor(pageViews * 0.15) },
    { path: '/services', views: Math.floor(pageViews * 0.12) },
    { path: '/contact', views: Math.floor(pageViews * 0.10) },
    { path: '/blog', views: Math.floor(pageViews * 0.08) },
    { path: '/pricing', views: Math.floor(pageViews * 0.07) },
    { path: '/portfolio', views: Math.floor(pageViews * 0.05) },
  ]

  const topSources: TopSourceEntry[] = [
    { source: 'Google', visits: Math.floor(uniqueVisitors * 0.40) },
    { source: 'Direct', visits: Math.floor(uniqueVisitors * 0.25) },
    { source: 'Facebook', visits: Math.floor(uniqueVisitors * 0.12) },
    { source: 'Instagram', visits: Math.floor(uniqueVisitors * 0.08) },
    { source: 'LinkedIn', visits: Math.floor(uniqueVisitors * 0.05) },
    { source: 'Twitter/X', visits: Math.floor(uniqueVisitors * 0.03) },
    { source: 'Referral', visits: Math.floor(uniqueVisitors * 0.07) },
  ]

  return {
    pageViews,
    uniqueVisitors,
    conversions,
    revenue,
    bounceRate,
    topPages,
    topSources,
    avgSessionDuration: seededRandom(seed + 6, 45, 300), // seconds
  }
}

/**
 * GET /api/crm/analytics
 * Return dashboard analytics and CRM summary metrics for a site.
 *
 * Query params:
 *   siteId (required), period (today|week|month|year|all, default: month)
 *
 * Returns mock analytics data that is consistent per siteId.
 * TODO: Replace with real analytics aggregation from Drizzle ORM when DB connected
 */
export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json(
        { ok: false, error: 'siteId is required' },
        { status: 400 }
      )
    }

    const period = searchParams.get('period') || 'month'
    const validPeriods = ['today', 'week', 'month', 'year', 'all']
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { ok: false, error: `Invalid period. Must be one of: ${validPeriods.join(', ')}` },
        { status: 400 }
      )
    }

    // TODO: Replace with Drizzle ORM aggregation queries when DB connected
    const analytics = generateMockAnalytics(siteId, period)
    const todayAnalytics = generateMockAnalytics(siteId, 'today')
    const weekAnalytics = generateMockAnalytics(siteId, 'week')

    const seed = hashSeed(siteId)

    // CRM summary metrics (mock)
    const leadCount = seededRandom(seed + 10, 15, 200)
    const customerCount = seededRandom(seed + 11, 5, 80)
    const campaignCount = seededRandom(seed + 12, 2, 15)

    const summary: CrmDashboardSummary = {
      siteId,
      leads: {
        total: leadCount,
        new: seededRandom(seed + 13, 3, Math.floor(leadCount * 0.3)),
        qualified: seededRandom(seed + 14, 2, Math.floor(leadCount * 0.2)),
        converted: customerCount,
        conversionRate: Math.round((customerCount / Math.max(leadCount, 1)) * 100),
      },
      customers: {
        total: customerCount,
        totalRevenue: analytics.revenue,
        avgOrderValue: customerCount > 0 ? Math.round(analytics.revenue / customerCount) : 0,
      },
      campaigns: {
        active: seededRandom(seed + 15, 1, Math.min(campaignCount, 5)),
        totalSent: seededRandom(seed + 16, 500, 10000),
        avgOpenRate: 15 + seededRandom(seed + 17, 0, 30), // 15-45%
        avgClickRate: 2 + seededRandom(seed + 18, 0, 10), // 2-12%
      },
      analytics: {
        todayPageViews: todayAnalytics.pageViews,
        todayVisitors: todayAnalytics.uniqueVisitors,
        weeklyPageViews: weekAnalytics.pageViews,
        weeklyVisitors: weekAnalytics.uniqueVisitors,
        bounceRate: analytics.bounceRate,
      },
      recentInteractions: [], // TODO: Populate from interactions store when DB connected
    }

    return NextResponse.json({
      ok: true,
      data: {
        period,
        analytics: {
          pageViews: analytics.pageViews,
          uniqueVisitors: analytics.uniqueVisitors,
          conversions: analytics.conversions,
          revenue: analytics.revenue,
          bounceRate: analytics.bounceRate,
          avgSessionDuration: analytics.avgSessionDuration,
          topPages: analytics.topPages,
          topSources: analytics.topSources,
        },
        summary,
        leadCount,
        customerCount,
        campaignCount,
      },
    })
  } catch (err) {
    console.error('CRM Analytics GET error:', err)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
