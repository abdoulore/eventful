import prisma from '../../config/prisma';
import { getCache, setCache, deleteCache } from '../../config/redis';
import { AppError } from '../../middlewares/error.middleware';
import { scheduleReminderJob, cancelReminderJob } from './reminder.scheduler';

interface ReminderOffset {
  value: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks';
}

// Convert offset to milliseconds
const offsetToMs = (offset: ReminderOffset): number => {
  const multipliers = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  };
  return offset.value * multipliers[offset.unit];
};

interface CreateReminderInput {
  eventId: string;
  offset: ReminderOffset;
}

export const createReminder = async (userId: string, input: CreateReminderInput) => {
  const event = await prisma.event.findUnique({
    where: { id: input.eventId },
    include: { creator: { select: { id: true } } },
  });

  if (!event) throw new AppError('Event not found', 404);
  if (event.status !== 'PUBLISHED') throw new AppError('Event is not available', 400);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const reminderAt = new Date(event.startDate.getTime() - offsetToMs(input.offset));

  if (reminderAt <= new Date()) throw new AppError('Reminder time has already passed', 400);

  // Check if user already has a reminder for this event at this time
  const existing = await prisma.reminder.findFirst({
    where: { userId, eventId: input.eventId, reminderAt },
  });
  if (existing) throw new AppError('You already have a reminder set for this time', 409);

  const reminder = await prisma.reminder.create({
    data: {
      userId,
      eventId: input.eventId,
      reminderAt,
    },
  });

  await scheduleReminderJob(
    reminder.id,
    userId,
    event.id,
    event.title,
    event.startDate.toISOString(),
    user.email,
    reminderAt,
  );

  await deleteCache(`reminders:user:${userId}`);

  return reminder;
};

export const createEventDefaultReminder = async (
  creatorId: string,
  eventId: string,
  offset: ReminderOffset,
) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError('Event not found', 404);
  if (event.creatorId !== creatorId) throw new AppError('Not authorized', 403);

  // Get all eventees who have tickets for this event
  const tickets = await prisma.ticket.findMany({
    where: { eventId, status: { not: 'CANCELLED' } },
    include: { user: { select: { id: true, email: true } } },
  });

  const reminderAt = new Date(event.startDate.getTime() - offsetToMs(offset));
  if (reminderAt <= new Date()) throw new AppError('Reminder time has already passed', 400);

  // Schedule a reminder for each attendee
  const reminders = await Promise.all(
    tickets.map(async (ticket) => {
      const existing = await prisma.reminder.findFirst({
        where: { userId: ticket.userId, eventId, reminderAt },
      });

      if (existing) return existing;

      const reminder = await prisma.reminder.create({
        data: {
          userId: ticket.userId,
          eventId,
          reminderAt,
        },
      });

      await scheduleReminderJob(
        reminder.id,
        ticket.userId,
        event.id,
        event.title,
        event.startDate.toISOString(),
        ticket.user.email,
        reminderAt,
      );

      return reminder;
    }),
  );

  await deleteCache(`reminders:event:${eventId}`);

  return reminders;
};

export const getUserReminders = async (userId: string) => {
  const cacheKey = `reminders:user:${userId}`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const reminders = await prisma.reminder.findMany({
    where: { userId },
    include: {
      event: {
        select: { id: true, title: true, startDate: true, location: true },
      },
    },
    orderBy: { reminderAt: 'asc' },
  });

  await setCache(cacheKey, JSON.stringify(reminders), 300);

  return reminders;
};

export const getEventReminders = async (eventId: string, creatorId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError('Event not found', 404);
  if (event.creatorId !== creatorId) throw new AppError('Not authorized', 403);

  const cacheKey = `reminders:event:${eventId}`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const reminders = await prisma.reminder.findMany({
    where: { eventId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { reminderAt: 'asc' },
  });

  await setCache(cacheKey, JSON.stringify(reminders), 300);

  return reminders;
};

export const deleteReminder = async (reminderId: string, userId: string) => {
  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });

  if (!reminder) throw new AppError('Reminder not found', 404);
  if (reminder.userId !== userId) throw new AppError('Not authorized', 403);
  if (reminder.sent) throw new AppError('Reminder has already been sent', 400);

  await cancelReminderJob(reminderId);
  await prisma.reminder.delete({ where: { id: reminderId } });
  await deleteCache(`reminders:user:${userId}`);
};