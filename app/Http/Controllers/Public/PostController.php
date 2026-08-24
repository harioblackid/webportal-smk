<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsCardResource;
use App\Http\Resources\PostResource;
use App\Models\Category;
use App\Models\Post;
use App\Support\Seo;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Berita — list, category filter, and detail (prd-04 §3.2 & §3.3).
 */
class PostController extends Controller
{
    /** FR4-6 allows 9–12; twelve divides evenly into the 1/2/3-column grid. */
    private const PER_PAGE = 12;

    public function index(): Response
    {
        return $this->list();
    }

    /** FR4-7: the filter is its own URL, not a query string. */
    public function category(Category $category): Response
    {
        return $this->list($category);
    }

    public function show(string $slug): Response
    {
        // FR4-12: `published` is part of the lookup rather than a check after
        // it, so a draft is indistinguishable from a URL that never existed.
        $post = Post::query()
            ->published()
            ->with(['category', 'featuredMedia'])
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('public/berita/show', [
            'post' => (new PostResource($post))->toArray(request()),
            'related' => NewsCardResource::many($this->related($post)),
            'seo' => Seo::page(
                $post->title,
                Seo::describe($post->excerpt, $post->body),
                $post->featuredMedia,
                'article',
            ),
        ]);
    }

    private function list(?Category $category = null): Response
    {
        return Inertia::render('public/berita/index', [
            'posts' => $this->paginate($category),
            'categories' => Category::query()
                // Only categories a visitor can actually land on: the filter
                // must never lead to an empty page.
                ->whereIn('id', Post::query()->published()->select('category_id'))
                ->orderBy('name')
                ->get()
                ->map(fn (Category $item) => [
                    'name' => $item->name,
                    'slug' => $item->slug,
                    'url' => route('posts.category', $item->slug),
                ])
                ->all(),
            'activeCategory' => $category === null ? null : [
                'name' => $category->name,
                'slug' => $category->slug,
            ],
            'seo' => $category === null
                ? Seo::page(
                    'Berita & Pengumuman',
                    'Kabar terbaru, pengumuman, dan kegiatan SMK PGRI Telagasari.',
                )
                : Seo::page(
                    'Berita kategori '.$category->name,
                    'Kumpulan berita dan pengumuman SMK PGRI Telagasari pada kategori '.$category->name.'.',
                ),
        ]);
    }

    /**
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    private function paginate(?Category $category): LengthAwarePaginator
    {
        return Post::query()
            ->published()
            ->with(['category', 'featuredMedia'])
            ->when(
                $category !== null,
                fn (Builder $query) => $query->where('category_id', $category?->getKey())
            )
            ->latest('published_at')
            ->paginate(self::PER_PAGE)
            // FR4-6: keeps ?page in the links so the state stays in the URL.
            ->withQueryString()
            ->through(fn (Post $post) => (new NewsCardResource($post))->toArray(request()));
    }

    /**
     * FR4-13: same category first, topped up with the newest posts so the
     * block is never half empty.
     *
     * One query rather than two: `<=>` is MariaDB's null-safe equality, which
     * sorts same-category posts to the front and treats "no category" as a
     * category of its own. The project is MariaDB everywhere (prd-02).
     *
     * @return Collection<int, Post>
     */
    private function related(Post $post): Collection
    {
        return Post::query()
            ->published()
            ->with(['category', 'featuredMedia'])
            ->whereKeyNot($post->getKey())
            ->orderByRaw('category_id <=> ? desc', [$post->category_id])
            ->latest('published_at')
            ->limit(3)
            ->get();
    }
}
