<script setup lang="ts">
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

      <div class="topbar__account" role="group" aria-label="Account">
        <span class="topbar__avatar" aria-hidden="true">C</span>
        <span class="topbar__account-name">CGI</span>
        <img
          class="topbar__account-chevron"
          src="/icons/hardware/keyboard-arrow-down.svg"
          alt=""
        />
      </div>
    </div>

    <div v-if="bordered" class="topbar__divider" aria-hidden="true"></div>
  </header>
</template>

<style scoped>
.topbar {
  position: relative;
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

.topbar__menu img,
.topbar__account-chevron {
  display: block;
}

.topbar__menu:focus-visible,
.topbar__cart-button:focus-visible {
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

.topbar__account {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--component-topbar-account-gap);
}

.topbar__avatar {
  box-sizing: border-box;
  display: grid;
  width: var(--component-topbar-avatar-size);
  height: var(--component-topbar-avatar-size);
  flex: 0 0 var(--component-topbar-avatar-size);
  place-items: center;
  border-radius: 50%;
  background: var(--component-avatar-initials-background);
  color: var(--component-avatar-initials-text);
  font-size: var(--component-topbar-font-size);
  font-weight: 500;
  line-height: var(--component-topbar-line-height);
}

.topbar__account-name {
  color: var(--component-topbar-text);
  font-size: var(--component-topbar-font-size);
  font-weight: 500;
  line-height: var(--component-topbar-line-height);
  white-space: nowrap;
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
</style>