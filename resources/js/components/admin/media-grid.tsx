import { router } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { store as storeMedia } from '@/routes/admin/media';
import type { MediaItem } from '@/types';

type MediaGridProps = {
    library: MediaItem[];
    /** Highlighted as chosen; undefined when the grid is only inserting. */
    selectedId?: number | null;
    onSelect: (item: MediaItem) => void;
};

/**
 * Upload box plus the picker grid, shared by the image field on every form and
 * by the "sisipkan gambar" button in the rich text editor (FR5-9, FR5-15).
 *
 * Uploads use preserveState so the surrounding form — often a half-written
 * berita — survives the round trip; the endpoint answers with back(), which
 * refreshes `mediaLibrary` in place.
 */
export default function MediaGrid({
    library,
    selectedId,
    onSelect,
}: MediaGridProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    function upload(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (file === undefined) {
            return;
        }

        router.post(
            storeMedia.url(),
            { file },
            {
                forceFormData: true,
                preserveState: true,
                preserveScroll: true,
                onStart: () => {
                    setUploading(true);
                    setUploadError(null);
                },
                onSuccess: (page) => {
                    // MediaLibrary::options() sorts newest first, so the image
                    // just uploaded is the head of the refreshed list.
                    const fresh: unknown = page.props.mediaLibrary;

                    if (Array.isArray(fresh) && fresh.length > 0) {
                        onSelect(fresh[0] as MediaItem);
                    }
                },
                onError: (errors) =>
                    setUploadError(errors.file ?? 'Unggahan gagal.'),
                onFinish: () => setUploading(false),
            },
        );

        // Lets the same file be chosen again after a failed upload.
        event.target.value = '';
    }

    return (
        <div>
            <label className="mb-5 flex cursor-pointer flex-wrap items-center gap-3 rounded-lg border border-dashed border-charcoal/30 p-4 text-sm hover:bg-mist">
                <Upload className="size-5 text-brand" aria-hidden="true" />
                <span className="font-medium text-onyx">
                    {uploading ? 'Mengunggah…' : 'Unggah gambar baru'}
                </span>
                <span className="text-charcoal">JPG/PNG/WebP, maks 3 MB</span>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploading}
                    onChange={upload}
                />
            </label>

            {uploadError === null ? null : (
                <p role="alert" className="mb-4 text-sm text-red-700">
                    {uploadError}
                </p>
            )}

            {library.length === 0 ? (
                <p className="text-sm text-charcoal">
                    Belum ada gambar di pustaka.
                </p>
            ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {library.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(item)}
                                aria-pressed={item.id === selectedId}
                                className={cn(
                                    'block w-full overflow-hidden rounded-lg border-2 text-left',
                                    item.id === selectedId
                                        ? 'border-brand'
                                        : 'border-transparent hover:border-charcoal/30',
                                )}
                            >
                                <img
                                    src={item.thumbUrl}
                                    alt={item.alt}
                                    className="aspect-square w-full bg-mist object-cover"
                                />
                                <span className="block truncate px-1 py-1.5 text-xs text-charcoal">
                                    {item.filename}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
