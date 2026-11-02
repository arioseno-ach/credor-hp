export type FinancingOptionIllustration = 'ar' | 'ap' | 'short-term'

export interface FinancingOptionPart {
  text: string
  strong?: boolean
}

export interface FinancingOption {
  id: string
  title: string
  description: FinancingOptionPart[]
  illustration: FinancingOptionIllustration
  limit: string
  rate: string
  icon: string
}

export const financingOptions: FinancingOption[] = [
  {
    id: 'ar',
    title: 'AR Invoice Financing',
    description: [
      { text: 'Get paid on your sales invoices Up to ' },
      { text: '5 Billion', strong: true },
      { text: ' with interest as low as ' },
      { text: '1%', strong: true },
      { text: ' per month.' },
    ],
    illustration: 'ar',
    limit: '5 Billion',
    rate: 'from 1% / month',
    icon: '/icons/custom/accounts-receivable.svg',
  },
  {
    id: 'ap',
    title: 'AP Invoice Financing',
    description: [
      { text: 'Pay suppliers before the due date Up to ' },
      { text: '5 Billion', strong: true },
      { text: ' with interest as low as ' },
      { text: '1%', strong: true },
      { text: ' per month.' },
    ],
    illustration: 'ap',
    limit: '5 Billion',
    rate: 'from 1% / month',
    icon: '/icons/custom/paying-supplier.svg',
  },
  {
    id: 'short-term',
    title: 'Short Term Financing',
    description: [
      { text: 'Get fast financing with minimal paperwork. Up to ' },
      { text: '10 million', strong: true },
      { text: '. Interest: ' },
      { text: '1%', strong: true },
      { text: ' per month.' },
    ],
    illustration: 'short-term',
    limit: '10 Million',
    rate: '1% / month',
    icon: '/icons/custom/free-financing-zap.svg',
  },
]
