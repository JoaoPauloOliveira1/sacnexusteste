const brazilianStateValues = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const

type BrazilianState = (typeof brazilianStateValues)[number]

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null
  }

  return date
}

function getMinimumBirthDate() {
  return new Date(1900, 0, 1)
}

function getMaximumBirthDate(referenceDate = new Date()) {
  return new Date(
    referenceDate.getFullYear() - 18,
    referenceDate.getMonth(),
    referenceDate.getDate(),
  )
}

function isAllowedBirthDate(value: string) {
  const date = parseIsoDate(value)

  if (!date) {
    return false
  }

  return date >= getMinimumBirthDate() && date <= getMaximumBirthDate()
}

function isBrazilianState(value: string): value is BrazilianState {
  return brazilianStateValues.includes(value as BrazilianState)
}

export {
  type BrazilianState,
  brazilianStateValues,
  getMaximumBirthDate,
  getMinimumBirthDate,
  isAllowedBirthDate,
  isBrazilianState,
  parseIsoDate,
}
