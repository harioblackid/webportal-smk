<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\HeroRequest;
use App\Models\Hero;
use App\Models\Post;
use App\Support\MediaLibrary;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Hero halaman depan (prd-05 §3.4) — a carousel of slides.
 *
 * FR5-13's "activating one deactivates the rest" was retired on the school's
 * instruction: up to Hero::MAX_ACTIVE slides may be active at once and are
 * shown in sort_order. The cap is enforced by App\Rules\MaxActiveHeroes.
 *
 * FR5-14 needs no cache busting here because HomeController reads the active
 * heroes on every request.
 */
class HeroController extends Controller
{
    /** Enough to cover anything worth featuring without shipping the archive. */
    private const POST_OPTIONS = 100;

    public function index(): Response
    {
        return Inertia::render('admin/heroes/index', [
            'heroes' => Hero::query()
                ->with(['media', 'post'])
                ->orderByDesc('is_active')
                ->ordered()
                ->get()
                ->map(fn (Hero $hero) => [
                    'id' => $hero->id,
                    'title' => $hero->title,
                    'subtitle' => $hero->subtitle,
                    'isActive' => $hero->is_active,
                    'sortOrder' => $hero->sort_order,
                    'thumbUrl' => $hero->media?->thumbUrl(),
                    'postTitle' => $hero->post?->title,
                ])
                ->all(),
            'maxActive' => Hero::MAX_ACTIVE,
            'activeCount' => Hero::query()->active()->count(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/heroes/form', [
            'hero' => null,
            'mediaLibrary' => MediaLibrary::options(),
            'posts' => self::postOptions(),
            'defaultPostLinkText' => Hero::DEFAULT_POST_LINK_TEXT,
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
                'subtitle' => $hero->subtitle ?? '',
                'media_id' => $hero->media_id,
                'post_id' => $hero->post_id,
                'post_link_text' => $hero->post_link_text ?? '',
                'cta1_text' => $hero->cta1_text ?? '',
                'cta1_url' => $hero->cta1_url ?? '',
                'cta2_text' => $hero->cta2_text ?? '',
                'cta2_url' => $hero->cta2_url ?? '',
                'is_active' => $hero->is_active,
                'sort_order' => $hero->sort_order,
            ],
            'mediaLibrary' => MediaLibrary::options(),
            'posts' => self::postOptions(),
            'defaultPostLinkText' => Hero::DEFAULT_POST_LINK_TEXT,
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

    private function save(Hero $hero, HeroRequest $request): void
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        $hero->fill([
            'title' => (string) $data['title'],
            'subtitle' => self::blankToNull($data['subtitle'] ?? null),
            'media_id' => $data['media_id'] ?? null,
            'post_id' => $data['post_id'] ?? null,
            'post_link_text' => self::blankToNull($data['post_link_text'] ?? null),
            'cta1_text' => self::blankToNull($data['cta1_text'] ?? null),
            'cta1_url' => self::blankToNull($data['cta1_url'] ?? null),
            'cta2_text' => self::blankToNull($data['cta2_text'] ?? null),
            'cta2_url' => self::blankToNull($data['cta2_url'] ?? null),
            'is_active' => (bool) ($data['is_active'] ?? false),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ]);

        $hero->save();
    }

    /**
     * The berita a slide may point at.
     *
     * Only published ones: linking the front page to a draft would publish it
     * by the back door.
     *
     * @return array<int, array<string, mixed>>
     */
    private static function postOptions(): array
    {
        return Post::query()
            ->published()
            ->latest('published_at')
            ->limit(self::POST_OPTIONS)
            ->get()
            ->map(fn (Post $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'publishedAtLabel' => $post->published_at?->translatedFormat('j F Y'),
            ])
            ->all();
    }

    private static function blankToNull(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
