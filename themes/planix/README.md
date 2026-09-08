<p align="center">
  <img src="public/logo.svg" alt="Planix" width="72" height="72" />
</p>

<h1 align="center">Planix</h1>

<p align="center">
  A premium project management and client workspace UI template for Next.js.
</p>

---

Planix is packaged as a self-contained UI template for local preview and front-end customization. It ships with polished demo content across dashboard, projects, clients, chat, people, notifications, settings, profile, and portal screens.

No database, Supabase, SMTP, or payment setup is required to run the included preview experience.

## Highlights

- Full workspace demo with dashboard, Kanban, CRM, chat, people, notifications, profile, settings, and portal screens
- Template-friendly API layer for preview interactions without external services
- Demo login flow that enters the workspace directly
- Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, lucide-react, and recharts

## Requirements

- Node.js `>=20.9.0`
- npm `>=10`

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Production build

Use these commands before shipping your own customized version:

```bash
npm run typecheck
npm run build
npm start
```

## Environment setup

This template includes `.env.example` with safe placeholder values for local preview.

### Required for local preview

- `NEXT_PUBLIC_APP_URL`: public app URL, usually `http://localhost:3000`
- `NEXT_PUBLIC_CONTACT_EMAIL`: default contact address used in UI flows
- `PLANIX_APP_NAME`: app/product name shown throughout the template
- `PLANIX_COMPANY_NAME`: company name used in branding
- `PLANIX_SUPPORT_EMAIL`: support address shown in settings and contact flows

### Included in the example env

- `PLANIX_APP_TAGLINE`
- `PLANIX_LOGO_URL`
- `PLANIX_PRIMARY_DOMAIN`
- `PLANIX_MARKETING_SITE_URL`
- `CONTACT_TO_EMAIL`

### Optional

- `NEXT_PUBLIC_WEBRTC_ICE_SERVERS`
- `NEXT_PUBLIC_TURN_URL`
- `NEXT_PUBLIC_TURN_USERNAME`
- `NEXT_PUBLIC_TURN_CREDENTIAL`

Leave the RTC fields empty unless you are wiring a real meeting or calling setup later.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the local development server |
| `npm run build` | Creates a production build |
| `npm start` | Runs the production build |
| `npm run typecheck` | Runs TypeScript without emitting files |

## Dependencies and template behavior

Planix is intentionally set up to preview as a front-end template first.

- The included UI runs without a database connection
- Demo interactions are powered by local template state and preview-safe API routes
- Supabase, PostgreSQL, and email-related packages are present for extension work, but they are not required to launch the included demo
- If you connect real services later, replace the demo data layer and API handlers incrementally instead of rewriting the UI

## Customization guide

### Branding

Update your product name, company name, support email, and domain values in `.env.local`.

Primary branding defaults are also defined in [src/components/providers/brand-provider.tsx](/Users/jeetuvishwakarma/Documents/Vishwa%20Labs/UI8%20Template/planix/src/components/providers/brand-provider.tsx).

### Theme and visual system

Global colors, radii, type scale, and shared UI tokens are defined in [app/globals.css](/Users/jeetuvishwakarma/Documents/Vishwa%20Labs/UI8%20Template/planix/app/globals.css).

Design-system rules and UI best practices are documented in [docs/design-system.md](/Users/jeetuvishwakarma/Documents/Vishwa%20Labs/UI8%20Template/planix/docs/design-system.md).

### Demo content

The main preview data lives in [src/lib/template-demo-store.ts](/Users/jeetuvishwakarma/Documents/Vishwa%20Labs/UI8%20Template/planix/src/lib/template-demo-store.ts).

Shared domain models and content helpers live under [src/data](/Users/jeetuvishwakarma/Documents/Vishwa%20Labs/UI8%20Template/planix/src/data).

### Routes and pages

App routes and screen entry points are organized under [app](/Users/jeetuvishwakarma/Documents/Vishwa%20Labs/UI8%20Template/planix/app).

### Components

Reusable UI building blocks and page shells are organized under [src/components](/Users/jeetuvishwakarma/Documents/Vishwa%20Labs/UI8%20Template/planix/src/components).

## Folder structure

```text
planix/
├── app/                    App Router routes, pages, and preview-safe API handlers
├── docs/                   Design notes and best-practice documentation
├── public/                 Static assets such as logos and auth illustrations
├── src/components/         Reusable UI components and page shells
├── src/data/               Shared data models and content definitions
└── src/lib/                Demo store, helpers, settings, and integration utilities
```

## Best practices

- Keep branding in environment variables so buyer-specific changes stay isolated from component code
- Update theme tokens in `app/globals.css` before changing one-off component styles
- Replace demo content through `src/lib/template-demo-store.ts` and `src/data` rather than editing many pages by hand
- Use shared components from `src/components/ui` and existing page shells before creating new patterns
- Run `npm run typecheck` and `npm run build` after customization to verify the template still ships cleanly

## Notes

- This package is prepared for UI showcase and front-end customization
- The included data is placeholder/demo content intended to be replaced by the buyer
- If you connect a real backend later, swap the demo store and API routes with your own services gradually
