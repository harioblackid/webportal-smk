import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import Modal from '@/components/admin/modal';
import Button from '@/components/ui/button';

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
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label={`Hapus ${label}`}
                    className="inline-flex size-11 items-center justify-center rounded-lg text-charcoal hover:bg-red-50 hover:text-red-700"
                >
                    <Trash2 className="size-4" aria-hidden="true" />
                </button>
            ) : (
                <Button
                    variant="secondary"
                    onClick={() => setOpen(true)}
                    className="border-red-600 text-red-700 hover:bg-red-700 active:border-red-800 active:bg-red-800"
                >
                    <Trash2 className="size-4" aria-hidden="true" />
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
                        variant="secondary"
                        onClick={() => setOpen(false)}
                        disabled={processing}
                    >
                        Batal
                    </Button>

                    <Button
                        onClick={destroy}
                        disabled={processing}
                        className="bg-red-700 hover:bg-red-800 active:bg-red-900"
                    >
                        {processing ? 'Menghapus…' : 'Ya, hapus'}
                    </Button>
                </div>
            </Modal>
        </>
    );
}
