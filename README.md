# Eventful

Eventful is an event management and ticketing app with an Express/TypeScript backend and a Next.js frontend.

## Structure

- `backend` - API, auth, events, tickets, payments, reminders, Prisma, Swagger docs.
- `frontend` - Next.js web app.

## Requirements

- Node.js
- PostgreSQL
- Redis

## Backend

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=
DATABASE_URL_TEST=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
APP_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

Run locally:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

API docs are available at `http://localhost:5000/api/docs`.

## Frontend

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run locally:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Tests

Backend tests use `DATABASE_URL_TEST` when it is set. Keep it pointed at a separate test database.

```bash
cd backend
npm test
```

## Deployment

Backend deployment:

- Root directory: `backend`
- Build command: `npm run build`
- Start command: `npx prisma migrate deploy && npm start`
- Paystack webhook URL: `https://<backend-domain>/api/payments/webhook`

Frontend deployment:

- Set `NEXT_PUBLIC_API_URL` to the hosted backend API URL, ending in `/api`.
