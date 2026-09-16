import { randomUUID } from 'node:crypto'
import { type IncomingHttpHeaders } from 'node:http'

const REQUEST_ID_HEADER = 'x-request-id'
const CORRELATION_ID_HEADER = 'x-correlation-id'
const SAFE_REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/

export function resolveRequestId(headers: IncomingHttpHeaders): string {
  return (
    getSafeHeaderValue(headers[REQUEST_ID_HEADER]) ??
    getSafeHeaderValue(headers[CORRELATION_ID_HEADER]) ??
    randomUUID()
  )
}

function getSafeHeaderValue(value: string | string[] | undefined): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value
  const trimmedCandidate = candidate?.trim()

  if (!trimmedCandidate || !SAFE_REQUEST_ID_PATTERN.test(trimmedCandidate)) {
    return undefined
  }

  return trimmedCandidate
}
