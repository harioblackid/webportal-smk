import type { ReactNode } from 'react';

import Headline from '@/components/public/headline';
import WidgetWrapper from '@/components/public/widget-wrapper';

type CallToActionProps = {
    id?: string;
    tagline?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    isDark?: boolean;
};

/** AstroWind's widgets/CallToAction — a raised card centred in the column. */
export default function CallToAction({
    id,
    tagline,
    title,
    subtitle,
    actions,
    isDark = false,
}: CallToActionProps) {
    return (
        <WidgetWrapper
            id={id}
            isDark={isDark}
            containerClass="mx-auto max-w-6xl"
        >
            <div className="mx-auto max-w-3xl rounded-md p-6 text-center shadow-xl dark:border dark:border-slate-600 dark:shadow-none">
                <Headline
                    tagline={tagline}
                    title={title}
                    subtitle={subtitle}
                    id={id === undefined ? undefined : `${id}-title`}
                    classes={{
                        container: 'mb-0 md:mb-0',
                        title: 'text-4xl md:text-4xl font-bold tracking-tighter mb-4 font-heading',
                        subtitle: 'text-xl text-aw-muted dark:text-slate-400',
                    }}
                />

                {actions && (
                    <div className="m-auto mt-6 flex max-w-xs flex-col flex-nowrap gap-4 sm:max-w-md sm:flex-row sm:justify-center">
                        {actions}
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
