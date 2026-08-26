import { cn } from '@/lib/utils';

type PageToggleProps = {
    id: string;
    label: string;
    /** What switching it off actually does, in the admin's own terms. */
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

/**
 * The on/off switch that publishes or withdraws a public page.
 *
 * A plain <button role="switch"> rather than a Radix primitive: the starter
 * kit ships no switch, and this needs no popper, no portal, and no focus trap
 * — only a label, a checked state, and Space/Enter, all of which a button
 * already has.
 */
export default function PageToggle({
    id,
    label,
    description,
    checked,
    onChange,
}: PageToggleProps) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/40 p-5">
            <div className="min-w-0">
                <label
                    htmlFor={id}
                    className="text-base font-semibold text-foreground"
                >
                    {label}
                </label>

                <p
                    id={`${id}-description`}
                    className="mt-1 text-sm text-muted-foreground"
                >
                    {description}
                </p>
            </div>

            <button
                type="button"
                id={id}
                role="switch"
                aria-checked={checked}
                aria-describedby={`${id}-description`}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    checked ? 'bg-primary' : 'bg-input',
                )}
            >
                <span className="sr-only">
                    {checked ? 'Nonaktifkan' : 'Aktifkan'} {label}
                </span>

                <span
                    aria-hidden="true"
                    className={cn(
                        'pointer-events-none block size-5 rounded-full bg-background shadow transition-transform',
                        checked ? 'translate-x-5.5' : 'translate-x-0.5',
                    )}
                />
            </button>
        </div>
    );
}
