<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ImageResource;
use App\Models\GalleryAlbum;
use App\Models\GalleryItem;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

/** Galeri foto: albums on the index, the photos themselves on the detail. */
class GalleryController extends Controller
{
    public function index(): Response
    {
        $albums = GalleryAlbum::query()
            ->publicList()
            ->with('cover')
            ->withCount('items')
            ->get();

        return Inertia::render('public/galeri/index', [
            'albums' => $albums
                ->map(fn (GalleryAlbum $album) => [
                    'id' => $album->id,
                    'title' => $album->title,
                    'slug' => $album->slug,
                    'url' => route('gallery.show', $album->slug),
                    'description' => $album->description,
                    'photoCount' => (int) $album->items_count,
                    'image' => ImageResource::optional($album->cover),
                ])
                ->all(),
            'seo' => Seo::page(
                'Galeri Foto',
                'Dokumentasi kegiatan, prestasi, dan suasana belajar di SMK PGRI Telagasari.',
            ),
        ]);
    }

    public function show(string $slug): Response
    {
        // FR4-21: an inactive album is a 404, the same as an unknown slug —
        // never a page that says the content exists but is hidden.
        $album = GalleryAlbum::query()
            ->publicList()
            ->where('slug', $slug)
            ->with(['cover', 'items' => fn ($query) => $query->ordered()->with('media')])
            ->firstOrFail();

        $photos = $album->items
            ->map(fn (GalleryItem $item) => [
                'id' => $item->id,
                'caption' => $item->caption,
                'image' => ImageResource::optional($item->media),
            ])
            ->filter(fn (array $photo) => $photo['image'] !== null)
            ->values()
            ->all();

        return Inertia::render('public/galeri/show', [
            'album' => [
                'title' => $album->title,
                'slug' => $album->slug,
                'description' => $album->description,
            ],
            'photos' => $photos,
            'seo' => Seo::page(
                $album->title,
                $album->description ?? 'Dokumentasi kegiatan SMK PGRI Telagasari.',
                $album->cover,
            ),
        ]);
    }
}
