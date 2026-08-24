import { usePage } from '@inertiajs/react';
import { CheckCircle2, TriangleAlert, X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { Flash } from '@/types';

/**
 * The toast from prd-05 §5, fed by the `flash` shared prop.
 *
 * Rendered in the admin layout so every redirect-with-message lands somewhere,
 * and announced through a live region — a save that only changes colour is
 * invisible to a screen reader.
 */
export default function FlashToast() {
    const { flash } = usePage().props;
    // Dismissal is remembered by identity rather than by text: each visit
    // deserialises a fresh object, so saving the same thing twice still gets
    // two toasts.
    const [dismissed, setDismissed] = useState<Flash | null>(null);

    const message = flash.success ?? flash.error;
    const isError = flash.error !== null;

    if (message === null || dismissed === flash) {
        return null;
    }

    const Icon = isError ? TriangleAlert : CheckCircle2;

    return (
        <div
            role={isError ? 'alert' : 'status'}
            className={cn(
                'mb-6 flex items-start gap-3 rounded-xl border-l-4 p-4 text-sm',
                isError
                    ? 'border-red-600 bg-red-50 text-red-900'
                    : 'border-brand bg-mist text-onyx',
            )}
        >
            <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <p className="flex-1">{message}</p>

            <button
                type="button"
                onClick={() => setDismissed(flash)}
                aria-label="Tutup pesan"
                className="-m-2 inline-flex size-11 items-center justify-center rounded-lg hover:bg-black/5"
            >
                <X className="size-4" aria-hidden="true" />
            </button>
        </div>
    );
}
