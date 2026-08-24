import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary';

/**
 * Button styling per prd-03 §3.3.
 *
 * Primary fills with --green and flips to --lime-moss on hover; secondary is
 * the same colour as an outline. Both keep a 44px minimum touch target (AD-2)
 * and a visible focus ring (FR2-6).
 *
 * Exported on its own so anchors can borrow the same look without pretending
 * to be a <button>.
 */
export function buttonClasses(
    variant: ButtonVariant = 'primary',
    className?: string,
): string {
    return cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5',
        'text-base font-semibold transition-colors duration-150',
        'focus-visible:ring-brand-accent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' &&
            'bg-brand text-white hover:bg-brand-accent active:bg-brand-accent/90',
        variant === 'secondary' &&
            'border-brand text-brand hover:bg-brand border-2 bg-transparent hover:text-white active:bg-brand-accent active:border-brand-accent',
        className,
    );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

export default function Button({
    variant = 'primary',
    className,
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={buttonClasses(variant, className)}
            {...props}
        />
    );
}
