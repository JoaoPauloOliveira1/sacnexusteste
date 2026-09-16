import { useMutation } from '@tanstack/react-query'

import { type EmpresaRegistrationResult, registerEmpresaByCnpj } from './register-empresa'

/**
 * On-demand empresa registration from a CNPJ via the domain API.
 * `mutateAsync(cnpj)` resolves to the persisted empresa + CNAEs (with risk band).
 */
export function useRegisterEmpresa() {
  return useMutation<EmpresaRegistrationResult, Error, string>({
    mutationFn: (cnpj: string) => registerEmpresaByCnpj(cnpj),
  })
}
