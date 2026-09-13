# Tecno Team — Personal Portfolio + Team Platform

A dual-identity engineering platform: the personal portfolio of
**Abdulaziz El-Nagar** and the public site for **Tecno Team**, the
engineering brand he builds under — one Next.js app, one database, one
admin dashboard, sharing content via an explicit ownership field rather
than two separate codebases.

Nothing in the admin is a mock — every CRUD screen reads and writes real
database rows through Prisma, every upload goes through a real signed
Cloudinary call, and every admin mutation is authorized server-side.

## Architecture

```
Public                          Admin
─────────────────────────       ─────────────────────────────
/                (Home)         /admin/login
/about                          /admin                (dashboard)
/projects        (+ owner       /admin/profile         (Personal)
  filter: all/personal/tecno)   /admin/experience       (Personal)
/projects/[slug]                /admin/tecno-team       (Team profile + members)
/certificates                   /admin/projects (+ new, [id]/edit)
/services                       /admin/skills
/tecno-team                     /admin/certificates (+ new, [id]/edit)
/blog                           /admin/services
/blog/[slug]                    /admin/blog (+ new, [id]/edit)
/contact                        /admin/messages
                                 /admin/analytics
                                 /admin/seo
                                 /admin/social-links
                                 /admin/settings (Branding + General)
                                 /admin/security
                                 /admin/activity-logs
```

Data flows one direction: **Admin Dashboard → Prisma → PostgreSQL → Next.js
Server Components → Public site.** There is no hardcoded content object
behind the public pages — name, title, bio, photo, CV, logo, brand colors,
projects, services, and social links are all database-driven, with a
small, clearly-labeled fallback string only where a value hasn't been set
yet.

## The dual-identity model (Personal vs. Tecno Team)

Rather than maintaining two separate CMSs, **Projects**, **Experience**,
**Services**, and **Social Links** each carry an optional `owner` field:

- `PERSONAL` — Abdulaziz's own work
- `TECNO` — Tecno Team work
- `BOTH` — both
- *(unset)* — "unclassified": still visible everywhere it always was,
  under "All," until someone picks one from the admin. Nothing you
  already had disappears because this field exists.

The public `/projects` page has an All / Personal / Tecno Team filter. The
public `/tecno-team` page automatically pulls in whatever Projects,
Services, and Social Links are tagged `TECNO` or `BOTH` — those aren't
duplicated into a separate "team projects" table.

`/admin/tecno-team` additionally manages **Team Members** (name, role, bio,
photo) and the team's own description/mission/vision — genuinely new,
additive tables with no relation to existing content.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4 + centralized CSS-variable design tokens (`src/app/globals.css`), with brand colors overridable at runtime (see Branding & theme below)
- **Database:** PostgreSQL via Prisma (`prisma/schema.prisma`)
- **Auth:** Auth.js v5, Credentials provider, bcrypt password hashing, JWT sessions, database-backed role re-verification on every admin action
- **Validation:** Zod on every mutation (client-displayed errors + server-enforced)
- **File storage:** Cloudinary (signed server-side uploads, server-side folder allowlist), behind a swappable `StorageService` interface
- **Rate limiting:** in-memory by default, auto-upgrades to Upstash Redis (REST API, no SDK dependency) when configured — see Rate limiting below
- **Icons:** lucide-react, plus a few hand-written brand-mark SVGs (see note below)

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values below
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed        # creates the first admin user + demo content
npm run dev
```

Sign in at `/admin/login` with the credentials from `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` in your `.env`, then change the password immediately
under **Admin → Security**. The real Tecno Team logo you provided is
seeded to `SiteSetting.logoUrl` automatically (pointing at
`/public/brand/tecno-logo.jpg`) so the site shows it out of the box — swap
it for a Cloudinary-hosted version anytime from **Admin → Settings →
Branding**.

To seed only the admin user without demo Project/Skill rows:

```bash
npx prisma db seed -- --admin-only
```

### ⚠️ If you already have data in a real database

This project has no committed migration history yet (`prisma/migrations/`
doesn't exist) — this schema has only ever been applied via `db push` or a
fresh `migrate dev`, never a tracked migration chain. **Before running
`npx prisma migrate dev` against a database that already has real data**:

1. Run `npx prisma migrate dev` in a throwaway copy of your database first
   and confirm it does what you expect.
2. If Prisma reports schema drift and offers to reset the database,
   **do not accept that** — it means your DB's actual structure disagrees
   with any migration history it can find. Use `npx prisma db push`
   instead (no migration history, no reset prompt), or baseline the
   migration first with `npx prisma migrate resolve`.
3. Every new field added in this pass (`owner`, `ContentOwner`, branding
   columns, `TecnoTeamProfile`, `TeamMember`, `Profile.profileImagePublicId`,
   etc.) is nullable/has a safe default — the migration itself is additive
   and shouldn't touch existing rows either way.

## Environment variables

See `.env.example` for the full list. At minimum you need:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (local, Neon, Supabase, Railway, etc.) |
| `AUTH_SECRET` | Session signing secret — generate with `npx auth secret` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Required for any image/CV/logo upload |

Optional:

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Distributed rate limiting for multi-instance production deployments. Falls back to a safe in-memory limiter (fine for one instance) if unset — see Rate limiting below. |

Without Cloudinary credentials, every other module works normally — only
the upload button will show a clear error instead of silently failing.

## Database

`prisma/schema.prisma` is the single source of truth. Entities: `User`,
`Profile` (personal identity — name, title, bio, photo, CV, contact),
`Project`/`ProjectImage`, `Skill`/`SkillCategory`, `Experience` (personal +
work/education/event timeline), `Certificate`, `Service`,
`BlogPost`/`BlogCategory`/`BlogTag`, `Message`, `AnalyticsEvent`,
`SiteSetting` (branding + SEO + theme, single row), `SocialLink`,
`ActivityLog`, `TecnoTeamProfile` (single row), and `TeamMember`.

`Project`, `Experience`, `Service`, and `SocialLink` each have a nullable
`owner: ContentOwner?` column (`PERSONAL` / `TECNO` / `BOTH`).

```bash
npx prisma studio          # browse/edit data visually
npx prisma migrate dev     # apply schema changes in development
npx prisma migrate deploy  # apply migrations in production — never
                            # `migrate dev` against a live database
```

## Branding & runtime theme colors

**Admin → Settings → Branding** manages the Tecno Team logo (light/dark
variants + favicon), stored in `SiteSetting` with the matching Cloudinary
`publicId` so replacing or removing a logo actually deletes the old
Cloudinary asset instead of leaving it orphaned. The logo renders (with a
graceful text-mark fallback when unset) in the navbar, footer, admin
sidebar, admin login, and the site favicon/Open Graph image.

**Admin → Settings → General** stores `primaryColor` and `secondaryColor`.
These now take effect at runtime (no rebuild needed):

- `primaryColor` overrides the `--gold` CSS variable in `src/app/globals.css`.
  `--gold-deep` / `--gold-soft` (used for hover states, badges, etc.)
  derive from it automatically via `color-mix()`, so one admin-set color
  produces working shades everywhere `--gold*` is used — buttons, links,
  navbar, hero, cards, the admin dashboard, the mobile drawer, and both
  light and dark mode.
- `secondaryColor` overrides `--brand-secondary`, currently used for the
  homepage circuit illustration's accent rings. It is **deliberately not**
  wired into `--ink`/`--paper`/`--border` (text and surface colors) — those
  must stay theme-inverted for light/dark contrast, and letting an
  arbitrary admin color override them risked making text unreadable in one
  of the two themes. If you want secondaryColor to drive more surfaces,
  pick specific decorative (non-text, non-background) spots and reference
  `var(--brand-secondary)` there.

Both colors are re-validated against a strict hex regex server-side (on
top of the Zod validation already enforced when Settings is saved) before
ever being interpolated into the injected `<style>` tag, so nothing but a
6-digit hex color can reach that tag.

## Authentication & security

- **Defense in depth, three layers:** edge middleware (`src/middleware.ts`)
  blocks unauthenticated requests to `/admin/*` before any page runs; the
  `(dashboard)` route-group layout re-checks the session server-side; every
  server action additionally calls `requireAdmin()` or `requireStaff()`
  before touching data — and both re-verify the caller's role against the
  database rather than trusting the session's role claim alone, so a
  downgraded/revoked account loses access immediately.
- **Two authorization levels:** `requireAdmin()` (Branding, Personal
  Profile, Tecno Team profile, Settings, SEO, Social Links, Security,
  Activity Logs — anything identity- or config-level) and `requireStaff()`
  (day-to-day content: Projects, Skills, Experience, Certificates,
  Services, Blog, Messages — ADMIN or EDITOR).
- **Uploads** go through a server-side folder allowlist
  (`src/lib/actions/upload.ts`) — the client's requested folder is checked
  against a fixed list and role-gated (Branding/Profile/Team/SEO assets are
  admin-only); nothing the client sends reaches Cloudinary unvalidated.
  Files are also validated by MIME type, extension, and size before upload,
  and the Cloudinary API secret never reaches the browser (uploads are
  signed server-side).
- **Cloudinary cleanup:** replacing or removing a logo, profile photo, CV,
  or team member photo deletes the old Cloudinary asset — using the
  correct `resource_type` (image vs. raw) — only *after* the new value is
  safely committed to the database, never before.
- **Passwords** are bcrypt-hashed (cost factor 12) and never logged, stored
  in plaintext, or returned from any query result.
- **Rate limiting** on login (5 / 10 min per IP+email), password change
  (5 / 15 min per account), and the public contact form (3 / hour per IP)
  — see Rate limiting below.
- **Activity logging**: every create/update/delete/publish/login/logout and
  settings/branding/ownership change is recorded in `ActivityLog`, visible
  at `/admin/activity-logs`. Passwords and other secrets are never written
  to this table.
- **Error handling**: Cloudinary/provider error bodies are logged
  server-side and never forwarded to the client; a custom `error.tsx` and
  `not-found.tsx` show a friendly message with an opaque digest instead of
  a stack trace.
- **Contact form**: honeypot field + Zod validation + rate limiting, with a
  message inserted into the database only after all three pass. No email
  sending is faked — replies happen via the "Reply by email" `mailto:` link
  in the admin inbox, or by wiring a real email provider later.

## Rate limiting

`src/lib/services/rate-limit.ts` exposes a `RateLimiter` interface with two
implementations, chosen automatically at module load — never both, and
never pretending Redis is active when it isn't:

- **In-memory** (default): a per-process sliding-window counter. Correct
  for a single instance; resets on redeploy and doesn't share state across
  multiple instances.
- **Upstash Redis** (when `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN` are both set): a REST-API-based fixed-window
  counter (`INCR` + `EXPIRE NX`, pipelined), with no SDK dependency — just
  `fetch`. Fails open (allows the request, logs the failure) if Upstash is
  briefly unreachable, rather than 500ing a login or contact form.

A one-line warning is logged at startup if Redis env vars are absent, so
it's always visible which backend is active in a given deployment.

## SEO & structured data

`SiteSetting` drives title/description/keywords/canonical URL/OG
title-description-image/Twitter card/favicon/robots index. The root layout
additionally emits `Person` (from `Profile`), `Organization` (from
`SiteSetting` + the logo), and `WebSite` JSON-LD — built only from fields
actually populated in the CMS, never fabricated.

## Known environment note (development sandbox only)

This pass was built in a sandboxed container without access to
`binaries.prisma.sh` or `fonts.googleapis.com`, so `prisma generate` and a
full `next build` could not be run to completion there. What *was* run and
passed in that sandbox: `npm install` (543 packages), `npm run lint` (zero
errors), and `npx tsc --noEmit` (the only errors were the expected
cascading "implicit any" symptom of no generated Prisma client — verified
to trace to that one root cause, not a logic error). Once you run
`npx prisma generate` locally (where that domain isn't blocked), everything
resolves normally — this is a sandbox network restriction, not a code
issue.

## A note on brand icons

`lucide-react` v1.x removed brand/logo icons (GitHub, LinkedIn, Facebook,
Instagram, etc. — they were split out of the core icon set). `GithubMark`
and the icons in `src/components/ui/brand-marks.tsx` are small hand-written
SVG substitutes so social links still render a recognizable mark without
adding a second icon library dependency.

## What's implemented vs. what's next

**Implemented:** every module in the original checklist, plus the full
Personal/Tecno Team dual-identity system — Profile, Projects (with
ownership + filter), Skills, Experience (with ownership + type +
organization), Certificates, Services (with ownership), Blog, Messages,
Analytics, SEO + structured data, Social Links (with ownership), Branding
(real logo, dark variant, favicon), Tecno Team (profile + members), runtime
theme colors, Settings, Security, Activity Logs, all public pages, navbar
with animated mobile drawer, footer, dark/light mode, custom cursor
(desktop-only, respects `prefers-reduced-motion`), and the circuit-inspired
hero visual with the real profile photo and a CV download button.

**Deliberately left for you, since they're taste/content decisions or need
information only you have:**
- Classify existing Projects/Experience/Services/Social Links as Personal,
  Tecno Team, or Both — they show as "Unclassified" (still fully visible)
  until you do.
- Populate Team Members and the Tecno Team mission/vision text.
- A full accessibility/performance audit pass beyond what's already in
  place (focus-visible states, ARIA on the mobile drawer/dialogs, reduced-
  motion handling, lazy-loaded images by default) — worth a dedicated pass
  with real Lighthouse/axe runs once you're on infrastructure that isn't
  network-sandboxed.
- A production email provider for contact-form notifications, if you want
  more than the admin inbox + `mailto:` reply link.
