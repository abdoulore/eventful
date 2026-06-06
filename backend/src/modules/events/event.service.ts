import prisma from '../../config/prisma';
import { getCache, setCache, deleteCache, deleteCacheByPattern } from '../../config/redis';
import { AppError } from '../../middlewares/error.middleware';
import { generateShareLinks } from '../../utils/share';

interface CreateEventInput {
  title: string;
  description: string;
  location: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  price: number;
  totalTickets: number;
  category: string;
  reminderValue?: number;
  reminderUnit?: string;
}

interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
}

interface EventFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  creatorId?: string;
}

export const createEvent = async (creatorId: string, input: CreateEventInput) => {
  const event = await prisma.event.create({
    data: {
      ...input,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      availableTickets: input.totalTickets,
      creatorId,
    },
  });

  await deleteCacheByPattern(`events:creator:${creatorId}:*`);

  return event;
};

export const getEvents = async (filters: EventFilters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const cacheKey = `events:public:${JSON.stringify(filters)}`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const where: Record<string, unknown> = {
    status: filters.status || 'PUBLISHED',
  };

  if (filters.category) where.category = filters.category;
  if (filters.creatorId) where.creatorId = filters.creatorId;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { location: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: 'asc' },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { tickets: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  const result = {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  await setCache(cacheKey, JSON.stringify(result), 300);

  return result;
};

export const getEventById = async (eventId: string) => {
  const cacheKey = `event:${eventId}`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { tickets: true } },
    },
  });

  if (!event) throw new AppError('Event not found', 404);

  const shareLinks = generateShareLinks(event.id, event.title);
  const result = { ...event, shareLinks };

  await setCache(cacheKey, JSON.stringify(result), 300);

  return result;
};

export const getCreatorEvents = async (creatorId: string, filters: EventFilters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const cacheKey = `events:creator:${creatorId}:${JSON.stringify(filters)}`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const where: Record<string, unknown> = { creatorId };

  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tickets: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  const result = {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  await setCache(cacheKey, JSON.stringify(result), 300);

  return result;
};

export const updateEvent = async (
  eventId: string,
  creatorId: string,
  input: UpdateEventInput,
) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError('Event not found', 404);
  if (event.creatorId !== creatorId) throw new AppError('Not authorized to update this event', 403);

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...input,
      ...(input.startDate && { startDate: new Date(input.startDate) }),
      ...(input.endDate && { endDate: new Date(input.endDate) }),
    },
  });

  await deleteCache(`event:${eventId}`);
  await deleteCacheByPattern(`events:creator:${creatorId}:*`);
  await deleteCacheByPattern('events:public:*');

  return updated;
};

export const deleteEvent = async (eventId: string, creatorId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError('Event not found', 404);
  if (event.creatorId !== creatorId) throw new AppError('Not authorized to delete this event', 403);

  await prisma.event.delete({ where: { id: eventId } });

  await deleteCache(`event:${eventId}`);
  await deleteCacheByPattern(`events:creator:${creatorId}:*`);
  await deleteCacheByPattern('events:public:*');
};

export const getEventAttendees = async (eventId: string, creatorId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError('Event not found', 404);
  if (event.creatorId !== creatorId) throw new AppError('Not authorized', 403);

  const cacheKey = `event:${eventId}:attendees`;

  const cached = await getCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const tickets = await prisma.ticket.findMany({
    where: { eventId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      payment: { select: { amount: true, status: true, paidAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  await setCache(cacheKey, JSON.stringify(tickets), 120);

  return tickets;
};