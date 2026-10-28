<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import type { PrototypeStage } from '@/lib/prototype/types'
import { bankAccounts, consentItems, documentCategories, isOnFile } from './requirements'
import FinancingDocumentList from './FinancingDocumentList.vue'

const props = defineProps<{
  stage: PrototypeStage
  uploadedIds: string[]
  uploadingId: string | null
  replacedFiles: Record<string, string>
  replacingId: string | null
  bankId: string | null
  consents: string[]
  itemLabel: string
  needsPaymentAgreement: boolean
}>()

const emits = defineEmits<{
  upload: [id: string]
  replace: [id: string]
  'update:bankId': [id: string]
  'update:consents': [payload: string[]]
}>()

const itemName = computed(() => props.itemLabel.replace(/s$/, ''))

const missingCount = computed(
  () =>
    documentCategories
      .flatMap((category) => category.items)
      .filter(
        (item) => !item.optional && !isOnFile(item, props.stage) && !props.uploadedIds.includes(item.id),
      ).length,
)

function toggleConsent(id: string, checked: boolean) {
  emits(
    'update:consents',
    checked ? [...props.consents, id] : props.consents.filter((consent) => consent !== id),
  )
}
</script>

<template>
  <div class="submit-form">
    <section class="submit-form__section" aria-labelledby="submit-auto-title">
      <h3 id="submit-auto-title">Attached from Transaction Hub</h3>
      <div class="submit-form__box">
        <span class="submit-form__icon submit-form__icon--doc" aria-hidden="true"></span>
        <span class="submit-form__copy">
          <span class="submit-form__label">Invoice PDF, e-Faktur and transaction record</span>
          <span class="submit-form__meta">For this {{ itemName }}. No upload needed.</span>
        </span>
        <span class="submit-form__status">Attached</span>
      </div>
    </section>

    <section class="submit-form__section" aria-labelledby="submit-company-title">
      <div class="submit-form__heading">
        <h3 id="submit-company-title">Company documents</h3>
        <p v-if="missingCount > 0">
          {{ missingCount }} required {{ missingCount === 1 ? 'document' : 'documents' }} still
          needed. Each one is saved to your profile, so you only upload it once.
        </p>
        <p v-else>Check the files lenders will receive. View or replace any of them.</p>
      </div>
      <FinancingDocumentList
        :stage="stage"
        :uploaded-ids="uploadedIds"
        :uploading-id="uploadingId"
        :replaced-files="replacedFiles"
        :replacing-id="replacingId"
        editable
        @upload="emits('upload', $event)"
        @replace="emits('replace', $event)"
      />
    </section>

    <fieldset class="submit-form__section submit-form__banks">
      <legend>Disbursement account</legend>
      <label v-for="account in bankAccounts" :key="account.id" class="submit-form__box submit-form__bank">
        <input
          type="radio"
          name="bank-account"
          :checked="bankId === account.id"
          @change="emits('update:bankId', account.id)"
        />
        <span class="submit-form__copy">
          <span class="submit-form__label">{{ account.bank }} · {{ account.number }}</span>
          <span class="submit-form__meta">{{ account.holder }} · {{ account.note }}</span>
        </span>
      </label>
    </fieldset>

    <p v-if="needsPaymentAgreement" class="submit-form__note">
      <span class="submit-form__icon submit-form__icon--info" aria-hidden="true"></span>
      After review, your buyer signs a payment agreement. We send you the template then, so you
      don't need it now.
    </p>

    <section class="submit-form__section" aria-labelledby="submit-consent-title">
      <h3 id="submit-consent-title">Consent</h3>
      <p class="submit-form__fine-print">
        Financing partners are licensed and supervised by OJK. Each lender sends an offer with the
        amount, interest or service fee, and repayment date. You review and accept an offer before
        any funds are disbursed.
      </p>
      <div class="submit-form__consents">
        <Checkbox
          v-for="item in consentItems"
          :key="item.id"
          :model-value="consents.includes(item.id)"
          :label="item.label"
          @update:model-value="toggleConsent(item.id, $event)"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.submit-form {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-6);
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.submit-form__section {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
  margin: 0;
  padding: 0;
  border: 0;
}

.submit-form__section h3,
.submit-form__section legend {
  margin: 0;
  padding: 0;
  font-size: var(--primitives-font-sizes-md);
  font-weight: 600;
  line-height: var(--primitives-line-heights-md);
}

.submit-form__banks legend {
  margin-bottom: var(--primitives-padding-3);
}

.submit-form__heading {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-1);
}

.submit-form__heading p {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.submit-form__box {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-3) var(--primitives-padding-4);
  border: var(--primitives-border-width-default) solid var(--semantic-border-ach-color-border-default);
  border-radius: var(--primitives-border-radius-md);
}

.submit-form__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.submit-form__label {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
  line-height: var(--primitives-line-heights-sm);
}

.submit-form__meta {
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.submit-form__status {
  flex: 0 0 auto;
  color: var(--semantic-fg-success-ach-color-fg-success);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
}

.submit-form__icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  background: var(--semantic-icon-ach-color-icon-default);
  mask: var(--submit-form-icon) center / contain no-repeat;
  -webkit-mask: var(--submit-form-icon) center / contain no-repeat;
}

.submit-form__icon--doc {
  --submit-form-icon: url('/icons/text-formatting/description.svg');
}

.submit-form__icon--info {
  --submit-form-icon: url('/icons/common-actions/info.svg');
  width: 16px;
  height: 16px;
  flex-basis: 16px;
  margin-top: 2px;
  background: var(--semantic-icon-info-ach-color-icon-info);
}

.submit-form__bank {
  cursor: pointer;
}

.submit-form__bank:has(input:checked) {
  border-color: var(--semantic-border-ach-color-border-strong);
}

.submit-form__bank input {
  margin: 0;
  accent-color: var(--semantic-text-ach-color-text-default);
}

.submit-form__bank input:focus-visible {
  outline: var(--primitives-border-width-2) solid var(--semantic-text-ach-color-text-link);
  outline-offset: var(--primitives-border-width-2);
}

.submit-form__note {
  display: flex;
  align-items: flex-start;
  gap: var(--primitives-padding-2);
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-sm);
  line-height: var(--primitives-line-heights-sm);
}

.submit-form__fine-print {
  margin: 0;
  color: var(--semantic-text-ach-color-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
}

.submit-form__consents {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-3);
}
</style>
