import { expect, test as setup } from '@playwright/test';

import { credentials, storageState } from './routes';

/**
 * Signs in once and parks the session, so the admin specs do not spend a login
 * round-trip each.
 *
 * Superadmin only. There used to be an Editor session here too, for the block in
 * admin.spec.ts that proved the FR5-2 split — an Editor genuinely authenticated
 * and still refused. That block now lives in Pest, which needs no browser and no
 * stored session, so signing in as an Editor here would write a file nothing
 * reads.
 */
setup('authenticate as superadmin', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill(credentials.superadmin.email);
    await page
        .getByLabel(/kata sandi|password/i)
        .fill(credentials.superadmin.password);
    await page.getByRole('button', { name: /masuk|login/i }).click();

    // Landing on /admin is the assertion: a failed login re-renders /login with
    // an error, which would otherwise be saved as a perfectly valid-looking
    // storage state and fail much later in a confusing place.
    await page.waitForURL(/\/admin/);
    await expect(page).toHaveURL(/\/admin/);

    await page.context().storageState({ path: storageState.superadmin });
});
