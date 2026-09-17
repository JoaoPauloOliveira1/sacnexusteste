import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  MapIcon,
  SearchIcon,
  ShieldAlertIcon,
} from 'lucide-react'
import maplibregl, {
  type CircleLayerSpecification,
  type GeoJSONSource,
  type Map as MapLibreMap,
  type StyleSpecification,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef, useState } from 'react'

import { geocodeEstablishmentAddress, isAddressReadyForGeocoding } from '@/modules/processes'
import { listTriagem, type TriagemProcessoItem } from '@/modules/shared/api/triagem'
import { lookupCep } from '@/modules/shared/api/unidade'
import { Button } from '@/modules/shared/components/ui/button'
import { Input } from '@/modules/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shared/components/ui/select'
import { cn } from '@/modules/shared/lib/utils'
import pernambucoBoundary from '../data/pernambuco.geo.json'

type MapStatus =
  | 'Processo iniciado'
  | 'Em triagem'
  | 'Em exigência'
  | 'Em vistoria'
  | 'Regularizado'
  | 'Indeferido'
type BaseMapMode = 'street' | 'satellite'
type MapPoint = {
  id: string
  processId: string
  protocolo: string
  empresa: string
  unidade: string
  endereco: string
  municipio: string
  latitude: number
  longitude: number
  localizacaoAproximada: boolean
  situacao: MapStatus
  etapa: string
  fase: string
  risco: string
}
type ProcessPointCollection = {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    properties: { id: string; situacao: MapStatus }
    geometry: { type: 'Point'; coordinates: [number, number] }
  }>
}

const pernambucoBounds: [[number, number], [number, number]] = [
  [-41.7, -9.75],
  [-34.55, -7.05],
]
const statuses: Array<'Todos' | MapStatus> = [
  'Todos',
  'Processo iniciado',
  'Em triagem',
  'Em exigência',
  'Em vistoria',
  'Regularizado',
  'Indeferido',
]
const style: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap | MapLibre',
    },
    satellite: {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [
    { id: 'osm', type: 'raster', source: 'osm' },
    { id: 'satellite', type: 'raster', source: 'satellite', layout: { visibility: 'none' } },
  ],
}

export function OperationalMapPage() {
  const processes = useQuery({
    queryKey: ['triagem'],
    queryFn: listTriagem,
    refetchInterval: 30_000,
  })
  const [points, setPoints] = useState<MapPoint[]>([])
  const [geocoding, setGeocoding] = useState(false)
  const [notLocated, setNotLocated] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [status, setStatus] = useState<'Todos' | MapStatus>('Todos')
  const [search, setSearch] = useState('')
  const [baseMapMode, setBaseMapMode] = useState<BaseMapMode>('street')

  useEffect(() => {
    if (!processes.data) return
    let mounted = true
    const controller = new AbortController()
    async function resolve() {
      setGeocoding(true)
      const next: MapPoint[] = []
      let unavailable = 0
      for (const process of processes.data?.processos ?? []) {
        const coordinate = await locateProcess(process, controller.signal).catch(() => null)
        if (coordinate) next.push(toPoint(process, coordinate))
        else unavailable += 1
      }
      if (mounted) {
        setPoints(next)
        setNotLocated(unavailable)
        setGeocoding(false)
      }
    }
    void resolve()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [processes.data])

  const filtered = useMemo(() => {
    const term = normalize(search)
    return points.filter(
      (point) =>
        (status === 'Todos' || point.situacao === status) &&
        (!term ||
          normalize(
            [
              point.empresa,
              point.unidade,
              point.endereco,
              point.municipio,
              point.protocolo,
              point.processId,
            ].join(' '),
          ).includes(term)),
    )
  }, [points, search, status])
  const selected = filtered.find((point) => point.id === selectedId) ?? null
  const totals = useMemo(() => countStatuses(points), [points])

  return (
    <main className="h-svh overflow-hidden bg-background text-foreground">
      <section className="relative h-full">
        <MapCanvas
          baseMapMode={baseMapMode}
          points={filtered}
          selected={selected}
          onSelect={setSelectedId}
        />
        <header className="pointer-events-auto absolute top-3 left-3 z-20 w-[min(34rem,calc(100%-1.5rem))] border bg-background/95 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <MapIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-semibold">Mapa de processos</h1>
                <p className="truncate text-muted-foreground text-xs">
                  Pernambuco · endereços informados pelas empresas
                </p>
              </div>
            </div>
            <Button
              nativeButton={false}
              render={<Link to="/triagem" />}
              size="sm"
              variant="outline"
            >
              Fila
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            <Summary label="Iniciados" value={totals['Processo iniciado']} tone="text-sky-700" />
            <Summary label="Triagem" value={totals['Em triagem']} tone="text-indigo-700" />
            <Summary label="Exigência" value={totals['Em exigência']} tone="text-amber-700" />
            <Summary label="Vistoria" value={totals['Em vistoria']} tone="text-violet-700" />
            <Summary label="Regularizados" value={totals.Regularizado} tone="text-emerald-700" />
            <Summary label="Indeferidos" value={totals.Indeferido} tone="text-red-700" />
          </div>
        </header>
        <section className="pointer-events-auto absolute right-3 bottom-3 left-3 z-20 border bg-background/95 p-3 shadow-sm backdrop-blur xl:right-auto xl:left-4 xl:w-[42rem]">
          <div className="grid gap-2 md:grid-cols-[1fr_11rem_8rem]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Empresa, processo, protocolo ou município"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setSelectedId(null)
                }}
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as 'Todos' | MapStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={baseMapMode}
              onValueChange={(value) => setBaseMapMode(value as BaseMapMode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="street">Mapa</SelectItem>
                <SelectItem value="satellite">Satélite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
        <aside className="pointer-events-auto absolute top-[10.5rem] right-3 z-20 hidden w-[25rem] border bg-background/95 p-3 shadow-sm backdrop-blur xl:block">
          {processes.isLoading || geocoding ? (
            <Loading />
          ) : selected ? (
            <Details point={selected} />
          ) : (
            <Legend points={points.length} notLocated={notLocated} />
          )}
        </aside>
        <aside className="pointer-events-auto absolute right-3 bottom-24 left-3 z-20 max-h-[34svh] overflow-auto border bg-background/95 p-3 shadow-sm backdrop-blur xl:hidden">
          {processes.isLoading || geocoding ? (
            <Loading />
          ) : selected ? (
            <Details point={selected} />
          ) : (
            <Legend points={points.length} notLocated={notLocated} />
          )}
        </aside>
      </section>
    </main>
  )
}

function MapCanvas({
  baseMapMode,
  points,
  selected,
  onSelect,
}: {
  baseMapMode: BaseMapMode
  points: MapPoint[]
  selected: MapPoint | null
  onSelect: (id: string) => void
}) {
  const container = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const pointsRef = useRef(points)
  const selectRef = useRef(onSelect)
  pointsRef.current = points
  selectRef.current = onSelect
  useEffect(() => {
    if (!container.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: container.current,
      style,
      center: [-37.8, -8.35],
      zoom: 6.1,
      minZoom: 5,
      attributionControl: false,
      pitchWithRotate: false,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-left')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    map.on('load', () => {
      map.fitBounds(pernambucoBounds, {
        duration: 0,
        padding:
          window.innerWidth >= 1280
            ? { top: 120, right: 440, bottom: 92, left: 60 }
            : { top: 180, right: 24, bottom: 280, left: 24 },
      })
      map.addSource('pernambuco', { type: 'geojson', data: pernambucoBoundary })
      map.addLayer({
        id: 'pernambuco-fill',
        type: 'fill',
        source: 'pernambuco',
        paint: { 'fill-color': '#0f172a', 'fill-opacity': 0.06 },
      })
      map.addLayer({
        id: 'pernambuco-line',
        type: 'line',
        source: 'pernambuco',
        paint: { 'line-color': '#334155', 'line-width': 1.5 },
      })
      map.addSource('processes', {
        type: 'geojson',
        data: collection(pointsRef.current),
        cluster: true,
        clusterRadius: 44,
        clusterMaxZoom: 11,
      })
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'processes',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#ffffff',
          'circle-radius': ['step', ['get', 'point_count'], 17, 25, 21, 100, 25],
          'circle-stroke-color': '#403bad',
          'circle-stroke-width': 3,
        },
      })
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'processes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 12,
        },
        paint: { 'text-color': '#312e81' },
      })
      map.addLayer({
        id: 'points',
        type: 'circle',
        source: 'processes',
        filter: ['!', ['has', 'point_count']],
        paint: pointPaint(),
      })
      map.addLayer({
        id: 'point-hit',
        type: 'circle',
        source: 'processes',
        filter: ['!', ['has', 'point_count']],
        paint: { 'circle-color': '#000000', 'circle-opacity': 0, 'circle-radius': 16 },
      })
      map.on('click', 'clusters', (event) =>
        map.easeTo({
          center: event.lngLat,
          zoom: Math.min(map.getZoom() + 1.6, 13),
          duration: 350,
        }),
      )
      map.on('click', 'point-hit', (event) => {
        const id = event.features?.[0]?.properties?.id
        if (typeof id === 'string') selectRef.current(id)
      })
      map.on('mouseenter', 'point-hit', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'point-hit', () => {
        map.getCanvas().style.cursor = ''
      })
    })
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])
  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded())
      (map.getSource('processes') as GeoJSONSource | undefined)?.setData(collection(points))
  }, [points])
  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      map.setLayoutProperty('osm', 'visibility', baseMapMode === 'street' ? 'visible' : 'none')
      map.setLayoutProperty(
        'satellite',
        'visibility',
        baseMapMode === 'satellite' ? 'visible' : 'none',
      )
    }
  }, [baseMapMode])
  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded() || !map.getLayer('points')) return
    map.setPaintProperty('points', 'circle-stroke-width', [
      'case',
      ['==', ['get', 'id'], selected?.id ?? ''],
      4,
      2,
    ])
    if (selected)
      map.flyTo({
        center: [selected.longitude, selected.latitude],
        zoom: Math.max(map.getZoom(), 10),
        duration: 500,
        essential: true,
      })
  }, [selected])
  return <div ref={container} className="h-full w-full" />
}

function Details({ point }: { point: MapPoint }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={statusClass(point.situacao)}>{point.situacao}</span>
          <h2 className="mt-2 font-semibold text-base">{point.unidade}</h2>
          <p className="mt-1 text-muted-foreground text-sm">{point.empresa}</p>
        </div>
        <StatusIcon status={point.situacao} />
      </div>
      <div className="space-y-2 border-y py-3 text-sm">
        <p>
          <span className="text-muted-foreground">Endereço</span>
          <br />
          {point.endereco}
        </p>
        <p>
          <span className="text-muted-foreground">Processo</span>
          <br />
          {point.protocolo}
        </p>
        <p>
          <span className="text-muted-foreground">Etapa atual</span>
          <br />
          {point.etapa}
        </p>
        <p>
          <span className="text-muted-foreground">Classificação</span>
          <br />
          Risco {point.risco} · {point.situacao}
        </p>
        {point.localizacaoAproximada ? (
          <p className="flex gap-1.5 text-amber-800 text-xs">
            <AlertCircleIcon className="mt-0.5 size-3.5 shrink-0" />
            Localização aproximada pelo município informado no cadastro.
          </p>
        ) : null}
      </div>
      <Button
        nativeButton={false}
        render={<Link to="/triagem/$processoId" params={{ processoId: point.processId }} />}
        size="sm"
      >
        <ExternalLinkIcon data-icon="inline-start" />
        Abrir processo
      </Button>
    </div>
  )
}
function Loading() {
  return (
    <div className="flex min-h-32 items-center justify-center gap-2 text-muted-foreground text-sm">
      <LoaderCircleIcon className="size-4 animate-spin" />
      Localizando processos no mapa...
    </div>
  )
}
function Legend({ points, notLocated }: { points: number; notLocated: number }) {
  return (
    <div>
      <h2 className="font-semibold">Processos no território</h2>
      <p className="mt-1 text-muted-foreground text-sm">
        Selecione um ponto para ver os dados e abrir o dossiê.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {(
          [
            'Processo iniciado',
            'Em triagem',
            'Em exigência',
            'Em vistoria',
            'Regularizado',
            'Indeferido',
          ] as MapStatus[]
        ).map((status) => (
          <span className="flex items-center gap-2" key={status}>
            <span className={cn('size-2 rounded-full', dotClass(status))} />
            {status}
          </span>
        ))}
      </div>
      <p className="mt-4 flex gap-1.5 text-muted-foreground text-xs">
        <AlertCircleIcon className="size-3.5 shrink-0" />
        {points} ponto{points === 1 ? '' : 's'} exibido{points === 1 ? '' : 's'}
        {notLocated ? ` · ${notLocated} ainda sem localização` : ''}
      </p>
    </div>
  )
}
function Summary({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="border bg-card px-2 py-1.5">
      <strong className={cn('block text-sm tabular-nums', tone)}>{value}</strong>
      <span className="block truncate text-[0.65rem] text-muted-foreground">{label}</span>
    </div>
  )
}

function toPoint(
  process: TriagemProcessoItem,
  coordinate: { latitude: number; longitude: number; approximate: boolean },
): MapPoint {
  const address = process.endereco
  return {
    id: process.processoId,
    processId: process.processoId,
    protocolo: process.protocoloNumero ?? 'Sem protocolo',
    empresa: process.empresaRazaoSocial,
    unidade: process.unidadeNome ?? process.empresaRazaoSocial,
    endereco: [
      [address.logradouro, address.numero].filter(Boolean).join(', '),
      address.complemento,
      address.bairro,
      [address.municipio, address.uf ?? 'PE'].filter(Boolean).join('/'),
    ]
      .filter(Boolean)
      .join(' · '),
    municipio: address.municipio ?? 'Pernambuco',
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    localizacaoAproximada: coordinate.approximate,
    situacao: mapStatus(process.fase),
    etapa: phaseLabel(process.fase),
    fase: process.fase,
    risco: process.risco,
  }
}
async function locateProcess(process: TriagemProcessoItem, signal: AbortSignal) {
  const address = process.endereco
  const street = [
    [address.logradouro, address.numero].filter(Boolean).join(', '),
    address.complemento,
  ]
    .filter(Boolean)
    .join(' ')
  const input = {
    cep: address.cep ?? '',
    address: street,
    neighborhood: address.bairro ?? '',
    city: address.municipio ?? '',
  }
  if ((address.uf ?? 'PE').toUpperCase() !== 'PE') return null
  const key = `sac-nexus:map-coordinate:${process.processoId}:${input.cep}:${street}:${input.neighborhood}:${input.city}`
  const cached = sessionStorage.getItem(key)
  if (cached) {
    try {
      const value = JSON.parse(cached) as {
        latitude: number
        longitude: number
        approximate?: boolean
      }
      if (Number.isFinite(value.latitude) && Number.isFinite(value.longitude)) {
        return { ...value, approximate: value.approximate ?? false }
      }
    } catch {}
  }

  const exact = isAddressReadyForGeocoding(input)
    ? await geocodeEstablishmentAddress(input, signal)
    : null
  if (exact) {
    const coordinate = { latitude: exact.latitude, longitude: exact.longitude, approximate: false }
    sessionStorage.setItem(key, JSON.stringify(coordinate))
    return coordinate
  }

  const cep = input.cep.replace(/\D/g, '')
  if (cep.length === 8) {
    const cepLocation = await lookupCep(cep).catch(() => null)
    if (cepLocation?.lat != null && cepLocation.lng != null) {
      const coordinate = {
        latitude: cepLocation.lat,
        longitude: cepLocation.lng,
        approximate: true,
      }
      sessionStorage.setItem(key, JSON.stringify(coordinate))
      return coordinate
    }
  }

  const city = address.municipio?.trim()
  if (!city) return null
  const municipality = await geocodeEstablishmentAddress(
    { cep: '', address: city, neighborhood: '', city },
    signal,
  )
  if (!municipality) return null
  const coordinate = {
    latitude: municipality.latitude,
    longitude: municipality.longitude,
    approximate: true,
  }
  sessionStorage.setItem(key, JSON.stringify(coordinate))
  return coordinate
}
function collection(points: MapPoint[]): ProcessPointCollection {
  return {
    type: 'FeatureCollection',
    features: points.map((point) => ({
      type: 'Feature',
      properties: { id: point.id, situacao: point.situacao },
      geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] },
    })),
  }
}
function pointPaint(): NonNullable<CircleLayerSpecification['paint']> {
  return {
    'circle-color': [
      'match',
      ['get', 'situacao'],
      'Processo iniciado',
      '#0284c7',
      'Em triagem',
      '#4f46e5',
      'Em exigência',
      '#d97706',
      'Em vistoria',
      '#7c3aed',
      'Regularizado',
      '#16a34a',
      'Indeferido',
      '#dc2626',
      '#64748b',
    ],
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 5, 9, 8, 13, 11],
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 2,
  }
}
function mapStatus(fase: string): MapStatus {
  if (fase === 'aguardando_pagamento' || fase === 'documentos') return 'Processo iniciado'
  if (fase === 'protocolado') return 'Em triagem'
  if (fase === 'aprovado' || fase === 'concluido') return 'Regularizado'
  if (fase === 'em_exigencia') return 'Em exigência'
  if (fase === 'em_vistoria') return 'Em vistoria'
  if (fase === 'reprovado') return 'Indeferido'
  return 'Em triagem'
}
function phaseLabel(fase: string) {
  return (
    (
      {
        aguardando_pagamento: 'Aguardando pagamento',
        documentos: 'Documentação em preparação',
        protocolado: 'Em análise de triagem',
        em_exigencia: 'Aguardando resposta do contribuinte',
        em_vistoria: 'Aguardando vistoria',
        aprovado: 'AVCB emitido',
        reprovado: 'Pedido indeferido',
        concluido: 'DDLCB emitida',
      } as Record<string, string>
    )[fase] ?? fase
  )
}
function countStatuses(points: MapPoint[]) {
  const totals: Record<MapStatus, number> = {
    'Processo iniciado': 0,
    'Em triagem': 0,
    'Em exigência': 0,
    'Em vistoria': 0,
    Regularizado: 0,
    Indeferido: 0,
  }
  for (const point of points) totals[point.situacao] += 1
  return totals
}
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
function statusClass(status: MapStatus) {
  return cn(
    'inline-flex rounded-full border px-2 py-0.5 font-medium text-xs',
    status === 'Processo iniciado' && 'border-sky-300 bg-sky-50 text-sky-800',
    status === 'Em triagem' && 'border-indigo-300 bg-indigo-50 text-indigo-800',
    status === 'Em exigência' && 'border-amber-300 bg-amber-50 text-amber-800',
    status === 'Em vistoria' && 'border-violet-300 bg-violet-50 text-violet-800',
    status === 'Regularizado' && 'border-emerald-300 bg-emerald-50 text-emerald-800',
    status === 'Indeferido' && 'border-red-300 bg-red-50 text-red-800',
  )
}
function dotClass(status: MapStatus) {
  return (
    {
      'Processo iniciado': 'bg-sky-600',
      'Em triagem': 'bg-indigo-600',
      'Em exigência': 'bg-amber-600',
      'Em vistoria': 'bg-violet-600',
      Regularizado: 'bg-emerald-600',
      Indeferido: 'bg-red-600',
    } as Record<MapStatus, string>
  )[status]
}
function StatusIcon({ status }: { status: MapStatus }) {
  return status === 'Regularizado' ? (
    <CheckCircle2Icon className="size-5 text-emerald-700" />
  ) : (
    <ShieldAlertIcon
      className={cn('size-5', status === 'Indeferido' ? 'text-red-700' : 'text-amber-700')}
    />
  )
}
