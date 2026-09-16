const CNPJ_LENGTH = 14

export function getCnpjDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function checkDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce((total, weight, index) => total + Number(digits[index]) * weight, 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function isValidCnpj(value: string): boolean {
  const digits = getCnpjDigits(value)
  if (digits.length !== CNPJ_LENGTH || /^(\d)\1{13}$/.test(digits)) {
    return false
  }
  const first = checkDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const second = checkDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return first === Number(digits[12]) && second === Number(digits[13])
}
