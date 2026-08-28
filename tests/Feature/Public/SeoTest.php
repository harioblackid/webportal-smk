<?php

use App\Models\Major;
use App\Models\Media;
use App\Models\Post;
use App\Models\SchoolIdentity;
use App\Models\Setting;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('robots allows the public site, closes the admin, and points at the sitemap', function () {
    // FR6-10
    $this->get('/robots.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('User-agent: *', false)
        ->assertSee('Disallow: /admin', false)
        ->assertSee('Sitemap: http://localhost/sitemap.xml', false);
});

test('the sitemap lists every public page and nothing private', function () {
    // FR6-9
    $post = Post::factory()->published()->create(['slug' => 'berita-terbit']);
    Post::factory()->create(['slug' => 'berita-draf']);
    $major = Major::factory()->create(['slug' => 'jurusan-aktif']);
    Major::factory()->inactive()->create(['slug' => 'jurusan-mati']);

    $xml = $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->getContent();

    expect($xml)
        ->toContain('<loc>http://localhost/</loc>')
        ->toContain('<loc>http://localhost/profil</loc>')
        ->toContain('<loc>http://localhost/kontak</loc>')
        ->toContain('<loc>http://localhost/berita</loc>')
        ->toContain('<loc>http://localhost/jurusan</loc>')
        ->toContain('<loc>http://localhost/berita/'.$post->slug.'</loc>')
        ->toContain('<loc>http://localhost/jurusan/'.$major->slug.'</loc>')
        ->not->toContain('berita-draf')
        ->not->toContain('jurusan-mati')
        ->not->toContain('/admin');

    // Valid enough for a crawler to parse, not merely a string that looks right.
    $parsed = simplexml_load_string((string) $xml);

    expect($parsed)->not->toBeFalse()
        ->and($parsed->getName())->toBe('urlset');
});

test('a newly published post appears in the sitemap without any rebuild step', function () {
    $this->get('/sitemap.xml')->assertDontSee('kabar-baru');

    Post::factory()->published()->create(['slug' => 'kabar-baru']);

    $this->get('/sitemap.xml')->assertSee('/berita/kabar-baru', false);
});

test('every public page carries the organisation node', function () {
    // FR6-11 & FR6-13
    SchoolIdentity::put('nama_sekolah', 'SMK PGRI Telagasari');
    SchoolIdentity::put('alamat', 'Jalan Raya Telagasari');
    SchoolIdentity::put('email', 'info@example.test');

    $this->get(route('kontak'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('site.organization.@type', 'EducationalOrganization')
            ->where('site.organization.name', 'SMK PGRI Telagasari')
            ->where('site.organization.email', 'info@example.test')
            ->where('site.organization.address.@type', 'PostalAddress')
            ->where('site.organization.address.streetAddress', 'Jalan Raya Telagasari')
            ->where('site.organization.logo', 'http://localhost/logo-smk.png')
        );
});

test('the postal address carries the locality and postcode, not just the street', function () {
    // FR6-13. Production published only `alamat`, so the JSON-LD gave Google a
    // street with no town to place it in — and the visible address read
    // "Jl. Syech Quro No. 103," with the joining comma left dangling.
    SchoolIdentity::put('alamat', 'Jl. Syech Quro No. 103,');
    SchoolIdentity::put('desa_kelurahan', 'Talagasari');
    SchoolIdentity::put('kecamatan', 'Telagasari');
    SchoolIdentity::put('kabupaten_kota', 'Karawang');
    SchoolIdentity::put('kode_pos', '41381');

    $this->get(route('kontak'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where(
                'site.contact.address',
                'Jl. Syech Quro No. 103, Desa Talagasari, Kec. Telagasari, Karawang 41381',
            )
            ->where(
                'site.organization.address.streetAddress',
                'Jl. Syech Quro No. 103, Desa Talagasari, Kec. Telagasari',
            )
            ->where('site.organization.address.addressLocality', 'Karawang')
            ->where('site.organization.address.postalCode', '41381')
            ->where('site.organization.address.addressCountry', 'ID')
        );
});

test('an address with nothing but a street still renders', function () {
    // Only `alamat` is required, so the other fields being blank is a normal
    // state rather than a half-filled one.
    SchoolIdentity::put('alamat', 'Jalan Raya Telagasari');

    $this->get(route('kontak'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('site.contact.address', 'Jalan Raya Telagasari')
            ->where('site.organization.address.streetAddress', 'Jalan Raya Telagasari')
            ->missing('site.organization.address.addressLocality')
            ->missing('site.organization.address.postalCode')
        );
});

test('a contact detail the school has not set is left out of the json-ld', function () {
    // An empty schema.org property is worse than an absent one.
    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->missing('site.organization.telephone')
            ->missing('site.organization.address')
        );
});

test('the detail page carries a news article node', function () {
    // FR6-12
    $author = User::factory()->create(['name' => 'Rina Kartika']);
    $media = Media::factory()->create();
    $post = Post::factory()->published()->create([
        'title' => 'Juara Lomba Kompetensi Siswa',
        'slug' => 'juara-lks',
        'excerpt' => 'Siswa RPL membawa pulang medali.',
        'user_id' => $author->id,
        'featured_media_id' => $media->id,
    ]);

    $this->get(route('posts.show', $post->slug))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('jsonLd.@type', 'NewsArticle')
            ->where('jsonLd.headline', 'Juara Lomba Kompetensi Siswa')
            ->where('jsonLd.description', 'Siswa RPL membawa pulang medali.')
            ->where('jsonLd.mainEntityOfPage.@id', 'http://localhost/berita/juara-lks')
            ->where('jsonLd.author.name', 'Rina Kartika')
            ->where('jsonLd.publisher.logo.url', 'http://localhost/logo-smk.png')
            ->has('jsonLd.datePublished')
            ->has('jsonLd.image')
        );
});

test('an article without a featured image falls back to the default share card', function () {
    // FR6-19
    $post = Post::factory()->published()->create(['featured_media_id' => null]);

    $this->get(route('posts.show', $post->slug))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('jsonLd.image', 'http://localhost/og-default.png')
            ->where('site.ogImage', 'http://localhost/og-default.png')
            ->where('seo.image', null)
        );
});

test('an uploaded logo overrides the bundled crest', function () {
    $media = Media::factory()->create(['path' => 'media/logo-baru.webp']);
    Setting::put('logo_media_id', (string) $media->id);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('site.logo', fn (string $logo) => str_contains($logo, 'logo-baru.webp'))
        );
});

test('the brand assets exist and the starter favicon is gone', function () {
    // D-4 / US-003 — all four derive from prd/logo_smk_new.png.
    expect(public_path('logo-smk.png'))->toBeFile()
        ->and(public_path('favicon.ico'))->toBeFile()
        ->and(public_path('apple-touch-icon.png'))->toBeFile()
        ->and(public_path('og-default.png'))->toBeFile()
        // A browser prefers an SVG icon, so the Laravel one must not linger.
        ->and(file_exists(public_path('favicon.svg')))->toBeFalse()
        // Replaced by the route; a static file would shadow it.
        ->and(file_exists(public_path('robots.txt')))->toBeFalse();

    $blade = file_get_contents(resource_path('views/app.blade.php'));

    expect($blade)
        ->toContain('/favicon.ico')
        ->toContain('/apple-touch-icon.png')
        ->not->toContain('favicon.svg');
});

test('the favicon is a real multi-size icon', function () {
    $ico = (string) file_get_contents(public_path('favicon.ico'));
    $header = unpack('vreserved/vtype/vcount', substr($ico, 0, 6));

    expect($header)->not->toBeFalse()
        ->and($header['reserved'])->toBe(0)
        ->and($header['type'])->toBe(1) // 1 = icon, 2 = cursor
        ->and($header['count'])->toBe(3);

    $sizes = [];

    for ($i = 0; $i < $header['count']; $i++) {
        $entry = unpack('Cwidth/Cheight', substr($ico, 6 + 16 * $i, 2));
        $sizes[] = $entry['width'];
    }

    expect($sizes)->toBe([16, 32, 48]);
});

test('absolute urls stay on the canonical host even off an alias', function () {
    // FR6-4: reaching the site on another hostname must not fork the URLs a
    // crawler sees. url() would have followed the request host; config does not.
    $post = Post::factory()->published()->create(['slug' => 'kanonik']);

    $this->get('http://alias.example.test/')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('site.url', 'http://localhost')
            ->where('site.logo', 'http://localhost/logo-smk.png')
            ->where('site.ogImage', 'http://localhost/og-default.png')
            ->where('site.organization.@id', 'http://localhost/#organization')
        );

    $this->get('http://alias.example.test/sitemap.xml')
        ->assertSee('http://localhost/berita/'.$post->slug, false)
        ->assertDontSee('alias.example.test', false);

    $this->get('http://alias.example.test/robots.txt')
        ->assertSee('Sitemap: http://localhost/sitemap.xml', false);
});

// US-017 — metadata unik per halaman (FR6-3).

test('every public page carries its own title and description', function () {
    // A duplicated title across pages is the failure this guards against —
    // Search Console reports it as "duplicate meta", and it is easy to
    // reintroduce by copying a controller.
    $post = Post::factory()->published()->create([
        'title' => 'Kunjungan Industri ke Karawang',
        'slug' => 'kunjungan-industri',
        'excerpt' => 'Siswa kelas XI menengok lini produksi.',
    ]);
    $major = Major::factory()->create([
        'name' => 'Teknik Kendaraan Ringan',
        'slug' => 'tkr',
        'excerpt' => 'Perawatan dan perbaikan kendaraan.',
    ]);

    $routes = [
        route('home'),
        route('profil'),
        route('kontak'),
        route('posts.index'),
        route('posts.show', $post->slug),
        route('majors.index'),
        route('majors.show', $major->slug),
    ];

    $titles = [];

    foreach ($routes as $url) {
        $this->get($url)
            ->assertOk()
            ->assertInertia(function (AssertableInertia $page) use (&$titles) {
                $seo = $page->toArray()['props']['seo'];

                expect($seo['title'])->toBeString()->not->toBeEmpty()
                    ->and($seo['description'])->toBeString()->not->toBeEmpty()
                    // FR6-3: search results cut off around 160 characters.
                    ->and(strlen((string) $seo['description']))->toBeLessThanOrEqual(163);

                $titles[] = $seo['title'];
            });
    }

    expect($titles)->toHaveCount(count($routes))
        ->and(array_unique($titles))->toHaveCount(count($routes));
});

test('the detail page hands the seo block the post title, excerpt, and image', function () {
    // FR6-3 & FR6-5 — <SeoHead> renders exactly what the server put here.
    $media = Media::factory()->create();
    $post = Post::factory()->published()->create([
        'title' => 'Wisuda Angkatan 2026',
        'slug' => 'wisuda-2026',
        'excerpt' => 'Tiga ratus siswa dilepas hari ini.',
        'featured_media_id' => $media->id,
    ]);

    $this->get(route('posts.show', $post->slug))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('seo.title', 'Wisuda Angkatan 2026')
            ->where('seo.description', 'Tiga ratus siswa dilepas hari ini.')
            // og:type article, not website — a share card for a story.
            ->where('seo.type', 'article')
            ->where('seo.image.url', $media->url())
        );
});
