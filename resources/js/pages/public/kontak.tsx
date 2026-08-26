import { usePage } from '@inertiajs/react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

import HeroText from '@/components/public/hero-text';
import WidgetWrapper from '@/components/public/widget-wrapper';
import PublicLayout from '@/layouts/public-layout';
import type { Seo } from '@/types';

type KontakProps = {
    /** Extracted from the maps_embed Setting; null when unset or not https. */
    mapsEmbedUrl: string | null;
    seo: Seo;
};

export default function Kontak({ mapsEmbedUrl, seo }: KontakProps) {
    const site = usePage().props.site;
    const { address, phone, phoneHref, whatsapp, whatsappHref, email } =
        site.contact;

    // Every channel is a live link, never plain text to copy by hand.
    const channels = [
        { icon: Phone, label: 'Telepon', value: phone, href: phoneHref },
        {
            icon: MessageCircle,
            label: 'WhatsApp',
            value: whatsapp,
            href: whatsappHref,
        },
        {
            icon: Mail,
            label: 'Email',
            value: email,
            href: email === null ? null : `mailto:${email}`,
        },
    ].filter((channel) => channel.href !== null);

    return (
        <PublicLayout seo={seo}>
            <HeroText
                tagline="Kontak & Lokasi"
                title="Hubungi sekolah"
                subtitle="Pertanyaan seputar pendaftaran, jurusan, atau kegiatan sekolah dapat disampaikan melalui kanal berikut."
            />

            <WidgetWrapper containerClass="mx-auto max-w-7xl">
                <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
                    <div className="flex w-full flex-col rounded-lg border border-gray-200 bg-white p-4 shadow backdrop-blur sm:p-6 lg:p-8 dark:border-gray-700 dark:bg-slate-900">
                        <h2 className="mb-6 font-heading text-2xl font-bold tracking-tighter">
                            Kanal kontak
                        </h2>

                        {address !== null && (
                            <p className="mb-6 flex gap-3 text-aw-muted">
                                <MapPin
                                    className="mt-0.5 size-5 shrink-0 text-aw-primary"
                                    aria-hidden="true"
                                />
                                <span>{address}</span>
                            </p>
                        )}

                        {channels.length > 0 && (
                            <ul className="space-y-3">
                                {channels.map(
                                    ({ icon: Icon, label, value, href }) => (
                                        <li key={label}>
                                            <a
                                                href={href ?? undefined}
                                                className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-aw-primary hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800"
                                            >
                                                <Icon
                                                    className="size-5 shrink-0 text-aw-primary"
                                                    aria-hidden="true"
                                                />
                                                <span className="min-w-0">
                                                    <span className="block text-sm text-aw-muted">
                                                        {label}
                                                    </span>
                                                    <span className="block font-semibold break-all">
                                                        {value}
                                                    </span>
                                                </span>
                                            </a>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}

                        {address === null && channels.length === 0 && (
                            <p className="text-aw-muted">
                                Informasi kontak belum diisi pada pengaturan
                                situs.
                            </p>
                        )}
                    </div>

                    <div>
                        <h2 className="mb-6 font-heading text-2xl font-bold tracking-tighter">
                            Peta lokasi
                        </h2>

                        {mapsEmbedUrl === null ? (
                            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-aw-muted dark:border-gray-700">
                                Peta lokasi belum diatur pada pengaturan situs.
                            </p>
                        ) : (
                            <div className="aspect-[4/3] overflow-hidden rounded-md shadow-lg">
                                <iframe
                                    src={mapsEmbedUrl}
                                    title="Peta lokasi SMK PGRI Telagasari"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="size-full border-0"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </WidgetWrapper>
        </PublicLayout>
    );
}
