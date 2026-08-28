import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

/*
 * 8123, not 8000. The suite starts its own server now (see `reuseExistingServer`
 * below), so it must not land on the port `composer dev` already holds.
 */
const PORT = Number(process.env.E2E_PORT ?? 8123);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const SSR_PORT = 13714;

/*
 * Handed to both servers below rather than read from .env, because Laravel loads
 * its .env immutably — a variable already present in the process wins.
 *
 * APP_URL, because `url()` / `asset()` / `Storage::url()` build absolute URLs
 * from it. Left at the .env value, every image on the page carries a different
 * origin than `baseURL`, and smoke.spec's `isSameOrigin()` filter then discards
 * every image failure as somebody else's problem — the assertion is alive again
 * only when the two agree.
 *
 * DB_DATABASE, so a local run cannot write to `laravel_portal`: admin.spec
 * creates a Post and deletes it, and `Post` soft-deletes, so the row stays in
 * the developer's real table forever. CI already points DB_DATABASE at
 * `laravel_portal_test` from the workflow, so it is left alone there.
 */
const serverEnv: Record<string, string> = { APP_URL: BASE_URL };

if (!isCI) {
    serverEnv.DB_DATABASE = process.env.E2E_DB ?? 'laravel_portal_e2e';
}

/**
 * Two layers of coverage, because the full matrix does not pay for itself.
 *
 * `cross/` runs on one project per rendering engine — Blink, Gecko, WebKit —
 * plus a touch device. It is looking for rendering and hydration faults, which
 * are exactly the things that differ between engines; a second project on an
 * engine already covered cannot fail without the first one failing too.
 *
 * `deep/` runs on Chromium only: admin CRUD, the rich-text editor and the
 * performance probes are not engine-specific, and running them three more times
 * would multiply the suite's runtime without testing anything new. The
 * performance APIs are Chromium-only anyway.
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    /*
     * Capped deliberately. `php artisan serve` is PHP's built-in server, which
     * serves ONE request at a time (PHP_CLI_SERVER_WORKERS is Unix-only, and
     * this project develops on Windows). Left unbounded, the browser projects
     * saturate it and tests fail on queued-request timeouts that look exactly
     * like real UI faults — the worst kind of flake to debug.
     *
     * Two, not four. A warm document costs ~1.3s of exclusive server time on
     * this stack — CLI opcache is off, so every request re-parses the framework
     * (`/robots.txt`, which touches no SSR and no database, measures the same),
     * against ~7ms for a static asset. That puts the ceiling near one page load
     * per second no matter how many browsers ask, so extra workers buy no
     * throughput and only multiply each navigation's queueing delay: at four,
     * a single `goto('/')` was taking 13-28s of a 30s test budget.
     */
    workers: 2,

    /*
     * Triple the default. The budget has to cover a whole test, and the tests
     * that walk two full document loads (toggle a theme, then reload to prove
     * the cookie survived) pay the ~1.3s-per-document tax twice over, queued
     * behind the other worker. 30s left no margin for a slow moment; 90s is
     * still short enough that a genuinely hung page fails rather than hangs.
     */
    timeout: 90_000,

    expect: { timeout: 15_000 },
    reporter: isCI
        ? [['github'], ['html', { open: 'never' }]]
        : [['list'], ['html', { open: 'never' }]],

    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'off',
        /*
         * Explicit, because the useful failure message is "this navigation was
         * slow" rather than "the test ran out of time" — an unset navigation
         * timeout inherits the test budget, so a queued `goto` swallows it whole
         * and the error points at whatever step happened to be running when the
         * clock expired, several lines further down.
         */
        navigationTimeout: 45_000,
        actionTimeout: 15_000,
        // The site is Indonesian; a browser advertising en-US can change how
        // dates and number formatting render.
        locale: 'id-ID',
        timezoneId: 'Asia/Jakarta',
    },

    projects: [
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
        },

        /*
         * seo.spec.ts asserts on raw HTML through the `request` fixture and never
         * opens a page, so it gets a project of its own with no device at all.
         *
         * That is not tidiness — it is the reason this project can run with zero
         * browsers installed, which is what lets the CI job skip
         * `playwright install` entirely. Verified by pointing
         * PLAYWRIGHT_BROWSERS_PATH at an empty directory: 25 passed.
         *
         * It also stops the same 25 byte-identical assertions being repeated once
         * per engine, which is what the `cross/.*` glob used to do.
         */
        {
            name: 'seo',
            testMatch: /cross\/seo\.spec\.ts/,
        },

        // Cross-browser layer — desktop.
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /cross\/(smoke|responsive)\.spec\.ts/,
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testMatch: /cross\/(smoke|responsive)\.spec\.ts/,
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            testMatch: /cross\/(smoke|responsive)\.spec\.ts/,
        },
        /*
         * There is no `edge` project, and no `mobile-chrome` one. Both are
         * Blink, the engine `chromium` already covers — `channel: 'msedge'`
         * tests a differently branded build of the same renderer, not a
         * different renderer. Between them they were 98 tests that could not
         * fail without `chromium` failing too.
         *
         * Pixel 5 looked like it earned its place on a site that is ~80% mobile
         * (prd-01), but the two things that actually differ on a phone are the
         * viewport and the input, and neither was exclusive to it:
         * responsive.spec calls `setViewportSize()` itself, which overrides the
         * device and made Pixel 5 measure the same 1280px column as the desktop
         * projects, while the touch path is covered by mobile-safari below.
         */

        // Cross-browser layer — mobile. ~80% of this site's traffic is mobile
        // (prd-01), so this is not an afterthought: it is the only project with
        // `hasTouch`, and therefore the only one where `tap()` works at all.
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 12'] },
            testMatch: /cross\/(smoke|responsive)\.spec\.ts/,
        },

        /*
         * The same smoke.spec, on a Chromium throttled to 4x CPU slowdown and
         * Slow 4G (see tests/e2e/throttle.ts).
         *
         * This is not a duplicate Blink project of the kind the Edge and
         * Pixel 5 removals above got rid of. Those ran the same assertions
         * under the same conditions as `chromium` and so could not fail
         * independently. This one changes the condition, and that condition is
         * the only one under which a hydration race shows up at all: production
         * threw React #418 twice under mobile emulation at 4-6x slowdown during
         * the 2026-08-28 audit, and never once at full speed.
         *
         * A mobile device profile, unlike the removed Pixel 5, is meaningful
         * here: smoke.spec never calls `setViewportSize()`, so the device's
         * viewport survives — it was responsive.spec that overrode it.
         *
         * Its budget is separate because throttling multiplies every wait, and
         * a test that runs out of time looks exactly like the fault it hunts.
         */
        {
            name: 'smoke-slow',
            use: { ...devices['Pixel 5'] },
            testMatch: /cross\/smoke\.spec\.ts/,
            timeout: 180_000,
        },

        // Deep layer — Chromium only.
        {
            name: 'admin',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /deep\/admin\.spec\.ts/,
            dependencies: ['setup'],
        },

        /*
         * Separate project because Core Web Vitals are a measurement, not an
         * assertion about markup: run alongside the other browsers they report
         * the machine's load rather than the page's speed. `npm run
         * test:e2e:perf` runs this one alone.
         */
        {
            name: 'perf',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /deep\/perf\.spec\.ts/,
        },
    ],

    /**
     * Both processes matter: without the SSR server the public pages quietly
     * fall back to client rendering, and seo.spec.ts is written to fail loudly
     * when that happens rather than let FR6-1 rot unnoticed.
     *
     * `reuseExistingServer` is false everywhere, deliberately. Reusing whatever
     * happens to be listening was the single largest source of runs that
     * disagreed with each other: with `composer dev` up, the suite tested the
     * Vite dev bundle — React in development mode, which emits console.error for
     * hydration mismatches that smoke.spec then reports as a failure — while CI
     * tested the production build. Starting our own processes costs a few
     * seconds and buys back the guarantee that the thing under test is the thing
     * that ships.
     */
    webServer: [
        {
            command: 'php artisan inertia:start-ssr',
            port: SSR_PORT,
            reuseExistingServer: false,
            timeout: 60_000,
            stdout: 'pipe',
            stderr: 'pipe',
            env: serverEnv,
        },
        {
            command: `php artisan serve --port=${PORT}`,
            port: PORT,
            reuseExistingServer: false,
            timeout: 60_000,
            env: serverEnv,
        },
    ],
});
