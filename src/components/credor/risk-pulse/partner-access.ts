import { credorPartners } from '@/components/credor/partners'

/** Where a partner's business risk score stands for the signed-in company. */
export type PartnerAccessStatus = 'locked' | 'pending' | 'unlocked' | 'declined'
export type PartnerAccessEvent = 'request' | 'accept' | 'decline' | 'expire'

export interface PartnerScore {
  id: string
  name: string
  initials: string
  npwp: string
  lastTransaction: string
  /** Whether the partner has an Achilles account and has set up its auth key; both are needed to consent. */
  onAchilles: boolean
  authKeyReady: boolean
  /** Business risk score on the 1 to 5 scale, shown only once access is granted. */
  score: number
  updatedOn: string
  status: PartnerAccessStatus
  requestedOn?: string
  accessUntil?: string
  /** Finance contact the request email goes to. */
  email: string
  /** Issued when a request is sent; the partner quotes it when they reply. */
  consentCode?: string
}

/** Prototype: every company's PDF report opens the same demo file. */
export const PARTNER_REPORT_URL = `${import.meta.env.BASE_URL}reports/risk-pulse-report-demo.html`

/** Days a granted access lasts before the score locks again. */
export const ACCESS_DAYS = 90

const transitions: Record<PartnerAccessStatus, Partial<Record<PartnerAccessEvent, PartnerAccessStatus>>> = {
  locked: { request: 'pending' },
  declined: { request: 'pending' },
  pending: { accept: 'unlocked', decline: 'declined' },
  unlocked: { expire: 'locked' },
}

/** Events that do not apply to the current status leave it unchanged. */
export function nextStatus(current: PartnerAccessStatus, event: PartnerAccessEvent): PartnerAccessStatus {
  return transitions[current][event] ?? current
}

export function canConsent(partner: Pick<PartnerScore, 'onAchilles' | 'authKeyReady'>): boolean {
  return partner.onAchilles && partner.authKeyReady
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export function formatAccessDate(date: Date): string {
  return dateFormat.format(date)
}

export function accessUntil(from: Date): string {
  const until = new Date(from)
  until.setDate(until.getDate() + ACCESS_DAYS)
  return formatAccessDate(until)
}

// A 16-digit NPWP that starts with 0 is a converted 15-digit one, so it reads in the familiar 15-digit form.
export function formatNpwp(npwp: string): string {
  const digits = npwp.replace(/\D/g, '')
  const legacy = digits.length === 16 && digits.startsWith('0') ? digits.slice(1) : digits.length === 15 ? digits : null
  if (legacy) return legacy.replace(/^(\d{2})(\d{3})(\d{3})(\d)(\d{3})(\d{3})$/, '$1.$2.$3.$4-$5.$6')
  return digits.length === 16 ? digits.replace(/(\d{4})(?=\d)/g, '$1 ') : npwp
}

// Demo data: the four Credor partners plus two more, spread over every state and account setup.
const extras = [
  { id: 'baja-perkasa', name: 'PT Baja Perkasa Konstruksi', initials: 'BP', lastTransaction: '2 months ago' },
  { id: 'sinar-pangan', name: 'CV Sinar Pangan Lestari', initials: 'SP', lastTransaction: '4 months ago' },
]

const setup: Record<string, Pick<PartnerScore, 'npwp' | 'onAchilles' | 'authKeyReady' | 'score' | 'updatedOn' | 'status' | 'requestedOn' | 'accessUntil' | 'email' | 'consentCode'>> = {
  'sumber-logistik': { npwp: '0213456789012000', onAchilles: true, authKeyReady: true, score: 3.9, updatedOn: '01 Nov 2026', status: 'unlocked', requestedOn: '28 Oct 2026', accessUntil: '28 Jan 2027', email: 'finance@sumberlogistik.co.id', consentCode: '39BB659995DCF373' },
  'cipta-digital': { npwp: '0318273645091000', onAchilles: true, authKeyReady: true, score: 2.4, updatedOn: '01 Nov 2026', status: 'locked', email: 'finance@ciptadigital.co.id' },
  'nusantara-teknologi': { npwp: '0745362718290000', onAchilles: true, authKeyReady: false, score: 4.4, updatedOn: '01 Oct 2026', status: 'locked', email: 'keuangan@nusantaratek.co.id' },
  'karya-utama': { npwp: '0928374651023000', onAchilles: false, authKeyReady: false, score: 3.1, updatedOn: '01 Nov 2026', status: 'locked', email: 'finance@karyautama.co.id' },
  'baja-perkasa': { npwp: '0164738291045000', onAchilles: true, authKeyReady: true, score: 1.6, updatedOn: '01 Nov 2026', status: 'declined', requestedOn: '10 Nov 2026', email: 'keuangan@bajaperkasa.co.id', consentCode: '82E0DFA84B148ADA' },
  'sinar-pangan': { npwp: '0582910374615000', onAchilles: true, authKeyReady: true, score: 3.5, updatedOn: '01 Nov 2026', status: 'locked', email: 'admin@sinarpangan.co.id' },
}

export function initialPartnerScores(): PartnerScore[] {
  return [...credorPartners, ...extras].map(({ id, name, initials, lastTransaction }) => ({
    id,
    name,
    initials,
    lastTransaction,
    ...setup[id],
  }))
}

/** What the consent sheet needs: who asks, whose score it is, and whether the owner can reply yet. */
export interface ConsentRequest {
  id: string
  requester: string
  owner: string
  onAchilles: boolean
  authKeyReady: boolean
}

/** Another company asking to see the signed-in company's score. */
export interface ReceivedRequest {
  id: string
  name: string
  initials: string
  npwp: string
  requestedOn: string
  status: 'pending' | 'accepted' | 'declined' | 'revoked'
  accessUntil?: string
  email: string
  consentCode: string
}

export function initialReceived(): ReceivedRequest[] {
  return [
    { id: 'rcv-mitra-kargo', name: 'PT Mitra Kargo Nusantara', initials: 'MK', npwp: '0738291045627000', requestedOn: '22 Nov 2026', status: 'pending', email: 'finance@mitrakargo.co.id', consentCode: 'CC397E35DB2713E1' },
    { id: 'rcv-arta-boga', name: 'PT Arta Boga Cemerlang', initials: 'AB', npwp: '0419283746510000', requestedOn: '18 Nov 2026', status: 'pending', email: 'treasury@artaboga.co.id', consentCode: '665B3A58AA8E4AD1' },
    { id: 'rcv-prima-retail', name: 'PT Prima Retail Indonesia', initials: 'PR', npwp: '0617283940152000', requestedOn: '02 Oct 2026', status: 'accepted', accessUntil: '31 Dec 2026', email: 'credit@primaretail.co.id', consentCode: '1A7F09C3D2E84B56' },
  ]
}

/** Companies registered on Achilles that are not yet in the portfolio; the NPWP check only finds these and the portfolio. */
export const achillesDirectory: Omit<PartnerScore, 'status' | 'lastTransaction'>[] = [
  { id: 'dir-samudra-energi', name: 'PT Samudra Energi Persada', initials: 'SE', npwp: '0827364519203000', onAchilles: true, authKeyReady: true, score: 3.3, updatedOn: '01 Nov 2026', email: 'finance@samudraenergi.co.id' },
  { id: 'dir-gemilang-tekstil', name: 'PT Gemilang Tekstil Abadi', initials: 'GT', npwp: '0293847561029000', onAchilles: true, authKeyReady: false, score: 2.1, updatedOn: '01 Nov 2026', email: 'admin@gemilangtekstil.co.id' },
]

/** A 16-character hex code like the ones Achilles issues for consent requests. */
export function newConsentCode(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()
}

/** Digits only; a valid NPWP has 15 or 16 of them. */
export function npwpDigits(value: string): string {
  return value.replace(/\D/g, '')
}

if (import.meta.env.DEV) {
  console.assert(nextStatus('locked', 'request') === 'pending', 'request locks to pending')
  console.assert(nextStatus('declined', 'request') === 'pending', 'a declined request can be sent again')
  console.assert(nextStatus('pending', 'accept') === 'unlocked', 'accept unlocks')
  console.assert(nextStatus('pending', 'decline') === 'declined', 'decline')
  console.assert(nextStatus('unlocked', 'expire') === 'locked', 'expiry locks again')
  console.assert(nextStatus('locked', 'accept') === 'locked', 'accept needs a pending request')
  console.assert(formatNpwp('0213456789012000') === '21.345.678.9-012.000', 'converted NPWP reads in 15-digit form')
  console.assert(formatNpwp('1234567890123456') === '1234 5678 9012 3456', 'native 16-digit NPWP is grouped')
  console.assert(initialPartnerScores().every((partner) => partner.npwp), 'every demo partner has setup data')
}
