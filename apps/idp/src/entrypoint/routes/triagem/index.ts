import { type FastifyPluginAsync } from 'fastify'
import JSZip from 'jszip'

import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { HttpError } from '@/infra/http/http-error.js'
import { createDocumentPdf } from '@/infra/pdf/document-pdf.js'
import {
  assumirTriagem,
  concluirTriagem,
  enviarAnalise,
  getProcessoDossie,
  listTriagem,
  registrarDecisao,
  registrarExigencia,
  retomarAnalise,
  salvarAnaliseItens,
} from '@/usecases/triagem/triagem-service.js'
import { triagemOpenApiTagName } from './openapi.js'

const okFaseResponse = {
  type: 'object',
  additionalProperties: true,
  required: ['ok'],
  properties: { ok: { type: 'boolean' } },
} as const

const errorResponse = {
  type: 'object',
  additionalProperties: false,
  properties: { message: { type: 'string' } },
} as const

function brDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
}

/** File extension of a storage key (e.g. `.pdf`), or empty when none. */
function extOf(key: string): string {
  const base = key.split('/').pop() ?? key
  const dot = base.lastIndexOf('.')
  return dot > 0 ? base.slice(dot) : ''
}

function brDatePlusYear(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  d.setFullYear(d.getFullYear() + 1)
  return d.toLocaleDateString('pt-BR')
}

export const triagemRoutes: FastifyPluginAsync<AppDependencies> = async (app, dependencies) => {
  const deps = {
    processos: dependencies.processos,
    classificacoes: dependencies.classificacoes,
    empresas: dependencies.empresas,
    eventos: dependencies.eventos,
  }
  const storage = dependencies.storage

  app.get(
    '/api/processos/:processoId/documentos.zip',
    {
      schema: {
        operationId: 'downloadProcessoDocumentosZip',
        tags: [triagemOpenApiTagName],
        summary: 'Baixa todos os documentos do processo em um único arquivo .zip',
        params: {
          type: 'object',
          required: ['processoId'],
          properties: { processoId: { type: 'string', format: 'uuid' } },
        },
        produces: ['application/zip'],
      },
    },
    async (request, reply) => {
      const { processoId } = request.params as { processoId: string }
      const proc = await deps.processos.getProcessoFull(processoId)
      if (!proc) {
        return reply.status(404).send({ message: 'Processo não encontrado.' })
      }
      if (!storage.isConfigured()) {
        return reply.status(503).send({ message: 'Armazenamento de documentos indisponível.' })
      }
      const documentos = await deps.processos.listProcessoDocumentos(processoId)
      const comArquivo = documentos.filter((d) => d.arquivoRef)
      if (comArquivo.length === 0) {
        return reply.status(404).send({ message: 'O processo não tem documentos anexados.' })
      }

      const zip = new JSZip()
      const usados = new Map<string, number>()
      for (const doc of comArquivo) {
        try {
          const bytes = await storage.getObjectBytes(doc.arquivoRef as string)
          const ext = extOf(doc.arquivoRef as string)
          const n = (usados.get(doc.tipo) ?? 0) + 1
          usados.set(doc.tipo, n)
          const nome = `${doc.tipo}${n > 1 ? `-${n}` : ''}${ext}`
          zip.file(nome, bytes)
        } catch {
          // Skip a document that fails to download rather than failing the whole zip.
        }
      }
      const buffer = await zip.generateAsync({ type: 'nodebuffer' })
      const filename = `${proc.protocoloNumero ?? 'documentos'}.zip`
      return reply
        .header('content-type', 'application/zip')
        .header('content-disposition', `attachment; filename="${filename}"`)
        .send(buffer)
    },
  )

  app.get(
    '/api/triagem/processos',
    {
      schema: {
        operationId: 'listTriagem',
        tags: [triagemOpenApiTagName],
        summary: 'Lista os processos do tenant para triagem (mais recentes primeiro)',
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['processos'],
            properties: {
              processos: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['processoId', 'risco', 'fase', 'createdAt'],
                  properties: {
                    processoId: { type: 'string', format: 'uuid' },
                    protocoloNumero: { type: 'string', nullable: true },
                    risco: { type: 'string' },
                    fase: { type: 'string' },
                    tipoSolicitacao: { type: 'string' },
                    modalidade: { type: 'string' },
                    empresaRazaoSocial: { type: 'string' },
                    empresaCnpj: { type: 'string' },
                    unidadeNome: { type: 'string', nullable: true },
                    createdAt: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async () => listTriagem({}, deps),
  )

  app.get(
    '/api/triagem/processos/:processoId',
    {
      schema: {
        operationId: 'getProcessoDossie',
        tags: [triagemOpenApiTagName],
        summary: 'Dossiê completo de um processo (contexto para a triagem)',
        params: {
          type: 'object',
          required: ['processoId'],
          properties: { processoId: { type: 'string', format: 'uuid' } },
        },
        response: { 200: { type: 'object', additionalProperties: true }, 404: errorResponse },
      },
    },
    async (request, reply) => {
      const { processoId } = request.params as { processoId: string }
      try {
        return await getProcessoDossie(processoId, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.post(
    '/api/triagem/processos/:processoId/exigencia',
    {
      schema: {
        operationId: 'registrarExigencia',
        tags: [triagemOpenApiTagName],
        summary: 'Registra uma exigência no processo (move para "em exigência")',
        params: {
          type: 'object',
          required: ['processoId'],
          properties: { processoId: { type: 'string', format: 'uuid' } },
        },
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['descricao'],
          properties: { descricao: { type: 'string', minLength: 1 } },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['ok', 'fase'],
            properties: { ok: { type: 'boolean' }, fase: { type: 'string' } },
          },
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    async (request, reply) => {
      const { processoId } = request.params as { processoId: string }
      const body = request.body as { descricao: string }
      try {
        return await registrarExigencia(processoId, body, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 400 | 404).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.post(
    '/api/triagem/processos/:processoId/decisao',
    {
      schema: {
        operationId: 'registrarDecisao',
        tags: [triagemOpenApiTagName],
        summary: 'Defere ou indefere o processo (decisão do analista)',
        params: {
          type: 'object',
          required: ['processoId'],
          properties: { processoId: { type: 'string', format: 'uuid' } },
        },
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['decisao'],
          properties: {
            decisao: { type: 'string', enum: ['aprovado', 'reprovado'] },
            observacao: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['ok', 'fase'],
            properties: { ok: { type: 'boolean' }, fase: { type: 'string' } },
          },
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    async (request, reply) => {
      const { processoId } = request.params as { processoId: string }
      const body = request.body as { decisao: 'aprovado' | 'reprovado'; observacao?: string }
      try {
        return await registrarDecisao(processoId, body, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404 | 409).send({ message: error.message })
        }
        throw error
      }
    },
  )

  const procParams = {
    type: 'object',
    required: ['processoId'],
    properties: { processoId: { type: 'string', format: 'uuid' } },
  } as const

  app.post(
    '/api/triagem/processos/:processoId/assumir',
    {
      schema: {
        operationId: 'assumirTriagem',
        tags: [triagemOpenApiTagName],
        summary: 'Analista assume o processo (assumir atividade)',
        params: procParams,
        body: {
          type: 'object',
          additionalProperties: false,
          properties: { analista: { type: 'string' } },
        },
        response: { 200: okFaseResponse, 404: errorResponse },
      },
    },
    async (request, reply) => {
      const { processoId } = request.params as { processoId: string }
      const body = (request.body ?? {}) as { analista?: string }
      try {
        return await assumirTriagem(processoId, { analista: body.analista ?? 'Analista' }, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.post(
    '/api/triagem/processos/:processoId/analise',
    {
      schema: {
        operationId: 'salvarAnaliseTriagem',
        tags: [triagemOpenApiTagName],
        summary: 'Salva (rascunho) as decisões do analista por item/documento',
        params: procParams,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['itens'],
          properties: {
            autor: { type: 'string' },
            itens: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['itemTipo', 'itemChave', 'estado'],
                properties: {
                  itemTipo: { type: 'string', enum: ['informacao', 'documento'] },
                  itemChave: { type: 'string' },
                  estado: { type: 'string', enum: ['aprovado', 'reprovado', 'em_exigencia'] },
                  observacao: { type: 'string' },
                },
              },
            },
          },
        },
        response: { 200: okFaseResponse, 400: errorResponse, 404: errorResponse },
      },
    },
    async (request, reply) => {
      const { processoId } = request.params as { processoId: string }
      const body = request.body as {
        autor?: string
        itens: Array<{ itemTipo: string; itemChave: string; estado: string; observacao?: string }>
      }
      try {
        return await salvarAnaliseItens(
          processoId,
          { autor: body.autor ?? 'Analista', itens: body.itens },
          deps,
        )
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 400 | 404).send({ message: error.message })
        }
        throw error
      }
    },
  )

  for (const [action, fn] of [
    ['enviar', enviarAnalise],
    ['retomar', retomarAnalise],
  ] as const) {
    app.post(
      `/api/triagem/processos/:processoId/analise/${action}`,
      {
        schema: {
          operationId: action === 'enviar' ? 'enviarAnaliseTriagem' : 'retomarAnaliseTriagem',
          tags: [triagemOpenApiTagName],
          summary:
            action === 'enviar'
              ? 'Envia a análise ao contribuinte (passa a ficar visível)'
              : 'Retoma a análise (volta a rascunho; contribuinte deixa de ver as novas mudanças)',
          params: procParams,
          response: { 200: okFaseResponse, 404: errorResponse },
        },
      },
      async (request, reply) => {
        const { processoId } = request.params as { processoId: string }
        try {
          return await fn(processoId, deps)
        } catch (error) {
          if (error instanceof HttpError) {
            return reply.status(error.statusCode as 404).send({ message: error.message })
          }
          throw error
        }
      },
    )
  }

  app.post(
    '/api/triagem/processos/:processoId/conclusao',
    {
      schema: {
        operationId: 'concluirTriagem',
        tags: [triagemOpenApiTagName],
        summary: 'Conclui a triagem (todos os itens aprovados): libera AVCB ou coloca em vistoria',
        params: procParams,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['decisao'],
          properties: {
            decisao: { type: 'string', enum: ['liberar_avcb', 'colocar_em_vistoria'] },
            observacao: { type: 'string' },
          },
        },
        response: { 200: okFaseResponse, 404: errorResponse, 409: errorResponse },
      },
    },
    async (request, reply) => {
      const { processoId } = request.params as { processoId: string }
      const body = request.body as {
        decisao: 'liberar_avcb' | 'colocar_em_vistoria'
        observacao?: string
      }
      try {
        return await concluirTriagem(processoId, body, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404 | 409).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.get(
    '/api/processos/:processoId/avcb.pdf',
    {
      schema: {
        operationId: 'downloadAvcbPdf',
        tags: [triagemOpenApiTagName],
        summary: 'Gera o PDF do AVCB (processo deferido) no servidor',
        params: {
          type: 'object',
          required: ['processoId'],
          properties: { processoId: { type: 'string', format: 'uuid' } },
        },
        produces: ['application/pdf'],
      },
    },
    async (request, reply) => {
      const { processoId } = request.params as { processoId: string }
      try {
        const dossie = await getProcessoDossie(processoId, deps)
        if (dossie.processo.fase !== 'aprovado') {
          return reply
            .status(409)
            .send({ message: 'O AVCB só está disponível após o deferimento do processo.' })
        }
        const decisao = dossie.historico.find((h) => h.acao === 'decisao')
        const deferidoEm = decisao?.createdAt ?? null
        const modalidade = dossie.processo.risco === 'III' ? 'projeto' : 'vistoria'
        const fields: Array<[string, string]> = []
        if (dossie.empresa) {
          fields.push(['Empresa', dossie.empresa.razaoSocial])
        }
        if (dossie.unidade) {
          fields.push(['Unidade', dossie.unidade.nome ?? '—'])
          if (dossie.unidade.areaConstruida) {
            fields.push(['Área construída', `${dossie.unidade.areaConstruida} m²`])
          }
          fields.push(['Endereço', dossie.unidade.endereco])
        }
        const pdf = await createDocumentPdf({
          org: 'Corpo de Bombeiros Militar de Pernambuco',
          title: 'Auto de Vistoria do Corpo de Bombeiros (AVCB)',
          subtitle: `Risco ${dossie.processo.risco} — modalidade ${modalidade} · Decreto Estadual nº 61.082/2026`,
          meta: [
            ['Protocolo', dossie.processo.protocoloNumero ?? '—'],
            ['Deferido em', brDate(deferidoEm)],
            ['Válido até', brDatePlusYear(deferidoEm)],
          ],
          paragraph: `Certifica-se que a unidade abaixo identificada foi vistoriada e aprovada pelo Corpo de Bombeiros Militar de Pernambuco, atendendo às exigências de segurança contra incêndio e pânico aplicáveis à sua classificação de Risco ${dossie.processo.risco}, conforme o Decreto Estadual nº 61.082/2026.`,
          fields,
          footer:
            'Documento gerado pelo SAC Nexus. Válido por 1 ano a partir do deferimento, enquanto a unidade mantiver as condições vistoriadas. Este documento é orientativo e não substitui o AVCB oficial emitido pelo CBMPE.',
        })
        return reply
          .header('content-type', 'application/pdf')
          .header(
            'content-disposition',
            `inline; filename="${dossie.processo.protocoloNumero ?? 'AVCB'}.pdf"`,
          )
          .send(pdf)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404).send({ message: error.message })
        }
        throw error
      }
    },
  )
}
