import { describe, expect, it } from 'vitest'

import { companyRegistrationSchema, demoCompany } from '@/modules/companies'
import {
  breGroups,
  createIssuedDocuments,
  demoEstablishment,
  demoProcess,
  establishmentRegistrationSchema,
  findIssuedDocument,
  getRiskClassification,
  historyEvents,
  initialBreAnswers,
  questionnaireSchema,
} from '@/modules/processes'

describe('process presentation data', () => {
  it('keeps every Figma questionnaire item uniquely identified and initially empty', () => {
    const questionIds = breGroups.flatMap((group) => group.questions.map((question) => question.id))

    expect(questionIds).toHaveLength(3)
    expect(new Set(questionIds).size).toBe(questionIds.length)
    expect(questionnaireSchema.safeParse(initialBreAnswers).success).toBe(false)
    expect(Object.values(initialBreAnswers)).toEqual(['', '', ''])
  })

  it('provides valid company and establishment form defaults', () => {
    expect(companyRegistrationSchema.safeParse(demoCompany).success).toBe(true)
    expect(establishmentRegistrationSchema.safeParse(demoEstablishment).success).toBe(true)
  })

  it('classifies the shared entry only after every answer is complete', () => {
    expect(getRiskClassification(initialBreAnswers)).toBeNull()
    expect(
      getRiskClassification({
        flammables: 'Não',
        areaAboveLimit: 'Não',
        floorsAboveLimit: 'Não',
      }),
    ).toBe('risk-1')
    expect(
      getRiskClassification({
        flammables: 'Não',
        areaAboveLimit: 'Sim',
        floorsAboveLimit: 'Não',
      }),
    ).toBe('risk-2')
  })

  it('provides the complete emitted document identity', () => {
    expect(demoProcess).toMatchObject({
      documentNumber: 'DDLCB nº 2026.00001234',
      processNumber: '2026.00001234',
      protocolNumber: '2026.00001234',
      coscipVersion: 'COSCIP/PE',
    })
    expect(demoProcess.validationHash).not.toHaveLength(0)
  })

  it('contains the three Figma process history events in the required order', () => {
    expect(historyEvents).toHaveLength(3)
    expect(historyEvents[0]?.title).toBe('Solicitação criada')
    expect(historyEvents.at(-1)?.title).toBe('DDLCB emitida automaticamente')
  })

  it('uses explicit final-document kinds for each risk classification', () => {
    expect(createIssuedDocuments(demoProcess, 'risk-1').map(({ kind }) => kind)).toEqual(['ddlcb'])
    expect(createIssuedDocuments(demoProcess, 'risk-2').map(({ kind }) => kind)).toEqual([
      'avcb',
      'inspection-attestation',
    ])
  })

  it('finds every issued document by number, validation hash, process, or protocol', () => {
    const issuedDocuments = createIssuedDocuments(demoProcess, 'risk-2')
    const records = [
      {
        process: demoProcess,
        company: demoCompany,
        establishment: demoEstablishment,
        answers: {
          flammables: 'Sim' as const,
          areaAboveLimit: 'Não' as const,
          floorsAboveLimit: 'Não' as const,
        },
        classification: 'risk-2' as const,
        issuedDocuments,
        history: [],
      },
    ]

    for (const document of issuedDocuments) {
      expect(findIssuedDocument(records, document.number)?.document.kind).toBe(document.kind)
      expect(findIssuedDocument(records, document.validationHash)?.document.kind).toBe(
        document.kind,
      )
    }
    expect(findIssuedDocument(records, demoProcess.processNumber)?.document.kind).toBe('avcb')
    expect(findIssuedDocument(records, demoProcess.protocolNumber)?.document.kind).toBe('avcb')
    expect(findIssuedDocument(records, 'documento inexistente')).toBeNull()
  })
})
