import {
  type EstablishmentData,
  type EstablishmentLocation,
  type IssuedDocument,
  type ProcessData,
} from '../types'
import { createIssuedDocuments } from './process-data'
import { type ActiveProcessRecord, type ProcessState } from './process-store'

const PROCESS_ENGINE_STORAGE_KEY = 'sac-nexus:process-engine:v1'

export function loadProcessState(fallback: ProcessState): ProcessState {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const serialized = window.localStorage.getItem(PROCESS_ENGINE_STORAGE_KEY)
    if (!serialized) {
      return fallback
    }

    const parsed = JSON.parse(serialized) as Partial<ProcessState>
    if (
      typeof parsed !== 'object' ||
      !parsed ||
      !parsed.process ||
      !parsed.riskTwo ||
      !Array.isArray(parsed.completedProcesses)
    ) {
      return fallback
    }

    return {
      ...fallback,
      ...parsed,
      actor: fallback.actor,
      establishment: migrateEstablishment(parsed.establishment, fallback.establishment),
      process: migrateProcessData(parsed.process),
      internalWorkflow: parsed.internalWorkflow ?? fallback.internalWorkflow,
      activeProcesses: migrateActiveProcesses(parsed.activeProcesses, fallback.establishment),
      completedProcesses: parsed.completedProcesses.map((record) => {
        const process = migrateProcessData(record.process)
        const issuedDocuments = (record.issuedDocuments ?? []).map(migrateIssuedDocument)

        return {
          ...record,
          establishment: migrateEstablishment(record.establishment, fallback.establishment),
          process,
          issuedDocuments:
            issuedDocuments.length > 0
              ? issuedDocuments
              : createIssuedDocuments(process, record.classification ?? 'risk-1'),
        }
      }),
    }
  } catch {
    return fallback
  }
}

function migrateActiveProcesses(
  records: unknown,
  fallbackEstablishment: EstablishmentData,
): ActiveProcessRecord[] {
  if (!Array.isArray(records)) {
    return []
  }

  return records.flatMap((candidate) => {
    const record = candidate as Partial<ActiveProcessRecord>
    if (
      !record.company ||
      !record.establishment ||
      !record.answers ||
      !record.riskTwo ||
      !record.phase ||
      !record.process ||
      !record.internalWorkflow
    ) {
      return []
    }

    return [
      {
        company: record.company,
        establishment: migrateEstablishment(record.establishment, fallbackEstablishment),
        answers: record.answers,
        declarationAccepted: record.declarationAccepted ?? false,
        riskTwo: record.riskTwo,
        phase: record.phase,
        process: migrateProcessData(record.process),
        internalWorkflow: record.internalWorkflow,
      },
    ]
  })
}

function migrateEstablishment(
  establishment: EstablishmentData | undefined,
  fallback: EstablishmentData,
): EstablishmentData {
  if (!establishment) {
    return fallback
  }

  return {
    ...fallback,
    ...establishment,
    location: migrateEstablishmentLocation(establishment.location),
  }
}

function migrateEstablishmentLocation(
  location: EstablishmentLocation | null | undefined,
): EstablishmentLocation | null {
  if (
    !location ||
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude) ||
    location.latitude < -90 ||
    location.latitude > 90 ||
    location.longitude < -180 ||
    location.longitude > 180 ||
    !['geocoded', 'user-adjusted', 'manual'].includes(location.source) ||
    typeof location.addressFingerprint !== 'string' ||
    typeof location.confirmedAt !== 'string'
  ) {
    return null
  }

  return location
}

function migrateProcessData(process: ProcessData): ProcessData {
  return {
    ...process,
    id: process.id.replace(/^avcb-/, 'process-'),
  }
}

function migrateIssuedDocument(document: IssuedDocument): IssuedDocument {
  if ((document.kind as string) !== 'ddclb') {
    return document
  }

  return {
    ...document,
    kind: 'ddlcb',
  }
}

export function saveProcessState(state: ProcessState) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(PROCESS_ENGINE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // The presentation remains usable in memory when browser storage is unavailable.
  }
}

export function clearProcessState() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(PROCESS_ENGINE_STORAGE_KEY)
  } catch {
    // Resetting the in-memory reducer is still sufficient for the current session.
  }
}

export { PROCESS_ENGINE_STORAGE_KEY }
