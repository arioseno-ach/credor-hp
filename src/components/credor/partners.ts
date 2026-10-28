import type { CredorTransaction } from '@/components/credor/transactions'

export interface CredorPartner {
  id: string
  name: string
  initials: string
  /** Recency of the latest transaction, e.g. "12 days ago". */
  lastTransaction: string
  averageTransaction: string
  /** Number of transactions, used to rank the approval chance. */
  transactionCount: number
  /** Average transaction value in rupiah, used to rank the approval chance. */
  averageTransactionValue: number
  /** Open sales invoices to this partner, offered in the partner apply flow. */
  invoices: CredorTransaction[]
}

export const credorPartners: CredorPartner[] = [
  {
    id: 'sumber-logistik',
    name: 'PT Sumber Logistik Makmur Bersama',
    initials: 'SL',
    lastTransaction: '12 days ago',
    averageTransaction: 'Rp1,4 miliar',
    transactionCount: 18,
    averageTransactionValue: 1_400_000_000,
    invoices: [
      {
        id: 'inv-sl-0412',
        counterparty: 'PT Sumber Logistik Makmur Bersama',
        invoiceNumber: '#INV-2026-0412',
        dueDate: '05 Nov',
        dueOn: '2026-11-05',
        dueNote: '14 days left',
        daysLeft: 14,
        overdue: false,
        lineItems: [{ name: 'Jasa pengiriman kontainer', quantity: 1, unitPrice: 1450000000, total: 1450000000 }],
        amount: 1450000000,
      },
      {
        id: 'inv-sl-0398',
        counterparty: 'PT Sumber Logistik Makmur Bersama',
        invoiceNumber: '#INV-2026-0398',
        dueDate: '19 Oct',
        dueOn: '2026-10-19',
        dueNote: 'Overdue 3 days',
        daysLeft: -3,
        overdue: true,
        lineItems: [{ name: 'Sewa armada truk', quantity: 1, unitPrice: 620000000, total: 620000000 }],
        amount: 620000000,
      },
    ],
  },
  {
    id: 'cipta-digital',
    name: 'PT Cipta Digital Solusi Mandiri',
    initials: 'CD',
    lastTransaction: '26 days ago',
    averageTransaction: 'Rp860 juta',
    transactionCount: 11,
    averageTransactionValue: 860_000_000,
    invoices: [
      {
        id: 'inv-cd-0377',
        counterparty: 'PT Cipta Digital Solusi Mandiri',
        invoiceNumber: '#INV-2026-0377',
        dueDate: '12 Nov',
        dueOn: '2026-11-12',
        dueNote: '21 days left',
        daysLeft: 21,
        overdue: false,
        lineItems: [{ name: 'Lisensi perangkat lunak', quantity: 1, unitPrice: 860000000, total: 860000000 }],
        amount: 860000000,
      },
      {
        id: 'inv-cd-0365',
        counterparty: 'PT Cipta Digital Solusi Mandiri',
        invoiceNumber: '#INV-2026-0365',
        dueDate: '28 Nov',
        dueOn: '2026-11-28',
        dueNote: '37 days left',
        daysLeft: 37,
        overdue: false,
        lineItems: [{ name: 'Implementasi sistem', quantity: 1, unitPrice: 410000000, total: 410000000 }],
        amount: 410000000,
      },
    ],
  },
  {
    id: 'nusantara-teknologi',
    name: 'PT Nusantara Teknologi Prima Sejahtera',
    initials: 'NT',
    lastTransaction: '4 days ago',
    averageTransaction: 'Rp2,1 miliar',
    transactionCount: 26,
    averageTransactionValue: 2_100_000_000,
    invoices: [
      {
        id: 'inv-nt-0421',
        counterparty: 'PT Nusantara Teknologi Prima Sejahtera',
        invoiceNumber: '#INV-2026-0421',
        dueDate: '01 Nov',
        dueOn: '2026-11-01',
        dueNote: '10 days left',
        daysLeft: 10,
        overdue: false,
        lineItems: [{ name: 'Perangkat jaringan', quantity: 1, unitPrice: 2100000000, total: 2100000000 }],
        amount: 2100000000,
      },
      {
        id: 'inv-nt-0415',
        counterparty: 'PT Nusantara Teknologi Prima Sejahtera',
        invoiceNumber: '#INV-2026-0415',
        dueDate: '15 Nov',
        dueOn: '2026-11-15',
        dueNote: '24 days left',
        daysLeft: 24,
        overdue: false,
        lineItems: [{ name: 'Instalasi data center', quantity: 1, unitPrice: 1250000000, total: 1250000000 }],
        amount: 1250000000,
      },
      {
        id: 'inv-nt-0402',
        counterparty: 'PT Nusantara Teknologi Prima Sejahtera',
        invoiceNumber: '#INV-2026-0402',
        dueDate: '30 Nov',
        dueOn: '2026-11-30',
        dueNote: '39 days left',
        daysLeft: 39,
        overdue: false,
        lineItems: [{ name: 'Pemeliharaan tahunan', quantity: 1, unitPrice: 380000000, total: 380000000 }],
        amount: 380000000,
      },
    ],
  },
  {
    id: 'karya-utama',
    name: 'PT Karya Utama Dagang Internasional',
    initials: 'KU',
    lastTransaction: '8 days ago',
    averageTransaction: 'Rp1,1 miliar',
    transactionCount: 14,
    averageTransactionValue: 1_100_000_000,
    invoices: [
      {
        id: 'inv-ku-0389',
        counterparty: 'PT Karya Utama Dagang Internasional',
        invoiceNumber: '#INV-2026-0389',
        dueDate: '09 Nov',
        dueOn: '2026-11-09',
        dueNote: '18 days left',
        daysLeft: 18,
        overdue: false,
        lineItems: [{ name: 'Bahan baku impor', quantity: 1, unitPrice: 1100000000, total: 1100000000 }],
        amount: 1100000000,
      },
    ],
  },
]
