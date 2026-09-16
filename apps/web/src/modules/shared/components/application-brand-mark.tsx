export function ApplicationBrandMark() {
  return (
    <span className="relative flex size-6 shrink-0 items-center justify-center" aria-hidden="true">
      <span className="absolute h-4 w-1.5 -translate-x-1 -skew-x-12 rounded-sm bg-brand-mark-primary" />
      <span className="absolute h-4 w-1.5 translate-x-1 -skew-x-12 rounded-sm bg-brand-mark-secondary" />
    </span>
  )
}
