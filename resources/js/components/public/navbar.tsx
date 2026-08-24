import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
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

/**
 * prd-04 §2 — the five public destinations, sticky, hamburger under `md`.
 *
 * The ID/EN switcher that belongs beside these links is US-003 and lands with
 * the i18n layer; there is no half-wired toggle here in the meantime.
 */
export default function Navbar() {
    const { url, props } = usePage();
    const [open, setOpen] = useState(false);
    const [lastUrl, setLastUrl] = useState(url);

    // A client-side visit swaps the page without unmounting the navbar, so the
    // panel has to be told to close. Adjusting during render rather than in an
    // effect keeps it to a single pass and covers back/forward too.
    if (url !== lastUrl) {
        setLastUrl(url);
        setOpen(false);
    }

    const isCurrent = (href: string) => {
        if (href === '/') {
            return url === '/';
        }

        return url === href || url.startsWith(`${href}/`);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2.5 sm:px-6">
                <Link
                    href={home()}
                    className="group flex min-h-11 items-center gap-3"
                >
                    <span
                        className="h-9 w-1.5 rounded-full bg-brand transition-colors group-hover:bg-brand-accent"
                        aria-hidden="true"
                    />
                    <span className="leading-tight">
                        <span className="block font-display text-base font-semibold text-onyx sm:text-lg">
                            {props.site.name}
                        </span>
                        {props.site.tagline !== null && (
                            <span className="block text-[11px] font-medium tracking-[0.16em] text-charcoal uppercase">
                                {props.site.tagline}
                            </span>
                        )}
                    </span>
                </Link>

                <nav
                    aria-label="Navigasi utama"
                    className="ml-auto hidden md:block"
                >
                    <ul className="flex items-center gap-1">
                        {links.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    aria-current={
                                        isCurrent(link.href.url)
                                            ? 'page'
                                            : undefined
                                    }
                                    className={cn(
                                        'inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors',
                                        isCurrent(link.href.url)
                                            ? 'text-brand'
                                            : 'text-charcoal hover:text-onyx',
                                    )}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                    aria-controls="menu-utama"
                    className="ml-auto inline-flex size-11 items-center justify-center rounded-lg text-onyx md:hidden"
                >
                    {open ? (
                        <X className="size-6" aria-hidden="true" />
                    ) : (
                        <Menu className="size-6" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                        {open ? 'Tutup menu' : 'Buka menu'}
                    </span>
                </button>
            </div>

            {open && (
                <nav
                    id="menu-utama"
                    aria-label="Navigasi utama"
                    className="border-t border-charcoal/10 bg-white md:hidden"
                >
                    <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-6">
                        {links.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    aria-current={
                                        isCurrent(link.href.url)
                                            ? 'page'
                                            : undefined
                                    }
                                    className={cn(
                                        'flex min-h-12 items-center border-l-2 pl-3 text-base font-semibold transition-colors',
                                        isCurrent(link.href.url)
                                            ? 'border-brand-accent text-brand'
                                            : 'border-transparent text-charcoal',
                                    )}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </header>
    );
}
