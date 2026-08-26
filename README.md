# Web Portal SMK PGRI Telagasari

Public website and admin CMS for SMK PGRI Telagasari (`smkpgritelagasari.sch.id`).

A single Laravel monolith: server-rendered public pages for SEO, plus an authenticated content
management area under `/admin` that the school's own staff operate.

- **Stack** — Laravel 13, Inertia 3, React 19, TypeScript, Tailwind CSS 4, MariaDB
- **Rendering** — SSR for every public page; the admin area is client-rendered and `noindex`
- **Roles** — Superadmin and Editor, enforced server-side
- **Language** — Indonesian throughout (`APP_LOCALE=id`); `lang/` carries `id` and `en` framework
  strings

---

## Requirements

| | |
|---|---|
| PHP | 8.3+ |
| Node.js | 20+ |
| Database | MariaDB 11 / MySQL 8 |
| Composer | 2.x |

SQLite is not supported — the `sqlite` connection has been removed from `config/database.php`.

## Getting started

```bash
git clone <repo-url> webportal-smk
cd webportal-smk

composer setup   # install, .env, key:generate, migrate, npm install, npm run build
php artisan db:seed
```

`composer setup` does not create the database. Create it first:

```sql
CREATE DATABASE laravel_portal;
CREATE DATABASE laravel_portal_test;   -- used by the test suite
```

Then run the dev loop — PHP server, queue listener and Vite together:

```bash
composer dev
```

The site is on <http://localhost:8000>, the CMS on <http://localhost:8000/admin>.

### Seeded accounts

`DatabaseSeeder` creates the two bootstrap accounts (public registration is disabled by design):

| Role | Email | Password |
|---|---|---|
| Superadmin | `admin@smk.com` | `adminsmk99` |
| Editor | `editor@smk.com` | `adminsmk99` |

**Change these from `/admin/users` immediately after the first login in production.** The seeder
resets passwords only outside `APP_ENV=production`, so a production release will not undo the
change.

### No sample content

Seeding creates accounts, jurusan, ekstrakurikuler, the school identity record and the site
settings — nothing else. Berita, media, hero slides, gallery albums and spektrum kurikulum are
content the school enters through the CMS, so an empty-looking site after a fresh install is the
expected starting state.

Every seeder is insert-if-absent and must stay that way: `deploy/release.sh` runs
`db:seed --force` on each release, and a seeder that wrote unconditionally would erase the school's
edits.

## Commands

```bash
composer dev            # serve + queue:listen + vite (main dev loop)
composer setup          # first-time setup

composer ci:check       # exactly what CI runs
composer test           # config:clear + pint --test + phpstan + artisan test
composer lint           # pint --parallel (writes)
composer types:check    # phpstan analyse (larastan, level 7)

npm run lint            # eslint --fix
npm run format          # prettier --write
npm run types:check     # tsc --noEmit
npm run build           # vite build
npm run build:ssr       # vite build + SSR bundle (bootstrap/ssr/ssr.js)

npm run test:e2e        # Playwright, all projects except perf
npm run test:e2e:perf   # Core Web Vitals, run alone so timings mean something
npm run test:e2e:ui     # Playwright UI mode
```

Note that `composer test` is a full gate (lint + static analysis + tests). While iterating, run
`php artisan test` directly:

```bash
php artisan test --filter='returns a successful response'
php artisan test tests/Feature/Public/HomeTest.php
```

## Architecture

Data flows Controller → `Inertia::render()` props → React page component. There is no separate API.

```
app/
  Http/Controllers/Public/   public site
  Http/Controllers/Admin/    CMS
  Http/Middleware/           EnsurePageEnabled, EnsureUserIsSuperadmin, PreventIndexing, …
  Models/                    Post, Hero, Major, Media, GalleryAlbum, Extracurricular, …
  Support/                   Seo, StructuredData, SiteSettings, SchoolIdentityFields, …
resources/js/
  pages/public/              public page components
  pages/admin/               CMS page components
  components/public/         AstroWind widgets ported to React
  components/ui/             shadcn/ui (verbatim starter-kit copies)
routes/
  web.php                    public site
  admin.php                  /admin (auth + noindex applied in bootstrap/app.php)
  auth.php                   login / password reset
```

### Page resolution

`resources/views/app.blade.php` `@vite`s the page component by name, so
`Inertia::render('public/home')` maps to `resources/js/pages/public/home.tsx` by convention alone —
there is no `resolve` callback. A typo surfaces as a Vite resolution error, not a JS runtime error.

### Generated code — never edit

`resources/js/actions/`, `resources/js/routes/` and `resources/js/wayfinder/` are regenerated from
PHP routes and controllers by the Wayfinder Vite plugin on every build. All three are gitignored.
Import from them (`import { home } from '@/routes'`), but change the PHP route to change the output.

### Two key-value tables, not one

`settings` holds site configuration (tagline, logo, PPDB, GA4, `maps_mode`, the page toggles).
`school_id` holds the school's official Dapodik-style identity: name, NPSN, jenjang, address,
phone, email, akreditasi. They are not interchangeable — `App\Support\SchoolIdentityFields`
declares the identity catalogue once, and the admin form, the validation rules and the public page
are all generated from it.

`SiteSettings::share()` reads name, address, phone and email from `school_id`, so the header, the
footer and the JSON-LD cannot disagree with the Identitas page.

### Switchable public pages

Four public pages can be switched off from the CMS (`App\Support\PageVisibility::PAGES`):
Identitas Sekolah, Spektrum Kurikulum, Gallery, Ekstrakurikuler.

Off means gone, not merely unlinked — `EnsurePageEnabled` (aliased `page`) answers **404**, the
navbar and footer drop the item, and `SitemapController` stops advertising the URL. A page that is
only hidden from the menu still gets indexed while the school believes it is unpublished, so any
new toggled page needs all three.

### Roles

Two roles, **Superadmin** and **Editor**, enforced server-side by middleware. Editors may publish
directly. Superadmin-only routes (jurusan, identitas sekolah, settings, users) carry
`EnsureUserIsSuperadmin`, applied to the GET routes too — an Editor who types the URL receives 403
rather than a form that fails on save.

### Design systems

Two of them, deliberately, namespaced apart in `resources/css/app.css`:

- **Public site** — the [AstroWind](https://github.com/arthelokyo/astrowind) template, surfaced as
  `aw-`-prefixed Tailwind colours (`bg-aw-primary`) plus the `btn` utilities. Typeface: Inter.
- **Admin + auth** — the [Laravel React starter kit](https://github.com/laravel/react-starter-kit),
  i.e. stock shadcn/ui tokens, Instrument Sans, and the collapsible sidebar shell.

The `aw-` prefix exists because AstroWind's `primary`/`secondary`/`accent`/`muted` would otherwise
collide with shadcn's, which mean something else entirely.

Dark mode is class-driven (`.dark` on `<html>`), shared by both areas, and resolved before first
paint by an inline script.

## Testing

**Pest 4.** `tests/Pest.php` applies `RefreshDatabase` to the whole Feature suite, so every test
migrates a real schema. `phpunit.xml` points at MariaDB `laravel_portal_test` — create it once
locally, and never point it at `laravel_portal`.

`INERTIA_SSR_ENABLED=false` in `phpunit.xml` is a performance switch, not a preference: with SSR on
and no SSR process listening, every Inertia response pays a refused connection to port 13714.

**Playwright (`tests/e2e/`)** runs in two layers, because the full matrix does not pay for itself:

- `cross/` — Chrome, Firefox, WebKit, Edge, Pixel 5, iPhone 12. Hunts rendering and hydration
  faults. `smoke.spec.ts` fails on any console error or failed same-origin request;
  `responsive.spec.ts` asserts zero horizontal overflow at 360/768/1280; `seo.spec.ts` asserts on
  raw HTML via `request.get()`, because a browser context cannot tell SSR from CSR once the page
  has hydrated.
- `deep/` — Chromium only: admin CRUD and the Core Web Vitals probes are not engine-specific.

Content-dependent specs call `test.skip()` on an empty database, so the perf project reports as
skipped on CI and `FR6-16` is verified by hand with Lighthouse against a database that has content.

Two gotchas worth knowing:

- Workers are capped at 4. `php artisan serve` handles one request at a time, so an unbounded
  matrix saturates it and produces timeouts that look exactly like real UI faults.
- A stale `public/hot`, left behind when `npm run dev` is killed, makes `Vite::isRunningHot()` true;
  every public page then silently degrades to CSR while looking perfectly healthy. Delete the file.

Playwright's browser download is a postinstall step and `.npmrc` sets `ignore-scripts=true`, so run
it by hand once:

```bash
npx playwright install chromium firefox webkit
```

## Conventions enforced by CI

`.github/workflows/tests.yml` runs `composer ci:check` on every push and PR — a formatting failure
breaks the build the same as a test failure.

- **PHP** — Pint `laravel` preset; PHPStan level 7 over `app/`, `bootstrap/app.php`, `config/`,
  `database/`, `routes/`.
- **TS/TSX** — Prettier: 4-space indent, single quotes, semicolons, 80 columns, Tailwind class
  sorting.
- **ESLint** — `import/order` alphabetized by group, `consistent-type-imports` as separate
  `import type` statements, `curly: all`, and a blank line around every control-flow statement.

## Deployment

**Releases run only on explicit instruction from the school.** The pipeline lives in
`.github/workflows/deploy.yml` and `deploy/release.sh`: `workflow_dispatch`-only and gated behind
the `production` GitHub Environment, so a release happens when someone clicks and approves it, and
never from a push.

`release.sh` is piped to the VPS over stdin rather than kept on the server, and it prunes the
server checkout via `git sparse-checkout` so `.claude/`, `.codegraph/`, `.github/`, `deploy/` and
`CLAUDE.md` never land in the worktree.

On the server, `php` on `PATH` is the wrong interpreter — CloudPanel installs several PHP versions
side by side and assigns one per site, while `/usr/bin/php` stays the system-wide symlink.
`release.sh` reads the site's version from its PHP-FPM pool, refuses to run below 8.3, and puts the
resolved binary first on `PATH`; `deploy/supervisor/*.conf` pin the version for the same reason.

Infrastructure — VPS, CloudPanel, DNS, SSL — is the school's responsibility.

## Documentation

- `CLAUDE.md` — working notes for Claude Code, and the fullest architectural reference in the repo.
- `prd/` — the complete Indonesian-language specification, 8 numbered documents. **Gitignored**:
  local only, so it never appears in diffs or on a fresh clone.
- `docs/` — operator runbooks (`deployment.md`, `seo-search-console.md`). Also gitignored.

## License

MIT.
