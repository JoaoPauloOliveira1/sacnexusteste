import { expect, type Page, test } from '@playwright/test'

const individualSignupDraftStorageKey = 'sac-nexus:individual-signup-draft'

async function fillIndividualSignupPersonalData(page: Page) {
  await page.getByRole('textbox', { exact: true, name: 'Nome' }).fill('Maria')
  await page.getByRole('textbox', { name: 'Sobrenome' }).fill('Silva')
  await page.getByRole('textbox', { name: 'CPF' }).fill('52998224725')
  await page.locator('#birthDate').click()
  await page.locator('button[data-day]').first().click()
}

async function fillIndividualSignupAddress(page: Page) {
  await page.getByLabel('CEP').fill('50000000')
  await page.getByLabel('Rua').fill('Rua do Sol')
  await page.getByRole('textbox', { exact: true, name: 'Número' }).fill('123')
  await page.getByLabel('Bairro').fill('Boa Vista')
  await page.getByLabel('Cidade').fill('Recife')
  await page.getByRole('combobox', { name: 'Estado' }).click()
  await page.getByRole('option', { name: 'PE' }).click()
}

async function fillSignupCompanyData(page: Page) {
  await page.getByLabel('Razão social').fill('Empresa Exemplo LTDA')
  await page.getByLabel('Nome fantasia').fill('Empresa Exemplo')
  await page.getByLabel('CNPJ').fill('04252011000110')
  await page.getByLabel('CPF representante').fill('52998224725')
  await page.getByLabel('E-mail').fill('empresa@example.com')
  await page.getByLabel('Telefone').fill('81999998888')
}

async function fillSignupSecurity(page: Page) {
  await page.getByRole('textbox', { exact: true, name: 'Senha' }).fill('password123')
  await page.getByRole('textbox', { name: 'Confirmação de senha' }).fill('password123')
  await page.getByRole('checkbox', { name: 'Aceito Termos de Uso' }).click()
  await page.getByRole('checkbox', { name: 'Aceito Política de Privacidade' }).click()
}

test('redirects the root route to sign in', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL('/signin')
  await expect(page.getByRole('button', { exact: true, name: 'Entrar' })).toBeVisible()
})

test('renders the sign-in route', async ({ page }) => {
  await page.goto('/signin')

  await expect(
    page.getByText('Entre com suas credenciais para acessar o sistema SAC Nexus'),
  ).toBeVisible()
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByPlaceholder('Digite sua senha')).toBeVisible()
  await expect(page.getByRole('button', { exact: true, name: 'Entrar' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Cadastre-se' })).toBeVisible()
})

test('enters the presentation journey through the main sign-in action', async ({ page }) => {
  await page.goto('/signin')

  await expect(page.getByLabel('E-mail')).toHaveValue('contribuinte@mail.com')
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()

  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible()
})

test('navigates to forgot password', async ({ page }) => {
  await page.goto('/signin')
  await page.getByRole('link', { name: 'Esqueci minha senha' }).click()

  await expect(page).toHaveURL('/forgot-password')
})

test('navigates to sign up', async ({ page }) => {
  await page.goto('/signin')
  await page.getByRole('link', { name: 'Cadastre-se' }).click()

  await expect(page).toHaveURL('/signup')
})

test('renders the signup hub', async ({ page }) => {
  await page.goto('/signup')

  await expect(page.getByRole('heading', { name: 'Como deseja se cadastrar?' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Pessoa Física/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Empresa \/ CNPJ/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Responsável Técnico/i })).toBeVisible()
})

test('signup hub cards navigate to placeholder flows', async ({ page }) => {
  await page.goto('/signup')
  await page.getByRole('link', { name: /Pessoa Física/i }).click()
  await expect(page).toHaveURL('/signup/individual?step=personal-data')

  await page.goto('/signup')
  await page.getByRole('link', { name: /Empresa \/ CNPJ/i }).click()
  await expect(page).toHaveURL('/signup/company?step=company-data')

  await page.goto('/signup')
  await page.getByRole('link', { name: /Responsável Técnico/i }).click()
  await expect(page).toHaveURL('/signup/technical-responsible?step=responsible-data')
})

test('signup hub sign-in links navigate to sign in', async ({ page }) => {
  await page.goto('/signup')
  await page.getByRole('link', { name: 'Voltar' }).click()
  await expect(page).toHaveURL('/signin')

  await page.goto('/signup')
  await page.getByRole('link', { name: 'Entrar' }).click()
  await expect(page).toHaveURL('/signin')
})

test('renders the signup hub on mobile width without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/signup')

  await expect(page.getByRole('heading', { name: 'Como deseja se cadastrar?' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Pessoa Física/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Responsável Técnico/i })).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )

  expect(hasHorizontalOverflow).toBe(false)
})

test('normalizes invalid individual signup steps', async ({ page }) => {
  await page.goto('/signup/individual?step=invalid')

  await expect(page).toHaveURL('/signup/individual?step=personal-data')
  await expect(page.getByRole('heading', { name: /Você está criando sua conta/i })).toBeVisible()
})

test('completes the local individual signup wizard', async ({ page }) => {
  await page.goto('/signup/individual')

  await fillIndividualSignupPersonalData(page)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL('/signup/individual?step=address')

  await fillIndividualSignupAddress(page)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL('/signup/individual?step=security')

  await fillSignupSecurity(page)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL('/signup/individual?step=email-verification')

  await page.getByLabel('Código de verificação').fill('123456')
  await expect(page.getByRole('button', { name: 'Validar' })).toBeEnabled()
  await page.getByRole('button', { name: 'Validar' }).click()
  await expect(page.getByRole('button', { name: 'Validar' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Validar' })).toHaveAttribute('aria-busy', 'true')

  await expect(page).toHaveURL('/signup/individual-success', { timeout: 5000 })
  await expect(page.getByRole('heading', { name: 'Cadastro iniciado com sucesso' })).toBeVisible()
  await expect(
    page.getByText('A criação real da conta será integrada em uma próxima fase.'),
  ).toBeVisible()
})

test('individual signup back button returns to the previous step', async ({ page }) => {
  await page.goto('/signup/individual?step=security')

  await page.getByRole('button', { name: 'Voltar' }).click()

  await expect(page).toHaveURL('/signup/individual?step=address')
  await expect(page.getByText('Passo 2', { exact: true })).toBeVisible()
})

test('does not complete OTP validation after leaving the step', async ({ page }) => {
  await page.goto('/signup/individual?step=email-verification')

  await page.getByLabel('Código de verificação').fill('123456')
  await page.getByRole('button', { name: 'Validar' }).click()
  await page.getByRole('button', { name: 'Voltar' }).click()

  await expect(page).toHaveURL('/signup/individual?step=security')
  await page.waitForTimeout(3500)
  await expect(page).toHaveURL('/signup/individual?step=security')
})

test('does not rehydrate sensitive individual signup fields after refresh', async ({ page }) => {
  await page.addInitScript((storageKey) => {
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        birthDate: '1990-01-01',
        cep: '50000-000',
        city: 'Recife',
        cpf: '123.456.789-01',
        firstName: 'Maria',
        lastName: 'Silva',
        neighborhood: 'Boa Vista',
        number: '123',
        password: 'password123',
        passwordConfirmation: 'password123',
        state: 'PE',
        street: 'Rua do Sol',
      }),
    )
  }, individualSignupDraftStorageKey)

  await page.goto('/signup/individual')

  await expect(page.getByRole('textbox', { exact: true, name: 'Nome' })).toHaveValue('')
  await expect(page.getByRole('textbox', { name: 'Sobrenome' })).toHaveValue('')
  await expect(page.getByRole('textbox', { name: 'CPF' })).toHaveValue('')

  await page.goto('/signup/individual?step=security')

  await page.getByRole('textbox', { exact: true, name: 'Senha' }).fill('password123')
  await page.getByRole('textbox', { name: 'Confirmação de senha' }).fill('password123')
  await page.reload()

  await expect(page.getByRole('textbox', { exact: true, name: 'Senha' })).toHaveValue('')
  await expect(page.getByRole('textbox', { name: 'Confirmação de senha' })).toHaveValue('')
})

test('completes the local company signup wizard', async ({ page }) => {
  await page.goto('/signup/company')

  await fillSignupCompanyData(page)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL('/signup/company?step=address')

  await fillIndividualSignupAddress(page)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL('/signup/company?step=security')

  await fillSignupSecurity(page)
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL('/signup/company?step=email-verification')

  await page.getByLabel('Código de verificação').fill('123456')
  await page.getByRole('button', { name: 'Validar' }).click()

  await expect(page).toHaveURL('/signup/company-success', { timeout: 5000 })
  await expect(page.getByRole('heading', { name: 'Cadastro iniciado com sucesso' })).toBeVisible()
})

test('clears company document validation errors after correcting values', async ({ page }) => {
  await page.goto('/signup/company')

  await page.getByLabel('Razão social').fill('Empresa Exemplo LTDA')
  await page.getByLabel('Nome fantasia').fill('Empresa Exemplo')
  await page.getByLabel('CNPJ').fill('11111111111111')
  await page.getByLabel('CPF representante').fill('11111111111')
  await page.getByLabel('E-mail').fill('empresa@example.com')
  await page.getByLabel('Telefone').fill('81999998888')
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByText('Informe um CNPJ válido.')).toBeVisible()
  await expect(page.getByText('Informe um CPF válido.')).toBeVisible()

  await page.getByLabel('CNPJ').fill('04252011000110')
  await page.getByLabel('CPF representante').fill('52998224725')

  await expect(page.getByText('Informe um CNPJ válido.')).toBeHidden()
  await expect(page.getByText('Informe um CPF válido.')).toBeHidden()

  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL('/signup/company?step=address')
})

test('completes the local technical responsible signup wizard', async ({ page }) => {
  await page.goto('/signup/technical-responsible')

  await page.getByRole('textbox', { exact: true, name: 'Nome' }).fill('Maria')
  await page.getByRole('textbox', { name: 'Sobrenome' }).fill('Silva')
  await page.getByRole('textbox', { name: 'CPF' }).fill('52998224725')
  await page.locator('#birthDate').click()
  await page.locator('button[data-day]').first().click()
  await page.getByLabel('Documento de identificação').fill('CREA 123456')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL('/signup/technical-responsible?step=company-data')

  await fillSignupCompanyData(page)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL('/signup/technical-responsible?step=address')

  await fillIndividualSignupAddress(page)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL('/signup/technical-responsible?step=security')

  await fillSignupSecurity(page)
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL('/signup/technical-responsible?step=email-verification')

  await page.getByLabel('Código de verificação').fill('123456')
  await page.getByRole('button', { name: 'Validar' }).click()

  await expect(page).toHaveURL('/signup/technical-responsible-success', { timeout: 5000 })
  await expect(page.getByRole('heading', { name: 'Cadastro iniciado com sucesso' })).toBeVisible()
})

test('normalizes invalid company and technical responsible signup steps', async ({ page }) => {
  await page.goto('/signup/company?step=invalid')

  await expect(page).toHaveURL('/signup/company?step=company-data')

  await page.goto('/signup/technical-responsible?step=invalid')

  await expect(page).toHaveURL('/signup/technical-responsible?step=responsible-data')
})

test('renders company and technical responsible signup on mobile without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 })

  await page.goto('/signup/company?step=company-data')
  await expect(page.getByLabel('Razão social')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  )

  await page.goto('/signup/technical-responsible?step=responsible-data')
  await expect(page.getByLabel('Documento de identificação')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  )
})

test('renders individual signup OTP on mobile without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/signup/individual?step=email-verification')

  await expect(page.getByLabel('Código de verificação')).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )

  expect(hasHorizontalOverflow).toBe(false)
})

test('renders the sign-in route on mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/signin')

  await expect(page.getByRole('button', { exact: true, name: 'Entrar' })).toBeVisible()
  await expect(page.getByLabel('E-mail')).toBeVisible()
})
