import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { parseDatabaseEnv } from '@/config/env.js'
import { createDatabaseClient } from '@/database/client.js'

const env = parseDatabaseEnv()

const database = createDatabaseClient(env.DATABASE_URL)

try {
  await migrate(database.db, { migrationsFolder: 'drizzle' })
} finally {
  await database.close()
}
