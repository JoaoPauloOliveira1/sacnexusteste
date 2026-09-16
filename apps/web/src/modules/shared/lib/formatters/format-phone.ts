import { getDigits } from '../validators/digits'

const PHONE_MAX_LENGTH = 11

function formatPhone(value: string) {
  const digits = getDigits(value).slice(0, PHONE_MAX_LENGTH)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function isValidBrazilianPhoneShape(value: string) {
  const digits = getDigits(value)

  return digits.length === 10 || digits.length === 11
}

export { formatPhone, isValidBrazilianPhoneShape }
