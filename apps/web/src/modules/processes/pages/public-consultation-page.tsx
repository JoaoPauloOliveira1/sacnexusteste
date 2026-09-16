import {
  AlertCircleIcon,
  CalendarX2Icon,
  CheckCircle2Icon,
  QrCodeIcon,
  SearchIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/modules/shared/components/ui/alert'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Button } from '@/modules/shared/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'

import { PublicShell } from '../components/app-shell'
import { DataList, SectionCard } from '../components/content'
import {
  createIssuedDocuments,
  demoCompany,
  demoEstablishment,
  demoProcess,
  findIssuedDocument,
  initialBreAnswers,
} from '../lib/process-data'
import { useProcesses } from '../lib/process-store'
import { type CompletedProcess, type IssuedDocumentMatch } from '../types'

type ConsultationResult =
  | { status: 'valid'; match: IssuedDocumentMatch }
  | { status: 'invalid' }
  | { status: 'expired' }
  | null

const demoCompletedProcess: CompletedProcess = {
  process: demoProcess,
  company: demoCompany,
  establishment: demoEstablishment,
  answers: initialBreAnswers,
  classification: 'risk-1',
  issuedDocuments: createIssuedDocuments(demoProcess, 'risk-1'),
  history: [],
}

export function PublicConsultationPage({
  initialDocument = demoProcess.documentNumber,
}: {
  initialDocument?: string
}) {
  const { meta } = useProcesses()
  const [documentNumber, setDocumentNumber] = useState(initialDocument)
  const [result, setResult] = useState<ConsultationResult>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleConsultation(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 700))
    const records = meta.completedProcesses.some(
      ({ process }) => process.id === demoCompletedProcess.process.id,
    )
      ? meta.completedProcesses
      : [...meta.completedProcesses, demoCompletedProcess]
    const match = findIssuedDocument(records, documentNumber)
    setResult(
      match
        ? { status: 'valid', match }
        : {
            status: documentNumber.trim() === 'AVCB-R1-2025-000067' ? 'expired' : 'invalid',
          },
    )
    setIsLoading(false)
  }

  return (
    <PublicShell>
      <main className="mx-auto max-w-240 px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <SearchIcon aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-semibold text-3xl tracking-tight sm:text-4xl">
            Consulta pública
          </h1>
          <p className="mt-3 text-muted-foreground leading-7">
            Valide a autenticidade e a situação de documentos emitidos pelo SAC-NEXUS.
          </p>
        </div>

        <SectionCard
          title="Consultar documento"
          description="Informe o número do documento. A leitura do QR Code direciona para esta mesma validação."
          className="mx-auto mt-10 max-w-2xl"
        >
          <form onSubmit={(event) => void handleConsultation(event)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="documentNumber">Número do documento</FieldLabel>
                <Input
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(event) => setDocumentNumber(event.target.value)}
                  placeholder="AVCB-R1-AAAA-000000"
                />
                <FieldDescription>
                  Também é possível informar um número de processo, protocolo ou hash permitido.
                </FieldDescription>
              </Field>
              <Button type="submit" size="lg" isLoading={isLoading}>
                <SearchIcon data-icon="inline-start" />
                Consultar
              </Button>
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                <QrCodeIcon aria-hidden="true" />
                Aponte a câmera do celular para o QR Code do certificado
              </div>
            </FieldGroup>
          </form>
        </SectionCard>

        {result ? (
          <div className="mx-auto mt-6 max-w-2xl" aria-live="polite">
            <ConsultationResultCard result={result} />
          </div>
        ) : null}
      </main>
    </PublicShell>
  )
}

function ConsultationResultCard({ result }: { result: Exclude<ConsultationResult, null> }) {
  if (result.status === 'invalid') {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon aria-hidden="true" />
        <AlertTitle>Documento não localizado ou inválido</AlertTitle>
        <AlertDescription>Verifique os dados informados e tente novamente.</AlertDescription>
      </Alert>
    )
  }

  if (result.status === 'expired') {
    return (
      <Alert>
        <CalendarX2Icon aria-hidden="true" />
        <AlertTitle>Documento localizado</AlertTitle>
        <AlertDescription>
          A situação deste documento é expirada. Emitido em 20/07/2025, com validade encerrada em
          20/07/2026.
        </AlertDescription>
      </Alert>
    )
  }

  const { document, record } = result.match
  const riskLabel = record.classification === 'risk-2' ? 'Risco 2' : 'Risco 1'

  return (
    <SectionCard
      title="Documento válido"
      description="A autenticidade e a vigência do documento foram confirmadas."
    >
      <div className="mb-6 flex items-center gap-3 rounded-xl border bg-primary/5 p-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckCircle2Icon aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold">Situação: Válido</p>
          <p className="text-muted-foreground text-sm">Documento emitido pelo SAC-NEXUS</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          <ShieldCheckIcon aria-hidden="true" />
          {riskLabel}
        </Badge>
      </div>
      <DataList
        items={[
          { label: 'Razão Social', value: record.company.legalName },
          { label: 'CNPJ', value: maskCnpj(record.company.cnpj) },
          { label: 'Empreendimento', value: record.establishment.name },
          {
            label: 'Endereço',
            value: `${record.establishment.address}, ${record.establishment.number} — ${record.establishment.city}/${record.establishment.state}`,
          },
          { label: 'Tipo do documento', value: document.label },
          { label: 'Número', value: document.number },
          { label: 'Classificação de risco', value: riskLabel },
          { label: 'Data de emissão', value: document.issuedAt },
          { label: 'Data de validade', value: document.validUntil },
        ]}
      />
    </SectionCard>
  )
}

function maskCnpj(cnpj: string) {
  return cnpj.replace(/^(\d{2}\.\d{3})\.\d{3}\/\d{4}-(\d{2})$/, '$1.*** / ****-$2')
}
