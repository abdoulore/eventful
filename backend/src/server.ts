import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';
import redis from './config/redis';
import { startReminderScheduler, stopReminderScheduler } from './modules/reminders/reminder.scheduler';

const PORT = Number(env.PORT) || 5000;

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Database connected');

    // Redis is only a cache now (fail-open). Don't block or crash startup on it —
    // the API runs fine without it, just without caching.
    redis.connect()
      .catch((err) => console.error('Redis unavailable, continuing without cache:', err.message));

    startReminderScheduler();

    app.listen(PORT, () => {
      console.log(`Eventful API running on port ${PORT}`);
      console.log(`Docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  stopReminderScheduler();
  await prisma.$disconnect();
  process.exit(0);
});

start();