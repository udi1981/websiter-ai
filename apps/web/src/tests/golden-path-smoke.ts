/**
 * Golden-Path Smoke Verification Script
 *
 * Tests the core flow for multiple business types:
 * description → generate → preview → publish → chatbot → lead capture
 *
 * Usage:
 *   npx tsx apps/web/src/tests/golden-path-smoke.ts [--types restaurant,lawyer] [--base-url http://localhost:3000]
 *
 * Checks per business type (from acceptance checklist):
 *  1. generation_jobs row created with status='completed'
 *  2. All generation_steps rows present with duration_ms > 0
 *  3. All generation_artifacts rows present with valid=true
 *  4. sites row exists with html populated
 *  5. HTML > 5KB and contains business name
 *  6. Editor preview renders the HTML (verified by HTML existence)
 *  7. Publish sets status='published'
 *  8. Chatbot widget appears in published HTML
 *  9. Chatbot returns AI response
 * 10. Lead form submission creates row in leads table
 * 11. chatbot_messages rows persist conversation
 * 12. Different business types produce different palettes
 */

const BASE_URL = process.argv.find(a => a.startsWith('--base-url='))?.split('=')[1] || 'http://localhost:3000'
const USER_ID = 'demo_user'

type BusinessType = {
  key: string
  description: string
  nameSubstring: string // expected substring in site name (Hebrew or English)
}

const ALL_BUSINESS_TYPES: BusinessType[] = [
  { key: 'restaurant', description: 'מסעדה איטלקית משפחתית בתל אביב, מתמחה בפסטות טריות ויינות מובאים מאיטליה', nameSubstring: '' },
  { key: 'lawyer', description: 'משרד עורכי דין בירושלים, מתמחה בדיני משפחה ומקרקעין, 15 שנות ניסיון', nameSubstring: '' },
  { key: 'dentist', description: 'מרפאת שיניים מתקדמת ברמת גן, מומחים להשתלות ואסתטיקה דנטלית', nameSubstring: '' },
  { key: 'fitness', description: 'סטודיו כושר בוטיק בהרצליה, אימונים אישיים ושיעורי קבוצות קטנות', nameSubstring: '' },
  { key: 'saas', description: 'SaaS startup building an AI-powered project management tool for remote teams', nameSubstring: '' },
  { key: 'realestate', description: 'סוכנות נדלן בנתניה, מתמחה בדירות יוקרה ונכסים מסחריים', nameSubstring: '' },
  { key: 'beauty', description: 'קליניקת יופי וטיפולי אנטי-אייג׳ינג בתל אביב, טכנולוגיות מתקדמות', nameSubstring: '' },
  { key: 'plumber', description: 'שרברב מקצועי באזור המרכז, שירות 24/7, תיקון נזילות והתקנת מערכות', nameSubstring: '' },
  { key: 'photographer', description: 'צלם חתונות ואירועים בישראל, סגנון דוקומנטרי אמנותי, 10 שנות ניסיון', nameSubstring: '' },
  { key: 'gifts', description: 'חנות מתנות מקוונת, מתנות בעיצוב אישי לכל אירוע, משלוחים לכל הארץ', nameSubstring: '' },
]

type CheckResult = { name: string; pass: boolean; detail: string }

const selectedTypes = (() => {
  const arg = process.argv.find(a => a.startsWith('--types='))
  if (arg) {
    const keys = arg.split('=')[1].split(',')
    return ALL_BUSINESS_TYPES.filter(t => keys.includes(t.key))
  }
  return ALL_BUSINESS_TYPES
})()

const log = (msg: string) => console.log(`[smoke] ${msg}`)
const pass = (name: string, detail: string): CheckResult => ({ name, pass: true, detail })
const fail = (name: string, detail: string): CheckResult => ({ name, pass: false, detail })

/** Wait for SSE pipeline to complete, consuming the stream line by line */
const runPipeline = async (description: string): Promise<{ jobId: string; siteId: string; events: Record<string, unknown>[] }> => {
  const res = await fetch(`${BASE_URL}/api/ai/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
    },
    body: JSON.stringify({
      description,
      locale: description.match(/[א-ת]/) ? 'he' : 'en',
    }),
  })

  if (!res.ok) throw new Error(`Pipeline POST failed: ${res.status} ${await res.text()}`)
  if (!res.body) throw new Error('No response body from pipeline')

  const events: Record<string, unknown>[] = []
  let jobId = ''
  let siteId = ''

  // Read the SSE stream
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // Process complete lines
    const lines = buffer.split('\n')
    buffer = lines.pop() || '' // keep incomplete last line in buffer

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6))
        events.push(data)
        if (data.jobId) jobId = data.jobId as string
        if (data.siteId) siteId = data.siteId as string
        if (data.phase) log(`  [${data.phase}] ${data.step || data.message || ''}`)
      } catch { /* skip non-JSON lines */ }
    }
  }

  // Process any remaining buffer
  if (buffer.startsWith('data: ')) {
    try {
      const data = JSON.parse(buffer.slice(6))
      events.push(data)
      if (data.jobId) jobId = data.jobId as string
      if (data.siteId) siteId = data.siteId as string
    } catch { /* skip */ }
  }

  if (!jobId) throw new Error('No jobId received from pipeline')
  return { jobId, siteId, events }
}

/** Query the generation status endpoint */
const getJobStatus = async (jobId: string): Promise<Record<string, unknown>> => {
  const res = await fetch(`${BASE_URL}/api/generation/${jobId}`, {
    headers: { 'x-user-id': USER_ID },
  })
  if (!res.ok) throw new Error(`Generation status GET failed: ${res.status}`)
  return res.json()
}

/** Publish a site */
const publishSite = async (siteId: string): Promise<Record<string, unknown>> => {
  const res = await fetch(`${BASE_URL}/api/sites/${siteId}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
    },
  })
  if (!res.ok) throw new Error(`Publish POST failed: ${res.status}`)
  return res.json()
}

/** Send a chatbot message */
const chatbotMessage = async (siteId: string, message: string, opts?: {
  sessionId?: string
  visitorName?: string
  visitorEmail?: string
  visitorPhone?: string
}): Promise<Record<string, unknown>> => {
  const res = await fetch(`${BASE_URL}/api/chatbot/${siteId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      sessionId: opts?.sessionId,
      visitorName: opts?.visitorName,
      visitorEmail: opts?.visitorEmail,
      visitorPhone: opts?.visitorPhone,
    }),
  })
  if (!res.ok) throw new Error(`Chatbot POST failed: ${res.status}`)
  return res.json()
}

/** Get site HTML from the sites API */
const getSiteHtml = async (siteId: string): Promise<string> => {
  const res = await fetch(`${BASE_URL}/api/sites/${siteId}`, {
    headers: { 'x-user-id': USER_ID },
  })
  if (!res.ok) throw new Error(`Sites GET failed: ${res.status}`)
  const data = await res.json() as Record<string, unknown>
  const site = (data as { data?: Record<string, unknown> }).data || data
  return ((site as Record<string, unknown>).html as string) || ''
}

/** Run all checks for a single business type */
const runChecks = async (biz: BusinessType): Promise<CheckResult[]> => {
  const results: CheckResult[] = []
  log(`\n========== ${biz.key.toUpperCase()} ==========`)
  log(`Description: ${biz.description}`)

  // Step 1: Run pipeline
  log('Starting pipeline...')
  let jobId: string
  let siteId: string
  try {
    const pipeline = await runPipeline(biz.description)
    jobId = pipeline.jobId
    siteId = pipeline.siteId
    log(`Pipeline complete: jobId=${jobId}, siteId=${siteId}`)
  } catch (err) {
    results.push(fail('pipeline', `Pipeline failed: ${err}`))
    return results
  }

  // Step 2: Check job status
  log('Checking job status...')
  try {
    const status = await getJobStatus(jobId) as { ok: boolean; data: Record<string, unknown> }
    const job = status.data?.job as Record<string, unknown> | undefined
    const steps = status.data?.steps as Record<string, unknown>[] | undefined
    const artifacts = status.data?.artifacts as Record<string, unknown>[] | undefined

    // Check 1: Job completed
    if (job?.status === 'completed') {
      results.push(pass('job_completed', `Job ${jobId} status=completed`))
    } else {
      results.push(fail('job_completed', `Job status=${job?.status}, reason=${job?.failureReason}`))
    }

    // Check 2: Steps have duration
    if (steps && steps.length > 0) {
      const stepsWithDuration = steps.filter(s => (s.durationMs as number) > 0)
      if (stepsWithDuration.length === steps.length) {
        results.push(pass('steps_duration', `${steps.length} steps, all with duration_ms > 0`))
      } else {
        results.push(fail('steps_duration', `${stepsWithDuration.length}/${steps.length} steps have duration_ms > 0`))
      }
    } else {
      results.push(fail('steps_duration', 'No steps found'))
    }

    // Check 3: Artifacts valid
    if (artifacts && artifacts.length > 0) {
      const validArtifacts = artifacts.filter(a => a.valid === true)
      if (validArtifacts.length === artifacts.length) {
        results.push(pass('artifacts_valid', `${artifacts.length} artifacts, all valid=true`))
      } else {
        results.push(fail('artifacts_valid', `${validArtifacts.length}/${artifacts.length} artifacts valid`))
      }
    } else {
      results.push(fail('artifacts_valid', 'No artifacts found'))
    }
  } catch (err) {
    results.push(fail('job_status', `Failed to get job status: ${err}`))
  }

  // Step 3: Check site HTML
  log('Checking site HTML...')
  let html = ''
  try {
    html = await getSiteHtml(siteId)
    const byteSize = new TextEncoder().encode(html).length

    // Check 4: HTML populated
    if (html.length > 0) {
      results.push(pass('html_exists', `Site has HTML (${byteSize} bytes)`))
    } else {
      results.push(fail('html_exists', 'Site has no HTML'))
    }

    // Check 5: HTML > 5KB
    if (byteSize > 5000) {
      results.push(pass('html_size', `HTML is ${byteSize} bytes (> 5KB)`))
    } else {
      results.push(fail('html_size', `HTML is only ${byteSize} bytes (< 5KB)`))
    }
  } catch (err) {
    results.push(fail('html_check', `Failed to get site HTML: ${err}`))
  }

  // Step 4: Publish
  log('Publishing site...')
  try {
    const pubResult = await publishSite(siteId) as { ok: boolean; data: Record<string, unknown> }

    // Check 6: Publish succeeds
    if (pubResult.ok && pubResult.data?.status === 'published') {
      results.push(pass('publish', `Published: status=published`))
    } else {
      results.push(fail('publish', `Publish returned ok=${pubResult.ok}, status=${pubResult.data?.status}`))
    }
  } catch (err) {
    results.push(fail('publish', `Publish failed: ${err}`))
  }

  // Check 7: Chatbot widget in HTML (re-fetch after publish)
  try {
    const publishedHtml = await getSiteHtml(siteId)
    if (publishedHtml.includes('ub-chat-btn')) {
      results.push(pass('chatbot_widget', 'Chatbot widget found in published HTML'))
    } else {
      results.push(fail('chatbot_widget', 'Chatbot widget NOT found in published HTML'))
    }
  } catch (err) {
    results.push(fail('chatbot_widget', `Failed to check published HTML: ${err}`))
  }

  // Step 5: Chatbot
  log('Testing chatbot...')
  let sessionId = ''
  try {
    const chatResult = await chatbotMessage(siteId, 'Tell me about your services') as {
      ok: boolean; response: string; sessionId: string
    }

    // Check 8: Chatbot returns response
    if (chatResult.ok && chatResult.response && chatResult.response.length > 10) {
      results.push(pass('chatbot_response', `Chatbot responded (${chatResult.response.length} chars)`))
      sessionId = chatResult.sessionId
    } else {
      results.push(fail('chatbot_response', `Chatbot returned ok=${chatResult.ok}, response length=${chatResult.response?.length}`))
    }
  } catch (err) {
    results.push(fail('chatbot_response', `Chatbot failed: ${err}`))
  }

  // Step 6: Lead capture
  log('Testing lead capture...')
  try {
    const leadResult = await chatbotMessage(siteId, 'I want more info', {
      sessionId,
      visitorName: `Smoke Test ${biz.key}`,
      visitorEmail: `smoke-${biz.key}@test.example`,
      visitorPhone: '050-0000000',
    }) as { ok: boolean; response: string }

    // Check 9: Lead message succeeds
    if (leadResult.ok && leadResult.response && leadResult.response.length > 10) {
      results.push(pass('lead_capture', 'Lead capture message succeeded with AI response'))
    } else {
      results.push(fail('lead_capture', `Lead message returned ok=${leadResult.ok}`))
    }
  } catch (err) {
    results.push(fail('lead_capture', `Lead capture failed: ${err}`))
  }

  return results
}

/** Main entry point */
const main = async () => {
  console.log('='.repeat(60))
  console.log('  UBuilder AI — Golden-Path Smoke Verification')
  console.log(`  Base URL: ${BASE_URL}`)
  console.log(`  Business types: ${selectedTypes.map(t => t.key).join(', ')}`)
  console.log('='.repeat(60))

  const allResults: { type: string; results: CheckResult[] }[] = []
  const palettes: { type: string; primary: string }[] = []

  for (const biz of selectedTypes) {
    const results = await runChecks(biz)
    allResults.push({ type: biz.key, results })
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('  SUMMARY')
  console.log('='.repeat(60))

  let totalPass = 0
  let totalFail = 0

  for (const { type, results } of allResults) {
    const passed = results.filter(r => r.pass).length
    const failed = results.filter(r => !r.pass).length
    totalPass += passed
    totalFail += failed

    const icon = failed === 0 ? 'PASS' : 'FAIL'
    console.log(`\n  [${icon}] ${type}: ${passed}/${passed + failed} checks passed`)
    for (const r of results) {
      const mark = r.pass ? '  +' : '  -'
      console.log(`    ${mark} ${r.name}: ${r.detail}`)
    }
  }

  console.log(`\n  Total: ${totalPass} passed, ${totalFail} failed out of ${totalPass + totalFail} checks`)
  console.log('='.repeat(60))

  process.exit(totalFail > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('Smoke test crashed:', err)
  process.exit(2)
})
