<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ImageResource;
use App\Models\Extracurricular;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Ekstrakurikuler — one list page, no detail route.
 *
 * An ekskul is a paragraph, a pembina, and a schedule; a page per club would
 * be four lines of content behind a click.
 */
class ExtracurricularController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('public/ekstrakurikuler/index', [
            'extracurriculars' => Extracurricular::query()
                ->publicList()
                ->with('media')
                ->get()
                ->map(fn (Extracurricular $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'slug' => $item->slug,
                    'description' => $item->description,
                    'pembina' => $item->pembina,
                    'jadwal' => $item->jadwal,
                    'image' => ImageResource::optional($item->media),
                ])
                ->all(),
            'seo' => Seo::page(
                'Ekstrakurikuler',
                'Kegiatan ekstrakurikuler yang dapat diikuti peserta didik SMK PGRI Telagasari.',
            ),
        ]);
    }
}
