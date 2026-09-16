import { type TechnicalAnalysisProcess } from '../types'
import { initialAnalysisProcesses } from './analysis-data'

const STORAGE_KEY = 'sac-nexus:technical-analysis-presentation:v1'

interface StoredAnalysisState {
  version: 1
  processes: TechnicalAnalysisProcess[]
}

function cloneInitialProcesses() {
  return structuredClone(initialAnalysisProcesses) as TechnicalAnalysisProcess[]
}

export function loadAnalysisProcesses() {
  if (typeof window === 'undefined') {
    return cloneInitialProcesses()
  }

  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY)
    if (!rawState) {
      return cloneInitialProcesses()
    }

    const state = JSON.parse(rawState) as Partial<StoredAnalysisState>
    return state.version === 1 && Array.isArray(state.processes)
      ? state.processes
      : cloneInitialProcesses()
  } catch {
    return cloneInitialProcesses()
  }
}

export function saveAnalysisProcesses(processes: readonly TechnicalAnalysisProcess[]) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const state: StoredAnalysisState = { version: 1, processes: [...processes] }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // The presentation remains usable in memory when persistence is unavailable.
  }
}
