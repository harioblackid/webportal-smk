import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import Modal from '@/components/admin/modal';
import { Button } from '@/components/ui/button';

type ConfirmDeleteProps = {
    /** The DELETE endpoint, from the Wayfinder route helper. */
    url: string;
    /** Named in the dialog so nobody deletes the wrong row. */
    label: string;
    title?: string;
    /** Says what deletion actually does — soft delete where it is one. */
    description?: string;
    /** Compact for table rows, full-width for a form footer. */
    variant?: 'icon' | 'button';
};

/**
 * FR5-11 / FR5-15d — deletion always goes through a confirmation dialog.
 *
 * The request is issued here rather than by the caller so the dialog and the
 * DELETE cannot come apart: there is no way to wire up this button and forget
 * the confirmation step.
 */
export default function ConfirmDelete({
    url,
    label,
    title = 'Hapus data ini?',
    description,
    variant = 'icon',
}: ConfirmDeleteProps) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    function destroy() {
        router.delete(url, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setOpen(false);
            },
        });
    }

    return (
        <>
            {variant === 'icon' ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(true)}
                    aria-label={`Hapus ${label}`}
                    className="text-muted-foreground hover:text-destructive"
                >
                    <Trash2 aria-hidden="true" />
                </Button>
            ) : (
                <Button variant="destructive" onClick={() => setOpen(true)}>
                    <Trash2 aria-hidden="true" />
                    Hapus
                </Button>
            )}

            <Modal
                open={open}
                title={title}
                description={
                    description ??
                    `"${label}" akan dihapus dan tidak lagi tampil di situs.`
                }
                onClose={() => setOpen(false)}
            >
                <div className="flex flex-wrap justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={processing}
                    >
                        Batal
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={destroy}
                        disabled={processing}
                    >
                        {processing ? 'Menghapus…' : 'Ya, hapus'}
                    </Button>
                </div>
            </Modal>
        </>
    );
}
