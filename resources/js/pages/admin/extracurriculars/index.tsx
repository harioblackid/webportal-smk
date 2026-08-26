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
    create as createExtracurricular,
    destroy as destroyExtracurricular,
    edit as editExtracurricular,
    visibility as ekskulVisibility,
} from '@/routes/admin/extracurriculars';
import type { ExtracurricularRow } from '@/types';

type ExtracurricularsIndexProps = {
    extracurriculars: ExtracurricularRow[];
    enabled: boolean;
};

export default function ExtracurricularsIndex({
    extracurriculars,
    enabled,
}: ExtracurricularsIndexProps) {
    const form = useForm<{ enabled: boolean }>({ enabled });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.put(ekskulVisibility.url(), { preserveScroll: true });
    }

    return (
        <AdminLayout
            title="Ekstrakurikuler"
            actions={
                <Link
                    href={createExtracurricular()}
                    className={buttonVariants()}
                >
                    <Plus className="size-4" aria-hidden="true" />
                    Tambah ekstrakurikuler
                </Link>
            }
        >
            <UnsavedGuard dirty={form.isDirty} />

            <form onSubmit={submit} className="max-w-3xl space-y-5">
                <PageToggle
                    id="enabled"
                    label="Halaman Ekstrakurikuler"
                    description="Saat dinonaktifkan, halaman hilang dari menu publik, alamatnya menjawab 404, dan daftar di bawah tidak dapat diubah."
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
                    Hanya yang berstatus aktif yang tampil di /ekstrakurikuler,
                    diurutkan menurut kolom urutan.
                </p>

                {extracurriculars.length === 0 ? (
                    <p className="mt-6 text-sm text-muted-foreground">
                        Belum ada ekstrakurikuler.
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
                                        Nama
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-2 pr-4 font-semibold"
                                    >
                                        Pembina
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
                                {extracurriculars.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-border"
                                    >
                                        <td className="py-2 pr-4 text-muted-foreground">
                                            {item.sortOrder}
                                        </td>
                                        <td className="py-2 pr-4">
                                            <div className="flex items-center gap-3">
                                                {item.thumbUrl === null ? (
                                                    <div className="size-10 shrink-0 rounded-lg bg-muted" />
                                                ) : (
                                                    <img
                                                        src={item.thumbUrl}
                                                        alt=""
                                                        className="size-10 shrink-0 rounded-lg object-cover"
                                                    />
                                                )}

                                                <span>
                                                    <Link
                                                        href={editExtracurricular(
                                                            item.id,
                                                        )}
                                                        className="font-medium text-foreground underline-offset-4 hover:underline"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    {item.jadwal ===
                                                    null ? null : (
                                                        <span className="block text-xs text-muted-foreground">
                                                            {item.jadwal}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2 pr-4 text-muted-foreground">
                                            {item.pembina ?? '—'}
                                        </td>
                                        <td className="py-2 pr-4">
                                            <Badge
                                                variant={
                                                    item.isActive
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {item.isActive
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </Badge>
                                        </td>
                                        <td className="py-2">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={editExtracurricular(
                                                        item.id,
                                                    )}
                                                    aria-label={`Edit ${item.name}`}
                                                    className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                                >
                                                    <Pencil
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </Link>

                                                <ConfirmDelete
                                                    url={destroyExtracurricular.url(
                                                        item.id,
                                                    )}
                                                    label={item.name}
                                                    title="Hapus ekstrakurikuler ini?"
                                                    description={`"${item.name}" dihapus dengan soft delete, jadi masih bisa dipulihkan lewat basis data.`}
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
