<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import type { CompanyIdentity, CoretaxCredentials } from '@/components/credor/personalisation'
import CompanyIdentityCard from './CompanyIdentityCard.vue'

const props = defineProps<{
  company: CompanyIdentity
  credentials: CoretaxCredentials
}>()

const emits = defineEmits<{
  'update:credentials': [payload: CoretaxCredentials]
}>()

const passphraseVisible = ref(false)
const keyVisible = ref(false)

function update(field: keyof CoretaxCredentials, value: string): void {
  emits('update:credentials', { ...props.credentials, [field]: value })
}
</script>

<template>
  <form class="coretax-step" @submit.prevent>
    <CompanyIdentityCard :company="props.company" verified show-npwp15 />

    <div class="coretax-step__field">
      <label class="coretax-step__label" for="coretax-pic-npwp">
        NPWP/NIK Coretax PIC
        <span class="coretax-step__required" aria-hidden="true">*</span>
      </label>
      <Input
        id="coretax-pic-npwp"
        :model-value="props.credentials.picNpwp"
        class="coretax-step__input"
        placeholder="12.318.912.3-781.231"
        @update:model-value="update('picNpwp', String($event))"
      />
    </div>

    <div class="coretax-step__row">
      <div class="coretax-step__field">
        <label class="coretax-step__label" for="coretax-signatory-npwp">
          Signatory’s NPWP/NIK
          <span class="coretax-step__required" aria-hidden="true">*</span>
        </label>
        <Input
          id="coretax-signatory-npwp"
          :model-value="props.credentials.signatoryNpwp"
          class="coretax-step__input"
          placeholder="09.876.543.2-109.876"
          @update:model-value="update('signatoryNpwp', String($event))"
        />
      </div>

      <div class="coretax-step__field">
        <label class="coretax-step__label" for="coretax-signatory-name">
          Signatory name
          <span class="coretax-step__required" aria-hidden="true">*</span>
        </label>
        <Input
          id="coretax-signatory-name"
          :model-value="props.credentials.signatoryName"
          class="coretax-step__input"
          placeholder="Budi Hartono"
          @update:model-value="update('signatoryName', String($event))"
        />
      </div>
    </div>

    <div class="coretax-step__field">
      <label class="coretax-step__label" for="coretax-passphrase">
        Coretax Passphrase
        <span class="coretax-step__required" aria-hidden="true">*</span>
      </label>
      <div class="coretax-step__input-wrap">
        <Input
          id="coretax-passphrase"
          :model-value="props.credentials.passphrase"
          class="coretax-step__input coretax-step__input--secret"
          :type="passphraseVisible ? 'text' : 'password'"
          placeholder="Enter your Coretax passphrase"
          @update:model-value="update('passphrase', String($event))"
        />
        <button
          type="button"
          class="coretax-step__reveal"
          :aria-label="passphraseVisible ? 'Hide Coretax passphrase' : 'Show Coretax passphrase'"
          :aria-pressed="passphraseVisible"
          @click="passphraseVisible = !passphraseVisible"
        >
          <img
            :src="passphraseVisible ? '/icons/common-actions/visibility-off.svg' : '/icons/common-actions/visibility.svg'"
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <div class="coretax-step__field">
      <label class="coretax-step__label" for="coretax-authentication-key">
        Authentication key
        <span class="coretax-step__required" aria-hidden="true">*</span>
      </label>
      <div class="coretax-step__input-wrap">
        <Input
          id="coretax-authentication-key"
          :model-value="props.credentials.authenticationKey"
          class="coretax-step__input coretax-step__input--secret"
          :type="keyVisible ? 'text' : 'password'"
          placeholder="AK-7829-XFGT-91KL"
          @update:model-value="update('authenticationKey', String($event))"
        />
        <button
          type="button"
          class="coretax-step__reveal"
          :aria-label="keyVisible ? 'Hide authentication key' : 'Show authentication key'"
          :aria-pressed="keyVisible"
          @click="keyVisible = !keyVisible"
        >
          <img
            :src="keyVisible ? '/icons/common-actions/visibility-off.svg' : '/icons/common-actions/visibility.svg'"
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.coretax-step {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.coretax-step__row {
  display: flex;
  min-width: 0;
  gap: var(--primitives-padding-4);
}

.coretax-step__row > .coretax-step__field {
  flex: 1;
}

.coretax-step__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.coretax-step__label {
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

.coretax-step__required {
  color: var(--component-input-error-text);
}

.coretax-step__input-wrap {
  position: relative;
  display: flex;
  min-width: 0;
}

.coretax-step__input {
  height: auto;
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
}

.coretax-step__input--secret {
  padding-right: var(--primitives-padding-9);
}

.coretax-step__reveal {
  position: absolute;
  top: 50%;
  right: var(--primitives-padding-3);
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  padding: 0;
  border: 0;
  background: none;
  color: var(--semantic-text-ach-color-text-subtle);
  cursor: pointer;
  transform: translateY(-50%);
}

.coretax-step__reveal img {
  display: block;
  width: 20px;
  height: 20px;
}

.coretax-step__reveal:hover {
  color: var(--semantic-text-ach-color-text-default);
}

.coretax-step__reveal:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: var(--primitives-border-width-2);
  border-radius: var(--primitives-border-radius-xs);
}
</style>
