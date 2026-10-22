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
}

export interface BcaBankFeed {
  title: string
  subtitle: string
  badge: string
  details: DetailField[]
}

export interface PrototypeState {
  stage: PrototypeStage
  modules: {
    partners: boolean
    transactions: boolean
  }
  data: {
    balance: number
    incomingFund: number
    applications: LoanApplication[]
    bcaFeed: BcaBankFeed | null
  }
}

export type PrototypeStateOverride = {
  [K in keyof PrototypeState]?: PrototypeState[K] extends object
    ? Partial<PrototypeState[K]>
    : PrototypeState[K]
}
