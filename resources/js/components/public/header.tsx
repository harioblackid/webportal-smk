import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { buttonClasses } from '@/components/public/button';
import ToggleMenu from '@/components/public/toggle-menu';
import ToggleTheme from '@/components/public/toggle-theme';
import { cn } from '@/lib/utils';
import { home, kontak, profil } from '@/routes';
import { index as majorsIndex } from '@/routes/majors';
import { index as postsIndex } from '@/routes/posts';

const links = [
    { text: 'Beranda', href: home() },
    { text: 'Profil', href: profil() },
    { text: 'Jurusan', href: majorsIndex() },
    { text: 'Berita', href: postsIndex() },
    { text: 'Kontak', href: kontak() },
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
    const [scrolled, setScrolled] = useState(false);
    const [lastUrl, setLastUrl] = useState(url);

    // A client-side visit swaps the page without unmounting the header, so the
    // panel has to be told to close. Adjusting during render rather than in an
    // effect keeps it to a single pass and covers back/forward too.
    if (url !== lastUrl) {
        setLastUrl(url);
        setOpen(false);
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

    const isCurrent = (href: string) =>
        href === '/' ? url === '/' : url === href || url.startsWith(`${href}/`);

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
                        {links.map((link) => (
                            <li key={link.text}>
                                <Link
                                    href={link.href}
                                    aria-current={
                                        isCurrent(link.href.url)
                                            ? 'page'
                                            : undefined
                                    }
                                    className={cn(
                                        'flex items-center px-4 py-3 whitespace-nowrap hover:text-aw-primary dark:hover:text-white',
                                        isCurrent(link.href.url) &&
                                            'text-aw-primary dark:text-white',
                                    )}
                                >
                                    {link.text}
                                </Link>
                            </li>
                        ))}
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
