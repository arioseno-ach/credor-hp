<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppView } from '@/composables/useAppView'
import { usePartnerAccess } from '@/composables/usePartnerAccess'
import RiskPartnerList from './RiskPartnerList.vue'
import RiskPartnerRequestDialog from './RiskPartnerRequestDialog.vue'
import RiskPartnerTable from './RiskPartnerTable.vue'
import type { PartnerScore } from './partner-access'

const props = withDefaults(
  defineProps<{ partners: PartnerScore[]; limit?: number; idPrefix?: string; variant?: 'list' | 'table' }>(),
  { limit: undefined, idPrefix: 'rp-partner', variant: 'list' },
)

const { request, resend } = usePartnerAccess()
const { openPartnerReport, openConsentPage } = useAppView()

const requestOpen = ref(false)
const activeId = ref<string | null>(null)
const active = computed(() => props.partners.find((partner) => partner.id === activeId.value) ?? null)

function openRequest(id: string) {
  activeId.value = id
  requestOpen.value = true
}

// Back to the row's first action after the request dialog closes; a row without one takes focus itself.
function focusRow() {
  const row = document.getElementById(`${props.idPrefix}-${activeId.value}`)
  ;(row?.querySelector<HTMLElement>('.ptable__actions button, .partner__score button') ?? row)?.focus()
}

// The Partners page opens the request dialog for a company it just added from an NPWP check.
defineExpose({ openRequest })
</script>

<template>
  <RiskPartnerTable
    v-if="variant === 'table'"
    :partners="partners"
    :id-prefix="idPrefix"
    @request="openRequest"
    @open="openConsentPage"
    @resend="resend"
    @report="openPartnerReport"
  />
  <RiskPartnerList
    v-else
    :partners="partners"
    :limit="limit"
    :id-prefix="idPrefix"
    @request="openRequest"
    @open="openConsentPage"
  />
  <RiskPartnerRequestDialog v-model:open="requestOpen" :partner="active" @sent="request" @closed="focusRow" />
</template>
