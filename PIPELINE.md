# Site Creation Pipeline Protocol

> The Torah of site creation. Every site MUST pass through these stages in order.
> Team 100 is bound by this protocol. No shortcuts. No skipping steps.

---

## Stage 1: INPUT
**Owner:** User
**Duration:** 30 seconds

User provides:
- [ ] Business description (required, min 20 chars)
- [ ] Language selection (he/en)
- [ ] URL for scan (optional)
- [ ] Logo upload (optional)
- [ ] Documents (optional)

**Gate:** Cannot proceed without description + language.

---

## Stage 2: SCAN (if URL provided)
**Owner:** @research agent (Team 100 #3)
**Duration:** 1-3 minutes

- [ ] Deep crawl: discover all pages (max 20)
- [ ] Extract: colors, fonts, spacing, images, sections
- [ ] Classify: section types per page
- [ ] Generate: design DNA summary
- [ ] Ask user: "Copy structure or take inspiration?" → sets scanMode

**Output:** `deepScanData` object with full site intelligence
**Gate:** Scan complete OR scan failed (continue without scan data)

**CRITICAL RULE:** Scan data MUST be passed to ALL subsequent stages. Not flattened. Not simplified. Full object.

---

## Stage 3: DISCOVERY
**Owner:** @discovery agent (Team 100 #2)
**Duration:** 2-5 minutes (3-6 questions)

Questions MUST cover:
- [ ] Business name + industry
- [ ] Target audience
- [ ] Primary goal (leads / sales / info / portfolio)
- [ ] Key services/products (with details)
- [ ] Brand personality + design mood
- [ ] Competitive edge / unique value

**Output:** `discoveryContext` with 8+ filled dimensions
**Gate:** readyToGenerate = true (8+ dimensions OR 6 questions asked)

**CRITICAL RULE:** If scan data exists, discovery MUST reference it. "I see from your current site that..." — adapt questions based on what was already found.

---

## Stage 4: PLANNING
**Owner:** @strategy agent (Team 100 #4) + @designer (Team 100 #6)
**Duration:** 1-2 minutes

**Input:** discoveryContext + deepScanData + description + locale
**AI Model:** Claude Sonnet 4 (primary), Gemini Flash (fallback)

Plan MUST include:
- [ ] Site name
- [ ] Industry classification
- [ ] Color palette (8 colors: primary, secondary, accent, bg, bgAlt, text, textMuted, border)
- [ ] Typography (heading font, body font — MUST be different from Inter for non-English)
- [ ] Design style (luxury-minimal, modern-warm, bold-creative, etc.)
- [ ] Home page: 10-14 sections with variantIds from the registry
- [ ] Additional pages (About, Services, Contact — 3-6 sections each)
- [ ] Content per section: headline, subtitle, items with REAL descriptions
- [ ] Hero variant selected by INDUSTRY (not always gradient-mesh)
- [ ] Conversion strategy (CTA text, trust elements)
- [ ] SEO metadata

**Output:** `BuildPlan` JSON (must parse correctly, max_tokens: 16384)
**Gate:** Valid JSON with ≥10 home sections, all variantIds exist in registry

**CRITICAL RULES:**
1. If scanMode='copy' → preserve scanned site's colors, fonts, section order
2. If scanMode='inspiration' → use scan as style reference only
3. Every section MUST have a variantId that exists in section-composer
4. Items arrays MUST have real content (not placeholder)
5. Hero variant MUST match industry (restaurant→split-image, tech→gradient-mesh, law→minimal-text)

---

## Stage 5: IMAGE GENERATION
**Owner:** @media agent (Team 100 #13)
**Duration:** 15-30 seconds

**Input:** businessName, businessType, locale, colorPalette, sections list
**API:** Imagen 4.0 Fast

Images to generate:
- [ ] Logo (1:1) — "minimal modern logo symbol for {businessName}, {industry}"
- [ ] Hero (16:9) — SPECIFIC to business ("luxury watch display in elegant store" NOT "business environment")
- [ ] About (16:9) — team/story image
- [ ] Gallery items (4:3, up to 3) — product/service showcase
- [ ] Feature illustration (1:1) — if needed

**Output:** `generatedImages` Record<string, base64DataUrl>
**Gate:** At least hero + logo generated

**CRITICAL RULES:**
1. Image prompts MUST be specific to the actual business (watches, food, real estate — not generic)
2. Include business name context in prompt
3. Match color mood to palette
4. Max 5 images per request (avoid timeout)
5. Images MUST be passed to BOTH composed AND streaming generation paths

---

## Stage 6: COMPOSITION
**Owner:** @generator agent (Team 100 #7)
**Duration:** 1-5 seconds (composed) or 1-3 minutes (AI streaming)

### Path A: Composed Generation (preferred)
- [ ] Resolve all plan sections to generators (variantId → generator function)
- [ ] Map plan content to generator params (adaptContent for testimonials, pricing, etc.)
- [ ] Pass generatedImages to each section's images field
- [ ] composePage() assembles full HTML
- [ ] Auto-inject background effects per section category
- [ ] Section markers added for editor identification

**Requirement:** ≥6 sections resolved. If less → Path B.

### Path B: AI Streaming (fallback)
- [ ] Build prompt from plan + scan data
- [ ] Include PREMIUM_GENERATION_PROMPT as system prompt
- [ ] Stream HTML from Claude/Gemini
- [ ] **MUST inject generatedImages into the prompt** (as Unsplash-style URLs or inline references)
- [ ] Strip markdown fences from output

**Output:** Complete HTML string (40K-100K chars)
**Gate:** HTML length > 500 chars, contains <section> tags, has RTL if Hebrew

---

## Stage 7: QUALITY GATE
**Owner:** @cpo agent (Team 100 #20)
**Duration:** Instant (automated checks)

Automated checks:
- [ ] HTML length > 40,000 chars
- [ ] Has RTL direction (if Hebrew)
- [ ] Has correct fonts (not hardcoded Inter for Hebrew sites)
- [ ] Has section markers (≥8)
- [ ] Has background effects
- [ ] Has custom colors from plan (not default purple)
- [ ] Has AI-generated images (data:image/jpeg)
- [ ] Has business name in content
- [ ] Has plan content (headlines, items) in HTML
- [ ] Google Fonts loaded

**Score:** Pass (8+/10) or Fail (redo from Stage 4 with different variants)
**Gate:** Score ≥ 8/10

---

## Stage 8: SAVE + EDITOR
**Owner:** System
**Duration:** Instant

- [ ] Generate siteId
- [ ] Save to localStorage (immediate)
- [ ] Save to Neon DB (await response — NOT fire-and-forget)
- [ ] Save plan alongside HTML
- [ ] Navigate to /editor/{siteId}

**Gate:** Site saved in DB (confirmed, not async)

---

## Stage 9: PUBLISH + TEAM 101 ACTIVATION
**Owner:** @launch agent (Team 100 #17) → Team 101
**Duration:** 5 seconds

When user clicks Publish:
- [ ] Inject chatbot widget into HTML (before </body>)
- [ ] Set site status = 'published'
- [ ] Save updated HTML to DB
- [ ] Activate Team 101:
  - [ ] CRM Manager: create lead pipeline for this site
  - [ ] Chatbot Agent: configure with site content
  - [ ] Analytics Engine: enable tracking
  - [ ] SEO Monitor: schedule first check

**Gate:** Chatbot widget present in HTML, CRM pipeline exists in DB

---

## Known Issues (To Fix)

| Issue | Stage | Impact | Fix |
|-------|-------|--------|-----|
| Multi-page only builds Home | 6 | High | Compose all pages, store as array |
| Images lost in streaming fallback | 6 | High | Pass image URLs to AI prompt |
| Composed gen fragile (min 6) | 6 | Medium | Lower threshold to 3, better fallback |
| Image prompts generic | 5 | High | Use specific business context in prompts |
| DB save is fire-and-forget | 8 | High | Await DB response before navigate |
| Discovery ignores scan data | 3 | Medium | Pass scan summary to discovery prompt |

---

## Implementation Status

| Stage | Code Exists | Actually Works | Quality |
|-------|------------|----------------|---------|
| 1. Input | ✅ | ✅ | Good |
| 2. Scan | ✅ | ✅ (crashes on heavy sites) | Needs stability |
| 3. Discovery | ✅ | ✅ | Good |
| 4. Planning | ✅ | ✅ | Good (after 16K token fix) |
| 5. Images | ✅ | ✅ (but prompts generic) | Needs prompt improvement |
| 6. Composition | ✅ | ⚠️ (Path A works, Path B loses images) | Needs disconnect fix |
| 7. Quality Gate | ❌ | ❌ | Not implemented in pipeline |
| 8. Save | ✅ | ⚠️ (async, not awaited) | Needs sync save |
| 9. Publish+101 | ✅ | ⚠️ (code exists, untested E2E) | Needs E2E test |
