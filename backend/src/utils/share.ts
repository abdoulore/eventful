import { env } from '../config/env';

interface ShareLinks {
  eventUrl: string;
  twitter: string;
  facebook: string;
  whatsapp: string;
  linkedin: string;
}

export const generateShareLinks = (eventId: string, eventName: string): ShareLinks => {
  const eventUrl = `${env.CLIENT_URL}/events/${eventId}`;
  const text = encodeURIComponent(`Check out ${eventName} on Eventful!`);
  const url = encodeURIComponent(eventUrl);

  return {
    eventUrl,
    twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    whatsapp: `https://wa.me/?text=${text}%20${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  };
};