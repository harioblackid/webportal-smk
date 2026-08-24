/** Shapes the /admin pages receive as Inertia props (prd-05). */

/** A Media row as MediaResource sends it to the grid and the picker. */
export type MediaItem = {
    id: number;
    url: string;
    thumbUrl: string;
    alt: string;
    filename: string;
    sizeLabel: string;
    uploadedAtLabel: string | null;
};

export type PostStatus = 'draft' | 'published';

export type PostType = 'berita' | 'pengumuman';

export type PostRow = {
    id: number;
    title: string;
    slug: string;
    type: PostType;
    status: PostStatus;
    category: string | null;
    publishedAtLabel: string | null;
};

/** The berita form's own state, mirroring App\Http\Requests\Admin\PostRequest. */
export type PostFormValues = {
    title: string;
    slug: string;
    category_id: number | null;
    featured_media_id: number | null;
    excerpt: string;
    body: string;
    type: PostType;
    status: PostStatus;
    published_at: string;
};

export type CategoryRow = {
    id: number;
    name: string;
    slug: string;
    /** Drives the disabled delete button — US-012 keeps used categories. */
    postsCount: number;
};

export type CategoryOption = {
    id: number;
    name: string;
};

export type HeroRow = {
    id: number;
    title: string;
    subtitle: string | null;
    isActive: boolean;
    thumbUrl: string | null;
};

export type MajorRow = {
    id: number;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
    thumbUrl: string | null;
};

export type UserRow = {
    id: number;
    name: string;
    email: string;
    role: string;
    roleLabel: string;
    createdAtLabel: string | null;
};

export type RoleOption = {
    value: string;
    label: string;
};

/** Redirect-carried toast from HandleInertiaRequests::share(). */
export type Flash = {
    success: string | null;
    error: string | null;
};
