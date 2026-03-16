# Readdy.ai — Competitor Analysis
> Analyzed: 2026-03-15
> URL: https://readdy.ai
> Type: AI Website Builder (Conversational)

## Overview
AI-native conversational website builder. Users describe what they want in text, upload screenshots, or paste URLs — AI generates complete responsive websites with code export.

## Pricing
- **Free**: 250 credits/mo, 2 projects
- **Starter**: $25/mo — 2,500 credits, 10 projects, Figma export, code download, custom domain
- **Pro**: $40-400/mo — 6,000-60,000 credits, unlimited projects, priority support
- **Credit system**: 25 credits per AI generation/edit action
- **Yearly billing**: 40% savings + free custom domain

## Core Technical Architecture

### AI Models & Pipeline
- Uses multimodal AI models (specific models not disclosed publicly)
- Vision-language models for screenshot analysis
- 100,000+ design pattern library for matching
- Pattern prediction rather than design reasoning — "AI doesn't think like a designer, it predicts based on patterns"
- When prompts lack specificity, output defaults to averages (interpolates toward common designs)

### Generation Flow
1. User provides input (text prompt / URL / screenshot / template)
2. AI interprets intent, structures layout
3. Chooses matching UI patterns from 100K+ library
4. Styles page based on inferred tone (playful, corporate, minimal, etc.)
5. Generates working HTML/CSS/JS
6. User refines via visual editor + natural language commands

### Multi-Input Generation
- **Text prompts**: Natural language descriptions
- **Reference URLs**: Paste URL → AI analyzes structure and visual patterns
- **Screenshots/Images**: Upload visual inspiration, AI breaks into components
- **Templates**: Browse and customize pre-designed layouts

### Code Export & Framework Support
- HTML with Tailwind CSS
- React/Next.js applications (default project type)
- UniApp format
- Figma export (bidirectional — editable layers preserved)
- Clean, production-ready code as downloadable .zip

### Backend Integration (Supabase)
- OAuth connection to Supabase
- AI auto-generates SQL for table creation
- Safeguards prevent destructive operations
- User auth (email/password, social)
- File storage (1GB)
- Edge Functions for serverless logic
- API keys stored in Edge Functions > Secrets
- Row-level security policies

### AI Agent System ("Readdy Agent")
- Built-in AI assistant on published websites
- Auto-trained on website content
- Multi-turn conversations with visitors
- Lead qualification in real-time
- Calendar integration (Calendly, Google Calendar)
- Voice support — visitors can speak via microphone
- Configurable personality and tone
- Plans: Free (5 voice mins, 50 chats) → Pro (950 voice mins, 9,500 chats)

### Integrations
- **Payments**: Stripe, Shopify
- **Scheduling**: Calendly
- **Email**: Mailchimp
- **Data**: Google Sheets, Google Analytics
- **Backend**: Supabase (forms, auth, DB, storage, Edge Functions)
- **Custom domains**: Purchase or connect existing

### SEO Technical Implementation
- Semantic heading structure (H1, H2 hierarchy)
- Automated meta description generation
- URL-friendly slug creation
- Automatic sitemap.xml and robots.txt
- Performance: compressed images, optimized fonts, lazy loading

### Design Capabilities
- Hover states and animations
- Scroll effects
- Video backgrounds (150 credits)
- Mobile responsiveness (automatic)
- Version history/rollback
- "Selector Mode" for element editing
- Natural language editing: "make the hero section darker", "move testimonials above pricing"

### Screenshot-to-Website Process
- Takes "under a minute" to process
- AI identifies structural patterns: navigation, hero, galleries, testimonials, footers
- Extracts typography, color palettes, spacing
- Produces "structural similarity" not pixel-perfect clones
- Limitations: struggles with unconventional designs, asymmetric layouts, experimental navigation
- Cannot replicate complex functionality (calculators, dynamic systems)
- Limited to visible information (can't infer hidden interactions or hover states)

## Strengths
1. Multi-input (text + URL + screenshot + template) — most flexible input
2. Code export eliminates vendor lock-in (unlike Wix/Squarespace)
3. AI Agent with voice — unique differentiator
4. Supabase backend auto-generation — full-stack from chat
5. Figma bidirectional integration
6. Conversational editing is intuitive
7. 100K+ design pattern library
8. Credit-based pricing is transparent

## Weaknesses
1. Limited third-party integrations (no Airtable, limited CMS tools)
2. User-reported billing issues
3. Not pixel-perfect — "structural similarity" only
4. Fails with unconventional/asymmetric designs
5. Generic output when prompts are vague
6. No direct CMS integration
7. Cannot replicate complex dynamic functionality

## Key Learnings for UBuilder

### Must Implement
1. **Server-side scanning** — no CORS issues ✅ DONE
2. **Streaming generation** — real-time progress ✅ DONE
3. **Rich Design DNA** — 30+ extraction fields ✅ DONE
4. **Screenshot input** — visual reference upload ✅ DONE
5. **Multi-page generation** — generate entire sites, not just single pages
6. **Conversational editing** — "change hero color to blue" in chat
7. **AI Agent on published sites** — chatbot + voice for visitors
8. **Code export** — HTML, React/Next.js, Figma
9. **SEO auto-generation** — sitemap, robots.txt, semantic HTML, meta tags

### Design Insights
- Pattern prediction > design reasoning — build a pattern library
- Vague prompts → generic output — guide users to be specific
- Credit system makes costs transparent
- Conversational iteration > drag-and-drop for AI-native builders
- Backend auto-generation (Supabase) is a strong differentiator
