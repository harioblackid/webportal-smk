import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

type RepeaterProps<T> = {
    legend: string;
    items: T[];
    onChange: (items: T[]) => void;
    /** A fresh, empty row — what the add button appends. */
    blank: () => T;
    addLabel: string;
    emptyLabel: string;
    /** Mirrors the server-side cap so the button stops before the validator. */
    max?: number;
    hint?: string;
    children: (
        item: T,
        index: number,
        update: (patch: Partial<T>) => void,
    ) => ReactNode;
};

/**
 * A list of rows the admin can grow, shrink, and reorder.
 *
 * Order is the array's own order — there is no sort field in the form. The
 * controller writes the index as sort_order on save, so what the admin drags
 * into place is exactly what the public page shows.
 */
export default function Repeater<T>({
    legend,
    items,
    onChange,
    blank,
    addLabel,
    emptyLabel,
    max,
    hint,
    children,
}: RepeaterProps<T>) {
    function update(index: number, patch: Partial<T>) {
        onChange(
            items.map((item, at) =>
                at === index ? { ...item, ...patch } : item,
            ),
        );
    }

    function remove(index: number) {
        onChange(items.filter((_, at) => at !== index));
    }

    function move(index: number, by: number) {
        const target = index + by;

        if (target < 0 || target >= items.length) {
            return;
        }

        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    }

    const full = max !== undefined && items.length >= max;

    return (
        <fieldset className="space-y-4 rounded-xl border border-border p-5">
            <legend className="px-1 text-lg font-semibold text-foreground">
                {legend}
            </legend>

            {hint === undefined ? null : (
                <p className="text-sm text-muted-foreground">{hint}</p>
            )}

            {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    {emptyLabel}
                </p>
            ) : (
                <ol className="space-y-4">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className="rounded-lg border border-border p-4"
                        >
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    #{index + 1}
                                </span>

                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Naikkan baris ${index + 1}`}
                                        disabled={index === 0}
                                        onClick={() => move(index, -1)}
                                    >
                                        <ChevronUp className="size-4" />
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Turunkan baris ${index + 1}`}
                                        disabled={index === items.length - 1}
                                        onClick={() => move(index, 1)}
                                    >
                                        <ChevronDown className="size-4" />
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Hapus baris ${index + 1}`}
                                        onClick={() => remove(index)}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            </div>

                            {children(item, index, (patch) =>
                                update(index, patch),
                            )}
                        </li>
                    ))}
                </ol>
            )}

            <Button
                type="button"
                variant="outline"
                disabled={full}
                onClick={() => onChange([...items, blank()])}
            >
                <Plus className="size-4" aria-hidden="true" />
                {addLabel}
            </Button>

            {full && (
                <p className="text-sm text-muted-foreground">
                    Batas maksimal {max} baris sudah tercapai.
                </p>
            )}
        </fieldset>
    );
}
