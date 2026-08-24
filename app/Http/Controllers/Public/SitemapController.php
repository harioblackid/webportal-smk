<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Major;
use App\Models\Post;
use App\Support\SiteSettings;
use Illuminate\Http\Response;

/**
 * FR6-9 & FR6-10 — sitemap and robots, both generated from the live database
 * and the canonical host.
 *
 * Generated per request rather than written to disk: "diperbarui saat berita
 * baru dipublikasikan" then needs no cache invalidation hook, and the whole
 * document is two indexed queries.
 */
class SitemapController extends Controller
{
    public function sitemap(): Response
    {
        $base = self::base();

        $urls = [
            self::url($base.'/', 'daily', '1.0'),
            self::url($base.route('profil', absolute: false), 'monthly', '0.6'),
            self::url($base.route('kontak', absolute: false), 'monthly', '0.6'),
            self::url($base.route('posts.index', absolute: false), 'daily', '0.8'),
            self::url($base.route('majors.index', absolute: false), 'weekly', '0.8'),
        ];

        foreach (Post::query()->published()->latest('published_at')->get() as $post) {
            $urls[] = self::url(
                $base.route('posts.show', $post->slug, absolute: false),
                'monthly',
                '0.7',
                $post->updated_at?->toAtomString(),
            );
        }

        foreach (Major::query()->publicList()->get() as $major) {
            $urls[] = self::url(
                $base.route('majors.show', $major->slug, absolute: false),
                'monthly',
                '0.7',
                $major->updated_at?->toAtomString(),
            );
        }

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    /**
     * FR6-10 — public crawlable, `/admin` closed, sitemap advertised.
     *
     * Served by Laravel instead of a static public/robots.txt so the sitemap
     * line and the canonical URLs can never disagree about the host.
     */
    public function robots(): Response
    {
        $body = implode("\n", [
            'User-agent: *',
            'Disallow: /admin',
            'Disallow: /login',
            'Disallow: /forgot-password',
            'Disallow: /reset-password',
            'Allow: /',
            '',
            'Sitemap: '.self::base().'/sitemap.xml',
            '',
        ]);

        return response($body)->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    /** The canonical host from FR6-4, not whatever host the request arrived on. */
    private static function base(): string
    {
        return SiteSettings::baseUrl();
    }

    /**
     * @return array<string, string|null>
     */
    private static function url(
        string $loc,
        string $changefreq,
        string $priority,
        ?string $lastmod = null,
    ): array {
        return [
            'loc' => $loc,
            'changefreq' => $changefreq,
            'priority' => $priority,
            'lastmod' => $lastmod,
        ];
    }
}
