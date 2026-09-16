import { type ClassificacaoRepository } from '@/database/classificacao-repository.js'
import { type ProcessoRepository } from '@/database/processo-repository.js'
import { riscoBands, tipoSolicitacao } from '@/database/schema.js'
import { HttpError } from '@/infra/http/http-error.js'

export type AvcbDeps = {
  processos: ProcessoRepository
  classificacoes: ClassificacaoRepository
}

export type StartAvcbRequest = {
  dadosComplementares: unknown
  documentos: Array<{ tipo: string; key: string }>
}

export type StartAvcbResult = {
  processoId: string
  risco: string
  fase: string
  protocoloNumero: string | null
  jaExistia: boolean
}

const AVCB_RISCOS: string[] = [riscoBands.ii, riscoBands.iii]

export async function startAvcb(
  unidadeId: string,
  request: StartAvcbRequest,
  deps: AvcbDeps,
): Promise<StartAvcbResult> {
  const dossie = await deps.processos.getUnidadeDossie(unidadeId)
  if (!dossie) {
    throw new HttpError(404, 'Unidade não encontrada.')
  }

  const [latest] = await deps.classificacoes.listByUnidade(unidadeId)
  if (!latest) {
    throw new HttpError(409, 'Classifique a unidade antes de iniciar o processo AVCB.')
  }
  if (!AVCB_RISCOS.includes(latest.risco)) {
    throw new HttpError(
      409,
      `O processo AVCB é para unidades em Risco II ou III. Esta unidade está em Risco ${latest.risco}.`,
    )
  }

  const existing = await deps.processos.findOpenProcessoByClassificacao(latest.id)
  if (existing) {
    return {
      processoId: existing.id,
      risco: existing.risco,
      fase: existing.fase,
      protocoloNumero: existing.protocoloNumero,
      jaExistia: true,
    }
  }

  const { processoId } = await deps.processos.createAvcbProcesso({
    organizationId: dossie.organizationId,
    unidadeId,
    classificacaoId: latest.id,
    risco: latest.risco,
    tipoSolicitacao: tipoSolicitacao.novo,
    dadosComplementares: request.dadosComplementares,
    documentos: request.documentos.map((doc) => ({ tipo: doc.tipo, arquivoRef: doc.key })),
  })

  return {
    processoId,
    risco: latest.risco,
    fase: 'aguardando_pagamento',
    protocoloNumero: null,
    jaExistia: false,
  }
}

export type ConfirmPaymentResult = {
  protocoloNumero: string
  protocoladoEm: string
  jaProtocolado: boolean
}

function formatProtocolo(processoId: string, when: Date): string {
  const ano = when.getUTCFullYear()
  const seq = processoId.replace(/-/g, '').slice(0, 8).toUpperCase()
  return `AVCB-${ano}-${seq}`
}

/**
 * Simulated payment: confirms the (fake) payment and protocolizes the processo.
 * Protocol exists only after confirmed payment (Risco II/III). Idempotent.
 */
export async function confirmProcessoPayment(
  processoId: string,
  deps: AvcbDeps,
): Promise<ConfirmPaymentResult> {
  const proc = await deps.processos.getProcesso(processoId)
  if (!proc) {
    throw new HttpError(404, 'Processo não encontrado.')
  }
  if (proc.fase === 'protocolado' && proc.protocoloNumero && proc.protocoladoEm) {
    return {
      protocoloNumero: proc.protocoloNumero,
      protocoladoEm: proc.protocoladoEm.toISOString(),
      jaProtocolado: true,
    }
  }

  const protocoloNumero = formatProtocolo(proc.id, new Date())
  const { protocoladoEm } = await deps.processos.confirmSimulatedPayment({
    processoId,
    protocoloNumero,
  })
  return { protocoloNumero, protocoladoEm: protocoladoEm.toISOString(), jaProtocolado: false }
}

export type UnidadeProcessoResult = {
  processo: {
    id: string
    risco: string
    fase: string
    dadosComplementares: unknown
    documentos: Array<{ tipo: string; key: string | null }>
  } | null
}

/** Loads the unit's most recent processo (to recover an in-progress AVCB and pre-fill the form). */
export async function getUnidadeProcesso(
  unidadeId: string,
  deps: AvcbDeps,
): Promise<UnidadeProcessoResult> {
  const proc = await deps.processos.getLatestProcessoByUnidade(unidadeId)
  if (!proc) {
    return { processo: null }
  }
  const documentos = await deps.processos.listProcessoDocumentos(proc.id)
  return {
    processo: {
      id: proc.id,
      risco: proc.risco,
      fase: proc.fase,
      dadosComplementares: proc.dadosComplementares,
      documentos: documentos.map((doc) => ({ tipo: doc.tipo, key: doc.arquivoRef })),
    },
  }
}

export type ResponderExigenciaRequest = {
  mensagem?: string
  documentos: Array<{ tipo: string; key: string }>
}

/**
 * Citizen answers an open exigência: attaches re-sent documents + a message and
 * moves the processo back to `protocolado` (returns to analysis). Requires the
 * processo to be in `em_exigencia`.
 */
export async function responderExigencia(
  processoId: string,
  request: ResponderExigenciaRequest,
  deps: AvcbDeps,
): Promise<{ ok: true; fase: string }> {
  const proc = await deps.processos.getProcessoFull(processoId)
  if (!proc) {
    throw new HttpError(404, 'Processo não encontrado.')
  }
  if (proc.fase !== 'em_exigencia') {
    throw new HttpError(409, 'Não há exigência pendente para responder neste processo.')
  }
  const mensagem = request.mensagem?.trim() || null
  if (!mensagem && request.documentos.length === 0) {
    throw new HttpError(400, 'Envie uma mensagem ou anexe documentos para responder a exigência.')
  }
  await deps.processos.responderExigencia({
    organizationId: proc.organizationId,
    processoId,
    mensagem,
    documentos: request.documentos.map((doc) => ({ tipo: doc.tipo, arquivoRef: doc.key })),
  })
  return { ok: true, fase: 'protocolado' }
}
