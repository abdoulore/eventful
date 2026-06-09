import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { generalLimiter } from './middlewares/rateLimit.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { setupSwagger } from './config/swagger';
import { env } from './config/env';

import authRoutes from './modules/auth/auth.routes';
import eventRoutes from './modules/events/event.routes';
import ticketRoutes from './modules/tickets/ticket.routes';
import paymentRoutes from './modules/payments/payment.routes';
import reminderRoutes from './modules/reminders/reminder.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import uploadRoutes from './modules/uploads/upload.routes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(generalLimiter);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Eventful API is running' });
});

setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(errorMiddleware);

export default app;
