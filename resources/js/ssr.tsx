import type { Page } from '@inertiajs/core';
import type { ResolvedComponent } from '@inertiajs/react';
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { renderToString } from 'react-dom/server';

import { TooltipProvider } from '@/components/ui/tooltip';

const appName = import.meta.env.VITE_APP_NAME || 'SMK PGRI Telagasari';

const pages = import.meta.glob<{ default: ResolvedComponent }>(
    './pages/**/*.tsx',
);

/**
 * Server-side entrypoint (FR6-1, prd-02 §2).
 *
 * The page resolver is written out explicitly rather than left to the
 * @inertiajs/vite auto-injection, because on the server there is no
 * app.blade.php `@vite` line to load the component by name.
 */
const renderPage = (page: Page) =>
    createInertiaApp({
        page,
        render: renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: async (name) => {
            const path = `./pages/${name}.tsx`;
            const importPage = pages[path];

            if (!importPage) {
                throw new Error(`Inertia page not found: ${path}`);
            }

            return (await importPage()).default;
        },
        // Mirrors withApp() in app.tsx: the admin sidebar renders Radix
        // tooltips, and those throw outside a provider — on the server too.
        setup: ({ App, props }) => (
            <TooltipProvider delayDuration={0}>
                <App {...props} />
            </TooltipProvider>
        ),
    });

// In dev, @inertiajs/vite serves this default export over /__inertia_ssr.
// In production it runs standalone, kept alive by supervisor (FR8-11).
if (import.meta.env.PROD) {
    createServer(renderPage);
}

export default renderPage;
