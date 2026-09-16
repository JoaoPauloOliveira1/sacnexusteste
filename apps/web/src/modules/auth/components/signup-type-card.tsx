import { Link } from '@tanstack/react-router'

import { cn } from '@/modules/shared/lib/utils'

type SignupTypeCardProps = {
  description: string
  imageAlt: string
  imageSrc?: string
  title: string
} & (
  | { search: { step: 'personal-data' }; to: '/signup/individual' }
  | { search: { step: 'company-data' }; to: '/signup/company' }
  | { search: { step: 'responsible-data' }; to: '/signup/technical-responsible' }
)

function SignupTypeCard({
  description,
  imageAlt,
  imageSrc,
  search,
  title,
  to,
}: SignupTypeCardProps) {
  return (
    <Link
      to={to}
      search={search}
      className="group flex h-auto min-h-104 w-full max-w-86 cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground outline-none transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-104"
    >
      <CardImage alt={imageAlt} src={imageSrc} />
      <span className="flex min-h-30 flex-col gap-2 px-6 py-6">
        <span className="font-semibold text-xl leading-7">{title}</span>
        <span className="text-muted-foreground text-sm leading-5">{description}</span>
      </span>
    </Link>
  )
}

function CardImage({ alt, src }: { alt: string; src?: string | undefined }) {
  const className =
    'h-74 w-full object-cover grayscale transition duration-300 ease-out group-hover:grayscale-0 group-focus-visible:grayscale-0'

  if (src) {
    return <img src={src} alt={alt} className={className} />
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        className,
        'block bg-linear-to-br from-muted via-primary/25 to-muted-foreground/30',
      )}
    />
  )
}

export { SignupTypeCard }
