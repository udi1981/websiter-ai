import * as schema from './schema'

const isLocalhost = (process.env.DATABASE_URL || '').includes('localhost')

/** Creates database connection. Requires DATABASE_URL env var. */
export const createDb = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  if (isLocalhost) {
    // Local dev: use node-postgres driver (standard TCP)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg')
    const { drizzle } = require('drizzle-orm/node-postgres')
    const pool = new Pool({ connectionString: url, max: 10 })
    return drizzle(pool, { schema }) as any
  } else {
    // Production: use Neon HTTP driver (serverless)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require('@neondatabase/serverless')
    const { drizzle } = require('drizzle-orm/neon-http')
    const sql = neon(url)
    return drizzle(sql, { schema })
  }
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
