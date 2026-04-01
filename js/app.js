/**
 * app.js — Main orchestrator for epag POS Checkout
 * Manages application state and handles all user interactions.
 */

const App = {
  // ─── State ─────────────────────────────────────────────────────────────────
  state: {
    step: 'select',           // 'select' | 'form' | 'processing' | 'payment' | 'confirm'
    selectedCountry: null,    // country object from COUNTRIES[]
    selectedMethod: null,     // method object from PAYMENT_METHODS{}
    paymentResult: null,      // mock API response
    countryPickerOpen: false, // mobile country picker overlay
    countdownInterval: null,  // countdown timer interval ID
    cart: {
      items: [
        { name: 'Gift Voucher',                qty: 2, price: 5.00,  total: 10.00 },
        { name: '1 Month Premium Subscription', qty: 1, price: 10.00, total: 10.00 }
      ],
      subtotal: 20.00
    }
  },

  // ─── Init ──────────────────────────────────────────────────────────────────
  init() {
    this.render();
    this._bindEvents();
  },

  // ─── Render ────────────────────────────────────────────────────────────────
  render() {
    CheckoutUI.renderLeft(this.state);
    CheckoutUI.renderRight(this.state);
    CheckoutUI.renderCountryPicker(this.state);

    // Post-render hooks
    if (this.state.step === 'payment') {
      const ft = this.state.selectedMethod && this.state.selectedMethod.formType;
      if (ft === 'pix' || ft === 'codi' || ft === 'mach') {
        // Seed QR from payment token for consistency
        const seed = this.state.paymentResult
          ? parseInt(this.state.paymentResult.payment_token.replace(/-/g, '').substr(0, 8), 16)
          : 9999;
        setTimeout(() => CheckoutUI.drawQRCode('qrCanvas', seed), 50);
        // Start countdown for auto-confirmation (only for QR-based methods with auto-confirm)
        setTimeout(() => this._startAutoConfirmCountdown(), 50);
      }
      if (ft === 'picpay') {
        // PicPay also needs QR but without auto-confirm
        const seed = this.state.paymentResult
          ? parseInt(this.state.paymentResult.payment_token.replace(/-/g, '').substr(0, 8), 16)
          : 9999;
        setTimeout(() => CheckoutUI.drawQRCode('qrCanvas', seed), 50);
      }
      if (ft === 'bank_redirect') {
        setTimeout(() => this._handleBankRedirect(), 3000);
      }
    }

    // Bind card number formatting after form renders
    const ft = this.state.selectedMethod && this.state.selectedMethod.formType;
    const cardOnDesktop = ft === 'card' && this.state.step === 'form';
    const cardOnMobile  = ft === 'card' && this.state.step === 'select' && window.innerWidth <= 860;
    if (cardOnDesktop || cardOnMobile) {
      setTimeout(() => this._bindCardInputs(), 50);
    }
  },

  // ─── Event Delegation ──────────────────────────────────────────────────────
  _bindEvents() {
    const modal = document.getElementById('checkoutModal');
    modal.addEventListener('click', (e) => this._handleClick(e));
    modal.addEventListener('change', (e) => this._handleChange(e));

    // Close button
    document.getElementById('btnClose').addEventListener('click', () => {
      this._resetToStart();
    });
  },

  _handleClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
      case 'select-country': {
        const code = el.dataset.code;
        const country = COUNTRIES.find(c => c.code === code);
        if (!country) return;
        this._clearAutoConfirmCountdown();
        this.state.selectedCountry = country;
        this.state.selectedMethod = PAYMENT_METHODS[country.methods[0]];
        this.state.countryPickerOpen = false;
        this._processDirectPayment();
        break;
      }

      case 'open-country-picker': {
        this.state.countryPickerOpen = true;
        this.render();
        break;
      }

      case 'close-country-picker': {
        this.state.countryPickerOpen = false;
        this.render();
        break;
      }

      case 'select-method': {
        const methodId = el.dataset.method || el.closest('[data-method]')?.dataset.method;
        if (!methodId) return;
        const method = PAYMENT_METHODS[methodId];
        if (!method) return;
        this.state.selectedMethod = method;
        // Mobile + direct method: skip form entirely
        if (window.innerWidth <= 860 && this._isDirectMethod(method)) {
          this._processDirectPayment();
        } else {
          this.render();
          setTimeout(() => {
            const ps = document.getElementById('paymentSection');
            if (ps) ps.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
        break;
      }

      case 'continue': {
        if (!this.state.selectedMethod) return;
        // Desktop + direct method: skip form entirely
        if (this._isDirectMethod(this.state.selectedMethod)) {
          this._processDirectPayment();
        } else {
          this.state.step = 'form';
          this.render();
        }
        break;
      }

      case 'expand-country': {
        this._clearAutoConfirmCountdown();
        this.state.selectedCountry = null;
        this.state.selectedMethod = null;
        this.state.step = 'select';
        this.render();
        break;
      }

      case 'expand-method': {
        this._clearAutoConfirmCountdown();
        this.state.selectedMethod = null;
        this.state.step = 'select';
        this.render();
        setTimeout(() => {
          const ms = document.getElementById('methodsSection');
          if (ms) ms.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        break;
      }

      case 'submit-form': {
        e.preventDefault();
        this._submitPaymentForm();
        break;
      }

      case 'copy': {
        const targetId = el.dataset.target;
        const field = document.getElementById(targetId);
        if (!field) return;
        navigator.clipboard.writeText(field.value).then(() => {
          CheckoutUI.showToast('Copied to clipboard!');
        }).catch(() => {
          // Fallback for older browsers
          field.select();
          document.execCommand('copy');
          CheckoutUI.showToast('Copied to clipboard!');
        });
        break;
      }

      case 'confirm-payment': {
        this._confirmPayment();
        break;
      }

      case 'new-payment': {
        this._resetToStart();
        break;
      }
    }
  },

  _handleChange(e) {
    // Radio buttons for payment method selection (only active in select step)
    if (e.target.name === 'payMethod' && this.state.step === 'select') {
      const methodId = e.target.value;
      const method = PAYMENT_METHODS[methodId];
      if (method) {
        this.state.selectedMethod = method;
        if (window.innerWidth <= 860) {
          // Mobile: direct methods skip form; others show collapsible form
          if (this._isDirectMethod(method)) {
            this._processDirectPayment();
          } else {
            this.render();
          }
        } else {
          // Desktop: update Continue button state without full re-render
          const btn = document.getElementById('btnContinue');
          if (btn) {
            btn.disabled = false;
            btn.classList.remove('disabled');
          }
          document.querySelectorAll('.method-row').forEach(r => {
            r.classList.toggle('selected', r.dataset.method === methodId);
          });
        }
      }
    }
  },

  // ─── Card Input Binding ────────────────────────────────────────────────────
  _bindCardInputs() {
    const cardNumInput = document.getElementById('fCardNum');
    const expiryInput  = document.getElementById('fExpiry');
    const brandDisplay = document.getElementById('cardBrandDisplay');

    if (cardNumInput) {
      cardNumInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substr(0, 16);
        const brand = detectCardBrand(val);
        val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = val;
        if (brandDisplay) {
          brandDisplay.innerHTML = brand ? CheckoutUI.icons[brand] || '' : '';
        }
      });
    }

    if (expiryInput) {
      expiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substr(0, 4);
        if (val.length >= 3) val = val.substr(0, 2) + '/' + val.substr(2);
        e.target.value = val;
      });
    }
  },

  // ─── Form Submission ───────────────────────────────────────────────────────
  _submitPaymentForm() {
    const form = document.getElementById('paymentForm');
    if (!form) return;

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      CheckoutUI.clearFieldError(field);
      if (!field.value.trim()) {
        CheckoutUI.showFieldError(field, 'This field is required');
        valid = false;
      }
    });

    // Email validation
    const emailField = form.querySelector('[name="email"]');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      CheckoutUI.showFieldError(emailField, 'Enter a valid email address');
      valid = false;
    }

    if (!valid) return;

    // Build mock payload
    const formData = new FormData(form);
    const payload = {
      contract_id: 'DEMO_CONTRACT',
      reference_id: 'POS-' + Date.now(),
      notification_url: 'https://my.notification.url/callback/',
      payment: {
        amount: this.state.cart.subtotal,
        currency: this.state.selectedCountry.currency,
        country: this.state.selectedCountry.code,
        method: this.state.selectedMethod.id
      },
      person: {
        full_name: (formData.get('firstName') || '') + ' ' + (formData.get('lastName') || ''),
        email: formData.get('email') || '',
        tax_id: formData.get('taxId') || ''
      }
    };

    // Transition to processing
    this.state.step = 'processing';
    this.render();

    // Call mock API
    MockAPI.process(this.state.selectedMethod.id, payload)
      .then(result => {
        this.state.paymentResult = result;
        // Card payments go straight to payment step (which shows approved)
        this.state.step = 'payment';
        this.render();
      })
      .catch(err => {
        console.error('Mock API error:', err);
        this.state.step = 'form';
        this.render();
        CheckoutUI.showToast('Payment processing failed. Please try again.', 'error');
      });
  },

  // ─── Confirm Payment ───────────────────────────────────────────────────────
  _confirmPayment() {
    const token = this.state.paymentResult ? this.state.paymentResult.payment_token : null;
    this.state.step = 'processing';
    this.render();

    MockAPI.confirmPayment(token).then(result => {
      this.state.paymentResult = { ...this.state.paymentResult, ...result };
      this.state.step = 'confirm';
      this.render();
    });
  },

  // ─── Bank Redirect Auto-progress ──────────────────────────────────────────
  _handleBankRedirect() {
    // After 3 seconds on redirect screen, offer confirmation
    CheckoutUI.showToast('Bank redirect complete. Please confirm your payment.', 'info');
  },

  // ─── Direct Payment (no form needed — QR Code / Barcode methods) ──────────
  _isDirectMethod(method) {
    return method && ['pix', 'picpay', 'boleto', 'bank_transfer', 'codi', 'mach'].includes(method.formType);
  },

  _processDirectPayment() {
    const payload = {
      contract_id: 'DEMO_CONTRACT',
      reference_id: 'POS-' + Date.now(),
      notification_url: 'https://my.notification.url/callback/',
      payment: {
        amount: this.state.cart.subtotal,
        currency: this.state.selectedCountry.currency,
        country: this.state.selectedCountry.code,
        method: this.state.selectedMethod.id
      },
      person: {}
    };

    this.state.step = 'processing';
    this.render();

    MockAPI.process(this.state.selectedMethod.id, payload)
      .then(result => {
        this.state.paymentResult = result;
        this.state.step = 'payment';
        this.render();
      })
      .catch(err => {
        console.error('Mock API error:', err);
        this.state.step = 'select';
        this.render();
        CheckoutUI.showToast('Payment processing failed. Please try again.', 'error');
      });
  },

  // ─── Reset ─────────────────────────────────────────────────────────────────
  _resetToStart() {
    this._clearAutoConfirmCountdown();
    this.state.step = 'select';
    this.state.selectedCountry = null;
    this.state.selectedMethod = null;
    this.state.paymentResult = null;
    this.state.countryPickerOpen = false;
    this.render();
  }
};

// ─── Auto-Confirm Countdown ────────────────────────────────────────────────
App._startAutoConfirmCountdown = function() {
  this._clearAutoConfirmCountdown();
  const startTime = Date.now();
  const duration = 10000; // 10 seconds in ms
  const timerEl = document.getElementById('countdownTimer');
  const progressFill = document.getElementById('progressFill');

  const update = () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 10 - Math.floor(elapsed / 1000));
    const percentage = Math.max(0, 100 - (elapsed / duration) * 100);

    if (timerEl) {
      timerEl.textContent = remaining;
    }

    if (progressFill) {
      progressFill.style.width = percentage + '%';
    }

    if (elapsed < duration) {
      requestAnimationFrame(update);
    } else {
      this._clearAutoConfirmCountdown();
      this._confirmPayment();
    }
  };

  requestAnimationFrame(update);
};

App._clearAutoConfirmCountdown = function() {
  if (this.state.countdownInterval) {
    clearInterval(this.state.countdownInterval);
    this.state.countdownInterval = null;
  }
};

// ─── Bootstrap ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
