import { getDigits } from '../validators/digits'

const BRAZILIAN_DATE_MAX_LENGTH = 8

function formatBrazilianDate(value: string) {
  const digits = getDigits(value).slice(0, BRAZILIAN_DATE_MAX_LENGTH)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export { formatBrazilianDate }
