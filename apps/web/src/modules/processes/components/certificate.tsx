import { CheckCircle2Icon, DownloadIcon, Share2Icon, ShieldCheckIcon } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

import { Badge } from '@/modules/shared/components/ui/badge'
import { Button } from '@/modules/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/modules/shared/components/ui/card'
import { downloadIssuedDocument } from '../lib/document-actions'
import { useProcessStore } from '../lib/process-store'

export function CertificatePreview() {
  const { classification, company, completedEstablishment, establishment, process } =
    useProcessStore()
  const certificateEstablishment = completedEstablishment ?? establishment
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useEffect(() => {
    void QRCode.toDataURL(
      `${window.location.origin}/public-consultation?document=${process.documentNumber}`,
      {
        margin: 1,
        width: 220,
        color: { dark: '#18181b', light: '#ffffff' },
      },
    ).then(setQrCodeUrl)
  }, [process.documentNumber])

  return (
    <div className="bg-background">
      <Card className="overflow-hidden border-foreground/15 shadow-lg print:shadow-none">
        <div className="h-2 bg-primary" aria-hidden="true" />
        <CardHeader className="border-b bg-muted/30 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheckIcon aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-xl">Certificado de Segurança Contra Incêndio</CardTitle>
              <CardDescription className="mt-1">
                Corpo de Bombeiros Militar de Pernambuco
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="mt-4 sm:mt-0">
            <CheckCircle2Icon aria-hidden="true" />
            Documento válido
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest">
              Número do documento
            </p>
            <p className="mt-2 font-semibold text-2xl tracking-tight">{process.documentNumber}</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <CertificateField label="Razão Social" value={company.legalName} />
              <CertificateField label="Nome Fantasia" value={company.tradeName} />
              <CertificateField label="CNPJ" value={company.cnpj} />
              <CertificateField label="Empreendimento" value={certificateEstablishment.name} />
              <CertificateField
                label="Endereço"
                value={`${certificateEstablishment.address}, ${certificateEstablishment.number} — ${certificateEstablishment.neighborhood}, ${certificateEstablishment.city}/${certificateEstablishment.state}`}
              />
              <CertificateField
                label="Classificação"
                value={
                  classification === 'risk-2'
                    ? 'Risco 2 — Rito sujeito a análise'
                    : 'Risco 1 — Baixo potencial de risco'
                }
              />
              <CertificateField label="Processo" value={process.processNumber} />
              <CertificateField label="Protocolo" value={process.protocolNumber} />
              <CertificateField label="Data de emissão" value={process.issuedAt} />
              <CertificateField label="Validade" value={process.validUntil} />
              <CertificateField label="Versão do COSCIP" value={process.coscipVersion} />
              <CertificateField label="Situação" value="Válido" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border bg-background p-5 text-center">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code para validação pública do certificado"
                className="size-40"
              />
            ) : (
              <div className="size-40 rounded-lg bg-muted" aria-hidden="true" />
            )}
            <p className="mt-3 max-w-40 text-muted-foreground text-xs leading-5">
              Escaneie para validar a autenticidade
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4 border-t bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-xs">
            <p className="text-muted-foreground">Hash de validação</p>
            <p className="mt-1 break-all font-mono">{process.validationHash}</p>
            <p className="mt-2 font-medium">Assinado digitalmente pelo SAC-NEXUS</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 print:hidden" data-pdf-ignore="true">
            <Button type="button" variant="outline" onClick={() => void shareCertificate()}>
              <Share2Icon data-icon="inline-start" />
              Compartilhar
            </Button>
            <Button
              type="button"
              onClick={() =>
                void downloadIssuedDocument({
                  company,
                  establishment: certificateEstablishment,
                  process,
                  classification: classification ?? 'risk-1',
                })
              }
            >
              <DownloadIcon data-icon="inline-start" />
              Baixar PDF
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

function CertificateField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-1 font-medium text-sm leading-6">{value}</p>
    </div>
  )
}

async function shareCertificate() {
  const shareData = {
    title: 'Certificado SAC-NEXUS',
    text: 'Valide este certificado no portal SAC-NEXUS.',
    url: window.location.href,
  }

  if (navigator.share) {
    await navigator.share(shareData)
    return
  }

  await navigator.clipboard.writeText(window.location.href)
}
