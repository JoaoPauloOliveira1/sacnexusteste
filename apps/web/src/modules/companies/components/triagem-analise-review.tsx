import { useMemo, useState } from 'react'

import {
  assumirTriagem,
  concluirTriagem,
  enviarAnaliseTriagem,
  type ProcessoDossie,
  retomarAnaliseTriagem,
  salvarAnaliseTriagem,
  type TriagemEstado,
  type TriagemItem,
} from '@/modules/shared/api/triagem'
import { Button } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { cn } from '@/modules/shared/lib/utils'

// N1-01 field labels (dados complementares).
const DC_LABELS: Record<string, string> = {
  tpei: 'TPEI (nº de inscrição do imóvel)',
  pontoReferencia: 'Ponto de referência',
  horarioVistoriador: 'Horário para o vistoriador',
  memorial: 'Memorial',
  veracidade: 'Veracidade confirmada',
}

const ESTADO_STYLE: Record<TriagemEstado, string> = {
  aprovado: 'bg-green-100 text-green-700 border-green-300',
  reprovado: 'bg-red-100 text-red-700 border-red-300',
  em_exigencia: 'bg-amber-100 text-amber-700 border-amber-300',
}
const ESTADO_LABEL: Record<TriagemEstado, string> = {
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  em_exigencia: 'Em exigência',
}

type ReviewItem = {
  itemTipo: 'informacao' | 'documento'
  itemChave: string
  label: string
  valor: string
}

function stringifyValor(valor: unknown): string {
  if (valor === null || valor === undefined) return '—'
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
  return String(valor)
}

function buildItems(dossie: ProcessoDossie): ReviewItem[] {
  const items: ReviewItem[] = []
  for (const r of dossie.respostas) {
    items.push({
      itemTipo: 'informacao',
      itemChave: `resp:${r.perguntaId}`,
      label: r.perguntaId,
      valor: stringifyValor(r.valor),
    })
  }
  const dc = dossie.processo.dadosComplementares ?? {}
  for (const [key, value] of Object.entries(dc)) {
    items.push({
      itemTipo: 'informacao',
      itemChave: `dc:${key}`,
      label: DC_LABELS[key] ?? key,
      valor: stringifyValor(value),
    })
  }
  for (const doc of dossie.documentos) {
    items.push({
      itemTipo: 'documento',
      itemChave: doc.tipo,
      label: doc.tipo,
      valor: doc.key ? 'anexado' : '—',
    })
  }
  return items
}

type LocalState = { estado: TriagemEstado; observacao: string }

export function TriagemAnaliseReview({
  dossie,
  processoId,
  autor,
  canEdit,
  onChanged,
}: {
  dossie: ProcessoDossie
  processoId: string
  autor: string
  canEdit: boolean
  onChanged: () => void
}) {
  const items = useMemo(() => buildItems(dossie), [dossie])
  const savedByKey = useMemo(() => {
    const m = new Map<string, TriagemItem>()
    for (const t of dossie.triagemItens) m.set(`${t.itemTipo}:${t.itemChave}`, t)
    return m
  }, [dossie.triagemItens])

  const [state, setState] = useState<Record<string, LocalState>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [concluir, setConcluir] = useState(false)

  const assumido = dossie.processo.triadorResponsavel
  const enviada = dossie.processo.analiseStatus === 'enviada'
  const finalizado = ['aprovado', 'reprovado', 'em_vistoria'].includes(dossie.processo.fase)
  const podeModificar = canEdit && !finalizado

  function current(item: ReviewItem): LocalState | null {
    const k = `${item.itemTipo}:${item.itemChave}`
    if (state[k]) return state[k]
    const saved = savedByKey.get(k)
    return saved ? { estado: saved.estado, observacao: saved.observacao ?? '' } : null
  }

  function setItem(item: ReviewItem, patch: Partial<LocalState>) {
    const k = `${item.itemTipo}:${item.itemChave}`
    const cur = current(item) ?? { estado: 'aprovado', observacao: '' }
    setState((prev) => ({ ...prev, [k]: { ...cur, ...patch } }))
  }

  const allDecided = items.every((i) => current(i) != null)
  const allApproved = items.length > 0 && items.every((i) => current(i)?.estado === 'aprovado')

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label)
    setError(null)
    try {
      await fn()
      setState({})
      onChanged()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  function itensPendentesDeSalvar() {
    return Object.entries(state).map(([k, v]) => {
      const [itemTipo, ...rest] = k.split(':')
      return {
        itemTipo: itemTipo as 'informacao' | 'documento',
        itemChave: rest.join(':'),
        estado: v.estado,
        ...(v.observacao ? { observacao: v.observacao } : {}),
      }
    })
  }

  function handleSalvar() {
    const itens = itensPendentesDeSalvar()
    if (itens.length === 0) {
      setError('Nada para salvar — marque ao menos um item.')
      return
    }
    void run('salvar', () => salvarAnaliseTriagem(processoId, autor, itens))
  }

  function handleEnviar() {
    const itens = itensPendentesDeSalvar()
    if (itens.length === 0 && dossie.triagemItens.length === 0) {
      setError('Marque ao menos um item antes de enviar ao contribuinte.')
      return
    }
    void run('enviar', async () => {
      if (itens.length > 0) {
        await salvarAnaliseTriagem(processoId, autor, itens)
      }
      return enviarAnaliseTriagem(processoId)
    })
  }

  return (
    <Card className="gap-4 rounded-md border-primary/30 py-5 shadow-none">
      <CardHeader className="px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Revisão administrativa e técnica</CardTitle>
          <span className="text-muted-foreground text-xs">
            {assumido ? `Responsável: ${assumido}` : 'Sem responsável'}
            {enviada ? ' · enviada ao contribuinte' : assumido ? ' · rascunho' : ''}
          </span>
        </div>
        {podeModificar ? (
          <p className="text-muted-foreground text-sm">
            Como triador, marque cada informação e documento como Aprovado, Reprovado (com
            justificativa) ou Em exigência (com a pendência). Salve para continuar depois; envie
            para o contribuinte ver.
          </p>
        ) : enviada ? (
          <p className="text-muted-foreground text-sm">Resultado da análise do CBMPE por item.</p>
        ) : (
          <p className="text-muted-foreground text-sm">A análise ainda não foi disponibilizada.</p>
        )}
      </CardHeader>

      {podeModificar && !assumido ? (
        <CardContent className="px-5">
          <Button
            type="button"
            onClick={() => void run('assumir', () => assumirTriagem(processoId, autor))}
            isLoading={busy === 'assumir'}
          >
            Assumir atividade
          </Button>
        </CardContent>
      ) : null}

      {(podeModificar && assumido) || (!podeModificar && enviada) ? (
        <CardContent className="flex flex-col gap-2 px-5">
          {items.map((item) => {
            const cur = current(item)
            return (
              <div key={`${item.itemTipo}:${item.itemChave}`} className="rounded-md border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-muted-foreground text-xs uppercase">
                      {item.itemTipo === 'documento' ? 'Documento' : 'Informação'}
                    </span>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-muted-foreground text-xs">{item.valor}</p>
                  </div>
                  {podeModificar ? (
                    <div className="flex flex-wrap gap-1">
                      {(['aprovado', 'reprovado', 'em_exigencia'] as const).map((estado) => (
                        <button
                          key={estado}
                          type="button"
                          onClick={() => setItem(item, { estado })}
                          className={cn(
                            'rounded border px-2 py-1 text-xs',
                            cur?.estado === estado
                              ? ESTADO_STYLE[estado]
                              : 'border-transparent bg-muted text-muted-foreground',
                          )}
                        >
                          {ESTADO_LABEL[estado]}
                        </button>
                      ))}
                    </div>
                  ) : cur ? (
                    <span
                      className={cn('rounded border px-2 py-1 text-xs', ESTADO_STYLE[cur.estado])}
                    >
                      {ESTADO_LABEL[cur.estado]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>
                {podeModificar && cur && cur.estado !== 'aprovado' ? (
                  <textarea
                    className="mt-2 min-h-16 w-full rounded-md border bg-input-background p-2 text-sm"
                    placeholder={
                      cur.estado === 'reprovado'
                        ? 'Justificativa da reprovação'
                        : 'Pendência a ajustar'
                    }
                    value={cur.observacao}
                    onChange={(e) => setItem(item, { observacao: e.target.value })}
                  />
                ) : !canEdit && cur?.observacao ? (
                  <p className="mt-1 text-muted-foreground text-xs">{cur.observacao}</p>
                ) : null}
              </div>
            )
          })}

          {error ? <p className="text-destructive text-sm">{error}</p> : null}

          {podeModificar ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleSalvar}
                isLoading={busy === 'salvar'}
              >
                Salvar
              </Button>
              {!enviada ? (
                <Button type="button" onClick={handleEnviar} isLoading={busy === 'enviar'}>
                  Enviar ao contribuinte
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void run('retomar', () => retomarAnaliseTriagem(processoId))}
                  isLoading={busy === 'retomar'}
                >
                  Retomar processo
                </Button>
              )}
              {allApproved && allDecided ? (
                <Button type="button" variant="default" onClick={() => setConcluir((v) => !v)}>
                  Concluir triagem
                </Button>
              ) : (
                <span className="text-muted-foreground text-xs">
                  Aprove todos os itens para concluir.
                </span>
              )}
            </div>
          ) : null}

          {podeModificar && concluir && allApproved ? (
            <div className="flex flex-col gap-2 rounded-md border border-primary/30 bg-primary/5 p-3">
              <p className="text-sm">
                Revisei todos os dados e documentos. Registro a decisão final:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() =>
                    void run('concluir', () => concluirTriagem(processoId, 'liberar_avcb'))
                  }
                  isLoading={busy === 'concluir'}
                >
                  Liberar AVCB
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    void run('concluir', () => concluirTriagem(processoId, 'colocar_em_vistoria'))
                  }
                  isLoading={busy === 'concluir'}
                >
                  Colocar em vistoria
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  )
}
