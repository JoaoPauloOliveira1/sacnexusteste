export interface DemoUser {
  id: string
  email: string
  name: string
  status: 'active'
}

interface DemoProfileBase {
  id: string
  label: string
  userId: string
}

export interface ContributorDemoProfile extends DemoProfileBase {
  type: 'contributor'
  role: 'legal-representative'
  companyIds: readonly string[]
  capabilities: readonly ['process:create', 'process:read-own', 'document:read-own']
}

export interface TriagerDemoProfile extends DemoProfileBase {
  type: 'triager'
  role: 'fire-safety-reviewer'
  capabilities: readonly [
    'triage:read',
    'triage:review',
    'triage:technical-review',
    'triage:update',
  ]
}

export interface InspectorDemoProfile extends DemoProfileBase {
  type: 'inspector'
  role: 'fire-inspector'
  capabilities: readonly ['inspection:read', 'inspection:perform', 'inspection:update']
}

/**
 * Perfil de administrador de demonstração: acesso irrestrito a todas as áreas
 * (contribuinte, triagem, análise, vistoria) sem precisar trocar de persona.
 * Usado apenas para testes end-to-end.
 */
export interface AdminDemoProfile extends DemoProfileBase {
  type: 'admin'
  role: 'system-admin'
  companyIds: readonly string[]
  capabilities: readonly string[]
}

export type DemoProfile =
  | ContributorDemoProfile
  | TriagerDemoProfile
  | InspectorDemoProfile
  | AdminDemoProfile

export interface DemoSession {
  user: DemoUser
  profile: DemoProfile
}
