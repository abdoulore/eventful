import prisma from '../../config/prisma';
import { getCache, setCache, deleteCache, deleteCacheByPattern } from '../../config/redis';
import { AppError } from '../../middlewares/error.middleware';
import { generateQRCode } from '../../utils/qr';
import { v4 as uuidv4 } from 'uuid';

export const purchaseTicket = async (userId: string, eventId: string) => {
  // Use a transaction to prevent overselling when multiple users buy at the same time
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });

    if (!event) throw new AppError('Event not found', 404);
    if (event.status !== 'PUBLISHED') throw new AppError('Event is not available', 400);
    if (event.availableTickets <= 0) throw new AppError('No tickets available', 400);

    // Check if user already has a ticket for this event
    const existingTicket = await tx.ticket.findFirst({
      where: { userId, eventId },
    });
    if (existingTicket) throw new AppError('You already have a ticket for this event', 409);

    // Generate a unique code for this ticket
    const ticketCode = uuidv4();
    const qrCode = await generateQRCode(ticketCode);

    // Create the ticket
    const ticket = await tx.ticket.create({
      data: {
        ticketCode,
        qrCode,
        userId,
        eventId,
      },
    });

    // Decrement available tickets atomically
    await tx.event.update({
      where: { id: eventId },
      data: { availableTickets: { decrement: 1 } },
    });

    // Invalidate event cache so available ticket count is fresh
    await deleteCache(`event:${eventId}`);
    await deleteCacheByPattern('events:public:*');

    return ticket;
  });
};

export const getUserTickets = async (userId: string) => {
  const cacheKey = `tickets:user:${userId}`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const tickets = await prisma.ticket.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          location: true,
          startDate: true,
          endDate: true,
          imageUrl: true,
        },
      },
      payment: { select: { amount: true, status: true, paidAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  await setCache(cacheKey, JSON.stringify(tickets), 300);

  return tickets;
};

export const getTicketById = async (ticketId: string, userId: string) => {
  const cacheKey = `ticket:${ticketId}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    const ticket = JSON.parse(cached);
    if (ticket.userId !== userId) throw new AppError('Not authorized', 403);
    return ticket;
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          location: true,
          startDate: true,
          endDate: true,
          imageUrl: true,
        },
      },
      payment: { select: { amount: true, status: true, paidAt: true } },
    },
  });

  if (!ticket) throw new AppError('Ticket not found', 404);
  if (ticket.userId !== userId) throw new AppError('Not authorized', 403);

  await setCache(cacheKey, JSON.stringify(ticket), 300);

  return ticket;
};

export const verifyTicket = async (ticketCode: string, creatorId: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: { ticketCode },
    include: {
      event: { select: { id: true, title: true, creatorId: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!ticket) throw new AppError('Invalid ticket', 404);

  // Only the event creator can verify tickets
  if (ticket.event.creatorId !== creatorId) {
    throw new AppError('Not authorized to verify this ticket', 403);
  }

  if (ticket.status === 'SCANNED') {
    return { valid: false, message: 'Ticket has already been scanned', ticket };
  }

  if (ticket.status === 'CANCELLED') {
    return { valid: false, message: 'Ticket has been cancelled', ticket };
  }

  // Mark ticket as scanned
  const updated = await prisma.ticket.update({
    where: { ticketCode },
    data: { status: 'SCANNED', scannedAt: new Date() },
  });

  // Invalidate related caches
  await deleteCache(`ticket:${ticket.id}`);
  await deleteCache(`tickets:user:${ticket.userId}`);
  await deleteCacheByPattern(`event:${ticket.event.id}:attendees`);

  return { valid: true, message: 'Ticket verified successfully', ticket: updated };
};

export const cancelTicket = async (ticketId: string, userId: string) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

  if (!ticket) throw new AppError('Ticket not found', 404);
  if (ticket.userId !== userId) throw new AppError('Not authorized', 403);
  if (ticket.status === 'SCANNED') throw new AppError('Cannot cancel a scanned ticket', 400);
  if (ticket.status === 'CANCELLED') throw new AppError('Ticket is already cancelled', 400);

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'CANCELLED' },
  });

  // Restore available ticket count
  await prisma.event.update({
    where: { id: ticket.eventId },
    data: { availableTickets: { increment: 1 } },
  });

  await deleteCache(`ticket:${ticketId}`);
  await deleteCache(`tickets:user:${userId}`);
  await deleteCache(`event:${ticket.eventId}`);
  await deleteCacheByPattern('events:public:*');

  return updated;
};