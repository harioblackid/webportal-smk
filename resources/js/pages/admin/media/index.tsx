import { useForm } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import Modal from '@/components/admin/modal';
import Pagination from '@/components/admin/pagination';
import { Button, buttonVariants } from '@/components/ui/button';
import Field from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import {
    destroy as destroyMedia,
    store as storeMedia,
    update as updateMedia,
} from '@/routes/admin/media';
import type { MediaItem, Paginated } from '@/types';

type MediaIndexProps = {
    media: Paginated<MediaItem>;
    maxKilobytes: number;
};

/** US-014 — pustaka media: unggah, alt text, dan hapus. */
export default function MediaIndex({ media, maxKilobytes }: MediaIndexProps) {
    const uploadForm = useForm<{ file: File | null; alt: string }>({
        file: null,
        alt: '',
    });
    const altForm = useForm({ alt: '' });
    const [editing, setEditing] = useState<MediaItem | null>(null);

    const maxLabel = `${Math.round(maxKilobytes / 1024)} MB`;

    function chooseFile(event: ChangeEvent<HTMLInputElement>) {
        uploadForm.setData('file', event.target.files?.[0] ?? null);
    }

    function upload(event: FormEvent) {
        event.preventDefault();
        uploadForm.post(storeMedia.url(), {
            preserveScroll: true,
            onSuccess: () => uploadForm.reset(),
        });
    }

    function openAlt(item: MediaItem) {
        altForm.setData('alt', item.alt);
        altForm.clearErrors();
        setEditing(item);
    }

    function saveAlt(event: FormEvent) {
        event.preventDefault();

        if (editing === null) {
            return;
        }

        altForm.put(updateMedia.url(editing.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    }

    return (
        <AdminLayout title="Media">
            <form
                onSubmit={upload}
                className="max-w-2xl space-y-4 rounded-xl border border-border p-5"
            >
                <h2 className="text-lg font-semibold text-foreground">
                    Unggah gambar
                </h2>

                <Field id="file" label="Berkas" error={uploadForm.errors.file}>
                    <input
                        id="file"
                        type="file"
                        required
                        accept="image/jpeg,image/png,image/webp"
                        onChange={chooseFile}
                        className="block w-full text-sm text-muted-foreground file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-muted file:px-4 file:text-sm file:font-semibold file:text-foreground"
                    />
                    <p className="text-sm text-muted-foreground">
                        JPG, PNG, atau WebP — maksimal {maxLabel}. Versi tampil
                        dan thumbnail dibuat otomatis.
                    </p>
                </Field>

                <Field
                    id="alt"
                    label="Teks alternatif"
                    error={uploadForm.errors.alt}
                >
                    <Input
                        id="alt"
                        maxLength={200}
                        placeholder="mis. Siswa TKJ sedang praktik jaringan"
                        aria-invalid={Boolean(uploadForm.errors.alt)}
                        value={uploadForm.data.alt}
                        onChange={(event) =>
                            uploadForm.setData('alt', event.target.value)
                        }
                    />
                    <p className="text-sm text-muted-foreground">
                        Menjelaskan isi gambar untuk pembaca layar dan mesin
                        pencari. Kosongkan hanya untuk gambar dekoratif.
                    </p>
                </Field>

                <Button type="submit" disabled={uploadForm.processing}>
                    {uploadForm.processing ? 'Mengunggah…' : 'Unggah'}
                </Button>
            </form>

            {media.data.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                    Belum ada gambar di pustaka.
                </p>
            ) : (
                <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {media.data.map((item) => (
                        <li
                            key={item.id}
                            className="overflow-hidden rounded-xl border border-border"
                        >
                            <img
                                src={item.thumbUrl}
                                alt={item.alt}
                                className="aspect-square w-full bg-muted object-cover"
                            />

                            <div className="space-y-1 p-3">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {item.filename}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {item.sizeLabel} ·{' '}
                                    {item.uploadedAtLabel ?? '—'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {item.alt === ''
                                        ? 'Tanpa alt text'
                                        : item.alt}
                                </p>

                                <div className="flex items-center justify-between pt-1">
                                    <button
                                        type="button"
                                        onClick={() => openAlt(item)}
                                        className={buttonVariants({
                                            variant: 'link',
                                            size: 'sm',
                                        })}
                                    >
                                        Ubah alt
                                    </button>

                                    <ConfirmDelete
                                        url={destroyMedia.url(item.id)}
                                        label={item.filename}
                                        title="Hapus gambar ini?"
                                        description={`"${item.filename}" dihapus permanen. Berita atau hero yang memakainya akan kehilangan gambar.`}
                                    />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Pagination
                links={media.links}
                lastPage={media.last_page}
                label="Paginasi pustaka media"
            />

            <Modal
                open={editing !== null}
                title="Teks alternatif"
                description="Deskripsi singkat isi gambar (FR5-17)."
                onClose={() => setEditing(null)}
            >
                <form onSubmit={saveAlt} className="space-y-4">
                    <Field
                        id="edit-alt"
                        label="Teks alternatif"
                        error={altForm.errors.alt}
                    >
                        <Input
                            id="edit-alt"
                            maxLength={200}
                            aria-invalid={Boolean(altForm.errors.alt)}
                            value={altForm.data.alt}
                            onChange={(event) =>
                                altForm.setData('alt', event.target.value)
                            }
                        />
                    </Field>

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setEditing(null)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={altForm.processing}>
                            {altForm.processing ? 'Menyimpan…' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
