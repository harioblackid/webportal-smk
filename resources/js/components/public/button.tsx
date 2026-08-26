import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'link';

const variants: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    tertiary: 'btn btn-tertiary',
    link: 'cursor-pointer hover:text-aw-primary',
};

/**
 * AstroWind's ui/Button, reduced to its class list.
 *
 * The template's buttons are pill-shaped anchors as often as they are real
 * <button> elements, so the styling is exported on its own rather than baked
 * into a component that would have to fake one or the other.
 */
export function buttonClasses(
    variant: ButtonVariant = 'secondary',
    className?: string,
): string {
    return cn(variants[variant], className);
}
