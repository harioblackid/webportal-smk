import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import MediaPicker from '@/components/admin/media-picker';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Field from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import {
    destroy as destroyHero,
    index as heroesIndex,
    store as storeHero,
    update as updateHero,
} from '@/routes/admin/heroes';
import type { MediaItem } from '@/types';

type HeroFormValues = {
    title: string;
    subtitle: string;
    media_id: number | null;
    cta1_text: string;
    cta1_url: string;
    cta2_text: string;
    cta2_url: string;
    is_active: boolean;
};

type HeroFormProps = {
    hero: (HeroFormValues & { id: number }) | null;
    mediaLibrary: MediaItem[];
};

/** FR5-13 — judul, subjudul, gambar, hingga 2 CTA, dan status aktif. */
export default function HeroForm({ hero, mediaLibrary }: HeroFormProps) {
    const form = useForm<HeroFormValues>({
        title: hero?.title ?? '',
        subtitle: hero?.subtitle ?? '',
        media_id: hero?.media_id ?? null,
        cta1_text: hero?.cta1_text ?? '',
        cta1_url: hero?.cta1_url ?? '',
        cta2_text: hero?.cta2_text ?? '',
        cta2_url: hero?.cta2_url ?? '',
        is_active: hero?.is_active ?? false,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (hero === null) {
            form.post(storeHero.url());

            return;
        }

        form.put(updateHero.url(hero.id));
    }

    return (
        <AdminLayout
            title={hero === null ? 'Tambah hero' : 'Edit hero'}
            actions={
                <Link
                    href={heroesIndex()}
                    className={buttonVariants({ variant: 'ghost' })}
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Kembali ke daftar
                </Link>
            }
        >
            <form onSubmit={submit} className="max-w-3xl space-y-6">
                <Field id="title" label="Judul" error={form.errors.title}>
                    <Input
                        id="title"
                        required
                        autoFocus
                        aria-invalid={Boolean(form.errors.title)}
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                    />
                </Field>

                <Field
                    id="subtitle"
                    label="Subjudul"
                    error={form.errors.subtitle}
                >
                    <Textarea
                        id="subtitle"
                        rows={2}
                        maxLength={250}
                        aria-invalid={Boolean(form.errors.subtitle)}
                        value={form.data.subtitle}
                        onChange={(event) =>
                            form.setData('subtitle', event.target.value)
                        }
                    />
                </Field>

                <MediaPicker
                    label="Gambar latar"
                    value={form.data.media_id}
                    library={mediaLibrary}
                    error={form.errors.media_id}
                    hint="Gambar lanskap beresolusi tinggi bekerja paling baik di layar lebar."
                    onChange={(id) => form.setData('media_id', id)}
                />

                <fieldset className="space-y-4 rounded-xl border border-border p-5">
                    <legend className="px-1 text-sm font-semibold text-foreground">
                        Tombol 1
                    </legend>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            id="cta1_text"
                            label="Teks"
                            error={form.errors.cta1_text}
                        >
                            <Input
                                id="cta1_text"
                                placeholder="mis. Daftar PPDB"
                                aria-invalid={Boolean(form.errors.cta1_text)}
                                value={form.data.cta1_text}
                                onChange={(event) =>
                                    form.setData(
                                        'cta1_text',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        <Field
                            id="cta1_url"
                            label="URL"
                            error={form.errors.cta1_url}
                        >
                            <Input
                                id="cta1_url"
                                placeholder="/jurusan atau https://…"
                                aria-invalid={Boolean(form.errors.cta1_url)}
                                value={form.data.cta1_url}
                                onChange={(event) =>
                                    form.setData('cta1_url', event.target.value)
                                }
                            />
                        </Field>
                    </div>
                </fieldset>

                <fieldset className="space-y-4 rounded-xl border border-border p-5">
                    <legend className="px-1 text-sm font-semibold text-foreground">
                        Tombol 2 (opsional)
                    </legend>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            id="cta2_text"
                            label="Teks"
                            error={form.errors.cta2_text}
                        >
                            <Input
                                id="cta2_text"
                                aria-invalid={Boolean(form.errors.cta2_text)}
                                value={form.data.cta2_text}
                                onChange={(event) =>
                                    form.setData(
                                        'cta2_text',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        <Field
                            id="cta2_url"
                            label="URL"
                            error={form.errors.cta2_url}
                        >
                            <Input
                                id="cta2_url"
                                aria-invalid={Boolean(form.errors.cta2_url)}
                                value={form.data.cta2_url}
                                onChange={(event) =>
                                    form.setData('cta2_url', event.target.value)
                                }
                            />
                        </Field>
                    </div>
                </fieldset>

                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="is_active"
                        checked={form.data.is_active}
                        onCheckedChange={(checked) =>
                            form.setData('is_active', checked === true)
                        }
                    />
                    <Label htmlFor="is_active">
                        Jadikan hero aktif — hero lain otomatis dinonaktifkan
                    </Label>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>

                    {hero === null ? null : (
                        <div className="ml-auto">
                            <ConfirmDelete
                                variant="button"
                                url={destroyHero.url(hero.id)}
                                label={hero.title}
                                title="Hapus hero ini?"
                            />
                        </div>
                    )}
                </div>
            </form>
        </AdminLayout>
    );
}
