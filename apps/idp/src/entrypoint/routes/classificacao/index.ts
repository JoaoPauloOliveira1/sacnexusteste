import { type FastifyPluginAsync } from 'fastify'

import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { saveClassificacao } from '@/usecases/classificacao/save-classificacao.js'
import { classificacaoOpenApiTagName } from './openapi.js'

const unidadeIdParams = {
  type: 'object',
  required: ['unidadeId'],
  properties: { unidadeId: { type: 'string', format: 'uuid' } },
} as const

export const classificacaoRoutes: FastifyPluginAsync<AppDependencies> = async (
  app,
  dependencies,
) => {
  const classificacoes = dependencies.classificacoes

  app.post(
    '/api/unidades/:unidadeId/classificacoes',
    {
      schema: {
        operationId: 'saveClassificacao',
        tags: [classificacaoOpenApiTagName],
        summary:
          'Persiste a classificação de risco de uma unidade (resultado + respostas + contexto)',
        params: unidadeIdParams,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['risco', 'respostas'],
          properties: {
            risco: { type: 'string', enum: ['I', 'II', 'III', 'undetermined'] },
            origem: { type: 'string' },
            respostas: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['perguntaId'],
                properties: {
                  perguntaId: { type: 'string' },
                  grupo: { type: 'string' },
                  valor: {},
                },
              },
            },
            fatores: { type: 'object', additionalProperties: true },
          },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['classificacaoId'],
            properties: { classificacaoId: { type: 'string', format: 'uuid' } },
          },
        },
      },
    },
    async (request) => {
      const { unidadeId } = request.params as { unidadeId: string }
      const body = request.body as {
        risco: 'I' | 'II' | 'III' | 'undetermined'
        origem?: string
        respostas: Array<{ perguntaId: string; grupo?: string; valor: unknown }>
        fatores?: unknown
      }
      return saveClassificacao({ unidadeId, ...body }, { classificacoes })
    },
  )

  app.get(
    '/api/unidades/:unidadeId/classificacoes',
    {
      schema: {
        operationId: 'listClassificacoes',
        tags: [classificacaoOpenApiTagName],
        summary: 'Lista as classificações de risco de uma unidade',
        params: unidadeIdParams,
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'string' },
                risco: { type: 'string' },
                origem: { type: 'string' },
                concluidaEm: { type: 'string', nullable: true },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { unidadeId } = request.params as { unidadeId: string }
      return classificacoes.listByUnidade(unidadeId)
    },
  )
}
