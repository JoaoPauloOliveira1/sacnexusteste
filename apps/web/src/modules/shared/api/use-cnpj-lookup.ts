import { useMutation } from '@tanstack/react-query'

import { type CnpjLookupResult, lookupCnpj } from './cnpj-lookup'

/**
 * On-demand CNPJ lookup. `mutateAsync(cnpj)` resolves to a normalized
 * {@link CnpjLookupResult}; also exposes `isPending`, `error`, `data`, `reset`.
 * Used by the company registration screen and the signup wizard.
 */
export function useCnpjLookup() {
  return useMutation<CnpjLookupResult, Error, string>({
    mutationFn: (cnpj: string) => lookupCnpj(cnpj),
  })
}
