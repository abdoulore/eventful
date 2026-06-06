import { env } from '../../config/env';
import { AppError } from '../../middlewares/error.middleware';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystackHeaders = {
  Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
};

interface InitializePaymentInput {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}

interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface VerifyPaymentResponse {
  status: string;
  reference: string;
  amount: number;
  paid_at: string;
  metadata: Record<string, unknown>;
}

export const initializePayment = async (
  input: InitializePaymentInput,
): Promise<InitializePaymentResponse> => {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: paystackHeaders,
    body: JSON.stringify({
      email: input.email,
      // Paystack expects amount in kobo (multiply by 100)
      amount: Math.round(input.amount * 100),
      reference: input.reference,
      metadata: input.metadata,
      callback_url: input.callback_url,
    }),
  });

  const data = (await response.json()) as { status: boolean; message: string; data: InitializePaymentResponse };

  if (!data.status) throw new AppError(`Paystack error: ${data.message}`, 400);

  return data.data;
};

export const verifyPayment = async (reference: string): Promise<VerifyPaymentResponse> => {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    method: 'GET',
    headers: paystackHeaders,
  });

  const data = (await response.json()) as { status: boolean; message: string; data: VerifyPaymentResponse };

  if (!data.status) throw new AppError(`Paystack error: ${data.message}`, 400);

  return data.data;
};

export const validateWebhookSignature = (signature: string, body: string): boolean => {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', env.PAYSTACK_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return hash === signature;
};