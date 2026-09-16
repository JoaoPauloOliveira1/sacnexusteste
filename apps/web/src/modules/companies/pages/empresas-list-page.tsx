import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Building2Icon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

import { deleteEmpresa, type EmpresaListItem, listEmpresas } from '@/modules/shared/api/unidade'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent } from '@/modules/shared/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/shared/components/ui/dialog'
import { Field, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import { formatCnpj } from '@/modules/shared/lib/formatters/format-cnpj'
import { cn } from '@/modules/shared/lib/utils'

const onlyDigits = (value: string): string => value.replace(/\D/g, '')

export function EmpresasListPage() {
  const empresasQuery = useQuery({ queryKey: ['empresas'], queryFn: listEmpresas })
  const empresas = empresasQuery.data?.empresas ?? []

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold text-3xl tracking-tight">Empresas cadastradas</h1>
            <p className="text-muted-foreground">
              Empresas cadastradas por CNPJ. As unidades e os processos são criados a partir de uma
              empresa.
            </p>
          </div>
          <Link
            to="/companies/new"
            search={{ returnTo: 'request' }}
            className={cn(buttonVariants({ variant: 'default' }), 'shrink-0')}
          >
            <PlusIcon data-icon="inline-start" />
            Cadastrar empresa
          </Link>
        </header>

        {empresasQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando empresas…</p>
        ) : null}
        {empresasQuery.isError ? (
          <p className="text-destructive text-sm">{(empresasQuery.error as Error).message}</p>
        ) : null}

        {!empresasQuery.isLoading && empresas.length === 0 ? (
          <Card className="gap-4 rounded-md py-5 shadow-none">
            <CardContent className="flex flex-col items-center gap-3 px-5 py-6 text-center">
              <Building2Icon className="size-8 text-muted-foreground" />
              <p className="text-sm">
                Nenhuma empresa cadastrada ainda. Cadastre uma empresa (por CNPJ) para depois criar
                unidades e iniciar processos.
              </p>
              <Link
                to="/companies/new"
                search={{ returnTo: 'request' }}
                className={cn(buttonVariants({ variant: 'default' }))}
              >
                <PlusIcon data-icon="inline-start" />
                Cadastrar empresa
              </Link>
            </CardContent>
          </Card>
        ) : null}

        {empresas.length > 0 ? (
          <div className="flex flex-col gap-2">
            {empresas.map((empresa) => (
              <EmpresaRow key={empresa.empresaId} empresa={empresa} />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  )
}

function EmpresaRow({ empresa }: { empresa: EmpresaListItem }) {
  const nome = empresa.nomeFantasia || empresa.razaoSocial
  const local = [empresa.municipio, empresa.uf].filter(Boolean).join(' / ')
  const meta = [
    formatCnpj(empresa.cnpj),
    local,
    `${empresa.cnaeCount} CNAE(s)`,
    `${empresa.unidadeCount} unidade(s)`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card className="rounded-md py-4 shadow-none">
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Building2Icon className="size-5 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{nome}</span>
            <span className="truncate text-muted-foreground text-xs">{meta}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/companies/units"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            Ver unidades
          </Link>
          <Link
            to="/companies/unit"
            search={{ empresaId: empresa.empresaId }}
            className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
          >
            <PlusIcon data-icon="inline-start" />
            Nova unidade
          </Link>
          <DeleteEmpresaButton empresa={empresa} />
        </div>
      </CardContent>
    </Card>
  )
}

function DeleteEmpresaButton({ empresa }: { empresa: EmpresaListItem }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [cnpjInput, setCnpjInput] = useState('')
  const nome = empresa.nomeFantasia || empresa.razaoSocial

  const mutation = useMutation({
    mutationFn: () => deleteEmpresa(empresa.empresaId, cnpjInput),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['empresas'] })
      setOpen(false)
      setCnpjInput('')
    },
  })

  const matches = onlyDigits(cnpjInput) === onlyDigits(empresa.cnpj)

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setCnpjInput('')
      mutation.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={`Excluir ${nome}`}
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2Icon />
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir empresa</DialogTitle>
          <DialogDescription>
            Esta ação é <strong>permanente</strong>. Serão removidos a empresa{' '}
            <strong>{nome}</strong> e tudo sob ela: unidades, processos, documentos e
            classificações.
          </DialogDescription>
        </DialogHeader>
        <Field className="gap-1.5">
          <FieldLabel htmlFor={`confirm-cnpj-${empresa.empresaId}`}>
            Digite o CNPJ{' '}
            <span className="font-medium tabular-nums">{formatCnpj(empresa.cnpj)}</span> para
            confirmar
          </FieldLabel>
          <Input
            id={`confirm-cnpj-${empresa.empresaId}`}
            inputMode="numeric"
            autoComplete="off"
            placeholder="00.000.000/0000-00"
            value={cnpjInput}
            onChange={(event) => setCnpjInput(formatCnpj(event.target.value))}
            className="h-10 rounded-md bg-input-background"
          />
        </Field>
        {mutation.isError ? (
          <p className="text-destructive text-sm">{(mutation.error as Error).message}</p>
        ) : null}
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            }
          />
          <Button
            type="button"
            variant="destructive"
            disabled={!matches || mutation.isPending}
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            <Trash2Icon data-icon="inline-start" />
            Excluir definitivamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
