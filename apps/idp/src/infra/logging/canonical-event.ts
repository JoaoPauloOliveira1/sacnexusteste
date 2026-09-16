import { type Env } from '@/config/env.js'
import { SERVICE_NAME } from '@/config/service.js'

const HTTP_REQUEST_COMPLETED_EVENT = 'http.request.completed'

export type CanonicalEventOutcome = 'success' | 'client_error' | 'failure'

export type AuthOperation =
  | 'change_password'
  | 'get_session'
  | 'ok'
  | 'password_reset_callback'
  | 'request_password_reset'
  | 'reset_password'
  | 'send_verification_email'
  | 'sign_in_email'
  | 'sign_out'
  | 'sign_up_email'
  | 'verify_email'

export type CanonicalHttpEvent = {
  event: typeof HTTP_REQUEST_COMPLETED_EVENT
  service: typeof SERVICE_NAME
  request_id: string
  method: string
  path: string
  app_env: Env['IDP_APP_ENV']
  status_code?: number
  duration_ms?: number
  outcome?: CanonicalEventOutcome
  auth_operation?: AuthOperation
  error?: {
    category: string
    code?: string
    db_error_kind?: string
    name: string
  }
}

type CanonicalEventInit = {
  appEnv: Env['IDP_APP_ENV']
  method: string
  path: string
  requestId: string
}

type HttpResult = {
  durationMs: number
  statusCode: number
}

type SafeRequestPathInput = {
  routePath?: string | undefined
  url: string
}

export class CanonicalEventBuilder {
  readonly #event: CanonicalHttpEvent

  constructor(init: CanonicalEventInit) {
    this.#event = {
      app_env: init.appEnv,
      event: HTTP_REQUEST_COMPLETED_EVENT,
      method: init.method,
      path: getPathOnly(init.path),
      request_id: init.requestId,
      service: SERVICE_NAME,
    }
  }

  setPath(path: string): void {
    this.#event.path = getPathOnly(path)
  }

  setHttpResult(result: HttpResult): void {
    this.#event.duration_ms = Math.round(result.durationMs)
    this.#event.status_code = result.statusCode
    this.#event.outcome = getOutcome(result.statusCode)
  }

  setAuthOperation(operation: AuthOperation): void {
    this.#event.auth_operation = operation
  }

  recordError(error: unknown): void {
    this.#event.error = getSafeErrorDetails(error)
  }

  toJSON(): CanonicalHttpEvent {
    return this.#event.error
      ? { ...this.#event, error: { ...this.#event.error } }
      : { ...this.#event }
  }
}

export function getPathOnly(url: string): string {
  const queryStartIndex = url.indexOf('?')

  if (queryStartIndex === -1) {
    return url
  }

  return url.slice(0, queryStartIndex)
}

export function getSafeRequestPath(input: SafeRequestPathInput): string {
  if (input.routePath && input.routePath !== '*' && input.routePath !== '/*') {
    return getPathOnly(input.routePath)
  }

  return getSanitizedPath(input.url)
}

function getSanitizedPath(url: string): string {
  const path = getPathOnly(url)

  if (path === '' || path === '/') {
    return '/'
  }

  return path
    .split('/')
    .map((segment, index) => {
      if (index === 0 || segment.length === 0) {
        return segment
      }

      return ':path'
    })
    .join('/')
}

function getOutcome(statusCode: number): CanonicalEventOutcome {
  if (statusCode >= 500) {
    return 'failure'
  }

  if (statusCode >= 400) {
    return 'client_error'
  }

  return 'success'
}

function getSafeErrorDetails(error: unknown): NonNullable<CanonicalHttpEvent['error']> {
  const code = getErrorCode(error)
  const dbErrorKind = getDatabaseErrorKind(code)
  const category = dbErrorKind ? 'database' : 'application'

  return {
    category,
    ...(code ? { code } : {}),
    ...(dbErrorKind ? { db_error_kind: dbErrorKind } : {}),
    name: getErrorName(error),
  }
}

function getErrorName(error: unknown): string {
  if (error instanceof Error && error.name.length > 0) {
    return error.name
  }

  return 'Error'
}

function getErrorCode(error: unknown): string | undefined {
  const code = getStringProperty(error, 'code') ?? getStringProperty(getCause(error), 'code')

  return code && /^[A-Z0-9_]+$/.test(code) ? code : undefined
}

function getDatabaseErrorKind(code: string | undefined): string | undefined {
  switch (code) {
    case '23505':
      return 'unique_violation'
    case '23503':
      return 'foreign_key_violation'
    case '23502':
      return 'not_null_violation'
    case '42P01':
      return 'relation_missing'
    case '42703':
      return 'column_missing'
    case '28P01':
      return 'invalid_database_credentials'
    case '3D000':
      return 'database_missing'
    default:
      return undefined
  }
}

function getCause(error: unknown): unknown {
  return typeof error === 'object' && error !== null && 'cause' in error ? error.cause : undefined
}

function getStringProperty(value: unknown, property: string): string | undefined {
  if (typeof value !== 'object' || value === null || !(property in value)) {
    return undefined
  }

  const propertyValue = value[property as keyof typeof value]

  return typeof propertyValue === 'string' ? propertyValue : undefined
}
