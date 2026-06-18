import cron from 'node-cron';
import { sendMail, reminderTemplate } from '../../utils/mail';
import prisma from '../../config/prisma';
import { env } from '../../config/env';

// How many due reminders to process per sweep.
const BATCH_SIZE = 100;

let task: ReturnType<typeof cron.schedule> | null = null;
let running = false;

const formatEventDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-NG', { dateStyle: 'full', timeStyle: 'short' }).format(date);

/**
 * One sweep: find reminders that are due (reminderAt in the past) and not yet
 * sent, email each one, and mark it sent. A failed send is left unsent so the
 * next sweep retries it. This replaces the BullMQ worker that polled Redis
 * around the clock — scheduling a reminder is now just inserting a row, and
 * cancelling one is just deleting it.
 */
export const processDueReminders = async (): Promise<void> => {
  if (running) return; // never let two sweeps overlap
  running = true;

  try {
    const due = await prisma.reminder.findMany({
      where: { sent: false, reminderAt: { lte: new Date() } },
      take: BATCH_SIZE,
      include: {
        user: { select: { email: true } },
        event: { select: { id: true, title: true, startDate: true } },
      },
    });

    for (const reminder of due) {
      try {
        const claimed = await prisma.reminder.updateMany({
          where: { id: reminder.id, sent: false },
          data: { sent: true },
        });

        if (claimed.count === 0) continue;

        await sendMail({
          to: reminder.user.email,
          subject: `Reminder: ${reminder.event.title} is coming up!`,
          html: reminderTemplate(
            reminder.event.title,
            formatEventDate(reminder.event.startDate),
            `${env.CLIENT_URL}/events/${reminder.event.id}`,
          ),
        });

      } catch (err) {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { sent: false },
        }).catch((resetErr) => {
          console.error(`Reminder ${reminder.id} reset failed:`, (resetErr as Error).message);
        });
        console.error(`Reminder ${reminder.id} failed:`, (err as Error).message);
        // Leave sent=false so it's retried on the next sweep.
      }
    }
  } catch (err) {
    console.error('Reminder sweep failed:', (err as Error).message);
  } finally {
    running = false;
  }
};

export const startReminderScheduler = (): void => {
  if (task) return;
  task = cron.schedule('* * * * *', () => {
    void processDueReminders();
  });
  console.log('Reminder scheduler started (node-cron, every minute)');
};

export const stopReminderScheduler = (): void => {
  if (task) {
    task.stop();
    task = null;
  }
};

export const closeReminderScheduler = async (): Promise<void> => {
  stopReminderScheduler();
};
