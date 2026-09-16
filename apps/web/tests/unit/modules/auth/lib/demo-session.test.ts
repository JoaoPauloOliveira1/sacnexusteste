import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearDemoSession,
  demoIdentities,
  getDemoSession,
  hasDemoProfile,
  resolveDemoIdentity,
  saveDemoSession,
} from '@/modules/auth'

describe('demo session', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('resolves the contributor as a user with a contributor profile', () => {
    const session = resolveDemoIdentity(' CONTRIBUINTE@MAIL.COM ', '123')

    expect(session).toEqual({
      user: demoIdentities.contributor.user,
      profile: demoIdentities.contributor.profile,
    })
    expect(session?.profile.type).toBe('contributor')
    if (session?.profile.type === 'contributor') {
      expect(session.profile.companyIds).toEqual(['company-abc-logistica'])
    }
  })

  it('rejects invalid credentials', () => {
    expect(resolveDemoIdentity('contribuinte@mail.com', 'wrong-password')).toBeNull()
  })

  it('persists no password and restores only the canonical identity', () => {
    saveDemoSession({
      user: demoIdentities.contributor.user,
      profile: demoIdentities.contributor.profile,
    })

    const serializedSession = window.sessionStorage.getItem('sac-nexus:demo-session:v1')
    expect(serializedSession).not.toContain('"password"')
    expect(getDemoSession()).toEqual({
      user: demoIdentities.contributor.user,
      profile: demoIdentities.contributor.profile,
    })
    expect(hasDemoProfile('contributor')).toBe(true)
  })

  it('rejects a tampered profile projection', () => {
    window.sessionStorage.setItem(
      'sac-nexus:demo-session:v1',
      JSON.stringify({
        user: demoIdentities.contributor.user,
        profile: {
          ...demoIdentities.contributor.profile,
          id: 'profile-injected',
          capabilities: ['triage:update'],
        },
      }),
    )

    expect(getDemoSession()).toBeNull()
  })

  it('clears the current and legacy presentation keys', () => {
    saveDemoSession({
      user: demoIdentities.triager.user,
      profile: demoIdentities.triager.profile,
    })
    window.sessionStorage.setItem('sac-nexus:demo-profile', 'triager')

    clearDemoSession()

    expect(getDemoSession()).toBeNull()
    expect(window.sessionStorage.getItem('sac-nexus:demo-profile')).toBeNull()
  })
})
