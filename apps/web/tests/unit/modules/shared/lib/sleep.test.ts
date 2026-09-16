import { afterEach, describe, expect, it, vi } from 'vitest'

import { sleep } from '@/modules/shared/lib/sleep'

describe('sleep', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves after the given duration', async () => {
    vi.useFakeTimers()

    const promise = sleep(1000)

    vi.advanceTimersByTime(1000)

    await expect(promise).resolves.toBeUndefined()
  })
})
