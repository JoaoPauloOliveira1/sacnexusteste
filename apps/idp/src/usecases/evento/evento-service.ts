import { type EmpresaRepository } from '@/database/empresa-repository.js'
import { type EventoRepository, type EventoSummary } from '@/database/evento-repository.js'
import { type ProcessoRepository } from '@/database/processo-repository.js'
import {
  modalidadeProcesso,
  type RiscoBand,
  riscoBands,
  tipoSolicitacao,
} from '@/database/schema.js'
import { HttpError } from '@/infra/http/http-error.js'

export type EventoDeps = {
  eventos: EventoRepository
  processos: ProcessoRepository
  empresas: EmpresaRepository
}

const SIX_MONTHS_MS = 186 * 24 * 60 * 60 * 1000

export type CreateEventoRequest = {
  nome?: string
  solicitanteNome?: string
  solicitanteCpf?: string
  risco: 'II' | 'III'
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  municipio?: string
  uf?: string
  inicioEm: string
  terminoEm: string
}

export async function createEvento(
  input: CreateEventoRequest,
  deps: EventoDeps,
): Promise<{ eventoId: string }> {
  const organizationId = await deps.empresas.ensureDefaultOrganization()
  if (input.risco !== 'II' && input.risco !== 'III') {
    throw new HttpError(400, 'Eventos temporários são sempre Risco II ou III.')
  }
  const inicio = new Date(input.inicioEm)
  const termino = new Date(input.terminoEm)
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(termino.getTime())) {
    throw new HttpError(400, 'Informe as datas de início e término.')
  }
  if (termino <= inicio) {
    throw new HttpError(400, 'A data de término deve ser posterior à de início.')
  }
  if (termino.getTime() - inicio.getTime() > SIX_MONTHS_MS) {
    throw new HttpError(400, 'A duração do evento não pode exceder 6 meses.')
  }

  return deps.eventos.createEvento({
    organizationId,
    nome: input.nome?.trim() || null,
    solicitanteNome: input.solicitanteNome?.trim() || null,
    solicitanteCpf: input.solicitanteCpf?.trim() || null,
    risco: input.risco as RiscoBand,
    cep: input.cep?.trim() || null,
    logradouro: input.logradouro?.trim() || null,
    numero: input.numero?.trim() || null,
    complemento: input.complemento?.trim() || null,
    bairro: input.bairro?.trim() || null,
    municipio: input.municipio?.trim() || null,
    uf: input.uf?.trim() || null,
    inicioEm: inicio,
    terminoEm: termino,
  })
}

export async function listEventos(deps: EventoDeps): Promise<{ eventos: EventoSummary[] }> {
  const organizationId = await deps.empresas.ensureDefaultOrganization()
  return { eventos: await deps.eventos.listEventos(organizationId) }
}

export type StartAvcbEventoResult = {
  processoId: string
  risco: string
  fase: string
  protocoloNumero: string | null
  jaExistia: boolean
}

export async function startAvcbEvento(
  eventoId: string,
  request: { dadosComplementares: unknown; documentos: Array<{ tipo: string; key: string }> },
  deps: EventoDeps,
): Promise<StartAvcbEventoResult> {
  const evento = await deps.eventos.getEvento(eventoId)
  if (!evento) {
    throw new HttpError(404, 'Evento não encontrado.')
  }
  if (evento.risco !== riscoBands.ii && evento.risco !== riscoBands.iii) {
    throw new HttpError(409, 'Evento sem classificação de risco (II/III) definida.')
  }

  const existing = await deps.processos.getLatestProcessoByEvento(eventoId)
  if (existing && existing.fase !== 'concluido') {
    return {
      processoId: existing.id,
      risco: existing.risco,
      fase: existing.fase,
      protocoloNumero: existing.protocoloNumero,
      jaExistia: true,
    }
  }

  const { processoId } = await deps.processos.createAvcbProcesso({
    organizationId: evento.organizationId,
    eventoTemporarioId: eventoId,
    risco: evento.risco,
    modalidade: modalidadeProcesso.eventoTemporario,
    tipoSolicitacao: tipoSolicitacao.novo,
    dadosComplementares: request.dadosComplementares,
    documentos: request.documentos.map((doc) => ({ tipo: doc.tipo, arquivoRef: doc.key })),
  })

  return {
    processoId,
    risco: evento.risco,
    fase: 'aguardando_pagamento',
    protocoloNumero: null,
    jaExistia: false,
  }
}

export async function getEventoProcesso(
  eventoId: string,
  deps: EventoDeps,
): Promise<{
  processo: {
    id: string
    risco: string
    fase: string
    dadosComplementares: unknown
    documentos: Array<{ tipo: string; key: string | null }>
  } | null
}> {
  const proc = await deps.processos.getLatestProcessoByEvento(eventoId)
  if (!proc) return { processo: null }
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
