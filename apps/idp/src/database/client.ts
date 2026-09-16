import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/database/schema.js'

export type Database = NodePgDatabase<typeof schema>

export type DatabaseClient = {
  db: Database
  checkReadiness: () => Promise<void>
  close: () => Promise<void>
}

// 5s tolerates a serverless Postgres (Neon) cold start on the first query.
export const databaseReadinessTimeoutMillis = 5_000
const databaseReadinessTimeoutErrorMessage = 'Database readiness check timed out'

async function withReadinessTimeout<T>(operation: Promise<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(databaseReadinessTimeoutErrorMessage)),
          databaseReadinessTimeoutMillis,
        )
      }),
    ])
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
}

export function createDatabaseClient(databaseUrl: string): DatabaseClient {
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: databaseReadinessTimeoutMillis,
  })
  const db = drizzle(pool, { schema })

  return {
    db,
    checkReadiness: async () => {
      await withReadinessTimeout(pool.query('select 1'))
    },
    close: async () => {
      await pool.end()
    },
  }
}
