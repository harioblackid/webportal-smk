import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

import { buttonClasses } from '@/components/public/button';
import ToggleMenu from '@/components/public/toggle-menu';
import ToggleTheme from '@/components/public/toggle-theme';
import { cn, toUrl } from '@/lib/utils';
import { ekskul, home, identitas, kontak, profil, spektrum } from '@/routes';
import { index as galleryIndex } from '@/routes/gallery';
import { index as majorsIndex } from '@/routes/majors';
import { index as postsIndex } from '@/routes/posts';
import type { Site } from '@/types';

type NavLink = {
    text: string;
    href: string;
    /** Which site.pages flag decides whether this item renders at all. */
    page?: keyof Site['pages'];
};

type NavEntry = NavLink & {
    children?: NavLink[];
};

/**
 * The public menu (prd-04 §2, restructured).
 *
 * A parent with children is a dropdown; its own href is the first thing under
 * it, so tapping the parent on a phone still goes somewhere sensible.
 */
const entries: NavEntry[] = [
    { text: 'Beranda', href: toUrl(home()) },
    {
        text: 'Profil',
        href: toUrl(profil()),
        children: [
            { text: 'Visi Misi', href: toUrl(profil()) },
            {
                text: 'Identitas Sekolah',
                href: toUrl(identitas()),
                page: 'identitas',
            },
            {
                text: 'Spektrum Kurikulum',
                href: toUrl(spektrum()),
                page: 'spektrum',
            },
        ],
    },
    {
        text: 'Halaman',
        href: toUrl(majorsIndex()),
        children: [
            { text: 'Jurusan', href: toUrl(majorsIndex()) },
            { text: 'Gallery', href: toUrl(galleryIndex()), page: 'gallery' },
            {
                text: 'Ekstrakurikuler',
                href: toUrl(ekskul()),
                page: 'ekskul',
            },
        ],
    },
    { text: 'Berita', href: toUrl(postsIndex()) },
    { text: 'Kontak', href: toUrl(kontak()) },
];

/**
 * AstroWind's widgets/Header — sticky, three-column on desktop, full-screen
 * panel under `md`. The `scroll` class drives the frosted backdrop declared in
 * app.css; AstroWind toggles it from a custom element, which is a plain effect
 * here.
 */
export default function Header() {
    const { url, props } = usePage();
    const [open, setOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [lastUrl, setLastUrl] = useState(url);

    // A client-side visit swaps the page without unmounting the header, so the
    // panel has to be told to close. Adjusting during render rather than in an
    // effect keeps it to a single pass and covers back/forward too.
    if (url !== lastUrl) {
        setLastUrl(url);
        setOpen(false);
        setOpenMenu(null);
    }

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);

        onScroll();
        document.addEventListener('scroll', onScroll, { passive: true });

        return () => document.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('overflow-hidden', open);

        return () => document.body.classList.remove('overflow-hidden');
    }, [open]);

    // Escape closes a dropdown before it closes the panel, which is the order
    // a keyboard user expects when both are open.
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenMenu(null);
            }
        };

        document.addEventListener('keydown', onKey);

        return () => document.removeEventListener('keydown', onKey);
    }, []);

    const isCurrent = (href: string) =>
        href === '/' ? url === '/' : url === href || url.startsWith(`${href}/`);

    // Items whose page is switched off never render. The route answers 404 for
    // them anyway — this only keeps the menu honest about what exists.
    const visible = (links: NavLink[]) =>
        links.filter(
            (link) => link.page === undefined || props.site.pages[link.page],
        );

    const isBranchCurrent = (entry: NavEntry) =>
        entry.children === undefined
            ? isCurrent(entry.href)
            : visible(entry.children).some((child) => isCurrent(child.href));

    return (
        <header
            id="header"
            className={cn(
                'sticky top-0 z-40 mx-auto w-full flex-none border-b border-gray-50/0 transition-[opacity] ease-in-out',
                scrolled && 'scroll',
                open && 'expanded h-screen bg-page',
            )}
        >
            <div className="absolute inset-0" />

            <div className="relative mx-auto w-full max-w-7xl px-3 py-3 text-aw-default md:grid md:grid-cols-3 md:items-center md:px-6">
                <div className="flex justify-between">
                    <Link className="flex items-center gap-2.5" href={home()}>
                        {/* alt is empty on purpose: the school name sits right
                            beside it, so a label here would be read twice. */}
                        <img
                            src="/logo-smk.png"
                            alt=""
                            width={36}
                            height={36}
                            className="size-9 shrink-0 object-contain"
                        />
                        <span className="self-center text-xl font-bold whitespace-nowrap text-aw-heading md:text-lg">
                            {props.site.name}
                        </span>
                    </Link>

                    <div className="flex items-center md:hidden">
                        <ToggleMenu
                            expanded={open}
                            onToggle={() => setOpen((value) => !value)}
                        />
                    </div>
                </div>

                <nav
                    aria-label="Navigasi utama"
                    className={cn(
                        'w-full items-center overflow-x-hidden overflow-y-auto text-aw-default md:mx-5 md:flex md:w-auto md:justify-self-center md:overflow-visible',
                        open ? 'flex' : 'hidden md:flex',
                    )}
                >
                    <ul className="flex w-full flex-col text-xl font-medium tracking-[0.01rem] md:w-auto md:flex-row md:justify-center md:self-center md:text-[0.9375rem]">
                        {entries.map((entry) => {
                            const children =
                                entry.children === undefined
                                    ? []
                                    : visible(entry.children);

                            const active = isBranchCurrent(entry);

                            if (children.length === 0) {
                                return (
                                    <li key={entry.text}>
                                        <Link
                                            href={entry.href}
                                            aria-current={
                                                active ? 'page' : undefined
                                            }
                                            className={cn(
                                                'flex items-center px-4 py-3 whitespace-nowrap hover:text-aw-primary dark:hover:text-white',
                                                active &&
                                                    'text-aw-primary dark:text-white',
                                            )}
                                        >
                                            {entry.text}
                                        </Link>
                                    </li>
                                );
                            }

                            const expanded = openMenu === entry.text;

                            return (
                                <li
                                    key={entry.text}
                                    className="md:relative"
                                    onMouseEnter={() => setOpenMenu(entry.text)}
                                    onMouseLeave={() => setOpenMenu(null)}
                                >
                                    <button
                                        type="button"
                                        aria-expanded={expanded}
                                        onClick={() =>
                                            setOpenMenu(
                                                expanded ? null : entry.text,
                                            )
                                        }
                                        className={cn(
                                            'flex w-full items-center gap-1 px-4 py-3 whitespace-nowrap hover:text-aw-primary md:w-auto dark:hover:text-white',
                                            active &&
                                                'text-aw-primary dark:text-white',
                                        )}
                                    >
                                        {entry.text}
                                        <ChevronDown
                                            className={cn(
                                                'size-4 transition-transform',
                                                expanded && 'rotate-180',
                                            )}
                                            aria-hidden="true"
                                        />
                                    </button>

                                    <ul
                                        className={cn(
                                            'text-base md:absolute md:top-full md:left-0 md:min-w-56 md:rounded-lg md:border md:border-gray-200 md:bg-page md:py-2 md:shadow-lg md:dark:border-slate-700',
                                            expanded
                                                ? 'block'
                                                : 'hidden md:hidden',
                                        )}
                                    >
                                        {children.map((child) => (
                                            <li key={child.text}>
                                                <Link
                                                    href={child.href}
                                                    aria-current={
                                                        isCurrent(child.href)
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                    className={cn(
                                                        'flex items-center py-2 pr-4 pl-8 whitespace-nowrap hover:text-aw-primary md:px-4 dark:hover:text-white',
                                                        isCurrent(child.href) &&
                                                            'text-aw-primary dark:text-white',
                                                    )}
                                                >
                                                    {child.text}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div
                    className={cn(
                        'bottom-0 left-0 w-full items-center justify-end p-3 md:static md:mb-0 md:flex md:w-auto md:self-center md:justify-self-end md:p-0',
                        open ? 'fixed flex' : 'hidden md:flex',
                    )}
                >
                    <div className="flex w-full items-center justify-between md:w-auto">
                        <ToggleTheme />

                        {props.site.ppdb.enabled &&
                            props.site.ppdb.url !== null && (
                                <span className="ml-4">
                                    <a
                                        href={props.site.ppdb.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={buttonClasses(
                                            'primary',
                                            'ml-2 w-auto px-5.5 py-2.5 text-sm font-semibold shadow-none md:px-6',
                                        )}
                                    >
                                        Daftar PPDB
                                    </a>
                                </span>
                            )}
                    </div>
                </div>
            </div>
        </header>
    );
}
