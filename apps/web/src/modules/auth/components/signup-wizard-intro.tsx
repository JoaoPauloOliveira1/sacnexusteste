function SignupWizardIntro({
  accountType,
  description,
}: {
  accountType: string
  description?: string
}) {
  return (
    <h1 className="min-h-16 text-center font-medium text-base text-muted-foreground leading-6">
      <span className="block">Você está criando sua conta</span>
      <span className="block whitespace-nowrap">
        como <strong className="font-bold text-signup-heading-strong">{accountType}</strong>
      </span>
      {description ? (
        <span className="block text-signup-heading-strong text-sm">{description}</span>
      ) : null}
    </h1>
  )
}

export { SignupWizardIntro }
