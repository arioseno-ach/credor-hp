import data from './preview.json'

/**
 * Risk Pulse preview for one company on the default scoring profile, 1–5 scale.
 * Prototype data: a real staging preview with every company identifier removed,
 * shown under the prototype's verified company.
 */
export interface RiskPulseLayer {
  id: string
  name: string
  weight: number
  score: number
}

export interface RiskPulseCategory {
  id: string
  layerName: string
  name: string
  /** Weight inside its layer. */
  weight: number
  score: number | null
}

export interface RiskPulseIndicator {
  id: string
  layerName: string
  categoryName: string
  name: string
  /** Raw value as Risk Pulse returns it: numbers, booleans and labels all come as strings. */
  value: string | null
  score: number | null
  weight: number
  definition: string
  whatIsGood: string
  kind: 'numeric' | 'boolean' | 'category'
}

export interface RiskPulseReport {
  overall: number
  layers: RiskPulseLayer[]
  categories: RiskPulseCategory[]
  datapoints: RiskPulseIndicator[]
}

export const riskPulseReport = data as RiskPulseReport

export const RISK_SCORE_MIN = 1
export const RISK_SCORE_MAX = 5

export const riskBands = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] as const
export type RiskBand = (typeof riskBands)[number]

/** Scores are shown with one decimal, so bands are read from the rounded value. */
export function roundScore(score: number): number {
  return Math.round(score * 10) / 10
}

export function formatScore(score: number): string {
  return roundScore(score).toFixed(1)
}

/** Equal fifths of the 1–5 range: a whole-number indicator score lands in its own band. */
export function scoreBandIndex(score: number): number {
  const rounded = roundScore(score)
  if (rounded < 1.8) return 0
  if (rounded < 2.6) return 1
  if (rounded < 3.4) return 2
  if (rounded < 4.2) return 3
  return 4
}

export function scoreBand(score: number): RiskBand {
  return riskBands[scoreBandIndex(score)]
}

/** Position of a score on a 1–5 track, from 0 to 1. */
export function scoreRatio(score: number): number {
  const ratio = (roundScore(score) - RISK_SCORE_MIN) / (RISK_SCORE_MAX - RISK_SCORE_MIN)
  return Math.min(1, Math.max(0, ratio))
}

/** Customer-facing names for the five Risk Pulse layers. */
export const areaNames: Record<string, string> = {
  portfolio: 'Payment & tax track record',
  borrower: 'Company profile',
  'trade-network': 'Customers & suppliers',
  transaction: 'Sales & invoicing',
  'value-chain': 'Industry & market position',
}

/** Breakdown order, as set in the Risk Pulse admin (Layer and Category). */
const macroToMicro = ['portfolio', 'value-chain', 'trade-network', 'borrower', 'transaction']

/** The engine's layer name in title case, e.g. "TRADE NETWORK" becomes "Trade Network". */
export function originalAreaLabel(layerName: string): string {
  return layerName.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}

export function sortMacroToMicro<T extends { id: string }>(areas: T[]): T[] {
  const rank = (id: string) => (macroToMicro.includes(id) ? macroToMicro.indexOf(id) : macroToMicro.length)
  return [...areas].sort((a, b) => rank(a.id) - rank(b.id))
}

export interface RiskArea extends RiskPulseLayer {
  label: string
  categories: RiskPulseCategory[]
}

export function getAreas(report: RiskPulseReport = riskPulseReport): RiskArea[] {
  return report.layers.map((layer) => ({
    ...layer,
    label: areaNames[layer.id] ?? layer.name,
    categories: report.categories
      .filter((category) => category.layerName === layer.name)
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.name.localeCompare(b.name)),
  }))
}

export function areaLabelForLayerName(layerName: string, report: RiskPulseReport = riskPulseReport) {
  const layer = report.layers.find((item) => item.name === layerName)
  return layer ? (areaNames[layer.id] ?? layer.name) : layerName
}

/**
 * Fraud and plausibility checks are scored like any other category, but their indicators are not
 * listed to the company being checked.
 */
export function isInternalCheck(categoryName: string): boolean {
  return categoryName === 'Transaction plausibility and revived rules ("does this make sense")'
}

/**
 * A category's share of the overall score. The engine averages the scored categories of an
 * area, so a category's share is the layer weight times its weight over the total weight of the
 * scored categories in that layer. Areas with fewer scored categories give each one more say.
 */
export function categoryShare(category: RiskPulseCategory, report: RiskPulseReport = riskPulseReport) {
  const layerWeight = report.layers.find((layer) => layer.name === category.layerName)?.weight ?? 0
  const scoredWeight = report.categories
    .filter((item) => item.layerName === category.layerName && item.score !== null)
    .reduce((sum, item) => sum + item.weight, 0)
  return scoredWeight > 0 ? (layerWeight * category.weight) / scoredWeight : 0
}

function rankCategories(direction: 1 | -1, count: number, report: RiskPulseReport) {
  // Shares are compared to 4 decimals so weight rounding leftovers (0.142858 vs 0.142857) never decide a tie.
  const share = (category: RiskPulseCategory) => Math.round(categoryShare(category, report) * 1e4)
  // A highlight needs at least two indicators with real values, so one data point never carries it.
  const backed = (category: RiskPulseCategory) =>
    indicatorsFor(category.name, report).filter((indicator) => indicator.score !== null && indicator.value !== null)
      .length >= 2
  return report.categories
    .filter(
      (category): category is RiskPulseCategory & { score: number } =>
        category.score !== null && !isInternalCheck(category.name) && backed(category),
    )
    .sort(
      (a, b) =>
        direction * (roundScore(a.score) - roundScore(b.score)) ||
        share(b) - share(a) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, count)
}

/** Strongest scored categories; ties go to the one that counts more toward the overall score, then the name. */
export function topCategories(count = 3, report: RiskPulseReport = riskPulseReport) {
  return rankCategories(-1, count, report)
}

/** Weakest scored categories; categories without a score are never ranked. */
export function bottomCategories(count = 3, report: RiskPulseReport = riskPulseReport) {
  return rankCategories(1, count, report)
}

/** Indicators of a category: scored first, then default-scored, then missing (stable inside each group). */
export function indicatorsFor(categoryName: string, report: RiskPulseReport = riskPulseReport) {
  return report.datapoints
    .filter((indicator) => indicator.categoryName === categoryName)
    .sort((a, b) => statusOrder[indicatorStatus(a)] - statusOrder[indicatorStatus(b)])
}

/**
 * Scored indicators that back a highlight, best first: score 4 or higher for a strength, 2 or lower
 * for a weakness. When none is in range the single best one stays, so a highlighted category
 * always shows its evidence.
 */
export function evidenceFor(
  categoryName: string,
  tone: 'strength' | 'weakness',
  count = 3,
  report: RiskPulseReport = riskPulseReport,
) {
  const direction = tone === 'strength' ? -1 : 1
  const ranked = indicatorsFor(categoryName, report)
    .filter((indicator) => indicator.score !== null && indicator.value !== null)
    .sort((a, b) => direction * ((a.score ?? 0) - (b.score ?? 0)) || b.weight - a.weight)
  const inRange = ranked.filter((indicator) =>
    tone === 'strength' ? (indicator.score ?? 0) >= 4 : (indicator.score ?? 0) <= 2,
  )
  return (inRange.length ? inRange : ranked).slice(0, inRange.length ? count : 1)
}

export type IndicatorStatus = 'scored' | 'default' | 'missing'

/**
 * `missing`: no score, left out of every average.
 * `default`: no value, but the profile applies a fixed score (yes/no indicators).
 */
export function indicatorStatus(indicator: RiskPulseIndicator): IndicatorStatus {
  if (indicator.score === null) return 'missing'
  if (indicator.value === null) return 'default'
  return 'scored'
}

const statusOrder: Record<IndicatorStatus, number> = { scored: 0, default: 1, missing: 2 }

/** Unscored indicators in area order (as `report.layers` lists them), original order kept inside an area. */
export function coverage(report: RiskPulseReport = riskPulseReport) {
  const total = report.datapoints.length
  const scored = report.datapoints.filter((indicator) => indicator.score !== null).length
  return { scored, total }
}

// "continuity" is a share of the last 24 months (0.125 is 3 of 24), whose definition does not say "share".
const percentPattern = /\bshare\b|\brate\b|utilisation|\bover\b|continuity/i
const indexPattern = /index|hhi|entropy|risk mass/i
const moneyPattern = /\bvalue\b|\bsales\b|\bpurchases?\b|\bamount\b/i

/** Indonesian units and decimal comma: "Rp 2,0 miliar", "Rp 365,1 juta". "M" would read as miliar. */
function formatRupiah(amount: number): string {
  const oneDecimal = (value: number) => value.toFixed(1).replace('.', ',')
  if (amount >= 1e9) return `Rp ${oneDecimal(amount / 1e9)} miliar`
  if (amount >= 1e6) return `Rp ${oneDecimal(amount / 1e6)} juta`
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`
}

/** Short codes such as "pkp" are acronyms; all-caps words such as "ACTIVE" become sentence case. */
function formatLabel(value: string): string {
  if (value.length <= 3) return value.toUpperCase()
  const text = value === value.toUpperCase() ? value.toLowerCase() : value
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Readable value from the raw string. Units come from the indicator's own definition;
 * when the unit is unclear the number is shown as is. Category values (a province, an industry
 * code) are labels, never numbers.
 */
export function formatIndicatorValue(indicator: RiskPulseIndicator): string {
  const { value, kind, name, definition } = indicator
  if (value === null) return 'No data'
  if (kind === 'boolean') return value === 'true' ? 'Yes' : value === 'false' ? 'No' : value
  if (kind === 'category') return formatLabel(value)

  const amount = Number(value)
  if (value.trim() === '' || Number.isNaN(amount)) return formatLabel(value)

  const text = `${name} ${definition}`
  if (percentPattern.test(text) && !indexPattern.test(text) && amount >= 0 && amount <= 1) {
    return `${Math.round(amount * 1000) / 10}%`
  }
  if (moneyPattern.test(name) && amount >= 1e5) return formatRupiah(amount)
  if (/^months since/i.test(definition)) return `${Math.round(amount)} months`
  if (Number.isInteger(amount)) return amount.toLocaleString('en-US')
  return String(Math.round(amount * 100) / 100)
}

/** Short "what good looks like" hint. */
/** Short "what good looks like" hint; empty when the rule gives no direction ("Yes/No", "Depends on the value"). */
export function goodHint(indicator: RiskPulseIndicator): string {
  if (indicator.whatIsGood.startsWith('Best in the middle')) return 'Best in a middle range'
  if (indicator.whatIsGood === 'Yes/No' || indicator.whatIsGood === 'Depends on the value') return ''
  return indicator.whatIsGood
}

/**
 * One sentence from a list of data points, filled from their own names, values and hints:
 * "Items bought is 28 (best in a middle range) and Export share of sales is 0%."
 * Same input, same sentence; nothing is written by a model.
 */
export function describeDataPoints(indicators: RiskPulseIndicator[]): string {
  const parts = indicators.map((indicator) => {
    const hint = goodHint(indicator)
    return `${indicator.name} is ${formatIndicatorValue(indicator)}${hint ? ` (${hint.charAt(0).toLowerCase()}${hint.slice(1)})` : ''}`
  })
  if (parts.length === 0) return ''
  const last = parts.pop() as string
  return `${parts.length ? `${parts.join(', ')} and ` : ''}${last}.`
}

/** Verdict copy for this company, written from the numbers above. */
export const verdict = {
  headline: 'Solid foundations, held back by small scale and one dominant supplier.',
  body:
    'Your company is registered and active with DJP, your annual returns are on file, and the companies you trade with carry little risk. ' +
    'Growing your recorded sales and buying more from your other suppliers could help lift the score.',
}

export type SummaryTier = 'low' | 'mid' | 'high'

/** Poor and Fair read as low, Good as mid, Very Good and Excellent as high. */
export function summaryTier(score: number): SummaryTier {
  const band = scoreBandIndex(score)
  return band <= 1 ? 'low' : band === 2 ? 'mid' : 'high'
}

function joinNames(names: string[]): string {
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/**
 * Shown in place of the written summary when it cannot be generated. Three fixed wordings by score
 * tier, with the three weakest (or strongest) category names filled in. No model.
 */
export function verdictFallback(report: RiskPulseReport = riskPulseReport, tier: SummaryTier = summaryTier(report.overall)) {
  const names = (categories: { name: string }[]) => joinNames(categories.map((category) => category.name))
  if (tier === 'low') {
    return {
      headline: 'Your score has room to grow.',
      body: `Start with ${names(bottomCategories(3, report))}, your lowest scoring categories.`,
    }
  }
  if (tier === 'mid') {
    return {
      headline: 'Your score is in good shape.',
      body: `To lift it further, work on ${names(bottomCategories(3, report))}, your lowest scoring categories.`,
    }
  }
  return {
    headline: 'Your score is strong.',
    body: `To keep it there, keep ${names(topCategories(3, report))} steady, your highest scoring categories.`,
  }
}

/** Date of the staging preview this data comes from. */
export const riskPulseUpdatedAt = '30 Oct 2026'

export interface RiskPulseMonth {
  key: string
  label: string
  report: RiskPulseReport
}

function weightedMean<T>(items: T[], weight: (item: T) => number, score: (item: T) => number | null) {
  const scored = items.filter((item) => score(item) !== null)
  const total = scored.reduce((sum, item) => sum + weight(item), 0)
  return total ? scored.reduce((sum, item) => sum + weight(item) * (score(item) ?? 0), 0) / total : null
}

/** Category, area and overall scores from indicator scores, the way Risk Pulse rolls them up. */
export function rollUp(datapoints: RiskPulseIndicator[], base: RiskPulseReport = riskPulseReport): RiskPulseReport {
  const categories = base.categories.map((category) => ({
    ...category,
    score: weightedMean(
      datapoints.filter((indicator) => indicator.categoryName === category.name),
      (indicator) => indicator.weight,
      (indicator) => indicator.score,
    ),
  }))
  const layers = base.layers.map((layer) => ({
    ...layer,
    score:
      weightedMean(
        categories.filter((category) => category.layerName === layer.name),
        (category) => category.weight,
        (category) => category.score,
      ) ?? 0,
  }))
  const overall = weightedMean(layers, (layer) => layer.weight, (layer) => layer.score) ?? 0
  return { overall, layers, categories, datapoints }
}

function hash(text: string) {
  let value = 0
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0
  return value
}

/**
 * Monthly drift for numeric values: deterministic per indicator and month, roughly ±6% around the
 * base value, and a further step down when that month scores worse. Only decimal values move —
 * whole counts, days and months (no decimal point in the raw value) stay put, so strings that
 * quote them keep reading true, and the rules that expect a 0–1 share still get a 0–1 share.
 */
function mockNumericValue(indicator: RiskPulseIndicator, monthsBack: number, worse: boolean): string | null {
  if (indicator.kind !== 'numeric' || indicator.value === null) return null
  const text = indicator.value.trim()
  const amount = Number(text)
  if (text === '' || Number.isNaN(amount) || amount === 0 || !text.includes('.')) return null
  const noise = ((hash(`${indicator.id}:${monthsBack}`) % 13) - 6) / 100
  const stepDown = worse ? 0.88 + (hash(indicator.id) % 4) / 20 : 1
  let next = amount * (1 + noise) * stepDown
  if (amount > 0 && amount < 1) next = Math.min(next, 1)
  return String(Math.round(Math.max(0, next) * 1e4) / 1e4)
}

/**
 * Prototype history, not real data: staging has one month. Earlier months lower a deterministic share
 * of indicators by one point in mid-scoring categories outside the highlights, so the highlights,
 * their stories and the verdict copy hold for every month. Their decimal values drift a little from
 * month to month under the same rule, so the indicator data below the scores follows the month too.
 */
function mockMonth(monthsBack: number, base: RiskPulseReport = riskPulseReport): RiskPulseReport {
  const pinned = new Set([...topCategories(3, base), ...bottomCategories(3, base)].map((category) => category.name))
  const eligible = new Set(
    base.categories
      .filter((category) => category.score !== null && category.score >= 3.5 && !pinned.has(category.name))
      .map((category) => category.name),
  )
  const datapoints = base.datapoints.map((indicator) => {
    const worse =
      indicator.score !== null &&
      indicator.value !== null &&
      indicator.score >= 2 &&
      eligible.has(indicator.categoryName) &&
      hash(indicator.id) % 10 < monthsBack
    const value = (!pinned.has(indicator.categoryName) && indicator.score !== null
      ? mockNumericValue(indicator, monthsBack, worse)
      : null) ?? indicator.value
    if (!worse && value === indicator.value) return indicator
    return { ...indicator, value, score: worse && indicator.score !== null ? indicator.score - 1 : indicator.score }
  })
  return rollUp(datapoints, base)
}

const monthLabels = ['Oct 2026', 'Sep 2026', 'Aug 2026', 'Jul 2026', 'Jun 2026', 'May 2026']

/** Newest first; the latest month is the real staging preview. */
export const riskPulseMonths: RiskPulseMonth[] = monthLabels.map((label, monthsBack) => ({
  key: `2026-${String(10 - monthsBack).padStart(2, '0')}`,
  label,
  report: monthsBack === 0 ? riskPulseReport : mockMonth(monthsBack),
}))

/** Change between two scores as displayed, so 3.7 against 3.6 reads +0.1. */
export function scoreDelta(current: number, previous: number): number {
  return Math.round((roundScore(current) - roundScore(previous)) * 10) / 10
}

export function formatDelta(delta: number): string {
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`
}
