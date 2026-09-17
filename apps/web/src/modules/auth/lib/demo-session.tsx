import { createContext, use, useCallback, useMemo, useState } from 'react'

import { type DemoProfile, type DemoSession } from '../types'

const SESSION_KEY = 'sac-nexus:demo-session:v1'
const LEGACY_PROFILE_KEY = 'sac-nexus:demo-profile'

interface DemoIdentityFixture extends DemoSession {
  password: string
}

export const demoIdentities = {
  contributor: {
    user: {
      id: 'user-contributor-001',
      email: 'contribuinte@mail.com',
      name: 'João Carlos da Silva',
      status: 'active',
    },
    profile: {
      id: 'profile-contributor-001',
      type: 'contributor',
      label: 'Contribuinte',
      role: 'legal-representative',
      userId: 'user-contributor-001',
      companyIds: ['company-abc-logistica'],
      capabilities: ['process:create', 'process:read-own', 'document:read-own'],
    },
    password: '123',
  },
  triager: {
    user: {
      id: 'user-triager-001',
      email: 'triador@email.com',
      name: 'Cap. Marina Albuquerque',
      status: 'active',
    },
    profile: {
      id: 'profile-triager-001',
      type: 'triager',
      label: 'Triador',
      role: 'fire-safety-reviewer',
      userId: 'user-triager-001',
      capabilities: ['triage:read', 'triage:review', 'triage:technical-review', 'triage:update'],
    },
    password: 'demonstracao',
  },
  inspector: {
    user: {
      id: 'user-inspector-001',
      email: 'vistoriador@email.com',
      name: 'Ten. Renata Melo',
      status: 'active',
    },
    profile: {
      id: 'profile-inspector-001',
      type: 'inspector',
      label: 'Vistoriador',
      role: 'fire-inspector',
      userId: 'user-inspector-001',
      capabilities: ['inspection:read', 'inspection:perform', 'inspection:update'],
    },
    password: 'demonstracao',
  },
  admin: {
    user: {
      id: 'user-admin-001',
      // Login curto ("AVCB") em vez de e-mail: facilita testar tudo sem trocar de persona.
      email: 'avcb',
      name: 'Administrador (testes)',
      status: 'active',
    },
    profile: {
      id: 'profile-admin-001',
      type: 'admin',
      label: 'Administrador',
      role: 'system-admin',
      userId: 'user-admin-001',
      companyIds: ['company-abc-logistica'],
      capabilities: [
        'process:create',
        'process:read-own',
        'document:read-own',
        'triage:read',
        'triage:review',
        'triage:technical-review',
        'triage:update',
        'inspection:read',
        'inspection:perform',
        'inspection:update',
      ],
    },
    password: 'Avcbteste',
  },
} as const satisfies Record<DemoProfile['type'], DemoIdentityFixture>

export const demoCredentials = {
  contributor: {
    email: demoIdentities.contributor.user.email,
    password: demoIdentities.contributor.password,
    label: 'Contribuinte — portal de processos',
  },
  triager: {
    email: demoIdentities.triager.user.email,
    password: demoIdentities.triager.password,
    label: 'Triador — análise Risco 2',
  },
  inspector: {
    email: demoIdentities.inspector.user.email,
    password: demoIdentities.inspector.password,
    label: 'Vistoriador — inspeção presencial',
  },
  admin: {
    email: demoIdentities.admin.user.email,
    password: demoIdentities.admin.password,
    label: 'Administrador — acesso total (testes)',
  },
} as const

interface DemoSessionContextValue {
  session: DemoSession | null
  signIn: (session: DemoSession) => void
  signOut: () => void
}

const DemoSessionContext = createContext<DemoSessionContextValue | null>(null)

export function resolveDemoIdentity(email: string, password: string): DemoSession | null {
  const normalizedEmail = email.trim().toLowerCase()
  const identity = Object.values(demoIdentities).find(
    (candidate) => candidate.user.email === normalizedEmail && candidate.password === password,
  )

  return identity ? { user: identity.user, profile: identity.profile } : null
}

export function saveDemoSession(session: DemoSession) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.sessionStorage.removeItem(LEGACY_PROFILE_KEY)
}

export function getDemoSession(): DemoSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const serializedSession = window.sessionStorage.getItem(SESSION_KEY)
  if (!serializedSession) {
    return null
  }

  try {
    const candidate = JSON.parse(serializedSession) as Partial<DemoSession>
    const profileType = candidate.profile?.type
    if (
      !candidate.user?.id ||
      !candidate.user.email ||
      !candidate.profile?.id ||
      (profileType !== 'contributor' &&
        profileType !== 'triager' &&
        profileType !== 'inspector' &&
        profileType !== 'admin')
    ) {
      return null
    }

    const canonicalIdentity = demoIdentities[profileType]
    if (
      candidate.user.id !== canonicalIdentity.user.id ||
      candidate.profile.id !== canonicalIdentity.profile.id
    ) {
      return null
    }

    return {
      user: canonicalIdentity.user,
      profile: canonicalIdentity.profile,
    }
  } catch {
    return null
  }
}

export function clearDemoSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(SESSION_KEY)
  window.sessionStorage.removeItem(LEGACY_PROFILE_KEY)
}

export function hasDemoProfile(profileType: DemoProfile['type']) {
  const current = getDemoSession()?.profile.type
  // O administrador de testes tem acesso a todas as áreas (passa em qualquer guard).
  return current === profileType || current === 'admin'
}

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(() => getDemoSession())

  const signIn = useCallback((nextSession: DemoSession) => {
    saveDemoSession(nextSession)
    setSession(nextSession)
  }, [])

  const signOut = useCallback(() => {
    clearDemoSession()
    setSession(null)
  }, [])

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut])

  return <DemoSessionContext value={value}>{children}</DemoSessionContext>
}

export function useDemoSession() {
  const context = use(DemoSessionContext)
  if (!context) {
    throw new Error('useDemoSession must be used inside DemoSessionProvider')
  }
  return context
}
