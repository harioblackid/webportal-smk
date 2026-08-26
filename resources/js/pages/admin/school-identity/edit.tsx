import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import PageToggle from '@/components/admin/page-toggle';
import UnsavedGuard from '@/components/admin/unsaved-guard';
import { Button } from '@/components/ui/button';
import Field from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { update as updateSchoolIdentity } from '@/routes/admin/school-identity';
import type { IdentityGroup } from '@/types';

type SchoolIdentityEditProps = {
    groups: IdentityGroup[];
    values: Record<string, string | null>;
    /** Whether /profil/identitas is published. */
    enabled: boolean;
};

/** The toggle rides in the same form as the fields, so one save covers both. */
type IdentityFormValues = Record<string, string | boolean> & {
    enabled: boolean;
};

/**
 * Identitas sekolah (Superadmin) — the form is generated from the catalogue in
 * App\Support\SchoolIdentityFields rather than written out by hand, so a field
 * added on the PHP side appears here without a matching edit.
 */
export default function SchoolIdentityEdit({
    groups,
    values,
    enabled,
}: SchoolIdentityEditProps) {
    const initial: IdentityFormValues = { enabled };

    for (const group of groups) {
        for (const field of group.fields) {
            initial[field.key] = values[field.key] ?? '';
        }
    }

    const form = useForm<IdentityFormValues>(initial);
    const isOn = form.data.enabled;

    function submit(event: FormEvent) {
        event.preventDefault();
        form.put(updateSchoolIdentity.url(), { preserveScroll: true });
    }

    // form.data is a union because the toggle shares it; every field control
    // below is a string control, so narrow once here rather than at each one.
    function text(key: string): string {
        const value = form.data[key];

        return typeof value === 'string' ? value : '';
    }

    return (
        <AdminLayout title="Identitas sekolah">
            <p className="text-sm text-muted-foreground">
                Data resmi sekolah. Field bertanda{' '}
                <span className="text-destructive">*</span> wajib diisi; field
                yang dibiarkan kosong tidak ditampilkan di halaman publik.
            </p>

            <UnsavedGuard dirty={form.isDirty} />

            <form onSubmit={submit} className="mt-6 max-w-3xl space-y-8">
                <PageToggle
                    id="enabled"
                    label="Halaman Identitas Sekolah"
                    description="Saat dinonaktifkan, halaman hilang dari menu publik, alamatnya menjawab 404, dan seluruh field di bawah tidak dapat diubah."
                    checked={isOn}
                    onChange={(checked) => form.setData('enabled', checked)}
                />

                <fieldset
                    disabled={!isOn}
                    className="space-y-8 disabled:opacity-60"
                >
                    {groups.map((group) => (
                        <div
                            key={group.key}
                            className="space-y-5 rounded-xl border border-border p-5"
                        >
                            <h2 className="text-lg font-semibold text-foreground">
                                {group.label}
                            </h2>

                            {group.fields.map((field) => (
                                <Field
                                    key={field.key}
                                    id={field.key}
                                    label={
                                        field.required
                                            ? `${field.label} *`
                                            : field.label
                                    }
                                    hint={field.hint ?? undefined}
                                    error={form.errors[field.key]}
                                >
                                    {field.type === 'select' ? (
                                        <Select
                                            disabled={!isOn}
                                            value={
                                                text(field.key) === ''
                                                    ? undefined
                                                    : text(field.key)
                                            }
                                            onValueChange={(value) =>
                                                form.setData(field.key, value)
                                            }
                                        >
                                            <SelectTrigger
                                                id={field.key}
                                                className="w-full"
                                                aria-invalid={Boolean(
                                                    form.errors[field.key],
                                                )}
                                            >
                                                <SelectValue placeholder="Pilih…" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {field.options.map((option) => (
                                                    <SelectItem
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : field.type === 'textarea' ? (
                                        <Textarea
                                            id={field.key}
                                            rows={2}
                                            maxLength={field.max}
                                            aria-invalid={Boolean(
                                                form.errors[field.key],
                                            )}
                                            value={text(field.key)}
                                            onChange={(event) =>
                                                form.setData(
                                                    field.key,
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id={field.key}
                                                type={field.type}
                                                maxLength={
                                                    field.type === 'date'
                                                        ? undefined
                                                        : field.max
                                                }
                                                aria-invalid={Boolean(
                                                    form.errors[field.key],
                                                )}
                                                value={text(field.key)}
                                                onChange={(event) =>
                                                    form.setData(
                                                        field.key,
                                                        event.target.value,
                                                    )
                                                }
                                            />

                                            {field.suffix === null ? null : (
                                                <span className="shrink-0 text-sm text-muted-foreground">
                                                    {field.suffix}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Field>
                            ))}
                        </div>
                    ))}
                </fieldset>

                <div className="border-t border-border pt-6">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
