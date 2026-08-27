/**
 * Removes a stale `public/hot` before the browser suite runs.
 *
 * `npm run dev` writes that file and deletes it on a clean exit — but a killed
 * terminal leaves it behind, and it is the highest-consequence piece of litter
 * in this repo. While it exists `Vite::isRunningHot()` is true, so Inertia posts
 * every page to the Vite hot endpoint instead of the SSR port. With nothing
 * listening there, the public pages degrade to client-side rendering *silently*:
 * they look perfectly healthy in a browser, and only seo.spec — which reads the
 * raw HTML a crawler would get — can tell the difference.
 *
 * Deleting it is safe. A dev server that is genuinely running rewrites the file
 * on its next request; one that is not should never have left it there.
 */

import { rmSync } from 'node:fs';

rmSync('public/hot', { force: true });
