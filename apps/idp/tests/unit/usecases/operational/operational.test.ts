import { type FastifyBaseLogger } from 'fastify'
import { describe, expect, it } from 'vitest'

import { createRequestContext } from '@/infra/request-context/request-context.js'
import { getHealth } from '@/usecases/operational/get-health.js'
import { getReadiness } from '@/usecases/operational/get-readiness.js'

function createTestContext() {
  return createRequestContext({
    appEnv: 'local',
    logger: {} as FastifyBaseLogger,
    method: 'GET',
    path: '/health',
    requestId: 'req-1',
  })
}

describe('operational use cases', () => {
  it('returns minimal liveness data', () => {
    const dependencies = {
      clock: () => new Date('2026-05-12T00:00:00.000Z'),
    }

    expect(getHealth(createTestContext(), dependencies)).toEqual({
      service: 'idp',
      status: 'ok',
      timestamp: '2026-05-12T00:00:00.000Z',
    })
  })

  it('returns minimal readiness data with database dependency status', async () => {
    const dependencies = {
      checkDatabase: async () => {},
      clock: () => new Date('2026-05-12T00:00:00.000Z'),
    }

    await expect(getReadiness(createTestContext(), dependencies)).resolves.toEqual({
      checks: [{ name: 'database', status: 'ready' }],
      service: 'idp',
      status: 'ready',
      timestamp: '2026-05-12T00:00:00.000Z',
    })
  })
})
