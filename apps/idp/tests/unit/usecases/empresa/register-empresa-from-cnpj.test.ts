import { describe, expect, it, vi } from 'vitest'

import { type EmpresaRepository, type SaveEmpresaInput } from '@/database/empresa-repository.js'
import { type CnpjCompanyData, CnpjLookupError } from '@/infra/integrations/cnpj/cnpj-provider.js'
import { registerEmpresaFromCnpj } from '@/usecases/empresa/register-empresa-from-cnpj.js'

const company: CnpjCompanyData = {
  cnpj: '47960950000121',
  legalName: 'MAGAZINE LUIZA S/A',
  tradeName: 'MAGALU',
  registrationStatus: 'ATIVA',
  openingDate: '1966-10-24',
  legalNature: 'Sociedade Anônima Aberta',
  porte: 'DEMAIS',
  email: '',
  phone: '1637112002',
  cep: '14400490',
  street: 'VOLUNTARIOS DA FRANCA',
  number: '1465',
  complement: '',
  neighborhood: 'CENTRO',
  city: 'FRANCA',
  state: 'SP',
  cnaes: [
    {
      numerico: '4713004',
      codigo: '4713-0/04',
      descricao: 'Lojas de departamentos',
      principal: true,
    },
    { numerico: '4635401', codigo: '4635-4/01', descricao: 'Água mineral', principal: false },
    { numerico: '9999999', codigo: '9999-9/99', descricao: 'Fora do decreto', principal: false },
  ],
  socios: [{ nome: 'FULANO', documento: '***', qualificacao: 'Diretor' }],
  source: 'brasilapi',
}

function createDeps() {
  const saveEmpresa = vi.fn(async (_input: SaveEmpresaInput) => ({ empresaId: 'empresa-1' }))
  const empresas: EmpresaRepository = {
    findCnaeBandsByNumerico: async () =>
      new Map([
        ['4713004', { cnaeId: 'c-a', numerico: '4713004', band: 'I' as const }],
        ['4635401', { cnaeId: 'c-b', numerico: '4635401', band: 'undetermined' as const }],
      ]),
    saveEmpresa,
    ensureDefaultOrganization: async () => 'default-org',
    listEmpresas: async () => [],
    getEmpresaById: async () => null,
    deleteEmpresa: async () => {},
  }
  return { cnpjProvider: { fetch: async () => company }, empresas, saveEmpresa }
}

describe('registerEmpresaFromCnpj', () => {
  it('maps each CNAE to its risk band and computes the highest overall risk', async () => {
    const { saveEmpresa, ...deps } = createDeps()

    const result = await registerEmpresaFromCnpj(
      { cnpj: '47.960.950/0001-21', organizationId: 'org-1' },
      deps,
    )

    expect(result.empresaId).toBe('empresa-1')
    expect(result.legalName).toBe('MAGAZINE LUIZA S/A')
    expect(result.cnaes.map((c) => c.band)).toEqual(['I', 'undetermined', null])
    expect(result.overallRisk).toBe('undetermined')

    // Only CNAEs found in sac_cnae are linked; the one outside the decree is skipped.
    expect(saveEmpresa).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 'org-1', cnpj: '47960950000121' }),
    )
    const saved = saveEmpresa.mock.calls[0]?.[0]
    expect(saved?.cnaeLinks).toHaveLength(2)
  })

  it('rejects an invalid CNPJ before any lookup', async () => {
    const { saveEmpresa, ...deps } = createDeps()
    const fetchSpy = vi.spyOn(deps.cnpjProvider, 'fetch')

    await expect(
      registerEmpresaFromCnpj({ cnpj: '11.111.111/1111-11', organizationId: 'org-1' }, deps),
    ).rejects.toMatchObject({ kind: 'invalid' })
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(saveEmpresa).not.toHaveBeenCalled()
    // Sanity: the error is the domain error type.
    await expect(
      registerEmpresaFromCnpj({ cnpj: 'abc', organizationId: 'org-1' }, deps),
    ).rejects.toBeInstanceOf(CnpjLookupError)
  })
})
