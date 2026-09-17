import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageCircleIcon, SendIcon } from 'lucide-react'
import { useState } from 'react'

import {
  enviarMensagemProcesso,
  listProcessoMensagens,
  type MensagemPerfil,
} from '@/modules/shared/api/triagem'
import { Button } from '@/modules/shared/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/modules/shared/components/ui/sheet'
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
  const [aberto, setAberto] = useState(false)
  const query = useQuery({
    queryKey: ['triagem', processoId, 'mensagens', perfil],
    queryFn: () => listProcessoMensagens(processoId, perfil),
    enabled: aberto,
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
    <Sheet open={aberto} onOpenChange={setAberto}>
      <Button
        type="button"
        size="icon-lg"
        className="fixed right-5 bottom-5 z-40 size-12 rounded-full shadow-lg"
        onClick={() => setAberto(true)}
        aria-label="Abrir conversa do processo"
        title="Conversa do processo"
      >
        <MessageCircleIcon className="size-5" />
      </Button>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>Conversa do processo</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-5 py-4 text-sm">
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
