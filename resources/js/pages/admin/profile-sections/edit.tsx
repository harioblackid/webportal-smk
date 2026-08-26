import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import MediaPicker from '@/components/admin/media-picker';
import Repeater from '@/components/admin/repeater';
import RichTextEditor from '@/components/admin/rich-text-editor';
import UnsavedGuard from '@/components/admin/unsaved-guard';
import { Button } from '@/components/ui/button';
import Field from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { update as updateProfileSections } from '@/routes/admin/profile-sections';
import type { MediaItem } from '@/types';

type SectionValues = {
    key: string;
    title: string;
    body: string;
    media_id: number | null;
};

type MissionValues = {
    title: string;
    description: string;
};

type ProfileSectionsEditProps = {
    sections: SectionValues[];
    missions: MissionValues[];
    mediaLibrary: MediaItem[];
};

type ProfileFormValues = {
    sections: SectionValues[];
    missions: MissionValues[];
};

/**
 * Mirrors ProfileSection::PLAIN_TEXT_KEYS.
 *
 * These render a plain Textarea, because their text lands in a slot on the
 * public page where block markup would be illegal nesting — offering a rich
 * text editor would promise formatting the page then has to throw away.
 */
const PLAIN_TEXT_KEYS = ['visi'];

/** What each fixed section is called in the admin, and what it is for. */
const LEGENDS: Record<string, { legend: string; hint: string }> = {
    sambutan: {
        legend: 'Sambutan kepala sekolah',
        hint: 'Pembuka halaman Profil, ditulis atas nama kepala sekolah.',
    },
    sejarah: {
        legend: 'Sejarah singkat',
        hint: 'Riwayat berdirinya sekolah, cukup dua sampai tiga paragraf.',
    },
    visi: {
        legend: 'Visi',
        hint: 'Judul di sini menjadi kalimat visi; isinya menjadi pengantar daftar misi di bawah.',
    },
    yayasan: {
        legend: 'Identitas yayasan',
        hint: 'Badan penyelenggara sekolah.',
    },
};

/**
 * Halaman Visi Misi — the copy that used to live in the page component.
 *
 * The four sections are fixed because the public page lays each one out with
 * its own widget; only the misi list is open-ended.
 */
export default function ProfileSectionsEdit({
    sections,
    missions,
    mediaLibrary,
}: ProfileSectionsEditProps) {
    const form = useForm<ProfileFormValues>({ sections, missions });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.put(updateProfileSections.url(), { preserveScroll: true });
    }

    function updateSection(index: number, patch: Partial<SectionValues>) {
        form.setData(
            'sections',
            form.data.sections.map((section, at) =>
                at === index ? { ...section, ...patch } : section,
            ),
        );
    }

    return (
        <AdminLayout title="Halaman Visi Misi">
            <p className="text-sm text-muted-foreground">
                Isi halaman Profil di situs publik. Halaman ini selalu terbit —
                tidak ada tombol aktif/nonaktif.
            </p>

            <UnsavedGuard dirty={form.isDirty} />

            <form onSubmit={submit} className="mt-6 max-w-3xl space-y-8">
                {form.data.sections.map((section, index) => (
                    <fieldset
                        key={section.key}
                        className="space-y-5 rounded-xl border border-border p-5"
                    >
                        <legend className="px-1 text-lg font-semibold text-foreground">
                            {LEGENDS[section.key]?.legend ?? section.key}
                        </legend>

                        <Field
                            id={`section-${section.key}-title`}
                            label="Judul"
                            hint={LEGENDS[section.key]?.hint}
                            error={form.errors[`sections.${index}.title`]}
                        >
                            <Input
                                id={`section-${section.key}-title`}
                                required
                                maxLength={200}
                                aria-invalid={Boolean(
                                    form.errors[`sections.${index}.title`],
                                )}
                                value={section.title}
                                onChange={(event) =>
                                    updateSection(index, {
                                        title: event.target.value,
                                    })
                                }
                            />
                        </Field>

                        {PLAIN_TEXT_KEYS.includes(section.key) ? (
                            <Field
                                id={`section-${section.key}-body`}
                                label="Isi"
                                hint="Satu kalimat pengantar, tanpa format — teks ini tampil di dalam judul daftar misi."
                                error={form.errors[`sections.${index}.body`]}
                            >
                                <Textarea
                                    id={`section-${section.key}-body`}
                                    rows={2}
                                    maxLength={300}
                                    aria-invalid={Boolean(
                                        form.errors[`sections.${index}.body`],
                                    )}
                                    value={section.body}
                                    onChange={(event) =>
                                        updateSection(index, {
                                            body: event.target.value,
                                        })
                                    }
                                />
                            </Field>
                        ) : (
                            <RichTextEditor
                                id={`section-${section.key}-body`}
                                label="Isi"
                                value={section.body}
                                library={mediaLibrary}
                                error={form.errors[`sections.${index}.body`]}
                                onChange={(html) =>
                                    updateSection(index, { body: html })
                                }
                            />
                        )}

                        <MediaPicker
                            label="Gambar pendamping"
                            value={section.media_id}
                            library={mediaLibrary}
                            error={form.errors[`sections.${index}.media_id`]}
                            hint="Opsional. Kosongkan bila section ini hanya berisi teks."
                            onChange={(id) =>
                                updateSection(index, { media_id: id })
                            }
                        />
                    </fieldset>
                ))}

                <Repeater<MissionValues>
                    legend="Misi"
                    hint="Ditampilkan sebagai daftar bernomor di bawah visi. Tambahkan sebanyak yang dibutuhkan."
                    items={form.data.missions}
                    onChange={(items) => form.setData('missions', items)}
                    blank={() => ({ title: '', description: '' })}
                    addLabel="Tambah misi"
                    emptyLabel="Belum ada butir misi. Bagian visi & misi tidak akan tampil di halaman publik sampai ada minimal satu."
                    max={20}
                >
                    {(mission, index, update) => (
                        <div className="space-y-4">
                            <Field
                                id={`mission-${index}-title`}
                                label="Judul misi"
                                error={form.errors[`missions.${index}.title`]}
                            >
                                <Input
                                    id={`mission-${index}-title`}
                                    maxLength={200}
                                    aria-invalid={Boolean(
                                        form.errors[`missions.${index}.title`],
                                    )}
                                    value={mission.title}
                                    onChange={(event) =>
                                        update({ title: event.target.value })
                                    }
                                />
                            </Field>

                            <Field
                                id={`mission-${index}-description`}
                                label="Keterangan"
                                error={
                                    form.errors[`missions.${index}.description`]
                                }
                            >
                                <Textarea
                                    id={`mission-${index}-description`}
                                    rows={2}
                                    maxLength={500}
                                    aria-invalid={Boolean(
                                        form.errors[
                                            `missions.${index}.description`
                                        ],
                                    )}
                                    value={mission.description}
                                    onChange={(event) =>
                                        update({
                                            description: event.target.value,
                                        })
                                    }
                                />
                            </Field>
                        </div>
                    )}
                </Repeater>

                <div className="border-t border-border pt-6">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
