import { type RiscoBand, riscoBands } from '@/database/schema.js'
import {
  type CnaeOption,
  type UnidadeDetail,
  type UnidadeRepository,
  type UnidadeSummary,
} from '@/database/unidade-repository.js'
import { HttpError } from '@/infra/http/http-error.js'

export type UnidadeDeps = { unidades: UnidadeRepository }

const BAND_RANK: Record<RiscoBand, number> = {
  [riscoBands.i]: 0,
  [riscoBands.undetermined]: 1,
  [riscoBands.ii]: 2,
  [riscoBands.iii]: 3,
}

function highestBand(bands: RiscoBand[]): RiscoBand | null {
  let best: RiscoBand | null = null
  for (const band of bands) {
    if (best === null || BAND_RANK[band] > BAND_RANK[best]) {
      best = band
    }
  }
  return best
}

export type EmpresaEndereco = {
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
}

export async function listEmpresaCnaes(
  empresaId: string,
  deps: UnidadeDeps,
): Promise<{ empresaId: string; cnaes: CnaeOption[]; empresa: EmpresaEndereco }> {
  const empresa = await deps.unidades.findEmpresa(empresaId)
  if (!empresa) {
    throw new HttpError(404, 'Empresa não encontrada.')
  }
  return {
    empresaId,
    cnaes: await deps.unidades.listEmpresaCnaes(empresaId),
    empresa: {
      cep: empresa.cep,
      logradouro: empresa.logradouro,
      numero: empresa.numero,
      complemento: empresa.complemento,
      bairro: empresa.bairro,
      municipio: empresa.municipio,
      uf: empresa.uf,
    },
  }
}

export async function listUnidades(
  empresaId: string,
  deps: UnidadeDeps,
): Promise<{ empresaId: string; unidades: UnidadeSummary[] }> {
  const empresa = await deps.unidades.findEmpresa(empresaId)
  if (!empresa) {
    throw new HttpError(404, 'Empresa não encontrada.')
  }
  return { empresaId, unidades: await deps.unidades.listUnidadesByEmpresa(empresaId) }
}

export async function getUnidadeCnaes(
  unidadeId: string,
  deps: UnidadeDeps,
): Promise<{ unidadeId: string; cnaes: CnaeOption[] }> {
  return { unidadeId, cnaes: await deps.unidades.listUnidadeCnaes(unidadeId) }
}

export type CreateUnidadeRequest = {
  nome?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  municipio?: string
  uf?: string
  areaConstruida?: string
  cnaeIds: string[]
}

export type CreateUnidadeResult = {
  unidadeId: string
  nome: string | null
  overallRisk: RiscoBand | null
  cnaes: CnaeOption[]
}

export async function createUnidade(
  empresaId: string,
  request: CreateUnidadeRequest,
  deps: UnidadeDeps,
): Promise<CreateUnidadeResult> {
  const empresa = await deps.unidades.findEmpresa(empresaId)
  if (!empresa) {
    throw new HttpError(404, 'Empresa não encontrada.')
  }

  // Confirmed CNAEs must belong to the empresa.
  const empresaCnaeIds = new Set(
    (await deps.unidades.listEmpresaCnaes(empresaId)).map((c) => c.cnaeId),
  )
  const cnaeIds = [...new Set(request.cnaeIds)].filter((id) => empresaCnaeIds.has(id))

  const { unidadeId } = await deps.unidades.createUnidade({
    organizationId: empresa.organizationId,
    pessoaJuridicaId: empresaId,
    nome: request.nome?.trim() || null,
    cep: request.cep ?? empresa.cep,
    logradouro: request.logradouro ?? empresa.logradouro,
    numero: request.numero ?? empresa.numero,
    complemento: request.complemento ?? empresa.complemento,
    bairro: request.bairro ?? empresa.bairro,
    municipio: request.municipio ?? empresa.municipio,
    uf: request.uf ?? empresa.uf,
    areaConstruida: request.areaConstruida?.trim() || null,
    cnaeIds,
  })

  const cnaes = await deps.unidades.listUnidadeCnaes(unidadeId)

  return {
    unidadeId,
    nome: request.nome?.trim() || null,
    overallRisk: highestBand(cnaes.map((c) => c.band)),
    cnaes,
  }
}

export async function getUnidade(
  unidadeId: string,
  deps: UnidadeDeps,
): Promise<UnidadeDetail & { completa: boolean }> {
  const unidade = await deps.unidades.getUnidade(unidadeId)
  if (!unidade) {
    throw new HttpError(404, 'Unidade não encontrada.')
  }
  const completa =
    unidade.areaConstruida != null &&
    unidade.pavimentos != null &&
    unidade.ocupacao != null &&
    Boolean(unidade.tipoExploracao)
  return { ...unidade, completa }
}

export type UpdateUnidadeRequest = {
  nome?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  municipio?: string
  uf?: string
  areaConstruida?: string
  pavimentos?: number
  ocupacao?: number
  tipoExploracao?: string
}

const clean = (value: string | undefined): string | undefined =>
  value === undefined ? undefined : value.trim() || undefined

export async function updateUnidade(
  unidadeId: string,
  request: UpdateUnidadeRequest,
  deps: UnidadeDeps,
): Promise<UnidadeDetail & { completa: boolean }> {
  const existing = await deps.unidades.getUnidade(unidadeId)
  if (!existing) {
    throw new HttpError(404, 'Unidade não encontrada.')
  }
  if (request.pavimentos !== undefined && request.pavimentos < 1) {
    throw new HttpError(400, 'O número de pavimentos deve ser pelo menos 1 (o térreo).')
  }
  if (request.ocupacao !== undefined && request.ocupacao < 0) {
    throw new HttpError(400, 'A ocupação não pode ser negativa.')
  }

  await deps.unidades.updateUnidade({
    unidadeId,
    ...(request.nome !== undefined ? { nome: clean(request.nome) ?? null } : {}),
    ...(request.cep !== undefined ? { cep: clean(request.cep) ?? null } : {}),
    ...(request.logradouro !== undefined ? { logradouro: clean(request.logradouro) ?? null } : {}),
    ...(request.numero !== undefined ? { numero: clean(request.numero) ?? null } : {}),
    ...(request.complemento !== undefined
      ? { complemento: clean(request.complemento) ?? null }
      : {}),
    ...(request.bairro !== undefined ? { bairro: clean(request.bairro) ?? null } : {}),
    ...(request.municipio !== undefined ? { municipio: clean(request.municipio) ?? null } : {}),
    ...(request.uf !== undefined ? { uf: clean(request.uf) ?? null } : {}),
    ...(request.areaConstruida !== undefined
      ? { areaConstruida: clean(request.areaConstruida) ?? null }
      : {}),
    ...(request.pavimentos !== undefined ? { pavimentos: request.pavimentos } : {}),
    ...(request.ocupacao !== undefined ? { ocupacao: request.ocupacao } : {}),
    ...(request.tipoExploracao !== undefined
      ? { tipoExploracao: clean(request.tipoExploracao) ?? null }
      : {}),
  })

  return getUnidade(unidadeId, deps)
}
