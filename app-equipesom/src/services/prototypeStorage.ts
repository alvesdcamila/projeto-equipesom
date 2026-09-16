import { getLegacyProposalAuthorName } from '../config/proposalAuthors'
import { createIssuerSnapshot, pilotCompany } from '../config/company'
import { normalizePilotDraftFreeTexts } from '../config/pilotTextNormalization'
import { isBrazilianStateCode } from '../data/brazilianStates'
import { createInitialProposalDraft } from '../data/mockData'
import { getEquipmentById } from '../data/inventoryEquipment'
import { getServiceById } from '../data/services'
import type {
  ActiveProposalDraft,
  ClientType,
  EquipmentSelection,
  LegacyFixedDiscountCompatibility,
  ProposalAuditEvent,
  ProposalDocumentThemeId,
  ProposalDraft,
  ProposalListItem,
  ProposalIssuerSnapshot,
  ProposalSnapshot,
  ProposalStatus,
} from '../types/domain'
import { calculateDraftAmounts, isValidDiscountPercentage, roundMoney } from '../utils/proposalAmounts'

const FORMAT_VERSION = 6
type LegacyFormatVersion = 1 | 2 | 3 | 4
type StoredFormatVersion = LegacyFormatVersion | 5
export const PROTOTYPE_STORAGE_KEY_V1 = `equipesom:${pilotCompany.tenantId}:prototype:v1`
export const PROTOTYPE_STORAGE_KEY_V2 = `equipesom:${pilotCompany.tenantId}:prototype:v2`
export const PROTOTYPE_STORAGE_KEY_V3 = `equipesom:${pilotCompany.tenantId}:prototype:v3`
export const PROTOTYPE_STORAGE_KEY_V4 = `equipesom:${pilotCompany.tenantId}:prototype:v4`
export const PROTOTYPE_STORAGE_KEY_V5 = `equipesom:${pilotCompany.tenantId}:prototype:v5`
export const PROTOTYPE_STORAGE_KEY = `equipesom:${pilotCompany.tenantId}:prototype:v${FORMAT_VERSION}`

interface PrototypeState {
  formatVersion: typeof FORMAT_VERSION
  tenantId: string
  activeDraft: ActiveProposalDraft | null
  localProposals: ProposalListItem[]
}

export interface PrototypeLoadResult {
  state: PrototypeState
  issue?: string
  migratedFromV1?: boolean
  migratedFromV2?: boolean
  migratedFromV3?: boolean
  migratedFromV4?: boolean
  migratedFromV5?: boolean
}

const emptyState = (): PrototypeState => ({
  formatVersion: FORMAT_VERSION,
  tenantId: pilotCompany.tenantId,
  activeDraft: null,
  localProposals: [],
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null
const isString = (value: unknown): value is string => typeof value === 'string'
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
const isNullableFiniteNumber = (value: unknown): value is number | null =>
  value === null || isFiniteNumber(value)
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString)

const isClientType = (value: unknown): value is ClientType =>
  value === 'empresa' || value === 'pessoa' || value === 'orgao-publico'
const isProposalStatus = (value: unknown): value is ProposalStatus =>
  value === 'rascunho' || value === 'emitida' || value === 'enviada' || value === 'aceita'
const isDocumentThemeId = (value: unknown): value is ProposalDocumentThemeId =>
  value === 'tecnico-litoraneo' || value === 'verao-profissional'

const normalizeEquipmentSelections = (
  value: unknown,
  legacyCatalogIds: unknown,
): EquipmentSelection[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (!isRecord(item) || !isString(item.catalogItemId) || !isFiniteNumber(item.quantity)) return []
      return [{ catalogItemId: item.catalogItemId, quantity: item.quantity }]
    })
  }

  if (!isStringArray(legacyCatalogIds)) return []
  const serviceIds = new Set(['operacao', 'montagem', 'passagem-som'])
  return legacyCatalogIds
    .filter((id) => !serviceIds.has(id))
    .map((catalogItemId) => ({ catalogItemId, quantity: 1 }))
}

const normalizePreparedByName = (value: Record<string, unknown>): string => {
  if (isString(value.preparedByName)) return value.preparedByName.trim()
  if (isString(value.preparedByUserId)) {
    return getLegacyProposalAuthorName(value.preparedByUserId)
  }
  return ''
}

const createLegacyFixedDiscount = (
  amount: number,
  baseValue: number,
  travelFee: number,
  sourceFormatVersion: LegacyFormatVersion,
  originalTotal = roundMoney(baseValue + travelFee - amount),
): LegacyFixedDiscountCompatibility => ({
  model: 'fixed-legacy',
  amount: roundMoney(amount),
  originalTotal: roundMoney(originalTotal),
  sourceFormatVersion,
  requiresPercentageReview: true,
})

const normalizeDraft = (value: unknown, sourceFormatVersion: StoredFormatVersion | 6): ProposalDraft | null => {
  if (!isRecord(value)) return null

  const requiredStrings = [
    'clientName', 'contactName', 'phone', 'eventName', 'eventType', 'startDate',
    'endDate', 'location', 'city', 'estimatedAudience', 'paymentTerm', 'commercialNotes',
  ]
  const requiredBooleans = ['mealsProvidedByClient', 'accommodationRequired']

  if (!requiredStrings.every((field) => isString(value[field]))
    || !isNullableFiniteNumber(value.baseValue)
    || !isNullableFiniteNumber(value.travelFee)
    || !isFiniteNumber(value.validityDays)
    || !requiredBooleans.every((field) => isBoolean(value[field]))
    || !isClientType(value.clientType)) {
    return null
  }

  const legacyDiscount = isFiniteNumber(value.discount) ? value.discount : 0
  const existingLegacy = isRecord(value.legacyFixedDiscount)
    && value.legacyFixedDiscount.model === 'fixed-legacy'
    && isFiniteNumber(value.legacyFixedDiscount.amount)
    && isFiniteNumber(value.legacyFixedDiscount.originalTotal)
    && [1, 2, 3, 4].includes(Number(value.legacyFixedDiscount.sourceFormatVersion))
    ? createLegacyFixedDiscount(
      value.legacyFixedDiscount.amount,
      isFiniteNumber(value.baseValue) ? value.baseValue : 0,
      isFiniteNumber(value.travelFee) ? value.travelFee : 0,
      value.legacyFixedDiscount.sourceFormatVersion as LegacyFormatVersion,
      value.legacyFixedDiscount.originalTotal,
    )
    : undefined
  const legacyFixedDiscount = existingLegacy ?? (
    sourceFormatVersion <= 4 && legacyDiscount !== 0
      ? createLegacyFixedDiscount(
        legacyDiscount,
        isFiniteNumber(value.baseValue) ? value.baseValue : 0,
        isFiniteNumber(value.travelFee) ? value.travelFee : 0,
        sourceFormatVersion as LegacyFormatVersion,
      )
      : undefined
  )
  const discountPercentage = isNullableFiniteNumber(value.discountPercentage)
    ? value.discountPercentage
    : legacyFixedDiscount ? null : 0

  const legacyIds = isStringArray(value.catalogItemIds) ? value.catalogItemIds : []
  const serviceIds = isStringArray(value.serviceIds)
    ? value.serviceIds
    : legacyIds.filter((id) => ['operacao', 'montagem', 'passagem-som'].includes(id))

  return {
    clientName: value.clientName as string,
    clientType: value.clientType,
    clientDocument: isString(value.clientDocument) ? value.clientDocument : '',
    contactName: value.contactName as string,
    phone: value.phone as string,
    preparedByName: normalizePreparedByName(value),
    eventName: value.eventName as string,
    eventType: value.eventType as string,
    startDate: value.startDate as string,
    endDate: value.endDate as string,
    location: value.location as string,
    city: value.city as string,
    eventState: isBrazilianStateCode(value.eventState) ? value.eventState : '',
    estimatedAudience: value.estimatedAudience as string,
    equipmentItems: normalizeEquipmentSelections(value.equipmentItems, legacyIds),
    serviceIds,
    baseValue: value.baseValue as number | null,
    travelFee: value.travelFee as number | null,
    discountPercentage,
    legacyFixedDiscount,
    validityDays: value.validityDays as number,
    paymentTerm: value.paymentTerm as string,
    mealsProvidedByClient: value.mealsProvidedByClient as boolean,
    accommodationRequired: value.accommodationRequired as boolean,
    commercialNotes: value.commercialNotes as string,
  }
}

const normalizeIssuer = (value: unknown): ProposalIssuerSnapshot | undefined => {
  if (!isRecord(value)
    || value.tenantId !== pilotCompany.tenantId
    || !isString(value.brandName)
    || !isString(value.legalName)
    || !isRecord(value.document)
    || !isRecord(value.address)
    || value.document.type !== 'CNPJ' && value.document.type !== 'CPF'
    || !isString(value.document.number)
    || ![value.address.street, value.address.number, value.address.district, value.address.city, value.address.state, value.address.postalCode].every(isString)
    || value.phone !== undefined && !isString(value.phone)
    || value.email !== undefined && !isString(value.email)) {
    return undefined
  }

  return {
    tenantId: pilotCompany.tenantId,
    brandName: value.brandName,
    legalName: value.legalName,
    document: {
      type: value.document.type,
      number: value.document.number,
    },
    address: {
      street: value.address.street as string,
      number: value.address.number as string,
      district: value.address.district as string,
      city: value.address.city as string,
      state: value.address.state as string,
      postalCode: value.address.postalCode as string,
    },
    phone: isString(value.phone) && value.phone.trim() ? value.phone : undefined,
    email: isString(value.email) && value.email.trim() ? value.email : undefined,
  }
}

const normalizeSnapshot = (
  value: unknown,
  sourceFormatVersion: StoredFormatVersion | 6,
): ProposalSnapshot | undefined => {
  if (!isRecord(value)
    || !isRecord(value.client)
    || !isRecord(value.event)
    || !isRecord(value.scope)
    || !isRecord(value.values)
    || !isRecord(value.conditions)
    || !isRecord(value.preparedBy)
    || !Array.isArray(value.scope.equipment)
    || !Array.isArray(value.scope.services)) {
    return undefined
  }

  const client = value.client
  const event = value.event
  const values = value.values
  const conditions = value.conditions
  const preparedBy = value.preparedBy
  const preparedByName = isString(preparedBy.name)
    ? preparedBy.name.trim()
    : isString(preparedBy.displayName) ? preparedBy.displayName.trim() : ''
  const issuer = normalizeIssuer(value.issuer)

  if (value.issuer !== undefined && !issuer) return undefined

  const hasPercentageValues = values.pricingModel === 'percentage'
    && [
      values.baseValue,
      values.travelFee,
      values.subtotalBeforeDiscount,
      values.discountPercentage,
      values.discountAmount,
      values.total,
    ].every(isFiniteNumber)
    && isValidDiscountPercentage(values.discountPercentage)
  const hasLegacyFixedValues = [
    values.baseValue,
    values.travelFee,
    values.discount,
    values.total,
  ].every(isFiniteNumber)

  if (!isClientType(client.type)
    || ![client.name, client.document, client.contactName, client.phone].every(isString)
    || ![event.name, event.type, event.startDate, event.endDate, event.location, event.city, event.estimatedAudience].every(isString)
    || !hasPercentageValues && !hasLegacyFixedValues
    || !isFiniteNumber(conditions.validityDays)
    || ![conditions.paymentTerm, conditions.commercialNotes].every(isString)
    || ![conditions.mealsProvidedByClient, conditions.accommodationRequired].every(isBoolean)) {
    return undefined
  }

  const equipment = value.scope.equipment.flatMap((item) => {
    if (!isRecord(item)
      || ![item.catalogItemId, item.category, item.normalizedName, item.informedBrandModel, item.informedSpecification, item.dataState].every(isString)
      || !isFiniteNumber(item.quantity)) return []
    return [{
      catalogItemId: item.catalogItemId as string,
      quantity: item.quantity as number,
      category: item.category as string,
      normalizedName: item.normalizedName as string,
      informedBrandModel: item.informedBrandModel as string,
      informedSpecification: item.informedSpecification as string,
      dataState: item.dataState as string,
    }]
  })

  const services = value.scope.services.flatMap((item) => {
    if (!isRecord(item) || ![item.serviceId, item.name, item.description].every(isString)) return []
    return [{
      serviceId: item.serviceId as string,
      name: item.name as string,
      description: item.description as string,
    }]
  })

  return {
    issuer,
    client: {
      name: client.name as string,
      type: client.type,
      document: client.document as string,
      contactName: client.contactName as string,
      phone: client.phone as string,
    },
    event: {
      name: event.name as string,
      type: event.type as string,
      startDate: event.startDate as string,
      endDate: event.endDate as string,
      location: event.location as string,
      city: event.city as string,
      state: isBrazilianStateCode(event.state) ? event.state : undefined,
      estimatedAudience: event.estimatedAudience as string,
    },
    scope: { equipment, services },
    values: hasPercentageValues
      ? {
        pricingModel: 'percentage',
        baseValue: values.baseValue as number,
        travelFee: values.travelFee as number,
        subtotalBeforeDiscount: values.subtotalBeforeDiscount as number,
        discountPercentage: values.discountPercentage as number,
        discountAmount: values.discountAmount as number,
        total: values.total as number,
        currency: 'BRL',
        provisional: isBoolean(values.provisional) ? values.provisional : true,
      }
      : {
        pricingModel: 'legacy-fixed',
        baseValue: values.baseValue as number,
        travelFee: values.travelFee as number,
        discount: values.discount as number,
        total: values.total as number,
        currency: 'BRL',
        provisional: isBoolean(values.provisional) ? values.provisional : true,
        sourceFormatVersion: sourceFormatVersion <= 4 ? sourceFormatVersion as LegacyFormatVersion : 4,
      },
    conditions: {
      validityDays: conditions.validityDays as number,
      paymentTerm: conditions.paymentTerm as string,
      mealsProvidedByClient: conditions.mealsProvidedByClient as boolean,
      accommodationRequired: conditions.accommodationRequired as boolean,
      commercialNotes: conditions.commercialNotes as string,
    },
    preparedBy: { name: preparedByName },
  }
}

const normalizeProposal = (
  value: unknown,
  sourceFormatVersion: StoredFormatVersion | 6,
): ProposalListItem | null => {
  if (!isRecord(value)
    || !isRecord(value.version)
    || !isString(value.id)
    || value.tenantId !== pilotCompany.tenantId
    || !isString(value.clientId)
    || !isString(value.currentVersionId)
    || !isProposalStatus(value.status)
    || !isString(value.createdAt)
    || !isString(value.version.id)
    || !isString(value.version.proposalId)
    || value.version.proposalId !== value.id
    || !isFiniteNumber(value.version.versionNumber)
    || !isString(value.version.clientName)
    || !isString(value.version.eventName)
    || !isString(value.version.eventDate)
    || !isFiniteNumber(value.version.total)) {
    return null
  }

  const normalizedSnapshot = normalizeSnapshot(value.version.snapshot, sourceFormatVersion)
  // Decisão de Camila: somente rascunhos locais completos e ainda mutáveis recebem
  // a fotografia atual do emitente durante a migração iniciada em v4.
  const snapshot = value.status === 'rascunho' && normalizedSnapshot && !normalizedSnapshot.issuer
    ? { ...normalizedSnapshot, issuer: createIssuerSnapshot(pilotCompany) }
    : normalizedSnapshot
  const auditEvents = Array.isArray(value.auditEvents)
    ? value.auditEvents.flatMap((event): ProposalAuditEvent[] => {
      if (!isRecord(event)
        || event.action !== 'proposta_emitida'
        || ![event.id, event.occurredAt, event.actorName, event.versionId, event.proposalNumber].every(isString)
        || !isFiniteNumber(event.total)
        || !isFiniteNumber(event.discountPercentage)) return []
      return [{
        id: event.id as string,
        action: 'proposta_emitida',
        occurredAt: event.occurredAt as string,
        actorName: event.actorName as string,
        versionId: event.versionId as string,
        proposalNumber: event.proposalNumber as string,
        total: event.total as number,
        discountPercentage: event.discountPercentage as number,
      }]
    })
    : []

  return {
    id: value.id,
    tenantId: pilotCompany.tenantId,
    clientId: value.clientId,
    currentVersionId: value.currentVersionId,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: isString(value.updatedAt) ? value.updatedAt : value.createdAt,
    auditEvents,
    source: 'local',
    version: {
      id: value.version.id,
      proposalId: value.version.proposalId,
      versionNumber: value.version.versionNumber,
      clientName: value.version.clientName,
      eventName: value.version.eventName,
      eventDate: value.version.eventDate,
      total: value.version.total,
      issuedAt: isString(value.version.issuedAt) ? value.version.issuedAt : undefined,
      proposalNumber: isString(value.version.proposalNumber) ? value.version.proposalNumber : undefined,
      documentThemeId: isDocumentThemeId(value.version.documentThemeId)
        ? value.version.documentThemeId
        : undefined,
      snapshot,
    },
  }
}

const normalizeState = (
  value: unknown,
  sourceFormatVersion: StoredFormatVersion | 6,
): PrototypeState | null => {
  if (!isRecord(value)
    || value.tenantId !== pilotCompany.tenantId
    || !Array.isArray(value.localProposals)) {
    return null
  }

  let activeDraft: ActiveProposalDraft | null = null
  if (value.activeDraft !== null && value.activeDraft !== undefined) {
    if (!isRecord(value.activeDraft)
      || !isFiniteNumber(value.activeDraft.currentStep)
      || !isString(value.activeDraft.savedAt)) return null
    const draft = normalizeDraft(value.activeDraft.draft, sourceFormatVersion)
    if (!draft) return null
    activeDraft = {
      draft,
      currentStep: Math.min(5, Math.max(0, Math.trunc(value.activeDraft.currentStep))),
      savedAt: value.activeDraft.savedAt,
      editingProposalId: isString(value.activeDraft.editingProposalId)
        ? value.activeDraft.editingProposalId
        : null,
    }
  }

  return {
    formatVersion: FORMAT_VERSION,
    tenantId: pilotCompany.tenantId,
    activeDraft,
    localProposals: value.localProposals.flatMap((proposal) => {
      const normalized = normalizeProposal(proposal, sourceFormatVersion)
      return normalized ? [normalized] : []
    }),
  }
}

const getLocalStorage = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

const parseStoredState = (
  serialized: string | null,
  sourceFormatVersion: StoredFormatVersion | 6,
): PrototypeState | null => {
  if (!serialized) return null
  try {
    return normalizeState(JSON.parse(serialized) as unknown, sourceFormatVersion)
  } catch {
    return null
  }
}

const writeState = (state: PrototypeState): boolean => {
  const storage = getLocalStorage()
  if (!storage) return false
  try {
    storage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function loadPrototypeState(): PrototypeLoadResult {
  const storage = getLocalStorage()
  if (!storage) {
    return { state: emptyState(), issue: 'O armazenamento local não está disponível neste navegador.' }
  }

  const currentSerialized = storage.getItem(PROTOTYPE_STORAGE_KEY)
  if (currentSerialized) {
    const current = parseStoredState(currentSerialized, 6)
    if (current) return { state: current }
    return {
      state: emptyState(),
      issue: 'Os dados atuais são incompatíveis e foram mantidos no navegador sem serem apagados.',
    }
  }

  const legacyCandidates = [
    { key: PROTOTYPE_STORAGE_KEY_V5, version: 5 as const },
    { key: PROTOTYPE_STORAGE_KEY_V4, version: 4 as const },
    { key: PROTOTYPE_STORAGE_KEY_V3, version: 3 as const },
    { key: PROTOTYPE_STORAGE_KEY_V2, version: 2 as const },
    { key: PROTOTYPE_STORAGE_KEY_V1, version: 1 as const },
  ]

  for (const candidate of legacyCandidates) {
    const serialized = storage.getItem(candidate.key)
    if (!serialized) continue
    const migrated = parseStoredState(serialized, candidate.version)
    if (!migrated) {
      return {
        state: emptyState(),
        issue: `Os dados da versão v${candidate.version} não puderam ser migrados e foram mantidos no navegador sem serem apagados.`,
      }
    }

    const stored = writeState(migrated)
    return {
      state: migrated,
      migratedFromV1: candidate.version === 1,
      migratedFromV2: candidate.version === 2,
      migratedFromV3: candidate.version === 3,
      migratedFromV4: candidate.version === 4,
      migratedFromV5: candidate.version === 5,
      issue: stored
        ? `Os dados salvos na versão v${candidate.version} foram preservados e atualizados para este protótipo.`
        : `Os dados da versão v${candidate.version} foram recuperados, mas não foi possível gravar o formato atualizado.`,
    }
  }

  return { state: emptyState() }
}

const normalizeDraftForSave = (draft: ProposalDraft): ProposalDraft => {
  const normalized = normalizePilotDraftFreeTexts(draft)
  return {
    ...normalized,
    legacyFixedDiscount: isValidDiscountPercentage(normalized.discountPercentage)
      ? undefined
      : normalized.legacyFixedDiscount ? { ...normalized.legacyFixedDiscount } : undefined,
    equipmentItems: normalized.equipmentItems.map((item) => ({ ...item })),
    serviceIds: [...normalized.serviceIds],
  }
}

export function saveActiveDraft(
  draft: ProposalDraft,
  currentStep: number,
  editingProposalId: string | null = null,
): ActiveProposalDraft | null {
  const current = loadPrototypeState().state
  const activeDraft: ActiveProposalDraft = {
    draft: normalizeDraftForSave(draft),
    currentStep: Math.min(5, Math.max(0, currentStep)),
    savedAt: new Date().toISOString(),
    editingProposalId,
  }

  return writeState({ ...current, activeDraft }) ? activeDraft : null
}

export function clearActiveDraft(): boolean {
  const current = loadPrototypeState().state
  return writeState({ ...current, activeDraft: null })
}

const createTemporaryId = () => {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  return `local-${suffix}`
}

const cloneIssuerSnapshot = (issuer: ProposalIssuerSnapshot): ProposalIssuerSnapshot => ({
  ...issuer,
  document: { ...issuer.document },
  address: { ...issuer.address },
})

const createSnapshot = (
  draft: ProposalDraft,
  issuer = createIssuerSnapshot(pilotCompany),
): ProposalSnapshot | null => {
  const normalizedDraft = normalizeDraftForSave(draft)
  if (normalizedDraft.baseValue === null
    || normalizedDraft.travelFee === null
    || !isValidDiscountPercentage(normalizedDraft.discountPercentage)
    || !isBrazilianStateCode(normalizedDraft.eventState)) return null

  const amounts = calculateDraftAmounts(normalizedDraft)
  return {
    issuer: cloneIssuerSnapshot(issuer),
    client: {
      name: normalizedDraft.clientName,
      type: normalizedDraft.clientType,
      document: normalizedDraft.clientDocument,
      contactName: normalizedDraft.contactName,
      phone: normalizedDraft.phone.trim(),
    },
    event: {
      name: normalizedDraft.eventName,
      type: normalizedDraft.eventType,
      startDate: normalizedDraft.startDate,
      endDate: normalizedDraft.endDate,
      location: normalizedDraft.location,
      city: normalizedDraft.city,
      state: normalizedDraft.eventState,
      estimatedAudience: normalizedDraft.estimatedAudience,
    },
    scope: {
      equipment: normalizedDraft.equipmentItems.map((selection) => {
        const item = getEquipmentById(selection.catalogItemId)
        return {
          catalogItemId: selection.catalogItemId,
          quantity: selection.quantity,
          category: item?.category ?? 'Categoria não registrada',
          normalizedName: item?.normalizedName ?? selection.catalogItemId,
          informedBrandModel: item?.informedBrandModel ?? 'Não registrado',
          informedSpecification: item?.informedSpecification ?? 'Detalhes não registrados',
          dataState: item?.dataState ?? 'Não registrado',
        }
      }),
      services: normalizedDraft.serviceIds.map((serviceId) => {
        const service = getServiceById(serviceId)
        return {
          serviceId,
          name: service?.name ?? serviceId,
          description: service?.description ?? 'Detalhes não registrados',
        }
      }),
    },
    values: {
      pricingModel: 'percentage',
      baseValue: amounts.baseValue,
      travelFee: amounts.travelFee,
      subtotalBeforeDiscount: amounts.subtotalBeforeDiscount,
      discountPercentage: normalizedDraft.discountPercentage,
      discountAmount: amounts.discountAmount,
      total: amounts.total,
      currency: 'BRL',
      provisional: true,
    },
    conditions: {
      validityDays: normalizedDraft.validityDays,
      paymentTerm: normalizedDraft.paymentTerm,
      mealsProvidedByClient: normalizedDraft.mealsProvidedByClient,
      accommodationRequired: normalizedDraft.accommodationRequired,
      commercialNotes: normalizedDraft.commercialNotes,
    },
    preparedBy: { name: normalizedDraft.preparedByName },
  }
}

const createDraftFromSnapshot = (snapshot: ProposalSnapshot): ProposalDraft => {
  const values = snapshot.values
  const legacyFixedDiscount = values.pricingModel === 'percentage' || values.discount === 0
    ? undefined
    : createLegacyFixedDiscount(
      values.discount,
      values.baseValue,
      values.travelFee,
      values.sourceFormatVersion,
      values.total,
    )

  return {
    clientName: snapshot.client.name,
    clientType: snapshot.client.type,
    clientDocument: snapshot.client.document,
    contactName: snapshot.client.contactName,
    phone: snapshot.client.phone,
    preparedByName: snapshot.preparedBy.name,
    eventName: snapshot.event.name,
    eventType: snapshot.event.type,
    startDate: snapshot.event.startDate,
    endDate: snapshot.event.endDate,
    location: snapshot.event.location,
    city: snapshot.event.city,
    eventState: snapshot.event.state ?? '',
    estimatedAudience: snapshot.event.estimatedAudience,
    equipmentItems: snapshot.scope.equipment.map((item) => ({
      catalogItemId: item.catalogItemId,
      quantity: item.quantity,
    })),
    serviceIds: snapshot.scope.services.map((item) => item.serviceId),
    baseValue: values.baseValue,
    travelFee: values.travelFee,
    discountPercentage: values.pricingModel === 'percentage' ? values.discountPercentage : legacyFixedDiscount ? null : 0,
    legacyFixedDiscount,
    validityDays: snapshot.conditions.validityDays,
    paymentTerm: snapshot.conditions.paymentTerm,
    mealsProvidedByClient: snapshot.conditions.mealsProvidedByClient,
    accommodationRequired: snapshot.conditions.accommodationRequired,
    commercialNotes: snapshot.conditions.commercialNotes,
  }
}

export function isProposalEditable(proposal: ProposalListItem | undefined): boolean {
  return Boolean(proposal
    && proposal.tenantId === pilotCompany.tenantId
    && proposal.source === 'local'
    && proposal.status === 'rascunho'
    && proposal.version.snapshot)
}

export function startEditingProposal(proposalId: string): ActiveProposalDraft | null {
  const current = loadPrototypeState().state
  if (current.activeDraft?.editingProposalId === proposalId) return current.activeDraft

  const proposal = current.localProposals.find((item) =>
    item.id === proposalId && item.tenantId === pilotCompany.tenantId)
  if (!proposal || !isProposalEditable(proposal) || !proposal.version.snapshot) return null

  const activeDraft: ActiveProposalDraft = {
    draft: createDraftFromSnapshot(proposal.version.snapshot),
    currentStep: 0,
    savedAt: new Date().toISOString(),
    editingProposalId: proposal.id,
  }
  return writeState({ ...current, activeDraft }) ? activeDraft : null
}

export function completeActiveDraft(draft: ProposalDraft): ProposalListItem | null {
  if (!draft.preparedByName.trim()) return null
  const current = loadPrototypeState().state
  const proposalId = createTemporaryId()
  const versionId = `${proposalId}-v1`
  const now = new Date().toISOString()
  const snapshot = createSnapshot(draft)
  if (!snapshot) return null

  const proposal: ProposalListItem = {
    id: proposalId,
    tenantId: pilotCompany.tenantId,
    clientId: `client-${proposalId}`,
    currentVersionId: versionId,
    status: 'rascunho',
    createdAt: now,
    updatedAt: now,
    auditEvents: [],
    source: 'local',
    version: {
      id: versionId,
      proposalId,
      versionNumber: 1,
      clientName: snapshot.client.name,
      eventName: snapshot.event.name,
      eventDate: snapshot.event.startDate,
      total: snapshot.values.total,
      snapshot,
    },
  }

  const nextState: PrototypeState = {
    ...current,
    activeDraft: null,
    localProposals: [proposal, ...current.localProposals],
  }
  return writeState(nextState) ? proposal : null
}

export function updateExistingDraft(
  proposalId: string,
  draft: ProposalDraft,
): ProposalListItem | null {
  if (!draft.preparedByName.trim()) return null
  const current = loadPrototypeState().state
  const proposalIndex = current.localProposals.findIndex((item) =>
    item.id === proposalId && item.tenantId === pilotCompany.tenantId)
  if (proposalIndex < 0) return null

  const existing = current.localProposals[proposalIndex]
  if (!isProposalEditable(existing)) return null

  const snapshot = createSnapshot(
    draft,
    existing.version.snapshot?.issuer ?? createIssuerSnapshot(pilotCompany),
  )
  if (!snapshot) return null
  const updated: ProposalListItem = {
    ...existing,
    updatedAt: new Date().toISOString(),
    version: {
      ...existing.version,
      clientName: snapshot.client.name,
      eventName: snapshot.event.name,
      eventDate: snapshot.event.startDate,
      total: snapshot.values.total,
      snapshot,
    },
  }

  const localProposals = [...current.localProposals]
  localProposals[proposalIndex] = updated
  return writeState({ ...current, activeDraft: null, localProposals }) ? updated : null
}

const BRAZIL_TIME_ZONE = 'America/Sao_Paulo'

function getIssueYear(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    timeZone: BRAZIL_TIME_ZONE,
  }).format(date)
}

function createNextProposalNumber(proposals: ProposalListItem[], issuedAt: Date): string | null {
  const year = getIssueYear(issuedAt)
  const prefix = `EQ-${year}-`
  const highestSequence = proposals.reduce((highest, proposal) => {
    const number = proposal.version.proposalNumber
    if (!number?.startsWith(prefix)) return highest
    const sequence = Number(number.slice(prefix.length))
    return Number.isInteger(sequence) ? Math.max(highest, sequence) : highest
  }, 0)
  const nextSequence = highestSequence + 1
  return nextSequence <= 9999 ? `${prefix}${String(nextSequence).padStart(4, '0')}` : null
}

export function issueProposal(
  proposalId: string,
  documentThemeId: ProposalDocumentThemeId,
  clock: () => Date = () => new Date(),
): ProposalListItem | null {
  if (!isDocumentThemeId(documentThemeId)) return null
  const current = loadPrototypeState().state
  const proposalIndex = current.localProposals.findIndex((item) =>
    item.id === proposalId && item.tenantId === pilotCompany.tenantId)
  if (proposalIndex < 0) return null

  const existing = current.localProposals[proposalIndex]
  if (!isProposalEditable(existing) || !existing.version.snapshot) return null
  const issuedAtDate = clock()
  if (Number.isNaN(issuedAtDate.getTime())) return null
  const proposalNumber = createNextProposalNumber(current.localProposals, issuedAtDate)
  if (!proposalNumber) return null

  const issuedAt = issuedAtDate.toISOString()
  const snapshot = existing.version.snapshot
  const discountPercentage = snapshot.values.pricingModel === 'percentage'
    ? snapshot.values.discountPercentage
    : 0
  const issued: ProposalListItem = {
    ...existing,
    status: 'emitida',
    updatedAt: issuedAt,
    auditEvents: [
      ...existing.auditEvents,
      {
        id: `${existing.version.id}-emissao-${issuedAt}`,
        action: 'proposta_emitida',
        occurredAt: issuedAt,
        actorName: snapshot.preparedBy.name,
        versionId: existing.version.id,
        proposalNumber,
        total: snapshot.values.total,
        discountPercentage,
      },
    ],
    version: {
      ...existing.version,
      issuedAt,
      proposalNumber,
      documentThemeId,
      snapshot: {
        ...snapshot,
        values: { ...snapshot.values, provisional: false },
      },
    },
  }

  const localProposals = [...current.localProposals]
  localProposals[proposalIndex] = issued
  return writeState({ ...current, activeDraft: null, localProposals }) ? issued : null
}

export function createCleanDraft(): ProposalDraft {
  return createInitialProposalDraft()
}
