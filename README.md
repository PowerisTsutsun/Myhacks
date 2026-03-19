# MyHacks

Official website for Irvine Valley College's beginner-friendly annual hackathon.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- Neon Postgres + Drizzle ORM
- JWT auth (`jose`) + `bcryptjs` + OAuth (Google, Microsoft)
- Zod + React Hook Form
- Resend (email)

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create local env file

```bash
cp .env.example .env.local
```

3. Set required values in `.env.local`

- `DATABASE_URL`
- `JWT_SECRET`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_ADMIN_NAME`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CONTACT_EMAIL`
- `GOOGLE_CLIENT_ID` (optional — enables Google login)
- `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID` (optional — enables Microsoft login)
- `MICROSOFT_CLIENT_SECRET`

4. Push schema

```bash
npm run db:push
```

5. Seed initial data

```bash
npm run seed
```

6. Create or update the admin account

```bash
npm run create-admin
```

7. Start development server

```bash
npm run dev
```

- App: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run production build
- `npm run db:push` - push schema to DB
- `npm run db:generate` - generate SQL migrations
- `npm run db:migrate` - run migrations
- `npm run db:studio` - open Drizzle Studio
- `npm run seed` - seed sample event data
- `npm run create-admin` - create/update initial admin

## Project Layout

```text
src/
  app/             # pages + route handlers
  components/      # UI, forms, admin, layout sections
  lib/
    auth/          # auth/session/guard/oauth utilities
    db/            # schema + db client
    api.ts         # shared API helpers (id parsing + 400 responses)
scripts/           # seed/admin utility scripts
drizzle/           # drizzle metadata
```

## Admin Features

- Site settings
- Announcements
- FAQ
- Schedule
- Sponsors
- Media
- Registrations
- Contact submissions
- User and role management

## Refactor Notes (Current)

Recent cleanup standardized:

- Dynamic route ID parsing via `src/lib/api.ts`
- Shared bad-request JSON responses in API handlers
- Shared system-admin constant via `src/lib/auth/constants.ts`

This reduced repeated parsing and hard-coded values across admin/account routes.

## OAuth Setup

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com) → Credentials → Create OAuth 2.0 Client ID
2. Add authorized redirect URI: `{APP_URL}/api/auth/oauth/google/callback`
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`

### Microsoft

1. Go to [Azure Portal](https://portal.azure.com) → App registrations → New registration
2. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
3. Add redirect URI (Web): `{APP_URL}/api/auth/oauth/microsoft/callback`
4. Under API permissions, add `User.Read`
5. Set `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` in `.env.local`

## Deployment

Deploy on Vercel and copy all variables from `.env.example` into project environment settings.

After first production deploy:

```bash
DATABASE_URL=<prod-db-url> npm run db:push
DATABASE_URL=<prod-db-url> npm run seed
SEED_ADMIN_EMAIL=<admin-email> SEED_ADMIN_PASSWORD=<strong-password> DATABASE_URL=<prod-db-url> npm run create-admin
```

## Notes

- `.env.local` must not be committed.
- `.claude` is ignored in both `.gitignore` and `.ignore`.
- Type check:

```bash
npx tsc --noEmit
```
