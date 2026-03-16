'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

type SiteStatus = 'published' | 'draft' | 'archived'

type Site = {
  id: string
  name: string
  status: SiteStatus
  lastEdited: string
  url: string
  description?: string
  template?: string
  html?: string
}

const statusStyles: Record<SiteStatus, { bg: string; text: string; label: string; dot: string }> = {
  published: { bg: 'bg-success/10', text: 'text-success', label: 'Published', dot: 'bg-success' },
  draft: { bg: 'bg-warning/10', text: 'text-warning', label: 'Draft', dot: 'bg-warning' },
  archived: { bg: 'bg-text-muted/10', text: 'text-text-muted', label: 'Archived', dot: 'bg-text-muted' },
}

const quickStartTemplates = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Perfect for cafes, bars & restaurants',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
  },
  {
    id: 'saas',
    name: 'SaaS Product',
    description: 'Launch your software product',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Start selling products online',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
  },
]

const DashboardPage = () => {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ubuilder_user')
      if (!stored) {
        router.push('/login')
        return
      }
      setUser(JSON.parse(stored))

      const savedSites = localStorage.getItem('ubuilder_sites')
      if (savedSites) {
        setSites(JSON.parse(savedSites))
      }
    } catch {
      // Corrupted localStorage, reset
      router.push('/login')
      return
    }
    setLoading(false)
  }, [router])

  const deleteSite = (id: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return
    const updated = sites.filter(s => s.id !== id)
    setSites(updated)
    localStorage.setItem('ubuilder_sites', JSON.stringify(updated))
  }

  const handleQuickStart = async (templateId: string) => {
    const siteId = `site_${Date.now()}`
    const template = quickStartTemplates.find(t => t.id === templateId)
    const name = template ? `${template.name} Site` : 'New Site'

    let html = ''
    try {
      const res = await fetch(`/templates/${templateId}/index.html`)
      html = await res.text()
    } catch {
      // fallback empty
    }

    const savedSites = (() => {
      try {
        const stored = localStorage.getItem('ubuilder_sites')
        return stored ? JSON.parse(stored) : []
      } catch {
        return []
      }
    })()
    savedSites.push({
      id: siteId,
      name,
      status: 'draft',
      lastEdited: 'Just now',
      url: `${name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}.ubuilder.co`,
      description: '',
      template: templateId,
      html,
    })
    localStorage.setItem('ubuilder_sites', JSON.stringify(savedSites))
    router.push(`/editor/${siteId}`)
  }

  // Stats
  const totalSites = sites.length
  const publishedCount = sites.filter(s => s.status === 'published').length
  const draftCount = sites.filter(s => s.status === 'draft').length
  const totalViews = totalSites * 1247 + 389 // fake but consistent

  const stats = [
    { label: 'Total Sites', value: totalSites, icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Published', value: publishedCount, icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-success', bg: 'bg-success/10' },
    { label: 'Drafts', value: draftCount, icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10', color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-secondary', bg: 'bg-secondary/10' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-text sm:text-2xl">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-text-muted">Create and manage your websites</p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-hover px-6 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-primary/30 transition-all w-full sm:w-auto"
        >
          + New Site
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-3 grid-cols-2 lg:grid-cols-4 sm:mb-8 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-bg-secondary p-3 sm:p-5 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{stat.label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg}`}>
                <svg className={`h-4.5 w-4.5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {sites.length === 0 ? (
        <>
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-bg-secondary py-20 px-8 mb-10">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text mb-2">Create your first website</h2>
            <p className="text-sm text-text-muted mb-8 text-center max-w-sm">
              Describe what you need and our AI will build it for you in minutes. Or start from a template.
            </p>
            <Link
              href="/dashboard/new"
              className="rounded-full bg-gradient-to-r from-primary to-primary-hover px-8 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all"
            >
              Create your first website
            </Link>
          </div>

          {/* Quick Start Templates */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text">Quick Start</h2>
              <Link href="/dashboard/new" className="text-sm text-primary hover:text-primary-hover transition-colors">
                View all templates
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {quickStartTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-bg-secondary transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={template.image}
                      alt={template.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/90 to-transparent" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-bg/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleQuickStart(template.id)}
                        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-hover transition-colors"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-text mb-1">{template.name}</h3>
                    <p className="text-xs text-text-muted">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Sites Grid */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">Your Sites</h2>
            <span className="text-sm text-text-muted">{sites.length} site{sites.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {/* Create New Site Card */}
            <Link
              href="/dashboard/new"
              className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-8 text-text-muted hover:border-primary hover:text-primary transition-all group bg-bg-secondary/50"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-bg-tertiary group-hover:bg-primary/10 transition-colors">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-semibold">Create new site</span>
            </Link>

            {/* Site Cards */}
            {sites.map((site) => {
              const status = statusStyles[site.status]
              return (
                <div
                  key={site.id}
                  className="group flex flex-col rounded-2xl border border-border bg-bg-secondary overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all"
                >
                  {/* Thumbnail with iframe or placeholder */}
                  <div className="relative h-[150px] bg-gradient-to-br from-bg-tertiary to-border/30 overflow-hidden">
                    {site.html ? (
                      <iframe
                        srcDoc={site.html}
                        className="w-[1280px] h-[800px] origin-top-left pointer-events-none border-0"
                        style={{ transform: 'scale(0.28)', transformOrigin: 'top left' }}
                        title={site.name}
                        sandbox="allow-same-origin"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="h-3 w-20 rounded-full bg-primary/20 mx-auto mb-2" />
                          <div className="h-2 w-28 rounded-full bg-text-muted/10 mx-auto mb-1" />
                          <div className="h-2 w-24 rounded-full bg-text-muted/10 mx-auto" />
                        </div>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-bg/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Link
                        href={`/editor/${site.id}`}
                        className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-primary-hover transition-colors"
                      >
                        Open Editor
                      </Link>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-text truncate">{site.name}</h3>
                      <span className={`shrink-0 ms-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mb-3 truncate">{site.url}</p>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-text-muted">{site.lastEdited}</span>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/editor/${site.id}`}
                          className="rounded-lg p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => {
                            if (site.html) {
                              const w = window.open('', '_blank')
                              if (w) { w.document.write(site.html); w.document.close() }
                            }
                          }}
                          className="rounded-lg p-1.5 text-text-muted hover:text-secondary hover:bg-secondary/10 transition-colors"
                          title="Preview"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteSite(site.id)}
                          className="rounded-lg p-1.5 text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Start Templates */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text">Quick Start</h2>
              <Link href="/dashboard/new" className="text-sm text-primary hover:text-primary-hover transition-colors">
                View all templates
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {quickStartTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-bg-secondary transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={template.image}
                      alt={template.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/90 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center bg-bg/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleQuickStart(template.id)}
                        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-hover transition-colors"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-text text-sm mb-0.5">{template.name}</h3>
                    <p className="text-xs text-text-muted">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DashboardPage
