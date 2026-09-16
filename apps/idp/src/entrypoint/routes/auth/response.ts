import { type FastifyReply, type FastifyRequest } from 'fastify'

const hiddenResponseKeys = new Set([
  'token',
  'idToken',
  'accessToken',
  'refreshToken',
  'accessTokenExpiresAt',
  'refreshTokenExpiresAt',
  'ipAddress',
  'userAgent',
  'userId',
])

const ignoredForwardedHeaders = new Set(['content-encoding', 'content-length', 'transfer-encoding'])

export async function sendAuthApiResponse(
  response: Response,
  reply: FastifyReply,
): Promise<FastifyReply> {
  copyResponseHeaders(response, reply)

  const payload = await readResponsePayload(response)
  const transformedPayload = transformAuthPayload(payload)

  return reply.status(response.status).send(transformedPayload)
}

export function createAuthHeaders(request: FastifyRequest): Headers {
  const headers = new Headers()

  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value)
      continue
    }

    if (Array.isArray(value)) {
      for (const headerValue of value) {
        headers.append(key, headerValue)
      }
    }
  }

  return headers
}

function copyResponseHeaders(response: Response, reply: FastifyReply): void {
  const setCookies = getSetCookies(response.headers)

  for (const [key, value] of response.headers.entries()) {
    const normalizedKey = key.toLowerCase()

    if (normalizedKey !== 'set-cookie' && !ignoredForwardedHeaders.has(normalizedKey)) {
      reply.header(key, value)
    }
  }

  if (setCookies.length > 0) {
    reply.header('set-cookie', setCookies)
  }
}

function getSetCookies(headers: Headers): string[] {
  const headersWithCookies = headers as Headers & { getSetCookie?: () => string[] }
  const explicitCookies = headersWithCookies.getSetCookie?.()

  if (explicitCookies && explicitCookies.length > 0) {
    return explicitCookies
  }

  const cookie = headers.get('set-cookie')

  return cookie ? [cookie] : []
}

async function readResponsePayload(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) {
    return undefined
  }

  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    return text
  }

  return JSON.parse(text) as unknown
}

export function transformAuthPayload(payload: unknown): unknown {
  if (payload === null) {
    return { authenticated: false }
  }

  if (payload === undefined || typeof payload !== 'object') {
    return payload
  }

  if (isSessionResponse(payload)) {
    return {
      authenticated: true,
      session: transformSession(payload.session),
      user: transformUser(payload.user),
    }
  }

  return transformValue(payload)
}

function isSessionResponse(payload: unknown): payload is { session: unknown; user: unknown } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'session' in payload &&
    'user' in payload &&
    Boolean((payload as { session?: unknown }).session)
  )
}

function transformSession(session: unknown): unknown {
  if (session === null || session === undefined || typeof session !== 'object') {
    return session
  }

  return transformValue(session, { dropId: true })
}

function transformUser(user: unknown): unknown {
  if (user === null || user === undefined || typeof user !== 'object') {
    return user
  }

  return transformValue(user)
}

function transformValue(value: unknown, options: { dropId?: boolean } = {}): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => transformValue(entry, options))
  }

  if (value === null || value === undefined || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !(options.dropId && key === 'id') && !hiddenResponseKeys.has(key))
      .map(([key, entryValue]) => [toSnakeCase(key), transformValue(entryValue)]),
  )
}

function toSnakeCase(value: string): string {
  return value.replace(/[A-Z]/g, (character) => `_${character.toLowerCase()}`)
}
