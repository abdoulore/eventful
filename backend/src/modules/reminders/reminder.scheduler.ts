import { Queue, Worker, Job } from 'bullmq';
import { sendMail, reminderTemplate } from '../../utils/mail';
import prisma from '../../config/prisma';
import { env } from '../../config/env';

const bullRedisUrl = new URL(env.REDIS_URL);
const bullConnection = {
  host: bullRedisUrl.hostname,
  port: Number(bullRedisUrl.port || 6379),
  username: bullRedisUrl.username || undefined,
  password: bullRedisUrl.password || undefined,
  tls: bullRedisUrl.protocol === 'rediss:' ? {} : undefined,
  maxRetriesPerRequest: null,
};

// Queue for all reminder jobs
export const reminderQueue = new Queue('reminders', {
  connection: bullConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

interface ReminderJobData {
  reminderId: string;
  userId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  userEmail: string;
}

// Worker that processes reminder jobs when they become due
export const reminderWorker = new Worker<ReminderJobData>(
  'reminders',
  async (job: Job<ReminderJobData>) => {
    const { reminderId, userEmail, eventName, eventDate, eventId } = job.data;

    const eventUrl = `${env.CLIENT_URL}/events/${eventId}`;
    const html = reminderTemplate(eventName, eventDate, eventUrl);

    await sendMail({
      to: userEmail,
      subject: `Reminder: ${eventName} is coming up!`,
      html,
    });

    // Mark reminder as sent
    await prisma.reminder.update({
      where: { id: reminderId },
      data: { sent: true },
    });
  },
  { connection: bullConnection },
);

reminderWorker.on('completed', (job) => {
  console.log(`Reminder job ${job.id} completed`);
});

reminderWorker.on('failed', (job, err) => {
  console.error(`Reminder job ${job?.id} failed:`, err.message);
});

// Schedule a reminder job to run at a specific time
export const scheduleReminderJob = async (
  reminderId: string,
  userId: string,
  eventId: string,
  eventName: string,
  eventDate: string,
  userEmail: string,
  reminderAt: Date,
): Promise<void> => {
  const delay = reminderAt.getTime() - Date.now();

  if (delay <= 0) return; // Don't schedule past reminders

  await reminderQueue.add(
    `reminder:${reminderId}`,
    { reminderId, userId, eventId, eventName, eventDate, userEmail },
    { delay },
  );
};

// Remove a scheduled reminder job from the queue
export const cancelReminderJob = async (reminderId: string): Promise<void> => {
  const job = await reminderQueue.getJob(`reminder:${reminderId}`);
  if (job) await job.remove();
};

export const closeReminderScheduler = async (): Promise<void> => {
  await reminderWorker.close();
  await reminderQueue.close();
};
