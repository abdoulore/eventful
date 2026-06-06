import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as reminderService from './reminder.service';
import { z } from 'zod';

const getParam = (value: string | string[]): string => {
  return Array.isArray(value) ? value[0] : value;
};

const offsetSchema = z.object({
  value: z.number().int().min(1, 'Value must be at least 1'),
  unit: z.enum(['minutes', 'hours', 'days', 'weeks']),
});

const createReminderSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  offset: offsetSchema,
});

const eventDefaultReminderSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  offset: offsetSchema,
});

export const createReminder = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const parsed = createReminderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const reminder = await reminderService.createReminder(req.user!.id, parsed.data);

  res.status(201).json({ success: true, data: reminder });
});

export const createEventDefaultReminder = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const parsed = eventDefaultReminderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const reminders = await reminderService.createEventDefaultReminder(
    req.user!.id,
    parsed.data.eventId,
    parsed.data.offset,
  );

  res.status(201).json({ success: true, data: reminders });
});

export const getUserReminders = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const reminders = await reminderService.getUserReminders(req.user!.id);

  res.status(200).json({ success: true, data: reminders });
});

export const getEventReminders = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const eventId = getParam(req.params.eventId);
  const reminders = await reminderService.getEventReminders(eventId, req.user!.id);

  res.status(200).json({ success: true, data: reminders });
});

export const deleteReminder = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const reminderId = getParam(req.params.id);
  await reminderService.deleteReminder(reminderId, req.user!.id);

  res.status(200).json({ success: true, message: 'Reminder deleted successfully' });
});
