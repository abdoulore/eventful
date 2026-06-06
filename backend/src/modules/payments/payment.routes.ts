import { Router } from 'express';
import {
  initiatePayment,
  handleWebhook,
  verifyPayment,
  getCreatorPayments,
  getEventPayments,
} from './payment.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { paymentLimiter } from '../../middlewares/rateLimit.middleware';

const router = Router();

// Paystack webhook — no auth, validated by signature
router.post('/webhook', handleWebhook);

// Eventee routes
router.post('/initiate', authenticate, authorize('EVENTEE'), paymentLimiter, initiatePayment);
router.get('/verify/:reference', authenticate, verifyPayment);

// Creator routes
router.get('/creator', authenticate, authorize('CREATOR'), getCreatorPayments);
router.get('/event/:eventId', authenticate, authorize('CREATOR'), getEventPayments);

export default router;