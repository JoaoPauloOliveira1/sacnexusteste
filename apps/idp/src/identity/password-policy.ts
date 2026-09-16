export const passwordPolicy = {
  maxLength: 128,
  minLength: 12,
} as const

const commonPasswordDenylist = new Set([
  '123456789012',
  'admin12345678',
  'password1234',
  'qwerty123456',
  'sacnexus1234',
  'sacnexus2026',
  'senhasac1234',
])

export function getPasswordPolicyViolation(password: string): string | undefined {
  if (password.length < passwordPolicy.minLength) {
    return `Password must contain at least ${passwordPolicy.minLength} characters.`
  }

  if (password.length > passwordPolicy.maxLength) {
    return `Password must contain at most ${passwordPolicy.maxLength} characters.`
  }

  if (commonPasswordDenylist.has(normalizePassword(password))) {
    return 'Password is too common.'
  }

  return undefined
}

export function createPasswordPolicyErrorResponse(message: string): Response {
  return Response.json({ message }, { status: 400 })
}

function normalizePassword(password: string): string {
  return password.trim().toLowerCase()
}
