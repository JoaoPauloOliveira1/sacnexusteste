import { stat } from 'node:fs/promises'

import { expect, type Page, test } from '@playwright/test'

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

async function confirmEstablishmentLocation(page: Page) {
  await expect(page.getByTestId('establishment-location-panel')).toBeHidden()
  await page.getByRole('button', { name: 'Salvar e continuar' }).click()
  await expect(page.getByTestId('establishment-location-panel')).toBeVisible()
  await expect(page).toHaveURL('/processes/new/establishment')
  await expect(page.getByTestId('establishment-location-panel')).not.toContainText(
    /-?\d+\.\d{4,},\s*-?\d+\.\d{4,}/,
  )
  await page.getByRole('button', { name: 'Confirmar e continuar' }).click()
}

test('completes the Risco 1 presentation journey', async ({ page }, testInfo) => {
  test.setTimeout(45_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/signin')
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()

  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible()
  await page.getByRole('link', { name: 'Novo processo' }).last().click()

  await expect(
    page.getByRole('heading', { name: 'Regularização de estabelecimento' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Iniciar solicitação' }).click()

  await expect(page.getByRole('heading', { name: 'Empresa responsável' })).toBeVisible()
  await expect(page.getByRole('progressbar', { name: 'Progresso da solicitação' })).toHaveAttribute(
    'aria-valuetext',
    'Etapa 1 de 4: Solicitação',
  )
  await page.getByRole('combobox', { name: 'Empresa' }).click()
  await page.getByRole('option', { name: 'ABC Logística LTDA' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByRole('heading', { name: 'Dados do estabelecimento' })).toBeVisible()
  await expect(page.getByRole('progressbar', { name: 'Progresso da solicitação' })).toHaveAttribute(
    'aria-valuetext',
    'Etapa 2 de 4: Estabelecimento',
  )
  await expect(page.getByLabel('CEP')).toHaveValue('')
  await page.getByLabel('CEP').fill('50000000')
  await expect(page.getByLabel('CEP')).toHaveValue('50000-000')
  await page.getByLabel('Logradouro').fill('Av. Norte, 1500')
  await page.getByLabel('Bairro').fill('Santo Amaro')
  await page.getByLabel('Município').fill('Recife — PE')
  await page.getByLabel('Área construída (m²)').fill('450')
  await page.getByLabel('Número de pavimentos').fill('1')
  await confirmEstablishmentLocation(page)

  await expect(
    page.getByRole('heading', { name: 'Características do estabelecimento' }),
  ).toBeVisible()
  await expect(page.getByRole('progressbar', { name: 'Progresso da solicitação' })).toHaveAttribute(
    'aria-valuetext',
    'Etapa 3 de 4: Características',
  )
  for (const radio of await page.getByRole('radio', { name: 'Não' }).all()) {
    await radio.click()
  }
  await page.getByRole('button', { name: 'Analisar enquadramento' }).click()

  await expect(page.getByRole('heading', { name: 'Analisando enquadramento' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Resultado do enquadramento' })).toBeVisible({
    timeout: 5000,
  })
  await expect(page.getByRole('progressbar', { name: 'Progresso da solicitação' })).toHaveAttribute(
    'aria-valuetext',
    'Etapa 4 de 4: Enquadramento',
  )
  await expect(page.getByText('RISCO 1 • BAIXO RISCO')).toBeVisible()
  await page.getByRole('button', { name: 'Continuar para declaração' }).click()

  await expect(page.getByText('Risco 1', { exact: true })).toBeVisible()
  await page
    .getByRole('checkbox', {
      name: /Declaro que as informações prestadas são verdadeiras/,
    })
    .click()
  await page.getByRole('button', { name: 'Confirmar e emitir DDLCB' }).click()

  await expect(
    page.getByRole('heading', { name: 'Dispensa de licenciamento emitida' }),
  ).toBeVisible({
    timeout: 5000,
  })
  await expect(page.getByText('DDLCB nº 2026.00001234')).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baixar PDF' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('2026.00001234-ddlcb.pdf')
  const documentPath = testInfo.outputPath(download.suggestedFilename())
  await download.saveAs(documentPath)
  expect((await stat(documentPath)).size).toBeGreaterThan(10_000)

  await page.getByRole('link', { name: 'Início' }).click()
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('2026.00001234')).toBeVisible()
  await page.getByRole('link', { name: 'Ver processo' }).click()
  await expect(page.getByRole('heading', { name: 'Detalhes do processo' })).toBeVisible()

  await page.getByRole('link', { name: 'Novo processo' }).click()
  await page.getByRole('button', { name: 'Iniciar solicitação' }).click()
  await page.getByRole('combobox', { name: 'Empresa' }).click()
  await page.getByRole('option', { name: 'ABC Logística LTDA' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByLabel('CEP')).toHaveValue('')
  await page.getByLabel('CEP').fill('51020000')
  await expect(page.getByLabel('CEP')).toHaveValue('51020-000')
  await page.getByLabel('Logradouro').fill('Av. Boa Viagem, 500')
  await page.getByLabel('Bairro').fill('Boa Viagem')
  await page.getByLabel('Município').fill('Recife — PE')
  await page.getByLabel('Área construída (m²)').fill('320')
  await page.getByLabel('Número de pavimentos').fill('2')
  await confirmEstablishmentLocation(page)
  for (const radio of await page.getByRole('radio', { name: 'Não' }).all()) {
    await radio.click()
  }
  await page.getByRole('button', { name: 'Analisar enquadramento' }).click()
  await page.getByRole('button', { name: 'Continuar para declaração' }).click()
  await page
    .getByRole('checkbox', {
      name: /Declaro que as informações prestadas são verdadeiras/,
    })
    .click()
  await page.getByRole('button', { name: 'Confirmar e emitir DDLCB' }).click()
  await expect(page.getByText('DDLCB nº 2026.00001235')).toBeVisible({ timeout: 5000 })

  await page.getByRole('link', { name: 'Início' }).click()
  await expect(page.getByText('2026.00001234')).toBeVisible()
  await expect(page.getByText('2026.00001235')).toBeVisible()
  await expect(page.getByText('2', { exact: true }).first()).toBeVisible()

  await page.getByRole('link', { name: 'Regularizações', exact: true }).click()
  await expect(page).toHaveURL('/processes/avcb')
  await expect(page.getByRole('heading', { name: 'Regularizações concluídas' })).toBeVisible()
  await expect(page.getByRole('row')).toHaveCount(3)
  await expect(page.getByRole('cell', { name: 'DDLCB', exact: true })).toHaveCount(2)

  await page.getByRole('link', { name: 'ABC Logística', exact: true }).click()
  await expect(page).toHaveURL('/companies/company-abc-logistica')
  await expect(page.getByRole('heading', { name: 'ABC Logística' })).toBeVisible()
  await expect(page.getByText('12.345.678/0001-90')).toBeVisible()

  await page.getByRole('link', { name: 'Documentos', exact: true }).click()
  await expect(page).toHaveURL('/documents')
  await expect(page.getByRole('heading', { name: 'Documentos' })).toBeVisible()
  await expect(page.getByRole('row')).toHaveCount(3)

  await page.getByRole('link', { name: 'Notificações', exact: true }).click()
  await expect(page).toHaveURL('/notifications')
  await expect(page.getByRole('heading', { name: 'Notificações' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'DDLCB emitida' })).toHaveCount(2)
})

test('completes the contributor Risco 2 journey with a requirement and conditional inspection', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/signin')
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()
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
  await confirmEstablishmentLocation(page)

  await page.getByRole('radio', { name: 'Sim' }).nth(0).click()
  await page.getByRole('radio', { name: 'Não' }).nth(1).click()
  await page.getByRole('radio', { name: 'Não' }).nth(2).click()
  await page.getByRole('button', { name: 'Analisar enquadramento' }).click()

  await expect(page.getByRole('heading', { name: 'Resultado do enquadramento' })).toBeVisible({
    timeout: 5000,
  })
  await expect(page.getByText('RISCO 2 • ANÁLISE DOCUMENTAL')).toBeVisible()
  await expect(page.getByText(/A vistoria não é automática/)).toBeVisible()
  await page.getByRole('button', { name: 'Continuar solicitação' }).click()

  await expect(page.getByRole('heading', { name: 'Dados do responsável' })).toBeVisible()
  await expect(
    page.getByRole('progressbar', { name: 'Progresso da complementação do Risco 2' }),
  ).toHaveAttribute('aria-valuetext', 'Etapa 1 de 5: Responsável')
  await page.getByLabel(/CPF.*obrigatório/).fill('12345678900')
  await expect(page.getByLabel(/CPF.*obrigatório/)).toHaveValue('123.456.789-00')
  await page.getByLabel(/Telefone.*obrigatório/).fill('81999990000')
  await expect(page.getByLabel(/Telefone.*obrigatório/)).toHaveValue('(81) 99999-0000')
  await page.getByRole('radio', { name: 'Representante legal' }).click()
  await page.getByLabel(/Cargo ou função.*obrigatório/).fill('Administrador')
  await page.getByRole('button', { name: 'Salvar e continuar' }).click()

  await expect(page.getByRole('heading', { name: 'Declaração de responsabilidade' })).toBeVisible()
  await page.getByRole('checkbox', { name: /Li integralmente/ }).click()
  await page.getByRole('checkbox', { name: /Confirmo que os dados/ }).click()
  await page.getByRole('radio', { name: /Assinar com Gov.br/ }).click()
  await page.getByRole('button', { name: 'Aceitar e continuar' }).click()

  await expect(page.getByRole('heading', { name: 'Documentos exigidos' })).toBeVisible()
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
  await expect(page.getByText('4 de 5 documentos preparados')).toBeVisible()
  await page.getByRole('button', { name: 'Continuar para cobrança' }).click()

  await expect(page.getByRole('heading', { name: 'Cobrança e pagamento' })).toBeVisible()
  await page.getByRole('radio', { name: /PIX/ }).click()
  await page.getByRole('button', { name: 'Confirmar pagamento e continuar' }).click()

  await expect(page.getByRole('heading', { name: 'Revisão e protocolo' })).toBeVisible()
  await page.getByRole('checkbox', { name: /Confirmo que revisei/ }).click()
  await page.getByRole('button', { name: 'Protocolar solicitação' }).click()

  await expect(page.getByRole('heading', { name: 'Solicitação protocolada' })).toBeVisible()
  await expect(page.getByText(/SAC-2026-00001234/)).toBeVisible()
  await page.getByRole('button', { name: 'Acompanhar solicitação' }).click()

  await expect(page.getByRole('heading', { name: 'Solicitação em validação' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Exigências do processo' })).toBeVisible({
    timeout: 5000,
  })
  await page
    .getByLabel(/Resposta ou justificativa/)
    .fill('Encaminho uma nova cópia legível com frente e verso.')
  await page.locator('#requirement-attachment').setInputFiles({
    ...demoPdf,
    name: 'identificacao-corrigida.pdf',
  })
  await page.getByRole('button', { name: 'Enviar resposta' }).click()

  await expect(page.getByRole('heading', { name: 'Solicitação em reanálise' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Vistoria necessária' })).toBeVisible({
    timeout: 5000,
  })
  await page.getByRole('radio', { name: /04\/08\/2026 · 08:00/ }).click()
  await page.getByRole('button', { name: 'Agendar vistoria' }).click()
  await expect(page.getByRole('heading', { name: 'Vistoria agendada' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Regularização aprovada' })).toBeVisible({
    timeout: 5000,
  })
  await expect(page.getByText(/aprovados após a vistoria/)).toBeVisible()

  await page.getByRole('link', { name: 'Início' }).click()
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('2026.00001234')).toBeVisible()
})

test('resumes a classified Risco 2 request without starting another draft', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/signin')
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()
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
  await confirmEstablishmentLocation(page)
  await page.getByRole('radio', { name: 'Sim' }).nth(0).click()
  await page.getByRole('radio', { name: 'Não' }).nth(1).click()
  await page.getByRole('radio', { name: 'Não' }).nth(2).click()
  await page.getByRole('button', { name: 'Analisar enquadramento' }).click()
  await expect(page.getByText('RISCO 2 • ANÁLISE DOCUMENTAL')).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: 'Salvar e sair' }).click()
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible()

  await page.getByRole('link', { name: 'Novo processo' }).last().click()
  await expect(page.getByRole('button', { name: 'Iniciar solicitação' })).toBeEnabled()
  await expect(page.getByText('ABC Logística LTDA', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Retomar solicitação' }).click()
  await expect(page).toHaveURL('/processes/new/result')
  await expect(page.getByText('RISCO 2 • ANÁLISE DOCUMENTAL')).toBeVisible()
})

test('renders the empty Risco 1 dashboard on mobile without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/signin')
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()

  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible()
  const menuTrigger = page.getByRole('button', { name: 'Alternar menu lateral' })
  await expect(menuTrigger).toBeVisible()
  await menuTrigger.click()
  await expect(page.getByRole('link', { name: 'ABC Logística', exact: true })).toBeVisible()

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth)
})

test('registers and selects a company without prefilled editable fields', async ({ page }) => {
  await page.goto('/signin')
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()
  await page.getByRole('link', { name: 'Novo processo' }).last().click()
  await page.getByRole('button', { name: 'Iniciar solicitação' }).click()

  await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  await page.getByRole('link', { name: 'Cadastrar nova empresa' }).click()

  await expect(page).toHaveURL('/companies/new?returnTo=request')
  await expect(page.getByLabel(/CNPJ.*obrigatório/)).toHaveValue('')
  await expect(page.getByLabel(/CEP.*obrigatório/)).toHaveAttribute('placeholder', '50000-000')

  await page.getByLabel(/CNPJ.*obrigatório/).fill('98765432000110')
  await expect(page.getByLabel(/CNPJ.*obrigatório/)).toHaveValue('98.765.432/0001-10')
  await page.getByLabel(/Razão social.*obrigatório/).fill('Nova Empresa LTDA')
  await page.getByLabel(/Nome fantasia.*obrigatório/).fill('Nova Empresa')
  await page.getByLabel(/Situação cadastral.*obrigatório/).fill('Ativa')
  await page.getByLabel(/Data de abertura.*obrigatório/).fill('28072026')
  await expect(page.getByLabel(/Data de abertura.*obrigatório/)).toHaveValue('28/07/2026')
  await page.getByLabel(/Natureza jurídica.*obrigatório/).fill('Sociedade Empresária Limitada')
  await page.getByLabel(/CNAE principal.*obrigatório/).fill('47.89-0-99 — Comércio varejista')
  await page.getByLabel(/CEP.*obrigatório/).fill('50000000')
  await expect(page.getByLabel(/CEP.*obrigatório/)).toHaveValue('50000-000')
  await page.getByLabel(/Logradouro.*obrigatório/).fill('Rua Nova')
  await page.getByLabel(/Número.*obrigatório/).fill('100')
  await page.getByLabel(/Bairro.*obrigatório/).fill('Boa Vista')
  await page.getByLabel(/Município.*obrigatório/).fill('Recife')
  await page.getByLabel(/UF.*obrigatório/).fill('pe1')
  await expect(page.getByLabel(/UF.*obrigatório/)).toHaveValue('PE')
  await page.getByLabel(/Telefone.*obrigatório/).fill('8130300000')
  await expect(page.getByLabel(/Telefone.*obrigatório/)).toHaveValue('(81) 3030-0000')
  await page.getByLabel(/Celular.*obrigatório/).fill('81999990000')
  await expect(page.getByLabel(/Celular.*obrigatório/)).toHaveValue('(81) 99999-0000')
  await page.getByLabel(/E-mail institucional.*obrigatório/).fill('contato@novaempresa.com.br')
  await page.getByLabel(/Responsável pelo processo.*obrigatório/).fill('Maria da Silva')
  await page.getByLabel(/Cargo do responsável.*obrigatório/).fill('Representante legal')
  await page.getByRole('button', { name: 'Salvar empresa' }).click()

  await expect(page).toHaveURL('/processes/new/request')
  await page.getByRole('combobox', { name: 'Empresa' }).click()
  await page.getByRole('option', { name: 'Nova Empresa LTDA' }).click()
  await expect(page.getByLabel('CNPJ')).toHaveValue('98.765.432/0001-10')
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeEnabled()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await page.getByRole('link', { name: 'Novo processo' }).last().click()
  await expect(page.getByRole('button', { name: 'Iniciar solicitação' })).toBeEnabled()
  await page.getByRole('button', { name: 'Iniciar solicitação' }).click()
  await page.getByRole('combobox', { name: 'Empresa' }).click()
  await expect(
    page.getByRole('option', { name: 'Nova Empresa LTDA — solicitação em andamento' }),
  ).toBeDisabled()
  await page.getByRole('option', { name: 'ABC Logística LTDA' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await page.getByRole('link', { name: 'Novo processo' }).last().click()
  await expect(page.getByText('Nova Empresa LTDA', { exact: true })).toBeVisible()
  await expect(page.getByText('ABC Logística LTDA', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retomar solicitação' })).toHaveCount(2)
})
