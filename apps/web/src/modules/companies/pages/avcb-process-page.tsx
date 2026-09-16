import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon, CheckIcon, FileUpIcon, Loader2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  confirmProcessoPayment,
  getEventoProcesso,
  getUnidadeProcesso,
  startAvcb,
  startAvcbEvento,
} from '@/modules/shared/api/avcb'
import { getUploadSignedUrl, uploadDocumento } from '@/modules/shared/api/upload'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Field, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import { cn } from '@/modules/shared/lib/utils'

type DocSpec = { tipo: string; label: string; obrigatorio: boolean }

// Document sets per N1-01 (Risco II = vistoria, Risco III = projeto).
const DOCS_II: DocSpec[] = [
  { tipo: 'documento_oficial', label: 'Documento oficial com RG e CPF', obrigatorio: true },
  { tipo: 'cnpj', label: 'CNPJ', obrigatorio: true },
  { tipo: 'contrato_social', label: 'Contrato social da empresa', obrigatorio: true },
  {
    tipo: 'croqui_georref',
    label: 'Croqui ou foto de georreferenciamento (com pontos de referência e ruas)',
    obrigatorio: true,
  },
  {
    tipo: 'fotos',
    label: 'Fotos (fachada + interior: extintores, sinalização, iluminação de emergência)',
    obrigatorio: true,
  },
  {
    tipo: 'declaracao_anexo_c',
    label: 'Declaração de Responsabilidade Risco II (Anexo C)',
    obrigatorio: true,
  },
  { tipo: 'nf_extintores', label: 'Nota fiscal dos extintores (na validade)', obrigatorio: true },
  {
    tipo: 'ata_posse',
    label: 'Ata de posse / ato de nomeação (órgãos públicos)',
    obrigatorio: false,
  },
  { tipo: 'procuracao', label: 'Procuração (se aplicável)', obrigatorio: false },
]

const DOCS_III: DocSpec[] = [
  { tipo: 'documento_oficial', label: 'Documento oficial com RG e CPF', obrigatorio: true },
  { tipo: 'cnpj', label: 'CNPJ', obrigatorio: true },
  { tipo: 'contrato_social', label: 'Contrato social da empresa', obrigatorio: true },
  {
    tipo: 'art_rrt_trt',
    label: 'Documento de responsabilidade técnica (ART/RRT/TRT)',
    obrigatorio: true,
  },
  {
    tipo: 'memorial_projeto',
    label: 'Memorial do Projeto de Segurança Contra Incêndio aprovado pelo CBMPE',
    obrigatorio: true,
  },
  { tipo: 'nf_extintores', label: 'Nota fiscal dos extintores (na validade)', obrigatorio: true },
  {
    tipo: 'ata_posse',
    label: 'Ata de posse / ato de nomeação (órgãos públicos)',
    obrigatorio: false,
  },
  { tipo: 'procuracao', label: 'Procuração (se aplicável)', obrigatorio: false },
  { tipo: 'ar_avcb_condominio', label: 'AR/AVCB do condomínio (se aplicável)', obrigatorio: false },
]

type Attached = { key: string; fileName: string }

export function AvcbProcessPage({
  unidadeId,
  eventoId,
  risco,
}: {
  unidadeId?: string
  eventoId?: string
  risco: string
}) {
  const navigate = useNavigate()
  const band = risco === 'III' ? 'III' : 'II'
  const docs = band === 'III' ? DOCS_III : DOCS_II
  const subjectId = eventoId ?? unidadeId ?? ''
  const isEvento = Boolean(eventoId)

  const [step, setStep] = useState<'form' | 'payment' | 'done'>('form')
  const [tpei, setTpei] = useState('')
  const [pontoReferencia, setPontoReferencia] = useState('')
  const [horarioVistoriador, setHorarioVistoriador] = useState('')
  const [memorial, setMemorial] = useState('')
  const [veracidade, setVeracidade] = useState(false)
  const [attached, setAttached] = useState<Record<string, Attached>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [processoId, setProcessoId] = useState<string | null>(null)
  const [protocolo, setProtocolo] = useState<string | null>(null)
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [jaEnviado, setJaEnviado] = useState<{ id: string; fase: string } | null>(null)

  // Recover an in-progress process for this unit so the user does not re-type.
  useEffect(() => {
    let active = true
    if (!subjectId) {
      setLoadingExisting(false)
      return
    }
    const load = isEvento ? getEventoProcesso(subjectId) : getUnidadeProcesso(subjectId)
    load
      .then(({ processo }) => {
        if (!active || !processo) {
          if (active) setLoadingExisting(false)
          return
        }
        const d = processo.dadosComplementares ?? {}
        setTpei(String(d.tpei ?? ''))
        setPontoReferencia(String(d.pontoReferencia ?? ''))
        setHorarioVistoriador(String(d.horarioVistoriador ?? ''))
        setMemorial(String(d.memorial ?? ''))
        setVeracidade(Boolean(d.veracidade))
        const att: Record<string, Attached> = {}
        for (const doc of processo.documentos) {
          if (doc.key) att[doc.tipo] = { key: doc.key, fileName: doc.tipo }
        }
        setAttached(att)
        if (processo.fase === 'aguardando_pagamento') {
          setProcessoId(processo.id)
          setStep('payment')
        } else if (processo.fase === 'protocolado' || processo.fase === 'em_exigencia') {
          setJaEnviado({ id: processo.id, fase: processo.fase })
        }
        setLoadingExisting(false)
      })
      .catch(() => {
        if (active) setLoadingExisting(false)
      })
    return () => {
      active = false
    }
  }, [subjectId, isEvento])

  async function handleUpload(tipo: string, file: File | undefined) {
    if (!file) return
    setUploading(tipo)
    setError(null)
    try {
      const up = await uploadDocumento(file)
      setAttached((prev) => ({ ...prev, [tipo]: { key: up.key, fileName: up.fileName } }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(null)
    }
  }

  async function openDoc(key: string) {
    try {
      const url = await getUploadSignedUrl(key)
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const missingRequired = docs.filter((d) => d.obrigatorio && !attached[d.tipo])
  const canSubmit =
    veracidade &&
    pontoReferencia.trim() &&
    horarioVistoriador.trim() &&
    memorial.trim() &&
    missingRequired.length === 0

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const documentos = Object.entries(attached).map(([tipo, a]) => ({ tipo, key: a.key }))
      const body = {
        dadosComplementares: { tpei, pontoReferencia, horarioVistoriador, memorial, veracidade },
        documentos,
      }
      const result = isEvento
        ? await startAvcbEvento(subjectId, body)
        : await startAvcb(subjectId, body)
      setProcessoId(result.processoId)
      if (result.protocoloNumero) {
        setProtocolo(result.protocoloNumero)
        setStep('done')
      } else {
        setStep('payment')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePayment() {
    if (!processoId) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await confirmProcessoPayment(processoId)
      setProtocolo(result.protocoloNumero)
      setStep('done')
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
          to={isEvento ? '/companies/eventos' : '/companies/units'}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar
        </Link>

        <header className="flex flex-col gap-2">
          <h1 className="font-semibold text-3xl tracking-tight">
            Processo AVCB — Risco {band} ({band === 'III' ? 'projeto' : 'vistoria'})
          </h1>
          <p className="text-muted-foreground">
            Preencha as informações (norma N1-01), anexe os documentos (PDF ≤ 5 MB) e confirme o
            pagamento para protocolar. O pagamento é simulado por enquanto.
          </p>
        </header>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        {loadingExisting ? (
          <p className="text-muted-foreground text-sm">Recuperando o processo desta unidade…</p>
        ) : null}

        {jaEnviado ? (
          <Card className="gap-4 rounded-md py-5 shadow-none">
            <CardHeader className="px-5">
              <CardTitle>Processo já enviado</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-5 text-sm">
              <p>
                Esta unidade já tem um processo AVCB{' '}
                <strong>
                  {jaEnviado.fase === 'em_exigencia' ? 'em exigência' : 'protocolado'}
                </strong>
                . Você não precisa refazer — acompanhe pelo processo.
              </p>
              <div>
                <Link
                  to="/triagem/$processoId"
                  params={{ processoId: jaEnviado.id }}
                  className={buttonVariants({ className: 'rounded-md' })}
                >
                  Ver processo
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!loadingExisting && !jaEnviado && step === 'done' ? (
          <Card className="gap-4 rounded-md py-5 shadow-none">
            <CardHeader className="px-5">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckIcon className="size-5" /> Processo protocolado
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-5 text-sm">
              <p>
                Pagamento (simulado) confirmado e processo protocolado. Número do protocolo:{' '}
                <strong className="tabular-nums">{protocolo}</strong>.
              </p>
              <p className="text-muted-foreground">
                A triagem do CBMPE inicia a partir do protocolo. Você pode acompanhar o andamento na
                lista de unidades.
              </p>
              <div>
                <Button
                  type="button"
                  onClick={() =>
                    void navigate({ to: isEvento ? '/companies/eventos' : '/companies/units' })
                  }
                >
                  Concluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!loadingExisting && !jaEnviado && step === 'payment' ? (
          <Card className="gap-4 rounded-md py-5 shadow-none">
            <CardHeader className="px-5">
              <CardTitle>Pagamento da taxa de vistoria (simulado)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-5 text-sm">
              <p>
                Documentos enviados. O protocolo só é gerado após o pagamento confirmado. A
                integração bancária real será adicionada depois — por ora, confirme o pagamento
                simulado.
              </p>
              <div>
                <Button type="button" onClick={() => void handlePayment()} isLoading={submitting}>
                  Confirmar pagamento (simulado)
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!loadingExisting && !jaEnviado && step === 'form' ? (
          <>
            <Card className="gap-4 rounded-md py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle>Informações (N1-01)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 sm:grid-cols-2">
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="tpei">TPEI — nº de inscrição do imóvel</FieldLabel>
                  <Input
                    id="tpei"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Se aplicável"
                    value={tpei}
                    onChange={(e) => setTpei(e.target.value)}
                  />
                </Field>
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="horario">Horário para o vistoriador</FieldLabel>
                  <Input
                    id="horario"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Ex.: 08h às 12h"
                    value={horarioVistoriador}
                    onChange={(e) => setHorarioVistoriador(e.target.value)}
                  />
                </Field>
                <Field className="gap-1.5 sm:col-span-2">
                  <FieldLabel htmlFor="ponto">Ponto de referência do imóvel</FieldLabel>
                  <Input
                    id="ponto"
                    className="h-10 rounded-md bg-input-background"
                    placeholder="Ex.: ao lado do mercado central"
                    value={pontoReferencia}
                    onChange={(e) => setPontoReferencia(e.target.value)}
                  />
                </Field>
                <Field className="gap-1.5 sm:col-span-2">
                  <FieldLabel htmlFor="memorial">
                    {band === 'III' ? 'Memorial (resumo do projeto)' : 'Memorial descritivo'}
                  </FieldLabel>
                  <textarea
                    id="memorial"
                    className="min-h-24 rounded-md border bg-input-background p-2 text-sm"
                    placeholder="Descreva a ocupação, medidas de segurança, etc."
                    value={memorial}
                    onChange={(e) => setMemorial(e.target.value)}
                  />
                </Field>
              </CardContent>
            </Card>

            <Card className="gap-4 rounded-md py-5 shadow-none">
              <CardHeader className="px-5">
                <CardTitle>
                  Documentos (PDF ≤ 5 MB) — {Object.keys(attached).length} anexado(s)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 px-5">
                {docs.map((doc) => {
                  const a = attached[doc.tipo]
                  return (
                    <div
                      key={doc.tipo}
                      className="flex flex-wrap items-center gap-3 rounded-md border p-2.5 text-sm"
                    >
                      <span className="flex-1">
                        {doc.label}
                        {doc.obrigatorio ? (
                          <span className="ml-1 text-destructive">*</span>
                        ) : (
                          <span className="ml-1 text-muted-foreground text-xs">(opcional)</span>
                        )}
                      </span>
                      {a ? (
                        <>
                          <button
                            type="button"
                            className="text-primary text-xs underline"
                            onClick={() => void openDoc(a.key)}
                          >
                            {a.fileName || 'ver'}
                          </button>
                          <CheckIcon className="size-4 text-green-600" />
                        </>
                      ) : null}
                      <label
                        className={cn(
                          buttonVariants({ variant: 'outline', size: 'sm' }),
                          'cursor-pointer',
                        )}
                      >
                        {uploading === doc.tipo ? (
                          <Loader2Icon className="size-4 animate-spin" data-icon="inline-start" />
                        ) : (
                          <FileUpIcon data-icon="inline-start" />
                        )}
                        {a ? 'Substituir' : 'Anexar'}
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => void handleUpload(doc.tipo, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4"
                checked={veracidade}
                onChange={(e) => setVeracidade(e.target.checked)}
              />
              <span>
                Confirmo a <strong>veracidade</strong> das informações e documentos enviados, sob
                responsabilidade.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3">
              {missingRequired.length > 0 ? (
                <span className="text-muted-foreground text-xs">
                  Faltam {missingRequired.length} documento(s) obrigatório(s)
                </span>
              ) : null}
              <Button
                type="button"
                size="lg"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit}
                isLoading={submitting}
              >
                Enviar documentos
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  )
}
