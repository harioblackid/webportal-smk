import { Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import {
    create as createMajor,
    destroy as destroyMajor,
    edit as editMajor,
} from '@/routes/admin/majors';
import type { MajorRow } from '@/types';

type MajorsIndexProps = {
    majors: MajorRow[];
};

/**
 * US-030 — modul Jurusan, khusus Superadmin.
 *
 * An Editor never reaches this component: EnsureUserIsSuperadmin answers the
 * GET with 403 before the page is rendered (FR5-15a).
 */
export default function MajorsIndex({ majors }: MajorsIndexProps) {
    return (
        <AdminLayout
            title="Jurusan"
            actions={
                <Link href={createMajor()} className={buttonVariants()}>
                    <Plus className="size-4" aria-hidden="true" />
                    Tambah jurusan
                </Link>
            }
        >
            <p className="text-sm text-muted-foreground">
                Hanya jurusan berstatus aktif yang tampil di halaman /jurusan,
                diurutkan menurut kolom urutan.
            </p>

            {majors.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                    Belum ada jurusan.
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
                                    Status
                                </th>
                                <th scope="col" className="py-2 text-right">
                                    <span className="sr-only">Aksi</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {majors.map((major) => (
                                <tr
                                    key={major.id}
                                    className="border-b border-border"
                                >
                                    <td className="py-2 pr-4 text-muted-foreground">
                                        {major.sortOrder}
                                    </td>
                                    <td className="py-2 pr-4">
                                        <div className="flex items-center gap-3">
                                            {major.thumbUrl === null ? (
                                                <div className="size-10 shrink-0 rounded-lg bg-muted" />
                                            ) : (
                                                <img
                                                    src={major.thumbUrl}
                                                    alt=""
                                                    className="size-10 shrink-0 rounded-lg object-cover"
                                                />
                                            )}

                                            <span>
                                                <Link
                                                    href={editMajor(major.slug)}
                                                    className="font-medium text-foreground underline-offset-4 hover:underline"
                                                >
                                                    {major.name}
                                                </Link>
                                                <span className="block text-xs text-muted-foreground">
                                                    /jurusan/{major.slug}
                                                </span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-2 pr-4">
                                        <Badge
                                            variant={
                                                major.isActive
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {major.isActive
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </Badge>
                                    </td>
                                    <td className="py-2">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={editMajor(major.slug)}
                                                aria-label={`Edit ${major.name}`}
                                                className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                            >
                                                <Pencil
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            </Link>

                                            <ConfirmDelete
                                                url={destroyMajor.url(
                                                    major.slug,
                                                )}
                                                label={major.name}
                                                title="Hapus jurusan ini?"
                                                description={`Jurusan "${major.name}" dihapus dengan soft delete, jadi masih bisa dipulihkan lewat basis data.`}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
