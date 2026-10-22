<script setup lang="ts">
import ApInvoiceIllustration from '@/components/financing/illustrations/ApInvoiceIllustration.vue'
import ArInvoiceIllustration from '@/components/financing/illustrations/ArInvoiceIllustration.vue'
import ShortTermIllustration from '@/components/financing/illustrations/ShortTermIllustration.vue'
import type { FinancingOptionIllustration } from '@/components/credor/financing-options'

defineProps<{
  type: FinancingOptionIllustration
}>()
</script>

<template>
  <ArInvoiceIllustration v-if="type === 'ar'" />
  <ApInvoiceIllustration v-else-if="type === 'ap'" />
  <ShortTermIllustration v-else />
</template>
