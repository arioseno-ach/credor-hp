import { initialPartnerScores, achillesDirectory } from '@/components/credor/risk-pulse/partner-access'

/** A buyer saved in the company's contacts; the NPWP links it to its RiskPulse state. */
export interface SaleBuyer {
  id: string
  name: string
  npwp: string
  nitku: string
  address: string
  email: string
  /** Checked against the tax office data, as staging shows "verified by OnlinePajak". */
  verified: boolean
}

export interface SaleLine {
  name: string
  quantity: number
  unitPrice: number
}

export type SaleStatus = 'unpaid' | 'paid' | 'overdue'

export interface SaleTransaction {
  id: string
  number: string
  buyerId: string
  issuedOn: string
  dueOn: string
  lines: SaleLine[]
  status: SaleStatus
}

const addresses = [
  'Jl. Gatot Subroto Kav. 21, Setiabudi, Jakarta Selatan, DKI Jakarta, 12930',
  'Jl. Raya Darmo No. 88, Wonokromo, Surabaya, Jawa Timur, 60241',
  'Jl. Asia Afrika No. 129, Sumur Bandung, Bandung, Jawa Barat, 40112',
  'Kawasan Industri Pulogadung Blok C, Cakung, Jakarta Timur, DKI Jakarta, 13920',
  'Jl. Ahmad Yani No. 45, Medan Petisah, Medan, Sumatera Utara, 20112',
  'Jl. Pemuda No. 150, Semarang Tengah, Semarang, Jawa Tengah, 50132',
]

// The demo buyers are the Credor partners, so a buyer's RiskPulse state matches the Partners page.
export const saleBuyers: SaleBuyer[] = initialPartnerScores().map((partner, index) => ({
  id: partner.id,
  name: partner.name,
  npwp: partner.npwp,
  nitku: `${partner.npwp}000000`,
  address: addresses[index % addresses.length],
  email: partner.email,
  verified: partner.onAchilles,
})).concat([
  // A buyer outside Achilles, so the demo also shows the invite state.
  {
    id: 'mitra-bangunan',
    name: 'CV Mitra Bangunan Jaya',
    npwp: '0731840562917000',
    nitku: '0731840562917000000000',
    address: 'Jl. Raya Bogor Km. 27, Ciracas, Jakarta Timur, DKI Jakarta, 13740',
    email: 'admin@mitrabangunan.co.id',
    verified: true,
  },
])

/** Companies a new buyer can be filled from by NPWP: registered on Achilles but not yet a buyer. */
export const directoryBuyers = achillesDirectory

export function lineTotal(line: SaleLine): number {
  return line.quantity * line.unitPrice
}

export function saleTotal(sale: Pick<SaleTransaction, 'lines'>): number {
  return sale.lines.reduce((sum, line) => sum + lineTotal(line), 0)
}

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })

export function formatRupiah(value: number): string {
  return rupiah.format(value).replace(/\s/g, '')
}

const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

/** ISO date (yyyy-mm-dd) to "25 Nov 2026". */
export function formatDay(iso: string): string {
  return day.format(new Date(`${iso}T00:00:00`))
}

export const initialSales: SaleTransaction[] = [
  { id: 's-0421', number: 'INV/2026/11/0421', buyerId: 'sumber-logistik', issuedOn: '2026-11-03', dueOn: '2026-12-03', status: 'unpaid', lines: [{ name: 'Jasa pengiriman kontainer 40 ft', quantity: 12, unitPrice: 85_000_000 }] },
  { id: 's-0418', number: 'INV/2026/11/0418', buyerId: 'cipta-digital', issuedOn: '2026-11-01', dueOn: '2026-11-15', status: 'overdue', lines: [{ name: 'Lisensi perangkat lunak ERP (tahunan)', quantity: 1, unitPrice: 320_000_000 }] },
  { id: 's-0409', number: 'INV/2026/10/0409', buyerId: 'nusantara-teknologi', issuedOn: '2026-10-21', dueOn: '2026-11-20', status: 'paid', lines: [{ name: 'Server rack 42U', quantity: 4, unitPrice: 48_500_000 }, { name: 'Instalasi dan konfigurasi', quantity: 1, unitPrice: 25_000_000 }] },
  { id: 's-0402', number: 'INV/2026/10/0402', buyerId: 'karya-utama', issuedOn: '2026-10-14', dueOn: '2026-12-13', status: 'unpaid', lines: [{ name: 'Bahan baku plastik PET (ton)', quantity: 30, unitPrice: 18_200_000 }] },
  { id: 's-0395', number: 'INV/2026/10/0395', buyerId: 'baja-perkasa', issuedOn: '2026-10-07', dueOn: '2026-11-06', status: 'overdue', lines: [{ name: 'Besi beton ulir D16 (batang)', quantity: 2_000, unitPrice: 165_000 }] },
  { id: 's-0388', number: 'INV/2026/09/0388', buyerId: 'sinar-pangan', issuedOn: '2026-09-29', dueOn: '2026-10-29', status: 'paid', lines: [{ name: 'Kemasan karton (pak)', quantity: 500, unitPrice: 240_000 }] },
]

if (import.meta.env.DEV) {
  console.assert(saleTotal({ lines: [{ name: 'a', quantity: 2, unitPrice: 1_500 }, { name: 'b', quantity: 1, unitPrice: 500 }] }) === 3_500, 'sale total adds every line')
  console.assert(initialSales.every((sale) => saleBuyers.some((buyer) => buyer.id === sale.buyerId)), 'every demo sale has a buyer')
}
