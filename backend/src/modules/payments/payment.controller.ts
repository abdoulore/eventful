import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as paymentService from './payment.service';
import { validateWebhookSignature } from './paystack.service';
import { z } from 'zod';

const getParam = (value: string | string[]): string => {
  return Array.isArray(value) ? value[0] : value;
};

const initiateSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
});

export const initiatePayment = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const parsed = initiateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const result = await paymentService.initiatePayment(req.user!.id, parsed.data.eventId);

  res.status(200).json({ success: true, data: result });
});

export const handleWebhook = async (req: Request, res: Response, _next: NextFunction) => {
  const signature = req.headers['x-paystack-signature'] as string;

  // Validate the webhook came from Paystack
  const isValid = validateWebhookSignature(signature, JSON.stringify(req.body));
  if (!isValid) {
    res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    return;
  }

  try {
    await paymentService.handleWebhook(req.body);
    res.status(200).json({ success: true });
  } catch {
    res.status(200).json({ success: true }); // Always return 200 to Paystack
  }
};

export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const reference = getParam(req.params.reference);

  const payment = await paymentService.verifyPaymentByReference(reference, req.user!.id);

  res.status(200).json({ success: true, data: payment });
});

export const getCreatorPayments = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const result = await paymentService.getCreatorPayments(req.user!.id);

  res.status(200).json({ success: true, data: result });
});

export const getEventPayments = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const eventId = getParam(req.params.eventId);
  const result = await paymentService.getEventPayments(eventId, req.user!.id);

  res.status(200).json({ success: true, data: result });
});
