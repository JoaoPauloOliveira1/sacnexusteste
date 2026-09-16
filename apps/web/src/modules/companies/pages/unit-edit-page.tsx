import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  getUnidade,
  lookupCep,
  type UnidadeDetail,
  updateUnidade,
} from '@/modules/shared/api/unidade'
import { LocationMap } from '@/modules/shared/components/location-map'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Field, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shared/components/ui/select'
import { formatCep } from '@/modules/shared/lib/formatters/format-cep'
import { cn } from '@/modules/shared/lib/utils'

const TIPOS_EXPLORACAO = [
  'Comércio',
  'Serviço',
  'Indústria',
  'Depósito/Armazenagem',
  'Residencial',
  'Misto',
  'Outro',
]

export function UnitEditPage({ unidadeId }: { unidadeId: string }) {
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: ['unidade', unidadeId],
    queryFn: () => getUnidade(unidadeId),
    enabled: Boolean(unidadeId),
    retry: false,
  })

  const [form, setForm] = useState<UnidadeDetail | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (query.data) setForm(query.data)
  }, [query.data])

  // When the unit already has a CEP, resolve its coordinates once (for the map),
  // without touching the address fields the user may edit.
  useEffect(() => {
    const cep = query.data?.cep
    if (cep?.replace(/\D/g, '').length !== 8) return
    let active = true
    void lookupCep(cep)
      .then((address) => {
        if (active && address.lat != null && address.lng != null) {
          setCoords({ lat: address.lat, lng: address.lng })
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [query.data?.cep])

  function set<K extends keyof UnidadeDetail>(key: K, value: UnidadeDetail[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  async function handleCepLookup() {
    if (!form?.cep) return
    setCepLoading(true)
    setCepError(null)
    try {
      const address = await lookupCep(form.cep)
      setForm((prev) =>
        prev
          ? {
              ...prev,
              cep: formatCep(address.cep),
              logradouro: address.logradouro || prev.logradouro,
              bairro: address.bairro || prev.bairro,
              municipio: address.municipio || prev.municipio,
              uf: address.uf || prev.uf,
            }
          : prev,
      )
      if (address.lat != null && address.lng != null) {
        setCoords({ lat: address.lat, lng: address.lng })
      }
    } catch (error) {
      setCepError((error as Error).message)
    } finally {
      setCepLoading(false)
    }
  }

  async function handleSave() {
    if (!form) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await updateUnidade(unidadeId, {
        nome: form.nome ?? '',
        cep: form.cep ?? '',
        logradouro: form.logradouro ?? '',
        numero: form.numero ?? '',
        complemento: form.complemento ?? '',
        bairro: form.bairro ?? '',
        municipio: form.municipio ?? '',
        uf: form.uf ?? '',
        areaConstruida: form.areaConstruida ?? '',
        ...(form.pavimentos != null ? { pavimentos: form.pavimentos } : {}),
        ...(form.ocupacao != null ? { ocupacao: form.ocupacao } : {}),
        tipoExploracao: form.tipoExploracao ?? '',
      })
      void navigate({ to: '/companies/units' })
    } catch (error) {
      setSubmitError((error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link
          to="/companies/units"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar
        </Link>

        {query.isLoading ? <p className="text-muted-foreground text-sm">Carregando…</p> : null}
        {query.isError ? (
          <p className="text-destructive text-sm">{(query.error as Error).message}</p>
        ) : null}

        {form ? (
          <>
            <header className="flex flex-col gap-2">
              <h1 className="font-semibold text-3xl tracking-tight">
                {form.isMatriz ? 'Completar a Matriz' : 'Editar unidade'}
              </h1>
              <p className="text-muted-foreground">
                {form.completa
                  ? 'Revise os dados desta unidade.'
                  : 'Preencha os dados que faltam (endereço, área, pavimentos, ocupação e tipo) para completar o cadastro.'}
              </p>
            </header>

            <Card className="gap-4 rounded-md py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle>Identificação e endereço</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 sm:grid-cols-2">
                <Field className="gap-1.5 sm:col-span-2">
                  <FieldLabel htmlFor="nome">Nome da unidade</FieldLabel>
                  <Input
                    id="nome"
                    className="h-10 rounded-md bg-input-background"
                    value={form.nome ?? ''}
                    onChange={(e) => set('nome', e.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="cep">CEP</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      inputMode="numeric"
                      className="h-10 rounded-md bg-input-background"
                      placeholder="50000-000"
                      value={form.cep ?? ''}
                      onChange={(e) => set('cep', formatCep(e.target.value))}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleCepLookup()}
                      isLoading={cepLoading}
                    >
                      <SearchIcon />
                    </Button>
                  </div>
                  {cepError ? <p className="text-destructive text-xs">{cepError}</p> : null}
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="logradouro">Logradouro</FieldLabel>
                  <Input
                    id="logradouro"
                    className="h-10 rounded-md bg-input-background"
                    value={form.logradouro ?? ''}
                    onChange={(e) => set('logradouro', e.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="numero">Número</FieldLabel>
                  <Input
                    id="numero"
                    className="h-10 rounded-md bg-input-background"
                    value={form.numero ?? ''}
                    onChange={(e) => set('numero', e.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="complemento">Complemento</FieldLabel>
                  <Input
                    id="complemento"
                    className="h-10 rounded-md bg-input-background"
                    value={form.complemento ?? ''}
                    onChange={(e) => set('complemento', e.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
                  <Input
                    id="bairro"
                    className="h-10 rounded-md bg-input-background"
                    value={form.bairro ?? ''}
                    onChange={(e) => set('bairro', e.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="municipio">Município</FieldLabel>
                  <Input
                    id="municipio"
                    className="h-10 rounded-md bg-input-background"
                    value={form.municipio ?? ''}
                    onChange={(e) => set('municipio', e.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="uf">UF</FieldLabel>
                  <Input
                    id="uf"
                    maxLength={2}
                    className="h-10 rounded-md bg-input-background"
                    value={form.uf ?? ''}
                    onChange={(e) =>
                      set(
                        'uf',
                        e.target.value
                          .replace(/[^a-z]/gi, '')
                          .slice(0, 2)
                          .toUpperCase(),
                      )
                    }
                  />
                </Field>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-muted-foreground text-xs">Localização no mapa</span>
                  {coords ? (
                    <LocationMap lat={coords.lat} lng={coords.lng} />
                  ) : (
                    <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-muted-foreground text-xs">
                      Busque o CEP para posicionar a unidade no mapa.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="gap-4 rounded-md py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle>Características do local</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 sm:grid-cols-2">
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="area">Área construída (m²)</FieldLabel>
                  <Input
                    id="area"
                    inputMode="decimal"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Ex.: 350"
                    value={form.areaConstruida ?? ''}
                    onChange={(e) => set('areaConstruida', e.target.value.replace(/[^\d.,]/g, ''))}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="pavimentos">Número de pavimentos</FieldLabel>
                  <Input
                    id="pavimentos"
                    inputMode="numeric"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Térreo = 1"
                    value={form.pavimentos ?? ''}
                    onChange={(e) => {
                      const n = e.target.value.replace(/\D/g, '')
                      set('pavimentos', n ? Number(n) : null)
                    }}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="ocupacao">Ocupação no pico (pessoas)</FieldLabel>
                  <Input
                    id="ocupacao"
                    inputMode="numeric"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Funcionários + clientes"
                    value={form.ocupacao ?? ''}
                    onChange={(e) => {
                      const n = e.target.value.replace(/\D/g, '')
                      set('ocupacao', n ? Number(n) : null)
                    }}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="tipo">Tipo de exploração do local</FieldLabel>
                  <Select
                    value={form.tipoExploracao || null}
                    onValueChange={(value) => set('tipoExploracao', value)}
                  >
                    <SelectTrigger
                      id="tipo"
                      className="h-10 w-full rounded-md bg-input-background px-3"
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_EXPLORACAO.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </CardContent>
            </Card>

            {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigate({ to: '/companies/units' })}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={() => void handleSave()}
                isLoading={submitting}
              >
                Salvar
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  )
}
