/**
 * checkout-ui.js — Rendering & UI helpers for epag POS Checkout
 * Handles all HTML generation and DOM updates based on app state.
 */

const CheckoutUI = {
  // ─── SVG Icon Library ─────────────────────────────────────────────────────

  icons: {
    pix: `<svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="method-icon">
      <rect width="40" height="26" rx="4" fill="#32BCAD"/>
      <text x="20" y="18" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-size="11" font-weight="700">PIX</text>
    </svg>`,

    boleto: `<svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="method-icon">
      <rect width="40" height="26" rx="4" fill="#2196F3"/>
      <rect x="5" y="6" width="2" height="14" fill="white"/>
      <rect x="9" y="6" width="1" height="14" fill="white"/>
      <rect x="12" y="6" width="3" height="14" fill="white"/>
      <rect x="17" y="6" width="1" height="14" fill="white"/>
      <rect x="20" y="6" width="2" height="14" fill="white"/>
      <rect x="24" y="6" width="1" height="14" fill="white"/>
      <rect x="27" y="6" width="3" height="14" fill="white"/>
      <rect x="32" y="6" width="1" height="14" fill="white"/>
      <rect x="35" y="6" width="2" height="14" fill="white"/>
    </svg>`,

    credit_card: `<svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="method-icon">
      <rect width="40" height="26" rx="4" fill="#1A73E8"/>
      <rect x="4" y="9" width="32" height="4" fill="white" opacity="0.9"/>
      <rect x="4" y="17" width="10" height="3" rx="1" fill="white" opacity="0.7"/>
      <rect x="16" y="17" width="8" height="3" rx="1" fill="white" opacity="0.7"/>
    </svg>`,

    debit_card: `<svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="method-icon">
      <rect width="40" height="26" rx="4" fill="#00897B"/>
      <rect x="4" y="9" width="32" height="4" fill="white" opacity="0.9"/>
      <rect x="4" y="17" width="10" height="3" rx="1" fill="white" opacity="0.7"/>
      <rect x="16" y="17" width="8" height="3" rx="1" fill="white" opacity="0.7"/>
    </svg>`,

    picpay: `<svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="method-icon">
      <rect width="40" height="26" rx="4" fill="#21C25E"/>
      <text x="20" y="18" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-size="9" font-weight="700">PicPay</text>
    </svg>`,

    oxxo: `<svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="method-icon">
      <rect width="40" height="26" rx="4" fill="#F5A623"/>
      <text x="20" y="18" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-size="11" font-weight="800">OXXO</text>
    </svg>`,

    transfer: `<svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="method-icon">
      <rect width="40" height="26" rx="4" fill="#5C6BC0"/>
      <path d="M8 13H32M25 8l7 5-7 5M15 8L8 13l7 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    cash: `<svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="method-icon">
      <rect width="40" height="26" rx="4" fill="#43A047"/>
      <rect x="6" y="7" width="28" height="12" rx="2" stroke="white" stroke-width="1.5"/>
      <circle cx="20" cy="13" r="3" stroke="white" stroke-width="1.5"/>
    </svg>`,

    // Card brand logos
    visa: `<svg viewBox="0 0 38 24" class="card-brand-icon" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="24" rx="4" fill="#1A1F71"/>
      <text x="19" y="17" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="12" font-weight="700" font-style="italic">VISA</text>
    </svg>`,

    mastercard: `<svg viewBox="0 0 38 24" class="card-brand-icon" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="24" rx="4" fill="#252525"/>
      <circle cx="14" cy="12" r="7" fill="#EB001B"/>
      <circle cx="24" cy="12" r="7" fill="#F79E1B"/>
      <path d="M19 6.8a7 7 0 010 10.4A7 7 0 0119 6.8z" fill="#FF5F00"/>
    </svg>`,

    amex: `<svg viewBox="0 0 38 24" class="card-brand-icon" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="24" rx="4" fill="#2E77BC"/>
      <text x="19" y="17" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="9" font-weight="700">AMEX</text>
    </svg>`,

    elo: `<svg viewBox="0 0 38 24" class="card-brand-icon" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="24" rx="4" fill="#000"/>
      <text x="11" y="17" fill="#FFD700" font-family="Arial,sans-serif" font-size="12" font-weight="700">e</text>
      <text x="20" y="17" fill="white" font-family="Arial,sans-serif" font-size="12" font-weight="700">lo</text>
    </svg>`,

    close: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,

    copy: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M3 11V2h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    check: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#34A853"/>
      <path d="M14 24l7 7 13-14" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    spinner: `<svg class="spinner" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="25" r="20" fill="none" stroke="#E0E0E0" stroke-width="4"/>
      <circle cx="25" cy="25" r="20" fill="none" stroke="#1A73E8" stroke-width="4"
        stroke-dasharray="80 45" stroke-linecap="round"/>
    </svg>`
  },

  // ─── Left Panel ────────────────────────────────────────────────────────────

  renderLeft(state) {
    const { step, country, method, cart, selectedCountry } = state;
    const inFormStep = ['form', 'processing', 'payment', 'confirm'].includes(step);
    const el = document.getElementById('panelLeft');
    const isMobile = window.innerWidth <= 860;

    // On mobile: badge is always a button that opens the country picker
    const countryBadge = isMobile
      ? `<button class="country-badge country-badge-btn" data-action="open-country-picker" title="Change country">
           ${selectedCountry
             ? `${this.renderCountryFlag(selectedCountry, 'country-badge-flag')} <span>${selectedCountry.name}</span>`
             : `<span>Select Country</span>`}
           <svg class="chevron-icon" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
         </button>`
      : selectedCountry
        ? `<div class="country-badge">${selectedCountry.name} <span class="flag">${this.renderCountryFlag(selectedCountry, 'country-badge-flag')}</span></div>`
        : '';

    if (inFormStep && selectedCountry) {
      // Summary mode: show selections history
      el.innerHTML = `
        <div class="left-header">
          <div class="epag-logo">
            <img src="assets/logo/epag-logo.svg" alt="ePag" class="epag-logo-image" />
          </div>
          ${countryBadge}
        </div>
        <div class="left-body scrollable">
          <div class="selection-summary">
            <div class="summary-block">
              <div class="summary-section-title">
                <strong>Country</strong>
                <span class="summary-subtitle">Select the payment method country:</span>
              </div>
              ${this.renderCountryGrid(state, true)}
            </div>
            <div class="summary-block">
              <div class="summary-section-title">
                <strong>Payment Methods</strong>
                <span class="summary-subtitle">Select the perfect payment method for you:</span>
              </div>
              ${this.renderMethodsList(state, true)}
            </div>
          </div>
        </div>
        <div class="left-footer">
          <div class="order-row">
            <span class="order-label">Order Amount:</span>
          </div>
          <div class="order-amount">
            <span class="order-currency">${selectedCountry.currencySymbol}</span>
            <span class="order-value">${cart.subtotal.toFixed(2)}</span>
          </div>
        </div>`;
    } else {
      // Cart mode
      el.innerHTML = `
        <div class="left-header">
          <div class="epag-logo">
            <img src="assets/logo/epag-logo.svg" alt="ePag" class="epag-logo-image" />
          </div>
          ${countryBadge}
        </div>
        <div class="left-body">
          <div class="cart-section">
            <div class="cart-header-block">
              <h3 class="cart-title">Cart:</h3>
              <p class="cart-subtitle">Product selected into your cart</p>
            </div>
            <div class="cart-divider"></div>
            <div class="cart-items">
              ${cart.items.map(item => `
                <div class="cart-item">
                  <div class="cart-item-row">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-total">${selectedCountry ? selectedCountry.currencySymbol : 'R$'} ${item.total.toFixed(2)}</span>
                  </div>
                  <div class="cart-item-row secondary">
                    <span>Amount ${item.qty}</span>
                    <span>${selectedCountry ? selectedCountry.currencySymbol : 'R$'}${item.price.toFixed(2)} each</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="left-footer">
          <div class="order-row">
            <span class="order-label">Order Amount:</span>
          </div>
          <div class="order-amount">
            <span class="order-currency">${selectedCountry ? selectedCountry.currencySymbol : 'R$'}</span>
            <span class="order-value">${cart.subtotal.toFixed(2)}</span>
          </div>
        </div>`;
    }
  },

  // ─── Country Grid ──────────────────────────────────────────────────────────

  renderCountryGrid(state, compact = false) {
    const { selectedCountry } = state;
    return `
      <div class="country-grid${compact ? ' compact' : ''}">
        ${COUNTRIES.map(c => `
          <button class="country-btn${selectedCountry && selectedCountry.code === c.code ? ' selected' : ''}"
                  data-action="select-country" data-code="${c.code}"
                  aria-pressed="${selectedCountry && selectedCountry.code === c.code}"
                  title="${c.name}">
            ${this.renderCountryFlag(c)}
            <span class="country-name">${c.name}</span>
          </button>
        `).join('')}
      </div>`;
  },

  // ─── Payment Methods List ─────────────────────────────────────────────────

  renderMethodsList(state, compact = false) {
    const { selectedCountry, selectedMethod } = state;
    if (!selectedCountry) return '';
    const methods = selectedCountry.methods.map(id => PAYMENT_METHODS[id]).filter(Boolean);
    return `
      <div class="methods-list${compact ? ' compact' : ''}">
        ${methods.map(m => `
          <label class="method-row${selectedMethod && selectedMethod.id === m.id ? ' selected' : ''}"
                 data-action="${compact ? '' : 'select-method'}" data-method="${m.id}">
            <span class="method-radio-wrap">
              <input type="radio" name="payMethod" value="${m.id}"
                     ${selectedMethod && selectedMethod.id === m.id ? 'checked' : ''}>
              <span class="method-label">${m.name}</span>
            </span>
            <span class="method-icon-wrap">${this.renderMethodIcon(m)}</span>
          </label>
        `).join('')}
      </div>`;
  },

  renderCountryFlag(country, extraClass = '') {
    const flag = country && country.flag ? country.flag : '';
    if (!flag) return '<span class="country-flag">-</span>';

    // Supports either emoji text flags or asset paths.
    if (/\.(svg|png|jpe?g|webp)$/i.test(flag) || flag.includes('/')) {
      const classes = ['country-flag', 'country-flag-image', extraClass].filter(Boolean).join(' ');
      return `<img src="${flag}" alt="${country.name} flag" class="${classes}" loading="lazy">`;
    }

    return `<span class="country-flag ${extraClass}">${flag}</span>`;
  },

  renderMethodIcon(method) {
    const icon = method && method.icon ? method.icon : '';
    if (!icon) return '';

    if (this.icons[icon]) return this.icons[icon];

    if (/\.(svg|png|jpe?g|webp)$/i.test(icon) || icon.includes('/')) {
      return `<img src="${icon}" alt="${method.name}" class="method-icon method-icon-image" loading="lazy">`;
    }

    return '';
  },

  // ─── Right Panel ────────────────────────────────────────────────────────────

  renderRight(state) {
    const el = document.getElementById('panelRight');
    el.innerHTML = '';

    switch (state.step) {
      case 'select':    el.innerHTML = this.renderSelectStep(state); break;
      case 'form':      el.innerHTML = this.renderFormStep(state); break;
      case 'processing':el.innerHTML = this.renderProcessingStep(state); break;
      case 'payment':   el.innerHTML = this.renderPaymentStep(state); break;
      case 'confirm':   el.innerHTML = this.renderConfirmStep(state); break;
      default:          el.innerHTML = this.renderSelectStep(state);
    }
  },

  // ─── Step: Country + Methods Selection ────────────────────────────────────

  renderSelectStep(state) {
    return window.innerWidth <= 860
      ? this._renderSelectStepMobile(state)
      : this._renderSelectStepDesktop(state);
  },

  // Desktop: original flow — full country grid → methods list → Continue button
  _renderSelectStepDesktop(state) {
    const { selectedCountry, selectedMethod } = state;
    const hasMethod = !!selectedMethod;
    return `
      <div class="right-content">
        <div class="checkout-section">
          <h2 class="section-title">Country</h2>
          <p class="section-subtitle">Select the payment method country:</p>
          ${this.renderCountryGrid(state)}
        </div>

        <div class="checkout-section methods-section${selectedCountry ? '' : ' hidden'}" id="methodsSection">
          <h2 class="section-title">Payment Methods</h2>
          <p class="section-subtitle">Select the perfect payment method for you:</p>
          ${this.renderMethodsList(state)}
          <button class="btn-continue${hasMethod ? '' : ' disabled'}"
                  id="btnContinue" data-action="continue"
                  ${hasMethod ? '' : 'disabled'}>
            Continue
          </button>
        </div>

        <div class="checkout-footer">
          <p class="terms-text">By proceeding with this checkout, you agree to our
            <a href="#" class="terms-link">Terms and Conditions.</a>
          </p>
          <p class="powered-by">Powered by epag</p>
        </div>
      </div>`;
  },

  // Mobile: country via badge overlay; payment methods and form as collapsible steps
  _renderSelectStepMobile(state) {
    const { selectedCountry, selectedMethod } = state;

    let sections = '';

    if (!selectedCountry) {
      // No country yet — prompt to tap the badge
      sections = `
        <div class="mobile-country-prompt">
          <p class="mobile-country-prompt-text">Tap <strong>Select Country</strong> above to get started.</p>
        </div>`;
    } else if (!selectedMethod) {
      // Country selected — show payment methods
      sections = `
        <div class="checkout-section methods-section" id="methodsSection">
          <h2 class="section-title">Payment Methods</h2>
          <p class="section-subtitle">Select the perfect payment method for you:</p>
          ${this.renderMethodsList(state)}
        </div>`;
    } else {
      // Method selected — collapsed method + payment form
      sections = `
        ${this._renderCollapsedMethod(selectedMethod)}
        <div class="checkout-section payment-section" id="paymentSection">
          <form id="paymentForm" class="payment-form" novalidate>
            ${this._buildFormContent(state)}
          </form>
        </div>`;
    }

    return `
      <div class="right-content">
        ${sections}
        <div class="checkout-footer">
          <p class="terms-text">By proceeding with this checkout, you agree to our
            <a href="#" class="terms-link">Terms and Conditions.</a>
          </p>
          <p class="powered-by">Powered by epag</p>
        </div>
      </div>`;
  },

  // ─── Country Picker Overlay (mobile only) ─────────────────────────────────

  renderCountryPicker(state) {
    const modal = document.getElementById('checkoutModal');
    let overlay = document.getElementById('countryPickerOverlay');

    if (!state.countryPickerOpen || window.innerWidth > 860) {
      if (overlay) overlay.remove();
      return;
    }

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'countryPickerOverlay';
      modal.appendChild(overlay);
    }

    overlay.className = 'country-picker-overlay';
    overlay.innerHTML = this._buildCountryPickerHTML(state);
  },

  _buildCountryPickerHTML(state) {
    const { selectedCountry } = state;
    const rows = COUNTRIES.map(c => {
      const methods = c.methods
        .map(id => PAYMENT_METHODS[id])
        .filter(Boolean)
        .map(m => m.name)
        .join(' · ');
      const isSelected = selectedCountry && selectedCountry.code === c.code;
      return `
        <button class="cpr-row${isSelected ? ' selected' : ''}" data-action="select-country" data-code="${c.code}">
          <span class="cpr-code">${c.code}</span>
          <span class="cpr-info">
            <span class="cpr-name">${c.name}</span>
            <span class="cpr-methods">${methods}</span>
          </span>
          ${isSelected
            ? `<svg class="cpr-check" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9l4.5 4.5L15 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            : `<span class="cpr-check-placeholder"></span>`}
        </button>`;
    }).join('');

    return `
      <div class="cpr-header">
        <span class="cpr-title">Select your country</span>
        <button class="cpr-close" data-action="close-country-picker" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="cpr-list">${rows}</div>`;
  },

  // ─── Collapsed selectors ───────────────────────────────────────────────────

  _renderCollapsedCountry(country) {
    const chevron = `<svg class="chevron-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return `
      <div class="collapsed-selector" data-action="expand-country" role="button" tabindex="0" title="Change country">
        <div class="collapsed-selector-left">
          ${this.renderCountryFlag(country, 'collapsed-flag')}
          <span class="collapsed-selector-name">${country.name}</span>
        </div>
        ${chevron}
      </div>`;
  },

  _renderCollapsedMethod(method) {
    const chevron = `<svg class="chevron-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return `
      <div class="collapsed-selector" data-action="expand-method" role="button" tabindex="0" title="Change payment method">
        <div class="collapsed-selector-left">
          <span class="collapsed-method-icon">${this.renderMethodIcon(method)}</span>
          <span class="collapsed-selector-name">${method.name}</span>
        </div>
        ${chevron}
      </div>`;
  },

  // ─── Subtotal Box Helper ──────────────────────────────────────────────────

  _subtotalBox(cart, selectedCountry) {
    const fee = cart.subtotal * selectedCountry.fee;
    const total = cart.subtotal + fee;
    return `
      <div class="subtotal-box">
        <h3 class="subtotal-title">Sub-total</h3>
        <div class="subtotal-row">
          <span>Order Amount:</span>
          <span>${cart.subtotal.toFixed(2)} ${selectedCountry.currency}</span>
        </div>
        <div class="subtotal-row">
          <span>Customer Fee (${(selectedCountry.fee * 100).toFixed(2)}%):</span>
          <span>${fee.toFixed(2)} ${selectedCountry.currency}</span>
        </div>
        <div class="subtotal-divider"></div>
        <div class="payment-amount-label">Payment Amount</div>
        <div class="payment-amount-value">${selectedCountry.currencySymbol} ${total.toFixed(2)}</div>
      </div>`;
  },

  // ─── Shared form content builder ──────────────────────────────────────────

  _buildFormContent(state) {
    const { selectedMethod, selectedCountry, cart } = state;
    if (!selectedMethod || !selectedCountry) return '';

    const fee = cart.subtotal * selectedCountry.fee;
    const total = cart.subtotal + fee;
    const ft = selectedMethod.formType;

    const subtotalHTML = this._subtotalBox(cart, selectedCountry);

    if (ft === 'pix' || ft === 'boleto' || ft === 'picpay') {
      return `
        ${this._payerFields(selectedCountry)}
        ${subtotalHTML}
        <button type="button" class="btn-primary" data-action="submit-form">
          ${ft === 'pix' ? 'Generate QR Code' : ft === 'boleto' ? 'Generate Boleto' : 'Generate PicPay QR'}
        </button>`;
    } else if (ft === 'card') {
      return `
        ${this._cardFields(selectedMethod)}
        ${this._payerFields(selectedCountry)}
        ${subtotalHTML}
        <button type="button" class="btn-primary" data-action="submit-form">
          Pay ${selectedCountry.currencySymbol} ${total.toFixed(2)}
        </button>`;
    } else if (ft === 'cash_store') {
      return `
        ${this._payerFields(selectedCountry)}
        ${subtotalHTML}
        <button type="button" class="btn-primary" data-action="submit-form">Generate Reference</button>`;
    } else if (ft === 'bank_transfer') {
      return `
        ${this._payerFields(selectedCountry)}
        ${subtotalHTML}
        <button type="button" class="btn-primary" data-action="submit-form">Get Bank Details</button>`;
    } else if (ft === 'bank_redirect') {
      return `
        ${this._payerFields(selectedCountry)}
        ${subtotalHTML}
        <button type="button" class="btn-primary" data-action="submit-form">Redirect to Bank</button>`;
    }
    return '';
  },

  // ─── Step: Payment Form (fallback for direct 'form' step) ─────────────────

  renderFormStep(state) {
    const { selectedMethod } = state;
    if (!selectedMethod) return '';
    return `
      <div class="right-content">
        <div class="form-header">
          <h2 class="form-title">${selectedMethod.name}</h2>
        </div>
        <form id="paymentForm" class="payment-form" novalidate>
          ${this._buildFormContent(state)}
        </form>
        <div class="checkout-footer">
          <p class="terms-text">By proceeding with this checkout, you agree to our
            <a href="#" class="terms-link">Terms and Conditions.</a>
          </p>
          <p class="powered-by">Powered by epag</p>
        </div>
      </div>`;
  },

  _payerFields(country) {
    return `
      <div class="form-row two-col">
        <div class="form-group">
          <label class="form-label" for="fFirstName">First Name:</label>
          <input class="form-input" type="text" id="fFirstName" name="firstName"
                 placeholder="Input your First Name" required autocomplete="given-name">
        </div>
        <div class="form-group">
          <label class="form-label" for="fLastName">Last Name:</label>
          <input class="form-input" type="text" id="fLastName" name="lastName"
                 placeholder="Input your Last Name" required autocomplete="family-name">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Person Type:</label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" name="personType" value="individual" checked>
            <span>Individual</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="personType" value="company">
            <span>Company</span>
          </label>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="fTaxId">Tax ID (${country.taxLabel}):</label>
        <input class="form-input" type="text" id="fTaxId" name="taxId"
               placeholder="${country.taxPlaceholder}" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="fEmail">Email:</label>
        <input class="form-input" type="email" id="fEmail" name="email"
               placeholder="Input your Email" required autocomplete="email">
      </div>
      <div class="form-group">
        <label class="form-label" for="fPhone">Phone:</label>
        <input class="form-input" type="tel" id="fPhone" name="phone"
               placeholder="+55 (11) 99999-9999" autocomplete="tel">
      </div>`;
  },

  _cardFields(method) {
    const showInstallments = method.installments;
    const installmentOptions = Array.from({ length: 12 }, (_, i) => {
      const n = i + 1;
      return `<option value="${n}">${n}x sem juros</option>`;
    }).join('');
    return `
      <div class="form-group">
        <label class="form-label" for="fCardNum">Card Number:</label>
        <div class="card-input-wrap">
          <input class="form-input card-number-input" type="text" id="fCardNum"
                 name="cardNumber" placeholder="0000 0000 0000 0000"
                 maxlength="19" inputmode="numeric" autocomplete="cc-number">
          <span class="card-brand-display" id="cardBrandDisplay"></span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="fCardName">Cardholder Name:</label>
        <input class="form-input" type="text" id="fCardName" name="cardName"
               placeholder="Name as on card" required autocomplete="cc-name">
      </div>
      <div class="form-row two-col">
        <div class="form-group">
          <label class="form-label" for="fExpiry">Expiry (MM/YY):</label>
          <input class="form-input" type="text" id="fExpiry" name="expiry"
                 placeholder="MM/YY" maxlength="5" inputmode="numeric" autocomplete="cc-exp">
        </div>
        <div class="form-group">
          <label class="form-label" for="fCvv">CVV:</label>
          <input class="form-input" type="text" id="fCvv" name="cvv"
                 placeholder="•••" maxlength="4" inputmode="numeric" autocomplete="cc-csc">
        </div>
      </div>
      ${showInstallments ? `
      <div class="form-group">
        <label class="form-label" for="fInstallments">Installments:</label>
        <select class="form-input form-select" id="fInstallments" name="installments">
          ${installmentOptions}
        </select>
      </div>` : ''}`;
  },

  // ─── Step: Processing ──────────────────────────────────────────────────────

  renderProcessingStep(state) {
    return `
      <div class="right-content centered">
        <div class="processing-screen">
          ${this.icons.spinner}
          <p class="processing-text">Processing payment...</p>
          <p class="processing-subtext">Please wait, do not close this window.</p>
        </div>
      </div>`;
  },

  // ─── Step: Payment Result ──────────────────────────────────────────────────

  renderPaymentStep(state) {
    const { selectedMethod, selectedCountry, paymentResult, cart } = state;
    if (!selectedMethod || !paymentResult) return '';

    const fee = cart.subtotal * selectedCountry.fee;
    const total = cart.subtotal + fee;
    const ft = selectedMethod.formType;
    let content = '';

    if (ft === 'pix') {
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 30);
      const expiryStr = expiry.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric' }) +
                        ' - ' + expiry.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) + 'h';
      content = `
        <div class="payment-result-section">
          <label class="form-label">QR Code:</label>
          <div class="qr-container">
            <canvas id="qrCanvas" width="220" height="220"></canvas>
          </div>
          <p class="validity-text">Valid until: <strong>${expiryStr}</strong></p>
          ${this._subtotalBox(cart, selectedCountry)}
          <div class="form-group">
            <label class="form-label">PIX Code:</label>
            <div class="copy-field-wrap">
              <input class="form-input copy-field" type="text" readonly
                     value="${paymentResult.pix_code}" id="pixCodeField">
              <button class="btn-copy" data-action="copy" data-target="pixCodeField" title="Copy">
                ${this.icons.copy}
              </button>
            </div>
          </div>
          <button class="btn-primary" data-action="copy" data-target="pixCodeField">Copy Code</button>
          <button class="btn-secondary" data-action="confirm-payment">I already paid</button>
        </div>`;
    } else if (ft === 'boleto') {
      content = `
        <div class="payment-result-section">
          <div class="boleto-info">
            <div class="boleto-barcode">
              ${this._barcodeStripes()}
            </div>
            <p class="boleto-due">Due date: <strong>${paymentResult.due_date}</strong></p>
          </div>
          ${this._subtotalBox(cart, selectedCountry)}
          <div class="form-group">
            <label class="form-label">Barcode:</label>
            <div class="copy-field-wrap">
              <input class="form-input copy-field" type="text" readonly
                     value="${paymentResult.boleto_code}" id="boletoField">
              <button class="btn-copy" data-action="copy" data-target="boletoField" title="Copy">
                ${this.icons.copy}
              </button>
            </div>
          </div>
          <button class="btn-primary" data-action="copy" data-target="boletoField">Copy Barcode</button>
          <button class="btn-secondary" data-action="confirm-payment">Download Boleto (mock)</button>
        </div>`;
    } else if (ft === 'picpay') {
      content = `
        <div class="payment-result-section">
          <p class="instruction-text">Open the PicPay app and scan the QR Code below:</p>
          <div class="qr-container">
            <canvas id="qrCanvas" width="220" height="220"></canvas>
          </div>
          ${this._subtotalBox(cart, selectedCountry)}
          <button class="btn-secondary" data-action="confirm-payment">I already paid</button>
        </div>`;
    } else if (ft === 'cash_store') {
      const storeName = { OXXO: 'OXXO store', EFECTY: 'Efecty / Baloto', PAGO_EFECTIVO: 'PagoEfectivo agent' }[selectedMethod.id] || 'payment store';
      content = `
        <div class="payment-result-section">
          <p class="instruction-text">Go to a ${storeName} and provide this reference number:</p>
          <div class="reference-display">${paymentResult.cash_reference}</div>
          ${this._subtotalBox(cart, selectedCountry)}
          <div class="form-group">
            <div class="copy-field-wrap">
              <input class="form-input copy-field" type="text" readonly
                     value="${paymentResult.cash_reference}" id="refField">
              <button class="btn-copy" data-action="copy" data-target="refField" title="Copy">
                ${this.icons.copy}
              </button>
            </div>
          </div>
          <button class="btn-primary" data-action="copy" data-target="refField">Copy Reference</button>
          <button class="btn-secondary" data-action="confirm-payment">I already paid</button>
        </div>`;
    } else if (ft === 'bank_redirect') {
      content = `
        <div class="payment-result-section centered-content">
          ${this.icons.spinner}
          <p class="processing-text">Redirecting to bank...</p>
          <p class="processing-subtext">You are being redirected to your bank's secure payment portal.</p>
          ${this._subtotalBox(cart, selectedCountry)}
          <button class="btn-secondary" data-action="confirm-payment">I completed the bank payment</button>
        </div>`;
    } else if (ft === 'bank_transfer') {
      content = `
        <div class="payment-result-section">
          <p class="instruction-text">Transfer the exact amount to the bank details below:</p>
          <div class="bank-details">
            <div class="bank-row"><span>Bank:</span><strong>${paymentResult.bank_name}</strong></div>
            <div class="bank-row"><span>Bank Code:</span><strong>${paymentResult.bank_code}</strong></div>
            <div class="bank-row"><span>Agency:</span><strong>${paymentResult.agency}</strong></div>
            <div class="bank-row"><span>Account:</span><strong>${paymentResult.account}</strong></div>
            <div class="bank-row"><span>Reference:</span><strong>${paymentResult.reference_id}</strong></div>
          </div>
          ${this._subtotalBox(cart, selectedCountry)}
          <button class="btn-secondary" data-action="confirm-payment">I completed the transfer</button>
        </div>`;
    } else if (ft === 'card') {
      content = `
        <div class="payment-result-section centered-content">
          <div class="success-icon">${this.icons.check}</div>
          <h3 class="success-title">Payment Approved!</h3>
          <div class="result-details">
            <div class="result-row"><span>Auth. Code:</span><strong>${paymentResult.authorization_code}</strong></div>
            <div class="result-row"><span>NSU:</span><strong>${paymentResult.nsu}</strong></div>
            <div class="result-row"><span>Order Amount:</span><strong>${selectedCountry.currencySymbol} ${cart.subtotal.toFixed(2)}</strong></div>
            <div class="result-row"><span>Customer Fee (${(selectedCountry.fee * 100).toFixed(2)}%):</span><strong>${selectedCountry.currencySymbol} ${fee.toFixed(2)}</strong></div>
            <div class="result-row"><span>Total Charged:</span><strong>${selectedCountry.currencySymbol} ${total.toFixed(2)}</strong></div>
          </div>
          <button class="btn-primary" data-action="new-payment">New Payment</button>
        </div>`;
    }

    return `
      <div class="right-content">
        <div class="form-header">
          <h2 class="form-title">${selectedMethod.name}</h2>
        </div>
        ${content}
        <div class="checkout-footer">
          <p class="terms-text">By proceeding with this checkout, you agree to our
            <a href="#" class="terms-link">Terms and Conditions.</a>
          </p>
          <p class="powered-by">Powered by epag</p>
        </div>
      </div>`;
  },

  // ─── Step: Confirmation ────────────────────────────────────────────────────

  renderConfirmStep(state) {
    const { selectedMethod, selectedCountry, paymentResult, cart } = state;
    const fee = cart.subtotal * (selectedCountry ? selectedCountry.fee : 0);
    const total = cart.subtotal + fee;
    return `
      <div class="right-content centered">
        <div class="confirm-screen">
          <div class="success-icon anim-pop">${this.icons.check}</div>
          <h2 class="confirm-title">Payment Confirmed ✓</h2>
          <p class="confirm-subtitle">Your payment has been successfully processed.</p>
          <div class="confirm-details">
            <div class="confirm-row">
              <span>Method:</span>
              <strong>${selectedMethod ? selectedMethod.name : '—'}</strong>
            </div>
            <div class="confirm-row">
              <span>Amount:</span>
              <strong>${selectedCountry ? selectedCountry.currencySymbol : ''} ${total.toFixed(2)} ${selectedCountry ? selectedCountry.currency : ''}</strong>
            </div>
            <div class="confirm-row">
              <span>Reference:</span>
              <strong>${paymentResult ? paymentResult.reference_id : '—'}</strong>
            </div>
            <div class="confirm-row">
              <span>Token:</span>
              <strong class="mono">${paymentResult ? paymentResult.payment_token.substr(0, 18) + '…' : '—'}</strong>
            </div>
          </div>
          <button class="btn-primary" data-action="new-payment">New Payment</button>
        </div>
      </div>`;
  },

  // ─── Helpers ───────────────────────────────────────────────────────────────

  _barcodeStripes() {
    const widths = [2,1,3,1,2,4,1,2,1,3,2,1,2,3,1,4,1,2,3,1,2,1,4,1,2,3,1,2,1,3,2,1,2,1,3];
    let svg = `<svg viewBox="0 0 200 60" class="barcode-svg" xmlns="http://www.w3.org/2000/svg">`;
    let x = 0;
    widths.forEach((w, i) => {
      if (i % 2 === 0) {
        svg += `<rect x="${x}" y="0" width="${w * 3}" height="60" fill="#1A1A1A"/>`;
      }
      x += w * 3;
    });
    svg += '</svg>';
    return svg;
  },

  // Draw a convincing fake QR code on canvas
  drawQRCode(canvasId, seed = 42) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const modules = 29;
    const ms = Math.floor(size / modules);
    const offset = Math.floor((size - modules * ms) / 2);

    // LCG pseudo-random with seed
    let s = seed;
    const rand = () => { s = (s * 1664525 + 1013904223) & 0x7FFFFFFF; return s / 0x7FFFFFFF; };

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    // Draw random data modules (excluding finder pattern zones)
    ctx.fillStyle = '#000';
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        // Skip finder pattern areas (corners 7x7 + 1 separator)
        const inTL = row < 9 && col < 9;
        const inTR = row < 9 && col >= modules - 9;
        const inBL = row >= modules - 9 && col < 9;
        if (inTL || inTR || inBL) continue;
        if (rand() > 0.5) {
          ctx.fillRect(offset + col * ms, offset + row * ms, ms - 0, ms - 0);
        }
      }
    }

    // Draw timing patterns
    for (let i = 8; i < modules - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(offset + i * ms, offset + 6 * ms, ms, ms);
        ctx.fillRect(offset + 6 * ms, offset + i * ms, ms, ms);
      } else {
        ctx.clearRect(offset + i * ms, offset + 6 * ms, ms, ms);
        ctx.clearRect(offset + 6 * ms, offset + i * ms, ms, ms);
      }
    }

    // Draw finder patterns (3 corners)
    [[0, 0], [modules - 7, 0], [0, modules - 7]].forEach(([r, c]) => {
      this._drawFinder(ctx, offset + c * ms, offset + r * ms, ms);
    });

    // Draw alignment pattern (bottom-right area)
    this._drawAlignment(ctx, offset + (modules - 7) * ms, offset + (modules - 7) * ms, ms);
  },

  _drawFinder(ctx, x, y, ms) {
    // 7x7 outer black
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, 7 * ms, 7 * ms);
    // 5x5 inner white
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + ms, y + ms, 5 * ms, 5 * ms);
    // 3x3 inner black
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 2 * ms, y + 2 * ms, 3 * ms, 3 * ms);
  },

  _drawAlignment(ctx, x, y, ms) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, 5 * ms, 5 * ms);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + ms, y + ms, 3 * ms, 3 * ms);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 2 * ms, y + 2 * ms, ms, ms);
  },

  // Show validation error on a field
  showFieldError(fieldEl, message) {
    fieldEl.classList.add('input-error');
    let err = fieldEl.parentElement.querySelector('.field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-error';
      fieldEl.parentElement.appendChild(err);
    }
    err.textContent = message;
  },

  clearFieldError(fieldEl) {
    fieldEl.classList.remove('input-error');
    const err = fieldEl.parentElement.querySelector('.field-error');
    if (err) err.remove();
  },

  // Show a toast notification
  showToast(message, type = 'success') {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      document.body.appendChild(toast);
    }
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.classList.add('toast-show');
    setTimeout(() => toast.classList.remove('toast-show'), 2500);
  }
};
