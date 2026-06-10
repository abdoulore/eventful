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
  if (env.NODE_ENV === 'test') return;

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const button = (href: string, label: string): string => {
  return `
    <a
      href="${href}"
      style="display:inline-block;background:#c93529;color:#ffffff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;"
    >
      ${label}
    </a>
  `;
};

const shell = (content: string): string => {
  return `
    <div style="font-family:Arial,sans-serif;background:#f5f7f4;padding:32px 16px;color:#111712;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;padding:28px;border:1px solid #dfe5de;">
        <p style="margin:0 0 20px;font-size:14px;font-weight:800;color:#c93529;">Eventful</p>
        ${content}
      </div>
    </div>
  `;
};

export const welcomeTemplate = (name: string, actionUrl: string): string => {
  return shell(`
    <h2 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#111712;">Welcome to Eventful, ${escapeHtml(name)}</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#4a574d;">
      Your account has been created. You can now discover events, manage tickets, or start hosting from your dashboard.
    </p>
    ${button(actionUrl, 'Open Eventful')}
  `);
};

export const passwordResetTemplate = (name: string, resetUrl: string): string => {
  return shell(`
    <h2 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#111712;">Reset your password</h2>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#4a574d;">
      Hi ${escapeHtml(name)}, we received a request to reset your Eventful password.
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#4a574d;">
      This link expires in 30 minutes. If you did not request this, you can ignore this email.
    </p>
    ${button(resetUrl, 'Reset password')}
  `);
};

interface PaymentSuccessTemplateInput {
  name: string;
  eventName: string;
  eventDate: string;
  eventUrl: string;
  ticketsUrl: string;
  amount: string;
  ticketCode: string;
}

export const paymentSuccessTemplate = ({
  name,
  eventName,
  eventDate,
  eventUrl,
  ticketsUrl,
  amount,
  ticketCode,
}: PaymentSuccessTemplateInput): string => {
  return shell(`
    <h2 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#111712;">Payment confirmed</h2>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#4a574d;">
      Hi ${escapeHtml(name)}, your ticket for <strong>${escapeHtml(eventName)}</strong> is ready.
    </p>
    <div style="margin:18px 0;padding:16px;border-radius:14px;background:#f5f7f4;color:#2d3a30;">
      <p style="margin:0 0 8px;font-size:14px;"><strong>Event:</strong> ${escapeHtml(eventName)}</p>
      <p style="margin:0 0 8px;font-size:14px;"><strong>Date:</strong> ${escapeHtml(eventDate)}</p>
      <p style="margin:0 0 8px;font-size:14px;"><strong>Amount:</strong> ${escapeHtml(amount)}</p>
      <p style="margin:0;font-size:14px;"><strong>Ticket code:</strong> ${escapeHtml(ticketCode)}</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      ${button(ticketsUrl, 'View ticket')}
      <a href="${eventUrl}" style="display:inline-block;color:#c93529;padding:12px 0;text-decoration:none;font-weight:700;">View event</a>
    </div>
  `);
};

export const reminderTemplate = (
  eventName: string,
  eventDate: string,
  eventUrl: string,
): string => {
  return shell(`
    <h2 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#111712;">Reminder: ${escapeHtml(eventName)} is coming up</h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#4a574d;">
      Your event is scheduled for <strong>${escapeHtml(eventDate)}</strong>.
    </p>
    ${button(eventUrl, 'View event')}
  `);
};
