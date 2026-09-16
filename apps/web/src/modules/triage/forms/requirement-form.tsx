import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/modules/shared/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shared/components/ui/select'
import { Textarea } from '@/modules/shared/components/ui/textarea'
import { sleep } from '@/modules/shared/lib/sleep'
import { requirementSchema } from '../schemas/requirement-schema'
import { type RequirementDraft, type TriageDocument } from '../types'

interface RequirementFormProps {
  documents: readonly TriageDocument[]
  onSubmit: (draft: RequirementDraft) => void
}

const categories = [
  'Documentação ausente',
  'Documento ilegível',
  'Formato inválido',
  'Dados cadastrais',
  'Responsabilidade técnica',
  'Assinatura obrigatória',
] as const

export function RequirementForm({ documents, onSubmit }: RequirementFormProps) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<RequirementDraft>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      title: '',
      description: '',
      relatedDocument: '',
      category: '',
      deadline: '2026-07-27',
      observations: '',
    },
  })

  async function submitRequirement(values: RequirementDraft) {
    await sleep(500)
    onSubmit(values)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(submitRequirement)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="requirement-title">Título</FieldLabel>
          <Input
            id="requirement-title"
            placeholder="Ex.: Substituir ART sem assinatura"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          <FieldError>{errors.title?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="requirement-description">Descrição</FieldLabel>
          <Textarea
            id="requirement-description"
            placeholder="Descreva objetivamente a inconsistência documental ou cadastral."
            aria-invalid={!!errors.description}
            {...register('description')}
          />
          <FieldError>{errors.description?.message}</FieldError>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="relatedDocument"
            render={({ field }) => (
              <Field data-invalid={!!errors.relatedDocument}>
                <FieldLabel htmlFor="related-document">Documento relacionado</FieldLabel>
                <Select value={field.value} onValueChange={(value) => field.onChange(value ?? '')}>
                  <SelectTrigger
                    id="related-document"
                    className="w-full"
                    aria-invalid={!!errors.relatedDocument}
                  >
                    <SelectValue placeholder="Selecione um documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {documents.map((document) => (
                        <SelectItem key={document.id} value={document.name}>
                          {document.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.relatedDocument?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Field data-invalid={!!errors.category}>
                <FieldLabel htmlFor="requirement-category">Categoria</FieldLabel>
                <Select value={field.value} onValueChange={(value) => field.onChange(value ?? '')}>
                  <SelectTrigger
                    id="requirement-category"
                    className="w-full"
                    aria-invalid={!!errors.category}
                  >
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.category?.message}</FieldError>
              </Field>
            )}
          />
        </div>

        <Field data-invalid={!!errors.deadline}>
          <FieldLabel htmlFor="requirement-deadline">Prazo</FieldLabel>
          <Input
            id="requirement-deadline"
            type="date"
            min="2026-07-21"
            aria-invalid={!!errors.deadline}
            {...register('deadline')}
          />
          <FieldError>{errors.deadline?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.observations}>
          <FieldLabel htmlFor="requirement-observations">Observações</FieldLabel>
          <Textarea
            id="requirement-observations"
            placeholder="Inclua orientações adicionais, sem exigências de natureza técnica."
            aria-invalid={!!errors.observations}
            {...register('observations')}
          />
          <FieldError>{errors.observations?.message}</FieldError>
        </Field>
      </FieldGroup>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          Emitir exigência administrativa
        </Button>
      </div>
    </form>
  )
}
