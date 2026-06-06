import prisma from '../../config/prisma';
import { getCache, setCache, deleteCacheByPattern, deleteCache } from '../../config/redis';
import { AppError } from '../../middlewares/error.middleware';
import { initializePayment, verifyPayment } from './paystack.service';
import { generateQRCode } from '../../utils/qr';
import { scheduleReminderJob } from '../reminders/reminder.scheduler';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';

const REMINDER_MULTIPLIERS: Record<string, number> = {
  minutes: 60 * 1000,
  hours:   60 * 60 * 1000,
  days:    24 * 60 * 60 * 1000,
  weeks:   7 * 24 * 60 * 60 * 1000,
};

// Schedule default reminder set by creator at event creation
const applyDefaultReminder = async (
  tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  userId: string,
  eventId: string,
  ticketId: string,
) => {
  const event = await tx.event.findUnique({ where: { id: eventId } });
  const user = await tx.user.findUnique({ where: { id: userId } });

  if (!event?.reminderValue || !event?.reminderUnit || !user) return;

  const reminderAt = new Date(
    event.startDate.getTime() - event.reminderValue * REMINDER_MULTIPLIERS[event.reminderUnit],
  );

  if (reminderAt <= new Date()) return;

  const reminder = await tx.reminder.create({
    data: { userId, eventId, reminderAt },
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
};

export const initiatePayment = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) throw new AppError('Event not found', 404);
  if (event.status !== 'PUBLISHED') throw new AppError('Event is not available', 400);
  if (event.availableTickets <= 0) throw new AppError('No tickets available', 400);

  const existingTicket = await prisma.ticket.findFirst({
    where: { userId, eventId, status: { not: 'CANCELLED' } },
  });
  if (existingTicket) throw new AppError('You already have a ticket for this event', 409);

  // Free event — skip Paystack and create ticket directly
  if (event.price === 0) {
    return prisma.$transaction(async (tx) => {
      const ticketCode = uuidv4();
      const qrCode = await generateQRCode(ticketCode);

      const ticket = await tx.ticket.create({
        data: { ticketCode, qrCode, userId, eventId },
      });

      await tx.payment.create({
        data: {
          amount: 0,
          currency: 'NGN',
          status: 'SUCCESS',
          paystackReference: `FREE-${uuidv4()}`,
          paidAt: new Date(),
          userId,
          eventId,
          ticketId: ticket.id,
        },
      });

      await tx.event.update({
        where: { id: eventId },
        data: { availableTickets: { decrement: 1 } },
      });

      // Apply creator's default reminder if set
      await applyDefaultReminder(tx, userId, eventId, ticket.id);

      return { free: true, ticket };
    });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const reference = `EVT-${uuidv4()}`;

  const payment = await prisma.payment.create({
    data: {
      amount: event.price,
      currency: 'NGN',
      status: 'PENDING',
      paystackReference: reference,
      userId,
      eventId,
    },
  });

  const paystackData = await initializePayment({
    email: user.email,
    amount: event.price,
    reference,
    metadata: { userId, eventId, paymentId: payment.id },
    callback_url: `${env.CLIENT_URL}/tickets?reference=${reference}`,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { paystackAccessCode: paystackData.access_code },
  });

  return {
    free: false,
    paymentId: payment.id,
    reference,
    authorizationUrl: paystackData.authorization_url,
    accessCode: paystackData.access_code,
  };
};

export const handleWebhook = async (event: Record<string, unknown>) => {
  const eventType = event.event as string;

  if (eventType !== 'charge.success') return;

  const data = event.data as Record<string, unknown>;
  const reference = data.reference as string;

  const payment = await prisma.payment.findUnique({ where: { paystackReference: reference } });

  if (!payment) throw new AppError('Payment record not found', 404);
  if (payment.status === 'SUCCESS') return;

  await prisma.$transaction(async (tx) => {
    const ticketCode = uuidv4();
    const qrCode = await generateQRCode(ticketCode);

    const ticket = await tx.ticket.create({
      data: {
        ticketCode,
        qrCode,
        userId: payment.userId,
        eventId: payment.eventId,
      },
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        paidAt: new Date(),
        ticketId: ticket.id,
      },
    });

    await tx.event.update({
      where: { id: payment.eventId },
      data: { availableTickets: { decrement: 1 } },
    });

    // Apply creator's default reminder if set
    await applyDefaultReminder(tx, payment.userId, payment.eventId, ticket.id);
  });

  await deleteCache(`event:${payment.eventId}`);
  await deleteCacheByPattern('events:public:*');
  await deleteCacheByPattern(`tickets:user:${payment.userId}`);
  await deleteCacheByPattern(`payments:creator:*`);
};

export const verifyPaymentByReference = async (reference: string, userId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { paystackReference: reference },
    include: { ticket: true, event: { select: { title: true } } },
  });

  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.userId !== userId) throw new AppError('Not authorized', 403);

  if (payment.status === 'PENDING') {
    const paystackData = await verifyPayment(reference);

    if (paystackData.status === 'success') {
      await handleWebhook({
        event: 'charge.success',
        data: { reference, metadata: {} },
      });
    }
  }

  const updated = await prisma.payment.findUnique({
    where: { paystackReference: reference },
    include: { ticket: true, event: { select: { title: true } } },
  });

  return updated;
};

export const getCreatorPayments = async (creatorId: string) => {
  const cacheKey = `payments:creator:${creatorId}`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const payments = await prisma.payment.findMany({
    where: { event: { creatorId } },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
      ticket: { select: { id: true, ticketCode: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const total = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const result = { payments, totalRevenue: total };

  await setCache(cacheKey, JSON.stringify(result), 300);

  return result;
};

export const getEventPayments = async (eventId: string, creatorId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError('Event not found', 404);
  if (event.creatorId !== creatorId) throw new AppError('Not authorized', 403);

  const cacheKey = `payments:event:${eventId}`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const payments = await prisma.payment.findMany({
    where: { eventId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      ticket: { select: { id: true, ticketCode: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const total = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const result = { payments, totalRevenue: total };

  await setCache(cacheKey, JSON.stringify(result), 300);

  return result;
};