import { type EmpresaRepository } from '@/database/empresa-repository.js'
import { HttpError } from '@/infra/http/http-error.js'

export type DeleteEmpresaInput = {
  empresaId: string
  /** CNPJ typed by the user to confirm the deletion (digits or formatted). */
  cnpjConfirmacao: string
}

export type DeleteEmpresaDeps = { empresas: EmpresaRepository }

const onlyDigits = (value: string): string => value.replace(/\D/g, '')

export async function deleteEmpresa(
  input: DeleteEmpresaInput,
  deps: DeleteEmpresaDeps,
): Promise<{ ok: true }> {
  const empresa = await deps.empresas.getEmpresaById(input.empresaId)
  if (!empresa) {
    throw new HttpError(404, 'Empresa não encontrada.')
  }

  // The typed CNPJ must match the empresa's CNPJ — the deletion is irreversible.
  if (onlyDigits(input.cnpjConfirmacao) !== onlyDigits(empresa.cnpj)) {
    throw new HttpError(400, 'O CNPJ informado não confere com a empresa a excluir.')
  }

  await deps.empresas.deleteEmpresa(input.empresaId)
  return { ok: true }
}
