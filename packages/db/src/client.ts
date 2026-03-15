import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

/** Creates database connection. Requires DATABASE_URL env var. */
export const createDb = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  const sql = neon(url)
  return drizzle(sql, { schema })
}

/** Lazy-initialized database instance */
let _db: ReturnType<typeof createDb> | null = null

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    if (!_db) {
      _db = createDb()
    }
    return (_db as any)[prop]
  },
})

export type Database = ReturnType<typeof createDb>
