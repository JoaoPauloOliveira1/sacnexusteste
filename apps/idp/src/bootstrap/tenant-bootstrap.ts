import { createIdentityEvent } from '@/events/identity-event.js'
import { type IdentityEventPublisher } from '@/events/identity-event-publisher.js'
import {
  identityEventNames,
  identityEventOutcomes,
  identityOperationLabels,
  identityReasonCodes,
} from '@/events/identity-event-registry.js'
import { normalizeTenantHost } from '@/usecases/tenant/host-normalizer.js'

const requiredFlags = [
  'name',
  'slug',
  'domain',
  'owner-email',
  'owner-name',
  'temporary-password',
] as const

const repeatableFlags = new Set<string>(['alias'])
const supportedFlags = new Set<string>([...requiredFlags, 'alias'])

export type TenantBootstrapParseSuccess = {
  ok: true
  value: TenantBootstrapCliInput
}

export type TenantBootstrapParseFailure = {
  ok: false
  failureCategory: TenantBootstrapFailureCategory
}

export type TenantBootstrapParseResult = TenantBootstrapParseSuccess | TenantBootstrapParseFailure

export type TenantBootstrapCliInput = {
  aliases: string[]
  domain: string
  name: string
  ownerEmail: string
  ownerName: string
  slug: string
  temporaryPassword: string
}

export type TenantBootstrapRequest = {
  aliases: string[]
  domain: string
  name: string
  ownerEmail: string
  ownerName: string
  slug: string
  temporaryPassword: string
}

export type TenantBootstrapEntityOutcome = 'created' | 'reused'
export type TenantBootstrapMembershipOutcome = 'assigned' | 'already_satisfied'
export type TenantBootstrapDomainOutcome = 'created' | 'reused'
export type TenantBootstrapFailureCategory =
  | 'conflict_detected'
  | 'operation_failed'
  | 'validation_failed'

export type TenantBootstrapEntityResult = {
  id: string
  outcome: TenantBootstrapEntityOutcome
}

export type TenantBootstrapMembershipResult = {
  outcome: TenantBootstrapMembershipOutcome
}

export type TenantBootstrapTenantSetupResult = {
  domains: TenantBootstrapDomainOutcome
  tenant: TenantBootstrapEntityResult
}

export type TenantBootstrapIdentity = {
  ensureOrganization: (input: {
    name: string
    ownerUserId: string
    slug: string
  }) => Promise<TenantBootstrapEntityResult>
  ensureOwnerMembership: (input: {
    organizationId: string
    ownerUserId: string
  }) => Promise<TenantBootstrapMembershipResult>
  ensureOwnerUser: (input: {
    email: string
    name: string
    temporaryPassword: string
  }) => Promise<TenantBootstrapEntityResult>
}

export type TenantBootstrapTenantStore = {
  ensureTenantSetup: (input: {
    aliases: string[]
    organizationId: string
    primaryDomain: string
  }) => Promise<TenantBootstrapTenantSetupResult>
}

export type TenantBootstrapDependencies = {
  clock?: () => Date
  events: IdentityEventPublisher
  identity: TenantBootstrapIdentity
  tenantStore: TenantBootstrapTenantStore
}

export type TenantBootstrapCompletedResult = {
  status: 'completed'
  domains: TenantBootstrapDomainOutcome
  organization: TenantBootstrapEntityOutcome
  ownerMembership: TenantBootstrapMembershipOutcome
  ownerUser: TenantBootstrapEntityOutcome
  tenant: TenantBootstrapEntityOutcome
}

export type TenantBootstrapFailedResult = {
  status: 'failed'
  domains?: TenantBootstrapDomainOutcome | 'failed' | 'skipped'
  failureCategory: TenantBootstrapFailureCategory
  organization?: TenantBootstrapEntityOutcome | 'failed' | 'skipped'
  ownerMembership?: TenantBootstrapMembershipOutcome | 'failed' | 'skipped'
  ownerUser?: TenantBootstrapEntityOutcome | 'failed' | 'skipped'
  tenant?: TenantBootstrapEntityOutcome | 'failed' | 'skipped'
}

export type TenantBootstrapResult = TenantBootstrapCompletedResult | TenantBootstrapFailedResult

type InternalOperation = 'domains' | 'organization' | 'ownerMembership' | 'ownerUser' | 'tenant'

export class TenantBootstrapError extends Error {
  readonly failureCategory: TenantBootstrapFailureCategory
  readonly operation?: InternalOperation

  constructor(input: { category: TenantBootstrapFailureCategory; operation?: InternalOperation }) {
    super('Tenant bootstrap failed')
    this.name = 'TenantBootstrapError'
    this.failureCategory = input.category

    if (input.operation !== undefined) {
      this.operation = input.operation
    }
  }
}

export function createTenantBootstrapFailure(
  category: TenantBootstrapFailureCategory,
  operation?: InternalOperation,
): TenantBootstrapError {
  if (operation === undefined) {
    return new TenantBootstrapError({ category })
  }

  return new TenantBootstrapError({ category, operation })
}

export function parseTenantBootstrapArgs(args: string[]): TenantBootstrapParseResult {
  const values = new Map<string, string>()
  const aliases: string[] = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === undefined) {
      return { failureCategory: 'validation_failed', ok: false }
    }

    if (arg === '--') {
      continue
    }

    if (!arg.startsWith('--')) {
      return { failureCategory: 'validation_failed', ok: false }
    }

    const flagWithValue = arg.slice(2)
    const [flag, inlineValue] = splitFlagValue(flagWithValue)

    if (!supportedFlags.has(flag)) {
      return { failureCategory: 'validation_failed', ok: false }
    }

    const value = inlineValue ?? args[index + 1]

    if (value === undefined || value.startsWith('--') || value.trim() === '') {
      return { failureCategory: 'validation_failed', ok: false }
    }

    if (inlineValue === undefined) {
      index += 1
    }

    if (repeatableFlags.has(flag)) {
      aliases.push(value)
      continue
    }

    if (values.has(flag)) {
      return { failureCategory: 'validation_failed', ok: false }
    }

    values.set(flag, value)
  }

  for (const flag of requiredFlags) {
    if (!values.has(flag)) {
      return { failureCategory: 'validation_failed', ok: false }
    }
  }

  return {
    ok: true,
    value: {
      aliases,
      domain: getRequiredFlag(values, 'domain'),
      name: getRequiredFlag(values, 'name'),
      ownerEmail: getRequiredFlag(values, 'owner-email'),
      ownerName: getRequiredFlag(values, 'owner-name'),
      slug: getRequiredFlag(values, 'slug'),
      temporaryPassword: getRequiredFlag(values, 'temporary-password'),
    },
  }
}

export function createTenantBootstrapRequest(
  input: TenantBootstrapCliInput,
): TenantBootstrapRequest | TenantBootstrapError {
  const normalizedDomain = normalizeTenantHost(input.domain)

  if (normalizedDomain === null || !looksLikeEmail(input.ownerEmail)) {
    return createTenantBootstrapFailure('validation_failed')
  }

  const normalizedAliases: string[] = []
  const normalizedHosts = new Set<string>([normalizedDomain])

  for (const alias of input.aliases) {
    const normalizedAlias = normalizeTenantHost(alias)

    if (normalizedAlias === null || normalizedHosts.has(normalizedAlias)) {
      return createTenantBootstrapFailure('validation_failed')
    }

    normalizedAliases.push(normalizedAlias)
    normalizedHosts.add(normalizedAlias)
  }

  if (
    input.name.trim() === '' ||
    input.slug.trim() === '' ||
    input.ownerName.trim() === '' ||
    input.temporaryPassword === ''
  ) {
    return createTenantBootstrapFailure('validation_failed')
  }

  return {
    aliases: normalizedAliases,
    domain: normalizedDomain,
    name: input.name.trim(),
    ownerEmail: input.ownerEmail.trim(),
    ownerName: input.ownerName.trim(),
    slug: input.slug.trim(),
    temporaryPassword: input.temporaryPassword,
  }
}

export async function bootstrapTenant(
  request: TenantBootstrapRequest,
  dependencies: TenantBootstrapDependencies,
): Promise<TenantBootstrapResult> {
  const result: TenantBootstrapFailedResult = {
    domains: 'skipped',
    organization: 'skipped',
    ownerMembership: 'skipped',
    ownerUser: 'skipped',
    status: 'failed',
    tenant: 'skipped',
    failureCategory: 'operation_failed',
  }

  try {
    await publishBootstrapEvent(dependencies, 'started')

    const ownerUser = await dependencies.identity.ensureOwnerUser({
      email: request.ownerEmail,
      name: request.ownerName,
      temporaryPassword: request.temporaryPassword,
    })
    result.ownerUser = ownerUser.outcome

    const organization = await dependencies.identity.ensureOrganization({
      name: request.name,
      ownerUserId: ownerUser.id,
      slug: request.slug,
    })
    result.organization = organization.outcome

    const tenantSetup = await dependencies.tenantStore.ensureTenantSetup({
      aliases: request.aliases,
      organizationId: organization.id,
      primaryDomain: request.domain,
    })
    result.tenant = tenantSetup.tenant.outcome
    result.domains = tenantSetup.domains

    const ownerMembership = await dependencies.identity.ensureOwnerMembership({
      organizationId: organization.id,
      ownerUserId: ownerUser.id,
    })
    result.ownerMembership = ownerMembership.outcome

    await publishBootstrapEvent(dependencies, 'completed')

    return {
      domains: tenantSetup.domains,
      organization: organization.outcome,
      ownerMembership: ownerMembership.outcome,
      ownerUser: ownerUser.outcome,
      status: 'completed',
      tenant: tenantSetup.tenant.outcome,
    }
  } catch (error) {
    const failure = toTenantBootstrapError(error)

    result.failureCategory = failure.failureCategory
    markOperationFailed(result, failure.operation)

    await publishBootstrapEvent(dependencies, 'failed', failure.failureCategory)

    return result
  }
}

export function projectTenantBootstrapOutput(result: TenantBootstrapResult): string {
  const lines = [`bootstrap: ${result.status}`]

  lines.push(`owner_user: ${result.ownerUser ?? 'skipped'}`)
  lines.push(`organization: ${result.organization ?? 'skipped'}`)
  lines.push(`tenant: ${result.tenant ?? 'skipped'}`)
  lines.push(`domains: ${result.domains ?? 'skipped'}`)
  lines.push(`owner_membership: ${result.ownerMembership ?? 'skipped'}`)

  if (result.status === 'failed') {
    lines.push(`failure_category: ${result.failureCategory}`)
  }

  return `${lines.join('\n')}\n`
}

function splitFlagValue(flagWithValue: string): [string, string | undefined] {
  const separatorIndex = flagWithValue.indexOf('=')

  if (separatorIndex === -1) {
    return [flagWithValue, undefined]
  }

  return [flagWithValue.slice(0, separatorIndex), flagWithValue.slice(separatorIndex + 1)]
}

function getRequiredFlag(values: Map<string, string>, flag: string): string {
  const value = values.get(flag)

  if (value === undefined) {
    throw createTenantBootstrapFailure('validation_failed')
  }

  return value
}

function looksLikeEmail(value: string): boolean {
  const trimmed = value.trim()

  return trimmed.length > 3 && trimmed.includes('@') && !/[\s]/.test(trimmed)
}

function toTenantBootstrapError(error: unknown): TenantBootstrapError {
  if (error instanceof TenantBootstrapError) {
    return error
  }

  return createTenantBootstrapFailure('operation_failed')
}

function markOperationFailed(
  result: TenantBootstrapFailedResult,
  operation: InternalOperation | undefined,
): void {
  if (operation === undefined) {
    return
  }

  result[operation] = 'failed'
}

async function publishBootstrapEvent(
  dependencies: TenantBootstrapDependencies,
  stage: 'completed' | 'failed' | 'started',
  failureCategory?: TenantBootstrapFailureCategory,
): Promise<void> {
  try {
    const eventInput = {
      name: getBootstrapEventName(stage),
      occurred_at: dependencies.clock?.() ?? new Date(),
      operation: getBootstrapOperationLabel(stage),
      outcome: stage === 'failed' ? identityEventOutcomes.failed : identityEventOutcomes.succeeded,
    }

    await dependencies.events.publish(
      createIdentityEvent({
        ...eventInput,
        ...(failureCategory
          ? { reason_code: mapFailureCategoryToReasonCode(failureCategory) }
          : {}),
      }),
    )
  } catch {
    // Event publication is best-effort until a durable audit design makes it transactional.
  }
}

function getBootstrapEventName(stage: 'completed' | 'failed' | 'started') {
  if (stage === 'started') {
    return identityEventNames.bootstrapStarted
  }

  if (stage === 'completed') {
    return identityEventNames.bootstrapCompleted
  }

  return identityEventNames.bootstrapFailed
}

function getBootstrapOperationLabel(stage: 'completed' | 'failed' | 'started') {
  if (stage === 'started') {
    return identityOperationLabels.bootstrapStarted
  }

  if (stage === 'completed') {
    return identityOperationLabels.bootstrapCompleted
  }

  return identityOperationLabels.bootstrapFailed
}

function mapFailureCategoryToReasonCode(category: TenantBootstrapFailureCategory) {
  if (category === 'validation_failed') {
    return identityReasonCodes.invalidRequest
  }

  if (category === 'conflict_detected') {
    return identityReasonCodes.bootstrapConflictDetected
  }

  return identityReasonCodes.unknownControlledFailure
}
