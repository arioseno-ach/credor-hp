import type { PrototypeStateOverride } from './types'

export interface PrototypeScenario {
  id: string
  label: string
  description: string
  overrides: PrototypeStateOverride
}

const completeApplications = [
  {
    id: 'inv-2026-0128',
    product: 'AR Financing',
    amount: 'Rp250.000.000.000',
    date: '13 Okt',
    note: 'No Invoice Selected',
    noteTone: 'error' as const,
    status: 'In Review',
    details: [
      { label: 'Invoice', value: 'None selected' },
      { label: 'Payment Date', value: 'Still in review' },
      { label: 'Submission date', value: '13 Okt 2026' },
    ],
  },
  {
    id: 'inv-2026-0142',
    product: 'AR Financing',
    amount: 'Rp250.000.000.000',
    date: '13 Okt',
    note: 'No Invoice Selected',
    noteTone: 'error' as const,
    status: 'In Review',
    details: [
      { label: 'Invoice', value: 'None selected' },
      { label: 'Payment Date', value: 'Still in review' },
      { label: 'Submission date', value: '13 Okt 2026' },
    ],
  },
]

export const prototypeScenarios: PrototypeScenario[] = [
  {
    id: 'default',
    label: '1 · Default',
    description: 'Belum personalisasi: banner personalisasi, kartu kesehatan belum sinkron.',
    overrides: {},
  },
  {
    id: 'personalising',
    label: '2 · Personalisasi jalan',
    description: 'Personalisasi disubmit: banner kecil + alert, kartu kesehatan sinkronisasi.',
    overrides: { stage: 'personalising' },
  },
  {
    id: 'complete',
    label: '3 · Personalisasi selesai',
    description: 'Data terbuka: kartu kesehatan synced, partner muncul, ada pengajuan.',
    overrides: {
      stage: 'complete',
      modules: { partners: true, transactions: false },
      data: {
        balance: 1000000000,
        incomingFund: 150000000,
        applications: completeApplications,
        bcaFeed: {
          title: 'BCA Reconciliation',
          subtitle: 'Pickup Sabtu, 31 Okt 2026',
          badge: 'New Inquiry',
          details: [
            { label: 'Bank account', value: 'BCA · 999900009999 · Ario Seno' },
            {
              label: 'Pickup location',
              value:
                'Ki. Medhurst no 73, RT007/RW001, Tebet Barat, Tebet, Kota Adm. Jakarta Selatan, DKI Jakarta, 12810',
            },
          ],
        },
      },
    },
  },
  {
    id: 'complete-transactions',
    label: '4 · Selesai + tabel transaksi',
    description: 'Personalisasi selesai dengan modul tabel financing transaksi.',
    overrides: {
      stage: 'complete',
      modules: { partners: true, transactions: true },
      data: {
        balance: 1000000000,
        incomingFund: 150000000,
        applications: completeApplications,
        bcaFeed: {
          title: 'BCA Reconciliation',
          subtitle: 'Pickup Sabtu, 31 Okt 2026',
          badge: 'New Inquiry',
          details: [
            { label: 'Bank account', value: 'BCA · 999900009999 · Ario Seno' },
            {
              label: 'Pickup location',
              value:
                'Ki. Medhurst no 73, RT007/RW001, Tebet Barat, Tebet, Kota Adm. Jakarta Selatan, DKI Jakarta, 12810',
            },
          ],
        },
      },
    },
  },
]
