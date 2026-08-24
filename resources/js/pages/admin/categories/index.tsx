import { useForm } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import Modal from '@/components/admin/modal';
import Button from '@/components/ui/button';
import Field from '@/components/ui/field';
import Input from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import {
    destroy as destroyCategory,
    store as storeCategory,
    update as updateCategory,
} from '@/routes/admin/categories';
import type { CategoryRow } from '@/types';

type CategoriesIndexProps = {
    categories: CategoryRow[];
};

/** FR5-12 / US-012 — kategori berita, satu halaman untuk daftar dan form. */
export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    const createForm = useForm({ name: '', slug: '' });
    const editForm = useForm({ name: '', slug: '' });
    const [editing, setEditing] = useState<CategoryRow | null>(null);

    function create(event: FormEvent) {
        event.preventDefault();
        createForm.post(storeCategory.url(), {
            preserveScroll: true,
            onSuccess: () => createForm.reset(),
        });
    }

    function openEdit(category: CategoryRow) {
        editForm.setData({ name: category.name, slug: category.slug });
        editForm.clearErrors();
        setEditing(category);
    }

    function saveEdit(event: FormEvent) {
        event.preventDefault();

        if (editing === null) {
            return;
        }

        editForm.put(updateCategory.url(editing.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    }

    return (
        <AdminLayout title="Kategori">
            <form
                onSubmit={create}
                className="max-w-2xl space-y-4 rounded-xl border border-charcoal/15 p-5"
            >
                <h2 className="font-display text-lg font-semibold text-onyx">
                    Tambah kategori
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        id="name"
                        label="Nama"
                        error={createForm.errors.name}
                    >
                        <Input
                            id="name"
                            required
                            invalid={Boolean(createForm.errors.name)}
                            value={createForm.data.name}
                            onChange={(event) =>
                                createForm.setData('name', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        id="slug"
                        label="Slug (opsional)"
                        error={createForm.errors.slug}
                    >
                        <Input
                            id="slug"
                            placeholder="otomatis dari nama"
                            invalid={Boolean(createForm.errors.slug)}
                            value={createForm.data.slug}
                            onChange={(event) =>
                                createForm.setData('slug', event.target.value)
                            }
                        />
                    </Field>
                </div>

                <Button type="submit" disabled={createForm.processing}>
                    <Plus className="size-4" aria-hidden="true" />
                    {createForm.processing ? 'Menyimpan…' : 'Tambah'}
                </Button>
            </form>

            {categories.length === 0 ? (
                <p className="mt-6 text-sm text-charcoal">
                    Belum ada kategori.
                </p>
            ) : (
                <div className="mt-8 overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-charcoal/20">
                                <th
                                    scope="col"
                                    className="py-2 pr-4 font-semibold"
                                >
                                    Nama
                                </th>
                                <th
                                    scope="col"
                                    className="py-2 pr-4 font-semibold"
                                >
                                    Slug
                                </th>
                                <th
                                    scope="col"
                                    className="py-2 pr-4 font-semibold"
                                >
                                    Berita
                                </th>
                                <th scope="col" className="py-2 text-right">
                                    <span className="sr-only">Aksi</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr
                                    key={category.id}
                                    className="border-b border-charcoal/10"
                                >
                                    <td className="py-2 pr-4 font-medium text-onyx">
                                        {category.name}
                                    </td>
                                    <td className="py-2 pr-4 text-charcoal">
                                        {category.slug}
                                    </td>
                                    <td className="py-2 pr-4 text-charcoal">
                                        {category.postsCount}
                                    </td>
                                    <td className="py-2">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEdit(category)
                                                }
                                                aria-label={`Edit ${category.name}`}
                                                className="inline-flex size-11 items-center justify-center rounded-lg text-charcoal hover:bg-mist hover:text-onyx"
                                            >
                                                <Pencil
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            </button>

                                            {category.postsCount > 0 ? (
                                                <span className="text-xs text-charcoal">
                                                    Dipakai — tidak bisa dihapus
                                                </span>
                                            ) : (
                                                <ConfirmDelete
                                                    url={destroyCategory.url(
                                                        category.id,
                                                    )}
                                                    label={category.name}
                                                    title="Hapus kategori ini?"
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                open={editing !== null}
                title="Edit kategori"
                onClose={() => setEditing(null)}
            >
                <form onSubmit={saveEdit} className="space-y-4">
                    <Field
                        id="edit-name"
                        label="Nama"
                        error={editForm.errors.name}
                    >
                        <Input
                            id="edit-name"
                            required
                            invalid={Boolean(editForm.errors.name)}
                            value={editForm.data.name}
                            onChange={(event) =>
                                editForm.setData('name', event.target.value)
                            }
                        />
                    </Field>

                    <Field
                        id="edit-slug"
                        label="Slug"
                        error={editForm.errors.slug}
                    >
                        <Input
                            id="edit-slug"
                            invalid={Boolean(editForm.errors.slug)}
                            value={editForm.data.slug}
                            onChange={(event) =>
                                editForm.setData('slug', event.target.value)
                            }
                        />
                    </Field>

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setEditing(null)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={editForm.processing}>
                            {editForm.processing ? 'Menyimpan…' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
