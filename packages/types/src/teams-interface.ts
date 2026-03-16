/** Interface between Team 100 (builders) and Team 101 (infrastructure) */

/** Site configuration passed during handoff */
export type HandoffSiteConfig = {
  businessType: string
  businessName: string
  language: string
  features: string[]
  pages: string[]
  hasBlog: boolean
  hasContactForm: boolean
  hasEcommerce: boolean
  hasChatbot: boolean
}

/** When Team 100 finishes building a site, it hands off to Team 101 */
export type SiteHandoff = {
  siteId: string
  builtBy: 'team100'
  handoffTo: 'team101'
  siteConfig: HandoffSiteConfig
  discoveryContext: Record<string, unknown>
  timestamp: string
}

/** Team 101 activation plan after receiving handoff */
export type Team101Activation = {
  siteId: string
  plan: {
    immediate: string[]
    day1: string[]
    week1: string[]
    ongoing: string[]
  }
  estimatedSetupTime: string
}
