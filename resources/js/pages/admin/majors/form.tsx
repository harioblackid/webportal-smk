import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import MediaPicker from '@/components/admin/media-picker';
import RichTextEditor from '@/components/admin/rich-text-editor';
import Button from '@/components/ui/button';
import Field from '@/components/ui/field';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import {
    destroy as destroyMajor,
    index as majorsIndex,
    store as storeMajor,
    update as updateMajor,
} from '@/routes/admin/majors';
import type { MediaItem } from '@/types';

type MajorFormValues = {
    name: string;
    slug: string;
    excerpt: string;
    description: string;
    extra: string;
    media_id: number | null;
    sort_order: number;
    is_active: boolean;
};

type MajorFormProps = {
    major:
        | (MajorFormValues & {
              id: number;
              routeKey: string;
              publicUrl: string | null;
          })
        | null;
    nextSortOrder: number;
    mediaLibrary: MediaItem[];
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

/** FR5-15b — CRUD jurusan dengan urutan tampil dan status aktif. */
export default function MajorForm({
    major,
    nextSortOrder,
    mediaLibrary,
}: MajorFormProps) {
    const isEdit = major !== null;

    const form = useForm<MajorFormValues>({
        name: major?.name ?? '',
        slug: major?.slug ?? '',
        excerpt: major?.excerpt ?? '',
        description: major?.description ?? '',
        extra: major?.extra ?? '',
        media_id: major?.media_id ?? null,
        sort_order: major?.sort_order ?? nextSortOrder,
        is_active: major?.is_active ?? true,
    });

    const [slugLocked, setSlugLocked] = useState(isEdit);

    function setName(name: string) {
        form.setData((current) => ({
            ...current,
            name,
            slug: slugLocked ? current.slug : slugify(name),
        }));
    }

    function submit(event: FormEvent) {
        event.preventDefault();

        if (major === null) {
            form.post(storeMajor.url());

            return;
        }

        form.put(updateMajor.url(major.routeKey));
    }

    return (
        <AdminLayout
            title={isEdit ? 'Edit jurusan' : 'Tambah jurusan'}
            actions={
                <Link
                    href={majorsIndex()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-charcoal hover:bg-mist"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Kembali ke daftar
                </Link>
            }
        >
            <form onSubmit={submit} className="max-w-3xl space-y-6">
                <Field id="name" label="Nama jurusan" error={form.errors.name}>
                    <Input
                        id="name"
                        required
                        autoFocus={!isEdit}
                        invalid={Boolean(form.errors.name)}
                        value={form.data.name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </Field>

                <Field id="slug" label="Slug (URL)" error={form.errors.slug}>
                    <Input
                        id="slug"
                        placeholder="otomatis dari nama"
                        invalid={Boolean(form.errors.slug)}
                        value={form.data.slug}
                        onChange={(event) => {
                            setSlugLocked(true);
                            form.setData('slug', event.target.value);
                        }}
                    />
                    <p className="text-sm text-charcoal">
                        /jurusan/{form.data.slug || slugify(form.data.name)}
                    </p>
                </Field>

                <MediaPicker
                    label="Gambar"
                    value={form.data.media_id}
                    library={mediaLibrary}
                    error={form.errors.media_id}
                    hint="Tampil di kartu daftar jurusan dan di halaman detailnya."
                    onChange={(id) => form.setData('media_id', id)}
                />

                <Field
                    id="excerpt"
                    label="Deskripsi singkat"
                    error={form.errors.excerpt}
                >
                    <Textarea
                        id="excerpt"
                        rows={3}
                        maxLength={300}
                        invalid={Boolean(form.errors.excerpt)}
                        value={form.data.excerpt}
                        onChange={(event) =>
                            form.setData('excerpt', event.target.value)
                        }
                    />
                    <p className="text-sm text-charcoal">
                        Dipakai di kartu pada halaman daftar jurusan. Maks 300
                        karakter.
                    </p>
                </Field>

                <RichTextEditor
                    id="description"
                    label="Deskripsi lengkap"
                    value={form.data.description}
                    library={mediaLibrary}
                    error={form.errors.description}
                    hint="Isi halaman detail jurusan."
                    onChange={(html) => form.setData('description', html)}
                />

                <RichTextEditor
                    id="extra"
                    label="Informasi tambahan (opsional)"
                    value={form.data.extra}
                    library={mediaLibrary}
                    error={form.errors.extra}
                    hint="Mis. kompetensi yang dipelajari atau prospek kerja."
                    onChange={(html) => form.setData('extra', html)}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                    <Field
                        id="sort_order"
                        label="Urutan tampil"
                        error={form.errors.sort_order}
                    >
                        <Input
                            id="sort_order"
                            type="number"
                            min={0}
                            max={999}
                            required
                            invalid={Boolean(form.errors.sort_order)}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData(
                                    'sort_order',
                                    Number(event.target.value),
                                )
                            }
                        />
                        <p className="text-sm text-charcoal">
                            Angka kecil tampil lebih dulu.
                        </p>
                    </Field>

                    <div className="flex items-end">
                        <label className="flex min-h-11 items-center gap-3">
                            <input
                                type="checkbox"
                                className="size-4 accent-brand"
                                checked={form.data.is_active}
                                onChange={(event) =>
                                    form.setData(
                                        'is_active',
                                        event.target.checked,
                                    )
                                }
                            />
                            <span className="text-sm text-onyx">
                                Aktif — tampil di situs publik
                            </span>
                        </label>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-charcoal/15 pt-6">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>

                    {major?.publicUrl == null ? null : (
                        <a
                            href={major.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-brand hover:bg-mist"
                        >
                            <ExternalLink
                                className="size-4"
                                aria-hidden="true"
                            />
                            Lihat di situs
                        </a>
                    )}

                    {major === null ? null : (
                        <div className="ml-auto">
                            <ConfirmDelete
                                variant="button"
                                url={destroyMajor.url(major.routeKey)}
                                label={major.name}
                                title="Hapus jurusan ini?"
                                description={`Jurusan "${major.name}" dihapus dengan soft delete, jadi masih bisa dipulihkan lewat basis data.`}
                            />
                        </div>
                    )}
                </div>
            </form>
        </AdminLayout>
    );
}
