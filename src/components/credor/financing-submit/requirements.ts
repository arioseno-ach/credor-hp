import type { PrototypeStage } from '@/lib/prototype/types'

export interface FinancingProduct {
  name: string
  /** Prefix used in application numbers, as on staging (ARIF/…, APIF/…). */
  code: string
  /** The buyer signs a payment agreement after review. AR only. */
  needsPaymentAgreement: boolean
}

export const financingProducts: Record<string, FinancingProduct> = {
  sales: { name: 'AR Invoice Financing', code: 'ARIF', needsPaymentAgreement: true },
  purchases: { name: 'AP Invoice Financing', code: 'APIF', needsPaymentAgreement: false },
}

export interface DocumentItem {
  id: string
  label: string
  optional?: boolean
  /** Mock file shown once the document is on file or uploaded. */
  fileName: string
  /** First prototype stage where this document is already on file. */
  onFileFrom: PrototypeStage
}

export interface DocumentCategory {
  id: string
  label: string
  items: DocumentItem[]
}

/** Company documents from the staging checkout. Personalisation fills the legal and identity
 *  documents first; financial statements stay with the user until the profile is complete. */
export const documentCategories: DocumentCategory[] = [
  {
    id: 'company',
    label: 'Company verification',
    items: [
      { id: 'deed-board', label: 'Latest deed of board composition', fileName: 'Akta_Susunan_Direksi_2025.pdf', onFileFrom: 'personalising' },
      { id: 'deed-establishment', label: 'Deed of establishment', fileName: 'Akta_Pendirian_PT_Harapan_Terakhir.pdf', onFileFrom: 'personalising' },
      { id: 'deed-amendment', label: 'Deed of amendment', fileName: 'Akta_Perubahan_No1_2024.pdf', optional: true, onFileFrom: 'personalising' },
      { id: 'sk-establishment', label: 'Ministry of Law decree, establishment', fileName: 'SK_Kemenkumham_Pendirian.pdf', onFileFrom: 'personalising' },
      { id: 'sk-amendment', label: 'Ministry of Law decree, amendment', fileName: 'SK_Kemenkumham_Perubahan.pdf', onFileFrom: 'personalising' },
      { id: 'npwp-company', label: 'Company NPWP', fileName: 'NPWP_Perusahaan.jpg', onFileFrom: 'default' },
    ],
  },
  {
    id: 'individual',
    label: 'Director verification',
    items: [
      { id: 'power-of-attorney', label: 'Power of attorney', fileName: 'Surat_Kuasa.pdf', optional: true, onFileFrom: 'complete' },
      { id: 'ktp', label: 'Director ID card (KTP)', fileName: 'KTP_Direktur.jpg', onFileFrom: 'personalising' },
      { id: 'selfie-ktp', label: 'Selfie with ID card', fileName: 'Selfie_KTP_Direktur.jpg', onFileFrom: 'complete' },
      { id: 'selfie', label: 'Selfie', fileName: 'Selfie_Direktur.jpg', onFileFrom: 'complete' },
      { id: 'npwp-director', label: 'Director NPWP', fileName: 'NPWP_Direktur.jpg', onFileFrom: 'personalising' },
      { id: 'kk', label: 'Family card (KK)', fileName: 'KK_Direktur.pdf', onFileFrom: 'complete' },
    ],
  },
  {
    id: 'business',
    label: 'Business verification',
    items: [
      { id: 'profile', label: 'Company profile', fileName: 'Company_Profile_2026.pdf', onFileFrom: 'complete' },
      { id: 'nib', label: 'Business ID number (NIB)', fileName: 'NIB_PT_Harapan_Terakhir.pdf', onFileFrom: 'personalising' },
      { id: 'premises', label: 'Proof of business premises', fileName: 'Sewa_Kantor_2026.pdf', onFileFrom: 'complete' },
      { id: 'master-agreement', label: 'Master agreement with buyer or supplier', fileName: 'Perjanjian_Kerjasama_Induk.pdf', onFileFrom: 'complete' },
      { id: 'site-photo', label: 'Business site photo', fileName: 'Foto_Lokasi_Usaha.jpg', onFileFrom: 'complete' },
      { id: 'logo', label: 'Company logo', fileName: 'Logo_Harapan_Terakhir.png', onFileFrom: 'complete' },
      { id: 'pse', label: 'Electronic system operator registration', fileName: 'TDPSE_Komdigi.pdf', optional: true, onFileFrom: 'complete' },
    ],
  },
  {
    id: 'financial',
    label: 'Financial verification',
    items: [
      { id: 'fs-annual', label: 'Financial statements, last 2 years', fileName: 'Laporan_Keuangan_2024_2025.pdf', optional: true, onFileFrom: 'complete' },
      { id: 'fs-quarter', label: 'Financial statements, last quarter', fileName: 'Laporan_Keuangan_Q3_2026.pdf', onFileFrom: 'complete' },
      { id: 'bank-statement', label: 'Bank statements, last 6 months', fileName: 'Rekening_Koran_Apr_Sep_2026.pdf', onFileFrom: 'complete' },
    ],
  },
]

const stageRank: Record<PrototypeStage, number> = { default: 0, personalising: 1, complete: 2 }

export const isOnFile = (item: DocumentItem, stage: PrototypeStage) =>
  stageRank[stage] >= stageRank[item.onFileFrom]

export interface BankAccount {
  id: string
  bank: string
  holder: string
  number: string
  note: string
}

export const bankAccounts: BankAccount[] = [
  {
    id: 'bca-main',
    bank: 'BCA',
    holder: 'PT Harapan Terakhir',
    number: '999900009999',
    note: 'Bank reconciliation connected',
  },
  {
    id: 'mandiri-ops',
    bank: 'Mandiri',
    holder: 'PT Harapan Terakhir',
    number: '1310013100131',
    note: 'Not connected',
  },
]

export const consentItems = [
  {
    id: 'terms',
    label: 'I agree to the Terms & Conditions and the Privacy Policy.',
  },
  {
    id: 'third-party',
    label:
      'I confirm I am authorised to share third-party personal data, and that valid consent has been or will be collected through the Consent Collection Service.',
  },
  {
    id: 'contact',
    label:
      'I authorise Achilles to contact my customers or counterparties directly, only to collect and record consent for data processing on my behalf.',
  },
] as const
