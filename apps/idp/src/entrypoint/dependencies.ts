import { type Env, env } from '@/config/env.js'
import {
  type ClassificacaoRepository,
  createDrizzleClassificacaoRepository,
} from '@/database/classificacao-repository.js'
import { createDatabaseClient } from '@/database/client.js'
import {
  createDrizzleEmpresaRepository,
  type EmpresaRepository,
} from '@/database/empresa-repository.js'
import {
  createDrizzleEventoRepository,
  type EventoRepository,
} from '@/database/evento-repository.js'
import {
  createDrizzleProcessoRepository,
  type ProcessoRepository,
} from '@/database/processo-repository.js'
import {
  createDrizzleTenantDomainRepository,
  type TenantDomainRepository,
} from '@/database/tenant-domain-repository.js'
import {
  createDrizzleUnidadeRepository,
  type UnidadeRepository,
} from '@/database/unidade-repository.js'
import { type IdentityEventPublisher, noopIdentityEventPublisher } from '@/events/index.js'
import { createAuth } from '@/identity/auth.js'
import { type IdentityAuthService } from '@/identity/auth-service.js'
import { createResendAuthEmailSender, type EmailEventLogger } from '@/identity/email-delivery.js'
import {
  type CnpjLookupProvider,
  createPublicCnpjProvider,
} from '@/infra/integrations/cnpj/cnpj-provider.js'
import { createTigrisObjectStorage, type ObjectStorage } from '@/infra/storage/object-storage.js'

export type AppDependencies = {
  auth: IdentityAuthService
  classificacoes: ClassificacaoRepository
  cnpjProvider: CnpjLookupProvider
  database: {
    checkReadiness: () => Promise<void>
  }
  empresas: EmpresaRepository
  eventos: EventoRepository
  identityEvents: IdentityEventPublisher
  processos: ProcessoRepository
  storage: ObjectStorage
  tenantDomains: TenantDomainRepository
  unidades: UnidadeRepository
  close: () => Promise<void>
}

type CreateAppDependenciesOptions = {
  logEmailEvent?: EmailEventLogger
}

export function createAppDependencies(
  config: Env = env,
  options: CreateAppDependenciesOptions = {},
): AppDependencies {
  if (!config.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to start the IDP auth service.')
  }

  const database = createDatabaseClient(config.DATABASE_URL)
  const emailSender = createResendAuthEmailSender(config, options.logEmailEvent)
  const auth = createAuth({ config, db: database.db, emailSender })
  const tenantDomains = createDrizzleTenantDomainRepository(database.db)
  const empresas = createDrizzleEmpresaRepository(database.db)
  const unidades = createDrizzleUnidadeRepository(database.db)
  const processos = createDrizzleProcessoRepository(database.db)
  const eventos = createDrizzleEventoRepository(database.db)
  const classificacoes = createDrizzleClassificacaoRepository(database.db)
  const cnpjProvider = createPublicCnpjProvider()
  const storage = createTigrisObjectStorage(config)

  return {
    classificacoes,
    auth: {
      changePassword: (body, headers) =>
        auth.api.changePassword({ body, headers, asResponse: true }),
      getSession: (headers) => auth.api.getSession({ headers, asResponse: true }),
      ok: () => auth.api.ok({ asResponse: true }),
      requestPasswordResetCallback: (params, query, headers) =>
        auth.api.requestPasswordResetCallback({ params, query, headers, asResponse: true }),
      requestPasswordReset: (body, headers) =>
        auth.api.requestPasswordReset({ body, headers, asResponse: true }),
      resetPassword: (body, headers) => auth.api.resetPassword({ body, headers, asResponse: true }),
      sendVerificationEmail: (body, headers) =>
        auth.api.sendVerificationEmail({ body, headers, asResponse: true }),
      signInEmail: (body, headers) => auth.api.signInEmail({ body, headers, asResponse: true }),
      signOut: (headers) => auth.api.signOut({ headers, asResponse: true }),
      signUpEmail: (body, headers) => auth.api.signUpEmail({ body, headers, asResponse: true }),
      verifyEmail: (query, headers) => auth.api.verifyEmail({ query, headers, asResponse: true }),
    },
    cnpjProvider,
    database: {
      checkReadiness: database.checkReadiness,
    },
    empresas,
    eventos,
    identityEvents: noopIdentityEventPublisher,
    processos,
    storage,
    tenantDomains,
    unidades,
    close: database.close,
  }
}
