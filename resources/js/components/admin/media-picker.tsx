import { ImagePlus, X } from 'lucide-react';
import { useState } from 'react';

import MediaGrid from '@/components/admin/media-grid';
import Modal from '@/components/admin/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
        <div className="grid gap-2">
            <Label asChild>
                <span>{label}</span>
            </Label>

            <div className="flex flex-wrap items-center gap-3">
                {selected === null ? (
                    <div className="flex size-20 items-center justify-center rounded-lg border border-dashed border-input text-muted-foreground">
                        <ImagePlus className="size-6" aria-hidden="true" />
                    </div>
                ) : (
                    <img
                        src={selected.thumbUrl}
                        alt={selected.alt}
                        className="size-20 rounded-lg border border-border object-cover"
                    />
                )}

                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => setOpen(true)}>
                        {selected === null ? 'Pilih gambar' : 'Ganti gambar'}
                    </Button>

                    {selected === null ? null : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onChange(null)}
                        >
                            <X aria-hidden="true" />
                            Kosongkan
                        </Button>
                    )}
                </div>
            </div>

            {selected === null ? null : (
                <p className="text-sm text-muted-foreground">
                    {selected.filename}
                </p>
            )}

            {hint ? (
                <p className="text-sm text-muted-foreground">{hint}</p>
            ) : null}

            {error ? (
                <p role="alert" className="text-sm text-destructive">
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
