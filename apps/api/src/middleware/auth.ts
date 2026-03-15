import { createMiddleware } from 'hono/factory'

type AuthVariables = {
  userId: string
}

/**
 * Auth middleware — checks for Authorization header and attaches userId to context.
 * Placeholder implementation until Better Auth is fully integrated.
 */
export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    return c.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing Authorization header' } },
      401
    )
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader

  if (!token) {
    return c.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token format' } },
      401
    )
  }

  // TODO: Replace with actual Better Auth token verification
  // For now, treat the token as the userId for development
  c.set('userId', token)

  await next()
})
