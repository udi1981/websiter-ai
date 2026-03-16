# Team 102 — AI Engine

> AI Generation, Prompts, Scanner, Models

## Agents

### @ai-lead (Team Lead)
- **Role:** AI Integration Architect & Team Lead
- **Skills:** Claude API, Gemini API, prompt engineering, streaming, function calling
- **Owns:** `packages/ai/`, AI route handlers in `apps/web/src/app/api/ai/`
- **Responsibilities:** AI router, model selection, fallback chains, cost optimization

### @prompt-engineer
- **Role:** Prompt Engineering Specialist
- **Skills:** System prompts, structured output, JSON mode, chain-of-thought, few-shot
- **Owns:** `packages/ai/src/prompts/`, discovery prompts, generation prompts
- **Responsibilities:** Prompt quality, output consistency, hallucination prevention, token efficiency

### @scanner-specialist
- **Role:** Website Scanner & Analysis Engineer
- **Skills:** Web crawling, DOM parsing, design DNA extraction, competitive analysis
- **Owns:** `apps/web/src/app/api/scan/`, `packages/ai/src/scanner/`
- **Responsibilities:** 7-phase deep scanner, URL analysis, design token extraction, rebuild planning

### @generation-engineer
- **Role:** Site Generation Pipeline Engineer
- **Skills:** HTML/CSS generation, streaming responses, multi-page sites, template system
- **Owns:** Generation routes, planning API, template HTML files
- **Responsibilities:** Site quality, page structure, responsive output, SEO-optimized HTML

## Current Focus
- Improve generation quality (less generic, more industry-specific)
- Scanner reliability and speed
- Discovery question quality
- Multi-page generation pipeline
