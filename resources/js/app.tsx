import { createInertiaApp } from '@inertiajs/react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'SMK PGRI Telagasari';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    withApp(app) {
        return <TooltipProvider delayDuration={0}>{app}</TooltipProvider>;
    },
    progress: {
        color: '#0161ef', // --aw-color-primary
    },
});

// Applies the stored light/dark choice, and keeps "system" in sync after load.
initializeTheme();
