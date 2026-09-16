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
  const equipmentPresentation = await server.ssrLoadModule('/src/utils/equipmentPresentation.ts')
  const clientDocument = await server.ssrLoadModule('/src/utils/clientDocument.ts')
  const clientPhone = await server.ssrLoadModule('/src/utils/clientPhone.ts')
  const textNormalization = await server.ssrLoadModule('/src/config/pilotTextNormalization.ts')
  const brazilianStates = await server.ssrLoadModule('/src/data/brazilianStates.ts')
  const proposalAmounts = await server.ssrLoadModule('/src/utils/proposalAmounts.ts')
  const decimalInput = await server.ssrLoadModule('/src/utils/decimalInputValue.ts')
  const eventLocation = await server.ssrLoadModule('/src/utils/eventLocation.ts')
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
  const previewPrint = await server.ssrLoadModule('/src/features/proposal-document/previewPrint.ts')
  const printPlatform = await server.ssrLoadModule('/src/features/proposal-document/printPlatform.ts')
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
    printDiagnosticsSource,
    printPlatformSource,
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
    readFile(resolve(appRoot, 'src/features/proposal-document/ProposalPrintDiagnostics.tsx'), 'utf8'),
    readFile(resolve(appRoot, 'src/features/proposal-document/printPlatform.ts'), 'utf8'),
    readFile(resolve(appRoot, 'src/components/layout/AppHeader.tsx'), 'utf8'),
    readFile(resolve(appRoot, 'src/components/layout/header/useHeaderPanels.ts'), 'utf8'),
    readFile(resolve(appRoot, 'package.json'), 'utf8'),
    readFile(resolve(appRoot, '../Pacote_Continuidade_EQUIPESOM_v0.1/02_REGISTRO_DE_DECISOES.md'), 'utf8'),
  ])
  const packageManifest = JSON.parse(packageSource)

  assert.equal(inventory.inventoryEquipment.length, 20)
  assert.equal(printPlatform.detectProposalPrintPlatform({
    maxTouchPoints: 5,
    platform: 'iPhone',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Version/18.6 Mobile/15E148 Safari/604.1',
  }), 'ios-webkit')
  assert.equal(printPlatform.detectProposalPrintPlatform({
    maxTouchPoints: 5,
    platform: 'MacIntel',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.6 Safari/605.1.15',
  }), 'ios-webkit')
  assert.equal(printPlatform.detectProposalPrintPlatform({
    maxTouchPoints: 0,
    platform: 'Win32',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36',
  }), undefined)
  assert.equal(printPlatform.detectProposalPrintPlatform(undefined), undefined)
  assert.match(printPlatformSource, /isAppleWebKit && \(isIOSDevice \|\| isIPadWithDesktopUserAgent\)/)
  assert.doesNotMatch(printPlatformSource, /localStorage|sessionStorage/)
  assert.equal(inventory.inventoryEquipment[0].id, 'INV-001')
  assert.equal(inventory.inventoryEquipment[19].id, 'INV-020')
  assert.equal(inventory.inventoryEquipment.some((item) => item.id === 'CONTROLE'), false)
  assert.equal(equipmentPresentation.createPublicEquipmentDescription({
    informedBrandModel: 'Modelo não informado',
    informedSpecification: '600 — confirmar se o número representa watts',
  }), '')
  assert.equal(equipmentPresentation.createPublicEquipmentDescription({
    informedBrandModel: 'Lincoln Duplo',
    informedSpecification: 'Quantidade de transmissores não confirmada',
  }), 'Lincoln Duplo')
  assert.equal(equipmentPresentation.createPublicEquipmentDescription({
    informedBrandModel: 'Smart Vux 08 Pro',
    informedSpecification: '8 canais presumidos pelo nome; confirmar',
  }), 'Smart Vux 08 Pro')
  assert.equal(equipmentPresentation.createPublicEquipmentDescription({
    informedBrandModel: 'Behringer — modelo não informado',
    informedSpecification: '16 canais',
  }), 'Behringer · 16 canais')
  assert.equal(company.pilotCompany.brandName, 'EQUIPESOM')
  assert.equal(company.pilotCompany.legalName, '17.681.110 EDEVALDO ALVES')
  assert.deepEqual(company.pilotCompany.document, { type: 'CNPJ', number: '17.681.110/0001-69' })
  assert.equal(company.pilotCompany.address.city, 'FLORIANÓPOLIS')
  assert.equal(company.pilotCompany.phone, '')
  assert.equal(company.pilotCompany.email, '')

  assert.equal(brazilianStates.brazilianStates.length, 27)
  assert.equal(new Set(brazilianStates.brazilianStates).size, 27)
  assert.deepEqual(
    brazilianStates.brazilianStates,
    ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
  )
  assert.equal(textNormalization.normalizeTextValue('João da ação', 'free-text'), 'JOÃO DA AÇÃO')
  assert.equal(textNormalization.normalizeTextValue('camila@exemplo.com', 'email'), 'camila@exemplo.com')
  assert.equal(textNormalization.normalizeTextValue('https://exemplo.com/Rota', 'url'), 'https://exemplo.com/Rota')
  assert.equal(textNormalization.normalizeTextValue('INV-a01', 'technical-identifier'), 'INV-a01')
  assert.equal(eventLocation.formatCityState('Florianópolis', 'SC'), 'Florianópolis/SC')
  assert.equal(eventLocation.formatCityState('Florianópolis', undefined), 'Florianópolis')

  assert.equal(decimalInput.normalizeEditableDecimal('00100'), '100')
  assert.equal(decimalInput.normalizeEditableDecimal('000,50'), '0.50')
  assert.equal(decimalInput.normalizeEditableDecimal(''), '')
  assert.equal(decimalInput.parseEditableDecimal('00100'), 100)
  assert.equal(decimalInput.parseEditableDecimal(decimalInput.normalizeEditableDecimal('10,5')), 10.5)
  assert.equal(decimalInput.parseEditableDecimal(''), null)

  assert.deepEqual(proposalAmounts.calculateProposalAmounts({
    baseValue: 1350,
    travelFee: 100,
    discountPercentage: 10,
  }), {
    baseValue: 1350,
    travelFee: 100,
    subtotalBeforeDiscount: 1450,
    discountPercentage: 10,
    discountAmount: 145,
    total: 1305,
    pricingModel: 'percentage',
  })
  assert.equal(proposalAmounts.calculateProposalAmounts({ baseValue: 10.01, travelFee: 0, discountPercentage: 5 }).discountAmount, 0.5)
  assert.equal(proposalAmounts.calculateProposalAmounts({ baseValue: 10.01, travelFee: 0, discountPercentage: 5 }).total, 9.51)
  assert.equal(proposalAmounts.calculateProposalAmounts({ baseValue: 100, travelFee: 0, discountPercentage: 0 }).total, 100)
  assert.equal(proposalAmounts.calculateProposalAmounts({ baseValue: 100, travelFee: 0, discountPercentage: 100 }).total, 0)

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
  emptyDraft.eventState = ''
  emptyDraft.baseValue = 0
  emptyDraft.paymentTerm = ''
  emptyDraft.validityDays = 0

  const emptyClientErrors = validation.validateStep(0, emptyDraft)
  assert.equal(emptyClientErrors.clientName, 'Informe o nome ou a razão social.')
  assert.equal(emptyClientErrors.preparedByName, 'Informe o nome completo de quem elaborou a proposta.')
  assert.equal(emptyClientErrors.clientDocument, undefined)
  const emptyEventErrors = validation.validateStep(1, emptyDraft)
  assert.ok(emptyEventErrors.eventName && emptyEventErrors.startDate && emptyEventErrors.endDate && emptyEventErrors.location)
  assert.equal(emptyEventErrors.eventState, 'Selecione a UF do evento.')
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
    eventState: 'SC',
    equipmentItems: [{ catalogItemId: 'INV-001', quantity: 3 }],
    serviceIds: ['operacao'],
    commercialNotes: 'Observação preservada na fotografia.',
    baseValue: 1350,
    travelFee: 100,
    discountPercentage: 10,
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
  assert.ok(validation.validateStep(3, { ...validDraft, discountPercentage: -1 }).discountPercentage)
  assert.ok(validation.validateStep(3, { ...validDraft, discountPercentage: 101 }).discountPercentage)
  assert.ok(validation.validateStep(3, { ...validDraft, discountPercentage: null }).discountPercentage)
  assert.ok(validation.validateStep(3, { ...validDraft, discountPercentage: Number.NaN }).discountPercentage)
  assert.ok(validation.validateStep(3, { ...validDraft, discountPercentage: Number.POSITIVE_INFINITY }).discountPercentage)
  assert.ok(validation.validateStep(2, {
    ...validDraft,
    equipmentItems: [{ catalogItemId: 'INV-001', quantity: 0 }],
  }).equipmentItems)

  const saved = storage.saveActiveDraft(validDraft, 3)
  assert.ok(saved?.savedAt)
  assert.equal(saved?.draft.preparedByName, 'CAMILA DA SILVA')
  assert.equal(saved?.draft.clientName, 'CLIENTE DE TESTE')
  assert.equal(saved?.draft.eventName, 'EVENTO LOCAL DE TESTE')
  assert.equal(saved?.draft.city, 'FLORIANÓPOLIS')
  assert.equal(saved?.draft.clientDocument, '04.252.011/0001-10')
  assert.equal(saved?.draft.phone, '(48) 99999-1234')
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
  assert.equal(completed.version.snapshot?.preparedBy.name, 'CAMILA DA SILVA')
  assert.equal(completed.version.snapshot?.client.name, 'CLIENTE DE TESTE')
  assert.equal(completed.version.snapshot?.event.name, 'EVENTO LOCAL DE TESTE')
  assert.equal(completed.version.snapshot?.event.city, 'FLORIANÓPOLIS')
  assert.equal(completed.version.snapshot?.event.state, 'SC')
  assert.deepEqual(completed.version.snapshot?.values, {
    pricingModel: 'percentage',
    baseValue: 1350,
    travelFee: 100,
    subtotalBeforeDiscount: 1450,
    discountPercentage: 10,
    discountAmount: 145,
    total: 1305,
    currency: 'BRL',
    provisional: true,
  })
  assert.equal(completed.version.snapshot?.scope.equipment[0].catalogItemId, 'INV-001')
  assert.equal(completed.version.snapshot?.scope.equipment[0].quantity, 3)
  assert.equal(completed.version.snapshot?.scope.equipment[0].normalizedName, 'Caixa ativa')
  assert.equal(completed.version.snapshot?.scope.services[0].name, 'Operação técnica')
  assert.equal(completed.version.snapshot?.conditions.commercialNotes, 'OBSERVAÇÃO PRESERVADA NA FOTOGRAFIA.')

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

  assert.match(previewPageSource, /Imprimir ou salvar PDF/)
  assert.match(previewPageSource, /disabled=\{!paginationReady\}/)
  assert.match(previewPageSource, /Salvar como PDF/)
  assert.match(previewPageSource, /O navegador controla o nome final/)
  assert.match(previewPageSource, /onPaginationStateChange=\{setPaginationState\}/)
  assert.match(previewPageSource, /issueProposal\(proposal\.id, themeId\)/)
  assert.match(previewPageSource, /Emitir proposta/)
  assert.match(previewPageSource, /Imprimir ou salvar PDF/)
  assert.match(documentPreviewSource, /onPaginationStateChange/)
  assert.match(documentPreviewSource, /pageCount: totalPages[\s\S]*retry: retryPagination[\s\S]*status/)
  assert.match(documentCss, /\.proposal-document__identification/)
  assert.match(documentCss, /@media print\s*\{[\s\S]*\.app-header,[\s\S]*\.mobile-nav,[\s\S]*\.proposal-preview__workspace[\s\S]*display:\s*none !important/)
  assert.match(documentCss, /@page\s*\{\s*size:\s*A4;\s*margin:\s*0;/)
  assert.match(documentCss, /print-color-adjust:\s*exact/)
  assert.match(previewPageSource, /searchParams\.get\('printDebug'\) === '1'/)
  assert.match(previewPageSource, /requestedPrintTest === 'B' \|\| requestedPrintTest === 'C'/)
  assert.match(previewPageSource, /<ProposalPrintDiagnostics/)
  assert.match(printDiagnosticsSource, /userAgent:\s*navigator\.userAgent/)
  assert.match(printDiagnosticsSource, /allInDom:\s*allPages\.length/)
  assert.match(printDiagnosticsSource, /measurement:\s*measurementPages\.length/)
  assert.match(printDiagnosticsSource, /printable:\s*printablePages\.length/)
  assert.match(printDiagnosticsSource, /matchesLastChild:\s*page\.matches\(':last-child'\)/)
  assert.match(printDiagnosticsSource, /printGeometry:\s*\{[\s\S]*document:\s*describeElement\(documentRoot\)[\s\S]*pagesContainer:\s*describeElement\(pagesContainer\)[\s\S]*viewport:\s*describeElement\(documentViewport\)/)
  assert.match(printDiagnosticsSource, /printPlatform:\s*documentViewport\?\.getAttribute\('data-print-platform'\)/)
  assert.match(printDiagnosticsSource, /window\.addEventListener\('beforeprint'/)
  assert.match(printDiagnosticsSource, /window\.matchMedia\('print'\)/)
  assert.doesNotMatch(printDiagnosticsSource, /\b(?:window\.)?localStorage\.(?:getItem|setItem|removeItem|clear)\b/)
  assert.match(documentCss, /\.proposal-print-debug\s*\{[\s\S]*display:\s*none !important/)
  assert.match(documentCss, /data-print-debug-test='B'[\s\S]*\.proposal-document__page::before[\s\S]*display:\s*none !important/)
  assert.match(documentCss, /data-print-debug-test='C'[\s\S]*break-after:\s*auto !important;[\s\S]*page-break-after:\s*auto !important/)
  assert.match(documentPreviewSource, /data-print-platform=\{printPlatform\}/)
  assert.match(documentCss, /data-print-platform='ios-webkit'[\s\S]*width:\s*218mm/)
  assert.match(documentCss, /data-print-platform='ios-webkit'[\s\S]*\.proposal-document__pages\s*\{[\s\S]*width:\s*209\.8mm;[\s\S]*margin-inline:\s*auto/)
  assert.doesNotMatch(documentCss, /grid-template-rows:\s*minmax\(0,\s*1fr\)\s+auto/)

  const removedScopeSources = [
    documentPreviewSource,
    documentBlocksSource,
    documentMapperSource,
    documentTypesSource,
    documentCss,
  ].join('\n')
  assert.doesNotMatch(removedScopeSources, /DocumentScopeSummary|scopeSummary|scope-summary|scope-tags|Solução técnica para o evento/)
  assert.doesNotMatch(previewPageSource, /Prévia visual não emitida|PRÉVIA — NÃO EMITIDA/)
  assert.match(previewPageSource, /A emissão atribui número e data e bloqueia novas edições desta versão/)
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
  assert.match(detailPageSource, /formatDateTime\(proposal\.version\.issuedAt\)/)
  assert.doesNotMatch(detailPageSource, /formatDate\(proposal\.version\.issuedAt\)/)

  const proposalDocumentData = documentMapper.createProposalDocumentData(completed.version.snapshot)
  assert.ok(proposalDocumentData)
  assert.equal(proposalDocumentData.presentationContext, 'documentPreview')
  assert.equal(proposalDocumentData.issuer.brandName, 'EQUIPESOM')
  assert.equal(proposalDocumentData.issuer.document.number, '17.681.110/0001-69')
  assert.equal(proposalDocumentData.client.name, 'CLIENTE DE TESTE')
  assert.equal(proposalDocumentData.client.document, '04.252.011/0001-10')
  assert.notEqual(proposalDocumentData.issuer.document.number, proposalDocumentData.client.document)
  assert.equal(Object.hasOwn(proposalDocumentData, 'scopeSummary'), false)
  assert.equal(proposalDocumentData.equipment[0].quantity, 3)
  assert.equal(proposalDocumentData.equipment[0].description, '')
  assert.equal(proposalDocumentData.services[0].name, 'Operação técnica')
  assert.equal(proposalDocumentData.preparedByName, 'CAMILA DA SILVA')

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

  assert.match(documentPaginationHookSource, /document\.fonts\.ready/)
  assert.match(documentPaginationHookSource, /getBoundingClientRect\(\)\.height/)
  assert.match(documentPaginationHookSource, /finally/)
  assert.match(documentPaginationHookSource, /retryPagination/)
  assert.doesNotMatch(documentPaginationHookSource, /ResizeObserver|window\.innerWidth|window\.addEventListener\(['"]resize/)
  assert.match(documentPreviewSource, /data-pagination-status/)
  assert.match(documentPreviewSource, /Paginação estabilizada/)
  assert.match(documentPreviewSource, /Tentar novamente/)
  assert.doesNotMatch(`${documentBlocksSource}\n${documentPreviewSource}`, /Página \{page\} de 2|page:\s*1 \| 2/)
  assert.doesNotMatch(documentPaginationSource, /equipment\.length|services\.length|até 10/i)
  const documentRule = documentCss.match(/\.proposal-document\s*\{([^}]*)\}/s)?.[1] ?? ''
  const documentPageRule = documentCss.match(/\.proposal-document__page\s*\{([^}]*)\}/s)?.[1] ?? ''
  assert.match(documentRule, /width:\s*210mm/)
  assert.match(documentRule, /min-width:\s*210mm/)
  assert.match(documentPageRule, /width:\s*210mm/)
  assert.match(documentPageRule, /height:\s*297mm/)
  assert.match(documentPageRule, /overflow:\s*visible/)
  assert.doesNotMatch(documentPageRule, /overflow:\s*hidden/)
  assert.doesNotMatch(documentCss, /@media \(max-width: 719px\)[\s\S]*\.proposal-document/)
  assert.doesNotMatch(documentCss, /\.proposal-document[\s\S]{0,120}(?:\d+vw|clamp\()/)

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
    label: 'Local e data do documento',
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
    assert.match(markup, /CLIENTE DE TESTE/)
    assert.match(markup, /EVENTO LOCAL DE TESTE/)
    assert.match(markup, /Caixa ativa/)
    assert.match(markup, /3×/)
    assert.match(markup, /Operação técnica/)
    assert.match(markup, /Equipamentos/)
    assert.match(markup, /Serviços/)
    assert.match(markup, /Investimento/)
    assert.match(markup, /Total/)
    assert.match(markup, /CAMILA DA SILVA/)
    assert.match(markup, /Local e data do documento/)
    assert.match(markup, /Florianópolis\/SC, 19 de agosto de 2026/)
    assert.match(markup, /EQUIPESOM · Proposta comercial/)
    assert.doesNotMatch(markup, /PRÉVIA — NÃO EMITIDA/)
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

  assert.equal(
    previewPrint.createProposalPrintTitle(
      '  Cliente Ação & Verão  ',
      new Date('2026-08-27T02:00:00.000Z'),
    ),
    'PROPOSTA-EQUIPESOM-CLIENTE-ACAO-VERAO-2026-08-26',
  )
  assert.equal(
    previewPrint.createProposalPrintTitle('***', new Date('2026-08-27T12:00:00.000Z')),
    'PROPOSTA-EQUIPESOM-CLIENTE-2026-08-27',
  )
  assert.equal(
    previewPrint.createProposalPrintTitle(
      'Cliente',
      new Date('2026-08-27T12:00:00.000Z'),
      'EQ-2026-0001',
    ),
    'PROPOSTA-EQUIPESOM-EQ-2026-0001-CLIENTE-2026-08-27',
  )
  let temporaryTitle = 'Projeto EQUIPESOM'
  let titleDuringPrint = ''
  let printCalls = 0
  const stateBeforePrinting = window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY)
  const proposalBeforePrinting = structuredClone(completed)
  previewPrint.printPreviewWithTitle('PROPOSTA-EQUIPESOM-TESTE', {
    getTitle: () => temporaryTitle,
    setTitle: (title) => { temporaryTitle = title },
    print: () => {
      printCalls += 1
      titleDuringPrint = temporaryTitle
    },
  })
  assert.equal(printCalls, 1)
  assert.equal(titleDuringPrint, 'PROPOSTA-EQUIPESOM-TESTE')
  assert.equal(temporaryTitle, 'Projeto EQUIPESOM')
  assert.equal(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY), stateBeforePrinting)
  assert.deepEqual(completed, proposalBeforePrinting)
  assert.throws(() => previewPrint.printPreviewWithTitle('PROPOSTA-COM-FALHA', {
    getTitle: () => temporaryTitle,
    setTitle: (title) => { temporaryTitle = title },
    print: () => { throw new Error('falha simulada') },
  }), /falha simulada/)
  assert.equal(temporaryTitle, 'Projeto EQUIPESOM')

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
  assert.match(detailMarkup, /Modelo não informado/)
  assert.match(detailMarkup, /confirmar se o número representa watts/)
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
    assert.doesNotMatch(externalMarkup, /Modelo não informado|confirmar|presumid|Estado do dado|INV-001/i)
  }
  assert.equal(presentation.proposalPresentation.internalDraft.identification, 'Rascunho')
  assert.equal(presentation.proposalPresentation.documentPreview.identification, undefined)
  assert.equal(presentation.proposalPresentation.documentPreview.notice, undefined)
  assert.equal(presentation.proposalPresentation.emittedDocument.notice, undefined)
  assert.equal(presentation.proposalPresentation.emittedDocument.immutable, true)

  const beforeEdit = structuredClone(completed)
  assert.equal(storage.isProposalEditable(completed), true)
  const editing = storage.startEditingProposal(completed.id)
  assert.equal(editing?.editingProposalId, completed.id)
  assert.equal(editing?.draft.clientName, 'CLIENTE DE TESTE')
  assert.equal(editing?.draft.preparedByName, 'CAMILA DA SILVA')

  const editInProgress = {
    ...editing.draft,
    clientName: 'Cliente atualizado',
    preparedByName: '  Edevaldo Alves  ',
  }
  const editSaved = storage.saveActiveDraft(editInProgress, 4, completed.id)
  assert.equal(editSaved?.editingProposalId, completed.id)
  assert.equal(editSaved?.draft.preparedByName, 'EDEVALDO ALVES')
  const editRecovered = storage.loadPrototypeState().state.activeDraft
  assert.equal(editRecovered?.editingProposalId, completed.id)
  assert.equal(editRecovered?.currentStep, 4)
  assert.equal(editRecovered?.draft.clientName, 'CLIENTE ATUALIZADO')

  const updated = storage.updateExistingDraft(completed.id, editRecovered.draft)
  assert.ok(updated)
  assert.equal(updated.id, beforeEdit.id)
  assert.equal(updated.currentVersionId, beforeEdit.currentVersionId)
  assert.equal(updated.version.id, beforeEdit.version.id)
  assert.equal(updated.version.versionNumber, beforeEdit.version.versionNumber)
  assert.equal(updated.version.clientName, 'CLIENTE ATUALIZADO')
  assert.equal(updated.version.snapshot?.preparedBy.name, 'EDEVALDO ALVES')
  assert.deepEqual(updated.version.snapshot?.issuer, beforeEdit.version.snapshot?.issuer)
  assert.notEqual(updated.updatedAt, beforeEdit.updatedAt)

  const afterUpdate = storage.loadPrototypeState().state
  assert.equal(afterUpdate.activeDraft, null)
  assert.equal(afterUpdate.localProposals.length, 1)
  assert.equal(afterUpdate.localProposals[0].id, completed.id)
  assert.equal(repository.getProposalById(completed.id)?.version.snapshot?.client.name, 'CLIENTE ATUALIZADO')
  assert.equal(repository.getProposalById('identificador-inexistente'), undefined)

  const displayed = repository.getDisplayedProposals()
  assert.equal(displayed[0].id, completed.id)
  assert.ok(displayed.every((proposal) => proposal.tenantId === 'tenant-equipesom-demo'))
  const stats = repository.getProposalStats(displayed, new Date('2026-08-18T12:00:00-03:00'))
  assert.equal(stats.drafts, displayed.filter((proposal) => proposal.status === 'rascunho').length)

  const issueCandidate = storage.completeActiveDraft({
    ...validDraft,
    clientName: 'Cliente para emissão',
    eventName: 'Evento para emissão',
  })
  assert.ok(issueCandidate)
  const issued = storage.issueProposal(
    issueCandidate.id,
    'verao-profissional',
    () => new Date('2026-08-20T15:00:00.000Z'),
  )
  assert.ok(issued)
  assert.equal(issued.status, 'emitida')
  assert.equal(issued.version.proposalNumber, 'EQ-2026-0001')
  assert.equal(issued.version.issuedAt, '2026-08-20T15:00:00.000Z')
  assert.equal(issued.version.documentThemeId, 'verao-profissional')
  assert.equal(issued.version.snapshot?.values.provisional, false)
  assert.equal(issued.auditEvents.length, 1)
  assert.deepEqual(issued.auditEvents[0], {
    id: `${issued.version.id}-emissao-2026-08-20T15:00:00.000Z`,
    action: 'proposta_emitida',
    occurredAt: '2026-08-20T15:00:00.000Z',
    actorName: 'CAMILA DA SILVA',
    versionId: issued.version.id,
    proposalNumber: 'EQ-2026-0001',
    total: 1305,
    discountPercentage: 10,
  })
  assert.equal(storage.isProposalEditable(issued), false)
  assert.equal(storage.startEditingProposal(issued.id), null)
  assert.equal(storage.issueProposal(issued.id, 'tecnico-litoraneo'), null)
  assert.equal(documentMapper.canPreviewProposal(issued), false)
  assert.equal(documentMapper.canOpenProposalDocument(issued), true)

  const issuedDocumentData = documentMapper.createProposalDocumentData(issued.version.snapshot, {
    presentationContext: 'emittedDocument',
    proposalNumber: issued.version.proposalNumber,
    versionNumber: issued.version.versionNumber,
    issuedAt: issued.version.issuedAt,
  })
  assert.equal(issuedDocumentData.presentationContext, 'emittedDocument')
  assert.deepEqual(issuedDocumentData.issuedIdentification, {
    proposalNumber: 'EQ-2026-0001',
    versionLabel: 'v1',
  })
  assert.equal(issuedDocumentData.conditions.validity, '30 dias · até 19/09/2026')
  const issuedMarkup = renderToStaticMarkup(createElement(
    documentPreview.ProposalDocumentPreview,
    {
      data: issuedDocumentData,
      themeId: issued.version.documentThemeId,
      placeDate: emittedPlaceDate,
    },
  ))
  assert.match(issuedMarkup, /EQ-2026-0001 · v1/)
  assert.match(issuedMarkup, /Local e data de emissão/)
  assert.doesNotMatch(issuedMarkup, /PRÉVIA|NÃO EMITIDA/i)

  const secondIssueCandidate = storage.completeActiveDraft({
    ...validDraft,
    clientName: 'Segundo cliente para emissão',
    eventName: 'Segundo evento para emissão',
  })
  const secondIssued = storage.issueProposal(
    secondIssueCandidate.id,
    'tecnico-litoraneo',
    () => new Date('2026-08-21T15:00:00.000Z'),
  )
  assert.equal(secondIssued.version.proposalNumber, 'EQ-2026-0002')

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
  const legacyFixedDraft = { ...validDraft, phone: historicalPhone, discount: 145 }
  delete legacyFixedDraft.discountPercentage
  delete legacyFixedDraft.eventState
  v4HistoricalState.activeDraft = {
    draft: legacyFixedDraft,
    currentStep: 0,
    savedAt: '2026-08-18T18:00:00.000Z',
    editingProposalId: null,
  }
  v4HistoricalState.formatVersion = 4
  const editableLegacyFixedProposal = v4HistoricalState.localProposals.find((proposal) => proposal.id === completeLocal.id)
  editableLegacyFixedProposal.version.total = 1305
  editableLegacyFixedProposal.version.snapshot.values = {
    baseValue: 1350,
    travelFee: 100,
    discount: 145,
    total: 1305,
    currency: 'BRL',
    provisional: true,
  }
  delete editableLegacyFixedProposal.version.snapshot.event.state
  const historicalProposal = v4HistoricalState.localProposals.find((proposal) => proposal.id === sentLocal.id)
  historicalProposal.version.snapshot.client.phone = historicalPhone
  const v4Serialized = JSON.stringify(v4HistoricalState)
  window.localStorage.clear()
  window.localStorage.setItem(storage.PROTOTYPE_STORAGE_KEY_V4, v4Serialized)
  const migratedV4 = storage.loadPrototypeState()
  const historicalState = migratedV4.state
  assert.equal(migratedV4.migratedFromV4, true)
  assert.equal(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY_V4), v4Serialized)
  assert.ok(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY))
  assert.equal(historicalState.activeDraft?.draft.phone, historicalPhone)
  assert.equal(historicalState.activeDraft?.draft.eventState, '')
  assert.equal(historicalState.activeDraft?.draft.discountPercentage, null)
  assert.deepEqual(historicalState.activeDraft?.draft.legacyFixedDiscount, {
    model: 'fixed-legacy',
    amount: 145,
    originalTotal: 1305,
    sourceFormatVersion: 4,
    requiresPercentageReview: true,
  })
  const migratedLegacyProposal = historicalState.localProposals.find((proposal) => proposal.id === completeLocal.id)
  assert.deepEqual(migratedLegacyProposal.version.snapshot.values, {
    pricingModel: 'legacy-fixed',
    baseValue: 1350,
    travelFee: 100,
    discount: 145,
    total: 1305,
    currency: 'BRL',
    provisional: true,
    sourceFormatVersion: 4,
  })
  const migratedLegacyEdit = storage.startEditingProposal(completeLocal.id)
  assert.equal(migratedLegacyEdit?.draft.eventState, '')
  assert.equal(migratedLegacyEdit?.draft.discountPercentage, null)
  assert.equal(migratedLegacyEdit?.draft.legacyFixedDiscount?.amount, 145)
  assert.ok(validation.validateStep(1, migratedLegacyEdit.draft).eventState)
  assert.ok(validation.validateStep(3, migratedLegacyEdit.draft).discountPercentage)
  assert.equal(
    historicalState.localProposals.find((proposal) => proposal.id === sentLocal.id)?.version.snapshot?.client.phone,
    historicalPhone,
  )
  assert.ok(validation.validateStep(0, historicalState.activeDraft.draft).phone)

  const v5Serialized = JSON.stringify({ ...historicalState, formatVersion: 5 })
  window.localStorage.clear()
  window.localStorage.setItem(storage.PROTOTYPE_STORAGE_KEY_V5, v5Serialized)
  const migratedV5 = storage.loadPrototypeState()
  assert.equal(migratedV5.migratedFromV5, true)
  assert.equal(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY_V5), v5Serialized)
  assert.ok(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY))
  assert.deepEqual(migratedV5.state.localProposals[0].auditEvents, [])

  window.localStorage.setItem(storage.PROTOTYPE_STORAGE_KEY, '{conteudo-invalido')
  const invalidContent = storage.loadPrototypeState()
  assert.ok(invalidContent.issue)
  assert.equal(invalidContent.state.activeDraft, null)
  assert.ok(window.localStorage.getItem(storage.PROTOTYPE_STORAGE_KEY))

  console.log('✓ catálogo INV-001 a INV-020 preservado sem linha CONTROLE')
  console.log('✓ CPF/CNPJ opcionais, mascaráveis e validados por dígitos')
  console.log('✓ telefone do piloto limitado, mascarado e validado sem aceitar +55')
  console.log('✓ telefone histórico preservado sem corte e sinalizado para correção')
  console.log('✓ textos livres do piloto normalizados em maiúsculas sem alterar e-mail, códigos ou identificadores')
  console.log('✓ nome livre de elaboração obrigatório, aparado, normalizado e salvo sem identificador fixo')
  console.log('✓ UF obrigatória usa lista central das 27 unidades e rascunhos antigos sem UF ficam pendentes')
  console.log('✓ desconto percentual calcula subtotal, valor descontado e total com arredondamento em centavos')
  console.log('✓ campos numéricos aceitam vazio durante a edição e eliminam zero inicial, inclusive na colagem')
  console.log('✓ emissor e contratante separados em fotografia completa vinculada ao tenant')
  console.log('✓ cabeçalho usa a fotografia e oculta telefone e e-mail vazios')
  console.log('✓ textos internos, prévia e documento emitido permanecem em contextos separados')
  console.log('✓ laboratório documental compara duas direções sem alterar dados ou armazenamento')
  console.log('✓ Source Sans 3 permanece como única fonte local da plataforma e da proposta')
  console.log('✓ duas direções de cor preservam os mesmos dados sem recomendação visual')
  console.log('✓ emissão só habilita após paginação estável e impressão preserva os dados emitidos')
  console.log('✓ título temporário de impressão é sanitizado e restaurado mesmo quando ocorre falha')
  console.log('✓ rascunho não imprime marca de prévia e versão emitida recebe número e data oficiais locais')
  console.log('✓ selos do detalhe possuem altura compacta, conteúdo centralizado e largura natural')
  console.log('✓ resumo repetido removido e listas completas preservadas na composição adaptativa')
  console.log('✓ cenários curto, médio e extenso resultam em uma, duas e três ou mais páginas')
  console.log('✓ paginação por altura preserva ordem, unicidade, títulos e fechamentos agrupados')
  console.log('✓ rodapé documental usa a fotografia do emissor e total dinâmico de páginas')
  console.log('✓ emissão local atribui sequência EQ-AAAA-NNNN, congela tema e registra auditoria')
  console.log('✓ Ajuda, Notificações e Perfil possuem painéis acessíveis sem dados fictícios')
  console.log('✓ data do documento em revisão permanece separada da data persistida de emissão')
  console.log('✓ documento usa somente a fotografia completa e omite conteúdo interno ou inventado')
  console.log('✓ acesso ao documento restringe dados locais completos ao tenant do piloto')
  console.log('✓ rascunho local completo editado sem duplicação ou nova versão')
  console.log('✓ edição ativa recuperada após recarga no mesmo identificador')
  console.log('✓ formatos v1 a v5 migrados para v6 sem apagar as chaves anteriores')
  console.log('✓ descontos fixos legados preservam valor e total e exigem redefinição percentual ao editar')
  console.log('✓ migração acrescenta emitente apenas a rascunhos locais completos')
  console.log('✓ nomes legados conhecidos convertidos e identificador desconhecido mantido em branco')
  console.log('✓ envio, aceite, demonstração, legado incompleto e outro tenant bloqueiam edição')
  console.log('✓ conteúdo incompatível mantido e tratado sem falha')
} finally {
  await server.close()
}
