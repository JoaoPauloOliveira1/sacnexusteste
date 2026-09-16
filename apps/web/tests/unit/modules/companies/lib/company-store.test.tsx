import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CompaniesProvider, demoCompany, useCompanies } from '@/modules/companies'

describe('companies presentation store', () => {
  it('starts empty and appends each registered company', () => {
    const { result } = renderHook(() => useCompanies(), {
      wrapper: CompaniesProvider,
    })

    expect(result.current.companies).toEqual([])

    act(() => {
      result.current.registerCompany({
        ...demoCompany,
        id: 'company-nova',
        cnpj: '98.765.432/0001-10',
        legalName: 'Nova Empresa LTDA',
        tradeName: 'Nova Empresa',
      })
    })

    expect(result.current.companies.map(({ id }) => id)).toEqual(['company-nova'])
  })
})
