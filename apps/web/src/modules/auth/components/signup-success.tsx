import { CheckCircle2Icon } from 'lucide-react'

import { Button } from '@/modules/shared/components/ui/button'

function SignupSuccess({ onBackToSignup }: { onBackToSignup: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2Icon aria-hidden="true" className="size-7" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl leading-8">Cadastro iniciado com sucesso</h1>
        <p className="text-muted-foreground text-sm leading-5">
          Validamos o código localmente para esta etapa visual. A criação real da conta será
          integrada em uma próxima fase.
        </p>
      </div>
      <Button type="button" className="h-10 w-full rounded-md" onClick={onBackToSignup}>
        Voltar para opções de cadastro
      </Button>
    </div>
  )
}

export { SignupSuccess }
