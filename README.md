# LaserHacks — laserhacks.org

Official website for **LaserHacks**, Irvine Valley College's beginner-friendly annual student hackathon.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Database | Neon Postgres (serverless) |
| ORM | Drizzle ORM |
| Auth | JWT (jose) + bcryptjs |
| Validation | Zod + React Hook Form |
| Deployment | Vercel |

---

## Quick Start

### 1. Clone & install

```bash
git clone <repo-url>
cd laserhacks
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string (pooled) |
| `JWT_SECRET` | Random secret ≥ 32 chars (`openssl rand -base64 32`) |
| `SEED_ADMIN_EMAIL` | Email for the first admin account |
| `SEED_ADMIN_PASSWORD` | Password for the first admin account |
| `NEXT_PUBLIC_APP_URL` | Public URL (e.g. `https://laserhacks.org`) |

### 3. Set up Neon database

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the **pooled** connection string
3. Paste it into `DATABASE_URL` in `.env.local`

### 4. Push database schema

```bash
npm run db:push
```

This creates all tables. On first setup this is the only step needed.

### 5. Seed sample data

```bash
npm run seed
```

Seeds FAQ items, schedule, announcements, and sponsors with realistic sample data.

### 6. Create admin account

```bash
npm run create-admin
```

Uses `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_NAME` from `.env.local`.

### 7. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home
│   ├── about/
│   ├── schedule/
│   ├── faq/
│   ├── sponsors/
│   ├── media/
│   ├── register/
│   ├── contact/
│   ├── admin/
│   │   ├── login/
│   │   └── dashboard/      # Protected admin pages
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── layout/             # Navbar, Footer
│   ├── decorative/         # Animated background elements
│   ├── sections/           # Homepage section components
│   ├── admin/              # Admin dashboard components
│   └── forms/              # Form components
├── lib/
│   ├── db/                 # Drizzle ORM + schema
│   ├── auth/               # JWT session utilities
│   ├── settings.ts         # Site config from DB
│   ├── utils.ts            # Helpers
│   └── validations.ts      # Zod schemas
└── middleware.ts            # Auth middleware for /admin
scripts/
├── seed.ts                 # Seed sample data
└── create-admin.ts         # Create admin user
```

---

## Admin Dashboard

Access at `/admin/login`. The dashboard lets staff manage:

- **Site Settings** — event name, dates, venue, registration mode, social links
- **Announcements** — homepage news and updates
- **FAQ** — frequently asked questions
- **Schedule** — days and schedule items
- **Sponsors** — sponsor listings and tiers
- **Media** — photos, videos, Instagram/YouTube highlights
- **Registrations** — view all registrations (when internal mode is enabled)

### Registration Modes

Two modes configurable from Admin → Site Settings:

| Mode | Behavior |
|------|----------|
| **External** | Shows a button linking to Google Forms or another URL you configure |
| **Internal** | Shows the built-in registration form; submissions saved to Neon |

---

## Database

### Schema overview

- `users` — admin/staff accounts (not students)
- `site_settings` — key-value store for all configurable content
- `announcements` — news and updates shown on homepage
- `faq_items` — FAQ entries with categories and sort order
- `schedule_days` — event days (e.g. Friday, Saturday, Sunday)
- `schedule_items` — individual schedule entries linked to days
- `sponsors` — sponsor listings with tiers
- `media_items` — media embeds (YouTube, Instagram, images, links)
- `registrations` — student registrations (internal mode only)
- `contact_submissions` — contact form submissions

### Migrations

For development, `npm run db:push` pushes schema changes directly (no migration files needed).

For production or CI, use:

```bash
npm run db:generate  # Generate migration SQL
npm run db:migrate   # Apply migrations
```

You can also open Drizzle Studio to browse/edit data:

```bash
npm run db:studio
```

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import into Vercel
3. Set all environment variables from `.env.example` in Vercel's dashboard
4. Deploy — Vercel auto-builds on push to main

**After first deploy:**
```bash
# Push schema to your production Neon DB
DATABASE_URL=<production-url> npm run db:push

# Seed production data
DATABASE_URL=<production-url> npm run seed

# Create production admin
SEED_ADMIN_EMAIL=admin@laserhacks.org \
SEED_ADMIN_PASSWORD=<strong-password> \
DATABASE_URL=<production-url> \
npm run create-admin
```

---

## Handoff Notes for IVC

This site is designed to be maintainable by non-technical organizers through the admin dashboard. Here's what IVC staff will need:

1. **Admin credentials** — set via environment variables and `create-admin` script
2. **Neon database** — the Neon project should be transferred to an IVC/ASIVC account
3. **Vercel deployment** — the project should be transferred to an IVC Vercel account (or re-deployed)
4. **Domain** — configure `laserhacks.org` DNS in Vercel settings
5. **Environment variables** — update `NEXT_PUBLIC_APP_URL` to `https://laserhacks.org`

### Every year, organizers should:

1. Log into `/admin/login`
2. Update **Site Settings** (new dates, venue, registration link)
3. Reset the **Schedule** (delete old days/items, add new ones)
4. Update **Announcements**
5. Update **Sponsors** list
6. Choose registration mode (external Google Form or internal form)

---

## Local Development Tips

- Use `npm run db:studio` to browse and edit DB data via a visual UI
- All admin pages are protected — you must create an admin account first
- The seed script is safe to re-run (checks for existing data)
- Framer Motion animations respect `prefers-reduced-motion`
- Decorative background elements are pure CSS animations (no JS overhead)
