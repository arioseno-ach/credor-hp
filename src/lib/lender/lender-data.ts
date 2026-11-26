import { formatNumber, formatRupiah } from '@/lib/loan-calculator'
import type {
  BusinessScale,
  LenderCollateralInvoice,
  LenderContract,
  LenderDocumentCategory,
  LenderLead,
  LenderLoan,
  LenderLoanStatus,
  LenderLoanType,
  LenderOverdueSummary,
  OfferTerms,
  PaymentMethod,
  WebhookEventItem,
} from './types'

export { formatNumber, formatRupiah }

const lenderDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
})

const lenderDateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Jakarta',
})

/** Formats an ISO date or timestamp into "25 Nov 2026". */
export function formatLenderDate(iso: string): string {
  if (!iso) return '-'
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00+07:00` : iso
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) return iso
  return lenderDateFormatter.format(parsed)
}

/** Formats an ISO timestamp into "25 Nov 2026, 14:32 WIB". */
export function formatLenderDateTime(iso: string): string {
  if (!iso) return '-'
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00+07:00` : iso
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) return iso
  return `${lenderDateTimeFormatter.format(parsed)} WIB`
}

const LEGAL_PREFIXES = new Set(['PT', 'CV', 'UD', 'PD', 'FA'])

/** Masks a company name for unclaimed leads, e.g. "PT S**** M**** Nusantara". */
export function maskCompanyName(name: string): string {
  const tokens = name.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return 'PT ****'

  const hasPrefix = LEGAL_PREFIXES.has(tokens[0].toUpperCase())
  const prefix = hasPrefix ? [tokens[0]] : []
  const body = hasPrefix ? tokens.slice(1) : tokens

  if (body.length === 0) return `${prefix[0]} ****`

  const maskedBody = body.map((word, idx) => {
    if (body.length >= 3 && idx === body.length - 1) return word
    const firstChar = word.charAt(0)
    return `${firstChar}****`
  })

  return [...prefix, ...maskedBody].join(' ')
}

function buildOfferTerms(params: {
  approvedAmount: number
  paymentMethod?: PaymentMethod
  tenorDays: number
  interestRatePa: number
  adminFeeRate: number
  lateFeeRatePerDay?: number
}): OfferTerms {
  const {
    approvedAmount,
    paymentMethod = 'Lump sum',
    tenorDays,
    interestRatePa,
    adminFeeRate,
    lateFeeRatePerDay = 0.1,
  } = params

  const interestAmount = Math.round(approvedAmount * (interestRatePa / 100) * (tenorDays / 365))
  const adminFeeAmount = Math.round(approvedAmount * (adminFeeRate / 100))

  return {
    approvedAmount,
    paymentMethod,
    tenorDays,
    interestMode: 'percent',
    interestRatePa,
    interestAmount,
    adminFeeMode: 'percent',
    adminFeeRate,
    adminFeeAmount,
    lateFeeRatePerDay,
  }
}

function buildBorrowerDocCategories(
  prefix: string,
  companySlug: string,
  uploadedDate: string,
): LenderDocumentCategory[] {
  return [
    {
      id: 'company',
      label: 'Company Verification',
      files: [
        {
          id: `${prefix}-doc-1`,
          label: 'Deed of Establishment (Akta Pendirian)',
          fileName: `Akta_Pendirian_${companySlug}.pdf`,
          uploadedAt: uploadedDate,
          sizeLabel: '2.4 MB',
        },
        {
          id: `${prefix}-doc-2`,
          label: 'Ministry of Law Decree (SK Kemenkumham)',
          fileName: `SK_Kemenkumham_${companySlug}.pdf`,
          uploadedAt: uploadedDate,
          sizeLabel: '1.1 MB',
        },
        {
          id: `${prefix}-doc-3`,
          label: 'Company Tax ID (NPWP)',
          fileName: `NPWP_${companySlug}.pdf`,
          uploadedAt: uploadedDate,
          sizeLabel: '640 KB',
        },
      ],
    },
    {
      id: 'individual',
      label: 'Individual Verification',
      files: [
        {
          id: `${prefix}-doc-4`,
          label: 'Director Identity Card (KTP)',
          fileName: `KTP_Direktur_${companySlug}.pdf`,
          uploadedAt: uploadedDate,
          sizeLabel: '820 KB',
        },
        {
          id: `${prefix}-doc-5`,
          label: 'Director Personal NPWP',
          fileName: `NPWP_Direktur_${companySlug}.pdf`,
          uploadedAt: uploadedDate,
          sizeLabel: '510 KB',
        },
      ],
    },
    {
      id: 'business',
      label: 'Business Verification',
      files: [
        {
          id: `${prefix}-doc-6`,
          label: 'Business Identification Number (NIB)',
          fileName: `NIB_OSS_${companySlug}.pdf`,
          uploadedAt: uploadedDate,
          sizeLabel: '1.3 MB',
        },
        {
          id: `${prefix}-doc-7`,
          label: 'Company Profile & Commercial Permits',
          fileName: `Company_Profile_${companySlug}.pdf`,
          uploadedAt: uploadedDate,
          sizeLabel: '3.2 MB',
        },
      ],
    },
    {
      id: 'financial',
      label: 'Financial Verification',
      files: [
        {
          id: `${prefix}-doc-8`,
          label: 'Audited Financial Statement (FY 2025)',
          fileName: `Laporan_Keuangan_2025_${companySlug}.pdf`,
          uploadedAt: uploadedDate,
          sizeLabel: '4.1 MB',
        },
        {
          id: `${prefix}-doc-9`,
          label: '6-Month Operating Bank Statements',
          fileName: `Rekening_Koran_6Bln_${companySlug}.pdf`,
          uploadedAt: uploadedDate,
          sizeLabel: '2.9 MB',
        },
      ],
    },
    {
      id: 'post-submission',
      label: 'Post Submission',
      files: [
        {
          id: `${prefix}-doc-10`,
          label: 'Signed Credit Inquiry Authorization',
          fileName: `Surat_Kuasa_Kredit_${companySlug}.pdf`,
          uploadedAt: uploadedDate,
          sizeLabel: '740 KB',
        },
      ],
    },
  ]
}

function buildCollateral(params: {
  idPrefix: string
  invoiceNumber: string
  invoiceStatus?: 'Approved' | 'Pending'
  eFakturNumber: string
  eFakturStatus?: 'Approved' | 'Pending'
  counterpartyName: string
  counterpartyNpwp: string
  dueDate: string
  invoiceAmount: number
  paymentStatus?: 'Paid' | 'Unpaid'
}): LenderCollateralInvoice {
  const safeCode = params.invoiceNumber.replaceAll('/', '-')
  return {
    invoiceNumber: params.invoiceNumber,
    invoiceStatus: params.invoiceStatus ?? 'Approved',
    eFakturNumber: params.eFakturNumber,
    eFakturStatus: params.eFakturStatus ?? 'Approved',
    counterpartyName: params.counterpartyName,
    counterpartyNpwp: params.counterpartyNpwp,
    dueDate: params.dueDate,
    invoiceAmount: params.invoiceAmount,
    paymentStatus: params.paymentStatus ?? 'Unpaid',
    documents: [
      {
        id: `${params.idPrefix}-col-1`,
        type: 'e-Faktur',
        fileName: `eFaktur-${safeCode}.pdf`,
        format: 'PDF',
      },
      {
        id: `${params.idPrefix}-col-2`,
        type: 'Invoice',
        fileName: `Invoice-${safeCode}.pdf`,
        format: 'PDF',
      },
      {
        id: `${params.idPrefix}-col-3`,
        type: 'Transaction',
        fileName: `Transaction-${safeCode}.csv`,
        format: 'CSV',
      },
    ],
  }
}

interface LeadSeedInput {
  id: string
  applicationNumber: string
  submittedAt: string
  submittedDisplayDate: string
  submittedDisplayTime: string
  loanType: LenderLoanType
  subType: string
  badge?: 'New' | 'Trending'
  state: LenderLead['state']
  claimSubStatus?: LenderLead['claimSubStatus']
  companyName: string
  slug: string
  industry: string
  location: string
  businessScale: BusinessScale
  npwp: string
  picName: string
  phone: string
  email: string
  annualRevenue: number
  grossProfit: number
  estimatedLoanAmount: number
  tenorDays: number
  interestRatePa: number
  adminFeeRate: number
  lateFeeRatePerDay?: number
  paymentMethod?: PaymentMethod
  pefindoChecked?: boolean
  pefindoCheckedAt?: string
  claimedAt?: string
  leadScore?: number
  rejectionReason?: string
  rejectedAt?: string
  invoiceNumber: string
  eFakturNumber: string
  counterpartyName: string
  counterpartyNpwp: string
  dueDate: string
  invoiceAmount: number
  paymentStatus?: 'Paid' | 'Unpaid'
  contracts?: LenderContract[]
}

function makeLead(input: LeadSeedInput): LenderLead {
  return {
    id: input.id,
    applicationNumber: input.applicationNumber,
    submittedAt: input.submittedAt,
    submittedDisplayDate: input.submittedDisplayDate,
    submittedDisplayTime: input.submittedDisplayTime,
    loanType: input.loanType,
    subType: input.subType,
    badge: input.badge,
    state: input.state,
    claimSubStatus: input.claimSubStatus,
    companyName: input.companyName,
    maskedCompanyName: maskCompanyName(input.companyName),
    country: 'Indonesia',
    industry: input.industry,
    location: input.location,
    businessScale: input.businessScale,
    npwp: input.npwp,
    picName: input.picName,
    phone: input.phone,
    email: input.email,
    annualRevenue: input.annualRevenue,
    grossProfit: input.grossProfit,
    estimatedLoanAmount: input.estimatedLoanAmount,
    claimedAt: input.claimedAt,
    pefindoChecked: input.pefindoChecked ?? false,
    pefindoCheckedAt: input.pefindoCheckedAt,
    leadScore: input.leadScore,
    rejectionReason: input.rejectionReason,
    rejectedAt: input.rejectedAt,
    offerTerms: buildOfferTerms({
      approvedAmount: input.estimatedLoanAmount,
      paymentMethod: input.paymentMethod ?? 'Lump sum',
      tenorDays: input.tenorDays,
      interestRatePa: input.interestRatePa,
      adminFeeRate: input.adminFeeRate,
      lateFeeRatePerDay: input.lateFeeRatePerDay ?? 0.1,
    }),
    borrowerDocCategories: buildBorrowerDocCategories(
      input.id,
      input.slug,
      input.submittedDisplayDate,
    ),
    collateral: buildCollateral({
      idPrefix: input.id,
      invoiceNumber: input.invoiceNumber,
      eFakturNumber: input.eFakturNumber,
      counterpartyName: input.counterpartyName,
      counterpartyNpwp: input.counterpartyNpwp,
      dueDate: input.dueDate,
      invoiceAmount: input.invoiceAmount,
      paymentStatus: input.paymentStatus,
    }),
    contracts: input.contracts ?? [],
  }
}

export function createInitialLeads(): LenderLead[] {
  return [
    // 11 Unclaimed Leads (5 AR Invoice Financing, 4 AP Invoice Financing, 2 Free Financing)
    makeLead({
      id: 'LD-001',
      applicationNumber: 'ARIF/2026/11/0042',
      submittedAt: '2026-11-25T14:32:00+07:00',
      submittedDisplayDate: '25 Nov 2026',
      submittedDisplayTime: '14:32 WIB',
      loanType: 'AR Invoice Financing',
      subType: 'Enterprise Financing',
      badge: 'New',
      state: 'unclaimed',
      companyName: 'PT Sinar Mandiri Nusantara',
      slug: 'PT_Sinar_Mandiri_Nusantara',
      industry: 'Logistics & Freight',
      location: 'Jakarta Selatan, DKI Jakarta',
      businessScale: 'Large',
      npwp: '0134829104821000',
      picName: 'Hendra Wijaya',
      phone: '+62 812 8840 1920',
      email: 'hendra.wijaya@sinarmandiri.co.id',
      annualRevenue: 145_000_000_000,
      grossProfit: 26_100_000_000,
      estimatedLoanAmount: 650_000_000,
      tenorDays: 60,
      interestRatePa: 12.5,
      adminFeeRate: 1.0,
      invoiceNumber: 'INV/2026/11/0814',
      eFakturNumber: '010.004-26.48192045',
      counterpartyName: 'PT Unilever Indonesia Tbk',
      counterpartyNpwp: '0100167210920000',
      dueDate: '2027-01-24',
      invoiceAmount: 820_000_000,
    }),
    makeLead({
      id: 'LD-002',
      applicationNumber: 'ARIF/2026/11/0041',
      submittedAt: '2026-11-25T11:18:00+07:00',
      submittedDisplayDate: '25 Nov 2026',
      submittedDisplayTime: '11:18 WIB',
      loanType: 'AR Invoice Financing',
      subType: 'SME Working Capital',
      badge: 'New',
      state: 'unclaimed',
      companyName: 'PT Prima Medika Alkes',
      slug: 'PT_Prima_Medika_Alkes',
      industry: 'Medical Supplies',
      location: 'Surabaya, Jawa Timur',
      businessScale: 'Medium',
      npwp: '0248190428172000',
      picName: 'Ratna Kusuma',
      phone: '+62 811 3290 4418',
      email: 'finance@primamedika.id',
      annualRevenue: 48_500_000_000,
      grossProfit: 9_700_000_000,
      estimatedLoanAmount: 320_000_000,
      tenorDays: 45,
      interestRatePa: 13.0,
      adminFeeRate: 1.25,
      invoiceNumber: 'INV/2026/11/0792',
      eFakturNumber: '010.004-26.48191108',
      counterpartyName: 'PT Siloam International Hospitals Tbk',
      counterpartyNpwp: '0184920148201000',
      dueDate: '2027-01-09',
      invoiceAmount: 410_000_000,
    }),
    makeLead({
      id: 'LD-003',
      applicationNumber: 'ARIF/2026/11/0039',
      submittedAt: '2026-11-24T16:05:00+07:00',
      submittedDisplayDate: '24 Nov 2026',
      submittedDisplayTime: '16:05 WIB',
      loanType: 'AR Invoice Financing',
      subType: 'Enterprise Financing',
      badge: 'Trending',
      state: 'unclaimed',
      companyName: 'PT Nusantara Agro Distribusi',
      slug: 'PT_Nusantara_Agro_Distribusi',
      industry: 'FMCG Distribution',
      location: 'Bandung, Jawa Barat',
      businessScale: 'Large',
      npwp: '0192837465012000',
      picName: 'Budi Santoso',
      phone: '+62 813 9201 7734',
      email: 'budi.santoso@nusantaraagro.co.id',
      annualRevenue: 178_000_000_000,
      grossProfit: 31_500_000_000,
      estimatedLoanAmount: 950_000_000,
      tenorDays: 60,
      interestRatePa: 11.8,
      adminFeeRate: 1.0,
      invoiceNumber: 'INV/2026/11/0745',
      eFakturNumber: '010.004-26.48188732',
      counterpartyName: 'PT Indofood CBP Sukses Makmur Tbk',
      counterpartyNpwp: '0130048291042000',
      dueDate: '2027-01-23',
      invoiceAmount: 1_200_000_000,
    }),
    makeLead({
      id: 'LD-004',
      applicationNumber: 'ARIF/2026/11/0037',
      submittedAt: '2026-11-23T13:45:00+07:00',
      submittedDisplayDate: '23 Nov 2026',
      submittedDisplayTime: '13:45 WIB',
      loanType: 'AR Invoice Financing',
      subType: 'SME Working Capital',
      state: 'unclaimed',
      companyName: 'PT Cipta Teknologi Terpadu',
      slug: 'PT_Cipta_Teknologi_Terpadu',
      industry: 'IT Services',
      location: 'Jakarta Pusat, DKI Jakarta',
      businessScale: 'Medium',
      npwp: '0319482710938000',
      picName: 'Dimas Pratama',
      phone: '+62 815 7710 2289',
      email: 'dimas@ciptateknologi.co.id',
      annualRevenue: 34_200_000_000,
      grossProfit: 8_900_000_000,
      estimatedLoanAmount: 240_000_000,
      tenorDays: 30,
      interestRatePa: 13.5,
      adminFeeRate: 1.0,
      invoiceNumber: 'INV/2026/11/0710',
      eFakturNumber: '010.004-26.48179410',
      counterpartyName: 'PT Telekomunikasi Selular',
      counterpartyNpwp: '0100049281726000',
      dueDate: '2026-12-23',
      invoiceAmount: 305_000_000,
    }),
    makeLead({
      id: 'LD-005',
      applicationNumber: 'ARIF/2026/11/0035',
      submittedAt: '2026-11-22T09:50:00+07:00',
      submittedDisplayDate: '22 Nov 2026',
      submittedDisplayTime: '09:50 WIB',
      loanType: 'AR Invoice Financing',
      subType: 'Supply Chain Receivable',
      state: 'unclaimed',
      companyName: 'CV Baja Perkasa Teknik',
      slug: 'CV_Baja_Perkasa_Teknik',
      industry: 'Building Materials',
      location: 'Semarang, Jawa Tengah',
      businessScale: 'Small',
      npwp: '0458291047281000',
      picName: 'Agus Setiawan',
      phone: '+62 817 4402 9103',
      email: 'agus@bajaperkasa.id',
      annualRevenue: 14_800_000_000,
      grossProfit: 2_950_000_000,
      estimatedLoanAmount: 150_000_000,
      tenorDays: 45,
      interestRatePa: 14.0,
      adminFeeRate: 1.5,
      invoiceNumber: 'INV/2026/11/0688',
      eFakturNumber: '010.004-26.48162091',
      counterpartyName: 'PT Wijaya Karya Bangunan Gedung Tbk',
      counterpartyNpwp: '0100182940125000',
      dueDate: '2027-01-06',
      invoiceAmount: 195_000_000,
    }),

    // 4 AP Invoice Financing
    makeLead({
      id: 'LD-006',
      applicationNumber: 'APIF/2026/11/0040',
      submittedAt: '2026-11-25T10:12:00+07:00',
      submittedDisplayDate: '25 Nov 2026',
      submittedDisplayTime: '10:12 WIB',
      loanType: 'AP Invoice Financing',
      subType: 'Supplier Settlement',
      badge: 'New',
      state: 'unclaimed',
      companyName: 'PT Karya Kemas Industri',
      slug: 'PT_Karya_Kemas_Industri',
      industry: 'Industrial Manufacturing',
      location: 'Bekasi, Jawa Barat',
      businessScale: 'Large',
      npwp: '0182930481725000',
      picName: 'Siti Rahmawati',
      phone: '+62 812 9044 6120',
      email: 'siti.r@karyakemas.co.id',
      annualRevenue: 112_000_000_000,
      grossProfit: 21_400_000_000,
      estimatedLoanAmount: 540_000_000,
      tenorDays: 60,
      interestRatePa: 12.0,
      adminFeeRate: 1.0,
      invoiceNumber: 'INV/2026/11/0803',
      eFakturNumber: '010.004-26.48190012',
      counterpartyName: 'PT Chandra Asri Pacific Tbk',
      counterpartyNpwp: '0100159283741000',
      dueDate: '2027-01-24',
      invoiceAmount: 615_000_000,
    }),
    makeLead({
      id: 'LD-007',
      applicationNumber: 'APIF/2026/11/0038',
      submittedAt: '2026-11-24T14:20:00+07:00',
      submittedDisplayDate: '24 Nov 2026',
      submittedDisplayTime: '14:20 WIB',
      loanType: 'AP Invoice Financing',
      subType: 'Distributor Payables',
      badge: 'Trending',
      state: 'unclaimed',
      companyName: 'PT Mitra Pangan Sejahtera',
      slug: 'PT_Mitra_Pangan_Sejahtera',
      industry: 'FMCG Distribution',
      location: 'Tangerang, Banten',
      businessScale: 'Medium',
      npwp: '0293847102938000',
      picName: 'Fajar Nugroho',
      phone: '+62 811 8823 5510',
      email: 'fajar@mitrapangan.co.id',
      annualRevenue: 67_500_000_000,
      grossProfit: 11_800_000_000,
      estimatedLoanAmount: 380_000_000,
      tenorDays: 45,
      interestRatePa: 12.8,
      adminFeeRate: 1.0,
      invoiceNumber: 'INV/2026/11/0752',
      eFakturNumber: '010.004-26.48184509',
      counterpartyName: 'PT Mayora Indah Tbk',
      counterpartyNpwp: '0100129384752000',
      dueDate: '2027-01-08',
      invoiceAmount: 430_000_000,
    }),
    makeLead({
      id: 'LD-008',
      applicationNumber: 'APIF/2026/11/0034',
      submittedAt: '2026-11-21T15:10:00+07:00',
      submittedDisplayDate: '21 Nov 2026',
      submittedDisplayTime: '15:10 WIB',
      loanType: 'AP Invoice Financing',
      subType: 'Supplier Settlement',
      state: 'unclaimed',
      companyName: 'PT Lintas Samudra Kargo',
      slug: 'PT_Lintas_Samudra_Kargo',
      industry: 'Logistics & Freight',
      location: 'Jakarta Utara, DKI Jakarta',
      businessScale: 'Medium',
      npwp: '0348192048173000',
      picName: 'Rizky Maulana',
      phone: '+62 813 7781 0932',
      email: 'rizky@lintassamudra.id',
      annualRevenue: 52_000_000_000,
      grossProfit: 9_100_000_000,
      estimatedLoanAmount: 290_000_000,
      tenorDays: 30,
      interestRatePa: 13.2,
      adminFeeRate: 1.0,
      invoiceNumber: 'INV/2026/11/0661',
      eFakturNumber: '010.004-26.48155320',
      counterpartyName: 'PT Meratus Line',
      counterpartyNpwp: '0100192837461000',
      dueDate: '2026-12-21',
      invoiceAmount: 330_000_000,
    }),
    makeLead({
      id: 'LD-009',
      applicationNumber: 'APIF/2026/11/0033',
      submittedAt: '2026-11-20T17:05:00+07:00',
      submittedDisplayDate: '20 Nov 2026',
      submittedDisplayTime: '17:05 WIB',
      loanType: 'AP Invoice Financing',
      subType: 'SME Payables Bridge',
      state: 'unclaimed',
      companyName: 'PT Bangun Beton Pratama',
      slug: 'PT_Bangun_Beton_Pratama',
      industry: 'Building Materials',
      location: 'Sidoarjo, Jawa Timur',
      businessScale: 'Small',
      npwp: '0512938471029000',
      picName: 'Dian Permata',
      phone: '+62 818 6630 1420',
      email: 'dian@bangunbeton.co.id',
      annualRevenue: 19_400_000_000,
      grossProfit: 3_600_000_000,
      estimatedLoanAmount: 180_000_000,
      tenorDays: 45,
      interestRatePa: 14.2,
      adminFeeRate: 1.25,
      invoiceNumber: 'INV/2026/11/0640',
      eFakturNumber: '010.004-26.48148201',
      counterpartyName: 'PT Semen Indonesia Tbk',
      counterpartyNpwp: '0100138475920000',
      dueDate: '2027-01-04',
      invoiceAmount: 215_000_000,
    }),

    // 2 Free Financing
    makeLead({
      id: 'LD-010',
      applicationNumber: 'FRF/2026/11/0043',
      submittedAt: '2026-11-25T16:45:00+07:00',
      submittedDisplayDate: '25 Nov 2026',
      submittedDisplayTime: '16:45 WIB',
      loanType: 'Free Financing',
      subType: 'Working Capital Facility',
      badge: 'New',
      state: 'unclaimed',
      companyName: 'PT Garuda Presisi Manufaktur',
      slug: 'PT_Garuda_Presisi_Manufaktur',
      industry: 'Industrial Manufacturing',
      location: 'Karawang, Jawa Barat',
      businessScale: 'Large',
      npwp: '0174829103847000',
      picName: 'Wahyu Hartono',
      phone: '+62 811 2294 8810',
      email: 'wahyu@garudapresisi.co.id',
      annualRevenue: 132_000_000_000,
      grossProfit: 24_800_000_000,
      estimatedLoanAmount: 750_000_000,
      tenorDays: 90,
      interestRatePa: 12.2,
      adminFeeRate: 1.0,
      paymentMethod: 'Installment',
      invoiceNumber: 'INV/2026/11/0820',
      eFakturNumber: '010.004-26.48195100',
      counterpartyName: 'PT Astra Otoparts Tbk',
      counterpartyNpwp: '0100148291038000',
      dueDate: '2027-02-23',
      invoiceAmount: 900_000_000,
    }),
    makeLead({
      id: 'LD-011',
      applicationNumber: 'FRF/2026/11/0032',
      submittedAt: '2026-11-19T12:15:00+07:00',
      submittedDisplayDate: '19 Nov 2026',
      submittedDisplayTime: '12:15 WIB',
      loanType: 'Free Financing',
      subType: 'General Credit Line',
      state: 'unclaimed',
      companyName: 'PT Solusi Medis Indonesia',
      slug: 'PT_Solusi_Medis_Indonesia',
      industry: 'Medical Supplies',
      location: 'Depok, Jawa Barat',
      businessScale: 'N/A',
      npwp: '0619283746501000',
      picName: 'Nadia Putri',
      phone: '+62 819 5510 3304',
      email: 'nadia@solusimedis.id',
      annualRevenue: 12_600_000_000,
      grossProfit: 2_450_000_000,
      estimatedLoanAmount: 120_000_000,
      tenorDays: 60,
      interestRatePa: 14.5,
      adminFeeRate: 1.5,
      invoiceNumber: 'INV/2026/11/0612',
      eFakturNumber: '010.004-26.48139874',
      counterpartyName: 'PT Kimia Farma Apotek',
      counterpartyNpwp: '0100112938475000',
      dueDate: '2027-01-18',
      invoiceAmount: 150_000_000,
    }),

    // 2 Claimed Leads
    makeLead({
      id: 'LD-101',
      applicationNumber: 'ARIF/2026/11/0031',
      submittedAt: '2026-11-18T11:30:00+07:00',
      submittedDisplayDate: '18 Nov 2026',
      submittedDisplayTime: '11:30 WIB',
      loanType: 'AR Invoice Financing',
      subType: 'Enterprise Financing',
      state: 'claimed',
      claimSubStatus: 'pending-offer',
      claimedAt: '2026-11-19T09:10:00+07:00',
      pefindoChecked: true,
      pefindoCheckedAt: '2026-11-20T11:15:00+07:00',
      leadScore: 84,
      companyName: 'PT Graha Logistik Prima',
      slug: 'PT_Graha_Logistik_Prima',
      industry: 'Logistics & Freight',
      location: 'Jakarta Barat, DKI Jakarta',
      businessScale: 'Large',
      npwp: '0148291038472000',
      picName: 'Arif Budiman',
      phone: '+62 811 9840 2150',
      email: 'arif.budiman@grahalogistik.co.id',
      annualRevenue: 96_000_000_000,
      grossProfit: 17_800_000_000,
      estimatedLoanAmount: 450_000_000,
      tenorDays: 60,
      interestRatePa: 12.0,
      adminFeeRate: 1.0,
      lateFeeRatePerDay: 0.1,
      invoiceNumber: 'INV/2026/11/0590',
      eFakturNumber: '010.004-26.48120931',
      counterpartyName: 'PT Kalbe Farma Tbk',
      counterpartyNpwp: '0100198472615000',
      dueDate: '2027-01-17',
      invoiceAmount: 540_000_000,
    }),
    makeLead({
      id: 'LD-102',
      applicationNumber: 'APIF/2026/11/0028',
      submittedAt: '2026-11-16T14:15:00+07:00',
      submittedDisplayDate: '16 Nov 2026',
      submittedDisplayTime: '14:15 WIB',
      loanType: 'AP Invoice Financing',
      subType: 'Supplier Settlement',
      state: 'claimed',
      claimSubStatus: 'contract-uploaded',
      claimedAt: '2026-11-17T10:20:00+07:00',
      pefindoChecked: true,
      pefindoCheckedAt: '2026-11-18T14:40:00+07:00',
      leadScore: 79,
      companyName: 'PT Sentosa Pangan Makmur',
      slug: 'PT_Sentosa_Pangan_Makmur',
      industry: 'FMCG Distribution',
      location: 'Medan, Sumatera Utara',
      businessScale: 'Medium',
      npwp: '0239481029384000',
      picName: 'Kevin Halim',
      phone: '+62 812 6104 8820',
      email: 'kevin.halim@sentosapangan.co.id',
      annualRevenue: 64_000_000_000,
      grossProfit: 11_200_000_000,
      estimatedLoanAmount: 280_000_000,
      tenorDays: 45,
      interestRatePa: 12.5,
      adminFeeRate: 1.0,
      lateFeeRatePerDay: 0.1,
      invoiceNumber: 'INV/2026/11/0532',
      eFakturNumber: '010.004-26.48108244',
      counterpartyName: 'PT Japfa Comfeed Indonesia Tbk',
      counterpartyNpwp: '0100147281923000',
      dueDate: '2026-12-31',
      invoiceAmount: 325_000_000,
      contracts: [
        {
          id: 'CTR-102-1',
          label: 'Contract 1',
          documentId: 'DOC-CTR-102-1',
          fileName: 'Loan_Contract_PT_Sentosa_Pangan_Makmur.pdf',
          status: 'Pending Signature',
          uploadedAt: '2026-11-19T10:00:00+07:00',
        },
      ],
    }),

    // 2 Rejected Leads
    makeLead({
      id: 'LD-201',
      applicationNumber: 'ARIF/2026/10/0094',
      submittedAt: '2026-10-28T09:40:00+07:00',
      submittedDisplayDate: '28 Oct 2026',
      submittedDisplayTime: '09:40 WIB',
      loanType: 'AR Invoice Financing',
      subType: 'SME Working Capital',
      state: 'rejected',
      claimedAt: '2026-10-29T11:00:00+07:00',
      pefindoChecked: true,
      pefindoCheckedAt: '2026-10-30T15:20:00+07:00',
      leadScore: 54,
      rejectionReason: 'Debt service coverage below minimum underwriting threshold.',
      rejectedAt: '2026-11-12T10:15:00+07:00',
      companyName: 'CV Karya Mandiri Sejahtera',
      slug: 'CV_Karya_Mandiri_Sejahtera',
      industry: 'Building Materials',
      location: 'Yogyakarta, DI Yogyakarta',
      businessScale: 'Small',
      npwp: '0583920184721000',
      picName: 'Yusuf Hidayat',
      phone: '+62 813 2840 9912',
      email: 'yusuf@karyamandiri.co.id',
      annualRevenue: 11_500_000_000,
      grossProfit: 1_900_000_000,
      estimatedLoanAmount: 190_000_000,
      tenorDays: 45,
      interestRatePa: 14.0,
      adminFeeRate: 1.5,
      invoiceNumber: 'INV/2026/10/0419',
      eFakturNumber: '010.004-26.47981203',
      counterpartyName: 'PT Pembangunan Perumahan Tbk',
      counterpartyNpwp: '0100182736451000',
      dueDate: '2026-12-12',
      invoiceAmount: 225_000_000,
    }),
    makeLead({
      id: 'LD-202',
      applicationNumber: 'FRF/2026/10/0087',
      submittedAt: '2026-10-22T15:25:00+07:00',
      submittedDisplayDate: '22 Oct 2026',
      submittedDisplayTime: '15:25 WIB',
      loanType: 'Free Financing',
      subType: 'General Credit Line',
      state: 'rejected',
      claimedAt: '2026-10-23T10:15:00+07:00',
      pefindoChecked: false,
      leadScore: 48,
      rejectionReason: 'Incomplete audited financial statements and overdue tax filings.',
      rejectedAt: '2026-11-08T16:40:00+07:00',
      companyName: 'PT Mega Konstruksi Abadi',
      slug: 'PT_Mega_Konstruksi_Abadi',
      industry: 'Building Materials',
      location: 'Makassar, Sulawesi Selatan',
      businessScale: 'Medium',
      npwp: '0491827364512000',
      picName: 'Andi Saputra',
      phone: '+62 811 4120 7788',
      email: 'andi@megakonstruksi.id',
      annualRevenue: 28_000_000_000,
      grossProfit: 4_200_000_000,
      estimatedLoanAmount: 400_000_000,
      tenorDays: 60,
      interestRatePa: 13.5,
      adminFeeRate: 1.25,
      invoiceNumber: 'INV/2026/10/0372',
      eFakturNumber: '010.004-26.47892014',
      counterpartyName: 'PT Semen Tonasa',
      counterpartyNpwp: '0100158291042000',
      dueDate: '2026-12-21',
      invoiceAmount: 475_000_000,
    }),
  ]
}

interface LoanSeedSpec {
  id: string
  applicationNumber: string
  submittedAt: string
  relativeAge: string
  companyName: string
  slug: string
  industry: string
  location: string
  businessScale: BusinessScale
  npwp: string
  picName: string
  phone: string
  email: string
  annualRevenue: number
  grossProfit: number
  dueDate: string
  requestedAmount: number
  approvedAmount: number
  tenorDays: number
  interestRatePa: number
  adminFeeRate: number
  lateFeeRatePerDay: number
  loanType: LenderLoanType
  subType: string
  status: LenderLoanStatus
  lastSyncedAt: string
  overdueDays?: number
  invoiceNumber: string
  eFakturNumber: string
  counterpartyName: string
  counterpartyNpwp: string
  invoiceAmount: number
}

const LOAN_SEED_SPECS: LoanSeedSpec[] = [
  // 7 Active loans
  {
    id: 'LN-001',
    applicationNumber: 'ARIF/2026/10/0078',
    submittedAt: '2026-10-18T10:15:00+07:00',
    relativeAge: '39 days ago',
    companyName: 'PT Pelita Logistik Nusantara',
    slug: 'PT_Pelita_Logistik_Nusantara',
    industry: 'Logistics & Freight',
    location: 'Jakarta Selatan, DKI Jakarta',
    businessScale: 'Large',
    npwp: '0129384756102000',
    picName: 'Teguh Prasetyo',
    phone: '+62 811 9012 3400',
    email: 'teguh@pelitalogistik.co.id',
    annualRevenue: 156_000_000_000,
    grossProfit: 28_400_000_000,
    dueDate: '2026-12-17',
    requestedAmount: 700_000_000,
    approvedAmount: 650_000_000,
    tenorDays: 60,
    interestRatePa: 12.0,
    adminFeeRate: 1.0,
    lateFeeRatePerDay: 0.1,
    loanType: 'AR Invoice Financing',
    subType: 'Enterprise Financing',
    status: 'active',
    lastSyncedAt: '2026-11-26T08:30:00+07:00',
    invoiceNumber: 'INV/2026/10/0310',
    eFakturNumber: '010.004-26.47811029',
    counterpartyName: 'PT Nestle Indonesia',
    counterpartyNpwp: '0100174829103000',
    invoiceAmount: 780_000_000,
  },
  {
    id: 'LN-002',
    applicationNumber: 'APIF/2026/10/0081',
    submittedAt: '2026-10-21T13:20:00+07:00',
    relativeAge: '36 days ago',
    companyName: 'PT Sinar Pangan Distribusi',
    slug: 'PT_Sinar_Pangan_Distribusi',
    industry: 'FMCG Distribution',
    location: 'Surabaya, Jawa Timur',
    businessScale: 'Large',
    npwp: '0194827103948000',
    picName: 'Lina Susanti',
    phone: '+62 812 3109 8472',
    email: 'lina@sinarpangan.co.id',
    annualRevenue: 128_000_000_000,
    grossProfit: 22_900_000_000,
    dueDate: '2026-12-05',
    requestedAmount: 520_000_000,
    approvedAmount: 500_000_000,
    tenorDays: 45,
    interestRatePa: 12.5,
    adminFeeRate: 1.0,
    lateFeeRatePerDay: 0.1,
    loanType: 'AP Invoice Financing',
    subType: 'Distributor Payables',
    status: 'active',
    lastSyncedAt: '2026-11-26T08:30:00+07:00',
    invoiceNumber: 'INV/2026/10/0339',
    eFakturNumber: '010.004-26.47839201',
    counterpartyName: 'PT Garudafood Putra Putri Jaya Tbk',
    counterpartyNpwp: '0100183920147000',
    invoiceAmount: 585_000_000,
  },
  {
    id: 'LN-003',
    applicationNumber: 'ARIF/2026/11/0004',
    submittedAt: '2026-11-02T09:45:00+07:00',
    relativeAge: '24 days ago',
    companyName: 'PT Cakrawala Medika Jaya',
    slug: 'PT_Cakrawala_Medika_Jaya',
    industry: 'Medical Supplies',
    location: 'Bandung, Jawa Barat',
    businessScale: 'Medium',
    npwp: '0283940182736000',
    picName: 'Rina Marlina',
    phone: '+62 813 2019 4812',
    email: 'rina@cakrawalamedika.id',
    annualRevenue: 54_000_000_000,
    grossProfit: 10_800_000_000,
    dueDate: '2027-01-01',
    requestedAmount: 420_000_000,
    approvedAmount: 400_000_000,
    tenorDays: 60,
    interestRatePa: 13.0,
    adminFeeRate: 1.0,
    lateFeeRatePerDay: 0.1,
    loanType: 'AR Invoice Financing',
    subType: 'SME Working Capital',
    status: 'active',
    lastSyncedAt: '2026-11-26T08:30:00+07:00',
    invoiceNumber: 'INV/2026/11/0095',
    eFakturNumber: '010.004-26.47992817',
    counterpartyName: 'PT Mitra Keluarga Karyasehat Tbk',
    counterpartyNpwp: '0100128394012000',
    invoiceAmount: 485_000_000,
  },
  {
    id: 'LN-004',
    applicationNumber: 'FRF/2026/11/0009',
    submittedAt: '2026-11-05T14:10:00+07:00',
    relativeAge: '21 days ago',
    companyName: 'PT Samudra Manufaktur Tbk',
    slug: 'PT_Samudra_Manufaktur_Tbk',
    industry: 'Industrial Manufacturing',
    location: 'Cikarang, Jawa Barat',
    businessScale: 'Large',
    npwp: '0102938475612000',
    picName: 'Gunawan Salim',
    phone: '+62 811 8840 9901',
    email: 'gunawan@samudramanufaktur.co.id',
    annualRevenue: 185_000_000_000,
    grossProfit: 34_200_000_000,
    dueDate: '2027-02-03',
    requestedAmount: 850_000_000,
    approvedAmount: 800_000_000,
    tenorDays: 90,
    interestRatePa: 11.5,
    adminFeeRate: 1.0,
    lateFeeRatePerDay: 0.1,
    loanType: 'Free Financing',
    subType: 'Working Capital Facility',
    status: 'active',
    lastSyncedAt: '2026-11-26T08:30:00+07:00',
    invoiceNumber: 'INV/2026/11/0132',
    eFakturNumber: '010.004-26.48019283',
    counterpartyName: 'PT Toyota Motor Manufacturing Indonesia',
    counterpartyNpwp: '0100110293847000',
    invoiceAmount: 960_000_000,
  },
  {
    id: 'LN-005',
    applicationNumber: 'ARIF/2026/11/0012',
    submittedAt: '2026-11-08T11:00:00+07:00',
    relativeAge: '18 days ago',
    companyName: 'PT Inti Digital Solusi',
    slug: 'PT_Inti_Digital_Solusi',
    industry: 'IT Services',
    location: 'Jakarta Selatan, DKI Jakarta',
    businessScale: 'Medium',
    npwp: '0328471920384000',
    picName: 'Aditya Nugraha',
    phone: '+62 812 8192 4401',
    email: 'aditya@intidigital.co.id',
    annualRevenue: 41_000_000_000,
    grossProfit: 10_250_000_000,
    dueDate: '2026-12-23',
    requestedAmount: 360_000_000,
    approvedAmount: 350_000_000,
    tenorDays: 45,
    interestRatePa: 12.8,
    adminFeeRate: 1.0,
    lateFeeRatePerDay: 0.1,
    loanType: 'AR Invoice Financing',
    subType: 'SME Working Capital',
    status: 'active',
    lastSyncedAt: '2026-11-26T08:30:00+07:00',
    invoiceNumber: 'INV/2026/11/0204',
    eFakturNumber: '010.004-26.48041920',
    counterpartyName: 'PT Bank Central Asia Tbk',
    counterpartyNpwp: '0100109283746000',
    invoiceAmount: 425_000_000,
  },
  {
    id: 'LN-006',
    applicationNumber: 'APIF/2026/11/0015',
    submittedAt: '2026-11-11T15:40:00+07:00',
    relativeAge: '15 days ago',
    companyName: 'PT Kencana Beton Karya',
    slug: 'PT_Kencana_Beton_Karya',
    industry: 'Building Materials',
    location: 'Semarang, Jawa Tengah',
    businessScale: 'Medium',
    npwp: '0419283746509000',
    picName: 'Haryanto Wibowo',
    phone: '+62 813 9981 2201',
    email: 'haryanto@kencanabeton.co.id',
    annualRevenue: 62_000_000_000,
    grossProfit: 11_400_000_000,
    dueDate: '2027-01-10',
    requestedAmount: 480_000_000,
    approvedAmount: 450_000_000,
    tenorDays: 60,
    interestRatePa: 12.5,
    adminFeeRate: 1.0,
    lateFeeRatePerDay: 0.1,
    loanType: 'AP Invoice Financing',
    subType: 'Supplier Settlement',
    status: 'active',
    lastSyncedAt: '2026-11-26T08:30:00+07:00',
    invoiceNumber: 'INV/2026/11/0281',
    eFakturNumber: '010.004-26.48063912',
    counterpartyName: 'PT Indocement Tunggal Prakarsa Tbk',
    counterpartyNpwp: '0100162738491000',
    invoiceAmount: 530_000_000,
  },
  {
    id: 'LN-007',
    applicationNumber: 'ARIF/2026/11/0019',
    submittedAt: '2026-11-14T10:05:00+07:00',
    relativeAge: '12 days ago',
    companyName: 'PT Bahari Ekspres Indonesia',
    slug: 'PT_Bahari_Ekspres_Indonesia',
    industry: 'Logistics & Freight',
    location: 'Jakarta Utara, DKI Jakarta',
    businessScale: 'Large',
    npwp: '0158291047283000',
    picName: 'Surya Dharma',
    phone: '+62 811 7734 1098',
    email: 'surya@bahariekspres.co.id',
    annualRevenue: 118_000_000_000,
    grossProfit: 20_500_000_000,
    dueDate: '2026-12-14',
    requestedAmount: 600_000_000,
    approvedAmount: 580_000_000,
    tenorDays: 30,
    interestRatePa: 12.0,
    adminFeeRate: 1.0,
    lateFeeRatePerDay: 0.1,
    loanType: 'AR Invoice Financing',
    subType: 'Enterprise Financing',
    status: 'active',
    lastSyncedAt: '2026-11-26T08:30:00+07:00',
    invoiceNumber: 'INV/2026/11/0398',
    eFakturNumber: '010.004-26.48091024',
    counterpartyName: 'PT Pelabuhan Indonesia (Persero)',
    counterpartyNpwp: '0100149201837000',
    invoiceAmount: 690_000_000,
  },

  // 3 Overdue loans
  {
    id: 'LN-008',
    applicationNumber: 'ARIF/2026/09/0052',
    submittedAt: '2026-09-22T11:20:00+07:00',
    relativeAge: '65 days ago',
    companyName: 'PT Anugerah Karya Plastik',
    slug: 'PT_Anugerah_Karya_Plastik',
    industry: 'Industrial Manufacturing',
    location: 'Tangerang, Banten',
    businessScale: 'Medium',
    npwp: '0274819203847000',
    picName: 'Rudi Hartono',
    phone: '+62 812 9103 4481',
    email: 'rudi@anugerahplastik.co.id',
    annualRevenue: 47_000_000_000,
    grossProfit: 8_400_000_000,
    dueDate: '2026-11-21',
    requestedAmount: 420_000_000,
    approvedAmount: 400_000_000,
    tenorDays: 60,
    interestRatePa: 13.0,
    adminFeeRate: 1.0,
    lateFeeRatePerDay: 0.1,
    loanType: 'AR Invoice Financing',
    subType: 'SME Working Capital',
    status: 'overdue',
    lastSyncedAt: '2026-11-26T08:30:00+07:00',
    overdueDays: 5,
    invoiceNumber: 'INV/2026/09/0218',
    eFakturNumber: '010.004-26.47582910',
    counterpartyName: 'PT Wings Surya',
    counterpartyNpwp: '0100193847561000',
    invoiceAmount: 495_000_000,
  },
  {
    id: 'LN-009',
    applicationNumber: 'APIF/2026/10/0063',
    submittedAt: '2026-10-03T16:10:00+07:00',
    relativeAge: '54 days ago',
    companyName: 'CV Sumber Makmur Pangan',
    slug: 'CV_Sumber_Makmur_Pangan',
    industry: 'FMCG Distribution',
    location: 'Malang, Jawa Timur',
    businessScale: 'Small',
    npwp: '0539182736451000',
    picName: 'Eko Purnomo',
    phone: '+62 813 5520 1984',
    email: 'eko@sumbermakmur.id',
    annualRevenue: 18_500_000_000,
    grossProfit: 3_200_000_000,
    dueDate: '2026-11-17',
    requestedAmount: 250_000_000,
    approvedAmount: 240_000_000,
    tenorDays: 45,
    interestRatePa: 13.5,
    adminFeeRate: 1.25,
    lateFeeRatePerDay: 0.12,
    loanType: 'AP Invoice Financing',
    subType: 'SME Payables Bridge',
    status: 'overdue',
    lastSyncedAt: '2026-11-26T08:30:00+07:00',
    overdueDays: 9,
    invoiceNumber: 'INV/2026/10/0112',
    eFakturNumber: '010.004-26.47692018',
    counterpartyName: 'PT Charoen Pokphand Indonesia Tbk',
    counterpartyNpwp: '0100129384712000',
    invoiceAmount: 290_000_000,
  },
  {
    id: 'LN-010',
    applicationNumber: 'FRF/2026/09/0044',
    submittedAt: '2026-09-15T10:50:00+07:00',
    relativeAge: '72 days ago',
    companyName: 'PT Dharma Konstruksi Utama',
    slug: 'PT_Dharma_Konstruksi_Utama',
    industry: 'Building Materials',
    location: 'Jakarta Timur, DKI Jakarta',
    businessScale: 'Medium',
    npwp: '0384910293847000',
    picName: 'Irwan Setiadi',
    phone: '+62 811 2938 7701',
    email: 'irwan@dharmakonstruksi.co.id',
    annualRevenue: 59_000_000_000,
    grossProfit: 10_400_000_000,
    dueDate: '2026-11-14',
    requestedAmount: 500_000_000,
    approvedAmount: 480_000_000,
    tenorDays: 60,
    interestRatePa: 12.5,
    adminFeeRate: 1.0,
    lateFeeRatePerDay: 0.1,
    loanType: 'Free Financing',
    subType: 'General Credit Line',
    status: 'overdue',
    lastSyncedAt: '2026-11-26T08:30:00+07:00',
    overdueDays: 12,
    invoiceNumber: 'INV/2026/09/0145',
    eFakturNumber: '010.004-26.47491022',
    counterpartyName: 'PT Adhi Karya (Persero) Tbk',
    counterpartyNpwp: '0100172839104000',
    invoiceAmount: 560_000_000,
  },

  // 2 Paid loans
  {
    id: 'LN-011',
    applicationNumber: 'ARIF/2026/09/0031',
    submittedAt: '2026-09-04T09:15:00+07:00',
    relativeAge: '83 days ago',
    companyName: 'PT Tirta Jaya Packaging',
    slug: 'PT_Tirta_Jaya_Packaging',
    industry: 'Industrial Manufacturing',
    location: 'Bekasi, Jawa Barat',
    businessScale: 'Large',
    npwp: '0149283746102000',
    picName: 'Maya Anggraini',
    phone: '+62 812 8830 1204',
    email: 'maya@tirtajayapack.co.id',
    annualRevenue: 98_000_000_000,
    grossProfit: 18_200_000_000,
    dueDate: '2026-11-03',
    requestedAmount: 550_000_000,
    approvedAmount: 550_000_000,
    tenorDays: 60,
    interestRatePa: 12.0,
    adminFeeRate: 1.0,
    lateFeeRatePerDay: 0.1,
    loanType: 'AR Invoice Financing',
    subType: 'Enterprise Financing',
    status: 'paid',
    lastSyncedAt: '2026-11-03T16:20:00+07:00',
    invoiceNumber: 'INV/2026/09/0089',
    eFakturNumber: '010.004-26.47319204',
    counterpartyName: 'PT Danone Indonesia',
    counterpartyNpwp: '0100192837465000',
    invoiceAmount: 660_000_000,
  },
  {
    id: 'LN-012',
    applicationNumber: 'APIF/2026/09/0038',
    submittedAt: '2026-09-10T14:00:00+07:00',
    relativeAge: '77 days ago',
    companyName: 'PT Bintang Farmasi Global',
    slug: 'PT_Bintang_Farmasi_Global',
    industry: 'Medical Supplies',
    location: 'Jakarta Pusat, DKI Jakarta',
    businessScale: 'Medium',
    npwp: '0284910283746000',
    picName: 'Daniel Kurniawan',
    phone: '+62 811 9482 1039',
    email: 'daniel@bintangfarmasi.co.id',
    annualRevenue: 71_000_000_000,
    grossProfit: 14_900_000_000,
    dueDate: '2026-10-25',
    requestedAmount: 320_000_000,
    approvedAmount: 320_000_000,
    tenorDays: 45,
    interestRatePa: 12.5,
    adminFeeRate: 1.0,
    lateFeeRatePerDay: 0.1,
    loanType: 'AP Invoice Financing',
    subType: 'Supplier Settlement',
    status: 'paid',
    lastSyncedAt: '2026-10-25T14:45:00+07:00',
    invoiceNumber: 'INV/2026/09/0118',
    eFakturNumber: '010.004-26.47392011',
    counterpartyName: 'PT Dexa Medica',
    counterpartyNpwp: '0100157283910000',
    invoiceAmount: 375_000_000,
  },
]

function computeSeedOverdueSummary(spec: LoanSeedSpec, offerTerms: OfferTerms): LenderOverdueSummary | undefined {
  if (spec.status !== 'overdue') return undefined
  const overdueDays = spec.overdueDays ?? 5
  const totalInterest = offerTerms.interestAmount
  const latePenalty = Math.round(
    offerTerms.approvedAmount * (offerTerms.lateFeeRatePerDay / 100) * overdueDays,
  )
  const amountDueAtMaturity = offerTerms.approvedAmount + totalInterest
  const currentAmountDue = amountDueAtMaturity + latePenalty
  return {
    totalInterest,
    latePenalty,
    currentAmountDue,
    amountDueAtMaturity,
  }
}

export function createInitialLoans(): LenderLoan[] {
  return LOAN_SEED_SPECS.map((spec) => {
    const offerTerms = buildOfferTerms({
      approvedAmount: spec.approvedAmount,
      tenorDays: spec.tenorDays,
      interestRatePa: spec.interestRatePa,
      adminFeeRate: spec.adminFeeRate,
      lateFeeRatePerDay: spec.lateFeeRatePerDay,
    })
    const disbursementAmount = Math.max(0, spec.approvedAmount - offerTerms.adminFeeAmount)
    const overdueSummary = computeSeedOverdueSummary(spec, offerTerms)

    return {
      id: spec.id,
      applicationNumber: spec.applicationNumber,
      submittedAt: spec.submittedAt,
      relativeAge: spec.relativeAge,
      companyName: spec.companyName,
      dueDate: spec.dueDate,
      requestedAmount: spec.requestedAmount,
      approvedAmount: spec.approvedAmount,
      disbursementAmount,
      loanType: spec.loanType,
      subType: spec.subType,
      status: spec.status,
      lastSyncedAt: spec.lastSyncedAt,
      overdueSummary,
    }
  })
}

export function createInitialLoanDetails(): Record<string, LenderLead> {
  const details: Record<string, LenderLead> = {}

  for (const spec of LOAN_SEED_SPECS) {
    const offerTerms = buildOfferTerms({
      approvedAmount: spec.approvedAmount,
      tenorDays: spec.tenorDays,
      interestRatePa: spec.interestRatePa,
      adminFeeRate: spec.adminFeeRate,
      lateFeeRatePerDay: spec.lateFeeRatePerDay,
    })
    const overdueSummary = computeSeedOverdueSummary(spec, offerTerms)
    const displayDate = formatLenderDate(spec.submittedAt)

    details[spec.id] = {
      id: spec.id,
      applicationNumber: spec.applicationNumber,
      submittedAt: spec.submittedAt,
      submittedDisplayDate: displayDate,
      submittedDisplayTime: '10:00 WIB',
      loanType: spec.loanType,
      subType: spec.subType,
      state: 'active',
      companyName: spec.companyName,
      maskedCompanyName: maskCompanyName(spec.companyName),
      country: 'Indonesia',
      industry: spec.industry,
      location: spec.location,
      businessScale: spec.businessScale,
      npwp: spec.npwp,
      picName: spec.picName,
      phone: spec.phone,
      email: spec.email,
      annualRevenue: spec.annualRevenue,
      grossProfit: spec.grossProfit,
      estimatedLoanAmount: spec.requestedAmount,
      claimedAt: spec.submittedAt,
      pefindoChecked: true,
      pefindoCheckedAt: spec.submittedAt,
      leadScore: 86,
      loanStatus: spec.status,
      lastSyncedAt: spec.lastSyncedAt,
      overdueSummary,
      offerTerms,
      borrowerDocCategories: buildBorrowerDocCategories(spec.id, spec.slug, displayDate),
      collateral: buildCollateral({
        idPrefix: spec.id,
        invoiceNumber: spec.invoiceNumber,
        eFakturNumber: spec.eFakturNumber,
        counterpartyName: spec.counterpartyName,
        counterpartyNpwp: spec.counterpartyNpwp,
        dueDate: spec.dueDate,
        invoiceAmount: spec.invoiceAmount,
        paymentStatus: spec.status === 'paid' ? 'Paid' : 'Unpaid',
      }),
      contracts: [
        {
          id: `CTR-${spec.id}-1`,
          label: 'Contract 1',
          documentId: `DOC-CTR-${spec.id}-1`,
          fileName: `Loan_Agreement_${spec.slug}.pdf`,
          status: 'Signed',
          uploadedAt: spec.submittedAt,
          signedAt: spec.submittedAt,
        },
      ],
    }
  }

  return details
}

export const WEBHOOK_EVENTS: WebhookEventItem[] = [
  {
    event: 'FINANCING_APPLICATION_SUBMITTED',
    domain: 'Application Lifecycle',
    purpose: 'Triggered when a borrower submits a new financing application to the lender pool.',
  },
  {
    event: 'FINANCING_APPLICATION_CLAIMED',
    domain: 'Application Lifecycle',
    purpose: 'Triggered when your lender team claims a lead and unlocks borrower data.',
  },
  {
    event: 'FINANCING_APPLICATION_DOCUMENT_UPDATED',
    domain: 'Application Lifecycle',
    purpose: 'Triggered when a borrower uploads or replaces supporting company or loan documents.',
  },
  {
    event: 'FINANCING_APPLICATION_REJECTED',
    domain: 'Application Lifecycle',
    purpose: 'Triggered when a financing application is declined by the lender.',
  },
  {
    event: 'FINANCING_OFFER_SENT',
    domain: 'Offer & Contract',
    purpose: 'Triggered when a financing offer and proposed terms are sent to the borrower.',
  },
  {
    event: 'FINANCING_OFFER_ACCEPTED',
    domain: 'Offer & Contract',
    purpose: 'Triggered when the borrower accepts your financing offer.',
  },
  {
    event: 'FINANCING_OFFER_REJECTED',
    domain: 'Offer & Contract',
    purpose: 'Triggered when the borrower declines the financing offer.',
  },
  {
    event: 'FINANCING_CONTRACT_SIGNED',
    domain: 'Offer & Contract',
    purpose: 'Triggered when the loan contract is digitally signed by all required parties.',
  },
  {
    event: 'FINANCING_DISBURSEMENT_PROCESSED',
    domain: 'Disbursement',
    purpose: 'Triggered when disbursement instructions are queued for bank settlement.',
  },
  {
    event: 'FINANCING_DISBURSEMENT_DISBURSED',
    domain: 'Disbursement',
    purpose: 'Triggered when net loan funds are successfully transferred to the borrower account.',
  },
  {
    event: 'FINANCING_DISBURSEMENT_FAILED',
    domain: 'Disbursement',
    purpose: 'Triggered when a disbursement transfer fails and requires manual review.',
  },
  {
    event: 'FINANCING_COLLATERAL_PAID',
    domain: 'Collateral & Repayment',
    purpose: 'Triggered when the underlying collateral invoice is marked paid by the counterparty.',
  },
  {
    event: 'FINANCING_REPAYMENT_PROCESSED',
    domain: 'Collateral & Repayment',
    purpose: 'Triggered when a borrower repayment transfer is received and entering settlement.',
  },
  {
    event: 'FINANCING_REPAYMENT_DISBURSED',
    domain: 'Collateral & Repayment',
    purpose: 'Triggered when settled repayment funds are remitted to the lender account.',
  },
  {
    event: 'FINANCING_REPAYMENT_FAILED',
    domain: 'Collateral & Repayment',
    purpose: 'Triggered when a scheduled repayment settlement fails or bounces.',
  },
  {
    event: 'FINANCING_COLLATERAL_COMMERCIAL_INVOICE_APPROVED',
    domain: 'Collateral Invoice & e-Faktur',
    purpose: 'Triggered when the collateral commercial invoice passes verification.',
  },
  {
    event: 'FINANCING_COLLATERAL_COMMERCIAL_INVOICE_CANCELLED',
    domain: 'Collateral Invoice & e-Faktur',
    purpose: 'Triggered when the borrower cancels a commercial invoice linked as collateral.',
  },
  {
    event: 'FINANCING_COLLATERAL_COMMERCIAL_INVOICE_REPLACED',
    domain: 'Collateral Invoice & e-Faktur',
    purpose: 'Triggered when a collateral commercial invoice is replaced with a revised invoice.',
  },
  {
    event: 'FINANCING_COLLATERAL_COMMERCIAL_INVOICE_EDIT',
    domain: 'Collateral Invoice & e-Faktur',
    purpose: 'Triggered when line items or metadata on a collateral commercial invoice are edited.',
  },
  {
    event: 'FINANCING_COLLATERAL_PPN_INVOICE_REPLACED',
    domain: 'Collateral Invoice & e-Faktur',
    purpose: 'Triggered when the linked e-Faktur (PPN tax invoice) is replaced by a revised e-Faktur.',
  },
  {
    event: 'FINANCING_COLLATERAL_PPN_INVOICE_CANCELLED',
    domain: 'Collateral Invoice & e-Faktur',
    purpose: 'Triggered when the linked e-Faktur (PPN tax invoice) is cancelled in OnlinePajak/DJP.',
  },
]
