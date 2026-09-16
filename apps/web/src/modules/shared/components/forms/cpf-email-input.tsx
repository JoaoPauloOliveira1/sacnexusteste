import { Input } from '@/modules/shared/components/ui/input'
import { formatCpfEmailInput } from '@/modules/shared/lib/formatters/format-cpf'

interface CpfEmailInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  onValueChange: (value: string) => void
  value: string
}

function CpfEmailInput({ onValueChange, value, ...props }: CpfEmailInputProps) {
  return (
    <Input
      inputMode="email"
      autoCapitalize="none"
      autoComplete="username"
      value={value}
      onChange={(event) => onValueChange(formatCpfEmailInput(event.target.value))}
      {...props}
    />
  )
}

export { CpfEmailInput }
