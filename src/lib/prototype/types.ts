export type PrototypeStage = 'default' | 'personalising' | 'complete'

export type HealthVariant = 'unsync' | 'syncing' | 'synced'
export type BannerVariant = 'carousel' | 'compact' | 'none'

export interface DetailField {
  label: string
  value: string
}

export interface LoanApplication {
  id: string
  product: string
  amount: string
  date: string
  note?: string
  noteTone: 'default' | 'error'
  status: string
  details: DetailField[]
  /** Set when the application was submitted from a transactions row in this session. */
  source?: ApplicationSource
}

export interface ApplicationSource {
  tabId: string
  rowId: string
  bankId: string
  submittedAt: string
  /** Company documents uploaded inside the submit sheet. */
  uploadedIds: string[]
  /** Company documents replaced during review, by document id. */
  replacedFiles: Record<string, string>
}

export interface BcaBankFeed {
  title: string
  subtitle: string
  badge: string
  details: DetailField[]
}

export interface PrototypeState {
  stage: PrototypeStage
  /** Demo shortcut: every financing document is on file, whatever the stage. */
  prefilledDocuments: boolean
  modules: {
    partners: boolean
    transactions: boolean
  }
  data: {
    balance: number
    incomingFund: number
    applications: LoanApplication[]
    bcaFeed: BcaBankFeed | null
    /** Invoice and bill ids already sent for financing in this session. */
    submittedInvoiceIds: string[]
  }
}

export type PrototypeStateOverride = {
  [K in keyof PrototypeState]?: PrototypeState[K] extends object
    ? Partial<PrototypeState[K]>
    : PrototypeState[K]
}
