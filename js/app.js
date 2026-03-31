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

    // Post-render hooks
    if (this.state.step === 'payment') {
      const ft = this.state.selectedMethod && this.state.selectedMethod.formType;
      if (ft === 'pix' || ft === 'picpay') {
        // Seed QR from payment token for consistency
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
    if (this.state.step === 'form') {
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
        this.state.selectedCountry = country;
        this.state.selectedMethod = null;
        this.state.step = 'select';
        // Update cart currency display
        this.render();
        // Scroll to methods section
        setTimeout(() => {
          const ms = document.getElementById('methodsSection');
          if (ms) ms.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        break;
      }

      case 'select-method': {
        const methodId = el.dataset.method || el.closest('[data-method]')?.dataset.method;
        if (!methodId) return;
        const method = PAYMENT_METHODS[methodId];
        if (!method) return;
        this.state.selectedMethod = method;
        this.render();
        break;
      }

      case 'continue': {
        if (!this.state.selectedMethod) return;
        this.state.step = 'form';
        this.render();
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
        // Update the Continue button state without full re-render
        const btn = document.getElementById('btnContinue');
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('disabled');
        }
        // Highlight selected row
        document.querySelectorAll('.method-row').forEach(r => {
          r.classList.toggle('selected', r.dataset.method === methodId);
        });
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

  // ─── Reset ─────────────────────────────────────────────────────────────────
  _resetToStart() {
    this.state.step = 'select';
    this.state.selectedCountry = null;
    this.state.selectedMethod = null;
    this.state.paymentResult = null;
    this.render();
  }
};

// ─── Bootstrap ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
