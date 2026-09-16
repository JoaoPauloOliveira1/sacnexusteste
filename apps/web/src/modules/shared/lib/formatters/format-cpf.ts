import { getCpfDigits, isCpfLike } from '../validators/validate-cpf'

const CPF_MAX_LENGTH = 11

function formatCpf(value: string) {
  const digits = getCpfDigits(value).slice(0, CPF_MAX_LENGTH)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatCpfEmailInput(value: string) {
  if (!value) {
    return value
  }

  if (value.includes('@')) {
    const [localPart = '', ...domainParts] = value.split('@')

    if (domainParts.length > 0 && isCpfLike(localPart)) {
      const localDigits = getCpfDigits(localPart)

      if (localDigits.length >= CPF_MAX_LENGTH) {
        return `${localDigits}@${domainParts.join('@')}`
      }
    }

    return value
  }

  if (!isCpfLike(value)) {
    return value
  }

  const digits = getCpfDigits(value)

  if (digits.length < CPF_MAX_LENGTH) {
    return value
  }

  if (digits.length > CPF_MAX_LENGTH) {
    return digits
  }

  return formatCpf(value)
}

export { formatCpf, formatCpfEmailInput }
