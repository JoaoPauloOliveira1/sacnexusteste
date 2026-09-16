import { describe, expect, it } from 'vitest'

import {
  createIssuedDocuments,
  initialProcessState,
  type ProcessState,
  processReducer,
} from '@/modules/processes'

describe('process in-memory reducer', () => {
  it('moves through the successful automatic issuance lifecycle', () => {
    let state = processReducer(initialProcessState, { type: 'start-request' })
    state = processReducer(state, { type: 'confirm-request' })
    state = processReducer(state, {
      type: 'save-establishment',
      establishment: state.establishment,
    })
    state = processReducer(state, {
      type: 'save-answers',
      answers: {
        flammables: 'Não',
        areaAboveLimit: 'Não',
        floorsAboveLimit: 'Não',
      },
    })
    state = processReducer(state, { type: 'start-classification-analysis' })
    expect(state.phase).toBe('classification-analyzing')
    state = processReducer(state, { type: 'classify' })
    state = processReducer(state, { type: 'accept-declaration', accepted: true })
    state = processReducer(state, { type: 'start-processing' })
    state = processReducer(state, { type: 'complete-process' })

    expect(state.phase).toBe('completed')
    expect(state.declarationAccepted).toBe(true)
    expect(state.completedProcesses).toHaveLength(1)
    expect(state.completedProcesses[0]?.issuedDocuments.map(({ kind }) => kind)).toEqual(['ddlcb'])
  })

  it('starts every new request empty and retains previously completed processes', () => {
    const completedState = {
      ...initialProcessState,
      phase: 'completed' as const,
      completedProcesses: [
        {
          process: initialProcessState.process,
          company: initialProcessState.company,
          establishment: {
            ...initialProcessState.establishment,
            address: 'Av. Norte',
          },
          answers: {
            flammables: 'Não' as const,
            areaAboveLimit: 'Não' as const,
            floorsAboveLimit: 'Não' as const,
          },
          issuedDocuments: createIssuedDocuments(initialProcessState.process, 'risk-1'),
          history: [],
        },
      ],
    }

    const nextState = processReducer(completedState, { type: 'start-request' })

    expect(nextState.completedProcesses).toHaveLength(1)
    expect(nextState.company.id).toBe('')
    expect(nextState.establishment.address).toBe('')
    expect(Object.values(nextState.answers)).toEqual(['', '', ''])
    expect(nextState.process.processNumber).toBe('2026.00001235')
  })

  it('does not start processing before the responsible declaration is accepted', () => {
    const classifiedState = {
      ...initialProcessState,
      phase: 'classified' as const,
    }

    expect(processReducer(classifiedState, { type: 'start-processing' })).toBe(classifiedState)
  })

  it('does not start classification analysis with incomplete answers', () => {
    expect(processReducer(initialProcessState, { type: 'start-classification-analysis' })).toBe(
      initialProcessState,
    )
  })

  it('archives an active request while another company starts a new one', () => {
    let state = processReducer(initialProcessState, { type: 'start-request' })
    state = processReducer(state, {
      type: 'save-company',
      company: {
        ...state.company,
        id: 'company-first',
        cnpj: '12.345.678/0001-90',
        legalName: 'Primeira Empresa LTDA',
      },
    })
    const firstProcessId = state.process.id

    state = processReducer(state, { type: 'start-request' })
    expect(state.activeProcesses).toHaveLength(1)
    expect(state.activeProcesses[0]?.company.id).toBe('company-first')
    expect(state.company.id).toBe('')
    expect(state.process.id).not.toBe(firstProcessId)

    state = processReducer(state, {
      type: 'save-company',
      company: {
        ...state.company,
        id: 'company-second',
        cnpj: '98.765.432/0001-10',
        legalName: 'Segunda Empresa LTDA',
      },
    })
    state = processReducer(state, { type: 'resume-request', processId: firstProcessId })

    expect(state.company.id).toBe('company-first')
    expect(state.activeProcesses).toHaveLength(1)
    expect(state.activeProcesses[0]?.company.id).toBe('company-second')
  })

  it('completes the Risco 2 lifecycle without inspection when validation does not require it', () => {
    let state: ProcessState = {
      ...initialProcessState,
      phase: 'classified' as const,
      answers: {
        flammables: 'Não' as const,
        areaAboveLimit: 'Sim' as const,
        floorsAboveLimit: 'Não' as const,
      },
    }

    state = processReducer(state, {
      type: 'save-risk-two-responsible',
      responsible: {
        cpf: '123.456.789-00',
        phone: '(81) 99999-0000',
        relationship: 'legal-representative',
        role: 'Administrador',
      },
    })
    state = processReducer(state, {
      type: 'save-risk-two-declaration',
      declaration: {
        responsibilitiesAccepted: true,
        informationConfirmed: true,
        signatureMethod: 'gov-br',
      },
    })
    for (const documentId of [
      'identification',
      'cnpj-registration',
      'extinguisher-invoice',
    ] as const) {
      state = processReducer(state, {
        type: 'save-risk-two-document',
        documentId,
        file: { name: `${documentId}.pdf`, size: 1000, type: 'application/pdf' },
      })
    }
    state = processReducer(state, { type: 'complete-risk-two-documents' })
    state = processReducer(state, { type: 'confirm-risk-two-payment', method: 'pix' })
    state = processReducer(state, { type: 'confirm-risk-two-review', confirmed: true })
    state = processReducer(state, { type: 'protocol-risk-two' })
    state = processReducer(state, { type: 'advance-risk-two-validation' })
    state = processReducer(state, {
      type: 'respond-risk-two-requirement',
      response: 'Encaminho uma nova cópia legível do documento.',
      file: { name: 'identificacao.pdf', size: 1000, type: 'application/pdf' },
    })
    state = processReducer(state, { type: 'advance-risk-two-validation' })

    expect(state.phase).toBe('completed')
    expect(state.riskTwo.inspection.required).toBe(false)
    expect(state.completedProcesses).toHaveLength(1)
    expect(state.completedProcesses[0]?.classification).toBe('risk-2')
    expect(state.completedProcesses[0]?.issuedDocuments.map(({ kind }) => kind)).toEqual([
      'avcb',
      'inspection-attestation',
    ])
  })

  it('shares internal workflow transitions with the contributor aggregate', () => {
    let state: ProcessState = {
      ...initialProcessState,
      phase: 'risk-two-protocolled',
      answers: {
        flammables: 'Sim',
        areaAboveLimit: 'Não',
        floorsAboveLimit: 'Não',
      },
      internalWorkflow: {
        stage: 'administrative-triage',
        statusLabel: 'Aguardando triagem administrativa',
        history: [],
      },
    }

    state = processReducer(state, {
      type: 'record-internal-transition',
      transition: 'triage-approved',
    })
    expect(state.internalWorkflow.stage).toBe('technical-analysis')

    state = processReducer(state, {
      type: 'record-internal-transition',
      transition: 'analysis-inspection-required',
      description: 'A carga de incêndio exige verificação presencial.',
    })
    expect(state.phase).toBe('risk-two-inspection-required')
    expect(state.internalWorkflow.stage).toBe('inspection')

    state = processReducer(state, {
      type: 'record-internal-transition',
      transition: 'inspection-approved',
    })
    expect(state.phase).toBe('completed')
    expect(state.internalWorkflow.stage).toBe('completed')
    expect(state.completedProcesses[0]?.issuedDocuments).toHaveLength(2)
    expect(
      state.completedProcesses[0]?.history.some(
        ({ description }) => description === 'A carga de incêndio exige verificação presencial.',
      ),
    ).toBe(true)
    expect(
      state.completedProcesses[0]?.history.some(
        ({ title }) => title === 'Exigência documental atendida',
      ),
    ).toBe(false)
  })

  it('requires and completes an inspection for the inflammable-material fixture', () => {
    let state: ProcessState = {
      ...initialProcessState,
      phase: 'risk-two-reanalyzing' as const,
      answers: {
        flammables: 'Sim' as const,
        areaAboveLimit: 'Não' as const,
        floorsAboveLimit: 'Não' as const,
      },
      riskTwo: {
        ...initialProcessState.riskTwo,
        requirement: {
          id: 'requirement-001',
          title: 'Documento ilegível',
          description: 'Envie uma nova cópia.',
          deadline: '10/08/2026',
          status: 'responded' as const,
          response: 'Documento corrigido.',
        },
      },
    }

    state = processReducer(state, { type: 'advance-risk-two-validation' })
    expect(state.phase).toBe('risk-two-inspection-required')

    state = processReducer(state, {
      type: 'schedule-risk-two-inspection',
      scheduledAt: '04/08/2026 · 08:00 às 10:00',
    })
    expect(state.phase).toBe('risk-two-inspection-scheduled')

    state = processReducer(state, { type: 'complete-risk-two-inspection' })
    expect(state.phase).toBe('completed')
    expect(state.riskTwo.inspection.status).toBe('approved')
    expect(
      state.completedProcesses[0]?.history.some(({ title }) => title === 'Vistoria aprovada'),
    ).toBe(true)
  })

  it('covers editable request data and classification guards', () => {
    const actor = { ...initialProcessState.actor, name: 'Maria da Silva' }
    let state = processReducer(initialProcessState, { type: 'set-actor', actor })
    expect(state.actor).toBe(actor)

    state = processReducer(state, { type: 'confirm-request' })
    state = processReducer(state, {
      type: 'save-company',
      company: { ...state.company, id: 'company-1', legalName: 'Empresa Teste LTDA' },
    })
    state = processReducer(state, {
      type: 'save-establishment',
      establishment: { ...state.establishment, name: 'Unidade Teste' },
    })
    state = processReducer(state, {
      type: 'answer',
      questionId: 'flammables',
      answer: 'Não',
    })
    expect(state.answers.flammables).toBe('Não')
    expect(state.declarationAccepted).toBe(false)
    expect(processReducer(state, { type: 'classify' })).toBe(state)

    state = processReducer(state, {
      type: 'save-answers',
      answers: {
        flammables: 'Não',
        areaAboveLimit: 'Não',
        floorsAboveLimit: 'Não',
      },
    })
    state = processReducer(state, { type: 'classify' })
    expect(state.phase).toBe('classified')
    state = processReducer(state, { type: 'accept-declaration', accepted: false })
    expect(state.phase).toBe('classified')
  })

  it('validates the Risco 2 responsible, declaration, documents, payment, and protocol', () => {
    const riskOneState: ProcessState = {
      ...initialProcessState,
      answers: {
        flammables: 'Não',
        areaAboveLimit: 'Não',
        floorsAboveLimit: 'Não',
      },
    }
    expect(
      processReducer(riskOneState, {
        type: 'save-risk-two-responsible',
        responsible: {
          cpf: '123.456.789-00',
          phone: '(81) 99999-0000',
          relationship: 'owner',
          role: 'Sócio',
        },
      }),
    ).toBe(riskOneState)

    let state: ProcessState = {
      ...initialProcessState,
      answers: {
        flammables: 'Sim',
        areaAboveLimit: 'Não',
        floorsAboveLimit: 'Não',
      },
    }
    state = processReducer(state, {
      type: 'save-risk-two-responsible',
      responsible: {
        cpf: '123.456.789-00',
        phone: '(81) 99999-0000',
        relationship: 'owner',
        role: 'Sócio',
      },
    })
    expect(state.phase).toBe('risk-two-responsible-completed')

    for (const declaration of [
      {
        responsibilitiesAccepted: false,
        informationConfirmed: true,
        signatureMethod: 'gov-br' as const,
      },
      {
        responsibilitiesAccepted: true,
        informationConfirmed: false,
        signatureMethod: 'gov-br' as const,
      },
      {
        responsibilitiesAccepted: true,
        informationConfirmed: true,
        signatureMethod: '' as const,
      },
    ]) {
      expect(
        processReducer(state, {
          type: 'save-risk-two-declaration',
          declaration,
        }),
      ).toBe(state)
    }

    state = processReducer(state, {
      type: 'save-risk-two-declaration',
      declaration: {
        responsibilitiesAccepted: true,
        informationConfirmed: true,
        signatureMethod: 'gov-br',
      },
    })
    expect(
      state.riskTwo.documents.find(({ id }) => id === 'responsibility-declaration')?.status,
    ).toBe('generated')
    expect(
      processReducer(state, {
        type: 'remove-risk-two-document',
        documentId: 'responsibility-declaration',
      }),
    ).toBe(state)
    expect(processReducer(state, { type: 'complete-risk-two-documents' })).toBe(state)

    for (const documentId of [
      'identification',
      'cnpj-registration',
      'extinguisher-invoice',
    ] as const) {
      state = processReducer(state, {
        type: 'save-risk-two-document',
        documentId,
        file: { name: `${documentId}.pdf`, size: 1000, type: 'application/pdf' },
      })
    }
    state = processReducer(state, {
      type: 'remove-risk-two-document',
      documentId: 'extinguisher-invoice',
    })
    expect(state.riskTwo.documents.find(({ id }) => id === 'extinguisher-invoice')?.status).toBe(
      'pending',
    )
    state = processReducer(state, {
      type: 'save-risk-two-document',
      documentId: 'extinguisher-invoice',
      file: { name: 'extintores.pdf', size: 1000, type: 'application/pdf' },
    })
    state = processReducer(state, { type: 'complete-risk-two-documents' })
    expect(state.phase).toBe('risk-two-documents-completed')

    expect(processReducer(state, { type: 'confirm-risk-two-payment', method: '' })).toBe(state)
    state = processReducer(state, { type: 'confirm-risk-two-payment', method: 'boleto' })
    state = processReducer(state, { type: 'confirm-risk-two-review', confirmed: false })
    expect(processReducer(state, { type: 'protocol-risk-two' })).toBe(state)
    state = processReducer(state, { type: 'confirm-risk-two-review', confirmed: true })
    state = processReducer(state, { type: 'protocol-risk-two' })
    expect(state.phase).toBe('risk-two-protocolled')
    expect(state.process.protocolNumber).toContain('SAC-')
  })

  it('routes contributor requirement responses back to every internal origin', () => {
    const baseRequirement = {
      id: 'requirement-origin',
      title: 'Correção necessária',
      description: 'Envie o arquivo corrigido.',
      deadline: '10/08/2026',
      status: 'pending' as const,
      response: '',
    }
    const baseState: ProcessState = {
      ...initialProcessState,
      phase: 'risk-two-requirement',
      riskTwo: {
        ...initialProcessState.riskTwo,
        requirement: baseRequirement,
      },
    }

    expect(
      processReducer(
        { ...baseState, riskTwo: { ...baseState.riskTwo, requirement: undefined } },
        { type: 'respond-risk-two-requirement', response: 'Resposta' },
      ),
    ).toEqual({
      ...baseState,
      riskTwo: { ...baseState.riskTwo, requirement: undefined },
    })
    expect(
      processReducer(baseState, { type: 'respond-risk-two-requirement', response: '   ' }),
    ).toBe(baseState)

    for (const [originStage, statusLabel] of [
      ['administrative-triage', 'Correções recebidas'],
      ['technical-analysis', 'Correção técnica recebida'],
      ['inspection', 'Correção de vistoria recebida'],
    ] as const) {
      const state = processReducer(
        {
          ...baseState,
          riskTwo: {
            ...baseState.riskTwo,
            requirement: { ...baseRequirement, originStage },
          },
        },
        {
          type: 'respond-risk-two-requirement',
          response: ' Documento corrigido. ',
          file: { name: 'correcao.pdf', size: 2000, type: 'application/pdf' },
        },
      )
      expect(state.phase).toBe('risk-two-protocolled')
      expect(state.internalWorkflow.stage).toBe(originStage)
      expect(state.internalWorkflow.statusLabel).toBe(statusLabel)
      expect(state.riskTwo.requirement?.attachment?.fileName).toBe('correcao.pdf')
    }

    const legacyResponse = processReducer(baseState, {
      type: 'respond-risk-two-requirement',
      response: 'Resposta sem anexo',
    })
    expect(legacyResponse.phase).toBe('risk-two-reanalyzing')
    expect(legacyResponse.riskTwo.requirement?.attachment).toBeUndefined()
  })

  it('covers validation, inspection, and internal workflow transition guards', () => {
    const protocolled: ProcessState = {
      ...initialProcessState,
      phase: 'risk-two-protocolled',
      answers: {
        flammables: 'Não',
        areaAboveLimit: 'Sim',
        floorsAboveLimit: 'Não',
      },
    }
    const withRequirement = processReducer(protocolled, { type: 'advance-risk-two-validation' })
    expect(withRequirement.phase).toBe('risk-two-requirement')
    expect(processReducer(withRequirement, { type: 'advance-risk-two-validation' })).toBe(
      withRequirement,
    )

    const unresponded: ProcessState = {
      ...withRequirement,
      phase: 'risk-two-reanalyzing',
    }
    expect(processReducer(unresponded, { type: 'advance-risk-two-validation' })).toBe(unresponded)
    expect(
      processReducer(initialProcessState, {
        type: 'schedule-risk-two-inspection',
        scheduledAt: '',
      }),
    ).toBe(initialProcessState)
    expect(
      processReducer(
        { ...initialProcessState, phase: 'risk-two-inspection-required' },
        { type: 'schedule-risk-two-inspection', scheduledAt: '' },
      ),
    ).toEqual({ ...initialProcessState, phase: 'risk-two-inspection-required' })
    expect(processReducer(initialProcessState, { type: 'complete-risk-two-inspection' })).toBe(
      initialProcessState,
    )

    let state = protocolled
    for (const transition of [
      'triage-started',
      'triage-correction-received',
      'triage-approved',
      'analysis-started',
      'analysis-correction-received',
      'inspection-started',
      'inspection-correction-received',
    ] as const) {
      state = processReducer(state, { type: 'record-internal-transition', transition })
    }
    expect(state.internalWorkflow.history).toHaveLength(7)

    for (const transition of [
      'triage-requirement-issued',
      'analysis-requirement-issued',
      'inspection-requirement-issued',
    ] as const) {
      state = processReducer(state, { type: 'record-internal-transition', transition })
      expect(state.phase).toBe('risk-two-requirement')
      expect(state.riskTwo.requirement?.description).not.toBe('')
    }
  })

  it('does not duplicate completed process records', () => {
    const processing: ProcessState = {
      ...initialProcessState,
      declarationAccepted: true,
      phase: 'processing',
    }
    const completed = processReducer(processing, { type: 'complete-process' })
    const duplicate = processReducer(
      { ...completed, phase: 'processing' },
      { type: 'complete-process' },
    )

    expect(duplicate.completedProcesses).toHaveLength(1)
  })

  it('returns to an ephemeral initial state when reset', () => {
    const completedState = {
      ...initialProcessState,
      declarationAccepted: true,
      phase: 'completed' as const,
    }

    const resetState = processReducer(completedState, { type: 'reset' })

    expect(resetState.phase).toBe('idle')
    expect(resetState.completedProcesses).toEqual([])
    expect(resetState.actor).toBe(completedState.actor)
    expect(resetState.company.id).toBe('')
    expect(resetState.company.legalName).toBe('')
  })
})
