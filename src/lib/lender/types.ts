export type LenderLoanType =
  | 'AR Invoice Financing'
  | 'AP Invoice Financing'
  | 'Free Financing'

export type BusinessScale = 'Large' | 'Medium' | 'Small' | 'N/A'

export type LenderDealState = 'unclaimed' | 'claimed' | 'active' | 'rejected'

export type LenderClaimSubStatus =
  | 'pending-offer'
  | 'data-requested'
  | 'contract-uploaded'

export type LenderLoanStatus = 'active' | 'overdue' | 'paid'

export type LenderFeeMode = 'percent' | 'amount'

export type PaymentMethod = 'Lump sum' | 'Installment'

export interface LenderDocumentFile {
  id: string
  label: string
  fileName: string
  uploadedAt: string
  sizeLabel: string
}

export type LenderDocumentCategoryId =
  | 'company'
  | 'individual'
  | 'business'
  | 'financial'
  | 'post-submission'

export interface LenderDocumentCategory {
  id: LenderDocumentCategoryId
  label: string
  files: LenderDocumentFile[]
}

export interface LenderCollateralDocument {
  id: string
  type: 'e-Faktur' | 'Invoice' | 'Transaction'
  fileName: string
  format: 'PDF' | 'CSV'
}

export interface LenderCollateralInvoice {
  invoiceNumber: string
  invoiceStatus: 'Approved' | 'Pending'
  eFakturNumber: string
  eFakturStatus: 'Approved' | 'Pending'
  counterpartyName: string
  counterpartyNpwp: string
  dueDate: string
  invoiceAmount: number
  paymentStatus: 'Paid' | 'Unpaid'
  documents: LenderCollateralDocument[]
}

export interface OfferTerms {
  approvedAmount: number
  paymentMethod: PaymentMethod
  tenorDays: number
  interestMode: LenderFeeMode
  interestRatePa: number
  interestAmount: number
  adminFeeMode: LenderFeeMode
  adminFeeRate: number
  adminFeeAmount: number
  lateFeeRatePerDay: number
}

export interface RevenueShareBreakdown {
  grossInterest: number
  platformShareRate: number
  platformFeeBase: number
  ppnRate: number
  ppnAmount: number
  pph23Rate: number
  pph23Amount: number
  totalPlatformFeeInclTax: number
  netLenderInterest: number
}

export interface RepaymentScheduleRow {
  day: number
  date: string
  interest: number
  lateFee: number
  amountDue: number
  isDueDate: boolean
  isPenaltyStart: boolean
  isOverdue: boolean
}

export interface LenderContract {
  id: string
  label: string
  documentId: string
  fileName: string
  status: 'Signed' | 'Pending Signature'
  uploadedAt: string
  signedAt?: string
}

export interface LenderOverdueSummary {
  totalInterest: number
  latePenalty: number
  currentAmountDue: number
  amountDueAtMaturity: number
}

export interface LenderLead {
  id: string
  applicationNumber: string
  submittedAt: string
  submittedDisplayDate: string
  submittedDisplayTime: string
  loanType: LenderLoanType
  subType: string
  badge?: 'New' | 'Trending'
  state: LenderDealState
  claimSubStatus?: LenderClaimSubStatus
  requestedDataNote?: string
  requestedDataAt?: string

  // Borrower profile (masked in UI when state === 'unclaimed')
  companyName: string
  maskedCompanyName: string
  country: string
  industry: string
  location: string
  businessScale: BusinessScale
  npwp: string
  picName: string
  phone: string
  email: string
  annualRevenue: number
  grossProfit: number
  estimatedLoanAmount: number

  // Claim / Underwriting / Rejection metadata
  claimedAt?: string
  pefindoChecked: boolean
  pefindoCheckedAt?: string
  leadScore?: number
  rejectionReason?: string
  rejectedAt?: string

  // Active loan status metadata (populated when viewing an active/overdue/paid loan detail)
  loanStatus?: LenderLoanStatus
  lastSyncedAt?: string
  overdueSummary?: LenderOverdueSummary

  // Offer, Docs & Collateral
  offerTerms: OfferTerms
  borrowerDocCategories: LenderDocumentCategory[]
  collateral: LenderCollateralInvoice
  contracts: LenderContract[]
}

export interface LenderLoan {
  id: string
  applicationNumber: string
  submittedAt: string
  relativeAge: string
  companyName: string
  dueDate: string
  requestedAmount: number
  approvedAmount: number
  disbursementAmount: number
  loanType: LenderLoanType
  subType: string
  status: LenderLoanStatus
  lastSyncedAt: string
  overdueSummary?: LenderOverdueSummary
}

export interface LoanPortfolioKpis {
  totalActiveLoans: number
  totalActiveLoanValue: number
  overdueLoansCount: number
  nearestDueDate: string | null
}

export type WebhookEventDomain =
  | 'Application Lifecycle'
  | 'Offer & Contract'
  | 'Disbursement'
  | 'Collateral & Repayment'
  | 'Collateral Invoice & e-Faktur'

export interface WebhookEventItem {
  event: string
  domain: WebhookEventDomain
  purpose: string
}
