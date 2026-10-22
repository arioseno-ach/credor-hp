<template>
  <div class="illustration illustration--ar">
    <div class="ar__paper ar__paper--back"></div>
    <div class="ar__paper ar__paper--middle"></div>

    <div class="ar__paper ar__paper--front">
      <div class="ar__head">
        <div>
          <p class="ar__title">Invoice</p>
          <p class="ar__seller">PT Maju Bersama</p>
        </div>
        <div class="ar__total">
          <p class="ar__total-label">Total amount due:</p>
          <p class="ar__total-amount">Rp 125.000.000</p>
        </div>
      </div>

      <div class="ar__meta">
        <div>
          <p><b>NPWP:</b> 01.234.567.8-901.000</p>
          <p><b>Email:</b> finance@majubersama.co.id</p>
          <p><b>Phone:</b> 021 5550 1234</p>
          <p><b>Address:</b> Jl. Jend. Sudirman No. 12, Jakarta</p>
        </div>
        <div class="ar__meta-right">
          <p><b>Invoice to:</b> CV Sumber Makmur</p>
          <p><b>Invoice ID:</b> INV-2026-0012</p>
          <p><b>Date of issue:</b> 14/10/2026</p>
          <p><b>Payment due:</b> 28/10/2026</p>
        </div>
      </div>

      <div class="ar__rule"></div>

      <div class="ar__table">
        <div class="ar__row ar__row--head">
          <span>Description</span>
          <span>Qty</span>
          <span>Unit price</span>
          <span>Total</span>
        </div>
        <div class="ar__row ar__row--data">
          <span>Raw materials</span>
          <span>50</span>
          <span>Rp 1.500.000</span>
          <span>Rp 75.000.000</span>
        </div>
        <div class="ar__row ar__row--data">
          <span>Delivery &amp; handling</span>
          <span>10</span>
          <span>Rp 5.000.000</span>
          <span>Rp 50.000.000</span>
        </div>
      </div>

      <div class="ar__rule ar__rule--spaced"></div>

      <div class="ar__bank-info">
        <p><b>Bank details for payment:</b></p>
        <p>Bank: BCA</p>
        <p>Account number: 123 456 7890</p>
        <p>Name: PT Maju Bersama</p>
      </div>
    </div>

    <div class="ar__bank">
      <div class="ar__bank-top">
        <span class="ar__check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <p class="ar__bank-label">Get money now</p>
      </div>
      <p class="ar__bank-amount">Rp 125.000.000</p>
      <p class="ar__bank-sub">Send to your account</p>
      <p class="ar__bank-row">
        <span class="ar__bca">BCA</span>
        PT Maju Bersama
        <span class="ar__bank-number">•••• 4568</span>
      </p>
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

.ar__paper {
  position: absolute;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid var(--component-option-illustration-paper-border);
  background: var(--component-card-background);
}

.ar__paper::after {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.43  0 0 0 0 0.40  0 0 0 0.3 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  content: '';
  mix-blend-mode: multiply;
  opacity: 0.28;
  pointer-events: none;
}

.ar__paper--back {
  top: 16px;
  left: 166px;
  width: 388px;
  height: 440px;
}

.ar__paper--middle {
  top: 28px;
  left: 148px;
  width: 424px;
  height: 440px;
}

.ar__paper--front {
  top: 40px;
  left: 130px;
  width: 460px;
  height: 470px;
  padding: 30px;
}

.ar__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.ar__title {
  font-size: 28px;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.1;
}

.ar__seller {
  margin-top: 4px;
  font-size: 16px;
  color: var(--component-option-illustration-text);
}

.ar__total {
  text-align: right;
}

.ar__total-label {
  margin-top: 4px;
  color: var(--component-option-illustration-text);
  font-size: 13px;
  font-weight: 600;
}

.ar__total-amount {
  margin-top: 3px;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.1;
}

.ar__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  color: var(--component-option-illustration-text);
  font-size: 12px;
  line-height: 17px;
}

.ar__meta b {
  color: var(--semantic-text-ach-color-text-subtle);
  font-weight: 600;
}

.ar__meta-right {
  text-align: right;
}

.ar__rule {
  height: 1px;
  margin-top: 16px;
  background: var(--component-option-illustration-rule);
}

.ar__rule--spaced {
  margin-top: 14px;
}

.ar__table {
  margin-top: 14px;
  color: var(--component-option-illustration-text);
  font-size: 12px;
}

.ar__row {
  display: grid;
  grid-template-columns: 1fr 36px 86px 96px;
  align-items: center;
  height: 24px;
}

.ar__row--head {
  font-size: 12px;
}

.ar__row--data {
  color: var(--semantic-text-ach-color-text-subtle);
}

.ar__row span:not(:first-child) {
  text-align: right;
}

.ar__bank-info {
  margin-top: 22px;
  color: var(--component-option-illustration-text);
  font-size: 12px;
  line-height: 17px;
}

.ar__bank-info b {
  color: var(--semantic-text-ach-color-text-subtle);
  font-weight: 600;
}

.ar__bank {
  position: absolute;
  top: 318px;
  left: 376px;
  box-sizing: border-box;
  width: 304px;
  height: 200px;
  padding: 18px 22px;
  border-radius: 20px;
  background: var(--semantic-brand-ach-color-brand-default);
  color: var(--semantic-text-ach-color-text-inverse);
}

.ar__bank-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ar__check {
  display: grid;
  width: 28px;
  height: 28px;
  flex: none;
  place-items: center;
  border-radius: var(--primitives-border-radius-infinite);
  background: var(--component-card-background);
  color: var(--semantic-brand-ach-color-brand-default);
}

.ar__check svg {
  width: 15px;
  height: 15px;
}

.ar__bank-label {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.ar__bank-amount {
  margin-top: 8px;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.ar__bank-sub {
  margin-top: 12px;
  color: color-mix(in srgb, var(--semantic-text-ach-color-text-inverse) 72%, transparent);
  font-size: 14px;
  font-weight: 500;
}

.ar__bank-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  font-size: 14px;
  font-weight: 500;
}

.ar__bca {
  display: grid;
  height: 26px;
  flex: none;
  padding: 0 9px;
  place-items: center;
  border-radius: 7px;
  background: var(--component-card-background);
  color: var(--semantic-brand-ach-color-brand-strong);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.ar__bank-number {
  margin-left: auto;
  font-weight: 400;
  letter-spacing: 0.08em;
  opacity: 0.8;
}
</style>
