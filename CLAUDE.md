# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Web portal for SMK PGRI Telagasari (`smkpgritelagasari.sch.id`) — a public school site plus an
admin CMS. The domain application is built: the public pages, the CMS under `/admin`, and the data
model all exist — this is no longer the bare starter kit.

The full specification lives in `prd/` (8 numbered Indonesian-language documents, `prd-00-index.md`
first). **`prd/` is gitignored** — it exists locally only, so it will not appear in diffs or on a
fresh clone. Requirements are numbered (`FR5-2`, `US-018`, …) and each user story carries a
checkbox acceptance list; treat those IDs as the unit of work and verify against the checkboxes.

`docs/` is gitignored for the same reason — operator runbooks (`deployment.md`,
`seo-search-console.md`) exist locally only. Referencing them from committed files is fine, but
never assume the file is present on a fresh clone or on the server.

## Commands

```bash
composer dev          # serve + queue:listen + vite, concurrently (main dev loop)
composer setup        # first-time: install, .env, key, migrate, npm install, build

composer ci:check     # exactly what CI runs — eslint, prettier, phpstan, then composer test
composer test         # config:clear + pint --test + phpstan + artisan test
composer lint         # pint --parallel (writes)
composer types:check  # phpstan analyse (larastan, level 7)

npm run lint          # eslint --fix
npm run format        # prettier --write resources/
npm run types:check   # tsc --noEmit
npm run build         # vite build
npm run build:ssr     # vite build + SSR build (entrypoint: resources/js/ssr.tsx)
npm run test:e2e      # Playwright, all browsers except the perf project
npm run test:e2e:perf # Core Web Vitals, run alone so timing means something
npm run test:e2e:ui   # Playwright UI mode
```

Single test:

```bash
php artisan test --filter='returns a successful response'
php artisan test tests/Feature/ExampleTest.php
vendor/bin/pest --filter=…            # same, direct
```

Note `composer test` is a full gate (lint + static analysis + tests), not just the test run — use
`php artisan test` while iterating.

## Architecture

**Laravel 13 + Inertia 3 + React 19, single monolith, no separate API.** Data flows
Controller → `Inertia::render()` props → React page component. Per `prd-02`, public pages must be
server-rendered for SEO; the admin area (`/admin/*`) does not require SSR and must be `noindex`.

### Inertia page resolution
`resources/views/app.blade.php` renders `<x-inertia::app />` and `@vite`s the page component
directly by name: `resources/js/pages/{$page['component']}.tsx`. There is no `resolve` callback in
`resources/js/app.tsx` — the string passed to `Inertia::render('Public/Home')` maps to
`resources/js/pages/Public/Home.tsx` by convention alone. A typo produces a Vite resolution error,
not a JS runtime error.

### Wayfinder (generated code — never edit)
`resources/js/actions/`, `resources/js/routes/`, and `resources/js/wayfinder/` are generated from
PHP routes/controllers by the Wayfinder Vite plugin on every build. All three are **gitignored**
and excluded from ESLint. Import typed route helpers from them (`import { home } from '@/routes'`)
but change the PHP route or controller to change the output — hand edits are silently overwritten.

### Shared props typing
`HandleInertiaRequests::share()` (name, auth.user) is mirrored by hand in
`resources/js/types/global.d.ts` via `declare module '@inertiajs/core'`. Adding a shared prop
requires editing both, or it is untyped on the React side.

### Two key-value tables, not one
`settings` holds site configuration (tagline, logo, PPDB, GA4, `maps_mode`, the four
`page_*_enabled` toggles). `school_id` holds the school's official identity — the Dapodik-style
record: name, NPSN, jenjang, address, phone, email, akreditasi, and so on.

They are not interchangeable. `App\Support\SchoolIdentityFields` declares the identity catalogue
once, and the admin form, the validation rules, and the public page are all generated from it —
adding a field there is the whole change. `SiteSettings::share()` reads the school name, address,
phone, and email from `school_id`, so the header, footer, and JSON-LD cannot disagree with the
Identitas page. Do not reintroduce `school_name` or `contact_*` keys into `settings`.

### Switchable public pages
Four public pages can be switched off from the CMS: Identitas Sekolah, Spektrum Kurikulum,
Gallery, Ekstrakurikuler (`App\Support\PageVisibility::PAGES`).

Off means gone, not merely unlinked. `App\Http\Middleware\EnsurePageEnabled` (aliased `page`, e.g.
`->middleware('page:gallery')`) answers **404**, the navbar and footer drop the item by reading
`site.pages`, and `SitemapController` stops advertising the URL. A page that is only hidden from
the menu still gets indexed while the school believes it is unpublished — so any new toggled page
needs all three, not just the menu.

On the admin side the toggle rides in the same form as the fields (`<PageToggle>` plus a
`<fieldset disabled>`), and `<UnsavedGuard>` warns before an Inertia visit or a reload discards
unsaved changes. It intercepts **GET visits only** — a guard that blocked the form's own PUT would
make saving impossible.

### Other
- Exceptions render as JSON only for `api/*` or `expectsJson()` (`bootstrap/app.php`).
- `@/*` aliases `resources/js/*` (tsconfig paths + eslint import resolver).
- **MariaDB everywhere — SQLite is not used in this project.** Dev runs on the local MariaDB
  (`laravel_portal`), tests on `laravel_portal_test`, CI on a `mariadb:11` service container,
  production on MySQL 8/MariaDB per `prd-02`. The `sqlite` connection has been removed from
  `config/database.php`; do not reintroduce it or write SQLite-only migration idioms.

## Conventions enforced by CI

CI (`.github/workflows/tests.yml`) runs `composer ci:check` on every push and PR, so formatting
failures break the build the same as test failures.

- **PHP**: Pint `laravel` preset. PHPStan level 7 over `app/`, `bootstrap/app.php`, `config/`,
  `database/`, `routes/`.
- **TS/TSX**: Prettier — 4-space indent, single quotes, semicolons, 80 columns, Tailwind class
  sorting (`clsx`/`cn`/`cva` are sorted too).
- **ESLint** enforces some rules that are easy to trip: `import/order` alphabetized by group,
  `consistent-type-imports` with *separate* `import type` statements, `curly: all`, 1tbs braces
  never on a single line, and a blank line before and after every `if`/`return`/`for`/`while`/
  `do`/`switch`/`try`/`throw`.

## Testing

Pest 4. `tests/Pest.php` binds `Tests\TestCase` to `Feature` and applies `RefreshDatabase`, so
every feature test migrates a real schema. `phpunit.xml` points the suite at the MariaDB database
`laravel_portal_test` (create it once locally) and forces `id` locale, array cache/session, and
sync queue. The test database is migrated and rolled back per test — never point it at
`laravel_portal`.

`INERTIA_SSR_ENABLED=false` in `phpunit.xml` is a performance switch, not a preference: with SSR
on and no SSR process listening, every Inertia response in the suite pays a refused connection to
port 13714. Turning it off took the suite from ~171s to ~13s.

### Browser tests (`tests/e2e/`, Playwright)

Two layers, because the full matrix does not pay for itself:

- **`cross/`** runs on Chrome, Firefox, Safari (WebKit), Edge, plus Pixel 5 and iPhone 12. It hunts
  rendering and hydration faults — the things that actually differ between engines. `smoke.spec.ts`
  fails on any console error, uncaught exception, or failed same-origin request; `responsive.spec.ts`
  asserts zero horizontal overflow at 360/768/1280 and exercises the mobile menu and theme toggle;
  `seo.spec.ts` asserts on **raw HTML via `request.get()`**, because a browser context cannot tell
  SSR from CSR — after hydration the DOM is identical either way.
- **`deep/`** runs on Chromium only: admin CRUD and the Core Web Vitals probes are not
  engine-specific, and the performance APIs exist nowhere else.

`npm run test:e2e` runs everything except the perf project; `npm run test:e2e:perf` runs that one
alone with a single worker, because timing sampled while five browsers compete measures the machine,
not the page.

Since the content-dependent specs skip themselves on an empty database, both halves of that
behaviour need exercising. A scratch database gives the CI shape without touching the dev data —
the SSR process only renders the props it is handed, so it can be reused across databases:

```bash
php -r "(new PDO('mysql:host=127.0.0.1','root',''))->exec('CREATE DATABASE IF NOT EXISTS laravel_portal_e2e');"
DB_DATABASE=laravel_portal_e2e php artisan migrate --force
DB_DATABASE=laravel_portal_e2e php artisan db:seed --force
DB_DATABASE=laravel_portal_e2e E2E_PORT=8123 npx playwright test --grep-invert @perf
```

A spec that *passes* there rather than skipping is the signal to check: it usually means the
locator is matching page chrome (a sidebar avatar, a bundled logo) instead of the content it
claims to assert on.

Two gotchas worth knowing:

- Workers are capped at 4. `php artisan serve` is PHP's built-in server and handles **one request at
  a time** (`PHP_CLI_SERVER_WORKERS` is Unix-only), so an unbounded matrix saturates it and produces
  timeout failures that look exactly like real UI faults.
- A stale `public/hot`, left behind when `npm run dev` is killed, makes `Vite::isRunningHot()` true.
  Inertia then posts pages to the Vite hot endpoint instead of the SSR port, nothing answers, and
  **every public page silently degrades to CSR while looking perfectly healthy**. Delete the file.

### No content fixture

There is no sample content and no stock photography. `php artisan db:seed` creates accounts
(`DatabaseSeeder`), jurusan and ekstrakurikuler (`SchoolContentSeeder`), the identity record
(`SchoolIdentitySeeder`), and the site settings (`SettingsSeeder`) — nothing else. Berita, media,
heroes, gallery albums, and spektrum kurikulum are CMS content the school enters itself, so an empty
database is the normal starting state rather than a broken one.

**Every seeder is insert-if-absent, and it has to stay that way.** `deploy/release.sh` runs
`db:seed --force` on every release, so a seeder that wrote unconditionally would erase the school's
CMS edits each time a release went out. The one exception is `DatabaseSeeder::account()`, which does
reset the password — but only outside `APP_ENV=production`, because the browser suite logs in with
the constants in that file.

The browser suite adapts instead of relying on a fixture: `firstBeritaPath()` and
`hasPublishedMedia()` in `tests/e2e/routes.ts` probe raw HTML, and the specs that assert on content
call `test.skip()` when the database has none. The Core Web Vitals project therefore reports as
skipped on CI — `FR6-16` is checked by hand with Lighthouse against a database that has content.

## Locked product decisions

From the brief in `prd-00-index.md`; do not re-litigate these without being asked:

- Two roles, **Superadmin** and **Editor**. Enforcement is server-side (middleware/policy) —
  hiding UI is not sufficient; an Editor hitting a Superadmin route must receive 403 (`FR5-2`,
  `FR5-15a`). Editors may publish directly.
- CMS-managed: Hero, Berita/Pengumuman, Jurusan, Visi Misi, Identitas Sekolah, Spektrum
  Kurikulum, Gallery, Ekstrakurikuler. Only Kontak's copy is still fixed in code — its address,
  phone, email, and map all come from the CMS.
- **The hero is a carousel, not a single slide.** The `FR5-13` / `FR7-6` rule that only one hero
  may be active was retired on the school's explicit instruction. Up to `Hero::MAX_ACTIVE` (3)
  heroes may be active at once; they render in `sort_order`. The cap is a performance budget for
  the LCP screen and is enforced by `App\Rules\MaxActiveHeroes`, not by the schema.
- Each hero may be linked to one `Post`; the slide then shows a "Lihat selengkapnya" button.
  Note `Post` uses `SoftDeletes`, so the `nullOnDelete` foreign key does **not** fire when a berita
  is deleted from the CMS — `Hero::postUrl()` is the only thing preventing a link to withdrawn
  content.
- Bilingual ID/EN for UI labels only; content stays Indonesian.
- Mobile-first (~80% mobile traffic). Targets: LCP < 2.5s, CLS < 0.1, Lighthouse mobile ≥ 90.
- **The `prd-03` design system has been superseded** — see "Design systems" below. Its palette
  (`--green` / `--lime-moss`), its typefaces (Fraunces / Plus Jakarta Sans), and its §7 self-audit
  no longer apply.
- **Deployment runs only on explicit instruction from the school** (`FR8-4`). Never run the release
  sequence (`git pull` → build SSR → `migrate --force` → caches → restart SSR, `FR8-13`)
  proactively. Infrastructure — VPS, CloudPanel, DNS, SSL — is the school's responsibility.
  The pipeline lives in `.github/workflows/deploy.yml` and `deploy/release.sh`, documented in
  `docs/deployment.md`. It is `workflow_dispatch`-only and gated behind the `production` GitHub
  Environment, so FR8-15 still holds: a release happens when someone clicks and approves it, and
  never from a push. `release.sh` is piped to the VPS over stdin rather than kept on the server.
- **On the server, `php` on PATH is the wrong interpreter.** CloudPanel installs several PHP
  versions side by side and assigns one *per site*, while `/usr/bin/php` stays the system-wide
  `update-alternatives` symlink. `release.sh` reads the site's version from its PHP-FPM pool
  (`/etc/php/*/fpm/pool.d/<site-user>.conf`), refuses to run below 8.3, and puts the resolved binary
  first on `PATH` — without that last part the Composer phar and its `@php artisan package:discover`
  script would still run on the system one. `deploy/supervisor/*.conf` pin the version explicitly
  for the same reason.
- **`release.sh` prunes the server checkout** via `git sparse-checkout`: `.claude/`, `.codegraph/`,
  `.github/`, `deploy/`, and `CLAUDE.md` never land in the worktree. Sparse-checkout rather than
  `rm -rf` so `git status` stays clean; the objects remain, so `git show HEAD:deploy/…` still reads
  an excluded file during server setup.

## Claude Code automation in this repo

- **`.mcp.json`** registers Laravel Boost (`php artisan boost:mcp`) — schema introspection,
  `tinker`, and version-accurate Laravel/Inertia doc search against the running app.
- **Hooks** (`.claude/hooks/`, wired in `.claude/settings.json`):
  - `guard-write.php` blocks writes to generated/secret files — the Wayfinder output dirs, `.env`,
    lock files, `public/build/`, `bootstrap/ssr/`.
  - `guard-deploy.php` blocks the `FR8-13` release sequence and destructive migrations.
  - `format.php` runs Pint or Prettier + ESLint on each edited file, since `ci:check` gates on them.
- **Skills**: `/story <ID>` works a PRD requirement end to end against its acceptance checkboxes;
  `/inertia-page` scaffolds route + controller + page + test with the component name threaded
  through all four.
- **Agents**: `authz-reviewer` (server-side role enforcement, `FR5-2`), `design-audit` — the latter
  audits against the retired `prd-03 §7` rules and is therefore stale.

## Design systems

Two of them, deliberately, namespaced apart in `resources/css/app.css`:

- **Public site → the AstroWind template** (`github.com/arthelokyo/astrowind`). The palette is the
  `--aw-*` custom properties, surfaced as `aw-`-prefixed Tailwind colours (`bg-aw-primary`,
  `text-aw-muted`), plus the `btn` / `btn-primary` / `btn-secondary` / `btn-tertiary` utilities and
  the `bg-page` / `bg-dark` / `text-page` surfaces. Typeface is Inter (`font-aw`, `font-heading`).
  The Astro widgets are ported to React under `resources/js/components/public/`: `hero`,
  `hero-text`, `features`, `stats`, `content`, `steps` / `timeline`, `call-to-action`,
  `widget-wrapper`, `headline`, `header`, `footer`. Long-form CMS copy renders through
  `@tailwindcss/typography` (`prose`), not a bespoke class.
- **Admin + auth → the Laravel React starter kit** (`github.com/laravel/react-starter-kit`), i.e.
  stock shadcn/ui: the `--background` / `--primary` / `--sidebar` oklch tokens, Instrument Sans, and
  the collapsible sidebar shell (`app-shell` → `app-sidebar` → `app-content`). Everything in
  `resources/js/components/ui/` is a verbatim starter-kit copy — restyle by composing those, not by
  editing them.

AstroWind's `primary` / `secondary` / `accent` / `muted` would collide with shadcn's, which mean
something else entirely; that is why the public palette carries the `aw-` prefix.
`tests/Feature/FoundationTest.php` pins both systems so an edit to one cannot quietly drop the other.

Dark mode is class-driven (`.dark` on `<html>`) and shared by both areas:
`resources/js/hooks/use-appearance.tsx` writes an `appearance` cookie plus localStorage,
`HandleAppearance` republishes it to `app.blade.php`, and an inline script resolves `system` before
first paint. The public toggle is `components/public/toggle-theme.tsx`; the admin one lives in the
sidebar user menu. Both cookies (`appearance`, `sidebar_state`) are exempt from encryption because
the browser reads them.

`resources/js/ssr.tsx` must wrap the app in `TooltipProvider` exactly as `app.tsx` does — the
sidebar renders Radix tooltips, and those throw during server rendering without it.

## Known gaps in the current scaffold

- `.npmrc` sets `ignore-scripts=true`; packages needing postinstall steps won't run them. This
  bites Playwright specifically — its browser download is a postinstall, so
  `npx playwright install chromium firefox webkit` has to be run by hand after `npm install`.
- The three `playwright-test-*` agents in `.claude/agents/` call an `mcp__playwright-test__*` server
  that is not configured anywhere, so they fail on first use. The suite in `tests/e2e/` does not use
  them and does not need them — the agents are simply dead weight.
