import { empresaOpenApiTagName } from '@/entrypoint/routes/empresa/openapi.js'

export const registerEmpresaOpenApi = {
  schema: {
    operationId: 'registerEmpresaFromCnpj',
    tags: [empresaOpenApiTagName],
    summary: 'Cadastra/atualiza uma empresa a partir do CNPJ',
    description:
      'Consulta o CNPJ em base pública (BrasilAPI, com fallback CNPJá), recupera dados + TODOS os CNAEs (principal e secundários) + quadro societário, mapeia cada CNAE à classificação de risco (Decreto 61.082/2026) e persiste a empresa, seus CNAEs e sócios. Retorna a empresa com o risco preliminar por CNAE e o risco geral (maior banda). `organizationId` é temporário até a resolução por tenant/auth.',
    body: {
      type: 'object',
      additionalProperties: false,
      required: ['cnpj'],
      properties: {
        cnpj: { type: 'string', description: 'CNPJ (com ou sem máscara)' },
        organizationId: {
          type: 'string',
          format: 'uuid',
          description:
            'Tenant/organização proprietária do cadastro. Opcional em dev: quando ausente, resolve uma organização padrão (temporário até auth/tenant).',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        additionalProperties: false,
        required: ['empresaId', 'cnpj', 'legalName', 'cnaes', 'socios', 'source'],
        properties: {
          empresaId: { type: 'string', format: 'uuid' },
          cnpj: { type: 'string' },
          legalName: { type: 'string' },
          tradeName: { type: 'string' },
          registrationStatus: { type: 'string' },
          legalNature: { type: 'string' },
          porte: { type: 'string' },
          openingDate: { type: 'string', nullable: true },
          email: { type: 'string' },
          phone: { type: 'string' },
          cep: { type: 'string' },
          street: { type: 'string' },
          number: { type: 'string' },
          complement: { type: 'string' },
          neighborhood: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          overallRisk: { type: 'string', nullable: true, example: 'II' },
          cnaes: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['codigo', 'descricao', 'principal'],
              properties: {
                codigo: { type: 'string', example: '4713-0/04' },
                descricao: { type: 'string' },
                principal: { type: 'boolean' },
                band: { type: 'string', nullable: true, example: 'I' },
              },
            },
          },
          socios: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                nome: { type: 'string' },
                documento: { type: 'string' },
                qualificacao: { type: 'string' },
              },
            },
          },
          source: { type: 'string', example: 'brasilapi' },
        },
      },
      400: {
        type: 'object',
        additionalProperties: false,
        properties: { message: { type: 'string' } },
      },
      404: {
        type: 'object',
        additionalProperties: false,
        properties: { message: { type: 'string' } },
      },
      502: {
        type: 'object',
        additionalProperties: false,
        properties: { message: { type: 'string' } },
      },
    },
  },
} as const
