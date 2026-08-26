import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import Field from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import {
    index as usersIndex,
    store as storeUser,
    update as updateUser,
} from '@/routes/admin/users';
import type { RoleOption } from '@/types';

type UserFormProps = {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        /** FR5-21 — the role selector is locked for this account. */
        isLastSuperadmin: boolean;
    } | null;
    roles: RoleOption[];
};

/** FR5-20 — buat/edit akun dengan pemilihan role. */
export default function UserForm({ user, roles }: UserFormProps) {
    const isEdit = user !== null;

    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        role: user?.role ?? 'editor',
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (user === null) {
            form.post(storeUser.url(), {
                onFinish: () => form.reset('password', 'password_confirmation'),
            });

            return;
        }

        form.put(updateUser.url(user.id), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <AdminLayout
            title={isEdit ? 'Edit akun' : 'Tambah akun'}
            actions={
                <Link
                    href={usersIndex()}
                    className={buttonVariants({ variant: 'ghost' })}
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Kembali ke daftar
                </Link>
            }
        >
            <form onSubmit={submit} className="max-w-xl space-y-6">
                <Field id="name" label="Nama" error={form.errors.name}>
                    <Input
                        id="name"
                        required
                        autoFocus={!isEdit}
                        autoComplete="name"
                        aria-invalid={Boolean(form.errors.name)}
                        value={form.data.name}
                        onChange={(event) =>
                            form.setData('name', event.target.value)
                        }
                    />
                </Field>

                <Field id="email" label="Email" error={form.errors.email}>
                    <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="username"
                        aria-invalid={Boolean(form.errors.email)}
                        value={form.data.email}
                        onChange={(event) =>
                            form.setData('email', event.target.value)
                        }
                    />
                </Field>

                <Field
                    id="password"
                    label={isEdit ? 'Kata sandi baru (opsional)' : 'Kata sandi'}
                    error={form.errors.password}
                >
                    <Input
                        id="password"
                        type="password"
                        required={!isEdit}
                        autoComplete="new-password"
                        aria-invalid={Boolean(form.errors.password)}
                        value={form.data.password}
                        onChange={(event) =>
                            form.setData('password', event.target.value)
                        }
                    />
                    {isEdit ? (
                        <p className="text-sm text-muted-foreground">
                            Biarkan kosong agar kata sandi tidak berubah.
                        </p>
                    ) : null}
                </Field>

                <Field
                    id="password_confirmation"
                    label="Ulangi kata sandi"
                    error={form.errors.password_confirmation}
                >
                    <Input
                        id="password_confirmation"
                        type="password"
                        required={!isEdit}
                        autoComplete="new-password"
                        value={form.data.password_confirmation}
                        onChange={(event) =>
                            form.setData(
                                'password_confirmation',
                                event.target.value,
                            )
                        }
                    />
                </Field>

                <Field id="role" label="Role" error={form.errors.role}>
                    <Select
                        value={form.data.role}
                        disabled={user?.isLastSuperadmin === true}
                        onValueChange={(value) => form.setData('role', value)}
                    >
                        <SelectTrigger
                            id="role"
                            className="w-full"
                            aria-invalid={Boolean(form.errors.role)}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {user?.isLastSuperadmin === true ? (
                        <p className="text-sm text-muted-foreground">
                            Ini satu-satunya Superadmin, jadi role-nya tidak
                            dapat diubah.
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Editor dapat mengelola berita, kategori, hero, dan
                            media. Superadmin juga mengelola jurusan,
                            pengaturan, dan pengguna.
                        </p>
                    )}
                </Field>

                <div className="border-t border-border pt-6">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
