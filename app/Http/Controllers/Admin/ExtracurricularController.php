<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ExtracurricularRequest;
use App\Http\Requests\Admin\PageVisibilityRequest;
use App\Models\Extracurricular;
use App\Support\HtmlSanitizer;
use App\Support\MediaLibrary;
use App\Support\PageVisibility;
use App\Support\Slug;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/** Ekstrakurikuler — editorial content, so both roles. */
class ExtracurricularController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/extracurriculars/index', [
            'extracurriculars' => Extracurricular::query()
                ->with('media')
                ->ordered()
                ->get()
                ->map(fn (Extracurricular $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'slug' => $item->slug,
                    'pembina' => $item->pembina,
                    'jadwal' => $item->jadwal,
                    'sortOrder' => $item->sort_order,
                    'isActive' => $item->is_active,
                    'thumbUrl' => $item->media?->thumbUrl(),
                ])
                ->all(),
            'enabled' => PageVisibility::enabled('ekskul'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/extracurriculars/form', [
            'extracurricular' => null,
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function store(ExtracurricularRequest $request): RedirectResponse
    {
        $item = new Extracurricular;
        $this->save($item, $request);

        return to_route('admin.extracurriculars.index')
            ->with('success', 'Ekstrakurikuler "'.$item->name.'" disimpan.');
    }

    public function edit(Extracurricular $extracurricular): Response
    {
        return Inertia::render('admin/extracurriculars/form', [
            'extracurricular' => [
                'id' => $extracurricular->id,
                'name' => $extracurricular->name,
                'description' => $extracurricular->description ?? '',
                'pembina' => $extracurricular->pembina ?? '',
                'jadwal' => $extracurricular->jadwal ?? '',
                'media_id' => $extracurricular->media_id,
                'sort_order' => $extracurricular->sort_order,
                'is_active' => $extracurricular->is_active,
            ],
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function update(
        ExtracurricularRequest $request,
        Extracurricular $extracurricular,
    ): RedirectResponse {
        $this->save($extracurricular, $request);

        return to_route('admin.extracurriculars.index')
            ->with('success', 'Ekstrakurikuler "'.$extracurricular->name.'" diperbarui.');
    }

    public function destroy(Extracurricular $extracurricular): RedirectResponse
    {
        $name = $extracurricular->name;
        $extracurricular->delete();

        return to_route('admin.extracurriculars.index')
            ->with('success', 'Ekstrakurikuler "'.$name.'" dihapus.');
    }

    public function visibility(PageVisibilityRequest $request): RedirectResponse
    {
        $enabled = $request->boolean('enabled');
        PageVisibility::set('ekskul', $enabled);

        return to_route('admin.extracurriculars.index')
            ->with('success', $enabled
                ? 'Halaman Ekstrakurikuler diaktifkan.'
                : 'Halaman Ekstrakurikuler dinonaktifkan.');
    }

    private function save(
        Extracurricular $item,
        ExtracurricularRequest $request,
    ): void {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        $item->fill([
            'name' => (string) $data['name'],
            'slug' => Slug::unique(
                Extracurricular::class,
                (string) $data['name'],
                $item->exists ? $item->id : null,
            ),
            // FR5-9: the editor's HTML never reaches the database unfiltered.
            'description' => self::blankToNull(
                HtmlSanitizer::clean((string) ($data['description'] ?? ''))
            ),
            'pembina' => self::blankToNull($data['pembina'] ?? null),
            'jadwal' => self::blankToNull($data['jadwal'] ?? null),
            'media_id' => $data['media_id'] ?? null,
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? false),
        ]);

        $item->save();
    }

    private static function blankToNull(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
