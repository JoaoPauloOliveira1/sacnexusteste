import { describe, expect, it } from 'vitest'

import { upsertProjection } from '@/modules/shared/lib/upsert-projection'

describe('upsertProjection', () => {
  it('adds a new canonical projection without removing the template record', () => {
    const records = [
      { id: 'process-template', status: 'template' },
      { id: 'process-existing', status: 'existing' },
    ]

    expect(
      upsertProjection(records, { id: 'process-new', status: 'projected' }).map(({ id }) => id),
    ).toEqual(['process-new', 'process-template', 'process-existing'])
  })

  it('replaces only the matching canonical projection', () => {
    const records = [
      { id: 'process-current', status: 'old' },
      { id: 'process-other', status: 'preserved' },
    ]

    expect(upsertProjection(records, { id: 'process-current', status: 'updated' })).toEqual([
      { id: 'process-current', status: 'updated' },
      { id: 'process-other', status: 'preserved' },
    ])
  })
})
