import { describe, expect, it } from 'vitest'

import { formatBrazilianDate } from '../../../../../../src/modules/shared/lib/formatters/format-brazilian-date'

describe('Brazilian date formatter', () => {
  it('formats numeric input as DD/MM/YYYY', () => {
    expect(formatBrazilianDate('28072026')).toBe('28/07/2026')
  })

  it('formats the value progressively and limits it to eight digits', () => {
    expect(formatBrazilianDate('2')).toBe('2')
    expect(formatBrazilianDate('2807')).toBe('28/07')
    expect(formatBrazilianDate('2807202612')).toBe('28/07/2026')
  })
})
