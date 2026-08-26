import { Link, useForm } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import type { FormEvent } from 'react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import PageToggle from '@/components/admin/page-toggle';
import UnsavedGuard from '@/components/admin/unsaved-guard';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import {
    create as createAlbum,
    destroy as destroyAlbum,
    edit as editAlbum,
    visibility as galleryVisibility,
} from '@/routes/admin/gallery-albums';
import type { GalleryAlbumRow } from '@/types';

type GalleryAlbumsIndexProps = {
    albums: GalleryAlbumRow[];
    enabled: boolean;
};

export default function GalleryAlbumsIndex({
    albums,
    enabled,
}: GalleryAlbumsIndexProps) {
    const form = useForm<{ enabled: boolean }>({ enabled });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.put(galleryVisibility.url(), { preserveScroll: true });
    }

    return (
        <AdminLayout
            title="Gallery"
            actions={
                <Link href={createAlbum()} className={buttonVariants()}>
                    <Plus className="size-4" aria-hidden="true" />
                    Tambah album
                </Link>
            }
        >
            <UnsavedGuard dirty={form.isDirty} />

            <form onSubmit={submit} className="max-w-3xl space-y-5">
                <PageToggle
                    id="enabled"
                    label="Halaman Gallery"
                    description="Saat dinonaktifkan, halaman hilang dari menu publik, alamatnya menjawab 404, dan daftar album di bawah tidak dapat diubah."
                    checked={form.data.enabled}
                    onChange={(checked) => form.setData('enabled', checked)}
                />

                <Button type="submit" disabled={form.processing}>
                    {form.processing ? 'Menyimpan…' : 'Simpan'}
                </Button>
            </form>

            <fieldset
                disabled={!form.data.enabled}
                className="mt-8 disabled:opacity-60"
            >
                <p className="text-sm text-muted-foreground">
                    Hanya album berstatus aktif yang tampil di /galeri,
                    diurutkan menurut kolom urutan.
                </p>

                {albums.length === 0 ? (
                    <p className="mt-6 text-sm text-muted-foreground">
                        Belum ada album galeri.
                    </p>
                ) : (
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th
                                        scope="col"
                                        className="py-2 pr-4 font-semibold"
                                    >
                                        Urutan
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-2 pr-4 font-semibold"
                                    >
                                        Album
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-2 pr-4 font-semibold"
                                    >
                                        Foto
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-2 pr-4 font-semibold"
                                    >
                                        Status
                                    </th>
                                    <th scope="col" className="py-2 text-right">
                                        <span className="sr-only">Aksi</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {albums.map((album) => (
                                    <tr
                                        key={album.id}
                                        className="border-b border-border"
                                    >
                                        <td className="py-2 pr-4 text-muted-foreground">
                                            {album.sortOrder}
                                        </td>
                                        <td className="py-2 pr-4">
                                            <div className="flex items-center gap-3">
                                                {album.thumbUrl === null ? (
                                                    <div className="size-10 shrink-0 rounded-lg bg-muted" />
                                                ) : (
                                                    <img
                                                        src={album.thumbUrl}
                                                        alt=""
                                                        className="size-10 shrink-0 rounded-lg object-cover"
                                                    />
                                                )}

                                                <span>
                                                    <Link
                                                        href={editAlbum(
                                                            album.id,
                                                        )}
                                                        className="font-medium text-foreground underline-offset-4 hover:underline"
                                                    >
                                                        {album.title}
                                                    </Link>
                                                    <span className="block text-xs text-muted-foreground">
                                                        /galeri/{album.slug}
                                                    </span>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2 pr-4 text-muted-foreground">
                                            {album.itemsCount}
                                        </td>
                                        <td className="py-2 pr-4">
                                            <Badge
                                                variant={
                                                    album.isActive
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {album.isActive
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </Badge>
                                        </td>
                                        <td className="py-2">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={editAlbum(album.id)}
                                                    aria-label={`Edit ${album.title}`}
                                                    className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                                >
                                                    <Pencil
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </Link>

                                                <ConfirmDelete
                                                    url={destroyAlbum.url(
                                                        album.id,
                                                    )}
                                                    label={album.title}
                                                    title="Hapus album ini?"
                                                    description={`Album "${album.title}" dihapus dengan soft delete. Foto-fotonya tetap ada di Media.`}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </fieldset>
        </AdminLayout>
    );
}
