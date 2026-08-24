<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\MajorCardResource;
use App\Http\Resources\MajorResource;
use App\Models\Major;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Jurusan / Program Keahlian (prd-04 §3.6) — CMS-driven, list and detail.
 */
class MajorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('public/jurusan/index', [
            'majors' => MajorCardResource::many(
                Major::query()->publicList()->with('media')->get()
            ),
            'seo' => Seo::page(
                'Program Keahlian',
                'Program keahlian yang dibuka di SMK PGRI Telagasari beserta gambaran singkat tiap jurusan.',
            ),
        ]);
    }

    public function show(string $slug): Response
    {
        // FR4-16b: an inactive jurusan is a 404, not a hidden page.
        $major = Major::query()
            ->where('is_active', true)
            ->with('media')
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('public/jurusan/show', [
            'major' => (new MajorResource($major))->toArray(request()),
            'others' => MajorCardResource::many(
                Major::query()
                    ->publicList()
                    ->with('media')
                    ->whereKeyNot($major->getKey())
                    ->limit(3)
                    ->get()
            ),
            'seo' => Seo::page(
                $major->name,
                Seo::describe($major->excerpt, $major->description),
                $major->media,
            ),
        ]);
    }
}
