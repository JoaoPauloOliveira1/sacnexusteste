import {
  type IdentityEventName,
  type IdentityEventOutcome,
  type IdentityOperationLabel,
  type IdentityReasonCode,
  identityEventOutcomes,
  identityReasonCodes,
} from '@/events/identity-event-registry.js'

export type IdentityEvent = {
  name: IdentityEventName
  occurred_at: string
  operation: IdentityOperationLabel
  outcome: IdentityEventOutcome
  reason_code?: IdentityReasonCode
  request_id?: string
  tenant_id?: string
  user_id?: string
}

export type CreateIdentityEventInput = Omit<IdentityEvent, 'occurred_at'> & {
  occurred_at?: Date | string
}

export type CreateIdentityEventFromResponseInput = Omit<
  CreateIdentityEventInput,
  'outcome' | 'reason_code'
> & {
  failure_reason_code?: IdentityReasonCode
  response: Response
}

export function createIdentityEvent(input: CreateIdentityEventInput): IdentityEvent {
  const event: IdentityEvent = {
    name: input.name,
    occurred_at: formatOccurredAt(input.occurred_at),
    operation: input.operation,
    outcome: input.outcome,
  }

  if (input.reason_code !== undefined) {
    event.reason_code = input.reason_code
  }

  if (input.request_id !== undefined) {
    event.request_id = input.request_id
  }

  if (input.tenant_id !== undefined) {
    event.tenant_id = input.tenant_id
  }

  if (input.user_id !== undefined) {
    event.user_id = input.user_id
  }

  return event
}

export function createIdentityEventFromResponse(
  input: CreateIdentityEventFromResponseInput,
): IdentityEvent {
  const failed = input.response.status >= 400

  const eventInput: CreateIdentityEventInput = {
    name: input.name,
    operation: input.operation,
    outcome: failed ? identityEventOutcomes.failed : identityEventOutcomes.succeeded,
  }

  if (input.occurred_at !== undefined) {
    eventInput.occurred_at = input.occurred_at
  }

  if (failed) {
    eventInput.reason_code = input.failure_reason_code ?? identityReasonCodes.betterAuthRejected
  }

  if (input.request_id !== undefined) {
    eventInput.request_id = input.request_id
  }

  if (input.tenant_id !== undefined) {
    eventInput.tenant_id = input.tenant_id
  }

  if (input.user_id !== undefined) {
    eventInput.user_id = input.user_id
  }

  return createIdentityEvent(eventInput)
}

function formatOccurredAt(value: Date | string | undefined): string {
  if (value instanceof Date) {
    return value.toISOString()
  }

  return value ?? new Date().toISOString()
}
