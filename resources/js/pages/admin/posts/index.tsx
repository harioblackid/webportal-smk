import { Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import Pagination from '@/components/admin/pagination';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

/** Radix's Select reserves the empty string, so "semua" needs a sentinel. */
const ANY_STATUS = 'all';

/** FR5-7 — daftar berita dengan pencarian & filter status. */
export default function PostsIndex({ posts, filters }: PostsIndexProps) {
    const [q, setQ] = useState(filters.q);
    const [status, setStatus] = useState(filters.status || ANY_STATUS);

    function search(event: FormEvent) {
        event.preventDefault();

        // replace: true keeps the back button pointing at the page before the
        // list rather than at every refinement of the filter.
        router.get(
            postsIndex.url(),
            { q, status: status === ANY_STATUS ? '' : status },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AdminLayout
            title="Berita & Pengumuman"
            actions={
                <Link href={createPost()} className={buttonVariants()}>
                    <Plus className="size-4" aria-hidden="true" />
                    Tulis berita
                </Link>
            }
        >
            <form
                onSubmit={search}
                className="flex flex-wrap items-end gap-3 rounded-xl border border-border p-4"
            >
                <div className="grid min-w-48 flex-1 gap-2">
                    <Label htmlFor="q">Cari judul</Label>
                    <Input
                        id="q"
                        name="q"
                        type="search"
                        value={q}
                        placeholder="mis. PPDB"
                        onChange={(event) => setQ(event.target.value)}
                    />
                </div>

                <div className="grid w-44 gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ANY_STATUS}>Semua</SelectItem>
                            <SelectItem value="published">Terbit</SelectItem>
                            <SelectItem value="draft">Draf</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button type="submit">
                    <Search className="size-4" aria-hidden="true" />
                    Cari
                </Button>
            </form>

            {posts.data.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                    Tidak ada berita yang cocok dengan filter ini.
                </p>
            ) : (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-border">
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
                                    className="border-b border-border"
                                >
                                    <td className="py-2 pr-4">
                                        <Link
                                            href={editPost(post.id)}
                                            className="font-medium text-foreground underline-offset-4 hover:underline"
                                        >
                                            {post.title}
                                        </Link>
                                        <span className="block text-xs text-muted-foreground">
                                            {post.type === 'pengumuman'
                                                ? 'Pengumuman'
                                                : 'Berita'}{' '}
                                            · /{post.slug}
                                        </span>
                                    </td>
                                    <td className="py-2 pr-4 text-muted-foreground">
                                        {post.category ?? '—'}
                                    </td>
                                    <td className="py-2 pr-4">
                                        <Badge
                                            variant={
                                                post.status === 'published'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {post.status === 'published'
                                                ? 'Terbit'
                                                : 'Draf'}
                                        </Badge>
                                    </td>
                                    <td className="py-2 pr-4 whitespace-nowrap text-muted-foreground">
                                        {post.publishedAtLabel ?? '—'}
                                    </td>
                                    <td className="py-2">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={editPost(post.id)}
                                                aria-label={`Edit ${post.title}`}
                                                className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
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
