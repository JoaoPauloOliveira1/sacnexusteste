import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, DownloadIcon, FileTextIcon, FileUpIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'

import { useDemoSession } from '@/modules/auth'
import { responderExigencia } from '@/modules/shared/api/avcb'
import {
  documentosZipUrl,
  getProcessoDossie,
  type ProcessoDossie,
  registrarDecisao,
  registrarExigencia,
} from '@/modules/shared/api/triagem'
import { getUploadSignedUrl, uploadDocumento } from '@/modules/shared/api/upload'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { formatCnpj } from '@/modules/shared/lib/formatters/format-cnpj'
import { cn } from '@/modules/shared/lib/utils'
import { PersonaMenu } from '../components/persona-menu'
import { TriagemAnaliseReview } from '../components/triagem-analise-review'

const ACAO_LABEL: Record<string, string> = {
  exigencia: 'Exigência registrada',
  resposta_exigencia: 'Resposta do contribuinte',
  decisao: 'Decisão do triador',
}

const RISK_STYLE: Record<string, string> = {
  I: 'bg-green-100 text-green-700',
  II: 'bg-amber-100 text-amber-700',
  III: 'bg-red-100 text-red-700',
}

const DADO_LABEL: Record<string, string> = {
  tpei: 'TPEI (nº inscrição do imóvel)',
  pontoReferencia: 'Ponto de referência',
  horarioVistoriador: 'Horário para o vistoriador',
  memorial: 'Memorial',
  veracidade: 'Veracidade confirmada',
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('pt-BR')
}

export function TriagemDetailPage({ processoId }: { processoId: string }) {
  const { session } = useDemoSession()
  const perfil = session?.profile.type
  const isAdmin = perfil === 'admin'
  const isTriador = perfil === 'triager' || isAdmin
  const isContribuinte = perfil === 'contributor' || isAdmin

  const query = useQuery({
    queryKey: ['triagem', processoId],
    queryFn: () => getProcessoDossie(processoId),
    enabled: Boolean(processoId),
    retry: false,
  })

  const [descricao, setDescricao] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [respMensagem, setRespMensagem] = useState('')
  const [respDocs, setRespDocs] = useState<Array<{ tipo: string; key: string; fileName: string }>>(
    [],
  )
  const [respUploading, setRespUploading] = useState(false)
  const [respSubmitting, setRespSubmitting] = useState(false)
  const [respError, setRespError] = useState<string | null>(null)

  const [decObs, setDecObs] = useState('')
  const [deciding, setDeciding] = useState<'aprovado' | 'reprovado' | null>(null)
  const [decError, setDecError] = useState<string | null>(null)

  async function openDoc(key: string) {
    const url = await getUploadSignedUrl(key)
    window.open(url, '_blank', 'noopener')
  }

  async function handleExigencia() {
    if (!descricao.trim()) return
    setSubmitting(true)
    setFormError(null)
    try {
      await registrarExigencia(processoId, descricao.trim())
      setDescricao('')
      await query.refetch()
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRespUpload(file: File | undefined) {
    if (!file) return
    setRespUploading(true)
    setRespError(null)
    try {
      const up = await uploadDocumento(file)
      setRespDocs((prev) => [
        ...prev,
        { tipo: 'resposta_exigencia', key: up.key, fileName: up.fileName },
      ])
    } catch (err) {
      setRespError((err as Error).message)
    } finally {
      setRespUploading(false)
    }
  }

  async function handleDecisao(decisao: 'aprovado' | 'reprovado') {
    setDeciding(decisao)
    setDecError(null)
    try {
      await registrarDecisao(processoId, decisao, decObs.trim() || undefined)
      setDecObs('')
      await query.refetch()
    } catch (err) {
      setDecError((err as Error).message)
    } finally {
      setDeciding(null)
    }
  }

  async function handleResponder() {
    if (!respMensagem.trim() && respDocs.length === 0) return
    setRespSubmitting(true)
    setRespError(null)
    try {
      await responderExigencia(processoId, {
        ...(respMensagem.trim() ? { mensagem: respMensagem.trim() } : {}),
        documentos: respDocs.map((d) => ({ tipo: d.tipo, key: d.key })),
      })
      setRespMensagem('')
      setRespDocs([])
      await query.refetch()
    } catch (err) {
      setRespError((err as Error).message)
    } finally {
      setRespSubmitting(false)
    }
  }

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          {isTriador ? (
            <Link
              to="/triagem"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Voltar para a triagem
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Início
            </Link>
          )}
          <PersonaMenu />
        </div>

        {query.isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando dossiê…</p>
        ) : null}
        {query.isError ? (
          <p className="text-destructive text-sm">{(query.error as Error).message}</p>
        ) : null}

        {query.data ? (
          <>
            <Dossie
              dossie={query.data}
              onOpenDoc={openDoc}
              isTriador={isTriador}
              isContribuinte={isContribuinte}
              hideTriadorAcoes={query.data.processo.risco !== 'I'}
              decisao={{
                observacao: decObs,
                setObservacao: setDecObs,
                deciding,
                error: decError,
                onDecide: handleDecisao,
              }}
              exigencia={{
                descricao,
                setDescricao,
                submitting,
                formError,
                onSubmit: handleExigencia,
              }}
              resposta={{
                mensagem: respMensagem,
                setMensagem: setRespMensagem,
                docs: respDocs,
                onUpload: handleRespUpload,
                uploading: respUploading,
                submitting: respSubmitting,
                error: respError,
                onSubmit: handleResponder,
              }}
            />
            {query.data.processo.risco !== 'I' ? (
              <TriagemAnaliseReview
                dossie={query.data}
                processoId={processoId}
                autor={session?.user.name ?? 'Triador'}
                canEdit={isTriador}
                onChanged={() => void query.refetch()}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  )
}

type ExigenciaProps = {
  descricao: string
  setDescricao: (v: string) => void
  submitting: boolean
  formError: string | null
  onSubmit: () => void
}

type RespostaProps = {
  mensagem: string
  setMensagem: (v: string) => void
  docs: Array<{ tipo: string; key: string; fileName: string }>
  onUpload: (file: File | undefined) => void
  uploading: boolean
  submitting: boolean
  error: string | null
  onSubmit: () => void
}

type DecisaoProps = {
  observacao: string
  setObservacao: (v: string) => void
  deciding: 'aprovado' | 'reprovado' | null
  error: string | null
  onDecide: (decisao: 'aprovado' | 'reprovado') => void
}

function Dossie({
  dossie,
  onOpenDoc,
  isTriador,
  isContribuinte,
  hideTriadorAcoes = false,
  decisao,
  exigencia,
  resposta,
}: {
  dossie: ProcessoDossie
  onOpenDoc: (key: string) => void
  isTriador: boolean
  isContribuinte: boolean
  hideTriadorAcoes?: boolean
  decisao: DecisaoProps
  exigencia: ExigenciaProps
  resposta: RespostaProps
}) {
  const { processo, empresa, unidade, respostas, documentos, pagamento, historico } = dossie
  const dados = processo.dadosComplementares ?? {}
  // For Risco II/III the triager uses the item-by-item review (assumir → itens →
  // enviar → concluir) instead of these quick decisão/exigência cards.
  const podeDecidir =
    isTriador &&
    !hideTriadorAcoes &&
    (processo.fase === 'protocolado' || processo.fase === 'em_exigencia')
  const podeExigir =
    isTriador &&
    !hideTriadorAcoes &&
    (processo.fase === 'protocolado' || processo.fase === 'em_exigencia')
  const emExigencia = isContribuinte && processo.fase === 'em_exigencia'
  const decidido = processo.fase === 'aprovado' || processo.fase === 'reprovado'

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            'rounded px-2 py-0.5 font-medium text-sm',
            RISK_STYLE[processo.risco] ?? 'bg-muted text-muted-foreground',
          )}
        >
          Risco {processo.risco}
        </span>
        <h1 className="font-semibold text-2xl tracking-tight">
          {processo.protocoloNumero ?? 'Processo'}
        </h1>
      </header>

      <Card className="gap-3 rounded-md py-4 shadow-none">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Processo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 px-5 text-sm sm:grid-cols-2">
          <Info label="Tipo de solicitação" value={processo.tipoSolicitacao} />
          <Info label="Modalidade" value={processo.modalidade} />
          <Info label="Fase" value={processo.fase} />
          <Info label="Protocolo" value={processo.protocoloNumero ?? '—'} />
          <Info label="Protocolado em" value={formatDateTime(processo.protocoladoEm)} />
          <Info label="Criado em" value={formatDateTime(processo.createdAt)} />
        </CardContent>
      </Card>

      {empresa || unidade ? (
        <Card className="gap-3 rounded-md py-4 shadow-none">
          <CardHeader className="px-5">
            <CardTitle className="text-base">Empresa e unidade</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 px-5 text-sm sm:grid-cols-2">
            {empresa ? <Info label="Empresa" value={empresa.razaoSocial} /> : null}
            {empresa ? <Info label="CNPJ" value={formatCnpj(empresa.cnpj)} /> : null}
            {unidade ? <Info label="Unidade" value={unidade.nome ?? '—'} /> : null}
            {unidade ? (
              <Info
                label="Área construída"
                value={unidade.areaConstruida ? `${unidade.areaConstruida} m²` : '—'}
              />
            ) : null}
            {unidade ? (
              <Info label="Endereço" value={unidade.endereco} className="sm:col-span-2" />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {Object.keys(dados).length > 0 ? (
        <Card className="gap-3 rounded-md py-4 shadow-none">
          <CardHeader className="px-5">
            <CardTitle className="text-base">Informações N1-01</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 px-5 text-sm sm:grid-cols-2">
            {Object.entries(dados).map(([k, v]) => (
              <Info
                key={k}
                label={DADO_LABEL[k] ?? k}
                value={typeof v === 'boolean' ? (v ? 'Sim' : 'Não') : String(v ?? '—')}
                className={k === 'memorial' ? 'sm:col-span-2' : undefined}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="gap-3 rounded-md py-4 shadow-none">
        <CardHeader className="flex-row items-center justify-between px-5">
          <CardTitle className="text-base">Documentos ({documentos.length})</CardTitle>
          {documentos.some((d) => d.key) ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(documentosZipUrl(processo.id), '_blank', 'noopener')}
            >
              <DownloadIcon data-icon="inline-start" />
              Baixar todos (.zip)
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5 px-5 text-sm">
          {documentos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum documento anexado.</p>
          ) : (
            documentos.map((doc) => (
              <div
                key={doc.key ?? doc.tipo}
                className="flex items-center gap-3 rounded-md border p-2"
              >
                <FileTextIcon className="size-4 text-muted-foreground" />
                <span className="flex-1">{doc.tipo}</span>
                {doc.key ? (
                  <button
                    type="button"
                    className="text-primary text-xs underline"
                    onClick={() => void onOpenDoc(doc.key as string)}
                  >
                    ver
                  </button>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {respostas.length > 0 ? (
        <Card className="gap-3 rounded-md py-4 shadow-none">
          <CardHeader className="px-5">
            <CardTitle className="text-base">Respostas da classificação</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 px-5 text-sm">
            {respostas.map((r) => (
              <div key={r.perguntaId} className="flex gap-2">
                <span className="text-muted-foreground">{r.perguntaId}:</span>
                <span>{String(r.valor ?? '—')}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="gap-3 rounded-md py-4 shadow-none">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 px-5 text-sm sm:grid-cols-2">
          {pagamento ? (
            <>
              <Info
                label="Status"
                value={
                  pagamento.status === 'confirmed' ? 'Confirmado (simulado)' : pagamento.status
                }
              />
              <Info label="Confirmado em" value={formatDateTime(pagamento.confirmadoEm)} />
            </>
          ) : (
            <p className="text-muted-foreground sm:col-span-2">
              Sem pagamento (Risco I é dispensado; ou ainda não pago).
            </p>
          )}
        </CardContent>
      </Card>

      {decidido ? (
        <div
          className={cn(
            'flex flex-col gap-2 rounded-md border p-3 text-sm',
            processo.fase === 'aprovado'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800',
          )}
        >
          <span>
            Processo <strong>{processo.fase === 'aprovado' ? 'deferido' : 'indeferido'}</strong>{' '}
            pelo triador.
          </span>
          {processo.fase === 'aprovado' ? (
            <Link
              to="/companies/avcb"
              search={{ processoId: processo.id }}
              className={cn(buttonVariants({ size: 'sm' }), 'w-fit')}
            >
              Ver / imprimir AVCB
            </Link>
          ) : null}
        </div>
      ) : null}

      {podeDecidir ? (
        <Card className="gap-3 rounded-md py-4 shadow-none">
          <CardHeader className="px-5">
            <CardTitle className="text-base">Decisão do triador</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-5 text-sm">
            <p className="text-muted-foreground">
              Analise o dossiê e decida. Você pode registrar uma observação (motivo/orientação).
            </p>
            <textarea
              className="min-h-16 rounded-md border bg-input-background p-2 text-sm"
              placeholder="Observação da decisão (opcional)…"
              value={decisao.observacao}
              onChange={(e) => decisao.setObservacao(e.target.value)}
            />
            {decisao.error ? <p className="text-destructive text-xs">{decisao.error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => decisao.onDecide('aprovado')}
                isLoading={decisao.deciding === 'aprovado'}
                disabled={decisao.deciding !== null}
              >
                Deferir (aprovar)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => decisao.onDecide('reprovado')}
                isLoading={decisao.deciding === 'reprovado'}
                disabled={decisao.deciding !== null}
              >
                Indeferir (reprovar)
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="gap-3 rounded-md py-4 shadow-none">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Histórico e exigências</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-5 text-sm">
          {historico.length === 0 ? (
            <p className="text-muted-foreground">Sem registros ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {historico.map((h) => (
                <li key={h.createdAt} className="rounded-md border p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{ACAO_LABEL[h.acao] ?? h.acao}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatDateTime(h.createdAt)}
                    </span>
                  </div>
                  {h.descricao ? <p className="text-muted-foreground">{h.descricao}</p> : null}
                </li>
              ))}
            </ul>
          )}

          {podeExigir ? (
            <div className="flex flex-col gap-2 border-t pt-3">
              <label htmlFor="exigencia" className="font-medium">
                Registrar exigência (triador)
              </label>
              <textarea
                id="exigencia"
                className="min-h-20 rounded-md border bg-input-background p-2 text-sm"
                placeholder="Descreva o que falta ou precisa ser corrigido no processo…"
                value={exigencia.descricao}
                onChange={(e) => exigencia.setDescricao(e.target.value)}
              />
              {exigencia.formError ? (
                <p className="text-destructive text-xs">{exigencia.formError}</p>
              ) : null}
              <div>
                <Button
                  type="button"
                  onClick={exigencia.onSubmit}
                  disabled={!exigencia.descricao.trim()}
                  isLoading={exigencia.submitting}
                >
                  Registrar exigência
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {emExigencia ? (
        <Card className="gap-3 rounded-md py-4 shadow-none">
          <CardHeader className="px-5">
            <CardTitle className="text-base">Responder exigência (contribuinte)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-5 text-sm">
            <p className="text-muted-foreground">
              Anexe os documentos corrigidos e/ou escreva uma resposta. Ao enviar, o processo volta
              para análise.
            </p>
            <textarea
              className="min-h-20 rounded-md border bg-input-background p-2 text-sm"
              placeholder="Mensagem para o triador (opcional)…"
              value={resposta.mensagem}
              onChange={(e) => resposta.setMensagem(e.target.value)}
            />
            {resposta.docs.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {resposta.docs.map((d) => (
                  <li
                    key={d.key}
                    className="flex items-center gap-2 rounded-md border p-2 text-muted-foreground"
                  >
                    <FileTextIcon className="size-4" />
                    <span className="flex-1">{d.fileName}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {resposta.error ? <p className="text-destructive text-xs">{resposta.error}</p> : null}
            <div className="flex flex-wrap items-center gap-3">
              <label
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'cursor-pointer')}
              >
                {resposta.uploading ? (
                  <Loader2Icon className="size-4 animate-spin" data-icon="inline-start" />
                ) : (
                  <FileUpIcon data-icon="inline-start" />
                )}
                Anexar documento (PDF)
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => resposta.onUpload(e.target.files?.[0])}
                />
              </label>
              <Button
                type="button"
                onClick={resposta.onSubmit}
                disabled={!resposta.mensagem.trim() && resposta.docs.length === 0}
                isLoading={resposta.submitting}
              >
                Enviar resposta e voltar para análise
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function Info({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string | undefined
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
