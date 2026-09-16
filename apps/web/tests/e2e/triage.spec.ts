import { expect, test } from '@playwright/test'

async function signInAsTriager(page: import('@playwright/test').Page) {
  await page.goto('/signin')
  await page.getByLabel('E-mail').fill('triador@email.com')
  await page.getByPlaceholder('Digite sua senha').fill('demonstracao')
  await page.getByRole('button', { exact: true, name: 'Entrar' }).click()
  await expect(page).toHaveURL('/triage', { timeout: 5000 })
}

test('routes the triager login to the Risco 2 administrative queue', async ({ page }) => {
  await signInAsTriager(page)

  await expect(page.getByRole('heading', { name: 'Painel de Triagem' })).toBeVisible()
  await expect(page.getByText('Risco 2').first()).toBeVisible()
  await expect(page.getByText('Cap. Marina Albuquerque · Triador')).toBeVisible()
  await expect(page.getByText('SAC-2026-00001234')).toBeVisible()
  await expect(page.getByText('ABC Logística', { exact: true })).toBeVisible()
})

test('completes an administrative triage and forwards the process', async ({ page }) => {
  await signInAsTriager(page)
  await page
    .getByRole('row')
    .filter({ hasText: '2026.000247-1' })
    .getByRole('link', { name: 'Abrir processo' })
    .click()

  await expect(page.getByRole('heading', { name: '2026.000247-1' })).toBeVisible()
  await page.getByRole('button', { name: 'Iniciar triagem', exact: true }).click()

  await page.getByRole('tab', { name: 'Documentos' }).click()
  await expect(page.getByText('Projeto arquitetônico.pdf').first()).toBeVisible()
  await page.getByRole('button', { name: 'Comparar versões de Projeto arquitetônico.pdf' }).click()
  await expect(page.getByText('Versão 2', { exact: true })).toBeVisible()

  await page.getByRole('tab', { name: 'Checklist' }).click()
  await page.getByRole('button', { name: 'Marcar todos como conferidos' }).click()
  await page.getByRole('button', { name: 'Aprovar triagem' }).click()

  await expect(page.getByText('Encaminhado para Distribuição').first()).toBeVisible()
  await expect(page.getByText('O processo foi encaminhado para distribuição.')).toBeVisible()
})

test('issues an administrative requirement and receives corrections', async ({ page }) => {
  await signInAsTriager(page)
  await page
    .getByRole('row')
    .filter({ hasText: '2026.000247-1' })
    .getByRole('link', { name: 'Abrir processo' })
    .click()
  await page.getByRole('button', { name: 'Iniciar triagem', exact: true }).click()
  await page.getByRole('tab', { name: 'Exigências' }).click()

  await page.getByLabel('Título').fill('Substituir documento ilegível')
  await page
    .getByLabel('Descrição')
    .fill('O arquivo anexado não permite a leitura das informações cadastrais.')
  await page.getByRole('combobox', { name: 'Documento relacionado' }).click()
  await page.getByRole('option', { name: 'Projeto arquitetônico.pdf' }).click()
  await page.getByRole('combobox', { name: 'Categoria' }).click()
  await page.getByRole('option', { name: 'Documento ilegível' }).click()
  await page.getByLabel('Observações').fill('Enviar nova cópia legível em formato PDF.')
  await page.getByRole('button', { name: 'Emitir exigência administrativa' }).click()

  await expect(page.getByText('Aguardando Correções').first()).toBeVisible()
  await page.getByRole('button', { name: 'Simular correções recebidas' }).click()
  await expect(page.getByText('Correções Recebidas').first()).toBeVisible()
})
