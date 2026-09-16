import { CheckCircle2Icon, TriangleAlertIcon } from 'lucide-react'
import maplibregl, {
  type Map as MapLibreMap,
  type Marker as MapLibreMarker,
  type StyleSpecification,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/modules/shared/components/ui/alert'
import { Button } from '@/modules/shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/shared/components/ui/dialog'

import {
  createAddressFingerprint,
  type EstablishmentAddressInput,
  type EstablishmentCoordinate,
  geocodeEstablishmentAddress,
} from '../lib/geocode-establishment'
import { type EstablishmentLocation } from '../types'

const recifeCenter = {
  latitude: -8.05389,
  longitude: -34.88111,
}

const locationMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

export function EstablishmentLocationDialog({
  address,
  onConfirm,
  onOpenChange,
  open,
  value,
}: {
  address: EstablishmentAddressInput
  onConfirm: (location: EstablishmentLocation) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  value: EstablishmentLocation | null
}) {
  const currentFingerprint = createAddressFingerprint(address)
  const hasCurrentConfirmation =
    value?.addressFingerprint === currentFingerprint && Boolean(value.confirmedAt)
  const [coordinate, setCoordinate] = useState<EstablishmentCoordinate | null>(
    hasCurrentConfirmation && value
      ? {
          latitude: value.latitude,
          longitude: value.longitude,
          source: value.source,
        }
      : null,
  )
  const [geocodingError, setGeocodingError] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const previousFingerprintRef = useRef(currentFingerprint)

  useEffect(() => {
    if (previousFingerprintRef.current === currentFingerprint) {
      return
    }

    previousFingerprintRef.current = currentFingerprint
    setCoordinate(null)
    setGeocodingError('')
  }, [currentFingerprint])

  useEffect(() => {
    if (!open) {
      return
    }

    if (hasCurrentConfirmation && value) {
      setCoordinate({
        latitude: value.latitude,
        longitude: value.longitude,
        source: value.source,
      })
      return
    }

    const controller = new AbortController()
    setIsLocating(true)
    setGeocodingError('')

    void geocodeEstablishmentAddress(address, controller.signal)
      .then((result) => {
        if (!result) {
          setCoordinate(null)
          setGeocodingError(
            'Não encontramos esse endereço automaticamente. Clique no mapa para marcar o local.',
          )
          return
        }

        setCoordinate(result)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setCoordinate(null)
        setGeocodingError(
          'Não foi possível consultar o endereço agora. Você ainda pode marcar o local no mapa.',
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLocating(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [address, hasCurrentConfirmation, open, value])

  function handleConfirm() {
    if (!coordinate) {
      return
    }

    onConfirm({
      ...coordinate,
      addressFingerprint: currentFingerprint,
      confirmedAt: new Date().toISOString(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-5xl"
        data-testid="establishment-location-panel"
      >
        <DialogHeader className="border-border border-b px-5 py-4 pr-12">
          <DialogTitle>Confirme a localização do estabelecimento</DialogTitle>
          <DialogDescription>
            Confira o endereço encontrado e mova o pino até a entrada principal do imóvel.
          </DialogDescription>
        </DialogHeader>

        {geocodingError ? (
          <Alert variant="destructive" className="m-4 mb-0 w-auto">
            <TriangleAlertIcon aria-hidden="true" />
            <AlertTitle>Localização automática indisponível</AlertTitle>
            <AlertDescription>{geocodingError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="relative">
          <LocationMap coordinate={coordinate} onCoordinateChange={setCoordinate} />
          {isLocating ? (
            <div
              className="absolute inset-0 flex items-center justify-center bg-background/80"
              role="status"
            >
              Localizando o endereço…
            </div>
          ) : null}
        </div>

        <DialogFooter className="m-0">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Corrigir endereço
          </DialogClose>
          <Button type="button" disabled={!coordinate || isLocating} onClick={handleConfirm}>
            <CheckCircle2Icon className="size-4" aria-hidden="true" />
            Confirmar e continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LocationMap({
  coordinate,
  onCoordinateChange,
}: {
  coordinate: EstablishmentCoordinate | null
  onCoordinateChange: (coordinate: EstablishmentCoordinate) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<MapLibreMarker | null>(null)
  const initialCoordinateRef = useRef(coordinate)
  const onCoordinateChangeRef = useRef(onCoordinateChange)

  onCoordinateChangeRef.current = onCoordinateChange

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const map = new maplibregl.Map({
      attributionControl: false,
      center: initialCoordinateRef.current
        ? [initialCoordinateRef.current.longitude, initialCoordinateRef.current.latitude]
        : [recifeCenter.longitude, recifeCenter.latitude],
      container: containerRef.current,
      maxZoom: 19,
      pitchWithRotate: false,
      style: locationMapStyle,
      zoom: initialCoordinateRef.current ? 17 : 12,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: 'MapLibre' }),
      'bottom-right',
    )
    map.on('click', (event) => {
      onCoordinateChangeRef.current({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
        source: markerRef.current ? 'user-adjusted' : 'manual',
      })
    })

    return () => {
      markerRef.current?.remove()
      markerRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !coordinate) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }

    if (!markerRef.current) {
      const markerElement = document.createElement('button')
      markerElement.type = 'button'
      markerElement.className =
        'flex size-10 cursor-grab items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:cursor-grabbing'
      markerElement.setAttribute(
        'aria-label',
        'Localização do estabelecimento. Arraste ou use as setas para ajustar.',
      )
      markerElement.innerHTML =
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg>'
      markerElement.addEventListener('keydown', (event) => {
        const offsets: Record<string, [number, number]> = {
          ArrowDown: [0, -0.0001],
          ArrowLeft: [-0.0001, 0],
          ArrowRight: [0.0001, 0],
          ArrowUp: [0, 0.0001],
        }
        const offset = offsets[event.key]
        if (!offset) {
          return
        }

        event.preventDefault()
        const current = markerRef.current?.getLngLat()
        if (!current) {
          return
        }
        onCoordinateChangeRef.current({
          latitude: current.lat + offset[1],
          longitude: current.lng + offset[0],
          source: 'user-adjusted',
        })
      })

      markerRef.current = new maplibregl.Marker({
        draggable: true,
        element: markerElement,
      })
        .setLngLat([coordinate.longitude, coordinate.latitude])
        .addTo(map)
      markerRef.current.on('dragend', () => {
        const next = markerRef.current?.getLngLat()
        if (!next) {
          return
        }
        onCoordinateChangeRef.current({
          latitude: next.lat,
          longitude: next.lng,
          source: 'user-adjusted',
        })
      })
    } else {
      markerRef.current.setLngLat([coordinate.longitude, coordinate.latitude])
    }

    map.flyTo({
      center: [coordinate.longitude, coordinate.latitude],
      essential: true,
      zoom: Math.min(Math.max(map.getZoom(), 17), 19),
    })
  }, [coordinate])

  return (
    <div
      ref={containerRef}
      className="h-72 w-full sm:h-88"
      role="application"
      aria-label="Mapa para confirmar a localização do estabelecimento"
    />
  )
}
