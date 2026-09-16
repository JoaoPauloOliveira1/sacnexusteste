import {
  CheckCircle2Icon,
  LockIcon,
  type LucideIcon,
  MapPinIcon,
  MinusIcon,
  UserIcon,
} from 'lucide-react'

import { cn } from '@/modules/shared/lib/utils'

type SignupStepperStep = {
  icon: LucideIcon
  label: string
  step: string
}

const individualSignupStepperSteps = [
  {
    icon: UserIcon,
    label: 'Dados Pessoais',
    step: 'personal-data',
  },
  {
    icon: MapPinIcon,
    label: 'Endereço',
    step: 'address',
  },
  {
    icon: LockIcon,
    label: 'Segurança',
    step: 'security',
  },
] as const

function SignupStepper({
  currentStep,
  steps,
}: {
  currentStep: string
  steps: readonly SignupStepperStep[]
}) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.step === currentStep),
  )

  return (
    <nav
      aria-label="Progresso do cadastro"
      className="w-full rounded-lg py-4 lg:absolute lg:top-0 lg:left-[calc(50%-31rem)] lg:w-72 lg:px-0 lg:pt-10 lg:pb-0"
    >
      <ol className="relative flex w-full justify-between gap-2 lg:flex-col lg:justify-start lg:gap-10">
        <span
          aria-hidden="true"
          className="absolute top-2.5 bottom-2.5 left-1 hidden border-muted-foreground border-l lg:block"
        />
        {steps.map(({ icon: Icon, label, step }, index) => {
          const isCurrent = index === currentIndex
          const isComplete = index < currentIndex
          const tone = isComplete ? 'complete' : isCurrent ? 'current' : 'pending'

          return (
            <li
              key={step}
              className="relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center lg:flex-none lg:flex-row lg:gap-2.5 lg:text-left"
            >
              <div
                aria-hidden="true"
                className={cn(
                  'z-10 size-2 rounded-full lg:mr-2 lg:shrink-0',
                  tone === 'current' && 'bg-primary',
                  tone === 'complete' && 'bg-signup-step-complete',
                  tone === 'pending' && 'bg-muted-foreground',
                )}
              />
              <span className="sr-only">
                Passo {index + 1}: {label}
                {isCurrent ? ' atual' : isComplete ? ' concluido' : ''}
              </span>
              <div
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex min-w-0 items-center justify-center gap-1 text-sm leading-5 lg:justify-start',
                  tone === 'current' && 'text-primary',
                  tone === 'complete' && 'text-signup-step-complete',
                  tone === 'pending' && 'text-muted-foreground',
                )}
              >
                {isComplete ? (
                  <CheckCircle2Icon aria-hidden="true" className="size-4 shrink-0" />
                ) : (
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                )}
                <span className="whitespace-nowrap">Passo {index + 1}</span>
                <MinusIcon aria-hidden="true" className="hidden size-4 shrink-0 lg:block" />
                <span className="hidden whitespace-nowrap lg:inline">{label}</span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { individualSignupStepperSteps, SignupStepper, type SignupStepperStep }
