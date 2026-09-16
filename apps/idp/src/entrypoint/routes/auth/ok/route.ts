import { type FastifyInstance } from 'fastify'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { sendAuthApiResponse } from '@/entrypoint/routes/auth/response.js'
import { getAuthOk } from '@/usecases/identity/get-auth-ok.js'
import { authOkOpenApi } from './openapi.js'

export function registerAuthOkRoute(app: FastifyInstance, dependencies: AppDependencies): void {
  app.get('/api/auth/ok', authOkOpenApi, async (request, reply) => {
    const response = await getAuthOk(request.requestContext, {
      auth: dependencies.auth,
      identityEvents: dependencies.identityEvents,
    })

    return sendAuthApiResponse(response, reply)
  })
}
