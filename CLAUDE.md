# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Web portal for SMK PGRI Telagasari (`smkpgritelagasari.sch.id`) — a public school site plus an
admin CMS. The repository is currently the unmodified Laravel React starter kit: the domain
application (public pages, CMS, data model) has not been built yet.

The full specification lives in `prd/` (8 numbered Indonesian-language documents, `prd-00-index.md`
first). **`prd/` is gitignored** — it exists locally only, so it will not appear in diffs or on a
fresh clone. Requirements are numbered (`FR5-2`, `US-018`, …) and each user story carries a
checkbox acceptance list; treat those IDs as the unit of work and verify against the checkboxes.

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
npm run build:ssr     # vite build + SSR build (no SSR entrypoint exists yet — see below)
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

## Locked product decisions

From the brief in `prd-00-index.md`; do not re-litigate these without being asked:

- Two roles, **Superadmin** and **Editor**. Enforcement is server-side (middleware/policy) —
  hiding UI is not sufficient; an Editor hitting a Superadmin route must receive 403 (`FR5-2`,
  `FR5-15a`). Editors may publish directly.
- CMS-managed: Hero, Berita/Pengumuman, Jurusan. Profil and Kontak are static pages in code.
- Bilingual ID/EN for UI labels only; content stays Indonesian.
- Mobile-first (~80% mobile traffic). Targets: LCP < 2.5s, CLS < 0.1, Lighthouse mobile ≥ 90.
- Design system is locked in `prd-03`: **no purple/violet/indigo/fuchsia**, **no
  Inter/Roboto/Arial/Helvetica/system-ui**, no emoji used as icons. `prd-03 §7` is a self-audit to
  run before calling any UI work done. (The starter's current `welcome.tsx` and the Instrument Sans
  font in `vite.config.ts` predate this and will be replaced.)
- **Deployment runs only on explicit instruction from the school** (`FR8-4`). Never run the release
  sequence (`git pull` → build SSR → `migrate --force` → caches → restart SSR, `FR8-13`)
  proactively. Infrastructure — VPS, CloudPanel, DNS, SSL — is the school's responsibility.

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
- **Agents**: `authz-reviewer` (server-side role enforcement, `FR5-2`), `design-audit` (`prd-03 §7`).

## Known gaps in the current scaffold

- `npm run build:ssr` is wired but there is no `resources/js/ssr.tsx` entrypoint, and SSR is a hard
  requirement (`prd-06`). It has to be created before public pages ship.
- `.npmrc` sets `ignore-scripts=true`; packages needing postinstall steps won't run them.
- The three `playwright-test-*` agents in `.claude/agents/` call an `mcp__playwright-test__*` server
  that is not configured anywhere, so they fail on first use. There is no Playwright suite either.
  Pest 4 browser testing is the stack-native path; several `prd-06` stories end with "Verify in
  browser using dev-browser skill" and need something wired up.
