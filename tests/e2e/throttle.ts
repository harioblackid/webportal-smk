/**
 * Slow-device emulation for the `smoke-slow` project.
 *
 * A hydration mismatch is a race, not a static markup fault: the inline
 * appearance script mutates `<html>`'s class list before first paint, and React
 * then hydrates against it. On a fast machine the two never overlap and the
 * suite is green. On a throttled one they can, and React aborts the server
 * markup with a minified error #418 — which is what production threw twice
 * during the 2026-08-28 audit, under mobile emulation at 4-6x CPU slowdown,
 * and never once unthrottled.
 *
 * That is the gap this closes: smoke.spec's `pageerror` listener has always
 * been able to see #418, but CI never reproduced the conditions that trigger
 * it. ~80% of this site's traffic is mobile (prd-01), so the throttled run is
 * closer to the median visitor than the unthrottled one.
 *
 * Chromium only — `Emulation.setCPUThrottlingRate` is a CDP command, and no
 * other engine exposes an equivalent.
 */

import type { Page } from '@playwright/test';

/** Chrome DevTools' "Slow 4G" preset, in the units CDP wants (bytes/second). */
const SLOW_4G = {
    offline: false,
    latency: 150,
    downloadThroughput: (1638.4 * 1024) / 8,
    uploadThroughput: (675 * 1024) / 8,
};

/**
 * 4x, matching the slower of the two rates that reproduced #418.
 *
 * Not higher: every extra factor also multiplies the time each test spends
 * waiting on `php artisan serve`, which answers one request at a time, and a
 * budget that expires is indistinguishable from the fault we are hunting.
 */
const CPU_SLOWDOWN = 4;

export async function throttle(page: Page): Promise<void> {
    const client = await page.context().newCDPSession(page);

    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', SLOW_4G);
    await client.send('Emulation.setCPUThrottlingRate', { rate: CPU_SLOWDOWN });
}
