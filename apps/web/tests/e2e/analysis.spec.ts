import { expect, test } from '@playwright/test'

async function openTechnicalReviewAsTriager(page: import('@playwright/test').Page) {
  await page.goto('/signin')
  await page.getByLabel('E-mail').fill('triador@email.com')
  await page.getByPlaceholder('Digite sua senha').fill('demonstracao')
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()
  await expect(page).toHaveURL('/triagem', { timeout: 5000 })
  await page.goto('/analysis')
  await expect(page).toHaveURL('/analysis', { timeout: 5000 })
}

test('lets the triager access the technical Risco 2 review queue', async ({ page }) => {
  await openTechnicalReviewAsTriager(page)

  await expect(page.getByRole('heading', { name: 'Revisão técnica da triagem' })).toBeVisible()
  await expect(page.getByText('Cap. Marina Albuquerque · Triador')).toBeVisible()
  await expect(page.getByText('SAC-2026-00001234')).toBeVisible()
  await expect(page.getByText('ABC Logística LTDA')).toBeVisible()
})

test('completes document analysis and requires an inspection', async ({ page }) => {
  await openTechnicalReviewAsTriager(page)
  await page.getByRole('link', { name: 'Abrir análise' }).click()

  await page.getByRole('button', { name: 'Iniciar análise' }).click()
  await expect(page.getByText('Em análise').first()).toBeVisible()

  await page.getByRole('tab', { name: 'Checklist técnico' }).click()
  await page.getByRole('button', { name: 'Concluir conferência' }).click()

  await page.getByRole('tab', { name: 'Decisão de vistoria' }).click()
  await page.getByText('Determinar vistoria', { exact: true }).click()
  await page
    .getByLabel('Fundamentação da decisão')
    .fill('A carga de incêndio e a área utilizada exigem verificação presencial.')
  await page.getByRole('button', { name: 'Registrar decisão técnica' }).click()

  await expect(page.getByText('Análise concluída').first()).toBeVisible()
  await expect(page.getByText('Vistoria necessária').first()).toBeVisible()
  await expect(
    page.getByText('Análise concluída. O processo foi encaminhado para vistoria.'),
  ).toBeVisible()
})

test('protects the analysis route from a contributor session', async ({ page }) => {
  await page.goto('/signin')
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()
  await page.goto('/analysis')

  await expect(page).toHaveURL('/signin')
})

test('returns a corrected technical requirement to reanalysis', async ({ page }) => {
  await openTechnicalReviewAsTriager(page)
  await page.getByRole('link', { name: 'Abrir análise' }).click()
  await page.getByRole('button', { name: 'Iniciar análise' }).click()
  await page.getByRole('tab', { name: 'Decisão de vistoria' }).click()
  await page
    .getByLabel('Observações internas')
    .fill('Substituir a nota fiscal dos extintores por documento legível.')
  await page.getByRole('button', { name: 'Emitir exigência técnica' }).click()

  await expect(page.getByText('Aguardando correção').first()).toBeVisible()
  await page.getByRole('button', { name: 'Simular correção recebida' }).click()
  await expect(page.getByText('Em análise').first()).toBeVisible()
  await expect(page.getByText(/retornou para reanálise técnica/)).toBeVisible()
})

test('keeps the analysis queue usable without page overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openTechnicalReviewAsTriager(page)

  await expect(page.getByRole('heading', { name: 'Revisão técnica da triagem' })).toBeVisible()
  const hasPageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasPageOverflow).toBe(false)
})
