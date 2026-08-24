---
name: story
description: Work a PRD requirement by its ID (FR5-2, US-018). Loads the requirement from prd/, extracts its acceptance checkboxes and cross-references, implements against them, and verifies every checkbox before reporting done. Use whenever the user names a requirement ID or asks to implement a story from the PRD.
---

# Work a PRD requirement

`prd/` holds eight Indonesian-language documents and is **gitignored** — it exists
locally only. Requirement IDs are the unit of work, and each user story carries a
checkbox acceptance list that decides whether the work is finished.

## 1. Load the requirement

```bash
php .claude/skills/story/find-req.php US-018
```

This prints the requirement's own block, a count of its acceptance checkboxes, and
every cross-reference to it elsewhere in `prd/`. Do not grep `prd/` by hand — the
script resolves `FR5-1` vs `FR5-15a` correctly and finds the definition rather than
the first mention.

If the ID does not resolve, read `prd/prd-00-index.md` to find the right one rather
than guessing.

## 2. Pull in what it depends on

- A **user story** (`US-###`) is the implementable unit. Its acceptance checkboxes
  are the spec.
- A **functional requirement** (`FR#-#`) is a constraint. If the user names an FR,
  run the script on it, then find the user stories that implement it and work those.
- Follow every cross-reference the script reports — requirements routinely constrain
  each other across documents (`prd-03` design rules apply to `prd-04` pages,
  `prd-07` data model constrains `prd-05` CMS).
- Read the relevant document's own section if the block alone is ambiguous. The
  documents are Indonesian; the acceptance criteria are the authority, not your
  paraphrase of them.

## 3. Implement

Follow `CLAUDE.md` for stack conventions. Points that trip up this codebase
specifically:

- `Inertia::render('Public/Home')` resolves to `resources/js/pages/Public/Home.tsx`
  by convention alone — there is no `resolve` callback. A typo is a Vite resolution
  error, not a JS error.
- Role enforcement is server-side (middleware/policy). Hiding UI is never sufficient
  (`FR5-2`, `FR5-15a`).
- `/admin/*` must be `noindex`; public pages must be server-rendered for SEO
  (`prd-02`).
- Design system is locked in `prd-03`: no purple/violet/indigo/fuchsia, no
  Inter/Roboto/Arial/Helvetica/system-ui, no emoji as icons.
- Dev DB is SQLite, production is MySQL 8 — avoid SQLite-only migration idioms.

## 4. Verify every checkbox

Go through the acceptance list one item at a time and state, per checkbox, what
proves it. A checkbox is satisfied by a passing test, a route returning the right
status, or an observed page — never by "the code looks right".

- Write Pest feature tests for behaviour the checkboxes describe. `RefreshDatabase`
  is commented out in `tests/Pest.php` — uncomment it once migrations matter.
- Several stories end with "Verify in browser using dev-browser skill". That means
  actually loading the page, not asserting on markup.
- If the story touches UI, run the `prd-03 §7` self-audit before calling it done
  (the `design-audit` agent does this).

Run `composer test` before reporting. CI runs `composer ci:check`, which also
includes eslint, prettier, and tsc — formatting failures break the build the same
as test failures.

## 5. Report

List each acceptance checkbox with its verification result. Say plainly which ones
you could not verify and why — an unverified checkbox is not a done checkbox.
