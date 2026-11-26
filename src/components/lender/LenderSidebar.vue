<script setup lang="ts">
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAppView, type LenderNavSection } from '@/composables/useAppView'

type LenderNavItem = {
  id: LenderNavSection
  label: string
  icon: string
  action: () => void
}

const emit = defineEmits<{
  select: [label: string]
}>()

const { state, toggleSidebar } = useSidebar()
const { activeLenderNav, openLenderLeads, openLenderLoans, openLenderSettings } = useAppView()

const navItems: LenderNavItem[] = [
  {
    id: 'leads',
    label: 'Leads',
    icon: '/icons/business-payments/cases.svg',
    action: () => openLenderLeads(),
  },
  {
    id: 'loans',
    label: 'Active Loans',
    icon: '/icons/business-payments/account-balance-wallet.svg',
    action: () => openLenderLoans(),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '/icons/ui-actions/settings.svg',
    action: () => openLenderSettings(),
  },
]

function selectNavItem(item: LenderNavItem) {
  item.action()
  emit('select', item.label)
}
</script>

<template>
  <SidebarPrimitive
    id="primary-navigation"
    class="lender-sidebar border-sidebar-border"
    collapsible="icon"
    aria-label="Lender Portal navigation"
  >
    <SidebarHeader class="lender-sidebar__header">
      <div class="lender-sidebar__brand">
        <span class="lender-sidebar__brand-mark">
          <img src="/logo/logo-credor-symbol-blue-24px.svg" alt="" />
        </span>
        <span class="lender-sidebar__brand-copy">
          <span class="lender-sidebar__brand-title">Lender Portal</span>
          <span class="lender-sidebar__brand-subtitle">Manage Incoming Deals</span>
        </span>
      </div>
    </SidebarHeader>

    <SidebarContent class="lender-sidebar__content">
      <nav class="lender-sidebar__nav" aria-label="Lender menu">
        <SidebarMenu class="lender-sidebar__menu">
          <SidebarMenuItem v-for="item in navItems" :key="item.id">
            <SidebarMenuButton
              class="lender-sidebar__menu-button"
              :is-active="activeLenderNav === item.id"
              :aria-label="item.label"
              :aria-current="activeLenderNav === item.id ? 'page' : undefined"
              :tooltip="item.label"
              @click="selectNavItem(item)"
            >
              <img class="lender-sidebar__icon" :src="item.icon" alt="" />
              <span>{{ item.label }}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </nav>
    </SidebarContent>

    <SidebarFooter class="lender-sidebar__footer">
      <SidebarMenu class="lender-sidebar__menu">
        <SidebarMenuItem>
          <SidebarMenuButton
            class="lender-sidebar__menu-button"
            :aria-label="state === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'"
            :aria-expanded="state !== 'collapsed'"
            :tooltip="state === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'"
            @click="toggleSidebar"
          >
            <img
              class="lender-sidebar__collapse-icon"
              :class="{ 'lender-sidebar__collapse-icon--rotated': state === 'collapsed' }"
              src="/icons/ui-actions/chevron-left.svg"
              alt=""
            />
            <span>{{ state === 'collapsed' ? 'Expand' : 'Collapse' }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </SidebarPrimitive>
</template>

<style scoped>
.lender-sidebar {
  --sidebar-width: 240px;
  --sidebar-width-icon: 62px;
}

.lender-sidebar__header {
  gap: 0;
  padding-top: var(--primitives-padding-3);
  padding-bottom: var(--primitives-padding-4);
  padding-inline: var(--primitives-padding-2);
}

.lender-sidebar__brand {
  box-sizing: border-box;
  display: flex;
  min-height: 58px;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  border: var(--primitives-border-width-default) solid var(--component-sidebar-profile-border);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-sidebar-profile-background);
  box-shadow: 0 1px 1px var(--primitives-shadows-xs-color);
  color: var(--component-sidebar-profile-text);
}

.lender-sidebar__brand-mark {
  display: grid;
  box-sizing: border-box;
  width: var(--primitives-padding-8);
  height: var(--primitives-padding-8);
  flex: 0 0 var(--primitives-padding-8);
  place-items: center;
  border-radius: var(--primitives-border-radius-sm);
  background: var(--semantic-brand-ach-color-brand-subtle);
}

.lender-sidebar__brand-mark img {
  display: block;
  width: var(--primitives-padding-5);
  height: var(--primitives-padding-5);
  object-fit: contain;
}

.lender-sidebar__brand-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: calc(var(--primitives-padding-1) / 2);
}

.lender-sidebar__brand-title,
.lender-sidebar__brand-subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lender-sidebar__brand-title {
  color: var(--component-sidebar-profile-text);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-sm);
}

.lender-sidebar__brand-subtitle {
  color: var(--component-sidebar-profile-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-3xs);
}

.lender-sidebar__content {
  gap: var(--primitives-padding-2);
  padding-inline: var(--primitives-padding-2);
  scrollbar-width: thin;
}

.lender-sidebar__nav {
  display: flex;
  flex-direction: column;
}

.lender-sidebar__menu {
  gap: var(--primitives-padding-1);
}

.lender-sidebar__icon,
.lender-sidebar__collapse-icon {
  display: block;
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  flex: 0 0 var(--primitives-padding-4);
}

:global(.lender-sidebar .lender-sidebar__menu-button) {
  height: 36px;
  min-height: 36px;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-1) var(--primitives-padding-3);
  border-radius: var(--primitives-border-radius-sm);
  color: var(--component-sidebar-item-text);
  font-size: var(--primitives-font-sizes-sm);
}

:global(.lender-sidebar .lender-sidebar__menu-button:hover) {
  background: var(--component-sidebar-item-background-hover);
}

:global(.lender-sidebar .lender-sidebar__menu-button[data-active="true"]) {
  background: var(--component-sidebar-item-background-active);
  font-weight: 500;
}

:global(.lender-sidebar .lender-sidebar__menu-button[data-active="true"]:hover) {
  background: var(--component-sidebar-item-background-active);
}

.lender-sidebar__footer {
  gap: 0;
  padding-block: var(--primitives-padding-3);
  padding-inline: var(--primitives-padding-2);
}

.lender-sidebar__collapse-icon {
  transition: transform 200ms ease-out;
}

.lender-sidebar__collapse-icon--rotated {
  transform: rotate(180deg);
}

:global(.group[data-collapsible="icon"] .lender-sidebar__brand-copy),
:global(.group[data-collapsible="icon"] .lender-sidebar__menu-button > span) {
  display: none;
}

:global(.group[data-collapsible="icon"] .lender-sidebar__brand) {
  width: var(--primitives-padding-10);
  height: var(--primitives-padding-10);
  min-height: var(--primitives-padding-10);
  align-items: center;
  justify-content: center;
  margin-inline: auto;
  padding: var(--primitives-padding-1);
}

:global(.group[data-collapsible="icon"] .lender-sidebar__menu-button) {
  justify-content: center;
  margin-inline: auto;
  padding: var(--primitives-padding-2);
}

@media (prefers-reduced-motion: reduce) {
  .lender-sidebar__collapse-icon {
    transition: none;
  }
}
</style>
