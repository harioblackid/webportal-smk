import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';

import ConfirmDelete from '@/components/admin/confirm-delete';
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
    destroy as destroySpectrum,
    index as spectraIndex,
    store as storeSpectrum,
    update as updateSpectrum,
} from '@/routes/admin/curriculum-spectra';

type SubjectValues = {
    group: string;
    name: string;
};

type SpectrumFormValues = {
    name: string;
    description: string;
    sort_order: number;
    is_active: boolean;
    subjects: SubjectValues[];
};

type CurriculumSpectrumFormProps = {
    spectrum: (SpectrumFormValues & { id: number }) | null;
};

export default function CurriculumSpectrumForm({
    spectrum,
}: CurriculumSpectrumFormProps) {
    const form = useForm<SpectrumFormValues>({
        name: spectrum?.name ?? '',
        description: spectrum?.description ?? '',
        sort_order: spectrum?.sort_order ?? 0,
        is_active: spectrum?.is_active ?? true,
        subjects: spectrum?.subjects ?? [],
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (spectrum === null) {
            form.post(storeSpectrum.url());

            return;
        }

        form.put(updateSpectrum.url(spectrum.id));
    }

    return (
        <AdminLayout
            title={spectrum === null ? 'Tambah spektrum' : 'Edit spektrum'}
            actions={
                <Link
                    href={spectraIndex()}
                    className={buttonVariants({ variant: 'ghost' })}
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Kembali ke daftar
                </Link>
            }
        >
            <UnsavedGuard dirty={form.isDirty} />

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                <Field id="name" label="Nama spektrum" error={form.errors.name}>
                    <Input
                        id="name"
                        required
                        autoFocus
                        maxLength={150}
                        placeholder="mis. Kurikulum Merdeka — Teknik Komputer dan Jaringan"
                        aria-invalid={Boolean(form.errors.name)}
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
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
                    <p className="text-sm text-muted-foreground">
                        Opsional. Satu paragraf pengantar di atas daftar mata
                        pelajaran.
                    </p>
                </Field>

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
                    <p className="text-sm text-muted-foreground">
                        Angka kecil tampil lebih dulu di halaman publik.
                    </p>
                </Field>

                <Repeater<SubjectValues>
                    legend="Mata pelajaran"
                    hint="Isi kelompok bila ingin dipisah (mis. Mata Pelajaran Umum / Kejuruan). Baris dengan kelompok yang sama dikumpulkan jadi satu di halaman publik."
                    items={form.data.subjects}
                    onChange={(items) => form.setData('subjects', items)}
                    blank={() => ({
                        group:
                            form.data.subjects.at(-1)?.group ??
                            'Mata Pelajaran Umum',
                        name: '',
                    })}
                    addLabel="Tambah mata pelajaran"
                    emptyLabel="Belum ada mata pelajaran. Spektrum tanpa mata pelajaran tampil sebagai judul kosong di halaman publik."
                    max={100}
                >
                    {(subject, index, update) => (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                                id={`subject-${index}-group`}
                                label="Kelompok"
                                error={form.errors[`subjects.${index}.group`]}
                            >
                                <Input
                                    id={`subject-${index}-group`}
                                    maxLength={100}
                                    aria-invalid={Boolean(
                                        form.errors[`subjects.${index}.group`],
                                    )}
                                    value={subject.group}
                                    onChange={(event) =>
                                        update({ group: event.target.value })
                                    }
                                />
                            </Field>

                            <Field
                                id={`subject-${index}-name`}
                                label="Nama mata pelajaran"
                                error={form.errors[`subjects.${index}.name`]}
                            >
                                <Input
                                    id={`subject-${index}-name`}
                                    maxLength={150}
                                    aria-invalid={Boolean(
                                        form.errors[`subjects.${index}.name`],
                                    )}
                                    value={subject.name}
                                    onChange={(event) =>
                                        update({ name: event.target.value })
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
                        Tampilkan spektrum ini di halaman publik
                    </Label>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>

                    {spectrum === null ? null : (
                        <div className="ml-auto">
                            <ConfirmDelete
                                variant="button"
                                url={destroySpectrum.url(spectrum.id)}
                                label={spectrum.name}
                                title="Hapus spektrum ini?"
                                description={`Spektrum "${spectrum.name}" dan seluruh mata pelajarannya dihapus permanen.`}
                            />
                        </div>
                    )}
                </div>
            </form>
        </AdminLayout>
    );
}
