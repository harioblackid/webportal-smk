<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\HeroRequest;
use App\Models\Hero;
use App\Support\MediaLibrary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Hero halaman depan (prd-05 §3.4).
 *
 * Kept as a list of heroes rather than a single row so the school can prepare
 * the next one (a PPDB hero, say) and switch over in one click — US-013 asks
 * for exactly that: activating one deactivates the rest.
 *
 * FR5-14 needs no cache busting here because HomeController reads the active
 * hero on every request.
 */
class HeroController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/heroes/index', [
            'heroes' => Hero::query()
                ->with('media')
                ->orderByDesc('is_active')
                ->latest('id')
                ->get()
                ->map(fn (Hero $hero) => [
                    'id' => $hero->id,
                    'title' => $hero->title,
                    'subtitle' => $hero->subtitle,
                    'isActive' => $hero->is_active,
                    'thumbUrl' => $hero->media?->thumbUrl(),
                ])
                ->all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/heroes/form', [
            'hero' => null,
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function store(HeroRequest $request): RedirectResponse
    {
        $hero = new Hero;
        $this->save($hero, $request);

        return to_route('admin.heroes.index')
            ->with('success', 'Hero "'.$hero->title.'" disimpan.');
    }

    public function edit(Hero $hero): Response
    {
        return Inertia::render('admin/heroes/form', [
            'hero' => [
                'id' => $hero->id,
                'title' => $hero->title,
                'subtitle' => $hero->subtitle,
                'media_id' => $hero->media_id,
                'cta1_text' => $hero->cta1_text,
                'cta1_url' => $hero->cta1_url,
                'cta2_text' => $hero->cta2_text,
                'cta2_url' => $hero->cta2_url,
                'is_active' => $hero->is_active,
            ],
            'mediaLibrary' => MediaLibrary::options(),
        ]);
    }

    public function update(HeroRequest $request, Hero $hero): RedirectResponse
    {
        $this->save($hero, $request);

        return to_route('admin.heroes.index')
            ->with('success', 'Hero "'.$hero->title.'" diperbarui.');
    }

    public function destroy(Hero $hero): RedirectResponse
    {
        $hero->delete();

        return to_route('admin.heroes.index')
            ->with('success', 'Hero "'.$hero->title.'" dihapus.');
    }

    /**
     * FR5-13 — one active hero at a time.
     *
     * The deactivation and the save go in one transaction: a failure between
     * them would leave the home page with no hero at all.
     */
    private function save(Hero $hero, HeroRequest $request): void
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        DB::transaction(function () use ($hero, $data): void {
            $hero->fill([
                'title' => $data['title'],
                'subtitle' => $data['subtitle'] ?? null,
                'media_id' => $data['media_id'] ?? null,
                'cta1_text' => $data['cta1_text'] ?? null,
                'cta1_url' => $data['cta1_url'] ?? null,
                'cta2_text' => $data['cta2_text'] ?? null,
                'cta2_url' => $data['cta2_url'] ?? null,
                'is_active' => (bool) ($data['is_active'] ?? false),
            ]);

            $hero->save();

            if ($hero->is_active) {
                Hero::query()
                    ->whereKeyNot($hero->getKey())
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }
        });
    }
}
