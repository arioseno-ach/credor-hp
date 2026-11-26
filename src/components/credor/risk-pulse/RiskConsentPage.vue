<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { verifiedCompany } from '@/components/credor/personalisation'
import { useAppView } from '@/composables/useAppView'
import { usePartnerAccess } from '@/composables/usePartnerAccess'
import { useSnackbar } from '@/composables/useSnackbar'
import RiskConsentIllustration from './RiskConsentIllustration.vue'
import RiskTrustCard from './RiskTrustCard.vue'
import { ACCESS_DAYS, accessUntil, canConsent, formatNpwp, npwpDigits } from './partner-access'

const props = defineProps<{ partnerId: string }>()

const { openPartners } = useAppView()
const { partners, answerFromLink, completeSetup } = usePartnerAccess()
const { show } = useSnackbar()

const partner = computed(() => partners.value.find((item) => item.id === props.partnerId))
const ready = computed(() => !!partner.value && canConsent(partner.value))

// form → a final screen; each answer is confirmed in its own dialog. A request already answered opens on its final screen.
type Step = 'form' | 'approved' | 'rejected'
const step = ref<Step>(
  partner.value?.status === 'unlocked' ? 'approved' : partner.value?.status === 'declined' ? 'rejected' : 'form',
)

const npwp = ref('')
const passphrase = ref('')
const authKey = ref('')
// Credor guardrail: data-access consent is never pre-checked.
const agreed = ref(false)
const reason = ref('')
const submitted = ref(false)
const working = ref(false)

const errors = computed(() => {
  if (!submitted.value || !partner.value) return { npwp: '', passphrase: '', authKey: '', agreed: '' }
  const digits = npwpDigits(npwp.value)
  const own = partner.value.npwp
  return {
    npwp: !digits
      ? 'Enter your company NPWP.'
      : digits !== own && `0${digits}` !== own
        ? `This NPWP does not match ${partner.value.name}, the company this request was sent to.`
        : '',
    passphrase: passphrase.value ? '' : 'Enter your DJP Online passphrase.',
    authKey: authKey.value.trim() ? '' : 'Enter the auth key from your DJP Online account.',
    agreed: agreed.value ? '' : 'Tick the agreement to approve.',
  }
})
const firstError = computed(() => Object.entries(errors.value).find(([, message]) => message)?.[0])

const heading = ref<HTMLElement | null>(null)
const verifyOpen = ref(false)

function openVerify() {
  submitted.value = false
  verifyOpen.value = true
}

function guardClose(event: Event) {
  if (working.value) event.preventDefault()
}

// Reka only restores focus to a DialogTrigger: after approving, the result heading; after cancelling, Approve again.
function afterVerify(event: Event) {
  event.preventDefault()
  // One frame later: the approved screen replaces the card, and its heading is the new element.
  requestAnimationFrame(() => {
    if (step.value === 'approved') heading.value?.focus()
    else document.getElementById('consent-approve')?.focus()
  })
}

async function approve() {
  if (working.value) return
  submitted.value = true
  if (firstError.value) {
    await nextTick()
    // The checkbox component renders a label, so its input is found by class.
    const target =
      firstError.value === 'agreed'
        ? document.querySelector<HTMLElement>('.cp-verify .ach-checkbox__input')
        : document.getElementById(`consent-${firstError.value}`)
    target?.focus()
    return
  }
  working.value = true
  // Prototype: stands in for checking the credentials with Achilles.
  await new Promise((resolve) => window.setTimeout(resolve, 800))
  working.value = false
  answerFromLink(props.partnerId, true)
  step.value = 'approved'
  verifyOpen.value = false
}

const rejectOpen = ref(false)

function confirmReject() {
  answerFromLink(props.partnerId, false)
  step.value = 'rejected'
  rejectOpen.value = false
}

// Same focus hand-off as approving: the result heading after rejecting, Reject again after cancelling.
function afterReject(event: Event) {
  event.preventDefault()
  requestAnimationFrame(() => {
    if (step.value === 'rejected') heading.value?.focus()
    else document.getElementById('consent-reject')?.focus()
  })
}

// Prototype: back to the requester's side, where their notification would arrive.
function backToRequester() {
  const name = partner.value?.name
  if (step.value === 'approved') show({ variant: 'success', title: `${name} shared their report`, description: 'You can view it or download the PDF from Partners.' })
  if (step.value === 'rejected') show({ variant: 'neutral', title: `${name} declined your request`, description: reason.value ? `Their reason: ${reason.value}` : 'You can send a new request later.' })
  openPartners()
}

onMounted(() => heading.value?.focus({ preventScroll: true }))
</script>

<template>
  <div class="cp">
    <header class="cp__bar">
      <img src="/logo/logo-achilles-wordmark-black-24px.svg" alt="Achilles" class="cp__logo">
      <span class="cp__bar-label">Consent request</span>
    </header>

    <main class="cp__main">
      <div v-if="!partner" class="cp__card">
        <h1 ref="heading" class="cp__title" tabindex="-1">This link is not valid</h1>
        <p class="cp__text">The request may have been withdrawn, or the link was copied incompletely. Ask the company that sent it for a new link.</p>
      </div>

      <div v-else-if="step === 'approved'" class="cp__card cp__card--result">
        <RiskConsentIllustration state="approved" :owner="partner.name" :requester="verifiedCompany.name" />
        <h1 ref="heading" class="cp__title" tabindex="-1">You approved the request</h1>
        <p class="cp__text">
          {{ verifiedCompany.name }} can see your Company Health report until {{ partner.accessUntil ?? accessUntil(new Date()) }}.
          You can revoke access at any time in Achilles, under Partners, Access granted.
        </p>
      </div>

      <div v-else-if="step === 'rejected'" class="cp__card cp__card--result">
        <RiskConsentIllustration state="rejected" :owner="partner.name" :requester="verifiedCompany.name" />
        <h1 ref="heading" class="cp__title" tabindex="-1">You rejected the request</h1>
        <p class="cp__text">
          {{ verifiedCompany.name }} will not see your Company Health report. We let them know<template v-if="reason">, with your reason</template>.
        </p>
      </div>

      <template v-else>
        <section class="cp__card" aria-labelledby="consent-title">
          <RiskConsentIllustration :owner="partner.name" :requester="verifiedCompany.name" />
          <h1 id="consent-title" ref="heading" class="cp__title" tabindex="-1">
            {{ verifiedCompany.name }} asks to see your Company Health report
          </h1>
          <p class="cp__text">
            They have transacted with you on Achilles and want to check your report before their next deal. Nothing is
            shared unless you approve.
          </p>

          <dl class="cp__facts">
            <div><dt>Requested by</dt><dd>{{ verifiedCompany.name }}</dd></div>
            <div><dt>Their NPWP</dt><dd>{{ formatNpwp(verifiedCompany.npwp) }}</dd></div>
            <div><dt>Consent code</dt><dd class="cp__code">{{ partner.consentCode ?? 'Issued when sent' }}</dd></div>
            <div><dt>Access for</dt><dd>{{ ACCESS_DAYS }} days</dd></div>
          </dl>

          <div class="cp__share">
            <div>
              <h2 class="cp__h2">They will see</h2>
              <ul class="cp__list cp__list--shared">
                <li>Your Company Health score and its band</li>
                <li>The areas and indicators behind the score</li>
                <li>A PDF copy of the report</li>
              </ul>
            </div>
            <div>
              <h2 class="cp__h2">Stays private</h2>
              <ul class="cp__list cp__list--private">
                <li>Your transactions and invoices</li>
                <li>Your tax filings</li>
              </ul>
            </div>
          </div>
          <p class="cp__note">You can revoke access at any time in Achilles. A PDF they already downloaded stays with them.</p>

          <template v-if="step === 'form'">
            <Alert
              v-if="!ready"
              id="consent-setup-alert"
              status="warning"
              title-text="Set up your DJP Online auth key first"
              description-text="Approving uses the auth key from your DJP Online account. Set it up there, then open this link again."
              :has-action="false"
              :dismissible="false"
            />
            <!-- The decision is the only thing to do here; identity is checked once the user chooses to approve. -->
            <footer class="cp__actions cp__actions--decision">
              <Button id="consent-reject" variant="outline" color="neutral" type="button" @click="rejectOpen = true">Reject</Button>
              <Button
                id="consent-approve"
                type="button"
                :disabled="!ready"
                :aria-describedby="ready ? undefined : 'consent-setup-alert'"
                @click="openVerify"
              >
                Approve
              </Button>
            </footer>
          </template>
        </section>

        <RiskTrustCard />

        <Dialog v-model:open="verifyOpen">
          <DialogContent
            :show-close="false"
            @escape-key-down="guardClose"
            @interact-outside="guardClose"
            @close-auto-focus="afterVerify"
          >
            <form class="cp-verify" novalidate @submit.prevent="approve">
              <DialogTitle class="cp__title cp-verify__title">Confirm it is your company</DialogTitle>
              <DialogDescription class="cp__text">
                No sign-in needed. Verify your company with your NPWP, passphrase, and auth key from DJP Online.
              </DialogDescription>

              <div class="cp__field">
                <label for="consent-npwp" class="cp__label">Company NPWP</label>
                <Input
                  id="consent-npwp"
                  v-model="npwp"
                  inputmode="numeric"
                  autocomplete="off"
                  :disabled="working"
                  :aria-invalid="!!errors.npwp"
                  :aria-describedby="errors.npwp ? 'consent-npwp-error' : undefined"
                />
                <p v-if="errors.npwp" id="consent-npwp-error" class="cp__error">{{ errors.npwp }}</p>
              </div>
              <div class="cp__field">
                <label for="consent-passphrase" class="cp__label">Passphrase</label>
                <Input
                  id="consent-passphrase"
                  v-model="passphrase"
                  type="password"
                  autocomplete="current-password"
                  :disabled="working"
                  :aria-invalid="!!errors.passphrase"
                  :aria-describedby="errors.passphrase ? 'consent-passphrase-error' : undefined"
                />
                <p v-if="errors.passphrase" id="consent-passphrase-error" class="cp__error">{{ errors.passphrase }}</p>
              </div>
              <div class="cp__field">
                <label for="consent-authKey" class="cp__label">Auth key</label>
                <Input
                  id="consent-authKey"
                  v-model="authKey"
                  type="password"
                  autocomplete="off"
                  :disabled="working"
                  :aria-invalid="!!errors.authKey"
                  :aria-describedby="errors.authKey ? 'consent-authKey-error' : 'consent-authKey-hint'"
                />
                <p v-if="errors.authKey" id="consent-authKey-error" class="cp__error">{{ errors.authKey }}</p>
                <p v-else id="consent-authKey-hint" class="cp__hint">
                  You can check your passphrase and auth key in your DJP Online account.
                </p>
              </div>

              <div class="cp__field">
                <Checkbox v-model="agreed">
                  I agree to share my Company Health report with {{ verifiedCompany.name }} for {{ ACCESS_DAYS }} days,
                  in Achilles and as a PDF.
                </Checkbox>
                <!-- The checkbox primitive keeps its attributes on the label, so the error announces itself. -->
                <p v-if="errors.agreed" class="cp__error" role="alert">{{ errors.agreed }}</p>
              </div>

              <footer class="cp__actions">
                <Button variant="outline" color="neutral" type="button" :disabled="working" @click="verifyOpen = false">
                  Cancel
                </Button>
                <Button type="submit" :aria-busy="working">{{ working ? 'Checking…' : 'Approve and share' }}</Button>
              </footer>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog v-model:open="rejectOpen">
          <DialogContent :show-close="false" @close-auto-focus="afterReject">
            <form class="cp-verify" @submit.prevent="confirmReject">
              <DialogTitle class="cp__title cp-verify__title">Reject this request?</DialogTitle>
              <DialogDescription class="cp__text">
                {{ verifiedCompany.name }} will not see your Company Health report. They can send a new request later.
              </DialogDescription>
              <div class="cp__field">
                <label for="consent-reason" class="cp__label">Reason (optional)</label>
                <textarea id="consent-reason" v-model="reason" class="cp__textarea" rows="3" maxlength="300"></textarea>
                <p class="cp__hint">We pass this on to {{ verifiedCompany.name }}.</p>
              </div>
              <footer class="cp__actions">
                <Button variant="outline" color="neutral" type="button" @click="rejectOpen = false">Cancel</Button>
                <Button variant="destructive" type="submit">Reject request</Button>
              </footer>
            </form>
          </DialogContent>
        </Dialog>
      </template>
    </main>

    <!-- Prototype only: the partner's page has no way back into the requester's app. -->
    <aside class="cp__demo" aria-label="Prototype controls">
      <span>Prototype</span>
      <Button
        v-if="partner && !ready && step === 'form'"
        variant="link"
        size="small"
        type="button"
        @click="completeSetup(partner.id)"
      >
        Simulate setup complete
      </Button>
      <span v-if="partner && step === 'form'">NPWP for this demo: {{ formatNpwp(partner.npwp) }}</span>
      <Button variant="link" size="small" type="button" @click="backToRequester">Back to Partners</Button>
    </aside>
  </div>
</template>

<style scoped>
.cp {
  min-height: 100vh;
  /* A soft tint at the bottom that fades upward into pure white. */
  background: linear-gradient(
      0deg,
      var(--semantic-bg-ach-color-bg-illustration-tint) 0,
      var(--semantic-bg-ach-color-bg-surface) 480px
    )
    no-repeat,
    var(--semantic-bg-ach-color-bg-surface);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.cp__bar {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-4) var(--primitives-padding-6);
  background: var(--semantic-bg-ach-color-bg-surface);
}

.cp__logo {
  height: 24px;
}

.cp__bar-label {
  padding-left: var(--primitives-padding-3);
  border-left: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.cp__main {
  display: flex;
  max-width: 640px;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  margin: 0 auto;
  padding: var(--primitives-padding-8) var(--primitives-padding-4) var(--primitives-padding-20);
}

.cp__card {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-6);
  border-radius: var(--primitives-border-radius-lg);
  background: var(--component-card-background);
}

.cp__card--result {
  align-items: flex-start;
}


.cp__note,
.cp__hint {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.cp__title {
  margin: 0;
  font-family: var(--primitives-font-families-display), sans-serif;
  font-size: var(--primitives-font-sizes-xl);
  font-weight: 700;
  line-height: var(--primitives-line-heights-xl);
}

.cp__title:focus {
  outline: none;
}

.cp__h2 {
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.cp__text {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.cp__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-3) var(--primitives-padding-6);
  margin: 0;
  padding: var(--primitives-padding-4);
  border-radius: var(--primitives-border-radius-md);
  background: var(--semantic-bg-ach-color-bg-surface-secondary);
}

.cp__facts dt {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.cp__facts dd {
  margin: 0;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
  font-variant-numeric: tabular-nums;
}

.cp__share {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--primitives-padding-6);
}

.cp__list {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-2);
  margin: var(--primitives-padding-2) 0 0;
  padding: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
  list-style: none;
}

/* A check for what is shared, a cross for what stays private; the headings already say which is which. */
.cp__list li {
  display: flex;
  align-items: flex-start;
  gap: var(--primitives-padding-2);
}

.cp__list li::before {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  margin-top: 2px;
  content: '';
}

.cp__list--shared li::before {
  background: var(--semantic-text-success-ach-color-text-success);
  mask: url('/icons/ui-actions/check.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/check.svg') center / contain no-repeat;
}

.cp__list--private li::before {
  background: var(--semantic-text-ach-color-text-secondary);
  mask: url('/icons/ui-actions/close.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/close.svg') center / contain no-repeat;
}

.cp__field {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.cp__label {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.cp__error {
  margin: 0;
  color: var(--semantic-text-error-ach-color-text-error);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

.cp__textarea {
  box-sizing: border-box;
  width: 100%;
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--component-input-border);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-card-background);
  color: inherit;
  font: inherit;
  font-size: var(--primitives-font-sizes-sm);
  resize: vertical;
}

.cp__textarea:focus-visible {
  border-color: var(--component-input-border-focus);
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: var(--primitives-border-width-2);
}

.cp-verify {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
  padding: var(--primitives-padding-6);
}

.cp-verify__title {
  font-size: var(--primitives-font-sizes-lg);
  line-height: var(--primitives-line-heights-lg);
}

.cp__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--primitives-padding-3);
}

/* The decision is the page's one job, so its two buttons split the card width. */
.cp__actions--decision > * {
  flex: 1;
}

.cp__demo {
  position: fixed;
  right: var(--primitives-padding-4);
  bottom: var(--primitives-padding-4);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--primitives-padding-1) var(--primitives-padding-3);
  max-width: calc(100% - 2 * var(--primitives-padding-4));
  padding: var(--primitives-padding-2) var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--component-card-border);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-card-background);
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-xs);
}

@media (max-width: 560px) {
  .cp__facts,
  .cp__share {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
