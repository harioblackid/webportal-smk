import { usePage } from '@inertiajs/react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

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

    // FR4-18: every channel is a live link, never plain text to copy by hand.
    const channels = [
        {
            icon: Phone,
            label: 'Telepon',
            value: phone,
            href: phoneHref,
        },
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
            <header className="border-b border-charcoal/10 bg-mist">
                <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:py-14">
                    <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-brand uppercase">
                        <span
                            className="h-px w-8 bg-brand-accent"
                            aria-hidden="true"
                        />
                        Kontak & Lokasi
                    </p>

                    <h1 className="mt-4 max-w-2xl font-display text-[30px] leading-tight font-semibold text-onyx sm:text-4xl lg:text-5xl">
                        Hubungi sekolah
                    </h1>

                    <p className="mt-4 max-w-xl text-base text-charcoal">
                        Pertanyaan seputar pendaftaran, jurusan, atau kegiatan
                        sekolah dapat disampaikan melalui kanal berikut.
                    </p>
                </div>
            </header>

            <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-6 lg:grid-cols-12 lg:py-14">
                <div className="lg:col-span-5">
                    {address !== null && (
                        <section aria-labelledby="alamat">
                            <h2
                                id="alamat"
                                className="font-display text-xl font-semibold text-onyx"
                            >
                                Alamat
                            </h2>

                            <p className="mt-3 flex gap-3 text-[15px] leading-relaxed text-charcoal">
                                <MapPin
                                    className="mt-0.5 size-5 shrink-0 text-brand"
                                    aria-hidden="true"
                                />
                                <span>{address}</span>
                            </p>
                        </section>
                    )}

                    {channels.length > 0 && (
                        <section aria-labelledby="kanal" className="mt-10">
                            <h2
                                id="kanal"
                                className="font-display text-xl font-semibold text-onyx"
                            >
                                Kanal kontak
                            </h2>

                            <ul className="mt-4 space-y-3">
                                {channels.map(
                                    ({ icon: Icon, label, value, href }) => (
                                        <li key={label}>
                                            <a
                                                href={href ?? undefined}
                                                className="flex min-h-11 items-center gap-3 rounded-xl border border-charcoal/12 px-4 py-3 transition-colors hover:border-brand hover:bg-mist"
                                            >
                                                <Icon
                                                    className="size-5 shrink-0 text-brand"
                                                    aria-hidden="true"
                                                />
                                                <span className="min-w-0">
                                                    <span className="block text-[13px] font-medium text-charcoal">
                                                        {label}
                                                    </span>
                                                    <span className="block font-semibold break-all text-onyx">
                                                        {value}
                                                    </span>
                                                </span>
                                            </a>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </section>
                    )}

                    {address === null && channels.length === 0 && (
                        <p className="rounded-xl border border-dashed border-charcoal/25 p-6 text-[15px] text-charcoal">
                            Informasi kontak belum diisi pada pengaturan situs.
                        </p>
                    )}
                </div>

                <div className="lg:col-span-7">
                    <h2 className="font-display text-xl font-semibold text-onyx">
                        Peta lokasi
                    </h2>

                    {mapsEmbedUrl === null ? (
                        <p className="mt-4 rounded-xl border border-dashed border-charcoal/25 p-6 text-[15px] text-charcoal">
                            Peta lokasi belum diatur pada pengaturan situs.
                        </p>
                    ) : (
                        <div className="mt-4 aspect-[4/3] overflow-hidden rounded-2xl border border-charcoal/12 sm:aspect-[16/10]">
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
        </PublicLayout>
    );
}
