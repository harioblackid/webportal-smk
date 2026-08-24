import type { TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    invalid?: boolean;
};

/** The multi-line twin of <Input>, same border, focus ring, and error state. */
export default function Textarea({
    className,
    invalid,
    rows = 3,
    ...props
}: TextareaProps) {
    return (
        <textarea
            rows={rows}
            aria-invalid={invalid || undefined}
            className={cn(
                'block w-full rounded-lg border px-3 py-2 text-base',
                'bg-white text-onyx placeholder:text-charcoal/60',
                'focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-60',
                invalid ? 'border-red-600' : 'border-charcoal/30',
                className,
            )}
            {...props}
        />
    );
}
