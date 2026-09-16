import {
  createAddressFingerprint,
  geocodeEstablishmentAddress,
  isAddressReadyForGeocoding,
} from '../../../../../src/modules/processes/lib/geocode-establishment'

const completeAddress = {
  address: 'Av. Norte, 1500',
  cep: '50000-000',
  city: 'Recife — PE',
  neighborhood: 'Santo Amaro',
}

describe('establishment geocoding', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates a stable normalized fingerprint', () => {
    expect(createAddressFingerprint(completeAddress)).toBe(
      '50000 000|av norte 1500|santo amaro|recife pe',
    )
    expect(
      createAddressFingerprint({
        ...completeAddress,
        address: '  AV. NÓRTE, 1500 ',
      }),
    ).toBe('50000 000|av norte 1500|santo amaro|recife pe')
  })

  it('only enables lookup when the visible address is complete', () => {
    expect(isAddressReadyForGeocoding(completeAddress)).toBe(true)
    expect(isAddressReadyForGeocoding({ ...completeAddress, cep: '5000-000' })).toBe(false)
    expect(isAddressReadyForGeocoding({ ...completeAddress, address: '' })).toBe(false)
  })

  it('parses and caches a successful explicit lookup', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            display_name: 'Avenida Norte, Santo Amaro, Recife, Pernambuco, Brasil',
            lat: '-8.057840',
            lon: '-34.885080',
          },
        ]),
        { status: 200 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(geocodeEstablishmentAddress(completeAddress)).resolves.toEqual({
      displayName: 'Avenida Norte, Santo Amaro, Recife, Pernambuco, Brasil',
      latitude: -8.05784,
      longitude: -34.88508,
      source: 'geocoded',
    })
    await expect(geocodeEstablishmentAddress(completeAddress)).resolves.toMatchObject({
      latitude: -8.05784,
      longitude: -34.88508,
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]).toContain('countrycodes=br')
    expect(fetchMock.mock.calls[0]?.[0]).toContain('format=jsonv2')
  })
})
