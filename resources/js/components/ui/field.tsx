import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';

type FieldProps = {
    id: string;
    label: string;
    error?: string;
    /** Explanatory copy shown under the label, before the control. */
    hint?: string;
    children: ReactNode;
};

/** Label + control + error message, wired together for screen readers. */
export default function Field({
    id,
    label,
    error,
    hint,
    children,
}: FieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>

            {hint ? (
                <p className="text-sm text-muted-foreground">{hint}</p>
            ) : null}

            {children}

            <InputError message={error} id={`${id}-error`} role="alert" />
        </div>
    );
}
