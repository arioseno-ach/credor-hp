<template>
  <div class="illustration illustration--short-term">
    <div class="stt__panel"></div>

    <p class="stt__label" style="left: 92px; top: 56px">Loan amount</p>
    <div class="stt__field" style="top: 74px">
      <span class="stt__value">Rp 10.000.000</span>
      <span class="stt__hint">Max Rp 10.000.000</span>
    </div>

    <div class="stt__track"></div>
    <div class="stt__fill stt__fill--full"></div>
    <div class="stt__handle stt__handle--full"></div>
    <p class="stt__scale" style="left: 92px">Rp 1.000.000</p>
    <p class="stt__scale stt__scale--end" style="right: 28px">Rp 10.000.000</p>

    <p class="stt__label" style="left: 92px; top: 196px">Selected invoice</p>
    <div class="stt__field" style="top: 214px">
      <span class="stt__field-text">INV-2026-014 · PT Bumi Mandiri</span>
      <span class="stt__hint">Rp 10.000.000</span>
    </div>

    <p class="stt__label" style="left: 92px; top: 300px">Repayment time</p>
    <p class="stt__label" style="left: 402px; top: 300px">Interest rate</p>
    <div class="stt__field stt__field--half" style="left: 92px; top: 318px">
      <span class="stt__field-text">30 days</span>
    </div>
    <div class="stt__field stt__field--half" style="left: 402px; top: 318px">
      <span class="stt__field-text">1% / month</span>
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

.stt__panel {
  position: absolute;
  top: 36px;
  left: 56px;
  box-sizing: border-box;
  width: 700px;
  height: 560px;
  border: 1px solid var(--component-option-illustration-hairline);
  border-radius: 22px;
  background: var(--component-card-background);
}

.stt__label {
  position: absolute;
  color: var(--component-option-illustration-text);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
}

.stt__field {
  position: absolute;
  left: 92px;
  display: flex;
  width: 600px;
  height: 68px;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border: 1.5px solid var(--component-option-illustration-hairline);
  border-radius: 14px;
}

.stt__field--half {
  width: 290px;
}

.stt__value {
  color: var(--semantic-text-ach-color-text-default);
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.stt__field-text {
  color: var(--semantic-text-ach-color-text-default);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.stt__hint {
  color: var(--component-option-illustration-text);
  font-size: 14px;
}

.stt__track {
  position: absolute;
  top: 152px;
  left: 92px;
  width: 600px;
  height: 6px;
  border-radius: 3px;
  background: var(--component-option-illustration-tint);
}

.stt__fill {
  position: absolute;
  top: 152px;
  left: 92px;
  width: 282px;
  height: 6px;
  border-radius: 3px;
  background: var(--semantic-brand-ach-color-brand-default);
}

.stt__fill--full {
  width: 600px;
}

.stt__handle {
  position: absolute;
  top: 144px;
  left: 363px;
  width: 22px;
  height: 22px;
  box-sizing: border-box;
  border: 3px solid var(--semantic-brand-ach-color-brand-default);
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-card-background);
}

.stt__handle--full {
  left: 681px;
}

.stt__scale {
  position: absolute;
  top: 166px;
  color: var(--component-option-illustration-text);
  font-size: 13px;
  line-height: 1;
}

.stt__scale--end {
  right: 28px;
  text-align: right;
}
</style>
