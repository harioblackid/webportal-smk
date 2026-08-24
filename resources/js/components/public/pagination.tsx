import { Link } from '@inertiajs/react';

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
 * FR4-6 — page state lives in the URL, so these are real links a visitor can
 * bookmark or share, not buttons that mutate client state.
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
                            <span className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm text-charcoal/40">
                                {readable(link.label)}
                            </span>
                        ) : (
                            <Link
                                href={link.url}
                                aria-current={link.active ? 'page' : undefined}
                                className={cn(
                                    'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors',
                                    link.active
                                        ? 'bg-brand text-white'
                                        : 'text-charcoal hover:bg-mist hover:text-onyx',
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
