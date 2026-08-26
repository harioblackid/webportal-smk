import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import MediaPicker from '@/components/admin/media-picker';
import Repeater from '@/components/admin/repeater';
import UnsavedGuard from '@/components/admin/unsaved-guard';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Field from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import {
    destroy as destroyAlbum,
    index as albumsIndex,
    store as storeAlbum,
    update as updateAlbum,
} from '@/routes/admin/gallery-albums';
import type { MediaItem } from '@/types';

type ItemValues = {
    media_id: number | null;
    caption: string;
};

type AlbumFormValues = {
    title: string;
    description: string;
    cover_media_id: number | null;
    sort_order: number;
    is_active: boolean;
    items: ItemValues[];
};

type GalleryAlbumFormProps = {
    album: (AlbumFormValues & { id: number }) | null;
    mediaLibrary: MediaItem[];
};

export default function GalleryAlbumForm({
    album,
    mediaLibrary,
}: GalleryAlbumFormProps) {
    const form = useForm<AlbumFormValues>({
        title: album?.title ?? '',
        description: album?.description ?? '',
        cover_media_id: album?.cover_media_id ?? null,
        sort_order: album?.sort_order ?? 0,
        is_active: album?.is_active ?? true,
        items: album?.items ?? [],
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (album === null) {
            form.post(storeAlbum.url());

            return;
        }

        form.put(updateAlbum.url(album.id));
    }

    return (
        <AdminLayout
            title={album === null ? 'Tambah album' : 'Edit album'}
            actions={
                <Link
                    href={albumsIndex()}
                    className={buttonVariants({ variant: 'ghost' })}
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Kembali ke daftar
                </Link>
            }
        >
            <UnsavedGuard dirty={form.isDirty} />

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                <Field id="title" label="Judul album" error={form.errors.title}>
                    <Input
                        id="title"
                        required
                        autoFocus
                        maxLength={150}
                        placeholder="mis. Pelaksanaan Ujian Kompetensi Keahlian"
                        aria-invalid={Boolean(form.errors.title)}
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                    />
                </Field>

                <Field
                    id="description"
                    label="Keterangan"
                    error={form.errors.description}
                >
                    <Textarea
                        id="description"
                        rows={3}
                        maxLength={1000}
                        aria-invalid={Boolean(form.errors.description)}
                        value={form.data.description}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                    />
                </Field>

                <MediaPicker
                    label="Sampul album"
                    value={form.data.cover_media_id}
                    library={mediaLibrary}
                    error={form.errors.cover_media_id}
                    hint="Gambar yang mewakili album ini di halaman daftar galeri."
                    onChange={(id) => form.setData('cover_media_id', id)}
                />

                <Field
                    id="sort_order"
                    label="Urutan"
                    error={form.errors.sort_order}
                >
                    <Input
                        id="sort_order"
                        type="number"
                        min={0}
                        max={9999}
                        className="max-w-32"
                        aria-invalid={Boolean(form.errors.sort_order)}
                        value={form.data.sort_order}
                        onChange={(event) =>
                            form.setData(
                                'sort_order',
                                Number(event.target.value),
                            )
                        }
                    />
                </Field>

                <Repeater<ItemValues>
                    legend="Foto"
                    hint="Foto diambil dari Media. Unggah dulu di halaman Media bila belum ada."
                    items={form.data.items}
                    onChange={(items) => form.setData('items', items)}
                    blank={() => ({ media_id: null, caption: '' })}
                    addLabel="Tambah foto"
                    emptyLabel="Belum ada foto. Album kosong tetap tampil di daftar, tapi halamannya akan kosong."
                    max={200}
                >
                    {(item, index, update) => (
                        <div className="space-y-4">
                            <MediaPicker
                                label="Gambar"
                                value={item.media_id}
                                library={mediaLibrary}
                                error={form.errors[`items.${index}.media_id`]}
                                onChange={(id) => update({ media_id: id })}
                            />

                            <Field
                                id={`item-${index}-caption`}
                                label="Keterangan foto"
                                error={form.errors[`items.${index}.caption`]}
                            >
                                <Input
                                    id={`item-${index}-caption`}
                                    maxLength={200}
                                    aria-invalid={Boolean(
                                        form.errors[`items.${index}.caption`],
                                    )}
                                    value={item.caption}
                                    onChange={(event) =>
                                        update({ caption: event.target.value })
                                    }
                                />
                            </Field>
                        </div>
                    )}
                </Repeater>

                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="is_active"
                        checked={form.data.is_active}
                        onCheckedChange={(checked) =>
                            form.setData('is_active', checked === true)
                        }
                    />
                    <Label htmlFor="is_active">
                        Tampilkan album ini di halaman publik
                    </Label>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>

                    {album === null ? null : (
                        <div className="ml-auto">
                            <ConfirmDelete
                                variant="button"
                                url={destroyAlbum.url(album.id)}
                                label={album.title}
                                title="Hapus album ini?"
                                description={`Album "${album.title}" dihapus dengan soft delete. Foto-fotonya tetap ada di Media.`}
                            />
                        </div>
                    )}
                </div>
            </form>
        </AdminLayout>
    );
}
