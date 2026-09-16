import { type ClassificacaoRepository } from '@/database/classificacao-repository.js'
import { type ProcessoRepository } from '@/database/processo-repository.js'
import { modalidadeProcesso, riscoBands, tipoSolicitacao } from '@/database/schema.js'
import { type UnidadeRepository } from '@/database/unidade-repository.js'
import { HttpError } from '@/infra/http/http-error.js'

export type EmitDdlcbDeps = {
  processos: ProcessoRepository
  classificacoes: ClassificacaoRepository
  unidades: UnidadeRepository
}

export type DdlcbCnae = { codigo: string; descricao: string; principal: boolean }

export type DdlcbResult = {
  numero: string
  emitidoEm: string
  risco: 'I'
  empresa: { razaoSocial: string; cnpj: string }
  unidade: {
    id: string
    nome: string | null
    endereco: string
    areaConstruida: string | null
  }
  cnaes: DdlcbCnae[]
  jaEmitida: boolean
}

function formatDdlcbNumero(documentoId: string, emitidoEm: Date): string {
  const ano = emitidoEm.getUTCFullYear()
  const seq = documentoId.replace(/-/g, '').slice(0, 8).toUpperCase()
  return `DDLCB-${ano}-${seq}`
}

function joinEndereco(parts: {
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
  cep: string | null
}): string {
  const linha1 = [parts.logradouro, parts.numero].filter(Boolean).join(', ')
  const linha2 = [parts.complemento, parts.bairro].filter(Boolean).join(' - ')
  const linha3 = [parts.municipio, parts.uf].filter(Boolean).join(' / ')
  const cep = parts.cep ? `CEP ${parts.cep}` : ''
  return [linha1, linha2, linha3, cep].filter(Boolean).join(' · ')
}

/**
 * Issues (or returns the already-issued) DDLCB — Declaração de Dispensa de
 * Licenciamento do CBMPE — for a unit classified as Risco I. No payment, no
 * protocol: the document is available immediately. Idempotent per classification.
 */
export async function emitDdlcb(unidadeId: string, deps: EmitDdlcbDeps): Promise<DdlcbResult> {
  const dossie = await deps.processos.getUnidadeDossie(unidadeId)
  if (!dossie) {
    throw new HttpError(404, 'Unidade não encontrada.')
  }

  const [latest] = await deps.classificacoes.listByUnidade(unidadeId)
  if (!latest) {
    throw new HttpError(409, 'Classifique a unidade antes de emitir a DDLCB.')
  }
  if (latest.risco !== riscoBands.i) {
    throw new HttpError(
      409,
      `A DDLCB é emitida apenas para unidades em Risco I. Esta unidade está em Risco ${latest.risco}.`,
    )
  }

  const existing = await deps.processos.findDdlcbByClassificacao(latest.id)
  const record =
    existing ??
    (await deps.processos.createDdlcb({
      organizationId: dossie.organizationId,
      unidadeId,
      classificacaoId: latest.id,
      tipoSolicitacao: tipoSolicitacao.novo,
      modalidade: modalidadeProcesso.regular,
      risco: riscoBands.i,
    }))

  const cnaes = await deps.unidades.listUnidadeCnaes(unidadeId)

  return {
    numero: formatDdlcbNumero(record.documentoId, record.emitidoEm),
    emitidoEm: record.emitidoEm.toISOString(),
    risco: 'I',
    empresa: { razaoSocial: dossie.empresaRazaoSocial, cnpj: dossie.empresaCnpj },
    unidade: {
      id: dossie.unidadeId,
      nome: dossie.unidadeNome,
      endereco: joinEndereco(dossie),
      areaConstruida: dossie.areaConstruida,
    },
    cnaes: cnaes.map((c) => ({ codigo: c.codigo, descricao: c.descricao, principal: c.principal })),
    jaEmitida: Boolean(existing),
  }
}
