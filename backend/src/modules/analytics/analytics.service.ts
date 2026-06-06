import prisma from '../../config/prisma';
import { getCache, setCache } from '../../config/redis';
import { AppError } from '../../middlewares/error.middleware';

export const getCreatorOverview = async (creatorId: string) => {
  const cacheKey = `analytics:creator:${creatorId}:overview`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const [totalEvents, totalTicketsSold, totalRevenue, totalScans] = await Promise.all([
    // Total events created by this creator
    prisma.event.count({ where: { creatorId } }),

    // Total tickets sold across all creator events
    prisma.ticket.count({
      where: {
        event: { creatorId },
        status: { not: 'CANCELLED' },
      },
    }),

    // Total revenue from successful payments
    prisma.payment.aggregate({
      where: { event: { creatorId }, status: 'SUCCESS' },
      _sum: { amount: true },
    }),

    // Total QR scans across all creator events
    prisma.ticket.count({
      where: {
        event: { creatorId },
        status: 'SCANNED',
      },
    }),
  ]);

  const result = {
    totalEvents,
    totalTicketsSold,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    totalScans,
  };

  await setCache(cacheKey, JSON.stringify(result), 300);

  return result;
};

export const getEventAnalytics = async (eventId: string, creatorId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError('Event not found', 404);
  if (event.creatorId !== creatorId) throw new AppError('Not authorized', 403);

  const cacheKey = `analytics:event:${eventId}`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const [totalTicketsSold, totalScanned, totalRevenue, recentTickets] = await Promise.all([
    // Tickets sold for this event
    prisma.ticket.count({
      where: { eventId, status: { not: 'CANCELLED' } },
    }),

    // How many attendees actually showed up
    prisma.ticket.count({
      where: { eventId, status: 'SCANNED' },
    }),

    // Revenue from this event
    prisma.payment.aggregate({
      where: { eventId, status: 'SUCCESS' },
      _sum: { amount: true },
    }),

    // Last 5 ticket purchases for activity feed
    prisma.ticket.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const attendanceRate =
    totalTicketsSold > 0
      ? Number(((totalScanned / totalTicketsSold) * 100).toFixed(2))
      : 0;

  const result = {
    event: {
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      totalTickets: event.totalTickets,
      availableTickets: event.availableTickets,
    },
    totalTicketsSold,
    totalScanned,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    attendanceRate,
    recentTickets,
  };

  await setCache(cacheKey, JSON.stringify(result), 300);

  return result;
};

export const getTicketSalesTrend = async (creatorId: string) => {
  const cacheKey = `analytics:creator:${creatorId}:trend`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  // Get ticket sales grouped by day for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const tickets = await prisma.ticket.findMany({
    where: {
      event: { creatorId },
      status: { not: 'CANCELLED' },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group tickets by date
  const trend = tickets.reduce<Record<string, number>>((acc, ticket) => {
    const date = ticket.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Fill in missing days with 0
  const result: { date: string; tickets: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({ date: dateStr, tickets: trend[dateStr] || 0 });
  }

  await setCache(cacheKey, JSON.stringify(result), 600);

  return result;
};

export const getRevenueTrend = async (creatorId: string) => {
  const cacheKey = `analytics:creator:${creatorId}:revenue-trend`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const payments = await prisma.payment.findMany({
    where: {
      event: { creatorId },
      status: 'SUCCESS',
      paidAt: { gte: thirtyDaysAgo },
    },
    select: { amount: true, paidAt: true },
    orderBy: { paidAt: 'asc' },
  });

  // Group revenue by date
  const trend = payments.reduce<Record<string, number>>((acc, payment) => {
    if (!payment.paidAt) return acc;
    const date = payment.paidAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + payment.amount;
    return acc;
  }, {});

  const result: { date: string; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({ date: dateStr, revenue: trend[dateStr] || 0 });
  }

  await setCache(cacheKey, JSON.stringify(result), 600);

  return result;
};

export const getTopEvents = async (creatorId: string) => {
  const cacheKey = `analytics:creator:${creatorId}:top-events`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const events = await prisma.event.findMany({
    where: { creatorId },
    include: {
      _count: { select: { tickets: true } },
      payments: {
        where: { status: 'SUCCESS' },
        select: { amount: true },
      },
    },
    orderBy: { tickets: { _count: 'desc' } },
    take: 5,
  });

  const result = events.map((event) => ({
    id: event.id,
    title: event.title,
    startDate: event.startDate,
    ticketsSold: event._count.tickets,
    revenue: event.payments.reduce((sum, p) => sum + p.amount, 0),
  }));

  await setCache(cacheKey, JSON.stringify(result), 300);

  return result;
};