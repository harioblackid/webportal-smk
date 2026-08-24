import { Link, usePage } from '@inertiajs/react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

import { home, kontak, profil } from '@/routes';
import { index as majorsIndex } from '@/routes/majors';
import { index as postsIndex } from '@/routes/posts';

const links = [
    { label: 'Beranda', href: home() },
    { label: 'Profil', href: profil() },
    { label: 'Jurusan', href: majorsIndex() },
    { label: 'Berita', href: postsIndex() },
    { label: 'Kontak', href: kontak() },
];

/** School identity, short contact block, menu, and the foundation credit. */
export default function Footer() {
    const site = usePage().props.site;
    const { address, phone, phoneHref, whatsapp, whatsappHref, email } =
        site.contact;

    return (
        <footer className="mt-16 bg-onyx text-white/80">
            <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-3 lg:py-14">
                <div>
                    <img
                        src="/logo-smk.png"
                        alt=""
                        width={56}
                        height={56}
                        loading="lazy"
                        className="size-14 object-contain"
                    />

                    <p className="mt-4 font-display text-xl font-semibold text-white">
                        {site.name}
                    </p>

                    {site.tagline !== null && (
                        <p className="mt-2 max-w-xs text-sm">{site.tagline}</p>
                    )}

                    <span
                        className="mt-5 block h-1 w-12 rounded-full bg-brand-accent"
                        aria-hidden="true"
                    />
                </div>

                <div>
                    <h2 className="text-sm font-semibold tracking-[0.14em] text-white uppercase">
                        Kontak
                    </h2>

                    <ul className="mt-4 space-y-3 text-sm">
                        {address !== null && (
                            <li className="flex gap-3">
                                <MapPin
                                    className="mt-0.5 size-4 shrink-0 text-brand-accent"
                                    aria-hidden="true"
                                />
                                <span>{address}</span>
                            </li>
                        )}

                        {phoneHref !== null && (
                            <li className="flex gap-3">
                                <Phone
                                    className="mt-0.5 size-4 shrink-0 text-brand-accent"
                                    aria-hidden="true"
                                />
                                <a
                                    href={phoneHref}
                                    className="inline-flex min-h-11 items-center hover:text-white"
                                >
                                    {phone}
                                </a>
                            </li>
                        )}

                        {whatsappHref !== null && (
                            <li className="flex gap-3">
                                <MessageCircle
                                    className="mt-0.5 size-4 shrink-0 text-brand-accent"
                                    aria-hidden="true"
                                />
                                <a
                                    href={whatsappHref}
                                    className="inline-flex min-h-11 items-center hover:text-white"
                                >
                                    {whatsapp}
                                </a>
                            </li>
                        )}

                        {email !== null && (
                            <li className="flex gap-3">
                                <Mail
                                    className="mt-0.5 size-4 shrink-0 text-brand-accent"
                                    aria-hidden="true"
                                />
                                <a
                                    href={`mailto:${email}`}
                                    className="inline-flex min-h-11 items-center break-all hover:text-white"
                                >
                                    {email}
                                </a>
                            </li>
                        )}
                    </ul>
                </div>

                <div>
                    <h2 className="text-sm font-semibold tracking-[0.14em] text-white uppercase">
                        Jelajahi
                    </h2>

                    <ul className="mt-4 space-y-1 text-sm">
                        {links.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    className="inline-flex min-h-11 items-center hover:text-white"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto max-w-6xl px-5 py-6 text-xs sm:px-6">
                    <p>
                        Di bawah naungan YPLP Dasar Menengah PGRI. ©{' '}
                        {new Date().getFullYear()} {site.name}.
                    </p>
                </div>
            </div>
        </footer>
    );
}
