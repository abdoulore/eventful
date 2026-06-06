import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: Number(env.MAIL_PORT),
  secure: false,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async (options: MailOptions): Promise<void> => {
  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const reminderTemplate = (
  eventName: string,
  eventDate: string,
  eventUrl: string,
): string => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reminder: ${eventName} is coming up!</h2>
      <p>Your event is scheduled for <strong>${eventDate}</strong>.</p>
      
        href="${eventUrl}"
        style="background:#6C47FF;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;"
      >
        View Event
      </a>
    </div>
  `;
};