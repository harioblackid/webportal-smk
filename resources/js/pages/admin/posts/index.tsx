import { Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import Pagination from '@/components/public/pagination';
import Button, { buttonClasses } from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import {
    create as createPost,
    destroy as destroyPost,
    edit as editPost,
    index as postsIndex,
} from '@/routes/admin/posts';
import type { Paginated, PostRow } from '@/types';

type PostsIndexProps = {
    posts: Paginated<PostRow>;
    filters: {
        q: string;
        status: string;
    };
};

/** FR5-7 — daftar berita dengan pencarian & filter status. */
export default function PostsIndex({ posts, filters }: PostsIndexProps) {
    const [q, setQ] = useState(filters.q);
    const [status, setStatus] = useState(filters.status);

    function search(event: FormEvent) {
        event.preventDefault();

        // replace: true keeps the back button pointing at the page before the
        // list rather than at every refinement of the filter.
        router.get(
            postsIndex.url(),
            { q, status },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AdminLayout
            title="Berita & Pengumuman"
            actions={
                <Link href={createPost()} className={buttonClasses()}>
                    <Plus className="size-4" aria-hidden="true" />
                    Tulis berita
                </Link>
            }
        >
            <form
                onSubmit={search}
                className="flex flex-wrap items-end gap-3 rounded-xl border border-charcoal/15 p-4"
            >
                <div className="min-w-48 flex-1 space-y-1.5">
                    <label
                        htmlFor="q"
                        className="block text-sm font-semibold text-onyx"
                    >
                        Cari judul
                    </label>
                    <Input
                        id="q"
                        name="q"
                        type="search"
                        value={q}
                        placeholder="mis. PPDB"
                        onChange={(event) => setQ(event.target.value)}
                    />
                </div>

                <div className="w-44 space-y-1.5">
                    <label
                        htmlFor="status"
                        className="block text-sm font-semibold text-onyx"
                    >
                        Status
                    </label>
                    <Select
                        id="status"
                        name="status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                    >
                        <option value="">Semua</option>
                        <option value="published">Terbit</option>
                        <option value="draft">Draf</option>
                    </Select>
                </div>

                <Button type="submit">
                    <Search className="size-4" aria-hidden="true" />
                    Cari
                </Button>
            </form>

            {posts.data.length === 0 ? (
                <p className="mt-6 text-sm text-charcoal">
                    Tidak ada berita yang cocok dengan filter ini.
                </p>
            ) : (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-charcoal/20">
                                <th
                                    scope="col"
                                    className="py-2 pr-4 font-semibold"
                                >
                                    Judul
                                </th>
                                <th
                                    scope="col"
                                    className="py-2 pr-4 font-semibold"
                                >
                                    Kategori
                                </th>
                                <th
                                    scope="col"
                                    className="py-2 pr-4 font-semibold"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="py-2 pr-4 font-semibold"
                                >
                                    Tanggal
                                </th>
                                <th scope="col" className="py-2 text-right">
                                    <span className="sr-only">Aksi</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.data.map((post) => (
                                <tr
                                    key={post.id}
                                    className="border-b border-charcoal/10"
                                >
                                    <td className="py-2 pr-4">
                                        <Link
                                            href={editPost(post.id)}
                                            className="font-medium text-onyx underline-offset-4 hover:underline"
                                        >
                                            {post.title}
                                        </Link>
                                        <span className="block text-xs text-charcoal">
                                            {post.type === 'pengumuman'
                                                ? 'Pengumuman'
                                                : 'Berita'}{' '}
                                            · /{post.slug}
                                        </span>
                                    </td>
                                    <td className="py-2 pr-4 text-charcoal">
                                        {post.category ?? '—'}
                                    </td>
                                    <td className="py-2 pr-4">
                                        <span
                                            className={
                                                post.status === 'published'
                                                    ? 'inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand'
                                                    : 'inline-block rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-charcoal'
                                            }
                                        >
                                            {post.status === 'published'
                                                ? 'Terbit'
                                                : 'Draf'}
                                        </span>
                                    </td>
                                    <td className="py-2 pr-4 whitespace-nowrap text-charcoal">
                                        {post.publishedAtLabel ?? '—'}
                                    </td>
                                    <td className="py-2">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={editPost(post.id)}
                                                aria-label={`Edit ${post.title}`}
                                                className="inline-flex size-11 items-center justify-center rounded-lg text-charcoal hover:bg-mist hover:text-onyx"
                                            >
                                                <Pencil
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            </Link>

                                            <ConfirmDelete
                                                url={destroyPost.url(post.id)}
                                                label={post.title}
                                                title="Hapus berita ini?"
                                                description={`Berita "${post.title}" dihapus dengan soft delete, jadi masih bisa dipulihkan lewat basis data.`}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination
                links={posts.links}
                lastPage={posts.last_page}
                label="Paginasi daftar berita"
            />
        </AdminLayout>
    );
}
