import { loadEnvFile } from 'node:process'
import { defineConfig } from 'drizzle-kit'

try {
  loadEnvFile('.env')
} catch {
  // Drizzle generation does not require DATABASE_URL. Migrate validates it separately.
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://idp:idp@127.0.0.1:5432/idp',
  },
  strict: true,
  verbose: true,
})
