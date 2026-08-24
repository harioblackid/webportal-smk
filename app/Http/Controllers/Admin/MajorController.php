<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MajorRequest;
use App\Models\Major;
use App\Support\HtmlSanitizer;
use App\Support\MediaLibrary;
use App\Support\Slug;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Jurusan / Program Keahlian (prd-05 §3.5) — Superadmin only.
 *
 * FR5-15a is enforced by EnsureUserIsSuperadmin on the route group, so every
 * verb here (including the GET that renders the form) answers 403 for an
 * Editor. Nothing in this class re-checks the role: one gate, at the door.
 *
 * FR5-15e needs no invalidation step — the public /jurusan page queries the
 * table on each request.
 */
class MajorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/majors/index', [
            'majors' => Major::query()
                ->with('media')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn (Major $major) => [
                    'id' => $major->id,
                    'name' => $major->name,
                    'slug' => $major->slug,
                    'sortOrder' => $major->sort_order,
                    'isActive' => $major->is_active,
                    'thumbUrl' => $major->media?->thumbUrl(),
                ])
                ->all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/majors/form', [
            'major' => null,
            // A new jurusan lands at the end of the list rather than sharing
            // position 0 with everything else.
            'nextSortOrder' => (int) Major::query()->max('sort_order') + 1,
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function store(MajorRequest $request): RedirectResponse
    {
        $major = new Major;
        $this->fill($major, $request);
        $major->save();

        return to_route('admin.majors.index')
            ->with('success', 'Jurusan "'.$major->name.'" disimpan.');
    }

    public function edit(Major $major): Response
    {
        return Inertia::render('admin/majors/form', [
            'major' => [
                'id' => $major->id,
                // Major::getRouteKeyName() is `slug`, so the admin URLs use it
                // too — kept apart from the editable `slug` field below, which
                // is what the form is allowed to change.
                'routeKey' => $major->slug,
                'name' => $major->name,
                'slug' => $major->slug,
                'excerpt' => $major->excerpt,
                'description' => $major->description,
                'extra' => $major->extra,
                'media_id' => $major->media_id,
                'sort_order' => $major->sort_order,
                'is_active' => $major->is_active,
                // FR5-15c: only an active jurusan has a public page to visit.
                'publicUrl' => $major->is_active
                    ? route('majors.show', $major->slug)
                    : null,
            ],
            'nextSortOrder' => $major->sort_order,
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function update(MajorRequest $request, Major $major): RedirectResponse
    {
        $this->fill($major, $request);
        $major->save();

        return to_route('admin.majors.index')
            ->with('success', 'Jurusan "'.$major->name.'" diperbarui.');
    }

    /** FR5-15d — soft delete behind a confirmation dialog. */
    public function destroy(Major $major): RedirectResponse
    {
        $major->delete();

        return to_route('admin.majors.index')
            ->with('success', 'Jurusan "'.$major->name.'" dihapus.');
    }

    private function fill(Major $major, MajorRequest $request): void
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        $major->fill([
            'name' => $data['name'],
            'excerpt' => $data['excerpt'] ?? null,
            // Both rich-text fields go through the same allowlist the berita
            // body does (FR5-9).
            'description' => HtmlSanitizer::clean($data['description'] ?? null) ?: null,
            'extra' => HtmlSanitizer::clean($data['extra'] ?? null) ?: null,
            'media_id' => $data['media_id'] ?? null,
            'sort_order' => $data['sort_order'],
            'is_active' => (bool) ($data['is_active'] ?? false),
        ]);

        $slugSource = trim((string) ($data['slug'] ?? ''));

        $major->slug = Slug::unique(
            Major::class,
            $slugSource !== '' ? $slugSource : (string) $data['name'],
            $major->exists ? $major->id : null,
        );
    }
}
