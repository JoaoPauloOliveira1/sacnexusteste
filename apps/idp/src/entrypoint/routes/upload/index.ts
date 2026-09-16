import { randomUUID } from 'node:crypto'
import { type FastifyPluginAsync } from 'fastify'

import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { uploadOpenApiTagName } from './openapi.js'

const MAX_BYTES = 5 * 1024 * 1024
const PDF_MAGIC = Buffer.from('%PDF-')

const errorResponse = {
  type: 'object',
  additionalProperties: false,
  properties: { message: { type: 'string' } },
} as const

function isPdf(buffer: Buffer): boolean {
  return buffer.length >= PDF_MAGIC.length && buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC)
}

export const uploadRoutes: FastifyPluginAsync<AppDependencies> = async (app, dependencies) => {
  const storage = dependencies.storage

  app.post(
    '/api/uploads',
    {
      schema: {
        operationId: 'uploadDocumento',
        tags: [uploadOpenApiTagName],
        summary: 'Envia um documento PDF (≤ 5 MB) e retorna sua chave no storage',
        consumes: ['multipart/form-data'],
        response: {
          201: {
            type: 'object',
            additionalProperties: false,
            required: ['key', 'fileName', 'size', 'contentType'],
            properties: {
              key: { type: 'string' },
              fileName: { type: 'string' },
              size: { type: 'integer' },
              contentType: { type: 'string' },
            },
          },
          400: errorResponse,
          413: errorResponse,
          503: errorResponse,
        },
      },
    },
    async (request, reply) => {
      if (!storage.isConfigured()) {
        return reply
          .status(503)
          .send({ message: 'Armazenamento de arquivos indisponível no momento.' })
      }

      const file = await request.file()
      if (!file) {
        return reply.status(400).send({ message: 'Envie um arquivo no campo "file".' })
      }

      let buffer: Buffer
      try {
        buffer = await file.toBuffer()
      } catch {
        return reply.status(413).send({ message: 'Arquivo excede o limite de 5 MB.' })
      }

      if (file.file.truncated || buffer.length > MAX_BYTES) {
        return reply.status(413).send({ message: 'Arquivo excede o limite de 5 MB.' })
      }
      if (file.mimetype !== 'application/pdf' || !isPdf(buffer)) {
        return reply.status(400).send({ message: 'Apenas arquivos PDF são aceitos.' })
      }

      const key = `uploads/${randomUUID()}.pdf`
      await storage.putObject({ key, body: buffer, contentType: 'application/pdf' })

      return reply.status(201).send({
        key,
        fileName: file.filename,
        size: buffer.length,
        contentType: 'application/pdf',
      })
    },
  )

  app.get(
    '/api/uploads/signed-url',
    {
      schema: {
        operationId: 'getUploadSignedUrl',
        tags: [uploadOpenApiTagName],
        summary: 'Gera uma URL temporária para visualizar/baixar um documento enviado',
        querystring: {
          type: 'object',
          required: ['key'],
          properties: { key: { type: 'string' } },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['url'],
            properties: { url: { type: 'string' } },
          },
          400: errorResponse,
          503: errorResponse,
        },
      },
    },
    async (request, reply) => {
      if (!storage.isConfigured()) {
        return reply
          .status(503)
          .send({ message: 'Armazenamento de arquivos indisponível no momento.' })
      }
      const { key } = request.query as { key: string }
      if (!key.startsWith('uploads/')) {
        return reply.status(400).send({ message: 'Chave inválida.' })
      }
      const url = await storage.getSignedDownloadUrl(key)
      return reply.status(200).send({ url })
    },
  )
}
