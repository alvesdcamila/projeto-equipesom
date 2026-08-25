import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

class MemoryStorage {
  #items = new Map()

  get length() { return this.#items.size }
  clear() { this.#items.clear() }
  getItem(key) { return this.#items.get(key) ?? null }
  key(index) { return [...this.#items.keys()][index] ?? null }
  removeItem(key) { this.#items.delete(key) }
  setItem(key, value) { this.#items.set(key, String(value)) }
}

globalThis.window = { localStorage: new MemoryStorage() }

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const server = await createServer({
  appType: 'custom',
  server: { middlewareMode: true },
})

try {
  const validation = await server.ssrLoadModule('/src/features/proposals/validation.ts')
  const storage = await server.ssrLoadModule('/src/services/prototypeStorage.ts')
  const repository = await server.ssrLoadModule('/src/services/proposalRepository.ts')
  const inventory = await server.ssrLoadModule('/src/data/inventoryEquipment.ts')
  const clientDocument = await server.ssrLoadModule('/src/utils/clientDocument.ts')
  const clientPhone = await server.ssrLoadModule('/src/utils/clientPhone.ts')
  const company = await server.ssrLoadModule('/src/config/company.ts')
  const presentation = await server.ssrLoadModule('/src/config/proposalPresentation.ts')
  const issuerHeader = await server.ssrLoadModule('/src/components/proposals/IssuerHeader.tsx')
  const issuerPresentation = await server.ssrLoadModule('/src/utils/issuerPresentation.ts')
  const snapshotDetails = await server.ssrLoadModule('/src/components/proposals/ProposalSnapshotDetails.tsx')
  const documentMapper = await server.ssrLoadModule('/src/features/proposal-document/proposalDocumentMapper.ts')
  const documentThemes = await server.ssrLoadModule('/src/features/proposal-document/themes.ts')
  const documentPreview = await server.ssrLoadModule('/src/features/proposal-document/ProposalDocumentPreview.tsx')
  const documentBlocks = await server.ssrLoadModule('/src/features/proposal-document/ProposalDocumentBlocks.tsx')
  const documentPagination = await server.ssrLoadModule('/src/features/proposal-document/pagination.ts')
  const documentPaginationBlocks = await server.ssrLoadModule('/src/features/proposal-document/proposalDocumentPaginationBlocks.ts')
  const documentDate = await server.ssrLoadModule('/src/features/proposal-document/documentDate.ts')
  const documentContrast = await server.ssrLoadModule('/src/features/proposal-document/contrast.ts')
  const headerHelp = await server.ssrLoadModule('/src/components/layout/header/HeaderHelpPanel.tsx')
  const headerNotifications = await server.ssrLoadModule('/src/components/layout/header/HeaderNotificationsPanel.tsx')
  const headerProfile = await server.ssrLoadModule('/src/components/layout/header/HeaderProfilePanel.tsx')
  const [
    fontCss,
    tokensCss,
    documentCss,
    componentsCss,
    layoutCss,
    previewPageSource,
    detailPageSource,
    documentPreviewSource,
    documentBlocksSource,
    documentMapperSource,
    documentTypesSource,
    documentPaginationSource,
    documentPaginationHookSource,
    appHeaderSource,
    headerPanelsSource,
    packageSource,
    decisionsSource,
  ] = await Promise.all([
    readFile(resolve(appRoot, 'src/styles/fonts.css'), 'utf8'),
    readFile(resolve(appRoot, 'src/styles/tokens.css'), 'utf8'),
    readFile(resolve(appRoot, 'src/features/proposal-document/proposal-document.css'), 'utf8'),
    readFile(resolve(appRoot, 'src/styles/components.css'), 'utf8'),
    readFile(resolve(appRoot, 'src/styles/layout.css'), 'utf8'),
    readFile(resolve(appRoot, 'src/pages/ProposalPreviewPage.tsx'), 'utf8'),
    readFile(resolve(appRoot, 'src/pages/ProposalDetailPage.tsx'), 'utf8'),
    readFile(resolve(appRoot, 'src/features/proposal-document/ProposalDocumentPreview.tsx'), 'utf8'),
    readFile(resolve(appRoot, 'src/features/proposal-document/ProposalDocumentBlocks.tsx'), 'utf8'),
    readFile(resolve(appRoot, 'src/features/proposal-document/proposalDocumentMapper.ts'), 'utf8'),
    readFile(resolve(appRoot, 'src/features/proposal-document/types.ts'), 'utf8'),
    readFile(resolve(appRoot, 'src/features/proposal-document/pagination.ts'), 'utf8'),
    readFile(resolve(appRoot, 'src/features/proposal-document/useProposalDocumentPagination.ts'), 'utf8'),
    readFile(resolve(appRoot, 'src/components/layout/AppHeader.tsx'), 'utf8'),
    readFile(resolve(appRoot, 'src/components/layout/header/useHeaderPanels.ts'), 'utf8'),
    readFile(resolve(appRoot, 'package.json'), 'utf8'),
    readFile(resolve(appRoot, '../Pacote_Continuidade_EQUIPESOM_v0.1/02_REGISTRO_DE_DECISOES.md'), 'utf8'),
  ])
  const packageManifest = JSON.parse(packageSource)

  assert.equal(inventory.inventoryEquipment.length, 20)
  assert.equal(inventory.inventoryEquipment[0].id, 'INV-001')
  assert.equal(inventory.inventoryEquipment[19].id, 'INV-020')
  assert.equal(inventory.inventoryEquipment.some((item) => item.id === 'CONTROLE'), false)
  assert.equal(company.pilotCompany.brandName, 'EQUIPESOM')
  assert.equal(company.pilotCompany.legalName, '17.681.110 EDEVALDO ALVES')
  assert.deepEqual(company.pilotCompany.document, { type: 'CNPJ', number: '17.681.110/0001-69' })
  assert.equal(company.pilotCompany.address.city, 'FLORIANÓPOLIS')
  assert.equal(company.pilotCompany.phone, '')
  assert.equal(company.pilotCompany.email, '')

  assert.equal(clientPhone.maskBrazilianPilotPhone('4833333333'), '(48) 3333-3333')
  assert.equal(clientPhone.maskBrazilianPilotPhone('48999999999'), '(48) 99999-9999')
  assert.equal(clientPhone.maskBrazilianPilotPhone('489999999999999'), '(48) 99999-9999')
  assert.equal(clientPhone.maskBrazilianPilotPhone('(48) 99999-9999 123456'), '(48) 99999-9999')
  assert.equal(clientPhone.maskBrazilianPilotPhone('+55 48 99999-9999'), '')
  assert.equal(clientPhone.isValidBrazilianPilotPhone('(48) 3333-3333'), true)
  assert.equal(clientPhone.isValidBrazilianPilotPhone('(48) 99999-9999'), true)
  assert.equal(clientPhone.isValidBrazilianPilotPhone('489999999'), false)
  assert.equal(clientPhone.isValidBrazilianPilotPhone('489999999999'), false)
  assert.equal(clientPhone.isValidBrazilianPilotPhone('telefone inválido'), false)
  assert.equal(clientPhone.isValidBrazilianPilotPhone('+55 48 99999-9999'), false)

  const emptyDraft = storage.createCleanDraft()
  emptyDraft.serviceIds = []
  emptyDraft.equipmentItems = []
  emptyDraft.baseValue = 0
  emptyDraft.paymentTerm = ''
  emptyDraft.validityDays = 0

  const emptyClientErrors = validation.validateStep(0, emptyDraft)
  assert.equal(emptyClientErrors.clientName, 'Informe o nome ou a razão social.')
  assert.equal(emptyClientErrors.preparedByName, 'Informe o nome completo de quem elaborou a proposta.')
  assert.equal(emptyClientErrors.clientDocument, undefined)
  const emptyEventErrors = validation.validateStep(1, emptyDraft)
  assert.ok(emptyEventErrors.eventName && emptyEventErrors.startDate && emptyEventErrors.endDate && emptyEventErrors.location)
  assert.ok(validation.validateStep(2, emptyDraft).equipmentItems)
  assert.ok(validation.validateStep(3, emptyDraft).baseValue)
  assert.ok(validation.validateStep(4, emptyDraft).validityDays)
  assert.ok(validation.validateStep(4, emptyDraft).paymentTerm)

  const validDraft = storage.createCleanDraft()
  Object.assign(validDraft, {
    clientName: 'Cliente de teste',
    clientDocument: '04.252.011/0001-10',
    phone: '(48) 99999-1234',
    preparedByName: '  Camila da Silva  ',
    eventName: 'Evento local de teste',
    startDate: '2026-09-20',
    endDate: '2026-09-21',
    location: 'Praia de teste',
    city: 'Florianópolis',
    equipmentItems: [{ catalogItemId: 'INV-001', quantity: 3 }],
    serviceIds: ['operacao'],
    commercialNotes: 'Observação preservada na fotografia.',
  })

  assert.deepEqual(validation.validateAllSteps(validDraft), {})
  assert.equal(validation.validateStep(0, { ...validDraft, phone: '(48) 3333-3333' }).phone, undefined)
  assert.equal(validation.validateStep(0, { ...validDraft, phone: '(48) 99999-9999' }).phone, undefined)
  assert.ok(validation.validateStep(0, { ...validDraft, phone: '489999999' }).phone)
  assert.ok(validation.validateStep(0, { ...validDraft, phone: '489999999999' }).phone)
  assert.ok(validation.validateStep(0, { ...validDraft, phone: '+55 48 99999-9999' }).phone)
  assert.deepEqual(validation.validateStep(0, { ...validDraft, preparedByName: 'Camila' }), {})
  assert.equal(clientDocument.maskClientDocument('04252011000110', 'empresa'), '04.252.011/0001-10')
  assert.equal(clientDocument.maskClientDocument('52998224725', 'pessoa'), '529.982.247-25')
  assert.ok(validation.validateStep(0, { ...validDraft, clientDocument: '11.111.111/1111-11' }).clientDocument)
  assert.deepEqual(validation.validateStep(0, {
    ...validDraft,
    clientType: 'pessoa',
    clientDocument: '529.982.247-25',
  }), {})

  const reversedDates = { ...validDraft, startDate: '2026-09-21', endDate: '2026-09-20' }
  assert.equal(validation.validateStep(1, reversedDates).endDate, 'A data final não pode ser anterior à data inicial.')
  assert.ok(validation.validateStep(3, { ...validDraft, baseValue: 100, travelFee: 50, discount: 200 }).discount)
  assert.ok(validation.validateStep(2, {
    ...validDraft,
    equipmentItems: [{ catalogItemId: 'INV-001', quantity: 0 }],
  }).equipmentItems)

  const saved = storage.saveActiveDraft(validDraft, 3)
  assert.ok(saved?.savedAt)
  assert.equal(saved?.draft.preparedByName, 'Camila da Silva')
  const recovered = storage.loadPrototypeState()
  assert.equal(recovered.state.activeDraft?.currentStep, 3)
  assert.equal(recovered.state.activeDraft?.editingProposalId, null)
  assert.equal(recovered.state.activeDraft?.draft.clientDocument, validDraft.clientDocument)
  assert.equal(recovered.state.activeDraft?.draft.equipmentItems[0].quantity, 3)

  const completed = storage.completeActiveDraft(validDraft)
  assert.ok(completed)
  assert.equal(completed.status, 'rascunho')
  assert.equal(completed.source, 'local')
  assert.notEqual(completed.id, completed.version.id)
  assert.equal(completed.version.snapshot?.client.document, '04.252.011/0001-10')
  assert.equal(completed.version.snapshot?.issuer?.tenantId, 'tenant-equipesom-demo')
  assert.equal(completed.version.snapshot?.issuer?.brandName, 'EQUIPESOM')
  assert.equal(completed.version.snapshot?.issuer?.legalName, '17.681.110 EDEVALDO ALVES')
  assert.deepEqual(completed.version.snapshot?.issuer?.document, {
    type: 'CNPJ',
    number: '17.681.110/0001-69',
  })
  assert.deepEqual(completed.version.snapshot?.issuer?.address, {
    street: 'SRV MANOEL DAVID DA COSTA',
    number: '38',
    district: 'TAPERA',
    city: 'FLORIANÓPOLIS',
    state: 'SC',
    postalCode: '88.049-525',
  })
  assert.notEqual(completed.version.snapshot?.issuer?.document.number, completed.version.snapshot?.client.document)
  assert.equal(completed.version.snapshot?.issuer?.phone, undefined)
  assert.equal(completed.version.snapshot?.issuer?.email, undefined)
  assert.equal(completed.version.snapshot?.preparedBy.name, 'Camila da Silva')
  assert.equal(completed.version.snapshot?.scope.equipment[0].catalogItemId, 'INV-001')
  assert.equal(completed.version.snapshot?.scope.equipment[0].quantity, 3)
  assert.equal(completed.version.snapshot?.scope.equipment[0].normalizedName, 'Caixa ativa')
  assert.equal(completed.version.snapshot?.scope.services[0].name, 'Operação técnica')
  assert.equal(completed.version.snapshot?.conditions.commercialNotes, 'Observação preservada na fotografia.')

  assert.equal(documentMapper.canPreviewProposal(completed), true)
  assert.equal(documentThemes.proposalDocumentThemes.length, 2)
  assert.deepEqual(
    documentThemes.proposalDocumentThemes.map((theme) => theme.name),
    ['Técnico Litorâneo', 'Verão Profissional'],
  )
  assert.ok(documentThemes.proposalDocumentThemes.every((theme) => !Object.hasOwn(theme, 'recommended')))
  assert.deepEqual(
    documentThemes.proposalDocumentThemes.map((theme) => theme.tokens),
    [
      { ink: '#12343B', accent: '#0F766E', soft: '#D9C7A3', paper: '#FCFBF7' },
      { ink: '#4A2432', accent: '#B64C2F', soft: '#F0C7A3', paper: '#FFF9F3' },
    ],
  )
  assert.ok(documentThemes.proposalDocumentThemes.every((theme) => !Object.hasOwn(theme.tokens, 'fontFamily')))
  for (const theme of documentThemes.proposalDocumentThemes) {
    assert.ok(documentContrast.getContrastRatio(theme.tokens.ink, theme.tokens.paper) >= 4.5)
    assert.ok(documentContrast.getContrastRatio(theme.tokens.accent, theme.tokens.paper) >= 4.5)
    assert.ok(documentContrast.getContrastRatio(theme.tokens.ink, theme.tokens.soft) >= 4.5)
    const smallTextColor = documentContrast.mixHexColors(theme.tokens.ink, theme.tokens.paper, 0.68)
    assert.ok(documentContrast.getContrastRatio(smallTextColor, theme.tokens.paper) >= 4.5)
  }

  assert.equal((fontCss.match(/@font-face/g) ?? []).length, 1)
  assert.match(fontCss, /font-family:\s*'Source Sans 3'/)
  assert.doesNotMatch(fontCss, /IBM Plex Sans|Archivo/i)
  assert.match(tokensCss, /font-family:\s*'Source Sans 3', ui-sans-serif, system-ui, sans-serif/)
  assert.match(documentCss, /font-family:\s*'Source Sans 3', ui-sans-serif, system-ui, sans-serif/)
  assert.doesNotMatch(`${tokensCss}\n${documentCss}\n${previewPageSource}`, /IBM Plex Sans|Archivo|Precisão Técnica|precisao-tecnica/i)
  assert.doesNotMatch(previewPageSource, /Tipografia|typograph|Recomendada/i)
  assert.deepEqual(
    Object.keys(packageManifest.dependencies).filter((dependency) => dependency.startsWith('@fontsource-variable/')),
    ['@fontsource-variable/source-sans-3'],
  )

  const removedScopeSources = [
    documentPreviewSource,
    documentBlocksSource,
    documentMapperSource,
    documentTypesSource,
    documentCss,
  ].join('\n')
  assert.doesNotMatch(removedScopeSources, /DocumentScopeSummary|scopeSummary|scope-summary|scope-tags|Solução técnica para o evento/)
  assert.match(previewPageSource, /Prévia visual não emitida\. Cores e composição ainda estão em validação\./)
  assert.match(decisionsSource, /DEC-021[^\n]*`EQ-AAAA-NNNN`/)
  assert.match(decisionsSource, /`EQ-2026-0001`/)

  assert.match(appHeaderSource, /HeaderHelpPanel/)
  assert.match(appHeaderSource, /HeaderNotificationsPanel/)
  assert.match(appHeaderSource, /HeaderProfilePanel/)
  assert.equal((appHeaderSource.match(/aria-expanded=/g) ?? []).length, 3)
  assert.equal((appHeaderSource.match(/aria-controls=/g) ?? []).length, 3)
  assert.doesNotMatch(appHeaderSource, /desktop-only/)
  assert.doesNotMatch(`${appHeaderSource}\n${layoutCss}`, /notification-dot/)
  assert.match(headerPanelsSource, /event\.key !== 'Escape'/)
  assert.match(headerPanelsSource, /document\.addEventListener\('pointerdown'/)
  assert.match(headerPanelsSource, /actionsRef\.current\?\.contains/)
  assert.match(headerPanelsSource, /triggerRef\.current\?\.focus/)
  assert.match(layoutCss, /\.header-panel\s*\{[\s\S]*z-index:\s*90/)
  assert.match(layoutCss, /width:\s*min\(22rem, calc\(100vw - 2rem\)\)/)

  const helpMarkup = renderToStaticMarkup(createElement(
    MemoryRouter,
    null,
    createElement(headerHelp.HeaderHelpPanel, { onNavigate: () => {} }),
  ))
  assert.match(helpMarkup, /Ajuda rápida/)
  assert.match(helpMarkup, /Criar nova proposta/)
  assert.match(helpMarkup, /href="\/propostas\/nova"/)
  assert.match(helpMarkup, /Ver propostas/)
  assert.match(helpMarkup, /href="\/propostas"/)
  assert.match(helpMarkup, /Configurações/)
  assert.match(helpMarkup, /href="\/mais"/)
  assert.match(helpMarkup, /Rascunhos podem ser editados\. A emissão cria uma versão que não poderá ser alterada\./)

  const notificationsMarkup = renderToStaticMarkup(createElement(headerNotifications.HeaderNotificationsPanel))
  assert.match(notificationsMarkup, /Notificações/)
  assert.match(notificationsMarkup, /Nenhuma notificação no momento\./)
  assert.match(notificationsMarkup, /Avisos de propostas, emissões e eventos aparecerão aqui quando esse recurso estiver conectado\./)

  const profileMarkup = renderToStaticMarkup(createElement(
    MemoryRouter,
    null,
    createElement(headerProfile.HeaderProfilePanel, { onNavigate: () => {} }),
  ))
  assert.match(profileMarkup, /Camila/)
  assert.match(profileMarkup, /Administrador/)
  assert.match(profileMarkup, /EQUIPESOM/)
  assert.match(profileMarkup, /Sessão demonstrativa do protótipo/)
  assert.doesNotMatch(`${appHeaderSource}\n${helpMarkup}\n${notificationsMarkup}\n${profileMarkup}`, /Sair|logout|senha|troca de empresa|autenticação simulada/i)

  const badgesRule = componentsCss.match(/\.proposal-detail__badges\s*\{([^}]*)\}/s)?.[1] ?? ''
  assert.match(badgesRule, /align-self:\s*start/)
  assert.match(badgesRule, /align-items:\s*center/)
  assert.match(badgesRule, /flex-wrap:\s*wrap/)
  const detailPillsRule = componentsCss.match(/\.proposal-detail__badges \.status-pill,\s*\.proposal-detail__badges \.source-pill\s*\{([^}]*)\}/s)?.[1] ?? ''
  assert.match(detailPillsRule, /display:\s*inline-flex/)
  assert.match(detailPillsRule, /width:\s*auto/)
  assert.match(detailPillsRule, /min-height:\s*25px/)
  assert.match(detailPillsRule, /flex:\s*0 0 auto/)
  assert.match(detailPillsRule, /align-items:\s*center/)
  assert.match(detailPillsRule, /justify-content:\s*center/)
  assert.match(detailPillsRule, /white-space:\s*nowrap/)
  assert.match(detailPillsRule, /line-height:\s*1/)
  assert.match(componentsCss, /@media \(min-width: 720px\)[\s\S]*\.proposal-detail__badges\s*\{\s*justify-content:\s*flex-end;/)
  assert.match(detailPageSource, /Rascunho/)
  assert.match(detailPageSource, /Salvo localmente/)

  const proposalDocumentData = documentMapper.createProposalDocumentData(completed.version.snapshot)
  assert.ok(proposalDocumentData)
  assert.equal(proposalDocumentData.presentationContext, 'documentPreview')
  assert.equal(proposalDocumentData.issuer.brandName, 'EQUIPESOM')
  assert.equal(proposalDocumentData.issuer.document.number, '17.681.110/0001-69')
  assert.equal(proposalDocumentData.client.name, 'Cliente de teste')
  assert.equal(proposalDocumentData.client.document, '04.252.011/0001-10')
  assert.notEqual(proposalDocumentData.issuer.document.number, proposalDocumentData.client.document)
  assert.equal(Object.hasOwn(proposalDocumentData, 'scopeSummary'), false)
  assert.equal(proposalDocumentData.equipment[0].quantity, 3)
  assert.equal(proposalDocumentData.services[0].name, 'Operação técnica')
  assert.equal(proposalDocumentData.preparedByName, 'Camila da Silva')

  const shortScenario = documentPagination.paginateMeasuredBlocks([
    { id: 'titulo', height: 90 },
    { id: 'dados', height: 120 },
    { id: 'fechamento', height: 100 },
  ], { firstPageCapacity: 500, continuationPageCapacity: 450, gap: 10 })
  assert.equal(shortScenario.length, 1)

  const mediumScenario = documentPagination.paginateMeasuredBlocks([
    { id: 'bloco-1', height: 190 },
    { id: 'bloco-2', height: 190 },
    { id: 'bloco-3', height: 190 },
  ], { firstPageCapacity: 400, continuationPageCapacity: 400, gap: 10 })
  assert.equal(mediumScenario.length, 2)

  const extensiveScenario = documentPagination.paginateMeasuredBlocks(
    Array.from({ length: 7 }, (_, index) => ({ id: `extenso-${index + 1}`, height: 210 })),
    { firstPageCapacity: 430, continuationPageCapacity: 430, gap: 10 },
  )
  assert.equal(extensiveScenario.length, 4)
  assert.deepEqual(
    extensiveScenario.flatMap((page) => page.blockIds),
    Array.from({ length: 7 }, (_, index) => `extenso-${index + 1}`),
  )

  const keepHeadingWithFirstItem = documentPagination.paginateMeasuredBlocks([
    { id: 'conteudo-anterior', height: 300 },
    { id: 'titulo-secao', height: 50, keepWithNext: true },
    { id: 'primeiro-item', height: 100 },
  ], { firstPageCapacity: 400, continuationPageCapacity: 400, gap: 10 })
  assert.deepEqual(keepHeadingWithFirstItem.map((page) => page.blockIds), [
    ['conteudo-anterior'],
    ['titulo-secao', 'primeiro-item'],
  ])

  const paginationBlocks = documentPaginationBlocks.createProposalDocumentPaginationBlocks(proposalDocumentData)
  const paginatedEquipmentKeys = paginationBlocks
    .filter((block) => block.kind === 'equipment-row')
    .flatMap((block) => block.equipment.map((item) => item.key))
  const paginatedServiceKeys = paginationBlocks
    .filter((block) => block.kind === 'service-row')
    .flatMap((block) => block.services.map((service) => service.key))
  assert.deepEqual(paginatedEquipmentKeys, proposalDocumentData.equipment.map((item) => item.key))
  assert.deepEqual(paginatedServiceKeys, proposalDocumentData.services.map((service) => service.key))
  assert.equal(new Set(paginationBlocks.map((block) => block.id)).size, paginationBlocks.length)

  assert.match(documentPaginationHookSource, /document\.fonts\?\.ready/)
  assert.match(documentPaginationHookSource, /ResizeObserver/)
  assert.match(documentPaginationHookSource, /getBoundingClientRect\(\)\.height/)
  assert.match(documentPaginationHookSource, /297 \/ 210/)
  assert.match(documentPreviewSource, /data-pagination-status/)
  assert.match(documentPreviewSource, /Paginação estabilizada/)
  assert.doesNotMatch(`${documentBlocksSource}\n${documentPreviewSource}`, /Página \{page\} de 2|page:\s*1 \| 2/)
  assert.doesNotMatch(documentPaginationSource, /equipment\.length|services\.length|até 10/i)
  const documentPageRule = documentCss.match(/\.proposal-document__page\s*\{([^}]*)\}/s)?.[1] ?? ''
  assert.match(documentPageRule, /height:\s*297mm/)
  assert.match(documentPageRule, /overflow:\s*visible/)
  assert.doesNotMatch(documentPageRule, /overflow:\s*hidden/)
  assert.match(documentCss, /@media \(max-width: 719px\)[\s\S]*\.proposal-document__page\s*\{[\s\S]*height:\s*auto/)

  let previewClockCalls = 0
  const previewSession = documentDate.createProposalPreviewSession(() => {
    previewClockCalls += 1
    return new Date('2026-08-19T12:00:00-03:00')
  })
  assert.equal(previewClockCalls, 1)
  const previewPlaceDate = documentDate.createProposalDocumentPlaceDate(
    proposalDocumentData.issuer,
    { kind: 'preview', viewedAt: previewSession.openedAt },
  )
  assert.deepEqual(previewPlaceDate, {
    context: 'documentPreview',
    label: 'Local e data da prévia',
    value: 'Florianópolis/SC, 19 de agosto de 2026',
  })

  const emittedPlaceDate = documentDate.createProposalDocumentPlaceDate(
    proposalDocumentData.issuer,
    { kind: 'emitted', issuedAt: '2026-08-20T15:00:00.000Z' },
  )
  assert.deepEqual(emittedPlaceDate, {
    context: 'emittedDocument',
    label: 'Local e data de emissão',
    value: 'Florianópolis/SC, 20 de agosto de 2026',
  })
  const emittedFromSameIssuedAt = documentDate.createProposalDocumentPlaceDate(
    proposalDocumentData.issuer,
    { kind: 'emitted', issuedAt: '2026-08-20T15:00:00.000Z' },
  )
  assert.deepEqual(emittedFromSameIssuedAt, emittedPlaceDate)

  const storedBeforeThemeRendering = window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY)
  const proposalBeforeVisualCombinations = structuredClone(completed)
  const renderedThemes = documentThemes.proposalDocumentThemes.map((theme) => renderToStaticMarkup(createElement(
      documentPreview.ProposalDocumentPreview,
      {
        data: proposalDocumentData,
        themeId: theme.id,
        placeDate: previewPlaceDate,
      },
    )))
  assert.equal(renderedThemes.length, 2)
  assert.equal(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY), storedBeforeThemeRendering)
  assert.deepEqual(completed, proposalBeforeVisualCombinations)
  assert.equal(completed.version.issuedAt, undefined)
  const renderedThemePageCounts = renderedThemes.map(
    (markup) => (markup.match(/data-page-number=/g) ?? []).length,
  )
  assert.deepEqual(renderedThemePageCounts, [1, 1])
  for (const markup of renderedThemes) {
    assert.match(markup, /Proposta comercial/)
    assert.match(markup, /EQUIPESOM/)
    assert.match(markup, /17\.681\.110 EDEVALDO ALVES/)
    assert.match(markup, /Cliente de teste/)
    assert.match(markup, /Evento local de teste/)
    assert.match(markup, /Caixa ativa/)
    assert.match(markup, /3×/)
    assert.match(markup, /Operação técnica/)
    assert.match(markup, /Equipamentos/)
    assert.match(markup, /Serviços/)
    assert.match(markup, /Investimento/)
    assert.match(markup, /Total/)
    assert.match(markup, /Camila da Silva/)
    assert.match(markup, /Local e data da prévia/)
    assert.match(markup, /Florianópolis\/SC, 19 de agosto de 2026/)
    assert.match(markup, /EQUIPESOM · Proposta comercial/)
    assert.match(markup, /data-page-count="1"/)
    assert.match(markup, /Página 1 de 1/)
    assert.doesNotMatch(markup, /Página 2 de/)
    assert.doesNotMatch(markup, /Prévia não emitida · composição em validação/)
    assert.doesNotMatch(markup, /Solução técnica para o evento|Resumo do escopo/)
    assert.doesNotMatch(markup, /Rascunho|identificador local/i)
    assert.doesNotMatch(markup, new RegExp(completed.id, 'i'))
    assert.doesNotMatch(markup, /EQ-\d{4}-\d{4}/)
    assert.doesNotMatch(markup, /número da proposta|Local e data de emissão|assinatura|aceite|disponibilidade/i)
    assert.doesNotMatch(markup, /Prévia visual não emitida\. Cores e composição ainda estão em validação\./)
  }
  assert.notEqual(renderedThemes[0], renderedThemes[1])

  const futureIssuedFooterMarkup = renderToStaticMarkup(createElement(
    documentBlocks.DocumentPageFooter,
    {
      issuerBrandName: 'EQUIPESOM',
      issuedIdentification: { proposalNumber: 'EQ-2026-0001', versionLabel: 'v1' },
      page: 2,
      totalPages: 3,
    },
  ))
  assert.match(futureIssuedFooterMarkup, /EQUIPESOM · EQ-2026-0001 · v1/)
  assert.match(futureIssuedFooterMarkup, /Página 2 de 3/)

  const photographedDocumentData = documentMapper.createProposalDocumentData({
    ...completed.version.snapshot,
    issuer: {
      ...completed.version.snapshot.issuer,
      brandName: 'MARCA FOTOGRAFADA',
    },
  })
  const photographedDocumentMarkup = renderToStaticMarkup(createElement(
    documentPreview.ProposalDocumentPreview,
    {
      data: photographedDocumentData,
      themeId: 'tecnico-litoraneo',
      placeDate: previewPlaceDate,
    },
  ))
  assert.match(photographedDocumentMarkup, /MARCA FOTOGRAFADA · Proposta comercial/)

  const photographedSnapshot = structuredClone(completed.version.snapshot)
  photographedSnapshot.issuer.brandName = 'MARCA FOTOGRAFADA'
  const detailMarkup = renderToStaticMarkup(createElement(
    snapshotDetails.ProposalSnapshotDetails,
    { snapshot: photographedSnapshot },
  ))
  assert.match(detailMarkup, /Emissor/)
  assert.doesNotMatch(detailMarkup, /Emitente/)
  assert.match(detailMarkup, /MARCA FOTOGRAFADA/)
  assert.match(detailMarkup, /Contratante/)
  assert.match(detailMarkup, /Rascunho/)
  assert.match(detailMarkup, /Valores ainda editáveis\. Nenhuma proposta foi emitida ou enviada ao cliente\./)
  assert.doesNotMatch(detailMarkup, /Dados provisórios/)
  assert.doesNotMatch(detailMarkup, /experimentação do protótipo/)
  assert.doesNotMatch(detailMarkup, /não representam compromisso comercial/)
  assert.doesNotMatch(detailMarkup, /lucide-phone/)
  assert.doesNotMatch(detailMarkup, /lucide-mail/)
  assert.deepEqual(issuerPresentation.getVisibleIssuerContacts(completed.version.snapshot.issuer), [])
  const unavailableIssuerMarkup = renderToStaticMarkup(createElement(issuerHeader.IssuerHeader, {}))
  assert.match(unavailableIssuerMarkup, /Informações do emissor não disponíveis nesta versão/)

  const documentPreviewMarkup = renderToStaticMarkup(createElement(
    snapshotDetails.ProposalSnapshotDetails,
    { snapshot: photographedSnapshot, presentationContext: 'documentPreview' },
  ))
  const emittedDocumentMarkup = renderToStaticMarkup(createElement(
    snapshotDetails.ProposalSnapshotDetails,
    { snapshot: photographedSnapshot, presentationContext: 'emittedDocument' },
  ))
  for (const externalMarkup of [documentPreviewMarkup, emittedDocumentMarkup]) {
    assert.match(externalMarkup, /Investimento/)
    assert.doesNotMatch(externalMarkup, /Valores ainda editáveis/)
    assert.doesNotMatch(externalMarkup, /protótipo|experimentação|compromisso comercial/)
  }
  assert.equal(presentation.proposalPresentation.internalDraft.identification, 'Rascunho')
  assert.equal(presentation.proposalPresentation.documentPreview.notice, undefined)
  assert.equal(presentation.proposalPresentation.emittedDocument.notice, undefined)
  assert.equal(presentation.proposalPresentation.emittedDocument.immutable, true)

  const beforeEdit = structuredClone(completed)
  assert.equal(storage.isProposalEditable(completed), true)
  const editing = storage.startEditingProposal(completed.id)
  assert.equal(editing?.editingProposalId, completed.id)
  assert.equal(editing?.draft.clientName, 'Cliente de teste')
  assert.equal(editing?.draft.preparedByName, 'Camila da Silva')

  const editInProgress = {
    ...editing.draft,
    clientName: 'Cliente atualizado',
    preparedByName: '  Edevaldo Alves  ',
  }
  const editSaved = storage.saveActiveDraft(editInProgress, 4, completed.id)
  assert.equal(editSaved?.editingProposalId, completed.id)
  assert.equal(editSaved?.draft.preparedByName, 'Edevaldo Alves')
  const editRecovered = storage.loadPrototypeState().state.activeDraft
  assert.equal(editRecovered?.editingProposalId, completed.id)
  assert.equal(editRecovered?.currentStep, 4)
  assert.equal(editRecovered?.draft.clientName, 'Cliente atualizado')

  const updated = storage.updateExistingDraft(completed.id, editRecovered.draft)
  assert.ok(updated)
  assert.equal(updated.id, beforeEdit.id)
  assert.equal(updated.currentVersionId, beforeEdit.currentVersionId)
  assert.equal(updated.version.id, beforeEdit.version.id)
  assert.equal(updated.version.versionNumber, beforeEdit.version.versionNumber)
  assert.equal(updated.version.clientName, 'Cliente atualizado')
  assert.equal(updated.version.snapshot?.preparedBy.name, 'Edevaldo Alves')
  assert.deepEqual(updated.version.snapshot?.issuer, beforeEdit.version.snapshot?.issuer)
  assert.notEqual(updated.updatedAt, beforeEdit.updatedAt)

  const afterUpdate = storage.loadPrototypeState().state
  assert.equal(afterUpdate.activeDraft, null)
  assert.equal(afterUpdate.localProposals.length, 1)
  assert.equal(afterUpdate.localProposals[0].id, completed.id)
  assert.equal(repository.getProposalById(completed.id)?.version.snapshot?.client.name, 'Cliente atualizado')
  assert.equal(repository.getProposalById('identificador-inexistente'), undefined)

  const displayed = repository.getDisplayedProposals()
  assert.equal(displayed[0].id, completed.id)
  assert.ok(displayed.every((proposal) => proposal.tenantId === 'tenant-equipesom-demo'))
  const stats = repository.getProposalStats(displayed, new Date('2026-08-18T12:00:00-03:00'))
  assert.equal(stats.drafts, displayed.filter((proposal) => proposal.status === 'rascunho').length)

  const legacyDraftBase = {
    clientName: 'Cliente preservado',
    clientType: 'empresa',
    contactName: 'Contato antigo',
    phone: '',
    eventName: 'Evento preservado',
    eventType: 'Evento privado',
    startDate: '2026-10-10',
    endDate: '2026-10-10',
    location: 'Local antigo',
    city: 'Florianópolis',
    estimatedAudience: '',
    catalogItemIds: ['som-principal', 'operacao'],
    baseValue: 1000,
    travelFee: 0,
    discount: 0,
    validityDays: 30,
    paymentTerm: 'A combinar',
    mealsProvidedByClient: true,
    accommodationRequired: false,
    commercialNotes: '',
  }
  const legacyProposal = {
    id: 'local-legado',
    tenantId: 'tenant-equipesom-demo',
    clientId: 'client-legado',
    currentVersionId: 'local-legado-v1',
    status: 'rascunho',
    createdAt: '2026-08-17T10:00:00-03:00',
    updatedAt: '2026-08-17T10:00:00-03:00',
    source: 'local',
    version: {
      id: 'local-legado-v1',
      proposalId: 'local-legado',
      versionNumber: 1,
      clientName: 'Cliente legado',
      eventName: 'Evento legado',
      eventDate: '2026-10-10',
      total: 1000,
    },
  }

  window.localStorage.clear()
  window.localStorage.setItem(storage.PROTOTYPE_STORAGE_KEY_V1, JSON.stringify({
    formatVersion: 1,
    tenantId: 'tenant-equipesom-demo',
    activeDraft: {
      draft: { ...legacyDraftBase, preparedByUserId: 'user-camila' },
      currentStep: 2,
      savedAt: '2026-08-17T13:00:00.000Z',
    },
    localProposals: [legacyProposal],
  }))
  const migratedV1 = storage.loadPrototypeState()
  assert.equal(migratedV1.migratedFromV1, true)
  assert.equal(migratedV1.state.activeDraft?.draft.preparedByName, 'Camila')
  assert.equal(migratedV1.state.activeDraft?.draft.equipmentItems[0].catalogItemId, 'som-principal')
  assert.equal(migratedV1.state.activeDraft?.draft.serviceIds[0], 'operacao')
  assert.ok(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY_V1))
  assert.ok(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY))

  const v2Proposal = structuredClone(updated)
  delete v2Proposal.version.snapshot.issuer
  v2Proposal.version.snapshot.preparedBy = {
    userId: 'user-camila',
    displayName: 'Camila',
  }
  window.localStorage.clear()
  window.localStorage.setItem(storage.PROTOTYPE_STORAGE_KEY_V2, JSON.stringify({
    formatVersion: 2,
    tenantId: 'tenant-equipesom-demo',
    activeDraft: {
      draft: { ...validDraft, preparedByName: undefined, preparedByUserId: 'user-edevaldo-alves' },
      currentStep: 1,
      savedAt: '2026-08-18T10:00:00.000Z',
    },
    localProposals: [v2Proposal],
  }))
  const migratedV2 = storage.loadPrototypeState()
  assert.equal(migratedV2.migratedFromV2, true)
  assert.equal(migratedV2.state.activeDraft?.draft.preparedByName, 'Edevaldo Alves')
  assert.equal(migratedV2.state.localProposals[0].version.snapshot?.preparedBy.name, 'Camila')
  assert.equal(migratedV2.state.localProposals[0].version.snapshot?.issuer?.brandName, 'EQUIPESOM')
  assert.ok(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY_V2))
  assert.ok(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY))

  window.localStorage.clear()
  window.localStorage.setItem(storage.PROTOTYPE_STORAGE_KEY_V2, JSON.stringify({
    formatVersion: 2,
    tenantId: 'tenant-equipesom-demo',
    activeDraft: {
      draft: { ...validDraft, preparedByName: undefined, preparedByUserId: 'user-desconhecido' },
      currentStep: 0,
      savedAt: '2026-08-18T11:00:00.000Z',
    },
    localProposals: [],
  }))
  assert.equal(storage.loadPrototypeState().state.activeDraft?.draft.preparedByName, '')

  window.localStorage.clear()
  const completeLocal = structuredClone(updated)
  delete completeLocal.version.snapshot.issuer
  const sentLocal = structuredClone(completeLocal)
  sentLocal.id = 'local-enviada'
  sentLocal.currentVersionId = 'local-enviada-v1'
  sentLocal.status = 'enviada'
  sentLocal.version.id = 'local-enviada-v1'
  sentLocal.version.proposalId = sentLocal.id
  const acceptedLocal = structuredClone(sentLocal)
  acceptedLocal.id = 'local-aceita'
  acceptedLocal.currentVersionId = 'local-aceita-v1'
  acceptedLocal.status = 'aceita'
  acceptedLocal.version.id = 'local-aceita-v1'
  acceptedLocal.version.proposalId = acceptedLocal.id
  const foreignProposal = structuredClone(completeLocal)
  foreignProposal.id = 'outro-tenant'
  foreignProposal.tenantId = 'tenant-fora-do-escopo'
  foreignProposal.currentVersionId = 'outro-tenant-v1'
  foreignProposal.version.id = 'outro-tenant-v1'
  foreignProposal.version.proposalId = foreignProposal.id
  const wrongIssuerProposal = structuredClone(completeLocal)
  wrongIssuerProposal.id = 'emitente-outro-tenant'
  wrongIssuerProposal.currentVersionId = 'emitente-outro-tenant-v1'
  wrongIssuerProposal.version.id = 'emitente-outro-tenant-v1'
  wrongIssuerProposal.version.proposalId = wrongIssuerProposal.id
  wrongIssuerProposal.version.snapshot.issuer = {
    ...company.createIssuerSnapshot(company.pilotCompany),
    tenantId: 'tenant-fora-do-escopo',
  }
  const v1Preserved = '{"preservar":"v1"}'
  const v2Preserved = '{"preservar":"v2"}'
  const v3State = JSON.stringify({
    formatVersion: 3,
    tenantId: 'tenant-equipesom-demo',
    activeDraft: null,
    localProposals: [completeLocal, sentLocal, acceptedLocal, legacyProposal, foreignProposal, wrongIssuerProposal],
  })
  window.localStorage.setItem(storage.PROTOTYPE_STORAGE_KEY_V1, v1Preserved)
  window.localStorage.setItem(storage.PROTOTYPE_STORAGE_KEY_V2, v2Preserved)
  window.localStorage.setItem(storage.PROTOTYPE_STORAGE_KEY_V3, v3State)

  const migratedV3 = storage.loadPrototypeState()
  assert.equal(migratedV3.migratedFromV3, true)
  assert.equal(migratedV3.state.localProposals.find((proposal) => proposal.id === completeLocal.id)?.version.snapshot?.issuer?.brandName, 'EQUIPESOM')
  assert.equal(migratedV3.state.localProposals.find((proposal) => proposal.id === sentLocal.id)?.version.snapshot?.issuer, undefined)
  assert.equal(migratedV3.state.localProposals.find((proposal) => proposal.id === acceptedLocal.id)?.version.snapshot?.issuer, undefined)
  assert.equal(migratedV3.state.localProposals.find((proposal) => proposal.id === wrongIssuerProposal.id)?.version.snapshot, undefined)
  assert.equal(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY_V1), v1Preserved)
  assert.equal(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY_V2), v2Preserved)
  assert.equal(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY_V3), v3State)
  assert.ok(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY))

  assert.equal(storage.isProposalEditable(repository.getProposalById(completeLocal.id)), true)
  assert.equal(storage.startEditingProposal(sentLocal.id), null)
  assert.equal(storage.startEditingProposal(acceptedLocal.id), null)
  assert.equal(storage.startEditingProposal('prop-1041'), null)
  assert.equal(storage.startEditingProposal(legacyProposal.id), null)
  assert.equal(storage.startEditingProposal(foreignProposal.id), null)
  assert.equal(storage.startEditingProposal(wrongIssuerProposal.id), null)
  assert.equal(repository.getProposalById(foreignProposal.id), undefined)
  assert.equal(documentMapper.canPreviewProposal(repository.getProposalById(completeLocal.id)), true)
  assert.equal(documentMapper.canPreviewProposal(repository.getProposalById(sentLocal.id)), false)
  assert.equal(documentMapper.canPreviewProposal(repository.getProposalById(acceptedLocal.id)), false)
  assert.equal(documentMapper.canPreviewProposal(repository.getProposalById(legacyProposal.id)), false)
  assert.equal(documentMapper.canPreviewProposal(repository.getProposalById('prop-1041')), false)
  const foreignCompleteProposal = structuredClone(updated)
  foreignCompleteProposal.tenantId = 'tenant-fora-do-escopo'
  foreignCompleteProposal.version.snapshot.issuer.tenantId = 'tenant-fora-do-escopo'
  assert.equal(documentMapper.canPreviewProposal(foreignCompleteProposal), false)

  const historicalPhone = '+55 48 99999-9999 ramal histórico'
  const v4HistoricalState = structuredClone(migratedV3.state)
  v4HistoricalState.activeDraft = {
    draft: { ...validDraft, phone: historicalPhone },
    currentStep: 0,
    savedAt: '2026-08-18T18:00:00.000Z',
    editingProposalId: null,
  }
  const historicalProposal = v4HistoricalState.localProposals.find((proposal) => proposal.id === sentLocal.id)
  historicalProposal.version.snapshot.client.phone = historicalPhone
  window.localStorage.setItem(storage.PROTOTYPE_STORAGE_KEY, JSON.stringify(v4HistoricalState))
  const historicalState = storage.loadPrototypeState().state
  assert.equal(historicalState.activeDraft?.draft.phone, historicalPhone)
  assert.equal(
    historicalState.localProposals.find((proposal) => proposal.id === sentLocal.id)?.version.snapshot?.client.phone,
    historicalPhone,
  )
  assert.ok(validation.validateStep(0, historicalState.activeDraft.draft).phone)

  window.localStorage.setItem(storage.PROTOTYPE_STORAGE_KEY, '{conteudo-invalido')
  const invalidContent = storage.loadPrototypeState()
  assert.ok(invalidContent.issue)
  assert.equal(invalidContent.state.activeDraft, null)
  assert.ok(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY))

  console.log('✓ catálogo INV-001 a INV-020 preservado sem linha CONTROLE')
  console.log('✓ CPF/CNPJ opcionais, mascaráveis e validados por dígitos')
  console.log('✓ telefone do piloto limitado, mascarado e validado sem aceitar +55')
  console.log('✓ telefone histórico preservado sem corte e sinalizado para correção')
  console.log('✓ nome livre de elaboração obrigatório, aparado e salvo sem identificador fixo')
  console.log('✓ emissor e contratante separados em fotografia completa vinculada ao tenant')
  console.log('✓ cabeçalho usa a fotografia e oculta telefone e e-mail vazios')
  console.log('✓ textos internos, prévia e documento emitido permanecem em contextos separados')
  console.log('✓ laboratório documental compara duas direções sem alterar dados ou armazenamento')
  console.log('✓ Source Sans 3 permanece como única fonte local da plataforma e da proposta')
  console.log('✓ duas direções de cor preservam os mesmos dados sem recomendação visual')
  console.log('✓ selos do detalhe possuem altura compacta, conteúdo centralizado e largura natural')
  console.log('✓ resumo repetido removido e listas completas preservadas na composição adaptativa')
  console.log('✓ cenários curto, médio e extenso resultam em uma, duas e três ou mais páginas')
  console.log('✓ paginação por altura preserva ordem, unicidade, títulos e fechamentos agrupados')
  console.log('✓ rodapé documental usa a fotografia do emissor e total dinâmico de páginas')
  console.log('✓ formato EQ-AAAA-NNNN registrado sem numerar rascunhos locais')
  console.log('✓ Ajuda, Notificações e Perfil possuem painéis acessíveis sem dados fictícios')
  console.log('✓ local e data da prévia permanecem estáveis e separados da futura emissão')
  console.log('✓ prévia usa somente a fotografia completa e omite conteúdo interno ou inventado')
  console.log('✓ elegibilidade da prévia restringe rascunho local completo ao tenant do piloto')
  console.log('✓ rascunho local completo editado sem duplicação ou nova versão')
  console.log('✓ edição ativa recuperada após recarga no mesmo identificador')
  console.log('✓ formatos v1, v2 e v3 migrados para v4 sem apagar as chaves anteriores')
  console.log('✓ migração acrescenta emitente apenas a rascunhos locais completos')
  console.log('✓ nomes legados conhecidos convertidos e identificador desconhecido mantido em branco')
  console.log('✓ envio, aceite, demonstração, legado incompleto e outro tenant bloqueiam edição')
  console.log('✓ conteúdo incompatível mantido e tratado sem falha')
} finally {
  await server.close()
}
