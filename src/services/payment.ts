/**
 * NEXA — Payment Gateway Service
 *
 * Integra com Asaas API para:
 * - Deposito via Pix (QR code + copia-e-cola)
 * - Deposito via cartao de credito
 * - Saque via Pix (processado em ate 24h)
 * - Consulta de status de pagamento
 *
 * Referencia: Stripe checkout flow, PicPay/Mercado Pago Pix
 *
 * Em producao: USE_REAL_PAYMENTS = true + ASAAS_API_KEY real
 * Em dev: USE_REAL_PAYMENTS = false → mock com delays realistas
 */

import { ENV, isConfigured } from '../config/env';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type PaymentMethod = 'pix' | 'credit_card';
export type PaymentStatus = 'pending' | 'confirmed' | 'received' | 'failed' | 'refunded' | 'expired';
export type WithdrawStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PixPayment {
  id: string;
  externalId: string;       // Asaas payment ID
  amount: number;
  status: PaymentStatus;
  pixQrCode: string;        // base64 QR code image
  pixCopyPaste: string;     // copia-e-cola key
  expiresAt: string;        // ISO timestamp
  createdAt: string;
}

export interface CardPayment {
  id: string;
  externalId: string;
  amount: number;
  status: PaymentStatus;
  last4: string;
  brand: string;
  createdAt: string;
}

export interface WithdrawRequest {
  id: string;
  externalId: string;
  amount: number;
  status: WithdrawStatus;
  pixKey: string;
  pixKeyType: 'cpf' | 'email' | 'phone' | 'random';
  estimatedAt: string;      // ISO — estimated completion
  createdAt: string;
  completedAt: string | null;
}

export interface PaymentError {
  code: string;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// ASAAS API CLIENT
// ═══════════════════════════════════════════════════════════════

async function asaasRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: Record<string, any>,
): Promise<T> {
  const res = await fetch(`${ENV.ASAAS_API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ENV.ASAAS_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw {
      code: `ASAAS_${res.status}`,
      message: err.errors?.[0]?.description ?? `Erro ${res.status}`,
    } as PaymentError;
  }

  return res.json();
}

// ═══════════════════════════════════════════════════════════════
// CUSTOMER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

let cachedCustomerId: string | null = null;

/** Ensure Asaas customer exists for this user */
async function ensureCustomer(params: {
  name: string;
  cpf: string;
  email: string;
}): Promise<string> {
  if (cachedCustomerId) return cachedCustomerId;

  // Check if exists
  const search = await asaasRequest<{ data: { id: string }[] }>(
    `/customers?cpfCnpj=${params.cpf}`,
  );
  if (search.data.length > 0) {
    cachedCustomerId = search.data[0].id;
    return cachedCustomerId;
  }

  // Create new
  const customer = await asaasRequest<{ id: string }>('/customers', 'POST', {
    name: params.name,
    cpfCnpj: params.cpf,
    email: params.email,
  });
  cachedCustomerId = customer.id;
  return cachedCustomerId;
}

// ═══════════════════════════════════════════════════════════════
// PIX DEPOSIT
// ═══════════════════════════════════════════════════════════════

export async function createPixDeposit(params: {
  amount: number;
  userId: string;
  userName: string;
  userCpf: string;
  userEmail: string;
}): Promise<PixPayment> {
  if (!ENV.USE_REAL_PAYMENTS || !isConfigured('ASAAS_API_KEY')) {
    return mockPixDeposit(params.amount);
  }

  const customerId = await ensureCustomer({
    name: params.userName,
    cpf: params.userCpf,
    email: params.userEmail,
  });

  // Create Pix payment
  const payment = await asaasRequest<{
    id: string;
    status: string;
    dueDate: string;
  }>('/payments', 'POST', {
    customer: customerId,
    billingType: 'PIX',
    value: params.amount,
    dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 10), // 30 min
    description: `NEXA Deposito R$${params.amount.toFixed(2)}`,
    externalReference: `nexa_dep_${params.userId}_${Date.now()}`,
  });

  // Get Pix QR code
  const pix = await asaasRequest<{
    encodedImage: string;
    payload: string;
    expirationDate: string;
  }>(`/payments/${payment.id}/pixQrCode`);

  return {
    id: `dep_${Date.now()}`,
    externalId: payment.id,
    amount: params.amount,
    status: 'pending',
    pixQrCode: pix.encodedImage,
    pixCopyPaste: pix.payload,
    expiresAt: pix.expirationDate,
    createdAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// CARD DEPOSIT
// ═══════════════════════════════════════════════════════════════

export async function createCardDeposit(params: {
  amount: number;
  userId: string;
  userName: string;
  userCpf: string;
  userEmail: string;
  card: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  holderInfo: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
    postalCode: string;
    addressNumber: string;
  };
}): Promise<CardPayment> {
  if (!ENV.USE_REAL_PAYMENTS || !isConfigured('ASAAS_API_KEY')) {
    return mockCardDeposit(params.amount, params.card.number);
  }

  const customerId = await ensureCustomer({
    name: params.userName,
    cpf: params.userCpf,
    email: params.userEmail,
  });

  const payment = await asaasRequest<{
    id: string;
    status: string;
  }>('/payments', 'POST', {
    customer: customerId,
    billingType: 'CREDIT_CARD',
    value: params.amount,
    dueDate: new Date().toISOString().slice(0, 10),
    description: `NEXA Deposito R$${params.amount.toFixed(2)}`,
    externalReference: `nexa_card_${params.userId}_${Date.now()}`,
    creditCard: {
      holderName: params.card.holderName,
      number: params.card.number,
      expiryMonth: params.card.expiryMonth,
      expiryYear: params.card.expiryYear,
      ccv: params.card.ccv,
    },
    creditCardHolderInfo: params.holderInfo,
  });

  return {
    id: `dep_${Date.now()}`,
    externalId: payment.id,
    amount: params.amount,
    status: payment.status === 'CONFIRMED' ? 'confirmed' : 'pending',
    last4: params.card.number.slice(-4),
    brand: detectCardBrand(params.card.number),
    createdAt: new Date().toISOString(),
  };
}

function detectCardBrand(number: string): string {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^(636368|438935|504175|451416|636297)/.test(n)) return 'Elo';
  return 'Outro';
}

// ═══════════════════════════════════════════════════════════════
// WITHDRAW (Pix)
// ═══════════════════════════════════════════════════════════════

export async function requestWithdraw(params: {
  amount: number;
  userId: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'email' | 'phone' | 'random';
}): Promise<WithdrawRequest> {
  if (!ENV.USE_REAL_PAYMENTS || !isConfigured('ASAAS_API_KEY')) {
    return mockWithdraw(params.amount, params.pixKey, params.pixKeyType);
  }

  const transfer = await asaasRequest<{
    id: string;
    status: string;
    scheduleDate: string;
  }>('/transfers', 'POST', {
    value: params.amount,
    pixAddressKey: params.pixKey,
    pixAddressKeyType: params.pixKeyType.toUpperCase(),
    description: `NEXA Saque R$${params.amount.toFixed(2)}`,
    externalReference: `nexa_wd_${params.userId}_${Date.now()}`,
  });

  return {
    id: `wd_${Date.now()}`,
    externalId: transfer.id,
    amount: params.amount,
    status: 'pending',
    pixKey: params.pixKey,
    pixKeyType: params.pixKeyType,
    estimatedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT STATUS CHECK
// ═══════════════════════════════════════════════════════════════

export async function checkPaymentStatus(externalId: string): Promise<PaymentStatus> {
  if (!ENV.USE_REAL_PAYMENTS || !isConfigured('ASAAS_API_KEY')) {
    return mockCheckStatus();
  }

  const payment = await asaasRequest<{ status: string }>(`/payments/${externalId}`);
  return mapAsaasStatus(payment.status);
}

export async function checkWithdrawStatus(externalId: string): Promise<WithdrawStatus> {
  if (!ENV.USE_REAL_PAYMENTS || !isConfigured('ASAAS_API_KEY')) {
    return 'processing';
  }

  const transfer = await asaasRequest<{ status: string }>(`/transfers/${externalId}`);
  return mapAsaasWithdrawStatus(transfer.status);
}

function mapAsaasStatus(status: string): PaymentStatus {
  switch (status) {
    case 'PENDING':
    case 'AWAITING_RISK_ANALYSIS': return 'pending';
    case 'CONFIRMED':
    case 'RECEIVED':
    case 'RECEIVED_IN_CASH': return 'confirmed';
    case 'OVERDUE':
    case 'REFUND_REQUESTED':
    case 'REFUNDED':
    case 'CHARGEBACK_REQUESTED':
    case 'CHARGEBACK_DISPUTE':
    case 'AWAITING_CHARGEBACK_REVERSAL': return 'refunded';
    default: return 'failed';
  }
}

function mapAsaasWithdrawStatus(status: string): WithdrawStatus {
  switch (status) {
    case 'PENDING': return 'pending';
    case 'BANK_PROCESSING': return 'processing';
    case 'DONE': return 'completed';
    default: return 'failed';
  }
}

// ═══════════════════════════════════════════════════════════════
// WEBHOOK TYPES (for backend processing)
// ═══════════════════════════════════════════════════════════════

export interface AsaasWebhookPayload {
  event: 'PAYMENT_CONFIRMED' | 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE'
    | 'PAYMENT_REFUNDED' | 'TRANSFER_DONE' | 'TRANSFER_FAILED';
  payment?: {
    id: string;
    status: string;
    value: number;
    externalReference: string;
  };
  transfer?: {
    id: string;
    status: string;
    value: number;
    externalReference: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// MOCK IMPLEMENTATIONS (USE_REAL_PAYMENTS = false)
// ═══════════════════════════════════════════════════════════════

function generateMockPixCode(): string {
  const chars = '0123456789abcdef';
  let code = '00020126580014br.gov.bcb.pix0136';
  for (let i = 0; i < 36; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '5204000053039865802BR5913NEXA PAGAMENTOS6008SAOPAULO';
  return code;
}

function generateMockQrBase64(): string {
  // Placeholder — in real app, Asaas returns actual QR image
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

async function mockPixDeposit(amount: number): Promise<PixPayment> {
  await new Promise<void>(r => setTimeout(r, 800));
  return {
    id: `dep_${Date.now()}`,
    externalId: `mock_pix_${Date.now()}`,
    amount,
    status: 'pending',
    pixQrCode: generateMockQrBase64(),
    pixCopyPaste: generateMockPixCode(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
}

async function mockCardDeposit(amount: number, cardNumber: string): Promise<CardPayment> {
  await new Promise<void>(r => setTimeout(r, 1200));
  return {
    id: `dep_${Date.now()}`,
    externalId: `mock_card_${Date.now()}`,
    amount,
    status: 'confirmed',
    last4: cardNumber.slice(-4),
    brand: detectCardBrand(cardNumber),
    createdAt: new Date().toISOString(),
  };
}

async function mockWithdraw(
  amount: number,
  pixKey: string,
  pixKeyType: 'cpf' | 'email' | 'phone' | 'random',
): Promise<WithdrawRequest> {
  await new Promise<void>(r => setTimeout(r, 600));
  return {
    id: `wd_${Date.now()}`,
    externalId: `mock_wd_${Date.now()}`,
    amount,
    status: 'pending',
    pixKey,
    pixKeyType,
    estimatedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}

async function mockCheckStatus(): Promise<PaymentStatus> {
  await new Promise<void>(r => setTimeout(r, 300));
  // 70% chance confirmed, 20% pending, 10% failed
  const rand = Math.random();
  if (rand < 0.7) return 'confirmed';
  if (rand < 0.9) return 'pending';
  return 'failed';
}
