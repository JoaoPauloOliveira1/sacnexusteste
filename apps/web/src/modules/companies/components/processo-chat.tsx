import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageCircleIcon, SendIcon } from 'lucide-react'
import { useState } from 'react'

import {
  enviarMensagemProcesso,
  listProcessoMensagens,
  type MensagemPerfil,
} from '@/modules/shared/api/triagem'
import { Button } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { cn } from '@/modules/shared/lib/utils'

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('pt-BR')
}

export function ProcessoChat({
  processoId,
  perfil,
  autorNome,
}: {
  processoId: string
  perfil: MensagemPerfil
  autorNome: string
}) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['triagem', processoId, 'mensagens', perfil],
    queryFn: () => listProcessoMensagens(processoId, perfil),
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
  })
  const [conteudo, setConteudo] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEnviar() {
    const mensagem = conteudo.trim()
    if (!mensagem) return
    setSending(true)
    setError(null)
    try {
      await enviarMensagemProcesso(processoId, {
        autorPapel: perfil,
        autorNome,
        conteudo: mensagem,
      })
      setConteudo('')
      await Promise.all([query.refetch(), queryClient.invalidateQueries({ queryKey: ['triagem'] })])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="gap-3 rounded-md py-4 shadow-none">
      <CardHeader className="flex-row items-center gap-2 px-5">
        <MessageCircleIcon className="size-4 text-muted-foreground" />
        <CardTitle className="text-base">Conversa do processo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-5 text-sm">
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
          {query.isLoading ? <p className="text-muted-foreground">Carregando conversa…</p> : null}
          {query.isError ? (
            <p className="text-destructive">{(query.error as Error).message}</p>
          ) : null}
          {query.data?.mensagens.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma mensagem ainda.</p>
          ) : null}
          {query.data?.mensagens.map((mensagem) => {
            const propria = mensagem.autorPapel === perfil
            return (
              <article
                key={mensagem.id}
                className={cn(
                  'max-w-[88%] rounded-md border px-3 py-2',
                  propria ? 'self-end border-primary/25 bg-primary/5' : 'self-start bg-muted/40',
                )}
              >
                <div className="flex items-baseline justify-between gap-4 text-xs">
                  <span className="font-medium">{mensagem.autorNome}</span>
                  <time className="shrink-0 text-muted-foreground">
                    {formatDateTime(mensagem.createdAt)}
                  </time>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words">{mensagem.conteudo}</p>
              </article>
            )
          })}
        </div>
        <div className="flex flex-col gap-2 border-t pt-3">
          <textarea
            className="min-h-20 rounded-md border bg-input-background p-2 text-sm"
            placeholder="Escreva uma mensagem…"
            value={conteudo}
            maxLength={2000}
            onChange={(event) => setConteudo(event.target.value)}
          />
          {error ? <p className="text-destructive text-xs">{error}</p> : null}
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => void handleEnviar()}
              disabled={!conteudo.trim()}
              isLoading={sending}
            >
              <SendIcon data-icon="inline-start" />
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
