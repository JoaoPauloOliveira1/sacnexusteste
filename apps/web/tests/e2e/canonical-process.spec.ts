import { expect, type Page, test } from '@playwright/test'

const protocolNumber = 'SAC-2026-00001234'
const geocodingResponse = JSON.stringify([
  {
    display_name: 'Avenida Norte, Santo Amaro, Recife, Pernambuco, Brasil',
    lat: '-8.057840',
    lon: '-34.885080',
  },
])

test.beforeEach(async ({ page }) => {
  await page.route('https://nominatim.openstreetmap.org/search?**', async (route) => {
    await route.fulfill({
      body: geocodingResponse,
      contentType: 'application/json',
      status: 200,
    })
  })
})

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/signin')
  await page.getByLabel('E-mail').fill(email)
  await page.getByPlaceholder('Digite sua senha').fill(password)
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()
}

async function signOut(page: Page, identityName: RegExp) {
  await page.getByRole('button', { name: identityName }).click()
  await page.getByRole('menuitem', { name: 'Sair' }).click()
  await expect(page).toHaveURL('/signin')
}

async function protocolRiskTwoRequest(page: Page) {
  await signIn(page, 'contribuinte@mail.com', '123')
  await expect(page).toHaveURL('/dashboard')
  await page.getByRole('link', { name: 'Novo processo' }).last().click()
  await page.getByRole('button', { name: 'Iniciar solicitação' }).click()

  await page.getByRole('combobox', { name: 'Empresa' }).click()
  await page.getByRole('option', { name: 'ABC Logística LTDA' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await page.getByLabel('CEP').fill('50000000')
  await page.getByLabel('Logradouro').fill('Av. Norte, 1500')
  await page.getByLabel('Bairro').fill('Santo Amaro')
  await page.getByLabel('Município').fill('Recife — PE')
  await page.getByLabel('Área construída (m²)').fill('1250')
  await page.getByLabel('Número de pavimentos').fill('2')
  await page.getByRole('button', { name: 'Salvar e continuar' }).click()
  await expect(page.getByTestId('establishment-location-panel')).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar e continuar' }).click()

  await page.getByRole('radio', { name: 'Sim' }).first().click()
  await page.getByRole('radio', { name: 'Não' }).nth(1).click()
  await page.getByRole('radio', { name: 'Não' }).nth(2).click()
  await page.getByRole('button', { name: 'Analisar enquadramento' }).click()
  await page.getByRole('button', { name: 'Continuar solicitação' }).click()

  await page.getByLabel(/CPF.*obrigatório/).fill('12345678900')
  await page.getByLabel(/Telefone.*obrigatório/).fill('81999990000')
  await page.getByRole('radio', { name: 'Representante legal' }).click()
  await page.getByLabel(/Cargo ou função.*obrigatório/).fill('Administrador')
  await page.getByRole('button', { name: 'Salvar e continuar' }).click()

  await page.getByRole('checkbox', { name: /Li integralmente/ }).click()
  await page.getByRole('checkbox', { name: /Confirmo que os dados/ }).click()
  await page.getByRole('radio', { name: /Assinar com Gov.br/ }).click()
  await page.getByRole('button', { name: 'Aceitar e continuar' }).click()

  const demoPdf = {
    name: 'documento.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 demo'),
  }
  await page.locator('#document-identification').setInputFiles(demoPdf)
  await page.locator('#document-cnpj-registration').setInputFiles({
    ...demoPdf,
    name: 'cnpj.pdf',
  })
  await page.locator('#document-extinguisher-invoice').setInputFiles({
    ...demoPdf,
    name: 'extintores.pdf',
  })
  await page.getByRole('button', { name: 'Continuar para cobrança' }).click()
  await page.getByRole('radio', { name: /PIX/ }).click()
  await page.getByRole('button', { name: 'Confirmar pagamento e continuar' }).click()
  await page.getByRole('checkbox', { name: /Confirmo que revisei/ }).click()
  await page.getByRole('button', { name: 'Protocolar solicitação' }).click()

  await expect(page.getByText(protocolNumber)).toBeVisible()
}

test('keeps one canonical Risco 2 process across contributor and firefighter profiles', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await protocolRiskTwoRequest(page)

  await signOut(page, /João Carlos da Silva/)
  await signIn(page, 'triador@email.com', 'demonstracao')
  await expect(page).toHaveURL('/triage')
  const triageRow = page.getByRole('row').filter({ hasText: protocolNumber })
  await expect(triageRow).toContainText('ABC Logística')
  await triageRow.getByRole('link', { name: 'Abrir processo' }).click()
  await page.getByRole('button', { name: 'Iniciar triagem', exact: true }).click()
  await page.getByRole('tab', { name: 'Checklist' }).click()
  await page.getByRole('button', { name: 'Marcar todos como conferidos' }).click()
  await page.getByRole('button', { name: 'Aprovar triagem' }).click()

  await signOut(page, /Cap. Marina Albuquerque/)
  await signIn(page, 'triador@email.com', 'demonstracao')
  await expect(page).toHaveURL('/triagem')
  await page.goto('/analysis')
  await expect(page).toHaveURL('/analysis')
  const analysisRow = page.getByRole('row').filter({ hasText: protocolNumber })
  await expect(analysisRow).toContainText('ABC Logística LTDA')
  await analysisRow.getByRole('link', { name: 'Abrir análise' }).click()
  await page.getByRole('button', { name: 'Iniciar análise' }).click()
  await page.getByRole('tab', { name: 'Checklist técnico' }).click()
  await page.getByRole('button', { name: 'Concluir conferência' }).click()
  await page.getByRole('tab', { name: 'Decisão de vistoria' }).click()
  await page.getByText('Determinar vistoria', { exact: true }).click()
  await page
    .getByLabel('Fundamentação da decisão')
    .fill('A área e as condições declaradas exigem verificação presencial.')
  await page.getByRole('button', { name: 'Registrar decisão técnica' }).click()

  await signOut(page, /Sgt. Júlio Prates/)
  await signIn(page, 'vistoriador@email.com', 'demonstracao')
  await expect(page).toHaveURL('/inspections')
  const inspectionRow = page.getByRole('row').filter({ hasText: protocolNumber })
  await expect(inspectionRow).toContainText('ABC Logística')
  await inspectionRow.getByRole('link', { name: 'Abrir vistoria' }).click()
  await page.getByRole('button', { name: 'Agendar vistoria' }).click()
  await page.getByRole('button', { name: 'Iniciar vistoria' }).click()
  await page.getByRole('button', { name: 'Marcar itens como conformes' }).click()
  await page.getByLabel('Relato da vistoria').fill('Condições de segurança verificadas no local.')
  await page.getByRole('button', { name: 'Aprovar vistoria' }).click()

  await signOut(page, /Ten. Renata Melo/)
  await signIn(page, 'contribuinte@mail.com', '123')
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('2026.00001234')).toBeVisible()
  await page.getByRole('link', { name: 'Documentos', exact: true }).click()
  await expect(page.getByRole('cell', { name: /AVCB nº 2026.00001234/ })).toBeVisible()
  await expect(page.getByRole('cell', { name: /Atestado nº 2026.00001234/ })).toBeVisible()
})

test('returns an administrative requirement to the contributor and back to triage', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await protocolRiskTwoRequest(page)

  await signOut(page, /João Carlos da Silva/)
  await signIn(page, 'triador@email.com', 'demonstracao')
  const triageRow = page.getByRole('row').filter({ hasText: protocolNumber })
  await triageRow.getByRole('link', { name: 'Abrir processo' }).click()
  await page.getByRole('button', { name: 'Iniciar triagem', exact: true }).click()
  await page.getByRole('tab', { name: 'Exigências' }).click()
  await page.getByLabel('Título').fill('Documento de identificação ilegível')
  await page
    .getByLabel('Descrição')
    .fill('Envie uma cópia colorida, sem cortes e com frente e verso legíveis.')
  await page.getByLabel('Documento relacionado').click()
  await page.getByRole('option', { name: 'documento-identificacao.pdf' }).click()
  await page.getByLabel('Categoria').click()
  await page.getByRole('option', { name: 'Documento ilegível' }).click()
  await page.getByLabel('Prazo').fill('2026-08-10')
  await page.getByRole('button', { name: 'Emitir exigência administrativa' }).click()
  await expect(page.getByText('Aguardando Correções').first()).toBeVisible()

  await signOut(page, /Cap. Marina Albuquerque/)
  await signIn(page, 'contribuinte@mail.com', '123')
  await page.getByRole('link', { name: 'Acompanhar solicitação' }).click()
  await page.getByRole('button', { name: 'Retomar solicitação' }).click()
  await expect(page.getByRole('heading', { name: 'Exigências do processo' })).toBeVisible()
  await page
    .getByLabel(/Resposta ou justificativa/)
    .fill('Documento substituído por uma cópia colorida e integral.')
  await page.locator('#requirement-attachment').setInputFiles({
    name: 'identificacao-corrigida.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 documento corrigido'),
  })
  await page.getByRole('button', { name: 'Enviar resposta' }).click()
  await expect(page).toHaveURL('/dashboard')

  await signOut(page, /João Carlos da Silva/)
  await signIn(page, 'triador@email.com', 'demonstracao')
  const correctedRow = page.getByRole('row').filter({ hasText: protocolNumber })
  await correctedRow.getByRole('link', { name: 'Abrir processo' }).click()
  await expect(page.getByRole('button', { name: 'Iniciar nova triagem' })).toBeVisible()
})
