import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useId, useState } from 'react'

import { Input } from '@/modules/shared/components/ui/input'
import { cn } from '@/modules/shared/lib/utils'

interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, 'type'> {
  hidePasswordLabel: string
  showPasswordLabel: string
}

function PasswordInput({
  className,
  hidePasswordLabel,
  id,
  showPasswordLabel,
  ...props
}: PasswordInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const label = isPasswordVisible ? hidePasswordLabel : showPasswordLabel
  const Icon = isPasswordVisible ? EyeOffIcon : EyeIcon

  return (
    <div className="relative">
      <Input
        id={inputId}
        type={isPasswordVisible ? 'text' : 'password'}
        className={cn(className, 'pr-10')}
        {...props}
      />
      <button
        type="button"
        aria-controls={inputId}
        aria-label={label}
        aria-pressed={isPasswordVisible}
        className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={() => setIsPasswordVisible((current) => !current)}
      >
        <Icon aria-hidden="true" className="size-5" />
      </button>
    </div>
  )
}

export { PasswordInput }
