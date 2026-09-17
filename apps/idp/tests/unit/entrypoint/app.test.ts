import { type FastifyServerOptions } from 'fastify'
import { describe, expect, it } from 'vitest'
import { createApp } from '@/entrypoint/app.js'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { noopIdentityEventPublisher } from '@/events/index.js'

type TestDependencyOverrides = Omit<Partial<AppDependencies>, 'auth'> & {
  auth?: Partial<AppDependencies['auth']>
}

function createTestDependencies(overrides: TestDependencyOverrides = {}): AppDependencies {
  const auth: AppDependencies['auth'] = {
    changePassword: async () => Response.json({ ok: true }),
    getSession: async () => Response.json(null),
    ok: async () => Response.json({ ok: true }),
    requestPasswordResetCallback: async () => Response.json({ ok: true }),
    requestPasswordReset: async () => Response.json({ ok: true }),
    resetPassword: async () => Response.json({ ok: true }),
    sendVerificationEmail: async () => Response.json({ ok: true }),
    signInEmail: async () => Response.json({ ok: true }),
    signOut: async () => Response.json({ success: true }),
    signUpEmail: async () => Response.json({ ok: true }),
    verifyEmail: async () => Response.json({ ok: true }),
  }

  return {
    auth: { ...auth, ...overrides.auth },
    classificacoes: overrides.classificacoes ?? {
      saveClassificacao: async () => ({ classificacaoId: 'test-classificacao' }),
      listByUnidade: async () => [],
      getRespostas: async () => [],
    },
    cnpjProvider: overrides.cnpjProvider ?? {
      fetch: async () => {
        throw new Error('cnpjProvider not mocked')
      },
    },
    database: overrides.database ?? {
      checkReadiness: async () => {},
    },
    empresas: overrides.empresas ?? {
      findCnaeBandsByNumerico: async () => new Map(),
      saveEmpresa: async () => ({ empresaId: 'test-empresa' }),
      ensureDefaultOrganization: async () => 'test-org',
      listEmpresas: async () => [],
      getEmpresaById: async () => null,
      deleteEmpresa: async () => {},
    },
    eventos: overrides.eventos ?? {
      createEvento: async () => ({ eventoId: 'test-evento' }),
      getEvento: async () => null,
      listEventos: async () => [],
    },
    identityEvents: overrides.identityEvents ?? noopIdentityEventPublisher,
    processos: overrides.processos ?? {
      getUnidadeDossie: async () => null,
      findDdlcbByClassificacao: async () => null,
      createDdlcb: async () => ({
        processoId: 'test-processo',
        documentoId: 'test-documento',
        emitidoEm: new Date(),
      }),
      findOpenProcessoByClassificacao: async () => null,
      createAvcbProcesso: async () => ({ processoId: 'test-processo' }),
      getProcesso: async () => null,
      getLatestProcessoByUnidade: async () => null,
      getLatestProcessoByEvento: async () => null,
      listProcessoDocumentos: async () => [],
      confirmSimulatedPayment: async () => ({
        protocoloNumero: 'AVCB-2026-TEST',
        protocoladoEm: new Date(),
      }),
      listProcessos: async () => [],
      getProcessoFull: async () => null,
      getProcessoPagamento: async () => null,
      addExigencia: async () => {},
      responderExigencia: async () => {},
      registrarDecisao: async () => {},
      listHistorico: async () => [],
      assumirProcesso: async () => {},
      addTriagemItem: async () => {},
      listTriagemItens: async () => [],
      listTriagemItemHistorico: async () => [],
      setAnaliseStatus: async () => {},
      getProcessoSinalizadores: async () => ({
        exigenciaRespondidaEm: null,
        exigenciaSanadaEm: null,
        mensagensNaoLidasTriador: 0,
        mensagensNaoLidasContribuinte: 0,
        ultimaMensagemEm: null,
      }),
      listProcessoMensagens: async () => [],
      addProcessoMensagem: async () => {
        throw new Error('not implemented')
      },
      marcarMensagensComoLidas: async () => {},
    },
    storage: overrides.storage ?? {
      isConfigured: () => false,
      putObject: async () => {},
      getSignedDownloadUrl: async () => 'https://example.test/signed',
      getObjectBytes: async () => Buffer.from(''),
    },
    tenantDomains: overrides.tenantDomains ?? {
      findByNormalizedHost: async () => null,
    },
    unidades: overrides.unidades ?? {
      findEmpresa: async () => null,
      listEmpresaCnaes: async () => [],
      createUnidade: async () => ({ unidadeId: 'test-unidade' }),
      listUnidadeCnaes: async () => [],
      listUnidadesByEmpresa: async () => [],
      getUnidade: async () => null,
      updateUnidade: async () => {},
    },
    close: overrides.close ?? (async () => {}),
  }
}

function createTestApp(options: Parameters<typeof createApp>[0] = {}) {
  return createApp({ dependencies: createTestDependencies(), ...options })
}

describe('createApp', () => {
  it('creates a Fastify app without binding a network port', async () => {
    const app = createTestApp({ logger: false })

    await app.ready()

    expect(app.server.listening).toBe(false)

    await app.close()
  })

  it('registers GET /health', async () => {
    const app = createTestApp({ appEnv: 'local', logger: false })

    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ service: 'idp', status: 'ok' })
    expect(response.json()).not.toHaveProperty('appEnv')

    await app.close()
  })

  it('registers GET /ready', async () => {
    const app = createTestApp({ appEnv: 'local', logger: false })

    const response = await app.inject({ method: 'GET', url: '/ready' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      checks: [{ name: 'database', status: 'ready' }],
      service: 'idp',
      status: 'ready',
    })

    await app.close()
  })

  it('registers GET /tenant/status with a generic public response', async () => {
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        tenantDomains: {
          findByNormalizedHost: async () => ({
            domainStatus: 'active',
            organizationId: '0197f7d6-9f4a-75b1-9f3d-f1d55d6e7b20',
            tenantId: '0197f7d6-9f4a-75b1-9f3d-f1d55d6e7b21',
            tenantStatus: 'active',
          }),
        },
      }),
      logger: false,
    })

    const response = await app.inject({
      headers: { 'x-forwarded-host': 'PE.SACNEXUS.COM.BR' },
      method: 'GET',
      url: '/tenant/status',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ tenant_status: 'available' })

    await app.close()
  })

  it('falls back to host for GET /tenant/status and keeps unavailable responses generic', async () => {
    const app = createTestApp({ appEnv: 'local', logger: false })

    const response = await app.inject({
      headers: { host: 'unknown.example.test' },
      method: 'GET',
      url: '/tenant/status',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ tenant_status: 'unavailable' })

    await app.close()
  })

  it('does not include raw tenant hosts in canonical logs', async () => {
    const logs: string[] = []
    const logger: FastifyServerOptions['logger'] = {
      level: 'info',
      stream: {
        write: (line) => logs.push(line),
      },
    }
    const app = createTestApp({ appEnv: 'local', logger })

    const response = await app.inject({
      headers: { 'x-forwarded-host': 'sensitive-tenant.example.test' },
      method: 'GET',
      url: '/tenant/status',
    })

    const events = logs
      .map((line) => JSON.parse(line) as { event?: string })
      .filter((line) => line.event === 'http.request.completed')

    expect(response.statusCode).toBe(200)
    expect(events).toHaveLength(1)
    expect(JSON.stringify(events[0])).not.toContain('sensitive-tenant.example.test')

    await app.close()
  })

  it('generates and echoes x-request-id when no inbound ID exists', async () => {
    const app = createTestApp({ appEnv: 'local', logger: false })

    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.headers['x-request-id']).toEqual(expect.any(String))

    await app.close()
  })

  it('propagates inbound x-request-id', async () => {
    const app = createTestApp({ appEnv: 'local', logger: false })

    const response = await app.inject({
      headers: { 'x-request-id': 'upstream-request-1' },
      method: 'GET',
      url: '/health',
    })

    expect(response.headers['x-request-id']).toBe('upstream-request-1')

    await app.close()
  })

  it('uses x-correlation-id as request ID fallback', async () => {
    const app = createTestApp({ appEnv: 'local', logger: false })

    const response = await app.inject({
      headers: { 'x-correlation-id': 'correlation-1' },
      method: 'GET',
      url: '/health',
    })

    expect(response.headers['x-request-id']).toBe('correlation-1')

    await app.close()
  })

  it('emits one canonical event at the end of a request', async () => {
    const logs: string[] = []
    const logger: FastifyServerOptions['logger'] = {
      level: 'info',
      stream: {
        write: (line) => logs.push(line),
      },
    }
    const app = createTestApp({ appEnv: 'local', logger })

    const response = await app.inject({ method: 'GET', url: '/health?email=user@example.test' })

    const events = logs
      .map((line) => JSON.parse(line) as { event?: string; request_id?: string })
      .filter((line) => line.event === 'http.request.completed')

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      app_env: 'local',
      method: 'GET',
      outcome: 'success',
      path: '/health',
      request_id: response.headers['x-request-id'],
      service: 'idp',
      status_code: 200,
    })

    await app.close()
  })

  it('does not log raw unmatched paths in canonical events', async () => {
    const logs: string[] = []
    const logger: FastifyServerOptions['logger'] = {
      level: 'info',
      stream: {
        write: (line) => logs.push(line),
      },
    }
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          getSession: async () => Response.json(null),
          ok: async () => Response.json({ ok: true }),
          signInEmail: async () =>
            Response.json({
              redirect: false,
              user: {
                email: 'user@example.test',
                emailVerified: false,
                id: 'usr_1',
                name: 'Synthetic User',
              },
            }),
          signOut: async () => Response.json({ success: true }),
          signUpEmail: async () => Response.json({ ok: true }),
        },
      }),
      logger,
    })

    const response = await app.inject({
      method: 'GET',
      url: '/reset/sensitive-backup-code?token=abc',
    })

    const events = logs
      .map((line) => JSON.parse(line) as { event?: string; path?: string })
      .filter((line) => line.event === 'http.request.completed')

    expect(response.statusCode).toBe(404)
    expect(events).toHaveLength(1)
    expect(events[0]?.path).toBe('/:path/:path')
    expect(JSON.stringify(events[0])).not.toContain('sensitive-backup-code')
    expect(JSON.stringify(events[0])).not.toContain('token=abc')

    await app.close()
  })

  it('enriches auth route canonical events with safe auth operation metadata', async () => {
    const logs: string[] = []
    const logger: FastifyServerOptions['logger'] = {
      level: 'info',
      stream: {
        write: (line) => logs.push(line),
      },
    }
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          getSession: async () => Response.json(null),
          ok: async () => Response.json({ ok: true }),
          signInEmail: async () =>
            Response.json({
              redirect: false,
              user: {
                email: 'user@example.test',
                emailVerified: false,
                id: 'usr_1',
                name: 'Synthetic User',
              },
            }),
          signOut: async () => Response.json({ success: true }),
          signUpEmail: async () => Response.json({ ok: true }),
        },
      }),
      logger,
    })

    const response = await app.inject({
      method: 'POST',
      payload: { email: 'user@example.test', password: 'sensitive-password' },
      url: '/api/auth/sign-in/email',
    })

    const events = logs
      .map((line) => JSON.parse(line) as { event?: string; auth_operation?: string })
      .filter((line) => line.event === 'http.request.completed')

    expect(response.statusCode).toBe(200)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      auth_operation: 'sign_in_email',
      path: '/api/auth/sign-in/email',
      status_code: 200,
    })
    expect(JSON.stringify(events[0])).not.toContain('user@example.test')
    expect(JSON.stringify(events[0])).not.toContain('sensitive-password')

    await app.close()
  })

  it('returns generic errors while canonical logs keep safe diagnostic details', async () => {
    const logs: string[] = []
    const logger: FastifyServerOptions['logger'] = {
      level: 'info',
      stream: {
        write: (line) => logs.push(line),
      },
    }
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          signInEmail: async () => {
            throw new Error(
              'Failed query: select "email" from "idp_user" where email = $1 params: user@example.test',
              { cause: { code: '42P01' } },
            )
          },
        },
      }),
      logger,
    })

    const response = await app.inject({
      method: 'POST',
      payload: { email: 'user@example.test', password: 'sensitive-password' },
      url: '/api/auth/sign-in/email',
    })
    const body = response.body

    expect(response.statusCode).toBe(500)
    expect(response.json()).toEqual({ message: 'Erro' })
    expect(body).not.toContain('Failed query')
    expect(body).not.toContain('idp_user')
    expect(body).not.toContain('user@example.test')
    expect(body).not.toContain('sensitive-password')

    const events = logs
      .map((line) => JSON.parse(line) as { error?: unknown; event?: string })
      .filter((line) => line.event === 'http.request.completed')

    expect(events).toHaveLength(1)
    expect(events[0]?.error).toEqual({
      category: 'database',
      code: '42P01',
      db_error_kind: 'relation_missing',
      name: 'Error',
    })
    expect(JSON.stringify(events[0])).not.toContain('Failed query')
    expect(JSON.stringify(events[0])).not.toContain('idp_user')
    expect(JSON.stringify(events[0])).not.toContain('user@example.test')
    expect(JSON.stringify(events[0])).not.toContain('sensitive-password')

    await app.close()
  })

  it('exposes Swagger UI and OpenAPI JSON outside production', async () => {
    const app = createTestApp({ appEnv: 'local', logger: false })

    const docsResponse = await app.inject({ method: 'GET', url: '/docs' })
    const openApiResponse = await app.inject({ method: 'GET', url: '/openapi.json' })
    const openApiDocument = openApiResponse.json()

    expect([200, 301, 302]).toContain(docsResponse.statusCode)
    expect(openApiResponse.statusCode).toBe(200)
    expect(openApiDocument.info).toMatchObject({
      description: expect.stringContaining('SAC Nexus Identity Provider'),
      title: 'SAC Nexus IDP API',
      version: '0.0.0',
    })
    expect(openApiDocument.tags).toContainEqual({
      description: expect.stringContaining('Non-sensitive service operation endpoints'),
      name: 'operational',
    })
    expect(openApiDocument.tags).toContainEqual({
      description: expect.stringContaining('authentication wrappers'),
      name: 'auth',
    })
    expect(openApiDocument.components.schemas.HealthResponse).toMatchObject({
      description: 'Minimal non-sensitive liveness payload for the IDP service.',
      example: {
        service: 'idp',
        status: 'ok',
        timestamp: '2026-05-12T00:00:00.000Z',
      },
      title: 'Health response',
    })
    expect(openApiDocument.components.schemas.ReadinessResponse).toMatchObject({
      description: 'Minimal non-sensitive readiness payload for the IDP service.',
      title: 'Readiness response',
    })
    expect(openApiDocument.components.schemas.AuthUserResponse).toMatchObject({
      description: 'Sanitized IDP user payload returned by auth wrapper routes.',
      title: 'Auth user response',
    })
    expect(openApiDocument.paths['/health'].get.operationId).toBe('getHealth')
    expect(openApiDocument.paths['/health'].get.summary).toBe('Check IDP liveness')
    expect(openApiDocument.paths['/ready'].get.operationId).toBe('getReadiness')
    expect(openApiDocument.paths['/ready'].get.summary).toBe('Check IDP readiness')
    expect(
      openApiDocument.paths['/health'].get.responses['200'].content['application/json'].schema,
    ).toEqual({ $ref: '#/components/schemas/HealthResponse' })

    await app.close()
  })

  it('disables Swagger UI and OpenAPI JSON in production', async () => {
    const app = createTestApp({ appEnv: 'production', logger: false })

    const docsResponse = await app.inject({ method: 'GET', url: '/docs' })
    const openApiResponse = await app.inject({ method: 'GET', url: '/openapi.json' })

    expect(docsResponse.statusCode).toBe(404)
    expect(openApiResponse.statusCode).toBe(404)

    await app.close()
  })

  it('returns 503 when database readiness fails', async () => {
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        database: { checkReadiness: async () => Promise.reject(new Error('database unavailable')) },
      }),
      logger: false,
    })

    const response = await app.inject({ method: 'GET', url: '/ready' })

    expect(response.statusCode).toBe(503)
    expect(response.json()).toMatchObject({
      checks: [{ name: 'database', status: 'unready' }],
      status: 'unready',
    })

    await app.close()
  })

  it('sanitizes sign-in responses and preserves set-cookie headers', async () => {
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          getSession: async () => Response.json(null),
          ok: async () => Response.json({ ok: true }),
          signInEmail: async () =>
            Response.json(
              {
                redirect: false,
                token: 'sensitive-session-token',
                user: {
                  id: 'usr_1',
                  email: 'user@example.test',
                  emailVerified: false,
                  name: 'Synthetic User',
                },
              },
              {
                headers: {
                  'content-length': '9999',
                  'set-cookie': 'better-auth.session_token=opaque; HttpOnly',
                },
              },
            ),
          signOut: async () => Response.json({ success: true }),
          signUpEmail: async () => Response.json({ ok: true }),
        },
      }),
      logger: false,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      payload: { email: 'user@example.test', password: 'password' },
    })

    const payload = response.json()

    expect(response.statusCode).toBe(200)
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('better-auth.session_token=opaque')]),
    )
    expect(response.headers['content-length']).not.toBe('9999')
    expect(payload).toEqual({
      redirect: false,
      user: {
        email: 'user@example.test',
        email_verified: false,
        id: 'usr_1',
        name: 'Synthetic User',
      },
    })
    expect(JSON.stringify(payload)).not.toContain('sensitive-session-token')

    await app.close()
  })

  it('calls the Better Auth sign-up SDK method', async () => {
    let forwardedBody: unknown
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          getSession: async () => Response.json(null),
          ok: async () => Response.json({ ok: true }),
          signInEmail: async () => Response.json({ ok: true }),
          signOut: async () => Response.json({ success: true }),
          signUpEmail: async (body) => {
            forwardedBody = body

            return Response.json({
              token: 'created-session-token',
              user: {
                id: 'usr_1',
                email: 'user@example.test',
                emailVerified: false,
                name: 'Synthetic User',
              },
            })
          },
        },
      }),
      logger: false,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up/email',
      payload: { email: 'user@example.test', name: 'Synthetic User', password: 'strong-password' },
    })
    const payload = response.json()

    expect(response.statusCode).toBe(200)
    expect(forwardedBody).toEqual({
      email: 'user@example.test',
      name: 'Synthetic User',
      password: 'strong-password',
      callbackURL: 'https://app.example.test/auth/email-verified',
    })
    expect(payload).toMatchObject({ user: { email_verified: false, id: 'usr_1' } })
    expect(JSON.stringify(payload)).not.toContain('created-session-token')

    await app.close()
  })

  it('rejects weak passwords before calling the Better Auth sign-up SDK method', async () => {
    let signUpCalled = false
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          signUpEmail: async () => {
            signUpCalled = true

            return Response.json({ ok: true })
          },
        },
      }),
      logger: false,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up/email',
      payload: { email: 'user@example.test', name: 'Synthetic User', password: 'short' },
    })

    expect(response.statusCode).toBe(400)
    expect(signUpCalled).toBe(false)

    await app.close()
  })

  it('maps verification resend requests and returns a generic response', async () => {
    let forwardedBody: unknown
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          sendVerificationEmail: async (body) => {
            forwardedBody = body

            return Response.json({ message: 'User not found', status: false }, { status: 400 })
          },
        },
      }),
      logger: false,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/send-verification-email',
      payload: { email: 'missing@example.test' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      message: 'If an account exists and requires verification, instructions will be sent.',
      status: true,
    })
    expect(forwardedBody).toEqual({
      callbackURL: 'https://app.example.test/auth/email-verified',
      email: 'missing@example.test',
    })

    await app.close()
  })

  it('maps password reset requests and returns a generic response', async () => {
    let forwardedBody: unknown
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          requestPasswordReset: async (body) => {
            forwardedBody = body

            return Response.json({ message: 'If an account exists', status: true })
          },
        },
      }),
      logger: false,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/request-password-reset',
      payload: { email: 'user@example.test', redirect_to: 'https://evil.example.test/reset' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      message: 'If an account exists, password reset instructions will be sent.',
      status: true,
    })
    expect(forwardedBody).toEqual({
      email: 'user@example.test',
      redirectTo: 'https://app.example.test/auth/reset-password',
    })

    await app.close()
  })

  it('maps email verification and password reset callback links to configured callbacks', async () => {
    const forwardedCalls: unknown[] = []
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          requestPasswordResetCallback: async (params, query) => {
            forwardedCalls.push({ params, query })

            return Response.json({ token: 'reset-token' })
          },
          verifyEmail: async (query) => {
            forwardedCalls.push({ query })

            return Response.json({ status: true })
          },
        },
      }),
      logger: false,
    })

    const verifyResponse = await app.inject({
      method: 'GET',
      url: '/api/auth/verify-email?token=verify-token&callbackURL=https://evil.example.test/verified',
    })
    const resetCallbackResponse = await app.inject({
      method: 'GET',
      url: '/api/auth/reset-password/reset-token?callbackURL=https://evil.example.test/reset',
    })

    expect(verifyResponse.statusCode).toBe(200)
    expect(resetCallbackResponse.statusCode).toBe(200)
    expect(forwardedCalls).toEqual([
      {
        query: {
          callbackURL: 'https://app.example.test/auth/email-verified',
          token: 'verify-token',
        },
      },
      {
        params: { token: 'reset-token' },
        query: { callbackURL: 'https://app.example.test/auth/reset-password' },
      },
    ])

    await app.close()
  })

  it('maps reset and change password requests to Better Auth payloads', async () => {
    const forwardedBodies: unknown[] = []
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          changePassword: async (body) => {
            forwardedBodies.push(body)

            return Response.json({
              token: 'sensitive-token',
              user: {
                email: 'user@example.test',
                emailVerified: true,
                id: '0197f7d6-9f4a-75b1-9f3d-f1d55d6e7b20',
                name: 'Synthetic User',
              },
            })
          },
          resetPassword: async (body) => {
            forwardedBodies.push(body)

            return Response.json({ status: true })
          },
        },
      }),
      logger: false,
    })

    const resetResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/reset-password',
      payload: { new_password: 'new-strong-password', token: 'reset-token' },
    })
    const changeResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/change-password',
      payload: { current_password: 'current-password', new_password: 'new-strong-password' },
    })

    expect(resetResponse.statusCode).toBe(200)
    expect(changeResponse.statusCode).toBe(200)
    expect(forwardedBodies).toEqual([
      { newPassword: 'new-strong-password', token: 'reset-token' },
      {
        currentPassword: 'current-password',
        newPassword: 'new-strong-password',
        revokeOtherSessions: true,
      },
    ])
    expect(changeResponse.json()).toEqual({
      user: {
        email: 'user@example.test',
        email_verified: true,
        id: '0197f7d6-9f4a-75b1-9f3d-f1d55d6e7b20',
        name: 'Synthetic User',
      },
    })
    expect(JSON.stringify(changeResponse.json())).not.toContain('sensitive-token')

    await app.close()
  })

  it('rejects reset password requests without a token', async () => {
    const app = createTestApp({ appEnv: 'local', logger: false })

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/reset-password',
      payload: { new_password: 'new-strong-password' },
    })

    expect(response.statusCode).toBe(400)

    await app.close()
  })

  it('calls the Better Auth sign-out and ok SDK methods', async () => {
    const calledMethods: string[] = []
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          getSession: async () => Response.json(null),
          ok: async () => {
            calledMethods.push('ok')

            return Response.json({ ok: true })
          },
          signInEmail: async () => Response.json({ ok: true }),
          signOut: async () => {
            calledMethods.push('signOut')

            return Response.json({ success: true })
          },
          signUpEmail: async () => Response.json({ ok: true }),
        },
      }),
      logger: false,
    })

    const signOutResponse = await app.inject({ method: 'POST', url: '/api/auth/sign-out' })
    const okResponse = await app.inject({ method: 'GET', url: '/api/auth/ok' })

    expect(signOutResponse.statusCode).toBe(200)
    expect(signOutResponse.json()).toEqual({ success: true })
    expect(okResponse.statusCode).toBe(200)
    expect(okResponse.json()).toEqual({ ok: true })
    expect(calledMethods).toEqual(['signOut', 'ok'])

    await app.close()
  })

  it('maps GET /api/auth/session to Better Auth get-session and hides session internals', async () => {
    let getSessionCalled = false
    const app = createApp({
      appEnv: 'local',
      dependencies: createTestDependencies({
        auth: {
          getSession: async () => {
            getSessionCalled = true

            return Response.json({
              session: {
                id: 'session-id',
                token: 'session-token',
                userId: 'usr_1',
                expiresAt: '2026-06-11T00:00:00.000Z',
              },
              user: {
                id: 'usr_1',
                email: 'user@example.test',
                emailVerified: true,
                name: 'Synthetic User',
              },
            })
          },
          ok: async () => Response.json({ ok: true }),
          signInEmail: async () => Response.json({ ok: true }),
          signOut: async () => Response.json({ success: true }),
          signUpEmail: async () => Response.json({ ok: true }),
        },
      }),
      logger: false,
    })

    const response = await app.inject({ method: 'GET', url: '/api/auth/session' })
    const payload = response.json()

    expect(getSessionCalled).toBe(true)
    expect(payload).toEqual({
      authenticated: true,
      session: { expires_at: '2026-06-11T00:00:00.000Z' },
      user: {
        email: 'user@example.test',
        email_verified: true,
        id: 'usr_1',
        name: 'Synthetic User',
      },
    })
    expect(JSON.stringify(payload)).not.toContain('session-token')
    expect(JSON.stringify(payload)).not.toContain('session-id')

    await app.close()
  })
})
