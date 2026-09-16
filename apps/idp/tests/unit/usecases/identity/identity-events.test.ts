import { describe, expect, it, vi } from 'vitest'
import {
  type IdentityEvent,
  type IdentityEventPublisher,
  identityEventNames,
  identityEventOutcomes,
  identityOperationLabels,
  identityReasonCodes,
} from '@/events/index.js'
import { type IdentityAuthService } from '@/identity/auth-service.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'
import { changePassword } from '@/usecases/identity/change-password.js'
import { getAuthOk } from '@/usecases/identity/get-auth-ok.js'
import { getAuthSession } from '@/usecases/identity/get-auth-session.js'
import { requestPasswordReset } from '@/usecases/identity/request-password-reset.js'
import { resetPassword } from '@/usecases/identity/reset-password.js'
import { sendVerificationEmail } from '@/usecases/identity/send-verification-email.js'
import { signInWithEmail } from '@/usecases/identity/sign-in-with-email.js'
import { signOut } from '@/usecases/identity/sign-out.js'
import { signUpWithEmail } from '@/usecases/identity/sign-up-with-email.js'
import { verifyEmail } from '@/usecases/identity/verify-email.js'
import { assertIdentityEventSafe } from '../../test-support/assert-identity-event-safety.js'

const headers = new Headers({ cookie: 'better-auth.session_token=session-token' })
const safePassword = 'strong-password-2026'
const forbiddenValues = [
  'user@example.test',
  'missing@example.test',
  'current-password',
  'new-strong-password',
  'reset-token',
  'verify-token',
  'session-token',
  'sensitive-response-token',
  'https://app.example.test/auth/reset-password?token=reset-token',
]

describe('identity use case events', () => {
  it('publishes a safe event for every Unit 1 auth wrapper flow', async () => {
    const { events, publisher } = createPublisher()
    const auth = createAuthService()
    const context = createContext()

    await signUpWithEmail(context, {
      auth,
      body: { email: 'user@example.test', name: 'Synthetic User', password: safePassword },
      headers,
      identityEvents: publisher,
    })
    await signInWithEmail(context, {
      auth,
      body: { email: 'user@example.test', password: safePassword },
      headers,
      identityEvents: publisher,
    })
    await signOut(context, { auth, headers, identityEvents: publisher })
    await getAuthSession(context, { auth, headers, identityEvents: publisher })
    await getAuthOk(context, { auth, identityEvents: publisher })
    await verifyEmail(context, {
      auth,
      headers,
      identityEvents: publisher,
      query: { callbackURL: 'https://app.example.test/verified', token: 'verify-token' },
    })
    await sendVerificationEmail(context, {
      auth,
      body: { callbackURL: 'https://app.example.test/verified', email: 'user@example.test' },
      headers,
      identityEvents: publisher,
    })
    await requestPasswordReset(context, {
      auth,
      body: {
        email: 'user@example.test',
        redirectTo: 'https://app.example.test/auth/reset-password?token=reset-token',
      },
      headers,
      identityEvents: publisher,
    })
    await resetPassword(context, {
      auth,
      body: { newPassword: 'new-strong-password', token: 'reset-token' },
      headers,
      identityEvents: publisher,
    })
    await changePassword(context, {
      auth,
      body: { currentPassword: 'current-password', newPassword: 'new-strong-password' },
      headers,
      identityEvents: publisher,
    })

    expect(events).toHaveLength(10)
    expect(events.map((event) => [event.name, event.operation, event.outcome])).toEqual([
      [identityEventNames.signUpEmail, identityOperationLabels.signUpEmail, 'succeeded'],
      [identityEventNames.signInEmail, identityOperationLabels.signInEmail, 'succeeded'],
      [identityEventNames.signOut, identityOperationLabels.signOut, 'succeeded'],
      [identityEventNames.getSession, identityOperationLabels.getSession, 'succeeded'],
      [identityEventNames.authOk, identityOperationLabels.authOk, 'succeeded'],
      [identityEventNames.verifyEmail, identityOperationLabels.verifyEmail, 'succeeded'],
      [
        identityEventNames.sendVerificationEmail,
        identityOperationLabels.sendVerificationEmail,
        'succeeded',
      ],
      [
        identityEventNames.requestPasswordReset,
        identityOperationLabels.requestPasswordReset,
        'succeeded',
      ],
      [identityEventNames.resetPassword, identityOperationLabels.resetPassword, 'succeeded'],
      [identityEventNames.changePassword, identityOperationLabels.changePassword, 'succeeded'],
    ])

    for (const event of events) {
      expect(event.request_id).toBe('request-1')
      assertIdentityEventSafe(event, forbiddenValues)
    }
  })

  it('publishes controlled Better Auth failures without consuming or replacing the response', async () => {
    const { events, publisher } = createPublisher()
    const betterAuthResponse = Response.json(
      { token: 'sensitive-response-token', user: { email: 'user@example.test' } },
      { status: 401 },
    )
    const auth = createAuthService({ signInEmail: vi.fn(async () => betterAuthResponse) })

    const response = await signInWithEmail(createContext(), {
      auth,
      body: { email: 'user@example.test', password: safePassword },
      headers,
      identityEvents: publisher,
    })

    expect(response).toBe(betterAuthResponse)
    expect(events).toEqual([
      expect.objectContaining({
        name: identityEventNames.signInEmail,
        operation: identityOperationLabels.signInEmail,
        outcome: identityEventOutcomes.failed,
        reason_code: identityReasonCodes.betterAuthRejected,
        request_id: 'request-1',
      }),
    ])
    assertIdentityEventSafe(events[0], forbiddenValues)
  })

  it('publishes local password-policy failures before returning the existing error response', async () => {
    const { events, publisher } = createPublisher()
    const signUpEmail = vi.fn(async () => Response.json({ ok: true }))
    const auth = createAuthService({ signUpEmail })

    const response = await signUpWithEmail(createContext(), {
      auth,
      body: { email: 'user@example.test', name: 'Synthetic User', password: 'short' },
      headers,
      identityEvents: publisher,
    })

    expect(response.status).toBe(400)
    expect(signUpEmail).not.toHaveBeenCalled()
    expect(events).toEqual([
      expect.objectContaining({
        name: identityEventNames.signUpEmail,
        operation: identityOperationLabels.signUpEmail,
        outcome: identityEventOutcomes.failed,
        reason_code: identityReasonCodes.passwordPolicyViolation,
        request_id: 'request-1',
      }),
    ])
    assertIdentityEventSafe(events[0], forbiddenValues)
  })

  it('records controlled generic-response failures while preserving generic public behavior', async () => {
    const { events, publisher } = createPublisher()
    const auth = createAuthService({
      requestPasswordReset: vi.fn(async () =>
        Response.json({ message: 'User not found' }, { status: 400 }),
      ),
    })

    const response = await requestPasswordReset(createContext(), {
      auth,
      body: {
        email: 'missing@example.test',
        redirectTo: 'https://app.example.test/auth/reset-password?token=reset-token',
      },
      headers,
      identityEvents: publisher,
    })

    await expect(response.json()).resolves.toEqual({
      message: 'If an account exists, password reset instructions will be sent.',
      status: true,
    })
    expect(events).toEqual([
      expect.objectContaining({
        name: identityEventNames.requestPasswordReset,
        operation: identityOperationLabels.requestPasswordReset,
        outcome: identityEventOutcomes.failed,
        reason_code: identityReasonCodes.betterAuthRejected,
      }),
    ])
    assertIdentityEventSafe(events[0], forbiddenValues)
  })
})

function createContext(): RequestContext {
  return {
    canonicalEvent: { setAuthOperation: vi.fn() },
    logger: {},
    requestId: 'request-1',
  } as unknown as RequestContext
}

function createPublisher(): { events: IdentityEvent[]; publisher: IdentityEventPublisher } {
  const events: IdentityEvent[] = []

  return {
    events,
    publisher: {
      publish: vi.fn(async (event) => {
        events.push(event)
      }),
    },
  }
}

function createAuthService(overrides: Partial<IdentityAuthService> = {}): IdentityAuthService {
  return {
    changePassword: async () => Response.json({ ok: true }),
    getSession: async () => Response.json(null),
    ok: async () => Response.json({ ok: true }),
    requestPasswordResetCallback: async () => Response.json({ ok: true }),
    requestPasswordReset: async () => Response.json({ ok: true }),
    resetPassword: async () => Response.json({ ok: true }),
    sendVerificationEmail: async () => Response.json({ ok: true }),
    signInEmail: async () => Response.json({ ok: true }),
    signOut: async () => Response.json({ ok: true }),
    signUpEmail: async () => Response.json({ ok: true }),
    verifyEmail: async () => Response.json({ ok: true }),
    ...overrides,
  }
}
