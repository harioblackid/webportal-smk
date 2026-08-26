import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type WidgetWrapperProps = {
    id?: string;
    isDark?: boolean;
    containerClass?: string;
    as?: ElementType;
    children: ReactNode;
};

/**
 * AstroWind's ui/WidgetWrapper: the section shell every widget sits in.
 *
 * It owns the page gutter, the max width, and the vertical rhythm, so the
 * widgets themselves never repeat those numbers.
 */
export default function WidgetWrapper({
    id,
    isDark = false,
    containerClass,
    as: Wrapper = 'section',
    children,
}: WidgetWrapperProps) {
    return (
        <Wrapper id={id} className="relative scroll-mt-[72px]">
            <div
                className="pointer-events-none absolute inset-0 -z-[1]"
                aria-hidden="true"
            >
                <div
                    className={cn(
                        'absolute inset-0',
                        isDark && 'bg-dark dark:bg-transparent',
                    )}
                />
            </div>

            <div
                className={cn(
                    'relative mx-auto max-w-7xl px-4 py-12 text-aw-default md:px-6 md:py-16 lg:py-20',
                    isDark && 'dark',
                    containerClass,
                )}
            >
                {children}
            </div>
        </Wrapper>
    );
}
