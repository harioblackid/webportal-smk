import type { ComponentType, ReactNode } from 'react';

import Headline from '@/components/public/headline';
import WidgetWrapper from '@/components/public/widget-wrapper';

export type StatItem = {
    amount: string;
    title: string;
    icon?: ComponentType<{ className?: string }>;
};

type StatsProps = {
    id?: string;
    tagline?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    stats: StatItem[];
    isDark?: boolean;
};

/** AstroWind's widgets/Stats — big numerals divided by hairlines. */
export default function Stats({
    id,
    tagline,
    title,
    subtitle,
    stats,
    isDark = false,
}: StatsProps) {
    return (
        <WidgetWrapper
            id={id}
            isDark={isDark}
            containerClass="mx-auto max-w-6xl"
        >
            <Headline tagline={tagline} title={title} subtitle={subtitle} />

            <div className="-m-4 flex flex-wrap justify-center text-center">
                {stats.map(({ amount, title: statTitle, icon: Icon }) => (
                    <div
                        key={statTitle}
                        className="w-full min-w-[220px] p-4 text-center sm:w-1/2 md:w-1/4 md:border-r md:border-gray-200 md:last:border-none dark:md:border-slate-500"
                    >
                        {Icon && (
                            <div className="mx-auto mb-4 flex items-center justify-center text-aw-primary">
                                <Icon className="size-10" />
                            </div>
                        )}

                        <div className="font-heading text-[2.6rem] font-bold text-aw-primary lg:text-5xl xl:text-6xl dark:text-white">
                            {amount}
                        </div>

                        <div className="text-sm font-medium tracking-widest text-gray-800 uppercase lg:text-base dark:text-slate-400">
                            {statTitle}
                        </div>
                    </div>
                ))}
            </div>
        </WidgetWrapper>
    );
}
