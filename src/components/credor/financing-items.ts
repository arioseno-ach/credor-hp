export interface CredorFinancingItem {
  id: string
  number: string
  dueDate: string
  amount: number
  muted?: boolean
}

export const credorInvoices: CredorFinancingItem[] = [
  {
    id: 'inv-2026-014',
    number: 'INV-2026-014',
    dueDate: 'Due 17 Nov 2026',
    amount: 1_000_000_000,
  },
  {
    id: 'inv-2026-017',
    number: 'INV-2026-017',
    dueDate: 'Due 2 Dec 2026',
    amount: 64_500_000,
  },
  {
    id: 'inv-2026-015',
    number: 'INV-2026-015',
    dueDate: 'Due 17 Dec 2026',
    amount: 125_000_000,
  },
  {
    id: 'inv-2026-018',
    number: 'INV-2026-018',
    dueDate: 'Due 1 Jan 2027',
    amount: 80_000_000,
    muted: true,
  },
]

export const credorPurchases: CredorFinancingItem[] = [
  {
    id: 'bill-2026-0312',
    number: 'BILL-2026-0312',
    dueDate: 'Due 12 Nov 2026',
    amount: 265_000_000,
  },
  {
    id: 'bill-2026-0308',
    number: 'BILL-2026-0308',
    dueDate: 'Due 02 Dec 2026',
    amount: 84_000_000,
  },
  {
    id: 'bill-2026-0301',
    number: 'BILL-2026-0301',
    dueDate: 'Due 19 Dec 2026',
    amount: 125_000_000,
  },
]
