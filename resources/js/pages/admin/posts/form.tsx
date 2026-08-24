import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import ConfirmDelete from '@/components/admin/confirm-delete';
import MediaPicker from '@/components/admin/media-picker';
import RichTextEditor from '@/components/admin/rich-text-editor';
import Button from '@/components/ui/button';
import Field from '@/components/ui/field';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Textarea from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import {
    destroy as destroyPost,
    index as postsIndex,
    store as storePost,
    update as updatePost,
} from '@/routes/admin/posts';
import type {
    CategoryOption,
    MediaItem,
    PostFormValues,
    PostStatus,
    PostType,
} from '@/types';

type PostFormProps = {
    post:
        | (PostFormValues & {
              id: number;
              publicUrl: string | null;
          })
        | null;
    categories: CategoryOption[];
    mediaLibrary: MediaItem[];
};

/** Mirrors App\Support\Slug so the preview matches what the server will store. */
const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

/** FR5-8 — form buat/edit berita. */
export default function PostForm({
    post,
    categories,
    mediaLibrary,
}: PostFormProps) {
    const isEdit = post !== null;

    const form = useForm<PostFormValues>({
        title: post?.title ?? '',
        slug: post?.slug ?? '',
        category_id: post?.category_id ?? null,
        featured_media_id: post?.featured_media_id ?? null,
        excerpt: post?.excerpt ?? '',
        body: post?.body ?? '',
        type: post?.type ?? 'berita',
        status: post?.status ?? 'draft',
        published_at: post?.published_at ?? '',
    });

    // Once the slug has been edited by hand it stops following the title —
    // FR5-8 makes it editable, and silently overwriting that is worse than a
    // stale suggestion.
    const [slugLocked, setSlugLocked] = useState(isEdit);

    function setTitle(title: string) {
        form.setData((current) => ({
            ...current,
            title,
            slug: slugLocked ? current.slug : slugify(title),
        }));
    }

    function submit(event: FormEvent) {
        event.preventDefault();

        if (post === null) {
            form.post(storePost.url());

            return;
        }

        form.put(updatePost.url(post.id));
    }

    return (
        <AdminLayout
            title={isEdit ? 'Edit berita' : 'Tulis berita'}
            actions={
                <Link
                    href={postsIndex()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-charcoal hover:bg-mist"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Kembali ke daftar
                </Link>
            }
        >
            <form onSubmit={submit} className="max-w-3xl space-y-6">
                <Field id="title" label="Judul" error={form.errors.title}>
                    <Input
                        id="title"
                        required
                        autoFocus={!isEdit}
                        invalid={Boolean(form.errors.title)}
                        value={form.data.title}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                </Field>

                <Field id="slug" label="Slug (URL)" error={form.errors.slug}>
                    <Input
                        id="slug"
                        invalid={Boolean(form.errors.slug)}
                        value={form.data.slug}
                        placeholder="otomatis dari judul"
                        onChange={(event) => {
                            setSlugLocked(true);
                            form.setData('slug', event.target.value);
                        }}
                    />
                    <p className="text-sm text-charcoal">
                        /berita/{form.data.slug || slugify(form.data.title)} —
                        jika bentrok, sistem menambahkan angka di belakang.
                    </p>
                </Field>

                <div className="grid gap-6 sm:grid-cols-2">
                    <Field
                        id="category_id"
                        label="Kategori"
                        error={form.errors.category_id}
                    >
                        <Select
                            id="category_id"
                            value={form.data.category_id ?? ''}
                            invalid={Boolean(form.errors.category_id)}
                            onChange={(event) =>
                                form.setData(
                                    'category_id',
                                    event.target.value === ''
                                        ? null
                                        : Number(event.target.value),
                                )
                            }
                        >
                            <option value="">Tanpa kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <Field id="type" label="Jenis" error={form.errors.type}>
                        <Select
                            id="type"
                            value={form.data.type}
                            onChange={(event) =>
                                form.setData(
                                    'type',
                                    event.target.value as PostType,
                                )
                            }
                        >
                            <option value="berita">Berita</option>
                            <option value="pengumuman">Pengumuman</option>
                        </Select>
                    </Field>
                </div>

                <MediaPicker
                    label="Gambar utama"
                    value={form.data.featured_media_id}
                    library={mediaLibrary}
                    error={form.errors.featured_media_id}
                    hint="Dipakai di kartu berita, halaman detail, dan pratinjau saat dibagikan."
                    onChange={(id) => form.setData('featured_media_id', id)}
                />

                <Field
                    id="excerpt"
                    label="Ringkasan"
                    error={form.errors.excerpt}
                >
                    <Textarea
                        id="excerpt"
                        rows={3}
                        maxLength={300}
                        invalid={Boolean(form.errors.excerpt)}
                        value={form.data.excerpt}
                        onChange={(event) =>
                            form.setData('excerpt', event.target.value)
                        }
                    />
                    <p className="text-sm text-charcoal">
                        Tampil di kartu berita dan jadi deskripsi hasil
                        pencarian. Maks 300 karakter.
                    </p>
                </Field>

                <RichTextEditor
                    id="body"
                    label="Isi berita"
                    value={form.data.body}
                    library={mediaLibrary}
                    error={form.errors.body}
                    onChange={(html) => form.setData('body', html)}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                    <Field
                        id="status"
                        label="Status"
                        error={form.errors.status}
                    >
                        <Select
                            id="status"
                            value={form.data.status}
                            onChange={(event) =>
                                form.setData(
                                    'status',
                                    event.target.value as PostStatus,
                                )
                            }
                        >
                            <option value="draft">Draf</option>
                            <option value="published">Terbit</option>
                        </Select>
                    </Field>

                    <Field
                        id="published_at"
                        label="Tanggal terbit"
                        error={form.errors.published_at}
                    >
                        <Input
                            id="published_at"
                            type="datetime-local"
                            invalid={Boolean(form.errors.published_at)}
                            value={form.data.published_at}
                            onChange={(event) =>
                                form.setData('published_at', event.target.value)
                            }
                        />
                        <p className="text-sm text-charcoal">
                            Kosongkan untuk memakai waktu saat dipublikasikan.
                        </p>
                    </Field>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-charcoal/15 pt-6">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>

                    {post?.publicUrl == null ? null : (
                        <a
                            href={post.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-brand hover:bg-mist"
                        >
                            <ExternalLink
                                className="size-4"
                                aria-hidden="true"
                            />
                            Lihat di situs
                        </a>
                    )}

                    {post === null ? null : (
                        <div className="ml-auto">
                            <ConfirmDelete
                                variant="button"
                                url={destroyPost.url(post.id)}
                                label={post.title}
                                title="Hapus berita ini?"
                                description={`Berita "${post.title}" dihapus dengan soft delete, jadi masih bisa dipulihkan lewat basis data.`}
                            />
                        </div>
                    )}
                </div>
            </form>
        </AdminLayout>
    );
}
