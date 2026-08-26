<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ImageResource;
use App\Http\Resources\NewsCardResource;
use App\Models\Hero;
use App\Models\Post;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Home (prd-04 §3.1). Everything on this page is CMS-driven except the static
 * "sekilas sekolah" strip, which FR4-5 fixes in code on purpose.
 */
class HomeController extends Controller
{
    /** FR4-3: six is the default agreed in OQ4-1. */
    private const LATEST_POSTS = 6;

    public function index(): Response
    {
        $heroes = Hero::query()
            ->active()
            ->with(['media', 'post'])
            ->ordered()
            ->get();

        return Inertia::render('public/home', [
            // FR4-2: an empty list is a supported state, not a missing prop —
            // the page renders its own fallback hero.
            'heroes' => $heroes
                ->map(fn (Hero $hero) => [
                    'id' => $hero->id,
                    'title' => $hero->title,
                    'subtitle' => $hero->subtitle,
                    'image' => ImageResource::optional($hero->media),
                    // The berita link leads, because it is the one CTA that
                    // points at something the school just published.
                    'postUrl' => $hero->postUrl(),
                    'postLinkText' => $hero->postUrl() === null
                        ? null
                        : $hero->postLinkLabel(),
                    'ctas' => array_values(array_filter([
                        self::cta($hero->cta1_text, $hero->cta1_url),
                        self::cta($hero->cta2_text, $hero->cta2_url),
                    ])),
                ])
                ->all(),
            'posts' => NewsCardResource::many(
                Post::query()
                    ->published()
                    ->with(['category', 'featuredMedia'])
                    ->latest('published_at')
                    ->limit(self::LATEST_POSTS)
                    ->get()
            ),
            'seo' => Seo::page(
                'Beranda',
                'Portal resmi SMK PGRI Telagasari — profil sekolah, program keahlian, berita, dan informasi PPDB.',
                $heroes->first()?->media,
            ),
        ]);
    }

    /**
     * @return array{text: string, url: string}|null
     */
    private static function cta(?string $text, ?string $url): ?array
    {
        if ($text === null || $url === null || trim($text) === '' || trim($url) === '') {
            return null;
        }

        return ['text' => $text, 'url' => $url];
    }
}
