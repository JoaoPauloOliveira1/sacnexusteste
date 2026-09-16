import { expect } from 'vitest'

const forbiddenEventKeys = new Set([
  'accessToken',
  'address',
  'body',
  'callbackURL',
  'cnpj',
  'cookie',
  'cpf',
  'currentPassword',
  'email',
  'html',
  'idToken',
  'newPassword',
  'password',
  'phone',
  'providerResponse',
  'rawProviderResponse',
  'refreshToken',
  'requestBody',
  'resetUrl',
  'responseBody',
  'sessionId',
  'sessionToken',
  'token',
  'url',
  'verificationUrl',
])

export function assertIdentityEventSafe(
  event: unknown,
  forbiddenValues: readonly string[] = [],
): void {
  assertForbiddenKeysAbsent(event)

  const serializedEvent = JSON.stringify(event)

  for (const forbiddenValue of forbiddenValues) {
    expect(serializedEvent).not.toContain(forbiddenValue)
  }
}

function assertForbiddenKeysAbsent(value: unknown): void {
  if (Array.isArray(value)) {
    for (const entry of value) {
      assertForbiddenKeysAbsent(entry)
    }

    return
  }

  if (value === null || value === undefined || typeof value !== 'object') {
    return
  }

  for (const [key, entryValue] of Object.entries(value)) {
    expect(forbiddenEventKeys.has(key)).toBe(false)
    assertForbiddenKeysAbsent(entryValue)
  }
}
