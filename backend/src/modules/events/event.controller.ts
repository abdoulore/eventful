import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as eventService from './event.service';
import { z } from 'zod';

const getParam = (value: string | string[]): string => {
  return Array.isArray(value) ? value[0] : value;
};

const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(3, 'Location is required'),
  imageUrl: z.string().url().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  price: z.number().min(0, 'Price cannot be negative'),
  totalTickets: z.number().int().min(1, 'Must have at least 1 ticket'),
  category: z.string().min(1, 'Category is required'),
});

const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
});

export const createEvent = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const event = await eventService.createEvent(req.user!.id, parsed.data);

  res.status(201).json({ success: true, data: event });
});

export const getEvents = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const { page, limit, category, status, search } = req.query;

  const events = await eventService.getEvents({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    category: category as string | undefined,
    status: status as string | undefined,
    search: search as string | undefined,
  });

  res.status(200).json({ success: true, data: events });
});

export const getEventById = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const eventId = getParam(req.params.id);
  const event = await eventService.getEventById(eventId);

  res.status(200).json({ success: true, data: event });
});

export const getCreatorEvents = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const { page, limit, category, status, search } = req.query;

  const events = await eventService.getCreatorEvents(req.user!.id, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    category: category as string | undefined,
    status: status as string | undefined,
    search: search as string | undefined,
  });

  res.status(200).json({ success: true, data: events });
});

export const updateEvent = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const parsed = updateEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const eventId = getParam(req.params.id);
  const event = await eventService.updateEvent(eventId, req.user!.id, parsed.data);

  res.status(200).json({ success: true, data: event });
});

export const deleteEvent = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const eventId = getParam(req.params.id);
  await eventService.deleteEvent(eventId, req.user!.id);

  res.status(200).json({ success: true, message: 'Event deleted successfully' });
});

export const getEventAttendees = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const eventId = getParam(req.params.id);
  const attendees = await eventService.getEventAttendees(eventId, req.user!.id);

  res.status(200).json({ success: true, data: attendees });
});