import { credorPartners } from '@/components/credor/partners'
import { credorTransactionTabs, type CredorTransaction } from '@/components/credor/transactions'

/** Finds an invoice or bill by id across the transactions table and the partner lists. */
export function findInvoice(id: string | undefined): CredorTransaction | null {
  if (!id) return null
  for (const tab of credorTransactionTabs) {
    const row = tab.rows.find((item) => item.id === id)
    if (row) return row
  }
  for (const partner of credorPartners) {
    const row = partner.invoices.find((item) => item.id === id)
    if (row) return row
  }
  return null
}
