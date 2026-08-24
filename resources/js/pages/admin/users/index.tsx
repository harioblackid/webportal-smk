import { Link, usePage } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import { buttonClasses } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import {
    create as createUser,
    destroy as destroyUser,
    edit as editUser,
} from '@/routes/admin/users';
import type { UserRow } from '@/types';

type UsersIndexProps = {
    users: UserRow[];
};

/** US-016 — daftar akun & role. Superadmin only (FR5-2). */
export default function UsersIndex({ users }: UsersIndexProps) {
    const currentUserId = usePage().props.auth.user?.id;
    const superadmins = users.filter(
        (user) => user.role === 'superadmin',
    ).length;

    return (
        <AdminLayout
            title="Pengguna"
            actions={
                <Link href={createUser()} className={buttonClasses()}>
                    <Plus className="size-4" aria-hidden="true" />
                    Tambah akun
                </Link>
            }
        >
            <p className="text-sm text-charcoal">
                Akun hanya dibuat dari halaman ini — situs tidak menyediakan
                pendaftaran publik.
            </p>

            <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-charcoal/20">
                            <th scope="col" className="py-2 pr-4 font-semibold">
                                Nama
                            </th>
                            <th scope="col" className="py-2 pr-4 font-semibold">
                                Email
                            </th>
                            <th scope="col" className="py-2 pr-4 font-semibold">
                                Role
                            </th>
                            <th scope="col" className="py-2 pr-4 font-semibold">
                                Dibuat
                            </th>
                            <th scope="col" className="py-2 text-right">
                                <span className="sr-only">Aksi</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            // FR5-21 is enforced server-side; the button is
                            // hidden so nobody is offered an action that will
                            // be refused.
                            const isLastSuperadmin =
                                user.role === 'superadmin' && superadmins <= 1;
                            const isSelf = user.id === currentUserId;

                            return (
                                <tr
                                    key={user.id}
                                    className="border-b border-charcoal/10"
                                >
                                    <td className="py-2 pr-4">
                                        <Link
                                            href={editUser(user.id)}
                                            className="font-medium text-onyx underline-offset-4 hover:underline"
                                        >
                                            {user.name}
                                        </Link>
                                    </td>
                                    <td className="py-2 pr-4 text-charcoal">
                                        {user.email}
                                    </td>
                                    <td className="py-2 pr-4">
                                        <span className="inline-block rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-onyx">
                                            {user.roleLabel}
                                        </span>
                                    </td>
                                    <td className="py-2 pr-4 whitespace-nowrap text-charcoal">
                                        {user.createdAtLabel ?? '—'}
                                    </td>
                                    <td className="py-2">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={editUser(user.id)}
                                                aria-label={`Edit ${user.name}`}
                                                className="inline-flex size-11 items-center justify-center rounded-lg text-charcoal hover:bg-mist hover:text-onyx"
                                            >
                                                <Pencil
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            </Link>

                                            {isLastSuperadmin || isSelf ? (
                                                <span className="text-xs text-charcoal">
                                                    {isSelf
                                                        ? 'Akun Anda'
                                                        : 'Superadmin terakhir'}
                                                </span>
                                            ) : (
                                                <ConfirmDelete
                                                    url={destroyUser.url(
                                                        user.id,
                                                    )}
                                                    label={user.name}
                                                    title="Hapus akun ini?"
                                                    description={`Akun "${user.name}" tidak lagi bisa masuk ke admin.`}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
