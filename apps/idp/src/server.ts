import { env } from '@/config/env.js'
import { createApp } from '@/entrypoint/app.js'

async function main() {
  const app = createApp()

  // On Render (and most PaaS) the platform injects PORT and requires binding to
  // 0.0.0.0. Locally we keep the configured host/port from the environment.
  const port = process.env.PORT ? Number(process.env.PORT) : env.IDP_PORT
  const host = process.env.PORT ? '0.0.0.0' : env.IDP_HOST

  try {
    await app.listen({ host, port })
  } catch (error) {
    app.log.error(error)
    process.exitCode = 1
  }
}

void main()
