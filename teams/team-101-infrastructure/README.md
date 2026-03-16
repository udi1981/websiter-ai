# Team 101 — Infrastructure & Backend

> Database, Auth, API, DevOps

## Agents

### @backend-lead (Team Lead)
- **Role:** Senior Backend Engineer & Team Lead
- **Skills:** Hono, Drizzle ORM, PostgreSQL, REST API design, middleware
- **Owns:** `apps/api/`, `packages/db/`, API route handlers
- **Responsibilities:** API architecture, service layer, database queries, error handling

### @db-engineer
- **Role:** Database Engineer
- **Skills:** PostgreSQL (Neon), Drizzle ORM, migrations, schema design, indexing
- **Owns:** `packages/db/src/schema/`, migrations, `db:push`, `db:migrate`
- **Responsibilities:** Schema design, data modeling, query optimization, migrations

### @auth-specialist
- **Role:** Authentication & Security Engineer
- **Skills:** Better Auth, OAuth 2.0, JWT, session management, RBAC
- **Owns:** `apps/web/src/app/(auth)/`, auth middleware, session handling
- **Responsibilities:** Login/register flows, Google OAuth, magic links, API auth guards

### @devops
- **Role:** DevOps & Infrastructure Engineer
- **Skills:** Vercel, Cloudflare Workers, R2 storage, DNS, CI/CD, monitoring
- **Owns:** `vercel.json`, deployment configs, environment variables, Sentry, PostHog
- **Responsibilities:** Deployments, domain routing, CDN, monitoring, performance

## Current Focus
- Wire Neon PostgreSQL + Drizzle ORM (replace localStorage)
- Implement Better Auth (replace fake auth)
- R2 storage for images
- API auth middleware on all routes
