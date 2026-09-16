import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const baseUrl = process.argv[2] ?? 'http://127.0.0.1:5173'
const geometryOnly = process.argv.includes('--geometry-only')
const printTestB = process.argv.includes('--print-test-b')
const printTestC = process.argv.includes('--print-test-c')
const emulateIOSWebKit = process.argv.includes('--ios-webkit')
if (printTestB && printTestC) throw new Error('Os testes B e C são mutuamente exclusivos.')
const printTest = printTestC ? 'C' : printTestB ? 'B' : undefined
const outputDir = resolve(appRoot, 'tmp/pdfs')
// Mantém o perfil fora do workspace para o Vite não interpretar arquivos internos do Chrome como mudanças do projeto.
const profileRoot = resolve(tmpdir(), 'equipesom-chrome-profiles')
const storageKey = 'equipesom:tenant-equipesom-demo:prototype:v6'

const chromeCandidates = process.platform === 'win32'
  ? [
      process.env.CHROME_PATH,
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ]
  : process.platform === 'darwin'
    ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']

async function findChrome() {
  for (const candidate of chromeCandidates.filter(Boolean)) {
    try {
      await access(candidate, constants.X_OK)
      return candidate
    } catch {
      // Continua procurando somente nos caminhos conhecidos; nenhuma instalação é realizada.
    }
  }
  throw new Error('Chrome não encontrado nos caminhos conhecidos. Defina CHROME_PATH para executar esta verificação opcional.')
}

async function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      server.close((error) => error ? reject(error) : resolvePort(port))
    })
  })
}

async function stopChromeTree(chromeProcess) {
  if (chromeProcess.exitCode !== null || !chromeProcess.pid) return

  if (process.platform === 'win32') {
    await new Promise((resolveStop) => {
      const killer = spawn('taskkill', ['/PID', String(chromeProcess.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      })
      const timeout = setTimeout(resolveStop, 5_000)
      const finish = () => {
        clearTimeout(timeout)
        resolveStop()
      }
      killer.once('error', finish)
      killer.once('exit', finish)
    })
    return
  }

  chromeProcess.kill()
  await Promise.race([
    new Promise((resolveExit) => chromeProcess.once('exit', resolveExit)),
    new Promise((resolveWait) => setTimeout(resolveWait, 3_000)),
  ])
}

async function waitForJson(url, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return response.json()
    } catch {
      // O Chrome ainda está iniciando.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 150))
  }
  throw new Error(`Tempo excedido aguardando ${url}`)
}

class CdpClient {
  constructor(url) {
    this.nextId = 1
    this.pending = new Map()
    this.socket = new WebSocket(url)
  }

  async connect() {
    await new Promise((resolveConnection, reject) => {
      this.socket.addEventListener('open', resolveConnection, { once: true })
      this.socket.addEventListener('error', reject, { once: true })
    })
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (!message.id || !this.pending.has(message.id)) return
      const { resolveRequest, rejectRequest } = this.pending.get(message.id)
      this.pending.delete(message.id)
      if (message.error) rejectRequest(new Error(message.error.message))
      else resolveRequest(message.result)
    })
  }

  send(method, params = {}) {
    const id = this.nextId++
    return new Promise((resolveRequest, rejectRequest) => {
      this.pending.set(id, { resolveRequest, rejectRequest })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  close() {
    this.socket.close()
  }
}

function createIssuer() {
  return {
    tenantId: 'tenant-equipesom-demo',
    brandName: 'EQUIPESOM',
    legalName: '17.681.110 EDEVALDO ALVES',
    document: { type: 'CNPJ', number: '17.681.110/0001-69' },
    address: {
      street: 'SRV MANOEL DAVID DA COSTA',
      number: '38',
      district: 'TAPERA',
      city: 'FLORIANÓPOLIS',
      state: 'SC',
      postalCode: '88.049-525',
    },
  }
}

function createEquipment(count) {
  return Array.from({ length: count }, (_, index) => ({
    catalogItemId: `QA-EQ-${String(index + 1).padStart(2, '0')}`,
    quantity: index % 3 + 1,
    category: index % 2 === 0 ? 'SOM' : 'ILUMINAÇÃO',
    normalizedName: `EQUIPAMENTO DE VALIDAÇÃO ${index + 1}`,
    informedBrandModel: `MODELO QA ${index + 1}`,
    informedSpecification: 'DESCRIÇÃO TÉCNICA PRESERVADA PARA CONFERÊNCIA VISUAL DO DOCUMENTO.',
    dataState: 'DADO DE TESTE',
  }))
}

function createServices(count) {
  return Array.from({ length: count }, (_, index) => ({
    serviceId: `qa-servico-${index + 1}`,
    name: `SERVIÇO DE VALIDAÇÃO ${index + 1}`,
    description: 'ATIVIDADE DESCRITA PARA CONFERIR ORDEM, LEGIBILIDADE E PAGINAÇÃO.',
  }))
}

function createProposal({ id, label, equipmentCount, serviceCount, notes }) {
  const timestamp = '2026-08-27T12:00:00.000Z'
  const snapshot = {
    issuer: createIssuer(),
    client: {
      name: `CLIENTE CENÁRIO ${label}`,
      type: 'empresa',
      document: '04.252.011/0001-10',
      contactName: 'CONTATO DE VALIDAÇÃO',
      phone: '(48) 99999-1234',
    },
    event: {
      name: `EVENTO CENÁRIO ${label}`,
      type: 'EVENTO PRIVADO',
      startDate: '2026-09-20',
      endDate: '2026-09-21',
      location: 'PRAIA DE VALIDAÇÃO',
      city: 'FLORIANÓPOLIS',
      state: 'SC',
      estimatedAudience: '500',
    },
    scope: {
      equipment: createEquipment(equipmentCount),
      services: createServices(serviceCount),
    },
    values: {
      pricingModel: 'percentage',
      baseValue: 1350,
      travelFee: 100,
      subtotalBeforeDiscount: 1450,
      discountPercentage: 10,
      discountAmount: 145,
      total: 1305,
      currency: 'BRL',
      provisional: true,
    },
    conditions: {
      validityDays: 30,
      paymentTerm: 'ATÉ 5 DIAS ÚTEIS APÓS O EVENTO',
      mealsProvidedByClient: true,
      accommodationRequired: false,
      commercialNotes: notes,
    },
    preparedBy: { name: 'CAMILA DE ALMEIDA' },
  }

  return {
    id,
    tenantId: 'tenant-equipesom-demo',
    clientId: `client-${id}`,
    currentVersionId: `${id}-v1`,
    status: 'rascunho',
    createdAt: timestamp,
    updatedAt: timestamp,
    auditEvents: [],
    source: 'local',
    version: {
      id: `${id}-v1`,
      proposalId: id,
      versionNumber: 1,
      clientName: snapshot.client.name,
      eventName: snapshot.event.name,
      eventDate: snapshot.event.startDate,
      total: snapshot.values.total,
      snapshot,
    },
  }
}

const proposals = [
  createProposal({ id: 'qa-curta', label: 'CURTO', equipmentCount: 2, serviceCount: 1, notes: '' }),
  createProposal({ id: 'qa-media', label: 'MÉDIO', equipmentCount: 14, serviceCount: 4, notes: 'OBSERVAÇÃO DE TAMANHO MÉDIO PARA VALIDAR O FECHAMENTO COMERCIAL.' }),
  createProposal({ id: 'qa-extensa', label: 'EXTENSO', equipmentCount: 36, serviceCount: 9, notes: 'OBSERVAÇÃO EXTENSA PARA VALIDAR A CONTINUIDADE, A HIERARQUIA E O FECHAMENTO DO DOCUMENTO EM VÁRIAS FOLHAS.' }),
]

const viewports = [
  { id: 'desktop-1920', width: 1920, height: 1080, mobile: false },
  { id: 'desktop-1366', width: 1366, height: 768, mobile: false },
  { id: 'mobile-430', width: 430, height: 932, mobile: true },
  { id: 'mobile-390', width: 390, height: 844, mobile: true },
  { id: 'mobile-360', width: 360, height: 800, mobile: true },
]

const scenarios = geometryOnly
  ? [{ proposal: proposals[1], viewport: viewports[3] }]
  : [
      ...viewports.map((viewport) => ({ proposal: proposals[1], viewport })),
      { proposal: proposals[0], viewport: viewports[1] },
      { proposal: proposals[2], viewport: viewports[1] },
    ]

const prototypeState = {
  formatVersion: 6,
  tenantId: 'tenant-equipesom-demo',
  activeDraft: null,
  localProposals: proposals,
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}

async function waitFor(client, expression, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await evaluate(client, expression)) return
    await new Promise((resolveWait) => setTimeout(resolveWait, 120))
  }
  throw new Error(`Condição visual não estabilizou: ${expression}`)
}

async function waitForContinuous(client, expression, stableMs = 1_000, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs
  let stableSince = null
  while (Date.now() < deadline) {
    if (await evaluate(client, expression)) {
      stableSince ??= Date.now()
      if (Date.now() - stableSince >= stableMs) return
    } else {
      stableSince = null
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 120))
  }
  throw new Error(`Condição visual não permaneceu estável: ${expression}`)
}

await Promise.all([
  mkdir(outputDir, { recursive: true }),
  mkdir(profileRoot, { recursive: true }),
])
await fetch(baseUrl, { signal: AbortSignal.timeout(5_000) }).then((response) => {
  if (!response.ok) throw new Error(`Servidor local respondeu ${response.status}`)
})

const chromePath = await findChrome()
const debugPort = await getFreePort()
const profileDir = await mkdtemp(join(profileRoot, 'equipesom-print-qa-'))
const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--hide-scrollbars',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`,
  'about:blank',
], { stdio: 'ignore', windowsHide: true })

let browserClient
let client
try {
  const browserMetadata = await waitForJson(`http://127.0.0.1:${debugPort}/json/version`)
  browserClient = new CdpClient(browserMetadata.webSocketDebuggerUrl)
  await browserClient.connect()
  const target = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(baseUrl)}`, {
    method: 'PUT',
  }).then((response) => response.json())
  client = new CdpClient(target.webSocketDebuggerUrl)
  await client.connect()
  await client.send('Page.enable')
  await client.send('Runtime.enable')
  if (emulateIOSWebKit) {
    await client.send('Emulation.setUserAgentOverride', {
      platform: 'iPhone',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1',
    })
  }
  await client.send('Page.navigate', { url: baseUrl })
  await waitFor(client, 'document.readyState === "complete"')
  await evaluate(client, `localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(JSON.stringify(prototypeState))})`)

  const results = []
  const referenceByTheme = new Map()
  for (const { proposal, viewport } of scenarios) {
    for (const theme of ['tecnico-litoraneo', 'verao-profissional']) {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.mobile,
      })
      const url = `${baseUrl}/propostas/${proposal.id}/previa${printTest ? `?printDebug=1&printTest=${printTest}` : ''}`
      await client.send('Page.navigate', { url })
      await waitFor(client, 'document.readyState === "complete"')
      await waitFor(client, 'document.querySelector(".proposal-document")?.dataset.paginationStatus === "stable"')
      await waitFor(client, '!document.querySelector(".proposal-preview__print-button")?.disabled')

      if (theme === 'verao-profissional') {
        await evaluate(client, `(() => {
          const button = [...document.querySelectorAll('.proposal-preview__theme')]
            .find((item) => item.textContent.includes('Verão Profissional'))
          button?.click()
          return Boolean(button)
        })()`)
        await waitFor(client, 'document.querySelector(".proposal-document")?.dataset.theme === "verao-profissional"')
      }

      await waitForContinuous(client, 'document.querySelector(".proposal-document")?.dataset.paginationStatus === "stable" && !document.querySelector(".proposal-preview__print-button")?.disabled')

      const storageBefore = await evaluate(client, `localStorage.getItem(${JSON.stringify(storageKey)})`)
      const screenState = await evaluate(client, `(() => {
        const documentRoot = document.querySelector('.proposal-document')
        const realPages = [...document.querySelectorAll('.proposal-document__pages .proposal-document__page')]
        const measurementPage = document.querySelector('.proposal-document__measurement-page')
        const firstTitle = realPages[0]?.querySelector('.proposal-document__title h1')
        return {
          allPageElements: document.querySelectorAll('.proposal-document__page').length,
          buttonEnabled: !document.querySelector('.proposal-preview__print-button')?.disabled,
          printPlatform: document.querySelector('.proposal-document__viewport')?.dataset.printPlatform ?? 'default',
          printDebugMounted: Boolean(document.querySelector('.proposal-print-debug')),
          printDebugHasGeometry: document.querySelector('.proposal-print-debug pre')?.textContent.includes('allInDom') ?? false,
          measurementPageElements: document.querySelectorAll('.proposal-document__measurement .proposal-document__page').length,
          pageCount: Number(documentRoot?.dataset.pageCount ?? 0),
          printablePageElements: realPages.length,
          previewMarks: realPages.filter((page) => page.textContent.includes('PRÉVIA — NÃO EMITIDA')).length,
          overflowedPages: realPages.filter((page) => page.dataset.pageOverflow === 'true').length,
          pageGeometry: realPages.map((page) => {
            const rect = page.getBoundingClientRect()
            return { width: rect.width, height: rect.height }
          }),
          measurementGeometry: measurementPage ? (() => {
            const rect = measurementPage.getBoundingClientRect()
            return { width: rect.width, height: rect.height }
          })() : null,
          pageBlocks: realPages.map((page) => [...page.querySelectorAll('[data-pagination-block-id]')]
            .map((block) => block.dataset.paginationBlockId)),
          titleFontSize: firstTitle ? getComputedStyle(firstTitle).fontSize : '',
          title: document.title,
        }
      })()`)

      if (proposal.id === 'qa-media') {
        const referenceKey = theme
        const reference = referenceByTheme.get(referenceKey)
        if (!reference) {
          referenceByTheme.set(referenceKey, screenState)
        } else {
          const geometryMatches = screenState.pageGeometry.every((page, index) => {
            const expected = reference.pageGeometry[index]
            return expected
              && Math.abs(page.width - expected.width) < 0.5
              && Math.abs(page.height - expected.height) < 0.5
          })
          if (screenState.pageCount !== reference.pageCount
            || screenState.titleFontSize !== reference.titleFontSize
            || JSON.stringify(screenState.pageBlocks) !== JSON.stringify(reference.pageBlocks)
            || !geometryMatches) {
            throw new Error(`Documento divergente entre viewports em ${viewport.id}/${theme}: ${JSON.stringify({ reference, screenState })}`)
          }
        }
      }

      await client.send('Emulation.setEmulatedMedia', { media: 'print' })
      const printState = await evaluate(client, `(() => ({
        allPageElements: document.querySelectorAll('.proposal-document__page').length,
        geometryTargets: Object.fromEntries([
          ['viewport', '.proposal-document__viewport'],
          ['document', '.proposal-document'],
          ['pagesContainer', '.proposal-document__pages'],
        ].map(([name, selector]) => {
          const element = document.querySelector(selector)
          const rect = element?.getBoundingClientRect()
          const style = element ? getComputedStyle(element) : null
          return [name, rect && style ? {
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top,
            computedWidth: style.width,
            minWidth: style.minWidth,
            marginLeft: style.marginLeft,
            marginRight: style.marginRight,
          } : null]
        })),
        domPageOrder: [...document.querySelectorAll('.proposal-document__page')].map((page, domIndex) => {
          const style = getComputedStyle(page)
          return {
            domIndex,
            matchesLastChild: page.matches(':last-child'),
            pageNumber: page.dataset.pageNumber ?? null,
            parentClassName: page.parentElement?.className ?? null,
            parentChildCount: page.parentElement?.children.length ?? 0,
            parentChildIndex: page.parentElement ? [...page.parentElement.children].indexOf(page) : -1,
            role: page.classList.contains('proposal-document__measurement-page') ? 'measurement' : 'printable',
            breakAfter: style.breakAfter,
            pageBreakAfter: style.pageBreakAfter,
          }
        }),
        header: getComputedStyle(document.querySelector('.app-header')).display,
        navigation: getComputedStyle(document.querySelector('.mobile-nav')).display,
        workspace: getComputedStyle(document.querySelector('.proposal-preview__workspace')).display,
        paginationStatus: getComputedStyle(document.querySelector('.proposal-document__pagination-status')).display,
        printDebug: document.querySelector('.proposal-print-debug')
          ? getComputedStyle(document.querySelector('.proposal-print-debug')).display
          : 'not-mounted',
        measurement: getComputedStyle(document.querySelector('.proposal-document__measurement')).display,
        printPlatform: document.querySelector('.proposal-document__viewport')?.dataset.printPlatform ?? 'default',
        measurementPageElements: document.querySelectorAll('.proposal-document__measurement .proposal-document__page').length,
        printablePageElements: document.querySelectorAll('.proposal-document__pages > .proposal-document__page').length,
        pages: [...document.querySelectorAll('.proposal-document__pages .proposal-document__page')].map((page) => {
          const rect = page.getBoundingClientRect()
          const style = getComputedStyle(page)
          const footer = page.querySelector('.proposal-document__footer')
          const footerRect = footer?.getBoundingClientRect()
          const footerStyle = footer ? getComputedStyle(footer) : null
          const beforeStyle = getComputedStyle(page, '::before')
          const afterStyle = getComputedStyle(page, '::after')
          return {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            scrollHeight: page.scrollHeight,
            clientHeight: page.clientHeight,
            offsetHeight: page.offsetHeight,
            boxSizing: style.boxSizing,
            paddingTop: style.paddingTop,
            paddingBottom: style.paddingBottom,
            borderTopWidth: style.borderTopWidth,
            borderBottomWidth: style.borderBottomWidth,
            minHeight: style.minHeight,
            maxHeight: style.maxHeight,
            overflow: style.overflow,
            breakAfter: style.breakAfter,
            pageBreakAfter: style.pageBreakAfter,
            before: { display: beforeStyle.display, content: beforeStyle.content, height: beforeStyle.height, position: beforeStyle.position, bottom: beforeStyle.bottom },
            after: { display: afterStyle.display, content: afterStyle.content, height: afterStyle.height, position: afterStyle.position, bottom: afterStyle.bottom },
            footer: footerRect && footerStyle ? {
              top: footerRect.top,
              bottom: footerRect.bottom,
              height: footerRect.height,
              position: footerStyle.position,
              marginTop: footerStyle.marginTop,
              paddingTop: footerStyle.paddingTop,
              bottomStyle: footerStyle.bottom,
              overflowBeyondPage: footerRect.bottom - rect.bottom,
            } : null,
          }
        }),
      }))()`)
      const pdf = await client.send('Page.printToPDF', {
        displayHeaderFooter: false,
        preferCSSPageSize: true,
        printBackground: true,
      })
      const platformVariant = emulateIOSWebKit ? '-ios-webkit' : ''
      const filename = `${proposal.id}-${theme}-${viewport.id}${platformVariant}.pdf`
      const filePath = resolve(outputDir, filename)
      const pdfBuffer = Buffer.from(pdf.data, 'base64')
      const pdfPageCount = pdfBuffer.toString('latin1').match(/\/Type\s*\/Page\b/g)?.length ?? 0
      await writeFile(filePath, pdfBuffer)
      if (geometryOnly) {
        for (const [pageIndex, page] of printState.pages.entries()) {
          const screenshot = await client.send('Page.captureScreenshot', {
            captureBeyondViewport: true,
            clip: {
              x: page.left,
              y: page.top,
              width: page.width,
              height: page.height,
              scale: 1,
            },
            format: 'png',
          })
          const runName = emulateIOSWebKit
            ? 'ios-webkit'
            : printTest ? `test-${printTest.toLowerCase()}` : 'baseline'
          await writeFile(
            resolve(outputDir, `qa-screenshot-${runName}-${theme}-pagina-${pageIndex + 1}.png`),
            Buffer.from(screenshot.data, 'base64'),
          )
        }
      }
      await client.send('Emulation.setEmulatedMedia', { media: 'screen' })
      const storageAfter = await evaluate(client, `localStorage.getItem(${JSON.stringify(storageKey)})`)
      const [measurementDomPage, ...printableDomPages] = printState.domPageOrder
      const lastPrintableDomPage = printableDomPages.at(-1)
      const domOrderIsValid = measurementDomPage?.role === 'measurement'
        && measurementDomPage.matchesLastChild
        && measurementDomPage.parentChildIndex === 0
        && measurementDomPage.parentChildCount === 1
        && printableDomPages.length === screenState.pageCount
        && printableDomPages.every((page, index) => page.role === 'printable'
          && page.pageNumber === String(index + 1)
          && page.parentChildIndex === index
          && page.parentChildCount === screenState.pageCount
          && page.matchesLastChild === (index === printableDomPages.length - 1))
        && lastPrintableDomPage?.matchesLastChild
      const expectedBreaksAreValid = printState.domPageOrder.every((page) => {
        const shouldBeAuto = printTest === 'C' || page.matchesLastChild
        return page.breakAfter === (shouldBeAuto ? 'auto' : 'page')
          && page.pageBreakAfter === (shouldBeAuto ? 'auto' : 'always')
      })
      const pseudoElementsAreIsolated = printState.pages.every((page) => {
        const shouldBeHidden = printTest === 'B' && theme === 'verao-profissional'
        return (page.before.display === 'none' && page.after.display === 'none') === shouldBeHidden
      })
      const expectedPlatform = emulateIOSWebKit ? 'ios-webkit' : 'default'
      const canvasWidth = printState.geometryTargets.viewport?.width ?? 0
      const documentWidth = printState.geometryTargets.document?.width ?? 0
      const pagesContainerWidth = printState.geometryTargets.pagesContainer?.width ?? 0
      const expectedCanvasWidth = emulateIOSWebKit ? 218 * 96 / 25.4 : 209.8 * 96 / 25.4
      const platformGeometryIsValid = screenState.printPlatform === expectedPlatform
        && printState.printPlatform === expectedPlatform
        && Math.abs(canvasWidth - expectedCanvasWidth) < 0.5
        && Math.abs(documentWidth - expectedCanvasWidth) < 0.5
        && Math.abs(pagesContainerWidth - 209.8 * 96 / 25.4) < 0.5
        && printState.pages.every((page) => Math.abs(page.width - 209.8 * 96 / 25.4) < 0.5
          && Math.abs(page.height - 296.8 * 96 / 25.4) < 0.5)
        && Math.abs((screenState.measurementGeometry?.width ?? 0) - 210 * 96 / 25.4) < 0.5
        && Math.abs((screenState.measurementGeometry?.height ?? 0) - 297 * 96 / 25.4) < 0.5

      if (!screenState.buttonEnabled
        || screenState.pageCount < 1
        || screenState.printablePageElements !== screenState.pageCount
        || screenState.measurementPageElements !== 1
        || screenState.allPageElements !== screenState.pageCount + 1
        || !domOrderIsValid
        || !expectedBreaksAreValid
        || !pseudoElementsAreIsolated
        || !platformGeometryIsValid
        || screenState.printDebugMounted !== Boolean(printTest)
        || screenState.printDebugHasGeometry !== Boolean(printTest)
        || screenState.previewMarks !== 0
        || screenState.overflowedPages !== 0
        || ['header', 'navigation', 'workspace', 'paginationStatus', 'measurement']
          .some((key) => printState[key] !== 'none')
        || (printTest && printState.printDebug !== 'none')
        || pdfPageCount !== screenState.pageCount
        || storageBefore !== storageAfter) {
        throw new Error(`Falha no cenário ${proposal.id}/${theme}: ${JSON.stringify({ screenState, printState, pdfPageCount })}`)
      }

      results.push({
        proposalId: proposal.id,
        theme,
        viewport,
        pageCount: screenState.pageCount,
        pdfPageCount,
        bytes: pdfBuffer.length,
        filePath,
        pageGeometry: screenState.pageGeometry,
        measurementGeometry: screenState.measurementGeometry,
        titleFontSize: screenState.titleFontSize,
        printState,
      })
    }
  }

  const resultsName = emulateIOSWebKit
    ? 'qa-results-ios-webkit.json'
    : printTest ? `qa-results-test-${printTest.toLowerCase()}.json` : 'qa-results-baseline.json'
  const resultsPath = resolve(outputDir, resultsName)
  await writeFile(resultsPath, JSON.stringify(results, null, 2))
  console.log(`Verificação de impressão concluída: ${resultsPath}`)
} finally {
  if (browserClient) {
    try {
      await Promise.race([
        browserClient.send('Browser.close'),
        new Promise((resolveWait) => setTimeout(resolveWait, 2_000)),
      ])
    } catch {
      // O encerramento forçado abaixo continua restrito ao Chrome iniciado por esta verificação.
    }
  }
  client?.close()
  browserClient?.close()
  await stopChromeTree(chromeProcess)
  try {
    await rm(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  } catch (error) {
    console.warn(`Perfil temporário permaneceu bloqueado para remoção: ${error.message}`)
  }
}

// O Chrome pode manter handles internos no Windows mesmo depois de sua árvore ser encerrada.
// Em uma execução bem-sucedida, a validação já terminou e o processo de QA pode finalizar.
process.exit(0)
