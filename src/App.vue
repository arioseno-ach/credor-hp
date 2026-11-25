<script setup lang="ts">
import { ToastProvider } from 'reka-ui'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Snackbar, SnackbarViewport } from '@/components/ui/snackbar'
import AppWorkspace from '@/components/layout/AppWorkspace.vue'
import RiskConsentPage from '@/components/credor/risk-pulse/RiskConsentPage.vue'
import { useAppView } from '@/composables/useAppView'
import { useSnackbar } from '@/composables/useSnackbar'

const snackbar = useSnackbar()
const { view } = useAppView()
</script>

<template>
  <ToastProvider>
    <!-- The partner opens the consent page from an email without signing in, so it has no app shell. -->
    <RiskConsentPage v-if="view.name === 'consent'" :partner-id="view.partnerId" />
    <SidebarProvider v-else>
      <AppWorkspace />
    </SidebarProvider>

    <Snackbar
      v-if="snackbar.message.value"
      :key="snackbar.key.value"
      v-model:open="snackbar.isOpen.value"
      :variant="snackbar.message.value.variant"
      :title="snackbar.message.value.title"
      :description="snackbar.message.value.description"
    />
    <SnackbarViewport />
  </ToastProvider>
</template>
