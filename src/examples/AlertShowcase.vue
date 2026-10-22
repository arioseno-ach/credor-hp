<script setup lang="ts">
import { Alert, type AlertStatus } from '@/components/ui/alert'

const statuses: AlertStatus[] = ['neutral', 'success', 'info', 'warning', 'error']
</script>

<template>
  <section class="alert-showcase" aria-labelledby="alert-showcase-title">
    <h2 id="alert-showcase-title">Alert</h2>

    <div class="alert-showcase__stack">
      <Alert v-for="status in statuses" :key="status" :status="status" />
    </div>
  </section>
</template>

<style scoped>
.alert-showcase {
  display: flex;
  width: min(100%, 480px);
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.alert-showcase h2 {
  margin: 0;
  color: var(--semantic-text-ach-color-text-default);
  font-size: var(--primitives-font-sizes-lg);
  font-weight: 600;
}

.alert-showcase__stack {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}
</style>