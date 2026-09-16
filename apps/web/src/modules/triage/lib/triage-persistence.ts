import { type TriageProcess } from '../types'
import { initialTriageProcesses } from './triage-data'

const STORAGE_KEY = 'sac-nexus:triage-presentation:v2'

interface StoredTriageState {
  version: 2
  processes: TriageProcess[]
}

function cloneInitialProcesses() {
  return structuredClone(initialTriageProcesses) as TriageProcess[]
}

export function loadTriageProcesses() {
  if (typeof window === 'undefined') {
    return cloneInitialProcesses()
  }

  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY)
    if (!rawState) {
      return cloneInitialProcesses()
    }

    const state = JSON.parse(rawState) as Partial<StoredTriageState>
    if (state.version !== 2 || !Array.isArray(state.processes)) {
      return cloneInitialProcesses()
    }

    return state.processes
  } catch {
    return cloneInitialProcesses()
  }
}

export function saveTriageProcesses(processes: readonly TriageProcess[]) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const state: StoredTriageState = { version: 2, processes: [...processes] }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // The presentation remains usable in memory when storage is unavailable.
  }
}
