import { Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import { buttonClasses } from '@/components/ui/button';
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
                <Link href={createMajor()} className={buttonClasses()}>
                    <Plus className="size-4" aria-hidden="true" />
                    Tambah jurusan
                </Link>
            }
        >
            <p className="text-sm text-charcoal">
                Hanya jurusan berstatus aktif yang tampil di halaman /jurusan,
                diurutkan menurut kolom urutan.
            </p>

            {majors.length === 0 ? (
                <p className="mt-6 text-sm text-charcoal">Belum ada jurusan.</p>
            ) : (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-charcoal/20">
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
                                    className="border-b border-charcoal/10"
                                >
                                    <td className="py-2 pr-4 text-charcoal">
                                        {major.sortOrder}
                                    </td>
                                    <td className="py-2 pr-4">
                                        <div className="flex items-center gap-3">
                                            {major.thumbUrl === null ? (
                                                <div className="size-10 shrink-0 rounded-lg bg-mist" />
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
                                                    className="font-medium text-onyx underline-offset-4 hover:underline"
                                                >
                                                    {major.name}
                                                </Link>
                                                <span className="block text-xs text-charcoal">
                                                    /jurusan/{major.slug}
                                                </span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-2 pr-4">
                                        <span
                                            className={
                                                major.isActive
                                                    ? 'inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand'
                                                    : 'inline-block rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-charcoal'
                                            }
                                        >
                                            {major.isActive
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="py-2">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={editMajor(major.slug)}
                                                aria-label={`Edit ${major.name}`}
                                                className="inline-flex size-11 items-center justify-center rounded-lg text-charcoal hover:bg-mist hover:text-onyx"
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
