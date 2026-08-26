import type { ComponentType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type TimelineItem = {
    title: string;
    description?: ReactNode;
    icon?: ComponentType<{ className?: string }>;
};

/** AstroWind's ui/Timeline — the numbered rail behind widgets/Steps. */
export default function Timeline({ items }: { items: TimelineItem[] }) {
    return (
        <div>
            {items.map(({ title, description, icon: Icon }, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={title} className="flex">
                        <div className="mr-4 flex flex-col items-center">
                            <div>
                                <div className="flex size-10 items-center justify-center rounded-full border-2 border-aw-primary">
                                    {Icon ? (
                                        <Icon className="size-6 text-aw-primary" />
                                    ) : (
                                        <span className="font-bold text-aw-primary">
                                            {index + 1}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div
                                className={cn(
                                    'h-full w-px bg-black/10 dark:bg-slate-400/50',
                                    isLast && 'hidden',
                                )}
                            />
                        </div>

                        <div className={cn('pt-1', !isLast && 'pb-8')}>
                            <p className="mb-2 text-xl font-bold text-aw-heading dark:text-slate-300">
                                {title}
                            </p>

                            {description && (
                                <p className="text-aw-muted">{description}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
