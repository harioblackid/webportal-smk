import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    invalid?: boolean;
};

/**
 * The native control rather than a listbox widget: it is already accessible,
 * and on the phones that dominate this traffic it opens the OS picker, which
 * beats anything reimplemented in React.
 */
export default function Select({ className, invalid, ...props }: SelectProps) {
    return (
        <select
            aria-invalid={invalid || undefined}
            className={cn(
                'block min-h-11 w-full rounded-lg border px-3 py-2 text-base',
                'bg-white text-onyx',
                'focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-60',
                invalid ? 'border-red-600' : 'border-charcoal/30',
                className,
            )}
            {...props}
        />
    );
}
