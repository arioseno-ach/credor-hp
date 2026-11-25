import { ref } from 'vue'
import { initialSales, saleBuyers, type SaleBuyer, type SaleLine, type SaleTransaction } from '@/components/sales/sales'

// Module-level, like usePartnerAccess: the list shows what the create form adds.
const sales = ref<SaleTransaction[]>([...initialSales])
const buyers = ref<SaleBuyer[]>([...saleBuyers])

export function useSales() {
  function buyerOf(sale: SaleTransaction) {
    return buyers.value.find((buyer) => buyer.id === sale.buyerId)
  }

  /** Saves a new buyer, or returns the existing one with the same NPWP. */
  function saveBuyer(draft: Omit<SaleBuyer, 'id'>): SaleBuyer {
    const existing = buyers.value.find((buyer) => buyer.npwp === draft.npwp)
    if (existing) return existing
    const buyer = { ...draft, id: `buyer-${Date.now()}` }
    buyers.value.push(buyer)
    return buyer
  }

  function createSale(input: { buyerId: string; dueOn: string; lines: SaleLine[] }): SaleTransaction {
    const today = new Date()
    const iso = today.toISOString().slice(0, 10)
    const sequence = String(Math.max(...sales.value.map((sale) => Number(sale.number.split('/').pop()))) + 1).padStart(4, '0')
    const sale: SaleTransaction = {
      id: `s-${sequence}`,
      number: `INV/${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${sequence}`,
      buyerId: input.buyerId,
      issuedOn: iso,
      dueOn: input.dueOn,
      lines: input.lines,
      status: 'unpaid',
    }
    sales.value.unshift(sale)
    return sale
  }

  return { sales, buyers, buyerOf, saveBuyer, createSale }
}
