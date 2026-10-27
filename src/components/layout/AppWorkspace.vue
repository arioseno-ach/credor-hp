<script setup lang="ts">
import { computed } from 'vue'
import { SidebarInset, useSidebar } from '@/components/ui/sidebar'
import Sidebar from '@/components/layout/Sidebar.vue'
import TopBar from '@/components/layout/TopBar.vue'
import CredorOverviewHeader from '@/components/credor/CredorOverviewHeader.vue'
import CredorFinancingBanner from '@/components/credor/CredorFinancingBanner.vue'
import CredorCompactBanner from '@/components/credor/CredorCompactBanner.vue'
import CredorFinancingOptions from '@/components/credor/CredorFinancingOptions.vue'
import CredorPartnersSection from '@/components/credor/CredorPartnersSection.vue'
import CredorTransactionsSection from '@/components/credor/CredorTransactionsSection.vue'
import CredorPersonalisationAlert from '@/components/credor/CredorPersonalisationAlert.vue'
import LoanSimulationCard from '@/components/financing/LoanSimulationCard.vue'
import LoanCalculatorDialog from '@/components/financing/LoanCalculatorDialog.vue'
import CompanyHealthDialog from '@/components/financing/CompanyHealthDialog.vue'
import PersonalisationDrawer from '@/components/personalisation/PersonalisationDrawer.vue'
import ScenarioSwitcher from '@/components/prototype/ScenarioSwitcher.vue'
import CredorFinancingSidebar from '@/components/credor/CredorFinancingSidebar.vue'
import { usePrototypeState } from '@/lib/prototype/usePrototypeState'

const { isMobile, openMobile, setOpenMobile, toggleSidebar } = useSidebar()
const mobileNavOpen = computed(() => isMobile.value && openMobile.value)

const { bannerVariant, showAlert, showPartners, showTransactions, showLoanSimulationInMain } =
  usePrototypeState()

function closeMobileNav() {
  if (isMobile.value) setOpenMobile(false)
}
</script>

<template>
  <div class="app-shell">
    <Sidebar @select="closeMobileNav" />
    <SidebarInset class="app-workspace">
      <ScenarioSwitcher />
      <TopBar :menu-expanded="mobileNavOpen" @menu-click="toggleSidebar" />
      <main class="app-content">
        <CredorOverviewHeader />
        <CredorPersonalisationAlert v-if="showAlert" />
        <div class="credor-body">
          <section class="credor-body__main" aria-label="Financing offers">
            <CredorFinancingBanner v-if="bannerVariant === 'carousel'" />
            <CredorCompactBanner v-else-if="bannerVariant === 'compact'" />
            <LoanSimulationCard v-if="showLoanSimulationInMain" />
            <CredorTransactionsSection v-if="showTransactions" />
            <CredorPartnersSection v-if="showPartners" />
            <CredorFinancingOptions />
          </section>
          <CredorFinancingSidebar />
        </div>
      </main>
    </SidebarInset>

    <LoanCalculatorDialog />
    <CompanyHealthDialog />
    <PersonalisationDrawer />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.app-workspace {
  min-width: 0;
  min-height: 100vh;
  flex: 1;
  flex-direction: column;
  background: var(--semantic-bg-ach-color-bg-surface);
}

.app-content {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  max-width: 1280px;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  margin-inline: auto;
  gap: var(--primitives-padding-6);
  padding: var(--primitives-padding-4) var(--primitives-padding-6) var(--primitives-padding-6);
  container-name: app-workspace;
  container-type: inline-size;
}

.credor-body {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: start;
  gap: var(--primitives-padding-5);
}

.credor-body__main {
  display: grid;
  min-width: 0;
  gap: var(--primitives-padding-5);
  container-name: credor-main;
  container-type: inline-size;
}

@container app-workspace (max-width: 1120px) {
  .credor-body {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .app-content {
    padding: var(--primitives-padding-4);
  }
}
</style>
