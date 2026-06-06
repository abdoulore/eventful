import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as analyticsService from './analytics.service';

const getParam = (value: string | string[]): string => {
  return Array.isArray(value) ? value[0] : value;
};

export const getCreatorOverview = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const result = await analyticsService.getCreatorOverview(req.user!.id);

  res.status(200).json({ success: true, data: result });
});

export const getEventAnalytics = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const eventId = getParam(req.params.eventId);
  const result = await analyticsService.getEventAnalytics(eventId, req.user!.id);

  res.status(200).json({ success: true, data: result });
});

export const getTicketSalesTrend = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const result = await analyticsService.getTicketSalesTrend(req.user!.id);

  res.status(200).json({ success: true, data: result });
});

export const getRevenueTrend = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const result = await analyticsService.getRevenueTrend(req.user!.id);

  res.status(200).json({ success: true, data: result });
});

export const getTopEvents = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const result = await analyticsService.getTopEvents(req.user!.id);

  res.status(200).json({ success: true, data: result });
});
