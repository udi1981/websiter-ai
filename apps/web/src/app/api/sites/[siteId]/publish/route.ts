import { NextRequest, NextResponse } from 'next/server'
import { createDb, sites, eq, and } from '@ubuilder/db'
import { requireAuth } from '@/lib/auth-middleware'
import { generateChatbotWidget } from '@/lib/chatbot-widget'
import { getJobBySiteId, getArtifact, saveArtifact } from '@/lib/generation-tracker'

type RouteParams = { params: Promise<{ siteId: string }> }

/** POST /api/sites/[siteId]/publish — Publish a site */
export const POST = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const authResult = await requireAuth(req)
    if (authResult instanceof Response) return authResult
    const { userId } = authResult

    const { siteId } = await params

    const db = createDb()

    // Get the site — verify ownership
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
      .limit(1)

    if (!site) {
      return NextResponse.json({ ok: false, error: 'Site not found' }, { status: 404 })
    }

    if (!site.html) {
      return NextResponse.json({ ok: false, error: 'Site has no content to publish' }, { status: 400 })
    }

    // Update status to published
    const [updated] = await db
      .update(sites)
      .set({
        status: 'published',
        updatedAt: new Date(),
      })
      .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
      .returning({
        id: sites.id,
        slug: sites.slug,
        domain: sites.domain,
        status: sites.status,
      })

    // Inject chatbot widget into published HTML
    let html = site.html as string | undefined
    const chatbotWidget = generateChatbotWidget(siteId, {
      primaryColor: (site as Record<string, unknown>).colorPalette
        ? ((site as Record<string, unknown>).colorPalette as Record<string, string>)?.primary || '#7C3AED'
        : '#7C3AED',
      locale: ((site as Record<string, unknown>).locale as 'en' | 'he') || 'en',
    })
    // Append widget before </body>
    if (html && !html.includes('ub-chat-btn')) {
      html = html.replace('</body>', chatbotWidget + '\n</body>')
      // Update the stored HTML with chatbot widget
      await db
        .update(sites)
        .set({ html })
        .where(eq(sites.id, siteId))
    }

    // Refresh chatbot_context artifact from latest site state
    // This ensures chatbot answers reflect any edits made in the editor
    try {
      const job = await getJobBySiteId(siteId)
      if (job) {
        // Build chatbot context from current site + strategy artifacts
        const sitePlan = await getArtifact(job.id, 'site_plan')
        const extractedText = (html || '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 2000)

        // V1.3.1: Load catalog data from scan job (not from chatbot_context which gets overwritten)
        const scanJobId = (job as Record<string, unknown>).scanJobId as string | null
        let catalogProducts: unknown[] = []
        let catalogFaqs: string[] = []
        if (scanJobId) {
          try {
            const catalog = await getArtifact(scanJobId, 'content_catalog')
            const contentModel = await getArtifact(scanJobId, 'source_content_model')
            if (catalog?.products) {
              catalogProducts = ((catalog.products as Record<string, unknown>[]) || [])
                .filter(p => (p.name as Record<string, unknown>)?.value)
                .slice(0, 10)
                .map(p => {
                  const name = (p.name as Record<string, unknown>)?.value as string
                  const price = (p.price as Record<string, unknown>)?.value
                  const originalPrice = (p.originalPrice as Record<string, unknown>)?.value
                  const desc = (p.description as Record<string, unknown>)?.value as string || ''
                  const category = (p.category as Record<string, unknown>)?.value as string || ''
                  return { name, price: price ? `${price} ₪` : null, originalPrice: originalPrice ? `${originalPrice} ₪` : null, description: desc.slice(0, 150), category }
                })
            }
            if (contentModel?.faqs) {
              catalogFaqs = ((contentModel.faqs as Record<string, unknown>[]) || [])
                .map(f => (f as Record<string, unknown>).value as string)
                .filter(Boolean)
                .slice(0, 15)
            }
          } catch { /* scan artifacts may not exist */ }
        }

        const chatbotCtx: Record<string, unknown> = {
          businessName: site.name || '',
          industry: (site as Record<string, unknown>).industry || (sitePlan?.industry as string) || '',
          locale: ((site as Record<string, unknown>).locale as string) || 'he',
          description: (sitePlan?.contentTone as string) || extractedText.slice(0, 300),
          services: (sitePlan?.uniqueSellingPoints as string[]) || [],
          uniqueSellingPoints: (sitePlan?.uniqueSellingPoints as string[]) || [],
          contactInfo: { phone: null, email: null, address: null },
          faqs: catalogFaqs,
          products: catalogProducts.length > 0 ? catalogProducts : undefined,
          leadCaptureGoals: (sitePlan?.conversionGoals as string[]) || [],
        }

        await saveArtifact({
          jobId: job.id,
          artifactType: 'chatbot_context',
          data: chatbotCtx,
        })
      }
    } catch (ctxErr) {
      console.error('[publish] Chatbot context refresh error (non-blocking):', ctxErr)
    }

    const publishedUrl = `https://${updated.slug}.ubuilder.co`

    return NextResponse.json({
      ok: true,
      data: {
        ...updated,
        url: publishedUrl,
      },
    })
  } catch (err) {
    console.error('[publish] Error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to publish site' }, { status: 500 })
  }
}
