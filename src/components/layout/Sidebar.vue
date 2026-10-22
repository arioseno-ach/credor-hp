<script setup lang="ts">
import { ref } from 'vue'
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

type SidebarItem = {
  label: string
  icon: string
  subtitle?: string
  logo?: string
}

const activeItem = ref('Home')
const companySwitcher = ref<HTMLDetailsElement | null>(null)
const { state, toggleSidebar } = useSidebar()

const platformItems: SidebarItem[] = [
  { label: 'Document', icon: '/icons/text-formatting/description.svg' },
  { label: 'Sales Transaction', icon: '/icons/custom/e-faktur.svg' },
  { label: 'Purchase Transaction', icon: '/icons/business-payments/receipt-long.svg' },
]

const productItems: SidebarItem[] = [
  {
    label: 'Tax & Compliance',
    subtitle: 'by OnlinePajak',
    icon: '',
    logo: '/logo/logo-pajak-symbol-blue-20px.svg',
  },
  {
    label: 'Cash & Financing',
    subtitle: 'by Credor',
    icon: '',
    logo: '/logo/logo-credor-symbol-blue-24px.svg',
  },
  {
    label: 'Insights & Commerce',
    subtitle: 'by Covia',
    icon: '',
    logo: '/logo/logo-covia-symbol-blue-24px.svg',
  },
]

const footerItems: SidebarItem[] = [
  { label: 'Settings', icon: '/icons/ui-actions/settings.svg' },
  { label: 'Help & Support', icon: '/icons/communications/contact-support.svg' },
]

const emit = defineEmits<{
  select: [label: string]
}>()

function selectItem(label: string) {
  activeItem.value = label
  emit('select', label)
}

function closeCompanySwitcher() {
  companySwitcher.value?.removeAttribute('open')
}
</script>

<template>
  <SidebarPrimitive
    id="primary-navigation"
    class="ach-sidebar border-sidebar-border"
    collapsible="icon"
    aria-label="Primary navigation"
  >
    <SidebarHeader class="ach-sidebar__header">
      <details ref="companySwitcher" class="ach-sidebar__company-switcher">
        <summary class="ach-sidebar__company" aria-label="Switch company">
          <span class="ach-sidebar__initials" aria-hidden="true">HT</span>
          <span class="ach-sidebar__company-copy">
            <span class="ach-sidebar__company-name">PT Harapan Terakhir</span>
            <span class="ach-sidebar__badge">Corporate</span>
            <span class="ach-sidebar__company-id">092388209732087340000000</span>
          </span>
          <img class="ach-sidebar__company-chevron" src="/icons/ui-actions/expand-more.svg" alt="" />
        </summary>
        <div class="ach-sidebar__company-menu" role="group" aria-label="Companies">
          <button class="ach-sidebar__company-option" type="button" aria-current="true" @click="closeCompanySwitcher">
            PT Harapan Terakhir
          </button>
          <button class="ach-sidebar__company-option" type="button" disabled>
            Switch company…
          </button>
        </div>
      </details>
    </SidebarHeader>

    <SidebarContent class="ach-sidebar__content">
      <nav class="ach-sidebar__nav" aria-label="Main menu">
        <SidebarMenu class="ach-sidebar__menu">
          <SidebarMenuItem>
            <SidebarMenuButton
              class="ach-sidebar__menu-button"
              :is-active="activeItem === 'Home'"
              aria-label="Home"
              :aria-current="activeItem === 'Home' ? 'page' : undefined"
              tooltip="Home"
              @click="selectItem('Home')"
            >
              <img class="ach-sidebar__icon" src="/icons/ui-actions/home.svg" alt="" />
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup class="ach-sidebar__group">
          <SidebarGroupLabel as="h2" class="ach-sidebar__group-label">Platform</SidebarGroupLabel>
          <SidebarMenu class="ach-sidebar__menu">
            <SidebarMenuItem v-for="item in platformItems" :key="item.label">
              <SidebarMenuButton
                class="ach-sidebar__menu-button"
                :is-active="activeItem === item.label"
                :aria-label="item.label"
                :aria-current="activeItem === item.label ? 'page' : undefined"
                :tooltip="item.label"
                @click="selectItem(item.label)"
              >
                <img class="ach-sidebar__icon" :src="item.icon" alt="" />
                <span>{{ item.label }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup class="ach-sidebar__group">
          <SidebarGroupLabel as="h2" class="ach-sidebar__group-label">Products</SidebarGroupLabel>
          <SidebarMenu class="ach-sidebar__menu">
            <SidebarMenuItem v-for="item in productItems" :key="item.label">
              <SidebarMenuButton
                class="ach-sidebar__menu-button ach-sidebar__product-button"
                size="lg"
                :is-active="activeItem === item.label"
                :aria-label="item.label"
                :aria-current="activeItem === item.label ? 'page' : undefined"
                :tooltip="item.label"
                @click="selectItem(item.label)"
              >
                <span class="ach-sidebar__product-mark">
                  <img :src="item.logo" alt="" />
                </span>
                <span class="ach-sidebar__product-copy">
                  <span class="ach-sidebar__item-label">{{ item.label }}</span>
                  <span class="ach-sidebar__item-subtitle">{{ item.subtitle }}</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarMenu class="ach-sidebar__menu">
          <SidebarMenuItem>
            <SidebarMenuButton
              class="ach-sidebar__menu-button"
              :is-active="activeItem === 'All Product'"
              aria-label="All Product"
              :aria-current="activeItem === 'All Product' ? 'page' : undefined"
              tooltip="All Product"
              @click="selectItem('All Product')"
            >
              <img class="ach-sidebar__icon" src="/icons/ui-actions/apps.svg" alt="" />
              <span>All Product</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </nav>
    </SidebarContent>

    <SidebarFooter class="ach-sidebar__footer">
      <SidebarMenu class="ach-sidebar__menu">
        <SidebarMenuItem v-for="item in footerItems" :key="item.label">
          <SidebarMenuButton
            class="ach-sidebar__menu-button"
            :is-active="activeItem === item.label"
            :aria-label="item.label"
            :aria-current="activeItem === item.label ? 'page' : undefined"
            :tooltip="item.label"
            @click="selectItem(item.label)"
          >
            <img class="ach-sidebar__icon" :src="item.icon" alt="" />
            <span>{{ item.label }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            class="ach-sidebar__menu-button"
            :aria-label="state === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'"
            :aria-expanded="state !== 'collapsed'"
            :tooltip="state === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'"
            @click="toggleSidebar"
          >
            <img
              class="ach-sidebar__collapse-icon"
              :class="{ 'ach-sidebar__collapse-icon--rotated': state === 'collapsed' }"
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
.ach-sidebar {
  --sidebar-width: 240px;
  --sidebar-width-icon: 62px;
}

.ach-sidebar__header {
  gap: 0;
  padding-block: var(--primitives-padding-4);
  padding-inline: var(--primitives-padding-2);
}

.ach-sidebar__company-switcher {
  position: relative;
  width: 100%;
}

.ach-sidebar__company {
  box-sizing: border-box;
  display: flex;
  min-height: 78px;
  align-items: flex-start;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-2);
  border: var(--primitives-border-width-default) solid var(--component-sidebar-profile-border);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-sidebar-profile-background);
  box-shadow: 0 1px 2px var(--primitives-shadows-xs-color);
  color: var(--component-sidebar-profile-text);
  cursor: pointer;
  list-style: none;
}

.ach-sidebar__company::-webkit-details-marker {
  display: none;
}

.ach-sidebar__initials {
  display: grid;
  width: var(--primitives-padding-8);
  height: var(--primitives-padding-8);
  flex: 0 0 var(--primitives-padding-8);
  place-items: center;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--avatar-initials-background);
  color: var(--avatar-initials-text);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 500;
}

.ach-sidebar__company-copy,
.ach-sidebar__product-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.ach-sidebar__company-copy {
  gap: var(--primitives-padding-1);
  justify-content: center;
}

.ach-sidebar__company-name,
.ach-sidebar__company-id,
.ach-sidebar__item-label,
.ach-sidebar__item-subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ach-sidebar__company-name,
.ach-sidebar__item-label {
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
}

.ach-sidebar__badge {
  align-self: flex-start;
  padding: var(--primitives-padding-1) var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--sidebar-badge-background);
  color: var(--sidebar-badge-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
}

.ach-sidebar__company-id {
  color: var(--component-sidebar-profile-text-secondary);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-2xs);
}

.ach-sidebar__company-chevron,
.ach-sidebar__icon,
.ach-sidebar__trailing-icon,
.ach-sidebar__collapse-icon {
  display: block;
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  flex: 0 0 var(--primitives-padding-4);
}

.ach-sidebar__company-chevron {
  margin-top: var(--primitives-padding-1);
}

.ach-sidebar__company-menu {
  position: absolute;
  z-index: 2;
  top: calc(100% + var(--primitives-padding-1));
  left: 0;
  display: grid;
  width: 222px;
  gap: var(--primitives-padding-1);
  padding: var(--primitives-padding-1);
  border: var(--primitives-border-width-default) solid var(--component-sidebar-profile-border);
  border-radius: var(--primitives-border-radius-sm);
  background: var(--component-sidebar-background);
  box-shadow: 0 4px 12px var(--primitives-shadows-sm-color);
}

.ach-sidebar__company-option {
  padding: var(--primitives-padding-2);
  border: 0;
  border-radius: var(--primitives-border-radius-xs);
  background: transparent;
  color: var(--component-sidebar-item-text);
  font: inherit;
  font-size: var(--primitives-font-sizes-sm);
  text-align: left;
}

.ach-sidebar__company-option:not(:disabled) {
  cursor: pointer;
}

.ach-sidebar__company-option:not(:disabled):hover,
.ach-sidebar__company-option:not(:disabled):focus-visible {
  background: var(--component-sidebar-item-background-hover);
  outline: none;
}

.ach-sidebar__company-option:disabled {
  color: var(--component-sidebar-item-secondary);
  cursor: not-allowed;
}

.ach-sidebar__content {
  gap: var(--primitives-padding-2);
  padding-inline: var(--primitives-padding-2);
  scrollbar-width: thin;
}

.ach-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--primitives-padding-4);
}

.ach-sidebar__group {
  gap: 0;
  padding: 0;
}

.ach-sidebar__group-label {
  height: var(--primitives-padding-7);
  padding-inline: var(--primitives-padding-3);
  color: var(--component-sidebar-group-label-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-xs);
  text-transform: uppercase;
}

.ach-sidebar__menu {
  gap: 0;
}

:global(.ach-sidebar .ach-sidebar__menu-button) {
  height: 34px;
  min-height: 34px;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-1) var(--primitives-padding-2) var(--primitives-padding-1) var(--primitives-padding-3);
  border-radius: var(--primitives-border-radius-sm);
  color: var(--component-sidebar-item-text);
  font-size: var(--primitives-font-sizes-sm);
}

:global(.ach-sidebar__menu-button[data-active="true"]) {
  background: var(--component-sidebar-item-background-active);
}

:global(.ach-sidebar__menu-button[data-active="true"]:hover) {
  background: var(--component-sidebar-item-background-active);
}

:global(.ach-sidebar .ach-sidebar__product-button) {
  height: 50px;
  min-height: 50px;
  padding-block: var(--primitives-padding-2);
}

.ach-sidebar__product-mark {
  display: grid;
  width: var(--primitives-padding-6);
  height: var(--primitives-padding-6);
  flex: 0 0 var(--primitives-padding-6);
  place-items: center;
  overflow: hidden;
  border-radius: var(--primitives-border-radius-sm);
  background: var(--avatar-logo-background);
}

.ach-sidebar__product-mark img {
  display: block;
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.ach-sidebar__item-subtitle {
  color: var(--component-sidebar-item-secondary);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 400;
  line-height: var(--primitives-line-heights-xs);
}

.ach-sidebar__footer {
  gap: 0;
  padding-block: var(--primitives-padding-4);
  padding-inline: var(--primitives-padding-2);
}

.ach-sidebar__trailing-icon {
  margin-left: auto;
}

.ach-sidebar__collapse-icon {
  transition: transform 200ms ease-out;
}

.ach-sidebar__collapse-icon--rotated {
  transform: rotate(180deg);
}

:global(.group[data-collapsible="icon"] .ach-sidebar__company-copy),
:global(.group[data-collapsible="icon"] .ach-sidebar__company-chevron),
:global(.group[data-collapsible="icon"] .ach-sidebar__trailing-icon),
:global(.group[data-collapsible="icon"] .ach-sidebar__menu-button > span:not(.ach-sidebar__product-mark)) {
  display: none;
}

:global(.group[data-collapsible="icon"] .ach-sidebar__company) {
  width: var(--primitives-padding-10);
  height: var(--primitives-padding-10);
  min-height: var(--primitives-padding-10);
  align-items: center;
  justify-content: center;
  margin-inline: auto;
  padding: var(--primitives-padding-1);
}

:global(.group[data-collapsible="icon"] .ach-sidebar__company-menu) {
  top: 0;
  left: calc(100% + var(--primitives-padding-2));
}

:global(.group[data-collapsible="icon"] .ach-sidebar__menu-button) {
  justify-content: center;
  margin-inline: auto;
  padding: var(--primitives-padding-2);
}

:global(.group[data-collapsible="icon"] .ach-sidebar__product-button) {
  height: 36px;
  min-height: 36px;
  padding: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ach-sidebar__collapse-icon {
    transition: none;
  }
}
</style>
