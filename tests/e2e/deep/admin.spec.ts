import { expect, test } from '@playwright/test';

import { adminRoutes, storageState, superadminRoutes } from '../routes';

/**
 * CMS flows and, more importantly, the FR5-2 role split.
 *
 * Hiding a button is not authorization. The Editor block below asserts a real
 * 403 status from the server, which is the only thing that actually stops a
 * determined Editor from typing the URL.
 */

test.describe('superadmin', () => {
    test.use({ storageState: storageState.superadmin });

    for (const route of [...adminRoutes, ...superadminRoutes]) {
        test(`membuka ${route.name} (${route.path})`, async ({ page }) => {
            const errors: string[] = [];

            page.on('pageerror', (error) => errors.push(error.message));

            const response = await page.goto(route.path);

            expect(response?.status()).toBe(200);
            await expect(page.locator('h1, h2').first()).toBeVisible();
            expect(errors, 'uncaught JavaScript errors').toEqual([]);
        });
    }

    test('mencari berita mempersempit daftar', async ({ page }) => {
        await page.goto('/admin/posts');

        // The search term is taken from a row that actually exists rather than
        // hard-coded: berita are CMS content, so there is no title this test
        // can count on being present. ConfirmDelete labels every row
        // `Hapus <judul>`, which is the one place the title is machine-readable.
        const firstRow = page.getByRole('button', { name: /^Hapus / }).first();

        test.skip(
            (await firstRow.count()) === 0,
            'belum ada berita di database',
        );

        const label = (await firstRow.getAttribute('aria-label')) ?? '';
        // One word, so the query cannot be defeated by pagination or by a
        // title long enough to be truncated in the cell.
        const term = label.replace(/^Hapus\s+/, '').split(/\s+/)[0];

        const search = page.getByPlaceholder(/mis\./i).first();

        await expect(search).toBeVisible();
        await search.fill(term);
        await search.press('Enter');

        await page.waitForURL(new RegExp(`q=${encodeURIComponent(term)}`, 'i'));
        await expect(page.locator('body')).toContainText(term);
    });

    test('membuat berita baru lewat form', async ({ page }) => {
        // Timestamped because Post uses SoftDeletes: the row this test deletes
        // at the end keeps its slug in the table forever, so a fixed title
        // would collide with itself on the second run.
        const title = `Uji Otomatis ${Date.now()}`;

        await page.goto('/admin/posts/create');

        // Not just `getByLabel('Judul')`: the TipTap toolbar has "Judul bagian"
        // and "Sub judul" buttons that match a loose name.
        await page.getByLabel('Judul', { exact: true }).fill(title);
        await page
            .getByLabel('Ringkasan')
            .fill('Ringkasan dari pengujian otomatis Playwright.');

        // The body is a TipTap editor, not a textarea — it has to be typed into
        // as a contenteditable or the form submits with an empty body.
        const editor = page.locator('[contenteditable="true"]').first();

        await expect(editor).toBeVisible();
        await editor.click();
        await editor.fill('Isi berita yang ditulis oleh pengujian otomatis.');

        await page.getByRole('button', { name: 'Simpan' }).click();

        await page.waitForURL(/\/admin\/posts(\?|$)/);

        const row = page.getByRole('button', { name: `Hapus ${title}` });

        await expect(row).toBeVisible();

        // Delete it again. This runs against the developer's real database, so
        // a test that only creates would silently pile up rows on every run —
        // and it gets the FR5-11 confirm-dialog flow covered for free.
        await row.click();
        await page.getByRole('button', { name: 'Ya, hapus' }).click();

        /*
         * Generous timeout on purpose. This is a round trip through a
         * single-threaded `php artisan serve` that the rest of the matrix is
         * also hammering, so the default 5s expires on queueing rather than on
         * anything being wrong.
         *
         * Asserted on the row, not on body text: the success flash quotes the
         * title back, so the page legitimately still mentions it.
         */
        await expect(row).toHaveCount(0, { timeout: 20_000 });
    });

    test('media picker menampilkan pustaka gambar', async ({ page }) => {
        await page.goto('/admin/media');

        // Media are uploads, not seeded data, so an empty library is the normal
        // state of a fresh install rather than a fault.
        //
        // Detected by the page's own empty-state copy, and asserted inside
        // <main>: a bare `img` locator also matches the sidebar avatar, so it
        // would report a healthy library on a database holding no media at all.
        const empty = page.getByText('Belum ada gambar di pustaka.');

        test.skip(await empty.isVisible(), 'pustaka media masih kosong');

        const images = page.getByRole('main').locator('ul img');

        await expect(images.first()).toBeVisible();
        expect(await images.count()).toBeGreaterThan(0);
    });
});

test.describe('editor', () => {
    test.use({ storageState: storageState.editor });

    for (const route of adminRoutes) {
        test(`boleh membuka ${route.name}`, async ({ page }) => {
            const response = await page.goto(route.path);

            expect(response?.status()).toBe(200);
        });
    }

    for (const route of superadminRoutes) {
        test(`ditolak 403 di ${route.name} (${route.path})`, async ({
            request,
        }) => {
            const response = await request.get(route.path, {
                maxRedirects: 0,
                failOnStatusCode: false,
            });

            // 403, not 302: a redirect would mean the route merely hid itself,
            // and FR5-15a asks for a refusal.
            expect(response.status()).toBe(403);
        });
    }
});
