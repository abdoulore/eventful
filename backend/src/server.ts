import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';
import redis from './config/redis';
import { reminderWorker } from './modules/reminders/reminder.scheduler';

const PORT = Number(env.PORT) || 5000;

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Database connected');

    await redis.connect();

    // Boot the reminder worker so queued jobs are processed
    console.log('Reminder worker started');
    reminderWorker.resume();

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
  await reminderWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();