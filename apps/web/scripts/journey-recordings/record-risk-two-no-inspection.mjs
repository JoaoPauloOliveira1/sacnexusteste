import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { recordJourney } from './lib/recording-runtime.mjs'
import { recordRiskTwoJourney } from './lib/risk-two-journey.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))

await recordJourney({
  appDirectory: path.resolve(scriptDirectory, '../..'),
  artifactSlug: 'risk-two-no-inspection',
  documentFileNames: ['risk-two-avcb.pdf', 'risk-two-inspection-attestation.pdf'],
  journey: 'risk-two-no-inspection',
  run: (context) => recordRiskTwoJourney({ ...context, requiresInspection: false }),
})
