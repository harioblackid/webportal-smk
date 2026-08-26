import { Moon, Sun } from 'lucide-react';

import { useAppearance } from '@/hooks/use-appearance';

/** AstroWind's common/ToggleTheme, driven by the shared appearance store. */
export default function ToggleTheme() {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const next = resolvedAppearance === 'dark' ? 'light' : 'dark';

    return (
        <button
            type="button"
            onClick={() => updateAppearance(next)}
            className="inline-flex items-center rounded-lg p-2.5 text-sm text-aw-muted hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
        >
            {resolvedAppearance === 'dark' ? (
                <Sun className="size-6 md:size-5" aria-hidden="true" />
            ) : (
                <Moon className="size-6 md:size-5" aria-hidden="true" />
            )}

            <span className="sr-only">
                {next === 'dark'
                    ? 'Aktifkan mode gelap'
                    : 'Aktifkan mode terang'}
            </span>
        </button>
    );
}
