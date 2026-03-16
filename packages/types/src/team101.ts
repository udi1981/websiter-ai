/** Team 101 — Site Infrastructure Agents */

/** Agent roles in Team 101 */
export type Team101Agent =
  | 'crm-manager'
  | 'analytics-engine'
  | 'campaign-manager'
  | 'content-scheduler'
  | 'seo-monitor'
  | 'chatbot-agent'

/** Configuration for a single Team 101 agent */
export type Team101AgentConfig = {
  agent: Team101Agent
  status: 'active' | 'paused' | 'not_configured'
  config: Record<string, unknown>
  schedule?: string
  lastRun?: string
  nextRun?: string
}

/** A task in the Team 101 Gantt chart */
export type Team101GanttTask = {
  task: string
  agent: Team101Agent
  startDate: string
  endDate: string
  dependencies: string[]
  status: 'pending' | 'in_progress' | 'done'
}

/** Team work plan for a site */
export type Team101WorkPlan = {
  siteId: string
  agents: Team101AgentConfig[]
  gantt: Team101GanttTask[]
}
