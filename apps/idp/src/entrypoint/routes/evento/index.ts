import { type FastifyPluginAsync } from 'fastify'

import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { HttpError } from '@/infra/http/http-error.js'
import {
  createEvento,
  getEventoProcesso,
  listEventos,
  startAvcbEvento,
} from '@/usecases/evento/evento-service.js'
import { eventoOpenApiTagName } from './openapi.js'

const errorResponse = {
  type: 'object',
  additionalProperties: false,
  properties: { message: { type: 'string' } },
} as const

const eventoIdParams = {
  type: 'object',
  required: ['eventoId'],
  properties: { eventoId: { type: 'string', format: 'uuid' } },
} as const

export const eventoRoutes: FastifyPluginAsync<AppDependencies> = async (app, dependencies) => {
  const deps = {
    eventos: dependencies.eventos,
    processos: dependencies.processos,
    empresas: dependencies.empresas,
  }

  app.post(
    '/api/eventos',
    {
      schema: {
        operationId: 'createEvento',
        tags: [eventoOpenApiTagName],
        summary: 'Cria um evento temporário (endereço + datas + risco II/III)',
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['risco', 'inicioEm', 'terminoEm'],
          properties: {
            nome: { type: 'string' },
            solicitanteNome: { type: 'string' },
            solicitanteCpf: { type: 'string' },
            risco: { type: 'string', enum: ['II', 'III'] },
            cep: { type: 'string' },
            logradouro: { type: 'string' },
            numero: { type: 'string' },
            complemento: { type: 'string' },
            bairro: { type: 'string' },
            municipio: { type: 'string' },
            uf: { type: 'string' },
            inicioEm: { type: 'string' },
            terminoEm: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            additionalProperties: false,
            required: ['eventoId'],
            properties: { eventoId: { type: 'string', format: 'uuid' } },
          },
          400: errorResponse,
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await createEvento(request.body as never, deps)
        return reply.status(201).send(result)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 400).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.get(
    '/api/eventos',
    {
      schema: {
        operationId: 'listEventos',
        tags: [eventoOpenApiTagName],
        summary: 'Lista os eventos temporários do tenant',
        response: { 200: { type: 'object', additionalProperties: true } },
      },
    },
    async () => listEventos(deps),
  )

  app.get(
    '/api/eventos/:eventoId/processo',
    {
      schema: {
        operationId: 'getEventoProcesso',
        tags: [eventoOpenApiTagName],
        summary: 'Retorna o processo do evento (para retomar/pré-preencher)',
        params: eventoIdParams,
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['processo'],
            properties: {
              processo: { type: 'object', nullable: true, additionalProperties: true },
            },
          },
        },
      },
    },
    async (request) => {
      const { eventoId } = request.params as { eventoId: string }
      return getEventoProcesso(eventoId, deps)
    },
  )

  app.post(
    '/api/eventos/:eventoId/processo',
    {
      schema: {
        operationId: 'startAvcbEvento',
        tags: [eventoOpenApiTagName],
        summary: 'Inicia o processo AVCB do evento (documentos N1-01)',
        params: eventoIdParams,
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
      const { eventoId } = request.params as { eventoId: string }
      try {
        return await startAvcbEvento(eventoId, request.body as never, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404 | 409).send({ message: error.message })
        }
        throw error
      }
    },
  )
}
