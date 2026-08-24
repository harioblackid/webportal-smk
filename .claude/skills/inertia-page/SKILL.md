---
name: inertia-page
description: Scaffold a complete Inertia vertical slice — route, controller, React page component, and Pest feature test — with the component name threaded correctly through all four.
disable-model-invocation: true
---

# Scaffold an Inertia page

There is no `resolve` callback in `resources/js/app.tsx`. `resources/views/app.blade.php`
`@vite`s the page component directly by name, so the string in `Inertia::render()`
maps to `resources/js/pages/{name}.tsx` **by convention alone**. A typo surfaces as a
Vite resolution error at request time, not a JS error — and not at all until someone
loads the page.

This skill exists to make that name impossible to get wrong: generate all four files
together, from one name.

## Input

Ask for these if not given:

1. **Component name** — `Public/Home`, `Admin/Berita/Index`. PascalCase segments.
2. **URL path** — `/`, `/berita/{berita:slug}`, `/admin/berita`.
3. **Area** — public or admin. This decides SSR, indexing, and middleware.

## What to generate

### 1. Route — `routes/web.php`

Public routes are plain. Admin routes go inside the auth + role middleware group;
an Editor hitting a Superadmin route must receive 403 (`FR5-2`, `FR5-15a`) — enforce
it in middleware or a policy, never by hiding UI.

Name the route so Wayfinder generates a usable helper.

### 2. Controller — `app/Http/Controllers/`

```php
return Inertia::render('Public/Home', [
    // props
]);
```

The first argument must match the component path exactly, including case.

Type the props. PHPStan runs at level 7 over `app/`.

### 3. Page component — `resources/js/pages/{name}.tsx`

Create the directory if needed. Prettier config is strict — 4-space indent, single
quotes, semicolons, 80 columns, Tailwind class sorting. ESLint requires
`import type` as separate statements, `import/order` alphabetized by group, and a
blank line before and after every `if`/`return`/`for`/`while`/`switch`/`try`/`throw`.

Import route helpers from the generated Wayfinder output (`import { home } from '@/routes'`).
Never hand-edit `resources/js/actions/`, `routes/`, or `wayfinder/` — they are
regenerated on every build and a write hook will block you.

For **admin** pages, emit `noindex` (`prd-02`). For **public** pages, the page must
server-render for SEO — note in your report if `resources/js/ssr.tsx` still does not
exist, because `npm run build:ssr` is wired but has no entrypoint yet.

Design system is locked in `prd-03`: no purple/violet/indigo/fuchsia, no
Inter/Roboto/Arial/Helvetica/system-ui, no emoji as icons. Mobile-first — roughly
80% of traffic is mobile.

### 4. Feature test — `tests/Feature/`

Pest 4. Assert the route responds, that it renders the expected component, and — for
admin routes — that an unauthenticated user is redirected and an Editor hitting a
Superadmin route gets 403.

`RefreshDatabase` is present but commented out in `tests/Pest.php`; uncomment it
there once migrations matter.

## Finish

Run `php artisan test --filter=<your test>` and then `composer test` for the full
gate. Confirm in your report that the `Inertia::render()` string and the file path
under `resources/js/pages/` match character for character.
