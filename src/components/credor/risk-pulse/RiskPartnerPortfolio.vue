<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppView } from '@/composables/useAppView'
import { usePartnerAccess } from '@/composables/usePartnerAccess'
import RiskPartnerRequestDialog from './RiskPartnerRequestDialog.vue'
import RiskPartnerTable from './RiskPartnerTable.vue'
import type { PartnerScore } from './partner-access'

// One partner table everywhere: the Company Health chapter previews the first few rows of the Partners page table.
const props = withDefaults(defineProps<{ partners: PartnerScore[]; limit?: number; idPrefix?: string }>(), {
  limit: undefined,
  idPrefix: 'rp-partner',
})

const { request, resend } = usePartnerAccess()
const { openPartnerReport, openConsentPage } = useAppView()

const rows = computed(() => (props.limit ? props.partners.slice(0, props.limit) : props.partners))

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
  ;(row?.querySelector<HTMLElement>('.ptable__actions button') ?? row)?.focus()
}

// The Partners page opens the request dialog for a company it just added from an NPWP check.
defineExpose({ openRequest })
</script>

<template>
  <RiskPartnerTable
    :partners="rows"
    :id-prefix="idPrefix"
    :compact="!!limit"
    @request="openRequest"
    @open="openConsentPage"
    @resend="resend"
    @report="openPartnerReport"
  />
  <RiskPartnerRequestDialog v-model:open="requestOpen" :partner="active" @sent="request" @closed="focusRow" />
</template>
