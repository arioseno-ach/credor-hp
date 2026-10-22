export interface CredorPartner {
  id: string
  name: string
  initials: string
  /** Transaction volume and recency, e.g. "Total 18 Transaction · last 12 days ago". */
  meta: string
  averageTransaction: string
  /** Number of transactions, used to rank the approval chance. */
  transactionCount: number
  /** Average transaction value in rupiah, used to rank the approval chance. */
  averageTransactionValue: number
}

export const credorPartners: CredorPartner[] = [
  {
    id: 'aws',
    name: 'AWS',
    initials: 'AW',
    meta: 'Total 18 Transaction · last 12 days ago',
    averageTransaction: 'Rp1,4 miliar',
    transactionCount: 18,
    averageTransactionValue: 1_400_000_000,
  },
  {
    id: 'tencent',
    name: 'Tencent',
    initials: 'TC',
    meta: 'Total 11 Transaction · last 26 days ago',
    averageTransaction: 'Rp860 juta',
    transactionCount: 11,
    averageTransactionValue: 860_000_000,
  },
  {
    id: 'gojek',
    name: 'Gojek',
    initials: 'GJ',
    meta: 'Total 26 Transaction · last 4 days ago',
    averageTransaction: 'Rp2,1 miliar',
    transactionCount: 26,
    averageTransactionValue: 2_100_000_000,
  },
]
