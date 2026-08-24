import type { ReactNode } from 'react';

type FieldProps = {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
};

/** Label + control + error message, wired together for screen readers. */
export default function Field({ id, label, error, children }: FieldProps) {
    return (
        <div className="space-y-1.5">
            <label
                htmlFor={id}
                className="text-onyx block text-sm font-semibold"
            >
                {label}
            </label>

            {children}

            {error ? (
                <p id={`${id}-error`} role="alert" className="text-sm text-red-700">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
