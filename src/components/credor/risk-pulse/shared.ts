import { riskBands, scoreBandIndex } from '@/lib/risk-pulse'

/** Rows per page for every Risk Pulse list; matches the Pagination default. */
export const PAGE_SIZE = 10

/** Band colours in band order, from the same meter tokens as the Company Health card. */
export const bandStrong = [
  'var(--component-risk-score-meter-low-strong)',
  'var(--component-risk-score-meter-fair-strong)',
  'var(--component-risk-score-meter-good-strong)',
  'var(--component-risk-score-meter-very-good-strong)',
  'var(--component-risk-score-meter-excellent-strong)',
]

export const bandMuted = [
  'var(--component-risk-score-meter-low)',
  'var(--component-risk-score-meter-fair)',
  'var(--component-risk-score-meter-good)',
  'var(--component-risk-score-meter-very-good)',
  'var(--component-risk-score-meter-excellent)',
]

export function bandFor(score: number) {
  const index = scoreBandIndex(score)
  return { label: riskBands[index], strong: bandStrong[index], muted: bandMuted[index] }
}
