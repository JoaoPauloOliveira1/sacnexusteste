import { SERVICE_NAME } from '@/config/service.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'
import { type Clock, clock as defaultClock } from '@/usecases/dependencies/clock.js'

type GetReadinessDependencies = Readonly<{
  clock: Clock
  checkDatabase: () => Promise<void>
}>

const defaultDependencies: GetReadinessDependencies = {
  checkDatabase: async () => {},
  clock: defaultClock,
}

type ReadinessCheck = {
  name: 'database'
  status: 'ready' | 'unready'
}

export type ReadinessResponse = {
  status: 'ready' | 'unready'
  service: typeof SERVICE_NAME
  timestamp: string
  checks: ReadinessCheck[]
}

export const getReadiness = async (
  context: RequestContext,
  dependencies: GetReadinessDependencies = defaultDependencies,
): Promise<ReadinessResponse> => {
  void context

  const checks: ReadinessCheck[] = []

  try {
    await dependencies.checkDatabase()
    checks.push({ name: 'database', status: 'ready' })
  } catch {
    checks.push({ name: 'database', status: 'unready' })
  }

  const isReady = checks.every((check) => check.status === 'ready')

  return {
    checks,
    service: SERVICE_NAME,
    status: isReady ? 'ready' : 'unready',
    timestamp: dependencies.clock().toISOString(),
  }
}
