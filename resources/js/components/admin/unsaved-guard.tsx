import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import Modal from '@/components/admin/modal';
import { Button } from '@/components/ui/button';

type UnsavedGuardProps = {
    /** True while the form holds changes that were never submitted. */
    dirty: boolean;
};

type PendingVisit = {
    url: URL | string;
    replace: boolean;
    preserveScroll: boolean;
    preserveState: boolean;
};

/**
 * Warns before a form with unsaved changes is abandoned.
 *
 * Two exits have to be covered and they need different mechanisms: a click on
 * another menu item is an Inertia visit, cancelled by returning false from the
 * `before` event; a reload or a closed tab is the browser's, and only
 * `beforeunload` sees it.
 *
 * Only GET visits are intercepted. The form's own submit is a PUT through the
 * same router, and a guard that blocked it would make saving impossible.
 */
export default function UnsavedGuard({ dirty }: UnsavedGuardProps) {
    const [pending, setPending] = useState<PendingVisit | null>(null);
    const leaving = useRef(false);

    useEffect(() => {
        return router.on('before', (event) => {
            const visit = event.detail.visit;

            if (!dirty || leaving.current || visit.method !== 'get') {
                return;
            }

            setPending({
                url: visit.url,
                replace: visit.replace,
                preserveScroll: visit.preserveScroll === true,
                preserveState: visit.preserveState === true,
            });

            return false;
        });
    }, [dirty]);

    useEffect(() => {
        if (!dirty) {
            return;
        }

        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };

        window.addEventListener('beforeunload', warn);

        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    function leave() {
        if (pending === null) {
            return;
        }

        // The guard has to stand down before the visit is reissued, or the
        // `before` handler cancels the very navigation it just approved.
        leaving.current = true;
        setPending(null);

        router.visit(pending.url, {
            replace: pending.replace,
            preserveScroll: pending.preserveScroll,
            preserveState: pending.preserveState,
        });
    }

    return (
        <Modal
            open={pending !== null}
            title="Perubahan belum disimpan"
            description="Ada perubahan pada halaman ini yang belum disimpan. Meninggalkan halaman sekarang akan membuangnya."
            onClose={() => setPending(null)}
        >
            <div className="flex flex-wrap justify-end gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setPending(null)}
                >
                    Batal
                </Button>

                <Button type="button" variant="destructive" onClick={leave}>
                    Tinggalkan halaman
                </Button>
            </div>
        </Modal>
    );
}
