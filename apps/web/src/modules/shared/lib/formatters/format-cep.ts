import { getDigits } from '../validators/digits'

const CEP_MAX_LENGTH = 8

function formatCep(value: string) {
  const digits = getDigits(value).slice(0, CEP_MAX_LENGTH)

  if (digits.length <= 5) {
    return digits
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export { formatCep }
