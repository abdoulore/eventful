import { Router } from 'express';
import {
  createReminder,
  createEventDefaultReminder,
  getUserReminders,
  getEventReminders,
  deleteReminder,
} from './reminder.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

// Eventee sets their own reminder
router.post('/', authenticate, authorize('EVENTEE'), createReminder);
router.get('/my-reminders', authenticate, authorize('EVENTEE'), getUserReminders);
router.delete('/:id', authenticate, authorize('EVENTEE'), deleteReminder);

// Creator sets a default reminder for all attendees of an event
router.post('/event-default', authenticate, authorize('CREATOR'), createEventDefaultReminder);
router.get('/event/:eventId', authenticate, authorize('CREATOR'), getEventReminders);

export default router;