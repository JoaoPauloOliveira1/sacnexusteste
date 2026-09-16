import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  guidedClick,
  guidedType,
  highlightLocator,
  installPresentationLayer,
  recordingTiming,
  showGuide,
  showTitleCard,
} from './lib/presentation-layer.mjs'
import { recordJourney } from './lib/recording-runtime.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const appDirectory = path.resolve(scriptDirectory, '../..')

await recordJourney({
  appDirectory,
  artifactSlug: 'risk-one-automatic-issuance',
  journey: 'risk-one-automatic-issuance',
  pdfFileName: 'risk-one-ddlcb.pdf',
  run: recordRiskOneJourney,
})

async function recordRiskOneJourney({ baseUrl, page, pdfPath }) {
  await installGeocodingFixture(page)
  await page.goto(`${baseUrl}/signin`, { waitUntil: 'networkidle' })
  await installPresentationLayer(page)
  await showTitleCard(page, {
    eyebrow: 'SAC Nexus · Jornada do contribuinte',
    title: 'Risco 1 — emissão automática',
    description:
      'Solicitação de regularização classificada como baixo risco e concluída sem análise técnica ou vistoria.',
  })

  await showGuide(page, {
    step: '1 de 8',
    title: 'Acessando como contribuinte',
    description: 'As credenciais de demonstração identificam o perfil e a empresa vinculada.',
  })
  await guidedClick(page, page.getByRole('button', { exact: true, name: 'Entrar' }))
  await page.getByRole('heading', { name: 'Visão geral' }).waitFor()
  await page.waitForTimeout(recordingTiming.reading)

  await showGuide(page, {
    step: '2 de 8',
    title: 'Iniciando uma regularização',
    description: 'O contribuinte abre uma nova solicitação de regularização.',
  })
  await guidedClick(page, page.getByRole('link', { name: 'Novo processo' }).last())
  await page.getByRole('heading', { name: 'Regularização de estabelecimento' }).waitFor()
  await page.waitForTimeout(recordingTiming.reading)
  await guidedClick(page, page.getByRole('button', { name: 'Iniciar solicitação' }))

  await page.getByRole('heading', { name: 'Empresa responsável' }).waitFor()
  await showGuide(page, {
    step: '3 de 8',
    title: 'Selecionando a empresa',
    description: 'A solicitação é vinculada explicitamente a uma empresa cadastrada.',
  })
  await guidedClick(page, page.getByRole('combobox', { name: 'Empresa' }))
  await guidedClick(page, page.getByRole('option', { name: 'ABC Logística LTDA' }))
  await page.waitForTimeout(recordingTiming.reading)
  await guidedClick(page, page.getByRole('button', { name: 'Continuar' }))

  await page.getByRole('heading', { name: 'Dados do estabelecimento' }).waitFor()
  await showGuide(page, {
    step: '4 de 8',
    title: 'Informando o estabelecimento',
    description: 'Os campos começam vazios e aplicam máscaras durante o preenchimento.',
  })
  await guidedType(page, page.getByLabel('CEP'), '50000000')
  await guidedType(page, page.getByLabel('Logradouro'), 'Av. Norte, 1500')
  await guidedType(page, page.getByLabel('Bairro'), 'Santo Amaro')
  await guidedType(page, page.getByLabel('Município'), 'Recife — PE')
  await guidedType(page, page.getByLabel('Área construída (m²)'), '450')
  await guidedType(page, page.getByLabel('Número de pavimentos'), '1')
  await guidedClick(page, page.getByRole('button', { name: 'Salvar e continuar' }))
  await page.getByRole('dialog', { name: 'Confirme a localização do estabelecimento' }).waitFor()
  await showGuide(page, {
    step: '4 de 8',
    title: 'Confirmando a localização',
    description:
      'O endereço sugere uma posição e o contribuinte ajusta o pino até a entrada principal.',
  })
  await guidedClick(page, page.getByRole('button', { name: 'Confirmar e continuar' }))
  await page.waitForTimeout(recordingTiming.reading)

  await page.getByRole('heading', { name: 'Características do estabelecimento' }).waitFor()
  await showGuide(page, {
    step: '5 de 8',
    title: 'Respondendo ao enquadramento',
    description: 'As características declaradas serão avaliadas pelas regras de risco.',
  })
  for (const radio of await page.getByRole('radio', { name: 'Não' }).all()) {
    await guidedClick(page, radio)
  }
  await page.waitForTimeout(recordingTiming.reading)
  await guidedClick(page, page.getByRole('button', { name: 'Analisar enquadramento' }))

  await page.getByRole('heading', { name: 'Analisando enquadramento' }).waitFor()
  await showGuide(page, {
    step: '6 de 8',
    title: 'Aplicando as regras de risco',
    description: 'O sistema analisa automaticamente as informações declaradas.',
  })
  await page.getByRole('heading', { name: 'Resultado do enquadramento' }).waitFor({
    timeout: 8_000,
  })
  await page.getByText('RISCO 1 • BAIXO RISCO').waitFor()
  await showGuide(page, {
    step: '6 de 8',
    title: 'Estabelecimento classificado como Risco 1',
    description: 'O rito permite emissão automática, sem pagamento, análise técnica ou vistoria.',
    tone: 'success',
  })
  await highlightLocator(page, page.getByText('RISCO 1 • BAIXO RISCO'))
  await page.waitForTimeout(recordingTiming.important)
  await guidedClick(page, page.getByRole('button', { name: 'Continuar para declaração' }))

  await page.getByRole('heading', { name: 'Revisão e declaração' }).waitFor()
  await showGuide(page, {
    step: '7 de 8',
    title: 'Revisando e declarando',
    description: 'O responsável confere os dados e confirma a veracidade das informações.',
  })
  await page.waitForTimeout(recordingTiming.reading)
  await guidedClick(
    page,
    page.getByRole('checkbox', {
      name: /Declaro que as informações prestadas são verdadeiras/,
    }),
  )
  await guidedClick(page, page.getByRole('button', { name: 'Confirmar e emitir DDLCB' }))

  await page.getByRole('heading', { name: 'Processamento automático' }).waitFor()
  await showGuide(page, {
    step: '8 de 8',
    title: 'Emitindo o documento',
    description: 'Os dados são validados e a DDLCB é gerada automaticamente.',
  })
  await page.getByRole('heading', { name: 'Dispensa de licenciamento emitida' }).waitFor({
    timeout: 8_000,
  })
  await page.getByText('DDLCB nº 2026.00001234').waitFor()
  await showGuide(page, {
    step: '8 de 8',
    title: 'DDLCB disponível',
    description: 'A jornada foi concluída e o documento pode ser baixado pelo contribuinte.',
    tone: 'success',
  })
  await highlightLocator(page, page.getByText('DDLCB nº 2026.00001234'))
  await page.waitForTimeout(recordingTiming.important)

  const downloadPromise = page.waitForEvent('download')
  await guidedClick(page, page.getByRole('button', { name: 'Baixar PDF' }))
  const download = await downloadPromise
  await download.saveAs(pdfPath)
  await page.waitForTimeout(recordingTiming.reading)

  await showTitleCard(page, {
    eyebrow: 'Jornada concluída',
    title: 'DDLCB emitida automaticamente',
    description:
      'Risco 1 · sem pagamento · sem análise técnica · sem vistoria · documento disponível.',
    tone: 'success',
  })
}

async function installGeocodingFixture(page) {
  await page.route('https://nominatim.openstreetmap.org/search?**', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          display_name: 'Avenida Norte, Santo Amaro, Recife, Pernambuco, Brasil',
          lat: '-8.057840',
          lon: '-34.885080',
        },
      ]),
      contentType: 'application/json',
      status: 200,
    })
  })
}
