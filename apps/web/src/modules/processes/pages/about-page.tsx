import { Link } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  Building2Icon,
  FileCheck2Icon,
  SearchCheckIcon,
  ShieldCheckIcon,
} from 'lucide-react'

import { buttonVariants } from '@/modules/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/modules/shared/components/ui/card'

import { PublicShell } from '../components/app-shell'

const serviceInformation = [
  {
    icon: Building2Icon,
    title: 'Cadastro centralizado',
    description: 'Empresa, empreendimento e solicitações reunidos em uma única jornada.',
  },
  {
    icon: FileCheck2Icon,
    title: 'Enquadramento pelo BRE',
    description:
      'As respostas são interpretadas automaticamente conforme as regras vigentes do COSCIP.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Emissão segura',
    description: 'Documentos contam com assinatura digital, QR Code e hash de validação.',
  },
] as const

export function AboutPage() {
  return (
    <PublicShell>
      <main>
        <section className="border-b bg-background">
          <div className="mx-auto max-w-320 px-4 py-16 sm:px-6 lg:py-24">
            <p className="font-medium text-primary text-sm">Sobre o serviço</p>
            <h1 className="mt-3 max-w-3xl text-balance font-semibold text-4xl tracking-tight sm:text-5xl">
              Segurança contra incêndio com uma jornada simples e verificável
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground leading-8">
              O SAC-NEXUS permite cadastrar empreendimentos, solicitar o AVCB e acompanhar processos
              junto ao Corpo de Bombeiros Militar de Pernambuco.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signin" className={buttonVariants({ size: 'lg' })}>
                Acessar o SAC-NEXUS
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
              <Link
                to="/public-consultation"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                <SearchCheckIcon data-icon="inline-start" />
                Consultar documento
              </Link>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-320 gap-5 px-4 py-12 sm:px-6 md:grid-cols-3 lg:py-16">
          {serviceInformation.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="shadow-xs">
              <CardHeader>
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon aria-hidden="true" />
                </span>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-6">{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </PublicShell>
  )
}
