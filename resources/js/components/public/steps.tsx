import type { ReactNode } from 'react';

import Headline from '@/components/public/headline';
import type { TimelineItem } from '@/components/public/timeline';
import Timeline from '@/components/public/timeline';
import WidgetWrapper from '@/components/public/widget-wrapper';
import { cn } from '@/lib/utils';

type StepsProps = {
    id?: string;
    tagline?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    items: TimelineItem[];
    image?: ReactNode;
    isReversed?: boolean;
    isDark?: boolean;
};

/** AstroWind's widgets/Steps — a timeline beside an optional tall image. */
export default function Steps({
    id,
    tagline,
    title,
    subtitle,
    items,
    image,
    isReversed = false,
    isDark = false,
}: StepsProps) {
    return (
        <WidgetWrapper id={id} isDark={isDark} containerClass="max-w-5xl">
            <div
                className={cn(
                    'flex flex-col gap-8 md:gap-12',
                    isReversed && 'md:flex-row-reverse',
                    image && 'md:flex-row',
                )}
            >
                <div
                    className={cn(
                        'md:self-center md:py-4',
                        image ? 'md:basis-1/2' : 'w-full',
                    )}
                >
                    <Headline
                        tagline={tagline}
                        title={title}
                        subtitle={subtitle}
                        id={id === undefined ? undefined : `${id}-title`}
                        classes={{
                            container: 'text-left',
                            title: 'text-3xl lg:text-4xl',
                        }}
                    />

                    <Timeline items={items} />
                </div>

                {image && <div className="relative md:basis-1/2">{image}</div>}
            </div>
        </WidgetWrapper>
    );
}
