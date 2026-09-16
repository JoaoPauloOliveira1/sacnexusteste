import { Link } from '@tanstack/react-router'
import { DownloadIcon, FileCheck2Icon, FilePlus2Icon } from 'lucide-react'

import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import {
  Empty,
  EmptyContent,
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

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, StatusBadge } from '../components/process-page'
import { downloadIssuedDocument } from '../lib/document-actions'
import { createIssuedDocuments } from '../lib/process-data'
import { useProcesses } from '../lib/process-store'

export function AvcbProcessListPage() {
  const { meta } = useProcesses()

  return (
    <ContributorShell title="Processos">
      <ProcessPage
        title="Regularizações concluídas"
        description="Consulte os processos concluídos e todos os documentos emitidos."
        badge={<StatusBadge>{meta.completedCount} concluído(s)</StatusBadge>}
      >
        {meta.hasCompletedProcess ? (
          <Card className="gap-3 rounded-md py-4 shadow-none">
            <CardHeader className="px-4">
              <CardTitle className="text-base">Processos concluídos</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Processo</TableHead>
                    <TableHead>Documentos</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meta.completedProcesses
                    .slice()
                    .reverse()
                    .map((record) => {
                      const { classification = 'risk-1', company, establishment, process } = record
                      const issuedDocuments =
                        record.issuedDocuments ?? createIssuedDocuments(process, classification)

                      return (
                        <TableRow key={process.id}>
                          <TableCell className="font-medium">{process.processNumber}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {issuedDocuments.map((document) => (
                                <span key={document.kind}>{document.shortLabel}</span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{company.legalName}</TableCell>
                          <TableCell>{process.issuedAt}</TableCell>
                          <TableCell>{process.validUntil}</TableCell>
                          <TableCell>
                            <StatusBadge tone="success">Concluído</StatusBadge>
                          </TableCell>
                          <TableCell>
                            <div className="flex min-w-max justify-end gap-2">
                              <Link
                                to="/processes/$processId"
                                params={{ processId: process.id }}
                                className={buttonVariants({
                                  variant: 'outline',
                                  className: 'rounded-md px-4 text-[13px]',
                                })}
                              >
                                Ver processo
                              </Link>
                              {issuedDocuments.map((issuedDocument) => (
                                <Button
                                  key={issuedDocument.kind}
                                  type="button"
                                  className="rounded-md px-4 text-[13px]"
                                  onClick={() =>
                                    void downloadIssuedDocument({
                                      company,
                                      establishment,
                                      process,
                                      classification,
                                      issuedDocument,
                                    })
                                  }
                                >
                                  <DownloadIcon data-icon="inline-start" />
                                  Baixar {issuedDocument.shortLabel}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-md py-0 shadow-none">
            <CardContent className="p-0">
              <Empty className="min-h-64 gap-3 rounded-none border-0 p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileCheck2Icon aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>Nenhuma regularização concluída</EmptyTitle>
                  <EmptyDescription>
                    Os processos concluídos e seus documentos emitidos aparecerão nesta lista.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Link
                    to="/processes/new"
                    className={buttonVariants({
                      size: 'lg',
                      className: 'rounded-md px-4 text-[13px]',
                    })}
                  >
                    <FilePlus2Icon data-icon="inline-start" />
                    Iniciar novo processo
                  </Link>
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        )}
      </ProcessPage>
    </ContributorShell>
  )
}
