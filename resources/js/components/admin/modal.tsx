import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ModalProps = {
    open: boolean;
    title: string;
    description?: string;
    /** Wider for the media grid than for a confirmation. */
    size?: 'sm' | 'lg';
    onClose: () => void;
    children: ReactNode;
};

/**
 * The dialog primitive behind every confirmation and the media picker.
 *
 * Built on <dialog showModal>, which the platform already gives a focus trap,
 * an Escape handler, and inert content behind it — a hand-rolled overlay would
 * have to reimplement all three and usually gets the focus part wrong.
 */
export default function Modal({
    open,
    title,
    description,
    size = 'sm',
    onClose,
    children,
}: ModalProps) {
    const ref = useRef<HTMLDialogElement>(null);

    // showModal() is what makes the dialog modal — focus trap, Escape, and the
    // backdrop all come from the platform, and only from that call. The
    // open/closed state lives in the DOM element rather than in React, which
    // is the "synchronise with an external system" case useEffect is for.
    useEffect(() => {
        const dialog = ref.current;

        if (dialog !== null && !dialog.open) {
            dialog.showModal();
        }
    }, [open]);

    // Mounted only while open: a list page renders one of these per row, and
    // fifteen closed dialogs is DOM nobody is using.
    if (!open) {
        return null;
    }

    return (
        <dialog
            ref={ref}
            aria-labelledby="modal-title"
            onCancel={(event) => {
                // Escape closes the element directly; tell React about it.
                event.preventDefault();
                onClose();
            }}
            className={cn(
                'm-auto w-[calc(100vw-2rem)] rounded-xl border bg-background p-0 text-foreground shadow-lg',
                'backdrop:bg-black/50 backdrop:backdrop-blur-xs',
                size === 'lg' ? 'max-w-3xl' : 'max-w-md',
            )}
        >
            <div className="flex items-start gap-3 border-b border-border p-5">
                <div className="flex-1">
                    <h2 id="modal-title" className="text-lg font-semibold">
                        {title}
                    </h2>

                    {description ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {description}
                        </p>
                    ) : null}
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Tutup"
                    className="-mt-1 -mr-1 shrink-0"
                >
                    <X aria-hidden="true" />
                </Button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        </dialog>
    );
}
