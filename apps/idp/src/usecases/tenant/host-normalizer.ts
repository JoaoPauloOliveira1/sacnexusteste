const maxDnsLabelLength = 63
const maxDnsHostnameLength = 253
const dnsLabelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
const ipv4LiteralPattern = /^\d{1,3}(?:\.\d{1,3}){3}$/

export function normalizeTenantHost(host: string): string | null {
  let candidate = host.trim()

  if (candidate === '' || hasControlCharacter(candidate) || /\s/.test(candidate)) {
    return null
  }

  if (/[/?#@\\]/.test(candidate) || candidate.includes('*') || candidate.includes('[')) {
    return null
  }

  const colonCount = [...candidate].filter((character) => character === ':').length

  if (colonCount > 1) {
    return null
  }

  if (colonCount === 1) {
    const [hostname, port] = candidate.split(':')

    if (!hostname || !port || !/^\d+$/.test(port)) {
      return null
    }

    const portNumber = Number(port)

    if (!Number.isSafeInteger(portNumber) || portNumber < 1 || portNumber > 65_535) {
      return null
    }

    candidate = hostname
  }

  if (candidate.endsWith('.')) {
    candidate = candidate.slice(0, -1)
  }

  const normalizedHost = candidate.toLowerCase()

  if (
    normalizedHost === 'localhost' ||
    normalizedHost.length > maxDnsHostnameLength ||
    !normalizedHost.includes('.') ||
    ipv4LiteralPattern.test(normalizedHost)
  ) {
    return null
  }

  const labels = normalizedHost.split('.')

  if (
    labels.some(
      (label) =>
        label.length === 0 || label.length > maxDnsLabelLength || !dnsLabelPattern.test(label),
    )
  ) {
    return null
  }

  return normalizedHost
}

function hasControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const charCode = character.charCodeAt(0)

    return charCode <= 31 || charCode === 127
  })
}
