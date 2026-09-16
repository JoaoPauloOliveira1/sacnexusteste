import {
  guidedClick,
  guidedType,
  highlightLocator,
  installPresentationLayer,
  recordingTiming,
  showGuide,
  showTitleCard,
} from './presentation-layer.mjs'

const protocolNumber = 'SAC-2026-00001234'

export async function recordRiskTwoJourney({
  baseUrl,
  documentPaths,
  page,
  requirement = false,
  requiresInspection = false,
}) {
  await installGeocodingFixture(page)
  const scenarioLabel = requiresInspection
    ? 'com vistoria'
    : requirement
      ? 'com exigência documental'
      : 'sem vistoria'
  const totalSteps = requirement ? 12 : requiresInspection ? 10 : 8
  let step = 1

  await page.goto(`${baseUrl}/signin`, { waitUntil: 'networkidle' })
  await installPresentationLayer(page)
  await showTitleCard(page, {
    eyebrow: 'SAC Nexus · Jornada integrada',
    title: `Risco 2 — ${scenarioLabel}`,
    description:
      'Uma única solicitação acompanha o contribuinte, a triagem administrativa e a análise técnica.',
  })

  await signIn(page, {
    email: 'contribuinte@mail.com',
    password: '123',
    guide: {
      step: `${step++} de ${totalSteps}`,
      title: 'Acessando como contribuinte',
      description: 'O contribuinte inicia uma nova regularização para a empresa vinculada.',
    },
  })
  await protocolRequest(page, {
    step: `${step++} de ${totalSteps}`,
  })

  await showGuide(page, {
    step: `${step++} de ${totalSteps}`,
    title: 'Solicitação protocolada',
    description: 'O protocolo passa a existir para todos os perfis autorizados do sistema.',
    tone: 'success',
  })
  await highlightLocator(page, page.getByText(protocolNumber))
  await page.waitForTimeout(recordingTiming.important)
  await signOut(page, /João Carlos da Silva/)

  await signIn(page, {
    email: 'triador@email.com',
    password: 'demonstracao',
    guide: {
      step: `${step++} de ${totalSteps}`,
      title: 'Triagem administrativa',
      description: 'O mesmo protocolo aparece automaticamente na fila do Corpo de Bombeiros.',
    },
  })
  await openCanonicalRow(page, {
    linkName: 'Abrir processo',
    routeHeading: /2026\.00001234/,
  })
  await guidedClick(page, page.getByRole('button', { name: 'Iniciar triagem', exact: true }))

  if (requirement) {
    await issueAdministrativeRequirement(page, `${step++} de ${totalSteps}`)
    await signOut(page, /Cap. Marina Albuquerque/)

    await signIn(page, {
      email: 'contribuinte@mail.com',
      password: '123',
      guide: {
        step: `${step++} de ${totalSteps}`,
        title: 'Exigência recebida pelo contribuinte',
        description: 'A pendência emitida na triagem aparece no acompanhamento do mesmo protocolo.',
      },
    })
    await guidedClick(page, page.getByRole('link', { name: 'Acompanhar solicitação' }))
    await guidedClick(page, page.getByRole('button', { name: 'Retomar solicitação' }))
    await page.getByRole('heading', { name: 'Exigências do processo' }).waitFor()
    await guidedType(
      page,
      page.getByLabel(/Resposta ou justificativa/),
      'Documento substituído por uma cópia colorida e integral.',
    )
    await page.locator('#requirement-attachment').setInputFiles({
      name: 'identificacao-corrigida.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 documento corrigido'),
    })
    await page.waitForTimeout(recordingTiming.reading)
    await guidedClick(page, page.getByRole('button', { name: 'Enviar resposta' }))
    await page.getByRole('heading', { name: 'Visão geral' }).waitFor()
    await showGuide(page, {
      step: `${step++} de ${totalSteps}`,
      title: 'Correção devolvida à triagem',
      description:
        'A resposta e o anexo ficam registrados, e a fila interna é atualizada automaticamente.',
      tone: 'success',
    })
    await page.waitForTimeout(recordingTiming.important)
    await signOut(page, /João Carlos da Silva/)

    await signIn(page, {
      email: 'triador@email.com',
      password: 'demonstracao',
      guide: {
        step: `${step++} de ${totalSteps}`,
        title: 'Nova conferência administrativa',
        description: 'A triadora recebe a correção e retoma o processo sem criar outro protocolo.',
      },
    })
    await openCanonicalRow(page, {
      linkName: 'Abrir processo',
      routeHeading: /2026\.00001234/,
    })
    await guidedClick(page, page.getByRole('button', { name: 'Iniciar nova triagem' }))
  }

  await approveTriage(page, `${step++} de ${totalSteps}`)
  await signOut(page, /Cap. Marina Albuquerque/)

  await signIn(page, {
    email: 'analista@email.com',
    password: 'demonstracao',
    guide: {
      step: `${step++} de ${totalSteps}`,
      title: 'Análise técnica',
      description:
        'A documentação aprovada na triagem chega à fila técnica para decisão sobre a vistoria.',
    },
  })
  await openCanonicalRow(page, {
    linkName: 'Abrir análise',
    routeHeading: /Análise 2026\.00001234/,
  })
  await guidedClick(page, page.getByRole('button', { name: 'Iniciar análise' }))
  await guidedClick(page, page.getByRole('tab', { name: 'Checklist técnico' }))
  await guidedClick(page, page.getByRole('button', { name: 'Concluir conferência' }))
  await guidedClick(page, page.getByRole('tab', { name: 'Decisão de vistoria' }))

  if (requiresInspection) {
    await guidedClick(page, page.getByText('Determinar vistoria', { exact: true }))
    await guidedType(
      page,
      page.getByLabel('Fundamentação da decisão'),
      'As características declaradas exigem verificação presencial das medidas de segurança.',
    )
  } else {
    await guidedClick(page, page.getByText('Dispensar vistoria prévia', { exact: true }))
    await guidedType(
      page,
      page.getByLabel('Fundamentação da decisão'),
      'A documentação apresentada é suficiente para a emissão sem vistoria prévia.',
    )
  }
  await showGuide(page, {
    step: `${step++} de ${totalSteps}`,
    title: requiresInspection ? 'Vistoria determinada' : 'Vistoria prévia dispensada',
    description: requiresInspection
      ? 'A análise técnica encaminha o protocolo para agendamento presencial.'
      : 'A decisão fundamentada conclui a análise sem inspeção presencial.',
  })
  await guidedClick(page, page.getByRole('button', { name: 'Registrar decisão técnica' }))

  if (requiresInspection) {
    await signOut(page, /Sgt. Júlio Prates/)
    await signIn(page, {
      email: 'vistoriador@email.com',
      password: 'demonstracao',
      guide: {
        step: `${step++} de ${totalSteps}`,
        title: 'Vistoria presencial',
        description: 'O protocolo aprovado pela análise aparece na fila da equipe de vistoria.',
      },
    })
    await openCanonicalRow(page, {
      linkName: 'Abrir vistoria',
      routeHeading: /Vistoria 2026\.00001234/,
    })
    await guidedClick(page, page.getByRole('button', { name: 'Agendar vistoria' }))
    await guidedClick(page, page.getByRole('button', { name: 'Iniciar vistoria' }))
    await guidedClick(page, page.getByRole('button', { name: 'Marcar itens como conformes' }))
    await guidedType(
      page,
      page.getByLabel('Relato da vistoria'),
      'Medidas de segurança verificadas e consideradas conformes no local.',
    )
    await showGuide(page, {
      step: `${step++} de ${totalSteps}`,
      title: 'Vistoria aprovada',
      description: 'O resultado presencial conclui o rito e libera os documentos finais.',
      tone: 'success',
    })
    await guidedClick(page, page.getByRole('button', { name: 'Aprovar vistoria' }))
    await signOut(page, /Ten. Renata Melo/)
  } else {
    await signOut(page, /Sgt. Júlio Prates/)
  }

  await signIn(page, {
    email: 'contribuinte@mail.com',
    password: '123',
    guide: {
      step: `${step++} de ${totalSteps}`,
      title: 'Resultado disponível ao contribuinte',
      description:
        'A conclusão interna atualiza o portal e disponibiliza os dois documentos do Risco 2.',
    },
  })
  await guidedClick(page, page.getByRole('link', { name: 'Documentos', exact: true }))
  await page.getByRole('heading', { name: 'Documentos', exact: true }).waitFor()
  await page.getByText(/AVCB nº 2026\.00001234/).waitFor()
  await page.getByText(/Atestado nº 2026\.00001234/).waitFor()
  await highlightLocator(page, page.getByText(/AVCB nº 2026\.00001234/))
  await page.waitForTimeout(recordingTiming.reading)

  const downloadButtons = page.getByRole('button', { name: 'Baixar PDF' })
  for (let index = 0; index < documentPaths.length; index += 1) {
    const downloadPromise = page.waitForEvent('download')
    await guidedClick(page, downloadButtons.nth(index))
    const download = await downloadPromise
    await download.saveAs(documentPaths[index])
  }

  await showTitleCard(page, {
    eyebrow: 'Jornada concluída',
    title: `Risco 2 ${scenarioLabel} concluído`,
    description: `${protocolNumber} · AVCB e Atestado de Vistoria disponíveis para download.`,
    tone: 'success',
  })
}

async function protocolRequest(page, { step }) {
  await guidedClick(page, page.getByRole('link', { name: 'Novo processo' }).last())
  await guidedClick(page, page.getByRole('button', { name: 'Iniciar solicitação' }))

  await showGuide(page, {
    step,
    title: 'Identificando empresa e estabelecimento',
    description:
      'Os dados são preenchidos na mesma base da jornada de Risco 1; o enquadramento será definido depois.',
  })
  await guidedClick(page, page.getByRole('combobox', { name: 'Empresa' }))
  await guidedClick(page, page.getByRole('option', { name: 'ABC Logística LTDA' }))
  await guidedClick(page, page.getByRole('button', { name: 'Continuar' }))
  await guidedType(page, page.getByLabel('CEP'), '50000000')
  await guidedType(page, page.getByLabel('Logradouro'), 'Av. Norte, 1500')
  await guidedType(page, page.getByLabel('Bairro'), 'Santo Amaro')
  await guidedType(page, page.getByLabel('Município'), 'Recife — PE')
  await guidedType(page, page.getByLabel('Área construída (m²)'), '1250')
  await guidedType(page, page.getByLabel('Número de pavimentos'), '2')
  await guidedClick(page, page.getByRole('button', { name: 'Salvar e continuar' }))
  await page.getByRole('dialog', { name: 'Confirme a localização do estabelecimento' }).waitFor()
  await guidedClick(page, page.getByRole('button', { name: 'Confirmar e continuar' }))

  await showGuide(page, {
    step,
    title: 'Informando uma condição de Risco 2',
    description:
      'O armazenamento de inflamáveis altera o enquadramento, mas a vistoria ainda dependerá da análise técnica.',
  })
  await guidedClick(page, page.getByRole('radio', { name: 'Sim' }).first())
  await guidedClick(page, page.getByRole('radio', { name: 'Não' }).nth(1))
  await guidedClick(page, page.getByRole('radio', { name: 'Não' }).nth(2))
  await guidedClick(page, page.getByRole('button', { name: 'Analisar enquadramento' }))
  await page.getByRole('heading', { name: 'Resultado do enquadramento' }).waitFor({
    timeout: 8_000,
  })
  await page
    .getByText(/RISCO 2/)
    .first()
    .waitFor()
  await showGuide(page, {
    step,
    title: 'Estabelecimento classificado como Risco 2',
    description:
      'A jornada passa a exigir responsável, declaração, documentos, pagamento e protocolo.',
    tone: 'success',
  })
  await page.waitForTimeout(recordingTiming.important)
  await guidedClick(page, page.getByRole('button', { name: 'Continuar solicitação' }))

  await guidedType(page, page.getByLabel(/CPF.*obrigatório/), '12345678900')
  await guidedType(page, page.getByLabel(/Telefone.*obrigatório/), '81999990000')
  await guidedClick(page, page.getByRole('radio', { name: 'Representante legal' }))
  await guidedType(page, page.getByLabel(/Cargo ou função.*obrigatório/), 'Administrador')
  await guidedClick(page, page.getByRole('button', { name: 'Salvar e continuar' }))
  await guidedClick(page, page.getByRole('checkbox', { name: /Li integralmente/ }))
  await guidedClick(page, page.getByRole('checkbox', { name: /Confirmo que os dados/ }))
  await guidedClick(page, page.getByRole('radio', { name: /Assinar com Gov.br/ }))
  await guidedClick(page, page.getByRole('button', { name: 'Aceitar e continuar' }))

  await showGuide(page, {
    step,
    title: 'Anexando a documentação obrigatória',
    description:
      'Os arquivos ficam vinculados ao protocolo para conferência administrativa e técnica.',
  })
  const demoPdf = {
    name: 'identificacao.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 documento demonstrativo'),
  }
  await page.locator('#document-identification').setInputFiles(demoPdf)
  await page.locator('#document-cnpj-registration').setInputFiles({
    ...demoPdf,
    name: 'cnpj.pdf',
  })
  await page.locator('#document-extinguisher-invoice').setInputFiles({
    ...demoPdf,
    name: 'nota-fiscal-extintores.pdf',
  })
  await page.waitForTimeout(recordingTiming.reading)
  await guidedClick(page, page.getByRole('button', { name: 'Continuar para cobrança' }))
  await guidedClick(page, page.getByRole('radio', { name: /PIX/ }))
  await guidedClick(page, page.getByRole('button', { name: 'Confirmar pagamento e continuar' }))
  await guidedClick(page, page.getByRole('checkbox', { name: /Confirmo que revisei/ }))
  await guidedClick(page, page.getByRole('button', { name: 'Protocolar solicitação' }))
  await page.getByText(protocolNumber).waitFor()
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

async function approveTriage(page, step) {
  await showGuide(page, {
    step,
    title: 'Conferindo e aprovando a triagem',
    description:
      'O checklist administrativo garante a presença e a consistência cadastral dos documentos.',
  })
  await guidedClick(page, page.getByRole('tab', { name: 'Checklist' }))
  await guidedClick(page, page.getByRole('button', { name: 'Marcar todos como conferidos' }))
  await guidedClick(page, page.getByRole('button', { name: 'Aprovar triagem' }))
  await page.waitForTimeout(recordingTiming.reading)
}

async function issueAdministrativeRequirement(page, step) {
  await showGuide(page, {
    step,
    title: 'Emitindo uma exigência documental',
    description:
      'A triagem registra a inconsistência e devolve o mesmo protocolo para correção do contribuinte.',
  })
  await guidedClick(page, page.getByRole('tab', { name: 'Exigências' }))
  await guidedType(page, page.getByLabel('Título'), 'Documento de identificação ilegível')
  await guidedType(
    page,
    page.getByLabel('Descrição'),
    'Envie uma cópia colorida, sem cortes e com frente e verso legíveis.',
  )
  await guidedClick(page, page.getByLabel('Documento relacionado'))
  await guidedClick(page, page.getByRole('option', { name: 'documento-identificacao.pdf' }))
  await guidedClick(page, page.getByLabel('Categoria'))
  await guidedClick(page, page.getByRole('option', { name: 'Documento ilegível' }))
  await guidedType(page, page.getByLabel('Prazo'), '2026-08-10')
  await guidedClick(page, page.getByRole('button', { name: 'Emitir exigência administrativa' }))
  await page.getByText('Aguardando Correções').first().waitFor()
  await page.waitForTimeout(recordingTiming.important)
}

async function openCanonicalRow(page, { linkName, routeHeading }) {
  const row = page.getByRole('row').filter({ hasText: protocolNumber })
  await row.waitFor()
  await highlightLocator(page, row)
  await page.waitForTimeout(recordingTiming.reading)
  await guidedClick(page, row.getByRole('link', { name: linkName }))
  await page.getByRole('heading', { name: routeHeading }).waitFor()
}

async function signIn(page, { email, password, guide }) {
  await showGuide(page, guide)
  await guidedType(page, page.getByLabel('E-mail'), email)
  await guidedType(page, page.getByPlaceholder('Digite sua senha'), password)
  await guidedClick(page, page.getByRole('button', { exact: true, name: 'Entrar' }))
  await page.waitForLoadState('networkidle')
}

async function signOut(page, identityName) {
  await guidedClick(page, page.getByRole('button', { name: identityName }))
  await guidedClick(page, page.getByRole('menuitem', { name: 'Sair' }))
  await page.waitForURL('**/signin')
}
