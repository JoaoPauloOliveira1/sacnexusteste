import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { recordJourney } from './lib/recording-runtime.mjs'
import { recordRiskTwoJourney } from './lib/risk-two-journey.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))

await recordJourney({
  appDirectory: path.resolve(scriptDirectory, '../..'),
  artifactSlug: 'risk-two-document-requirement',
  documentFileNames: ['risk-two-avcb.pdf', 'risk-two-inspection-attestation.pdf'],
  journey: 'risk-two-document-requirement',
  run: (context) =>
    recordRiskTwoJourney({
      ...context,
      requirement: true,
      requiresInspection: false,
    }),
})
