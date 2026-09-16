import { expect, test } from '@playwright/test'

async function signInAsInspector(page: import('@playwright/test').Page) {
  await page.goto('/signin')
  await page.getByLabel('E-mail').fill('vistoriador@email.com')
  await page.getByPlaceholder('Digite sua senha').fill('demonstracao')
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()
  await expect(page).toHaveURL('/inspections', { timeout: 5000 })
}

test('completes the optional inspection branch and emits the document', async ({ page }) => {
  await signInAsInspector(page)

  await expect(page.getByRole('heading', { name: 'Fila de vistorias' })).toBeVisible()
  await expect(page.getByText('SAC-2026-00001234')).toBeVisible()
  await page.getByRole('link', { name: 'Abrir vistoria' }).click()

  await page.getByRole('button', { name: 'Agendar vistoria' }).click()
  await page.getByRole('button', { name: 'Iniciar vistoria' }).click()
  await page.getByRole('button', { name: 'Marcar itens como conformes' }).click()
  await page
    .getByLabel('Relato da vistoria')
    .fill('Condições declaradas confirmadas durante a visita presencial.')
  await page.getByRole('button', { name: 'Aprovar vistoria' }).click()

  await expect(page.getByText('Aprovada').first()).toBeVisible()
  await expect(page.getByText('Regularização aprovada')).toBeVisible()
  await expect(
    page.getByText(
      'Documentos AVCB 2026.00001234 · Atestado de Vistoria 2026.00001234 emitidos e disponibilizados ao contribuinte.',
    ),
  ).toBeVisible()
})

test('protects the inspection route from an analyst session', async ({ page }) => {
  await page.goto('/signin')
  await page.getByLabel('E-mail').fill('analista@email.com')
  await page.getByPlaceholder('Digite sua senha').fill('demonstracao')
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()
  await page.goto('/inspections')

  await expect(page).toHaveURL('/signin')
})

test('receives a correction and schedules a reinspection', async ({ page }) => {
  await signInAsInspector(page)
  await page.getByRole('link', { name: 'Abrir vistoria' }).click()
  await page.getByRole('button', { name: 'Agendar vistoria' }).click()
  await page.getByRole('button', { name: 'Iniciar vistoria' }).click()
  await page
    .getByLabel('Relato da vistoria')
    .fill('A sinalização da saída de emergência deve ser corrigida.')
  await page.getByRole('button', { name: 'Emitir exigência' }).click()

  await expect(page.getByText('Aguardando correção').first()).toBeVisible()
  await page.getByRole('button', { name: 'Simular correção atendida' }).click()
  await expect(page.getByText('Agendada').first()).toBeVisible()
  await expect(
    page.getByText('Correção recebida e revistoria agendada para 05/08/2026'),
  ).toBeVisible()
})

test('keeps the inspection queue usable without page overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await signInAsInspector(page)

  await expect(page.getByRole('heading', { name: 'Fila de vistorias' })).toBeVisible()
  const hasPageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasPageOverflow).toBe(false)
})
