export type CredorTransactionSort = 'longest-wait' | 'closest'

export interface CredorLineItem {
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export interface CredorTransaction {
  id: string
  counterparty: string
  invoiceNumber: string
  dueDate: string
  dueOn: string
  dueNote: string
  /** Days until the due date. Negative when the invoice is already past due. */
  daysLeft: number
  overdue: boolean
  lineItems: CredorLineItem[]
  amount: number
}

export interface CredorTransactionSubtitle {
  title: string
  count: string
  lead: string
  days: string
}

export interface CredorTransactionSubtitleContext {
  days: number
  amount: string
  count: number
}

export interface CredorTransactionTab {
  id: string
  label: string
  counterpartyLabel: string
  actionLabel: string
  readyLabel: string
  sortBy: CredorTransactionSort
  itemLabel: string
  subtitle: (context: CredorTransactionSubtitleContext) => CredorTransactionSubtitle
  rows: CredorTransaction[]
}

export const credorTransactionTabs: CredorTransactionTab[] = [
  {
    id: 'sales',
    label: 'Sales Invoices',
    counterpartyLabel: 'Buyer',
    actionLabel: 'Get Paid Now',
    readyLabel: 'invoices ready',
    sortBy: 'longest-wait',
    itemLabel: 'invoices',
    subtitle: ({ days, amount, count }) => ({
      title: `Get paid sooner on ${amount}`,
      count: `From ${count} ${count === 1 ? 'invoice' : 'invoices'}`,
      lead: `Your next invoice won't be paid for up to`,
      days: `${days} days`,
    }),
    rows: [
      {
        id: 'inv-2026-0149',
        counterparty: 'PT Pelindo Petikemas',
        invoiceNumber: '#INV-2026-0149',
        dueDate: '13 Oct',
        dueOn: '2026-10-13',
        dueNote: 'Overdue 9 days',
        daysLeft: -9,
        overdue: true,
        lineItems: [
          { name: 'Jasa bongkar muat kontainer', quantity: 120, unitPrice: 2350000, total: 282000000 },
          { name: 'Biaya penumpukan kontainer', quantity: 1, unitPrice: 38500000, total: 38500000 },
        ],
        amount: 320500000,
      },
      {
        id: 'inv-2026-0157',
        counterparty: 'PT Wijaya Karya Beton',
        invoiceNumber: '#INV-2026-0157',
        dueDate: '16 Oct',
        dueOn: '2026-10-16',
        dueNote: 'Overdue 6 days',
        daysLeft: -6,
        overdue: true,
        lineItems: [
          { name: 'Jasa instalasi perangkat', quantity: 3, unitPrice: 45000000, total: 135000000 },
          { name: 'Perangkat keras', quantity: 12, unitPrice: 15000000, total: 180000000 },
          { name: 'Dukungan teknis 12 bulan', quantity: 1, unitPrice: 60000000, total: 60000000 },
        ],
        amount: 375000000,
      },
      {
        id: 'inv-2026-0162',
        counterparty: 'PT Semen Baturaja',
        invoiceNumber: '#INV-2026-0162',
        dueDate: '25 Oct',
        dueOn: '2026-10-25',
        dueNote: '3 days left',
        daysLeft: 3,
        overdue: false,
        lineItems: [
          { name: 'Semen Portland tipe I (zak 40 kg)', quantity: 2400, unitPrice: 58500, total: 140400000 },
        ],
        amount: 140400000,
      },
      {
        id: 'inv-2026-0171',
        counterparty: 'CV Mitra Agro Lestari',
        invoiceNumber: '#INV-2026-0171',
        dueDate: '03 Nov',
        dueOn: '2026-11-03',
        dueNote: '12 days left',
        daysLeft: 12,
        overdue: false,
        lineItems: [
          { name: 'Pupuk NPK 16-16-16 (50 kg)', quantity: 600, unitPrice: 640000, total: 384000000 },
          { name: 'Ongkos kirim Jakarta-Medan', quantity: 1, unitPrice: 24000000, total: 24000000 },
        ],
        amount: 408000000,
      },
      {
        id: 'inv-2026-0121',
        counterparty: 'PT Adhi Karya',
        invoiceNumber: '#INV-2026-0121',
        dueDate: '21 Nov',
        dueOn: '2026-11-21',
        dueNote: '30 days left',
        daysLeft: 30,
        overdue: false,
        lineItems: [
          { name: 'Pekerjaan konstruksi', quantity: 1, unitPrice: 180000000, total: 180000000 },
          { name: 'Pemeliharaan berkala', quantity: 1, unitPrice: 40000000, total: 40000000 },
        ],
        amount: 220000000,
      },
      {
        id: 'inv-2026-0128',
        counterparty: 'PT Bumi Mandiri',
        invoiceNumber: '#INV-2026-0128',
        dueDate: '06 Dec',
        dueOn: '2026-12-06',
        dueNote: '45 days left',
        daysLeft: 45,
        overdue: false,
        lineItems: [
          { name: 'Raw materials', quantity: 50, unitPrice: 1500000, total: 75000000 },
          { name: 'Installation & testing', quantity: 1, unitPrice: 405000000, total: 405000000 },
        ],
        amount: 480000000,
      },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases',
    counterpartyLabel: 'Supplier',
    actionLabel: 'Pay Now',
    readyLabel: 'bills ready',
    sortBy: 'closest',
    itemLabel: 'bills',
    subtitle: ({ days, amount, count }) => ({
      title: `Pay ${amount} now, repay later`,
      count: `Across ${count} ${count === 1 ? 'bill' : 'bills'}`,
      lead: `Your next bill is due in`,
      days: `${days} days`,
    }),
    rows: [
      {
        id: 'bill-2026-0312',
        counterparty: 'PT Semen Indonesia',
        invoiceNumber: '#BILL-2026-0312',
        dueDate: '16 Oct',
        dueOn: '2026-10-16',
        dueNote: 'Overdue 6 days',
        daysLeft: -6,
        overdue: true,
        lineItems: [
          { name: 'Semen Portland 50 kg', quantity: 800, unitPrice: 275000, total: 220000000 },
          { name: 'Biaya angkut', quantity: 1, unitPrice: 45000000, total: 45000000 },
        ],
        amount: 265000000,
      },
      {
        id: 'bill-2026-0305',
        counterparty: 'PT Astra Logistik',
        invoiceNumber: '#BILL-2026-0305',
        dueDate: '24 Oct',
        dueOn: '2026-10-24',
        dueNote: '2 days left',
        daysLeft: 2,
        overdue: false,
        lineItems: [
          { name: 'Ongkos angkut AP1', quantity: 6, unitPrice: 9000000, total: 54000000 },
          { name: 'Asuransi kargo', quantity: 1, unitPrice: 30000000, total: 30000000 },
        ],
        amount: 84000000,
      },
      {
        id: 'bill-2026-0301',
        counterparty: 'PT Indosat Bisnis',
        invoiceNumber: '#BILL-2026-0301',
        dueDate: '27 Oct',
        dueOn: '2026-10-27',
        dueNote: '5 days left',
        daysLeft: 5,
        overdue: false,
        lineItems: [
          { name: 'Internet dedicated 200 Mbps', quantity: 3, unitPrice: 18500000, total: 55500000 },
          { name: 'Biaya instalasi', quantity: 1, unitPrice: 6250000, total: 6250000 },
        ],
        amount: 61750000,
      },
      {
        id: 'bill-2026-0298',
        counterparty: 'PT Link Net',
        invoiceNumber: '#BILL-2026-0298',
        dueDate: '08 Nov',
        dueOn: '2026-11-08',
        dueNote: '17 days left',
        daysLeft: 17,
        overdue: false,
        lineItems: [
          { name: 'Paket Business 20 Mbps', quantity: 12, unitPrice: 1500000, total: 18000000 },
          { name: 'Perangkat WiFi', quantity: 2, unitPrice: 7000000, total: 14000000 },
        ],
        amount: 32000000,
      },
      {
        id: 'bill-2026-0289',
        counterparty: 'CV Karya Packaging',
        invoiceNumber: '#BILL-2026-0289',
        dueDate: '15 Nov',
        dueOn: '2026-11-15',
        dueNote: '24 days left',
        daysLeft: 24,
        overdue: false,
        lineItems: [
          { name: 'Kardus corrugated 5 ply', quantity: 8000, unitPrice: 6750, total: 54000000 },
          { name: 'Label dan stiker custom', quantity: 20000, unitPrice: 450, total: 9000000 },
        ],
        amount: 63000000,
      },
      {
        id: 'bill-2026-0275',
        counterparty: 'PT Pertamina Patra',
        invoiceNumber: '#BILL-2026-0275',
        dueDate: '22 Nov',
        dueOn: '2026-11-22',
        dueNote: '31 days left',
        daysLeft: 31,
        overdue: false,
        lineItems: [
          { name: 'Solar industri B35 (liter)', quantity: 25000, unitPrice: 12350, total: 308750000 },
        ],
        amount: 308750000,
      },
    ],
  },
]
