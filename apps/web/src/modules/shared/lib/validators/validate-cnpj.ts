import { getDigits } from './digits'

const CNPJ_LENGTH = 14

function getCnpjDigits(value: string) {
  return getDigits(value)
}

function isValidCnpjShape(value: string) {
  return getCnpjDigits(value).length === CNPJ_LENGTH
}

function calculateCnpjDigit(digits: string, weights: number[]) {
  const total = weights.reduce((sum, weight, index) => sum + Number(digits[index]) * weight, 0)
  const remainder = total % 11

  return remainder < 2 ? 0 : 11 - remainder
}

function isValidCnpj(value: string) {
  const digits = getCnpjDigits(value)

  if (digits.length !== CNPJ_LENGTH || /^(\d)\1+$/.test(digits)) {
    return false
  }

  const firstDigit = calculateCnpjDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondDigit = calculateCnpjDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

  return firstDigit === Number(digits[12]) && secondDigit === Number(digits[13])
}

export { getCnpjDigits, isValidCnpj, isValidCnpjShape }
