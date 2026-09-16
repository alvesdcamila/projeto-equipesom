import type { LegacyFixedDiscountCompatibility, ProposalDraft, ProposalValuesSnapshot } from '../types/domain'

export interface ProposalAmounts {
  baseValue: number
  travelFee: number
  subtotalBeforeDiscount: number
  discountPercentage: number | null
  discountAmount: number
  total: number
  pricingModel: 'percentage' | 'legacy-fixed' | 'pending'
}

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function isValidDiscountPercentage(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
}

function finiteOrZero(value: number | null): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function calculateProposalAmounts(input: {
  baseValue: number | null
  travelFee: number | null
  discountPercentage: number | null
  legacyFixedDiscount?: LegacyFixedDiscountCompatibility
}): ProposalAmounts {
  const baseValue = roundMoney(finiteOrZero(input.baseValue))
  const travelFee = roundMoney(finiteOrZero(input.travelFee))
  const subtotalBeforeDiscount = roundMoney(baseValue + travelFee)

  if (isValidDiscountPercentage(input.discountPercentage)) {
    const discountAmount = roundMoney(subtotalBeforeDiscount * input.discountPercentage / 100)
    return {
      baseValue,
      travelFee,
      subtotalBeforeDiscount,
      discountPercentage: input.discountPercentage,
      discountAmount,
      total: roundMoney(subtotalBeforeDiscount - discountAmount),
      pricingModel: 'percentage',
    }
  }

  if (input.legacyFixedDiscount) {
    return {
      baseValue,
      travelFee,
      subtotalBeforeDiscount,
      discountPercentage: null,
      discountAmount: input.legacyFixedDiscount.amount,
      total: input.legacyFixedDiscount.originalTotal,
      pricingModel: 'legacy-fixed',
    }
  }

  return {
    baseValue,
    travelFee,
    subtotalBeforeDiscount,
    discountPercentage: null,
    discountAmount: 0,
    total: subtotalBeforeDiscount,
    pricingModel: 'pending',
  }
}

export function calculateDraftAmounts(draft: Pick<ProposalDraft,
  'baseValue' | 'travelFee' | 'discountPercentage' | 'legacyFixedDiscount'>): ProposalAmounts {
  return calculateProposalAmounts(draft)
}

export function isPercentageValues(
  values: ProposalValuesSnapshot,
): values is Extract<ProposalValuesSnapshot, { pricingModel: 'percentage' }> {
  return values.pricingModel === 'percentage'
}
