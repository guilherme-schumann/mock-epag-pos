/**
 * mock-api.js — Simulated epag API responses with realistic delays
 * Base URL (sandbox): https://api-sandbox.epag.io
 */

const MockAPI = {
  // Utility: simulate network latency
  _delay(min = 1000, max = 2000) {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Utility: generate a UUID-like token
  _token() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  },

  // Utility: generate a reference ID
  _ref() {
    return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  },

  // POST /pix/simple
  async processPIX(payload) {
    await this._delay(1200, 1800);
    return {
      transaction_status: 'PROCESSING',
      payment_token: this._token(),
      reference_id: this._ref(),
      pix_code: '00020101021226600016BR.GOV.BCB.PIX013648213C48-CCC6-4FAA-95F4-52E355A79694' +
                '5204899953039865404' + payload.payment.amount.toFixed(2) +
                '5802BR5925ELPL Tecnologia em Pagame6009Sao Paulo63043DsC',
      totals: {
        amount: payload.payment.amount,
        currency: payload.payment.currency,
        fee: (payload.payment.amount * 0.0125).toFixed(2)
      }
    };
  },

  // POST /boleto/simple
  async processBoleto(payload) {
    await this._delay(1000, 1600);
    const due = new Date();
    due.setDate(due.getDate() + 3);
    const dueStr = due.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return {
      transaction_status: 'PROCESSING',
      payment_token: this._token(),
      reference_id: this._ref(),
      boleto_code: '23793.38128 60007.827136 96000.063305 5 93250000' +
                   Math.round(payload.payment.amount * 100).toString().padStart(10, '0'),
      due_date: dueStr,
      totals: {
        amount: payload.payment.amount,
        currency: payload.payment.currency
      }
    };
  },

  // POST /card/simple
  async processCard(payload) {
    await this._delay(1500, 2500);
    return {
      transaction_status: 'APPROVED',
      payment_token: this._token(),
      reference_id: this._ref(),
      authorization_code: Math.random().toString(36).substr(2, 6).toUpperCase(),
      nsu: Math.floor(Math.random() * 999999).toString().padStart(6, '0'),
      totals: {
        amount: payload.payment.amount,
        currency: payload.payment.currency
      }
    };
  },

  // POST /picpay/simple
  async processPicPay(payload) {
    await this._delay(1000, 1500);
    return {
      transaction_status: 'PROCESSING',
      payment_token: this._token(),
      reference_id: this._ref(),
      qr_code_url: 'picpay://qrcode/' + this._token(),
      totals: {
        amount: payload.payment.amount,
        currency: payload.payment.currency
      }
    };
  },

  // POST /paycash/simple (OXXO, Efecty, PagoEfectivo)
  async processCashStore(payload) {
    await this._delay(1000, 1500);
    const ref = Math.floor(Math.random() * 9000000000 + 1000000000).toString();
    return {
      transaction_status: 'PROCESSING',
      payment_token: this._token(),
      reference_id: this._ref(),
      cash_reference: ref,
      totals: {
        amount: payload.payment.amount,
        currency: payload.payment.currency
      }
    };
  },

  // Bank Transfer
  async processBankTransfer(payload) {
    await this._delay(800, 1200);
    return {
      transaction_status: 'PROCESSING',
      payment_token: this._token(),
      reference_id: this._ref(),
      bank_name: 'Banco do Brasil',
      bank_code: '001',
      agency: '0001-2',
      account: '12345-6',
      totals: {
        amount: payload.payment.amount,
        currency: payload.payment.currency
      }
    };
  },

  // POST /codi/simple
  async processCoDI(payload) {
    await this._delay(1200, 1800);
    return {
      transaction_status: 'PROCESSING',
      payment_token: this._token(),
      reference_id: this._ref(),
      codi_code: 'CODI' + Math.random().toString(36).substr(2, 16).toUpperCase() +
                 payload.payment.amount.toFixed(2).replace('.', '') + 'MX',
      totals: {
        amount: payload.payment.amount,
        currency: payload.payment.currency,
        fee: (payload.payment.amount * 0.015).toFixed(2)
      }
    };
  },

  // POST /mach/simple
  async processMACH(payload) {
    await this._delay(1200, 1800);
    return {
      transaction_status: 'PROCESSING',
      payment_token: this._token(),
      reference_id: this._ref(),
      mach_code: 'MACH' + Math.random().toString(36).substr(2, 16).toUpperCase() +
                 payload.payment.amount.toFixed(2).replace('.', '') + 'CL',
      totals: {
        amount: payload.payment.amount,
        currency: payload.payment.currency,
        fee: (payload.payment.amount * 0.015).toFixed(2)
      }
    };
  },

  // Bank Redirect (SPEI / PSE)
  async processBankRedirect(payload) {
    await this._delay(1500, 2000);
    return {
      transaction_status: 'REDIRECTING',
      payment_token: this._token(),
      reference_id: this._ref(),
      redirect_url: '#',
      totals: {
        amount: payload.payment.amount,
        currency: payload.payment.currency
      }
    };
  },

  // Confirm / poll payment status
  async confirmPayment(token) {
    await this._delay(2000, 3000);
    return {
      transaction_status: 'APPROVED',
      payment_token: token
    };
  },

  // Route to correct handler based on method
  async process(methodId, payload) {
    switch (methodId) {
      case 'PIX':           return this.processPIX(payload);
      case 'BOLETO':        return this.processBoleto(payload);
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':    return this.processCard(payload);
      case 'PICPAY':        return this.processPicPay(payload);
      case 'OXXO':
      case 'EFECTY':
      case 'PAYCASH':
      case 'PAYNET':
      case 'TIENDAS_Y_FARMACIAS':
      case 'PAGO_EFECTIVO': return this.processCashStore(payload);
      case 'CODI':          return this.processCoDI(payload);
      case 'MACH':          return this.processMACH(payload);
      case 'SPEI':
      case 'PSE':
      case 'NEQUI':
      case 'DEUNA':         return this.processBankRedirect(payload);
      case 'BANK_TRANSFER': return this.processBankTransfer(payload);
      default:              return this.processCashStore(payload);
    }
  }
};
