export interface CompanyHealthCategory {
  label: string
  min: number
  max: number
  /** Lowest illustrative monthly rate for this category, in percent. */
  rate: number
}

export const companyHealthCategories: CompanyHealthCategory[] = [
  { label: 'Kurang', min: 0, max: 20, rate: 3 },
  { label: 'Cukup', min: 20, max: 40, rate: 2.75 },
  { label: 'Baik', min: 40, max: 60, rate: 2.5 },
  { label: 'Sangat Baik', min: 60, max: 80, rate: 1.5 },
  { label: 'Istimewa', min: 80, max: 100, rate: 1 },
]

export const companyHealthAmounts = [100_000_000, 200_000_000, 500_000_000, 1_000_000_000]

export const companyHealthTerms = [30, 60, 90]

export const companyHealthCurrentRate = 3

export function getCompanyHealthCategory(score: number): CompanyHealthCategory {
  return (
    companyHealthCategories.find((category) => score >= category.min && score < category.max) ??
    companyHealthCategories[companyHealthCategories.length - 1]
  )
}

export function termInMonths(days: number): number {
  return days / 30
}

/** Interest for an annuity loan, matching the comparison shown in the design. */
export function annuityInterest(amount: number, monthlyRatePercent: number, months: number): number {
  const rate = monthlyRatePercent / 100
  if (rate <= 0) return 0

  const payment = (amount * rate) / (1 - (1 + rate) ** -months)
  return Math.round(payment * months - amount)
}
