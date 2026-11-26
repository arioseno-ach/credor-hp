import { computed, readonly, ref } from 'vue'
import {
  WEBHOOK_EVENTS,
  createInitialLeads,
  createInitialLoanDetails,
  createInitialLoans,
} from './lender-data'
import type {
  LenderContract,
  LenderLead,
  LenderLoan,
  LoanPortfolioKpis,
  OfferTerms,
  RepaymentScheduleRow,
  RevenueShareBreakdown,
  WebhookEventItem,
} from './types'

export const PLATFORM_SHARE_RATE = 0.2
export const PPN_RATE = 0.11
export const PPH23_RATE = 0.02

function sanitizeNonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0
}

export function computeInterestAmount(
  approvedAmount: number,
  interestRatePa: number,
  tenorDays: number,
): number {
  const principal = sanitizeNonNegative(approvedAmount)
  const rate = sanitizeNonNegative(interestRatePa)
  const days = sanitizeNonNegative(tenorDays)
  if (principal === 0 || rate === 0 || days === 0) return 0
  return Math.round(principal * (rate / 100) * (days / 365))
}

export function computeInterestRatePa(
  approvedAmount: number,
  interestAmount: number,
  tenorDays: number,
): number {
  const principal = sanitizeNonNegative(approvedAmount)
  const amount = sanitizeNonNegative(interestAmount)
  const days = sanitizeNonNegative(tenorDays)
  if (principal === 0 || amount === 0 || days === 0) return 0
  return Number(((amount / principal) * (365 / days) * 100).toFixed(2))
}

export function computeAdminFeeAmount(approvedAmount: number, adminFeeRate: number): number {
  const principal = sanitizeNonNegative(approvedAmount)
  const rate = sanitizeNonNegative(adminFeeRate)
  if (principal === 0 || rate === 0) return 0
  return Math.round(principal * (rate / 100))
}

export function computeAdminFeeRate(approvedAmount: number, adminFeeAmount: number): number {
  const principal = sanitizeNonNegative(approvedAmount)
  const amount = sanitizeNonNegative(adminFeeAmount)
  if (principal === 0 || amount === 0) return 0
  return Number(((amount / principal) * 100).toFixed(2))
}

export function computeDisbursementAmount(approvedAmount: number, adminFeeAmount: number): number {
  const principal = sanitizeNonNegative(approvedAmount)
  const fee = sanitizeNonNegative(adminFeeAmount)
  return Math.max(0, Math.round(principal) - Math.round(fee))
}

export function computeRevenueShare(interestAmount: number): RevenueShareBreakdown {
  const grossInterest = Math.round(sanitizeNonNegative(interestAmount))
  const platformFeeBase = Math.round(grossInterest * PLATFORM_SHARE_RATE)
  const ppnAmount = Math.round(platformFeeBase * PPN_RATE)
  const pph23Amount = Math.round(platformFeeBase * PPH23_RATE)
  const totalPlatformFeeInclTax = platformFeeBase + ppnAmount - pph23Amount
  const netLenderInterest = grossInterest - totalPlatformFeeInclTax

  return {
    grossInterest,
    platformShareRate: PLATFORM_SHARE_RATE,
    platformFeeBase,
    ppnRate: PPN_RATE,
    ppnAmount,
    pph23Rate: PPH23_RATE,
    pph23Amount,
    totalPlatformFeeInclTax,
    netLenderInterest,
  }
}

function addDaysIso(startDateIso: string, offsetDays: number): string {
  const datePart = /^\d{4}-\d{2}-\d{2}/.exec(startDateIso)?.[0]
  let year: number
  let month: number
  let day: number

  if (datePart) {
    const parts = datePart.split('-').map(Number)
    year = parts[0]
    month = parts[1]
    day = parts[2]
  } else {
    const parsed = new Date(startDateIso)
    const base = Number.isNaN(parsed.getTime()) ? new Date() : parsed
    year = base.getUTCFullYear()
    month = base.getUTCMonth() + 1
    day = base.getUTCDate()
  }

  const utc = new Date(Date.UTC(year, month - 1, day + offsetDays))
  return utc.toISOString().slice(0, 10)
}

export function computeRepaymentSchedule(
  terms: OfferTerms,
  startDateIso: string,
): RepaymentScheduleRow[] {
  const tenorDays = Math.floor(sanitizeNonNegative(terms.tenorDays))
  if (tenorDays <= 0) return []

  const approvedAmount = Math.round(sanitizeNonNegative(terms.approvedAmount))
  const interestRatePa = sanitizeNonNegative(terms.interestRatePa)
  const lateFeeRatePerDay = sanitizeNonNegative(terms.lateFeeRatePerDay)
  const totalDays = tenorDays + 15
  const isAmountInterestMode = terms.interestMode === 'amount'
  const frozenTenorInterest = isAmountInterestMode
    ? approvedAmount <= 0
      ? 0
      : Math.round(sanitizeNonNegative(terms.interestAmount))
    : computeInterestAmount(approvedAmount, interestRatePa, tenorDays)

  const rows: RepaymentScheduleRow[] = []
  for (let day = 1; day <= totalDays; day += 1) {
    const isOverdue = day > tenorDays
    const interest = isOverdue
      ? frozenTenorInterest
      : isAmountInterestMode
        ? Math.round(frozenTenorInterest * (day / tenorDays))
        : computeInterestAmount(approvedAmount, interestRatePa, day)
    const lateFee = isOverdue
      ? Math.round(approvedAmount * (lateFeeRatePerDay / 100) * (day - tenorDays))
      : 0

    rows.push({
      day,
      date: addDaysIso(startDateIso, day),
      interest,
      lateFee,
      amountDue: approvedAmount + interest + lateFee,
      isDueDate: day === tenorDays,
      isPenaltyStart: day === tenorDays + 1,
      isOverdue,
    })
  }

  return rows
}

export function computeOfferTerms(current: OfferTerms, patch: Partial<OfferTerms>): OfferTerms {
  const next: OfferTerms = {
    ...current,
    ...patch,
    approvedAmount: Math.round(sanitizeNonNegative(patch.approvedAmount ?? current.approvedAmount)),
    tenorDays: Math.max(1, Math.round(sanitizeNonNegative(patch.tenorDays ?? current.tenorDays) || 1)),
    lateFeeRatePerDay: sanitizeNonNegative(patch.lateFeeRatePerDay ?? current.lateFeeRatePerDay),
  }

  const hasInterestAmountPatch = patch.interestAmount !== undefined && patch.interestRatePa === undefined
  const hasInterestRatePatch = patch.interestRatePa !== undefined && patch.interestAmount === undefined

  if (hasInterestAmountPatch) {
    next.interestAmount = Math.round(sanitizeNonNegative(next.interestAmount))
    next.interestRatePa = computeInterestRatePa(
      next.approvedAmount,
      next.interestAmount,
      next.tenorDays,
    )
  } else if (hasInterestRatePatch || next.interestMode === 'percent') {
    next.interestRatePa = Number(sanitizeNonNegative(next.interestRatePa).toFixed(2))
    next.interestAmount = computeInterestAmount(
      next.approvedAmount,
      next.interestRatePa,
      next.tenorDays,
    )
  } else {
    next.interestAmount = Math.round(sanitizeNonNegative(next.interestAmount))
    next.interestRatePa = computeInterestRatePa(
      next.approvedAmount,
      next.interestAmount,
      next.tenorDays,
    )
  }

  const hasAdminAmountPatch = patch.adminFeeAmount !== undefined && patch.adminFeeRate === undefined
  const hasAdminRatePatch = patch.adminFeeRate !== undefined && patch.adminFeeAmount === undefined

  if (hasAdminAmountPatch) {
    next.adminFeeAmount = Math.round(sanitizeNonNegative(next.adminFeeAmount))
    next.adminFeeRate = computeAdminFeeRate(next.approvedAmount, next.adminFeeAmount)
  } else if (hasAdminRatePatch || next.adminFeeMode === 'percent') {
    next.adminFeeRate = Number(sanitizeNonNegative(next.adminFeeRate).toFixed(2))
    next.adminFeeAmount = computeAdminFeeAmount(next.approvedAmount, next.adminFeeRate)
  } else {
    next.adminFeeAmount = Math.round(sanitizeNonNegative(next.adminFeeAmount))
    next.adminFeeRate = computeAdminFeeRate(next.approvedAmount, next.adminFeeAmount)
  }

  if (next.approvedAmount <= 0) {
    next.interestAmount = 0
    next.adminFeeAmount = 0
    if (next.interestMode === 'amount') {
      next.interestRatePa = 0
    }
    if (next.adminFeeMode === 'amount') {
      next.adminFeeRate = 0
    }
  }

  return next
}

const leads = ref<LenderLead[]>(createInitialLeads())
const loans = ref<LenderLoan[]>(createInitialLoans())
const loanDetailRecords = ref<Record<string, LenderLead>>(createInitialLoanDetails())
const webhookEventsState = readonly(ref<WebhookEventItem[]>(WEBHOOK_EVENTS))

const unclaimedLeads = computed(() => leads.value.filter((lead) => lead.state === 'unclaimed'))
const claimedLeads = computed(() => leads.value.filter((lead) => lead.state === 'claimed'))
const rejectedLeads = computed(() => leads.value.filter((lead) => lead.state === 'rejected'))

const loanPortfolioKpis = computed<LoanPortfolioKpis>(() => {
  const activeOrOverdue = loans.value.filter((loan) => loan.status !== 'paid')
  const totalActiveLoanValue = activeOrOverdue.reduce((sum, loan) => sum + loan.approvedAmount, 0)
  const overdueLoansCount = loans.value.filter((loan) => loan.status === 'overdue').length
  const sortedDueDates = activeOrOverdue
    .map((loan) => loan.dueDate)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

  return {
    totalActiveLoans: activeOrOverdue.length,
    totalActiveLoanValue,
    overdueLoansCount,
    nearestDueDate: sortedDueDates[0] ?? null,
  }
})

function findLead(id: string): LenderLead | undefined {
  return leads.value.find((item) => item.id === id)
}

function getDetailRecord(id: string): LenderLead | null {
  return findLead(id) ?? loanDetailRecords.value[id] ?? null
}

function claimLead(id: string): LenderLead | null {
  const lead = findLead(id)
  if (!lead || lead.state !== 'unclaimed') return null

  lead.state = 'claimed'
  lead.claimSubStatus = 'pending-offer'
  lead.claimedAt = new Date().toISOString()
  return lead
}

function rejectLead(id: string, reason: string): LenderLead | null {
  const lead = findLead(id)
  if (!lead || (lead.state !== 'unclaimed' && lead.state !== 'claimed')) return null

  lead.state = 'rejected'
  lead.rejectionReason = reason.trim() || 'Declined after underwriting review.'
  lead.rejectedAt = new Date().toISOString()
  lead.leadScore = lead.leadScore ?? 68
  return lead
}

function togglePefindo(id: string, checked: boolean): LenderLead | null {
  const lead = findLead(id)
  if (!lead || lead.state !== 'claimed') return null

  lead.pefindoChecked = checked
  lead.pefindoCheckedAt = checked ? new Date().toISOString() : undefined
  return lead
}

function updateOfferTerms(id: string, patch: Partial<OfferTerms>): LenderLead | null {
  const lead = findLead(id)
  if (!lead || lead.state !== 'claimed') return null

  lead.offerTerms = computeOfferTerms(lead.offerTerms, patch)
  return lead
}

function uploadContract(id: string, fileName: string): LenderLead | null {
  const lead = findLead(id)
  if (!lead || lead.state !== 'claimed') return null

  const cleanName = fileName.trim() || `Loan_Contract_${lead.id}.pdf`
  const nowIso = new Date().toISOString()

  lead.claimSubStatus = 'contract-uploaded'
  if (lead.contracts.length > 0) {
    lead.contracts[0] = {
      ...lead.contracts[0],
      fileName: cleanName,
      status: 'Pending Signature',
      uploadedAt: nowIso,
      signedAt: undefined,
    }
  } else {
    lead.contracts.push({
      id: `CTR-${lead.id}-1`,
      label: 'Contract 1',
      documentId: `DOC-CTR-${lead.id}-1`,
      fileName: cleanName,
      status: 'Pending Signature',
      uploadedAt: nowIso,
    })
  }

  return lead
}

function signContract(id: string, contractId: string): LenderContract | null {
  const record = getDetailRecord(id)
  if (!record) return null

  const contract = record.contracts.find((item) => item.id === contractId) ?? record.contracts[0]
  if (!contract) return null

  if (contract.status === 'Pending Signature') {
    contract.status = 'Signed'
    contract.signedAt = new Date().toISOString()
  }
  return contract
}

function requestData(id: string, note: string): LenderLead | null {
  const lead = findLead(id)
  if (!lead || lead.state !== 'claimed') return null

  lead.claimSubStatus = 'data-requested'
  lead.requestedDataNote = note.trim()
  lead.requestedDataAt = new Date().toISOString()
  return lead
}

export function useLenderPortal() {
  return {
    leads,
    loans,
    webhookEvents: webhookEventsState,
    unclaimedLeads,
    claimedLeads,
    rejectedLeads,
    loanPortfolioKpis,
    claimLead,
    rejectLead,
    togglePefindo,
    updateOfferTerms,
    uploadContract,
    signContract,
    requestData,
    getDetailRecord,
  }
}
