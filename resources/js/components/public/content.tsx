import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import Headline from '@/components/public/headline';
import WidgetWrapper from '@/components/public/widget-wrapper';
import { cn } from '@/lib/utils';

export type ContentItem = {
    title: string;
    description?: ReactNode;
};

type ContentProps = {
    id?: string;
    tagline?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    content?: ReactNode;
    items?: ContentItem[];
    image?: ReactNode;
    isReversed?: boolean;
    isAfterContent?: boolean;
    isDark?: boolean;
};

/** AstroWind's widgets/Content — two columns, copy beside a framed image. */
export default function Content({
    id,
    tagline,
    title,
    subtitle,
    content,
    items = [],
    image,
    isReversed = false,
    isAfterContent = false,
    isDark = false,
}: ContentProps) {
    return (
        <WidgetWrapper
            id={id}
            isDark={isDark}
            containerClass={cn(
                'mx-auto max-w-7xl',
                isAfterContent && 'pt-0 md:pt-0 lg:pt-0',
            )}
        >
            <Headline
                tagline={tagline}
                title={title}
                subtitle={subtitle}
                id={id === undefined ? undefined : `${id}-title`}
                classes={{
                    container: 'max-w-xl sm:mx-auto lg:max-w-2xl',
                    title: 'text-4xl md:text-5xl font-bold tracking-tighter mb-4 font-heading',
                    subtitle:
                        'max-w-3xl mx-auto sm:text-center text-xl text-aw-muted dark:text-slate-400',
                }}
            />

            <div className="mx-auto max-w-7xl p-4 md:px-8">
                <div
                    className={cn(
                        'md:flex md:gap-16',
                        isReversed && 'md:flex-row-reverse',
                    )}
                >
                    <div className="self-center md:basis-1/2">
                        {content && (
                            <div className="mb-12 text-lg dark:text-slate-400">
                                {content}
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className="mx-auto grid gap-8 gap-y-4 md:gap-y-8">
                                {items.map((item) => (
                                    <div key={item.title}>
                                        <div className="flex max-w-none flex-row">
                                            <div className="flex justify-center">
                                                <Check
                                                    className="mr-2 flex size-7 items-center justify-center rounded-full bg-green-600 p-1 text-gray-50 dark:bg-green-700"
                                                    aria-hidden="true"
                                                />
                                            </div>

                                            <div className="mt-0.5">
                                                <h3 className="ml-2 text-lg leading-6 font-medium dark:text-white">
                                                    {item.title}
                                                </h3>

                                                {item.description && (
                                                    <p className="mt-3 ml-2 text-aw-muted dark:text-slate-400">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {image && (
                        <div className="mt-10 md:mt-0 md:basis-1/2">
                            <div className="relative m-auto max-w-4xl">
                                {image}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </WidgetWrapper>
    );
}
