# Relix CRM

Relix is a production-ready, full-stack CRM built with Next.js, Prisma, PostgreSQL, and Tailwind CSS. It includes authentication, onboarding, contacts, companies, sales pipelines, tasks, meetings, team management, an SMTP/IMAP inbox, AI-assisted email tools, and a dedicated superuser control plane.

## Features

- Dashboard with live workspace metrics
- People and companies with linked records
- Drag-and-drop sales pipeline
- Tasks with table and board views
- Lead reminders and notifications
- SMTP sending, IMAP sync, and tracked email threads
- AI-assisted email composition with OpenAI
- Google Meet, Zoom, and Microsoft Teams meeting workflows
- Team invitations and role-based access
- Multi-workspace platform administration
- Account, localization, email, and workspace settings

## Technology

- Next.js 15 (App Router)
- React 19 and TypeScript
- Prisma ORM
- PostgreSQL for production; SQLite for local development
- Tailwind CSS 4
- NextAuth.js
- OpenAI API

## Requirements

- Node.js 20 or later
- npm 10 or later
- PostgreSQL for production, or SQLite for local development

## Installation

```bash
npm install
cp .env.example .env
# Update .env with your own configuration
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Create the superuser

The seed command creates or updates the initial superuser using the following values from `.env`:

```env
SUPERUSER_NAME="Platform Owner"
SUPERUSER_EMAIL="owner@example.com"
SUPERUSER_PASSWORD="replace-with-a-strong-password"
```

Then run:

```bash
npm run db:seed
```

Sign in with `SUPERUSER_EMAIL` and `SUPERUSER_PASSWORD`. The superuser is redirected to `/superuser`, where they can manage users, workspaces, platform branding, email settings, and integrations.

For security:

- Replace all example credentials before running the seed in production.
- Use a unique password and store it in a secure password manager.
- Do not commit `.env` or share production credentials.
- After the first sign-in, verify platform settings and rotate any temporary password.

## Environment variables

Copy `.env.example` to `.env` and replace every placeholder.

### Application and authentication

| Variable | Description |
|---|---|
| `DATABASE_URL` | Database connection string |
| `APP_NAME` | Public application name |
| `NEXTAUTH_URL` | Full application URL, without a trailing slash |
| `NEXTAUTH_SECRET` | Long, random secret used to sign sessions |
| `CRON_SECRET` | Separate secret protecting scheduled routes |
| `SUPERUSER_NAME` | Initial platform owner name |
| `SUPERUSER_EMAIL` | Initial platform owner email |
| `SUPERUSER_PASSWORD` | Initial platform owner password |

Generate secure secrets with:

```bash
openssl rand -base64 32
```

### Google OAuth

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret |

Configure these redirect URIs, replacing `<your-domain>`:

- `https://<your-domain>/api/auth/google/callback`
- `https://<your-domain>/api/meetings/google/callback`
- `https://<your-domain>/api/email/google/callback`

For local development, also add `http://localhost:3000` as an authorized JavaScript origin.

### Email

| Variable | Description |
|---|---|
| `SMTP_HOST` | Outgoing mail server hostname |
| `SMTP_PORT` | Outgoing mail port, usually `587` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password or app password |
| `SMTP_FROM` | Sender name and address |
| `IMAP_HOST` | Incoming mail server hostname |
| `IMAP_PORT` | Incoming mail port, usually `993` |
| `IMAP_SECURE` | Set to `true` for TLS |
| `IMAP_USER` | IMAP username |
| `IMAP_PASS` | IMAP password or app password |

### AI

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | Supported model name |

AI and third-party integrations are optional. Their related features remain unavailable until valid credentials are configured.

## Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production server |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Apply the Prisma schema |
| `npm run db:seed` | Create/update the initial superuser and seed data |

## Main routes

| Route | Description |
|---|---|
| `/` | Dashboard |
| `/companies` | Companies |
| `/contacts` | People and contacts |
| `/pipeline` | Sales pipeline |
| `/leads` | Leads |
| `/tasks` | Tasks |
| `/inbox` | Email inbox |
| `/meetings` | Meetings |
| `/team` | Team management |
| `/settings` | User and workspace settings |
| `/superuser` | Platform control plane |

## Production checklist

- Use a managed PostgreSQL database.
- Set `NEXTAUTH_URL` to the final HTTPS domain.
- Generate unique values for `NEXTAUTH_SECRET` and `CRON_SECRET`.
- Configure a scheduler to call `GET /api/cron/notifications` with `Authorization: Bearer <CRON_SECRET>`.
- Store persistent uploads in object storage on ephemeral hosting.
- Keep email sync and reminder delivery in background or scheduled jobs.
- Review OAuth redirect URIs after changing domains.
- Never deploy the included development database or a local `.env` file.

## License and support

This package is intended for use under the license supplied with your UI8 purchase. Third-party services, API usage, hosting, and email provider costs are not included.
