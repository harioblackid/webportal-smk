import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type HeadlineProps = {
    title?: ReactNode;
    subtitle?: ReactNode;
    tagline?: ReactNode;
    /** Rendered as <h1> on a page that has no other heading above it. */
    as?: 'h1' | 'h2';
    id?: string;
    classes?: {
        container?: string;
        title?: string;
        subtitle?: string;
    };
};

/** AstroWind's ui/Headline — tagline, heading, and lede, centred by default. */
export default function Headline({
    title,
    subtitle,
    tagline,
    as: Title = 'h2',
    id,
    classes = {},
}: HeadlineProps) {
    if (!title && !subtitle && !tagline) {
        return null;
    }

    return (
        <div
            className={cn(
                'mb-8 text-center md:mx-auto md:mb-12',
                classes.container ?? 'max-w-3xl',
            )}
        >
            {tagline && (
                <p className="text-base font-bold tracking-wide text-aw-secondary uppercase dark:text-blue-200">
                    {tagline}
                </p>
            )}

            {title && (
                <Title
                    id={id}
                    className={cn(
                        'font-heading text-3xl leading-tight font-bold tracking-tighter text-aw-heading',
                        classes.title ?? 'text-3xl md:text-4xl',
                    )}
                >
                    {title}
                </Title>
            )}

            {subtitle && (
                <p
                    className={cn(
                        'mt-4 text-aw-muted',
                        classes.subtitle ?? 'text-xl',
                    )}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}
