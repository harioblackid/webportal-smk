import { Link } from '@inertiajs/react';

import { buttonClasses } from '@/components/public/button';
import { cn } from '@/lib/utils';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginationProps = {
    links: PaginationLink[];
    lastPage: number;
    /** Overridden where the list is not berita — the admin media grid, say. */
    label?: string;
};

/** Laravel ships the previous/next labels with HTML entities in them. */
const readable = (label: string) =>
    label.replaceAll('&laquo;', '«').replaceAll('&raquo;', '»');

/**
 * Page state lives in the URL, so these are real links a visitor can bookmark
 * or share, not buttons that mutate client state. AstroWind's blog pagination
 * is prev/next only; the numbered rail here keeps the same tertiary styling.
 */
export default function Pagination({
    links,
    lastPage,
    label = 'Paginasi berita',
}: PaginationProps) {
    if (lastPage <= 1) {
        return null;
    }

    return (
        <nav aria-label={label} className="mt-10">
            <ul className="flex flex-wrap items-center justify-center gap-1.5">
                {links.map((link) => (
                    <li key={link.label}>
                        {link.url === null ? (
                            <span
                                className={buttonClasses(
                                    'tertiary',
                                    'pointer-events-none min-w-11 px-3 py-2 text-sm opacity-40 md:px-3',
                                )}
                            >
                                {readable(link.label)}
                            </span>
                        ) : (
                            <Link
                                href={link.url}
                                aria-current={link.active ? 'page' : undefined}
                                className={cn(
                                    buttonClasses(
                                        link.active ? 'primary' : 'tertiary',
                                        'min-w-11 px-3 py-2 text-sm md:px-3',
                                    ),
                                )}
                            >
                                {readable(link.label)}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
