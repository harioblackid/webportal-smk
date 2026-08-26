import type { ComponentType, ReactNode } from 'react';

import Headline from '@/components/public/headline';
import WidgetWrapper from '@/components/public/widget-wrapper';
import { cn } from '@/lib/utils';

export type FeatureItem = {
    title: string;
    description: ReactNode;
    icon?: ComponentType<{ className?: string }>;
};

type FeaturesProps = {
    id?: string;
    tagline?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    items: FeatureItem[];
    columns?: 2 | 3 | 4;
    isDark?: boolean;
};

const columnsClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
} as const;

/** AstroWind's widgets/Features — a circular icon beside each blurb. */
export default function Features({
    id,
    tagline,
    title,
    subtitle,
    items,
    columns = 2,
    isDark = false,
}: FeaturesProps) {
    return (
        <WidgetWrapper id={id} isDark={isDark} containerClass="max-w-5xl">
            <Headline
                tagline={tagline}
                title={title}
                subtitle={subtitle}
                id={id === undefined ? undefined : `${id}-title`}
            />

            <div
                className={cn(
                    'mx-auto grid gap-8 md:gap-y-12',
                    columnsClass[columns],
                )}
            >
                {items.map(({ title: itemTitle, description, icon: Icon }) => (
                    <div key={itemTitle}>
                        <div className="flex max-w-md flex-row">
                            {Icon && (
                                <div className="flex justify-center">
                                    <Icon className="mr-4 size-7 rounded-full bg-aw-primary p-2 text-white md:size-12 md:p-3" />
                                </div>
                            )}

                            <div className="mt-0.5">
                                <h3 className="text-xl font-bold md:text-[1.3rem]">
                                    {itemTitle}
                                </h3>
                                <p className="mt-3 text-aw-muted">
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetWrapper>
    );
}
