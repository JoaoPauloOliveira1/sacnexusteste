import { type ClassificacaoRepository } from '@/database/classificacao-repository.js'
import { type EmpresaRepository } from '@/database/empresa-repository.js'
import { type EventoRepository } from '@/database/evento-repository.js'
import {
  type PagamentoRecord,
  type ProcessoRepository,
  type TriagemProcessoItem,
} from '@/database/processo-repository.js'
import { HttpError } from '@/infra/http/http-error.js'

export type TriagemDeps = {
  processos: ProcessoRepository
  classificacoes: ClassificacaoRepository
  empresas: EmpresaRepository
  eventos: EventoRepository
}

export async function listTriagem(
  input: { organizationId?: string },
  deps: TriagemDeps,
): Promise<{ processos: TriagemProcessoItem[] }> {
  const organizationId = input.organizationId ?? (await deps.empresas.ensureDefaultOrganization())
  return { processos: await deps.processos.listProcessos(organizationId) }
}

export type ProcessoDossie = {
  processo: {
    id: string
    risco: string
    fase: string
    tipoSolicitacao: string
    modalidade: string
    protocoloNumero: string | null
    protocoladoEm: string | null
    dadosComplementares: unknown
    triadorResponsavel: string | null
    analiseStatus: string | null
    createdAt: string
  }
  empresa: { razaoSocial: string; cnpj: string } | null
  unidade: { nome: string | null; endereco: string; areaConstruida: string | null } | null
  respostas: Array<{ perguntaId: string; grupo: string | null; valor: unknown }>
  documentos: Array<{ tipo: string; key: string | null }>
  pagamento: PagamentoRecord
  historico: Array<{ acao: string; descricao: string | null; createdAt: string }>
  triagemItens: Array<{
    itemTipo: string
    itemChave: string
    estado: string
    observacao: string | null
    autor: string | null
    createdAt: string
  }>
}

function joinEndereco(parts: {
  logradouro: string | null
  numero: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
  cep: string | null
}): string {
  const linha1 = [parts.logradouro, parts.numero].filter(Boolean).join(', ')
  const linha2 = [parts.bairro, [parts.municipio, parts.uf].filter(Boolean).join(' / ')]
    .filter(Boolean)
    .join(' - ')
  const cep = parts.cep ? `CEP ${parts.cep}` : ''
  return [linha1, linha2, cep].filter(Boolean).join(' · ')
}

export async function getProcessoDossie(
  processoId: string,
  deps: TriagemDeps,
): Promise<ProcessoDossie> {
  const proc = await deps.processos.getProcessoFull(processoId)
  if (!proc) {
    throw new HttpError(404, 'Processo não encontrado.')
  }

  const dossie = proc.unidadeId ? await deps.processos.getUnidadeDossie(proc.unidadeId) : null
  const evento =
    !dossie && proc.eventoTemporarioId
      ? await deps.eventos.getEvento(proc.eventoTemporarioId)
      : null
  const respostas = proc.classificacaoId
    ? await deps.classificacoes.getRespostas(proc.classificacaoId)
    : []
  const documentos = await deps.processos.listProcessoDocumentos(processoId)
  const pagamento = await deps.processos.getProcessoPagamento(processoId)
  const historico = await deps.processos.listHistorico(processoId)
  const triagemItens = await deps.processos.listTriagemItens(processoId)

  return {
    processo: {
      id: proc.id,
      risco: proc.risco,
      fase: proc.fase,
      tipoSolicitacao: proc.tipoSolicitacao,
      modalidade: proc.modalidade,
      protocoloNumero: proc.protocoloNumero,
      protocoladoEm: proc.protocoladoEm ? proc.protocoladoEm.toISOString() : null,
      dadosComplementares: proc.dadosComplementares,
      triadorResponsavel: proc.triadorResponsavel,
      analiseStatus: proc.analiseStatus,
      createdAt: proc.createdAt.toISOString(),
    },
    empresa: dossie ? { razaoSocial: dossie.empresaRazaoSocial, cnpj: dossie.empresaCnpj } : null,
    unidade: dossie
      ? {
          nome: dossie.unidadeNome,
          endereco: joinEndereco(dossie),
          areaConstruida: dossie.areaConstruida,
        }
      : evento
        ? {
            nome: `Evento: ${evento.nome ?? '—'} · ${evento.inicioEm.toLocaleDateString('pt-BR')} a ${evento.terminoEm.toLocaleDateString('pt-BR')}${evento.solicitanteNome ? ` · solicitante ${evento.solicitanteNome}` : ''}`,
            endereco: joinEndereco(evento),
            areaConstruida: null,
          }
        : null,
    respostas,
    documentos: documentos.map((doc) => ({ tipo: doc.tipo, key: doc.arquivoRef })),
    pagamento,
    historico: historico.map((h) => ({
      acao: h.acao,
      descricao: h.descricao,
      createdAt: h.createdAt.toISOString(),
    })),
    triagemItens: triagemItens.map((t) => ({
      itemTipo: t.itemTipo,
      itemChave: t.itemChave,
      estado: t.estado,
      observacao: t.observacao,
      autor: t.autor,
      createdAt: t.createdAt.toISOString(),
    })),
  }
}

export async function registrarExigencia(
  processoId: string,
  input: { descricao: string },
  deps: TriagemDeps,
): Promise<{ ok: true; fase: string }> {
  const proc = await deps.processos.getProcessoFull(processoId)
  if (!proc) {
    throw new HttpError(404, 'Processo não encontrado.')
  }
  const descricao = input.descricao.trim()
  if (!descricao) {
    throw new HttpError(400, 'Descreva a exigência.')
  }
  await deps.processos.addExigencia({
    organizationId: proc.organizationId,
    processoId,
    descricao,
  })
  return { ok: true, fase: 'em_exigencia' }
}

export async function registrarDecisao(
  processoId: string,
  input: { decisao: 'aprovado' | 'reprovado'; observacao?: string },
  deps: TriagemDeps,
): Promise<{ ok: true; fase: string }> {
  const proc = await deps.processos.getProcessoFull(processoId)
  if (!proc) {
    throw new HttpError(404, 'Processo não encontrado.')
  }
  if (proc.fase !== 'protocolado' && proc.fase !== 'em_exigencia') {
    throw new HttpError(409, 'Só é possível decidir um processo protocolado ou em exigência.')
  }
  const label = input.decisao === 'aprovado' ? 'Deferido' : 'Indeferido'
  const observacao = input.observacao?.trim()
  const descricao = observacao ? `${label} — ${observacao}` : label
  await deps.processos.registrarDecisao({
    organizationId: proc.organizationId,
    processoId,
    fase: input.decisao,
    descricao,
  })
  return { ok: true, fase: input.decisao }
}

const ITEM_ESTADOS = new Set(['aprovado', 'reprovado', 'em_exigencia'])

export async function assumirTriagem(
  processoId: string,
  input: { triador: string },
  deps: TriagemDeps,
): Promise<{ ok: true; triador: string }> {
  const proc = await deps.processos.getProcessoFull(processoId)
  if (!proc) throw new HttpError(404, 'Processo não encontrado.')
  const triador = input.triador.trim() || 'Triador'
  await deps.processos.assumirProcesso({ processoId, triador })
  return { ok: true, triador }
}

export async function salvarAnaliseItens(
  processoId: string,
  input: {
    autor: string
    itens: Array<{ itemTipo: string; itemChave: string; estado: string; observacao?: string }>
  },
  deps: TriagemDeps,
): Promise<{ ok: true; salvos: number }> {
  const proc = await deps.processos.getProcessoFull(processoId)
  if (!proc) throw new HttpError(404, 'Processo não encontrado.')
  let salvos = 0
  for (const item of input.itens) {
    if (item.itemTipo !== 'informacao' && item.itemTipo !== 'documento') continue
    if (!ITEM_ESTADOS.has(item.estado)) continue
    const observacao = item.observacao?.trim() || null
    if ((item.estado === 'reprovado' || item.estado === 'em_exigencia') && !observacao) {
      throw new HttpError(400, 'Reprovado e Em exigência exigem uma justificativa/pendência.')
    }
    await deps.processos.addTriagemItem({
      processoId,
      itemTipo: item.itemTipo,
      itemChave: item.itemChave,
      estado: item.estado,
      observacao,
      autor: input.autor.trim() || null,
    })
    salvos += 1
  }
  // Keep the review a draft while the triager is still working on it.
  if (proc.analiseStatus == null) {
    await deps.processos.setAnaliseStatus({ processoId, status: 'rascunho' })
  }
  return { ok: true, salvos }
}

export async function enviarAnalise(
  processoId: string,
  deps: TriagemDeps,
): Promise<{ ok: true; analiseStatus: string }> {
  const proc = await deps.processos.getProcessoFull(processoId)
  if (!proc) throw new HttpError(404, 'Processo não encontrado.')

  const itens = await deps.processos.listTriagemItens(processoId)
  if (itens.length === 0) {
    throw new HttpError(409, 'Marque e salve ao menos um item antes de enviar ao contribuinte.')
  }
  const pendencias = itens.filter((item) => item.estado === 'em_exigencia')
  if (pendencias.length > 0) {
    const descricao = pendencias
      .map((item) => item.observacao?.trim() || item.itemChave)
      .join('\n')
    await deps.processos.addExigencia({
      organizationId: proc.organizationId,
      processoId,
      descricao,
    })
  }

  await deps.processos.setAnaliseStatus({ processoId, status: 'enviada' })
  return { ok: true, analiseStatus: 'enviada' }
}

export async function retomarAnalise(
  processoId: string,
  deps: TriagemDeps,
): Promise<{ ok: true; analiseStatus: string }> {
  const proc = await deps.processos.getProcessoFull(processoId)
  if (!proc) throw new HttpError(404, 'Processo não encontrado.')
  await deps.processos.setAnaliseStatus({ processoId, status: 'rascunho' })
  return { ok: true, analiseStatus: 'rascunho' }
}

export async function concluirTriagem(
  processoId: string,
  input: { decisao: 'liberar_avcb' | 'colocar_em_vistoria'; observacao?: string },
  deps: TriagemDeps,
): Promise<{ ok: true; fase: string }> {
  const proc = await deps.processos.getProcessoFull(processoId)
  if (!proc) throw new HttpError(404, 'Processo não encontrado.')

  // All reviewed items must be Aprovado to conclude the triage.
  const itens = await deps.processos.listTriagemItens(processoId)
  const naoAprovado = itens.find((i) => i.estado !== 'aprovado')
  if (naoAprovado) {
    throw new HttpError(409, 'Só é possível concluir a triagem com todos os itens aprovados.')
  }
  if (itens.length === 0) {
    throw new HttpError(409, 'Analise e aprove os itens antes de concluir a triagem.')
  }

  const fase = input.decisao === 'liberar_avcb' ? 'aprovado' : 'em_vistoria'
  const label =
    input.decisao === 'liberar_avcb'
      ? 'Triagem concluída — AVCB liberado'
      : 'Triagem concluída — encaminhado para vistoria'
  const observacao = input.observacao?.trim()
  await deps.processos.registrarDecisao({
    organizationId: proc.organizationId,
    processoId,
    fase,
    descricao: observacao ? `${label} — ${observacao}` : label,
  })
  return { ok: true, fase }
}
