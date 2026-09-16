// Emits dist/config.json for the static deploy.
//
// The SPA fetches `/config.json` at runtime (see modules/shared/config/
// runtime-config.ts). A Vite static build does not produce it, so on hosts
// like Render we generate it here from the same VITE_* env vars that env.ts
// reads, keeping the two in sync. Run after `vite build`.
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(here, '..', 'dist')

const appEnv = process.env.VITE_APP_ENV ?? 'production'
const enableMsw = /^(1|true)$/i.test(process.env.VITE_ENABLE_MSW ?? '')

const config = {
  apiUrl: process.env.VITE_API_URL ?? '/api',
  authUrl: process.env.VITE_AUTH_URL ?? '/api/auth',
  appName: process.env.VITE_APP_NAME ?? 'SAC Nexus',
  appEnv,
  enableMsw,
  ...(process.env.VITE_GOOGLE_MAPS_API_KEY
    ? { googleMapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY }
    : {}),
}

const target = resolve(distDir, 'config.json')
writeFileSync(target, `${JSON.stringify(config, null, 2)}\n`)
console.log(`Wrote ${target}`, config)
