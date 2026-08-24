<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PostRequest;
use App\Models\Category;
use App\Models\Post;
use App\Support\HtmlSanitizer;
use App\Support\MediaLibrary;
use App\Support\Slug;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Berita & Pengumuman (prd-05 §3.3).
 *
 * Both roles get full access including publish — FR5-1 settles that Editors
 * publish directly, with `draft` as the save-before-it-is-ready state rather
 * than as an approval queue.
 */
class PostController extends Controller
{
    private const PER_PAGE = 15;

    /** FR5-7 — table with search and status filter. */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q'));
        $status = (string) $request->query('status', '');

        $posts = Post::query()
            ->with('category:id,name')
            ->when(
                $search !== '',
                fn (Builder $query) => $query->where('title', 'like', '%'.$search.'%')
            )
            ->when(
                in_array($status, ['draft', 'published'], true),
                fn (Builder $query) => $query->where('status', $status)
            )
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Post $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'type' => $post->type,
                'status' => $post->status,
                'category' => $post->category?->name,
                'publishedAtLabel' => $post->published_at?->translatedFormat('j M Y'),
            ]);

        return Inertia::render('admin/posts/index', [
            'posts' => $posts,
            // Echoed back so the inputs still show what was searched for after
            // the round trip.
            'filters' => ['q' => $search, 'status' => $status],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/posts/form', [
            'post' => null,
            'categories' => self::categories(),
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function store(PostRequest $request): RedirectResponse
    {
        $post = new Post;
        $post->user_id = $request->user()?->id;
        $this->fill($post, $request);
        $post->save();

        return to_route('admin.posts.index')
            ->with('success', 'Berita "'.$post->title.'" disimpan.');
    }

    public function edit(Post $post): Response
    {
        return Inertia::render('admin/posts/form', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'category_id' => $post->category_id,
                'featured_media_id' => $post->featured_media_id,
                'excerpt' => $post->excerpt,
                'body' => $post->body,
                'type' => $post->type,
                'status' => $post->status,
                // The only shape <input type="datetime-local"> accepts.
                'published_at' => $post->published_at?->format('Y-m-d\TH:i'),
                'publicUrl' => $post->status === 'published'
                    ? route('posts.show', $post->slug)
                    : null,
            ],
            'categories' => self::categories(),
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function update(PostRequest $request, Post $post): RedirectResponse
    {
        $this->fill($post, $request);
        $post->save();

        return to_route('admin.posts.index')
            ->with('success', 'Berita "'.$post->title.'" diperbarui.');
    }

    /** FR5-11 — soft delete. The confirmation dialog is the front end's half. */
    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();

        return to_route('admin.posts.index')
            ->with('success', 'Berita "'.$post->title.'" dihapus.');
    }

    private function fill(Post $post, PostRequest $request): void
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        $post->fill([
            'title' => $data['title'],
            'category_id' => $data['category_id'] ?? null,
            'featured_media_id' => $data['featured_media_id'] ?? null,
            'excerpt' => $data['excerpt'] ?? null,
            // FR5-9: the editor's HTML never reaches the database unfiltered.
            'body' => HtmlSanitizer::clean((string) $data['body']),
            'type' => $data['type'],
            'status' => $data['status'],
        ]);

        // FR5-10. Re-derived from the title only when the field was left blank,
        // so an existing slug — and the links pointing at it — survives an edit.
        $slugSource = trim((string) ($data['slug'] ?? ''));

        $post->slug = Slug::unique(
            Post::class,
            $slugSource !== '' ? $slugSource : (string) $data['title'],
            $post->exists ? $post->id : null,
        );

        $publishedAt = $data['published_at'] ?? null;

        // Publishing without a date would leave the post outside
        // scopePublished, which reads as "I published it and nothing happened".
        $post->published_at = match (true) {
            $publishedAt !== null => $publishedAt,
            $data['status'] === 'published' => now(),
            default => null,
        };
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private static function categories(): array
    {
        return Category::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
            ])
            ->all();
    }
}
