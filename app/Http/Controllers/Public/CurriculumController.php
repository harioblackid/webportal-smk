<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CurriculumSpectrum;
use App\Models\CurriculumSubject;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Spektrum kurikulum (Profil > Spektrum Kurikulum).
 *
 * The page shows the mata pelajaran and nothing else — no jam, no capaian —
 * because that is the whole ask, and a table of hours would be stale within a
 * term.
 */
class CurriculumController extends Controller
{
    public function __invoke(): Response
    {
        $spectra = CurriculumSpectrum::query()
            ->publicList()
            ->with(['subjects' => fn ($query) => $query->ordered()])
            ->get();

        return Inertia::render('public/spektrum-kurikulum', [
            'spectra' => $spectra
                ->map(fn (CurriculumSpectrum $spectrum) => [
                    'id' => $spectrum->id,
                    'name' => $spectrum->name,
                    'slug' => $spectrum->slug,
                    'description' => $spectrum->description,
                    // Grouped here rather than in the page: the kelompok
                    // headings are data, and React should only lay them out.
                    'groups' => self::grouped($spectrum),
                ])
                ->all(),
            'seo' => Seo::page(
                'Spektrum Kurikulum',
                'Daftar mata pelajaran pada spektrum kurikulum yang berlaku di SMK PGRI Telagasari.',
            ),
        ]);
    }

    /**
     * @return list<array{label: string|null, subjects: list<string>}>
     */
    private static function grouped(CurriculumSpectrum $spectrum): array
    {
        $groups = [];

        foreach ($spectrum->subjects as $subject) {
            /** @var CurriculumSubject $subject */
            $label = $subject->group;
            $key = $label ?? '';

            if (! array_key_exists($key, $groups)) {
                $groups[$key] = ['label' => $label, 'subjects' => []];
            }

            $groups[$key]['subjects'][] = $subject->name;
        }

        return array_values($groups);
    }
}
