import { authOpenApiTag } from '@/entrypoint/routes/auth/openapi.js'
import { classificacaoOpenApiTag } from '@/entrypoint/routes/classificacao/openapi.js'
import { empresaOpenApiTag } from '@/entrypoint/routes/empresa/openapi.js'
import { eventoOpenApiTag } from '@/entrypoint/routes/evento/openapi.js'
import { operationalOpenApiTag } from '@/entrypoint/routes/operational/openapi.js'
import { processoOpenApiTag } from '@/entrypoint/routes/processo/openapi.js'
import { tenantOpenApiTag } from '@/entrypoint/routes/tenant/openapi.js'
import { triagemOpenApiTag } from '@/entrypoint/routes/triagem/openapi.js'
import { unidadeOpenApiTag } from '@/entrypoint/routes/unidade/openapi.js'
import { uploadOpenApiTag } from '@/entrypoint/routes/upload/openapi.js'

export const openApiTags = [
  operationalOpenApiTag,
  authOpenApiTag,
  tenantOpenApiTag,
  empresaOpenApiTag,
  unidadeOpenApiTag,
  classificacaoOpenApiTag,
  processoOpenApiTag,
  uploadOpenApiTag,
  triagemOpenApiTag,
  eventoOpenApiTag,
] as const
