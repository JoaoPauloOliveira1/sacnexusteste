import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EstablishmentLocationDialog } from '../../../../../src/modules/processes/components/establishment-location-picker'

const geocodeEstablishmentAddressMock = vi.hoisted(() => vi.fn())
const mapLibreMock = vi.hoisted(() => {
  let clickHandler: ((event: { lngLat: { lat: number; lng: number } }) => void) | undefined

  class MapMock {
    addControl = vi.fn()
    flyTo = vi.fn()
    getZoom = vi.fn(() => 12)
    on = vi.fn(
      (event: string, handler: (event: { lngLat: { lat: number; lng: number } }) => void) => {
        if (event === 'click') {
          clickHandler = handler
        }
      },
    )
    remove = vi.fn()
  }

  class Marker {
    private coordinate = { lat: -8.05, lng: -34.88 }

    addTo = vi.fn(() => this)
    getLngLat = vi.fn(() => this.coordinate)
    on = vi.fn(() => this)
    remove = vi.fn()
    setLngLat = vi.fn(([longitude, latitude]: [number, number]) => {
      this.coordinate = { lat: latitude, lng: longitude }
      return this
    })
  }

  return {
    AttributionControl: class {},
    Map: MapMock,
    Marker,
    NavigationControl: class {},
    clickAt(latitude: number, longitude: number) {
      clickHandler?.({ lngLat: { lat: latitude, lng: longitude } })
    },
    reset() {
      clickHandler = undefined
    },
  }
})

vi.mock('@/modules/processes/lib/geocode-establishment', async () => {
  const actual = await vi.importActual<
    typeof import('@/modules/processes/lib/geocode-establishment')
  >('@/modules/processes/lib/geocode-establishment')

  return {
    ...actual,
    geocodeEstablishmentAddress: geocodeEstablishmentAddressMock,
  }
})

vi.mock('maplibre-gl', () => ({
  default: {
    AttributionControl: mapLibreMock.AttributionControl,
    Map: mapLibreMock.Map,
    Marker: mapLibreMock.Marker,
    NavigationControl: mapLibreMock.NavigationControl,
  },
}))

const address = {
  address: 'Av. Norte, 1500',
  cep: '50000-000',
  city: 'Recife — PE',
  neighborhood: 'Santo Amaro',
}

describe('EstablishmentLocationDialog', () => {
  afterEach(() => {
    geocodeEstablishmentAddressMock.mockReset()
    mapLibreMock.reset()
  })

  it('confirms a location without rendering the removed explanatory block', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    geocodeEstablishmentAddressMock.mockResolvedValue({
      displayName: 'Avenida Norte, Santo Amaro, Recife, Pernambuco, Brasil',
      latitude: -8.05784,
      longitude: -34.88508,
      source: 'geocoded',
    })

    render(
      <EstablishmentLocationDialog
        address={address}
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
        open
        value={null}
      />,
    )

    expect(screen.queryByText('Confira a posição do pino')).not.toBeInTheDocument()
    expect(screen.queryByText(/Busca de endereço e mapa/)).not.toBeInTheDocument()

    const confirmButton = screen.getByRole('button', { name: 'Confirmar e continuar' })
    await waitFor(() => expect(confirmButton).toBeEnabled())
    await user.click(confirmButton)

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        addressFingerprint: '50000 000|av norte 1500|santo amaro|recife pe',
        latitude: -8.05784,
        longitude: -34.88508,
        source: 'geocoded',
      }),
    )
  })

  it('requires the user to mark the map when geocoding finds no result', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    geocodeEstablishmentAddressMock.mockResolvedValue(null)

    render(
      <EstablishmentLocationDialog
        address={address}
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
        open
        value={null}
      />,
    )

    const confirmButton = screen.getByRole('button', { name: 'Confirmar e continuar' })
    await screen.findByText('Localização automática indisponível')
    expect(confirmButton).toBeDisabled()

    act(() => mapLibreMock.clickAt(-8.061, -34.889))
    expect(confirmButton).toBeEnabled()
    await user.click(confirmButton)

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: -8.061,
        longitude: -34.889,
        source: 'manual',
      }),
    )
  })

  it('reuses a location already confirmed for the same address', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <EstablishmentLocationDialog
        address={address}
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
        open
        value={{
          addressFingerprint: '50000 000|av norte 1500|santo amaro|recife pe',
          confirmedAt: '2026-07-29T12:00:00.000Z',
          latitude: -8.05784,
          longitude: -34.88508,
          source: 'user-adjusted',
        }}
      />,
    )

    expect(geocodeEstablishmentAddressMock).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Confirmar e continuar' }))
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: -8.05784,
        longitude: -34.88508,
        source: 'user-adjusted',
      }),
    )
  })
})
