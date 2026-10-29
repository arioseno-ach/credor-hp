/** Achilles-wide features from achilles-homepage's search index. They live outside this prototype. */
export interface PlatformFeature {
  id: string
  label: string
  group: string
  description: string
  /** Path under public/icons without the .svg extension. */
  icon: string
  aliases: string[]
}

export const platformFeatures: PlatformFeature[] = [
  { id: 'file-spt', label: 'File tax return (SPT)', group: 'Tax Filing', description: 'Prepare and submit a monthly or annual SPT', icon: 'custom/tax-returns', aliases: ['spt', 'lapor pajak', 'tax return', 'file tax', 'e-filing', 'efiling'] },
  { id: 'pay-tax', label: 'Pay tax', group: 'Tax Filing', description: 'Create an ID Billing and pay tax', icon: 'custom/tax-payment', aliases: ['bayar pajak', 'id billing', 'billing', 'ssp', 'setor pajak'] },
  { id: 'create-e-bupot', label: 'Create e-Bupot', group: 'Tax Filing', description: 'Issue withholding tax slips', icon: 'custom/e-bupot', aliases: ['bupot', 'bukti potong', 'withholding', 'pph 23', 'pph 21'] },
  { id: 'validate-npwp', label: 'Validate NPWP', group: 'Tax Filing', description: 'Check taxpayer numbers against official data', icon: 'custom/npwp-validation', aliases: ['npwp', 'tax id', 'cek npwp'] },
  { id: 'request-e-sign', label: 'Request e-Sign', group: 'e-Sign & e-Meterai', description: 'Send a document for electronic signature', icon: 'custom/e-signature', aliases: ['sign', 'signature', 'tanda tangan', 'ttd', 'e-signature', 'esign'] },
  { id: 'add-e-meterai', label: 'Add e-Meterai', group: 'e-Sign & e-Meterai', description: 'Stamp a document with an electronic duty stamp', icon: 'custom/e-meterai', aliases: ['stamp', 'materai', 'meterai', 'emeterai', 'stamp duty'] },
  { id: 'bulk-sign', label: 'Sign documents in bulk', group: 'e-Sign & e-Meterai', description: 'Sign many documents in one action', icon: 'custom/bulk-signing', aliases: ['bulk signing', 'many documents', 'tanda tangan massal'] },
  { id: 'bulk-stamp', label: 'Stamp documents in bulk', group: 'e-Sign & e-Meterai', description: 'Apply e-Meterai to many documents', icon: 'custom/bulk-stamping', aliases: ['bulk stamping', 'materai massal', 'stamp many'] },
  { id: 'use-document-template', label: 'Use a document template', group: 'e-Sign & e-Meterai', description: 'Start from a reusable contract or letter', icon: 'custom/document-template', aliases: ['template', 'contract', 'kontrak', 'surat'] },
  { id: 'check-financing-limit', label: 'Check available limit', group: 'Financing', description: 'View your available limit', icon: 'business-payments/payments', aliases: ['limit', 'financing limit', 'plafon', 'eligibility'] },
  { id: 'pay-later-bill', label: 'Pay a bill later', group: 'Financing', description: 'Defer a supplier payment', icon: 'custom/pay-the-bill-55-days-later', aliases: ['pay later', 'bayar nanti', 'defer', 'supplier payment', 'tempo'] },
  { id: 'track-repayment', label: 'Track repayment', group: 'Financing', description: 'View due dates and repayment status', icon: 'custom/credit-due', aliases: ['repay', 'cicilan', 'installment', 'due date', 'jatuh tempo'] },
  { id: 'create-sales-invoice', label: 'Create sales invoice', group: 'Invoicing & e-Faktur', description: 'Bill a customer and track payment', icon: 'custom/invoice', aliases: ['invoice', 'faktur penjualan', 'bill customer', 'tagihan'] },
  { id: 'create-e-faktur', label: 'Create e-Faktur', group: 'Invoicing & e-Faktur', description: 'Issue a VAT invoice through DJP', icon: 'custom/e-faktur', aliases: ['faktur', 'efaktur', 'faktur pajak', 'ppn', 'vat invoice', 'nsfp'] },
  { id: 'send-payment-reminder', label: 'Send payment reminder', group: 'Invoicing & e-Faktur', description: 'Nudge customers with unpaid invoices', icon: 'custom/payment-reminders', aliases: ['reminder', 'overdue', 'pengingat', 'unpaid', 'collect payment'] },
  { id: 'issue-credit-note', label: 'Issue credit note', group: 'Invoicing & e-Faktur', description: 'Adjust or cancel a sent invoice', icon: 'custom/credit-note', aliases: ['refund', 'retur', 'nota kredit', 'cancel invoice'] },
  { id: 'import-transactions', label: 'Import transactions', group: 'Invoicing & e-Faktur', description: 'Bring in sales and purchases from a CSV file', icon: 'custom/import-csv', aliases: ['import', 'csv', 'upload', 'excel', 'bulk import'] },
]
