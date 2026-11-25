<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import RiskBandChip from '@/components/credor/risk-pulse/RiskBandChip.vue'
import RiskBlurredScore from '@/components/credor/risk-pulse/RiskBlurredScore.vue'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatNpwp, npwpDigits } from '@/components/credor/risk-pulse/partner-access'
import { useAppView } from '@/composables/useAppView'
import { usePartnerAccess } from '@/composables/usePartnerAccess'
import { useSales } from '@/composables/useSales'
import { useSnackbar } from '@/composables/useSnackbar'
import SalesBuyerPulse from './SalesBuyerPulse.vue'
import SalesInvoicePreview from './SalesInvoicePreview.vue'
import { formatRupiah, lineTotal, type SaleBuyer, type SaleLine } from './sales'

// Mirrors the live Achilles "Sales Transaction" create page section by section; RiskPulse is the only addition.
const { openSales } = useAppView()
const { buyers, saveBuyer, createSale } = useSales()
const { partners } = usePartnerAccess()
const { show } = useSnackbar()

const previewOpen = ref(true)

type BuyerStep = 'search' | 'edit' | 'saved'
const buyerStep = ref<BuyerStep>('search')
const query = ref('')
const listOpen = ref(false)

const emptyDraft = () => ({
  name: '',
  country: 'Indonesia',
  idType: 'npwp' as 'npwp' | 'nik' | 'other',
  npwp: '',
  nitku: '',
  address: '',
  phoneCode: '+62',
  phone: '',
  email: '',
  verifyBeforePayment: false,
  verified: false,
})
const draft = ref(emptyDraft())
const savedBuyer = ref<SaleBuyer | null>(null)
const buyerSubmitted = ref(false)

const matches = computed(() => {
  const needle = query.value.trim().toLowerCase()
  const digits = npwpDigits(query.value)
  return buyers.value.filter(
    (buyer) =>
      !needle ||
      buyer.name.toLowerCase().includes(needle) ||
      buyer.address.toLowerCase().includes(needle) ||
      (digits.length > 2 && buyer.npwp.includes(digits)),
  )
})

function pulseOf(buyer: SaleBuyer) {
  return partners.value.find((partner) => partner.npwp === buyer.npwp)
}

// Words for the RiskPulse tag in the buyer list; the "RiskPulse" caption above them says what they are about.
function pulseStatus(buyer: SaleBuyer) {
  const pulse = pulseOf(buyer)
  if (!pulse) return 'Not shared yet'
  if (pulse.status === 'pending') return 'Requested'
  if (pulse.status === 'declined') return 'Declined'
  if (pulse.status === 'unlocked') return 'Shared with you'
  return 'Not shared yet'
}

const buyerErrors = computed(() => {
  if (!buyerSubmitted.value) return { name: '', npwp: '' }
  const digits = npwpDigits(draft.value.npwp)
  return {
    name: draft.value.name.trim() ? '' : 'Enter the buyer name.',
    npwp: digits.length === 15 || digits.length === 16 ? '' : 'An NPWP has 15 or 16 digits.',
  }
})

// A verified buyer's prefilled values carry the same green check the live page shows.
const checked = (value: string) => draft.value.verified && !!value.trim()

async function focusById(id: string) {
  await nextTick()
  document.getElementById(id)?.focus()
}

function pickBuyer(buyer: SaleBuyer) {
  draft.value = { ...emptyDraft(), name: buyer.name, npwp: buyer.npwp, nitku: buyer.nitku, address: buyer.address, email: buyer.email, verified: buyer.verified }
  listOpen.value = false
  buyerStep.value = 'edit'
  focusById('buyer-name')
}

function newBuyer() {
  draft.value = emptyDraft()
  listOpen.value = false
  buyerStep.value = 'edit'
  focusById('buyer-name')
}

function cancelBuyer() {
  buyerSubmitted.value = false
  buyerStep.value = savedBuyer.value ? 'saved' : 'search'
  focusById(savedBuyer.value ? 'buyer-change' : 'buyer-search')
}

function confirmBuyer() {
  buyerSubmitted.value = true
  if (buyerErrors.value.name || buyerErrors.value.npwp) {
    focusById(buyerErrors.value.name ? 'buyer-name' : 'buyer-npwp')
    return
  }
  const { name, npwp, nitku, address, email, verified } = draft.value
  savedBuyer.value = saveBuyer({ name: name.trim(), npwp: npwpDigits(npwp), nitku, address, email, verified })
  buyerSubmitted.value = false
  buyerStep.value = 'saved'
  focusById('item-name')
}

function changeBuyer() {
  if (savedBuyer.value) pickBuyer(savedBuyer.value)
}

// The preview follows whatever buyer is on screen, saved or still being edited.
const previewBuyer = computed(() =>
  buyerStep.value === 'edit' ? { name: draft.value.name, address: draft.value.address } : savedBuyer.value,
)

// Transaction details: one entry row, as on the live page, adds a line to the list above it.
const lines = ref<SaleLine[]>([])
const itemName = ref('')
const itemQty = ref(1)
const itemPrice = ref<number | undefined>(undefined)
const dueOn = ref(new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10))
const total = computed(() => lines.value.reduce((sum, line) => sum + lineTotal(line), 0))
const itemError = ref('')

function addItem() {
  if (!itemName.value.trim() || !itemQty.value || !itemPrice.value) {
    itemError.value = 'Fill in the item name, quantity and unit price, then add it.'
    focusById(!itemName.value.trim() ? 'item-name' : !itemQty.value ? 'item-qty' : 'item-price')
    return
  }
  lines.value.push({ name: itemName.value.trim(), quantity: itemQty.value, unitPrice: itemPrice.value })
  itemName.value = ''
  itemQty.value = 1
  itemPrice.value = undefined
  itemError.value = ''
  focusById('item-name')
}

function removeLine(index: number) {
  lines.value.splice(index, 1)
  focusById('item-name')
}

const blocker = computed(() => {
  if (!savedBuyer.value) return 'Save a buyer to continue.'
  if (!lines.value.length) return 'Add at least one item.'
  if (!dueOn.value) return 'Choose a due date.'
  return ''
})

const creating = ref(false)

async function create() {
  if (blocker.value || creating.value || !savedBuyer.value) return
  creating.value = true
  // Prototype: stands in for saving the transaction.
  await new Promise((resolve) => window.setTimeout(resolve, 600))
  const sale = createSale({ buyerId: savedBuyer.value.id, dueOn: dueOn.value, lines: lines.value })
  creating.value = false
  show({ variant: 'success', title: `${sale.number} created`, description: `${formatRupiah(total.value)} billed to ${savedBuyer.value.name}.` })
  openSales(`sale-${sale.id}`)
}

// Prototype: these controls exist on the live page; here they only say so.
function notInPrototype(feature: string) {
  show({ variant: 'neutral', title: feature, description: 'Not part of this prototype.' })
}
</script>

<template>
  <div class="sc">
    <header class="sc__header">
      <div class="sc__title-row">
        <button type="button" class="sc__back" aria-label="Back to sales transactions" @click="openSales()">
          <span class="sc__mask sc__mask--back" aria-hidden="true"></span>
        </button>
        <h1 class="sc__title">Sales Transaction</h1>
      </div>
      <div class="sc__share">
        <span class="sc__share-text">
          <span class="sc__mask sc__mask--group" aria-hidden="true"></span>
          Share with your team or buyer to collaborate
        </span>
        <Button variant="outline" color="neutral" size="small" type="button" @click="notInPrototype('Copy link')">
          <span class="sc__mask sc__mask--link" aria-hidden="true"></span>
          Copy link
        </Button>
        <Button variant="outline" color="neutral" size="small" type="button" @click="notInPrototype('Share')">
          Share
          <span class="sc__mask sc__mask--share" aria-hidden="true"></span>
        </Button>
      </div>
    </header>

    <div class="sc__layout" :class="{ 'sc__layout--preview': previewOpen }">
      <div class="sc__main">
        <!-- Buyer -->
        <section class="sc__card" aria-labelledby="sc-buyer-title">
          <div class="sc__card-head">
            <h2 id="sc-buyer-title" class="sc__h2">Buyer</h2>
            <Button v-if="buyerStep === 'saved'" id="buyer-change" variant="outline" color="neutral" size="small" type="button" @click="changeBuyer">
              Change
            </Button>
            <Button v-else-if="!previewOpen" variant="outline" color="neutral" size="small" type="button" @click="previewOpen = true">
              Open Preview
              <span class="sc__mask sc__mask--eye" aria-hidden="true"></span>
            </Button>
          </div>

          <div v-if="buyerStep === 'search'" class="sc__search">
            <div class="sc__control">
              <Input
                id="buyer-search"
                v-model="query"
                class="sc__input sc__input--trail"
                role="combobox"
                :aria-expanded="listOpen"
                aria-controls="buyer-options"
                aria-autocomplete="list"
                placeholder="Search buyer by name, NPWP or address"
                aria-label="Search buyer"
                @focus="listOpen = true"
                @click="listOpen = true"
                @input="listOpen = true"
                @keydown.escape="listOpen = false"
              />
              <span class="sc__trail sc__mask sc__mask--chevron" aria-hidden="true"></span>
            </div>
            <p class="sc__hint sc__hint--link">Choose a buyer to start creating documents or a payment request.</p>
            <ul v-if="listOpen" id="buyer-options" class="sc__options" role="listbox" aria-label="Buyers">
              <li role="option" aria-selected="false">
                <button type="button" class="sc__option sc__option--new" @click="newBuyer">
                  <span class="sc__mask sc__mask--person" aria-hidden="true"></span>
                  Add New Buyer
                </button>
              </li>
              <li v-for="buyer in matches" :key="buyer.id" role="option" aria-selected="false">
                <button type="button" class="sc__option" @click="pickBuyer(buyer)">
                  <span class="sc__option-main">
                    <span class="sc__option-name">
                      {{ buyer.name }}
                      <span v-if="buyer.verified" class="sc__mask sc__mask--verified" aria-label="Verified" role="img"></span>
                    </span>
                    <span class="sc__option-meta">{{ formatNpwp(buyer.npwp) }}</span>
                    <span class="sc__option-meta">{{ buyer.address }}</span>
                  </span>
                  <!-- The score itself, blurred until shared; hovering names it, so it never reads as an account state. -->
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <span class="sc__pulse-tag">
                        <span v-if="pulseOf(buyer)?.status === 'unlocked'" class="sc__pulse-value">
                          <RiskBandChip :score="pulseOf(buyer)!.score" />
                          <strong>{{ pulseOf(buyer)!.score.toFixed(1) }}</strong>
                        </span>
                        <RiskBlurredScore v-else :seed="buyer.npwp" :label="`RiskPulse score: ${pulseStatus(buyer)}`" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left">RiskPulse score · {{ pulseStatus(buyer) }}</TooltipContent>
                  </Tooltip>
                </button>
              </li>
              <li v-if="!matches.length" class="sc__option-empty">No buyer matches. Add them as a new buyer.</li>
            </ul>
          </div>

          <div v-else-if="buyerStep === 'edit'" class="sc__form">
            <p v-if="draft.verified" class="sc__verified-banner">
              <span class="sc__mask sc__mask--check" aria-hidden="true"></span>
              Vendor data has been verified by <strong>OnlinePajak</strong>
            </p>

            <div class="sc__grid">
              <div class="sc__field">
                <label for="buyer-name" class="sc__label">Buyer name<span class="sc__req">*</span></label>
                <div class="sc__control">
                  <Input id="buyer-name" v-model="draft.name" class="sc__input" :class="{ 'sc__input--trail': checked(draft.name) }" placeholder="Buyer name" :aria-invalid="!!buyerErrors.name" :aria-describedby="buyerErrors.name ? 'buyer-name-error' : undefined" />
                  <span v-if="checked(draft.name)" class="sc__trail sc__mask sc__mask--ok" aria-hidden="true"></span>
                </div>
                <p v-if="buyerErrors.name" id="buyer-name-error" class="sc__error">{{ buyerErrors.name }}</p>
              </div>
              <div class="sc__field">
                <label for="buyer-country" class="sc__label">Country</label>
                <div class="sc__control">
                  <select id="buyer-country" v-model="draft.country" class="sc__select">
                    <option>Indonesia</option>
                    <option>Singapore</option>
                    <option>Malaysia</option>
                  </select>
                  <span class="sc__trail sc__trail--pair" aria-hidden="true">
                    <span v-if="draft.verified" class="sc__mask sc__mask--ok"></span>
                    <span class="sc__mask sc__mask--chevron"></span>
                  </span>
                </div>
              </div>

              <fieldset class="sc__field sc__field--wide sc__radios">
                <legend class="sc__label">Identity verification</legend>
                <label><input v-model="draft.idType" type="radio" value="npwp"> NPWP &amp; NITKU</label>
                <label><input v-model="draft.idType" type="radio" value="nik"> NIK</label>
                <label><input v-model="draft.idType" type="radio" value="other"> Other ID</label>
              </fieldset>

              <div class="sc__field">
                <label for="buyer-npwp" class="sc__label">NPWP</label>
                <div class="sc__control">
                  <Input id="buyer-npwp" v-model="draft.npwp" class="sc__input" :class="{ 'sc__input--trail': checked(draft.npwp) }" placeholder="NPWP" inputmode="numeric" :aria-invalid="!!buyerErrors.npwp" :aria-describedby="buyerErrors.npwp ? 'buyer-npwp-error' : undefined" />
                  <span v-if="checked(draft.npwp)" class="sc__trail sc__mask sc__mask--ok" aria-hidden="true"></span>
                </div>
                <p v-if="buyerErrors.npwp" id="buyer-npwp-error" class="sc__error">{{ buyerErrors.npwp }}</p>
              </div>
              <div class="sc__field">
                <label for="buyer-nitku" class="sc__label">NITKU</label>
                <div class="sc__control">
                  <Input id="buyer-nitku" v-model="draft.nitku" class="sc__input sc__input--trail" placeholder="NITKU" inputmode="numeric" />
                  <span class="sc__trail sc__trail--pair" aria-hidden="true">
                    <span v-if="checked(draft.nitku)" class="sc__mask sc__mask--ok"></span>
                    <span class="sc__mask sc__mask--chevron"></span>
                  </span>
                </div>
              </div>

              <div class="sc__field sc__field--wide">
                <label for="buyer-address" class="sc__label">Address</label>
                <div class="sc__control">
                  <textarea id="buyer-address" v-model="draft.address" class="sc__textarea" rows="2" placeholder="Enter the full address"></textarea>
                  <span v-if="checked(draft.address)" class="sc__trail sc__trail--top sc__mask sc__mask--ok" aria-hidden="true"></span>
                </div>
              </div>

              <div class="sc__field sc__field--wide">
                <label for="buyer-phone" class="sc__label">Phone number</label>
                <!-- One bordered control: country code, a divider, then the number, as on the live page. -->
                <div class="sc__phone">
                  <label class="sr-only" for="buyer-phone-code">Country code</label>
                  <select id="buyer-phone-code" v-model="draft.phoneCode" class="sc__phone-code">
                    <option>+62</option>
                    <option>+65</option>
                    <option>+60</option>
                  </select>
                  <input id="buyer-phone" v-model="draft.phone" class="sc__phone-input" type="tel" placeholder="Phone number" autocomplete="off">
                </div>
              </div>

              <div class="sc__field sc__field--wide">
                <label for="buyer-email" class="sc__label">Email</label>
                <textarea id="buyer-email" v-model="draft.email" class="sc__textarea sc__textarea--email" rows="2" aria-describedby="buyer-email-hint"></textarea>
                <p id="buyer-email-hint" class="sc__hint">You can add multiple emails by pressing Enter.</p>
              </div>
            </div>

            <div class="sc__toggle-row">
              <div>
                <p id="verify-title" class="sc__toggle-title">Request verification before payment</p>
                <p class="sc__hint">Anyone opening the payment link must enter the registered email or phone number of the buyer or your company before seeing the invoice to pay.</p>
              </div>
              <label class="sc__switch">
                <input v-model="draft.verifyBeforePayment" type="checkbox" role="switch" aria-labelledby="verify-title">
                <span class="sc__switch-track" aria-hidden="true"></span>
                <span>{{ draft.verifyBeforePayment ? 'Yes' : 'No' }}</span>
              </label>
            </div>

            <!-- RiskPulse sits last: after the user has chosen and checked the buyer, right before saving. -->
            <SalesBuyerPulse :npwp="draft.npwp" :email="draft.email" :name="draft.name" />

            <footer class="sc__actions">
              <Button variant="outline" color="neutral" size="small" type="button" @click="cancelBuyer">Cancel</Button>
              <Button size="small" type="button" @click="confirmBuyer">Save</Button>
            </footer>
          </div>

          <div v-else-if="savedBuyer" class="sc__summary">
            <p class="sc__summary-name">
              {{ savedBuyer.name }}
              <span v-if="savedBuyer.verified" class="sc__mask sc__mask--verified" aria-label="Verified" role="img"></span>
            </p>
            <p class="sc__option-meta">NPWP {{ formatNpwp(savedBuyer.npwp) }}<template v-if="savedBuyer.email"> · {{ savedBuyer.email }}</template></p>
            <p class="sc__option-meta">{{ savedBuyer.address }}</p>
            <SalesBuyerPulse :npwp="savedBuyer.npwp" :email="savedBuyer.email" :name="savedBuyer.name" />
          </div>
        </section>

        <!-- Locked until a buyer is saved, as on the live page; inert keeps it out of the tab order too. -->
        <div class="sc__rest" :class="{ 'sc__rest--locked': !savedBuyer }" :inert="!savedBuyer || undefined">
          <section class="sc__card" aria-labelledby="sc-detail-title">
            <h2 id="sc-detail-title" class="sc__h2">Transaction Details</h2>
            <p class="sc__sub">You can add line items or fill in the net amount for this transaction</p>

            <ul v-if="lines.length" class="sc__lines">
              <li v-for="(line, index) in lines" :key="index" class="sc__line">
                <span class="sc__line-name">{{ line.name }}</span>
                <span class="sc__line-meta">{{ line.quantity }} × {{ formatRupiah(line.unitPrice) }}</span>
                <span class="sc__line-total">{{ formatRupiah(lineTotal(line)) }}</span>
                <Button variant="ghost" size="icon-sm" type="button" :aria-label="`Remove ${line.name}`" @click="removeLine(index)">
                  <span class="sc__mask sc__mask--close" aria-hidden="true"></span>
                </Button>
              </li>
            </ul>

            <form class="sc__entry" @submit.prevent="addItem">
              <span class="sc__mask sc__mask--receipt" aria-hidden="true"></span>
              <input id="item-name" v-model="itemName" class="sc__entry-input sc__entry-name" placeholder="Add goods or service name" aria-label="Goods or service name">
              <input id="item-qty" v-model.number="itemQty" class="sc__entry-input sc__entry-qty" type="number" min="1" aria-label="Quantity">
              <input id="item-price" v-model.number="itemPrice" class="sc__entry-input sc__entry-price" type="number" min="0" step="1000" placeholder="Unit price" aria-label="Unit price in rupiah">
              <Button variant="link" type="submit" class="sc__entry-add">Add +</Button>
            </form>
            <p v-if="itemError" class="sc__error" role="alert">{{ itemError }}</p>

            <div class="sc__field sc__field--due">
              <label for="sale-due" class="sc__label">Due date</label>
              <Input id="sale-due" v-model="dueOn" class="sc__input" type="date" />
            </div>

            <p class="sc__total">
              <span>Amount to be paid</span>
              <span>{{ formatRupiah(total) }}</span>
            </p>
          </section>

          <section class="sc__card" aria-labelledby="sc-docs-title">
            <div class="sc__card-head">
              <h2 id="sc-docs-title" class="sc__h2">Documents (Optional)</h2>
              <Button variant="link" type="button" @click="notInPrototype('Add document')">Add Document +</Button>
            </div>
            <p class="sc__sub">See and manage every document for this transaction here.</p>
            <div class="sc__docs">
              <span class="sc__hint">Included documents:</span>
              <span class="sc__doc"><span class="sc__mask sc__mask--receipt" aria-hidden="true"></span> Invoice</span>
              <span class="sc__doc"><span class="sc__mask sc__mask--faktur" aria-hidden="true"></span> e-Faktur</span>
              <span class="sc__doc">e-Bupot</span>
              <span class="sc__doc">Other Documents</span>
            </div>
          </section>

          <section class="sc__card" aria-labelledby="sc-pay-title">
            <h2 id="sc-pay-title" class="sc__h2">Payment</h2>
            <p class="sc__sub">Send payment requests and track their status.</p>
            <div class="sc__why">
              <p class="sc__why-title">Why receive payments in Achilles?</p>
              <ul class="sc__why-list">
                <li>Receive the amount after tax</li>
                <li>Complete payment methods</li>
                <li>Automatic reconciliation</li>
              </ul>
            </div>
            <div class="sc__pay">
              <p id="sc-pay-note" class="sc__hint">Available once the transaction is created.</p>
              <Button variant="outline" color="neutral" size="small" type="button" disabled aria-describedby="sc-pay-note">Create payment request</Button>
            </div>
          </section>
        </div>

        <footer class="sc__footer">
          <p id="sale-blocker" class="sc__hint" aria-live="polite">{{ blocker }}</p>
          <Button variant="outline" color="neutral" type="button" :disabled="creating" @click="openSales()">Cancel</Button>
          <Button type="button" :disabled="!!blocker" :aria-describedby="blocker ? 'sale-blocker' : undefined" :aria-busy="creating" @click="create">
            {{ creating ? 'Creating…' : 'Create transaction' }}
          </Button>
        </footer>
      </div>

      <SalesInvoicePreview
        v-if="previewOpen"
        class="sc__preview"
        :buyer="previewBuyer"
        :lines="lines"
        :due-on="dueOn"
        @hide="previewOpen = false"
      />
    </div>
  </div>
</template>

<style scoped>
.sc {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-5);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

/* Icons are masks, so they take the text colour of whatever holds them. */
.sc__mask {
  display: inline-block;
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  background: currentcolor;
  mask: var(--icon) center / contain no-repeat;
  -webkit-mask: var(--icon) center / contain no-repeat;
}

.sc__mask--back { --icon: url('/icons/ui-actions/arrow-back.svg'); width: 24px; height: 24px; flex-basis: 24px; }
.sc__mask--group { --icon: url('/icons/social/groups.svg'); width: 20px; height: 20px; flex-basis: 20px; }
.sc__mask--link { --icon: url('/icons/communications/link.svg'); }
.sc__mask--share { --icon: url('/icons/social/share.svg'); }
.sc__mask--eye { --icon: url('/icons/common-actions/visibility.svg'); }
.sc__mask--chevron { --icon: url('/icons/ui-actions/expand-more.svg'); color: var(--semantic-text-ach-color-text-secondary); }
.sc__mask--person { --icon: url('/icons/social/person-add.svg'); }
.sc__mask--verified { --icon: url('/icons/common-actions/verified.svg'); color: var(--semantic-text-success-ach-color-text-success); }
.sc__mask--check,
.sc__mask--ok { --icon: url('/icons/ui-actions/check-circle.svg'); color: var(--semantic-text-success-ach-color-text-success); }
.sc__mask--close { --icon: url('/icons/ui-actions/close.svg'); }
.sc__mask--receipt { --icon: url('/icons/business-payments/receipt-long.svg'); }
.sc__mask--faktur { --icon: url('/icons/custom/e-faktur.svg'); }

.sc__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.sc__title-row,
.sc__share,
.sc__share-text {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
}

.sc__share {
  gap: var(--primitives-padding-3);
}

.sc__share-text {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
}

.sc__back {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--primitives-border-radius-sm);
  background: none;
  color: inherit;
  cursor: pointer;
}

.sc__back:hover {
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.sc__back:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.sc__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-3xl);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xl);
}

.sc__title:focus {
  outline: none;
}

/* Form on the left, the Preview on the right, the way the live page splits them. */
.sc__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: var(--primitives-padding-4);
}

.sc__layout--preview {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.sc__main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.sc__preview {
  position: sticky;
  top: calc(var(--component-topbar-height) + var(--primitives-padding-4));
  min-height: 560px;
}

.sc__card {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-5);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-card-background);
  box-shadow:
    calc(var(--primitives-shadows-sm-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-sm-shadow-1-blur) * 1px)
      var(--primitives-shadows-sm-color);
}

.sc__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-3);
}

.sc__h2 {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 500;
  line-height: var(--primitives-line-heights-lg);
}

.sc__sub,
.sc__hint,
.sc__option-meta {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.sc__hint--link {
  color: var(--semantic-text-ach-color-text-link);
}

/* Inputs with a trailing check or chevron inside the border. */
.sc__control {
  position: relative;
}

.sc__input--trail {
  padding-right: var(--primitives-padding-10);
}

.sc__trail {
  position: absolute;
  top: 50%;
  right: var(--primitives-padding-3);
  transform: translateY(-50%);
  pointer-events: none;
}

.sc__trail--top {
  top: var(--primitives-padding-3);
  transform: none;
}

.sc__trail--pair {
  display: flex;
  gap: var(--primitives-padding-1);
}

.sc__search {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.sc__options {
  position: absolute;
  z-index: 5;
  top: 40px;
  right: 0;
  left: 0;
  max-height: 380px;
  margin: 0;
  padding: var(--primitives-padding-1);
  overflow: auto;
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-card-background);
  box-shadow:
    calc(var(--primitives-shadows-md-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-blur) * 1px)
      calc(var(--primitives-shadows-md-shadow-1-spread) * 1px)
      var(--primitives-shadows-md-color);
  list-style: none;
}

.sc__option {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  border: 0;
  border-radius: var(--primitives-border-radius-sm);
  background: none;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.sc__option:hover,
.sc__option:focus-visible {
  outline: none;
  background: var(--semantic-bg-ach-color-bg-surface-hover);
}

.sc__option-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.sc__option--new {
  justify-content: flex-start;
  gap: var(--primitives-padding-2);
  color: var(--semantic-text-ach-color-text-link);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
}

.sc__option-name,
.sc__summary-name {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.sc__pulse-tag {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  cursor: help;
}


.sc__pulse-value {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  font-size: var(--primitives-font-sizes-sm);
  font-variant-numeric: tabular-nums;
}


.sc__option-empty {
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
}

.sc__verified-banner {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  margin: 0;
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-badge-success-background);
  font-size: var(--primitives-font-sizes-sm);
}

.sc__verified-banner strong {
  font-weight: 600;
}

.sc__form,
.sc__summary {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.sc__summary {
  gap: var(--primitives-padding-1);
}

/* The panel's root carries this component's scope, so it can be spaced from here. */
.sc__summary > .bp {
  margin-top: var(--primitives-padding-3);
}

.sc__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-4);
}

.sc__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.sc__field--wide {
  grid-column: 1 / -1;
}

.sc__field--due {
  max-width: 220px;
}

.sc__label {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.sc__req {
  color: var(--semantic-text-error-ach-color-text-error);
}

.sc__select,
.sc__textarea,
.sc__phone {
  box-sizing: border-box;
  width: 100%;
  border: var(--primitives-border-width-default) solid var(--component-input-border);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-card-background);
  color: inherit;
  font: inherit;
  font-size: var(--primitives-font-sizes-sm);
}

.sc__select {
  height: 36px;
  padding: 0 var(--primitives-padding-12) 0 var(--primitives-padding-3);
  appearance: none;
}

.sc__textarea {
  padding: var(--primitives-padding-2) var(--primitives-padding-10) var(--primitives-padding-2) var(--primitives-padding-3);
  line-height: var(--primitives-line-heights-sm);
  resize: vertical;
}

.sc__textarea--email {
  min-height: 56px;
}

.sc__select:focus-visible,
.sc__textarea:focus-visible,
.sc__phone:focus-within {
  border-color: var(--component-input-border-focus);
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: var(--primitives-border-width-2);
}

.sc__radios {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--primitives-padding-4);
  margin: 0;
  padding: 0;
  border: 0;
  font-size: var(--primitives-font-sizes-sm);
}

.sc__radios legend {
  width: 100%;
  margin-bottom: var(--primitives-padding-1);
}

.sc__radios label {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
}

.sc__phone {
  display: flex;
  height: 36px;
  align-items: stretch;
  overflow: hidden;
}

.sc__phone-code {
  width: 88px;
  padding: 0 var(--primitives-padding-3);
  border: 0;
  border-right: var(--primitives-border-width-default) solid var(--component-input-border);
  background: none;
  color: inherit;
  font: inherit;
}

.sc__phone-input {
  min-width: 0;
  flex: 1;
  padding: 0 var(--primitives-padding-3);
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  outline: none;
}

.sc__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-4);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
}

.sc__toggle-title {
  margin: 0 0 var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
}

.sc__switch {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--primitives-padding-2);
  cursor: pointer;
  font-size: var(--primitives-font-sizes-sm);
}

.sc__switch input {
  position: absolute;
  opacity: 0;
}

.sc__switch-track {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-border-ach-color-border-strong);
  transition: background var(--semantic-motion-duration-fast);
}

.sc__switch-track::after {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-card-background);
  content: '';
  transition: transform var(--semantic-motion-duration-fast);
}

.sc__switch input:checked + .sc__switch-track {
  background: var(--semantic-bg-ach-color-bg-inverse);
}

.sc__switch input:checked + .sc__switch-track::after {
  transform: translateX(16px);
}

.sc__switch input:focus-visible + .sc__switch-track {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

@media (prefers-reduced-motion: reduce) {
  .sc__switch-track,
  .sc__switch-track::after {
    transition: none;
  }
}

.sc__error {
  margin: 0;
  color: var(--semantic-text-error-ach-color-text-error);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.sc__actions,
.sc__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--primitives-padding-3);
}

.sc__footer > .sc__hint {
  flex: 1;
}

.sc__rest {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.sc__rest--locked {
  opacity: 0.5;
}

.sc__lines {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sc__line {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 140px 32px;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-2) 0;
  border-bottom: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  font-size: var(--primitives-font-sizes-sm);
  font-variant-numeric: tabular-nums;
}

.sc__line-meta {
  color: var(--semantic-text-ach-color-text-secondary);
}

.sc__line-total {
  text-align: right;
}

/* The live page's single "add an item" row: a bordered strip with the input and the Add link. */
.sc__entry {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-1) var(--primitives-padding-1) var(--primitives-padding-1) var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--component-input-border);
  border-radius: var(--primitives-border-radius-md);
  color: var(--semantic-text-ach-color-text-secondary);
}

.sc__entry:focus-within {
  border-color: var(--component-input-border-focus);
}

.sc__entry-input {
  min-width: 0;
  height: 32px;
  padding: 0 var(--primitives-padding-2);
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: none;
  color: var(--semantic-text-ach-color-text-default);
  font: inherit;
  font-size: var(--primitives-font-sizes-sm);
}

.sc__entry-input:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
}

.sc__entry-name {
  flex: 1;
}

.sc__entry-qty {
  width: 56px;
  border-left: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.sc__entry-price {
  width: 120px;
  border-left: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
}

.sc__entry-add {
  padding: 0 var(--primitives-padding-2);
}

.sc__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--semantic-bg-ach-color-bg-surface-active);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.sc__docs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-2) var(--primitives-padding-4);
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-subtle);
  border-radius: var(--primitives-border-radius-sm);
}

.sc__docs > .sc__hint {
  margin-right: auto;
}

.sc__doc {
  display: inline-flex;
  align-items: center;
  gap: var(--primitives-padding-1);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
}

.sc__why {
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-illustration);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-illustration-tint);
}

.sc__why-title {
  margin: 0 0 var(--primitives-padding-2);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
}

.sc__why-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--primitives-padding-2) var(--primitives-padding-6);
  margin: 0;
  padding-left: var(--primitives-padding-5);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  list-style: disc;
}

.sc__pay {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--primitives-padding-3);
}

@container app-workspace (max-width: 960px) {
  .sc__layout--preview {
    grid-template-columns: minmax(0, 1fr);
  }

  .sc__preview {
    position: static;
    min-height: 0;
  }
}

@container app-workspace (max-width: 640px) {
  .sc__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .sc__entry {
    flex-wrap: wrap;
  }

  .sc__line {
    grid-template-columns: minmax(0, 1fr) auto 32px;
  }

  .sc__line-meta {
    display: none;
  }
}
</style>
