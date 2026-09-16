import {
  bootstrapTenant,
  createTenantBootstrapRequest,
  parseTenantBootstrapArgs,
  projectTenantBootstrapOutput,
  type TenantBootstrapFailedResult,
} from '@/bootstrap/tenant-bootstrap.js'
import { createBetterAuthTenantBootstrapIdentity } from '@/bootstrap/tenant-bootstrap-identity.js'
import { createDrizzleTenantBootstrapStore } from '@/bootstrap/tenant-bootstrap-repository.js'
import { env } from '@/config/env.js'
import { createDatabaseClient } from '@/database/client.js'
import { noopIdentityEventPublisher } from '@/events/index.js'
import { createAuth } from '@/identity/auth.js'

const parseResult = parseTenantBootstrapArgs(process.argv.slice(2))

if (!parseResult.ok) {
  writeFailure({ failureCategory: parseResult.failureCategory, status: 'failed' })
  process.exitCode = 1
} else {
  const request = createTenantBootstrapRequest(parseResult.value)

  if (request instanceof Error) {
    writeFailure({ failureCategory: request.failureCategory, status: 'failed' })
    process.exitCode = 1
  } else {
    const database = createDatabaseClient(env.DATABASE_URL)

    try {
      const auth = createAuth({ config: env, db: database.db })
      const result = await bootstrapTenant(request, {
        events: noopIdentityEventPublisher,
        identity: createBetterAuthTenantBootstrapIdentity(auth.api, database.db),
        tenantStore: createDrizzleTenantBootstrapStore(database.db),
      })

      process.stdout.write(projectTenantBootstrapOutput(result))
      process.exitCode = result.status === 'completed' ? 0 : 1
    } catch {
      writeFailure({ failureCategory: 'operation_failed', status: 'failed' })
      process.exitCode = 1
    } finally {
      await database.close()
    }
  }
}

function writeFailure(result: TenantBootstrapFailedResult): void {
  process.stdout.write(projectTenantBootstrapOutput(result))
}
