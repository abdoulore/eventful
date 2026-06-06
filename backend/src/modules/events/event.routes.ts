import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  getCreatorEvents,
  updateEvent,
  deleteEvent,
  getEventAttendees,
} from './event.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Creator only routes
router.post('/', authenticate, authorize('CREATOR'), createEvent);
router.get('/creator/my-events', authenticate, authorize('CREATOR'), getCreatorEvents);
router.put('/:id', authenticate, authorize('CREATOR'), updateEvent);
router.delete('/:id', authenticate, authorize('CREATOR'), deleteEvent);
router.get('/:id/attendees', authenticate, authorize('CREATOR'), getEventAttendees);

export default router;