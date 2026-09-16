import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { saveClassificacao } from '@/modules/shared/api/classificacao'
import { getUnidade, listUnidadeCnaes } from '@/modules/shared/api/unidade'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Input } from '@/modules/shared/components/ui/input'
import { cn } from '@/modules/shared/lib/utils'

import { useFireRiskForm } from '../hooks/use-fire-risk-form'
import { type InputField } from '../lib/types'

const RISCO_TO_BAND: Record<string, 'I' | 'II' | 'III'> = { baixo: 'I', medio: 'II', alto: 'III' }

// Map the unit's exact values (collected on the Unidade) to the classifier's
// range options, so those questions are not asked again (reuse).
function areaToOption(area: number): string {
  if (area <= 200) return 'ate_200'
  if (area <= 930) return 'de_200_a_930'
  return 'acima_de_930'
}
function pavimentosToOption(pavimentos: number): string {
  if (pavimentos <= 1) return 'exclusivamente_terreo'
  if (pavimentos <= 3) return '2_ou_3_pavimentos'
  return '4_ou_mais_pavimentos'
}
function ocupacaoToOption(ocupacao: number): string {
  return ocupacao <= 100 ? 'ate_100' : 'mais_de_100'
}
// Questions reused from the unit (hidden + auto-answered from exact values).
const REUSED_INPUT_IDS = new Set(['area', 'pavimentos', 'imovel_reuniao_publico_lotacao'])

// A unit's preliminary risk is the highest across ALL its CNAE bands. Unknown /
// "sem classificação" CNAEs map to `medio` (conservative — they still need
// analysis), never `baixo`.
const BAND_TO_RISCO: Record<string, 'baixo' | 'medio' | 'alto'> = {
  I: 'baixo',
  II: 'medio',
  III: 'alto',
  undetermined: 'medio',
}
const RISCO_RANK: Record<string, number> = { baixo: 0, medio: 1, alto: 2 }

function highestRiscoFromBands(bands: string[]): string | undefined {
  let best: string | undefined
  for (const band of bands) {
    const risco = BAND_TO_RISCO[band] ?? 'medio'
    if (!best || (RISCO_RANK[risco] ?? 0) > (RISCO_RANK[best] ?? 0)) {
      best = risco
    }
  }
  return best
}

const RISK_LABEL: Record<string, string> = {
  baixo: 'Risco I (baixo)',
  medio: 'Risco II (médio)',
  alto: 'Risco III (alto)',
  encerramento: 'Sem classificação (dispensa)',
}

type Options = Array<{ value: string; label: string }>

function DynamicInput({
  input,
  value,
  options,
  onChange,
}: {
  input: InputField
  value: string | undefined
  options: Options
  onChange: (value: string) => void
}) {
  const [search, setSearch] = useState('')

  if (input.tipo === 'booleano') {
    return (
      <div className="flex gap-2">
        {[
          { v: 'true', l: 'Sim' },
          { v: 'false', l: 'Não' },
        ].map((opt) => (
          <Button
            key={opt.v}
            type="button"
            variant={value === opt.v ? 'default' : 'outline'}
            onClick={() => onChange(opt.v)}
          >
            {opt.l}
          </Button>
        ))}
      </div>
    )
  }

  if (input.tipo === 'multipla') {
    const selected = new Set((value ?? '').split(',').filter(Boolean))
    return (
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4"
              checked={selected.has(opt.value)}
              onChange={() => {
                const next = new Set(selected)
                if (next.has(opt.value)) {
                  next.delete(opt.value)
                } else {
                  next.add(opt.value)
                }
                onChange([...next].join(','))
              }}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    )
  }

  // lista
  if (input.origem_opcoes === 'ATIVIDADES') {
    const selectedLabel = options.find((o) => o.value === value)?.label
    const matches = search.trim()
      ? options
          .filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase()))
          .slice(0, 8)
      : []
    return (
      <div className="flex flex-col gap-2">
        {selectedLabel ? (
          <div className="flex items-center gap-2 rounded-md border bg-accent/40 p-2 text-sm">
            <span className="flex-1">{selectedLabel}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              trocar
            </Button>
          </div>
        ) : (
          <>
            <Input
              className="h-10 rounded-md bg-input-background"
              placeholder="Buscar atividade por nome ou código…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="flex flex-col gap-1">
              {matches.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="rounded-md border p-2 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    onChange(opt.value)
                    setSearch('')
                  }}
                >
                  {opt.label}
                </button>
              ))}
              {search.trim() && matches.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma atividade encontrada.</p>
              ) : null}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          variant={value === opt.value ? 'default' : 'outline'}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}

export function ClassifierPage({
  atividade,
  unidadeId,
}: {
  atividade?: string
  unidadeId?: string
}) {
  // When launched from a Unidade, load ALL its CNAEs and derive the base risk
  // from the highest band across the whole unit (not a single CNAE).
  const unidadeCnaesQuery = useQuery({
    queryKey: ['unidade-cnaes', unidadeId],
    queryFn: () => listUnidadeCnaes(unidadeId as string),
    enabled: Boolean(unidadeId),
  })
  const unidadeCnaes = unidadeCnaesQuery.data?.cnaes ?? []
  const baseRisco = unidadeId ? highestRiscoFromBands(unidadeCnaes.map((c) => c.band)) : undefined
  const baseLoading = Boolean(unidadeId) && unidadeCnaesQuery.isLoading

  // The unit's exact values (área, pavimentos, ocupação) are reused so the
  // classifier does not re-ask them.
  const unidadeQuery = useQuery({
    queryKey: ['unidade', unidadeId],
    queryFn: () => getUnidade(unidadeId as string),
    enabled: Boolean(unidadeId),
  })
  const unidade = unidadeQuery.data

  const form = useFireRiskForm(
    atividade
      ? { atividade_economica: 'true', atividade }
      : unidadeId
        ? { atividade_economica: 'true' }
        : {},
    baseRisco ? { baseRisco } : {},
  )
  const locked = Boolean(atividade) || Boolean(unidadeId)
  const navigate = useNavigate()
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Seed each reused answer exactly when its question becomes visible (so the
  // hook's hidden-answer cleanup never wipes it).
  const { seedAnswers } = form
  const visibleIdsKey = form.visibleInputs.map((i) => i.id).join(',')
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on visibleIdsKey + unit values
  useEffect(() => {
    if (!unidade) return
    const visible = new Set(form.visibleInputs.map((i) => i.id))
    const seed: Record<string, string> = {}
    if (visible.has('area') && unidade.areaConstruida) {
      const n = Number(unidade.areaConstruida)
      if (Number.isFinite(n)) seed.area = areaToOption(n)
    }
    if (visible.has('pavimentos') && unidade.pavimentos != null) {
      seed.pavimentos = pavimentosToOption(unidade.pavimentos)
    }
    if (visible.has('imovel_reuniao_publico_lotacao') && unidade.ocupacao != null) {
      seed.imovel_reuniao_publico_lotacao = ocupacaoToOption(unidade.ocupacao)
    }
    if (Object.keys(seed).length > 0) seedAnswers(seed)
  }, [visibleIdsKey, unidade, seedAnswers])

  function handleClassify() {
    form.classify()
    const computed = form.partialResult
    const band = computed ? RISCO_TO_BAND[computed.risco_final] : undefined
    if (unidadeId && band) {
      setSaveState('saving')
      void saveClassificacao(unidadeId, {
        risco: band,
        origem: 'questionario',
        respostas: Object.entries(form.answers).map(([perguntaId, valor]) => ({
          perguntaId,
          valor,
        })),
        fatores: { regra_aplicada: computed?.regra_aplicada ?? null },
      })
        .then(() => setSaveState('saved'))
        .catch(() => setSaveState('error'))
    }
  }

  if (form.isLoading) {
    return (
      <main className="grid min-h-svh place-items-center">
        <p className="text-muted-foreground">Carregando classificador…</p>
      </main>
    )
  }

  // Final band of the shown result (for the "emit DDLCB" / "start AVCB" actions).
  const resultBand = form.result ? RISCO_TO_BAND[form.result.risco_final] : undefined
  // When launched from a Unidade, the activity is fixed by the unit's CNAEs —
  // hide the "exerce atividade?" / "qual atividade?" questions. Área, pavimentos
  // and ocupação are reused from the unit, so hide them too.
  const reusedFromUnit = form.visibleInputs.filter(
    (i) => Boolean(unidade) && REUSED_INPUT_IDS.has(i.id) && form.answers[i.id] !== undefined,
  )
  const renderedInputs = locked
    ? form.visibleInputs.filter(
        (i) =>
          i.id !== 'atividade_economica' &&
          i.id !== 'atividade' &&
          !reusedFromUnit.some((r) => r.id === i.id),
      )
    : form.visibleInputs

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Link
          to="/dashboard"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar
        </Link>

        <header className="flex flex-col gap-2">
          <h1 className="font-semibold text-3xl tracking-tight">Classificador de risco</h1>
          <p className="text-muted-foreground">
            Classificação de nível de risco baseada no Decreto Estadual nº 61.082/2026. As perguntas
            aparecem progressivamente conforme suas respostas.
          </p>
          {locked ? (
            <p className="rounded-md bg-accent/40 px-3 py-2 text-sm">
              {unidadeId ? (
                <>
                  Classificando a unidade considerando{' '}
                  <span className="font-medium">
                    {baseLoading ? '…' : `${unidadeCnaes.length} CNAE(s)`}
                  </span>
                  {atividade ? (
                    <>
                      {' '}
                      (principal <span className="font-medium tabular-nums">{atividade}</span>)
                    </>
                  ) : null}
                  . Responda às perguntas para obter a classificação.
                </>
              ) : (
                <>
                  Classificando a partir do CNAE:{' '}
                  <span className="font-medium tabular-nums">{atividade}</span>.
                </>
              )}
            </p>
          ) : null}
          {reusedFromUnit.length > 0 ? (
            <p className="rounded-md bg-muted px-3 py-2 text-muted-foreground text-xs">
              Reaproveitando os dados da unidade (área, pavimentos e ocupação) já informados no
              cadastro — essas perguntas não são repetidas.
            </p>
          ) : null}
        </header>

        {form.showResult && form.result ? (
          <Card className="gap-4 rounded-md py-5 shadow-none">
            <CardHeader className="px-5">
              <CardTitle>
                Resultado: {RISK_LABEL[form.result.risco_final] ?? form.result.risco_final}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-5 text-sm">
              {form.result.resultado?.descricao ? (
                <p className="whitespace-pre-line">{form.result.resultado.descricao}</p>
              ) : null}
              {form.result.resultado?.orientacao ? (
                <p className="text-muted-foreground">{form.result.resultado.orientacao}</p>
              ) : null}
              {form.result.elevacao_mensagem ? (
                <p className="rounded-md bg-amber-50 p-2 text-amber-800 text-xs">
                  {form.result.elevacao_mensagem}
                </p>
              ) : null}
              <p className="text-muted-foreground text-xs">
                Resultado orientativo — não substitui a análise oficial do CBMPE.
              </p>
              {unidadeId ? (
                <p className="text-xs">
                  {saveState === 'saving' ? 'Salvando classificação na unidade…' : null}
                  {saveState === 'saved' ? '✓ Classificação registrada na unidade.' : null}
                  {saveState === 'error' ? (
                    <span className="text-destructive">
                      Não foi possível salvar a classificação.
                    </span>
                  ) : null}
                </p>
              ) : null}
              {unidadeId && resultBand === 'I' ? (
                <div className="flex flex-col gap-2 rounded-md border border-green-200 bg-green-50 p-3">
                  <p className="text-green-800 text-sm">
                    Risco I: a unidade está <strong>dispensada de licenciamento prévio</strong>.
                    Você pode emitir a Declaração de Dispensa (DDLCB) agora — sem pagamento nem
                    protocolo.
                  </p>
                  <div>
                    <Button
                      type="button"
                      disabled={saveState !== 'saved'}
                      onClick={() =>
                        void navigate({ to: '/companies/ddlcb', search: { unidadeId } })
                      }
                    >
                      Emitir Declaração de Dispensa (DDLCB)
                    </Button>
                    {saveState !== 'saved' ? (
                      <span className="ml-2 text-muted-foreground text-xs">
                        Registrando a classificação…
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {unidadeId && (resultBand === 'II' || resultBand === 'III') ? (
                <div className="flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-amber-900 text-sm">
                    {resultBand === 'III'
                      ? 'Risco III: é necessário AVCB por projeto.'
                      : 'Risco II: é necessário AVCB por vistoria.'}{' '}
                    Inicie o processo, anexe os documentos (N1-01) e confirme o pagamento (simulado)
                    para protocolar.
                  </p>
                  <div>
                    <Button
                      type="button"
                      disabled={saveState !== 'saved'}
                      onClick={() =>
                        void navigate({
                          to: '/companies/processo',
                          search: { unidadeId, risco: resultBand },
                        })
                      }
                    >
                      Iniciar processo AVCB
                    </Button>
                    {saveState !== 'saved' ? (
                      <span className="ml-2 text-muted-foreground text-xs">
                        Registrando a classificação…
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div>
                <Button type="button" variant="outline" onClick={form.restart}>
                  Nova classificação
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {renderedInputs.map((input, index) => (
              <Card key={input.id} className="gap-3 rounded-md py-4 shadow-none">
                <CardHeader className="px-5">
                  <CardTitle className="text-base">
                    {index + 1}. {input.pergunta}
                  </CardTitle>
                  {input.descricao ? (
                    <p className="text-muted-foreground text-sm">{input.descricao}</p>
                  ) : null}
                </CardHeader>
                <CardContent className="px-5">
                  <DynamicInput
                    input={input}
                    value={form.answers[input.id]}
                    options={form.getOptionsForInput(input.origem_opcoes)}
                    onChange={(value) => form.setAnswer(input.id, value)}
                  />
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button
                type="button"
                size="lg"
                onClick={handleClassify}
                disabled={baseLoading || (!locked && !form.allAnswered && !form.earlyTermination)}
              >
                Classificar risco
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
