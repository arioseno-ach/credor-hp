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
  lead: string
  days: string
  middle: string
  amount: string
  tail: string
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
      lead: `Your next invoice won't be paid for up to`,
      days: `${days} days`,
      middle: `. Get paid sooner here`,
      amount,
      tail: `from ${count} invoices`,
    }),
    rows: [
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
        id: 'inv-2026-0157',
        counterparty: 'PT Wijaya Karya',
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
      lead: `Your next bill is due in`,
      days: `${days} days`,
      middle: `. Pay up to`,
      amount,
      tail: `across ${count} bills and repay later.`,
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
    ],
  },
]
