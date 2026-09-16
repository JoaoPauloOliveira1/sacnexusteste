import { createContext, use, useCallback, useMemo, useState } from 'react'
import { type Company } from '../types'

interface CompaniesContextValue {
  companies: readonly Company[]
  registerCompany: (company: Company) => void
}

const CompaniesContext = createContext<CompaniesContextValue | null>(null)

export function CompaniesProvider({ children }: { children: React.ReactNode }) {
  // No seeded demo company — companies are the ones the user actually registers,
  // so a fake company never shows up as an option to start a process.
  const [companies, setCompanies] = useState<Company[]>([])

  const registerCompany = useCallback((company: Company) => {
    setCompanies((currentCompanies) => {
      const existingIndex = currentCompanies.findIndex(
        (candidate) => candidate.cnpj === company.cnpj,
      )
      if (existingIndex === -1) {
        return [...currentCompanies, company]
      }

      return currentCompanies.map((candidate, index) =>
        index === existingIndex ? company : candidate,
      )
    })
  }, [])

  const value = useMemo(() => ({ companies, registerCompany }), [companies, registerCompany])

  return <CompaniesContext value={value}>{children}</CompaniesContext>
}

export function useCompanies() {
  const context = use(CompaniesContext)
  if (!context) {
    throw new Error('useCompanies must be used inside CompaniesProvider')
  }
  return context
}
