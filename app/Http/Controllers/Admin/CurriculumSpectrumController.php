<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CurriculumSpectrumRequest;
use App\Http\Requests\Admin\PageVisibilityRequest;
use App\Models\CurriculumSpectrum;
use App\Models\CurriculumSubject;
use App\Support\PageVisibility;
use App\Support\Slug;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Spektrum kurikulum — editorial content, so both roles.
 *
 * More than one spektrum may be published at a time; the public page lists
 * them all in sort_order, each with its own mata pelajaran.
 */
class CurriculumSpectrumController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/curriculum-spectra/index', [
            'spectra' => CurriculumSpectrum::query()
                ->withCount('subjects')
                ->ordered()
                ->get()
                ->map(fn (CurriculumSpectrum $spectrum) => [
                    'id' => $spectrum->id,
                    'name' => $spectrum->name,
                    'slug' => $spectrum->slug,
                    'sortOrder' => $spectrum->sort_order,
                    'isActive' => $spectrum->is_active,
                    'subjectsCount' => (int) $spectrum->subjects_count,
                ])
                ->all(),
            'enabled' => PageVisibility::enabled('spektrum'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/curriculum-spectra/form', [
            'spectrum' => null,
        ]);
    }

    public function store(CurriculumSpectrumRequest $request): RedirectResponse
    {
        $spectrum = new CurriculumSpectrum;
        $this->save($spectrum, $request);

        return to_route('admin.curriculum-spectra.index')
            ->with('success', 'Spektrum "'.$spectrum->name.'" disimpan.');
    }

    public function edit(CurriculumSpectrum $spectrum): Response
    {
        return Inertia::render('admin/curriculum-spectra/form', [
            'spectrum' => [
                'id' => $spectrum->id,
                'name' => $spectrum->name,
                'description' => $spectrum->description ?? '',
                'sort_order' => $spectrum->sort_order,
                'is_active' => $spectrum->is_active,
                'subjects' => $spectrum->subjects()
                    ->ordered()
                    ->get()
                    ->map(fn (CurriculumSubject $subject) => [
                        'group' => $subject->group ?? '',
                        'name' => $subject->name,
                    ])
                    ->all(),
            ],
        ]);
    }

    public function update(
        CurriculumSpectrumRequest $request,
        CurriculumSpectrum $spectrum,
    ): RedirectResponse {
        $this->save($spectrum, $request);

        return to_route('admin.curriculum-spectra.index')
            ->with('success', 'Spektrum "'.$spectrum->name.'" diperbarui.');
    }

    public function destroy(CurriculumSpectrum $spectrum): RedirectResponse
    {
        $name = $spectrum->name;
        $spectrum->delete();

        return to_route('admin.curriculum-spectra.index')
            ->with('success', 'Spektrum "'.$name.'" dihapus.');
    }

    /** The on/off switch for the whole public page, from the index. */
    public function visibility(PageVisibilityRequest $request): RedirectResponse
    {
        $enabled = $request->boolean('enabled');
        PageVisibility::set('spektrum', $enabled);

        return to_route('admin.curriculum-spectra.index')
            ->with('success', $enabled
                ? 'Halaman Spektrum Kurikulum diaktifkan.'
                : 'Halaman Spektrum Kurikulum dinonaktifkan.');
    }

    /**
     * The spektrum and its mata pelajaran move together: a half-saved list
     * would publish a curriculum missing subjects nobody asked to remove.
     */
    private function save(
        CurriculumSpectrum $spectrum,
        CurriculumSpectrumRequest $request,
    ): void {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        DB::transaction(function () use ($spectrum, $data): void {
            $spectrum->fill([
                'name' => (string) $data['name'],
                'slug' => Slug::unique(
                    CurriculumSpectrum::class,
                    (string) $data['name'],
                    $spectrum->exists ? $spectrum->id : null,
                ),
                'description' => self::blankToNull($data['description'] ?? null),
                'sort_order' => (int) ($data['sort_order'] ?? 0),
                'is_active' => (bool) ($data['is_active'] ?? false),
            ]);

            $spectrum->save();

            // Rewritten whole, like the misi list: order is the only identity
            // these rows have, so there is nothing to diff against.
            $spectrum->subjects()->delete();

            /** @var list<array<string, mixed>> $subjects */
            $subjects = $data['subjects'] ?? [];

            foreach ($subjects as $index => $subject) {
                $spectrum->subjects()->create([
                    'group' => self::blankToNull($subject['group'] ?? null),
                    'name' => (string) $subject['name'],
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
