/**
 * Team 101 — Post-Publish Infrastructure Agents
 *
 * NOT YET IMPLEMENTED as real agents.
 * Currently only provides types and the chatbot widget helper.
 * Real agent orchestration is planned for a future phase.
 */

import { generateChatbotWidget } from './chatbot-widget'

export type Team101AgentStatus = 'active' | 'inactive' | 'pending'

export type Team101State = {
  siteId: string
  activatedAt: string
  agents: {
    crm: { status: Team101AgentStatus; leadsCount: number; lastActivity?: string }
    chatbot: { status: Team101AgentStatus; conversationsCount: number; enabled: boolean }
    analytics: { status: Team101AgentStatus; pageViews: number }
    seoMonitor: { status: Team101AgentStatus; score?: number; lastCheck?: string }
    contentScheduler: { status: Team101AgentStatus; postsPlanned: number }
    campaignManager: { status: Team101AgentStatus; campaignsActive: number }
  }
}

/** Activate Team 101 for a published site — currently a no-op placeholder */
export const activateTeam101 = async (_siteId: string, _siteContext: {
  siteName: string
  businessType: string
  locale?: string
  primaryColor?: string
  html?: string
}): Promise<null> => {
  // No-op: real agent activation not yet implemented
  return null
}

/** Get Team 101 status for a site — not yet implemented */
export const getTeam101Status = (_siteId: string): null => {
  return null
}

/** Generate chatbot widget HTML for injection into published site */
export const getChatbotWidgetHtml = (siteId: string, opts?: {
  primaryColor?: string
  locale?: string
  greeting?: string
}): string => {
  return generateChatbotWidget(siteId, {
    primaryColor: opts?.primaryColor,
    locale: opts?.locale as 'en' | 'he',
    greeting: opts?.greeting,
  })
}

/** Handoff data from Team 100 to Team 101 */
export type Team100Handoff = {
  siteId: string
  siteName: string
  businessType: string
  locale: string
  colorPalette: Record<string, string>
  typography: { headingFont: string; bodyFont: string }
  sections: { type: string; title?: string }[]
  seoKeywords?: string[]
}
