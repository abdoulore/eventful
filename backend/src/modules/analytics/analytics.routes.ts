import { Router } from 'express';
import {
  getCreatorOverview,
  getEventAnalytics,
  getTicketSalesTrend,
  getRevenueTrend,
  getTopEvents,
} from './analytics.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

// All analytics routes are creator only
router.get('/overview', authenticate, authorize('CREATOR'), getCreatorOverview);
router.get('/trend/tickets', authenticate, authorize('CREATOR'), getTicketSalesTrend);
router.get('/trend/revenue', authenticate, authorize('CREATOR'), getRevenueTrend);
router.get('/top-events', authenticate, authorize('CREATOR'), getTopEvents);
router.get('/event/:eventId', authenticate, authorize('CREATOR'), getEventAnalytics);

export default router;