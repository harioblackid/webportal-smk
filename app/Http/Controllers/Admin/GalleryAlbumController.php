<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GalleryAlbumRequest;
use App\Http\Requests\Admin\PageVisibilityRequest;
use App\Models\GalleryAlbum;
use App\Models\GalleryItem;
use App\Support\MediaLibrary;
use App\Support\PageVisibility;
use App\Support\Slug;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/** Galeri foto — editorial content, so both roles. */
class GalleryAlbumController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/gallery-albums/index', [
            'albums' => GalleryAlbum::query()
                ->with('cover')
                ->withCount('items')
                ->ordered()
                ->get()
                ->map(fn (GalleryAlbum $album) => [
                    'id' => $album->id,
                    'title' => $album->title,
                    'slug' => $album->slug,
                    'sortOrder' => $album->sort_order,
                    'isActive' => $album->is_active,
                    'itemsCount' => (int) $album->items_count,
                    'thumbUrl' => $album->cover?->thumbUrl(),
                ])
                ->all(),
            'enabled' => PageVisibility::enabled('gallery'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/gallery-albums/form', [
            'album' => null,
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function store(GalleryAlbumRequest $request): RedirectResponse
    {
        $album = new GalleryAlbum;
        $this->save($album, $request);

        return to_route('admin.gallery-albums.index')
            ->with('success', 'Album "'.$album->title.'" disimpan.');
    }

    public function edit(GalleryAlbum $album): Response
    {
        return Inertia::render('admin/gallery-albums/form', [
            'album' => [
                'id' => $album->id,
                'title' => $album->title,
                'description' => $album->description ?? '',
                'cover_media_id' => $album->cover_media_id,
                'sort_order' => $album->sort_order,
                'is_active' => $album->is_active,
                'items' => $album->items()
                    ->ordered()
                    ->get()
                    ->map(fn (GalleryItem $item) => [
                        'media_id' => $item->media_id,
                        'caption' => $item->caption ?? '',
                    ])
                    ->all(),
            ],
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function update(
        GalleryAlbumRequest $request,
        GalleryAlbum $album,
    ): RedirectResponse {
        $this->save($album, $request);

        return to_route('admin.gallery-albums.index')
            ->with('success', 'Album "'.$album->title.'" diperbarui.');
    }

    public function destroy(GalleryAlbum $album): RedirectResponse
    {
        $title = $album->title;
        $album->delete();

        return to_route('admin.gallery-albums.index')
            ->with('success', 'Album "'.$title.'" dihapus.');
    }

    public function visibility(PageVisibilityRequest $request): RedirectResponse
    {
        $enabled = $request->boolean('enabled');
        PageVisibility::set('gallery', $enabled);

        return to_route('admin.gallery-albums.index')
            ->with('success', $enabled
                ? 'Halaman Gallery diaktifkan.'
                : 'Halaman Gallery dinonaktifkan.');
    }

    private function save(GalleryAlbum $album, GalleryAlbumRequest $request): void
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        DB::transaction(function () use ($album, $data): void {
            $album->fill([
                'title' => (string) $data['title'],
                'slug' => Slug::unique(
                    GalleryAlbum::class,
                    (string) $data['title'],
                    $album->exists ? $album->id : null,
                ),
                'description' => self::blankToNull($data['description'] ?? null),
                'cover_media_id' => $data['cover_media_id'] ?? null,
                'sort_order' => (int) ($data['sort_order'] ?? 0),
                'is_active' => (bool) ($data['is_active'] ?? false),
            ]);

            $album->save();

            $album->items()->delete();

            /** @var list<array<string, mixed>> $items */
            $items = $data['items'] ?? [];

            foreach ($items as $index => $item) {
                $album->items()->create([
                    'media_id' => (int) $item['media_id'],
                    'caption' => self::blankToNull($item['caption'] ?? null),
                    'sort_order' => $index,
                ]);
            }
        });
    }

    private static function blankToNull(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
