export type FinancingOfferId = 'ar' | 'ap' | 'cash'
export type FinancingCardPosition = 'active' | 'near' | 'far'

export interface FinancingOffer {
  id: FinancingOfferId
  selectorLabel: string
  eyebrow: string
  avatar: string
  title: string
  amount: string
  amountDetail: string
  detail: string
  action: string
  artwork: readonly string[]
}

export const financingOffers: readonly FinancingOffer[] = [
  {
    id: 'ar',
    selectorLabel: 'AR',
    eyebrow: 'AR Financing',
    avatar: 'SL',
    title: 'PT Sinar Logistik',
    amount: 'Rp120 jt',
    amountDetail: 'unpaid invoice',
    detail: 'INV-0142 · due in 18 days',
    action: 'Get paid today',
    artwork: [
      '/images/credor/financing/ar-art.svg',
      '/images/credor/financing/ar-highlight.svg',
      '/images/credor/financing/ar-highlight-large.svg',
    ],
  },
  {
    id: 'ap',
    selectorLabel: 'AP',
    eyebrow: 'AP Financing',
    avatar: 'MK',
    title: 'PT Mitra Kemasan',
    amount: 'Rp85 jt',
    amountDetail: 'bill due',
    detail: 'Bill due in 12 days',
    action: 'Pay now, repay later',
    artwork: ['/images/credor/financing/ap-art.svg'],
  },
  {
    id: 'cash',
    selectorLabel: 'Cash',
    eyebrow: 'Short-term cash',
    avatar: '%',
    title: 'Short-term cash',
    amount: 'Rp10 jt',
    amountDetail: 'Transparent pricing',
    detail: 'Approval within 2 days',
    action: 'Get cash this week',
    artwork: [
      '/images/credor/financing/cash-art.svg',
      '/images/credor/financing/cash-highlight.svg',
      '/images/credor/financing/cash-highlight-small.svg',
    ],
  },
]
