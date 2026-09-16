import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { useState } from 'react'

import { createEvento } from '@/modules/shared/api/evento'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Field, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import { cn } from '@/modules/shared/lib/utils'

export function EventoRegistrationPage() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [solicitanteNome, setSolicitanteNome] = useState('')
  const [solicitanteCpf, setSolicitanteCpf] = useState('')
  const [risco, setRisco] = useState<'II' | 'III'>('II')
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [bairro, setBairro] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [uf, setUf] = useState('')
  const [inicioEm, setInicioEm] = useState('')
  const [terminoEm, setTerminoEm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = inicioEm && terminoEm && municipio.trim()

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const { eventoId } = await createEvento({
        nome: nome.trim() || undefined,
        solicitanteNome: solicitanteNome.trim() || undefined,
        solicitanteCpf: solicitanteCpf.trim() || undefined,
        risco,
        cep: cep.trim() || undefined,
        logradouro: logradouro.trim() || undefined,
        numero: numero.trim() || undefined,
        bairro: bairro.trim() || undefined,
        municipio: municipio.trim() || undefined,
        uf: uf.trim() || undefined,
        inicioEm,
        terminoEm,
      })
      void navigate({ to: '/companies/processo', search: { eventoId, risco } })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link
          to="/companies/eventos"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar
        </Link>

        <header className="flex flex-col gap-2">
          <h1 className="font-semibold text-3xl tracking-tight">Cadastrar evento temporário</h1>
          <p className="text-muted-foreground">
            Sem unidade — informe o endereço e o período (até 6 meses). Eventos são sempre Risco II
            (vistoria) ou III (projeto). Depois você anexa os documentos e paga para protocolar.
          </p>
        </header>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <Card className="gap-4 rounded-md py-5 shadow-none">
          <CardHeader className="px-5">
            <CardTitle>Dados do evento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 px-5 sm:grid-cols-2">
            <Field className="gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="nome">Nome do evento</FieldLabel>
              <Input
                id="nome"
                className="h-10 rounded-md bg-input-background"
                placeholder="Ex.: Festa Junina do Bairro"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="sol">Solicitante</FieldLabel>
              <Input
                id="sol"
                className="h-10 rounded-md bg-input-background"
                placeholder="Nome completo"
                value={solicitanteNome}
                onChange={(e) => setSolicitanteNome(e.target.value)}
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="cpf">CPF do solicitante</FieldLabel>
              <Input
                id="cpf"
                className="h-10 rounded-md bg-input-background"
                placeholder="000.000.000-00"
                value={solicitanteCpf}
                onChange={(e) => setSolicitanteCpf(e.target.value)}
              />
            </Field>
            <Field className="gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor="risco">Classificação de risco</FieldLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={risco === 'II' ? 'default' : 'outline'}
                  onClick={() => setRisco('II')}
                >
                  Risco II (vistoria)
                </Button>
                <Button
                  type="button"
                  variant={risco === 'III' ? 'default' : 'outline'}
                  onClick={() => setRisco('III')}
                >
                  Risco III (projeto)
                </Button>
              </div>
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="inicio">Início</FieldLabel>
              <Input
                id="inicio"
                type="date"
                className="h-10 rounded-md bg-input-background"
                value={inicioEm}
                onChange={(e) => setInicioEm(e.target.value)}
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="termino">Término</FieldLabel>
              <Input
                id="termino"
                type="date"
                className="h-10 rounded-md bg-input-background"
                value={terminoEm}
                onChange={(e) => setTerminoEm(e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="gap-4 rounded-md py-5 shadow-none">
          <CardHeader className="px-5">
            <CardTitle>Endereço do evento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 px-5 sm:grid-cols-2">
            <Field className="gap-1.5">
              <FieldLabel htmlFor="cep">CEP</FieldLabel>
              <Input
                id="cep"
                className="h-10 rounded-md bg-input-background"
                placeholder="50000-000"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="log">Logradouro</FieldLabel>
              <Input
                id="log"
                className="h-10 rounded-md bg-input-background"
                placeholder="Ex.: Praça Central"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="num">Número</FieldLabel>
              <Input
                id="num"
                className="h-10 rounded-md bg-input-background"
                placeholder="s/n"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
              <Input
                id="bairro"
                className="h-10 rounded-md bg-input-background"
                placeholder="Ex.: Centro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="mun">Município</FieldLabel>
              <Input
                id="mun"
                className="h-10 rounded-md bg-input-background"
                placeholder="Ex.: Recife"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
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
                onChange={(e) =>
                  setUf(
                    e.target.value
                      .replace(/[^a-z]/gi, '')
                      .slice(0, 2)
                      .toUpperCase(),
                  )
                }
              />
            </Field>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="button"
            size="lg"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            isLoading={submitting}
          >
            Criar evento e iniciar processo
          </Button>
        </div>
      </div>
    </main>
  )
}
