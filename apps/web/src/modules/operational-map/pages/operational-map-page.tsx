import { Link } from '@tanstack/react-router'
import {
  ActivityIcon,
  CameraIcon,
  CheckCircle2Icon,
  ClockIcon,
  ExternalLinkIcon,
  MapIcon,
  SearchIcon,
  ShieldAlertIcon,
} from 'lucide-react'
import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type StyleSpecification,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/modules/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/modules/shared/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shared/components/ui/select'
import { cn } from '@/modules/shared/lib/utils'

import pernambucoBoundary from '../data/pernambuco.geo.json'
import recifeBoundary from '../data/recife.geo.json'

type InspectionMapStatus = 'Aguardando vistoria' | 'Vistoria em andamento'
type MapStatus = 'AVCB válido' | 'Precisa de atenção' | InspectionMapStatus
type BaseMapMode = 'street' | 'satellite'

type MapPoint = {
  id: string
  processId: string
  protocolo: string
  avcb: string
  empreendimento: string
  empresa: string
  endereco: string
  municipio: string
  uf: 'PE'
  latitude: number
  longitude: number
  situacaoMapa: MapStatus
  situacaoProcesso: string
  validade: string
  ultimaMovimentacao: string
}

type PointFeatureCollection = {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    id: string
    properties: {
      id: string
      municipio: string
      situacaoMapa: MapStatus
      title: string
    }
    geometry: {
      type: 'Point'
      coordinates: [number, number]
    }
  }>
}

type GeoJsonLinearRing = Array<[number, number]>
type GeoJsonPolygon = GeoJsonLinearRing[]
type GeoJsonPolygonCollection = GeoJsonPolygon[]
type GeoJsonBoundaryFeature = {
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: GeoJsonPolygon | GeoJsonPolygonCollection
  }
}
type GeoJsonBoundaryCollection = {
  features: GeoJsonBoundaryFeature[]
}

const recifePolygons = extractBoundaryPolygons(
  recifeBoundary as unknown as GeoJsonBoundaryCollection,
)
const recifeBounds = getPolygonBounds(recifePolygons)
const recifeMapCenter: [number, number] = [-34.88111, -8.05389]

const baseMapPoints: MapPoint[] = [
  {
    id: 'cd-abc',
    processId: 'PROC-AVCB-R2-0001',
    protocolo: 'SAC-2026-000002',
    avcb: 'AVCB-R2-2026-0001',
    empreendimento: 'Centro de Distribuição ABC',
    empresa: 'ABC Logística LTDA',
    endereco: 'Avenida Recife, 1200 - Jiquiá',
    municipio: 'Recife',
    uf: 'PE',
    latitude: -8.0864,
    longitude: -34.9387,
    situacaoMapa: 'AVCB válido',
    situacaoProcesso: 'Processo concluído',
    validade: '12/08/2027',
    ultimaMovimentacao: 'AVCB emitido',
  },
  {
    id: 'galpao-jaboatao',
    processId: 'PROC-AVCB-R2-0002',
    protocolo: 'SAC-2026-000003',
    avcb: 'Não emitido',
    empreendimento: 'Galpão Logístico Jaboatão',
    empresa: 'Operação Metropolitana LTDA',
    endereco: 'BR-101, Prazeres',
    municipio: 'Jaboatão dos Guararapes',
    uf: 'PE',
    latitude: -8.1681,
    longitude: -34.9203,
    situacaoMapa: 'Precisa de atenção',
    situacaoProcesso: 'Aguardando Correções',
    validade: 'Não aplicável',
    ultimaMovimentacao: 'Exigência administrativa emitida',
  },
  {
    id: 'armazem-caruaru',
    processId: 'PROC-AVCB-R2-0003',
    protocolo: 'SAC-2026-000004',
    avcb: 'AVCB-R2-2026-0003',
    empreendimento: 'Armazém Agreste',
    empresa: 'Agreste Distribuição SA',
    endereco: 'Distrito Industrial',
    municipio: 'Caruaru',
    uf: 'PE',
    latitude: -8.2846,
    longitude: -35.9699,
    situacaoMapa: 'AVCB válido',
    situacaoProcesso: 'Processo concluído',
    validade: '30/09/2027',
    ultimaMovimentacao: 'Documento validado em consulta pública',
  },
  {
    id: 'industria-petrolina',
    processId: 'PROC-AVCB-R2-0004',
    protocolo: 'SAC-2026-000005',
    avcb: 'Não emitido',
    empreendimento: 'Indústria Sertão',
    empresa: 'Sertão Alimentos LTDA',
    endereco: 'Distrito Industrial de Petrolina',
    municipio: 'Petrolina',
    uf: 'PE',
    latitude: -9.3891,
    longitude: -40.503,
    situacaoMapa: 'Aguardando vistoria',
    situacaoProcesso: 'Vistoria pendente de agendamento',
    validade: 'Não aplicável',
    ultimaMovimentacao: 'Projeto técnico aprovado',
  },
  {
    id: 'centro-olinda',
    processId: 'PROC-AVCB-R2-0005',
    protocolo: 'SAC-2026-000006',
    avcb: 'AVCB-R2-2026-0005',
    empreendimento: 'Centro Comercial Olinda',
    empresa: 'Centro Comercial Olinda SPE',
    endereco: 'Avenida Getúlio Vargas',
    municipio: 'Olinda',
    uf: 'PE',
    latitude: -8.0108,
    longitude: -34.8553,
    situacaoMapa: 'AVCB válido',
    situacaoProcesso: 'Processo concluído',
    validade: '18/10/2027',
    ultimaMovimentacao: 'AVCB disponível',
  },
  {
    id: 'servico-garanhuns',
    processId: 'PROC-AVCB-R2-0006',
    protocolo: 'SAC-2026-000007',
    avcb: 'Não emitido',
    empreendimento: 'Complexo de Serviços Garanhuns',
    empresa: 'Serviços do Agreste LTDA',
    endereco: 'Avenida Rui Barbosa',
    municipio: 'Garanhuns',
    uf: 'PE',
    latitude: -8.8903,
    longitude: -36.4936,
    situacaoMapa: 'Precisa de atenção',
    situacaoProcesso: 'Pagamento pendente',
    validade: 'Não aplicável',
    ultimaMovimentacao: 'Taxas geradas',
  },
  {
    id: 'porto-suape',
    processId: 'PROC-AVCB-R2-0008',
    protocolo: 'SAC-2026-000008',
    avcb: 'AVCB-R2-2026-0008',
    empreendimento: 'Terminal Operacional Suape',
    empresa: 'Suape Operações Portuárias SA',
    endereco: 'Complexo Industrial Portuário de Suape',
    municipio: 'Ipojuca',
    uf: 'PE',
    latitude: -8.3985,
    longitude: -34.9672,
    situacaoMapa: 'AVCB válido',
    situacaoProcesso: 'Processo concluído',
    validade: '22/11/2027',
    ultimaMovimentacao: 'AVCB emitido',
  },
  {
    id: 'industria-cabo',
    processId: 'PROC-AVCB-R2-0009',
    protocolo: 'SAC-2026-000009',
    avcb: 'Não emitido',
    empreendimento: 'Distrito Industrial do Cabo',
    empresa: 'Cabo Industrial LTDA',
    endereco: 'BR-101 Sul',
    municipio: 'Cabo de Santo Agostinho',
    uf: 'PE',
    latitude: -8.2834,
    longitude: -35.0367,
    situacaoMapa: 'Aguardando vistoria',
    situacaoProcesso: 'Aguardando vistoria',
    validade: 'Não aplicável',
    ultimaMovimentacao: 'Vistoria solicitada',
  },
  {
    id: 'hub-goiana',
    processId: 'PROC-AVCB-R2-0010',
    protocolo: 'SAC-2026-000010',
    avcb: 'AVCB-R2-2026-0010',
    empreendimento: 'Hub Industrial Goiana',
    empresa: 'Norte Mata Desenvolvimento SA',
    endereco: 'PE-075',
    municipio: 'Goiana',
    uf: 'PE',
    latitude: -7.5606,
    longitude: -35.0021,
    situacaoMapa: 'AVCB válido',
    situacaoProcesso: 'Processo concluído',
    validade: '04/12/2027',
    ultimaMovimentacao: 'Documento validado',
  },
  {
    id: 'centro-paulista',
    processId: 'PROC-AVCB-R2-0011',
    protocolo: 'SAC-2026-000011',
    avcb: 'Não emitido',
    empreendimento: 'Centro Atacadista Paulista',
    empresa: 'Atacado Norte LTDA',
    endereco: 'Avenida Brasil',
    municipio: 'Paulista',
    uf: 'PE',
    latitude: -7.9408,
    longitude: -34.8728,
    situacaoMapa: 'Vistoria em andamento',
    situacaoProcesso: 'Vistoria em andamento',
    validade: 'Não aplicável',
    ultimaMovimentacao: 'Exigência técnica emitida',
  },
  {
    id: 'hospital-vitoria',
    processId: 'PROC-AVCB-R2-0012',
    protocolo: 'SAC-2026-000012',
    avcb: 'AVCB-R2-2026-0012',
    empreendimento: 'Unidade Hospitalar Vitória',
    empresa: 'Rede Saúde Mata Sul',
    endereco: 'Rua Imperial',
    municipio: 'Vitória de Santo Antão',
    uf: 'PE',
    latitude: -8.126,
    longitude: -35.3074,
    situacaoMapa: 'AVCB válido',
    situacaoProcesso: 'Processo concluído',
    validade: '15/01/2028',
    ultimaMovimentacao: 'AVCB disponível',
  },
  {
    id: 'industria-palmares',
    processId: 'PROC-AVCB-R2-0013',
    protocolo: 'SAC-2026-000013',
    avcb: 'Não emitido',
    empreendimento: 'Indústria Alimentícia Palmares',
    empresa: 'Mata Sul Alimentos LTDA',
    endereco: 'PE-103',
    municipio: 'Palmares',
    uf: 'PE',
    latitude: -8.6833,
    longitude: -35.5917,
    situacaoMapa: 'Precisa de atenção',
    situacaoProcesso: 'Correções em análise',
    validade: 'Não aplicável',
    ultimaMovimentacao: 'Correção documental recebida',
  },
  {
    id: 'shopping-caruaru',
    processId: 'PROC-AVCB-R2-0014',
    protocolo: 'SAC-2026-000014',
    avcb: 'AVCB-R2-2026-0014',
    empreendimento: 'Shopping Empresarial Caruaru',
    empresa: 'Empreendimentos Agreste SPE',
    endereco: 'Avenida Adjar da Silva Casé',
    municipio: 'Caruaru',
    uf: 'PE',
    latitude: -8.2607,
    longitude: -35.9753,
    situacaoMapa: 'AVCB válido',
    situacaoProcesso: 'Processo concluído',
    validade: '26/02/2028',
    ultimaMovimentacao: 'AVCB emitido',
  },
  {
    id: 'logistica-belo-jardim',
    processId: 'PROC-AVCB-R2-0015',
    protocolo: 'SAC-2026-000015',
    avcb: 'Não emitido',
    empreendimento: 'Base Logística Belo Jardim',
    empresa: 'Agreste Cargas LTDA',
    endereco: 'BR-232',
    municipio: 'Belo Jardim',
    uf: 'PE',
    latitude: -8.3337,
    longitude: -36.4245,
    situacaoMapa: 'Vistoria em andamento',
    situacaoProcesso: 'Vistoria em andamento',
    validade: 'Não aplicável',
    ultimaMovimentacao: 'Taxas geradas',
  },
  {
    id: 'centro-arcoverde',
    processId: 'PROC-AVCB-R2-0016',
    protocolo: 'SAC-2026-000016',
    avcb: 'AVCB-R2-2026-0016',
    empreendimento: 'Centro de Eventos Arcoverde',
    empresa: 'Eventos Sertão LTDA',
    endereco: 'Avenida Osvaldo Cruz',
    municipio: 'Arcoverde',
    uf: 'PE',
    latitude: -8.4189,
    longitude: -37.0539,
    situacaoMapa: 'AVCB válido',
    situacaoProcesso: 'Processo concluído',
    validade: '09/03/2028',
    ultimaMovimentacao: 'Documento validado',
  },
  {
    id: 'armazem-serra-talhada',
    processId: 'PROC-AVCB-R2-0017',
    protocolo: 'SAC-2026-000017',
    avcb: 'Não emitido',
    empreendimento: 'Armazém Sertão Central',
    empresa: 'Sertão Central Distribuição LTDA',
    endereco: 'BR-232',
    municipio: 'Serra Talhada',
    uf: 'PE',
    latitude: -7.9912,
    longitude: -38.2984,
    situacaoMapa: 'Precisa de atenção',
    situacaoProcesso: 'Aguardando correções',
    validade: 'Não aplicável',
    ultimaMovimentacao: 'Análise técnica devolvida',
  },
  {
    id: 'clinica-salgueiro',
    processId: 'PROC-AVCB-R2-0018',
    protocolo: 'SAC-2026-000018',
    avcb: 'AVCB-R2-2026-0018',
    empreendimento: 'Clínica Regional Salgueiro',
    empresa: 'Saúde Sertão SA',
    endereco: 'Rua Otávio Leitinho',
    municipio: 'Salgueiro',
    uf: 'PE',
    latitude: -8.0737,
    longitude: -39.1247,
    situacaoMapa: 'AVCB válido',
    situacaoProcesso: 'Processo concluído',
    validade: '17/04/2028',
    ultimaMovimentacao: 'AVCB emitido',
  },
  {
    id: 'mineracao-ouricuri',
    processId: 'PROC-AVCB-R2-0019',
    protocolo: 'SAC-2026-000019',
    avcb: 'Não emitido',
    empreendimento: 'Unidade Mineral Ouricuri',
    empresa: 'Araripe Mineração LTDA',
    endereco: 'PE-545',
    municipio: 'Ouricuri',
    uf: 'PE',
    latitude: -7.8825,
    longitude: -40.0817,
    situacaoMapa: 'Aguardando vistoria',
    situacaoProcesso: 'Vistoria pendente',
    validade: 'Não aplicável',
    ultimaMovimentacao: 'Projeto técnico aprovado',
  },
  {
    id: 'industria-araripina',
    processId: 'PROC-AVCB-R2-0020',
    protocolo: 'SAC-2026-000020',
    avcb: 'AVCB-R2-2026-0020',
    empreendimento: 'Polo Gesseiro Araripina',
    empresa: 'Araripe Gesso SA',
    endereco: 'Distrito Industrial',
    municipio: 'Araripina',
    uf: 'PE',
    latitude: -7.5765,
    longitude: -40.4983,
    situacaoMapa: 'AVCB válido',
    situacaoProcesso: 'Processo concluído',
    validade: '28/05/2028',
    ultimaMovimentacao: 'AVCB disponível',
  },
  {
    id: 'servicos-afogados',
    processId: 'PROC-AVCB-R2-0021',
    protocolo: 'SAC-2026-000021',
    avcb: 'Não emitido',
    empreendimento: 'Centro de Serviços Pajeú',
    empresa: 'Pajeú Serviços Integrados LTDA',
    endereco: 'Avenida Rio Branco',
    municipio: 'Afogados da Ingazeira',
    uf: 'PE',
    latitude: -7.7508,
    longitude: -37.6392,
    situacaoMapa: 'Precisa de atenção',
    situacaoProcesso: 'Documentação pendente',
    validade: 'Não aplicável',
    ultimaMovimentacao: 'Pendência documental registrada',
  },
]

const mapPoints: MapPoint[] = [...baseMapPoints, ...createSimulatedRecifePoints(1000)]

const statusOptions: Array<'Todos' | MapStatus> = [
  'Todos',
  'AVCB válido',
  'Precisa de atenção',
  'Aguardando vistoria',
  'Vistoria em andamento',
]

const osmStyle: StyleSpecification = {
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
      attribution:
        'Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community | MapLibre',
    },
    satelliteLabels: {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution:
        'Labels © Esri, HERE, Garmin, OpenStreetMap contributors, and the GIS User Community',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
    {
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
      layout: {
        visibility: 'none',
      },
    },
    {
      id: 'satellite-labels',
      type: 'raster',
      source: 'satelliteLabels',
      layout: {
        visibility: 'none',
      },
      paint: {
        'raster-opacity': 0.92,
      },
    },
  ],
}

const pernambucoBounds: [[number, number], [number, number]] = [
  [-41.7, -9.75],
  [-34.55, -7.05],
]

function OperationalMapPage({ googleMapsApiKey }: { googleMapsApiKey?: string | undefined }) {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  const [baseMapMode, setBaseMapMode] = useState<BaseMapMode>('street')
  const [statusFilter, setStatusFilter] = useState<'Todos' | MapStatus>('Todos')
  const [search, setSearch] = useState('')

  const pernambucoPoints = mapPoints.filter((point) => point.uf === 'PE')
  const filteredPoints = pernambucoPoints.filter((point) => {
    const matchesStatus = statusFilter === 'Todos' || point.situacaoMapa === statusFilter
    const matchesSearch = [
      point.empreendimento,
      point.empresa,
      point.municipio,
      point.processId,
      point.protocolo,
      point.avcb,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const clickedPoint = selectedPointId
    ? (filteredPoints.find((point) => point.id === selectedPointId) ?? null)
    : null
  const directSearchPoint = findDirectSearchPoint(filteredPoints, search)
  const activePoint = clickedPoint ?? directSearchPoint

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !activePoint) {
        return
      }

      setSelectedPointId(null)

      if (directSearchPoint) {
        setSearch('')
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [activePoint, directSearchPoint])

  const totals = useMemo(
    () => ({
      attention: pernambucoPoints.filter((point) => point.situacaoMapa === 'Precisa de atenção')
        .length,
      inspectionInProgress: pernambucoPoints.filter(
        (point) => point.situacaoMapa === 'Vistoria em andamento',
      ).length,
      valid: pernambucoPoints.filter((point) => point.situacaoMapa === 'AVCB válido').length,
      waitingInspection: pernambucoPoints.filter(
        (point) => point.situacaoMapa === 'Aguardando vistoria',
      ).length,
    }),
    [pernambucoPoints],
  )

  return (
    <main className="h-svh overflow-hidden bg-background text-foreground">
      <section className="relative h-full overflow-hidden bg-background">
        <MapCanvas
          baseMapMode={baseMapMode}
          filteredPoints={filteredPoints}
          selectedPoint={activePoint}
          setSelectedPointId={setSelectedPointId}
        />

        <div className="pointer-events-auto absolute top-3 left-3 z-20 w-[min(31rem,calc(100%-1.5rem))] rounded-lg border border-border bg-card/90 p-2 shadow-sm backdrop-blur xl:w-[31rem]">
          <InfoGrid
            dense
            className="grid-cols-2 gap-1.5 sm:grid-cols-4"
            items={[
              ['AVCB válido', `${totals.valid}`],
              ['Precisam de atenção', `${totals.attention}`],
              ['Aguardando vistoria', `${totals.waitingInspection}`],
              ['Vistoria em andamento', `${totals.inspectionInProgress}`],
            ]}
          />
        </div>

        <div className="pointer-events-auto absolute right-3 bottom-3 left-3 z-20 rounded-xl border border-border bg-card/90 p-3 shadow-sm backdrop-blur xl:right-auto xl:bottom-4 xl:left-4 xl:w-[min(50rem,calc(100%-2rem))]">
          <FieldGroup className="md:grid md:grid-cols-[1fr_14rem_10rem]">
            <Field>
              <FieldLabel htmlFor="map-search">Buscar no mapa</FieldLabel>
              <Input
                id="map-search"
                placeholder="Processo, protocolo, empresa, município ou AVCB"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setSelectedPointId(null)
                }}
              />
            </Field>
            <SelectField
              label="Situação"
              options={statusOptions}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as 'Todos' | MapStatus)}
            />
            <SelectField
              label="Camada"
              options={[
                ['street', 'Mapa'],
                ['satellite', 'Satélite'],
              ]}
              value={baseMapMode}
              onChange={(value) => setBaseMapMode(value as BaseMapMode)}
            />
          </FieldGroup>
        </div>

        <aside className="pointer-events-auto absolute top-3 right-3 z-20 hidden w-[28rem] content-start gap-2 overflow-visible rounded-lg border border-border bg-card/90 p-2 shadow-sm backdrop-blur xl:grid">
          {activePoint ? (
            <PointDetails compact googleMapsApiKey={googleMapsApiKey} point={activePoint} />
          ) : (
            <MapIdlePanel />
          )}
        </aside>

        <aside className="pointer-events-auto absolute inset-x-3 bottom-36 z-20 grid max-h-[36svh] gap-3 overflow-y-auto rounded-xl border border-border bg-card/90 p-3 shadow-sm backdrop-blur xl:hidden">
          {activePoint ? (
            <PointDetails compact googleMapsApiKey={googleMapsApiKey} point={activePoint} />
          ) : (
            <MapIdlePanel />
          )}
        </aside>
      </section>
    </main>
  )
}

function MapCanvas({
  baseMapMode,
  filteredPoints,
  selectedPoint,
  setSelectedPointId,
}: {
  baseMapMode: BaseMapMode
  filteredPoints: MapPoint[]
  selectedPoint: MapPoint | null
  setSelectedPointId: (id: string) => void
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const initialPointsRef = useRef(filteredPoints)
  const initialSelectedPointIdRef = useRef(selectedPoint?.id ?? '')
  const setSelectedPointIdRef = useRef(setSelectedPointId)
  const shouldSkipInitialFlyToRef = useRef(true)
  const hoverPopupRef = useRef<maplibregl.Popup | null>(null)

  setSelectedPointIdRef.current = setSelectedPointId

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    const map = new maplibregl.Map({
      attributionControl: false,
      center: [-37.8, -8.35],
      container: mapContainerRef.current,
      minZoom: 5,
      pitchWithRotate: false,
      style: osmStyle,
      zoom: 6.1,
    })

    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-left')
    map.addControl(
      new maplibregl.AttributionControl({
        compact: false,
        customAttribution: '© OpenStreetMap | MapLibre',
      }),
      'bottom-right',
    )

    const canvas = map.getCanvas()
    const mapContainer = map.getContainer()
    let middleButtonDrag:
      | {
          cursor: string
          x: number
          y: number
        }
      | undefined

    function handleMiddleButtonMouseDown(event: MouseEvent) {
      if (event.button !== 1) {
        return
      }

      event.preventDefault()
      hoverPopupRef.current?.remove()
      hoverPopupRef.current = null

      middleButtonDrag = {
        cursor: canvas.style.cursor,
        x: event.clientX,
        y: event.clientY,
      }
      canvas.style.cursor = 'grabbing'
    }

    function handleMiddleButtonMouseMove(event: MouseEvent) {
      if (!middleButtonDrag) {
        return
      }

      event.preventDefault()

      const deltaX = event.clientX - middleButtonDrag.x
      const deltaY = event.clientY - middleButtonDrag.y
      const centerPoint = map.project(map.getCenter())

      map.setCenter(map.unproject([centerPoint.x - deltaX, centerPoint.y - deltaY]))
      middleButtonDrag.x = event.clientX
      middleButtonDrag.y = event.clientY
    }

    function handleMiddleButtonMouseUp(event: MouseEvent) {
      if (event.button !== 1 || !middleButtonDrag) {
        return
      }

      event.preventDefault()
      canvas.style.cursor = middleButtonDrag.cursor
      middleButtonDrag = undefined
    }

    function handleMiddleButtonAuxClick(event: MouseEvent) {
      if (event.button === 1) {
        event.preventDefault()
      }
    }

    mapContainer.addEventListener('mousedown', handleMiddleButtonMouseDown)
    mapContainer.addEventListener('auxclick', handleMiddleButtonAuxClick)
    window.addEventListener('mousemove', handleMiddleButtonMouseMove)
    window.addEventListener('mouseup', handleMiddleButtonMouseUp)

    map.on('load', () => {
      const isDesktopMap = (mapContainerRef.current?.clientWidth ?? 0) >= 1280

      map.fitBounds(pernambucoBounds, {
        duration: 0,
        padding: isDesktopMap
          ? { bottom: 96, left: 96, right: 260, top: 96 }
          : { bottom: 300, left: 24, right: 24, top: 108 },
      })

      map.addSource('pernambuco-boundary', {
        type: 'geojson',
        data: pernambucoBoundary,
      })

      map.addLayer({
        id: 'pernambuco-fill',
        type: 'fill',
        source: 'pernambuco-boundary',
        paint: {
          'fill-color': '#18181b',
          'fill-opacity': 0.08,
        },
      })

      map.addLayer({
        id: 'pernambuco-outline',
        type: 'line',
        source: 'pernambuco-boundary',
        paint: {
          'line-color': '#18181b',
          'line-opacity': 0.85,
          'line-width': 2,
        },
      })

      map.addSource('sac-points', {
        type: 'geojson',
        cluster: true,
        clusterMaxZoom: 11,
        clusterProperties: {
          attention_count: [
            '+',
            ['case', ['==', ['get', 'situacaoMapa'], 'Precisa de atenção'], 1, 0],
          ],
          inspection_in_progress_count: [
            '+',
            ['case', ['==', ['get', 'situacaoMapa'], 'Vistoria em andamento'], 1, 0],
          ],
          waiting_inspection_count: [
            '+',
            ['case', ['==', ['get', 'situacaoMapa'], 'Aguardando vistoria'], 1, 0],
          ],
        },
        clusterRadius: 42,
        data: createPointCollection(initialPointsRef.current),
      })

      map.addLayer({
        id: 'sac-clusters',
        type: 'circle',
        source: 'sac-points',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'case',
            ['>', ['get', 'attention_count'], 0],
            '#fee2e2',
            ['>', ['get', 'waiting_inspection_count'], 0],
            '#fef3c7',
            ['>', ['get', 'inspection_in_progress_count'], 0],
            '#e0f2fe',
            '#ffffff',
          ],
          'circle-opacity': 0.96,
          'circle-radius': ['step', ['get', 'point_count'], 16, 25, 20, 100, 24],
          'circle-stroke-color': [
            'case',
            ['>', ['get', 'attention_count'], 0],
            '#dc2626',
            ['>', ['get', 'waiting_inspection_count'], 0],
            '#d97706',
            ['>', ['get', 'inspection_in_progress_count'], 0],
            '#0284c7',
            '#3730a3',
          ],
          'circle-stroke-width': 3,
        },
      })

      map.addLayer({
        id: 'sac-cluster-count',
        type: 'symbol',
        source: 'sac-points',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 12,
        },
        paint: {
          'text-color': [
            'case',
            ['>', ['get', 'attention_count'], 0],
            '#991b1b',
            ['>', ['get', 'waiting_inspection_count'], 0],
            '#92400e',
            ['>', ['get', 'inspection_in_progress_count'], 0],
            '#075985',
            '#3730a3',
          ],
        },
      })

      map.addLayer({
        id: 'sac-selected-point-halo',
        type: 'circle',
        source: 'sac-points',
        filter: [
          'all',
          ['!', ['has', 'point_count']],
          ['==', ['get', 'id'], initialSelectedPointIdRef.current],
        ],
        paint: {
          'circle-color': [
            'match',
            ['get', 'situacaoMapa'],
            'AVCB válido',
            '#3730a3',
            'Precisa de atenção',
            '#dc2626',
            'Aguardando vistoria',
            '#d97706',
            'Vistoria em andamento',
            '#0284c7',
            '#71717a',
          ],
          'circle-opacity': 0.34,
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 14, 8, 20, 12, 28],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.9,
          'circle-stroke-width': 3,
        },
      })

      map.addLayer({
        id: 'sac-unclustered-point',
        type: 'circle',
        source: 'sac-points',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'situacaoMapa'],
            'AVCB válido',
            '#3730a3',
            'Precisa de atenção',
            '#dc2626',
            'Aguardando vistoria',
            '#d97706',
            'Vistoria em andamento',
            '#0284c7',
            '#71717a',
          ],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 5, 8, 7, 12, 10],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'id'], initialSelectedPointIdRef.current],
            '#ffffff',
            '#ffffff',
          ],
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'id'], initialSelectedPointIdRef.current],
            4,
            2,
          ],
        },
      })

      map.addLayer({
        id: 'sac-unclustered-hit-area',
        type: 'circle',
        source: 'sac-points',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#000000',
          'circle-opacity': 0,
          'circle-radius': 16,
        },
      })

      map.on('click', 'sac-unclustered-hit-area', (event) => {
        const id = event.features?.[0]?.properties?.id

        if (typeof id === 'string') {
          setSelectedPointIdRef.current(id)
        }
      })

      map.on('click', 'sac-clusters', (event) => {
        const coordinates = event.lngLat

        map.easeTo({
          center: coordinates,
          duration: 450,
          zoom: Math.min(map.getZoom() + 1.6, 12),
        })
      })

      map.on('mouseenter', 'sac-unclustered-hit-area', () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mousemove', 'sac-unclustered-hit-area', (event) => {
        const feature = event.features?.[0]
        const coordinates = feature?.geometry.type === 'Point' ? feature.geometry.coordinates : null
        const properties = feature?.properties

        if (
          !coordinates ||
          typeof properties?.title !== 'string' ||
          typeof properties?.situacaoMapa !== 'string'
        ) {
          return
        }

        hoverPopupRef.current?.remove()
        hoverPopupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
        })
          .setLngLat([coordinates[0], coordinates[1]])
          .setDOMContent(
            createPointTooltipElement({
              municipio: typeof properties.municipio === 'string' ? properties.municipio : '',
              situacaoMapa: properties.situacaoMapa,
              title: properties.title,
            }),
          )
          .addTo(map)
      })

      map.on('mouseenter', 'sac-clusters', () => {
        map.getCanvas().style.cursor = 'zoom-in'
      })

      map.on('mouseleave', 'sac-unclustered-hit-area', () => {
        map.getCanvas().style.cursor = ''
        hoverPopupRef.current?.remove()
        hoverPopupRef.current = null
      })

      map.on('mouseleave', 'sac-clusters', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    return () => {
      mapContainer.removeEventListener('mousedown', handleMiddleButtonMouseDown)
      mapContainer.removeEventListener('auxclick', handleMiddleButtonAuxClick)
      window.removeEventListener('mousemove', handleMiddleButtonMouseMove)
      window.removeEventListener('mouseup', handleMiddleButtonMouseUp)
      hoverPopupRef.current?.remove()
      hoverPopupRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current

    if (!map?.isStyleLoaded()) {
      return
    }

    map.setLayoutProperty('osm', 'visibility', baseMapMode === 'street' ? 'visible' : 'none')
    map.setLayoutProperty(
      'satellite',
      'visibility',
      baseMapMode === 'satellite' ? 'visible' : 'none',
    )
    map.setLayoutProperty(
      'satellite-labels',
      'visibility',
      baseMapMode === 'satellite' ? 'visible' : 'none',
    )
    map.setPaintProperty(
      'pernambuco-fill',
      'fill-color',
      baseMapMode === 'satellite' ? '#ffffff' : '#18181b',
    )
    map.setPaintProperty(
      'pernambuco-fill',
      'fill-opacity',
      baseMapMode === 'satellite' ? 0.12 : 0.08,
    )
    map.setPaintProperty(
      'pernambuco-outline',
      'line-color',
      baseMapMode === 'satellite' ? '#ffffff' : '#18181b',
    )
  }, [baseMapMode])

  useEffect(() => {
    const map = mapRef.current

    if (!map?.isStyleLoaded()) {
      return
    }

    const source = map.getSource('sac-points') as GeoJSONSource | undefined
    source?.setData(createPointCollection(filteredPoints))
  }, [filteredPoints])

  useEffect(() => {
    const map = mapRef.current

    if (!map?.isStyleLoaded()) {
      return
    }

    applySelectedPointPaint(map, selectedPoint?.id ?? '')

    if (!selectedPoint) {
      shouldSkipInitialFlyToRef.current = false
      return
    }

    if (shouldSkipInitialFlyToRef.current) {
      shouldSkipInitialFlyToRef.current = false
      return
    }

    map.flyTo({
      center: [selectedPoint.longitude, selectedPoint.latitude],
      duration: 650,
      essential: true,
      zoom: Math.max(map.getZoom(), 7.8),
    })
  }, [selectedPoint])

  return <div ref={mapContainerRef} className="h-full min-h-full w-full" />
}

function PointDetails({
  compact = false,
  googleMapsApiKey,
  point,
}: {
  compact?: boolean
  googleMapsApiKey?: string | undefined
  point: MapPoint
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-background', compact ? 'p-3' : 'p-4')}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className={getMapStatusBadgeClass(point.situacaoMapa)}>{point.situacaoMapa}</span>
          <h2 className={cn('font-semibold', compact ? 'mt-2 text-base' : 'mt-3 text-xl')}>
            {point.empreendimento}
          </h2>
          <p className="text-muted-foreground text-xs">
            {point.municipio}/PE - {point.endereco}
          </p>
        </div>
        <MapStatusIcon status={point.situacaoMapa} />
      </div>

      <StreetViewPreviewDialog
        compact={compact}
        googleMapsApiKey={googleMapsApiKey}
        point={point}
      />

      <InfoGrid
        dense={compact}
        className={cn(compact ? 'mt-2' : 'mt-4')}
        items={[
          ['Empresa', point.empresa],
          ['Processo', point.processId],
          ['Protocolo', point.protocolo],
          ['AVCB', point.avcb],
          ['Situação do processo', point.situacaoProcesso],
          ['Validade', point.validade],
          ['Última movimentação', point.ultimaMovimentacao],
          ['Coordenadas', `${point.latitude}, ${point.longitude}`],
        ]}
      />

      <div className={cn('flex flex-wrap gap-2', compact ? 'mt-2' : 'mt-4')}>
        <Button
          nativeButton={false}
          render={<Link to="/processes/$processId" params={{ processId: point.processId }} />}
          size={compact ? 'sm' : 'default'}
        >
          <ExternalLinkIcon data-icon="inline-start" />
          Abrir processo
        </Button>
        <Button
          nativeButton={false}
          render={
            <a
              href={getStreetViewUrl(point)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Abrir Street View de ${point.empreendimento}`}
            >
              <ExternalLinkIcon data-icon="inline-start" />
              Street View
            </a>
          }
          size={compact ? 'sm' : 'default'}
          variant="outline"
        />
        <Button
          nativeButton={false}
          render={<Link to="/public-consultation" />}
          size={compact ? 'sm' : 'default'}
          variant="outline"
        >
          <SearchIcon data-icon="inline-start" />
          Consulta pública
        </Button>
      </div>
    </div>
  )
}

function StreetViewPreviewDialog({
  compact = false,
  googleMapsApiKey,
  point,
}: {
  compact?: boolean
  googleMapsApiKey?: string | undefined
  point: MapPoint
}) {
  const embedUrl = getStreetViewEmbedUrl(point, googleMapsApiKey)

  return (
    <Dialog>
      <div className="relative mt-4 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-2 text-left shadow-xs transition-colors hover:bg-muted/30">
        <StreetViewThumbnail compact={compact} googleMapsApiKey={googleMapsApiKey} point={point} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-foreground text-sm">
            {point.empreendimento}
          </span>
          <span className="mt-0.5 block truncate text-muted-foreground text-xs">
            {point.endereco} - {point.municipio}, PE
          </span>
          <span className="mt-1 block truncate font-medium text-primary text-xs">
            {point.latitude}, {point.longitude}
          </span>
        </span>
        <DialogTrigger
          className="absolute inset-0 rounded-xl outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          render={
            <button type="button" aria-label={`Ver imagem do local ${point.empreendimento}`} />
          }
        >
          <span className="sr-only">
            A visualização usa apenas pontos com UF PE. A situação apresentada vem do processo ou do
            documento, sem inferir novas regras.
          </span>
        </DialogTrigger>
      </div>
      <DialogContent className="gap-3 p-0 sm:max-w-4xl">
        <DialogHeader className="px-4 pt-4 pr-12">
          <DialogTitle>Imagem do local</DialogTitle>
          <DialogDescription>
            {point.empreendimento} - {point.municipio}/PE
          </DialogDescription>
        </DialogHeader>
        {embedUrl ? (
          <div className="overflow-hidden border-border border-y bg-muted">
            <iframe
              allowFullScreen
              className="h-[62svh] min-h-[22rem] w-full border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              src={embedUrl}
              title={`Street View de ${point.empreendimento}`}
            />
          </div>
        ) : (
          <div className="flex min-h-[22rem] flex-col items-center justify-center gap-3 border-border border-y bg-muted p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CameraIcon />
            </div>
            <div>
              <p className="font-medium text-foreground">Foto do Street View indisponível</p>
              <p className="mt-1 max-w-md text-muted-foreground text-sm">
                Configure uma chave pública restrita do Google Maps para exibir a imagem diretamente
                no sistema.
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-4 text-muted-foreground text-xs">
          <span>
            Coordenadas: {point.latitude}, {point.longitude}
          </span>
          <Button
            nativeButton={false}
            render={
              <a
                href={getStreetViewUrl(point)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Abrir Street View de ${point.empreendimento}`}
              >
                <ExternalLinkIcon data-icon="inline-start" />
                Abrir no Google
              </a>
            }
            size="sm"
            variant="outline"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StreetViewThumbnail({
  compact = false,
  googleMapsApiKey,
  point,
}: {
  compact?: boolean
  googleMapsApiKey?: string | undefined
  point: MapPoint
}) {
  const [hasImageError, setHasImageError] = useState(false)
  const imageUrl = getStreetViewStaticImageUrl(
    point,
    googleMapsApiKey,
    compact ? '240x160' : '320x200',
  )
  const shouldShowImage = imageUrl && !hasImageError

  return (
    <span
      className={cn(
        'relative block shrink-0 overflow-hidden rounded-lg border border-border bg-muted',
        compact ? 'h-16 w-20' : 'h-[4.5rem] w-24',
      )}
    >
      {shouldShowImage ? (
        <img
          alt={`Street View de ${point.empreendimento}`}
          className="size-full object-cover"
          loading="lazy"
          onError={() => setHasImageError(true)}
          referrerPolicy="strict-origin-when-cross-origin"
          src={imageUrl}
        />
      ) : (
        <span className="flex size-full items-center justify-center bg-primary/10 text-primary">
          <CameraIcon />
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/55 px-2 py-1 font-medium text-[0.7rem] text-white">
        <CameraIcon />
        Street View
      </span>
    </span>
  )
}

function MapIdlePanel() {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MapIcon />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Explore o mapa</h2>
          <p className="mt-1 text-muted-foreground text-sm leading-6">
            Clique em um ponto ou agrupamento para navegar. Os detalhes do processo aparecem apenas
            após selecionar um ponto ou buscar diretamente por processo, protocolo ou AVCB.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <div className="grid gap-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-2">
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="size-2 rounded-full bg-primary" />
            AVCB válido
          </span>
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="size-2 rounded-full bg-destructive" />
            Precisa de atenção
          </span>
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="size-2 rounded-full bg-amber-600" />
            Aguardando vistoria
          </span>
          <span className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="size-2 rounded-full bg-sky-600" />
            Vistoria em andamento
          </span>
        </div>
      </div>
    </div>
  )
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<string | [string, string]>
  value: string
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} onValueChange={(nextValue) => nextValue && onChange(nextValue)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione">{getSelectValueLabel(options, value)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={getSelectOptionValue(option)} value={getSelectOptionValue(option)}>
                {getSelectOptionLabel(option)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

function getSelectOptionValue(option: string | [string, string]) {
  return Array.isArray(option) ? option[0] : option
}

function getSelectOptionLabel(option: string | [string, string]) {
  return Array.isArray(option) ? option[1] : option
}

function getSelectValueLabel(options: Array<string | [string, string]>, value: string) {
  const option = options.find((item) => getSelectOptionValue(item) === value)

  return option ? getSelectOptionLabel(option) : value
}

function InfoGrid({
  className,
  dense = false,
  items,
}: {
  className?: string
  dense?: boolean
  items: Array<[string, string]>
}) {
  return (
    <div className={cn('grid gap-2 md:grid-cols-2', className)}>
      {items.map(([label, value]) => (
        <InfoBox dense={dense} key={`${label}-${value}`} label={label} value={value} />
      ))}
    </div>
  )
}

function InfoBox({
  dense = false,
  label,
  value,
}: {
  dense?: boolean
  label: string
  value: string
}) {
  return (
    <div
      className={cn(
        'min-w-0 border border-border bg-card',
        dense ? 'rounded-md p-1.5' : 'rounded-xl p-2.5',
      )}
    >
      <span
        className={cn(
          'block truncate font-medium text-muted-foreground uppercase',
          dense ? 'text-[0.62rem]' : 'text-xs',
        )}
      >
        {label}
      </span>
      <strong
        className={cn(
          'mt-0.5 block break-words font-medium leading-tight',
          dense ? 'text-xs' : 'text-sm',
        )}
      >
        {value || '-'}
      </strong>
    </div>
  )
}

function getMapStatusBadgeClass(status: string) {
  return cn(
    'inline-flex rounded-full border px-2.5 py-1 font-medium text-xs',
    status === 'AVCB válido' && 'border-primary/30 bg-primary/10 text-primary',
    status === 'Precisa de atenção' && 'border-destructive/30 bg-destructive/10 text-destructive',
    status === 'Aguardando vistoria' && 'border-amber-500/30 bg-amber-500/10 text-amber-700',
    status === 'Vistoria em andamento' && 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  )
}

function MapStatusIcon({ status }: { status: MapStatus }) {
  if (status === 'AVCB válido') {
    return <CheckCircle2Icon className="text-primary" />
  }

  if (status === 'Aguardando vistoria') {
    return <ClockIcon className="text-amber-700" />
  }

  if (status === 'Vistoria em andamento') {
    return <ActivityIcon className="text-sky-700" />
  }

  return <ShieldAlertIcon className="text-destructive" />
}

function createPointTooltipElement({
  municipio,
  situacaoMapa,
  title,
}: {
  municipio: string
  situacaoMapa: string
  title: string
}) {
  const container = document.createElement('div')
  const titleElement = document.createElement('strong')
  const metaElement = document.createElement('span')
  const statusElement = document.createElement('span')

  container.className = 'grid max-w-64 gap-1 p-1 text-sm'
  titleElement.className = 'font-medium text-foreground'
  metaElement.className = 'text-muted-foreground text-xs'
  statusElement.className = getMapStatusBadgeClass(situacaoMapa)

  titleElement.textContent = title
  metaElement.textContent = municipio ? `${municipio}/PE` : 'Pernambuco'
  statusElement.textContent = situacaoMapa

  container.append(titleElement, metaElement, statusElement)

  return container
}

function applySelectedPointPaint(map: MapLibreMap, selectedPointId: string) {
  if (!map.getLayer('sac-unclustered-point')) {
    return
  }

  if (map.getLayer('sac-selected-point-halo')) {
    map.setFilter('sac-selected-point-halo', [
      'all',
      ['!', ['has', 'point_count']],
      ['==', ['get', 'id'], selectedPointId],
    ])
  }

  map.setPaintProperty('sac-unclustered-point', 'circle-stroke-width', [
    'case',
    ['==', ['get', 'id'], selectedPointId],
    4,
    2,
  ])
  map.setPaintProperty('sac-unclustered-point', 'circle-radius', [
    'case',
    ['==', ['get', 'id'], selectedPointId],
    11,
    ['interpolate', ['linear'], ['zoom'], 5, 5, 8, 7, 12, 10],
  ])
  map.setPaintProperty('sac-unclustered-point', 'circle-stroke-color', [
    'case',
    ['==', ['get', 'id'], selectedPointId],
    '#111827',
    '#ffffff',
  ])
}

function createPointCollection(points: MapPoint[]): PointFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: points.map((point) => ({
      type: 'Feature',
      id: point.id,
      properties: {
        id: point.id,
        municipio: point.municipio,
        situacaoMapa: point.situacaoMapa,
        title: point.empreendimento,
      },
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude],
      },
    })),
  }
}

function createSimulatedRecifePoints(total: number): MapPoint[] {
  const statusCycle: MapStatus[] = [
    'AVCB válido',
    'Precisa de atenção',
    'Aguardando vistoria',
    'Vistoria em andamento',
  ]
  const points: MapPoint[] = []
  const maxAttempts = total * 80
  let attempt = 0

  while (points.length < total && attempt < maxAttempts) {
    const longitude = roundCoordinate(
      recifeBounds.minLng + seededUnit(attempt, 17) * (recifeBounds.maxLng - recifeBounds.minLng),
    )
    const latitude = roundCoordinate(
      recifeBounds.minLat + seededUnit(attempt, 31) * (recifeBounds.maxLat - recifeBounds.minLat),
    )

    attempt += 1

    if (!isPointInsidePolygons([longitude, latitude], recifePolygons)) {
      continue
    }

    points.push(createSimulatedRecifePoint(points.length, latitude, longitude, statusCycle))
  }

  while (points.length < total) {
    points.push(
      createSimulatedRecifePoint(
        points.length,
        recifeMapCenter[1],
        recifeMapCenter[0],
        statusCycle,
      ),
    )
  }

  return points
}

function createSimulatedRecifePoint(
  index: number,
  latitude: number,
  longitude: number,
  statusCycle: MapStatus[],
): MapPoint {
  const sequence = index + 1
  const status = statusCycle[index % statusCycle.length] ?? 'Precisa de atenção'
  const sequenceLabel = String(sequence).padStart(4, '0')

  return {
    id: `recife-sim-${sequenceLabel}`,
    processId: `PROC-REC-SIM-${sequenceLabel}`,
    protocolo: `SAC-2026-REC-${sequenceLabel}`,
    avcb: status === 'AVCB válido' ? `AVCB-REC-2026-${sequenceLabel}` : 'Não emitido',
    empreendimento: `Ponto Simulado Recife ${sequenceLabel}`,
    empresa: `Operação Simulada Recife ${String((index % 80) + 1).padStart(2, '0')}`,
    endereco: getRecifeSimulatedAddress(index),
    municipio: 'Recife',
    uf: 'PE',
    latitude,
    longitude,
    situacaoMapa: status,
    situacaoProcesso: getSimulatedProcessStatus(status),
    validade: status === 'AVCB válido' ? getSimulatedValidity(index) : 'Não aplicável',
    ultimaMovimentacao: getSimulatedLastMovement(status),
  }
}

function extractBoundaryPolygons(boundary: GeoJsonBoundaryCollection): GeoJsonPolygonCollection {
  return boundary.features.flatMap((feature) => {
    if (feature.geometry.type === 'Polygon') {
      return [feature.geometry.coordinates as GeoJsonPolygon]
    }

    return feature.geometry.coordinates as GeoJsonPolygonCollection
  })
}

function getPolygonBounds(polygons: GeoJsonPolygonCollection) {
  const coordinates = polygons.flatMap((polygon) => polygon.flat())

  return coordinates.reduce(
    (bounds, [longitude, latitude]) => ({
      minLng: Math.min(bounds.minLng, longitude),
      maxLng: Math.max(bounds.maxLng, longitude),
      minLat: Math.min(bounds.minLat, latitude),
      maxLat: Math.max(bounds.maxLat, latitude),
    }),
    {
      minLng: Number.POSITIVE_INFINITY,
      maxLng: Number.NEGATIVE_INFINITY,
      minLat: Number.POSITIVE_INFINITY,
      maxLat: Number.NEGATIVE_INFINITY,
    },
  )
}

function isPointInsidePolygons(point: [number, number], polygons: GeoJsonPolygonCollection) {
  return polygons.some((polygon) => isPointInsidePolygon(point, polygon))
}

function isPointInsidePolygon(point: [number, number], polygon: GeoJsonPolygon) {
  const [outerRing, ...holes] = polygon

  if (!outerRing || !isPointInsideRing(point, outerRing)) {
    return false
  }

  return !holes.some((hole) => isPointInsideRing(point, hole))
}

function isPointInsideRing([longitude, latitude]: [number, number], ring: GeoJsonLinearRing) {
  let isInside = false

  for (
    let index = 0, previousIndex = ring.length - 1;
    index < ring.length;
    previousIndex = index, index += 1
  ) {
    const [currentLng, currentLat] = ring[index] ?? [0, 0]
    const [previousLng, previousLat] = ring[previousIndex] ?? [0, 0]
    const crossesLatitude = currentLat > latitude !== previousLat > latitude
    const intersectionLng =
      ((previousLng - currentLng) * (latitude - currentLat)) / (previousLat - currentLat) +
      currentLng

    if (crossesLatitude && longitude < intersectionLng) {
      isInside = !isInside
    }
  }

  return isInside
}

function seededUnit(index: number, salt: number) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43_758.5453

  return value - Math.floor(value)
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6))
}

function getRecifeSimulatedAddress(index: number) {
  const neighborhoods = [
    'Boa Viagem',
    'Imbiribeira',
    'Afogados',
    'Casa Amarela',
    'Madalena',
    'Santo Amaro',
    'Iputinga',
    'Torre',
    'Várzea',
    'Pina',
  ]

  return `Recife - ${neighborhoods[index % neighborhoods.length]}`
}

function getSimulatedProcessStatus(status: MapStatus) {
  if (status === 'AVCB válido') {
    return 'Processo concluído'
  }

  if (status === 'Aguardando vistoria') {
    return 'Aguardando vistoria'
  }

  if (status === 'Vistoria em andamento') {
    return 'Vistoria em andamento'
  }

  return 'Pendência em análise'
}

function getSimulatedLastMovement(status: MapStatus) {
  if (status === 'AVCB válido') {
    return 'AVCB emitido'
  }

  if (status === 'Aguardando vistoria') {
    return 'Vistoria solicitada'
  }

  if (status === 'Vistoria em andamento') {
    return 'Equipe em atendimento'
  }

  return 'Exigência registrada'
}

function getSimulatedValidity(index: number) {
  const month = String((index % 12) + 1).padStart(2, '0')
  const day = String((index % 27) + 1).padStart(2, '0')

  return `${day}/${month}/2028`
}

function findDirectSearchPoint(points: MapPoint[], search: string) {
  const query = normalizeSearchTerm(search)

  if (query.length < 6) {
    return null
  }

  return (
    points.find((point) =>
      [point.processId, point.protocolo, point.avcb]
        .map(normalizeSearchTerm)
        .some((value) => value.includes(query)),
    ) ?? null
  )
}

function normalizeSearchTerm(value: string) {
  return value
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function getStreetViewUrl(point: MapPoint) {
  const params = new URLSearchParams({
    api: '1',
    map_action: 'pano',
    viewpoint: `${point.latitude},${point.longitude}`,
  })

  return `https://www.google.com/maps/@?${params.toString()}`
}

function getStreetViewStaticImageUrl(
  point: MapPoint,
  googleMapsApiKey: string | undefined,
  size: string,
) {
  const apiKey = googleMapsApiKey?.trim()

  if (!apiKey) {
    return null
  }

  const params = new URLSearchParams({
    key: apiKey,
    location: `${point.latitude},${point.longitude}`,
    radius: '80',
    return_error_code: 'true',
    size,
  })

  return `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`
}

function getStreetViewEmbedUrl(point: MapPoint, googleMapsApiKey: string | undefined) {
  const apiKey = googleMapsApiKey?.trim()

  if (!apiKey) {
    return null
  }

  const params = new URLSearchParams({
    key: apiKey,
    location: `${point.latitude},${point.longitude}`,
    fov: '80',
    pitch: '0',
  })

  return `https://www.google.com/maps/embed/v1/streetview?${params.toString()}`
}

export { OperationalMapPage }
