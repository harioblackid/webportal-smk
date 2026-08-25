import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import MediaPicker from '@/components/admin/media-picker';
import Button from '@/components/ui/button';
import Field from '@/components/ui/field';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { update as updateSettings } from '@/routes/admin/settings';
import type { MediaItem } from '@/types';

type SettingValues = {
    school_name: string;
    tagline: string;
    logo_media_id: number | null;
    contact_address: string;
    contact_phone: string;
    contact_whatsapp: string;
    contact_email: string;
    maps_embed: string;
    ppdb_enabled: boolean;
    ppdb_url: string;
    ppdb_banner_media_id: number | null;
    ga4_measurement_id: string;
    search_console_verification: string;
};

type SettingsEditProps = {
    settings: SettingValues;
    mediaLibrary: MediaItem[];
};

/**
 * US-015 / US-020 — identitas, kontak, banner PPDB, GA4, dan verifikasi
 * Search Console (Superadmin).
 */
export default function SettingsEdit({
    settings,
    mediaLibrary,
}: SettingsEditProps) {
    const form = useForm<SettingValues>(settings);

    function submit(event: FormEvent) {
        event.preventDefault();
        form.put(updateSettings.url(), { preserveScroll: true });
    }

    return (
        <AdminLayout title="Pengaturan situs">
            <p className="text-sm text-charcoal">
                Perubahan di halaman ini langsung tampil di situs publik, tanpa
                perlu deploy ulang.
            </p>

            <form onSubmit={submit} className="mt-6 max-w-3xl space-y-8">
                <fieldset className="space-y-5 rounded-xl border border-charcoal/15 p-5">
                    <legend className="px-1 font-display text-lg font-semibold text-onyx">
                        Identitas
                    </legend>

                    <Field
                        id="school_name"
                        label="Nama sekolah"
                        error={form.errors.school_name}
                    >
                        <Input
                            id="school_name"
                            required
                            invalid={Boolean(form.errors.school_name)}
                            value={form.data.school_name}
                            onChange={(event) =>
                                form.setData('school_name', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        id="tagline"
                        label="Tagline"
                        error={form.errors.tagline}
                    >
                        <Input
                            id="tagline"
                            maxLength={200}
                            invalid={Boolean(form.errors.tagline)}
                            value={form.data.tagline}
                            onChange={(event) =>
                                form.setData('tagline', event.target.value)
                            }
                        />
                        <p className="text-sm text-charcoal">
                            Dipakai sebagai deskripsi sekolah di data
                            terstruktur dan pratinjau tautan.
                        </p>
                    </Field>

                    <MediaPicker
                        label="Logo"
                        value={form.data.logo_media_id}
                        library={mediaLibrary}
                        error={form.errors.logo_media_id}
                        hint="Kosongkan untuk memakai logo bawaan yang sudah dipasang di situs."
                        onChange={(id) => form.setData('logo_media_id', id)}
                    />
                </fieldset>

                <fieldset className="space-y-5 rounded-xl border border-charcoal/15 p-5">
                    <legend className="px-1 font-display text-lg font-semibold text-onyx">
                        Kontak
                    </legend>

                    <Field
                        id="contact_address"
                        label="Alamat"
                        error={form.errors.contact_address}
                    >
                        <Textarea
                            id="contact_address"
                            rows={2}
                            invalid={Boolean(form.errors.contact_address)}
                            value={form.data.contact_address}
                            onChange={(event) =>
                                form.setData(
                                    'contact_address',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            id="contact_phone"
                            label="Telepon"
                            error={form.errors.contact_phone}
                        >
                            <Input
                                id="contact_phone"
                                type="tel"
                                invalid={Boolean(form.errors.contact_phone)}
                                value={form.data.contact_phone}
                                onChange={(event) =>
                                    form.setData(
                                        'contact_phone',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>

                        <Field
                            id="contact_whatsapp"
                            label="WhatsApp"
                            error={form.errors.contact_whatsapp}
                        >
                            <Input
                                id="contact_whatsapp"
                                type="tel"
                                placeholder="08xxxxxxxxxx"
                                invalid={Boolean(form.errors.contact_whatsapp)}
                                value={form.data.contact_whatsapp}
                                onChange={(event) =>
                                    form.setData(
                                        'contact_whatsapp',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </div>

                    <Field
                        id="contact_email"
                        label="Email"
                        error={form.errors.contact_email}
                    >
                        <Input
                            id="contact_email"
                            type="email"
                            invalid={Boolean(form.errors.contact_email)}
                            value={form.data.contact_email}
                            onChange={(event) =>
                                form.setData(
                                    'contact_email',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>

                    <Field
                        id="maps_embed"
                        label="Google Maps"
                        error={form.errors.maps_embed}
                    >
                        <Textarea
                            id="maps_embed"
                            rows={2}
                            invalid={Boolean(form.errors.maps_embed)}
                            value={form.data.maps_embed}
                            onChange={(event) =>
                                form.setData('maps_embed', event.target.value)
                            }
                        />
                        <p className="text-sm text-charcoal">
                            Tempel URL embed atau seluruh kode iframe dari
                            Google Maps — hanya alamat petanya yang dipakai.
                        </p>
                    </Field>
                </fieldset>

                <fieldset className="space-y-5 rounded-xl border border-charcoal/15 p-5">
                    <legend className="px-1 font-display text-lg font-semibold text-onyx">
                        Banner PPDB
                    </legend>

                    <label className="flex min-h-11 items-center gap-3">
                        <input
                            type="checkbox"
                            className="size-4 accent-brand"
                            checked={form.data.ppdb_enabled}
                            onChange={(event) =>
                                form.setData(
                                    'ppdb_enabled',
                                    event.target.checked,
                                )
                            }
                        />
                        <span className="text-sm text-onyx">
                            Tampilkan banner PPDB di situs
                        </span>
                    </label>

                    <Field
                        id="ppdb_url"
                        label="URL pendaftaran"
                        error={form.errors.ppdb_url}
                    >
                        <Input
                            id="ppdb_url"
                            type="url"
                            placeholder="https://"
                            invalid={Boolean(form.errors.ppdb_url)}
                            value={form.data.ppdb_url}
                            onChange={(event) =>
                                form.setData('ppdb_url', event.target.value)
                            }
                        />
                        <p className="text-sm text-charcoal">
                            Wajib diisi bila banner dinyalakan.
                        </p>
                    </Field>

                    <MediaPicker
                        label="Gambar banner"
                        value={form.data.ppdb_banner_media_id}
                        library={mediaLibrary}
                        error={form.errors.ppdb_banner_media_id}
                        onChange={(id) =>
                            form.setData('ppdb_banner_media_id', id)
                        }
                    />
                </fieldset>

                <fieldset className="space-y-5 rounded-xl border border-charcoal/15 p-5">
                    <legend className="px-1 font-display text-lg font-semibold text-onyx">
                        Google Analytics &amp; Search Console
                    </legend>

                    <Field
                        id="ga4_measurement_id"
                        label="Measurement ID"
                        error={form.errors.ga4_measurement_id}
                    >
                        <Input
                            id="ga4_measurement_id"
                            placeholder="G-XXXXXXXXXX"
                            invalid={Boolean(form.errors.ga4_measurement_id)}
                            value={form.data.ga4_measurement_id}
                            onChange={(event) =>
                                form.setData(
                                    'ga4_measurement_id',
                                    event.target.value.toUpperCase(),
                                )
                            }
                        />
                        <p className="text-sm text-charcoal">
                            Kode pelacakan dimuat di halaman publik saja —
                            aktivitas di /admin tidak ikut terhitung.
                        </p>
                    </Field>

                    <Field
                        id="search_console_verification"
                        label="Kode verifikasi Search Console"
                        error={form.errors.search_console_verification}
                    >
                        <Input
                            id="search_console_verification"
                            placeholder="Tempel kode atau tag <meta> dari Google"
                            invalid={Boolean(
                                form.errors.search_console_verification,
                            )}
                            value={form.data.search_console_verification}
                            onChange={(event) =>
                                form.setData(
                                    'search_console_verification',
                                    event.target.value,
                                )
                            }
                        />
                        <p className="text-sm text-charcoal">
                            Boleh menempel seluruh tag{' '}
                            <code>
                                &lt;meta name="google-site-verification"…&gt;
                            </code>{' '}
                            — kodenya diambil otomatis, lalu dipasang di seluruh
                            halaman agar Google dapat memverifikasi kepemilikan.
                        </p>
                    </Field>
                </fieldset>

                <div className="border-t border-charcoal/15 pt-6">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Simpan pengaturan'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
