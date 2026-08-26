import { Link } from '@inertiajs/react';

import { buttonVariants } from '@/components/ui/button';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginationProps = {
    links: PaginationLink[];
    lastPage: number;
    label: string;
};

/** Laravel ships the previous/next labels with HTML entities in them. */
const readable = (label: string) =>
    label.replaceAll('&laquo;', '«').replaceAll('&raquo;', '»');

/**
 * The CMS twin of the public paginator: same URL-driven links, drawn with the
 * starter kit's button variants instead of AstroWind's pills.
 */
export default function Pagination({
    links,
    lastPage,
    label,
}: PaginationProps) {
    if (lastPage <= 1) {
        return null;
    }

    return (
        <nav aria-label={label} className="mt-6">
            <ul className="flex flex-wrap items-center gap-1.5">
                {links.map((link) => (
                    <li key={link.label}>
                        {link.url === null ? (
                            <span
                                className={buttonVariants({
                                    variant: 'ghost',
                                    size: 'sm',
                                    className: 'pointer-events-none opacity-50',
                                })}
                            >
                                {readable(link.label)}
                            </span>
                        ) : (
                            <Link
                                href={link.url}
                                aria-current={link.active ? 'page' : undefined}
                                className={buttonVariants({
                                    variant: link.active
                                        ? 'default'
                                        : 'outline',
                                    size: 'sm',
                                })}
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
