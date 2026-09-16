import ky from 'ky'

import { type PublicRuntimeConfig } from '@/modules/shared/config/env'
import { getRuntimeConfig } from '@/modules/shared/config/runtime-config'

function normalizePrefixUrl(url: string) {
  return url.startsWith('/') ? url.slice(1) : url
}

export function createHttpClient(config: PublicRuntimeConfig = getRuntimeConfig()) {
  return ky.create({
    credentials: 'include',
    prefix: normalizePrefixUrl(config.apiUrl),
  })
}
