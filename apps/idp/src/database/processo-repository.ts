import { and, desc, eq, isNull, ne, notInArray } from 'drizzle-orm'

import { type Database } from '@/database/client.js'
import {
  documento,
  eventoTemporario,
  historico,
  type ModalidadeProcesso,
  modalidadeProcesso,
  type PagamentoStatus,
  type ProcessoMensagemPapel,
  pagamento,
  pagamentoFontes,
  pagamentoStatuses,
  pessoaJuridica,
  processo,
  processoMensagem,
  type RiscoBand,
  type TipoSolicitacao,
  triagemItem,
  unidade,
} from '@/database/schema.js'

export type UnidadeDossie = {
  organizationId: string
  unidadeId: string
  unidadeNome: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
  areaConstruida: string | null
  empresaRazaoSocial: string
  empresaCnpj: string
}

export type DdlcbRecord = {
  processoId: string
  documentoId: string
  emitidoEm: Date
}

export type CreateDdlcbInput = {
  organizationId: string
  unidadeId: string
  classificacaoId: string
  tipoSolicitacao: TipoSolicitacao
  modalidade: ModalidadeProcesso
  risco: RiscoBand
}

export type ProcessoDocumentoInput = { tipo: string; arquivoRef: string }

export type CreateAvcbInput = {
  organizationId: string
  unidadeId?: string | null
  eventoTemporarioId?: string | null
  classificacaoId?: string | null
  modalidade?: ModalidadeProcesso
  risco: RiscoBand
  tipoSolicitacao: TipoSolicitacao
  dadosComplementares: unknown
  documentos: ProcessoDocumentoInput[]
}

export type ProcessoRecord = {
  id: string
  organizationId: string
  unidadeId: string | null
  risco: RiscoBand
  fase: string
  protocoloNumero: string | null
  protocoladoEm: Date | null
}

export type ProcessoDocumentoRecord = { id: string; tipo: string; arquivoRef: string | null }

export type TriagemProcessoItem = {
  processoId: string
  protocoloNumero: string | null
  risco: RiscoBand
  fase: string
  tipoSolicitacao: TipoSolicitacao
  modalidade: ModalidadeProcesso
  empresaRazaoSocial: string
  empresaCnpj: string
  unidadeNome: string | null
  createdAt: Date
}

export type ProcessoFull = {
  id: string
  organizationId: string
  unidadeId: string | null
  eventoTemporarioId: string | null
  classificacaoId: string | null
  risco: RiscoBand
  fase: string
  tipoSolicitacao: TipoSolicitacao
  modalidade: ModalidadeProcesso
  protocoloNumero: string | null
  protocoladoEm: Date | null
  dadosComplementares: unknown
  triadorResponsavel: string | null
  analiseStatus: string | null
  createdAt: Date
}

export type TriagemItemRecord = {
  itemTipo: string
  itemChave: string
  estado: string
  observacao: string | null
  autor: string | null
  createdAt: Date
}

export type ProcessoMensagemRecord = {
  id: string
  autorPapel: ProcessoMensagemPapel
  autorNome: string
  conteudo: string
  lidaEm: Date | null
  createdAt: Date
}

export type ProcessoSinalizadores = {
  exigenciaRespondidaEm: Date | null
  exigenciaSanadaEm: Date | null
  mensagensNaoLidasTriador: number
  mensagensNaoLidasContribuinte: number
  ultimaMensagemEm: Date | null
}

export type PagamentoRecord = {
  status: PagamentoStatus
  metodo: string | null
  fonteConfirmacao: string
  confirmadoEm: Date | null
} | null

export type ProcessoRepository = {
  /** Loads the unit + its owning company, for assembling a document. */
  getUnidadeDossie: (unidadeId: string) => Promise<UnidadeDossie | null>
  /** Returns the DDLCB already issued for a classification, if any (idempotency). */
  findDdlcbByClassificacao: (classificacaoId: string) => Promise<DdlcbRecord | null>
  /** Creates the processo + DDLCB documento for a Risco I unit. */
  createDdlcb: (input: CreateDdlcbInput) => Promise<DdlcbRecord>
  /** Finds an open (not concluded/protocoladoed) AVCB processo for a classification. */
  findOpenProcessoByClassificacao: (classificacaoId: string) => Promise<ProcessoRecord | null>
  /** Creates the AVCB processo (Risco II/III) with its N1-01 data + document rows. */
  createAvcbProcesso: (input: CreateAvcbInput) => Promise<{ processoId: string }>
  getProcesso: (processoId: string) => Promise<ProcessoRecord | null>
  /** The unit's most recent processo (for recovering an in-progress AVCB). */
  getLatestProcessoByUnidade: (unidadeId: string) => Promise<ProcessoFull | null>
  /** The temporary event's most recent processo. */
  getLatestProcessoByEvento: (eventoTemporarioId: string) => Promise<ProcessoFull | null>
  listProcessoDocumentos: (processoId: string) => Promise<ProcessoDocumentoRecord[]>
  /** Simulated payment: records a confirmed pagamento and protocolizes the processo. */
  confirmSimulatedPayment: (input: {
    processoId: string
    protocoloNumero: string
  }) => Promise<{ protocoloNumero: string; protocoladoEm: Date }>
  /** Internal triagem: lists the tenant's processos (newest first) with company/unit names. */
  listProcessos: (organizationId: string) => Promise<TriagemProcessoItem[]>
  getProcessoFull: (processoId: string) => Promise<ProcessoFull | null>
  getProcessoPagamento: (processoId: string) => Promise<PagamentoRecord>
  /** Triager registers an exigência: writes history + moves the processo to `em_exigencia`. */
  addExigencia: (input: {
    organizationId: string
    processoId: string
    descricao: string
  }) => Promise<void>
  /** Citizen answers an exigência: adds re-sent documents + history, moves back to `protocolado`. */
  responderExigencia: (input: {
    organizationId: string
    processoId: string
    mensagem: string | null
    documentos: ProcessoDocumentoInput[]
  }) => Promise<void>
  /** Triager decides the process (deferido/indeferido): writes history + sets the final fase. */
  registrarDecisao: (input: {
    organizationId: string
    processoId: string
    fase: 'aprovado' | 'reprovado' | 'em_vistoria'
    descricao: string
  }) => Promise<void>
  listHistorico: (processoId: string) => Promise<HistoricoRecord[]>
  /** Triager takes the process ("assumir atividade"); sets analise_status to rascunho when new. */
  assumirProcesso: (input: { processoId: string; triador: string }) => Promise<void>
  /** Appends one triager decision on a field/document (append-only trail). */
  addTriagemItem: (input: {
    processoId: string
    itemTipo: string
    itemChave: string
    estado: string
    observacao: string | null
    autor: string | null
  }) => Promise<void>
  /** Current state of each item (most recent row per item). */
  listTriagemItens: (processoId: string) => Promise<TriagemItemRecord[]>
  /** Full append-only trail of item decisions (newest first). */
  listTriagemItemHistorico: (processoId: string) => Promise<TriagemItemRecord[]>
  /** Sets the analysis visibility: `enviada` (contribuinte sees) or `rascunho` (retomar). */
  setAnaliseStatus: (input: { processoId: string; status: string }) => Promise<void>
  /** Returns process-level signals used by the triage cards and notifications. */
  getProcessoSinalizadores: (processoId: string) => Promise<ProcessoSinalizadores>
  listProcessoMensagens: (processoId: string) => Promise<ProcessoMensagemRecord[]>
  addProcessoMensagem: (input: {
    organizationId: string
    processoId: string
    autorPapel: ProcessoMensagemPapel
    autorNome: string
    conteudo: string
  }) => Promise<ProcessoMensagemRecord>
  marcarMensagensComoLidas: (input: {
    processoId: string
    leitorPapel: ProcessoMensagemPapel
  }) => Promise<void>
}

export type HistoricoRecord = { acao: string; descricao: string | null; createdAt: Date }

export function createDrizzleProcessoRepository(db: Database): ProcessoRepository {
  return {
    getUnidadeDossie: async (unidadeId) => {
      const [row] = await db
        .select({
          organizationId: unidade.organizationId,
          unidadeId: unidade.id,
          unidadeNome: unidade.nome,
          cep: unidade.cep,
          logradouro: unidade.logradouro,
          numero: unidade.numero,
          complemento: unidade.complemento,
          bairro: unidade.bairro,
          municipio: unidade.municipio,
          uf: unidade.uf,
          areaConstruida: unidade.areaConstruida,
          empresaRazaoSocial: pessoaJuridica.razaoSocial,
          empresaCnpj: pessoaJuridica.cnpj,
        })
        .from(unidade)
        .innerJoin(pessoaJuridica, eq(unidade.pessoaJuridicaId, pessoaJuridica.id))
        .where(eq(unidade.id, unidadeId))
        .limit(1)
      return row ?? null
    },

    findDdlcbByClassificacao: async (classificacaoId) => {
      const [row] = await db
        .select({
          processoId: processo.id,
          documentoId: documento.id,
          emitidoEm: documento.createdAt,
        })
        .from(processo)
        .innerJoin(
          documento,
          and(eq(documento.processoId, processo.id), eq(documento.tipo, 'DDLCB')),
        )
        .where(eq(processo.classificacaoId, classificacaoId))
        .limit(1)
      return row ?? null
    },

    createDdlcb: async (input) =>
      db.transaction(async (tx) => {
        const [proc] = await tx
          .insert(processo)
          .values({
            organizationId: input.organizationId,
            unidadeId: input.unidadeId,
            classificacaoId: input.classificacaoId,
            tipoSolicitacao: input.tipoSolicitacao,
            modalidade: input.modalidade ?? modalidadeProcesso.regular,
            risco: input.risco,
            // Risco I is issued immediately — no payment, no protocol.
            fase: 'concluido',
          })
          .returning({ id: processo.id })
        if (!proc) {
          throw new Error('Falha ao criar o processo.')
        }

        const [doc] = await tx
          .insert(documento)
          .values({ processoId: proc.id, tipo: 'DDLCB' })
          .returning({ id: documento.id, createdAt: documento.createdAt })
        if (!doc) {
          throw new Error('Falha ao emitir a DDLCB.')
        }

        return { processoId: proc.id, documentoId: doc.id, emitidoEm: doc.createdAt }
      }),

    findOpenProcessoByClassificacao: async (classificacaoId) => {
      const [row] = await db
        .select({
          id: processo.id,
          organizationId: processo.organizationId,
          unidadeId: processo.unidadeId,
          risco: processo.risco,
          fase: processo.fase,
          protocoloNumero: processo.protocoloNumero,
          protocoladoEm: processo.protocoladoEm,
        })
        .from(processo)
        .where(
          and(
            eq(processo.classificacaoId, classificacaoId),
            notInArray(processo.fase, ['concluido']),
          ),
        )
        .limit(1)
      return row ?? null
    },

    createAvcbProcesso: async (input) =>
      db.transaction(async (tx) => {
        const [proc] = await tx
          .insert(processo)
          .values({
            organizationId: input.organizationId,
            unidadeId: input.unidadeId ?? null,
            eventoTemporarioId: input.eventoTemporarioId ?? null,
            classificacaoId: input.classificacaoId ?? null,
            tipoSolicitacao: input.tipoSolicitacao,
            modalidade: input.modalidade ?? modalidadeProcesso.regular,
            risco: input.risco,
            fase: 'aguardando_pagamento',
            dadosComplementares: input.dadosComplementares,
          })
          .returning({ id: processo.id })
        if (!proc) {
          throw new Error('Falha ao criar o processo.')
        }

        if (input.documentos.length > 0) {
          await tx.insert(documento).values(
            input.documentos.map((doc) => ({
              processoId: proc.id,
              tipo: doc.tipo,
              arquivoRef: doc.arquivoRef,
            })),
          )
        }

        return { processoId: proc.id }
      }),

    getProcesso: async (processoId) => {
      const [row] = await db
        .select({
          id: processo.id,
          organizationId: processo.organizationId,
          unidadeId: processo.unidadeId,
          risco: processo.risco,
          fase: processo.fase,
          protocoloNumero: processo.protocoloNumero,
          protocoladoEm: processo.protocoladoEm,
        })
        .from(processo)
        .where(eq(processo.id, processoId))
        .limit(1)
      return row ?? null
    },

    getLatestProcessoByUnidade: async (unidadeId) => {
      const [row] = await db
        .select({
          id: processo.id,
          organizationId: processo.organizationId,
          unidadeId: processo.unidadeId,
          eventoTemporarioId: processo.eventoTemporarioId,
          classificacaoId: processo.classificacaoId,
          risco: processo.risco,
          fase: processo.fase,
          tipoSolicitacao: processo.tipoSolicitacao,
          modalidade: processo.modalidade,
          protocoloNumero: processo.protocoloNumero,
          protocoladoEm: processo.protocoladoEm,
          dadosComplementares: processo.dadosComplementares,
          triadorResponsavel: processo.triadorResponsavel,
          analiseStatus: processo.analiseStatus,
          createdAt: processo.createdAt,
        })
        .from(processo)
        .where(eq(processo.unidadeId, unidadeId))
        .orderBy(desc(processo.createdAt))
        .limit(1)
      return row ?? null
    },

    getLatestProcessoByEvento: async (eventoTemporarioId) => {
      const [row] = await db
        .select({
          id: processo.id,
          organizationId: processo.organizationId,
          unidadeId: processo.unidadeId,
          eventoTemporarioId: processo.eventoTemporarioId,
          classificacaoId: processo.classificacaoId,
          risco: processo.risco,
          fase: processo.fase,
          tipoSolicitacao: processo.tipoSolicitacao,
          modalidade: processo.modalidade,
          protocoloNumero: processo.protocoloNumero,
          protocoladoEm: processo.protocoladoEm,
          dadosComplementares: processo.dadosComplementares,
          triadorResponsavel: processo.triadorResponsavel,
          analiseStatus: processo.analiseStatus,
          createdAt: processo.createdAt,
        })
        .from(processo)
        .where(eq(processo.eventoTemporarioId, eventoTemporarioId))
        .orderBy(desc(processo.createdAt))
        .limit(1)
      return row ?? null
    },

    listProcessoDocumentos: async (processoId) =>
      db
        .select({ id: documento.id, tipo: documento.tipo, arquivoRef: documento.arquivoRef })
        .from(documento)
        .where(eq(documento.processoId, processoId)),

    confirmSimulatedPayment: async ({ processoId, protocoloNumero }) =>
      db.transaction(async (tx) => {
        await tx.insert(pagamento).values({
          processoId,
          metodo: 'simulado',
          status: pagamentoStatuses.confirmed,
          fonteConfirmacao: pagamentoFontes.simulado,
          confirmadoEm: new Date(),
        })
        const [row] = await tx
          .update(processo)
          .set({ fase: 'protocolado', protocoloNumero, protocoladoEm: new Date() })
          .where(eq(processo.id, processoId))
          .returning({ protocoladoEm: processo.protocoladoEm })
        if (!row?.protocoladoEm) {
          throw new Error('Falha ao protocolar o processo.')
        }
        return { protocoloNumero, protocoladoEm: row.protocoladoEm }
      }),

    listProcessos: async (organizationId) =>
      db
        .select({
          processoId: processo.id,
          protocoloNumero: processo.protocoloNumero,
          risco: processo.risco,
          fase: processo.fase,
          tipoSolicitacao: processo.tipoSolicitacao,
          modalidade: processo.modalidade,
          empresaRazaoSocial: pessoaJuridica.razaoSocial,
          empresaCnpj: pessoaJuridica.cnpj,
          unidadeNome: unidade.nome,
          eventoNome: eventoTemporario.nome,
          createdAt: processo.createdAt,
        })
        .from(processo)
        .leftJoin(unidade, eq(processo.unidadeId, unidade.id))
        .leftJoin(pessoaJuridica, eq(unidade.pessoaJuridicaId, pessoaJuridica.id))
        .leftJoin(eventoTemporario, eq(processo.eventoTemporarioId, eventoTemporario.id))
        .where(eq(processo.organizationId, organizationId))
        .orderBy(desc(processo.createdAt))
        .then((rows) =>
          rows.map(({ eventoNome, ...row }) => ({
            ...row,
            empresaRazaoSocial: row.empresaRazaoSocial ?? (eventoNome ? 'Evento temporário' : '—'),
            empresaCnpj: row.empresaCnpj ?? '',
            unidadeNome: row.unidadeNome ?? eventoNome,
          })),
        ),

    getProcessoFull: async (processoId) => {
      const [row] = await db
        .select({
          id: processo.id,
          organizationId: processo.organizationId,
          unidadeId: processo.unidadeId,
          eventoTemporarioId: processo.eventoTemporarioId,
          classificacaoId: processo.classificacaoId,
          risco: processo.risco,
          fase: processo.fase,
          tipoSolicitacao: processo.tipoSolicitacao,
          modalidade: processo.modalidade,
          protocoloNumero: processo.protocoloNumero,
          protocoladoEm: processo.protocoladoEm,
          dadosComplementares: processo.dadosComplementares,
          triadorResponsavel: processo.triadorResponsavel,
          analiseStatus: processo.analiseStatus,
          createdAt: processo.createdAt,
        })
        .from(processo)
        .where(eq(processo.id, processoId))
        .limit(1)
      return row ?? null
    },

    assumirProcesso: async ({ processoId, triador }) => {
      const [row] = await db
        .select({ analiseStatus: processo.analiseStatus })
        .from(processo)
        .where(eq(processo.id, processoId))
        .limit(1)
      await db
        .update(processo)
        .set({
          triadorResponsavel: triador,
          // Start the analysis as a draft the first time it is taken.
          analiseStatus: row?.analiseStatus ?? 'rascunho',
        })
        .where(eq(processo.id, processoId))
    },

    addTriagemItem: async ({ processoId, itemTipo, itemChave, estado, observacao, autor }) => {
      await db
        .insert(triagemItem)
        .values({ processoId, itemTipo, itemChave, estado, observacao, autor })
    },

    listTriagemItens: async (processoId) => {
      // Most recent row per (itemTipo, itemChave) = current state.
      const rows = await db
        .select()
        .from(triagemItem)
        .where(eq(triagemItem.processoId, processoId))
        .orderBy(desc(triagemItem.createdAt))
      const latest = new Map<string, TriagemItemRecord>()
      for (const row of rows) {
        const key = `${row.itemTipo}:${row.itemChave}`
        if (!latest.has(key)) {
          latest.set(key, {
            itemTipo: row.itemTipo,
            itemChave: row.itemChave,
            estado: row.estado,
            observacao: row.observacao,
            autor: row.autor,
            createdAt: row.createdAt,
          })
        }
      }
      return [...latest.values()]
    },

    listTriagemItemHistorico: async (processoId) => {
      const rows = await db
        .select()
        .from(triagemItem)
        .where(eq(triagemItem.processoId, processoId))
        .orderBy(desc(triagemItem.createdAt))
      return rows.map((row) => ({
        itemTipo: row.itemTipo,
        itemChave: row.itemChave,
        estado: row.estado,
        observacao: row.observacao,
        autor: row.autor,
        createdAt: row.createdAt,
      }))
    },

    setAnaliseStatus: async ({ processoId, status }) => {
      await db.update(processo).set({ analiseStatus: status }).where(eq(processo.id, processoId))
    },

    getProcessoSinalizadores: async (processoId) => {
      const [historicos, mensagens, [processoAtual]] = await Promise.all([
        db
          .select({ acao: historico.acao, createdAt: historico.createdAt })
          .from(historico)
          .where(and(eq(historico.entidade, 'processo'), eq(historico.entidadeId, processoId)))
          .orderBy(desc(historico.createdAt))
          .limit(20),
        db
          .select({
            autorPapel: processoMensagem.autorPapel,
            lidaEm: processoMensagem.lidaEm,
            createdAt: processoMensagem.createdAt,
          })
          .from(processoMensagem)
          .where(eq(processoMensagem.processoId, processoId))
          .orderBy(desc(processoMensagem.createdAt)),
        db
          .select({ fase: processo.fase })
          .from(processo)
          .where(eq(processo.id, processoId))
          .limit(1),
      ])
      const ultimoHistorico = historicos[0]
      const respostaExigencia = historicos.find(
        (registro) => registro.acao === 'resposta_exigencia',
      )
      const decisao = historicos.find((registro) => registro.acao === 'decisao')
      return {
        exigenciaRespondidaEm:
          ultimoHistorico?.acao === 'resposta_exigencia' ? ultimoHistorico.createdAt : null,
        exigenciaSanadaEm:
          processoAtual?.fase === 'aprovado' && respostaExigencia
            ? (decisao?.createdAt ?? null)
            : null,
        mensagensNaoLidasTriador: mensagens.filter(
          (mensagem) => mensagem.autorPapel === 'contribuinte' && !mensagem.lidaEm,
        ).length,
        mensagensNaoLidasContribuinte: mensagens.filter(
          (mensagem) => mensagem.autorPapel === 'triador' && !mensagem.lidaEm,
        ).length,
        ultimaMensagemEm: mensagens[0]?.createdAt ?? null,
      }
    },

    listProcessoMensagens: async (processoId) => {
      const rows = await db
        .select()
        .from(processoMensagem)
        .where(eq(processoMensagem.processoId, processoId))
        .orderBy(processoMensagem.createdAt)
      return rows.map((row) => ({
        id: row.id,
        autorPapel: row.autorPapel,
        autorNome: row.autorNome,
        conteudo: row.conteudo,
        lidaEm: row.lidaEm,
        createdAt: row.createdAt,
      }))
    },

    addProcessoMensagem: async ({
      organizationId,
      processoId,
      autorPapel,
      autorNome,
      conteudo,
    }) => {
      const [row] = await db
        .insert(processoMensagem)
        .values({ organizationId, processoId, autorPapel, autorNome, conteudo })
        .returning()
      if (!row) throw new Error('Falha ao registrar a mensagem.')
      return {
        id: row.id,
        autorPapel: row.autorPapel,
        autorNome: row.autorNome,
        conteudo: row.conteudo,
        lidaEm: row.lidaEm,
        createdAt: row.createdAt,
      }
    },

    marcarMensagensComoLidas: async ({ processoId, leitorPapel }) => {
      await db
        .update(processoMensagem)
        .set({ lidaEm: new Date() })
        .where(
          and(
            eq(processoMensagem.processoId, processoId),
            ne(processoMensagem.autorPapel, leitorPapel),
            isNull(processoMensagem.lidaEm),
          ),
        )
    },

    getProcessoPagamento: async (processoId) => {
      const [row] = await db
        .select({
          status: pagamento.status,
          metodo: pagamento.metodo,
          fonteConfirmacao: pagamento.fonteConfirmacao,
          confirmadoEm: pagamento.confirmadoEm,
        })
        .from(pagamento)
        .where(eq(pagamento.processoId, processoId))
        .orderBy(desc(pagamento.createdAt))
        .limit(1)
      return row ?? null
    },

    addExigencia: async ({ organizationId, processoId, descricao }) => {
      await db.transaction(async (tx) => {
        await tx.insert(historico).values({
          organizationId,
          entidade: 'processo',
          entidadeId: processoId,
          acao: 'exigencia',
          depois: { descricao },
        })
        await tx.update(processo).set({ fase: 'em_exigencia' }).where(eq(processo.id, processoId))
      })
    },

    responderExigencia: async ({ organizationId, processoId, mensagem, documentos }) => {
      await db.transaction(async (tx) => {
        if (documentos.length > 0) {
          await tx.insert(documento).values(
            documentos.map((doc) => ({
              processoId,
              tipo: doc.tipo,
              arquivoRef: doc.arquivoRef,
            })),
          )
        }
        await tx.insert(historico).values({
          organizationId,
          entidade: 'processo',
          entidadeId: processoId,
          acao: 'resposta_exigencia',
          depois: { descricao: mensagem, documentos: documentos.map((doc) => doc.tipo) },
        })
        await tx.update(processo).set({ fase: 'protocolado' }).where(eq(processo.id, processoId))
      })
    },

    registrarDecisao: async ({ organizationId, processoId, fase, descricao }) => {
      await db.transaction(async (tx) => {
        await tx.insert(historico).values({
          organizationId,
          entidade: 'processo',
          entidadeId: processoId,
          acao: 'decisao',
          depois: { descricao, fase },
        })
        await tx.update(processo).set({ fase }).where(eq(processo.id, processoId))
      })
    },

    listHistorico: async (processoId) => {
      const rows = await db
        .select({ acao: historico.acao, depois: historico.depois, createdAt: historico.createdAt })
        .from(historico)
        .where(and(eq(historico.entidade, 'processo'), eq(historico.entidadeId, processoId)))
        .orderBy(desc(historico.createdAt))
      return rows.map((row) => ({
        acao: row.acao,
        descricao:
          row.depois && typeof row.depois === 'object' && 'descricao' in row.depois
            ? String((row.depois as { descricao?: unknown }).descricao ?? '')
            : null,
        createdAt: row.createdAt,
      }))
    },
  }
}
