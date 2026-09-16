import { readFileSync } from 'node:fs'
import { sql } from 'drizzle-orm'
import { parseDatabaseEnv } from '@/config/env.js'
import { createDatabaseClient } from '@/database/client.js'
import { type CbmpeNivel, cnae, type NivelDeRisco, type RiscoBand } from '@/database/schema.js'

/**
 * Seeds the CNAE risk-classification reference table from the consolidated
 * Decreto 61.082/2026 table (the vigente decree). Idempotent: re-running
 * upserts by (decreto, codigo).
 *
 * Run: pnpm --filter idp seed:cnae
 */

const DECRETO = '61.082/2026'
const CHUNK_SIZE = 500

type CnaeSeedRow = {
  codigo: string
  numerico: string
  secao: string
  secaoDescricao: string
  atividade: string
  cbmpeNivel: CbmpeNivel
  nivelDeRisco: NivelDeRisco
  anexo: string
  dispensaLicenciamentoPrevio: boolean
  preliminaryBand: RiscoBand
  paginaDoe: string | null
  alteradoPorErrata: boolean
}

/** References the value proposed for insert (Postgres `excluded.*`) in an upsert. */
const excluded = (column: string) => sql.raw(`excluded.${column}`)

const seedUrl = new URL('../database/seed-data/cnae-decreto-61082-2026.json', import.meta.url)
const rows = JSON.parse(readFileSync(seedUrl, 'utf-8')) as CnaeSeedRow[]

const env = parseDatabaseEnv()
const database = createDatabaseClient(env.DATABASE_URL)

try {
  let written = 0

  for (let start = 0; start < rows.length; start += CHUNK_SIZE) {
    const chunk = rows.slice(start, start + CHUNK_SIZE)

    await database.db
      .insert(cnae)
      .values(chunk.map((row) => ({ decreto: DECRETO, ...row })))
      .onConflictDoUpdate({
        target: [cnae.decreto, cnae.codigo],
        set: {
          numerico: excluded('numerico'),
          secao: excluded('secao'),
          secaoDescricao: excluded('secao_descricao'),
          atividade: excluded('atividade'),
          cbmpeNivel: excluded('cbmpe_nivel'),
          nivelDeRisco: excluded('nivel_de_risco'),
          anexo: excluded('anexo'),
          dispensaLicenciamentoPrevio: excluded('dispensa_licenciamento_previo'),
          preliminaryBand: excluded('preliminary_band'),
          paginaDoe: excluded('pagina_doe'),
          alteradoPorErrata: excluded('alterado_por_errata'),
        },
      })

    written += chunk.length
  }

  process.stdout.write(`Seeded ${written} CNAE rows (Decreto ${DECRETO}).\n`)
} finally {
  await database.close()
}
