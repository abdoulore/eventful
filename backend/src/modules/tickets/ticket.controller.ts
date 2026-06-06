import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as ticketService from './ticket.service';
import { z } from 'zod';

const getParam = (value: string | string[]): string => {
  return Array.isArray(value) ? value[0] : value;
};

const purchaseSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
});

const verifySchema = z.object({
  ticketCode: z.string().min(1, 'Ticket code is required'),
});

export const purchaseTicket = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const parsed = purchaseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const ticket = await ticketService.purchaseTicket(req.user!.id, parsed.data.eventId);

  res.status(201).json({ success: true, data: ticket });
});

export const getUserTickets = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const tickets = await ticketService.getUserTickets(req.user!.id);

  res.status(200).json({ success: true, data: tickets });
});

export const getTicketById = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const ticketId = getParam(req.params.id);
  const ticket = await ticketService.getTicketById(ticketId, req.user!.id);

  res.status(200).json({ success: true, data: ticket });
});

export const verifyTicket = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const result = await ticketService.verifyTicket(parsed.data.ticketCode, req.user!.id);

  res.status(200).json({ success: true, data: result });
});

export const cancelTicket = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const ticketId = getParam(req.params.id);
  const ticket = await ticketService.cancelTicket(ticketId, req.user!.id);

  res.status(200).json({ success: true, data: ticket });
});
