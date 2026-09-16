import { z } from 'zod'

import { type EstablishmentLocationSource } from '../types'

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const MINIMUM_REQUEST_INTERVAL_MS = 1_000

const geocodingResultSchema = z.array(
  z.object({
    display_name: z.string(),
    lat: z.coerce.number().min(-90).max(90),
    lon: z.coerce.number().min(-180).max(180),
  }),
)

export interface EstablishmentAddressInput {
  cep: string
  address: string
  neighborhood: string
  city: string
}

export interface EstablishmentCoordinate {
  latitude: number
  longitude: number
  source: EstablishmentLocationSource
}

export interface EstablishmentGeocodingResult extends EstablishmentCoordinate {
  displayName: string
}

const resultCache = new Map<string, EstablishmentGeocodingResult>()
let lastRequestAt = 0

export function createAddressFingerprint(address: EstablishmentAddressInput) {
  return [address.cep, address.address, address.neighborhood, address.city]
    .map((part) =>
      part
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
        .trim()
        .toLowerCase(),
    )
    .join('|')
}

export function isAddressReadyForGeocoding(address: EstablishmentAddressInput) {
  return (
    /^\d{5}-\d{3}$/.test(address.cep.trim()) &&
    address.address.trim().length >= 3 &&
    address.neighborhood.trim().length >= 2 &&
    address.city.trim().length >= 2
  )
}

export async function geocodeEstablishmentAddress(
  address: EstablishmentAddressInput,
  signal?: AbortSignal,
): Promise<EstablishmentGeocodingResult | null> {
  const fingerprint = createAddressFingerprint(address)
  const cached = resultCache.get(fingerprint)

  if (cached) {
    return cached
  }

  const elapsed = Date.now() - lastRequestAt
  if (elapsed < MINIMUM_REQUEST_INTERVAL_MS) {
    await wait(MINIMUM_REQUEST_INTERVAL_MS - elapsed, signal)
  }

  const parameters = new URLSearchParams({
    addressdetails: '0',
    countrycodes: 'br',
    format: 'jsonv2',
    limit: '1',
    q: `${address.address}, ${address.neighborhood}, ${address.city}, Pernambuco, ${address.cep}, Brasil`,
  })

  lastRequestAt = Date.now()
  const response = await fetch(`${NOMINATIM_SEARCH_URL}?${parameters.toString()}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'pt-BR',
    },
    signal: signal ?? null,
  })

  if (!response.ok) {
    throw new Error('Geocoding request failed')
  }

  const [result] = geocodingResultSchema.parse(await response.json())
  if (!result) {
    return null
  }

  const geocoded = {
    displayName: result.display_name,
    latitude: result.lat,
    longitude: result.lon,
    source: 'geocoded' as const,
  }
  resultCache.set(fingerprint, geocoded)

  return geocoded
}

function wait(duration: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, duration)

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeout)
        reject(new DOMException('The operation was aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

export { NOMINATIM_SEARCH_URL }
