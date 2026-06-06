import { Router } from 'express';
import {
  purchaseTicket,
  getUserTickets,
  getTicketById,
  verifyTicket,
  cancelTicket,
} from './ticket.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

// Eventee routes
router.post('/purchase', authenticate, authorize('EVENTEE'), purchaseTicket);
router.get('/my-tickets', authenticate, authorize('EVENTEE'), getUserTickets);
router.get('/:id', authenticate, authorize('EVENTEE'), getTicketById);
router.patch('/:id/cancel', authenticate, authorize('EVENTEE'), cancelTicket);

// Creator only - scan and verify a ticket at the event
router.post('/verify', authenticate, authorize('CREATOR'), verifyTicket);

export default router;