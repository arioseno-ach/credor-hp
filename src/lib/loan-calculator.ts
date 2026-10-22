export const loanTerms = [15, 30, 45, 60, 75, 90] as const

export const loanAmountRange = {
  min: 10_000_000,
  max: 5_000_000_000,
  step: 10_000_000,
} as const

export const loanRateRange = {
  min: 1,
  max: 5,
  step: 1,
} as const

export const defaultLoanAmount = 1_000_000_000
export const defaultLoanTerm = 90
export const defaultLoanRate = 1

export interface LoanQuote {
  term: number
  rate: number
  interest: number
  total: number
  fillRatio: number
}

const roundRupiah = (value: number) => Math.round(value)

export const formatRupiah = (amount: number) => `Rp${amount.toLocaleString('id-ID')}`

export const formatNumber = (amount: number) => amount.toLocaleString('id-ID')

/** Effective monthly rate for a term: a 90 day term applies three times the monthly rate. */
export const effectiveRate = (monthlyRate: number, term: number) => (monthlyRate * term) / 30

export const interestFor = (amount: number, monthlyRate: number, term: number) =>
  roundRupiah(amount * (effectiveRate(monthlyRate, term) / 100))

export const totalFor = (amount: number, monthlyRate: number, term: number) =>
  amount + interestFor(amount, monthlyRate, term)

export function buildQuotes(amount: number, monthlyRate: number): LoanQuote[] {
  const quotes = loanTerms.map((term) => {
    const interest = interestFor(amount, monthlyRate, term)
    return {
      term,
      rate: effectiveRate(monthlyRate, term),
      interest,
      total: amount + interest,
      fillRatio: 0,
    }
  })

  const totals = quotes.map((quote) => quote.total)
  const minTotal = Math.min(...totals)
  const maxTotal = Math.max(...totals)
  const range = maxTotal - minTotal

  return quotes.map((quote) => ({
    ...quote,
    fillRatio: range > 0 ? 0.25 + 0.75 * ((quote.total - minTotal) / range) : 1,
  }))
}
