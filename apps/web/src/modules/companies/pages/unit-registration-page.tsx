import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  type CreateUnidadeResult,
  createUnidade,
  listEmpresaCnaes,
  type UnidadeCnae,
} from '@/modules/shared/api/unidade'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Field, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import { cn } from '@/modules/shared/lib/utils'

const BAND_RANK: Record<string, number> = { I: 0, undetermined: 1, II: 2, III: 3 }

function pickHighestRiskCnae(cnaes: UnidadeCnae[]): UnidadeCnae | undefined {
  return [...cnaes].sort((a, b) => (BAND_RANK[b.band] ?? 0) - (BAND_RANK[a.band] ?? 0))[0]
}

export function UnidadeRegistrationPage({ empresaId }: { empresaId: string }) {
  const navigate = useNavigate()
  const [cnaes, setCnaes] = useState<UnidadeCnae[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [nome, setNome] = useState('')
  const [area, setArea] = useState('')
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [uf, setUf] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<CreateUnidadeResult | null>(null)

  useEffect(() => {
    let active = true
    if (!empresaId) {
      setLoadError('Empresa não informada. Cadastre uma empresa primeiro.')
      setLoading(false)
      return
    }
    listEmpresaCnaes(empresaId)
      .then((data) => {
        if (!active) return
        setCnaes(data.cnaes)
        // Start with nothing selected — the contribuinte must pick which CNAEs are
        // actually exercised at this unit (they are not all necessarily present).
        setSelected(new Set())
        // Pre-fill with the company address as a convenience — the unit's own
        // address is editable (a unit is often at a different site).
        if (data.empresa) {
          setCep(data.empresa.cep ?? '')
          setLogradouro(data.empresa.logradouro ?? '')
          setNumero(data.empresa.numero ?? '')
          setComplemento(data.empresa.complemento ?? '')
          setBairro(data.empresa.bairro ?? '')
          setMunicipio(data.empresa.municipio ?? '')
          setUf(data.empresa.uf ?? '')
        }
        setLoading(false)
      })
      .catch((error: Error) => {
        if (!active) return
        setLoadError(error.message)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [empresaId])

  function toggle(cnaeId: string) {
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(cnaeId)) {
        next.delete(cnaeId)
      } else {
        next.add(cnaeId)
      }
      return next
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const body: Parameters<typeof createUnidade>[1] = { cnaeIds: [...selected] }
      if (nome.trim()) body.nome = nome.trim()
      if (area.trim()) body.areaConstruida = area.trim()
      // Always send the (editable) address — so the unit keeps its own, not the HQ's.
      body.cep = cep.trim()
      body.logradouro = logradouro.trim()
      body.numero = numero.trim()
      body.complemento = complemento.trim()
      body.bairro = bairro.trim()
      body.municipio = municipio.trim()
      body.uf = uf.trim()
      const created = await createUnidade(empresaId, body)
      setResult(created)
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
          to="/dashboard"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar
        </Link>

        <header className="flex flex-col gap-2">
          <h1 className="font-semibold text-3xl tracking-tight">Cadastrar unidade</h1>
          <p className="text-muted-foreground">
            A unidade é o objeto do processo. Confirme quais CNAEs da empresa são exercidos nesta
            unidade e informe a área construída. A classificação de risco é feita depois, ao iniciar
            o processo e responder às perguntas.
          </p>
        </header>

        {result ? (
          <Card className="gap-4 rounded-md py-5 shadow-none">
            <CardHeader className="px-5">
              <CardTitle>Unidade criada</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-5">
              <p className="text-sm">
                <strong>{result.nome ?? 'Unidade'}</strong> criada com {result.cnaes.length} CNAE(s)
                confirmado(s). Para classificar o risco, inicie o processo e responda às perguntas.
              </p>
              <div className="flex flex-col gap-1.5">
                {result.cnaes.map((cnae) => (
                  <div
                    key={cnae.cnaeId}
                    className="flex items-center gap-3 rounded-md border p-2 text-sm"
                  >
                    <span className="font-medium tabular-nums">{cnae.codigo}</span>
                    <span className="flex-1 text-muted-foreground">{cnae.descricao}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={() => setResult(null)}>
                  Cadastrar outra unidade
                </Button>
                {(() => {
                  const top = pickHighestRiskCnae(result.cnaes)
                  return (
                    <Button
                      type="button"
                      onClick={() =>
                        void navigate({
                          to: '/classifier',
                          search: top
                            ? { atividade: top.codigo, unidadeId: result.unidadeId }
                            : { unidadeId: result.unidadeId },
                        })
                      }
                    >
                      Iniciar processo (classificar risco)
                    </Button>
                  )
                })()}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void navigate({ to: '/dashboard' })}
                >
                  Concluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="gap-4 rounded-md py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle>Dados da unidade</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 sm:grid-cols-2">
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="nome">Nome da unidade</FieldLabel>
                  <Input
                    id="nome"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Ex.: Loja Centro"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="area">Área construída (m²)</FieldLabel>
                  <Input
                    id="area"
                    inputMode="numeric"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Ex.: 350"
                    value={area}
                    onChange={(event) => setArea(event.target.value.replace(/[^\d.,]/g, ''))}
                  />
                </Field>
              </CardContent>
            </Card>

            <Card className="gap-4 rounded-md py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle>Endereço da unidade</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Preenchemos com o endereço da empresa por conveniência, mas a unidade pode ficar
                  em outro local — <strong>edite se necessário</strong>.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 sm:grid-cols-2">
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="cep">CEP</FieldLabel>
                  <Input
                    id="cep"
                    inputMode="numeric"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="50000-000"
                    value={cep}
                    onChange={(event) => setCep(event.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="logradouro">Logradouro</FieldLabel>
                  <Input
                    id="logradouro"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Ex.: Avenida Norte"
                    value={logradouro}
                    onChange={(event) => setLogradouro(event.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="numero">Número</FieldLabel>
                  <Input
                    id="numero"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Ex.: 1500"
                    value={numero}
                    onChange={(event) => setNumero(event.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="complemento">Complemento</FieldLabel>
                  <Input
                    id="complemento"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Ex.: Loja 2"
                    value={complemento}
                    onChange={(event) => setComplemento(event.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
                  <Input
                    id="bairro"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Ex.: Boa Viagem"
                    value={bairro}
                    onChange={(event) => setBairro(event.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="municipio">Município</FieldLabel>
                  <Input
                    id="municipio"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Ex.: Recife"
                    value={municipio}
                    onChange={(event) => setMunicipio(event.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="uf">UF</FieldLabel>
                  <Input
                    id="uf"
                    maxLength={2}
                    className="h-10 rounded-md bg-input-background"
                    placeholder="PE"
                    value={uf}
                    onChange={(event) =>
                      setUf(
                        event.target.value
                          .replace(/[^a-z]/gi, '')
                          .slice(0, 2)
                          .toUpperCase(),
                      )
                    }
                  />
                </Field>
              </CardContent>
            </Card>

            <Card className="gap-4 rounded-md py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle>
                  CNAEs exercidos nesta unidade
                  {cnaes.length ? ` (${selected.size}/${cnaes.length})` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 px-5">
                {loading ? (
                  <p className="text-muted-foreground text-sm">Carregando CNAEs…</p>
                ) : null}
                {loadError ? <p className="text-destructive text-sm">{loadError}</p> : null}
                {!loading && !loadError && cnaes.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Esta empresa não possui CNAEs cadastrados.
                  </p>
                ) : null}
                {cnaes.map((cnae) => (
                  <label
                    key={cnae.cnaeId}
                    className="flex cursor-pointer items-center gap-3 rounded-md border p-2.5 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={selected.has(cnae.cnaeId)}
                      onChange={() => toggle(cnae.cnaeId)}
                    />
                    <span className="font-medium tabular-nums">{cnae.codigo}</span>
                    <span className="flex-1 text-muted-foreground">{cnae.descricao}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigate({ to: '/dashboard' })}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={() => void handleSubmit()}
                isLoading={submitting}
                disabled={loading || !!loadError || selected.size === 0}
              >
                Criar unidade
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
