import { AppShell } from '../components/app-shell'
import { CertificatePreview } from '../components/certificate'

export function CertificatePage() {
  return (
    <AppShell
      title="Certificado emitido"
      description="Visualize os dados do documento e utilize o QR Code ou o hash para validar sua autenticidade."
      eyebrow="Documento válido"
      backTo="/dashboard"
    >
      <CertificatePreview />
    </AppShell>
  )
}
