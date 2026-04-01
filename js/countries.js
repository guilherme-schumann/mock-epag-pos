/**
 * countries.js — Country data and payment methods for epag POS Checkout
 */

const COUNTRIES = [
  {
    code: 'BR',
    name: 'Brazil',
    flag: 'assets/country-flags/Brazil.svg',
    currency: 'BRL',
    currencySymbol: 'R$',
    taxLabel: 'CPF / CNPJ',
    taxPlaceholder: '000.000.000-00',
    methods: ['PIX'],
    fee: 0.0125
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: 'assets/country-flags/Mexico.svg',
    currency: 'MXN',
    currencySymbol: 'MX$',
    taxLabel: 'RFC',
    taxPlaceholder: 'AAAA000000AAA',
    methods: ['CODI'],
    fee: 0.015
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: 'assets/country-flags/Chile.svg',
    currency: 'CLP',
    currencySymbol: 'CLP$',
    taxLabel: 'RUT',
    taxPlaceholder: '00.000.000-0',
    methods: ['MACH'],
    fee: 0.015
  }
];

const PAYMENT_METHODS = {
  PIX: {
    id: 'PIX',
    name: 'PIX',
    icon: 'assets/payment-methods/pix.svg',
    formType: 'pix',
    cardBrands: []
  },
  BOLETO: {
    id: 'BOLETO',
    name: 'Boleto',
    icon: 'assets/payment-methods/bar_code.svg',
    formType: 'boleto',
    cardBrands: []
  },
  CREDIT_CARD: {
    id: 'CREDIT_CARD',
    name: 'Credit Card',
    icon: 'assets/payment-methods/Credit Card.svg',
    formType: 'card',
    installments: true,
    cardBrands: ['visa', 'mastercard', 'amex', 'elo']
  },
  DEBIT_CARD: {
    id: 'DEBIT_CARD',
    name: 'Debit Card',
    icon: 'assets/payment-methods/Debit Card.svg',
    formType: 'card',
    installments: false,
    cardBrands: ['visa', 'mastercard']
  },
  PICPAY: {
    id: 'PICPAY',
    name: 'PicPay',
    icon: 'assets/payment-methods/picpay.svg',
    formType: 'picpay',
    cardBrands: []
  },
  OXXO: {
    id: 'OXXO',
    name: 'OXXO',
    icon: 'assets/payment-methods/OXXO.svg',
    formType: 'cash_store',
    cardBrands: []
  },
  SPEI: {
    id: 'SPEI',
    name: 'SPEI',
    icon: 'assets/payment-methods/SPEI.svg',
    formType: 'bank_redirect',
    cardBrands: []
  },
  PSE: {
    id: 'PSE',
    name: 'PSE',
    icon: 'assets/payment-methods/Bank Transfer.svg',
    formType: 'bank_redirect',
    cardBrands: []
  },
  EFECTY: {
    id: 'EFECTY',
    name: 'Efecty / Baloto',
    icon: 'assets/payment-methods/PayCash.svg',
    formType: 'cash_store',
    cardBrands: []
  },
  PAGO_EFECTIVO: {
    id: 'PAGO_EFECTIVO',
    name: 'PagoEfectivo',
    icon: 'assets/payment-methods/PagoEfectivo.svg',
    formType: 'cash_store',
    cardBrands: []
  },
  BANK_TRANSFER: {
    id: 'BANK_TRANSFER',
    name: 'Bank Transfer',
    icon: 'assets/payment-methods/Bank Transfer.svg',
    formType: 'bank_transfer',
    cardBrands: []
  },
  PAYCASH: {
    id: 'PAYCASH',
    name: 'PayCash',
    icon: 'assets/payment-methods/PayCash.svg',
    formType: 'cash_store',
    cardBrands: []
  },
  PAYNET: {
    id: 'PAYNET',
    name: 'Paynet',
    icon: 'assets/payment-methods/PayCash.svg',
    formType: 'cash_store',
    cardBrands: []
  },
  TIENDAS_Y_FARMACIAS: {
    id: 'TIENDAS_Y_FARMACIAS',
    name: 'Tiendas y Farmacias',
    icon: 'assets/payment-methods/Tiendas Y Farmacias.svg',
    formType: 'cash_store',
    cardBrands: []
  },
  NEQUI: {
    id: 'NEQUI',
    name: 'Nequi',
    icon: 'assets/payment-methods/Nequi.svg',
    formType: 'bank_redirect',
    cardBrands: []
  },
  DEUNA: {
    id: 'DEUNA',
    name: 'Deuna',
    icon: 'assets/payment-methods/Deuna.svg',
    formType: 'bank_redirect',
    cardBrands: []
  },
  CODI: {
    id: 'CODI',
    name: 'CoDI',
    icon: 'assets/payment-methods/CoDI.svg',
    formType: 'codi',
    cardBrands: []
  },
  MACH: {
    id: 'MACH',
    name: 'Mach',
    icon: 'assets/payment-methods/Mach.svg',
    formType: 'mach',
    cardBrands: []
  }
};

// Detect card brand from number prefix
function detectCardBrand(number) {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(?:011|22126-55665|5[0-9]{2})/.test(n)) return 'discover';
  if (/^(?:506[012]|636[368]|65[0-9]{2})/.test(n)) return 'elo';
  return null;
}

// Format card number with spaces
function formatCardNumber(value, brand) {
  const digits = value.replace(/\D/g, '');
  if (brand === 'amex') {
    return digits.replace(/^(\d{4})(\d{6})(\d{5})$/, '$1 $2 $3');
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

// Format currency amount
function formatAmount(amount, country) {
  if (!country) return amount.toFixed(2);
  const formatted = amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${country.currencySymbol} ${amount.toFixed(2)}`;
}
