import { Link } from '@tanstack/react-router'
import { DownloadIcon, FilesIcon } from 'lucide-react'

import { Button } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/modules/shared/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/shared/components/ui/table'
import { type IssuedDocumentListItem } from '../types'

export function DocumentListPage({
  documents,
  onDownload,
}: {
  documents: readonly IssuedDocumentListItem[]
  onDownload: (documentId: string) => void
}) {
  return (
    <main className="flex min-h-0 flex-1 flex-col gap-3 bg-[#fbfbfc] px-4 py-7 text-[13px] sm:px-6 lg:px-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl leading-8 tracking-tight">Documentos</h1>
        <p className="text-muted-foreground">
          Consulte e baixe os documentos emitidos para suas empresas.
        </p>
      </header>

      {documents.length > 0 ? (
        <Card className="gap-3 rounded-md py-4 shadow-none">
          <CardHeader className="px-4">
            <CardTitle className="text-base">Documentos emitidos</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Emissão</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <span className="block font-medium">{document.documentNumber}</span>
                      <span className="text-muted-foreground text-xs">
                        {document.documentLabel}
                      </span>
                    </TableCell>
                    <TableCell>{document.companyName}</TableCell>
                    <TableCell>{document.issuedAt}</TableCell>
                    <TableCell>{document.validUntil}</TableCell>
                    <TableCell>
                      <div className="flex min-w-max justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onDownload(document.id)}
                        >
                          <DownloadIcon data-icon="inline-start" />
                          Baixar PDF
                        </Button>
                        <Button
                          nativeButton={false}
                          render={
                            <Link
                              to="/processes/$processId"
                              params={{ processId: document.processId }}
                            />
                          }
                        >
                          Ver processo
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-md py-0 shadow-none">
          <CardContent className="p-0">
            <Empty className="min-h-72">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FilesIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Nenhum documento emitido</EmptyTitle>
                <EmptyDescription>
                  Os documentos emitidos após a conclusão de processos aparecerão aqui.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
