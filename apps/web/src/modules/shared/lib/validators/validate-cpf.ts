import { getDigits } from './digits'

const CPF_LENGTH = 11

function getCpfDigits(value: string) {
  return getDigits(value)
}

function isCpfLike(value: string) {
  return /^[\d.\-\s]+$/.test(value.trim())
}

function isValidCpfShape(value: string) {
  return getCpfDigits(value).length === CPF_LENGTH
}

function calculateCpfDigit(digits: string, factor: number) {
  const total = digits
    .slice(0, factor - 1)
    .split('')
    .reduce((sum, digit, index) => sum + Number(digit) * (factor - index), 0)
  const remainder = (total * 10) % 11

  return remainder === 10 ? 0 : remainder
}

function isValidCpf(value: string) {
  const digits = getCpfDigits(value)

  if (digits.length !== CPF_LENGTH || /^(\d)\1+$/.test(digits)) {
    return false
  }

  const firstDigit = calculateCpfDigit(digits, 10)
  const secondDigit = calculateCpfDigit(digits, 11)

  return firstDigit === Number(digits[9]) && secondDigit === Number(digits[10])
}

export { getCpfDigits, isCpfLike, isValidCpf, isValidCpfShape }
