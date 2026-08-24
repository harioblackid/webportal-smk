import AdminLayout from '@/layouts/admin-layout';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
};

type UsersIndexProps = {
    users: AdminUser[];
};

export default function UsersIndex({ users }: UsersIndexProps) {
    return (
        <AdminLayout title="Pengguna">
            <p className="text-sm text-charcoal">
                Halaman ini hanya dapat diakses Superadmin. Editor yang membuka
                URL-nya menerima 403 (FR5-2).
            </p>

            <div className="mt-5 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-charcoal/20">
                            <th scope="col" className="py-2 pr-4 font-semibold">
                                Nama
                            </th>
                            <th scope="col" className="py-2 pr-4 font-semibold">
                                Email
                            </th>
                            <th scope="col" className="py-2 font-semibold">
                                Role
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b border-charcoal/10"
                            >
                                <td className="py-2 pr-4 text-onyx">
                                    {user.name}
                                </td>
                                <td className="py-2 pr-4 text-charcoal">
                                    {user.email}
                                </td>
                                <td className="py-2">
                                    <span className="inline-block rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-onyx">
                                        {user.role}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="mt-6 text-sm text-charcoal">
                CRUD pengguna lengkap adalah US-016.
            </p>
        </AdminLayout>
    );
}
