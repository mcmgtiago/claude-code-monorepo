# Neural Networks – Nexsas

A modern, responsive HTML template for AI, SaaS, and tech products. Built with **Nexsas** branding, this single-theme project includes marketing, services, blog, team, case studies, pricing, integration, testimonials, and auth pages using a component-based architecture and Tailwind CSS v4.

## Features

- **17 HTML pages** – Home, about, services, service details, blog, blog details, case studies, case study details, team, team details, pricing, contact, integration, testimonial, login, signup, 404
- **Component-based architecture** – Reusable HTML via `<Component>` tags ([vite-plugin-html-inject](https://www.npmjs.com/package/vite-plugin-html-inject))
- **Tailwind CSS v4** – Utility-first styling with `@tailwindcss/vite`
- **Vite** – Fast dev server and optimized production builds
- **Responsive layout** – Mobile-first sections, mega menus, and rich interactions
- **Vanilla JavaScript** – No framework lock-in; GSAP, marquee, accordion, modal, smooth scrolling, etc.

## Project structure

```
neural-network-tailwind/
├── public/                     # Static assets
│   ├── images/                 # Images, logos, icons
│   ├── fonts/                  # Font files
│   └── vendor/                 # Third-party JS (GSAP, Lenis, SplitText, etc.)
├── src/
│   ├── components/
│   │   ├── home/               # Home page sections
│   │   │   ├── hero.htm
│   │   │   ├── clients.htm
│   │   │   ├── solutions.htm
│   │   │   ├── track-record.htm
│   │   │   ├── experience.htm
│   │   │   ├── pricing.htm
│   │   │   ├── ecosystem.htm
│   │   │   ├── testimonial.htm
│   │   │   └── blog.htm
│   │   ├── shared/
│   │   │   ├── head-links.htm
│   │   │   ├── navbar/         # header, menus, nav button
│   │   │   ├── footer.htm
│   │   │   ├── cta.htm
│   │   │   ├── mobile-menu.htm
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   ├── icon/
│   │   │   ├── modal/
│   │   │   └── menu-icon/
│   │   ├── about/
│   │   ├── blog/
│   │   ├── case-study/
│   │   ├── contact/
│   │   ├── integration/
│   │   ├── login/
│   │   ├── not-found/
│   │   ├── pricing/
│   │   ├── services/
│   │   ├── signup/
│   │   ├── team/
│   │   └── testimonial/
│   ├── js/
│   │   ├── animation/          # Header, reveal, text-reveal, counter, smooth scroll, etc.
│   │   │   ├── index.js
│   │   │   ├── header.js
│   │   │   ├── reveal-animation.js
│   │   │   ├── text-reveal.js
│   │   │   ├── mobile-menu.js
│   │   │   └── ...
│   │   └── utils/              # Accordion, marquee, modal, navigation menu, footer, etc.
│   │       ├── index.js
│   │       ├── accordion.js
│   │       ├── marquee.js
│   │       ├── modal.js
│   │       └── ...
│   ├── styles/
│   │   ├── main.css            # CSS entry (Tailwind + project styles)
│   │   ├── variable.css        # Theme variables (@theme)
│   │   ├── common.css
│   │   ├── typography.css
│   │   ├── navigation-menu.css
│   │   ├── header.css
│   │   ├── icon-fonts.css
│   │   └── vendor/
│   └── main.js                 # JS entry (animation + utils)
├── index.html
├── about.html
├── services.html
├── service-details.html
├── blog.html
├── blog-details.html
├── case-study.html
├── case-study-details.html
├── team.html
├── team-details.html
├── pricing.html
├── contact.html
├── integration.html
├── testimonial.html
├── login.html
├── signup.html
├── 404.html
├── package.json
├── vite.config.js
├── post-build.js
└── README.md
```

## Pages

| Page               | File                      | Description                                                                                    |
| ------------------ | ------------------------- | ---------------------------------------------------------------------------------------------- |
| Home               | `index.html`              | Hero, clients, solutions, track record, experience, pricing, ecosystem, testimonial, blog, CTA |
| About              | `about.html`              | Hero, clients, vision & mission, video, team, CTA                                              |
| Services           | `services.html`           | Services hero, track record, CTA                                                               |
| Service details    | `service-details.html`    | Details hero, services track record, CTA                                                       |
| Blog               | `blog.html`               | Blog hero, famous blog grid, CTA                                                               |
| Blog details       | `blog-details.html`       | Post hero, markdown body, related posts, CTA                                                   |
| Case study         | `case-study.html`         | Case study hero, CTA                                                                           |
| Case study details | `case-study-details.html` | Case details hero, CTA                                                                         |
| Team               | `team.html`               | Team hero, core values, CTA                                                                    |
| Team details       | `team-details.html`       | Member hero, core values, CTA                                                                  |
| Pricing            | `pricing.html`            | Pricing hero, review cards, CTA                                                                |
| Contact            | `contact.html`            | Contact form                                                                                   |
| Integration        | `integration.html`        | Integration hero, FAQ, CTA                                                                     |
| Testimonial        | `testimonial.html`        | Testimonial hero, review cards, CTA                                                            |
| Login              | `login.html`              | Login form                                                                                     |
| Sign up            | `signup.html`             | Registration form                                                                              |
| 404                | `404.html`                | Not found                                                                                      |

## Prerequisites

- **Node.js** (v18+)
- **npm** or **yarn**

## Installation

```bash
npm install
# or
yarn install
```

## Development

```bash
npm run dev
# or
yarn dev
```

Runs at **http://localhost:5173** (or next free port). The dev script uses `--host 0.0.0.0` so the site is reachable on your LAN.

## Build

```bash
npm run build
# or
yarn build
```

Output is in **`dist/`**. The build runs `post-build.js` after Vite.

Preview production build:

```bash
npm run preview
# or
yarn preview
```

Deploy to Vercel:

```bash
npm run deploy
# or
yarn deploy
```

## Customization

### Using components

Pages use `<Component src="...">` to include partials:

```html
<Component src="src/components/shared/head-links.htm" />
<Component src="src/components/shared/navbar/header.htm" />
<main class="bg-background-8">
  <Component src="src/components/home/hero.htm" />
</main>
<Component src="src/components/shared/footer.htm" />
```

### Adding a page

1. Add a root `.html` file (e.g. `new-page.html`).
2. Include shared: `head-links.htm`, `navbar/header.htm`, `footer.htm`.
3. Add content via components from `src/components/` or create new ones.

Ensure `vite.config.js` picks up the new HTML file (all root `*.html` files are build entries).

### Styles

- **Theme** – `src/styles/variable.css` (`@theme` for colors, fonts, radii).
- **Global** – `src/styles/common.css`, `typography.css`.
- **Main** – `src/styles/main.css` imports Tailwind and project CSS.

### Scripts

- **Entry** – `src/main.js` imports `js/animation` and `js/utils`.
- **Animation** – `src/js/animation/` (header, reveal, text-reveal, counter, mobile menu, smooth scrolling, etc.).
- **Utils** – `src/js/utils/` (accordion, marquee, modal, navigation menu, footer behavior, etc.).

### Footer note

`footer.htm` may reference an extra partial used only for marketplace-style demo browsing. That partial is **not** part of the documented template layout above; for a production site you can remove its `<Component>` line from `footer.htm` if you do not need it.

## Tech stack

- **Vite** – Dev server and build
- **vite-plugin-html-inject** – `<Component>` injection
- **Tailwind CSS v4** – Styling (`@tailwindcss/vite`)
- **Vanilla JavaScript** – No front-end framework
- **GSAP** – Animations (reveal, text, ScrollTrigger, modals)
- **Lenis** – Smooth scrolling (via vendor scripts where used)
- **Terser** – Vendor script minification (Vite plugin in `vite.config.js`)

## Browser support

Current versions of Chrome, Firefox, Safari, Edge.

## Quick reference

```bash
npm install          # Install dependencies
npm run dev          # Dev server
npm run build        # Production build
npm run preview      # Preview build
npm run deploy       # Deploy (Vercel)
npm run format       # Prettier format
```

---

**Nexsas – Neural Networks Template**
