import { usePage } from '@inertiajs/react';
import { CheckCircle2, TriangleAlert, X } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { Flash } from '@/types';

/**
 * The toast fed by the `flash` shared prop.
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
        <Alert
            role={isError ? 'alert' : 'status'}
            variant={isError ? 'destructive' : 'default'}
        >
            <Icon />
            <AlertDescription className="pr-8">{message}</AlertDescription>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDismissed(flash)}
                aria-label="Tutup pesan"
                className="absolute top-1.5 right-1.5 size-7"
            >
                <X aria-hidden="true" />
            </Button>
        </Alert>
    );
}
