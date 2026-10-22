<script setup lang="ts">
import { SidebarProvider } from '@/components/ui/sidebar'
import AppWorkspace from '@/components/layout/AppWorkspace.vue'
</script>

<template>
  <SidebarProvider>
    <AppWorkspace />
  </SidebarProvider>
</template>
