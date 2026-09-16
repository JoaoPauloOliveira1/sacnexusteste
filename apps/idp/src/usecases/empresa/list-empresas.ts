import { type EmpresaListItem, type EmpresaRepository } from '@/database/empresa-repository.js'

export type ListEmpresasInput = {
  /** Optional: when omitted, a dev default organization is resolved (temporary until auth/tenant). */
  organizationId?: string
}

export type ListEmpresasDeps = { empresas: EmpresaRepository }

export async function listEmpresas(
  input: ListEmpresasInput,
  deps: ListEmpresasDeps,
): Promise<{ empresas: EmpresaListItem[] }> {
  const organizationId = input.organizationId ?? (await deps.empresas.ensureDefaultOrganization())
  return { empresas: await deps.empresas.listEmpresas(organizationId) }
}
