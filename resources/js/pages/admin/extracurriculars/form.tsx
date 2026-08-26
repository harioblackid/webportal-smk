import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import MediaPicker from '@/components/admin/media-picker';
import RichTextEditor from '@/components/admin/rich-text-editor';
import UnsavedGuard from '@/components/admin/unsaved-guard';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Field from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import {
    destroy as destroyExtracurricular,
    index as extracurricularsIndex,
    store as storeExtracurricular,
    update as updateExtracurricular,
} from '@/routes/admin/extracurriculars';
import type { MediaItem } from '@/types';

type ExtracurricularFormValues = {
    name: string;
    description: string;
    pembina: string;
    jadwal: string;
    media_id: number | null;
    sort_order: number;
    is_active: boolean;
};

type ExtracurricularFormProps = {
    extracurricular: (ExtracurricularFormValues & { id: number }) | null;
    mediaLibrary: MediaItem[];
};

export default function ExtracurricularForm({
    extracurricular,
    mediaLibrary,
}: ExtracurricularFormProps) {
    const form = useForm<ExtracurricularFormValues>({
        name: extracurricular?.name ?? '',
        description: extracurricular?.description ?? '',
        pembina: extracurricular?.pembina ?? '',
        jadwal: extracurricular?.jadwal ?? '',
        media_id: extracurricular?.media_id ?? null,
        sort_order: extracurricular?.sort_order ?? 0,
        is_active: extracurricular?.is_active ?? true,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (extracurricular === null) {
            form.post(storeExtracurricular.url());

            return;
        }

        form.put(updateExtracurricular.url(extracurricular.id));
    }

    return (
        <AdminLayout
            title={
                extracurricular === null
                    ? 'Tambah ekstrakurikuler'
                    : 'Edit ekstrakurikuler'
            }
            actions={
                <Link
                    href={extracurricularsIndex()}
                    className={buttonVariants({ variant: 'ghost' })}
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Kembali ke daftar
                </Link>
            }
        >
            <UnsavedGuard dirty={form.isDirty} />

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                <Field id="name" label="Nama" error={form.errors.name}>
                    <Input
                        id="name"
                        required
                        autoFocus
                        maxLength={150}
                        placeholder="mis. Pramuka"
                        aria-invalid={Boolean(form.errors.name)}
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                    />
                </Field>

                <RichTextEditor
                    id="description"
                    label="Keterangan"
                    value={form.data.description}
                    library={mediaLibrary}
                    error={form.errors.description}
                    hint="Kegiatan apa saja yang dilakukan, dan siapa yang bisa ikut."
                    onChange={(html) => form.setData('description', html)}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                    <Field
                        id="pembina"
                        label="Pembina"
                        error={form.errors.pembina}
                    >
                        <Input
                            id="pembina"
                            maxLength={100}
                            aria-invalid={Boolean(form.errors.pembina)}
                            value={form.data.pembina}
                            onChange={(event) =>
                                form.setData('pembina', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        id="jadwal"
                        label="Jadwal"
                        error={form.errors.jadwal}
                    >
                        <Input
                            id="jadwal"
                            maxLength={150}
                            placeholder="mis. Jumat, 14.00–16.00"
                            aria-invalid={Boolean(form.errors.jadwal)}
                            value={form.data.jadwal}
                            onChange={(event) =>
                                form.setData('jadwal', event.target.value)
                            }
                        />
                    </Field>
                </div>

                <MediaPicker
                    label="Foto"
                    value={form.data.media_id}
                    library={mediaLibrary}
                    error={form.errors.media_id}
                    onChange={(id) => form.setData('media_id', id)}
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

                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="is_active"
                        checked={form.data.is_active}
                        onCheckedChange={(checked) =>
                            form.setData('is_active', checked === true)
                        }
                    />
                    <Label htmlFor="is_active">
                        Tampilkan di halaman publik
                    </Label>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>

                    {extracurricular === null ? null : (
                        <div className="ml-auto">
                            <ConfirmDelete
                                variant="button"
                                url={destroyExtracurricular.url(
                                    extracurricular.id,
                                )}
                                label={extracurricular.name}
                                title="Hapus ekstrakurikuler ini?"
                                description={`"${extracurricular.name}" dihapus dengan soft delete, jadi masih bisa dipulihkan lewat basis data.`}
                            />
                        </div>
                    )}
                </div>
            </form>
        </AdminLayout>
    );
}
