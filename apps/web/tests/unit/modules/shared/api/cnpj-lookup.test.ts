import { describe, expect, it } from 'vitest'

import { CnpjLookupError, lookupCnpj } from '@/modules/shared/api/cnpj-lookup'

describe('lookupCnpj', () => {
  it('rejects an invalid CNPJ before any network call', async () => {
    await expect(lookupCnpj('123')).rejects.toBeInstanceOf(CnpjLookupError)
    await expect(lookupCnpj('11.111.111/1111-11')).rejects.toMatchObject({ kind: 'invalid' })
  })
})
