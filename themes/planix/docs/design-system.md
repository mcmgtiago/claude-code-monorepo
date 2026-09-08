# Planix Design System

This document supports buyer-facing customization work for the template. Use it together with the setup and customization guidance in `README.md`.

## Goal

This project uses a screenshot-driven dashboard system. Each future page should reuse the same tokens, card structure, and typography so the app feels like one product instead of a set of disconnected screens.

## Design Tokens

- Background: `--background`, `--sidebar`
- Surfaces: `--panel`, `--panel-strong`, `--panel-soft`, `--panel-muted`
- Borders: `--border`, `--border-strong`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Accent: `--accent`, `--accent-strong`, `--accent-soft`
- Feedback: `--green`, `--red`

## Typography

- Primary font: `Manrope`
- Base app font size is intentionally reduced and controlled from `app/globals.css`
- Use shared type tokens instead of ad hoc large headings: `.type-page-title`, `.type-card-title`, `.type-section-title`, `.type-ui`, `.type-caption`, `.type-metric-lg`, `.type-metric-md`
- Titles use tight tracking and high contrast
- Supporting text stays muted and compact

## Core Primitives

- `Panel`: shared card shell with consistent padding, radius, border, and header behavior
- `Avatar`: gradient-based avatar placeholder for dummy states
- `AvatarCluster`: stacked assignee treatment for lists and tables
- `recharts`: default charting layer for dashboard analytics and future data visualizations

## Shell Layout

- Desktop authenticated pages should feel like one continuous app frame, not separate floating cards
- Avoid desktop top/bottom gaps caused by page padding plus sticky height calculations
- Full-height desktop shells should prefer internal vertical dividers over decorative outer borders
- Do not keep outer frame radius on full-height desktop app surfaces unless the reference explicitly shows a framed container
- Sidebars, project directories, and drawers should remain structurally pinned while only the intended content region scrolls

## Feed Lists

- Notification and activity feeds should use a compact list rhythm, not card-like hero spacing
- Keep feed title, time, and body text smaller than the main card typography
- Keep feed avatars and icons visually aligned and slightly smaller than default profile/list avatars unless the reference clearly uses larger media
- Feed avatars and icon tiles should share the same footprint and corner treatment when they appear in the same list
- End spacing should be intentional and consistent across repeated feed panels; do not leave extra last-item bottom padding in one feed but not another

## Buttons And Menus

- Repeated card action buttons should reuse the same treatment across similar contexts
- Secondary pill actions like `See all tasks` and `View all` should share the same compact soft-pill pattern unless the reference clearly differentiates them
- Dashboard card menu buttons should use one consistent compact top-right 3-dot control pattern
- Prefer token-based radii and sizing for buttons over hardcoded one-off values

## Radius Discipline

- Use `--radius-xl`, `--radius-lg`, and `--radius-md` for repeated corners
- Avoid ad hoc `rounded-2xl`, `rounded-lg`, `rounded-md`, or hardcoded pixel radii for reusable UI unless the value is intentional and documented
- Circular elements are the main exception: avatars, status dots, and icon badges may remain fully rounded when appropriate

## Charts

- Keep charts visually simple: minimal grid, no decorative patterns unless a reference explicitly needs them
- Reuse chart tokens from `app/globals.css`: `--chart-grid`, `--chart-axis`, `--chart-series-primary`, `--chart-series-secondary`, `--chart-series-muted`
- Prefer readable analysis cards over highly styled chart ornamentation
- Keep analytics charts on a shared visual language: simple controls, simple strokes, and no separate ornamental menu/button style per card

## Data Strategy

- Store placeholder content in `src/data`
- Keep presentation components free of API assumptions
- Replace dummy content later by swapping the data layer or server actions, not by rewriting UI markup

## Future Pages

- Reuse sidebar and shell proportions
- Keep large cards dense and controlled by shared tokens
- Prefer dark surfaces with one warm accent
- Match incoming screenshots closely before introducing new patterns
- Avoid decorative visual effects by default: no glow, no soft shadow, no glassmorphism, no ambient gradients unless a reference explicitly requires them
- When fixing a repeated visual mistake, update the shared rule or primitive in the same pass so future pages inherit the correction
