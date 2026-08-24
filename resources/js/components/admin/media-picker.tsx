import { ImagePlus, X } from 'lucide-react';
import { useState } from 'react';

import MediaGrid from '@/components/admin/media-grid';
import Modal from '@/components/admin/modal';
import Button from '@/components/ui/button';
import type { MediaItem } from '@/types';

type MediaPickerProps = {
    label: string;
    /** Media id, or null when nothing is chosen. */
    value: number | null;
    library: MediaItem[];
    error?: string;
    hint?: string;
    onChange: (id: number | null) => void;
};

/**
 * US-014 — "Bisa memilih media dari form berita & hero".
 *
 * The image field on the berita, hero, jurusan, and pengaturan forms: a
 * preview of what is chosen, and a dialog to change it.
 */
export default function MediaPicker({
    label,
    value,
    library,
    error,
    hint,
    onChange,
}: MediaPickerProps) {
    const [open, setOpen] = useState(false);
    const selected = library.find((item) => item.id === value) ?? null;

    return (
        <div className="space-y-1.5">
            <span className="block text-sm font-semibold text-onyx">
                {label}
            </span>

            <div className="flex flex-wrap items-center gap-3">
                {selected === null ? (
                    <div className="flex size-20 items-center justify-center rounded-lg border border-dashed border-charcoal/30 text-charcoal/60">
                        <ImagePlus className="size-6" aria-hidden="true" />
                    </div>
                ) : (
                    <img
                        src={selected.thumbUrl}
                        alt={selected.alt}
                        className="size-20 rounded-lg border border-charcoal/15 object-cover"
                    />
                )}

                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" onClick={() => setOpen(true)}>
                        {selected === null ? 'Pilih gambar' : 'Ganti gambar'}
                    </Button>

                    {selected === null ? null : (
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-charcoal hover:bg-mist"
                        >
                            <X className="size-4" aria-hidden="true" />
                            Kosongkan
                        </button>
                    )}
                </div>
            </div>

            {selected === null ? null : (
                <p className="text-sm text-charcoal">{selected.filename}</p>
            )}

            {hint ? <p className="text-sm text-charcoal">{hint}</p> : null}

            {error ? (
                <p role="alert" className="text-sm text-red-700">
                    {error}
                </p>
            ) : null}

            <Modal
                open={open}
                size="lg"
                title="Pustaka media"
                description="Pilih gambar yang sudah ada, atau unggah yang baru."
                onClose={() => setOpen(false)}
            >
                <MediaGrid
                    library={library}
                    selectedId={value}
                    onSelect={(item) => {
                        onChange(item.id);
                        setOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
}
