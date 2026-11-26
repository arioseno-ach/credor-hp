<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'reka-ui'
import CommandSearch from '@/components/search/CommandSearch.vue'
import { useAppView } from '@/composables/useAppView'
import { useSnackbar } from '@/composables/useSnackbar'

type Breakpoint = 'Web' | 'Tab' | 'Mobile'

withDefaults(
  defineProps<{
    actionTrail?: boolean
    bordered?: boolean
    breakpoint?: Breakpoint
    menuExpanded?: boolean
    showLogo?: boolean
  }>(),
  {
    actionTrail: false,
    bordered: false,
    breakpoint: 'Web',
    menuExpanded: false,
    showLogo: false,
  },
)

const emit = defineEmits<{
  cartClick: []
  menuClick: []
}>()

const { activePortal, goHome, openLenderLeads } = useAppView()
const { show: showSnackbar } = useSnackbar()

function handleEditProfile() {
  showSnackbar({
    variant: 'neutral',
    title: 'Edit profile',
    description: 'Profile editing is not available in this prototype.',
  })
}

function handleLanguage() {
  showSnackbar({
    variant: 'neutral',
    title: 'Language',
    description: 'English is the active language in this prototype.',
  })
}

function handleLogout() {
  showSnackbar({
    variant: 'neutral',
    title: 'Log out',
    description: 'Sign-out is disabled in this prototype.',
  })
}
</script>

<template>
  <header
    class="topbar"
    :class="`topbar--${breakpoint.toLowerCase()}`"
    :data-breakpoint="breakpoint.toLowerCase()"
  >
    <div class="topbar__inner">
      <img
        v-if="showLogo"
        class="topbar__logo"
        src="/logo/logo-achilles-wordmark-black-24px.svg"
        alt="Achilles"
      />

      <button
        class="topbar__menu"
        type="button"
        :aria-label="menuExpanded ? 'Close navigation menu' : 'Open navigation menu'"
        aria-controls="primary-navigation"
        :aria-expanded="menuExpanded"
        @click="emit('menuClick')"
      >
        <img src="/icons/ui-actions/menu.svg" alt="" />
      </button>

      <CommandSearch />

      <span class="topbar__spacer" aria-hidden="true"></span>

      <div v-if="actionTrail" class="topbar__action-trail">
        <slot name="action-trail">
          <button
            class="topbar__cart-button"
            type="button"
            aria-label="Shopping cart"
            @click="emit('cartClick')"
          >
            <img src="/icons/business-payments/shopping-cart.svg" alt="" />
          </button>
        </slot>
      </div>

      <DropdownMenuRoot>
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            class="topbar__avatar"
            aria-label="Account menu"
          >
            CT
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <DropdownMenuContent
            class="topbar-menu"
            align="end"
            :side-offset="8"
          >
            <div class="topbar-menu__identity">
              <span class="topbar-menu__identity-avatar" aria-hidden="true">CT</span>
              <div class="topbar-menu__identity-copy">
                <span class="topbar-menu__identity-name">CGI Test</span>
                <span class="topbar-menu__identity-email">cgi.test@twicefinancing.co.id</span>
              </div>
            </div>

            <DropdownMenuSeparator class="topbar-menu__separator" />

            <DropdownMenuItem class="topbar-menu__item" @select="handleEditProfile">
              <span class="topbar-menu__icon topbar-menu__icon--edit" aria-hidden="true"></span>
              <span class="topbar-menu__item-label">Edit profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem class="topbar-menu__item" @select="handleLanguage">
              <span class="topbar-menu__icon topbar-menu__icon--language" aria-hidden="true"></span>
              <span class="topbar-menu__item-label">Language</span>
              <span class="topbar-menu__pill">English</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator class="topbar-menu__separator" />

            <DropdownMenuLabel class="topbar-menu__label">Switch portal</DropdownMenuLabel>

            <DropdownMenuItem
              class="topbar-menu__item"
              :class="{ 'topbar-menu__item--active': activePortal === 'achilles' }"
              :data-active="activePortal === 'achilles' ? 'true' : undefined"
              @select="goHome()"
            >
              <span class="topbar-menu__icon topbar-menu__icon--swap" aria-hidden="true"></span>
              <span class="topbar-menu__item-label">Achilles</span>
              <span
                v-if="activePortal === 'achilles'"
                class="topbar-menu__check"
                aria-label="Active portal"
              ></span>
            </DropdownMenuItem>

            <DropdownMenuItem
              class="topbar-menu__item"
              :class="{ 'topbar-menu__item--active': activePortal === 'lender' }"
              :data-active="activePortal === 'lender' ? 'true' : undefined"
              @select="openLenderLeads()"
            >
              <span class="topbar-menu__icon topbar-menu__icon--swap" aria-hidden="true"></span>
              <span class="topbar-menu__item-label">Lender Portal</span>
              <span
                v-if="activePortal === 'lender'"
                class="topbar-menu__check"
                aria-label="Active portal"
              ></span>
            </DropdownMenuItem>

            <DropdownMenuSeparator class="topbar-menu__separator" />

            <DropdownMenuItem class="topbar-menu__item" @select="handleLogout">
              <span class="topbar-menu__icon topbar-menu__icon--logout" aria-hidden="true"></span>
              <span class="topbar-menu__item-label">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </div>

    <div v-if="bordered" class="topbar__divider" aria-hidden="true"></div>
  </header>
</template>

<style scoped>
.topbar {
  /* Stays at the top while the page scrolls; a page's own sticky bar pins just below it. */
  position: sticky;
  z-index: 3;
  top: 0;
  box-sizing: border-box;
  width: 100%;
  height: var(--component-topbar-height);
  flex: 0 0 var(--component-topbar-height);
  background: var(--component-topbar-background);
  color: var(--component-topbar-text);
  font-family: var(--component-topbar-font-family), sans-serif;
}

.topbar__inner {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: var(--component-topbar-gap);
  padding-inline: var(--component-topbar-padding-inline);
}

.topbar__logo {
  display: block;
  flex: 0 0 auto;
}

.topbar__spacer {
  min-width: 0;
  flex: 1 1 auto;
}

.topbar__menu {
  display: none;
  width: var(--component-topbar-icon-size);
  height: var(--component-topbar-icon-size);
  flex: 0 0 var(--component-topbar-icon-size);
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.topbar__menu img {
  display: block;
}

.topbar__menu:focus-visible,
.topbar__cart-button:focus-visible,
.topbar__avatar:focus-visible {
  border-radius: 50%;
  outline: var(--primitives-border-width-2) solid var(--component-input-border-focus);
  outline-offset: var(--primitives-border-width-2);
}

.topbar__action-trail {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
}

.topbar__cart-button {
  box-sizing: border-box;
  display: grid;
  width: var(--component-topbar-action-size);
  height: var(--component-topbar-action-size);
  flex: 0 0 var(--component-topbar-action-size);
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--component-button-icon-inverse-bg);
  cursor: pointer;
}

.topbar__cart-button:hover {
  background: var(--component-button-icon-inverse-bg-hover);
}

.topbar__cart-button img {
  display: block;
  width: var(--component-topbar-action-icon-size);
  height: var(--component-topbar-action-icon-size);
}


.topbar__avatar {
  box-sizing: border-box;
  display: grid;
  width: var(--component-topbar-avatar-size);
  height: var(--component-topbar-avatar-size);
  flex: 0 0 var(--component-topbar-avatar-size);
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--component-avatar-initials-background);
  color: var(--component-avatar-initials-text);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  transition: opacity var(--semantic-motion-duration-fast) var(--semantic-motion-easing-emphasized);
}

.topbar__avatar:hover,
.topbar__avatar[data-state="open"] {
  opacity: 0.9;
}


.topbar__divider {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: var(--primitives-border-width-default);
  background: var(--component-divider-default);
}

.topbar--web .topbar__divider {
  right: var(--component-topbar-divider-inset);
  left: var(--component-topbar-divider-inset);
}

.topbar--mobile .topbar__menu {
  display: flex;
}

.topbar--mobile .topbar__logo {
  display: none;
}

@media (max-width: 600px) {
  .topbar__menu {
    display: flex;
  }

  .topbar__logo {
    display: none;
  }

  .topbar--web .topbar__divider {
    right: 0;
    left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .topbar__avatar {
    transition: none;
  }
}
</style>

<!-- Unscoped: Reka DropdownMenuContent renders inside a Teleport portal on body. -->
<style>
.topbar-menu {
  z-index: 40;
  box-sizing: border-box;
  min-width: 248px;
  max-width: 300px;
  padding: var(--primitives-padding-1);
  border: var(--primitives-border-width-default) solid var(--component-contextual-menu-border);
  border-radius: var(--primitives-border-radius-md);
  background: var(--component-contextual-menu-background);
  color: var(--component-contextual-menu-item-text);
  font-family: var(--primitives-font-families-body), sans-serif;
  box-shadow:
    calc(var(--primitives-shadows-lg-shadow-1-x) * 1px)
      calc(var(--primitives-shadows-lg-shadow-1-y) * 1px)
      calc(var(--primitives-shadows-lg-shadow-1-blur) * 1px)
      calc(var(--primitives-shadows-lg-shadow-1-spread) * 1px)
      var(--primitives-shadows-lg-color),
    calc(var(--primitives-shadows-lg-shadow-2-x) * 1px)
      calc(var(--primitives-shadows-lg-shadow-2-y) * 1px)
      calc(var(--primitives-shadows-lg-shadow-2-blur) * 1px)
      calc(var(--primitives-shadows-lg-shadow-2-spread) * 1px)
      var(--primitives-shadows-lg-color);
}

.topbar-menu:focus {
  outline: none;
}

.topbar-menu__identity {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-3);
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
}

.topbar-menu__identity-avatar {
  display: grid;
  width: var(--primitives-padding-8);
  height: var(--primitives-padding-8);
  flex: 0 0 var(--primitives-padding-8);
  place-items: center;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-avatar-initials-background);
  color: var(--component-avatar-initials-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
}

.topbar-menu__identity-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: calc(var(--primitives-padding-1) / 2);
}

.topbar-menu__identity-name {
  overflow: hidden;
  color: var(--component-contextual-menu-item-text);
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 600;
  line-height: var(--primitives-line-heights-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-menu__identity-email {
  overflow: hidden;
  color: var(--component-contextual-menu-item-text-secondary);
  font-size: var(--primitives-font-sizes-xs);
  line-height: var(--primitives-line-heights-2xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-menu__separator {
  height: var(--primitives-border-width-default);
  margin: var(--primitives-padding-1) 0;
  background: var(--component-divider-subtle);
}

.topbar-menu__label {
  padding: var(--primitives-padding-1) var(--primitives-padding-3);
  color: var(--component-contextual-menu-group-label-text);
  font-size: var(--primitives-font-sizes-2xs);
  font-weight: 600;
  letter-spacing: var(--primitives-letter-spacing-wider);
  line-height: var(--primitives-line-heights-4xs);
  text-transform: uppercase;
}

.topbar-menu__item {
  display: flex;
  align-items: center;
  gap: var(--primitives-padding-2);
  padding: var(--primitives-padding-2) var(--primitives-padding-3);
  border-radius: var(--primitives-border-radius-sm);
  color: var(--component-contextual-menu-item-text);
  cursor: pointer;
  font-size: var(--primitives-font-sizes-sm);
  font-weight: 400;
  line-height: var(--primitives-line-heights-sm);
  user-select: none;
}

.topbar-menu__item[data-highlighted] {
  background: var(--component-contextual-menu-item-background-hover);
  outline: none;
}

.topbar-menu__item--active {
  background: var(--component-contextual-menu-item-background-active);
  font-weight: 500;
}

.topbar-menu__item--active[data-highlighted] {
  background: var(--component-contextual-menu-item-background-active);
}

.topbar-menu__item-label {
  min-width: 0;
  flex: 1;
}

.topbar-menu__icon {
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  flex: 0 0 var(--primitives-padding-4);
  background: var(--component-contextual-menu-item-icon);
}

.topbar-menu__icon--edit {
  mask: url('/icons/photo-image/edit.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/photo-image/edit.svg') center / contain no-repeat;
}

.topbar-menu__icon--language {
  mask: url('/icons/common-actions/language.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/common-actions/language.svg') center / contain no-repeat;
}

.topbar-menu__icon--swap {
  mask: url('/icons/ui-actions/swap-horiz.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/swap-horiz.svg') center / contain no-repeat;
}

.topbar-menu__icon--logout {
  mask: url('/icons/ui-actions/logout.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/logout.svg') center / contain no-repeat;
}

.topbar-menu__pill {
  padding: calc(var(--primitives-padding-1) / 2) var(--primitives-padding-2);
  border-radius: var(--primitives-border-radius-xs);
  background: var(--component-badge-info-background);
  color: var(--component-badge-info-text);
  font-size: var(--primitives-font-sizes-xs);
  font-weight: 500;
  line-height: var(--primitives-line-heights-3xs);
}

.topbar-menu__check {
  width: var(--primitives-padding-4);
  height: var(--primitives-padding-4);
  flex: 0 0 var(--primitives-padding-4);
  background: var(--semantic-brand-ach-color-brand-default);
  mask: url('/icons/ui-actions/check.svg') center / contain no-repeat;
  -webkit-mask: url('/icons/ui-actions/check.svg') center / contain no-repeat;
}

@media (prefers-reduced-motion: no-preference) {
  .topbar-menu[data-state="open"] {
    animation: topbar-menu-in var(--component-tooltip-enter-duration) var(--component-tooltip-enter-easing) both;
  }

  .topbar-menu[data-state="closed"] {
    animation: topbar-menu-out var(--component-tooltip-exit-duration) var(--component-tooltip-exit-easing) both;
  }
}

@keyframes topbar-menu-in {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes topbar-menu-out {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
}
</style>
