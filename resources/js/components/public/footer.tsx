import { Link, usePage } from '@inertiajs/react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

import { home, kontak, profil } from '@/routes';
import { index as majorsIndex } from '@/routes/majors';
import { index as postsIndex } from '@/routes/posts';

const columns = [
    {
        title: 'Sekolah',
        links: [
            { text: 'Beranda', href: home() },
            { text: 'Profil', href: profil() },
            { text: 'Kontak', href: kontak() },
        ],
    },
    {
        title: 'Informasi',
        links: [
            { text: 'Jurusan', href: majorsIndex() },
            { text: 'Berita & Pengumuman', href: postsIndex() },
        ],
    },
];

/** AstroWind's widgets/Footer — brand column, link columns, contact row. */
export default function Footer() {
    const site = usePage().props.site;
    const { address, phone, phoneHref, whatsapp, whatsappHref, email } =
        site.contact;

    const channels = [
        { icon: Phone, label: phone, href: phoneHref },
        { icon: MessageCircle, label: whatsapp, href: whatsappHref },
        {
            icon: Mail,
            label: email,
            href: email === null ? null : `mailto:${email}`,
        },
    ].filter((channel) => channel.href !== null);

    return (
        <footer className="relative border-t border-gray-200 dark:border-slate-800">
            <div
                className="pointer-events-none absolute inset-0 dark:bg-dark"
                aria-hidden="true"
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 dark:text-slate-300">
                <div className="grid grid-cols-12 gap-4 gap-y-8 py-8 sm:gap-8 md:py-12">
                    <div className="col-span-12 lg:col-span-4">
                        <div className="mb-2 flex items-center gap-2.5">
                            <img
                                src="/logo-smk.png"
                                alt=""
                                width={36}
                                height={36}
                                loading="lazy"
                                className="size-9 object-contain"
                            />

                            <Link
                                className="inline-block text-xl font-bold"
                                href={home()}
                            >
                                {site.name}
                            </Link>
                        </div>

                        {site.tagline !== null && (
                            <p className="max-w-xs text-sm text-aw-muted">
                                {site.tagline}
                            </p>
                        )}

                        {address !== null && (
                            <p className="mt-4 flex max-w-xs gap-2 text-sm text-aw-muted">
                                <MapPin
                                    className="mt-0.5 size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                {address}
                            </p>
                        )}
                    </div>

                    {columns.map((column) => (
                        <div
                            key={column.title}
                            className="col-span-6 md:col-span-3 lg:col-span-2"
                        >
                            <div className="mb-2 font-medium dark:text-gray-300">
                                {column.title}
                            </div>

                            <ul className="text-sm">
                                {column.links.map((link) => (
                                    <li key={link.text} className="mb-2">
                                        <Link
                                            className="text-aw-muted transition duration-150 ease-in-out hover:text-gray-700 hover:underline dark:text-gray-400"
                                            href={link.href}
                                        >
                                            {link.text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {channels.length > 0 && (
                        <div className="col-span-12 md:col-span-6 lg:col-span-4">
                            <div className="mb-2 font-medium dark:text-gray-300">
                                Hubungi kami
                            </div>

                            <ul className="text-sm">
                                {channels.map(({ icon: Icon, label, href }) => (
                                    <li key={label} className="mb-2">
                                        <a
                                            className="inline-flex items-center gap-2 text-aw-muted transition duration-150 ease-in-out hover:text-gray-700 hover:underline dark:text-gray-400"
                                            href={href ?? undefined}
                                        >
                                            <Icon
                                                className="size-4 shrink-0"
                                                aria-hidden="true"
                                            />
                                            <span className="break-all">
                                                {label}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="py-6 md:flex md:items-center md:justify-between md:py-8">
                    <div className="mr-4 text-sm text-aw-muted">
                        Di bawah naungan YPLP Dasar Menengah PGRI. ©{' '}
                        {new Date().getFullYear()} {site.name}. Hak cipta
                        dilindungi.
                    </div>
                </div>
            </div>
        </footer>
    );
}
