import Razorpay from 'razorpay';
import crypto from 'crypto';
import Setting from '../../models/Setting';

const getRazorpayCredentials = async () => {
  const settings = await Setting.findOne({}).lean();
  return {
    key_id: process.env.RAZORPAY_KEY_ID || settings?.razorpayKeyId || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || settings?.razorpayKeySecret || '',
    webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET || settings?.razorpayWebhookSecret || ''
  };
};

const getRazorpayClient = async () => {
  const { key_id, key_secret } = await getRazorpayCredentials();
  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials are not configured.');
  }
  return new Razorpay({ key_id, key_secret });
};

export interface RazorpayOrderInput {
  amount: number;
  currency: string;
  receipt: string;
  payment_capture?: number;
  notes?: Record<string, string>;
}

export const createRazorpayOrder = async (input: RazorpayOrderInput) => {
  const razorpay = await getRazorpayClient();
  return razorpay.orders.create({
    amount: input.amount,
    currency: input.currency,
    receipt: input.receipt,
    payment_capture: input.payment_capture ?? 1,
    notes: input.notes || {}
  });
};

export const verifyRazorpaySignature = async (orderId: string, paymentId: string, signature: string) => {
  const { key_secret } = await getRazorpayCredentials();
  if (!key_secret) return false;
  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return generatedSignature === signature;
};

export const verifyRazorpayWebhook = async (rawBody: string, signature: string) => {
  const { webhook_secret } = await getRazorpayCredentials();
  if (!webhook_secret) return false;
  const expectedSignature = crypto
    .createHmac('sha256', webhook_secret)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
};

export const refundRazorpayPayment = async (paymentId: string, amount?: number, notes?: Record<string, string>) => {
  const razorpay = await getRazorpayClient();
  const payload: any = {};
  if (amount) payload.amount = amount;
  if (notes) payload.notes = notes;
  return razorpay.payments.refund(paymentId, payload);
};

export const fetchRazorpayPayment = async (paymentId: string) => {
  const razorpay = await getRazorpayClient();
  return razorpay.payments.fetch(paymentId);
};
