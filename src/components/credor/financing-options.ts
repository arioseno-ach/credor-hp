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
}

export const financingOptions: FinancingOption[] = [
  {
    id: 'ar',
    title: 'AR Invoice Financing',
    description: [
      { text: 'Get paid sooner for your unpaid invoices. Up to ' },
      { text: '5 Billion', strong: true },
      { text: ' with interest as low as ' },
      { text: '1%', strong: true },
      { text: ' per month.' },
    ],
    illustration: 'ar',
  },
  {
    id: 'ap',
    title: 'AP Invoice Financing',
    description: [
      { text: 'Pay suppliers now and repay later. Up to ' },
      { text: '5 Billion', strong: true },
      { text: ' with interest as low as ' },
      { text: '1%', strong: true },
      { text: ' per month.' },
    ],
    illustration: 'ap',
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
  },
]
