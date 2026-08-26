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
    create as createSpectrum,
    destroy as destroySpectrum,
    edit as editSpectrum,
    visibility as spectrumVisibility,
} from '@/routes/admin/curriculum-spectra';
import type { SpectrumRow } from '@/types';

type CurriculumSpectraIndexProps = {
    spectra: SpectrumRow[];
    enabled: boolean;
};

export default function CurriculumSpectraIndex({
    spectra,
    enabled,
}: CurriculumSpectraIndexProps) {
    const form = useForm<{ enabled: boolean }>({ enabled });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.put(spectrumVisibility.url(), { preserveScroll: true });
    }

    return (
        <AdminLayout
            title="Spektrum kurikulum"
            actions={
                <Link href={createSpectrum()} className={buttonVariants()}>
                    <Plus className="size-4" aria-hidden="true" />
                    Tambah spektrum
                </Link>
            }
        >
            <UnsavedGuard dirty={form.isDirty} />

            <form onSubmit={submit} className="max-w-3xl space-y-5">
                <PageToggle
                    id="enabled"
                    label="Halaman Spektrum Kurikulum"
                    description="Saat dinonaktifkan, halaman hilang dari menu Profil, alamatnya menjawab 404, dan daftar di bawah tidak dapat diubah."
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
                    Hanya spektrum berstatus aktif yang tampil di halaman
                    publik, diurutkan menurut kolom urutan.
                </p>

                {spectra.length === 0 ? (
                    <p className="mt-6 text-sm text-muted-foreground">
                        Belum ada spektrum kurikulum.
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
                                        Mata pelajaran
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
                                {spectra.map((spectrum) => (
                                    <tr
                                        key={spectrum.id}
                                        className="border-b border-border"
                                    >
                                        <td className="py-2 pr-4 text-muted-foreground">
                                            {spectrum.sortOrder}
                                        </td>
                                        <td className="py-2 pr-4">
                                            <Link
                                                href={editSpectrum(spectrum.id)}
                                                className="font-medium text-foreground underline-offset-4 hover:underline"
                                            >
                                                {spectrum.name}
                                            </Link>
                                        </td>
                                        <td className="py-2 pr-4 text-muted-foreground">
                                            {spectrum.subjectsCount}
                                        </td>
                                        <td className="py-2 pr-4">
                                            <Badge
                                                variant={
                                                    spectrum.isActive
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {spectrum.isActive
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </Badge>
                                        </td>
                                        <td className="py-2">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={editSpectrum(
                                                        spectrum.id,
                                                    )}
                                                    aria-label={`Edit ${spectrum.name}`}
                                                    className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                                >
                                                    <Pencil
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </Link>

                                                <ConfirmDelete
                                                    url={destroySpectrum.url(
                                                        spectrum.id,
                                                    )}
                                                    label={spectrum.name}
                                                    title="Hapus spektrum ini?"
                                                    description={`Spektrum "${spectrum.name}" dan seluruh mata pelajarannya dihapus permanen.`}
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
