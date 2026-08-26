import { expect, test } from '@playwright/test';

import { publicRoutes } from '../routes';

/**
 * Mobile-first checks (prd-01: ~80% of traffic is mobile).
 *
 * Horizontal overflow is the single most common responsive defect and the one
 * screenshots hide — the page looks fine until a fixed-width child pushes the
 * viewport sideways. Measuring scrollWidth catches it deterministically.
 */

const VIEWPORTS = [
    { name: 'ponsel 360px', width: 360, height: 780 },
    { name: 'tablet 768px', width: 768, height: 1024 },
    { name: 'desktop 1280px', width: 1280, height: 900 },
];

test.describe('tidak ada overflow horizontal', () => {
    for (const viewport of VIEWPORTS) {
        for (const route of publicRoutes) {
            test(`${route.name} @ ${viewport.name}`, async ({ page }) => {
                await page.setViewportSize({
                    width: viewport.width,
                    height: viewport.height,
                });
                await page.goto(route.path);
                await expect(page.locator('h1')).toHaveCount(1);

                const overflow = await page.evaluate(() => {
                    const doc = document.documentElement;

                    return {
                        scrollWidth: doc.scrollWidth,
                        clientWidth: doc.clientWidth,
                    };
                });

                // 1px of slack absorbs sub-pixel rounding, which is real and
                // differs between engines.
                expect(
                    overflow.scrollWidth,
                    `${route.path} meluber di ${viewport.width}px`,
                ).toBeLessThanOrEqual(overflow.clientWidth + 1);
            });
        }
    }
});

/**
 * Everything in here drives the page with `tap()`, never `click()`.
 *
 * Playwright's `click()` dispatches real mouse events even in a context with
 * `hasTouch` — a Pixel 5 page clicked this way reports `pointerType: 'mouse'`
 * just as a desktop one does. That matters because the header opens a dropdown
 * on hover for mouse users only, so a `click()` here walks the hover path and
 * then the click path in one gesture: not a journey any phone user can make,
 * and the two handlers race. `tap()` produces genuine `pointerType: 'touch'`,
 * which is the input this block exists to cover.
 *
 * Every project this block runs on has `hasTouch: true` — the skip below leaves
 * only Pixel 5 and iPhone 12 — which `tap()` requires.
 */
test.describe('navigasi mobile', () => {
    test.skip(
        ({ viewport }) => (viewport?.width ?? 0) >= 1024,
        'Menu toggle hanya tampil pada layar sempit.',
    );

    test('menu dapat dibuka dan menautkan ke halaman lain', async ({
        page,
    }) => {
        await page.goto('/');

        const toggle = page
            .getByRole('button', { name: /menu|navigasi|toggle/i })
            .first();

        await expect(toggle).toBeVisible();
        await toggle.tap();

        const nav = page.getByRole('navigation', { name: /navigasi utama/i });

        // Jurusan sits inside the "Halaman" dropdown, so reaching it on a phone
        // takes two taps. Scoping to the nav matters: the hero has its own
        // "Lihat Jurusan" button, and the open menu covers the whole screen —
        // an unscoped locator finds that button and clicks the overlay instead.
        const halaman = nav.getByRole('button', { name: /^halaman$/i });

        await expect(halaman).toBeVisible();
        await halaman.tap();

        const jurusanLink = nav.getByRole('link', { name: /^jurusan$/i });

        await expect(jurusanLink).toBeVisible();
        await jurusanLink.tap();

        // Inertia visit, not a document navigation — see smoke.spec.ts.
        await page.waitForURL(/\/jurusan/, { waitUntil: 'commit' });
        await expect(page.locator('h1')).toHaveCount(1);
    });

    test('dropdown tetap terbuka saat diketuk, bukan tertutup lagi', async ({
        page,
    }) => {
        // A tap fires pointerenter before click. Without the pointerType guard
        // in the header, the hover handler opened the dropdown and the click
        // that followed closed it again — unusable on any touch device. The
        // guard is what this asserts: one tap, and the dropdown stays open.
        await page.goto('/');

        await page
            .getByRole('button', { name: /menu|navigasi|toggle/i })
            .first()
            .tap();

        const nav = page.getByRole('navigation', { name: /navigasi utama/i });
        const profil = nav.getByRole('button', { name: /^profil$/i });

        await profil.tap();

        await expect(profil).toHaveAttribute('aria-expanded', 'true');
        await expect(
            nav.getByRole('link', { name: /visi misi/i }),
        ).toBeVisible();
    });
});

test.describe('tema gelap', () => {
    test('toggle mengubah kelas dan bertahan setelah reload', async ({
        page,
        viewport,
    }) => {
        await page.goto('/');

        const before = await page.evaluate(() =>
            document.documentElement.classList.contains('dark'),
        );

        // Below the md breakpoint the toggle sits inside the collapsed menu
        // (`hidden md:flex` in header.tsx), so it has to be opened first.
        if ((viewport?.width ?? 0) < 768) {
            await page
                .getByRole('button', { name: /menu|navigasi|toggle/i })
                .first()
                .click();
        }

        const toggle = page
            .getByRole('button', { name: /mode gelap|mode terang/i })
            .first();

        await expect(toggle).toBeVisible();
        await toggle.click();

        await expect
            .poll(() =>
                page.evaluate(() =>
                    document.documentElement.classList.contains('dark'),
                ),
            )
            .toBe(!before);

        // The choice is stored in a cookie that HandleAppearance replays into
        // the blade template, so it must survive a full document load — not
        // just a client-side re-render.
        //
        // `domcontentloaded` is the honest wait here: the class under test is
        // printed on <html> by the server and the inline resolver in
        // app.blade.php runs in <head>, so both are settled long before the
        // bundle, the fonts and the hero image finish. Waiting for `load`
        // measured the asset queue, not the cookie.
        await page.reload({ waitUntil: 'domcontentloaded' });

        const afterReload = await page.evaluate(() =>
            document.documentElement.classList.contains('dark'),
        );

        expect(afterReload).toBe(!before);
    });
});
