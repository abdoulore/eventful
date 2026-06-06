import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';
import redis from '../src/config/redis';
import { hashPassword } from '../src/utils/hash';
import { closeReminderScheduler } from '../src/modules/reminders/reminder.scheduler';

let creatorToken: string;
let eventeeToken: string;
let creatorId: string;
let eventId: string;

beforeAll(async () => {
  await prisma.$connect();
  await redis.connect();

  // Create a creator
  const creatorRes = await request(app).post('/api/auth/register').send({
    name: 'Creator User',
    email: 'creator@example.com',
    password: 'password123',
    role: 'CREATOR',
  });
  creatorToken = creatorRes.body.data.accessToken;
  creatorId = creatorRes.body.data.user.id;

  // Create an eventee
  const eventeeRes = await request(app).post('/api/auth/register').send({
    name: 'Eventee User',
    email: 'eventee@example.com',
    password: 'password123',
    role: 'EVENTEE',
  });
  eventeeToken = eventeeRes.body.data.accessToken;
});

afterAll(async () => {
  await prisma.ticket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.event.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await closeReminderScheduler();
  await prisma.$disconnect();
  await redis.quit();
});

describe('POST /api/events', () => {
  it('should allow a creator to create an event', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        title: 'Test Concert',
        description: 'A great concert event',
        location: 'Lagos, Nigeria',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        price: 5000,
        totalTickets: 100,
        category: 'Music',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Test Concert');

    eventId = res.body.data.id;
  });

  it('should not allow an eventee to create an event', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${eventeeToken}`)
      .send({
        title: 'Test Concert',
        description: 'A great concert event',
        location: 'Lagos, Nigeria',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        price: 5000,
        totalTickets: 100,
        category: 'Music',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should fail without auth', async () => {
    const res = await request(app).post('/api/events').send({
      title: 'Test Concert',
    });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/events', () => {
  it('should return a list of published events', async () => {
    // Publish the event first
    await prisma.event.update({
      where: { id: eventId },
      data: { status: 'PUBLISHED' },
    });

    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.events)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('should filter events by category', async () => {
    const res = await request(app).get('/api/events?category=Music');

    expect(res.status).toBe(200);
    expect(res.body.data.events.every((e: { category: string }) => e.category === 'Music')).toBe(true);
  });

  it('should paginate results', async () => {
    const res = await request(app).get('/api/events?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.limit).toBe(5);
  });
});

describe('GET /api/events/:id', () => {
  it('should return a single event with share links', async () => {
    const res = await request(app).get(`/api/events/${eventId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(eventId);
    expect(res.body.data.shareLinks).toBeDefined();
    expect(res.body.data.shareLinks.twitter).toBeDefined();
  });

  it('should return 404 for non-existent event', async () => {
    const res = await request(app).get('/api/events/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/events/:id', () => {
  it('should allow creator to update their event', async () => {
    const res = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ title: 'Updated Concert Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Concert Title');
  });

  it('should not allow eventee to update an event', async () => {
    const res = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${eventeeToken}`)
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(403);
  });
});

describe('GET /api/events/creator/my-events', () => {
  it('should return events created by the authenticated creator', async () => {
    const res = await request(app)
      .get('/api/events/creator/my-events')
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.events.every((e: { creatorId: string }) => e.creatorId === creatorId)).toBe(true);
  });
});

describe('GET /api/events/:id/attendees', () => {
  it('should return attendees for the creator', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/attendees`)
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should not allow eventee to view attendees', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/attendees`)
      .set('Authorization', `Bearer ${eventeeToken}`);

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/events/:id', () => {
  it('should allow creator to delete their event', async () => {
    const createRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        title: 'Event To Delete',
        description: 'This will be deleted',
        location: 'Abuja, Nigeria',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        price: 2000,
        totalTickets: 50,
        category: 'Tech',
      });

    const newEventId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/events/${newEventId}`)
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
