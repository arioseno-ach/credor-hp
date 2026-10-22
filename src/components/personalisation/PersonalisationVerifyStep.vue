<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import type { CompanyIdentity } from '@/components/credor/personalisation'
import CompanyIdentityCard from './CompanyIdentityCard.vue'

const props = defineProps<{
  company: CompanyIdentity
  npwp: string
  verifying: boolean
  verified: boolean
  consent: boolean
}>()

const emits = defineEmits<{
  'update:npwp': [payload: string]
  'update:consent': [payload: boolean]
  verify: []
}>()
</script>

<template>
  <form class="verify-step" @submit.prevent="emits('verify')">
    <div class="verify-step__field-row">
      <div class="verify-step__field">
        <label class="verify-step__label" for="personalisation-npwp">
          Company NPWP or NIK
          <span class="verify-step__required" aria-hidden="true">*</span>
        </label>
        <Input
          id="personalisation-npwp"
          :model-value="props.npwp"
          class="verify-step__input"
          placeholder="09.456.789.0-123.000"
          :disabled="props.verified"
          @update:model-value="emits('update:npwp', String($event))"
        />
      </div>

      <Button
        variant="outline"
        color="primary"
        size="default"
        type="submit"
        class="verify-step__verify"
        :disabled="props.verified || props.verifying || !props.npwp.trim()"
        :aria-busy="props.verifying"
      >
        <template v-if="props.verifying" #leadingIcon>
          <span class="verify-step__spinner" aria-hidden="true"></span>
        </template>
        {{ props.verifying ? 'Verifying' : 'Verify' }}
      </Button>
    </div>

    <CompanyIdentityCard v-if="props.verified" :company="props.company">
      <template #alert>
        <p class="verify-step__alert" role="status">
          <span class="verify-step__alert-icon" aria-hidden="true"></span>
          NPWP verified. You’re ready to continue.
        </p>
      </template>
    </CompanyIdentityCard>

    <Checkbox
      :model-value="props.consent"
      class="verify-step__consent"
      @update:model-value="emits('update:consent', $event)"
    >
      I agree and confirm that I am legally authorized to act on behalf of the company or entity, or
      on my own behalf where applicable, under Indonesian law, and to accept the Terms &amp;
      Conditions and Privacy Policy.
    </Checkbox>
  </form>
</template>

<style scoped>
.verify-step {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.verify-step__field-row {
  display: flex;
  min-width: 0;
  align-items: flex-end;
  gap: var(--primitives-padding-4);
}

.verify-step__field {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.verify-step__label {
  display: flex;
  align-items: flex-start;
  gap: var(--primitives-padding-1);
  color: var(--component-input-label-text);
  font-family: var(--primitives-font-families-body), sans-serif;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  letter-spacing: var(--primitives-letter-spacing-wide);
  line-height: var(--primitives-line-heights-xs);
}

.verify-step__required {
  color: var(--component-input-error-text);
}

.verify-step__input {
  height: auto;
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
}

.verify-step__verify {
  min-width: 104px;
}

.verify-step__verify:deep(.ach-button) {
  border-radius: var(--primitives-border-radius-infinite);
  box-shadow:
    calc(var(--primitives-shadows-xs-x) * 1px)
      calc(var(--primitives-shadows-xs-y) * 1px)
      calc(var(--primitives-shadows-xs-blur) * 1px)
      var(--primitives-shadows-xs-color);
}

.verify-step__spinner {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: var(--primitives-border-radius-infinite);
  background: currentColor;
  mask: url('/icons/ui-actions/sync.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/sync.svg') center / contain no-repeat;
  animation: verify-step-spin 900ms linear infinite;
}

.verify-step__alert {
  display: flex;
  margin: 0;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) var(--primitives-padding-3) var(--primitives-padding-3)
    var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid
    var(--semantic-border-success-ach-color-border-success);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--semantic-bg-success-ach-color-bg-success-surface);
  color: var(--semantic-text-success-ach-color-text-success);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 700;
  line-height: var(--primitives-line-heights-2xs);
}

.verify-step__alert-icon {
  display: block;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  background: currentColor;
  mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/check-circle.svg') center / contain no-repeat;
}

.verify-step__consent {
  align-items: flex-start;
}

@keyframes verify-step-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .verify-step__spinner {
    animation: none;
  }
}
</style>
