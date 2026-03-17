/**
 * Sites API client — Hybrid localStorage + Database persistence.
 * Reads from localStorage for speed, syncs to DB for durability.
 * During migration: localStorage is the primary source, DB is backup.
 */

type SiteData = {
  id: string
  name: string
  slug?: string
  status?: string
  industry?: string
  primaryColor?: string
  logoSvg?: string
  html?: string
  buildPlan?: unknown
  version?: number
  sourceUrl?: string
  createdAt?: string
  updatedAt?: string
}

const STORAGE_KEY = 'ubuilder_sites'

/** Get current user ID from localStorage (until real auth is wired) */
const getUserId = (): string => {
  try {
    const user = JSON.parse(localStorage.getItem('ubuilder_user') || '{}')
    return user.id || 'demo_user'
  } catch {
    return 'demo_user'
  }
}

/** Read sites list from localStorage */
const getLocalSites = (): SiteData[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

/** Save sites list to localStorage */
const setLocalSites = (sites: SiteData[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites))
  } catch {
    // Safari private browsing may throw
  }
}

/** Sync a site to the database (fire-and-forget) */
const syncToDb = async (siteId: string, data: Partial<SiteData>) => {
  try {
    const userId = getUserId()
    const res = await fetch(`/api/sites/${siteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      // Site might not exist in DB yet — try creating it
      if (res.status === 404) {
        const localSite = getLocalSites().find(s => s.id === siteId)
        if (localSite) {
          await fetch('/api/sites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId,
            },
            body: JSON.stringify({
              ...localSite,
              ...data,
              html: data.html || localStorage.getItem(`ubuilder_html_${siteId}`) || undefined,
            }),
          })
        }
      }
    }
  } catch (err) {
    console.warn('[sites-api] DB sync failed (non-critical):', err)
  }
}

/** Create a new site — saves to localStorage + DB */
export const createSite = async (site: SiteData & { html?: string }): Promise<SiteData> => {
  // Save to localStorage immediately
  const sites = getLocalSites()
  const existing = sites.findIndex(s => s.id === site.id)
  if (existing >= 0) {
    sites[existing] = { ...sites[existing], ...site }
  } else {
    sites.push(site)
  }
  setLocalSites(sites)

  if (site.html) {
    try {
      localStorage.setItem(`ubuilder_html_${site.id}`, site.html)
    } catch { /* quota exceeded */ }
  }

  // Sync to DB in background
  const userId = getUserId()
  fetch('/api/sites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(site),
  }).catch(err => console.warn('[sites-api] DB create failed:', err))

  return site
}

/** Update a site — saves to localStorage + DB */
export const updateSite = async (siteId: string, data: Partial<SiteData>): Promise<void> => {
  // Update localStorage immediately
  const sites = getLocalSites()
  const idx = sites.findIndex(s => s.id === siteId)
  if (idx >= 0) {
    sites[idx] = { ...sites[idx], ...data, updatedAt: new Date().toISOString() }
    setLocalSites(sites)
  }

  // Sync HTML to localStorage
  if (data.html) {
    try {
      localStorage.setItem(`ubuilder_html_${siteId}`, data.html)
    } catch { /* quota exceeded */ }
  }

  // Sync to DB in background
  syncToDb(siteId, data)
}

/** Update only the HTML of a site */
export const updateSiteHtml = async (siteId: string, html: string): Promise<void> => {
  try {
    localStorage.setItem(`ubuilder_html_${siteId}`, html)
  } catch { /* quota exceeded */ }

  // Debounced DB sync — don't hammer the API on every keystroke
  clearTimeout((updateSiteHtml as any)._timer)
  ;(updateSiteHtml as any)._timer = setTimeout(() => {
    syncToDb(siteId, { html })
  }, 3000) // Sync every 3 seconds max
}

/** Get a site by ID — localStorage first, then DB fallback */
export const getSite = async (siteId: string): Promise<SiteData | null> => {
  // Try localStorage first
  const local = getLocalSites().find(s => s.id === siteId)
  if (local) return local

  // Fallback to DB
  try {
    const userId = getUserId()
    const res = await fetch(`/api/sites/${siteId}`, {
      headers: { 'x-user-id': userId },
    })
    if (res.ok) {
      const { data } = await res.json()
      return data
    }
  } catch {
    // DB unavailable
  }

  return null
}

/** Get site HTML — localStorage first, then DB fallback */
export const getSiteHtml = async (siteId: string): Promise<string | null> => {
  // Try localStorage first
  const localHtml = localStorage.getItem(`ubuilder_html_${siteId}`)
  if (localHtml) return localHtml

  // Fallback to DB
  try {
    const userId = getUserId()
    const res = await fetch(`/api/sites/${siteId}`, {
      headers: { 'x-user-id': userId },
    })
    if (res.ok) {
      const { data } = await res.json()
      if (data?.html) {
        // Cache in localStorage
        try {
          localStorage.setItem(`ubuilder_html_${siteId}`, data.html)
        } catch { /* quota */ }
        return data.html
      }
    }
  } catch {
    // DB unavailable
  }

  return null
}

/** List all sites — localStorage first, then DB fallback */
export const listSites = async (): Promise<SiteData[]> => {
  const local = getLocalSites()
  if (local.length > 0) return local

  // Fallback to DB
  try {
    const userId = getUserId()
    const res = await fetch('/api/sites', {
      headers: { 'x-user-id': userId },
    })
    if (res.ok) {
      const { data } = await res.json()
      if (data?.length > 0) {
        setLocalSites(data)
        return data
      }
    }
  } catch {
    // DB unavailable
  }

  return local
}

/** Delete (archive) a site */
export const deleteSite = async (siteId: string): Promise<void> => {
  // Remove from localStorage
  const sites = getLocalSites().filter(s => s.id !== siteId)
  setLocalSites(sites)

  try {
    localStorage.removeItem(`ubuilder_html_${siteId}`)
    localStorage.removeItem(`ubuilder_version_${siteId}`)
    localStorage.removeItem(`ubuilder_chat_${siteId}`)
    localStorage.removeItem(`ubuilder_logo_${siteId}`)
    localStorage.removeItem(`ubuilder_plan_${siteId}`)
  } catch { /* ignore */ }

  // Archive in DB
  fetch(`/api/sites/${siteId}`, { method: 'DELETE' }).catch(() => {})
}

/** Sync all localStorage sites to DB (call once on login/app init) */
export const syncAllToDb = async (): Promise<void> => {
  const sites = getLocalSites()
  const userId = getUserId()

  for (const site of sites) {
    try {
      const html = localStorage.getItem(`ubuilder_html_${site.id}`)
      await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          ...site,
          html: html || undefined,
        }),
      })
    } catch {
      // Skip failed syncs
    }
  }
}
