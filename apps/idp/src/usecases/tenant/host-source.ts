export type TenantHostHeaders = Readonly<Record<string, string | string[] | undefined>>

type HeaderCandidate = { present: false; value: null } | { present: true; value: string | null }

export function selectTenantHostSource(headers: TenantHostHeaders): string | null {
  const forwardedHost = getHeaderCandidate(headers['x-forwarded-host'])

  if (forwardedHost.present) {
    return forwardedHost.value
  }

  return getHeaderCandidate(headers.host).value
}

function getHeaderCandidate(value: string | string[] | undefined): HeaderCandidate {
  if (typeof value === 'undefined') {
    return { present: false, value: null }
  }

  if (Array.isArray(value)) {
    if (value.length !== 1) {
      return { present: true, value: null }
    }

    return normalizeCandidate(value[0] ?? '')
  }

  return normalizeCandidate(value)
}

function normalizeCandidate(value: string): HeaderCandidate {
  if (value.includes(',')) {
    return { present: true, value: null }
  }

  if (value.trim() === '') {
    return { present: true, value: null }
  }

  return { present: true, value }
}
