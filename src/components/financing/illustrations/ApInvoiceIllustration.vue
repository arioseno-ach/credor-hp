<template>
  <div class="illustration illustration--ap">
    <div class="ap__row ap__row--first">
      <span class="ap__avatar">BP</span>
      <span class="ap__copy">
        <span class="ap__name">CV Baja Perkasa</span>
        <span class="ap__due">Due: 14 Oct 2026</span>
      </span>
      <span class="ap__side">
        <span class="ap__amount">Rp 32.000.000</span>
        <span class="ap__status ap__status--paid"><i></i>Paid</span>
      </span>
    </div>

    <div class="ap__feature">
      <div class="ap__feature-top">
        <span class="ap__avatar ap__avatar--dark">SM</span>
        <span class="ap__copy">
          <span class="ap__name ap__name--large">Supplier Makmur Jaya</span>
          <span class="ap__due ap__due--large">Due: 20 Oct 2026</span>
        </span>
        <span class="ap__side">
          <span class="ap__amount ap__amount--large">Rp 48.500.000</span>
          <span class="ap__status ap__status--large ap__status--unpaid"><i></i>Unpaid</span>
        </span>
      </div>

      <div class="ap__rule"></div>

      <div class="ap__feature-bottom">
        <span class="ap__tag"><i></i>Repay later · 2 × Rp 24.250.000</span>
        <span class="ap__button">
          Pay supplier now
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </div>

    <div class="ap__row ap__row--second">
      <span class="ap__avatar">PB</span>
      <span class="ap__copy">
        <span class="ap__name">PT Bahan Prima</span>
        <span class="ap__due">Due: 28 Oct 2026</span>
      </span>
      <span class="ap__side">
        <span class="ap__amount">Rp 15.750.000</span>
        <span class="ap__status ap__status--unpaid"><i></i>Unpaid</span>
      </span>
    </div>

    <div class="ap__row ap__row--third">
      <span class="ap__avatar">TJ</span>
      <span class="ap__copy">
        <span class="ap__name">UD Tani Jaya</span>
        <span class="ap__due">Due: 02 Nov 2026</span>
      </span>
      <span class="ap__side">
        <span class="ap__amount">Rp 21.300.000</span>
        <span class="ap__status ap__status--unpaid"><i></i>Unpaid</span>
      </span>
    </div>

    <div class="ap__row ap__row--fourth">
      <span class="ap__avatar">SL</span>
      <span class="ap__copy">
        <span class="ap__name">PT Sinar Logistik</span>
        <span class="ap__due">Due: 05 Nov 2026</span>
      </span>
      <span class="ap__side">
        <span class="ap__amount">Rp 9.800.000</span>
        <span class="ap__status ap__status--unpaid"><i></i>Unpaid</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.illustration {
  position: absolute;
  top: 0;
  left: 0;
  width: 720px;
  height: 480px;
  color: var(--semantic-text-ach-color-text-default);
  font-family: var(--primitives-font-families-body), sans-serif;
}

.ap__row {
  position: absolute;
  left: 80px;
  display: flex;
  width: 560px;
  height: 72px;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--component-option-illustration-hairline);
}

.ap__row--first {
  top: 24px;
}

.ap__row--second {
  top: 284px;
  opacity: 0.6;
}

.ap__row--third {
  top: 356px;
  opacity: 0.3;
}

.ap__row--fourth {
  top: 428px;
  opacity: 0.15;
}

.ap__avatar {
  display: grid;
  width: 36px;
  height: 36px;
  flex: none;
  place-items: center;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-option-illustration-tint);
  color: var(--semantic-brand-ach-color-brand-default);
  font-size: 12px;
  font-weight: 600;
}

.ap__avatar--dark {
  width: 44px;
  height: 44px;
  background: var(--semantic-text-ach-color-text-default);
  color: var(--semantic-text-ach-color-text-inverse);
  font-size: 13px;
}

.ap__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.ap__name {
  color: var(--semantic-text-ach-color-text-default);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.ap__name--large {
  font-size: 17px;
}

.ap__due {
  color: var(--component-option-illustration-text);
  font-size: 13px;
  line-height: 1.4;
}

.ap__due--large {
  font-size: 14px;
}

.ap__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.ap__amount {
  color: var(--semantic-text-ach-color-text-default);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.ap__amount--large {
  font-size: 22px;
  line-height: 1.2;
}

.ap__status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.ap__status--large {
  font-size: 14px;
}

.ap__status i {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: var(--primitives-border-radius-infinite);
  background: currentColor;
}

.ap__status--paid {
  color: var(--semantic-brand-ach-color-brand-default);
}

.ap__status--unpaid {
  color: var(--component-option-illustration-error);
}

.ap__feature {
  position: absolute;
  top: 108px;
  left: 56px;
  box-sizing: border-box;
  width: 608px;
  height: 156px;
  padding: 20px 22px;
  border: 1px solid var(--component-option-illustration-hairline);
  border-radius: 18px;
  background: var(--component-card-background);
}

.ap__feature-top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ap__rule {
  height: 1px;
  margin: 14px 0;
  background: var(--component-option-illustration-hairline);
}

.ap__feature-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ap__tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-option-card-background);
  color: var(--semantic-text-ach-color-text-default);
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
}

.ap__tag i {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--semantic-brand-ach-color-brand-default);
}

.ap__button {
  display: inline-flex;
  height: 40px;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border-radius: 12px;
  background: var(--semantic-text-ach-color-text-default);
  color: var(--semantic-text-ach-color-text-inverse);
  font-size: 14px;
  font-weight: 600;
}

.ap__button svg {
  width: 16px;
  height: 16px;
}
</style>
