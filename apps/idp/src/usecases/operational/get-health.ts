import { SERVICE_NAME } from '@/config/service.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'
import { type Clock, clock as defaultClock } from '@/usecases/dependencies/clock.js'

type GetHealthDependencies = Readonly<{
  clock: Clock
}>

const defaultDependencies: GetHealthDependencies = {
  clock: defaultClock,
}

export type HealthResponse = {
  status: 'ok'
  service: typeof SERVICE_NAME
  timestamp: string
}

export const getHealth = (
  context: RequestContext,
  dependencies: GetHealthDependencies = defaultDependencies,
): HealthResponse => {
  void context

  return {
    service: SERVICE_NAME,
    status: 'ok',
    timestamp: dependencies.clock().toISOString(),
  }
}
