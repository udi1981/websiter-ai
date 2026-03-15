import { Hono } from 'hono'

export const authRoute = new Hono()

/**
 * POST /api/auth/login — email + magic link login (stub).
 * Placeholder until Better Auth is fully integrated.
 */
authRoute.post('/login', async (c) => {
  const body = await c.req.json<{ email: string }>()

  if (!body.email) {
    return c.json(
      { success: false, error: { code: 'VALIDATION', message: 'email is required' } },
      400
    )
  }

  // TODO: Implement actual magic link via Better Auth + Resend
  return c.json({
    success: true,
    data: { message: 'Magic link sent (stub — not actually sent)' },
  })
})

/**
 * POST /api/auth/google — Google OAuth login (stub).
 */
authRoute.post('/google', async (c) => {
  const body = await c.req.json<{ idToken: string }>()

  if (!body.idToken) {
    return c.json(
      { success: false, error: { code: 'VALIDATION', message: 'idToken is required' } },
      400
    )
  }

  // TODO: Implement actual Google OAuth via Better Auth
  return c.json({
    success: true,
    data: {
      token: 'stub-token',
      user: {
        id: 'user_stub',
        email: 'stub@example.com',
        name: 'Stub User',
        avatar: null,
        locale: 'en',
        plan: 'free' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  })
})

/**
 * GET /api/auth/me — get current user (stub, returns mock user).
 */
authRoute.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    return c.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      401
    )
  }

  // TODO: Replace with actual session lookup via Better Auth
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  return c.json({
    success: true,
    data: {
      id: token,
      email: 'user@example.com',
      name: 'Demo User',
      avatar: null,
      locale: 'en',
      plan: 'free' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
})

/**
 * POST /api/auth/logout — logout (stub).
 */
authRoute.post('/logout', async (c) => {
  // TODO: Implement actual session invalidation via Better Auth
  return c.json({
    success: true,
    data: { message: 'Logged out' },
  })
})
