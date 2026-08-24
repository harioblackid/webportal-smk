import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    invalid?: boolean;
};

/**
 * Text input sized to the 44px touch target from AD-2, with the focus ring
 * required by FR2-6. Errors are announced through aria-invalid, not colour
 * alone.
 */
export default function Input({ className, invalid, ...props }: InputProps) {
    return (
        <input
            aria-invalid={invalid || undefined}
            className={cn(
                'block min-h-11 w-full rounded-lg border px-3 py-2 text-base',
                'text-onyx placeholder:text-charcoal/60 bg-white',
                'focus-visible:ring-brand-accent focus-visible:border-brand focus-visible:ring-2 focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-60',
                invalid ? 'border-red-600' : 'border-charcoal/30',
                className,
            )}
            {...props}
        />
    );
}
