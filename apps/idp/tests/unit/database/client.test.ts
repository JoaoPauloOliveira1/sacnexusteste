import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const db = { mocked: 'db' }
  const end = vi.fn()
  const query = vi.fn()
  const pool = { end, query }
  const Pool = vi.fn(function Pool() {
    return pool
  })
  const drizzle = vi.fn(() => db)

  return { Pool, db, drizzle, end, pool, query }
})

vi.mock('pg', () => ({ Pool: mocks.Pool }))
vi.mock('drizzle-orm/node-postgres', () => ({ drizzle: mocks.drizzle }))

describe('IDP database client', () => {
  beforeEach(() => {
    mocks.Pool.mockClear()
    mocks.drizzle.mockClear()
    mocks.end.mockReset()
    mocks.query.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses short PostgreSQL timeouts when creating the pool', async () => {
    const { createDatabaseClient, databaseReadinessTimeoutMillis } = await import(
      '@/database/client.js'
    )

    createDatabaseClient('postgresql://user:password@example.test/idp')

    expect(mocks.Pool).toHaveBeenCalledWith({
      connectionString: 'postgresql://user:password@example.test/idp',
      connectionTimeoutMillis: databaseReadinessTimeoutMillis,
    })
    expect(mocks.drizzle).toHaveBeenCalledWith(mocks.pool, expect.any(Object))
  })

  it('fails readiness quickly when PostgreSQL does not answer', async () => {
    vi.useFakeTimers()

    const { createDatabaseClient, databaseReadinessTimeoutMillis } = await import(
      '@/database/client.js'
    )
    mocks.query.mockReturnValueOnce(new Promise(() => {}))

    const client = createDatabaseClient('postgresql://user:password@example.test/idp')
    const readiness = client.checkReadiness()
    const readinessExpectation = expect(readiness).rejects.toThrow(
      'Database readiness check timed out',
    )

    expect(mocks.query).toHaveBeenCalledWith('select 1')

    await vi.advanceTimersByTimeAsync(databaseReadinessTimeoutMillis)

    await readinessExpectation
  })
})
