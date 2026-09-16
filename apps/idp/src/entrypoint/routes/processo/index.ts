import { type FastifyPluginAsync } from 'fastify'

import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { HttpError } from '@/infra/http/http-error.js'
import { createDocumentPdf } from '@/infra/pdf/document-pdf.js'
import {
  confirmProcessoPayment,
  getUnidadeProcesso,
  responderExigencia,
  startAvcb,
} from '@/usecases/processo/avcb-service.js'
import { emitDdlcb } from '@/usecases/processo/emit-ddlcb.js'
import { processoOpenApiTagName } from './openapi.js'

function maskCnpj(digits: string): string {
  const d = digits.replace(/\D/g, '')
  return d.length === 14
    ? `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
    : digits
}

function brDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
}

const unidadeIdParams = {
  type: 'object',
  required: ['unidadeId'],
  properties: { unidadeId: { type: 'string', format: 'uuid' } },
} as const

const errorResponse = {
  type: 'object',
  additionalProperties: false,
  properties: { message: { type: 'string' } },
} as const

const ddlcbResponse = {
  type: 'object',
  additionalProperties: false,
  required: ['numero', 'emitidoEm', 'risco', 'empresa', 'unidade', 'cnaes', 'jaEmitida'],
  properties: {
    numero: { type: 'string' },
    emitidoEm: { type: 'string' },
    risco: { type: 'string' },
    empresa: {
      type: 'object',
      additionalProperties: false,
      required: ['razaoSocial', 'cnpj'],
      properties: {
        razaoSocial: { type: 'string' },
        cnpj: { type: 'string' },
      },
    },
    unidade: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'endereco'],
      properties: {
        id: { type: 'string' },
        nome: { type: 'string', nullable: true },
        endereco: { type: 'string' },
        areaConstruida: { type: 'string', nullable: true },
      },
    },
    cnaes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['codigo', 'descricao', 'principal'],
        properties: {
          codigo: { type: 'string' },
          descricao: { type: 'string' },
          principal: { type: 'boolean' },
        },
      },
    },
    jaEmitida: { type: 'boolean' },
  },
} as const

export const processoRoutes: FastifyPluginAsync<AppDependencies> = async (app, dependencies) => {
  const deps = {
    processos: dependencies.processos,
    classificacoes: dependencies.classificacoes,
    unidades: dependencies.unidades,
  }

  app.post(
    '/api/unidades/:unidadeId/ddlcb',
    {
      schema: {
        operationId: 'emitDdlcb',
        tags: [processoOpenApiTagName],
        summary: 'Emite (ou retorna) a DDLCB de uma unidade classificada como Risco I',
        description:
          'Para uma unidade cuja última classificação é Risco I, cria o processo + documento DDLCB (Declaração de Dispensa de Licenciamento do CBMPE) e retorna os dados da declaração. Sem pagamento nem protocolo. Idempotente por classificação.',
        params: unidadeIdParams,
        response: { 200: ddlcbResponse, 404: errorResponse, 409: errorResponse },
      },
    },
    async (request, reply) => {
      const { unidadeId } = request.params as { unidadeId: string }
      try {
        return await emitDdlcb(unidadeId, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404 | 409).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.get(
    '/api/unidades/:unidadeId/processo',
    {
      schema: {
        operationId: 'getUnidadeProcesso',
        tags: [processoOpenApiTagName],
        summary: 'Retorna o processo mais recente da unidade (para retomar/pré-preencher)',
        params: unidadeIdParams,
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['processo'],
            properties: {
              processo: {
                type: 'object',
                nullable: true,
                additionalProperties: true,
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { unidadeId } = request.params as { unidadeId: string }
      return getUnidadeProcesso(unidadeId, deps)
    },
  )

  app.get(
    '/api/unidades/:unidadeId/ddlcb.pdf',
    {
      schema: {
        operationId: 'downloadDdlcbPdf',
        tags: [processoOpenApiTagName],
        summary: 'Gera o PDF da DDLCB (Risco I) no servidor',
        params: unidadeIdParams,
        produces: ['application/pdf'],
      },
    },
    async (request, reply) => {
      const { unidadeId } = request.params as { unidadeId: string }
      try {
        const d = await emitDdlcb(unidadeId, deps)
        const pdf = await createDocumentPdf({
          org: 'Corpo de Bombeiros Militar de Pernambuco',
          title: 'Declaração de Dispensa de Licenciamento (DDLCB)',
          subtitle: 'Decreto Estadual nº 61.082/2026 — atividade classificada como Risco I',
          meta: [
            ['Número', d.numero],
            ['Emitida em', brDate(d.emitidoEm)],
          ],
          paragraph:
            'Declara-se, para os devidos fins, que o estabelecimento abaixo identificado exerce atividade(s) econômica(s) enquadrada(s) como Risco I segundo o Decreto Estadual nº 61.082/2026 e, portanto, está dispensado do licenciamento prévio junto ao Corpo de Bombeiros Militar de Pernambuco, observadas as medidas de segurança contra incêndio e pânico aplicáveis.',
          fields: [
            ['Empresa', d.empresa.razaoSocial],
            ['CNPJ', maskCnpj(d.empresa.cnpj)],
            ['Unidade', d.unidade.nome ?? '—'],
            ['Área construída', d.unidade.areaConstruida ? `${d.unidade.areaConstruida} m²` : '—'],
            ['Endereço', d.unidade.endereco],
          ],
          list: {
            title: 'Atividades (CNAE) da unidade',
            items: d.cnaes.map(
              (c) => `${c.codigo} — ${c.descricao}${c.principal ? ' (principal)' : ''}`,
            ),
          },
          footer:
            'Documento gerado pelo SAC Nexus. A dispensa é válida enquanto a unidade mantiver as atividades e condições que a classificam como Risco I. Este documento é orientativo e não substitui a análise oficial do CBMPE.',
        })
        return reply
          .header('content-type', 'application/pdf')
          .header('content-disposition', `inline; filename="${d.numero}.pdf"`)
          .send(pdf)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404 | 409).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.post(
    '/api/unidades/:unidadeId/processo',
    {
      schema: {
        operationId: 'startAvcb',
        tags: [processoOpenApiTagName],
        summary: 'Inicia o processo AVCB (Risco II/III) com os dados N1-01 e documentos anexados',
        description:
          'Para uma unidade cuja última classificação é Risco II ou III, cria o processo com os dados complementares (TPEI, ponto de referência, horário do vistoriador, memorial, veracidade) e os documentos (chaves do storage). Fica em `aguardando_pagamento`. Idempotente por classificação.',
        params: unidadeIdParams,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['dadosComplementares', 'documentos'],
          properties: {
            dadosComplementares: { type: 'object', additionalProperties: true },
            documentos: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['tipo', 'key'],
                properties: { tipo: { type: 'string' }, key: { type: 'string' } },
              },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['processoId', 'risco', 'fase', 'jaExistia'],
            properties: {
              processoId: { type: 'string', format: 'uuid' },
              risco: { type: 'string' },
              fase: { type: 'string' },
              protocoloNumero: { type: 'string', nullable: true },
              jaExistia: { type: 'boolean' },
            },
          },
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    async (request, reply) => {
      const { unidadeId } = request.params as { unidadeId: string }
      const body = request.body as {
        dadosComplementares: unknown
        documentos: Array<{ tipo: string; key: string }>
      }
      try {
        return await startAvcb(unidadeId, body, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404 | 409).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.post(
    '/api/processos/:processoId/pagamento',
    {
      schema: {
        operationId: 'confirmProcessoPayment',
        tags: [processoOpenApiTagName],
        summary: 'Confirma o pagamento (simulado) e protocola o processo AVCB',
        description:
          'Pagamento simulado por enquanto: registra um pagamento confirmado (fonte=simulado) e gera o número de protocolo. O protocolo só existe após o pagamento confirmado. Idempotente.',
        params: {
          type: 'object',
          required: ['processoId'],
          properties: { processoId: { type: 'string', format: 'uuid' } },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['protocoloNumero', 'protocoladoEm', 'jaProtocolado'],
            properties: {
              protocoloNumero: { type: 'string' },
              protocoladoEm: { type: 'string' },
              jaProtocolado: { type: 'boolean' },
            },
          },
          404: errorResponse,
        },
      },
    },
    async (request, reply) => {
      const { processoId } = request.params as { processoId: string }
      try {
        return await confirmProcessoPayment(processoId, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.post(
    '/api/processos/:processoId/exigencia/resposta',
    {
      schema: {
        operationId: 'responderExigencia',
        tags: [processoOpenApiTagName],
        summary: 'Responde a uma exigência (reenvia documentos) e volta o processo para análise',
        description:
          'Ação do contribuinte: anexa documentos corrigidos + uma mensagem e move o processo de `em_exigencia` de volta para `protocolado` (retorna à triagem). Requer uma exigência pendente.',
        params: {
          type: 'object',
          required: ['processoId'],
          properties: { processoId: { type: 'string', format: 'uuid' } },
        },
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['documentos'],
          properties: {
            mensagem: { type: 'string' },
            documentos: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['tipo', 'key'],
                properties: { tipo: { type: 'string' }, key: { type: 'string' } },
              },
            },
          },
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
          409: errorResponse,
        },
      },
    },
    async (request, reply) => {
      const { processoId } = request.params as { processoId: string }
      const body = request.body as {
        mensagem?: string
        documentos: Array<{ tipo: string; key: string }>
      }
      try {
        return await responderExigencia(processoId, body, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 400 | 404 | 409).send({ message: error.message })
        }
        throw error
      }
    },
  )
}
